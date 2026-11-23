/*
 * Dialog : modale avec titre, corps et pied d'actions. Spec : Dialog.spec.md.
 * Moteur : ModalOverlay, Modal et Dialog de React Aria (D-008) : piège du focus,
 * retour du focus, page figée et reste de l'app masqué aux lecteurs d'écran.
 */
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { Dialog as AriaDialog } from "react-aria-components/Dialog";
import { Modal, ModalOverlay } from "react-aria-components/Modal";
import { cx } from "../../lib/cx";
import { X } from "../../icons";
import { useMessages } from "../../provider/SocleProvider";
import { IconButton } from "../IconButton/IconButton";

export type DialogSize = "sm" | "md" | "lg" | "xl";

export interface DialogProps {
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
  size?: DialogSize;
  /** Action en cours : rien ne ferme la modale, le × est désactivé (D-122). */
  isBusy?: boolean;
}

/* ---------- Pièces partagées avec la confirmation ---------- */

/** Fond : `--scrim`, 32 px de marge ; fondu en 260 ms à l'ouverture, 180 ms à la fermeture (D-014). */
export function overlayClass(size: DialogSize) {
  return cx(
    "fixed inset-0 z-50 flex items-center justify-center bg-scrim p-8 max-tablet:p-4",
    (size === "lg" || size === "xl") && "max-tablet:p-0",
    "data-entering:animate-[socle-fade_var(--dur-slow)_var(--ease)] data-exiting:animate-[socle-fade_var(--dur-base)_var(--ease)_reverse]",
  );
}

const widths: Record<DialogSize, string> = {
  sm: "w-[400px]",
  md: "w-[560px]",
  lg: "w-[800px]",
  xl: "w-[1080px] h-[720px]",
};

/** Fenêtre : surface flottante, rayon 12 px (D-040) ; plein écran sur mobile pour `lg` et `xl` (D-121). */
export function modalClass(size: DialogSize) {
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

const FIELD = "input:not([type=hidden]):not(:disabled), textarea:not(:disabled), select:not(:disabled), [role=combobox]:not([aria-disabled=true])";

/** Focus à l'ouverture (D-125) : `autoFocus` (déjà posé), sinon le premier champ du corps ; sinon React Aria focalise la modale. */
function FocusFirstField({ body }: { body: RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    const dialog = el.closest<HTMLElement>("[role=dialog]");
    if (dialog && dialog.contains(document.activeElement) && document.activeElement !== dialog) return;
    el.querySelector<HTMLElement>(FIELD)?.focus();
  }, [body]);
  return null;
}

export function Dialog({ isOpen, onOpenChange, title, description, children, footer, size = "md", isBusy = false }: DialogProps) {
  const m = useMessages();
  const id = useId();
  const modalRef = useRef<HTMLDivElement>(null);
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
    if (busy.current || edited.current) return nudge(modalRef.current);
    onOpenChange(false);
  };

  // Échap : géré ici pour ne pas passer par le chemin du clic hors (qui refuse après une saisie).
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || e.nativeEvent.isComposing) return;
    e.stopPropagation();
    e.preventDefault();
    close();
  };

  const flush = size === "xl";
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOverlayChange} isDismissable isKeyboardDismissDisabled className={overlayClass(size)}>
      <Modal ref={modalRef} className={modalClass(size)}>
        <AriaDialog
          aria-labelledby={`${id}-title`}
          {...(description ? { "aria-describedby": `${id}-desc` } : {})}
          {...(isBusy ? { "aria-busy": true } : {})}
          className="flex min-h-0 flex-1 flex-col outline-none"
          onKeyDown={onKeyDown}
          onInputCapture={() => (edited.current = true)}
          onChangeCapture={() => (edited.current = true)}
        >
          <header
            className={cx(
              "flex shrink-0 items-start gap-2 pt-(--dlg-pad) pr-[calc(var(--dlg-pad)-8px)] pb-2 pl-(--dlg-pad)",
              (flush || edges.top) && "border-b border-line",
              flush && "pb-3",
            )}
          >
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 id={`${id}-title`} className="m-0 text-lg leading-[1.35] font-semibold [overflow-wrap:anywhere]">
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
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
