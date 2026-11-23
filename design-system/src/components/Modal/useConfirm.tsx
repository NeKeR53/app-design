/*
 * Confirmation d'une action irréversible (D-007). Spec : Modal.spec.md.
 * L'hôte est rendu par SocleProvider (D-127) : `useConfirm()` renvoie seulement `confirm`.
 */
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Dialog as AriaDialog } from "react-aria-components/Dialog";
import { Modal as RACModal, ModalOverlay } from "react-aria-components/Modal";
import { cx } from "../../lib/cx";
import { AlertTriangle } from "../../icons";
import { useMessages } from "../../provider/SocleProvider";
import { Button } from "../Button/Button";
import { modalClass, nudge, overlayClass, useAriaBusy } from "./Modal";
import { captureFocusOrigin, restoreFocusAfterClose, type FocusOrigin, type ReturnFocusTarget } from "./focusFallback";

export interface ConfirmOptions {
  /** La question (« Supprimer « Atelier » ? »). */
  title: string;
  /** La conséquence, en une ou deux phrases. */
  message?: ReactNode;
  /** Libellé du bouton de confirmation : le verbe de l'action. */
  confirmLabel: string;
  /** Libellé du bouton d'annulation. Défaut : « Annuler » (`messages.cancel`). */
  cancelLabel?: string;
  /** `danger` (défaut) : bouton rouge. `default` : bouton principal, pour une action irréversible non destructrice. */
  tone?: "danger" | "default";
  /** Action lancée au clic : la confirmation reste ouverte pendant l'action et montre l'erreur si elle échoue (D-128). */
  onConfirm?: () => Promise<void> | void;
  /**
   * Focus à la fermeture, à la place du déclencheur. Défaut : le déclencheur ; s'il a disparu (la ligne
   * supprimée), l'élément suivant de sa collection, sinon le précédent, sinon la collection, sinon `main`.
   */
  returnFocusTo?: ReturnFocusTarget;
}

/** Ouvre la confirmation ; rend `true` si l'utilisateur confirme, `false` s'il annule. */
export type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFunction | null>(null);

/** Demande une confirmation avant une action irréversible. Demande `SocleProvider` à la racine de l'app (D-127). */
export function useConfirm(): ConfirmFunction {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("[socle-ui] useConfirm demande un SocleProvider à la racine de l'app.");
  return confirm;
}

interface Request {
  options: ConfirmOptions;
  resolve: (ok: boolean) => void;
  /** Déclencheur et sa place, notés à la demande (focus de repli). */
  origin: FocusOrigin;
}

/** Hôte unique de la confirmation, placé par SocleProvider autour de l'app. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const m = useMessages();
  const id = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const [request, setRequest] = useState<Request | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = useRef<Request | null>(null);
  const busy = useRef(false);
  const dialogRef = useAriaBusy(pending);
  const cancelRestore = useRef<(() => void) | null>(null);

  const settle = useCallback((ok: boolean) => {
    const r = current.current;
    current.current = null;
    busy.current = false;
    setOpen(false);
    setPending(false);
    r?.resolve(ok);
    // Focus de repli si le déclencheur a disparu, une fois la fenêtre retirée.
    if (r) cancelRestore.current = restoreFocusAfterClose(r.origin, modalRef.current, r.options.returnFocusTo);
  }, []);

  // Une seule confirmation à la fois : une nouvelle demande annule la précédente (D-127).
  const confirm = useCallback<ConfirmFunction>(
    (options) =>
      new Promise<boolean>((resolve) => {
        cancelRestore.current?.();
        // Une demande qui en remplace une autre garde le déclencheur de la première.
        const origin = current.current?.origin ?? captureFocusOrigin();
        current.current?.resolve(false);
        const r = { options, resolve, origin };
        current.current = r;
        busy.current = false;
        setRequest(r);
        setPending(false);
        setError(null);
        setOpen(true);
      }),
    [],
  );

  useEffect(
    () => () => {
      current.current?.resolve(false);
      cancelRestore.current?.();
    },
    [],
  );

  const cancel = () => {
    if (busy.current) return nudge(modalRef.current);
    settle(false);
  };

  const accept = async () => {
    const r = current.current;
    if (!r || busy.current) return;
    if (!r.options.onConfirm) return settle(true);
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      await r.options.onConfirm();
      if (current.current === r) settle(true);
    } catch (e) {
      if (current.current !== r) return;
      busy.current = false;
      setPending(false);
      setError(e instanceof Error && e.message ? e.message : m.actionFailed);
    }
  };

  const o = request?.options;
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && cancel()} isDismissable className={overlayClass("sm")}>
        <RACModal ref={modalRef} className={modalClass("sm")}>
          {o && (
            <AriaDialog
              role="alertdialog"
              aria-labelledby={`${id}-title`}
              {...(o.message ? { "aria-describedby": `${id}-msg` } : {})}
              ref={dialogRef}
              className="flex min-h-0 flex-1 flex-col outline-none"
            >
              <div className="px-(--dlg-pad) pt-(--dlg-pad) pb-2">
                <h2 id={`${id}-title`} className="m-0 text-lg leading-[1.35] font-heading [overflow-wrap:anywhere]">
                  {o.title}
                </h2>
                {o.message && (
                  <div id={`${id}-msg`} className="mt-1 text-fg-2 [overflow-wrap:anywhere]">
                    {o.message}
                  </div>
                )}
              </div>
              {error && (
                <div role="alert" className="mx-(--dlg-pad) mt-1 flex items-start gap-1.5 text-sm text-danger">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <footer className={cx("flex flex-wrap items-center justify-end gap-2 px-(--dlg-pad) pt-3 pb-(--dlg-pad)", "max-tablet:[&>*]:flex-1")}>
                <Button autoFocus onPress={cancel} isDisabled={pending}>
                  {o.cancelLabel ?? m.cancel}
                </Button>
                <Button variant={o.tone === "default" ? "primary" : "danger"} onPress={accept} isPending={pending}>
                  {o.confirmLabel}
                </Button>
              </footer>
            </AriaDialog>
          )}
        </RACModal>
      </ModalOverlay>
    </ConfirmContext.Provider>
  );
}
