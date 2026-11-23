/*
 * Champ de texte sur plusieurs lignes, qui grandit avec le texte. Spec : TextArea.spec.md.
 * Décisions : D-022, D-130 à D-133 ; D-343 (limite dépassable) et D-344 (message d'obligation). Adapté du starter Tailwind de React Aria (Apache 2.0).
 */
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { TextArea as RACTextArea, TextField as RACTextField } from "react-aria-components/TextField";
import { useMessages } from "../../provider/SocleProvider";
import { cx } from "../../lib/cx";
import { CharCount, FieldHelp, FieldLabel, ReadOnlyLock, defined, fieldBox, fieldRoot, withMaxLength, type FieldBaseProps } from "../Field/Field";

export interface TextAreaProps extends FieldBaseProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  /** Vérification de la valeur : renvoie la phrase qui dit quoi corriger, ou null (D-132). */
  validate?: (value: string) => string | null | undefined;
  /** Lecture seule (D-131). */
  isReadOnly?: boolean;
  placeholder?: string;
  /** Longueur maximale, dépassable ; affiche le compteur ; au-delà, compteur en erreur et valeur refusée (D-343). */
  maxLength?: number;
  /** Hauteur de départ, en lignes (D-133). Défaut : 3. */
  minRows?: number;
  /** Hauteur maximale, en lignes ; au-delà, le texte défile (D-133). Défaut : 10. */
  maxRows?: number;
}

/** Ajuste la hauteur au texte, entre minRows et maxRows lignes (D-133). */
function fit(el: HTMLTextAreaElement, minRows: number, maxRows: number) {
  const cs = getComputedStyle(el);
  const line = parseFloat(cs.lineHeight);
  const extra = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
  el.style.height = "auto";
  const h = Math.min(Math.max(el.scrollHeight + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth), line * minRows + extra), line * maxRows + extra);
  el.style.height = `${h}px`;
  el.style.overflowY = el.scrollHeight + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) > h + 1 ? "auto" : "hidden";
}

export function TextArea({
  label,
  hideLabel,
  description,
  error,
  isRequired,
  requiredMessage,
  isReadOnly,
  width,
  placeholder,
  validate,
  maxLength,
  minRows = 3,
  maxRows = 10,
  value,
  defaultValue,
  onChange,
  ...rest
}: TextAreaProps) {
  const m = useMessages();
  const ref = useRef<HTMLTextAreaElement>(null);
  const countId = useId();
  const [inner, setInner] = useState(defaultValue ?? "");
  const text = value ?? inner;
  const resize = useCallback(() => {
    if (ref.current) fit(ref.current, minRows, maxRows);
  }, [minRows, maxRows]);
  useLayoutEffect(resize, [resize, text]);
  return (
    <RACTextField
      {...defined(rest)}
      {...defined({ isRequired, isReadOnly, value, defaultValue, validate: withMaxLength(validate, maxLength, m), isInvalid: error ? true : undefined, "aria-describedby": maxLength ? countId : undefined })}
      onChange={(v) => {
        if (value === undefined) setInner(v);
        onChange?.(v);
      }}
      className={fieldRoot(width)}
    >
      <FieldLabel isRequired={isRequired} hidden={hideLabel}>{label}</FieldLabel>
      <div className="relative">
        <RACTextArea
          ref={ref}
          rows={minRows}
          {...defined({ placeholder })}
          className={cx(fieldBox({ isReadOnly }), "block resize-none px-2.5 py-1.5 leading-(--lh) placeholder:text-fg-3", isReadOnly && "pr-8")}
        />
        {isReadOnly && <ReadOnlyLock />}
      </div>
      <FieldHelp
        description={description}
        error={error}
        label={label}
        requiredMessage={requiredMessage}
        extra={maxLength ? <CharCount id={countId} length={text.length} max={maxLength} /> : undefined}
      />
    </RACTextField>
  );
}
