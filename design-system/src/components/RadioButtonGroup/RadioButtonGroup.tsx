/*
 * Un choix parmi quelques options visibles. Spec : RadioButtonGroup.spec.md.
 * Décisions : D-022, D-130, D-132, D-135, D-138 ; D-342 (lecture seule) et D-344 (message d'obligation). Adapté du starter Tailwind de React Aria (Apache 2.0).
 */
import { useContext, type ReactNode } from "react";
import { RadioButton, RadioField, RadioGroup as RACRadioGroup, RadioGroupStateContext } from "react-aria-components/RadioGroup";
import { Text } from "react-aria-components/Text";
import { cx } from "../../lib/cx";
import { FieldHelp, FieldLabel, defined } from "../Field/Field";
import { choiceDescription, choiceRow, choiceText, groupList, indicator, indicatorReadOnly } from "../Field/choice";

export interface RadioButtonGroupProps {
  label: string;
  hideLabel?: boolean;
  description?: string;
  isRequired?: boolean;
  /** Message du groupe obligatoire sans choix. Défaut : « Choisissez une valeur pour « <libellé> ». » (D-344). */
  requiredMessage?: string;
  validate?: (value: string | null) => string | null | undefined;
  error?: string;
  isDisabled?: boolean;
  /** Lecture seule : ronds gris, point en `--fg-2`, cadenas après le libellé ; focusable (D-342). */
  isReadOnly?: boolean;
  name?: string;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  /** Horizontal : 2 ou 3 options courtes (D-138). */
  orientation?: "vertical" | "horizontal";
  /** Des `RadioButtonGroup.Option`. */
  children: ReactNode;
}

export interface RadioOptionProps {
  value: string;
  /** Libellé. */
  children: string;
  description?: string;
  isDisabled?: boolean;
}

function Option({ value, children, description, isDisabled }: RadioOptionProps) {
  const readOnly = useContext(RadioGroupStateContext)?.isReadOnly ?? false;
  return (
    <RadioField value={value} {...defined({ isDisabled })} className="flex">
      <RadioButton className={choiceRow}>
        <span className={cx(readOnly ? indicatorReadOnly : indicator, "rounded-full")}>
          <span className={cx("hidden size-1.5 rounded-full group-data-selected/choice:block", readOnly ? "bg-fg-2" : "bg-accent-fg")} />
        </span>
        <span className={choiceText}>
          {children}
          {description && (
            <Text slot="description" className={choiceDescription}>
              {description}
            </Text>
          )}
        </span>
      </RadioButton>
    </RadioField>
  );
}

export function RadioButtonGroup({ label, hideLabel, description, error, isRequired, requiredMessage, orientation, children, validate, ...rest }: RadioButtonGroupProps) {
  return (
    <RACRadioGroup
      {...defined(rest)}
      {...defined({
        isRequired,
        isInvalid: error ? true : undefined,
        validate: validate ? (v: string | null) => validate(v) : undefined,
      })}
      className="socle-box group/field flex min-w-0 flex-col gap-1 font-sans text-md text-fg data-disabled:opacity-40"
    >
      <FieldLabel isRequired={isRequired} hidden={hideLabel} isReadOnly={rest.isReadOnly}>
        {label}
      </FieldLabel>
      <div className={groupList(orientation)}>{children}</div>
      <FieldHelp description={description} error={error} kind="choice" label={label} requiredMessage={requiredMessage} />
    </RACRadioGroup>
  );
}

RadioButtonGroup.Option = Option;
