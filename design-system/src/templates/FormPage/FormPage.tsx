/*
 * FormPage : gabarit d'un long formulaire, rangé en sections, avec un pied collé en bas.
 * Spec : FormPage.spec.md. Décisions : D-022, D-190 à D-196 ; D-341 (récapitulatif des erreurs).
 * L'app décrit les champs (FormField) ; le gabarit les dessine avec les champs Socle.
 */
import { useEffect, useId, type FormEvent } from "react";
import { cx } from "../../lib/cx";
import { ErrorSummary, FormFields, useFormModel, type FormField, type FormSubmit } from "../../lib/form";
import { useMessages } from "../../provider/SocleProvider";
import { Button } from "../../components/Button/Button";
import { useConfirm } from "../../components/Modal/useConfirm";
import { Skeleton, SkeletonGroup } from "../../components/Skeleton/Skeleton";

/** Une section titrée du formulaire. */
export interface FormSection {
  title: string;
  /** Aide de la section, une phrase. */
  description?: string;
  fields: FormField[];
}

export interface FormPageProps {
  /** Titre : le verbe et l'objet (« Nouveau projet »). */
  title: string;
  /** Phrase d'intention sous le titre. */
  description?: string;
  sections: FormSection[];
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

function SectionHead({ id, title, description }: { id: string; title: string; description?: string | undefined }) {
  return (
    <div className="min-w-0">
      <h3 id={id} className="m-0 text-md font-heading">
        {title}
      </h3>
      {description && <p className="mt-0.5 mb-0 text-sm text-fg-3">{description}</p>}
    </div>
  );
}

function Loading({ title, description, sections }: Pick<FormPageProps, "title" | "description" | "sections">) {
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
  if (props.isLoading) return <Loading {...props} />;
  return <FormPageBody {...props} />;
}

/** À partir de 2 erreurs, un récapitulatif en haut du formulaire (D-341). */
const SUMMARY = { summary: true } as const;

function FormPageBody({ title, description, sections, initialValues, submitLabel, onSubmit, cancelLabel, onCancel, onDirtyChange }: FormPageProps) {
  const m = useMessages();
  const id = useId();
  const confirm = useConfirm();
  const all = sections.flatMap((s) => s.fields);
  const model = useFormModel(all, initialValues, onSubmit, SUMMARY);
  const { dirty, status, saving } = model;

  const notify = onDirtyChange;
  useEffect(() => {
    notify?.(dirty);
  }, [dirty, notify]);

  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void model.submit();
  };

  // « Annuler » après une saisie : confirmation (D-195).
  const cancel = async () => {
    if (!onCancel) return;
    if (!dirty) return onCancel();
    const ok = await confirm({ title: m.discardTitle, message: m.discardMessage, confirmLabel: m.discard, tone: "danger" });
    if (ok) onCancel();
  };

  const state = status === "dirty" ? m.unsavedChanges : status === "saving" ? m.saving : status === "saved" ? m.saved : "";

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
        <ErrorSummary model={model} />
        {sections.map((s, i) => (
          <section key={`${s.title}-${i}`} aria-labelledby={`${id}-s${i}`} className={sectionClass}>
            <SectionHead id={`${id}-s${i}`} title={s.title} description={s.description} />
            <FormFields fields={s.fields} model={model} />
          </section>
        ))}
      </div>
      {/* Pied collé en bas : état d'enregistrement, « Annuler », action principale (D-022, D-194). */}
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
        <Button type="submit" variant="primary" isPending={saving}>
          {submitLabel}
        </Button>
      </footer>
    </form>
  );
}
