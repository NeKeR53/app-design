/*
 * Code à usage unique : un seul vrai champ, cases dessinées. Spec : CodeField.spec.md.
 * Validation : docs/validation/components/Nouveaux-P4-v1.html (K1, option A). Décision : D-363 ;
 * anatomie des champs : Field.spec.md (D-130 à D-134).
 * Le champ natif, transparent, couvre les cases : il reçoit le focus, le clavier, le collage et le
 * remplissage automatique (`autocomplete="one-time-code"`). Les cases ne font que refléter sa valeur.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type MouseEvent } from "react";
import { FieldErrorContext } from "react-aria-components/FieldError";
import { LabelContext } from "react-aria-components/Label";
import { TextContext } from "react-aria-components/Text";
import type { ValidationResult } from "react-aria-components/TextField";
import { useMessages } from "../../provider/SocleProvider";
import { cx } from "../../lib/cx";
import { FieldHelp, FieldLabel, requiredText, type FieldBaseProps } from "../Field/Field";

export interface CodeFieldProps extends Omit<FieldBaseProps, "width"> {
  /** Nombre de cases, de 4 à 8. Défaut : 6. */
  length?: number;
  /** `numeric` (défaut) : chiffres seuls, clavier numérique ; `alphanumeric` : lettres et chiffres. */
  type?: "numeric" | "alphanumeric";
  value?: string;
  defaultValue?: string;
  /** À chaque changement ; l'app y efface son `error` quand la valeur n'est pas vide (le vidage sur erreur appelle aussi `onChange("")`). */
  onChange?: (value: string) => void;
  /** Quand toutes les cases sont remplies, avec le code complet. */
  onComplete?: (code: string) => void;
  /** À une nouvelle erreur (`error`), le code se vide et le focus revient à la première case. Défaut : true. */
  clearOnError?: boolean;
  /** Lecture seule (D-131). */
  isReadOnly?: boolean;
  autoFocus?: boolean;
}

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

/** Case : 34 px de large, hauteur `--row-h` + 12 px, bord marqué, rayon 8 px, chiffres de 18 px à chasse fixe. */
const CELL =
  "socle-box grid h-[calc(var(--row-h)+12px)] w-[34px] shrink-0 place-items-center rounded-md border text-[18px] leading-none text-fg tabular-nums transition-colors duration-[var(--dur-fast)] ease-standard";

