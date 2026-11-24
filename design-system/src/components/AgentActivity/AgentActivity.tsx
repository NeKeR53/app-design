/*
 * Travail de l'agent : une ligne par outil, groupe repliable. Spec : AgentActivity.spec.md. Décisions : D-376, D-384.
 * Repris des activités de l'app de référence : icône par type, verbe et objet, roue pendant l'exécution,
 * « Échec » en rouge qui reste visible, sortie de l'outil en lecture seule (2 à 12 lignes). Groupe au-delà de 3 (Chat-v1, Q7 A).
 * D-384 (AgentActivity-v2) : objet en lien (`onObjectPress`), pièces sous la sortie (`attachments`), état « Arrêté » (`stopped`).
 */
import { type ReactNode, useId, useState } from "react";
import { Button } from "react-aria-components/Button";
import { BookOpen, Brain, ChevronDown, Folder, Pencil, Search, SquareTerminal, Wrench } from "../../icons";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { Link } from "../Link/Link";

export type ActivityKind = "command" | "edit" | "search" | "read" | "list" | "think" | "other";
export type ActivityStatus = "running" | "done" | "error" | "stopped";

export interface AgentActivityProps {
  /** Type d'outil, qui choisit l'icône. Défaut : `other`. */
  kind?: ActivityKind;
  /** Verbe, au passé ou au présent : « Exécuté », « Modifié », « Lu ». */
  verb: string;
  /** Objet de l'action, en police à chasse fixe : commande, chemin, motif. */
  object?: string;
  /**
   * `running` : icône du type, « En cours » lu (pas de roue, D-391) ; `done` : icône du type ; `error` : « Échec » en `--danger` ;
   * `stopped` : outil interrompu, « Arrêté » en `--fg-3` (D-384). Défaut : `done`.
   */
  status?: ActivityStatus;
  /** Sortie de l'outil : la ligne devient repliable et montre ce texte en lecture seule. */
  detail?: string;
  /**
   * Ouvre l'objet (le fichier lu ou modifié) : l'objet devient un lien. Avec une sortie, un chevron à part
   * l'ouvre. Sans `object`, sans effet (D-384).
   */
  onObjectPress?: () => void;
  /**
   * Pièces produites par l'outil (vignettes d'image, `AttachmentChip`), sous le texte de la sortie.
   * La ligne devient repliable, comme avec `detail` (D-384).
   */
  attachments?: ReactNode;
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
  /**
   * Nombre d'outils au-delà duquel ils se groupent derrière le résumé. Défaut : 3. Avec 1, deux outils qui se suivent
   * forment déjà une ligne repliable (D-390) ; avec 0, même un outil seul (« 1 outil · 1 en cours », D-391).
   */
  groupAbove?: number;
}

/** Au-delà de ce nombre d'outils, ils se groupent derrière un résumé (Q7 A). */
export const GROUP_ABOVE = 3;

const ICONS = {
  command: SquareTerminal,
  edit: Pencil,
  search: Search,
  read: BookOpen,
  list: Folder,
  think: Brain,
  other: Wrench,
} as const;

/** Icônes de la ligne repliée : un type par outil appelé, dans l'ordre du premier appel, 6 au plus (D-394). */
const SUMMARY_ICONS = 6;

/** Ligne : 28 px de haut au moins, texte `--fs-sm` en `--fg-2`, icône de 15 px. */
const line = "flex min-h-7 min-w-0 items-center gap-2 py-0.5 text-sm text-fg-2";

function Label({ kind = "other", verb, object, status = "done", onObjectPress, linked }: AgentActivityProps & { linked: boolean }) {
  const m = useMessages();
  const Icon = ICONS[kind];
  const title = object ? `${verb} ${object}` : verb;
  return (
    <>
      {/* Pas de roue : WorkStatus montre déjà le travail en cours ; « En cours » est lu (D-391). */}
      <Icon size={15} />
      <span className="min-w-0 truncate" title={title}>
        {verb}
        {object && (
          <>
            {" "}
            <span className="font-mono">{linked && onObjectPress ? <Link onPress={onObjectPress}>{object}</Link> : object}</span>
          </>
        )}
      </span>
      {status === "error" ? (
        <span className="shrink-0 font-medium text-danger">{m.activityFailed}</span>
      ) : status === "stopped" ? (
        <span className="shrink-0 font-medium text-fg-3">{m.activityStopped}</span>
      ) : (
        <span className="sr-only">{status === "running" ? m.activityRunning : m.activityDone}</span>
      )}
    </>
  );
}

