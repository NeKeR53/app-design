/*
 * Curseur pour un réglage approximatif. Spec : Slider.spec.md.
 * Validation : docs/validation/components/Nouveaux-P4-v1.html (SL1, option A ; D-366).
 * Moteur : Slider de React Aria (rôle `slider`, flèches, Origine / Fin, glisser).
 */
import { useContext, useId, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { Label, Slider as RACSlider, SliderFill, SliderOutput, SliderStateContext, SliderThumb, SliderTrack } from "react-aria-components/Slider";
import { I18nProvider } from "react-aria-components/I18nProvider";
import { useMessages } from "../../provider/SocleProvider";
import { cx, focusRing } from "../../lib/cx";
import { defined, fieldRoot, type FieldWidth } from "../Field/Field";

/** Une valeur, ou une plage `[début, fin]` à deux poignées. */
export type SliderValue = number | [number, number];

export interface SliderProps<T extends SliderValue = number> {
  /** Libellé visible au-dessus, et nom accessible. */
  label: string;
  /** Masque le libellé à l'écran ; il reste le nom accessible. La valeur reste affichée. */
  hideLabel?: boolean;
  /** Aide sous le curseur. */
  description?: string;
  /** Valeur (contrôlé). Un tableau `[a, b]` donne deux poignées. */
  value?: T;
  /** Valeur de départ (non contrôlé). Un tableau `[a, b]` donne deux poignées. */
  defaultValue?: T;
  /** Appelé à chaque déplacement : pour l'aperçu. */
  onChange?: (value: T) => void;
  /** Appelé au relâché (souris, doigt) et à chaque touche : pour enregistrer. */
  onChangeEnd?: (value: T) => void;
  /** Défaut : 0. Origine y mène. */
  minValue?: number;
  /** Défaut : 100. Fin y mène. */
  maxValue?: number;
  /** Pas des flèches. Défaut : 1. Page haut / bas : dix pas. */
  step?: number;
  /** Format de la valeur affichée et lue (`Intl.NumberFormat`) : pourcentage, unité, décimales. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Texte d'une valeur, affiché et lu à la place du nombre : `(v) => ["Faible", "Moyen", "Élevé"][v]`. Prime sur `formatOptions`. */
  formatValue?: (value: number) => string;
  /** Crans sur la piste, un par pas (20 au plus) : pour une échelle courte et discrète. */
  showSteps?: boolean;
  isDisabled?: boolean;
  /** Largeur (D-133). Défaut : `md` (240 px). */
  width?: FieldWidth;
  /** Nom dans le formulaire envoyé (une entrée par poignée). */
  name?: string;
}

const thumbClass = cx(
  "top-1/2 size-4 cursor-default rounded-full border-2 border-primary bg-surface",
  "transition-[outline-color] duration-[var(--dur-fast)] ease-standard",
  focusRing,
  "data-dragging:bg-field",
);

/**
 * Page haut / bas : dix pas (React Aria prend un dixième de l'étendue).
 * La touche est prise avant la poignée ; `onChangeEnd` est appelé comme pour une flèche.
 */
function LargeStep({ index, step, children }: { index: number; step: number; children: ReactNode }) {
  const state = useContext(SliderStateContext);
  const onKeyDownCapture = (e: KeyboardEvent) => {
    if (!state || state.isDisabled || (e.key !== "PageUp" && e.key !== "PageDown")) return;
    e.preventDefault();
    e.stopPropagation();
    state.setThumbDragging(index, true);
    if (e.key === "PageUp") state.incrementThumb(index, 10 * step);
    else state.decrementThumb(index, 10 * step);
    state.setThumbDragging(index, false);
  };
  return (
    <div className="contents" onKeyDownCapture={onKeyDownCapture}>
      {children}
    </div>
  );
}

export function Slider<T extends SliderValue = number>({
  label,
  hideLabel,
  description,
  value,
  defaultValue,
  onChange,
  onChangeEnd,
  minValue = 0,
  maxValue = 100,
  step = 1,
  formatOptions,
  formatValue,
  showSteps = false,
  isDisabled,
  width = "md",
  name,
}: SliderProps<T>) {
  const m = useMessages();
  const descId = useId();
  const range = Array.isArray(value ?? defaultValue);
  const thumbs = range ? [m.sliderMinimum, m.sliderMaximum] : [undefined];
  // React Aria passe un nombre ou un tableau selon la valeur reçue : on rend le même type.
  const cast = (v: number | number[]) => (Array.isArray(v) ? [v[0], v[1]] : v) as T;
  const root = useRef<HTMLDivElement>(null);
  const stepCount = Math.round((maxValue - minValue) / step);
  const marks = showSteps && stepCount > 0 && stepCount <= 20 ? Array.from({ length: stepCount + 1 }, (_, i) => i / stepCount) : [];
  // React Aria lit le nombre formaté : avec `formatValue`, le texte lu (`aria-valuetext`) suit le texte affiché.
  const syncValueText = () => {
    if (!formatValue) return;
    root.current?.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach((input) => {
      input.setAttribute("aria-valuetext", formatValue(Number(input.value)));
    });
  };
  useLayoutEffect(syncValueText);
  return (
    <I18nProvider locale={m.locale}>
      <RACSlider<number | number[]>
        {...defined({
          value: value as number | number[] | undefined,
          defaultValue: (defaultValue ?? (value === undefined ? minValue : undefined)) as number | number[] | undefined,
          // Sans valeur pilotée par l'app, React Aria redessine seul : on remet le texte lu après chaque changement.
          onChange:
            onChange || formatValue
              ? (v: number | number[]) => {
                  onChange?.(cast(v));
                  if (formatValue) requestAnimationFrame(syncValueText);
                }
              : undefined,
          onChangeEnd: onChangeEnd ? (v: number | number[]) => onChangeEnd(cast(v)) : undefined,
          formatOptions,
          isDisabled,
        })}
        minValue={minValue}
        maxValue={maxValue}
        step={step}
        className={fieldRoot(width)}
        ref={root}
      >
        <div className="flex items-baseline justify-between gap-3">
          <Label className={cx("min-w-0 truncate text-sm font-medium text-fg", hideLabel && "sr-only")}>{label}</Label>
          <SliderOutput className="ml-auto shrink-0 text-sm text-fg-2 tabular-nums">
            {formatValue ? ({ state }) => state.values.map((v) => formatValue(v)).join(" – ") : undefined}
          </SliderOutput>
        </div>
        {/* Zone de 16 px : un clic sur la piste déplace la poignée la plus proche. */}
        <SliderTrack data-part="track" className="relative h-4 w-full">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-field">
            <SliderFill data-part="fill" className="rounded-full bg-primary" />
          </div>
          {marks.map((at) => (
            <span
              key={at}
              aria-hidden="true"
              data-part="step"
              className="pointer-events-none absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-line-strong"
              style={{ left: `${at * 100}%` }}
            />
          ))}
          {thumbs.map((thumbLabel, i) => (
            <LargeStep key={i} index={i} step={step}>
              <SliderThumb
                index={i}
                data-part="thumb"
                className={thumbClass}
                {...defined({ "aria-label": thumbLabel, "aria-describedby": description ? descId : undefined, name })}
              />
            </LargeStep>
          ))}
        </SliderTrack>
        {description && (
          <span id={descId} className="text-sm text-fg-3">
            {description}
          </span>
        )}
      </RACSlider>
    </I18nProvider>
  );
}
