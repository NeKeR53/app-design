/*
 * Ligne d'état du travail en cours. Spec : WorkStatus.spec.md. Décision : D-376.
 * Reprise de l'app de référence : roue, libellé de l'étape, temps écoulé à la seconde.
 * Seul le libellé est annoncé (poliment) ; le temps écoulé n'est pas lu à chaque seconde.
 */
import { useEffect, useState } from "react";
import { useMessages } from "../../provider/SocleProvider";
import { Spinner } from "../Spinner/Spinner";

export type WorkPhase = "thinking" | "tool" | "writing" | "approval" | "working";

export interface WorkStatusProps {
  /**
   * Étape : `thinking` « Réflexion en cours », `tool` « Outil en cours : X », `writing` « Rédaction en cours »,
   * `approval` « Autorisation requise », `working` « Travail en cours » (défaut).
   */
  phase?: WorkPhase;
  /** Nom de l'outil, pour `phase="tool"` : une commande, un nom d'outil. */
  toolName?: string;
  /** Libellé propre à l'app ; remplace celui de `phase`. */
  label?: string;
  /** Début du travail (horodatage en ms ou date) : sert au temps écoulé. */
  startedAt: number | Date;
}

/** Secondes entières écoulées depuis `start`. */
export function elapsedSeconds(start: number | Date, now: number): number {
  return Math.max(0, Math.floor((now - (typeof start === "number" ? start : start.getTime())) / 1000));
}

export function WorkStatus({ phase = "working", toolName, label, startedAt }: WorkStatusProps) {
  const m = useMessages();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const text =
    label ??
    (phase === "thinking"
      ? m.workThinking
      : phase === "tool"
        ? m.workTool(toolName ?? "")
        : phase === "writing"
          ? m.workWriting
          : phase === "approval"
            ? m.workApproval
            : m.workWorking);
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 py-3 font-sans text-md text-fg-2 tabular-nums">
      <Spinner size="sm" decorative />
      {/* Région polie : seul le libellé y est, il est lu quand il change. */}
      <span role="status" className="min-w-0 [overflow-wrap:anywhere]">
        {text}
      </span>
      <span aria-hidden="true">·</span>
      {/* `timer` : non annoncé par défaut, lisible à la demande. */}
      <span role="timer">{m.workSince(m.workDuration(elapsedSeconds(startedAt, now)))}</span>
    </div>
  );
}
