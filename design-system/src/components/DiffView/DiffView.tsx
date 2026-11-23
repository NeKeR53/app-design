/*
 * Différences entre deux textes, ou lecture d'un diff unifié. Repris d'Alfred (src/ui/components/DiffView.tsx).
 * Spec : DiffView.spec.md. Décisions : D-290 à D-299. Styles : `.socle-diff` dans styles.css.
 */
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Toolbar } from "react-aria-components/Toolbar";
import { ChevronDown, ChevronUp, Columns, UnfoldVertical } from "../../icons";
import type { SocleMessages } from "../../i18n/messages";
import { cx } from "../../lib/cx";
import { useMedia } from "../../lib/media";
import { useMessages } from "../../provider/SocleProvider";
import { Button } from "../Button/Button";
import { EmptyState } from "../EmptyState/EmptyState";
import { IconButton } from "../IconButton/IconButton";
import { type DiffFile, type DiffLine, diffTexts, type Eol, parsePatch, type Range, wordChanges } from "./diffModel";

export type DiffViewMode = "split" | "unified";

export interface DiffViewProps {
  /** Nom accessible de la zone du diff : « Modifications de server.ts ». */
  label: string;
  /** Texte d'avant, comparé à `after`. */
  before?: string;
  /** Texte d'après. */
  after?: string;
  /** Nom du fichier, affiché dans l'en-tête (avec `before` et `after`). */
  fileName?: string;
  /** Diff unifié (`git diff`, `diff -u`), un ou plusieurs fichiers ; remplace `before` et `after`. */
  patch?: string;
  /** Le diff a été coupé : un avis le dit à la fin (D-299). */
  truncated?: boolean;
  /** Vue contrôlée. */
  mode?: DiffViewMode;
  /** Vue de départ, non contrôlée. Défaut : côte à côte (D-291). */
  defaultMode?: DiffViewMode;
  onModeChange?: (mode: DiffViewMode) => void;
  /** Lignes inchangées gardées autour d'un changement (D-295). Défaut : 3. */
  context?: number;
  /** Prend la hauteur de son conteneur, au lieu de 720 px au plus (D-298). */
  fill?: boolean;
}

/** Hauteur de chaque sorte de rangée, en pixels (D-298) ; styles.css fixe les mêmes. */
const ROW_HEIGHT = { line: 20, pair: 20, gap: 32, file: 32, notice: 32 } as const;
const OVERSCAN = 12;
/** Hauteur supposée quand la zone n'est pas mesurable (rendu hors écran). */
const FALLBACK_VIEWPORT = 720;

type Side = { line: DiffLine; pair?: DiffLine | undefined };
type Row =
  | { type: "file"; key: string; file: DiffFile }
  | { type: "notice"; key: string; text: string }
  | { type: "gap"; key: string; count: number; oldStart: number; expandable: boolean; foldKey: string }
  | { type: "line"; key: string; line: DiffLine; pair?: DiffLine | undefined; change?: number }
  | { type: "pair"; key: string; left?: Side | undefined; right?: Side | undefined; change?: number };

interface Change {
  row: number;
  oldFrom?: number | undefined;
  oldTo?: number | undefined;
  newFrom?: number | undefined;
  newTo?: number | undefined;
}

const EOL_LABEL: Record<Exclude<Eol, "none">, string> = { lf: "LF", crlf: "CRLF" };
const eolText = (eol: Eol, m: SocleMessages) => (eol === "none" ? m.diffNoEol : EOL_LABEL[eol]);

