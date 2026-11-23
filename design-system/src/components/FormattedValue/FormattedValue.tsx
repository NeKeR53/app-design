/*
 * Valeurs typées. Spec : FormattedValue.spec.md. Décisions : D-170 à D-172.
 * L'app déclare le type d'une donnée ; Socle fixe le format, l'alignement, la largeur et le tri.
 */
import { useCallback, type ReactNode } from "react";
import type { SocleMessages } from "../../i18n/messages";
import { useMessages } from "../../provider/SocleProvider";
import { Code } from "../Code/Code";
import { Link } from "../Link/Link";
import { StatusBadge, type StatusTone } from "../StatusBadge/StatusBadge";

/** Type d'une donnée (D-170). */
export type ValueType =
  | "text"
  | "longtext"
  | "number"
  | "money"
  | "percent"
  | "bytes"
  | "date"
  | "datetime"
  | "relative"
  | "duration"
  | "boolean"
  | "status"
  | "email"
  | "url"
  | "code"
  | "tags";

/** Clé enregistrée → libellé et ton : `{ en_cours: { label: "En cours", tone: "pending" } }`. */
export type StatusMap = Readonly<Record<string, { label: string; tone: StatusTone }>>;

/** Comment lire et écrire une donnée. Partagé par les colonnes de ListPage et les propriétés de DetailPanel. */
export interface ValueFormat {
  /** Type de la donnée. Défaut : `text`. */
  type?: ValueType;
  /** Pour `status` : clé → libellé et ton. */
  statuses?: StatusMap;
  /** Pour `money` : devise ISO 4217. Défaut : `EUR`. */
  currency?: string;
  /** Pour `number`, `money`, `percent`, `bytes` : nombre fixe de décimales. */
  decimals?: number;
  /** Pour `duration` : unité de la valeur reçue. Défaut : `s`. */
  durationUnit?: "ms" | "s" | "min";
}

export interface FormattedValueProps extends ValueFormat {
  /** La donnée brute. */
  value: unknown;
}

const NUMERIC = new Set<ValueType>(["number", "money", "percent", "bytes", "duration"]);
const TEMPORAL = new Set<ValueType>(["date", "datetime", "relative"]);

/** Vide : `null`, `undefined`, `""`, liste vide (D-171). */
export function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Date d'une valeur : `Date`, horodatage (secondes sous 10¹², sinon ms), `AAAA-MM-JJ` local, ISO. */
export function toDate(value: unknown): Date | null {
  let d: Date | null = null;
  if (value instanceof Date) d = value;
  else if (typeof value === "number") d = new Date(Math.abs(value) < 1e12 ? value * 1000 : value);
  else if (typeof value === "string") d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  return d && !Number.isNaN(d.getTime()) ? d : null;
}

const toBool = (value: unknown): boolean | null => {
  if (value === true || value === 1 || value === "true" || value === "1") return true;
  if (value === false || value === 0 || value === "false" || value === "0") return false;
  return null;
};

const fixed = (decimals: number | undefined, max: number, min = 0): Intl.NumberFormatOptions =>
  decimals === undefined ? { minimumFractionDigits: min, maximumFractionDigits: max } : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };

const unit = (locale: string, n: number, u: string, decimals?: number) =>
  new Intl.NumberFormat(locale, { style: "unit", unit: u, unitDisplay: "short", ...fixed(decimals, 1) }).format(n);

function bytesText(n: number, locale: string, decimals?: number) {
  const units = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];
  let i = 0;
  let v = Math.abs(n);
  while (v >= 1000 && i < units.length - 1) {
    v /= 1000;
    i++;
  }
  return unit(locale, Math.sign(n) * v, units[i]!, i === 0 ? 0 : decimals);
}

function durationText(n: number, durationUnit: ValueFormat["durationUnit"], locale: string) {
  const total = Math.round(n * (durationUnit === "ms" ? 0.001 : durationUnit === "min" ? 60 : 1));
  if (total === 0) return unit(locale, 0, "second");
  const steps: Array<[string, number]> = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  let rest = Math.abs(total);
  const parts: string[] = [];
  for (const [u, size] of steps) {
    const q = Math.floor(rest / size);
    rest -= q * size;
    if (q > 0 || parts.length > 0) parts.push(q > 0 ? unit(locale, q, u) : "");
    if (parts.length === 2) break;
  }
  return (total < 0 ? "-" : "") + parts.filter(Boolean).join(" ");
}

function relativeText(date: Date, locale: string, justNow: string) {
  const seconds = (date.getTime() - Date.now()) / 1000;
  const steps: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [u, size] of steps) if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), u);
  return justNow;
}

type FormatMessages = Pick<SocleMessages, "locale" | "yes" | "no" | "justNow">;

