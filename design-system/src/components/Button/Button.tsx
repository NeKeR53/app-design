/*
 * Adapté du starter Tailwind de React Aria (adobe/react-spectrum, starters/tailwind),
 * licence Apache 2.0. Spec : Button.spec.md.
 */
import { useId, type ReactNode } from "react";
import { Button as RACButton } from "react-aria-components/Button";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { PendingSpinner } from "../../lib/pending";
import { Tooltip } from "../Tooltip/Tooltip";

export type ButtonVariant = "primary" | "secondary" | "subtle" | "danger";
export type ButtonSize = "md" | "sm";

export interface ButtonProps {
  /** Libellé visible : un texte d'une ligne. */
  children: string;
  /** `secondary` par défaut ; une seule `primary` par zone (D-100). */
  variant?: ButtonVariant;
  /** `md` : hauteur d'une ligne ; `sm` : pied de section du panneau de détail, zones denses (D-101). */
  size?: ButtonSize;
  /** Icône placée avant le libellé (D-106). */
  icon?: ReactNode;
  onPress?: () => void;
  /** Chargement : roue, clics ignorés, focus gardé, attente annoncée (D-105). */
  isPending?: boolean;
  isDisabled?: boolean;
  /**
   * Inactif avec une raison : le bouton garde le focus (`aria-disabled`), un clic ne fait rien,
   * l'info-bulle et le lecteur d'écran donnent la raison. Prime sur `isDisabled`.
   */
  disabledReason?: string;
  type?: "button" | "submit" | "reset";
  /** Identifiant du formulaire à envoyer, quand le bouton est hors du `<form>`. */
  form?: string;
  /** Nom accessible plus précis ; il commence par le libellé visible (WCAG 2.5.3). */
  "aria-label"?: string;
  autoFocus?: boolean;
}

const base = cx(
  buttonReset,
  "inline-flex min-h-(--target-min) shrink-0 cursor-default items-center justify-center gap-1.5 rounded-md font-sans font-medium whitespace-nowrap",
  "transition-colors duration-[var(--dur-fast)] ease-standard",
  "data-disabled:opacity-40 data-pending:data-disabled:opacity-100",
  focusRing,
);

const sizes: Record<ButtonSize, string> = {
  md: "h-(--row-h) px-3 text-md [[data-density=desktop]_&]:px-2.5",
  sm: "h-(--btn-h-sm) px-2.5 text-sm [[data-density=desktop]_&]:px-2",
};

/** Fond et texte de chaque variante, au repos. */
const rest: Record<ButtonVariant, string> = {
  // D-102 : monochrome inversé, par --primary (un thème peut le régler, D-338).
  primary: "bg-primary text-primary-fg",
  // D-103 : fond --field, sans contour. Thème : variante « outline » posée par styles.css (D-338).
  secondary: "socle-btn-secondary bg-field text-fg",
  // D-100 : transparent, comme IconButton.
  subtle: "bg-transparent text-fg-2",
  // D-104 : rouge plein.
  danger: "bg-danger text-danger-fg",
};

/** Survol et pression ; désactivés par React Aria quand le bouton est désactivé ou en attente, omis quand il est inactif. */
const interactive: Record<ButtonVariant, string> = {
  primary:
    "data-hovered:bg-[color-mix(in_srgb,var(--primary)_82%,var(--surface))] data-pressed:bg-[color-mix(in_srgb,var(--primary)_72%,var(--surface))]",
  secondary: "data-hovered:bg-hover data-pressed:bg-selected",
  subtle: "data-hovered:bg-hover data-hovered:text-fg data-pressed:bg-selected",
  // Le mélange avec --fg fonce en clair et éclaircit en sombre.
  danger:
    "data-hovered:bg-[color-mix(in_srgb,var(--danger)_85%,var(--fg))] data-pressed:bg-[color-mix(in_srgb,var(--danger)_72%,var(--fg))]",
};

/** Rendu d'un contrôle inactif avec une raison : comme désactivé (opacité 40 %), mais focusable. */
export const inactiveClass = "opacity-40";

export function Button({
  children,
  variant = "secondary",
  size = "md",
  icon,
  onPress,
  isPending = false,
  isDisabled,
  disabledReason,
  type = "button",
  form,
  autoFocus,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const reasonId = useId();
  const inactive = Boolean(disabledReason);
  const button = (
    <RACButton
      // Inactif : jamais d'envoi de formulaire, ni par clic ni par Entrée dans un champ.
      type={inactive ? "button" : type}
      className={cx(base, sizes[size], rest[variant], inactive ? inactiveClass : interactive[variant])}
      isPending={isPending}
      {...(onPress && !inactive ? { onPress } : {})}
      {...(isDisabled && !inactive ? { isDisabled } : {})}
      {...(inactive ? { "aria-disabled": true, "aria-describedby": reasonId } : {})}
      {...(form ? { form } : {})}
      {...(autoFocus ? { autoFocus } : {})}
      {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
    >
      {isPending ? <PendingSpinner /> : icon}
      <span>{children}</span>
    </RACButton>
  );
  if (!disabledReason) return button;
  return (
    <>
      <Tooltip content={disabledReason} placement="top">
        {button}
      </Tooltip>
      {/* Raison toujours liée, même info-bulle fermée ; `hidden` reste lisible par `aria-describedby`. */}
      <span id={reasonId} hidden>
        {disabledReason}
      </span>
    </>
  );
}
