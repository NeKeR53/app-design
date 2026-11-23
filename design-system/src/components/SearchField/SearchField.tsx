/*
 * Barre de recherche : la barre seule, qui transmet ses critères à l'app (D-077).
 * Spec : SearchField.spec.md. Décisions : D-071 à D-083.
 */
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Popover } from "react-aria-components/Popover";
import { useMessages, useSocle } from "../../provider/SocleProvider";
import { buttonReset, cx } from "../../lib/cx";
import { ariaShortcut, formatShortcut } from "../../lib/shortcut";
import { Search, X } from "../../icons";
import { popoverClass } from "../Menu/Menu";

export interface SearchTag {
  id: string;
  label: string;
}

export interface SearchCriteria {
  /** Texte en cours, vide en dessous de 2 caractères (D-080). */
  text: string;
  /** Étiquettes, à combiner en ET par l'app (D-075). */
  tags: string[];
}

export interface SearchSuggestion {
  id: string;
  label: string;
}

export interface SearchFieldProps {
  /** Nom accessible ; texte d'aide « Rechercher dans <label> ». Exemple : « les demandes ». */
  label: string;
  /** Critères transmis à l'app (D-077, D-079). */
  onChange: (criteria: SearchCriteria) => void;
  /** Active les étiquettes : Entrée transforme le texte en étiquette (D-071, D-072). */
  tagMode?: boolean;
  /** Étiquettes contrôlées par l'app (facultatif). */
  tags?: SearchTag[];
  onTagsChange?: (tags: SearchTag[]) => void;
  /** Éléments suggérés, 5 au plus ; synchrone ou asynchrone (API) (D-074, D-077). */
  suggestions?: (text: string, signal: AbortSignal) => SearchSuggestion[] | Promise<SearchSuggestion[]>;
}

/** Délai et longueur minimale (D-080). */
const MIN_CHARS = 2;
const DELAY = 300;

type SuggState = { status: "idle" } | { status: "loading" } | { status: "error" } | { status: "done"; items: SearchSuggestion[] };

let tagSeq = 0;