/** Texte affiché d'une valeur, sans balise ; `""` si elle est vide. Fonction pure. */
export function formatValue(value: unknown, format: ValueFormat, m: FormatMessages): string {
  if (isEmptyValue(value)) return "";
  const type = format.type ?? "text";
  const locale = m.locale;
  const raw = Array.isArray(value) ? value.map(String).join(", ") : String(value);
  if (NUMERIC.has(type)) {
    const n = toNumber(value);
    if (n === null) return raw;
    switch (type) {
      case "money":
        return new Intl.NumberFormat(locale, { style: "currency", currency: format.currency ?? "EUR", ...(format.decimals !== undefined ? fixed(format.decimals, 2) : {}) }).format(n);
      case "percent":
        return new Intl.NumberFormat(locale, { style: "percent", ...fixed(format.decimals, 1) }).format(n);
      case "bytes":
        return bytesText(n, locale, format.decimals);
      case "duration":
        return durationText(n, format.durationUnit, locale);
      default:
        return new Intl.NumberFormat(locale, fixed(format.decimals, 2)).format(n);
    }
  }
  if (TEMPORAL.has(type)) {
    const d = toDate(value);
    if (!d) return raw;
    if (type === "relative") return relativeText(d, locale, m.justNow);
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium", ...(type === "datetime" ? { timeStyle: "short" } : {}) }).format(d);
  }
  if (type === "boolean") {
    const b = toBool(value);
    return b === null ? raw : b ? m.yes : m.no;
  }
  if (type === "status") return format.statuses?.[raw]?.label ?? raw;
  return raw;
}

/** `(value, format) => string` : le texte affiché, dans la langue de SocleProvider. */
export function useFormatValue(): (value: unknown, format?: ValueFormat) => string {
  const m = useMessages();
  return useCallback((value: unknown, format: ValueFormat = {}) => formatValue(value, format, m), [m]);
}

/**
 * Clé de tri (D-172) : nombre, horodatage, 0/1 pour un booléen ; sinon `null`,
 * et l'appelant compare le texte affiché. Une valeur vide rend toujours `null`.
 */
export function valueSortKey(value: unknown, format: ValueFormat = {}): number | null {
  if (isEmptyValue(value)) return null;
  const type = format.type ?? "text";
  if (NUMERIC.has(type)) return toNumber(value);
  if (TEMPORAL.has(type)) return toDate(value)?.getTime() ?? null;
  if (type === "boolean") {
    const b = toBool(value);
    return b === null ? null : Number(b);
  }
  return null;
}

/** Alignement et largeur de colonne d'un type (D-172). Sans largeur : la place restante. */
export function valueLayout(type: ValueType = "text"): { align: "start" | "end"; width?: number } {
  const widths: Partial<Record<ValueType, number>> = {
    number: 110,
    money: 130,
    percent: 90,
    bytes: 90,
    date: 120,
    datetime: 160,
    relative: 130,
    duration: 100,
    boolean: 80,
    status: 140,
    code: 140,
  };
  const width = widths[type];
  return { align: NUMERIC.has(type) || TEMPORAL.has(type) ? "end" : "start", ...(width ? { width } : {}) };
}

/** Le type a un rendu propre (badge, lien, code) et pas seulement un texte. */
export function isRichValue(type: ValueType = "text"): boolean {
  return type === "status" || type === "email" || type === "url" || type === "code";
}

/** « — » lu « vide » (D-171). */
export function EmptyValue() {
  const m = useMessages();
  return (
    <span className="text-fg-3">
      <span aria-hidden>—</span>
      <span className="sr-only">{m.emptyValue}</span>
    </span>
  );
}

/** Une donnée affichée d'après son type (D-170). */
export function FormattedValue({ value, ...format }: FormattedValueProps): ReactNode {
  const m = useMessages();
  if (isEmptyValue(value)) return <EmptyValue />;
  const type = format.type ?? "text";
  const text = formatValue(value, format, m);
  switch (type) {
    case "status": {
      const s = format.statuses?.[String(value)];
      return <StatusBadge tone={s?.tone ?? "neutral"}>{text}</StatusBadge>;
    }
    case "email":
      return <Link href={`mailto:${String(value)}`}>{text}</Link>;
    case "url":
      return <Link href={String(value)}>{text}</Link>;
    case "code":
      return <Code>{text}</Code>;
    case "longtext":
      return <span className="whitespace-pre-line">{text}</span>;
    default: {
      if (TEMPORAL.has(type)) {
        const d = toDate(value);
        return d ? <time dateTime={d.toISOString()}>{text}</time> : text;
      }
      if (NUMERIC.has(type)) return <span className="tabular-nums">{text}</span>;
      return text;
    }
  }
}
