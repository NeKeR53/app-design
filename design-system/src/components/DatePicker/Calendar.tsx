/*
 * Calendrier d'un mois, partagé par DatePicker et DateRangePicker. Spec : DatePicker.spec.md.
 * Module interne, non exporté par index.ts. Moteur : Calendar et RangeCalendar de React Aria
 * (grille, clavier, semaine selon la langue, jours indisponibles).
 */
import { useContext, useState } from "react";
import {
  Calendar as RACCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarMonthPicker,
  CalendarStateContext,
  type DateValue,
} from "react-aria-components/Calendar";
import { RangeCalendar as RACRangeCalendar, RangeCalendarStateContext } from "react-aria-components/RangeCalendar";
import { Button } from "react-aria-components/Button";
import { useLocale } from "react-aria-components/I18nProvider";
import { useMessages } from "../../provider/SocleProvider";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { ChevronDown, ChevronLeft, ChevronRight } from "../../icons";
import { formatMonthYear } from "./dates";

interface Bounds {
  minValue: DateValue | null;
  maxValue: DateValue | null;
}

const calendarClass = "socle-box w-fit p-2 font-sans text-md text-fg outline-none";

/** Bouton du calendrier : précédent, suivant, titre, mois. */
const navButton = cx(
  buttonReset,
  "grid size-(--icon-btn) shrink-0 cursor-default place-items-center rounded-md text-fg-2",
  "data-hovered:bg-hover data-hovered:text-fg data-pressed:bg-selected data-disabled:opacity-40 data-disabled:data-hovered:bg-transparent",
  focusRing,
);
const headingButton = cx(
  buttonReset,
  "flex h-(--icon-btn) min-w-0 cursor-default items-center justify-center gap-1 rounded-md px-2 text-sm font-semibold text-fg",
  "data-hovered:bg-hover data-pressed:bg-selected",
  focusRing,
);

/** Case d'un jour : aujourd'hui encadré, indisponible barré, hors bornes estompé (DatePicker.spec.md). */
const cellBase = cx(
  "relative grid size-(--icon-btn) cursor-default place-items-center rounded-sm text-sm tabular-nums outline-none select-none",
  "data-hovered:bg-hover",
  "data-today:font-semibold data-today:shadow-[inset_0_0_0_1px_var(--line-strong)]",
  "data-outside-month:text-fg-3",
  "data-unavailable:text-fg-3 data-unavailable:line-through data-unavailable:data-hovered:bg-transparent",
  "data-disabled:opacity-40 data-disabled:data-hovered:bg-transparent",
  "data-focus-visible:z-10 data-focus-visible:outline-2 data-focus-visible:outline-solid outline-focus data-focus-visible:outline-offset-1",
);
/** Un jour choisi : fond accent. */
const cellSingle = "data-selected:bg-accent data-selected:text-accent-fg data-selected:data-hovered:bg-accent";
/** Plage : jours teintés, début et fin en accent. */
const cellRange = cx(
  "data-selected:rounded-none data-selected:bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]",
  "data-selected:data-hovered:bg-[color-mix(in_srgb,var(--accent)_24%,transparent)]",
  "data-selection-start:data-selected:rounded-l-sm data-selection-start:data-selected:bg-accent data-selection-start:data-selected:text-accent-fg",
  "data-selection-end:data-selected:rounded-r-sm data-selection-end:data-selected:bg-accent data-selection-end:data-selected:text-accent-fg",
);

/** Calendrier d'une date. */
export function SingleCalendar(bounds: Bounds) {
  return (
    <RACCalendar className={calendarClass}>
      <CalendarBody range={false} {...bounds} />
    </RACCalendar>
  );
}

/** Calendrier d'une plage : premier clic, le début ; second clic, la fin. */
export function RangeCalendar(bounds: Bounds) {
  return (
    <RACRangeCalendar className={calendarClass}>
      <CalendarBody range {...bounds} />
    </RACRangeCalendar>
  );
}

