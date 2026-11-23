/*
 * Groupe de champs différents qui forment un tout, sous une légende. Spec : Fieldset.spec.md.
 * Décisions : D-022, D-130, D-138.
 */
import { useId, type ReactNode } from "react";
import { useMessages } from "../../provider/SocleProvider";

export interface FieldsetProps {
  /** Légende : nom du groupe. */
  legend: string;
  /** Aide du groupe. */
  description?: string;
  /** Erreur qui concerne plusieurs champs du groupe. */
  error?: string;
  /** Ajoute « (facultatif) » à la légende. */
  isOptional?: boolean;
  /** Désactive tous les champs du groupe. */
  isDisabled?: boolean;
  /** Champs Socle. */
  children: ReactNode;
}

export function Fieldset({ legend, description, error, isOptional, isDisabled, children }: FieldsetProps) {
  const m = useMessages();
  const id = useId();
  const help = error ?? description;
  return (
    <fieldset
      disabled={isDisabled}
      aria-describedby={help ? `${id}-help` : undefined}
      aria-invalid={error ? true : undefined}
      className="socle-box m-0 flex min-w-0 flex-col gap-1 border-0 p-0 font-sans text-md text-fg"
    >
      <legend className="mb-1 p-0 text-sm font-medium text-fg">
        {legend}
        {isOptional && <span className="font-normal text-fg-3"> {m.optional}</span>}
      </legend>
      <div className={isDisabled ? "flex flex-col gap-3 opacity-40" : "flex flex-col gap-3"}>{children}</div>
      {help && (
        <div id={`${id}-help`} role={error ? "alert" : undefined} className={error ? "text-sm text-danger" : "text-sm text-fg-3"}>
          {help}
        </div>
      )}
    </fieldset>
  );
}
