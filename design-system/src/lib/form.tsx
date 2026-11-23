/*
 * Formulaire déclaratif : modèle de champ, valeurs, envoi et rendu des champs.
 * Partagé par FormPage et le formulaire en modale (useOpenForm). Spec : templates/FormPage/FormPage.spec.md.
 * Décisions : D-190 à D-192, D-196. Module interne : seuls les types sont exportés par index.ts.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { SocleMessages } from "../i18n/messages";
import { useMessages } from "../provider/SocleProvider";
import { Checkbox, CheckboxGroup } from "../components/Checkbox/Checkbox";
import { ComboBox, type ComboBoxItem } from "../components/ComboBox/ComboBox";
import type { FieldWidth } from "../components/Field/Field";
import { Fieldset } from "../components/Fieldset/Fieldset";
import { RadioGroup } from "../components/RadioGroup/RadioGroup";
import { Select, type SelectOption, type SelectSection } from "../components/Select/Select";
import { TextArea } from "../components/TextArea/TextArea";
import { TextField } from "../components/TextField/TextField";

/* ---------- Modèle (D-190, D-191) ---------- */

/** Valeur rendue par un champ (D-191). */
export type FormValue = string | number | boolean | string[] | null;
/** Valeurs d'un formulaire, par `name`. */
export type FormValues = Record<string, FormValue>;

/** Règle propre à un champ : la phrase qui dit quoi corriger, ou rien (D-192). */
export type FormCheck<V> = (value: V, values: FormValues) => string | null | undefined;

interface FormFieldBase<V> {
  /** Clé de la valeur dans `values`. */
  name: string;
  /** Libellé ; « (facultatif) » s'ajoute seul quand `isRequired` est faux (D-022). */
  label: string;
  /** Aide sous le champ. */
  description?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Valeur de départ, si `initialValues` ne la donne pas (D-191). */
  defaultValue?: V;
  validate?: FormCheck<V>;
}

export interface TextFormField extends FormFieldBase<string> {
  type?: "text" | "email" | "url" | "tel" | "password";
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  width?: FieldWidth;
}

export interface NumberFormField extends FormFieldBase<number | null> {
  type: "number";
  placeholder?: string;
  min?: number;
  max?: number;
  /** Défaut : `sm` (D-191). */
  width?: FieldWidth;
}

export interface TextAreaFormField extends FormFieldBase<string> {
  type: "textarea";
  placeholder?: string;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  width?: FieldWidth;
}

export interface SelectFormField extends FormFieldBase<string | null> {
  type: "select";
  options: SelectOption[] | SelectSection[];
  placeholder?: string;
  width?: FieldWidth;
}

export interface ComboBoxFormField extends FormFieldBase<string | string[] | null> {
  type: "combobox";
  /** `multiple` : la valeur est un `string[]`. */
  selectionMode?: "single" | "multiple";
  items?: ComboBoxItem[];
  loadItems?: (text: string, signal: AbortSignal) => Promise<ComboBoxItem[]>;
  selectedItems?: ComboBoxItem[];
  allowsCustomValue?: boolean;
  onCreate?: (text: string) => ComboBoxItem | Promise<ComboBoxItem>;
  placeholder?: string;
  width?: FieldWidth;
}

/** Une option d'un groupe de choix (`radio`, `checkboxGroup`). */
export interface FormChoice {
  value: string;
  label: string;
  description?: string;
  isDisabled?: boolean;
}

export interface RadioFormField extends FormFieldBase<string | null> {
  type: "radio";
  options: FormChoice[];
  orientation?: "vertical" | "horizontal";
}

/** Case à cocher : le `label` est à droite de la case. Jamais d'interrupteur (D-137). */
export interface CheckboxFormField extends FormFieldBase<boolean> {
  type: "checkbox";
}

export interface CheckboxGroupFormField extends FormFieldBase<string[]> {
  type: "checkboxGroup";
  options: FormChoice[];
  orientation?: "vertical" | "horizontal";
}

/** Un champ qui porte une valeur. */
export type FormInputField =
  | TextFormField
  | NumberFormField
  | TextAreaFormField
  | SelectFormField
  | ComboBoxFormField
  | RadioFormField
  | CheckboxFormField
  | CheckboxGroupFormField;

