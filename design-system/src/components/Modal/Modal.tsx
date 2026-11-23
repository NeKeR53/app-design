/*
 * Modal : modale avec titre, corps et pied d'actions. Spec : Modal.spec.md.
 * Moteur : ModalOverlay, Modal et Dialog de React Aria (D-008) : piège du focus,
 * retour du focus, page figée et reste de l'app masqué aux lecteurs d'écran.
 */
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Dialog as AriaDialog } from "react-aria-components/Dialog";
import { Modal as RACModal, ModalOverlay } from "react-aria-components/Modal";
import { cx } from "../../lib/cx";
import { X } from "../../icons";
import { useMessages } from "../../provider/SocleProvider";
import { IconButton } from "../IconButton/IconButton";
import { captureFocusOrigin, restoreFocusAfterClose, type FocusOrigin, type ReturnFocusTarget } from "./focusFallback";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  /** Ouverte ou fermée : l'app pilote la modale. */
  isOpen: boolean;
  /** Appelée avec `false` par Échap, le × et le clic hors (sauf refus, D-122). */
  onOpenChange: (isOpen: boolean) => void;
  /** Titre, et nom accessible. */
  title: string;
  /** Phrase sous le titre, annoncée avec lui. */
  description?: ReactNode;
  /** Corps. */
  children?: ReactNode;
  /** Pied : des `Button`, « Annuler » puis l'action (D-124). */
  footer?: ReactNode;
  /** Taille (D-120) : `sm` 400 px, `md` 560 px, `lg` 800 px, `xl` 1080 × 720 px sans marge. */
  size?: ModalSize;
  /** Action en cours : rien ne ferme la modale, le × est désactivé (D-122). */
  isBusy?: boolean;
  /**
   * Focus à la fermeture, à la place du déclencheur. Défaut : le déclencheur ; s'il a disparu,
   * l'élément suivant de sa collection, sinon le précédent, sinon la collection, sinon `main`.
   */
  returnFocusTo?: ReturnFocusTarget;
}

/* ---------- Pièces partagées avec la confirmation ---------- */

/** Fond : `--scrim`, 32 px de marge ; fondu en 260 ms à l'ouverture, 180 ms à la fermeture (D-014). */
export function overlayClass(size: ModalSize) {
  return cx(
    "fixed inset-0 z-50 flex items-center justify-center bg-scrim p-8",
    size === "lg" || size === "xl" ? "max-tablet:p-0" : "max-tablet:p-4",
    "data-entering:animate-[socle-fade_var(--dur-slow)_var(--ease)] data-exiting:animate-[socle-fade_var(--dur-base)_var(--ease)_reverse]",
  );
}

const widths: Record<ModalSize, string> = {
  sm: "w-[400px]",
  md: "w-[560px]",
  lg: "w-[800px]",
  xl: "w-[1080px] h-[720px]",
};

/** Fenêtre : surface flottante, rayon 12 px (D-040) ; plein écran sur mobile pour `lg` et `xl` (D-121). */
export function modalClass(size: ModalSize) {
  return cx(
    "socle-box flex max-h-full max-w-full flex-col overflow-hidden rounded-lg border border-line bg-surface-raised font-sans text-md text-fg shadow-lg outline-none",
    widths[size],
    "max-tablet:w-full",
    (size === "lg" || size === "xl") && "max-tablet:h-full max-tablet:rounded-none max-tablet:border-0",
    "data-entering:animate-[socle-pop_var(--dur-slow)_var(--ease)]",
  );
}

/** Rebond quand une fermeture est refusée (D-122). */
export function nudge(el: HTMLElement | null) {
  if (!el) return;
  el.classList.remove("socle-nudge");
  void el.offsetWidth; // relance l'animation même sur deux refus rapprochés
  el.classList.add("socle-nudge");
}

/** Trait sous l'en-tête et au-dessus du pied, seulement quand le corps défile (D-123). */
function useScrollEdges(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const top = el.scrollTop > 0;
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    setEdges((e) => (e.top === top && e.bottom === bottom ? e : { top, bottom }));
  }, []);
  useLayoutEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    return () => ro.disconnect();
  }, [open, update]);
  return { ref, edges, update };
}

/**
 * Focus de repli (voir `focusFallback`) : note le déclencheur à l'ouverture (pendant le rendu, avant que
 * React Aria ne déplace le focus), puis l'applique après la fermeture. `windowRef` : la fenêtre de la modale.
 */
export function useFocusFallback(isOpen: boolean, windowRef: RefObject<HTMLElement | null>, returnFocusTo: ReturnFocusTarget | undefined) {
  const [origin, setOrigin] = useState<FocusOrigin | null>(() => (isOpen && typeof document !== "undefined" ? captureFocusOrigin() : null));
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setOrigin(captureFocusOrigin());
  }
  const target = useRef(returnFocusTo);
  useLayoutEffect(() => {
    target.current = returnFocusTo;
  });
  const opened = useRef(isOpen);
  useEffect(() => {
    const closing = opened.current && !isOpen;
    opened.current = isOpen;
    if (!closing || !origin) return;
    return restoreFocusAfterClose(origin, windowRef.current, target.current);
  }, [isOpen, origin, windowRef]);
}

