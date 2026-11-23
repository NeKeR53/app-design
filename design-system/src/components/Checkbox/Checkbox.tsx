/*
 * Case à cocher et groupe de cases. Spec : Checkbox.spec.md.
 * Décisions : D-022, D-040, D-130, D-132, D-135, D-137, D-138 ; D-342 (lecture seule) et D-344 (message d'obligation). Adapté du starter Tailwind de React Aria (Apache 2.0).
 */
import { useContext, type ReactNode } from "react";
import { CheckboxButton, CheckboxField } from "react-aria-components/Checkbox";
import { CheckboxGroup as RACCheckboxGroup, CheckboxGroupStateContext } from "react-aria-components/CheckboxGroup";
import { FieldError } from "react-aria-components/FieldError";
import { Text } from "react-aria-components/Text";
import { useMessages } from "../../provider/SocleProvider";
import { cx } from "../../lib/cx";
import { Check, Minus } from "../../icons";
import { FieldHelp, FieldLabel, InlineLock, defined, errorText } from "../Field/Field";
import { choiceDescription, choiceRow, choiceText, groupList, indicator, indicatorReadOnly } from "../Field/choice";

export interface CheckboxProps {
  /** Libellé, à droite de la case. */
  children: string;
  /** Ligne sous le libellé. */
  description?: string;
  isSelected?: boolean;
  defaultSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  /** Valeur dans un `CheckboxGroup`. */
  value?: string;
  /** État mixte : case parente d'une liste partiellement cochée. */
  isIndeterminate?: boolean;
  /** Case obligatoire (acceptation) ; vérifiée comme un champ (D-132). */
  isRequired?: boolean;
  /** Message de la case obligatoire non cochée. Défaut : « Cochez « <libellé> ». » (D-344). */
  requiredMessage?: string;
  validate?: (isSelected: boolean) => string | null | undefined;
  /** Erreur imposée par l'app, affichée tout de suite. */
  error?: string;
  isDisabled?: boolean;
  /** Lecture seule : case grise, coche en `--fg-2`, cadenas après le libellé hors groupe ; focusable (D-342). */
  isReadOnly?: boolean;
  name?: string;
}

export function Checkbox({ children, description, error, requiredMessage, ...rest }: CheckboxProps) {
  const m = useMessages();
  const group = useContext(CheckboxGroupStateContext);
  const inGroup = group !== null;
  const readOnly = Boolean(rest.isReadOnly || group?.isReadOnly);
  return (
    <CheckboxField {...defined(rest)} {...defined({ isInvalid: error ? true : undefined })} className="flex flex-col gap-1">
      <CheckboxButton className={choiceRow}>
        {({ isSelected, isIndeterminate }) => (
          <>
            <span className={cx(readOnly ? indicatorReadOnly : indicator, "rounded-sm")}>
              {isIndeterminate ? <Minus size={12} strokeWidth={3} /> : isSelected ? <Check size={12} strokeWidth={3} /> : null}
            </span>
            <span className={choiceText}>
              <span>
                {children}
                {readOnly && !inGroup && <InlineLock />}
              </span>
              {description && (
                <Text slot="description" className={choiceDescription}>
                  {description}
                </Text>
              )}
            </span>
          </>
        )}
      </CheckboxButton>
      {!inGroup && <FieldError className="text-sm text-danger">{(v) => error ?? errorText(v, m, "checkbox", children, requiredMessage)}</FieldError>}
    </CheckboxField>
  );
}

export interface CheckboxGroupProps {
  /** Libellé du groupe. */
  label: string;
  hideLabel?: boolean;
  description?: string;
  /** Au moins une case cochée. */
  isRequired?: boolean;
  /** Message du groupe obligatoire sans case cochée. Défaut : « Choisissez une valeur pour « <libellé> ». » (D-344). */
  requiredMessage?: string;
  validate?: (value: string[]) => string | null | undefined;
  error?: string;
  isDisabled?: boolean;
  /** Lecture seule : cases grises, cadenas après le libellé du groupe ; focusables (D-342). */
  isReadOnly?: boolean;
  name?: string;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** Horizontal : 2 ou 3 options courtes (D-138). */
  orientation?: "vertical" | "horizontal";
  /** Des `Checkbox` avec `value`. */
  children: ReactNode;
}

export function CheckboxGroup({ label, hideLabel, description, error, isRequired, requiredMessage, orientation, children, ...rest }: CheckboxGroupProps) {
  return (
    <RACCheckboxGroup
      {...defined(rest)}
      {...defined({ isRequired, isInvalid: error ? true : undefined })}
      className="socle-box group/field flex min-w-0 flex-col gap-1 font-sans text-md text-fg data-disabled:opacity-40"
    >
      <FieldLabel isRequired={isRequired} hidden={hideLabel} isReadOnly={rest.isReadOnly}>
        {label}
      </FieldLabel>
      <div className={groupList(orientation)}>{children}</div>
      <FieldHelp description={description} error={error} kind="group" label={label} requiredMessage={requiredMessage} />
    </RACCheckboxGroup>
  );
}
