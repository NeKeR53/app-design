/*
 * Barre de progression. Spec : ProgressBar.spec.md. Décision : D-164.
 */
import { ProgressBar as RACProgressBar } from "react-aria-components/ProgressBar";
import { cx } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";

export interface ProgressBarProps {
  /** Ce qui avance : « Import des contacts », « Espace utilisé ». Affiché au-dessus de la barre. */
  label: string;
  /** Valeur courante. Sans valeur, la barre est indéterminée. */
  value?: number;
  /** Valeur maximale (100 par défaut : la valeur s'affiche en pourcentage). */
  max?: number;
  /** Affiche la valeur à droite du libellé. */
  showValue?: boolean;
  /** Ton du remplissage, pour un seuil franchi. */
  tone?: "accent" | "warning" | "danger";
}

const FILL = { accent: "bg-accent", warning: "bg-warning", danger: "bg-danger" } as const;

/** Rail de 4 px, libellé au-dessus, valeur à droite (D-164). */
export function ProgressBar({ label, value, max = 100, showValue = true, tone = "accent" }: ProgressBarProps) {
  const m = useMessages();
  const indeterminate = value === undefined;
  const bounded = indeterminate ? 0 : Math.min(Math.max(0, value), max);
  const fraction = max === 100 ? null : `${bounded} / ${max}`;
  return (
    <RACProgressBar
      aria-label={label}
      isIndeterminate={indeterminate}
      {...(indeterminate ? {} : { value: bounded, maxValue: max })}
      {...(fraction ? { valueLabel: m.progressOf(String(bounded), String(max)) } : {})}
      className="flex w-full flex-col gap-1 font-sans"
    >
      {({ percentage, valueText }) => (
        <>
          <span className="flex min-w-0 justify-between gap-2 text-sm text-fg-2">
            <span className="min-w-0 truncate">{label}</span>
            {showValue && !indeterminate && <span className="shrink-0 text-fg-3 tabular-nums">{fraction ?? valueText}</span>}
          </span>
          <span className="relative block h-1 overflow-hidden rounded-full bg-field">
            {indeterminate ? (
              <span className={cx("socle-reload absolute inset-y-0 w-[30%] rounded-full", FILL[tone])} />
            ) : (
              <span className={cx("absolute inset-y-0 left-0 rounded-full transition-[width] duration-(--dur-slow) ease-standard", FILL[tone])} style={{ width: `${percentage ?? 0}%` }} />
            )}
          </span>
        </>
      )}
    </RACProgressBar>
  );
}
