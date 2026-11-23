/*
 * Texte modifiable sur place. Spec : InlineEdit.spec.md.
 * Décisions : D-322 (apparence), D-323 (clavier et enregistrement), D-324 (texte seulement).
 * Le champ reprend les pièces internes de Field (D-130) ; il garde la police du texte affiché.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { FieldError } from "react-aria-components/FieldError";
import { Input, TextArea, TextField } from "react-aria-components/TextField";
import { useMessages } from "../../provider/SocleProvider";
import { cx } from "../../lib/cx";
import { FieldLabel, fieldBox } from "../Field/Field";

export interface InlineEditProps {
  /** Valeur affichée et valeur de départ de la saisie. */
  value: string;
  /** Nom du champ : nom accessible de la saisie et du bouton « Modifier « libellé » ». */
  label: string;
  /**
   * Enregistre la nouvelle valeur. Une promesse : le champ attend ; rejetée, la saisie reste
   * ouverte avec sa valeur et un message (D-323). Pas appelée si la valeur n'a pas changé.
   */
  onSave: (value: string) => void | Promise<unknown>;
  /** `line` : Entrée enregistre. `multiline` : Entrée passe à la ligne, Mod+Entrée enregistre. */
  mode?: "line" | "multiline";
  /** Texte d'invite d'une valeur vide, en gris (D-322). */
  placeholder?: string;
  /** Valeur vide refusée (D-132). */
  isRequired?: boolean;
  /** Vérification : renvoie la phrase qui dit quoi corriger, ou null (D-132). */
  validate?: (value: string) => string | null | undefined;
  /** Texte simple, sans saisie. */
  isDisabled?: boolean;
  /** Ouverture pilotée par l'app (par exemple « Renommer » dans un menu), avec `onEditingChange`. */
  isEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  maxLength?: number;
}

/** Même boîte au repos et en saisie : le texte ne bouge pas à l'ouverture (D-322). */
const box = "-mx-[7px] -my-[3px] rounded-md border px-1.5 py-0.5";

export function InlineEdit({
  value,
  label,
  onSave,
  mode = "line",
  placeholder,
  isRequired,
  validate,
  isDisabled = false,
  isEditing,
  onEditingChange,
  maxLength,
}: InlineEditProps) {
  const m = useMessages();
  const [ownEditing, setOwnEditing] = useState(false);
  const editing = !isDisabled && (isEditing ?? ownEditing);
  const trigger = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  const setEditing = (next: boolean) => {
    if (isEditing === undefined) setOwnEditing(next);
    onEditingChange?.(next);
  };

  // Après Entrée ou Échap, le focus revient à la valeur (D-323).
  useEffect(() => {
    if (editing || !returnFocus.current) return;
    returnFocus.current = false;
    trigger.current?.focus();
  }, [editing]);

  const empty = value.trim() === "";
  const text = (
    <span className={cx("block min-w-0 break-words", mode === "multiline" && "whitespace-pre-wrap", empty && "text-fg-3")}>
      {empty ? (placeholder ?? "—") : value}
    </span>
  );

  if (isDisabled) return <span className="block min-w-0">{text}</span>;

  if (editing)
    return (
      <Editor
        value={value}
        label={label}
        mode={mode}
        onSave={onSave}
        isRequired={isRequired}
        validate={validate}
        maxLength={maxLength}
        onClose={(focus) => {
          returnFocus.current = focus;
          setEditing(false);
        }}
      />
    );

  return (
    <span
      className={cx(
        "socle-box relative block min-w-0 border-transparent hover:border-line-strong",
        "has-[button:focus-visible]:border-accent has-[button:focus-visible]:outline-1 has-[button:focus-visible]:outline-solid has-[button:focus-visible]:outline-accent",
        box,
      )}
      onClick={(e) => {
        // Une sélection de texte dans la valeur reste une sélection.
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.anchorNode && e.currentTarget.contains(sel.anchorNode)) return;
        setEditing(true);
      }}
    >
      {text}
      <button
        ref={trigger}
        type="button"
        className="sr-only"
        aria-keyshortcuts="F2"
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        onKeyDown={(e) => {
          if (e.key !== "F2") return;
          e.preventDefault();
          setEditing(true);
        }}
      >
        {m.editValue(label)}
      </button>
    </span>
  );
}

function Editor({
  value,
  label,
  mode,
  onSave,
  isRequired,
  validate,
  maxLength,
  onClose,
}: Required<Pick<InlineEditProps, "value" | "label" | "mode" | "onSave">> &
  { isRequired: boolean | undefined; validate: InlineEditProps["validate"] | undefined; maxLength: number | undefined } & { onClose: (returnFocus: boolean) => void }) {
  const m = useMessages();
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Fermé, ou en cours d'enregistrement : le blur qui suit n'enregistre rien de plus.
  const done = useRef(false);
  const draftRef = useRef(value);
  const root = useRef<HTMLDivElement>(null);

  // Le champ perd le focus avant de disparaître : son blur ne tombe pas pendant le rendu de React.
  const finish = (focus: boolean) => {
    done.current = true;
    const active = document.activeElement;
    if (active instanceof HTMLElement && root.current?.contains(active)) active.blur();
    onClose(focus);
  };

  const check = (v: string) => {
    if (isRequired && v.trim() === "") return m.requiredField;
    return validate?.(v) ?? null;
  };

  const commit = async (focus: boolean) => {
    if (done.current) return;
    const next = mode === "line" ? draftRef.current.trim() : draftRef.current.replace(/\s+$/, "");
    if (next === value) return finish(focus);
    const problem = check(next);
    if (problem) {
      setError(problem);
      return;
    }
    done.current = true;
    setError(null);
    try {
      const result = onSave(next);
      if (result && typeof (result as Promise<unknown>).then === "function") {
        setPending(true);
        await result;
      }
      finish(focus);
    } catch {
      // La saisie reste ouverte avec sa valeur (D-323).
      done.current = false;
      setPending(false);
      setError(m.actionFailed);
    }
  };

  const cancel = () => {
    if (done.current) return;
    finish(true);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cancel();
      return;
    }
    if (e.key !== "Enter" || e.shiftKey) return;
    if (mode === "multiline" && !(e.metaKey || e.ctrlKey)) return;
    e.preventDefault();
    void commit(true);
  };

  const lines = draft.split("\n").length;
  const fieldClass = cx(fieldBox({ isReadOnly: false }), box, "block w-[calc(100%+14px)] max-w-none", pending && "cursor-progress");
  const font = { font: "inherit", color: "inherit" } as const;

  return (
    <TextField
      ref={root}
      value={draft}
      onChange={(v) => {
        draftRef.current = v;
        setDraft(v);
        if (error) setError(null);
      }}
      isReadOnly={pending}
      isInvalid={Boolean(error)}
      autoFocus
      {...(maxLength !== undefined ? { maxLength } : {})}
      onBlur={() => void commit(false)}
      className="socle-box group/field flex min-w-0 flex-col gap-1"
    >
      <FieldLabel hidden isRequired>
        {label}
      </FieldLabel>
      {mode === "multiline" ? (
        <TextArea rows={Math.min(10, Math.max(2, lines))} className={cx(fieldClass, "resize-none")} style={font} onKeyDown={onKeyDown} aria-busy={pending || undefined} />
      ) : (
        <Input className={fieldClass} style={font} onKeyDown={onKeyDown} aria-busy={pending || undefined} />
      )}
      <FieldError className="text-sm text-danger">{error}</FieldError>
    </TextField>
  );
}
