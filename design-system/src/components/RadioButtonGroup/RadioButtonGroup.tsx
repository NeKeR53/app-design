/*
 * Un choix parmi quelques options visibles. Spec : RadioButtonGroup.spec.md.
 * Décisions : D-022, D-130, D-132, D-135, D-138. Adapté du starter Tailwind de React Aria (Apache 2.0).
 */
import type { ReactNode } from "react";
import { RadioButton, RadioField, RadioGroup as RACRadioGroup } from "react-aria-components/RadioGroup";
import { Text } from "react-aria-components/Text";
import { cx } from "../../lib/cx";
import { FieldHelp, FieldLabel, defined } from "../Field/Field";
import { choiceDescription, choiceRow, choiceText, groupList, indicator } from "../Field/choice";

export interface RadioButtonGroupProps {
  label: string;
  hideLabel?: boolean;
  description?: string;
  isRequired?: boolean;
  validate?: (value: string | null) => string | null | undefined;
  error?: string;
  isDisabled?: boolean;
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
  return (
    <RadioField value={value} {...defined({ isDisabled })} className="flex">
      <RadioButton className={choiceRow}>
        <span className={cx(indicator, "rounded-full")}>
          <span className="hidden size-1.5 rounded-full bg-accent-fg group-data-selected/choice:block" />
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

export function RadioButtonGroup({ label, hideLabel, description, error, isRequired, orientation, children, validate, ...rest }: RadioButtonGroupProps) {
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
      <FieldLabel isRequired={isRequired} hidden={hideLabel}>{label}</FieldLabel>
      <div className={groupList(orientation)}>{children}</div>
      <FieldHelp description={description} error={error} kind="choice" />
    </RACRadioGroup>
  );
}

RadioButtonGroup.Option = Option;
