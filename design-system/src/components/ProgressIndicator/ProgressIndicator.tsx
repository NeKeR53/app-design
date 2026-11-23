/*
 * Étapes numérotées d'un parcours. Spec : ProgressIndicator.spec.md.
 * Décisions : D-325 (anatomie, quatre états), D-326 (retour en arrière, largeur étroite).
 */
import { useEffect, useRef } from "react";
import { Button } from "react-aria-components/Button";
import { useMessages } from "../../provider/SocleProvider";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { Check } from "../../icons";

export type StepStatus = "todo" | "current" | "done" | "error";

export interface StepItem {
  id: string;
  title: string;
  /** Aide courte sous le titre. */
  description?: string;
  /** État imposé ; sans lui, l'état vient de `current` (D-325). */
  status?: StepStatus;
}

export interface ProgressIndicatorProps {
  /** Nom de la liste (« Étapes de l'installation »). */
  label: string;
  steps: readonly StepItem[];
  /** Étape en cours : les précédentes sont faites, les suivantes à faire. */
  current: string;
  /** Rend cliquables les étapes faites ou en erreur, pour y revenir (D-326). */
  onSelect?: (id: string) => void;
  orientation?: "horizontal" | "vertical";
}

/** État d'une étape : imposé, sinon déduit de sa place par rapport à l'étape en cours. */
export function stepStatus(steps: readonly StepItem[], current: string, index: number): StepStatus {
  const own = steps[index]?.status;
  if (own) return own;
  const at = steps.findIndex((s) => s.id === current);
  return index < at ? "done" : index === at ? "current" : "todo";
}

const markClass: Record<StepStatus, string> = {
  todo: "border-line-strong text-fg-3",
  current: "border-primary bg-primary text-primary-fg",
  done: "border-success text-success",
  error: "border-danger bg-danger text-danger-fg",
};

const titleClass: Record<StepStatus, string> = {
  todo: "text-fg-2",
  current: "text-fg",
  done: "text-fg-2",
  error: "text-danger",
};

export function ProgressIndicator({ label, steps, current, onSelect, orientation = "horizontal" }: ProgressIndicatorProps) {
  const m = useMessages();
  const vertical = orientation === "vertical";
  // Retour à une étape : le bouton cliqué devient l'étape en cours (un simple texte) ;
  // le focus irait sur `body`. On le pose sur l'étape en cours pour garder la place au clavier.
  const refocus = useRef(false);
  const currentRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    const active = document.activeElement;
    if (!active || active === document.body || !active.isConnected) currentRef.current?.focus();
  });
  return (
    <ol
      aria-label={label}
      data-orientation={orientation}
      className={cx("socle-box m-0 flex list-none p-0 font-sans text-md", vertical ? "flex-col" : "@container items-center")}
    >
      {steps.map((step, i) => {
        const status = stepStatus(steps, current, i);
        const clickable = Boolean(onSelect) && (status === "done" || status === "error");
        const content = (
          <>
            <span
              aria-hidden
              className={cx("inline-grid size-[22px] shrink-0 place-items-center rounded-full border text-xs font-semibold", markClass[status])}
            >
              {status === "done" ? <Check size={13} /> : status === "error" ? "!" : i + 1}
            </span>
            <span
              className={cx(
                "flex min-w-0 flex-col",
                // Sous 380 px, seul le titre de l'étape en cours reste visible (D-326) ;
                // les autres restent lus par les lecteurs d'écran (nom du bouton, « (fait) »).
                !vertical && status !== "current" && "@max-[380px]:sr-only",
              )}
            >
              <span className={cx("truncate", status === "current" ? "font-medium" : "", titleClass[status])}>
                {step.title}
                {status === "done" && <span className="sr-only"> ({m.stepDone})</span>}
                {status === "error" && <span className="sr-only"> ({m.stepError})</span>}
              </span>
              {step.description && (
                <span className={cx("truncate text-sm text-fg-3", !vertical && "@max-[560px]:hidden")}>{step.description}</span>
              )}
            </span>
          </>
        );
        const itemClass = "-mx-1.5 flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1 text-left";
        return (
          <li
            key={step.id}
            aria-current={status === "current" ? "step" : undefined}
            className={cx(
              "flex min-w-0",
              vertical ? "flex-col" : "items-center",
              !vertical && i > 0 && "flex-1",
              // Trait entre deux étapes (D-325).
              i > 0 && (vertical
                ? "before:ml-[11px] before:h-3 before:w-px before:bg-line-strong"
                : "before:mx-2 before:h-px before:min-w-3 before:flex-1 before:basis-6 before:bg-line-strong"),
            )}
          >
            {clickable ? (
              <Button
                onPress={() => {
                  refocus.current = true;
                  onSelect?.(step.id);
                }}
                className={cx(buttonReset, itemClass, "cursor-pointer data-hovered:bg-hover", focusRing)}>
                {content}
              </Button>
            ) : (
              <span
                ref={status === "current" ? currentRef : undefined}
                tabIndex={status === "current" ? -1 : undefined}
                className={cx(
                  itemClass,
                  // Même anneau que focusRing, sur :focus-visible (élément sans React Aria).
                  "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus focus-visible:outline-offset-1",
                )}
              >
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
