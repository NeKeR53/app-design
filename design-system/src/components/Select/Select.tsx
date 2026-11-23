/*
 * Choix d'une valeur dans une liste fermée et courte. Spec : Select.spec.md.
 * Décisions : D-022, D-050, D-130, D-132 à D-134 ; D-342 (lecture seule) et D-344 (message d'obligation). Adapté du starter Tailwind de React Aria (Apache 2.0).
 */
import { useContext } from "react";
import type { Key } from "react-aria-components";
import { Header, ListBox, ListBoxItem, ListBoxSection } from "react-aria-components/ListBox";
import { Popover } from "react-aria-components/Popover";
import { Button, Select as RACSelect, SelectStateContext, SelectValue } from "react-aria-components/Select";
import { Input, TextField as RACTextField } from "react-aria-components/TextField";
import { useMessages } from "../../provider/SocleProvider";
import { cx } from "../../lib/cx";
import { TruncatedText } from "../../lib/truncated";
import { Check, ChevronDown } from "../../icons";
import { FieldHelp, FieldLabel, ReadOnlyLock, defined, fieldBox, fieldRoot, listPopoverClass, optionClass, sectionHeaderClass, type FieldBaseProps } from "../Field/Field";

export interface SelectOption {
  id: string;
  label: string;
  isDisabled?: boolean;
}

export interface SelectSection {
  title: string;
  options: SelectOption[];
}

export interface SelectProps extends FieldBaseProps {
  /** Les options, à plat ou rangées en sections titrées. */
  options: SelectOption[] | SelectSection[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (id: string | null) => void;
  onBlur?: () => void;
  /** Vérification de la valeur : renvoie la phrase qui dit quoi corriger, ou null (D-132). */
  validate?: (id: string | null) => string | null | undefined;
  /** Texte quand rien n'est choisi. Défaut : « Choisir… ». */
  placeholder?: string;
  autoFocus?: boolean;
  /**
   * Lecture seule (D-131, D-342) : cadre gris et cadenas, comme `TextInput` ; le libellé de la
   * valeur se sélectionne et se copie ; la liste ne s'ouvre pas.
   */
  isReadOnly?: boolean;
}

const isSection = (o: SelectOption | SelectSection): o is SelectSection => "options" in o;

/**
 * Une option : libellé, coche à droite sur la valeur choisie (D-050, D-134).
 * Libellé coupé : info-bulle au survol (500 ms) ou tout de suite à la mise en avant au clavier.
 */
export function OptionItem({ option }: { option: SelectOption }) {
  return (
    <ListBoxItem id={option.id} textValue={option.label} {...defined({ isDisabled: option.isDisabled })} className={optionClass}>
      {({ isSelected, isHovered, isFocusVisible }) => (
        <>
          <TruncatedText text={option.label} textClass="min-w-0 flex-1 truncate" hovered={isHovered} highlighted={isFocusVisible} />
          {isSelected && <Check size={16} className="shrink-0 text-fg-2" />}
        </>
      )}
    </ListBoxItem>
  );
}

/** Valeur choisie, coupée : info-bulle avec le texte complet (Tooltip.spec.md), sauf liste ouverte. */
function SelectedValue({ hovered, highlighted }: { hovered: boolean; highlighted: boolean }) {
  const isOpen = useContext(SelectStateContext)?.isOpen ?? false;
  return (
    <SelectValue className="min-w-0 flex-1 truncate data-placeholder:text-fg-3">
      {({ isPlaceholder, selectedText, defaultChildren }) =>
        isPlaceholder ? defaultChildren : <TruncatedText text={selectedText} textClass="block truncate" hovered={hovered && !isOpen} highlighted={highlighted && !isOpen} />
      }
    </SelectValue>
  );
}

/** Select en lecture seule : un champ de texte en lecture seule qui montre le libellé de la valeur. */
function ReadOnlySelect({ label, hideLabel, description, error, isRequired, width, options, value, defaultValue, name, isDisabled, autoFocus, onBlur }: SelectProps) {
  const id = value === undefined ? defaultValue : value;
  const all = options.flatMap((o) => (isSection(o) ? o.options : [o]));
  const text = all.find((o) => o.id === id)?.label ?? "";
  return (
    <RACTextField
      isReadOnly
      value={text}
      {...defined({ isRequired, isDisabled, autoFocus, onBlur, isInvalid: error ? true : undefined })}
      className={fieldRoot(width)}
    >
      <FieldLabel isRequired={isRequired} hidden={hideLabel}>{label}</FieldLabel>
      <div className="relative">
        <Input placeholder="—" className={cx(fieldBox({ isReadOnly: true }), "h-(--row-h) truncate pr-8 pl-2.5 placeholder:text-fg-3")} />
        <ReadOnlyLock />
      </div>
      <FieldHelp description={description} error={error} />
      {name !== undefined && <input type="hidden" name={name} value={id ?? ""} />}
    </RACTextField>
  );
}

export function Select({ isReadOnly, ...props }: SelectProps) {
  if (isReadOnly) return <ReadOnlySelect {...props} />;
  return <EditableSelect {...props} />;
}

function EditableSelect({ label, hideLabel, description, error, isRequired, requiredMessage, width, options, value, defaultValue, onChange, validate, placeholder, ...rest }: SelectProps) {
  const m = useMessages();
  return (
    <RACSelect
      {...defined(rest)}
      {...defined({
        isRequired,
        isInvalid: error ? true : undefined,
        value: value === undefined ? undefined : (value as Key | null),
        defaultValue: defaultValue === undefined ? undefined : (defaultValue as Key | null),
        onChange: onChange ? (k: Key | null) => onChange(k === null ? null : String(k)) : undefined,
        validate: validate ? (k: Key | null) => validate(k === null ? null : String(k)) : undefined,
      })}
      placeholder={placeholder ?? m.choose}
      className={fieldRoot(width)}
    >
      <FieldLabel isRequired={isRequired} hidden={hideLabel}>{label}</FieldLabel>
      <Button className={cx(fieldBox(), "flex h-(--row-h) cursor-default items-center gap-2 pr-2 pl-2.5 text-left")}>
        {({ isHovered, isFocusVisible }) => (
          <>
            <SelectedValue hovered={isHovered} highlighted={isFocusVisible} />
            <ChevronDown size={16} className="shrink-0 text-fg-2" />
          </>
        )}
      </Button>
      <FieldHelp description={description} error={error} kind="choice" label={label} requiredMessage={requiredMessage} />
      <Popover offset={4} containerPadding={8} className={listPopoverClass}>
        <ListBox className="outline-none">
          {options.map((o) =>
            isSection(o) ? (
              <ListBoxSection key={o.title} id={o.title}>
                <Header className={sectionHeaderClass}>{o.title}</Header>
                {o.options.map((opt) => (
                  <OptionItem key={opt.id} option={opt} />
                ))}
              </ListBoxSection>
            ) : (
              <OptionItem key={o.id} option={o} />
            ),
          )}
        </ListBox>
      </Popover>
    </RACSelect>
  );
}
