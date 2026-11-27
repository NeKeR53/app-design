/*
 * Champ nombre. Spec : NumberField.spec.md.
 * Validation : docs/validation/components/Nouveaux-P1-v1.html (N1 à N3, options A).
 * Moteur : NumberField de React Aria (format de la langue, rôle, flèches ↑ ↓, Origine / Fin).
 */
import { useContext, type KeyboardEvent } from "react";
import { Button, Group, Input, NumberField as RACNumberField, NumberFieldStateContext } from "react-aria-components/NumberField";
import { FieldError } from "react-aria-components/FieldError";
import { I18nProvider } from "react-aria-components/I18nProvider";
import { Text } from "react-aria-components/Text";
import type { ValidationResult } from "react-aria-components/TextField";
import { useMessages } from "../../provider/SocleProvider";
import type { SocleMessages } from "../../i18n/messages";
import { buttonReset, cx } from "../../lib/cx";
import { ChevronDown, ChevronUp } from "../../icons";
import { FieldLabel, ReadOnlyLock, defined, errorText, fieldBox, fieldRoot, type FieldBaseProps } from "../Field/Field";

export interface NumberFieldProps extends FieldBaseProps {
  /** Valeur ; null : vide. */
  value?: number | null;
  defaultValue?: number | null;
  /** Appelé en quittant le champ, et à chaque pas (flèches, boutons). */
  onChange?: (value: number | null) => void;
  /** Minimum : vérifié en quittant le champ ; Origine y mène. */
  minValue?: number;
  /** Maximum : vérifié en quittant le champ ; Fin y mène. */
  maxValue?: number;
  /** Pas des flèches. Défaut : 1 (0,01 pour un pourcentage). */
  step?: number;
  /**
   * Format de la langue : décimales, devise, pourcentage, unité normalisée (`Intl.NumberFormat`).
   * Le symbole s'affiche dans le champ et se lit avec la valeur.
   */
  formatOptions?: Intl.NumberFormatOptions;
  /** Unité libre en suffixe (« pièces », « h ») quand `formatOptions` ne la connaît pas. */
  unit?: string;
  /** Vérification propre : renvoie la phrase qui dit quoi corriger, ou null (D-132). */
  validate?: (value: number | null) => string | null | undefined;
  /** Lecture seule (D-131) : fond gris, cadenas, pas de flèches. */
  isReadOnly?: boolean;
  /** Exemple de valeur, jamais une consigne. */
  placeholder?: string;
  autoFocus?: boolean;
}

/** Options transmises en interne : une clé peut valoir `undefined` (exactOptionalPropertyTypes). */
type Loose<T> = { [K in keyof T]?: T[K] | undefined };

const focusWithin =
  "outline-focus data-focus-within:outline-2 data-focus-within:outline-solid data-focus-within:outline-offset-1";

const stepButton = cx(
  buttonReset,
  "grid min-h-0 flex-1 cursor-default place-items-center text-fg-2",
  "data-hovered:bg-hover data-hovered:text-fg data-pressed:bg-selected data-disabled:opacity-40 data-disabled:data-hovered:bg-transparent",
);

/** Nombre lisible dans la langue, pour les messages d'erreur. */
function fmt(n: number, locale: string, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(locale, options).format(n);
}

/** Message sous le champ : hors bornes, hors pas, ou message de Field (D-132). */
function numberError(
  v: ValidationResult,
  m: SocleMessages,
  { minValue, maxValue, step, formatOptions, label, requiredMessage }: Loose<Pick<NumberFieldProps, "minValue" | "maxValue" | "step" | "formatOptions" | "label" | "requiredMessage">>,
) {
  const d = v.validationDetails;
  const f = (n: number) => fmt(n, m.locale, formatOptions);
  if (d?.rangeUnderflow || d?.rangeOverflow) {
    if (minValue !== undefined && maxValue !== undefined) return m.numberRange(f(minValue), f(maxValue));
    if (minValue !== undefined) return m.numberMin(f(minValue));
    if (maxValue !== undefined) return m.numberMax(f(maxValue));
  }
  if (d?.stepMismatch && step !== undefined) return m.numberStep(fmt(step, m.locale));
  return errorText(v, m, "text", label, requiredMessage);
}

/**
 * Pas de dix (Maj + ↑ ↓, Page haut / bas) : React Aria ne fait qu'un pas.
 * La touche est prise avant le champ, la valeur est bornée au minimum et au maximum (D-356, option A).
 */