/** Groupe de champs qui forment un tout (une adresse) : `Fieldset` (D-138). */
export interface FieldsetFormField {
  type: "fieldset";
  legend: string;
  description?: string;
  /** Ajoute « (facultatif) » à la légende. */
  isOptional?: boolean;
  isDisabled?: boolean;
  fields: FormInputField[];
}

/** Un champ d'un formulaire déclaratif (D-190). */
export type FormField = FormInputField | FieldsetFormField;

/** Ce que `onSubmit` peut rendre : des erreurs par champ et une phrase (D-192). */
export interface FormSubmitResult {
  errors?: Record<string, string>;
  message?: string;
}

/** Enregistre les valeurs. Une exception levée affiche son message sur place (D-192). */
export type FormSubmit = (values: FormValues) => void | FormSubmitResult | Promise<void | FormSubmitResult>;

/* ---------- Valeurs ---------- */

/** Les champs qui portent une valeur, fieldsets dépliés. */
export function inputFields(fields: readonly FormField[]): FormInputField[] {
  return fields.flatMap((f) => (f.type === "fieldset" ? f.fields : [f]));
}

type Raw = Record<string, unknown>;

const text = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");
const key = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : null);
const list = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
const truthy = (v: unknown) => v === true || v === 1 || v === "1" || v === "true";

/** Valeur de départ, sous la forme tenue par le champ (un nombre est tenu en texte). */
function rawOf(f: FormInputField, given: unknown): unknown {
  const v = given === undefined ? f.defaultValue : given;
  switch (f.type) {
    case "number":
      return typeof v === "number" ? String(v).replace(".", ",") : text(v);
    case "select":
    case "radio":
      return key(v);
    case "combobox":
      return f.selectionMode === "multiple" ? list(v) : key(v);
    case "checkbox":
      return truthy(v);
    case "checkboxGroup":
      return list(v);
    default:
      return text(v);
  }
}

function initialRaw(fields: FormInputField[], initial: object | undefined): Raw {
  const src = (initial ?? {}) as Record<string, unknown>;
  return Object.fromEntries(fields.map((f) => [f.name, rawOf(f, src[f.name])]));
}

/** Nombre saisi : virgule acceptée, espaces ignorés ; `null` si vide, `NaN` si illisible. */
function parseNumber(s: string): number | null {
  const t = s.replace(/\s/g, "").replace(",", ".");
  return t === "" ? null : Number(t);
}

function valueOf(f: FormInputField, raw: unknown): FormValue {
  switch (f.type) {
    case "number":
      return parseNumber(raw as string);
    case "password":
      return raw as string;
    case undefined:
    case "text":
    case "email":
    case "url":
    case "tel":
    case "textarea":
      return (raw as string).trim();
    default:
      return raw as FormValue;
  }
}

function toValues(fields: FormInputField[], raw: Raw): FormValues {
  return Object.fromEntries(fields.map((f) => [f.name, valueOf(f, raw[f.name])]));
}

/** Vérification d'un nombre : format, bornes, puis la règle du champ. */
function checkNumber(f: NumberFormField, s: string, values: FormValues, m: SocleMessages) {
  const n = parseNumber(s);
  if (n !== null && Number.isNaN(n)) return m.invalidNumber;
  if (n !== null && f.min !== undefined && n < f.min) return m.numberTooSmall(f.min);
  if (n !== null && f.max !== undefined && n > f.max) return m.numberTooLarge(f.max);
  return f.validate?.(n, values);
}

/* ---------- État et envoi ---------- */

export type FormStatus = "idle" | "dirty" | "saving" | "saved" | "error";

export interface FormModel {
  fields: FormInputField[];
  raw: Raw;
  set: (name: string, value: unknown) => void;
  /** Erreurs rendues par `onSubmit`, par champ (D-192). */
  errors: Record<string, string>;
  dirty: boolean;
  status: FormStatus;
  /** Phrase d'erreur de l'envoi. */
  message: string | null;
  saving: boolean;
  /** Valeurs courantes (D-191). */
  values: () => FormValues;
  /** Lance l'envoi d'un formulaire déjà vérifié ; rend les valeurs, ou `null` en cas d'échec. */
  submit: () => Promise<FormValues | null>;
  /** Le `<form>` : sert au focus du premier champ en erreur. */
  formRef: React.RefObject<HTMLFormElement | null>;
  /** Mod+Entrée envoie de partout (D-196). */
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
}

