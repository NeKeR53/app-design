/*
 * Adapté du starter Tailwind de React Aria (adobe/react-spectrum, starters/tailwind),
 * licence Apache 2.0. Spec : List.spec.md. Décisions : D-068 à D-070, D-084 à D-087.
 */
import type { MouseEvent, ReactNode } from "react";
import type { Key, Selection } from "react-aria-components";
import { GridList, GridListHeader, GridListItem, GridListSection } from "react-aria-components/GridList";
import { Button } from "react-aria-components/Button";
import { Checkbox } from "react-aria-components/Checkbox";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { ErrorBanner, highlight, LoadError, NoResults, ReloadBar, RetryButton, type ResultsStateProps } from "../../lib/results";
import { Check } from "../../icons";
import { Menu } from "../Menu/Menu";
import { useMessages } from "../../provider/SocleProvider";
import { Tooltip } from "../Tooltip/Tooltip";
import { OverflowTooltip } from "../Tooltip/OverflowTooltip";
import type { TableRowAction } from "../Table/Table";

export interface ListItemData {
  id: string;
  title: string;
  subtitle?: string;
  /** Méta courte à droite de la ligne 1 (date, montant). */
  meta?: string;
  /** Pastille de statut à droite de la ligne 2. */
  status?: { label: string; tone: "neutral" | "info" | "success" | "warning" | "danger" };
  /** Point de non-lu, à la place du statut (D-044). */
  unread?: boolean;
  /** Visuel : icône, initiales ou image, selon le type choisi pour la liste (D-069). */
  visual?: ReactNode;
}

export interface ListGroup {
  id: string;
  title: string;
  items: ListItemData[];
}

export interface ListProps extends ResultsStateProps {
  /** Nom accessible de la liste. */
  label: string;
  /** Éléments, ou `groups` pour des groupes avec en-tête collé (D-070). */
  items?: ListItemData[];
  groups?: ListGroup[];
  /** Type de visuel à gauche, le même pour toute la liste (D-069). */
  leading?: "icon" | "avatar" | "thumbnail";
  selectionMode?: "none" | "single" | "multiple";
  selectedKeys?: Iterable<Key>;
  onSelectionChange?: (keys: Set<Key>) => void;
  /** Ouverture (double-clic ou Entrée), dans une vue fermable (D-021). */
  onAction?: (id: string) => void;
  /** Deux actions au plus, au survol, à la place de la méta (D-066). */
  itemActions?: (item: ListItemData) => TableRowAction[];
  /** Pied : « n sur N » et « Afficher plus » (layout-rules, ListPage). */
  totalCount?: number;
  onLoadMore?: () => void;
}