/** Rangées à dessiner, et les changements (suites de lignes retirées puis ajoutées) pour la navigation. */
function buildRows(
  files: DiffFile[],
  mode: DiffViewMode,
  withHeaders: boolean,
  expanded: ReadonlySet<string>,
  showAll: boolean,
  truncated: boolean,
  m: SocleMessages,
): { rows: Row[]; changes: Change[] } {
  const rows: Row[] = [];
  const changes: Change[] = [];
  files.forEach((file, fileIndex) => {
    if (withHeaders) rows.push({ type: "file", key: `f${fileIndex}`, file });
    if (file.binary) {
      rows.push({ type: "notice", key: `b${fileIndex}`, text: m.diffBinaryNotice });
      return;
    }
    if (file.eolChange) {
      rows.push({ type: "notice", key: `e${fileIndex}`, text: m.diffEolNotice(eolText(file.eolChange.from, m), eolText(file.eolChange.to, m)) });
    }
    if (!file.added && !file.removed && !withHeaders) return;
    file.segments.forEach((segment, segmentIndex) => {
      const foldKey = `${fileIndex}:${segmentIndex}`;
      let lines: DiffLine[];
      if (segment.type === "gap") {
        if (!segment.lines || !(showAll || expanded.has(foldKey))) {
          rows.push({ type: "gap", key: `g${foldKey}`, count: segment.count, oldStart: segment.oldStart, expandable: Boolean(segment.lines), foldKey });
          return;
        }
        lines = segment.lines;
      } else lines = segment.lines;
      let index = 0;
      while (index < lines.length) {
        const line = lines[index]!;
        if (line.kind === "context") {
          const key = `l${foldKey}:${index}`;
          if (mode === "unified") rows.push({ type: "line", key, line });
          else rows.push({ type: "pair", key, left: { line }, right: { line } });
          index++;
          continue;
        }
        const removed: DiffLine[] = [];
        const added: DiffLine[] = [];
        while (index < lines.length && lines[index]!.kind === "removed") removed.push(lines[index++]!);
        while (index < lines.length && lines[index]!.kind === "added") added.push(lines[index++]!);
        const change = changes.length;
        changes.push({
          row: rows.length,
          oldFrom: removed[0]?.oldNumber,
          oldTo: removed[removed.length - 1]?.oldNumber,
          newFrom: added[0]?.newNumber,
          newTo: added[added.length - 1]?.newNumber,
        });
        const key = `c${foldKey}:${index}`;
        if (mode === "unified") {
          removed.forEach((item, at) => rows.push({ type: "line", key: `${key}-${at}`, line: item, pair: added[at]!, change }));
          added.forEach((item, at) => rows.push({ type: "line", key: `${key}+${at}`, line: item, pair: removed[at]!, change }));
        } else {
          for (let at = 0; at < Math.max(removed.length, added.length); at++) {
            rows.push({
              type: "pair",
              key: `${key}=${at}`,
              left: removed[at] ? { line: removed[at]!, pair: added[at] } : undefined,
              right: added[at] ? { line: added[at]!, pair: removed[at] } : undefined,
              change,
            });
          }
        }
      }
    });
  });
  if (truncated) rows.push({ type: "notice", key: "truncated", text: m.diffTruncated });
  return { rows, changes };
}

/** Parties changées d'une ligne face à celle qui lui répond (D-294), calculées à l'affichage et gardées. */
const wordCache = new WeakMap<DiffLine, Range[] | null>();
function changedRanges(line: DiffLine, pair: DiffLine | undefined): Range[] | null {
  if (!pair) return null;
  if (wordCache.has(line)) return wordCache.get(line) ?? null;
  const [before, after] = line.kind === "removed" ? [line, pair] : [pair, line];
  const ranges = wordChanges(before.text, after.text);
  wordCache.set(before, ranges?.before ?? null);
  wordCache.set(after, ranges?.after ?? null);
  return (line.kind === "removed" ? ranges?.before : ranges?.after) ?? null;
}

function LineText({ line, pair }: { line: DiffLine; pair?: DiffLine | undefined }) {
  const m = useMessages();
  const ranges = line.kind === "context" ? null : changedRanges(line, pair);
  let content: ReactNode = line.text;
  if (ranges?.length) {
    const parts: ReactNode[] = [];
    let at = 0;
    for (const [from, to] of ranges) {
      if (from > at) parts.push(line.text.slice(at, from));
      const piece = line.text.slice(from, to);
      parts.push(line.kind === "removed" ? <del key={from}>{piece}</del> : <ins key={from}>{piece}</ins>);
      at = to;
    }
    if (at < line.text.length) parts.push(line.text.slice(at));
    content = parts;
  }
  // La fin de ligne n'est dite que si elle diffère de la ligne appariée, ou qu'elle manque (D-299).
  const eol = pair && pair.eol !== line.eol ? eolText(line.eol, m) : line.eol === "none" && line.kind !== "context" ? m.diffNoEol : "";
  return (
    <span className="socle-diff__text">
      {content}
      {eol ? <span className="socle-diff__eol">{eol}</span> : null}
    </span>
  );
}

