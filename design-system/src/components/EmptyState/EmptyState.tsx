/*
 * État vide. Spec : EmptyState.spec.md. Décisions : D-166, D-413.
 */
import { useId, type ReactNode } from "react";
import { Button } from "react-aria-components/Button";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { Lock } from "../../icons";

/** Une piste pour commencer : une question d'exemple, une recherche fréquente (D-413). */
export interface EmptyStateSuggestion {
  id: string;
  /** Le texte proposé, tel qu'il sera envoyé : « Quelle est la durée de garantie ? ». */
  label: string;
  onPress: () => void;
}

export interface EmptyStateProps {
  /** Ce qui manque : « Aucun projet ». */
  title: ReactNode;
  /** Phrase d'explication ou de suite à donner ; peut contenir un `Link`. */
  description?: ReactNode;
  /** Icône de l'app, affichée en 32 px. Ignorée en taille `compact`. */
  icon?: ReactNode;
  /** Action principale : un `Button` variante `primary`. Une seule. */
  action?: ReactNode;
  /** Pistes pour commencer, sous la phrase (et sous l'action) : 4 au plus, les suivantes sont ignorées (D-413). */
  suggestions?: ReadonlyArray<EmptyStateSuggestion>;
  /** Nom du groupe de pistes. Défaut : « Suggestions » (i18n). */
  suggestionsLabel?: string;
  /** `compact` : sans icône, marges réduites, pour un panneau. */
  size?: "default" | "compact";
  /** `forbidden` : accès refusé, cadenas par défaut à la place de l'icône (D-351). */
  variant?: "empty" | "forbidden";
  /** Niveau du titre, selon la page : `h2` par défaut. L'apparence ne change pas. */
  headingLevel?: 2 | 3 | 4;
}

/** Nombre de pistes montrées au plus (D-413). */
export const EMPTY_SUGGESTIONS_MAX = 4;

/** Icône de 32 px en `--fg-3`, titre, phrase, action principale, pistes, au centre (D-166, D-413). */
export function EmptyState({
  title,
  description,
  icon: iconProp,
  action,
  suggestions,
  suggestionsLabel,
  size = "default",
  variant = "empty",
  headingLevel = 2,
}: EmptyStateProps) {
  const m = useMessages();
  const listId = useId();
  const compact = size === "compact";
  const forbidden = variant === "forbidden";
  // Accès refusé : cadenas, gardé aussi en taille `compact` (panneau de détail), en 20 px.
  const icon = iconProp ?? (forbidden ? <Lock /> : undefined);
  const Heading = `h${headingLevel}` as const;
  const shown = (suggestions ?? []).slice(0, EMPTY_SUGGESTIONS_MAX);
  return (
    <div className={cx("socle-box mx-auto flex max-w-[420px] flex-col items-center text-center font-sans text-fg-2", compact ? "px-3 py-5" : "px-4 py-14")}>
      {icon && (!compact || forbidden) && <span data-variant={variant} className={cx("text-fg-3", compact ? "mb-2 [&>svg]:size-5" : "mb-3 [&>svg]:size-8")}>{icon}</span>}
      <Heading className="m-0 text-[length:inherit] leading-[inherit] font-medium text-fg">{title}</Heading>
      {description && <p className={cx("m-0 mt-1 text-sm", !compact && action ? "mb-3.5" : "")}>{description}</p>}
      {action && <div className={cx(description ? "" : "mt-3.5", compact && "mt-2")}>{action}</div>}
      {shown.length > 0 && (
        <>
          <span id={listId} className="sr-only">
            {suggestionsLabel ?? m.suggestionsLabel}
          </span>
          <ul aria-labelledby={listId} data-empty-suggestions="" className={cx("m-0 flex w-full list-none flex-col gap-1.5 p-0", compact ? "mt-3" : "mt-5")}>
            {shown.map((s) => (
              <li key={s.id} className="flex">
                <Button
                  onPress={s.onPress}
                  className={cx(
                    buttonReset,
                    "w-full cursor-default rounded-md border border-line bg-surface px-3 py-2 text-left text-sm text-fg",
                    "data-hovered:bg-hover data-pressed:bg-selected",
                    focusRing,
                  )}
                >
                  {s.label}
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
