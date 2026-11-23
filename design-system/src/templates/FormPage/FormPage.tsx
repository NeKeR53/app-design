/*
 * FormPage : gabarit d'un long formulaire, rangé en sections ou en étapes, avec un pied collé en bas.
 * Spec : FormPage.spec.md. Décisions : D-022, D-190 à D-196 ; D-341 (récapitulatif des erreurs) ; D-364 (étapes).
 * L'app décrit les champs (FormField) ; le gabarit les dessine avec les champs Socle.
 */
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { cx } from "../../lib/cx";
import {
  ErrorSummary,
  FormFields,
  inputFields,
  useFormModel,
  type FormField,
  type FormInputField,
  type FormModel,
  type FormSubmit,
  type FormValue,
} from "../../lib/form";
import { useMessages } from "../../provider/SocleProvider";
import { Button } from "../../components/Button/Button";
import { FormattedValue, type ValueFormat } from "../../components/FormattedValue/FormattedValue";
import { useConfirm } from "../../components/Modal/useConfirm";
import { ProgressIndicator, type StepItem } from "../../components/ProgressIndicator/ProgressIndicator";
import type { SelectOption, SelectSection } from "../../components/Select/Select";
import { Skeleton, SkeletonGroup } from "../../components/Skeleton/Skeleton";

/** Une section titrée du formulaire. */
export interface FormSection {
  title: string;
  /** Aide de la section, une phrase. */
  description?: string;
  fields: FormField[];
}

/** Une étape du formulaire : une section montrée seule (D-364). */
export interface FormStep {
  /** Identifiant stable de l'étape. */
  id: string;
  /** Nom court, sans numéro (la pastille le porte). */
  title: string;
  /** Aide de l'étape, quelques mots. */
  description?: string;
  fields: FormField[];
}

interface FormPageBaseProps {
  /** Titre : le verbe et l'objet (« Nouveau projet »). */
  title: string;
  /** Phrase d'intention sous le titre. */
  description?: string;
  /** Valeurs de départ ; l'objet lu en base convient (D-191). */
  initialValues?: object;
  /** Libellé de l'action principale : « Créer », « Enregistrer ». */
  submitLabel: string;
  /** Enregistre ; peut rendre `{ errors, message }` ou lever une erreur (D-192). */
  onSubmit: FormSubmit;
  /** Libellé du bouton d'annulation. Défaut : « Annuler ». */
  cancelLabel?: string;
  /** Sans lui, pas de bouton « Annuler ». Confirmé après une saisie (D-195). */
  onCancel?: () => void;
  /** Prévient l'app d'une saisie non enregistrée. */
  onDirtyChange?: (dirty: boolean) => void;
  /** Données en chargement : squelettes à la place des champs (D-193). */
  isLoading?: boolean;
}

/** Sections (tout sur une page) ou étapes (une à la fois, puis un récapitulatif), jamais les deux (D-364). */
export type FormPageProps = FormPageBaseProps &
  (
    | {
        sections: FormSection[];
        steps?: never;
      }
    | {
        /** Formulaire en étapes : une étape à la fois, puis un récapitulatif et l'action (D-364). */
        steps: FormStep[];
        sections?: never;
      }
  );

/** Racine : requête de conteneur pour les colonnes des sections (D-193). */
const root = "socle-box @container flex min-h-full flex-col bg-surface font-sans text-md text-fg";
const content = "w-full max-w-[880px] flex-1 px-(--pad) pt-6";
/** Section : titre au-dessus, ou à gauche à partir de 800 px de conteneur (D-193). */
const sectionClass = "grid grid-cols-[minmax(0,1fr)] gap-3 border-t border-line py-6 first-of-type:border-t-0 @min-[800px]:grid-cols-[240px_minmax(0,560px)] @min-[800px]:gap-8";

function Header({ id, title, description }: { id: string; title: string; description?: string | undefined }) {
  return (
    <header className="mb-2">
      <h2 id={id} className="m-0 text-xl leading-[1.3] font-heading [overflow-wrap:anywhere]">
        {title}
      </h2>
      {description && <p className="mt-1 mb-0 text-fg-2">{description}</p>}
    </header>
  );
}

interface SectionHeadProps {
  id: string;
  title: string;
  description?: string | undefined;
  /** Titre d'une étape : il reçoit le focus au changement d'étape (D-364). */
  headingRef?: React.Ref<HTMLHeadingElement>;
}

function SectionHead({ id, title, description, headingRef }: SectionHeadProps) {
  return (
    <div className="min-w-0">
      <h3 id={id} ref={headingRef} tabIndex={headingRef ? -1 : undefined} className="m-0 text-md font-heading outline-none">
        {title}
      </h3>
      {description && <p className="mt-0.5 mb-0 text-sm text-fg-3">{description}</p>}
    </div>
  );
}