/** `aria-busy` sur la modale : React Aria ne le transmet pas, on le pose sur l'élément. */
export function useAriaBusy(busy: boolean) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (busy) el.setAttribute("aria-busy", "true");
    else el.removeAttribute("aria-busy");
  });
  return ref;
}

/** Vrai pendant la frappe d'Échap : écouté en capture, remis à faux juste après. */
export function useEscapeFlag(open: boolean) {
  const flag = useRef(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      flag.current = true;
      setTimeout(() => (flag.current = false));
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open]);
  return flag;
}

const FIELD = "input:not([type=hidden]):not(:disabled), textarea:not(:disabled), select:not(:disabled), [role=combobox]:not([aria-disabled=true])";

/** Focus à l'ouverture (D-125) : `autoFocus` (déjà posé), sinon le premier champ du corps ; sinon React Aria focalise la modale. */
export function FocusFirstField({ body }: { body: RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    const dialog = el.closest<HTMLElement>("[role=dialog]");
    if (dialog && dialog.contains(document.activeElement) && document.activeElement !== dialog) return;
    el.querySelector<HTMLElement>(FIELD)?.focus();
  }, [body]);
  return null;
}

export function Modal({ isOpen, onOpenChange, title, description, children, footer, size = "md", isBusy = false, returnFocusTo }: ModalProps) {
  const m = useMessages();
  const id = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusFallback(isOpen, modalRef, returnFocusTo);
  const edited = useRef(false);
  const busy = useRef(isBusy);
  busy.current = isBusy;
  const { ref: bodyRef, edges, update } = useScrollEdges(isOpen);

  // Une nouvelle ouverture repart sans saisie.
  useEffect(() => {
    if (isOpen) edited.current = false;
  }, [isOpen]);

  const close = useCallback(() => {
    if (busy.current) return nudge(modalRef.current);
    onOpenChange(false);
  }, [onOpenChange]);

  // Clic hors (React Aria, `isDismissable`) : refusé si une saisie a commencé ou si une action est en cours (D-122).
  const onOverlayChange = (open: boolean) => {
    if (open) return onOpenChange(true);
    if (escape.current) return close();
    if (busy.current || edited.current) return nudge(modalRef.current);
    onOpenChange(false);
  };

  // Échap passe par React Aria (qui ne ferme que la modale la plus haute, et laisse un menu ou une liste se fermer d'abord).
  // Le drapeau distingue Échap du clic hors : Échap ferme même après une saisie (D-122).
  const escape = useEscapeFlag(isOpen);
  const dialogRef = useAriaBusy(isBusy);

  // Un réglage appliqué tout de suite (SettingsPage) n'est pas une saisie à protéger (D-208).
  const markEdited = (e: { target: EventTarget }) => {
    if (e.target instanceof Element && e.target.closest("[data-socle-immediate]")) return;
    edited.current = true;
  };
  const flush = size === "xl";
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOverlayChange} isDismissable className={overlayClass(size)}>
      <RACModal ref={modalRef} className={modalClass(size)}>
        <AriaDialog
          aria-labelledby={`${id}-title`}
          {...(description ? { "aria-describedby": `${id}-desc` } : {})}
          ref={dialogRef}
          className="flex min-h-0 flex-1 flex-col outline-none"
        >
          {/* Repère la saisie pour le clic hors (D-122). */}
          <div className="flex min-h-0 flex-1 flex-col" onInputCapture={markEdited} onChangeCapture={markEdited}>
          <header
            className={cx(
              "flex shrink-0 items-start gap-2 pt-(--dlg-pad) pr-[calc(var(--dlg-pad)-8px)] pb-2 pl-(--dlg-pad)",
              (flush || edges.top) && "border-b border-line",
              flush && "pb-3",
            )}
          >
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 id={`${id}-title`} className="m-0 text-lg leading-[1.35] font-heading [overflow-wrap:anywhere]">
                {title}
              </h2>
              {description && (
                <div id={`${id}-desc`} className="mt-1 text-fg-2">
                  {description}
                </div>
              )}
            </div>
            <IconButton icon={<X />} label={m.close} onPress={close} isDisabled={isBusy} tooltipPlacement="bottom" />
          </header>
          {children !== undefined && (
            <div
              ref={bodyRef}
              onScroll={update}
              data-dialog-body=""
              className={cx("min-h-0 flex-1 overflow-auto overscroll-contain", !flush && "flex flex-col gap-3 px-(--dlg-pad) pt-2 pb-(--dlg-pad)")}
            >
              <FocusFirstField body={bodyRef} />
              {children}
            </div>
          )}
          {footer && (
            <footer
              className={cx(
                "flex shrink-0 flex-wrap items-center justify-end gap-2 px-(--dlg-pad) py-3",
                edges.bottom && "border-t border-line",
                "max-tablet:[&>*]:flex-1",
              )}
            >
              {footer}
            </footer>
          )}
          </div>
        </AriaDialog>
      </RACModal>
    </ModalOverlay>
  );
}
