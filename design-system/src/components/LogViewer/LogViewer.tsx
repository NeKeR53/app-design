/*
 * Journal en lignes, virtualisé. Spec : LogViewer.spec.md. Décisions : D-281, D-285 à D-289.
 * Repris d'Alfred (src/ui/components/LogViewer.tsx), avec les composants de Socle et sans le canal propre à son SDK.
 */
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type AnsiSegment, type AnsiStyle, parseAnsi } from "../../lib/ansi";
import { copyText } from "../../lib/clipboard";
import { cx } from "../../lib/cx";
import { Toolbar } from "react-aria-components/Toolbar";
import { ArrowDownToLine, Check, ChevronDown, ChevronUp, Clock, Copy, ListX, WrapText } from "../../icons";
import { useMessages } from "../../provider/SocleProvider";
import { type Action, ActionBar } from "../../patterns/ActionBar/ActionBar";
import { Button } from "../Button/Button";
import { EmptyState } from "../EmptyState/EmptyState";
import { IconButton } from "../IconButton/IconButton";
import { List } from "../List/List";
import { Menu } from "../Menu/Menu";
import { SearchField } from "../SearchField/SearchField";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import { detectLevel, findLines, LineStore, type LogLine } from "./logLines";

export type { LogLine, LogLevel } from "./logLines";

/** Filtre de niveau (D-286) : toutes les lignes, alertes et erreurs, erreurs seules. */
export type LogLevelFilter = "all" | "warning" | "error";

/** Ce que voit l'utilisateur, pour les actions de la page (télécharger, analyser). */
export interface LogViewerView {
  /** Texte des lignes affichées (filtre de niveau compris), sans séquences ANSI ; calculé à la demande. */
  text(): string;
  level: LogLevelFilter;
  /** Aucune ligne affichée. */
  empty: boolean;
}

/** Poignée d'un `LogViewer`, pour un journal alimenté au fil de l'eau. */
export interface LogViewerHandle {
  /** Ajoute des lignes complètes (tableau) ou un morceau de flux (texte, dernière ligne ouverte sans saut de ligne). */
  append(data: string | readonly LogLine[]): void;
  /** Vide le journal. */
  clear(): void;
  /** Texte de toutes les lignes, sans séquences ANSI. */
  text(): string;
}

export interface LogViewerProps {
  /** Nom du journal, pour les lecteurs d'écran : « Journal du build n° 42 ». */
  label: string;
  /** Lignes du journal, séquences ANSI comprises. Un nouveau tableau remplace le précédent. */
  lines?: readonly LogLine[];
  /** La source écrit encore : suivi de la fin et « En direct » (D-288). */
  live?: boolean;
  /** Journal à niveaux : filtre, liste des erreurs et compteurs (D-286, D-287). */
  levels?: boolean;
  /** Retour à la ligne au départ. */
  wrap?: boolean;
  /** Horodatage affiché au départ, quand les lignes ont une heure. Défaut : oui. */
  timestamps?: boolean;
  /** Lignes gardées ; les plus anciennes sont oubliées au-delà. Défaut : 500 000. */
  maxLines?: number;
  /** Premier chargement : rien à montrer encore. */
  loading?: boolean;
  /** À la place de l'état vide habituel : un `EmptyState`, avec « Réessayer » par exemple. */
  empty?: ReactNode;
  /** Réglages propres à la source, en tête de la barre : un `Select` de taille réduite, par exemple. */
  tools?: ReactNode;
  /** Actions de la page, en fin de barre, d'après ce qui est affiché (zone `toolbar`). */
  actions?: (view: LogViewerView) => Action[];
  /** Occupe la hauteur restante du conteneur (colonne flexible). */
  fill?: boolean;
  ref?: Ref<LogViewerHandle>;
}

const ERROR_LIST_LIMIT = 200;
const OVERSCAN = 24;
const DEFAULT_ROW = 18;
/** Hauteur supposée tant que la zone n'est pas mesurée. */
const DEFAULT_VIEWPORT = 480;
/** Au-delà, la ligne est coupée à l'affichage ; la recherche et la copie gardent tout. */
const DISPLAY_LIMIT = 10_000;

