/*
 * Conversion entre les dates de l'API (chaînes ISO « AAAA-MM-JJ ») et les CalendarDate de React Aria.
 * Module interne du dossier DatePicker.
 */
import { CalendarDate, parseDate } from "@internationalized/date";
import type { DateValue } from "react-aria-components/DatePicker";

/** Date du jour à l'API : « 2026-11-24 ». */
export type IsoDate = string;

/** Plage de dates à l'API ; `start` ≤ `end`. */
export interface DateRange {
  start: IsoDate;
  end: IsoDate;
}

/** Chaîne ISO → CalendarDate ; null si la chaîne est absente ou invalide. */
export function toCalendarDate(iso: IsoDate | null | undefined): CalendarDate | null {
  if (!iso) return null;
  try {
    return parseDate(iso);
  } catch {
    return null;
  }
}

/** CalendarDate (ou toute date React Aria) → chaîne ISO, jour seulement. */
export function toIso(date: DateValue): IsoDate {
  return new CalendarDate(date.year, date.month, date.day).toString();
}

/** Date lisible dans la langue (« 24 novembre 2026 »), pour les messages d'erreur. */
export function formatLong(date: DateValue, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(date.year, date.month - 1, date.day));
}

/** Mois et année du calendrier (« novembre 2026 »). */
export function formatMonthYear(date: DateValue, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(date.year, date.month - 1, 1));
}
