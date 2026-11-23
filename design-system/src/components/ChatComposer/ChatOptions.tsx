/*
 * Rangée sous la zone de saisie (D-371, Q2 A). Spec : ChatOptions.spec.md.
 * À gauche un emplacement libre (état, dossier) ; à droite les contrôles de l'app, en boutons texte sans cadre.
 */
import type { ReactNode } from "react";
import { Button } from "react-aria-components/Button";
import { buttonReset, cx, focusRing } from "../../lib/cx";

export interface ChatOptionsProps {
  /** Emplacement à gauche : un état court (fichiers modifiés, dossier). */
  start?: ReactNode;
  /** Contrôles alignés à droite : des `ChatOptionButton`, seuls ou dans un `DropdownMenu` ou un `Popover`. */
  children?: ReactNode;
  /** Nom du groupe de contrôles. */
  label?: string;
}

/** Sous le cadre de ChatComposer : 4 px au-dessus, 4 px entre les contrôles, une seule ligne. */
export function ChatOptions({ start, children, label }: ChatOptionsProps) {
  return (
    <div role="group" aria-label={label} className="socle-box mt-1 flex min-w-0 flex-nowrap items-center gap-1 font-sans text-sm text-fg">
      {start && <div className="flex min-w-0 items-center gap-1 truncate text-fg-2">{start}</div>}
      <span className="min-w-0 flex-1" />
      <div className="flex shrink-0 items-center gap-1">{children}</div>
    </div>
  );
}

export interface ChatOptionButtonProps {
  /** Texte du bouton (« Modèle avancé »). */
  label: string;
  /** Valeur secondaire, en `--fg-3` (« Moyen »). */
  value?: string;
  /** Icône de l'app, avant le texte. */
  icon?: ReactNode;
  onPress?: () => void;
  isDisabled?: boolean;
  /** Nom accessible plus précis ; il commence par le texte visible (WCAG 2.5.3). */
  "aria-label"?: string;
}

/**
 * Bouton texte de la rangée : sans cadre, hauteur `--btn-h-sm`, fond `--hover` au survol et quand son menu est ouvert.
 * Il sert de déclencheur à `DropdownMenu` et à `Popover`.
 */
export function ChatOptionButton({ label, value, icon, onPress, isDisabled = false, "aria-label": ariaLabel }: ChatOptionButtonProps) {
  return (
    <Button
      {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
      {...(onPress ? { onPress } : {})}
      isDisabled={isDisabled}
      className={cx(
        buttonReset,
        "inline-flex h-(--btn-h-sm) max-w-60 min-w-0 shrink-0 cursor-default items-center gap-1.5 rounded-md px-2 font-sans text-sm whitespace-nowrap text-fg",
        "transition-colors duration-[var(--dur-fast)] ease-standard",
        "data-hovered:bg-hover not-aria-expanded:data-pressed:bg-selected aria-expanded:bg-hover data-disabled:opacity-40 data-disabled:data-hovered:bg-transparent",
        focusRing,
      )}
    >
      {icon && <span className="inline-grid size-(--icon) shrink-0 place-items-center text-fg-2">{icon}</span>}
      <span className="min-w-0 truncate">{label}</span>
      {/* Espace : le nom accessible sépare le texte de la valeur. */}
      {value && " "}
      {value && <span className="min-w-0 truncate text-fg-3">{value}</span>}
    </Button>
  );
}