/** Couleurs ANSI en tokens (D-281) : jamais de couleur en dur. */
const FG = [
  "text-(--ansi-0)", "text-(--ansi-1)", "text-(--ansi-2)", "text-(--ansi-3)", "text-(--ansi-4)", "text-(--ansi-5)", "text-(--ansi-6)", "text-(--ansi-7)",
  "text-(--ansi-8)", "text-(--ansi-9)", "text-(--ansi-10)", "text-(--ansi-11)", "text-(--ansi-12)", "text-(--ansi-13)", "text-(--ansi-14)", "text-(--ansi-15)",
];
const BG = [
  "bg-(--ansi-0)", "bg-(--ansi-1)", "bg-(--ansi-2)", "bg-(--ansi-3)", "bg-(--ansi-4)", "bg-(--ansi-5)", "bg-(--ansi-6)", "bg-(--ansi-7)",
  "bg-(--ansi-8)", "bg-(--ansi-9)", "bg-(--ansi-10)", "bg-(--ansi-11)", "bg-(--ansi-12)", "bg-(--ansi-13)", "bg-(--ansi-14)", "bg-(--ansi-15)",
];

/** Gauche et droite dans un champ texte de la barre : le curseur bouge, la Toolbar ne prend pas la main. */
function keepArrowsInTextField(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  const target = event.target as HTMLElement;
  const text =
    target.isContentEditable ||
    target.tagName === "TEXTAREA" ||
    (target instanceof HTMLInputElement && !["button", "checkbox", "radio", "range", "color", "file", "submit", "reset", "image"].includes(target.type));
  if (text) event.stopPropagation();
}

function pad(value: number, size = 2) {
  return String(value).padStart(size, "0");
}
/** HH:MM:SS.mmm, à l'heure locale. */
function formatTime(time: number) {
  const d = new Date(time);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

function styleClass(style: AnsiStyle) {
  let fg = style.fg;
  let bg = style.bg;
  if (style.inverse) {
    [fg, bg] = [bg ?? 15, fg ?? 0];
  }
  return (
    cx(
      fg !== undefined && FG[style.bold && fg < 8 ? fg + 8 : fg],
      bg !== undefined && BG[bg],
      bg !== undefined && fg === undefined && "text-surface",
      style.bold && "font-bold",
      style.dim && "opacity-70",
      style.italic && "italic",
      style.underline && "underline",
      style.strike && "line-through",
    ) || undefined
  );
}

/** Morceaux stylés d'une ligne, les occurrences de la recherche entourées de `<mark>`. */
function renderSegments(segments: AnsiSegment[], query: string): ReactNode[] {
  const plain = segments.map((segment) => segment.text).join("");
  const ranges: [number, number][] = [];
  if (query) {
    const haystack = plain.toLocaleLowerCase();
    let from = haystack.indexOf(query);
    while (from >= 0) {
      ranges.push([from, from + query.length]);
      from = haystack.indexOf(query, from + query.length);
    }
  }
  const nodes: ReactNode[] = [];
  let offset = 0;
  let range = 0;
  for (const segment of segments) {
    const className = styleClass(segment.format);
    const end = offset + segment.text.length;
    if (!ranges.length) {
      nodes.push(className ? <span key={offset} className={className}>{segment.text}</span> : segment.text);
      offset = end;
      continue;
    }
    let cursor = offset;
    const parts: ReactNode[] = [];
    while (cursor < end) {
      while (range < ranges.length && ranges[range]![1] <= cursor) range += 1;
      const current = ranges[range];
      if (current && current[0] <= cursor) {
        const stop = Math.min(end, current[1]);
        parts.push(
          <mark key={cursor} className="rounded-[2px] bg-[color-mix(in_srgb,var(--warning)_35%,transparent)] text-inherit">
            {segment.text.slice(cursor - offset, stop - offset)}
          </mark>,
        );
        cursor = stop;
      } else {
        const stop = Math.min(end, current ? current[0] : end);
        parts.push(segment.text.slice(cursor - offset, stop - offset));
        cursor = stop;
      }
    }
    nodes.push(<span key={offset} className={className}>{parts}</span>);
    offset = end;
  }
  return nodes;
}

function LineText({ raw, query, cut }: { raw: string; query: string; cut: string }) {
  const long = raw.length > DISPLAY_LIMIT;
  const segments = useMemo(() => parseAnsi(long ? raw.slice(0, DISPLAY_LIMIT) : raw), [raw, long]);
  return (
    <>
      {renderSegments(segments, query)}
      {long ? <span className="text-fg-3 italic">{cut}</span> : null}
    </>
  );
}

/** Position d'une valeur dans un tableau trié, -1 si absente. */
function positionOf(sorted: readonly number[], value: number) {
  let low = 0;
  let high = sorted.length - 1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    const at = sorted[middle]!;
    if (at === value) return middle;
    if (at < value) low = middle + 1;
    else high = middle - 1;
  }
  return -1;
}

