/*
 * Calculs partagés par UsageRing et UsageMeter : seuils, texte de la valeur, date de remise à zéro.
 * Spec : UsageRing.spec.md. Décision : D-378.
 */
import type { SocleMessages } from "../../i18n/messages";

/** Ton d'une jauge : accent, puis alerte au-delà des seuils. */
export type UsageTone = "accent" | "warning" | "danger";

/** Seuils par défaut, en pour cent (D-378). */
export const USAGE_WARN_AT = 80;
export const USAGE_DANGER_AT = 95;

/** Valeur ramenée entre 0 et 100 ; une valeur non finie compte pour 0. */
export function clampPercent(value: number): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
}

/** Ton d'une valeur : `danger` à `dangerAt` et au-delà, `warning` à `warnAt` et au-delà. */
export function usageTone(value: number, warnAt = USAGE_WARN_AT, dangerAt = USAGE_DANGER_AT): UsageTone {
  if (value >= dangerAt) return "danger";
  if (value >= warnAt) return "warning";
  return "accent";
}

/** Pourcentage arrondi (« 72 % ») et texte lu (« 85 % (Élevé) ») : le seuil est dit, pas seulement coloré. */
export function usageText(value: number, tone: UsageTone, m: Pick<SocleMessages, "locale" | "usageLevel" | "usageValueText">) {
  const percent = new Intl.NumberFormat(m.locale, { style: "percent", maximumFractionDigits: 0 }).format(value / 100);
  return { percent, valueText: m.usageValueText(percent, tone === "accent" ? null : m.usageLevel(tone)) };
}

/** Date de remise à zéro : jour court et heure dans les 6 jours (« mar. 00:10 »), sinon jour et mois (« 24 nov., 00:10 »). */
export function formatResetDate(date: Date, locale: string, now: Date = new Date()): string {
  const days = (date.getTime() - now.getTime()) / 86_400_000;
  const time = { hour: "2-digit", minute: "2-digit" } as const;
  const options: Intl.DateTimeFormatOptions =
    days >= 0 && days < 6 ? { weekday: "short", ...time } : { day: "numeric", month: "short", ...time };
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/** Classes de couleur par ton. */
export const USAGE_STROKE: Record<UsageTone, string> = { accent: "stroke-accent", warning: "stroke-warning", danger: "stroke-danger" };
export const USAGE_FILL: Record<UsageTone, string> = { accent: "bg-accent", warning: "bg-warning", danger: "bg-danger" };