function useCalendarState() {
  const single = useContext(CalendarStateContext);
  const range = useContext(RangeCalendarStateContext);
  const state = single ?? range;
  if (!state) throw new Error("CalendarBody : à placer dans un Calendar ou un RangeCalendar.");
  return state;
}

function CalendarBody({ range, minValue, maxValue }: Bounds & { range: boolean }) {
  const m = useMessages();
  const { locale } = useLocale();
  const state = useCalendarState();
  // Titre cliquable : la vue des mois remplace la grille des jours (D-354, option A).
  const [view, setView] = useState<"days" | "months">("days");
  const focused = state.focusedDate;

  const backToDays = () => {
    setView("days");
    state.setFocused(true);
  };

  if (view === "months") {
    const year = focused.year;
    const yearText = new Intl.DateTimeFormat(locale, { year: "numeric" }).format(new Date(year, 0, 1));
    return (
      <div className="flex flex-col">
        <header className="flex items-center gap-1 pb-1.5">
          <Button
            slot={null}
            className={navButton}
            aria-label={m.previousYear}
            isDisabled={minValue !== null && year - 1 < minValue.year}
            onPress={() => state.setFocusedDate(focused.subtract({ years: 1 }))}
          >
            <ChevronLeft />
          </Button>
          <Button slot={null} className={cx(headingButton, "flex-1")} aria-label={m.backToDays(yearText)} onPress={backToDays}>
            {yearText}
          </Button>
          <Button
            slot={null}
            className={navButton}
            aria-label={m.nextYear}
            isDisabled={maxValue !== null && year + 1 > maxValue.year}
            onPress={() => state.setFocusedDate(focused.add({ years: 1 }))}
          >
            <ChevronRight />
          </Button>
        </header>
        <CalendarMonthPicker format="short">
          {({ items, value, onChange, "aria-label": label }) => (
            <div role="group" aria-label={label} className="grid w-[calc(var(--icon-btn)*7)] grid-cols-3 gap-1">
              {items.map((item) => {
                const first = item.date.set({ day: 1 });
                const last = first.add({ months: 1 }).subtract({ days: 1 });
                const out = (minValue !== null && last.compare(minValue) < 0) || (maxValue !== null && first.compare(maxValue) > 0);
                const current = item.id === value;
                return (
                  <Button
                    key={item.id}
                    slot={null}
                    autoFocus={current}
                    isDisabled={out}
                    aria-pressed={current}
                    className={cx(
                      buttonReset,
                      "h-(--row-h) cursor-default rounded-md text-center text-sm text-fg",
                      "data-hovered:bg-hover data-pressed:bg-selected data-disabled:opacity-40",
                      current && "bg-selected font-semibold",
                      focusRing,
                    )}
                    onPress={() => {
                      onChange(item.id);
                      backToDays();
                    }}
                  >
                    {item.formatted}
                  </Button>
                );
              })}
            </div>
          )}
        </CalendarMonthPicker>
      </div>
    );
  }

  const heading = formatMonthYear(focused, locale);
  return (
    <div className="flex flex-col">
      <header className="flex items-center gap-1 pb-1.5">
        <Button slot="previous" className={navButton} aria-label={m.previousMonth}>
          <ChevronLeft />
        </Button>
        <Button slot={null} className={cx(headingButton, "flex-1")} aria-label={m.pickMonthYear(heading)} onPress={() => setView("months")}>
          <span className="truncate">{heading}</span>
          <ChevronDown size={14} className="shrink-0 text-fg-2" />
        </Button>
        <Button slot="next" className={navButton} aria-label={m.nextMonth}>
          <ChevronRight />
        </Button>
      </header>
      <CalendarGrid className="border-separate border-spacing-x-0 border-spacing-y-0.5 [&_td]:p-0 [&_th]:p-0">
        <CalendarGridHeader>
          {(day) => <CalendarHeaderCell className="h-6 text-xs font-normal text-fg-3">{day}</CalendarHeaderCell>}
        </CalendarGridHeader>
        <CalendarGridBody>{(date) => <CalendarCell date={date} className={cx(cellBase, range ? cellRange : cellSingle)} />}</CalendarGridBody>
      </CalendarGrid>
    </div>
  );
}