/**
 * Journal très long en liste virtualisée (D-285) : couleurs ANSI lues sans HTML, filtre de niveau (D-286), liste des
 * erreurs (D-287), suivi de la fin (D-288), recherche, retour à la ligne, horodatage et copie (D-289).
 */
export function LogViewer({
  label,
  lines,
  live = false,
  levels = false,
  wrap: initialWrap = false,
  timestamps: initialTimestamps = true,
  maxLines = 500_000,
  loading = false,
  empty: emptyState,
  tools,
  actions,
  fill = false,
  ref,
}: LogViewerProps) {
  const m = useMessages();

  // --- Lignes : le magasin est alimenté pendant le rendu (tableau) ou par la poignée (flux).
  const storeRef = useRef<LineStore>(null);
  storeRef.current ??= new LineStore(maxLines);
  const store = storeRef.current;
  store.max = maxLines;
  const fed = useRef<readonly LogLine[] | undefined>(undefined);
  const [appended, setAppended] = useState(0);
  const replaced = useRef(0);
  if (lines && fed.current !== lines) {
    store.replace(lines);
    fed.current = lines;
    replaced.current += 1;
  }
  const version = appended + replaced.current * 1_000_000;

  useImperativeHandle(
    ref,
    () => ({
      append: (data) => {
        store.append(data);
        setAppended((value) => value + 1);
      },
      clear: () => {
        store.reset();
        setAppended((value) => value + 1);
      },
      text: () => store.lines.map((_, index) => store.text(index)).join("\n"),
    }),
    [store],
  );

  const total = store.lines.length;

  // --- Niveaux (D-286) : niveau donné par l'app, sinon lu dans le texte. Calculé à chaque version du journal.
  const [level, setLevel] = useState<LogLevelFilter>("all");
  const [errorsOpen, setErrorsOpen] = useState(false);
  const levelInfo = useMemo(() => {
    void version;
    if (!levels) return null;
    const of: ("error" | "warning" | undefined)[] = new Array(store.lines.length);
    const errors: number[] = [];
    const alerts: number[] = [];
    store.lines.forEach((line, index) => {
      const value = line.level ? (line.level === "info" ? undefined : line.level) : detectLevel(store.text(index));
      of[index] = value;
      if (!value) return;
      alerts.push(index);
      if (value === "error") errors.push(index);
    });
    return { of, errors, alerts, warnings: alerts.length - errors.length };
  }, [levels, store, version]);
  /** Lignes affichées (indices du magasin) quand un filtre s'applique ; `null` : toutes. */
  const view = levelInfo && level !== "all" ? (level === "error" ? levelInfo.errors : levelInfo.alerts) : null;
  const shownCount = view ? view.length : total;
  const lineAt = useCallback((position: number) => (view ? view[position]! : position), [view]);

  // --- Affichage.
  const [wrap, setWrap] = useState(initialWrap);
  const hasTimes = useMemo(() => {
    void version;
    return store.lines.some((line) => line.time !== undefined);
  }, [store, version]);
  const [showTimes, setShowTimes] = useState(initialTimestamps);
  const timesShown = showTimes && hasTimes;

  // --- Mesures de la zone qui défile.
  const viewport = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [size, setSize] = useState({ height: 0, width: 0 });
  const [rowHeight, setRowHeight] = useState(DEFAULT_ROW);
  const heights = useRef(new Float64Array(0));
  const [measured, setMeasured] = useState(0);

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const update = () => setSize({ height: element.clientHeight, width: element.clientWidth });
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Une ligne mesurée donne la hauteur de toutes les lignes sans retour à la ligne (police, densité).
  useLayoutEffect(() => {
    const row = windowRef.current?.querySelector<HTMLElement>("[data-index]");
    if (wrap || !row) return;
    const height = row.getBoundingClientRect().height;
    if (height > 0 && Math.abs(height - rowHeight) > 0.25) setRowHeight(height);
  });

  // Avec retour à la ligne, chaque ligne a sa hauteur : elle est mesurée une fois affichée.
  useLayoutEffect(() => {
    heights.current = new Float64Array(0);
    setMeasured((value) => value + 1);
  }, [wrap, size.width, timesShown, store.dropped, view]);
  if (wrap && heights.current.length < shownCount) {
    const grown = new Float64Array(Math.max(shownCount, heights.current.length * 2, 1024));
    grown.set(heights.current);
    heights.current = grown;
  }

  const offsets = useMemo(() => {
    void measured;
    if (!wrap) return null;
    const result = new Float64Array(shownCount + 1);
    for (let index = 0; index < shownCount; index += 1) result[index + 1] = result[index]! + (heights.current[index] || rowHeight);
    return result;
  }, [wrap, shownCount, rowHeight, measured]);
  const offsetOf = useCallback((index: number) => (offsets ? offsets[index]! : index * rowHeight), [offsets, rowHeight]);
  const indexAt = useCallback(
    (y: number) => {
      if (!offsets) return Math.floor(y / rowHeight);
      let low = 0;
      let high = shownCount;
      while (low < high) {
        const middle = (low + high) >> 1;
        if (offsets[middle + 1]! <= y) low = middle + 1;
        else high = middle;
      }
      return low;
    },
    [offsets, rowHeight, shownCount],
  );
  const contentHeight = offsetOf(shownCount);
  const viewHeight = size.height || DEFAULT_VIEWPORT;
  const first = Math.max(0, Math.min(shownCount, indexAt(scrollTop)) - OVERSCAN);
  const last = Math.min(shownCount, indexAt(scrollTop + viewHeight) + 1 + OVERSCAN);

  // --- Suivi de la fin (D-288) : actif au départ, suspendu dès qu'on remonte, repris en bas ou par « Revenir à la fin ».
  const [follow, setFollowState] = useState(true);
  const [pausedAt, setPausedAt] = useState(0);
  const followRef = useRef(true);
  const setFollow = useCallback(
    (next: boolean) => {
      if (followRef.current === next) return;
      followRef.current = next;
      setFollowState(next);
      setPausedAt(store.dropped + store.lines.length);
    },
    [store],
  );
  /** Ligne à centrer ; recentrée tant que les hauteurs mesurées la déplacent. */
  const reveal = useRef<number | undefined>(undefined);
  const remeasured = useRef(false);

  const center = useCallback(
    (index: number) => {
      const element = viewport.current;
      if (!element) return;
      const top = Math.max(0, offsetOf(index) - viewHeight / 2 + rowHeight / 2);
      element.scrollTop = top;
      setScrollTop(element.scrollTop || top);
    },
    [offsetOf, rowHeight, viewHeight],
  );

  useLayoutEffect(() => {
    const element = viewport.current;
    remeasured.current = false;
    if (!element || !wrap) return;
    let changed = false;
    let above = 0;
    const anchor = indexAt(element.scrollTop);
    for (const row of element.querySelectorAll<HTMLElement>("[data-index]")) {
      const index = Number(row.dataset.index);
      const height = row.getBoundingClientRect().height;
      if (!(height > 0) || Math.abs((heights.current[index] || rowHeight) - height) < 0.5) {
        if (height > 0) heights.current[index] = height;
        continue;
      }
      if (index < anchor) above += height - (heights.current[index] || rowHeight);
      heights.current[index] = height;
      changed = true;
    }
    if (!changed) return;
    // Hors suivi, la ligne lue ne bouge pas quand celles du dessus prennent leur vraie hauteur.
    if (!followRef.current && above && reveal.current === undefined) element.scrollTop += above;
    remeasured.current = true;
    setMeasured((value) => value + 1);
  });

  const following = follow && live;
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    if (following) {
      element.scrollTop = element.scrollHeight;
      if (element.scrollTop !== scrollTop) setScrollTop(element.scrollTop);
    } else if (reveal.current !== undefined) {
      center(reveal.current);
      if (!remeasured.current) reveal.current = undefined;
    }
  });

  const onScroll = () => {
    const element = viewport.current;
    if (!element) return;
    setScrollTop(element.scrollTop);
    if (!live) return;
    const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 4;
    setFollow(atBottom);
  };

  // --- Recherche (D-289) : les lignes qui contiennent le texte, sans tenir compte de la casse.
  const [query, setQuery] = useState("");
  const needle = query.toLocaleLowerCase();
  const found = useMemo(() => {
    void version;
    return findLines(store, needle);
  }, [store, needle, version]);
  /** Résultats en positions affichées : un filtre de niveau écarte ceux qu'il cache. */
  const matches = useMemo(() => (view ? found.map((line) => positionOf(view, line)).filter((position) => position >= 0) : found), [found, view]);
  const [matchPos, setMatchPos] = useState(-1);
  const currentLine = matchPos >= 0 ? matches[matchPos] : undefined;

  const goTo = useCallback(
    (position: number) => {
      const line = matches[position];
      if (line === undefined) return;
      setMatchPos(position);
      setFollow(false);
      reveal.current = line;
      center(line);
    },
    [center, matches, setFollow],
  );
  // Une nouvelle recherche mène au plus récent résultat quand le journal suit la fin, sinon au premier sous la lecture.
  const lastNeedle = useRef("");
  useEffect(() => {
    if (needle === lastNeedle.current) return;
    lastNeedle.current = needle;
    if (!needle) {
      setMatchPos(-1);
      return;
    }
    if (!matches.length) {
      setMatchPos(-1);
      return;
    }
    const top = indexAt(scrollTop);
    const below = matches.findIndex((line) => line >= top);
    goTo((followRef.current && live) || below < 0 ? matches.length - 1 : below);
  }, [needle, matches, indexAt, scrollTop, goTo, live]);
  const move = (direction: 1 | -1) => {
    if (!matches.length) return;
    const from = matchPos < 0 ? (direction > 0 ? -1 : 0) : matchPos;
    goTo((from + direction + matches.length) % matches.length);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const inSearch = (event.target as HTMLElement).getAttribute("role") === "combobox" || (event.target as HTMLElement).tagName === "INPUT";
    if (event.key === "F3" || (event.key === "Enter" && inSearch)) {
      event.preventDefault();
      move(event.shiftKey ? -1 : 1);
    }
  };

  /** Texte des lignes affichées, filtre de niveau compris. */
  const displayedText = () => (view ? view.map((index) => store.text(index)) : store.lines.map((_, index) => store.text(index))).join("\n");

  // --- Liste des erreurs (D-287) : un clic montre la ligne dans tout le journal.
  const [revealed, setRevealed] = useState<number>();
  const revealLine = (index: number) => {
    setLevel("all");
    setMatchPos(-1);
    setFollow(false);
    setRevealed(index);
    reveal.current = index;
  };

  // --- Copie (D-289) : la sélection faite dans le journal, sinon les lignes affichées.
  const [hasSelection, setHasSelection] = useState(false);
  useEffect(() => {
    const update = () => {
      const selection = document.getSelection();
      const element = viewport.current;
      setHasSelection(Boolean(selection && !selection.isCollapsed && element && selection.anchorNode && element.contains(selection.anchorNode)));
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(copyTimer.current), []);
  const copy = async () => {
    const selection = document.getSelection();
    const text = hasSelection && selection ? selection.toString() : displayedText();
    try {
      await copyText(text);
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied("idle"), 1600);
  };
  const copyLabel = copied === "copied" ? m.copied : copied === "failed" ? m.copyFailed : hasSelection ? m.copySelection : m.copyLog;

  // --- Rendu.
  const searchId = useId();
  const newLines = follow ? 0 : Math.max(0, store.dropped + total - pausedAt);
  const digits = String(store.dropped + total).length;
  const rows: ReactNode[] = [];
  for (let index = first; index < last; index += 1) {
    const at = lineAt(index);
    const line = store.lines[at];
    if (!line) continue;
    const lineLevel = levelInfo?.of[at];
    const current = index === currentLine || (!view && at === revealed && currentLine === undefined);
    const match = !current && needle && matches.length > 0 && store.text(at).toLocaleLowerCase().includes(needle);
    rows.push(
      <div
        key={store.dropped + at}
        data-index={index}
        className={cx("flex pr-3", wrap ? "break-all whitespace-pre-wrap" : "whitespace-pre", current ? "bg-selected" : match && "bg-field")}
      >
        <span
          aria-hidden="true"
          className={cx(
            "w-(--log-gutter) flex-none border-0 border-l-[3px] border-solid pr-[1ch] text-right text-fg-3 select-none",
            lineLevel === "error" ? "border-danger" : lineLevel === "warning" ? "border-warning" : "border-transparent",
          )}
        >
          {store.dropped + at + 1}
        </span>
        {timesShown ? (
          <span aria-hidden="true" className="w-[13ch] flex-none text-fg-3 select-none">
            {line.time !== undefined ? formatTime(line.time) : ""}
          </span>
        ) : null}
        <span className="min-w-0">
          {lineLevel ? <span className="sr-only">{lineLevel === "error" ? m.toneDanger : m.toneWarning} : </span> : null}
          <LineText raw={line.raw} query={needle} cut={m.lineCut} />
        </span>
      </div>,
    );
  }

  const isEmpty = total === 0;
  const viewEmpty = shownCount === 0;
  const pageView: LogViewerView = { text: displayedText, level, empty: viewEmpty };
  const pageActions = actions?.(pageView) ?? [];
  const levelName = { all: m.levelAll, warning: m.levelWarning, error: m.levelError }[level];

  return (
    <section
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cx(
        "socle-box flex min-w-0 flex-col overflow-hidden rounded-md border border-solid border-line bg-surface font-sans text-md text-fg",
        fill ? "min-h-0 flex-1" : "h-[min(560px,max(280px,calc(100dvh-240px)))]",
      )}
    >
      {/* Toolbar React Aria : les flèches passent d'un contrôle à l'autre. Dans un champ texte
          (recherche, outils fournis), gauche et droite restent au curseur : l'enveloppe arrête
          l'événement avant la Toolbar, sans bloquer le déplacement natif du curseur. */}
      <div className="contents" onKeyDownCapture={keepArrowsInTextField}>
      <Toolbar aria-label={m.logTools} className="flex flex-none flex-wrap items-center gap-1.5 border-b border-solid border-line px-2 py-1.5">
        {tools}
        {levelInfo ? (
          <Menu label={m.logLevel(levelName)} trigger={<Button size="sm">{m.logLevel(levelName)}</Button>}>
            <Menu.Section selectionMode="single" selectedKeys={[level]} onSelectionChange={(keys) => {
              const next = [...keys][0] as LogLevelFilter | undefined;
              if (!next) return;
              setLevel(next);
              setMatchPos(-1);
              setRevealed(undefined);
            }}>
              <Menu.Item id="all" label={`${m.levelAllLines} (${total.toLocaleString()})`} />
              <Menu.Item id="warning" label={`${m.levelWarnings} (${levelInfo.alerts.length.toLocaleString()})`} />
              <Menu.Item id="error" label={`${m.levelErrors} (${levelInfo.errors.length.toLocaleString()})`} />
            </Menu.Section>
          </Menu>
        ) : null}
        <SearchField label={m.logSearch} onChange={(criteria) => setQuery(criteria.text)} />
        <span id={searchId} aria-live="polite" className="min-w-16 text-sm whitespace-nowrap text-fg-3 tabular-nums">
          {needle ? (matches.length ? m.matchOf(Math.max(matchPos, 0) + 1, matches.length) : m.noMatchingLine) : ""}
        </span>
        <IconButton icon={<ChevronUp />} label={m.previousMatch} shortcut="Shift+F3" isDisabled={!matches.length} onPress={() => move(-1)} />
        <IconButton icon={<ChevronDown />} label={m.nextMatch} shortcut="F3" isDisabled={!matches.length} onPress={() => move(1)} />
        <span className="flex-1" />
        {live ? (
          <IconButton
            icon={<ArrowDownToLine />}
            label={m.followEnd}
            isSelected={follow}
            onChange={(next) => {
              reveal.current = undefined;
              setFollow(next);
            }}
          />
        ) : null}
        <IconButton icon={<WrapText />} label={m.wrapLines} isSelected={wrap} onChange={setWrap} />
        {hasTimes ? <IconButton icon={<Clock />} label={m.showTimestamps} isSelected={showTimes} onChange={setShowTimes} /> : null}
        {levelInfo ? <IconButton icon={<ListX />} label={m.errorList} isSelected={errorsOpen} onChange={setErrorsOpen} /> : null}
        <IconButton icon={copied === "copied" ? <Check /> : <Copy />} label={copyLabel} isDisabled={viewEmpty} onPress={() => void copy()} />
        <span className="sr-only" aria-live="polite">
          {copied === "idle" ? "" : copyLabel}
        </span>
        {pageActions.length ? <ActionBar actions={pageActions} zone="toolbar" subject={label} /> : null}
      </Toolbar>
      </div>
      {isEmpty ? (
        <div className="grid min-h-0 flex-1 place-items-center">
          {emptyState ?? <EmptyState size="compact" title={loading ? m.loadingLog : live ? m.waitingLines : m.emptyLog} />}
        </div>
      ) : null}
      <div className={cx("min-h-0 flex-1 flex-col tablet:flex-row", isEmpty ? "hidden" : "flex")}>
        {viewEmpty && !isEmpty ? (
          <div className="grid min-h-0 flex-1 place-items-center">
            <EmptyState size="compact" title={m.noLineAtLevel} />
          </div>
        ) : null}
        <div
          ref={viewport}
          role="log"
          aria-live="off"
          aria-label={`${label}, ${m.lineCount(total)}`}
          tabIndex={0}
          onScroll={onScroll}
          onWheel={(event) => {
            reveal.current = undefined;
            if (event.deltaY < 0 && live) setFollow(false);
          }}
          onKeyDown={(event) => {
            reveal.current = undefined;
            if (["ArrowUp", "PageUp", "Home"].includes(event.key)) setFollow(false);
            else if (event.key === "End" && !event.ctrlKey && live) {
              event.preventDefault();
              setFollow(true);
            }
          }}
          style={{ "--log-gutter": `${digits + 2}ch` } as CSSProperties}
          className={cx(
            "min-h-0 min-w-0 flex-1 overflow-auto py-1 font-mono text-[12.5px] leading-[18px] outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
            viewEmpty && "hidden",
          )}
        >
          <div className="relative" style={{ height: contentHeight, minWidth: "100%" }}>
            <div ref={windowRef} className={cx(wrap ? "w-full" : "w-max min-w-full")} style={{ transform: `translateY(${offsetOf(first)}px)` }}>
              {rows}
            </div>
          </div>
        </div>
        {levelInfo && errorsOpen ? (
          <aside aria-label={m.logErrors} className="flex max-h-[40%] min-h-0 flex-none flex-col border-t border-solid border-line tablet:max-h-none tablet:w-[260px] tablet:border-t-0 tablet:border-l">
            <h2 className="m-0 px-3 pt-2 pb-1 text-sm font-medium text-fg-3">{m.errorsTitle(levelInfo.errors.length)}</h2>
            {levelInfo.errors.length ? (
              <List
                label={m.logErrors}
                selectionMode="none"
                items={levelInfo.errors.slice(0, ERROR_LIST_LIMIT).map((index) => ({
                  id: String(index),
                  title: store.text(index).trim() || " ",
                  subtitle: m.lineNumber(store.dropped + index + 1),
                }))}
                onAction={(id) => revealLine(Number(id))}
              />
            ) : (
              <EmptyState size="compact" title={m.noErrors} />
            )}
            {levelInfo.errors.length > ERROR_LIST_LIMIT ? <p className="m-0 px-3 py-2 text-sm text-fg-3">{m.errorListLimit(ERROR_LIST_LIMIT)}</p> : null}
          </aside>
        ) : null}
      </div>
      <div className="flex min-h-7 flex-none flex-wrap items-center gap-x-3 border-t border-solid border-line bg-surface-side px-3 py-0.5 text-sm text-fg-2 tabular-nums">
        <span>
          {m.lineCount(total)}
          {store.dropped ? ` (${m.droppedLines(store.dropped)})` : ""}
        </span>
        {levelInfo?.errors.length ? <span className="text-danger">{m.errorCount(levelInfo.errors.length)}</span> : null}
        {levelInfo?.warnings ? <span className="text-warning">{m.warningCount(levelInfo.warnings)}</span> : null}
        {live ? <StatusBadge tone="success">{m.logLive}</StatusBadge> : null}
        {live && !follow ? (
          <span className="ml-auto flex items-center gap-2">
            <span aria-live="polite">{m.followPaused(newLines)}</span>
            <Button
              size="sm"
              variant="subtle"
              icon={<ArrowDownToLine />}
              onPress={() => {
                setFollow(true);
                viewport.current?.focus({ preventScroll: true });
              }}
            >
              {m.backToEnd}
            </Button>
          </span>
        ) : null}
      </div>
    </section>
  );
}