export function SearchField({ label, onChange, tagMode = false, tags: tagsProp, onTagsChange, suggestions }: SearchFieldProps) {
  const { isMac } = useSocle();
  const m = useMessages();
  const listId = useId();
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chipsRef = useRef<HTMLSpanElement>(null);

  const [text, setText] = useState("");
  const [ownTags, setOwnTags] = useState<SearchTag[]>([]);
  const tags = tagsProp ?? ownTags;
  const setTags = (t: SearchTag[]) => (onTagsChange ? onTagsChange(t) : setOwnTags(t));
  const [armed, setArmed] = useState(false);
  const [focused, setFocused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [keep, setKeep] = useState(2);
  const [open, setOpen] = useState(false);
  const [hl, setHl] = useState(0);
  const [sugg, setSugg] = useState<SuggState>({ status: "idle" });

  /* ---------- Envoi des critères (D-079, D-080) ---------- */
  const lastSent = useRef<string>(JSON.stringify({ text: "", tags: [] }));
  const sendTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const emit = useCallback(
    (t: string, tg: SearchTag[]) => {
      const c: SearchCriteria = { text: t.trim().length >= MIN_CHARS ? t.trim() : "", tags: tg.map((x) => x.label) };
      const key = JSON.stringify(c);
      if (key === lastSent.current) return; // jamais deux fois les mêmes critères
      lastSent.current = key;
      onChange(c);
    },
    [onChange],
  );
  const emitNow = (t: string, tg: SearchTag[]) => {
    clearTimeout(sendTimer.current);
    emit(t, tg);
  };
  const emitLater = (t: string, tg: SearchTag[]) => {
    clearTimeout(sendTimer.current);
    sendTimer.current = setTimeout(() => emit(t, tg), DELAY);
  };

  /* ---------- Suggestions, éventuellement par API (D-074, D-077, D-081, D-082) ---------- */
  const abort = useRef<AbortController | null>(null);
  const suggTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const load = useCallback(
    (v: string) => {
      if (!suggestions) return;
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      setSugg({ status: "loading" });
      Promise.resolve()
        .then(() => suggestions(v, ctrl.signal))
        .then((items) => {
          if (!ctrl.signal.aborted) setSugg({ status: "done", items: items.slice(0, 5) }); // seule la dernière réponse compte
        })
        .catch(() => {
          if (!ctrl.signal.aborted) setSugg({ status: "error" });
        });
    },
    [suggestions],
  );
  const requestSuggestions = (v: string) => {
    clearTimeout(suggTimer.current);
    abort.current?.abort();
    if (!suggestions || v.trim().length < MIN_CHARS) {
      setOpen(false);
      setSugg({ status: "idle" });
      return;
    }
    setOpen(true);
    setHl(0);
    setSugg({ status: "loading" });
    suggTimer.current = setTimeout(() => load(v.trim()), DELAY);
  };
  useEffect(
    () => () => {
      clearTimeout(sendTimer.current);
      clearTimeout(suggTimer.current);
      abort.current?.abort();
    },
    [],
  );

  /* ---------- Mod+F (D-083) ---------- */
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((isMac ? e.metaKey : e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMac]);

  /* ---------- « +n » : les étiquettes ne sont jamais coupées (D-078) ---------- */
  // 3 étiquettes visibles au focus, 2 sinon ; puis une de moins tant que la rangée déborde.
  useLayoutEffect(() => setKeep(focused ? 3 : 2), [tags.length, focused]);
  useLayoutEffect(() => {
    const el = chipsRef.current;
    if (!expanded && el && keep > 1 && el.scrollWidth > el.clientWidth + 1) setKeep(keep - 1);
  });

  /* ---------- Actions ---------- */
  const options = sugg.status === "done" ? sugg.items : [];
  const optionCount = text.trim() ? 1 + options.length : 0; // 0 : « Rechercher « texte » »
  const addTag = (labelText: string) => {
    const l = labelText.trim();
    if (!l) return;
    const next = tags.some((t) => t.label === l) ? tags : [...tags, { id: `t${++tagSeq}`, label: l }];
    setTags(next);
    setText("");
    setArmed(false);
    setOpen(false);
    emitNow("", next);
  };
  const choose = (index: number) => {
    const chosen = index === 0 ? text : options[index - 1]?.label;
    if (chosen === undefined) return;
    if (tagMode) addTag(chosen);
    else {
      setText(chosen);
      setOpen(false);
      emitNow(chosen, tags);
    }
  };
  const removeTag = (id: string) => {
    const next = tags.filter((t) => t.id !== id);
    setTags(next);
    emitNow(text, next);
    inputRef.current?.focus();
  };
  const clearAll = () => {
    setTags([]);
    setText("");
    setOpen(false);
    emitNow("", []);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && open && optionCount) {
      e.preventDefault();
      setHl((h) => Math.min(optionCount - 1, h + 1));
    } else if (e.key === "ArrowUp" && open && optionCount) {
      e.preventDefault();
      setHl((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && optionCount && (tagMode || hl > 0)) choose(hl);
      else if (tagMode) addTag(text);
      else {
        setOpen(false);
        emitNow(text, tags);
      }
    } else if (e.key === "Backspace" && !text && tags.length) {
      e.preventDefault();
      if (armed) {
        const next = tags.slice(0, -1);
        setTags(next);
        setArmed(false);
        emitNow(text, next);
      } else setArmed(true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (open) setOpen(false);
      else if (text) {
        setText("");
        emitNow("", tags);
      } else inputRef.current?.blur();
    } else setArmed(false);
  };

  const filled = Boolean(text || tags.length);
  const shown = expanded || keep >= tags.length ? tags : tags.slice(tags.length - keep);
  const more = tags.length - shown.length;
  const activeId = open && optionCount ? `${listId}-${hl}` : undefined;

  return (
    <div
      ref={fieldRef}
      role="search"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.fieldBg !== undefined) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }}
      className={cx(
        // Largeur fixe de 320 px ; toute la largeur sur mobile (D-078). Bord fin (D-073).
        "socle-box relative flex min-h-(--row-h) w-80 max-tablet:w-full cursor-text items-center gap-1 rounded-md border border-line-strong bg-surface pr-1 pl-2.5 font-sans text-md text-fg-3",
        "hover:border-fg-3 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-accent focus-within:outline-solid",
        expanded && "flex-wrap py-[3px]",
      )}
    >
      <Search className="mr-1 shrink-0" />
      {tagMode && tags.length > 0 && (
        <span ref={chipsRef} role="group" aria-label={m.searchCriteria} className={cx("flex min-w-0 items-center gap-1", expanded ? "contents" : "overflow-hidden")}>
          {more > 0 && (
            <button
              type="button"
              title={tags.slice(0, more).map((t) => t.label).join(", ")}
              aria-label={m.moreCriteria(more)}
              onMouseDown={(e) => {
                e.preventDefault();
                setExpanded(true);
                inputRef.current?.focus();
              }}
              className={cx(buttonReset, "inline-flex h-[calc(var(--row-h)-10px)] shrink-0 items-center rounded-sm bg-selected px-1.5 text-sm text-fg-2")}
            >
              +{more}
            </button>
          )}
          {shown.map((t, i) => (
            <span
              key={t.id}
              className={cx(
                "inline-flex h-[calc(var(--row-h)-10px)] max-w-40 shrink-0 items-center gap-0.5 rounded-sm bg-selected pl-1.5 text-sm text-fg",
                armed && i === shown.length - 1 && "outline-2 outline-accent outline-solid",
              )}
            >
              <span className="truncate" title={t.label}>
                {t.label}
              </span>
              <button
                type="button"
                tabIndex={-1}
                aria-label={m.removeCriterion(t.label)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => removeTag(t.id)}
                className={cx(buttonReset, "inline-grid size-[18px] place-items-center rounded-[3px] text-fg-2 hover:bg-line-strong hover:text-fg")}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </span>
      )}
      <input
        ref={inputRef}
        role="combobox"
        aria-label={m.searchIn(label)}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-autocomplete={suggestions ? "list" : "none"}
        aria-activedescendant={activeId}
        aria-keyshortcuts={ariaShortcut("Mod+F", isMac)}
        placeholder={tags.length ? "" : m.searchIn(label)}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setArmed(false);
          requestSuggestions(e.target.value);
          emitLater(e.target.value, tags);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setArmed(false);
          setExpanded(false);
          setOpen(false);
        }}
        className="h-[calc(var(--row-h)-2px)] min-w-20 flex-1 border-0 bg-transparent p-0 px-0.5 font-[inherit] text-[length:inherit] text-fg outline-none placeholder:text-fg-3"
      />
      {sugg.status === "loading" && open && (
        <span role="status" aria-label={m.searching} className="socle-spin size-3.5 shrink-0 rounded-full border-2 border-line-strong border-t-fg-2" />
      )}
      {!filled && !focused && (
        <kbd className="mr-1 shrink-0 rounded-sm border border-line-strong px-1.5 font-sans text-xs leading-4 text-fg-3">{formatShortcut("Mod+F", isMac, m)}</kbd>
      )}
      {filled && (
        <button
          type="button"
          aria-label={m.clearAll}
          onMouseDown={(e) => e.preventDefault()}
          onClick={clearAll}
          className={cx(buttonReset, "inline-grid size-[22px] shrink-0 place-items-center rounded-sm text-fg-2 hover:bg-selected hover:text-fg")}
        >
          <X size={14} />
        </button>
      )}
      <Popover triggerRef={fieldRef} isOpen={open && optionCount > 0} onOpenChange={setOpen} isNonModal placement="bottom start" offset={4} containerPadding={8} className={cx(popoverClass, "w-80")}>
        <div id={listId} role="listbox" aria-label={m.suggestions} onMouseDown={(e) => e.preventDefault()}>
          <Option id={`${listId}-0`} active={hl === 0} onHover={() => setHl(0)} onChoose={() => choose(0)}>
            <Search className="shrink-0 text-fg-2" />
            <span className="truncate">{m.searchFor(text.trim())}</span>
          </Option>
          {suggestions && (
            <>
              {sugg.status !== "done" || options.length > 0 ? <div className="px-2.5 pt-1.5 pb-0.5 text-sm text-fg-3">{m.elements}</div> : null}
              {sugg.status === "loading" && (
                <div role="status" className="flex h-(--row-h) items-center gap-2 px-2.5 text-sm text-fg-3">
                  <span className="socle-spin size-3.5 rounded-full border-2 border-line-strong border-t-fg-2" />
                  {m.searchingRow}
                </div>
              )}
              {sugg.status === "error" && (
                <div role="alert" className="flex h-(--row-h) items-center gap-2 px-2.5 text-sm text-fg-3">
                  {m.suggestionsUnavailable}
                  <button type="button" onClick={() => load(text.trim())} className={cx(buttonReset, "ml-auto rounded-sm px-1 text-accent-text hover:underline")}>
                    {m.retry}
                  </button>
                </div>
              )}
              {sugg.status === "done" && options.length === 0 && <div className="flex h-(--row-h) items-center px-2.5 text-sm text-fg-3">{m.noElements}</div>}
              {options.map((o, i) => (
                <Option key={o.id} id={`${listId}-${i + 1}`} active={hl === i + 1} onHover={() => setHl(i + 1)} onChoose={() => choose(i + 1)}>
                  <span className="truncate">{o.label}</span>
                </Option>
              ))}
            </>
          )}
        </div>
      </Popover>
    </div>
  );
}

function Option({ id, active, onHover, onChoose, children }: { id: string; active: boolean; onHover: () => void; onChoose: () => void; children: ReactNode }) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      onMouseMove={onHover}
      onClick={onChoose}
      className={cx("flex h-(--row-h) cursor-default items-center gap-2 rounded-md px-2.5 text-fg", active && "bg-hover")}
    >
      {children}
    </div>
  );
}
