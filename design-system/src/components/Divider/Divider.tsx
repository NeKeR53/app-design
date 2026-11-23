/*
 * Séparateur. Spec : Divider.spec.md. Décision : D-168.
 */
import { Separator } from "react-aria-components/Separator";
import { cx } from "../../lib/cx";

export interface DividerProps {
  /** Horizontal (entre deux groupes) ou vertical (entre deux éléments d'une barre). */
  orientation?: "horizontal" | "vertical";
}

/** Trait `--line` de 1 px (D-168). */
export function Divider({ orientation = "horizontal" }: DividerProps) {
  return (
    <Separator
      orientation={orientation}
      {...(orientation === "vertical" ? { elementType: "div" } : {})}
      className={cx(
        "shrink-0 border-0 bg-line",
        orientation === "horizontal" ? "my-3 h-px w-full" : "mx-0.5 w-px self-stretch",
      )}
    />
  );
}
