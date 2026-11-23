/*
 * Résumé du travail d'un tour terminé. Spec : WorkSummary.spec.md. Décision : D-376.
 * Repris de l'app de référence : « A travaillé pendant 42 s · 4 outils appelés », replié ; il s'ouvre sur les outils.
 * La réponse de l'agent reste hors du résumé, visible.
 */
import type { ReactNode } from "react";
import { useMessages } from "../../provider/SocleProvider";
import { Accordion } from "../Accordion/Accordion";

export interface WorkSummaryProps {
  /** Durée du travail, en millisecondes. */
  durationMs: number;
  /** Nombre d'outils appelés pendant le tour. */
  toolCount: number;
  /** Travail replié : `ActivityGroup`, `AgentActivity`, messages intermédiaires. Sans contenu, le résumé est un simple texte. */
  children?: ReactNode;
  /** Déplié au premier affichage. Défaut : replié. */
  defaultExpanded?: boolean;
}

export function WorkSummary({ durationMs, toolCount, children, defaultExpanded = false }: WorkSummaryProps) {
  const m = useMessages();
  const title = m.workSummary(m.workDuration(Math.max(0, Math.round(durationMs / 1000))), toolCount);
  if (children === undefined || children === null || children === false)
    return <p className="m-0 py-1 font-sans text-sm text-fg-3">{title}</p>;
  return (
    <div className="py-1">
      <Accordion title={title} defaultExpanded={defaultExpanded}>
        {children}
      </Accordion>
    </div>
  );
}
