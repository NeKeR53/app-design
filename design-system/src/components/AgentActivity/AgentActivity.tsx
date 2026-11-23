/*
 * Travail de l'agent : une ligne par outil, groupe repliable. Spec : AgentActivity.spec.md. Décision : D-376.
 * Repris des activités de l'app de référence : icône par type, verbe et objet, roue pendant l'exécution,
 * « Échec » en rouge qui reste visible, sortie de l'outil en lecture seule (2 à 12 lignes). Groupe au-delà de 3 (Chat-v1, Q7 A).
 */
import { useId, useState } from "react";
import { Button } from "react-aria-components/Button";
import { BookOpen, Brain, ChevronDown, Pencil, Search, SquareTerminal, Wrench } from "../../icons";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { Spinner } from "../Spinner/Spinner";

export type ActivityKind = "command" | "edit" | "search" | "read" | "think" | "other";
export type ActivityStatus = "running" | "done" | "error";

export interface AgentActivityProps {
  /** Type d'outil, qui choisit l'icône. Défaut : `other`. */
  kind?: ActivityKind;
  /** Verbe, au passé ou au présent : « Exécuté », « Modifié », « Lu ». */
  verb: string;
  /** Objet de l'action, en police à chasse fixe : commande, chemin, motif. */
  object?: string;
  /** `running` : roue ; `done` : icône du type ; `error` : « Échec » en `--danger`. Défaut : `done`. */
  status?: ActivityStatus;
  /** Sortie de l'outil : la ligne devient repliable et montre ce texte en lecture seule. */
  detail?: string;
}

/** Outil d'un groupe : mêmes champs qu'une ligne, avec un identifiant stable. */
export interface ActivityItem extends AgentActivityProps {
  id: string;
}

export interface ActivityGroupProps {
  /** Outils, dans l'ordre d'exécution. */
  items: ActivityItem[];
  /** Déplié par défaut. Défaut : déplié tant qu'un outil tourne, replié ensuite. */
  defaultExpanded?: boolean;
}

/** Au-delà de ce nombre d'outils, ils se groupent derrière un résumé (Q7 A). */
export const GROUP_ABOVE = 3;

const ICONS = { command: SquareTerminal, edit: Pencil, search: Search, read: BookOpen, think: Brain, other: Wrench } as const;

/** Ligne : 28 px de haut au moins, texte `--fs-sm` en `--fg-2`, icône de 15 px. */
const line = "flex min-h-7 min-w-0 items-center gap-2 py-0.5 text-sm text-fg-2";

function Label({ kind = "other", verb, object, status = "done" }: AgentActivityProps) {
  const m = useMessages();
  const Icon = ICONS[kind];
  const title = object ? `${verb} ${object}` : verb;
  return (
    <>
      {status === "running" ? (
        <span className="inline-grid size-[15px] shrink-0 place-items-center">
          <Spinner size="sm" decorative />
        </span>
      ) : (
        <Icon size={15} />
      )}
      <span className="min-w-0 truncate" title={title}>
        {verb}
        {object && (
          <>
            {" "}
            <span className="font-mono">{object}</span>
          </>
        )}
      </span>
      {status === "error" ? (
        <span className="shrink-0 font-medium text-danger">{m.activityFailed}</span>
      ) : (
        <span className="sr-only">{status === "running" ? m.activityRunning : m.activityDone}</span>
      )}
    </>
  );
}

/** Sortie d'un outil : zone de texte en lecture seule, de 2 à 12 lignes. */
function Output({ text, title }: { text: string; title: string }) {
  const m = useMessages();
  const rows = Math.min(12, Math.max(2, text.split("\n").length));
  return (
    <textarea
      readOnly
      aria-label={m.activityDetail(title)}
      rows={rows}
      value={text}
      className={cx(
        "socle-box mt-1 mb-3 block max-h-[320px] w-full resize-none overflow-auto rounded-md border-0 bg-surface-side p-3 font-mono text-sm leading-[1.6] whitespace-pre-wrap text-fg [overflow-wrap:anywhere] [scrollbar-gutter:stable]",
        "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus focus-visible:outline-offset-2",
      )}
    />
  );
}

/** Un outil appelé par l'agent, sur une ligne ; avec `detail`, la ligne s'ouvre sur sa sortie. */
export function AgentActivity(props: AgentActivityProps) {
  const { verb, object, detail } = props;
  const [open, setOpen] = useState(false);
  const panel = useId();
  const title = object ? `${verb} ${object}` : verb;
  if (!detail?.trim())
    return (
      <div data-activity={props.status ?? "done"} className={cx("font-sans", line)}>
        <Label {...props} />
      </div>
    );
  return (
    <div data-activity={props.status ?? "done"} className="min-w-0 font-sans">
      <Button
        aria-expanded={open}
        {...(open ? { "aria-controls": panel } : {})}
        onPress={() => setOpen(!open)}
        className={cx(buttonReset, line, "-mx-0.5 max-w-full cursor-default rounded-sm px-0.5 text-start data-hovered:text-fg", focusRing)}
      >
        <Label {...props} />
        <ChevronDown size={12} className={cx("shrink-0 text-fg-3", !open && "-rotate-90")} />
      </Button>
      {open && (
        <div id={panel}>
          <Output text={detail} title={title} />
        </div>
      )}
    </div>
  );
}

/**
 * Suite d'outils. Jusqu'à 3, une ligne chacun ; au-delà, un résumé repliable
 * (« 5 outils exécutés · 1 en cours · 1 en échec »), déplié tant qu'un outil tourne.
 * Replié, un outil en échec reste visible sous le résumé.
 */
export function ActivityGroup({ items, defaultExpanded }: ActivityGroupProps) {
  const m = useMessages();
  const panel = useId();
  const [choice, setChoice] = useState<boolean | undefined>(defaultExpanded);
  const running = items.filter((i) => i.status === "running").length;
  const failed = items.filter((i) => i.status === "error").length;
  if (items.length <= GROUP_ABOVE)
    return (
      <div className="min-w-0">
        {items.map(({ id, ...item }) => (
          <AgentActivity key={id} {...item} />
        ))}
      </div>
    );
  const open = choice ?? running > 0;
  const summary = m.activityGroup(items.length, running, failed);
  return (
    <div data-activity-group="" className="min-w-0 font-sans">
      <Button
        aria-expanded={open}
        {...(open ? { "aria-controls": panel } : {})}
        onPress={() => setChoice(!open)}
        className={cx(buttonReset, line, "-mx-0.5 max-w-full cursor-default rounded-sm px-0.5 text-start data-hovered:text-fg", focusRing)}
      >
        {running > 0 && <Spinner size="sm" decorative />}
        <span className={cx("min-w-0 truncate", failed > 0 && !open && "text-danger")}>{summary}</span>
        <ChevronDown size={12} className={cx("shrink-0 text-fg-3", !open && "-rotate-90")} />
      </Button>
      {open ? (
        <ol id={panel} aria-label={summary} className="m-0 max-h-[280px] list-none overflow-y-auto overscroll-contain p-0 ps-1">
          {items.map(({ id, ...item }) => (
            <li key={id}>
              <AgentActivity {...item} />
            </li>
          ))}
        </ol>
      ) : (
        failed > 0 && (
          <ol className="m-0 list-none p-0 ps-1">
            {items
              .filter((i) => i.status === "error")
              .map(({ id, ...item }) => (
                <li key={id}>
                  <AgentActivity {...item} />
                </li>
              ))}
          </ol>
        )
      )}
    </div>
  );
}
