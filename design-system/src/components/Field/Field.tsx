/*
 * Anatomie commune des champs : libellé, cadre, aide, erreur. Spec : Field.spec.md.
 * Décisions : D-022, D-130 à D-134. Module interne, non exporté par index.ts :
 * TextInput, TextArea, Select (et ComboBox) l'importent.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
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
    "outline-focus data-focused:outline-2 data-focused:outline-solid data-focused:outline-offset-1",
    "data-focus-visible:outline-2 data-focus-visible:outline-solid outline-focus data-focus-visible:outline-offset-1",
    isReadOnly
      ? "border-line bg-surface-side"
      : cx(
          "border-line-strong bg-surface data-hovered:border-fg-3",
          "data-invalid:border-danger data-invalid:data-hovered:border-danger group-data-invalid/field:border-danger",
          "group-data-open/field:outline-2 group-data-open/field:outline-solid outline-focus group-data-open/field:outline-offset-1",
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

/**
 * Libellé au-dessus du champ (D-022, D-130) ; « (facultatif) » si le champ n'est pas obligatoire.
 * `isReadOnly` : cadenas après le libellé, pour un groupe de choix en lecture seule (D-342).
 */
export function FieldLabel({
  children,
  isRequired,
  hidden,
  isReadOnly,
}: {
  children: ReactNode;
  isRequired?: boolean | undefined;
  hidden?: boolean | undefined;
  isReadOnly?: boolean | undefined;
}) {
  const m = useMessages();
  return (
    <Label className={cx("w-fit text-sm font-medium text-fg", hidden && "sr-only")}>
      {children}
      {!isRequired && !hidden && <span className="font-normal text-fg-3"> {m.optional}</span>}
      {isReadOnly && !hidden && <InlineLock />}
    </Label>
  );
}

/**
 * Cadenas de 14 px après un libellé : choix en lecture seule (D-342). Hors du nom accessible :
 * le lecteur d'écran dit déjà « lecture seule » (`aria-readonly`).
 */
export function InlineLock() {
  const m = useMessages();
  return (
    <span aria-hidden className="ml-1.5 inline-flex align-[-2px] text-fg-3" title={m.readOnly}>
      <Lock size={14} />
    </span>
  );
}

/** Message d'erreur affiché à partir du résultat de la vérification (D-132). */
export type ErrorKind = "text" | "email" | "url" | "choice" | "checkbox" | "group";

/**
 * Champ obligatoire vide (D-344) : `requiredMessage`, sinon une phrase construite à partir du
 * libellé cité (« Renseignez « Date de début ». », « Choisissez une valeur pour « Statut ». »,
 * « Cochez « J'accepte les conditions ». »), sinon le message générique. Le libellé garde sa casse ;
 * un deux-points ou un astérisque final est retiré.
 */
export function requiredText(m: SocleMessages, kind: ErrorKind, label?: string, requiredMessage?: string): string {
  if (requiredMessage) return requiredMessage;
  const l = label?.trim().replace(/[\s:*]+$/u, "");
  if (l) return kind === "choice" || kind === "group" ? m.requiredPick(l) : kind === "checkbox" ? m.requiredTick(l) : m.requiredText(l);
  return kind === "choice" ? m.requiredChoice : kind === "checkbox" ? m.requiredCheckbox : kind === "group" ? m.requiredGroup : m.requiredField;
}

export function errorText(v: ValidationResult, m: SocleMessages, kind: ErrorKind = "text", label?: string, requiredMessage?: string): string {
  const d = v.validationDetails;
  if (d?.valueMissing) return requiredText(m, kind, label, requiredMessage);
  if (d?.typeMismatch) return kind === "email" ? m.invalidEmail : kind === "url" ? m.invalidUrl : m.invalidValue;
  if (d?.customError || !d) return v.validationErrors.join(" ") || m.invalidValue;
  return m.invalidValue;
}

/**
 * Sous le champ : l'aide, puis l'erreur qui prend sa place (D-130).
 * `error` : erreur imposée par l'app, prioritaire (D-132).
 */
export function FieldHelp({
  description,
  error,
  kind,
  extra,
  label,
  requiredMessage,
}: {
  description?: string | undefined;
  error?: string | undefined;
  kind?: ErrorKind | undefined;
  extra?: ReactNode;
  /** Libellé du champ : sert au message d'un champ obligatoire vide (D-344). */
  label?: string | undefined;
  requiredMessage?: string | undefined;
}) {
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
      <FieldError className="text-sm text-danger">{(v) => error ?? errorText(v, m, kind, label, requiredMessage)}</FieldError>
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

/**
 * Limite de caractères dépassable (D-343) : pas d'attribut `maxlength` ; au-delà de `max`,
 * la vérification refuse la valeur avec « Saisissez n caractères au plus. ».
 */
export function withMaxLength(
  validate: ((value: string) => string | null | undefined) | undefined,
  max: number | undefined,
  m: SocleMessages,
): ((value: string) => string | null | undefined) | undefined {
  if (max === undefined) return validate;
  return (v) => (v.length > max ? m.tooLong(max) : (validate?.(v) ?? null));
}

/**
 * Compteur de caractères (D-343) : « 12 / 500 » en `--fg-3` ; au-delà de la limite,
 * « 4 caractères en trop » en `--danger`. Une seule zone `aria-live="polite"` le lit 1 s après la
 * dernière frappe. `hideUnder` : compteur visible seulement au-delà de la limite (TextInput, InlineEdit).
 */
export function CharCount({ id, length, max, hideUnder = false }: { id: string; length: number; max: number; hideUnder?: boolean }) {
  const m = useMessages();
  const over = length - max;
  const shown = over > 0 ? m.charsOver(over) : m.charCount(length, max);
  const spoken = over > 0 ? m.charsOver(over) : hideUnder ? "" : m.charsLeft(max - length);
  const [said, setSaid] = useState("");
  // Rien n'est lu à l'ouverture : seulement quand le texte à lire change, 1 s après la dernière frappe.
  const last = useRef(spoken);
  useEffect(() => {
    if (spoken === last.current) return;
    const t = setTimeout(() => {
      last.current = spoken;
      setSaid(spoken);
    }, 1000);
    return () => clearTimeout(t);
  }, [spoken]);
  return (
    <>
      {(!hideUnder || over > 0) && (
        <span id={id} className={cx("ml-auto shrink-0 text-xs", over > 0 ? "text-danger" : "text-fg-3")}>
          {shown}
        </span>
      )}
      <span aria-live="polite" className="sr-only">
        {said}
      </span>
    </>
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
  /** Message du champ obligatoire vide, à la place de celui construit à partir du libellé (D-344). */
  requiredMessage?: string;
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
