/*
 * Champ de date et champ de plage de dates. Spec : DatePicker.spec.md.
 * Validation : docs/validation/components/Nouveaux-P1-v1.html (D1 à D4, options A).
 * Moteur : DatePicker, DateRangePicker, DateInput de React Aria. Dates en chaînes ISO à l'API.
 */
import { useContext, useMemo, type ReactNode } from "react";
import { DatePicker as RACDatePicker, DateInput, DateSegment, type DateValue } from "react-aria-components/DatePicker";
import { DateRangePicker as RACDateRangePicker, DateRangePickerStateContext } from "react-aria-components/DateRangePicker";
import { Button } from "react-aria-components/Button";
import { Dialog } from "react-aria-components/Dialog";
import { FieldError } from "react-aria-components/FieldError";
import { Group } from "react-aria-components/Group";
import { I18nProvider } from "react-aria-components/I18nProvider";
import { Popover } from "react-aria-components/Popover";
import { Text } from "react-aria-components/Text";
import type { ValidationResult } from "react-aria-components/TextField";
import { Calendar } from "../../icons";
import { useMessages } from "../../provider/SocleProvider";
import type { SocleMessages } from "../../i18n/messages";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { FieldLabel, ReadOnlyLock, defined, errorText, fieldBox, fieldRoot, type FieldBaseProps } from "../Field/Field";
import { RangeCalendar, SingleCalendar } from "./Calendar";
import { formatLong, toCalendarDate, toIso, type DateRange, type IsoDate } from "./dates";

export type { DateRange, IsoDate } from "./dates";

interface DateFieldOptions extends FieldBaseProps {
  /** Première date permise, ISO (« 2026-01-01 ») ; vérifiée en quittant le champ. */
  minValue?: IsoDate;
  /** Dernière date permise, ISO. */
  maxValue?: IsoDate;
  /** Jour non choisissable (férié, complet) : barré dans le calendrier et refusé à la saisie. */
  isDateUnavailable?: (date: IsoDate) => boolean;
  /** Lecture seule (D-131) : fond gris, cadenas, pas de bouton calendrier. */
  isReadOnly?: boolean;
  autoFocus?: boolean;
}

export interface DatePickerProps extends DateFieldOptions {
  /** Date choisie, ISO « AAAA-MM-JJ » ; null : vide. */
  value?: IsoDate | null;
  defaultValue?: IsoDate | null;
  /** Appelé quand la date est complète ou vidée. */
  onChange?: (value: IsoDate | null) => void;
}

/** Raccourci de période, fourni par l'app (D-354, option A). */
export interface DatePreset {
  /** « 7 derniers jours », « Ce mois-ci ». */
  label: string;
  value: DateRange;
}

export interface DateRangePickerProps extends Omit<DateFieldOptions, "name"> {
  /** Plage choisie ; null : vide. */
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onChange?: (value: DateRange | null) => void;
  /** Raccourcis : une colonne à gauche du calendrier. Absents par défaut. */
  presets?: DatePreset[];
  /** Noms des deux dates dans le formulaire envoyé. */
  startName?: string;
  endName?: string;
}

/** Cadre : anneau de focus quand un segment a le focus (D-130). */
const focusWithin =
  "outline-focus data-focus-within:outline-2 data-focus-within:outline-solid data-focus-within:outline-offset-1";

const triggerClass = cx(
  buttonReset,
  "ml-auto grid size-6 shrink-0 cursor-default place-items-center rounded-sm text-fg-2",
  "data-hovered:bg-hover data-hovered:text-fg data-pressed:bg-selected",
  // Dans le cadre, qui porte déjà l'anneau : le bouton se signale par son fond, pas par un second anneau (D-425).
  "outline-none data-focus-visible:bg-hover data-focus-visible:text-fg",
);

const inputClass = "flex min-w-0 items-center tabular-nums";

/** Segment JJ, MM, AAAA : accent quand il a le focus ; exemple en --fg-3 ; séparateurs discrets. */
const segmentClass = cx(
  "rounded-[3px] px-px text-fg outline-none caret-transparent",
  "data-placeholder:text-fg-3 data-[type=literal]:px-0 data-[type=literal]:text-fg-3",
  "data-focused:bg-accent data-focused:text-accent-fg",
);