/** Champs d'une ligne où Entrée envoie (comportement natif). */
const LINE_TYPES = new Set(["text", "email", "url", "tel", "password", "search"]);

const same = (a: Raw, b: Raw) => JSON.stringify(a) === JSON.stringify(b);

/** Focus sur le premier champ en erreur du formulaire (D-132). */
function focusFirstInvalid(form: HTMLFormElement | null) {
  const el = form?.querySelector<HTMLElement>("[aria-invalid=true], [data-invalid] input:not([type=hidden]), [data-invalid] button, [data-invalid] textarea");
  el?.focus();
}

export function useFormModel(all: readonly FormField[], initialValues: object | undefined, onSubmit: FormSubmit | undefined): FormModel {
  const m = useMessages();
  const fields = useMemo(() => inputFields(all), [all]);
  const [baseline, setBaseline] = useState<Raw>(() => initialRaw(fields, initialValues));
  const [raw, setRaw] = useState<Raw>(baseline);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [focusErrors, setFocusErrors] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const rawRef = useRef(raw);
  rawRef.current = raw;
  const busy = useRef(false);
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;

  const dirty = !same(raw, baseline);

  const set = useCallback((name: string, value: unknown) => {
    setRaw((r) => ({ ...r, [name]: value }));
    setErrors((e) => {
      if (!(name in e)) return e;
      const next = { ...e };
      delete next[name];
      return next;
    });
    setStatus((s) => (s === "saving" ? s : "dirty"));
  }, []);

  const values = useCallback(() => toValues(fields, rawRef.current), [fields]);

  useEffect(() => {
    if (focusErrors) focusFirstInvalid(formRef.current);
  }, [focusErrors]);

  const submit = useCallback(async () => {
    if (busy.current) return null;
    const sent = rawRef.current;
    const v = toValues(fields, sent);
    busy.current = true;
    setStatus("saving");
    setMessage(null);
    try {
      const result = await submitRef.current?.(v);
      if (result && ((result.errors && Object.keys(result.errors).length > 0) || result.message)) {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? m.fixErrors);
        setStatus("error");
        setFocusErrors((n) => n + 1);
        return null;
      }
      setBaseline(sent);
      setErrors({});
      setStatus("saved");
      return v;
    } catch (e) {
      setMessage(e instanceof Error && e.message ? e.message : m.saveFailed);
      setStatus("error");
      return null;
    } finally {
      busy.current = false;
    }
  }, [fields, m]);

  // Entrée dans un champ d'une ligne, et Mod+Entrée de partout, envoient (D-196). Entrée est traitée ici
  // plutôt que laissée au navigateur : le bouton d'envoi peut être hors du <form> (pied de la modale).
  const onKeyDown = useCallback((e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== "Enter" || e.defaultPrevented || e.nativeEvent.isComposing) return;
    const t = e.target as HTMLElement;
    const oneLine = t instanceof HTMLInputElement && LINE_TYPES.has(t.type) && !t.hasAttribute("role");
    if (!(e.metaKey || e.ctrlKey) && !oneLine) return;
    e.preventDefault();
    formRef.current?.requestSubmit();
  }, []);

  return { fields, raw, set, errors, dirty, status: status === "dirty" && !dirty ? "idle" : status, message, saving: status === "saving", values, submit, formRef, onKeyDown };
}

/* ---------- Rendu des champs ---------- */

/** Retire les clés à `undefined` (exactOptionalPropertyTypes). */
function opt<T extends object>(o: T): { [K in keyof T]: Exclude<T[K], undefined> } {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as { [K in keyof T]: Exclude<T[K], undefined> };
}

