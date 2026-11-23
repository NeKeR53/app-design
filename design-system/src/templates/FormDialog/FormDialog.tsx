/*
 * Formulaire en modale : `useOpenForm()` rend `openForm(spec)`, une promesse des valeurs.
 * Spec : FormDialog.spec.md. Décisions : D-190 à D-192, D-196 à D-198.
 * L'hôte est rendu par SocleProvider, comme la confirmation (D-127, D-197).
 */
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle } from "../../icons";
import { FormFields, inputFields, useFormModel, type FormField, type FormSubmit, type FormValues } from "../../lib/form";
import { useMessages } from "../../provider/SocleProvider";
import { Button } from "../../components/Button/Button";
import { Dialog, type DialogSize } from "../../components/Dialog/Dialog";

export interface OpenFormOptions {
  /** Titre : le verbe et l'objet (« Nouveau contact »). */
  title: string;
  /** Phrase sous le titre. */
  description?: string;
  /** Six champs au plus (D-198). */
  fields: FormField[];
  /** Valeurs de départ ; l'objet lu en base convient (D-191). */
  initialValues?: object;
  /** Libellé de l'action : « Ajouter », « Renommer ». */
  submitLabel: string;
  /** Défaut : « Annuler ». */
  cancelLabel?: string;
  /** Enregistre avant de fermer : la modale attend, et reste ouverte en cas d'échec (D-197, D-198). */
  onSubmit?: FormSubmit;
}

/** Ouvre le formulaire ; rend les valeurs une fois envoyé, `null` si l'utilisateur ferme (D-197). */
export type OpenFormFunction = (options: OpenFormOptions) => Promise<FormValues | null>;

const OpenFormContext = createContext<OpenFormFunction | null>(null);

/** Formulaire court en modale. Demande `SocleProvider` à la racine de l'app (D-197). */
export function useOpenForm(): OpenFormFunction {
  const open = useContext(OpenFormContext);
  if (!open) throw new Error("[socle-ui] useOpenForm demande un SocleProvider à la racine de l'app.");
  return open;
}

/** Taille (D-198) : `sm` jusqu'à quatre champs sans zone de texte ni groupe, sinon `md`. */
export function formDialogSize(fields: readonly FormField[]): DialogSize {
  const simple = fields.every((f) => f.type !== "fieldset" && f.type !== "textarea" && f.type !== "checkboxGroup");
  return simple && inputFields(fields).length <= 4 ? "sm" : "md";
}

interface Request {
  id: number;
  options: OpenFormOptions;
  resolve: (values: FormValues | null) => void;
}

let seq = 0;

/** Hôte unique du formulaire en modale, placé par SocleProvider. */
export function FormDialogProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<Request | null>(null);
  const [isOpen, setOpen] = useState(false);
  const current = useRef<Request | null>(null);

  // Une nouvelle demande ferme la précédente, qui rend `null` (D-197).
  const openForm = useCallback<OpenFormFunction>(
    (options) =>
      new Promise<FormValues | null>((resolve) => {
        current.current?.resolve(null);
        seq += 1;
        const r = { id: seq, options, resolve };
        current.current = r;
        setRequest(r);
        setOpen(true);
      }),
    [],
  );

  useEffect(() => () => current.current?.resolve(null), []);

  const settle = useCallback((values: FormValues | null) => {
    const r = current.current;
    current.current = null;
    setOpen(false);
    r?.resolve(values);
  }, []);

  return (
    <OpenFormContext.Provider value={openForm}>
      {children}
      {request && <FormDialogView key={request.id} options={request.options} isOpen={isOpen} onDone={settle} />}
    </OpenFormContext.Provider>
  );
}

function FormDialogView({ options, isOpen, onDone }: { options: OpenFormOptions; isOpen: boolean; onDone: (values: FormValues | null) => void }) {
  const m = useMessages();
  const id = useId();
  const model = useFormModel(options.fields, options.initialValues, options.onSubmit);
  const { saving, status } = model;

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = await model.submit();
    if (values) onDone(values);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => !open && onDone(null)}
      title={options.title}
      {...(options.description ? { description: options.description } : {})}
      size={formDialogSize(options.fields)}
      isBusy={saving}
      footer={
        <>
          <Button onPress={() => onDone(null)} isDisabled={saving}>
            {options.cancelLabel ?? m.cancel}
          </Button>
          <Button type="submit" form={`${id}-form`} variant="primary" isPending={saving}>
            {options.submitLabel}
          </Button>
        </>
      }
    >
      <form id={`${id}-form`} ref={model.formRef} onSubmit={(e) => void send(e)} onKeyDown={model.onKeyDown} aria-label={options.title} className="flex min-w-0 flex-col gap-4">
        <FormFields fields={options.fields} model={model} />
        {status === "error" && model.message && (
          <div role="alert" className="flex items-start gap-1.5 text-sm text-danger">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{model.message}</span>
          </div>
        )}
      </form>
    </Dialog>
  );
}
