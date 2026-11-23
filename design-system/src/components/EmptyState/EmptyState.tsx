/*
 * État vide. Spec : EmptyState.spec.md. Décision : D-166.
 */
import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import { Lock } from "../../icons";

export interface EmptyStateProps {
  /** Ce qui manque : « Aucun projet ». */
  title: ReactNode;
  /** Phrase d'explication ou de suite à donner ; peut contenir un `Link`. */
  description?: ReactNode;
  /** Icône de l'app, affichée en 32 px. Ignorée en taille `compact`. */
  icon?: ReactNode;
  /** Action principale : un `Button` variante `primary`. Une seule. */
  action?: ReactNode;
  /** `compact` : sans icône, marges réduites, pour un panneau. */
  size?: "default" | "compact";
  /** `forbidden` : accès refusé, cadenas par défaut à la place de l'icône (D-351). */
  variant?: "empty" | "forbidden";
  /** Niveau du titre, selon la page : `h2` par défaut. L'apparence ne change pas. */
  headingLevel?: 2 | 3 | 4;
}

/** Icône de 32 px en `--fg-3`, titre, phrase, action principale, au centre (D-166). */
export function EmptyState({ title, description, icon: iconProp, action, size = "default", variant = "empty", headingLevel = 2 }: EmptyStateProps) {
  const compact = size === "compact";
  const forbidden = variant === "forbidden";
  // Accès refusé : cadenas, gardé aussi en taille `compact` (panneau de détail), en 20 px.
  const icon = iconProp ?? (forbidden ? <Lock /> : undefined);
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={cx("socle-box mx-auto flex max-w-[420px] flex-col items-center text-center font-sans text-fg-2", compact ? "px-3 py-5" : "px-4 py-14")}>
      {icon && (!compact || forbidden) && <span data-variant={variant} className={cx("text-fg-3", compact ? "mb-2 [&>svg]:size-5" : "mb-3 [&>svg]:size-8")}>{icon}</span>}
      <Heading className="m-0 text-[length:inherit] leading-[inherit] font-medium text-fg">{title}</Heading>
      {description && <p className={cx("m-0 mt-1 text-sm", !compact && action ? "mb-3.5" : "")}>{description}</p>}
      {action && <div className={cx(description ? "" : "mt-3.5", compact && "mt-2")}>{action}</div>}
    </div>
  );
}