function Control({ field: f, model }: { field: FormInputField; model: FormModel }) {
  const m = useMessages();
  const value = model.raw[f.name];
  const onChange = (v: unknown) => model.set(f.name, v);
  const common = opt({ name: f.name, description: f.description, isRequired: f.isRequired, isDisabled: f.isDisabled, error: model.errors[f.name] });
  // La règle du champ reçoit aussi les autres valeurs (D-192).
  const check = <V,>(rule: FormCheck<V> | undefined) => (rule ? (v: V) => rule(v, model.values()) : undefined);

  switch (f.type) {
    case "number":
      return (
        <TextField
          {...common}
          {...opt({ placeholder: f.placeholder })}
          label={f.label}
          width={f.width ?? "sm"}
          value={value as string}
          onChange={onChange}
          validate={(s) => checkNumber(f, s, model.values(), m)}
        />
      );
    case "textarea":
      return (
        <TextArea
          {...common}
          {...opt({ placeholder: f.placeholder, maxLength: f.maxLength, minRows: f.minRows, maxRows: f.maxRows, width: f.width, validate: check(f.validate) })}
          label={f.label}
          value={value as string}
          onChange={onChange}
        />
      );
    case "select":
      return (
        <Select
          {...common}
          {...opt({ placeholder: f.placeholder, width: f.width, validate: check(f.validate) })}
          label={f.label}
          options={f.options}
          value={value as string | null}
          onChange={onChange}
        />
      );
    case "combobox": {
      const source = opt({ items: f.items, loadItems: f.loadItems, selectedItems: f.selectedItems, allowsCustomValue: f.allowsCustomValue, onCreate: f.onCreate, placeholder: f.placeholder, width: f.width });
      const rule = f.validate;
      return f.selectionMode === "multiple" ? (
        <ComboBox
          {...common}
          {...source}
          {...opt({ validate: rule ? (v: string[]) => rule(v, model.values()) : undefined })}
          selectionMode="multiple"
          label={f.label}
          value={value as string[]}
          onChange={onChange}
        />
      ) : (
        <ComboBox
          {...common}
          {...source}
          {...opt({ validate: rule ? (v: string | null) => rule(v, model.values()) : undefined })}
          label={f.label}
          value={value as string | null}
          onChange={onChange}
        />
      );
    }
    case "radio":
      return (
        <RadioGroup {...common} {...opt({ orientation: f.orientation, validate: check(f.validate) })} label={f.label} value={value as string | null} onChange={onChange}>
          {f.options.map((o) => (
            <RadioGroup.Option key={o.value} value={o.value} {...opt({ description: o.description, isDisabled: o.isDisabled })}>
              {o.label}
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      );
    case "checkbox":
      return (
        <Checkbox {...common} {...opt({ validate: check(f.validate) })} isSelected={value as boolean} onChange={onChange}>
          {f.label}
        </Checkbox>
      );
    case "checkboxGroup":
      return (
        <CheckboxGroup {...common} {...opt({ orientation: f.orientation, validate: check(f.validate) })} label={f.label} value={value as string[]} onChange={onChange}>
          {f.options.map((o) => (
            <Checkbox key={o.value} value={o.value} {...opt({ description: o.description, isDisabled: o.isDisabled })}>
              {o.label}
            </Checkbox>
          ))}
        </CheckboxGroup>
      );
    default:
      return (
        <TextField
          {...common}
          {...opt({ placeholder: f.placeholder, autoComplete: f.autoComplete, maxLength: f.maxLength, width: f.width, validate: check(f.validate) })}
          type={f.type ?? "text"}
          label={f.label}
          value={value as string}
          onChange={onChange}
        />
      );
  }
}

/** Les champs, l'un sous l'autre, 16 px d'écart (D-191). */
export function FormFields({ fields, model }: { fields: readonly FormField[]; model: FormModel }): ReactNode {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      {fields.map((f) =>
        f.type === "fieldset" ? (
          <Fieldset key={`fieldset:${f.legend}`} legend={f.legend} {...opt({ description: f.description, isOptional: f.isOptional, isDisabled: f.isDisabled })}>
            {f.fields.map((c) => (
              <Control key={c.name} field={c} model={model} />
            ))}
          </Fieldset>
        ) : (
          <Control key={f.name} field={f} model={model} />
        ),
      )}
    </div>
  );
}
