/*
 * Anatomie commune des champs : libellé, cadre, aide, erreur. Spec : Field.spec.md.
 * Décisions : D-022, D-130 à D-134. Module interne, non exporté par index.ts :
 * TextInput, TextArea, Select (et ComboBox) l'importent.
 */
import type { ReactNode } from "react";
import { FieldError } from "react-aria-components/FieldError";
import { Label } from "react-aria-components/Label";
import { Text } from "react-aria-components/Text";
import type { ValidationResult } from "react-aria-components/TextField";
import { useMessages } from "../../provider/SocleProvider";
import type { SocleMessages } from "../../i18n/messages";
import { cx } from "../../lib/cx";
import { Lock } from "../../icons";

/** Largeurs d'un champ (D-133) : 96, 160, 240, 360 px ou toute la place ; jamais plus large que le conteneur. */
export type FieldWidth = "xs" | "sm" | "md" | "lg" | "full";

const widths: Record<FieldWidth, string> = {
  xs: "w-24",
  sm: "w-40",
  md: "w-60",
  lg: "w-90",
  full: "w-full",
};

/** Racine d'un champ : colonne de 4 px d'écart ; sur mobile, toute la largeur (D-133) ; désactivé à 40 %. */
export function fieldRoot(width: FieldWidth | undefined = "full") {
  return cx(
    "socle-box group/field flex max-w-full min-w-0 flex-col gap-1 font-sans text-md text-fg max-tablet:w-full",
    widths[width],
    "data-disabled:opacity-40",
  );
}

/**
 * Cadre d'un champ (D-130) : fond surface, bord marqué, bord plus foncé au survol,
 * anneau accent au focus, bord rouge en erreur. Lecture seule : fond gris, sans survol (D-131).
 */
export function fieldBox({ isReadOnly = false }: { isReadOnly?: boolean | undefined } = {}) {
  return cx(
    "socle-box m-0 w-full min-w-0 rounded-md border font-sans text-md text-fg outline-none",
    "transition-colors duration-[var(--dur-fast)] ease-standard",
    "data-focused:outline-2 data-focused:outline-solid data-focused:outline-focus data-focused:outline-offset-1",
    "data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-focus data-focus-visible:outline-offset-1",
    isReadOnly
      ? "border-line bg-surface-side"
      : cx(
          "border-line-strong bg-surface data-hovered:border-fg-3",
          "data-invalid:border-danger data-invalid:data-hovered:border-danger group-data-invalid/field:border-danger",
          "group-data-open/field:outline-2 group-data-open/field:outline-solid group-data-open/field:outline-focus group-data-open/field:outline-offset-1",
        ),
  );
}

/** Liste flottante d'un Select ou d'un ComboBox (D-134) : style du DropdownMenu, au moins la largeur du cadre. */
export const listPopoverClass =
  "socle-box max-h-80 min-w-(--trigger-width) max-w-[max(320px,var(--trigger-width))] overflow-auto rounded-lg border border-line bg-surface-raised p-1 font-sans text-md text-fg shadow-md outline-none";

/** Option d'une liste : hauteur de ligne, mise en avant en --hover, coche à droite (D-050). */
export const optionClass = cx(
  "flex h-(--row-h) cursor-default items-center gap-2 rounded-md px-2.5 outline-none select-none",
  "data-focused:bg-hover data-disabled:opacity-40",
);

/** En-tête d'une section de liste. */
export const sectionHeaderClass = "px-2.5 pt-1.5 pb-0.5 text-sm text-fg-3";

/** Libellé au-dessus du champ (D-022, D-130) ; « (facultatif) » si le champ n'est pas obligatoire. */
export function FieldLabel({ children, isRequired, hidden }: { children: ReactNode; isRequired?: boolean | undefined; hidden?: boolean | undefined }) {
  const m = useMessages();
  return (
    <Label className={cx("w-fit text-sm font-medium text-fg", hidden && "sr-only")}>
      {children}
      {!isRequired && !hidden && <span className="font-normal text-fg-3"> {m.optional}</span>}
    </Label>
  );
}

/** Message d'erreur affiché à partir du résultat de la vérification (D-132). */
export type ErrorKind = "text" | "email" | "url" | "choice" | "checkbox" | "group";

export function errorText(v: ValidationResult, m: SocleMessages, kind: ErrorKind = "text"): string {
  const d = v.validationDetails;
  if (d?.valueMissing)
    return kind === "choice" ? m.requiredChoice : kind === "checkbox" ? m.requiredCheckbox : kind === "group" ? m.requiredGroup : m.requiredField;
  if (d?.typeMismatch) return kind === "email" ? m.invalidEmail : kind === "url" ? m.invalidUrl : m.invalidValue;
  if (d?.customError || !d) return v.validationErrors.join(" ") || m.invalidValue;
  return m.invalidValue;
}

/**
 * Sous le champ : l'aide, puis l'erreur qui prend sa place (D-130).
 * `error` : erreur imposée par l'app, prioritaire (D-132).
 */
export function FieldHelp({ description, error, kind, extra }: { description?: string | undefined; error?: string | undefined; kind?: ErrorKind | undefined; extra?: ReactNode }) {
  const m = useMessages();
  return (
    <>
      {(description || extra) && (
        <div className="flex gap-2 group-data-invalid/field:[&>.socle-desc]:hidden">
          {description && (
            <Text slot="description" className="socle-desc text-sm text-fg-3">
              {description}
            </Text>
          )}
          {extra}
        </div>
      )}
      <FieldError className="text-sm text-danger">{(v) => error ?? errorText(v, m, kind)}</FieldError>
    </>
  );
}

/** Cadenas de la lecture seule (D-131). */
export function ReadOnlyLock() {
  const m = useMessages();
  return (
    <span className="pointer-events-none absolute top-0 right-2.5 flex h-(--row-h) items-center text-fg-3" title={m.readOnly}>
      <Lock size={14} aria-hidden />
    </span>
  );
}

/** Propriétés communes à tous les champs (Field.spec.md). */
export interface FieldBaseProps {
  /** Libellé visible et nom accessible. */
  label: string;
  /** Masque le libellé à l'écran (ligne de réglage, tableau) ; il reste le nom accessible. */
  hideLabel?: boolean;
  /** Aide sous le champ. */
  description?: string;
  /** Champ obligatoire ; sans lui, « (facultatif) » suit le libellé (D-022). */
  isRequired?: boolean;
  /** Erreur imposée par l'app (réponse du serveur), affichée tout de suite (D-132). */
  error?: string;
  isDisabled?: boolean;
  /** Largeur (D-133). Défaut : toute la largeur. */
  width?: FieldWidth;
  /** Nom dans le formulaire envoyé. */
  name?: string;
}

/** Retire les clés à `undefined` (exactOptionalPropertyTypes) avant de passer des props à React Aria. */
export function defined<T extends object>(o: T): { [K in keyof T]: Exclude<T[K], undefined> } {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as { [K in keyof T]: Exclude<T[K], undefined> };
}
