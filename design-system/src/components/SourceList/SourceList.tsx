/*
 * Sources citées par une réponse (D-411). Spec : SourceList.spec.md.
 * Une puce numérotée par source : numéro, titre coupé, détail (page) ; le passage cité en info-bulle.
 * Un clic ouvre la source ; la source montrée en ce moment est marquée.
 */
import { useId } from "react";
import { Button } from "react-aria-components/Button";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { Tooltip } from "../Tooltip/Tooltip";

export interface SourceItem {
  /** Identifiant stable de la source. */
  id: string;
  /** Nom de la source : titre du document, de la page. */
  title: string;
  /** Où, dans la source : « p. 12 », « § 3 ». Court. */
  detail?: string;
  /** Passage cité, en info-bulle ; coupé au-delà de 200 caractères. */
  excerpt?: string;
}

export interface SourceListProps {
  /** Les sources, dans l'ordre où la réponse les cite : la première porte le numéro 1. */
  sources: ReadonlyArray<SourceItem>;
  /** Ouvre la source : le document à la bonne page, la page citée. Sans lui, les puces ne sont pas cliquables. */
  onOpen?: (source: SourceItem, index: number) => void;
  /** Source montrée en ce moment (dans le panneau de détail) : marquée, `aria-current`. */
  currentId?: string | null;
  /** Nom de la liste, affiché devant les puces. Défaut : « Sources » (i18n). */
  label?: string;
}

/** Longueur au-delà de laquelle le passage de l'info-bulle est coupé. */
const EXCERPT_MAX = 200;

const CHIP = "inline-flex h-7 max-w-[min(100%,320px)] min-w-0 items-center gap-1.5 rounded-md border pr-2 pl-1 text-sm text-fg";

function cut(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > EXCERPT_MAX ? `${clean.slice(0, EXCERPT_MAX - 1).trimEnd()}…` : clean;
}

/** Puces des sources citées, sous une réponse (D-411). */
export function SourceList({ sources, onOpen, currentId, label }: SourceListProps) {
  const m = useMessages();
  const labelId = useId();
  if (sources.length === 0) return null;
  return (
    <div className="socle-box flex min-w-0 items-start gap-2 font-sans text-sm" data-source-list="">
      <span id={labelId} className="shrink-0 leading-7 text-fg-3">
        {label ?? m.sourcesLabel}
      </span>
      <ul aria-labelledby={labelId} className="m-0 flex min-w-0 flex-1 list-none flex-wrap gap-1.5 p-0">
        {sources.map((source, index) => {
          const n = index + 1;
          const current = currentId != null && source.id === currentId;
          const body = (
            <>
              <span
                aria-hidden
                className="inline-grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-sm bg-surface px-1 text-xs font-medium text-fg-2 tabular-nums"
              >
                {n}
              </span>
              <span className="min-w-0 truncate">{source.title}</span>
              {source.detail && <span className="shrink-0 text-fg-3 tabular-nums">{source.detail}</span>}
            </>
          );
          const name = m.sourceName(n, source.title, source.detail);
          return (
            <li key={source.id} className="flex max-w-full min-w-0" data-source={n}>
              {onOpen ? (
                <Tooltip
                  content={source.detail ? `${source.title} · ${source.detail}` : source.title}
                  {...(source.excerpt ? { description: `« ${cut(source.excerpt)} »` } : {})}
                  placement="top"
                >
                  <Button
                    aria-label={name}
                    {...(current ? { "aria-current": "true" as const } : {})}
                    data-current={current || undefined}
                    onPress={() => onOpen(source, index)}
                    className={cx(
                      buttonReset,
                      CHIP,
                      "cursor-default",
                      current ? "border-line-strong bg-selected" : "border-line bg-surface-side data-hovered:bg-hover data-pressed:bg-selected",
                      focusRing,
                    )}
                  >
                    {body}
                  </Button>
                </Tooltip>
              ) : (
                // Sans `onOpen` : une puce lue telle quelle, son nom complet pour le lecteur d'écran.
                <span className={cx(CHIP, "border-line bg-surface-side")}>
                  <span className="sr-only">{name}</span>
                  <span aria-hidden className="contents">
                    {body}
                  </span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
