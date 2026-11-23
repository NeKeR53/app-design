/*
 * Statut : point et libellé (StatusBadge), ou point seul nommé (StatusDot).
 * Spec : StatusBadge.spec.md. Décisions : D-160, D-161, D-162.
 */
import { Focusable } from "react-aria-components/Focusable";
import { cx } from "../../lib/cx";
import { Tooltip } from "../Tooltip/Tooltip";

/** Ton d'un statut (D-161). `pending` : ce qui n'a pas commencé ; `warning` : un vrai avertissement. */
export type StatusTone = "neutral" | "pending" | "info" | "success" | "warning" | "danger";

const TONE: Record<StatusTone, string> = {
  neutral: "bg-fg-3",
  pending: "border-[1.5px] border-solid border-fg-3 bg-transparent",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

/** Point de 7 px, décoratif. Usage interne. */
export function Dot({ tone }: { tone: StatusTone }) {
  return <i aria-hidden className={cx("box-border inline-block size-[7px] shrink-0 rounded-full", TONE[tone])} />;
}

export interface StatusBadgeProps {
  /** Libellé visible de l'état (obligatoire : jamais une couleur seule). */
  children: string;
  tone?: StatusTone;
}

/** Statut : point coloré et libellé, sans fond (D-160). */
export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span className="inline-flex max-w-full min-w-0 shrink-0 items-center gap-1.5 font-sans text-xs whitespace-nowrap text-fg-2">
      <Dot tone={tone} />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

export interface StatusDotProps {
  /** Nom de l'état : nom accessible et texte de l'info-bulle (D-162). */
  label: string;
  tone?: StatusTone;
}

/** Point de statut seul, quand le libellé ne tient pas. Nommé, avec info-bulle au survol et au focus (D-162). */
export function StatusDot({ label, tone = "neutral" }: StatusDotProps) {
  return (
    <Tooltip content={label} placement="top">
      <Focusable>
        <span role="img" aria-label={label} tabIndex={0} className={cx("inline-grid size-6 shrink-0 cursor-default place-items-center rounded-sm align-middle outline-none", "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-accent focus-visible:outline-offset-1")}>
          <Dot tone={tone} />
        </span>
      </Focusable>
    </Tooltip>
  );
}
