/*
 * Champ de saisie d'une ligne. Spec : TextField.spec.md.
 * Décisions : D-022, D-130 à D-133. Adapté du starter Tailwind de React Aria (Apache 2.0).
 */
import { Input, TextField as RACTextField } from "react-aria-components/TextField";
import { cx } from "../../lib/cx";
import { FieldHelp, FieldLabel, ReadOnlyLock, defined, fieldBox, fieldRoot, type FieldBaseProps } from "../Field/Field";

export interface TextFieldProps extends FieldBaseProps {
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
  maxLength?: number;
  autoFocus?: boolean;
}

export function TextField({
  label,
  hideLabel,
  description,
  error,
  isRequired,
  isReadOnly,
  width,
  type = "text",
  placeholder,
  ...rest
}: TextFieldProps) {
  return (
    <RACTextField
      {...defined(rest)}
      {...defined({ isRequired, isReadOnly })}
      type={type}
      {...defined({ isInvalid: error ? true : undefined })}
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
      <FieldHelp description={description} error={error} kind={type === "email" ? "email" : type === "url" ? "url" : "text"} />
    </RACTextField>
  );
}
