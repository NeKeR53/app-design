/*
 * ComboBox : champ de formulaire qui propose une liste de choix pendant la saisie.
 * Choix simple ou multiple, source locale ou asynchrone (D-140).
 * Spec : ComboBox.spec.md. Décisions : D-140 à D-147 ; anatomie des champs : Field.spec.md (D-130 à D-134).
 * Le champ n'est pas un ComboBox de React Aria (étiquettes, « Ajouter », lignes d'attente dans la liste) :
 * il fournit lui-même les contextes de libellé, d'aide et d'erreur pour reprendre les pièces de Field.
 */
import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { FieldErrorContext } from "react-aria-components/FieldError";
import { LabelContext } from "react-aria-components/Label";
import { Popover } from "react-aria-components/Popover";
import { TextContext } from "react-aria-components/Text";
import type { ValidationResult } from "react-aria-components/TextField";
import { useMessages } from "../../provider/SocleProvider";
import { buttonReset, cx } from "../../lib/cx";
import { Check, ChevronDown, Plus, X } from "../../icons";
import { FieldHelp, FieldLabel, ReadOnlyLock, fieldBox, fieldRoot, listPopoverClass, optionClass, requiredText, sectionHeaderClass, type FieldBaseProps } from "../Field/Field";

export interface ComboBoxItem {
  id: string;
  label: string;
  /** Texte court en `--fg-3`, sur la même ligne (D-146). */
  description?: string;
  /** Icône de 16 px, à gauche (D-047). */
  icon?: ReactNode;
  isDisabled?: boolean;
  /** Titre de la section ; les éléments qui le partagent sont groupés. */
  section?: string;
}

interface ComboBoxBaseProps extends FieldBaseProps {
  /** Lecture seule (D-131). */
  isReadOnly?: boolean;
  /** Texte d'aide dans le champ vide. */
  placeholder?: string;
  /** Source locale : filtrée à chaque lettre (D-145). */
  items?: ComboBoxItem[];
  /** Source asynchrone : à partir de 2 caractères, après 300 ms ; `signal` abandonne une demande périmée (D-145). */
  loadItems?: (text: string, signal: AbortSignal) => Promise<ComboBoxItem[]>;
  /** Source asynchrone : éléments déjà choisis, pour afficher leur libellé. */
  selectedItems?: ComboBoxItem[];
  /** Ligne « Ajouter « texte » » (D-142). */
  allowsCustomValue?: boolean;
  /** Crée l'élément pour « Ajouter » ; sans elle, l'id et le libellé sont le texte (D-142). */
  onCreate?: (text: string) => ComboBoxItem | Promise<ComboBoxItem>;
}

export interface ComboBoxSingleProps extends ComboBoxBaseProps {
  selectionMode?: "single";
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** Renvoie la phrase qui dit quoi corriger, ou rien (D-132). */
  validate?: (value: string | null) => string | null | undefined;
}

export interface ComboBoxMultipleProps extends ComboBoxBaseProps {
  selectionMode: "multiple";
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  validate?: (value: string[]) => string | null | undefined;
}

export type ComboBoxProps = ComboBoxSingleProps | ComboBoxMultipleProps;

/** Seuils de la recherche distante, communs avec la barre de recherche (D-080, D-145). */
const MIN_CHARS = 2;
const DELAY = 300;

/** Validité « vide », complétée selon la vérification (D-132). */
const VALID: ValidityState = {
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valid: true,
  valueMissing: false,
};
type Verdict = { missing: boolean; custom: string | null };

type Row = { kind: "add"; text: string } | { kind: "item"; item: ComboBoxItem };
type AsyncState = { status: "short" } | { status: "loading" } | { status: "error" } | { status: "done"; items: ComboBoxItem[] };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Met en gras le texte cherché, sans casse ni accents (D-087). */
function highlight(text: string, query: string): ReactNode {
  const q = norm(query.trim());
  if (!q) return text;
  const chars = Array.from(text);
  const starts: number[] = [];
  let flat = "";
  for (const c of chars) {
    starts.push(flat.length);
    flat += norm(c);
  }
  const at = flat.indexOf(q);
  if (at < 0) return text;
  const from = starts.findIndex((s) => s >= at);
  let to = starts.findIndex((s) => s >= at + q.length);
  if (to < 0) to = chars.length;
  return (
    <>
      {chars.slice(0, from).join("")}
      <strong className="font-semibold">{chars.slice(from, to).join("")}</strong>
      {chars.slice(to).join("")}
    </>
  );
}