export function CodeField({
  label,
  hideLabel = false,
  description,
  isRequired = false,
  requiredMessage,
  error,
  isDisabled = false,
  isReadOnly = false,
  name,
  length: rawLength = 6,
  type = "numeric",
  value,
  defaultValue,
  onChange,
  onComplete,
  clearOnError = true,
  autoFocus,
}: CodeFieldProps) {
  const m = useMessages();
  const length = Math.min(8, Math.max(4, Math.round(rawLength)));
  const keep = (s: string) => s.replace(type === "numeric" ? /[^0-9]/g : /[^0-9A-Za-z]/g, "").slice(0, length);
  const allowed = (c: string) => (type === "numeric" ? /^[0-9]$/ : /^[0-9A-Za-z]$/).test(c);

  const baseId = useId();
  const inputId = `${baseId}-input`;
  const labelId = `${baseId}-label`;
  const helpId = `${baseId}-help`;
  const errId = `${baseId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const cellsRef = useRef<HTMLDivElement>(null);

  /* ---------- Valeur (contrôlée ou non) ---------- */
  const [own, setOwn] = useState(() => keep(defaultValue ?? ""));
  const code = value !== undefined ? keep(value) : own;
  /** Case active : là où va le prochain caractère ; jamais après la première case vide. */
  const [posState, setPos] = useState(code.length);
  const pos = Math.min(posState, code.length, length - 1);
  const [focused, setFocused] = useState(false);

  /* ---------- Vérification (D-132) ---------- */
  const check = code.length === 0 ? (isRequired ? requiredText(m, "text", label, requiredMessage) : null) : code.length < length ? m.codeIncomplete(length, type === "numeric") : null;
  const [dirty, setDirty] = useState(false);
  const [shown, setShown] = useState<string | null>(null); // vérification affichée, jusqu'au code complet ou à la prochaine sortie
  const errorShown = error ?? shown ?? undefined;
  const isInvalid = Boolean(errorShown);
  const validation: ValidationResult = {
    isInvalid,
    validationErrors: errorShown ? [errorShown] : [],
    validationDetails: isInvalid ? { ...VALID, valid: false, customError: true } : VALID,
  };

  const commit = (next: string, nextPos: number) => {
    if (value === undefined) setOwn(next);
    setPos(nextPos);
    setDirty(true);
    if (next === code) return;
    onChange?.(next);
    if (next.length === length) {
      setShown(null);
      onComplete?.(next);
    }
  };

  /* ---------- Nouvelle erreur : le code se vide, le focus revient au début (D-363) ---------- */
  const lastError = useRef(error);
  useEffect(() => {
    if (error && error !== lastError.current && clearOnError) {
      if (value === undefined) setOwn("");
      if (code) onChange?.("");
      setPos(0);
      inputRef.current?.focus();
    }
    lastError.current = error;
    // Seul le changement d'erreur déclenche l'effacement.
  }, [error]);

  // Le curseur natif suit la case active : une saisie que le clavier ne signale pas (mobile) arrive au bon endroit.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) input.setSelectionRange(pos, pos);
  }, [pos, code, focused]);

  /* ---------- Clavier ---------- */
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const edit = !isReadOnly;
    if (e.key === "ArrowLeft") setPos(Math.max(0, pos - 1));
    else if (e.key === "ArrowRight") setPos(Math.min(pos + 1, code.length, length - 1));
    else if (e.key === "Home" || e.key === "ArrowUp") setPos(0);
    else if (e.key === "End" || e.key === "ArrowDown") setPos(Math.min(code.length, length - 1));
    else if (e.key === "Backspace") {
      // Case active remplie : on l'efface ; sinon on efface la précédente et on recule.
      if (edit && pos < code.length) commit(code.slice(0, pos) + code.slice(pos + 1), pos);
      else if (edit && pos > 0) commit(code.slice(0, pos - 1) + code.slice(pos), pos - 1);
    } else if (e.key === "Delete") {
      if (edit && pos < code.length) commit(code.slice(0, pos) + code.slice(pos + 1), pos);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Un caractère remplace celui de la case active, puis on avance.
      if (edit && allowed(e.key)) commit(code.slice(0, pos) + e.key + code.slice(pos + 1), Math.min(pos + 1, length - 1));
    } else return;
    e.preventDefault();
  };

  // Le collage remplit toutes les cases depuis la première ; espaces et tirets sont ignorés.
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isReadOnly) return;
    const next = keep(e.clipboardData.getData("text"));
    if (next) commit(next, Math.min(next.length, length - 1));
  };

  // Un clic place la case active sous le pointeur, sans dépasser la première case vide.
  const onMouseUp = (e: MouseEvent<HTMLInputElement>) => {
    const cells = Array.from(cellsRef.current?.children ?? []);
    const i = cells.findIndex((c) => e.clientX < c.getBoundingClientRect().right + 3);
    setPos(Math.min(i < 0 ? length - 1 : i, code.length));
  };

  /* ---------- Envoi du formulaire (D-132) ---------- */
  useEffect(() => {
    inputRef.current?.setCustomValidity(error ?? check ?? "");
  }, [error, check]);
  const checkRef = useRef(check);
  checkRef.current = check;
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

  /* ---------- « 3 sur 6 », lu poliment à chaque changement ---------- */
  const [said, setSaid] = useState("");
  const lastLength = useRef(code.length);
  useEffect(() => {
    if (code.length === lastLength.current) return;
    lastLength.current = code.length;
    setSaid(m.codeProgress(code.length, length));
  }, [code.length, length, m]);

  const describedBy = [description && !isInvalid ? helpId : null, isInvalid ? errId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="socle-box group/field flex w-fit max-w-full min-w-0 flex-col gap-1 font-sans text-md text-fg data-disabled:opacity-40" data-disabled={isDisabled || undefined} data-invalid={isInvalid || undefined}>
      <LabelContext.Provider value={{ htmlFor: inputId, id: labelId }}>
        <FieldLabel isRequired={isRequired} hidden={hideLabel} isReadOnly={isReadOnly}>
          {label}
        </FieldLabel>
      </LabelContext.Provider>
      <div className="group/cells relative w-fit">
        <div ref={cellsRef} aria-hidden className="flex gap-1.5">
          {Array.from({ length }, (_, i) => (
            <div
              key={i}
              data-active={(focused && i === pos) || undefined}
              className={cx(
                CELL,
                isReadOnly ? "border-line bg-surface-side" : cx("bg-surface", isInvalid ? "border-danger" : "border-line-strong group-hover/cells:border-fg-3"),
                "data-active:outline-2 data-active:outline-solid data-active:outline-focus data-active:outline-offset-1",
              )}
            >
              {code[i] ?? ""}
            </div>
          ))}
        </div>
        <input
          ref={inputRef}
          id={inputId}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-invalid={isInvalid || undefined}
          aria-required={isRequired || undefined}
          type="text"
          inputMode={type === "numeric" ? "numeric" : "text"}
          autoComplete="one-time-code"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          pattern={type === "numeric" ? "[0-9]*" : undefined}
          maxLength={length}
          name={name}
          value={code}
          disabled={isDisabled}
          readOnly={isReadOnly}
          autoFocus={autoFocus}
          onChange={(e) => {
            // Saisie non signalée au clavier (mobile, remplissage automatique) : la valeur du champ fait foi.
            const next = keep(e.target.value);
            commit(next, Math.min(e.target.selectionStart ?? next.length, next.length, length - 1));
          }}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onMouseUp={onMouseUp}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            if (dirty && code.length < length) setShown(check);
          }}
          className="absolute inset-0 m-0 h-full w-full cursor-text border-0 bg-transparent p-0 text-[16px] text-transparent caret-transparent opacity-0 outline-none disabled:cursor-default"
        />
      </div>
      <TextContext.Provider value={{ slots: { description: { id: helpId }, errorMessage: { id: errId } } }}>
        <FieldErrorContext.Provider value={validation}>
          <FieldHelp description={description} error={errorShown} label={label} requiredMessage={requiredMessage} />
        </FieldErrorContext.Provider>
      </TextContext.Provider>
      <span aria-live="polite" className="sr-only">
        {said}
      </span>
    </div>
  );
}