function Loading({ title, description, sections }: { title: string; description?: string | undefined; sections: readonly FormSection[] }) {
  const id = useId();
  return (
    <div className={root}>
      <div className={content}>
        <Header id={id} title={title} description={description} />
        <SkeletonGroup>
          {sections.map((s, i) => (
            <section key={`${s.title}-${i}`} className={sectionClass}>
              <SectionHead id={`${id}-${i}`} title={s.title} description={s.description} />
              <div className="flex flex-col gap-4">
                {s.fields.map((_, j) => (
                  <div key={j} className="flex flex-col gap-1.5">
                    <Skeleton width={120} />
                    <Skeleton shape="rect" height="var(--row-h)" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </SkeletonGroup>
      </div>
    </div>
  );
}

export function FormPage(props: FormPageProps) {
  // En étapes, seule la première se charge (D-364).
  if (props.isLoading) return <Loading title={props.title} description={props.description} sections={props.steps ? props.steps.slice(0, 1) : props.sections} />;
  return <FormPageBody {...props} />;
}

/* ---------- Récapitulatif des valeurs (D-364) ---------- */

const optionLabel = (options: SelectOption[] | SelectSection[], id: string) => {
  const flat = options.flatMap((o) => ("options" in o ? o.options : [o]));
  return flat.find((o) => o.id === id)?.label ?? id;
};

/** Valeur lisible d'un champ : libellé de l'option choisie, Oui ou Non, mot de passe masqué. */
function display(f: FormInputField, v: FormValue): { value: unknown; format: ValueFormat } {
  switch (f.type) {
    case "password":
      return { value: v ? "••••••••" : "", format: {} };
    case "number":
      return { value: v, format: { type: "number" } };
    case "textarea":
      return { value: v, format: { type: "longtext" } };
    case "checkbox":
      return { value: v, format: { type: "boolean" } };
    case "select":
      return { value: typeof v === "string" ? optionLabel(f.options, v) : v, format: {} };
    case "radio":
    case "checkboxGroup": {
      const label = (id: string) => f.options.find((o) => o.value === id)?.label ?? id;
      return { value: Array.isArray(v) ? v.map(label) : typeof v === "string" ? label(v) : v, format: {} };
    }
    case "combobox": {
      const known = [...(f.selectedItems ?? []), ...(f.items ?? [])];
      const label = (id: string) => known.find((o) => o.id === id)?.label ?? id;
      return { value: Array.isArray(v) ? v.map(label) : typeof v === "string" ? label(v) : v, format: {} };
    }
    default:
      return { value: v, format: {} };
  }
}

function Recap({ id, steps, model, headingRef, onEdit }: { id: string; steps: readonly FormStep[]; model: FormModel; headingRef: React.Ref<HTMLHeadingElement>; onEdit: (index: number) => void }) {
  const m = useMessages();
  const values = model.values();
  return (
    <div className="pt-6">
      <h3 id={`${id}-recap`} ref={headingRef} tabIndex={-1} className="m-0 text-md font-heading outline-none">
        {m.recapStep}
      </h3>
      {steps.map((s, i) => (
        <section key={s.id} aria-labelledby={`${id}-r${i}`} className={sectionClass}>
          <div className="flex min-w-0 flex-col items-start gap-2">
            <h4 id={`${id}-r${i}`} className="m-0 text-md font-heading">
              {s.title}
            </h4>
            <Button size="sm" onPress={() => onEdit(i)} aria-label={m.editValue(s.title)}>
              {m.edit}
            </Button>
          </div>
          <dl className="m-0 flex min-w-0 flex-col gap-3">
            {inputFields(s.fields).map((f) => {
              const { value, format } = display(f, values[f.name] ?? null);
              return (
                <div key={f.name} className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-sm text-fg-3">{f.label}</dt>
                  <dd className="m-0 [overflow-wrap:anywhere]">
                    <FormattedValue value={value} {...format} />
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}

/* ---------- Formulaire ---------- */

function FormPageBody({ title, description, sections, steps, initialValues, submitLabel, onSubmit, cancelLabel, onCancel, onDirtyChange }: FormPageProps) {
  const m = useMessages();
  const id = useId();
  const confirm = useConfirm();
  const all = useMemo(() => (steps ?? sections ?? []).flatMap((s) => s.fields), [steps, sections]);
  // Étape en cours ; `steps.length` est le récapitulatif (D-364).
  const [step, setStep] = useState(0);
  const stepNames = useMemo(() => (steps ?? []).map((s) => new Set(inputFields(s.fields).map((f) => f.name))), [steps]);
  const model = useFormModel(all, initialValues, onSubmit, {
    // À partir de 2 erreurs, un récapitulatif en haut du formulaire (D-341).
    summary: true,
    // Erreurs du serveur : première étape en erreur, et le récapitulatif de ses seuls champs (D-364).
    onSubmitErrors: (names) => {
      const at = stepNames.findIndex((own) => names.some((n) => own.has(n)));
      if (at < 0) return names;
      setStep(at);
      return names.filter((n) => stepNames[at]!.has(n));
    },
  });
  const { dirty, status, saving } = model;

  const notify = onDirtyChange;
  useEffect(() => {
    notify?.(dirty);
  }, [dirty, notify]);

  // Changement d'étape par l'utilisateur : le focus va au titre de l'étape (D-364).
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [focusHeading, setFocusHeading] = useState(0);
  useEffect(() => {
    if (focusHeading) headingRef.current?.focus();
  }, [focusHeading]);
  const go = (index: number) => {
    setStep(index);
    model.clearSummary();
    setFocusHeading((n) => n + 1);
  };

  const isRecap = steps !== undefined && step === steps.length;

  // L'envoi n'arrive ici que si les champs affichés sont valides : « Suivant » ne vérifie que l'étape (D-364).
  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (steps && !isRecap) go(step + 1);
    else void model.submit();
  };

  // « Annuler » après une saisie : confirmation (D-195).
  const cancel = async () => {
    if (!onCancel) return;
    if (!dirty) return onCancel();
    const ok = await confirm({ title: m.discardTitle, message: m.discardMessage, confirmLabel: m.discard, tone: "danger" });
    if (ok) onCancel();
  };

  const state = status === "dirty" ? m.unsavedChanges : status === "saving" ? m.saving : status === "saved" ? m.saved : "";

  // Étapes : en erreur si un de leurs champs porte une erreur du serveur (D-364).
  const items: StepItem[] = steps
    ? [
        ...steps.map((s, i) => {
          const failed = [...stepNames[i]!].some((n) => n in model.errors);
          return { id: s.id, title: s.title, ...(s.description ? { description: s.description } : {}), ...(failed ? { status: "error" as const } : {}) };
        }),
        { id: `${id}-recap`, title: m.recapStep },
      ]
    : [];

  const current = steps && !isRecap ? steps[step] : undefined;

  return (
    <form
      ref={model.formRef}
      onSubmit={send}
      onKeyDown={model.onKeyDown}
      aria-labelledby={`${id}-title`}
      aria-busy={saving || undefined}
      className={root}
    >
      <div className={content}>
        <Header id={`${id}-title`} title={title} description={description} />
        {steps && (
          <div className="mt-4 mb-2">
            <ProgressIndicator label={m.formSteps} steps={items} current={items[step]!.id} onSelect={(sid) => go(items.findIndex((s) => s.id === sid))} />
          </div>
        )}
        <ErrorSummary model={model} />
        {steps ? (
          <>
            {isRecap ? (
              <Recap id={id} steps={steps} model={model} headingRef={headingRef} onEdit={go} />
            ) : (
              current && (
                <section key={current.id} aria-labelledby={`${id}-s${step}`} className={sectionClass}>
                  <SectionHead id={`${id}-s${step}`} title={current.title} description={current.description} headingRef={headingRef} />
                  <FormFields fields={current.fields} model={model} />
                </section>
              )
            )}
          </>
        ) : (
          <>
            {(sections ?? []).map((s, i) => (
              <section key={`${s.title}-${i}`} aria-labelledby={`${id}-s${i}`} className={sectionClass}>
                <SectionHead id={`${id}-s${i}`} title={s.title} description={s.description} />
                <FormFields fields={s.fields} model={model} />
              </section>
            ))}
          </>
        )}
      </div>
      {/* Pied collé en bas : état d'enregistrement, « Annuler », « Précédent », action principale (D-022, D-194, D-364). */}
      <footer
        className={cx(
          "sticky bottom-0 z-10 mt-6 flex flex-wrap items-center gap-2 border-t border-line bg-surface px-(--pad) py-2.5",
          "max-tablet:[&>button]:flex-1",
        )}
      >
        <div className="flex min-h-(--row-h) min-w-0 flex-1 items-center text-sm max-tablet:min-h-0 max-tablet:basis-full">
          <span aria-live="polite" className={cx("text-fg-3", status === "error" && "hidden")}>
            {state}
          </span>
          {status === "error" && (
            <span role="alert" className="text-danger">
              {model.message}
            </span>
          )}
        </div>
        {onCancel && (
          <Button onPress={() => void cancel()} isDisabled={saving}>
            {cancelLabel ?? m.cancel}
          </Button>
        )}
        {steps && step > 0 && (
          <Button onPress={() => go(step - 1)} isDisabled={saving}>
            {m.back}
          </Button>
        )}
        <Button type="submit" variant="primary" isPending={saving}>
          {steps && !isRecap ? m.forward : submitLabel}
        </Button>
      </footer>
    </form>
  );
}
