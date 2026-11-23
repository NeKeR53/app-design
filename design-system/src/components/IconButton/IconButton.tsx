/*
 * Adapté du starter Tailwind de React Aria (adobe/react-spectrum, starters/tailwind),
 * licence Apache 2.0. Spec : IconButton.spec.md.
 */
import { useId, type ReactNode } from "react";
import { Button } from "react-aria-components/Button";
import { ToggleButton } from "react-aria-components/ToggleButton";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { PendingSpinner } from "../../lib/pending";
import { Tooltip } from "../Tooltip/Tooltip";

export interface IconButtonProps {
  /** Icône de l'app (D-011) ou icône interne de Socle (D-028). */
  icon: ReactNode;
  /** Nom accessible et texte de l'info-bulle. */
  label: string;
  /** Raccourci affiché dans l'info-bulle, par exemple "Mod+B" (D-032). */
  shortcut?: string;
  onPress?: () => void;
  isDisabled?: boolean;
  /**
   * Inactif avec une raison : le bouton garde le focus (`aria-disabled`), un clic ne fait rien ;
   * l'info-bulle montre `label` puis la raison, qui devient la description accessible. Prime sur `isDisabled`.
   */
  disabledReason?: string;
  /** Chargement : l'icône devient une roue, clics ignorés, focus et info-bulle gardés (D-107). Sans effet sur une bascule. */
  isPending?: boolean;
  /** Si fourni, le bouton devient une bascule (`aria-pressed`). */
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  /** Côté préféré de l'info-bulle. */
  tooltipPlacement?: "top" | "bottom" | "start" | "end";
}

/** Taille `--icon-btn` (D-035), rayon 8 px (D-036, D-040), une seule variante transparente (D-037). */
const base = cx(
  buttonReset,
  "inline-grid size-(--icon-btn) shrink-0 cursor-default place-items-center rounded-md text-fg-2",
  "transition-colors duration-[var(--dur-fast)] ease-standard",
  "data-hovered:bg-hover data-hovered:text-fg data-pressed:bg-selected",
  "data-disabled:opacity-40 data-disabled:data-hovered:bg-transparent",
  focusRing,
);
/** Inactif avec une raison : rendu désactivé, sans survol ni pression, mais focusable. */
const inactive = "opacity-40 data-hovered:bg-transparent data-hovered:text-fg-2 data-pressed:bg-transparent";
/** En attente (D-107) : pas d'opacité de désactivation, pas de survol. */
const pending = "data-pending:opacity-100 data-pending:bg-transparent";
/** Sélectionné : fond clair, qui fonce au survol (D-034). */
const selected = "data-selected:bg-hover data-selected:text-fg data-selected:data-hovered:bg-selected";

export function IconButton({ icon, label, shortcut, onPress, isDisabled, disabledReason, isPending = false, isSelected, onChange, tooltipPlacement = "bottom" }: IconButtonProps) {
  const reasonId = useId();
  const off = Boolean(disabledReason);
  // Sans raccourci, l'info-bulle répète le nom accessible : on ne la relie pas par `aria-describedby`,
  // sinon le lecteur d'écran lit le nom deux fois (Tooltip.spec.md, Accessibilité).
  // Une valeur vide remplace celle de React Aria ; avec un raccourci, la description reste.
  // Inactif : la description est la raison seule, toujours liée.
  const describedBy = off ? { "aria-describedby": reasonId, "aria-disabled": true } : shortcut ? {} : { "aria-describedby": "" };
  const disabled = isDisabled && !off ? { isDisabled } : {};
  const button =
    isSelected === undefined ? (
      <Button aria-label={label} {...describedBy} className={cx(base, pending, off && inactive)} isPending={isPending} {...(onPress && !off ? { onPress } : {})} {...disabled}>
        {isPending ? <PendingSpinner /> : icon}
      </Button>
    ) : (
      <ToggleButton
        aria-label={label}
        {...describedBy}
        className={cx(base, selected, off && inactive)}
        isSelected={isSelected}
        {...(onChange && !off ? { onChange } : {})}
        {...disabled}
      >
        {icon}
      </ToggleButton>
    );
  return (
    <>
      <Tooltip content={label} placement={tooltipPlacement} {...(shortcut ? { shortcut } : {})} {...(disabledReason ? { description: disabledReason } : {})}>
        {button}
      </Tooltip>
      {disabledReason && (
        <span id={reasonId} hidden>
          {disabledReason}
        </span>
      )}
    </>
  );
}
