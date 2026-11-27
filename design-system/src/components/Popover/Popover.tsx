/*
 * Volet flottant ancré à un bouton, sans voile. Spec : Popover.spec.md.
 * Décisions : D-328 (forme, largeurs, placement), D-329 (fermeture et focus, comme la modale D-122).
 * Moteur : DialogTrigger, Popover et Dialog de React Aria (placement, focus, retour du focus).
 */
import { useCallback, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { Dialog as AriaDialog, DialogTrigger } from "react-aria-components/Dialog";
import { Popover as AriaPopover } from "react-aria-components/Popover";
import { useMessages } from "../../provider/SocleProvider";
import { cx } from "../../lib/cx";
import { X } from "../../icons";
import { IconButton } from "../IconButton/IconButton";
import { FocusFirstField, nudge, useEscapeFlag } from "../Modal/Modal";

export type PopoverWidth = "sm" | "md" | "lg";
export type PopoverPlacement = "bottom start" | "bottom end" | "right start";

interface PopoverBaseProps {
  /** Bouton qui ouvre le volet, le plus souvent un `IconButton` ou un `Button`. */
  trigger: ReactElement;
  /** Contenu : texte, champs, liste courte. */
  children: ReactNode;
  /** Largeur (D-328) : `sm` 280 px, `md` 360 px, `lg` 440 px. */
  width?: PopoverWidth;
  /** Côté préféré ; il change si la place manque (D-328). */
  placement?: PopoverPlacement;
  /** Ouverture pilotée par l'app, avec `onOpenChange`. */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Action en cours : rien ne ferme le volet, le × est désactivé (D-329). */
  isBusy?: boolean;
}

/** Un titre visible (avec ×), ou à défaut un nom accessible. */
export type PopoverProps = PopoverBaseProps & ({ title: string; label?: string } | { title?: undefined; label: string });

const widths: Record<PopoverWidth, string> = { sm: "w-[280px]", md: "w-[360px]", lg: "w-[440px]" };
const placements: Record<PopoverPlacement, "bottom start" | "bottom end" | "right top"> = {
  "bottom start": "bottom start",
  "bottom end": "bottom end",
  "right start": "right top",
};

export function Popover({
  trigger,
  children,
  title,
  label,
  width = "md",
  placement = "bottom end",
  isOpen,
  onOpenChange,
  isBusy = false,
}: PopoverProps) {
  const m = useMessages();
  const id = useId();
  const [ownOpen, setOwnOpen] = useState(false);
  const open = isOpen ?? ownOpen;
  const ref = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const edited = useRef(false);
  const busy = useRef(isBusy);
  busy.current = isBusy;
  const escape = useEscapeFlag(open);

  const setOpen = useCallback(
    (next: boolean) => {
      if (isOpen === undefined) setOwnOpen(next);
      onOpenChange?.(next);
    },
    [isOpen, onOpenChange],
  );

  // Une nouvelle ouverture repart sans saisie.
  useEffect(() => {
    if (open) edited.current = false;
  }, [open]);

  // Échap ferme toujours ; le clic à côté est refusé après une saisie ; `isBusy` refuse tout (D-329).
  const onChange = (next: boolean) => {
    if (next) return setOpen(true);
    if (busy.current || (edited.current && !escape.current)) return nudge(ref.current);
    setOpen(false);
  };

  const markEdited = () => {
    edited.current = true;
  };

  return (
    <DialogTrigger isOpen={open} onOpenChange={onChange}>
      {trigger}
      <AriaPopover
        ref={ref}
        placement={placements[placement]}
        offset={4}
        containerPadding={8}
        className={cx(
          "socle-box flex max-h-[calc(100vh-16px)] max-w-[calc(100vw-16px)] flex-col overflow-hidden rounded-lg border border-line bg-surface-raised font-sans text-md text-fg shadow-md outline-none",
          widths[width],
        )}
      >
        <AriaDialog
          {...(title ? { "aria-labelledby": `${id}-title` } : { "aria-label": label ?? "" })}
          className="flex min-h-0 flex-1 flex-col outline-none"
        >
          <div className="flex min-h-0 flex-1 flex-col" onInputCapture={markEdited} onChangeCapture={markEdited}>
            {title && (
              <header className="flex shrink-0 items-center gap-2 pt-2 pr-2 pb-1 pl-3.5">
                <h2 id={`${id}-title`} className="m-0 min-w-0 flex-1 truncate text-md font-heading">
                  {title}
                </h2>
                <IconButton icon={<X />} label={m.close} isDisabled={isBusy} onPress={() => setOpen(false)} />
              </header>
            )}
            <div ref={body} className={cx("socle-focus-scroll min-h-0 flex-1 overflow-auto px-3.5 pb-3.5", title ? "pt-1" : "pt-3.5")}>
              {children}
            </div>
            <FocusFirstField body={body} />
          </div>
        </AriaDialog>
      </AriaPopover>
    </DialogTrigger>
  );
}