function useLargeStep(step: number, minValue: number | undefined, maxValue: number | undefined, formatOptions: Intl.NumberFormatOptions | undefined) {
  const state = useContext(NumberFieldStateContext);
  const m = useMessages();
  return (e: KeyboardEvent) => {
    if (!state) return;
    const up = (e.key === "ArrowUp" && e.shiftKey) || e.key === "PageUp";
    const down = (e.key === "ArrowDown" && e.shiftKey) || e.key === "PageDown";
    if (!up && !down) return;
    const target = e.target as HTMLInputElement;
    if (target.readOnly || target.disabled) return;
    e.preventDefault();
    e.stopPropagation();
    const unit = formatOptions?.style === "percent" && step === 1 ? 0.01 : step;
    const current = state.numberValue;
    let next = Number.isNaN(current) ? (up ? (minValue ?? 0) : (maxValue ?? 0)) : current + (up ? 10 : -10) * unit;
    if (minValue !== undefined) next = Math.max(minValue, next);
    if (maxValue !== undefined) next = Math.min(maxValue, next);
    next = Number(next.toFixed(10));
    state.setNumberValue(next);
    state.setInputValue(fmt(next, m.locale, formatOptions));
    state.commitValidation();
  };
}

function NumberBox({
  isReadOnly,
  unit,
  placeholder,
  step,
  minValue,
  maxValue,
  formatOptions,
}: Loose<Pick<NumberFieldProps, "isReadOnly" | "unit" | "placeholder" | "minValue" | "maxValue" | "formatOptions">> & { step: number }) {
  const m = useMessages();
  const onKeyDownCapture = useLargeStep(step, minValue, maxValue, formatOptions);
  return (
    <div className="relative" onKeyDownCapture={onKeyDownCapture}>
      <Group
        className={cx(fieldBox({ isReadOnly }), focusWithin, "flex h-(--row-h) items-stretch overflow-hidden", isReadOnly && "pr-8")}
      >
        <Input
          {...defined({ placeholder })}
          className={cx("m-0 h-full min-w-0 flex-1 border-0 bg-transparent pl-2.5 font-sans text-md text-right text-fg tabular-nums outline-none placeholder:text-fg-3", unit ? "pr-1" : "pr-2.5")}
        />
        {unit && (
          <span aria-hidden="true" className="flex shrink-0 items-center pr-2.5 text-fg-3 select-none">
            {unit}
          </span>
        )}
        {!isReadOnly && (
          <div className="flex w-[22px] shrink-0 flex-col border-l border-line">
            <Button slot="increment" aria-label={m.increase} className={stepButton}>
              <ChevronUp size={12} />
            </Button>
            <Button slot="decrement" aria-label={m.decrease} className={cx(stepButton, "border-t border-line")}>
              <ChevronDown size={12} />
            </Button>
          </div>
        )}
      </Group>
      {isReadOnly && <ReadOnlyLock />}
    </div>
  );
}

export function NumberField({
  label,
  hideLabel,
  description,
  error,
  isRequired,
  requiredMessage,
  isReadOnly,
  width = "sm",
  value,
  defaultValue,
  onChange,
  validate,
  minValue,
  maxValue,
  step,
  formatOptions,
  unit,
  placeholder,
  ...rest
}: NumberFieldProps) {
  const m = useMessages();
  const toNumber = (n: number | null | undefined) => (n === null ? Number.NaN : n);
  const fromNumber = (n: number) => (Number.isNaN(n) ? null : n);
  return (
    <I18nProvider locale={m.locale}>
      <RACNumberField
        {...defined(rest)}
        {...defined({
          isRequired,
          isReadOnly,
          isInvalid: error ? true : undefined,
          value: toNumber(value),
          defaultValue: toNumber(defaultValue),
          onChange: onChange ? (n: number) => onChange(fromNumber(n)) : undefined,
          validate: validate ? (n: number) => validate(fromNumber(n)) : undefined,
          minValue,
          maxValue,
          step,
          formatOptions,
        })}
        // Bornes vérifiées en quittant le champ, avec un message (D-356) : la valeur saisie n'est pas corrigée en silence.
        commitBehavior="validate"
        isWheelDisabled
        className={fieldRoot(width)}
      >
        <FieldLabel isRequired={isRequired} hidden={hideLabel}>
          {label}
          {unit && <span className="sr-only"> ({unit})</span>}
        </FieldLabel>
        <NumberBox
          isReadOnly={isReadOnly}
          unit={unit}
          placeholder={placeholder}
          step={step ?? 1}
          minValue={minValue}
          maxValue={maxValue}
          formatOptions={formatOptions}
        />
        {description && (
          <Text slot="description" className="socle-desc text-sm text-fg-3 group-data-invalid/field:hidden">
            {description}
          </Text>
        )}
        <FieldError className="text-sm text-danger">
          {(v) => error ?? numberError(v, m, { minValue, maxValue, step, formatOptions, label, requiredMessage })}
        </FieldError>
      </RACNumberField>
    </I18nProvider>
  );
}
