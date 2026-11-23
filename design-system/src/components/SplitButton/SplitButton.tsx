/*
 * Bouton à action par défaut et menu des variantes. Spec : SplitButton.spec.md.
 * Validation : docs/validation/components/Nouveaux-P4-v1.html (SB1, option A ; D-365).
 * Composition : Button (action par défaut) et DropdownMenu (variantes), ouvert par un chevron accolé.
 */
import { useId, useState, type ReactNode } from "react";
import { Button as RACButton } from "react-aria-components/Button";
import { useMessages } from "../../provider/SocleProvider";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { ChevronDown } from "../../icons";
import { Button, inactiveClass, type ButtonSize } from "../Button/Button";
import { DropdownMenu, type DropdownMenuItemProps } from "../DropdownMenu/DropdownMenu";
import { Tooltip } from "../Tooltip/Tooltip";

export type SplitButtonVariant = "primary" | "secondary";

/** Variante de l'action, dans le menu : mêmes options qu'un élément de DropdownMenu. */
export type SplitButtonItem = DropdownMenuItemProps;

export interface SplitButtonProps {
  /** Libellé de l'action par défaut : un texte d'une ligne. */
  children: string;
  /** `secondary` par défaut ; une seule `primary` par zone (D-100). */
  variant?: SplitButtonVariant;
  /** Même hauteur que Button (D-101). */
  size?: ButtonSize;
  /** Icône avant le libellé (D-106). */
  icon?: ReactNode;
  /** Action par défaut. */
  onPress?: () => void;
  /** Variantes de l'action (« Enregistrer sous… », « Enregistrer et fermer »). */
  items: ReadonlyArray<SplitButtonItem>;
  /** Chargement : roue dans le bouton, les deux parties ignorent les clics, focus gardé (D-105). */
  isPending?: boolean;
  isDisabled?: boolean;
  /** Inactif avec une raison : les deux parties gardent le focus, ne font rien et donnent la raison. Prime sur `isDisabled`. */
  disabledReason?: string;
  type?: "button" | "submit" | "reset";
  form?: string;
}

const chevronBase = cx(
  buttonReset,
  "inline-grid min-h-(--target-min) min-w-(--target-min) shrink-0 cursor-default place-items-center rounded-e-md px-1.5",
  "border-s transition-colors duration-[var(--dur-fast)] ease-standard",
  "data-disabled:opacity-40",
  focusRing,
);

const chevronSizes: Record<ButtonSize, string> = { md: "h-(--row-h)", sm: "h-(--btn-h-sm)" };

/** Fond et séparateur de 1 px : mêmes teintes que Button. En thème « outline », chaque partie a déjà son trait. */
const chevronRest: Record<SplitButtonVariant, string> = {
  primary: "bg-primary text-primary-fg border-[color-mix(in_srgb,var(--primary-fg)_30%,transparent)]",
  secondary:
    "socle-btn-secondary bg-field text-fg border-[color-mix(in_srgb,var(--fg)_15%,transparent)] [:root[data-button-secondary=outline]_&]:border-s-0",
};

const chevronInteractive: Record<SplitButtonVariant, string> = {
  primary:
    "data-hovered:bg-[color-mix(in_srgb,var(--primary)_82%,var(--surface))] data-pressed:bg-[color-mix(in_srgb,var(--primary)_72%,var(--surface))] data-pending:bg-primary",
  secondary: "data-hovered:bg-hover data-pressed:bg-selected data-pending:bg-field",
};

export function SplitButton({
  children,
  variant = "secondary",
  size = "md",
  icon,
  onPress,
  items,
  isPending = false,
  isDisabled,
  disabledReason,
  type,
  form,
}: SplitButtonProps) {
  const m = useMessages();
  const reasonId = useId();
  const [open, setOpen] = useState(false);
  const inactive = Boolean(disabledReason);
  const name = m.splitMoreOptions(children);
  // En attente ou inactif : le menu ne s'ouvre ni au clic ni au clavier (↓, Entrée, Espace).
  const blocked = isPending || inactive;

  const chevron = (
    <RACButton
      aria-label={name}
      className={cx(chevronBase, chevronSizes[size], chevronRest[variant], inactive ? inactiveClass : chevronInteractive[variant])}
      isPending={isPending}
      {...(isDisabled && !inactive ? { isDisabled } : {})}
      // Sans raison, l'info-bulle répète le nom : elle n'est pas reliée (comme IconButton).
      {...(inactive ? { "aria-disabled": true, "aria-describedby": reasonId } : { "aria-describedby": "" })}
    >
      <ChevronDown />
    </RACButton>
  );

  return (
    <span className="inline-flex shrink-0 items-stretch [&>.socle-btn:first-child]:rounded-e-none">
      <Button
        variant={variant}
        size={size}
        icon={icon}
        isPending={isPending}
        {...(onPress ? { onPress } : {})}
        {...(isDisabled ? { isDisabled } : {})}
        {...(disabledReason ? { disabledReason } : {})}
        {...(type ? { type } : {})}
        {...(form ? { form } : {})}
      >
        {children}
      </Button>
      <DropdownMenu
        label={name}
        placement="bottom end"
        isOpen={open && !blocked}
        onOpenChange={(next) => setOpen(next && !blocked)}
        trigger={
          <Tooltip content={name} {...(disabledReason ? { description: disabledReason } : {})}>
            {chevron}
          </Tooltip>
        }
      >
        {items.map((item) => (
          <DropdownMenu.Item key={String(item.id ?? item.label)} {...item} />
        ))}
      </DropdownMenu>
      {inactive && (
        <span id={reasonId} hidden>
          {disabledReason}
        </span>
      )}
    </span>
  );
}
