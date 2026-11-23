/*
 * Ligne d'une limite d'usage, pour le volet de UsageRing. Spec : UsageRing.spec.md. Décision : D-378.
 */
import { useId } from "react";
import { Meter } from "react-aria-components/Meter";
import { cx } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { USAGE_FILL, USAGE_DANGER_AT, USAGE_WARN_AT, clampPercent, formatResetDate, usageText, usageTone } from "./usage";

export interface UsageMeterProps {
  /** Nom de la limite : « Limite sur 5 h », « Semaine ». */
  label: string;
  /** Part utilisée, en pour cent (0 à 100). */
  value: number;
  /** Remise à zéro : texte déjà formaté par l'app, ou date formatée selon la langue. */
  resetsAt?: string | Date;
  /** Seuil d'alerte, en pour cent. Défaut : 80. */
  warnAt?: number;
  /** Seuil critique, en pour cent. Défaut : 95. */
  dangerAt?: number;
}

/** Libellé à gauche ; remise à zéro et pourcentage à droite ; barre de 4 px dessous (D-378). */
export function UsageMeter({ label, value, resetsAt, warnAt = USAGE_WARN_AT, dangerAt = USAGE_DANGER_AT }: UsageMeterProps) {
  const m = useMessages();
  const id = useId();
  const bounded = clampPercent(value);
  const tone = usageTone(bounded, warnAt, dangerAt);
  const { percent, valueText } = usageText(bounded, tone, m);
  const reset = resetsAt === undefined ? null : typeof resetsAt === "string" ? resetsAt : formatResetDate(resetsAt, m.locale);
  return (
    <div className="flex flex-col gap-1 font-sans" data-usage-meter>
      <div className="flex min-w-0 items-baseline gap-2 text-md">
        <span id={`${id}-label`} className="min-w-0 flex-1 truncate text-fg">
          {label}
        </span>
        <span className="flex shrink-0 gap-1.5 text-fg-2">
          {reset && <span>{m.usageResetsAt(reset)}</span>}
          {/* Le pourcentage est lu par la barre (`aria-valuetext`) : caché ici pour ne pas le lire deux fois. */}
          <span aria-hidden className="tabular-nums">
            {reset ? `· ${percent}` : percent}
          </span>
        </span>
      </div>
      <Meter
        aria-labelledby={`${id}-label`}
        value={bounded}
        minValue={0}
        maxValue={100}
        valueLabel={valueText}
        className="relative block h-1 overflow-hidden rounded-full bg-field"
      >
        <span
          data-usage-fill
          data-tone={tone}
          className={cx("absolute inset-y-0 left-0 rounded-full transition-[width] duration-(--dur-slow) ease-standard", USAGE_FILL[tone])}
          style={{ width: `${bounded}%` }}
        />
      </Meter>
    </div>
  );
}