/** Sortie d'un outil : zone de texte en lecture seule, de 2 à 12 lignes, puis les pièces (D-384). */
function Output({ text, attachments, title, id }: { text: string | undefined; attachments: ReactNode; title: string; id: string }) {
  const m = useMessages();
  const rows = text ? Math.min(12, Math.max(2, text.split("\n").length)) : 0;
  return (
    <div id={id} className="mt-1 mb-3 flex flex-col gap-2">
      {text && (
        <textarea
          readOnly
          aria-label={m.activityDetail(title)}
          rows={rows}
          value={text}
          className={cx(
            "socle-box block max-h-[320px] w-full resize-none overflow-auto rounded-md border-0 bg-surface-side p-3 font-mono text-sm leading-[1.6] whitespace-pre-wrap text-fg [overflow-wrap:anywhere] [scrollbar-gutter:stable]",
            "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus focus-visible:outline-offset-2",
          )}
        />
      )}
      {attachments && (
        <div role="group" aria-label={m.activityAttachments(title)} data-activity-attachments="" className="flex min-w-0 flex-wrap gap-2">
          {attachments}
        </div>
      )}
    </div>
  );
}

const chevron = (open: boolean) => <ChevronDown size={12} className={cx("shrink-0 text-fg-3", !open && "-rotate-90")} />;

/** Un outil appelé par l'agent, sur une ligne ; avec `detail` ou `attachments`, la ligne s'ouvre sur sa sortie. */
export function AgentActivity(props: AgentActivityProps) {
  const m = useMessages();
  const { verb, object, detail, attachments, onObjectPress } = props;
  const [open, setOpen] = useState(false);
  const panel = useId();
  const title = object ? `${verb} ${object}` : verb;
  const text = detail?.trim() ? detail : undefined;
  const openable = Boolean(text || attachments);
  const linked = Boolean(object && onObjectPress);
  const label = <Label {...props} linked={linked} />;
  const toggle = { "aria-expanded": open, ...(open ? { "aria-controls": panel } : {}), onPress: () => setOpen(!open) };
  if (!openable || linked)
    return (
      <div data-activity={props.status ?? "done"} className="min-w-0 font-sans">
        <div className={line}>
          {label}
          {openable && (
            // L'objet est un lien : la sortie s'ouvre par un chevron à part, de 24 px (D-384, Q1 A).
            <Button
              {...toggle}
              aria-label={m.activityToggle(title)}
              className={cx(buttonReset, "-ms-1 inline-grid size-6 shrink-0 cursor-default place-items-center rounded-sm text-fg-3 data-hovered:bg-hover data-hovered:text-fg", focusRing)}
            >
              {chevron(open)}
            </Button>
          )}
        </div>
        {open && <Output id={panel} text={text} attachments={attachments} title={title} />}
      </div>
    );
  return (
    <div data-activity={props.status ?? "done"} className="min-w-0 font-sans">
      <Button {...toggle} className={cx(buttonReset, line, "-mx-0.5 max-w-full cursor-default rounded-sm px-0.5 text-start data-hovered:text-fg", focusRing)}>
        {label}
        {chevron(open)}
      </Button>
      {open && <Output id={panel} text={text} attachments={attachments} title={title} />}
    </div>
  );
}

/**
 * Suite d'outils. Jusqu'à 3, une ligne chacun ; au-delà, un résumé repliable
 * (« 5 outils exécutés · 1 en cours · 1 en échec · 1 arrêté »), déplié tant qu'un outil tourne.
 * Replié, un outil en échec reste visible sous le résumé.
 */
export function ActivityGroup({ items, defaultExpanded, groupAbove = GROUP_ABOVE }: ActivityGroupProps) {
  const m = useMessages();
  const panel = useId();
  const [choice, setChoice] = useState<boolean | undefined>(defaultExpanded);
  const running = items.filter((i) => i.status === "running").length;
  const failed = items.filter((i) => i.status === "error").length;
  const stopped = items.filter((i) => i.status === "stopped").length;
  if (items.length <= groupAbove)
    return (
      <div className="min-w-0">
        {items.map(({ id, ...item }) => (
          <AgentActivity key={id} {...item} />
        ))}
      </div>
    );
  const open = choice ?? running > 0;
  const summary = m.activityGroup(items.length, running, failed, stopped);
  return (
    <div data-activity-group="" className="min-w-0 font-sans">
      <Button
        aria-expanded={open}
        {...(open ? { "aria-controls": panel } : {})}
        onPress={() => setChoice(!open)}
        className={cx(buttonReset, line, "-mx-0.5 max-w-full cursor-default rounded-sm px-0.5 text-start data-hovered:text-fg", focusRing)}
      >
        <span aria-hidden="true" data-activity-kinds="" className="inline-flex shrink-0 items-center gap-1">
          {[...new Set(items.map((i) => i.kind ?? "other"))].slice(0, SUMMARY_ICONS).map((kind) => {
            const Icon = ICONS[kind];
            return <Icon key={kind} size={15} />;
          })}
        </span>
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
