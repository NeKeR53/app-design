/*
 * Adapté du starter Tailwind de React Aria (adobe/react-spectrum, starters/tailwind),
 * licence Apache 2.0. Spec : Button.spec.md.
 */
import type { ReactNode } from "react";
import { Button as RACButton } from "react-aria-components/Button";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { PendingSpinner } from "../../lib/pending";

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

/** Survol et pression désactivés par React Aria quand le bouton est désactivé ou en attente. */
const variants: Record<ButtonVariant, string> = {
  // D-102 : monochrome inversé.
  primary:
    "bg-fg text-surface data-hovered:bg-[color-mix(in_srgb,var(--fg)_82%,var(--surface))] data-pressed:bg-[color-mix(in_srgb,var(--fg)_72%,var(--surface))]",
  // D-103 : fond --field, sans contour.
  secondary: "bg-field text-fg data-hovered:bg-hover data-pressed:bg-selected",
  // D-100 : transparent, comme IconButton.
  subtle: "bg-transparent text-fg-2 data-hovered:bg-hover data-hovered:text-fg data-pressed:bg-selected",
  // D-104 : rouge plein ; le mélange avec --fg fonce en clair et éclaircit en sombre.
  danger:
    "bg-danger text-danger-fg data-hovered:bg-[color-mix(in_srgb,var(--danger)_85%,var(--fg))] data-pressed:bg-[color-mix(in_srgb,var(--danger)_72%,var(--fg))]",
};

export function Button({ children, variant = "secondary", size = "md", icon, onPress, isPending = false, isDisabled, type = "button", form, autoFocus, "aria-label": ariaLabel }: ButtonProps) {
  return (
    <RACButton
      type={type}
      className={cx(base, sizes[size], variants[variant])}
      isPending={isPending}
      {...(onPress ? { onPress } : {})}
      {...(isDisabled ? { isDisabled } : {})}
      {...(form ? { form } : {})}
      {...(autoFocus ? { autoFocus } : {})}
      {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
    >
      {isPending ? <PendingSpinner /> : icon}
      <span>{children}</span>
    </RACButton>
  );
}