const SIGNS = { context: " ", removed: "−", added: "+" } as const;

/** Signe visible et texte caché (D-293). */
function Sign({ line }: { line: DiffLine }) {
  const m = useMessages();
  const spoken = line.kind === "added" ? m.diffAddedLine : line.kind === "removed" ? m.diffRemovedLine : "";
  return (
    <span className="socle-diff__sign">
      <span aria-hidden="true">{SIGNS[line.kind]}</span>
      {spoken ? <span className="sr-only">{spoken}</span> : null}
    </span>
  );
}

export interface DiffStatProps {
  /** Lignes ajoutées. */
  added: number;
  /** Lignes retirées. */
  removed: number;
}

/** Compteurs « +12 −3 » en `--success` et `--danger`, avec texte caché (D-290, D-293). */
export function DiffStat({ added, removed }: DiffStatProps) {
  const m = useMessages();
  return (
    <span className="inline-flex shrink-0 gap-1.5 font-mono text-sm font-normal whitespace-nowrap tabular-nums">
      <span aria-hidden="true" className="text-success">+{added}</span>
      <span aria-hidden="true" className="text-danger">−{removed}</span>
      <span className="sr-only">{m.diffStat(added, removed)}</span>
    </span>
  );
}

function fileTitle(file: DiffFile, m: SocleMessages): string {
  if (file.status === "renamed" && file.oldPath && file.newPath && file.oldPath !== file.newPath) return `${file.oldPath} → ${file.newPath}`;
  return file.newPath ?? file.oldPath ?? m.diffFile;
}

function RowView({ row, current, onExpand }: { row: Row; current: boolean; onExpand: (foldKey: string) => void }) {
  const m = useMessages();
  switch (row.type) {
    case "file": {
      const status = { modified: "", added: m.diffFileAdded, deleted: m.diffFileDeleted, renamed: m.diffFileRenamed }[row.file.status];
      return (
        <h3 className="socle-diff__band socle-diff__file">
          <span className="socle-diff__file-name">{fileTitle(row.file, m)}</span>
          {status ? <span className="font-normal text-fg-2">{status}</span> : null}
          {!row.file.binary && (row.file.added || row.file.removed) ? (
            <span className="ml-auto">
              <DiffStat added={row.file.added} removed={row.file.removed} />
            </span>
          ) : null}
        </h3>
      );
    }
    case "notice":
      return <div className="socle-diff__band">{row.text}</div>;
    case "gap":
      return (
        <div className="socle-diff__band socle-diff__gap">
          {row.expandable ? (
            <>
              <span>{m.diffUnchanged(row.count)}</span>
              <Button variant="subtle" size="sm" icon={<UnfoldVertical size={14} />} onPress={() => onExpand(row.foldKey)}>
                {m.diffShowLines(row.count)}
              </Button>
            </>
          ) : (
            <span>{m.diffUnchangedFrom(row.count, row.oldStart)}</span>
          )}
        </div>
      );
    case "line": {
      const { line } = row;
      return (
        <div className={cx("socle-diff__row socle-diff__line", `is-${line.kind}`, current && "is-current")}>
          <span className="socle-diff__number">{line.oldNumber ?? ""}</span>
          <span className="socle-diff__number">{line.newNumber ?? ""}</span>
          <Sign line={line} />
          <LineText line={line} pair={row.pair} />
        </div>
      );
    }
    case "pair": {
      const half = (side: Side | undefined, which: "old" | "new") =>
        side ? (
          <>
            <span className={cx("socle-diff__number", `is-${side.line.kind}`)}>{which === "old" ? side.line.oldNumber : side.line.newNumber}</span>
            <span className={cx("socle-diff__half", `is-${side.line.kind}`)}>
              <Sign line={side.line} />
              <LineText line={side.line} pair={side.pair} />
            </span>
          </>
        ) : (
          <>
            <span className="socle-diff__number" />
            <span className="socle-diff__half is-empty" />
          </>
        );
      return (
        <div className={cx("socle-diff__row socle-diff__pair", current && "is-current")}>
          {half(row.left, "old")}
          {half(row.right, "new")}
        </div>
      );
    }
  }
}

