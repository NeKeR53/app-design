/*
 * Champ de saisie d'une ligne. Spec : TextInput.spec.md.
 * Décisions : D-022, D-130 à D-133 ; D-343 (limite dépassable) et D-344 (message d'obligation).
 * Adapté du starter Tailwind de React Aria (Apache 2.0).
 */
import { useId, useState } from "react";
import { Input, TextField as RACTextField } from "react-aria-components/TextField";
import { useMessages } from "../../provider/SocleProvider";
import { cx } from "../../lib/cx";
import { CharCount, FieldHelp, FieldLabel, ReadOnlyLock, defined, fieldBox, fieldRoot, withMaxLength, type FieldBaseProps } from "../Field/Field";

export interface TextInputProps extends FieldBaseProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  /** Clavier adapté sur mobile ; `email` et `url` vérifient aussi le format. */
  type?: "text" | "email" | "url" | "tel" | "password";
  /** Vérification de la valeur : renvoie la phrase qui dit quoi corriger, ou null (D-132). */
  validate?: (value: string) => string | null | undefined;
  /** Lecture seule (D-131). */
  isReadOnly?: boolean;
  /** Exemple de valeur, jamais une consigne. */
  placeholder?: string;
  autoComplete?: string;
  /** Longueur maximale, dépassable : au-delà, compteur en erreur et valeur refusée (D-343). */
  maxLength?: number;
  autoFocus?: boolean;
}

export function TextInput({
  label,
  hideLabel,
  description,
  error,
  isRequired,
  requiredMessage,
  isReadOnly,
  width,
  type = "text",
  placeholder,
  maxLength,
  validate,
  value,
  defaultValue,
  onChange,
  ...rest
}: TextInputProps) {
  const m = useMessages();
  const countId = useId();
  const [inner, setInner] = useState(defaultValue ?? "");
  const text = value ?? inner;
  const over = maxLength !== undefined && text.length > maxLength;
  return (
    <RACTextField
      {...defined(rest)}
      {...defined({
        isRequired,
        isReadOnly,
        value,
        defaultValue,
        validate: withMaxLength(validate, maxLength, m),
        isInvalid: error ? true : undefined,
        "aria-describedby": over ? countId : undefined,
      })}
      onChange={(v) => {
        if (value === undefined) setInner(v);
        onChange?.(v);
      }}
      type={type}
      className={fieldRoot(width)}
    >
      <FieldLabel isRequired={isRequired} hidden={hideLabel}>{label}</FieldLabel>
      <div className="relative">
        <Input
          {...defined({ placeholder })}
          className={cx(fieldBox({ isReadOnly }), "h-(--row-h) px-2.5 placeholder:text-fg-3", isReadOnly && "pr-8")}
        />
        {isReadOnly && <ReadOnlyLock />}
      </div>
      <FieldHelp
        description={description}
        error={error}
        kind={type === "email" ? "email" : type === "url" ? "url" : "text"}
        label={label}
        requiredMessage={requiredMessage}
        extra={maxLength !== undefined ? <CharCount id={countId} length={text.length} max={maxLength} hideUnder /> : undefined}
      />
    </RACTextField>
  );
}