function Segments({ slot }: { slot?: "start" | "end" }) {
  return (
    <DateInput {...defined({ slot })} className={inputClass}>
      {(segment) => <DateSegment segment={segment} className={segmentClass} />}
    </DateInput>
  );
}

function DateBox({ isReadOnly, children }: { isReadOnly: boolean | undefined; children: ReactNode }) {
  const m = useMessages();
  return (
    <div className="relative">
      <Group className={cx(fieldBox({ isReadOnly }), focusWithin, "flex h-(--row-h) items-center gap-1 pl-2.5", isReadOnly ? "pr-8" : "pr-1")}>
        {children}
        {!isReadOnly && (
          <Button className={triggerClass} aria-label={m.openCalendar}>
            <Calendar />
          </Button>
        )}
      </Group>
      {isReadOnly && <ReadOnlyLock />}
    </div>
  );
}

/** Volet du calendrier : surface des menus, rayon 12 px, ombre (D-328). */
function CalendarPopover({ children }: { children: ReactNode }) {
  return (
    <Popover
      placement="bottom start"
      offset={4}
      containerPadding={8}
      className="socle-box max-w-[calc(100vw-16px)] overflow-auto rounded-lg border border-line bg-surface-raised font-sans text-md text-fg shadow-md outline-none"
    >
      <Dialog className="outline-none">{children}</Dialog>
    </Popover>
  );
}

/** Message sous le champ : date trop tôt, trop tard, indisponible, plage inversée, ou message de Field (D-132). */
function dateError(v: ValidationResult, m: SocleMessages, min: DateValue | null, max: DateValue | null, label: string, requiredMessage?: string) {
  const d = v.validationDetails;
  if (d?.rangeUnderflow && d.rangeOverflow) return m.dateRangeReversed;
  if (d?.rangeUnderflow && min) return m.dateTooEarly(formatLong(min, m.locale));
  if (d?.rangeOverflow && max) return m.dateTooLate(formatLong(max, m.locale));
  if (d?.badInput) return m.dateUnavailable;
  return errorText(v, m, "text", label, requiredMessage);
}

function DateHelp({
  description,
  error,
  label,
  requiredMessage,
  min,
  max,
}: {
  description: string | undefined;
  error: string | undefined;
  label: string;
  requiredMessage: string | undefined;
  min: DateValue | null;
  max: DateValue | null;
}) {
  const m = useMessages();
  return (
    <>
      {description && (
        <Text slot="description" className="socle-desc text-sm text-fg-3 group-data-invalid/field:hidden">
          {description}
        </Text>
      )}
      <FieldError className="text-sm text-danger">{(v) => error ?? dateError(v, m, min, max, label, requiredMessage)}</FieldError>
    </>
  );
}

function useBounds(minValue: IsoDate | undefined, maxValue: IsoDate | undefined, isDateUnavailable: ((d: IsoDate) => boolean) | undefined) {
  const min = useMemo(() => toCalendarDate(minValue), [minValue]);
  const max = useMemo(() => toCalendarDate(maxValue), [maxValue]);
  const unavailable = useMemo(() => (isDateUnavailable ? (d: DateValue) => isDateUnavailable(toIso(d)) : undefined), [isDateUnavailable]);
  return { min, max, unavailable };
}

export function DatePicker({
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
  minValue,
  maxValue,
  isDateUnavailable,
  ...rest
}: DatePickerProps) {
  const m = useMessages();
  const { min, max, unavailable } = useBounds(minValue, maxValue, isDateUnavailable);
  return (
    <I18nProvider locale={m.locale}>
      <RACDatePicker
        {...defined(rest)}
        {...defined({
          isRequired,
          isReadOnly,
          isInvalid: error ? true : undefined,
          value: value === undefined ? undefined : toCalendarDate(value),
          defaultValue: defaultValue === undefined ? undefined : toCalendarDate(defaultValue),
          minValue: min ?? undefined,
          maxValue: max ?? undefined,
          isDateUnavailable: unavailable,
          onChange: onChange ? (d: DateValue | null) => onChange(d ? toIso(d) : null) : undefined,
        })}
        granularity="day"
        shouldCloseOnSelect
        className={fieldRoot(width)}
      >
        <FieldLabel isRequired={isRequired} hidden={hideLabel}>
          {label}
        </FieldLabel>
        <DateBox isReadOnly={isReadOnly}>
          <Segments />
        </DateBox>
        <DateHelp description={description} error={error} label={label} requiredMessage={requiredMessage} min={min} max={max} />
        <CalendarPopover>
          <SingleCalendar minValue={min} maxValue={max} />
        </CalendarPopover>
      </RACDatePicker>
    </I18nProvider>
  );
}

