/*
 * Choix d'une couleur dans un nuancier prédéfini. Spec : ColorPicker.spec.md.
 * Validation : docs/validation/components/Nouveaux-P4-v1.html (CP1, option A ; D-367).
 * Moteur : ColorSwatchPicker, ColorSwatch et ColorField de React Aria. Valeurs en hexadécimal (« #2a78d6 »).
 */
import { useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import { ColorSwatch } from "react-aria-components/ColorSwatch";
import { ColorSwatchPicker, ColorSwatchPickerItem } from "react-aria-components/ColorSwatchPicker";
import { ColorField, Input, Label, type Color } from "react-aria-components/ColorField";
import { ListBoxContext } from "react-aria-components/ListBox";
import { Tooltip as RACTooltip, TooltipTriggerStateContext, type TooltipTriggerState } from "react-aria-components/Tooltip";
import { I18nProvider } from "react-aria-components/I18nProvider";
import { useMessages } from "../../provider/SocleProvider";
import type { SocleMessages } from "../../i18n/messages";
import { contrast, parseHex } from "../../lib/color";
import { cx } from "../../lib/cx";
import { fieldBox, fieldRoot, type FieldWidth } from "../Field/Field";
import { TOOLTIP_CLASS, TOOLTIP_DELAY } from "../Tooltip/Tooltip";

export interface ColorOption {
  /** Couleur en hexadécimal à 6 chiffres (« #2a78d6 »). */
  value: string;
  /** Nom lu et affiché en info-bulle (« Bleu »). */
  name: string;
}

export interface ColorPickerProps {
  /** Libellé visible au-dessus du nuancier, et nom accessible. */
  label: string;
  /** Masque le libellé à l'écran ; il reste le nom accessible. */
  hideLabel?: boolean;
  /** Aide sous le nuancier. */
  description?: string;
  /** Nuancier : 8 à 12 couleurs. Défaut : les 8 couleurs des graphiques (`--chart-1` à `--chart-8`). */
  colors?: ReadonlyArray<ColorOption>;
  /** Couleur choisie, en hexadécimal (contrôlé). */
  value?: string;
  /** Couleur de départ (non contrôlé). Défaut : aucune. */
  defaultValue?: string;
  /** Appelé à chaque choix, avec la couleur en hexadécimal minuscule (« #2a78d6 »). */
  onChange?: (value: string) => void;
  /** Ajoute un champ « Code hexadécimal » pour une couleur hors du nuancier. */
  allowsCustom?: boolean;
  /**
   * Couleur du texte posé sur la couleur choisie (hexadécimal). Si le contraste est sous 4,5 pour 1,
   * une alerte s'affiche sous le nuancier, en `--warning`.
   */
  contrastWith?: string;
  isDisabled?: boolean;
  /** Largeur (D-133). Défaut : toute la largeur. */
  width?: FieldWidth;
}

/** Couleurs des graphiques, thème clair (`--chart-1` à `--chart-8`, base.css) : la palette par défaut. */
const CHART_COLORS = [
  ["#2a78d6", "blue"],
  ["#eb6834", "orange"],
  ["#1baf7a", "green"],
  ["#eda100", "yellow"],
  ["#e87ba4", "pink"],
  ["#008300", "darkGreen"],
  ["#6250d6", "violet"],
  ["#e34948", "red"],
] as const;

export function defaultColors(m: SocleMessages): ColorOption[] {
  return CHART_COLORS.map(([value, key]) => ({ value, name: m.colorName(key) }));
}

/** Hexadécimal minuscule à 6 chiffres, ou null si la valeur n'en est pas un. */
function normalize(hex: string | undefined): string | null {
  const rgb = hex ? parseHex(hex) : null;
  return rgb ? "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("") : null;
}

/** Contraste insuffisant (< 4,5:1), ou null s'il suffit ou ne se calcule pas. */
function lowContrast(color: string | null, text: string | undefined): number | null {
  const a = color ? parseHex(color) : null;
  const b = text ? parseHex(text) : null;
  if (!a || !b) return null;
  const r = contrast(a, b);
  return r < 4.5 ? r : null;
}

/** Info-bulle d'une pastille : après 500 ms de survol, ou tout de suite au focus clavier (D-031). */
function SwatchTip({ anchor, text, isHovered, isFocusVisible }: { anchor: RefObject<HTMLDivElement | null>; text: string; isHovered: boolean; isFocusVisible: boolean }) {
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

/**
 * Pastille de 24 px, rayon 4 px, trait intérieur léger (une couleur claire reste visible).
 * Choisie : anneau `--fg` de 2 px, décalé de 2 px. Focus clavier : anneau `--focus` au-delà.
 */
const swatchItemClass = cx(
  "relative size-6 cursor-default rounded-sm outline-none",
  "data-selected:shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--fg)]",
  "data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-focus data-focus-visible:outline-offset-[6px]",
  "data-disabled:opacity-40",
);

function Swatch({ option, isDisabled }: { option: ColorOption; isDisabled: boolean | undefined }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <ColorSwatchPickerItem ref={ref} color={option.value} aria-label={option.name} className={swatchItemClass} {...(isDisabled ? { isDisabled } : {})}>
      {({ isHovered, isFocusVisible }) => (
        <>
          <ColorSwatch colorName={option.name} className="size-full rounded-sm shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]" />
          <SwatchTip anchor={ref} text={option.name} isHovered={isHovered} isFocusVisible={isFocusVisible} />
        </>
      )}
    </ColorSwatchPickerItem>
  );
}

/** Couleur transparente : aucune pastille choisie. */
const NONE = "#00000000";

export function ColorPicker({
  label,
  hideLabel,
  description,
  colors,
  value,
  defaultValue,
  onChange,
  allowsCustom = false,
  contrastWith,
  isDisabled,
  width,
}: ColorPickerProps) {
  const m = useMessages();
  const labelId = useId();
  const descId = useId();
  const warnId = useId();
  const palette = colors ?? defaultColors(m);
  const [own, setOwn] = useState(() => normalize(defaultValue));
  const current = value !== undefined ? normalize(value) : own;
  const set = (hex: string | null) => {
    if (!hex || hex === current) return;
    if (value === undefined) setOwn(hex);
    onChange?.(hex);
  };
  const ratio = lowContrast(current, contrastWith);
  const describedBy = [description && descId, ratio !== null && warnId].filter(Boolean).join(" ") || undefined;

  return (
    <I18nProvider locale={m.locale}>
      <div role="group" aria-labelledby={labelId} className={cx(fieldRoot(width), "gap-1.5")} {...(isDisabled ? { "data-disabled": true } : {})}>
        <span id={labelId} className={cx("w-fit text-sm font-medium text-fg", hideLabel && "sr-only")}>
          {label}
        </span>
        {/* Les flèches déplacent le focus et choisissent en même temps (sélection « replace »). */}
        <ListBoxContext.Provider value={{ selectionBehavior: "replace" }}>
          <ColorSwatchPicker
            aria-labelledby={labelId}
            {...(describedBy ? { "aria-describedby": describedBy } : {})}
            value={current ?? NONE}
            onChange={(c: Color) => set(normalize(c.toString("hex")))}
            className="flex flex-wrap gap-2 p-1"
          >
            {palette.map((option) => (
              <Swatch key={option.value} option={option} isDisabled={isDisabled} />
            ))}
          </ColorSwatchPicker>
        </ListBoxContext.Provider>
        {allowsCustom && (
          <ColorField
            value={current}
            onChange={(c: Color | null) => set(c ? normalize(c.toString("hex")) : null)}
            {...(describedBy ? { "aria-describedby": describedBy } : {})}
            {...(isDisabled ? { isDisabled } : {})}
            className="flex w-40 flex-col gap-1"
          >
            <Label className="w-fit text-sm text-fg-2">{m.colorHex}</Label>
            <Input className={cx(fieldBox(), "h-(--row-h) px-2.5 font-mono tabular-nums placeholder:text-fg-3")} placeholder="#2a78d6" />
          </ColorField>
        )}
        {description && (
          <span id={descId} className="text-sm text-fg-3">
            {description}
          </span>
        )}
        {/* Toujours présent : le changement est lu poliment après un choix. */}
        <span id={warnId} aria-live="polite" className="text-sm text-warning empty:hidden">
          {ratio !== null ? m.colorLowContrast(ratio.toLocaleString(m.locale, { maximumFractionDigits: 1 })) : ""}
        </span>
      </div>
    </I18nProvider>
  );
}
