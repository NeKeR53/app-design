/*
 * Choix exclusif entre 2 à 4 options, appliqué tout de suite. Spec : SegmentedControl.spec.md.
 * Validation : docs/validation/components/Nouveaux-P2-P3-v1.html (S1 et S2, options A).
 * Rôle `radiogroup` (React Aria RadioGroup) : un arrêt de Tab, les flèches déplacent et choisissent.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Radio, RadioGroup } from "react-aria-components/RadioGroup";
import { Tooltip as RACTooltip, TooltipTriggerStateContext, type TooltipTriggerState } from "react-aria-components/Tooltip";
import { cx, focusRing } from "../../lib/cx";
import { TOOLTIP_CLASS, TOOLTIP_DELAY } from "../Tooltip/Tooltip";

export interface SegmentedOption {
  /** Valeur rendue par `onChange`. */
  value: string;
  /** Libellé court. Toujours le nom accessible, même caché. */
  label: string;
  /** Icône de l'app, avant le libellé (D-011). */
  icon?: ReactNode;
  /** Icône seule : le libellé est caché à l'écran, il reste le nom accessible et s'affiche en info-bulle. Exige `icon`. */
  hideLabel?: boolean;
  isDisabled?: boolean;
}

export interface SegmentedControlProps {
  /** Nom du groupe, lu par le lecteur d'écran (« Affichage »). Il n'est pas affiché : le contexte le donne. */
  label: string;
  /** 2 à 4 options. */
  options: ReadonlyArray<SegmentedOption>;
  /** Valeur choisie (contrôlé). */
  value?: string;
  /** Valeur de départ (non contrôlé). Défaut : la première option. */
  defaultValue?: string;
  /** Appelé dès qu'un segment est choisi (D-007). */
  onChange?: (value: string) => void;
  isDisabled?: boolean;
  /** Nom dans le formulaire envoyé. */
  name?: string;
}

/** Fond `--field`, 2 px de marge, rayon 8 px ; hauteur `--row-h` (densité). */
const GROUP =
  "socle-box inline-flex h-(--row-h) max-w-full items-stretch gap-0.5 rounded-md bg-field p-0.5 font-sans text-md data-disabled:opacity-40";

/** Segment : rayon 4 px (contrôle dans un contrôle, D-040) ; choisi : carte claire `--surface` et `shadow-sm`. */
const SEGMENT = cx(
  "relative inline-flex min-w-0 cursor-default items-center justify-center gap-1.5 rounded-sm px-2.5 text-fg-2 select-none",
  "[[data-density=desktop]_&]:px-2",
  "transition-colors duration-[var(--dur-fast)] ease-standard",
  "data-hovered:text-fg",
  "data-selected:bg-surface data-selected:font-medium data-selected:text-fg data-selected:shadow-sm",
  "data-disabled:opacity-40 data-disabled:data-hovered:text-fg-2",
  focusRing,
);

/** Info-bulle d'un segment à icône seule : après 500 ms de survol, ou tout de suite au focus clavier (D-031). */
function SegmentTip({ anchor, text, isHovered, isFocusVisible }: { anchor: RefObject<HTMLLabelElement | null>; text: string; isHovered: boolean; isFocusVisible: boolean }) {
  const [hoverOpen, setHoverOpen] = useState(false);
  useEffect(() => {
    if (!isHovered) {
      setHoverOpen(false);
      return;
    }
    const t = setTimeout(() => setHoverOpen(true), TOOLTIP_DELAY);
    return () => clearTimeout(t);
  }, [isHovered]);
  const open = hoverOpen || isFocusVisible;
  const state = useMemo<TooltipTriggerState>(
    () => ({ isOpen: open, open: () => {}, close: () => setHoverOpen(false), shouldSkipAnimation: false }) as TooltipTriggerState,
    [open],
  );
  return (
    <TooltipTriggerStateContext.Provider value={state}>
      <RACTooltip triggerRef={anchor} placement="bottom" offset={6} containerPadding={8} className={TOOLTIP_CLASS}>
        {text}
      </RACTooltip>
    </TooltipTriggerStateContext.Provider>
  );
}

function Segment({ option }: { option: SegmentedOption }) {
  const ref = useRef<HTMLLabelElement>(null);
  const iconOnly = Boolean(option.hideLabel && option.icon);
  return (
    <Radio ref={ref} value={option.value} {...(option.isDisabled ? { isDisabled: true } : {})} className={cx(SEGMENT, iconOnly && "px-1.5 [[data-density=desktop]_&]:px-1.5")}>
      {({ isHovered, isFocusVisible }) => (
        <>
          {option.icon && <span className="inline-flex shrink-0" aria-hidden="true">{option.icon}</span>}
          <span className={iconOnly ? "sr-only" : "min-w-0 truncate"}>{option.label}</span>
          {iconOnly && <SegmentTip anchor={ref} text={option.label} isHovered={isHovered} isFocusVisible={isFocusVisible} />}
        </>
      )}
    </Radio>
  );
}

export function SegmentedControl({ label, options, value, defaultValue, onChange, isDisabled, name }: SegmentedControlProps) {
  const first = options.find((o) => !o.isDisabled)?.value;
  return (
    <RadioGroup
      aria-label={label}
      orientation="horizontal"
      className={GROUP}
      {...(value !== undefined ? { value } : { defaultValue: defaultValue ?? first ?? null })}
      {...(onChange ? { onChange } : {})}
      {...(isDisabled ? { isDisabled } : {})}
      {...(name ? { name } : {})}
    >
      {options.map((o) => (
        <Segment key={o.value} option={o} />
      ))}
    </RadioGroup>
  );
}