function describeChange(change: Change, index: number, total: number, m: SocleMessages): string {
  const span = (from?: number, to?: number) => (from === undefined ? undefined : m.diffLines(from, to ?? from));
  return m.diffChangeAt(index + 1, total, span(change.oldFrom, change.oldTo), span(change.newFrom, change.newTo));
}

/**
 * Différences entre deux textes, ou d'un diff unifié (D-290). Vue côte à côte ou unifiée (D-291), mots changés
 * (D-294), lignes inchangées repliées (D-295), navigation F7 (D-297). Seules les rangées visibles sont dessinées (D-298).
 */
export function DiffView({
  label,
  before,
  after,
  fileName,
  patch,
  truncated = false,
  mode: controlledMode,
  defaultMode = "split",
  onModeChange,
  context = 3,
  fill = false,
}: DiffViewProps) {
  const m = useMessages();
  const narrow = useMedia("(max-width: 640px)");
  const [ownMode, setOwnMode] = useState<DiffViewMode>(defaultMode);
  const chosenMode = controlledMode ?? ownMode;
  const mode: DiffViewMode = narrow ? "unified" : chosenMode;
  const setMode = (next: DiffViewMode) => {
    setOwnMode(next);
    onModeChange?.(next);
  };
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);
  const [current, setCurrent] = useState<number | undefined>(undefined);
  const [announce, setAnnounce] = useState("");
  const hintId = useId();

  const files = useMemo(
    () => (patch !== undefined ? parsePatch(patch) : [diffTexts(before ?? "", after ?? "", context)]),
    [patch, before, after, context],
  );
  // Un nouveau contenu repart replié, sans changement courant (D-295).
  useEffect(() => {
    setExpanded(new Set());
    setCurrent(undefined);
    setAnnounce("");
  }, [files]);

  const { rows, changes } = useMemo(
    () => buildRows(files, mode, patch !== undefined, expanded, showAll, truncated, m),
    [files, mode, patch, expanded, showAll, truncated, m],
  );
  const foldable = files.some((file) => file.segments.some((segment) => segment.type === "gap" && segment.lines));
  const added = files.reduce((sum, file) => sum + file.added, 0);
  const removed = files.reduce((sum, file) => sum + file.removed, 0);
  const binary = files.length > 0 && files.every((file) => file.binary);
  const identical = !binary && patch === undefined && !added && !removed && !files[0]?.eolChange;

  const offsets = useMemo(() => {
    const result = new Float64Array(rows.length + 1);
    for (let i = 0; i < rows.length; i++) result[i + 1] = result[i]! + ROW_HEIGHT[rows[i]!.type];
    return result;
  }, [rows]);
  // Largeur des colonnes de texte : la plus longue ligne, pour un défilement horizontal commun (D-298).
  const widths = useMemo(() => {
    let left = 0;
    let right = 0;
    let digits = 1;
    for (const row of rows) {
      if (row.type === "line") {
        left = Math.max(left, row.line.text.length);
        digits = Math.max(digits, String(row.line.oldNumber ?? row.line.newNumber ?? 0).length);
      } else if (row.type === "pair") {
        left = Math.max(left, row.left?.line.text.length ?? 0);
        right = Math.max(right, row.right?.line.text.length ?? 0);
        digits = Math.max(digits, String(row.left?.line.oldNumber ?? row.right?.line.newNumber ?? 0).length);
      }
    }
    return { left: Math.min(left, 4000), right: Math.min(right, 4000), digits };
  }, [rows]);

  const scroller = useRef<HTMLElement>(null);
  const [view, setView] = useState({ top: 0, height: FALLBACK_VIEWPORT, width: 0 });
  const frame = useRef(0);
  const measure = useCallback(() => {
    const element = scroller.current;
    if (!element) return;
    setView({ top: element.scrollTop, height: element.clientHeight || FALLBACK_VIEWPORT, width: element.clientWidth });
  }, []);
  useLayoutEffect(() => {
    measure();
    const element = scroller.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [measure, identical]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const total = offsets[rows.length];
  let low = 0;
  let high = rows.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (offsets[middle + 1]! <= view.top) low = middle + 1;
    else high = middle;
  }
  const first = Math.max(0, low - OVERSCAN);
  let last = first;
  while (last < rows.length && offsets[last]! < view.top + view.height) last++;
  last = Math.min(rows.length, last + OVERSCAN);

  const goTo = (index: number) => {
    if (!changes.length) return;
    const next = (index + changes.length) % changes.length;
    setCurrent(next);
    setAnnounce(describeChange(changes[next]!, next, changes.length, m));
    const element = scroller.current;
    if (element) {
      const height = element.clientHeight || FALLBACK_VIEWPORT;
      element.scrollTop = Math.max(0, offsets[changes[next]!.row]! - height / 3);
      measure();
    }
  };
  const next = () => goTo(current === undefined ? 0 : current + 1);
  const previous = () => goTo(current === undefined ? changes.length - 1 : current - 1);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const forward = (event.key === "F7" && !event.shiftKey) || (event.altKey && event.key === "ArrowDown");
    const backward = (event.key === "F7" && event.shiftKey) || (event.altKey && event.key === "ArrowUp");
    if (!forward && !backward) return;
    event.preventDefault();
    if (forward) next();
    else previous();
  };

  const summary = binary ? m.diffBinary : changes.length ? m.diffChanges(changes.length) : m.diffNone;

  return (
    <div className={cx("socle-diff", `socle-diff--${mode}`, fill && "socle-diff--fill")}>
      {/* Toolbar React Aria : les flèches passent d'un contrôle à l'autre. */}
      <Toolbar
        aria-label={m.diffToolbar}
        className="flex min-h-(--bar-h) flex-none flex-wrap items-center gap-x-2 gap-y-1 border-b border-line bg-surface-side py-1 pr-1.5 pl-3 text-sm"
      >
        {fileName && patch === undefined ? <span className="min-w-0 truncate font-mono font-semibold text-fg">{fileName}</span> : null}
        <span className="text-fg-2">{summary}</span>
        {added || removed ? <DiffStat added={added} removed={removed} /> : null}
        <span className="flex-1" />
        {!narrow ? (
          <IconButton icon={<Columns />} label={m.diffSideBySide} isSelected={chosenMode === "split"} onChange={(on) => setMode(on ? "split" : "unified")} />
        ) : null}
        {foldable ? <IconButton icon={<UnfoldVertical />} label={m.diffShowUnchanged} isSelected={showAll} onChange={setShowAll} /> : null}
        <IconButton icon={<ChevronUp />} label={m.diffPrevious} shortcut="Shift+F7" isDisabled={!changes.length} onPress={previous} />
        <IconButton icon={<ChevronDown />} label={m.diffNext} shortcut="F7" isDisabled={!changes.length} onPress={next} />
        <span className="sr-only" aria-live="polite">
          {announce}
        </span>
      </Toolbar>
      {identical ? (
        <EmptyState size="compact" title={m.diffNone} description={m.diffNoneText} />
      ) : (
        <section
          ref={scroller}
          className="socle-diff__scroller"
          tabIndex={0}
          aria-label={label}
          aria-describedby={hintId}
          onKeyDown={onKeyDown}
          onScroll={() => {
            cancelAnimationFrame(frame.current);
            frame.current = requestAnimationFrame(measure);
          }}
          style={
            {
              "--diff-left": `${widths.left}ch`,
              "--diff-right": `${widths.right}ch`,
              "--diff-digits": `${Math.max(2, widths.digits)}ch`,
              ...(view.width ? { "--diff-viewport": `${view.width}px` } : {}),
            } as CSSProperties
          }
        >
          <span className="sr-only" id={hintId}>
            {m.diffKeysHint}
          </span>
          <div className="socle-diff__content" style={{ height: total }}>
            <div className="socle-diff__window" style={{ transform: `translateY(${offsets[first]}px)` }}>
              {rows.slice(first, last).map((row) => (
                <RowView
                  key={row.key}
                  row={row}
                  current={current !== undefined && "change" in row && row.change === current}
                  onExpand={(foldKey) => setExpanded((keys) => new Set(keys).add(foldKey))}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
