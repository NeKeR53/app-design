/*
 * État vide. Spec : EmptyState.spec.md. Décision : D-166.
 */
import type { ReactNode } from "react";
import { cx } from "../../lib/cx";

export interface EmptyStateProps {
  /** Ce qui manque : « Aucun projet ». */
  title: ReactNode;
  /** Phrase d'explication ou de suite à donner. */
  description?: string;
  /** Icône de l'app, affichée en 32 px. Ignorée en taille `compact`. */
  icon?: ReactNode;
  /** Action principale : un `Button` variante `primary`. Une seule. */
  action?: ReactNode;
  /** `compact` : sans icône, marges réduites, pour un panneau. */
  size?: "default" | "compact";
}

/** Icône de 32 px en `--fg-3`, titre, phrase, action principale, au centre (D-166). */
export function EmptyState({ title, description, icon, action, size = "default" }: EmptyStateProps) {
  const compact = size === "compact";
  return (
    <div className={cx("socle-box mx-auto flex max-w-[420px] flex-col items-center text-center font-sans text-fg-2", compact ? "px-3 py-5" : "px-4 py-14")}>
      {icon && !compact && <span className="mb-3 text-fg-3 [&>svg]:size-8">{icon}</span>}
      <div className="font-medium text-fg">{title}</div>
      {description && <p className={cx("m-0 mt-1 text-sm", !compact && action ? "mb-3.5" : "")}>{description}</p>}
      {action && <div className={cx(description ? "" : "mt-3.5", compact && "mt-2")}>{action}</div>}
    </div>
  );
}
