/*
 * Champ de texte à pastilles de références (D-372). Spec : MentionInput.spec.md.
 * Élément éditable : chaque suggestion choisie devient une pastille non éditable, avec ×, posée à la position du
 * curseur. Le texte et les pastilles sont relus du DOM à chaque frappe ; la valeur reçue ne redessine le champ que
 * si elle en diffère. Les déclencheurs (`@`, `/`, `#`) et leurs suggestions viennent de l'app.
 */
import {
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
  type Ref,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { cx } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { Spinner } from "../Spinner/Spinner";
import {
  editorSelection,
  editorSignature,
  findMentionQuery,
  mentionKey,
  orderedMentions,
  PILL_CLASS,
  pointAtOffset,
  readEditor,
  renderEditor,
  replaceMentionRange,
  setEditorSelection,
  type MentionItem,
  type MentionQuery,
  type MentionReference,
  type MentionTrigger,
} from "./mentions";

export type { MentionItem, MentionReference, MentionTrigger } from "./mentions";

/** Pause de frappe avant de chercher les suggestions. */
export const MENTION_DEBOUNCE = 150;
/** Hauteur maximale de la liste des suggestions. */
const LIST_MAX_HEIGHT = 224;
const LIST_WIDTH = 320;

export interface MentionInputHandle {
  /** Donne le focus au champ. */
  focus: () => void;
  /** Insère du texte au curseur (ou à la dernière sélection connue) ; un déclencheur inséré ouvre ses suggestions. */
  insertText: (text: string) => void;
}

export interface MentionInputProps {
  /** Nom accessible du champ. */
  label: string;
  /** Texte, sans les pastilles. */
  value: string;
  /** Pastilles posées dans le texte. */
  references?: MentionReference[];
  onChange: (value: string, references: MentionReference[]) => void;
  /** Caractères qui ouvrent des suggestions, et leur recherche. */
  triggers?: MentionTrigger[];
  placeholder?: string;
  isDisabled?: boolean;
  /** `field` : cadre de champ ; `plain` : sans cadre, dans un conteneur qui porte le cadre (ChatComposer). */
  variant?: "field" | "plain";
  /** Touches, après celles de la liste des suggestions (Entrée, Tab, flèches, Échap quand elle est ouverte). */
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** Collage, avant le collage en texte brut ; `preventDefault()` le remplace. */
  onPaste?: (event: ClipboardEvent<HTMLDivElement>) => void;
  ref?: Ref<MentionInputHandle>;
}

type SuggestionState = { key: string; items: MentionItem[]; status: "loading" | "ready" | "error" };

/** Suggestions de la recherche en cours, après 150 ms sans frappe ; une recherche dépassée est annulée. */
function useSuggestions(query: MentionQuery | undefined): SuggestionState {
  const key = query ? `${query.trigger.char}\n${query.query}` : "";
  const [state, setState] = useState<SuggestionState>({ key: "", items: NO_ITEMS, status: "ready" });
  const latest = useRef(query);
  latest.current = query;
  useEffect(() => {
    const current = latest.current;
    if (!current) return;
    const controller = new AbortController();
    const char = current.trigger.char;
    setState((s) => ({ key, items: s.key.startsWith(`${char}\n`) ? s.items : NO_ITEMS, status: "loading" }));
    const timer = setTimeout(() => {
      current.trigger.load(current.query, controller.signal).then(
        (items) => !controller.signal.aborted && setState({ key, items, status: "ready" }),
        () => !controller.signal.aborted && setState({ key, items: [], status: "error" }),
      );
    }, MENTION_DEBOUNCE);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key]);
  if (state.key === key) return state;
  // Avant la fin de la pause : les suggestions du même déclencheur restent affichées, sans clignoter.
  const sameTrigger = query !== undefined && state.key.startsWith(`${query.trigger.char}\n`);
  return { key, items: sameTrigger ? state.items : NO_ITEMS, status: "loading" };
}

const NO_ITEMS: MentionItem[] = [];

const VARIANTS = {
  plain: "min-h-7 max-h-60 flex-1 p-1 text-lg leading-5",
  field:
    "min-h-(--row-h) max-h-60 w-full rounded-md border border-line-strong bg-surface px-2.5 py-1.5 text-md leading-(--lh) transition-colors duration-[var(--dur-fast)] ease-standard hover:border-fg-3 focus:outline-2 focus:outline-solid focus:outline-focus focus:outline-offset-1",
};

export function MentionInput({
  label,
  value,
  references = [],
  onChange,
  triggers = [],
  placeholder,
  isDisabled = false,
  variant = "field",
  onKeyDown,
  onPaste,
  ref,
}: MentionInputProps) {
  const m = useMessages();
  const input = useRef<HTMLDivElement>(null);
  const known = useRef(new Map<string, MentionReference>());
  const pendingKey = useRef<string | undefined>(undefined);
  const pendingOffset = useRef<number | undefined>(undefined);
  const lastSelection = useRef<{ start: number; end: number } | undefined>(undefined);
  const listId = useId();
  const [cursor, setCursor] = useState(0);
  const [dismissed, setDismissed] = useState(true);
  const [active, setActive] = useState(0);
  const query = !isDisabled && !dismissed ? findMentionQuery(value, cursor, triggers) : undefined;
  const suggestions = useSuggestions(query);
  const items = suggestions.items;
  const loading = suggestions.status === "loading";
  const visible = Boolean(query);
  const activeItem = visible ? items[active] : undefined;

  // La valeur reçue redessine le champ seulement si elle diffère de ce qu'il montre (la frappe ne redessine rien).
  useLayoutEffect(() => {
    const root = input.current;
    if (!root) return;
    const current = readEditor(root, known.current);
    known.current = new Map(references.map((r) => [r.key, r]));
    if (editorSignature(current.text, current.references) === editorSignature(value, references)) return;
    const selection = document.activeElement === root ? editorSelection(root) : undefined;
    renderEditor(root, value, references, m.removeItem, !isDisabled);
    if (pendingKey.current) {
      const pill = Array.from(root.querySelectorAll<HTMLElement>("[data-mention-key]")).find((el) => el.dataset.mentionKey === pendingKey.current);
      if (pill && document.activeElement === root) {
        const range = document.createRange();
        range.setStartAfter(pill);
        range.collapse(true);
        const selected = window.getSelection();
        selected?.removeAllRanges();
        selected?.addRange(range);
      }
      pendingKey.current = undefined;
    } else if (pendingOffset.current !== undefined || selection) {
      if (document.activeElement === root) setEditorSelection(root, pendingOffset.current ?? selection?.end ?? 0);
      pendingOffset.current = undefined;
    }
  }, [value, references, m.removeItem, isDisabled]);

  // La liste revient en tête à chaque nouvelle recherche.
  useEffect(() => setActive(0), [suggestions.key, items]);

  const focusEnd = () => {
    const root = input.current;
    if (!root) return;
    root.focus();
  };

  useImperativeHandle(
    ref,
    () => ({
      focus: focusEnd,
      insertText: (inserted: string) => {
        const root = input.current;
        if (!root || isDisabled) return;
        const saved = document.activeElement === root ? editorSelection(root) : (lastSelection.current ?? { start: value.length, end: value.length });
        root.focus();
        const start = Math.min(saved.start, value.length);
        const end = Math.min(saved.end, value.length);
        const before = value.slice(0, start);
        const text = triggers.some((t) => t.char === inserted) && before && !/\s$/.test(before) ? ` ${inserted}` : inserted;
        pendingOffset.current = start + text.length;
        onChange(value.slice(0, start) + text + value.slice(end), replaceMentionRange(references, start, end, text.length));
        setCursor(start + text.length);
        setDismissed(false);
      },
    }),
    [value, references, onChange, isDisabled, triggers],
  );

  const updateFromDom = () => {
    const root = input.current;
    if (!root) return;
    const next = readEditor(root, known.current);
    // Champ vidé : le navigateur laisse parfois un <br>, qui masquerait le texte d'attente.
    if (!next.text && !next.references.length && root.childNodes.length) root.replaceChildren();
    onChange(next.text, next.references);
    setCursor(editorSelection(root).end);
    setDismissed(false);
  };

  const choose = (item: MentionItem) => {
    if (!query) return;
    const reference: MentionReference = { key: mentionKey(), trigger: query.trigger.char, id: item.id, label: item.label, offset: query.start };
    pendingKey.current = reference.key;
    onChange(value.slice(0, query.start) + value.slice(query.end), [...replaceMentionRange(references, query.start, query.end), reference]);
    setCursor(query.start);
    setDismissed(true);
    input.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (visible) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setDismissed(true);
        return;
      }
      if ((event.key === "ArrowDown" || event.key === "ArrowUp") && items.length) {
        event.preventDefault();
        setActive((i) => (i + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length);
        return;
      }
      // Entrée ou Tab insère la suggestion active ; pendant la recherche, Entrée attend.
      if ((event.key === "Enter" && !event.shiftKey) || (event.key === "Tab" && !event.shiftKey)) {
        if (activeItem) {
          event.preventDefault();
          choose(activeItem);
          return;
        }
        if (event.key === "Enter" && loading) {
          event.preventDefault();
          return;
        }
        setDismissed(true);
      }
    }
    onKeyDown?.(event);
    // Un retour à la ligne est toujours un <br> : le texte se relit de la même façon dans tous les navigateurs.
    if (event.key === "Enter" && !event.defaultPrevented) {
      event.preventDefault();
      document.execCommand("insertLineBreak");
    }
  };

  const trackCursor = () => {
    const root = input.current;
    if (root) setCursor(editorSelection(root).end);
  };

  return (
    <>
      <div
        ref={input}
        role="textbox"
        aria-label={label}
        aria-multiline="true"
        aria-disabled={isDisabled || undefined}
        aria-placeholder={placeholder}
        aria-autocomplete={triggers.length ? "list" : undefined}
        aria-haspopup={triggers.length ? "listbox" : undefined}
        aria-expanded={triggers.length ? visible : undefined}
        aria-controls={visible ? listId : undefined}
        aria-activedescendant={activeItem ? `${listId}-${active}` : undefined}
        contentEditable={!isDisabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        data-slot="mention-input"
        tabIndex={isDisabled ? -1 : 0}
        className={cx(
          "socle-box block min-w-0 cursor-text overflow-y-auto font-sans whitespace-pre-wrap text-fg outline-none [overflow-wrap:anywhere]",
          "empty:before:pointer-events-none empty:before:text-fg-3 empty:before:content-[attr(data-placeholder)]",
          VARIANTS[variant],
          isDisabled && "cursor-not-allowed opacity-40",
        )}
        onInput={updateFromDom}
        onClick={(event) => {
          const remove = (event.target as Element).closest<HTMLElement>("[data-mention-remove]");
          const key = remove?.dataset.mentionRemove;
          if (key) {
            event.preventDefault();
            const reference = references.find((r) => r.key === key);
            pendingOffset.current = reference?.offset ?? value.length;
            onChange(value, references.filter((r) => r.key !== key));
            input.current?.focus();
            return;
          }
          trackCursor();
          setDismissed(false);
        }}
        onFocus={trackCursor}
        onBlur={(event) => {
          lastSelection.current = editorSelection(event.currentTarget);
          setDismissed(true);
        }}
        onKeyUp={(event) => {
          if (event.key !== "Escape") trackCursor();
        }}
        onPointerUp={trackCursor}
        onPaste={(event) => {
          onPaste?.(event);
          if (event.defaultPrevented) return;
          // Collage forcé en texte brut : aucune mise en forme venue d'ailleurs.
          event.preventDefault();
          const text = event.clipboardData.getData("text/plain");
          if (text) document.execCommand("insertText", false, text);
        }}
        onKeyDown={handleKeyDown}
      />
      {visible && query && (
        <SuggestionList
          id={listId}
          anchor={input}
          query={query}
          items={items}
          active={active}
          status={suggestions.status}
          onHover={setActive}
          onChoose={choose}
        />
      )}
    </>
  );
}

/** Liste des suggestions, au-dessus du curseur ; le focus reste dans le champ (`aria-activedescendant`). */
function SuggestionList({
  id,
  anchor,
  query,
  items,
  active,
  status,
  onHover,
  onChoose,
}: {
  id: string;
  anchor: RefObject<HTMLDivElement | null>;
  query: MentionQuery;
  items: MentionItem[];
  active: number;
  status: SuggestionState["status"];
  onHover: (index: number) => void;
  onChoose: (item: MentionItem) => void;
}) {
  const m = useMessages();
  const [position, setPosition] = useState<CSSProperties>({ position: "fixed", visibility: "hidden" });
  const list = useRef<HTMLDivElement>(null);
  const start = query.start;

  useLayoutEffect(() => {
    const place = () => {
      const root = anchor.current;
      if (!root) return;
      const field = root.getBoundingClientRect();
      let caret: DOMRect | undefined;
      try {
        const point = pointAtOffset(root, start);
        const range = document.createRange();
        range.setStart(point.node, point.offset);
        range.collapse(true);
        const rect = range.getBoundingClientRect();
        if (rect.height) caret = rect;
      } catch {
        caret = undefined;
      }
      const left = caret?.left ?? field.left;
      const top = caret?.top ?? field.top;
      const width = Math.min(LIST_WIDTH, window.innerWidth - 16);
      setPosition({
        position: "fixed",
        left: Math.max(8, Math.min(left, window.innerWidth - width - 8)),
        bottom: window.innerHeight - top + 4,
        width,
        maxHeight: Math.min(LIST_MAX_HEIGHT, Math.max(64, top - 12)),
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchor, start]);

  useEffect(() => {
    list.current?.querySelector(`[id="${CSS.escape(`${id}-${active}`)}"]`)?.scrollIntoView?.({ block: "nearest" });
  }, [active, id]);

  const message = status === "error" ? m.mentionError : !items.length ? (status === "loading" ? m.mentionSearching : m.mentionEmpty) : "";
  return createPortal(
    <div
      ref={list}
      style={position}
      data-mention-list=""
      className="socle-box z-50 overflow-auto rounded-lg border border-line bg-surface-raised p-1 font-sans text-md text-fg shadow-md"
    >
      <div id={id} role="listbox" aria-label={m.mentionSuggestions(query.trigger.label)} aria-busy={status === "loading" || undefined}>
        {items.map((item, index) => (
          <div
            key={item.id}
            id={`${id}-${index}`}
            role="option"
            aria-selected={index === active}
            className={cx("flex h-(--row-h) cursor-default items-center gap-2 rounded-md px-2.5 select-none", index === active && "bg-hover")}
            onMouseDown={(event) => {
              // Le champ garde le focus : le clic choisit sans fermer la saisie.
              event.preventDefault();
              onChoose(item);
            }}
            onMouseEnter={() => onHover(index)}
          >
            {item.icon && <span className="inline-grid w-4 shrink-0 place-items-center text-fg-2">{item.icon}</span>}
            <span className="min-w-0 truncate">{item.label}</span>
            {item.description && <span className="ml-auto max-w-[50%] min-w-0 shrink-0 truncate pl-2 text-sm text-fg-3">{item.description}</span>}
          </div>
        ))}
      </div>
      {message && (
        <div role="status" className="flex items-center gap-2 px-2.5 py-2 text-sm text-fg-2">
          {status === "loading" && <Spinner decorative />}
          {message}
        </div>
      )}
    </div>,
    document.body,
  );
}

/** Texte en lecture seule, ses pastilles posées à leur position (file d'attente, message envoyé). */
export function MentionText({ text, references = [] }: { text: string; references?: readonly MentionReference[] }) {
  return (
    <>
      {orderedMentions(text, references).map((part, index) =>
        "text" in part ? (
          <span key={index}>{part.text}</span>
        ) : (
          <span key={part.reference.key} className={cx(PILL_CLASS, "pr-1.5")}>
            <span className="min-w-0 truncate">{`${part.reference.trigger}${part.reference.label}`}</span>
          </span>
        ),
      )}
    </>
  );
}