let createdSeq = 0;

export function ComboBox(props: ComboBoxProps) {
  const {
    label,
    hideLabel = false,
    description,
    isRequired = false,
    requiredMessage,
    error,
    isDisabled = false,
    isReadOnly = false,
    width = "full",
    name,
    placeholder,
    items,
    loadItems,
    selectedItems,
    allowsCustomValue = false,
    onCreate,
  } = props;
  const multiple = props.selectionMode === "multiple";
  const m = useMessages();
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listId = `${baseId}-list`;
  const labelId = `${baseId}-label`;
  const helpId = `${baseId}-help`;
  const errId = `${baseId}-error`;
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* ---------- Valeur (contrôlée ou non) ---------- */
  const toIds = (v: string | string[] | null | undefined): string[] => (Array.isArray(v) ? v : v ? [v] : []);
  const [ownIds, setOwnIds] = useState<string[]>(() => toIds(props.defaultValue));
  const ids = props.value !== undefined ? toIds(props.value) : ownIds;
  const setIds = (next: string[]) => {
    if (props.value === undefined) setOwnIds(next);
    if (props.selectionMode === "multiple") props.onChange?.(next);
    else props.onChange?.(next[0] ?? null);
  };

  /* ---------- Éléments connus, pour retrouver les libellés ---------- */
  const known = useRef(new Map<string, ComboBoxItem>());
  for (const it of items ?? []) known.current.set(it.id, it);
  for (const it of selectedItems ?? []) known.current.set(it.id, it);
  const labelOf = (id: string) => known.current.get(id)?.label ?? id;
  const selectedLabel = !multiple && ids[0] ? labelOf(ids[0]) : "";

  /* ---------- Texte, liste ---------- */
  const [text, setText] = useState(selectedLabel);
  const [typed, setTyped] = useState(false); // le texte vient de la frappe : il filtre
  const [open, setOpen] = useState(false);
  const [hlState, setHlState] = useState<{ key: string; i: number }>({ key: "", i: -1 });
  const [armed, setArmed] = useState<number | null>(null); // étiquette mise en avant (D-147)
  const [focused, setFocused] = useState(false);

  // En choix simple, le texte suit la valeur quand on n'est pas en train de taper.
  useEffect(() => {
    if (!multiple && !focused) setText(selectedLabel);
  }, [multiple, focused, selectedLabel]);

  /* ---------- Source asynchrone (D-145, D-081, D-082) ---------- */
  const [remote, setRemote] = useState<AsyncState>({ status: "short" });
  const abort = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const load = useCallback(
    (q: string) => {
      if (!loadItems) return;
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      setRemote({ status: "loading" });
      Promise.resolve()
        .then(() => loadItems(q, ctrl.signal))
        .then((found) => {
          if (ctrl.signal.aborted) return; // seule la réponse à la dernière saisie compte
          for (const it of found) known.current.set(it.id, it);
          setRemote({ status: "done", items: found });
        })
        .catch(() => {
          if (!ctrl.signal.aborted) setRemote({ status: "error" });
        });
    },
    [loadItems],
  );
  const request = (q: string) => {
    if (!loadItems) return;
    clearTimeout(timer.current);
    abort.current?.abort();
    if (q.trim().length < MIN_CHARS) {
      setRemote({ status: "short" });
      return;
    }
    setRemote({ status: "loading" });
    timer.current = setTimeout(() => load(q.trim()), DELAY);
  };
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      abort.current?.abort();
    },
    [],
  );

  /* ---------- Lignes de la liste ---------- */
  const query = typed ? text.trim() : "";
  const found: ComboBoxItem[] = useMemo(() => {
    if (loadItems) return remote.status === "done" ? remote.items : [];
    const q = norm(query);
    return (items ?? []).filter((it) => !q || norm(it.label).includes(q));
  }, [items, loadItems, remote, query]);
  const rows: Row[] = useMemo(() => {
    const r: Row[] = [];
    const exact = found.some((it) => norm(it.label) === norm(query));
    const ready = !loadItems || remote.status === "done" || remote.status === "error";
    if (allowsCustomValue && query && !exact && ready) r.push({ kind: "add", text: query });
    for (const it of found) r.push({ kind: "item", item: it });
    return r;
  }, [found, query, allowsCustomValue, loadItems, remote.status]);
  const enabled = (i: number) => {
    const row = rows[i];
    return row !== undefined && !(row.kind === "item" && row.item.isDisabled);
  };
  /** Le premier élément trouvé est mis en avant ; « Ajouter » seulement s'il n'y en a aucun (D-142). */
  const firstHl = (list: Row[]) => {
    const i = list.findIndex((r) => r.kind === "item" && !r.item.isDisabled);
    return i >= 0 ? i : list.length ? 0 : -1;
  };
  // La mise en avant vaut pour un jeu de lignes : quand les lignes changent, on revient au défaut
  // (le premier élément trouvé si l'on a tapé, rien sinon), sans attendre un effet.
  const rowsKey = `${query}|${rows.map((r) => (r.kind === "add" ? "+" : r.item.id)).join(",")}`;
  const hl = hlState.key === rowsKey ? hlState.i : query ? firstHl(rows) : -1;
  const setHl = (i: number) => setHlState({ key: rowsKey, i });

  const openList = () => {
    if (isReadOnly || isDisabled) return;
    setOpen(true);
    if (!typed) request("");
  };
  const closeList = () => {
    setOpen(false);
    setHl(-1);
  };

  /* ---------- Vérification (D-132) ---------- */
  const value = multiple ? ids : (ids[0] ?? null);
  const check: Verdict = (() => {
    if (isRequired && ids.length === 0) return { missing: true, custom: null };
    const v = props.validate as ((v: string | string[] | null) => string | null | undefined) | undefined;
    return { missing: false, custom: v?.(value) ?? null };
  })();
  const checkText = check.missing ? requiredText(m, "choice", label, requiredMessage) : check.custom;
  const [dirty, setDirty] = useState(false);
  const [shown, setShown] = useState<Verdict | null>(null); // vérification affichée, figée jusqu'à la prochaine sortie (D-132)
  const isInvalid = Boolean(error) || Boolean(shown && (shown.missing || shown.custom));
  const validation: ValidationResult = {
    isInvalid,
    validationErrors: error ? [error] : shown?.custom ? [shown.custom] : [],
    validationDetails: isInvalid ? { ...VALID, valid: false, valueMissing: !error && Boolean(shown?.missing), customError: Boolean(error || shown?.custom) } : VALID,
  };
  // Le champ natif porte la vérification : l'envoi du formulaire déclenche l'événement `invalid`.
  useEffect(() => {
    inputRef.current?.setCustomValidity(error ?? checkText ?? "");
  }, [error, checkText]);

  /* ---------- Actions ---------- */
  const choose = async (i: number) => {
    const row = rows[i];
    if (!row || !enabled(i)) return;
    let item: ComboBoxItem;
    if (row.kind === "add") {
      item = onCreate ? await onCreate(row.text) : { id: `${row.text}#${++createdSeq}`, label: row.text };
      known.current.set(item.id, item);
    } else item = row.item;
    setDirty(true);
    if (multiple) {
      setIds(ids.includes(item.id) ? ids.filter((x) => x !== item.id) : [...ids, item.id]);
      setText("");
      setTyped(false);
      setArmed(null);
      if (loadItems) request("");
      // La liste reste ouverte (D-144).
    } else {
      setIds([item.id]);
      setText(item.label);
      setTyped(false);
      closeList();
    }
    inputRef.current?.focus();
  };
  const remove = (index: number) => {
    setDirty(true);
    setIds(ids.filter((_, i) => i !== index));
    setArmed(null);
    inputRef.current?.focus();
  };
  const restoreText = () => {
    setText(multiple ? "" : selectedLabel);
    setTyped(false);
  };

  const move = (dir: 1 | -1) => {
    const n = rows.length;
    if (!n) return;
    let i = hl;
    for (let step = 0; step < n; step++) {
      i = i < 0 ? (dir > 0 ? 0 : n - 1) : (i + dir + n) % n;
      if (enabled(i)) {
        setHl(i);
        return;
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const atStart = e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) openList();
      else move(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Enter") {
      if (open && hl >= 0) {
        e.preventDefault();
        void choose(hl);
      }
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        closeList();
      } else if (typed || text !== (multiple ? "" : selectedLabel)) {
        e.preventDefault();
        restoreText();
      }
    } else if (multiple && ids.length && (e.key === "Backspace" || e.key === "Delete") && (armed !== null || (!text && e.key === "Backspace"))) {
      e.preventDefault();
      if (armed !== null) remove(armed);
      else setArmed(ids.length - 1);
    } else if (multiple && ids.length && e.key === "ArrowLeft" && (armed !== null || atStart)) {
      e.preventDefault();
      setArmed(armed === null ? ids.length - 1 : Math.max(0, armed - 1));
    } else if (multiple && armed !== null && e.key === "ArrowRight") {
      e.preventDefault();
      setArmed(armed < ids.length - 1 ? armed + 1 : null);
    } else if (e.key === "Tab") {
      closeList();
    } else setArmed(null);
  };

  const onBlur = () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (rootRef.current?.contains(active) || listRef.current?.contains(active)) return;
      setFocused(false);
      closeList();
      setArmed(null);
      restoreText(); // la valeur ne change jamais sans un choix (D-147)
      if (dirty) setShown(check);
    }, 0);
  };

  const checkRef = useRef(check);
  checkRef.current = check;
  // Envoi du formulaire : l'erreur s'affiche ; le premier champ en erreur reçoit le focus (D-132).
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const onInvalid = (e: Event) => {
      e.preventDefault();
      setShown(checkRef.current);
      if (input.form?.querySelector(":invalid") === input) input.focus();
    };
    input.addEventListener("invalid", onInvalid);
    return () => input.removeEventListener("invalid", onInvalid);
  }, []);

  /* ---------- Rendu ---------- */
  const hasIcon = rows.some((r) => r.kind === "item" && r.item.icon);
  const activeId = open && hl >= 0 ? `${listId}-${hl}` : undefined;
  const loading = Boolean(loadItems) && open && remote.status === "loading";
  const describedBy = [description && !isInvalid ? helpId : null, isInvalid ? errId : null].filter(Boolean).join(" ") || undefined;
  const [hovered, setHovered] = useState(false);

  return (
    <div ref={rootRef} className={fieldRoot(width)} data-disabled={isDisabled || undefined} data-invalid={isInvalid || undefined}>
      <LabelContext.Provider value={{ htmlFor: inputId, id: labelId }}>
        <FieldLabel isRequired={isRequired} hidden={hideLabel}>
          {label}
        </FieldLabel>
      </LabelContext.Provider>
      <div
        ref={frameRef}
        data-focused={focused || undefined}
        data-hovered={(hovered && !isDisabled) || undefined}
        data-invalid={isInvalid || undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !isDisabled) {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
        className={cx(fieldBox({ isReadOnly }), "relative flex min-h-(--row-h) cursor-text items-center gap-1 pl-2.5", isReadOnly ? "pr-8" : "pr-[3px]", multiple && "flex-wrap py-[3px]")}
      >
        {multiple && ids.length > 0 && (
          <span role="group" aria-label={m.chosenItems(label)} className="contents">
            {ids.map((id, i) => (
              <span
                key={id}
                className={cx(
                  "inline-flex h-[calc(var(--row-h)-10px)] max-w-[200px] shrink-0 items-center gap-0.5 rounded-sm bg-selected text-sm text-fg",
                  isReadOnly ? "px-1.5" : "pl-1.5",
                  armed === i && "outline-2 outline-focus outline-solid",
                )}
              >
                <span className="truncate" title={labelOf(id)}>
                  {labelOf(id)}
                </span>
                {!isReadOnly && (
                  <button
                    type="button"
                    tabIndex={-1}
                    disabled={isDisabled}
                    aria-label={m.removeItem(labelOf(id))}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => remove(i)}
                    className={cx(buttonReset, "inline-grid size-[18px] place-items-center rounded-[3px] text-fg-2 hover:bg-line-strong hover:text-fg")}
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
          </span>
        )}
        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-describedby={describedBy}
          aria-labelledby={labelId}
          aria-invalid={isInvalid || undefined}
          aria-required={isRequired || undefined}
          autoComplete="off"
          disabled={isDisabled}
          readOnly={isReadOnly}
          placeholder={multiple && ids.length ? "" : placeholder}
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            setTyped(true);
            setArmed(null);
            setDirty(true);
            if (!isReadOnly) setOpen(true);
            request(v);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={onBlur}
          className="h-[calc(var(--row-h)-2px)] min-w-[60px] flex-1 border-0 bg-transparent p-0 px-0.5 font-[inherit] text-[length:inherit] text-fg outline-none placeholder:text-fg-3"
        />
        <span className="ml-auto flex shrink-0 items-center gap-0.5 self-center">
          {loading && <span role="status" aria-label={m.searching} className="socle-spin size-3.5 shrink-0 rounded-full border-2 border-line-strong border-t-fg-2" />}
          {isReadOnly ? null : (
            <button
              type="button"
              tabIndex={-1}
              disabled={isDisabled}
              aria-label={m.showChoices}
              aria-expanded={open}
              onMouseDown={(e) => {
                e.preventDefault();
                inputRef.current?.focus();
                if (open) closeList();
                else openList();
              }}
              className={cx(buttonReset, "inline-grid size-6 place-items-center rounded-sm text-fg-2 hover:bg-hover hover:text-fg")}
            >
              <ChevronDown />
            </button>
          )}
        </span>
        {isReadOnly && <ReadOnlyLock />}
      </div>
      <TextContext.Provider value={{ slots: { description: { id: helpId }, errorMessage: { id: errId } } }}>
        <FieldErrorContext.Provider value={validation}>
          <FieldHelp description={description} error={error} kind="choice" label={label} requiredMessage={requiredMessage} />
        </FieldErrorContext.Provider>
      </TextContext.Provider>
      {name && (multiple ? ids : ids.slice(0, 1)).map((id) => <input key={id} type="hidden" name={name} value={id} />)}
      <Popover
        triggerRef={frameRef}
        isOpen={open}
        onOpenChange={(o) => !o && closeList()}
        isNonModal
        placement="bottom start"
        offset={4}
        containerPadding={8}
        className={listPopoverClass.replace("max-h-80", "max-h-[calc(var(--row-h)*8+10px)]")}
      >
        <div ref={listRef} id={listId} role="listbox" aria-label={label} aria-multiselectable={multiple || undefined} onMouseDown={(e) => e.preventDefault()}>
          {rows.map((row, i) => {
            if (row.kind === "add")
              return (
                <Option key="add" id={`${listId}-${i}`} active={hl === i} onHover={() => setHl(i)} onChoose={() => void choose(i)}>
                  <Plus className="shrink-0 text-fg-2" />
                  <span className="truncate">{m.addValue(row.text)}</span>
                </Option>
              );
            const it = row.item;
            const prev = rows[i - 1];
            const section = it.section && (prev?.kind !== "item" || prev.item.section !== it.section) ? it.section : null;
            const sel = ids.includes(it.id);
            return (
              <Fragment key={it.id}>
                {section && (
                  <div role="presentation" className={sectionHeaderClass}>
                    {section}
                  </div>
                )}
                <Option id={`${listId}-${i}`} active={hl === i} selected={sel} disabled={it.isDisabled ?? false} onHover={() => !it.isDisabled && setHl(i)} onChoose={() => void choose(i)}>
                  {hasIcon && <span className="inline-flex size-4 shrink-0 text-fg-2">{it.icon}</span>}
                  <span className="min-w-0 shrink truncate">{highlight(it.label, query)}</span>
                  {it.description && <span className="min-w-0 flex-1 shrink-[2] truncate text-sm text-fg-3">{highlight(it.description, query)}</span>}
                  <Check className={cx("ml-auto shrink-0 text-fg", !sel && "invisible")} />
                </Option>
              </Fragment>
            );
          })}
          {loadItems && remote.status === "short" && <Info>{m.typeMoreChars(MIN_CHARS)}</Info>}
          {loadItems && remote.status === "loading" && (
            <Info role="status">
              <span className="socle-spin size-3.5 rounded-full border-2 border-line-strong border-t-fg-2" />
              {m.searchingRow}
            </Info>
          )}
          {loadItems && remote.status === "error" && (
            <Info role="alert">
              {m.resultsUnavailable}
              <button type="button" onClick={() => load(query)} className={cx(buttonReset, "ml-auto rounded-sm px-1 text-accent-text hover:underline")}>
                {m.retry}
              </button>
            </Info>
          )}
          {rows.length === 0 && (!loadItems || remote.status === "done") && <Info>{m.noResults}</Info>}
        </div>
      </Popover>
    </div>
  );
}

function Info({ role, children }: { role?: "status" | "alert"; children: ReactNode }) {
  return (
    <div role={role} className="flex h-(--row-h) items-center gap-2 px-2.5 text-sm text-fg-3">
      {children}
    </div>
  );
}

function Option({
  id,
  active,
  selected = false,
  disabled = false,
  onHover,
  onChoose,
  children,
}: {
  id: string;
  active: boolean;
  selected?: boolean;
  disabled?: boolean;
  onHover: () => void;
  onChoose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      onMouseMove={onHover}
      onClick={disabled ? undefined : onChoose}
      data-focused={active || undefined}
      data-disabled={disabled || undefined}
      className={cx(optionClass, "text-fg")}
    >
      {children}
    </div>
  );
}
