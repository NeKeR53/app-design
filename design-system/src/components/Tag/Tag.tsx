/*
 * Étiquettes interactives : groupe d'étiquettes à retirer ou à choisir (filtre). Spec : Tag.spec.md.
 * Validation : docs/validation/components/Nouveaux-P4-v1.html (T1 et T2, options A). Décision : D-362.
 * React Aria TagGroup : rôle `grid`, un seul arrêt de Tab, flèches entre étiquettes, Suppr et
 * Retour arrière retirent, `aria-selected` sur l'étiquette choisie.
 */
import { useId, type ReactNode } from "react";
import { Button } from "react-aria-components/Button";
import { Label } from "react-aria-components/Label";
import { Tag as RACTag, TagGroup as RACTagGroup, TagList, type Selection } from "react-aria-components/TagGroup";
import { Text } from "react-aria-components/Text";
import { useMessages } from "../../provider/SocleProvider";
import { buttonReset, cx } from "../../lib/cx";
import { Check, X } from "../../icons";
import { defined } from "../Field/Field";

export interface TagProps {
  /** Identifiant rendu par `onRemove` et `onSelectionChange`. */
  id: string;
  /** Libellé court ; nom accessible de l'étiquette et du bouton « Retirer <nom> ». */
  children: string;
  isDisabled?: boolean;
}

export interface TagGroupProps {
  /** Nom du groupe (« Étiquettes du ticket »), affiché au-dessus des étiquettes. */
  label: string;
  /** Masque le libellé à l'écran ; il reste le nom accessible du groupe. */
  hideLabel?: boolean;
  /** Aide sous le groupe. */
  description?: string;
  /** Étiquettes : des `<Tag>`. */
  children: ReactNode;
  /** Affiche la croix « Retirer <nom> » ; Suppr et Retour arrière retirent aussi l'étiquette qui a le focus. */
  onRemove?: (ids: string[]) => void;
  /** Étiquettes à choisir, pour filtrer. Défaut : `none`. */
  selectionMode?: "none" | "single" | "multiple";
  /** Étiquettes choisies (contrôlé). */
  selectedIds?: string[];
  /** Étiquettes choisies au départ (non contrôlé). */
  defaultSelectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Texte affiché quand le groupe est vide (« Aucune étiquette »). Sans lui, rien ne s'affiche. */
  emptyText?: string;
}

/**
 * Pastille neutre (D-362) : fond `--field`, texte `--fg`, rayon 4 px, hauteur `--btn-h-sm` (densité).
 * Choisie : fond `--selected` et coche. Survol `--hover` seulement si elle se choisit.
 */
const TAG = cx(
  "socle-box inline-flex h-(--btn-h-sm) max-w-[240px] min-w-0 cursor-default items-center gap-1 rounded-sm bg-field text-xs text-fg select-none",
  "transition-colors duration-[var(--dur-fast)] ease-standard",
  "data-selected:bg-selected data-selected:font-medium",
  "data-disabled:opacity-40",
  "outline-none data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-focus data-focus-visible:outline-offset-1",
);

const toIds = (s: Selection): string[] => (s === "all" ? [] : Array.from(s, String));

/** Groupe d'étiquettes (D-362). Jamais à la place d'un bouton : une étiquette ne lance pas d'action. */
export function TagGroup({
  label,
  hideLabel = false,
  description,
  children,
  onRemove,
  selectionMode = "none",
  selectedIds,
  defaultSelectedIds,
  onSelectionChange,
  emptyText,
}: TagGroupProps) {
  return (
    <RACTagGroup
      {...defined({
        selectedKeys: selectedIds,
        defaultSelectedKeys: defaultSelectedIds,
        onRemove: onRemove ? (keys: Set<string | number>) => onRemove(Array.from(keys, String)) : undefined,
        onSelectionChange: onSelectionChange ? (s: Selection) => onSelectionChange(toIds(s)) : undefined,
      })}
      selectionMode={selectionMode}
      className="socle-box flex max-w-full min-w-0 flex-col gap-1 font-sans text-md text-fg"
    >
      <Label className={cx("w-fit text-sm font-medium text-fg", hideLabel && "sr-only")}>{label}</Label>
      <TagList
        className="flex flex-wrap gap-1 outline-none"
        {...defined({ renderEmptyState: emptyText ? () => <span className="text-sm text-fg-3">{emptyText}</span> : undefined })}
      >
        {children}
      </TagList>
      {description && (
        <Text slot="description" className="text-sm text-fg-3">
          {description}
        </Text>
      )}
    </RACTagGroup>
  );
}

/** Étiquette d'un `TagGroup` (D-362). */
export function Tag({ id, children, isDisabled }: TagProps) {
  const m = useMessages();
  const removeId = useId();
  return (
    <RACTag
      id={id}
      textValue={children}
      {...defined({ isDisabled })}
      className={({ allowsRemoving, selectionMode, isSelected }) =>
        cx(TAG, allowsRemoving ? "pr-[3px] pl-2" : "px-2", isSelected && "pl-1.5", selectionMode !== "none" && "data-hovered:not-data-selected:bg-hover")
      }
    >
      {({ allowsRemoving, isSelected }) => (
        <>
          {isSelected && <Check size={12} aria-hidden className="shrink-0" />}
          <span className="min-w-0 truncate" title={children}>
            {children}
          </span>
          {allowsRemoving && (
            <Button
              slot="remove"
              // React Aria nomme la croix « Retirer » suivi du nom de l'étiquette ; on garde notre libellé (i18n).
              aria-labelledby={removeId}
              // Un seul arrêt de Tab pour tout le groupe : la croix se déclenche à la souris, Suppr la remplace au clavier.
              excludeFromTabOrder
              className={cx(
                buttonReset,
                "inline-grid size-[18px] shrink-0 cursor-default place-items-center rounded-[3px] text-fg-3 outline-none",
                "data-hovered:bg-line-strong data-hovered:text-fg data-disabled:opacity-100",
                "data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-focus",
              )}
            >
              <X size={12} aria-hidden />
              <span id={removeId} className="sr-only">
                {m.removeItem(children)}
              </span>
            </Button>
          )}
        </>
      )}
    </RACTag>
  );
}
