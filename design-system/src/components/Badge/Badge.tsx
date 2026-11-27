/*
 * Statut : point et libellé (Badge), ou point seul nommé (BadgeDot).
 * Spec : Badge.spec.md. Décisions : D-160, D-161, D-162.
 */
import { createContext, useContext } from "react";
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

export interface BadgeProps {
  /** Libellé visible de l'état (obligatoire : jamais une couleur seule). */
  children: string;
  tone?: StatusTone;
}

/** Statut : point coloré et libellé, sans fond (D-160). */
export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className="inline-flex max-w-full min-w-0 shrink-0 items-center gap-1.5 font-sans text-xs whitespace-nowrap text-fg-2">
      <Dot tone={tone} />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

export interface BadgeDotProps {
  /** Nom de l'état : nom accessible et texte de l'info-bulle (D-162). */
  label: string;
  tone?: StatusTone;
}

/**
 * Vrai dans une grille (Table) : un seul arrêt de tabulation pour toute la grille, les flèches
 * se déplacent de case en case. Usage interne.
 */
export const InGridContext = createContext(false);

/** Point de statut seul, quand le libellé ne tient pas. Nommé, avec info-bulle au survol et au focus (D-162). */
export function BadgeDot({ label, tone = "neutral" }: BadgeDotProps) {
  // Dans une grille, le point sort de l'ordre de tabulation : les flèches l'atteignent avec sa
  // case, qui lui passe le focus, et l'info-bulle s'ouvre. Son nom reste celui de l'image.
  const inGrid = useContext(InGridContext);
  return (
    <Tooltip content={label} placement="top">
      <Focusable>
        <span role="img" aria-label={label} tabIndex={inGrid ? -1 : 0} className={cx("inline-grid size-6 shrink-0 cursor-default place-items-center rounded-sm align-middle outline-none", "focus-visible:outline-2 focus-visible:outline-solid outline-focus focus-visible:outline-offset-1")}>
          <Dot tone={tone} />
        </span>
      </Focusable>
    </Tooltip>
  );
}
