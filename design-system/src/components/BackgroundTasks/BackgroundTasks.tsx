/*
 * Tâches de fond d'un agent ou d'un processus. Spec : BackgroundTasks.spec.md. Décision : D-401.
 * Une ligne par tâche en cours (icône du type, libellé coupé, durée qui avance, bouton d'arrêt toujours visible),
 * puis une ligne de résumé des tâches finies, les échecs en `--danger`.
 */
import { type ReactNode, useEffect, useState } from "react";
import { Bot, SquareTerminal, Square, Wrench } from "../../icons";
import { TruncatedText } from "../../lib/truncated";
import { useMessages } from "../../provider/SocleProvider";
import { elapsedSeconds } from "../AgentActivity/WorkStatus";
import { IconButton } from "../IconButton/IconButton";

export type BackgroundTaskKind = "command" | "agent" | "other";

export interface BackgroundTask {
  /** Identifiant stable. */
  id: string;
  /** Libellé : la commande, la description du sous-agent. Coupé sur une ligne, texte complet en info-bulle. */
  title: string;
  /** Type, qui choisit l'icône : `command` (terminal), `agent` (robot), `other` (outil). Défaut : `other`. */
  kind?: BackgroundTaskKind;
  /** Début de la tâche (horodatage en ms ou date) : sert à la durée, mise à jour chaque seconde. */
  startedAt: number | Date;
  /**
   * Arrête la tâche : bouton carré toujours visible. Une promesse garde le bouton en attente jusqu'à sa fin.
   * Sans fonction, pas de bouton (l'app ne sait pas arrêter cette tâche).
   */
  onStop?: () => void | Promise<unknown>;
}

export interface BackgroundTasksProps {
  /** Tâches en cours, dans l'ordre de lancement. */
  tasks: readonly BackgroundTask[];
  /** Tâches finies, échecs compris. Défaut : 0. */
  finished?: number;
  /** Tâches finies en échec. Défaut : 0. */
  failed?: number;
  /** Nom accessible de la liste. Défaut : « Tâches en arrière-plan ». */
  label?: string;
}

const ICONS = { command: SquareTerminal, agent: Bot, other: Wrench } as const;

function useNow(active: boolean) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

function TaskRow({ task, now }: { task: BackgroundTask; now: number }) {
  const m = useMessages();
  const [stopping, setStopping] = useState(false);
  const Icon = ICONS[task.kind ?? "other"];
  const stop = task.onStop;
  const press = () => {
    if (!stop) return;
    const result = stop();
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setStopping(true);
      (result as Promise<unknown>).then(
        () => setStopping(false),
        () => setStopping(false),
      );
    }
  };
  return (
    <li className="flex min-h-(--row-h) min-w-0 items-center gap-2 text-md text-fg">
      <Icon size={16} className="shrink-0 text-fg-2" />
      <TruncatedText text={task.title} textClass="min-w-0 flex-1 truncate" />
      {/* `timer` : non annoncé à chaque seconde, lisible à la demande. */}
      <span role="timer" className="shrink-0 text-sm text-fg-3 tabular-nums">
        {m.workDuration(elapsedSeconds(task.startedAt, now))}
      </span>
      {stop ? <IconButton icon={<Square size={14} />} label={m.taskStop(task.title)} onPress={press} isPending={stopping} /> : null}
    </li>
  );
}

export function BackgroundTasks({ tasks, finished = 0, failed = 0, label }: BackgroundTasksProps): ReactNode {
  const m = useMessages();
  const now = useNow(tasks.length > 0);
  if (!tasks.length && !finished) return <p className="text-md text-fg-3">{m.tasksEmpty}</p>;
  return (
    <div className="flex min-w-0 flex-col">
      {tasks.length ? (
        <ul aria-label={label ?? m.tasksLabel} className="flex min-w-0 flex-col">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} now={now} />
          ))}
        </ul>
      ) : null}
      {finished ? (
        <p className="flex min-h-(--row-h) items-center justify-between gap-2 text-sm text-fg-3">
          <span>{m.tasksFinished(finished)}</span>
          {failed ? <span className="font-medium text-danger">{m.tasksFailed(failed)}</span> : null}
        </p>
      ) : null}
    </div>
  );
}