/** Colonne des raccourcis : un clic fixe la plage et ferme le volet (D-007). */
function Presets({ presets }: { presets: DatePreset[] }) {
  const m = useMessages();
  const state = useContext(DateRangePickerStateContext);
  const current = state?.value?.start && state.value.end ? `${toIso(state.value.start)}/${toIso(state.value.end)}` : "";
  return (
    <div
      role="group"
      aria-label={m.datePresets}
      className="flex min-w-36 flex-col gap-0.5 border-r border-line p-1.5 max-tablet:flex-row max-tablet:flex-wrap max-tablet:border-r-0 max-tablet:border-b"
    >
      {presets.map((p) => {
        const on = `${p.value.start}/${p.value.end}` === current;
        return (
          <Button
            key={p.label}
            slot={null}
            aria-pressed={on}
            className={cx(
              buttonReset,
              "flex h-(--row-h) cursor-default items-center rounded-md px-2.5 text-left text-md whitespace-nowrap text-fg",
              "data-hovered:bg-hover data-pressed:bg-selected",
              on && "bg-selected font-medium",
              focusRing,
            )}
            onPress={() => {
              const start = toCalendarDate(p.value.start);
              const end = toCalendarDate(p.value.end);
              if (!state || !start || !end) return;
              state.setValue({ start, end });
              state.close();
            }}
          >
            {p.label}
          </Button>
        );
      })}
    </div>
  );
}

export function DateRangePicker({
  label,
  hideLabel,
  description,
  error,
  isRequired,
  requiredMessage,
  isReadOnly,
  width = "md",
  value,
  defaultValue,
  onChange,
  minValue,
  maxValue,
  isDateUnavailable,
  presets,
  ...rest
}: DateRangePickerProps) {
  const m = useMessages();
  const { min, max, unavailable } = useBounds(minValue, maxValue, isDateUnavailable);
  const toRange = (r: DateRange | null) => {
    const start = toCalendarDate(r?.start);
    const end = toCalendarDate(r?.end);
    return start && end ? { start, end } : null;
  };
  return (
    <I18nProvider locale={m.locale}>
      <RACDateRangePicker
        {...defined(rest)}
        {...defined({
          isRequired,
          isReadOnly,
          isInvalid: error ? true : undefined,
          value: value === undefined ? undefined : toRange(value),
          defaultValue: defaultValue === undefined ? undefined : toRange(defaultValue),
          minValue: min ?? undefined,
          maxValue: max ?? undefined,
          isDateUnavailable: unavailable,
          onChange: onChange
            ? (r: { start: DateValue; end: DateValue } | null) => onChange(r ? { start: toIso(r.start), end: toIso(r.end) } : null)
            : undefined,
        })}
        granularity="day"
        shouldCloseOnSelect
        className={fieldRoot(width)}
      >
        <FieldLabel isRequired={isRequired} hidden={hideLabel}>
          {label}
        </FieldLabel>
        <DateBox isReadOnly={isReadOnly}>
          <Segments slot="start" />
          <span aria-hidden="true" className="px-1 text-fg-3">
            –
          </span>
          <Segments slot="end" />
        </DateBox>
        <DateHelp description={description} error={error} label={label} requiredMessage={requiredMessage} min={min} max={max} />
        <CalendarPopover>
          <div className="flex max-tablet:flex-col">
            {presets && presets.length > 0 && <Presets presets={presets} />}
            <RangeCalendar minValue={min} maxValue={max} />
          </div>
        </CalendarPopover>
      </RACDateRangePicker>
    </I18nProvider>
  );
}