const TONE: Record<NonNullable<ListItemData["status"]>["tone"], string> = {
  neutral: "bg-fg-3",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const VISUAL = {
  icon: "w-4 text-fg-2",
  avatar: "size-8 rounded-full bg-field text-xs font-semibold text-fg overflow-hidden",
  thumbnail: "size-10 rounded-md bg-field text-fg-3 overflow-hidden",
} as const;

export function List({
  label,
  items,
  groups,
  leading,
  selectionMode = "single",
  selectedKeys,
  onSelectionChange,
  onAction,
  itemActions,
  totalCount,
  onLoadMore,
  isLoading,
  hasError,
  onRetry,
  searchTerms,
  onClearSearch,
}: ListProps) {
  const m = useMessages();
  const all = groups ? groups.flatMap((g) => g.items) : (items ?? []);
  const terms = searchTerms?.filter(Boolean) ?? [];
  const twoLines = all.some((i) => i.subtitle);
  const firstLoad = isLoading && all.length === 0;
  const empty = !isLoading && !hasError && all.length === 0 && terms.length > 0;

  const onContextMenu = (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest('[role="row"]')?.querySelector<HTMLElement>("[data-row-menu]");
    if (btn) {
      e.preventDefault();
      btn.click();
    }
  };

  const renderItem = (it: ListItemData) => (
    <GridListItem
      key={it.id}
      id={it.id}
      textValue={it.title}
      className={cx(
        // Traits horizontaux, sans rayon (D-068) ; sélection fixe au survol (D-039).
        "group/item flex cursor-default items-center gap-3 border-b border-line px-3 outline-none",
        twoLines ? "min-h-(--row2-h) py-1.5" : "min-h-(--row-h)",
        "data-hovered:bg-hover data-selected:bg-selected data-selected:data-hovered:bg-selected",
        focusRing,
        "data-focus-visible:-outline-offset-2",
      )}
    >
      {selectionMode === "multiple" && (
        <Checkbox slot="selection" className="group/cb invisible inline-grid size-4 shrink-0 place-items-center rounded-sm border-[1.5px] border-fg-3 bg-surface text-accent-fg group-data-hovered/item:visible group-data-focus-visible/item:visible data-selected:visible data-selected:border-accent data-selected:bg-accent pointer-coarse:visible">
          {({ isSelected }) => isSelected && <Check size={12} />}
        </Checkbox>
      )}
      {leading && (
        <span className={cx("inline-grid shrink-0 place-items-center", VISUAL[leading], !twoLines && leading !== "icon" && "size-6")}>
          {it.visual}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-2">
          <OverflowTooltip text={it.title} textClass="min-w-0 flex-1 truncate text-fg">
            {highlight(it.title, terms)}
          </OverflowTooltip>
          {it.meta && (
            <span className={cx("shrink-0 text-sm text-fg-3 tabular-nums group-data-selected/item:text-fg-2", itemActions && "group-data-focus-visible/item:hidden group-data-hovered/item:hidden group-data-selected/item:hidden")}>
              {it.meta}
            </span>
          )}
          {itemActions && <ItemActions actions={itemActions(it).slice(0, 2)} />}
        </span>
        {twoLines && (
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <OverflowTooltip text={it.subtitle ?? ""} textClass="min-w-0 flex-1 truncate text-fg-2">
              {highlight(it.subtitle ?? "", terms)}
            </OverflowTooltip>
            {it.unread ? (
              <span role="img" aria-label={m.unread} className="size-2 shrink-0 rounded-full bg-accent" />
            ) : (
              it.status && (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-fg-2">
                  <i className={cx("inline-block size-[7px] rounded-full", TONE[it.status.tone])} />
                  {it.status.label}
                </span>
              )
            )}
          </span>
        )}
      </span>
    </GridListItem>
  );

  return (
    <div className="socle-box relative flex min-h-0 flex-1 flex-col font-sans text-md text-fg" onContextMenu={onContextMenu}>
      {isLoading && all.length > 0 && <ReloadBar />}
      {hasError && all.length > 0 && <ErrorBanner onRetry={onRetry} />}
      {hasError && all.length === 0 ? (
        <LoadError onRetry={onRetry} />
      ) : firstLoad ? (
        <Skeleton twoLines />
      ) : empty ? (
        <NoResults terms={terms} onClearSearch={onClearSearch} />
      ) : (
        <GridList
          aria-label={label}
          aria-busy={isLoading || undefined}
          selectionMode={selectionMode}
          selectionBehavior="replace"
          {...(selectedKeys ? { selectedKeys } : {})}
          {...(onSelectionChange ? { onSelectionChange: (k: Selection) => onSelectionChange(k === "all" ? new Set(all.map((i) => i.id)) : k) } : {})}
          {...(onAction ? { onAction: (k: Key) => onAction(String(k)) } : {})}
          className="min-h-0 flex-1 overflow-auto outline-none"
        >
          {groups
            ? groups.map((g) => (
                <GridListSection key={g.id} id={g.id} aria-label={g.title}>
                  {/* En-tête de groupe collé en haut, sans chevron (D-070). */}
                  <GridListHeader className="sticky top-0 z-[1] bg-surface px-3 pt-3 pb-1 text-sm text-fg-3">{g.title}</GridListHeader>
                  {g.items.map(renderItem)}
                </GridListSection>
              ))
            : all.map(renderItem)}
        </GridList>
      )}
      {totalCount !== undefined && all.length > 0 && (
        <div className="flex items-center gap-3 px-3 py-3 text-sm text-fg-3 tabular-nums" aria-live="polite">
          {m.countOf(all.length, totalCount)}
          {onLoadMore && all.length < totalCount && <RetryButton onRetry={onLoadMore}>{m.showMore}</RetryButton>}
        </div>
      )}
    </div>
  );
}

function ItemActions({ actions }: { actions: TableRowAction[] }) {
  return (
    <span className="hidden shrink-0 gap-0.5 group-data-focus-visible/item:flex group-data-hovered/item:flex group-data-selected/item:flex">
      {actions.map((a) => {
        const button = (
          <Tooltip content={a.label}>
            <Button
              aria-label={a.label}
              {...(a.menu ? { "data-row-menu": "" } : {})}
              {...(a.onPress ? { onPress: a.onPress } : {})}
              className={cx(buttonReset, "inline-grid size-[22px] place-items-center rounded-sm text-fg-2 data-hovered:bg-selected data-hovered:text-fg [&>svg]:size-3.5", focusRing)}
            >
              {a.icon}
            </Button>
          </Tooltip>
        );
        return a.menu ? (
          <Menu key={a.label} label={a.label} placement="bottom end" trigger={button}>
            {a.menu}
          </Menu>
        ) : (
          <span key={a.label}>{button}</span>
        );
      })}
    </span>
  );
}

function Skeleton({ twoLines }: { twoLines: boolean }) {
  return (
    <div aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className={cx("flex flex-col justify-center gap-2 border-b border-line px-3", twoLines ? "min-h-(--row2-h)" : "min-h-(--row-h)")}>
          <i className="block h-2.5 rounded-sm bg-field" style={{ width: `${40 + ((i * 7) % 25)}%` }} />
          {twoLines && <i className="block h-2.5 rounded-sm bg-field" style={{ width: `${24 + ((i * 3) % 10)}%` }} />}
        </div>
      ))}
    </div>
  );
}
