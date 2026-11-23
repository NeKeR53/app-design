/*
 * Styles communs aux cases, boutons radio et interrupteurs (D-135, D-136). Module interne.
 */
import { cx } from "../../lib/cx";

/** Ligne d'un choix : indicateur à gauche, libellé à droite, cible minimale (AA). */
export const choiceRow = "socle-box group/choice flex min-h-(--target-min) w-fit max-w-full cursor-default items-start gap-2 py-0.5 font-sans text-md text-fg outline-none select-none data-disabled:opacity-40";

/** Décalage qui centre un indicateur de `size` px sur la première ligne du libellé. */
export const alignFirstLine = (size: 16 | 18) =>
  size === 16 ? "mt-[calc((var(--fs-md)*var(--lh)_-_16px)/2)]" : "mt-[calc((var(--fs-md)*var(--lh)_-_18px)/2)]";

/** Anneau de focus clavier autour de l'indicateur. */
export const indicatorFocus =
  "group-data-focus-visible/choice:outline-2 group-data-focus-visible/choice:outline-solid group-data-focus-visible/choice:outline-focus group-data-focus-visible/choice:outline-offset-1";

/** Case ou rond (D-135) : bord marqué, accent quand c'est coché, rouge en erreur. */
export const indicator = cx(
  "socle-box grid size-4 shrink-0 place-items-center border border-line-strong bg-surface text-accent-fg",
  "transition-colors duration-[var(--dur-fast)] ease-standard",
  "group-data-hovered/choice:border-fg-3 group-data-invalid/choice:border-danger",
  "group-data-selected/choice:border-accent group-data-selected/choice:bg-accent",
  "group-data-indeterminate/choice:border-accent group-data-indeterminate/choice:bg-accent",
  alignFirstLine(16),
  indicatorFocus,
);

/** Libellé et description d'un choix. */
export const choiceText = "flex min-w-0 flex-col";
export const choiceDescription = "text-sm text-fg-3";

/** Liste des options d'un groupe (D-138). */
export const groupList = (orientation: "vertical" | "horizontal" | undefined) =>
  cx("flex", orientation === "horizontal" ? "flex-col gap-1 tablet:flex-row tablet:flex-wrap tablet:gap-x-5" : "flex-col gap-1");

/**
 * Case ou rond en lecture seule (D-342, comme D-131) : fond `--surface-side`, bord `--line`,
 * marque en `--fg-2` au lieu de l'accent, pas de survol ; le focus clavier reste visible.
 */
export const indicatorReadOnly = cx("socle-box grid size-4 shrink-0 place-items-center border border-line bg-surface-side text-fg-2", alignFirstLine(16), indicatorFocus);
