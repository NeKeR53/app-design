/*
 * Adapté du starter Tailwind de React Aria (adobe/react-spectrum, starters/tailwind),
 * licence Apache 2.0. Spec : Table.spec.md. Décisions : D-062 à D-067, D-084 à D-087, D-270 à D-277.
 */
import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Key, Selection, SortDescriptor } from "react-aria-components";
import { Cell, Column, ColumnResizer, ResizableTableContainer, Row, Table as RACTable, TableBody, TableHeader } from "react-aria-components/Table";
import { Button } from "react-aria-components/Button";
import { Checkbox } from "react-aria-components/Checkbox";
import { useMessages, useStoredState } from "../../provider/SocleProvider";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { ErrorBanner, highlight, LoadError, NoResults, ReloadBar, type ResultsStateProps } from "../../lib/results";
import { ArrowDown, ArrowUp, Check, ChevronDown, Minus } from "../../icons";
import { Menu, useRowMenu } from "../Menu/Menu";
import { Tooltip } from "../Tooltip/Tooltip";
import { Skeleton as Bar, SkeletonGroup } from "../Skeleton/Skeleton";
import { OverflowTooltip } from "../Tooltip/OverflowTooltip";

export interface TableColumn {
  id: string;
  label: string;
  /** `end` pour les nombres : alignés à droite, chiffres de largeur égale. */
  align?: "start" | "end";
  /** Largeur par défaut en px ; la première colonne prend la place restante. Sous 80 px, elle est aussi la largeur minimale (D-274). */
  width?: number;
  sortable?: boolean;
}

export interface TableRowAction {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  /** Si fourni, l'action ouvre ce menu ; le clic droit sur la ligne l'ouvre aussi (D-066). */
  menu?: ReactNode;
}

export interface TableProps<T extends { id: string }> extends ResultsStateProps {
  /** Nom accessible du tableau. */
  label: string;
  columns: TableColumn[];
  rows: T[];
  /** Contenu d'une cellule. Défaut : la valeur texte de `row[columnId]`. */
  renderCell?: (row: T, columnId: string) => ReactNode;
  /** Icône facultative de la colonne principale. */
  rowIcon?: (row: T) => ReactNode;
  selectionMode?: "none" | "single" | "multiple";
  selectedKeys?: Iterable<Key>;
  onSelectionChange?: (keys: Set<Key>) => void;
  sortDescriptor?: SortDescriptor;
  onSortChange?: (d: SortDescriptor) => void;
  /** Ouverture d'une ligne (double-clic ou Entrée), dans une vue fermable (D-021). */
  onAction?: (id: string) => void;
  /** Deux actions au plus, au survol (D-066). */
  rowActions?: (row: T) => TableRowAction[];
  /** Identifiant de mémorisation des largeurs, du tri et des groupes repliés. Défaut : `label`. */
  storageId?: string;
  /** `compact` : lignes de 25 px, en-tête de 28 px (D-271). Défaut : `default` (`--row-h`). */
  density?: "default" | "compact";
  /** Range les lignes sous des lignes de groupe repliables, dans l'ordre de première apparition (D-272). */
  groupBy?: (row: T) => string;
  /** Groupes repliés au premier affichage ; ensuite, l'état replié est mémorisé (D-272). */
  defaultCollapsedGroups?: string[];
  /** Précision sous le nom, dans la colonne principale : toutes les lignes deviennent doubles (D-273). */
  rowDescription?: (row: T) => string | undefined;
}

/** Ligne de groupe (D-272) : son id ne peut pas croiser celui d'une ligne de l'app. */
interface GroupItem {
  id: string;
  group: string;
  count: number;
}
const GROUP_PREFIX = "\u0000group:";
const isGroup = (item: object): item is GroupItem => "group" in item && String((item as GroupItem).id).startsWith(GROUP_PREFIX);

const MIN_W = 80;
const MAX_W = 480;
/** Largeur minimale absolue d'une colonne étroite déclarée (D-274). */
const NARROW_W = 32;

const checkboxClass = cx(
  "group/cb inline-grid size-4 cursor-default place-items-center rounded-sm border-[1.5px] border-fg-3 bg-surface text-accent-fg",
  "data-selected:border-accent data-selected:bg-accent data-indeterminate:border-accent data-indeterminate:bg-accent",
  focusRing,
);

function Box({ isSelected, isIndeterminate }: { isSelected: boolean; isIndeterminate: boolean }) {
  return isIndeterminate ? <Minus size={12} /> : isSelected ? <Check size={12} /> : null;
}

export function Table<T extends { id: string }>({
  label,
  columns,
  rows,
  renderCell,
  rowIcon,
  selectionMode = "single",
  selectedKeys,
  onSelectionChange,
  sortDescriptor,
  onSortChange,
  onAction,
  rowActions,
  storageId,
  isLoading,
  hasError,
  onRetry,
  searchTerms,
  onClearSearch,
  density = "default",
  groupBy,
  defaultCollapsedGroups,
  rowDescription,
}: TableProps<T>) {
  const m = useMessages();
  const key = storageId ?? label;
  // Largeurs mémorisées par tableau (D-067) ; un double-clic sur la poignée rend la largeur par défaut.
  const [widths, setWidths] = useStoredState<Record<string, number>>(`table:${key}:widths`, {});
  const [version, setVersion] = useState(0);
  // Tri mémorisé par tableau (D-007) ; l'app trie ses données (souvent par son API).
  const [storedSort, setStoredSort] = useStoredState<SortDescriptor | null>(`table:${key}:sort`, null);
  const sort = sortDescriptor ?? storedSort ?? undefined;
  const multiple = selectionMode === "multiple";
  const [checkedCount, setCheckedCount] = useState(0);
  const withActions = Boolean(rowActions);
  const compact = density === "compact";
  // Groupes repliés, mémorisés par tableau (D-272, D-007).
  const [collapsed, setCollapsed] = useStoredState<string[]>(`table:${key}:collapsed`, defaultCollapsedGroups ?? []);
  const toggleGroup = (g: string) => setCollapsed(collapsed.includes(g) ? collapsed.filter((x) => x !== g) : [...collapsed, g]);
  const colCount = (multiple ? 1 : 0) + columns.length + (withActions ? 1 : 0);
  // Hauteurs (D-271, D-273) : ligne simple ou double, en-tête ; marge de case resserrée en compact.
  const rowH = rowDescription ? "h-[calc(var(--row-h)+12px)]" : "h-(--row-h)";
  const headH = compact ? "h-7" : "h-(--row-h)";
  // En compact, l'interligne serré garde la ligne à 25 px même avec une pastille de 24 px.
  const padX = compact ? "px-2 py-0 leading-tight [&>*]:align-top" : "px-2.5";

  // Clic droit, appui long sur tactile, Maj+F10 ou touche Menu : le menu « … » de la ligne (D-066, D-007).
  const { rowMenuProps, onKey: onRowMenuKey } = useRowMenu();

  const terms = searchTerms?.filter(Boolean) ?? [];
  // Titre de la ligne, pour nommer ses actions : texte de la colonne principale (la première).
  const rowTitle = (row: T) => {
    const first = columns[0];
    if (!first) return undefined;
    const raw = renderCell ? renderCell(row, first.id) : (row as Record<string, unknown>)[first.id];
    return typeof raw === "string" || typeof raw === "number" ? String(raw) : undefined;
  };
  const firstLoad = isLoading && rows.length === 0;
  // React Aria ne pose `aria-expanded` que dans un arbre : on le pose sur chaque ligne de groupe,
  // à chaque changement des lignes (React Aria les monte dans un second temps).
  const boxRef = useRef<HTMLDivElement>(null);
  const grouped = Boolean(groupBy);
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box || !grouped) return;
    const sync = () =>
      box.querySelectorAll<HTMLElement>("[data-group]").forEach((el) => {
        const v = String(!el.hasAttribute("data-collapsed"));
        if (el.getAttribute("aria-expanded") !== v) el.setAttribute("aria-expanded", v);
      });
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(box, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-collapsed"] });
    return () => obs.disconnect();
  }, [grouped]);
  const items: Array<T | GroupItem> = groupBy ? groupRows(rows, groupBy, collapsed) : rows;
  const groupKeys = groupBy ? items.filter(isGroup).map((g) => g.id) : [];

  // Espace replie aussi la ligne de groupe ; Entrée passe par `onAction` de la ligne (D-272).
  const onKeyDown = (e: KeyboardEvent) => {
    if (onRowMenuKey(e) || e.key !== " " || !groupBy) return;
    const g = (e.target as HTMLElement).closest<HTMLElement>("[data-group]")?.dataset.group;
    if (g !== undefined) {
      e.preventDefault();
      e.stopPropagation();
      toggleGroup(g);
    }
  };
  const empty = !isLoading && !hasError && rows.length === 0 && terms.length > 0;

  return (
    <div
      ref={boxRef}
      className={cx("socle-box relative flex min-h-0 flex-1 flex-col font-sans text-md text-fg", compact && "[--row-h:25px]")}
      {...rowMenuProps}
      onKeyDownCapture={onKeyDown}
    >
      {isLoading && rows.length > 0 && <ReloadBar />}
      {hasError && rows.length > 0 && <ErrorBanner onRetry={onRetry} />}
      {hasError && rows.length === 0 ? (
        <LoadError onRetry={onRetry} />
      ) : (
        <ResizableTableContainer
          key={version}
          className="relative min-h-0 flex-1 overflow-auto"
          onResizeEnd={(map) => {
            const next = { ...widths };
            const resizable = new Set(columns.slice(1).map((c) => c.id));
            map.forEach((v, k) => {
              if (typeof v === "number" && resizable.has(String(k))) next[String(k)] = Math.round(v);
            });
            setWidths(next);
          }}
        >
          <RACTable
            aria-label={label}
            aria-busy={isLoading || undefined}
            selectionMode={selectionMode}
            selectionBehavior="replace"
            {...(selectedKeys ? { selectedKeys } : {})}
            onSelectionChange={(keys: Selection) => {
              const set = keys === "all" ? new Set<Key>(rows.map((r) => r.id)) : keys;
              setCheckedCount(set.size);
              onSelectionChange?.(set);
            }}
            {...(sort ? { sortDescriptor: sort } : {})}
            onSortChange={(d: SortDescriptor) => {
              setStoredSort(d);
              onSortChange?.(d);
            }}
            {...(groupKeys.length ? { disabledKeys: groupKeys, disabledBehavior: "selection" as const } : {})}
            {...(onAction ? { onRowAction: (k: Key) => !String(k).startsWith(GROUP_PREFIX) && onAction(String(k)) } : {})}
            className={cx("w-full border-separate border-spacing-0 outline-none", multiple && checkedCount > 1 && "socle-has-checked")}
          >
            <TableHeader className="sticky top-0 z-[2] bg-surface">
              {multiple && (
                <Column width={40} minWidth={40} className={cx(headH, "border-b border-line px-3 text-start")}>
                  <Checkbox slot="selection" aria-label={m.selectAll} className={checkboxClass}>
                    {({ isSelected, isIndeterminate }) => <Box isSelected={isSelected} isIndeterminate={isIndeterminate} />}
                  </Checkbox>
                </Column>
              )}
              {columns.map((col, i) => (
                <Column
                  key={col.id}
                  id={col.id}
                  isRowHeader={i === 0}
                  allowsSorting={Boolean(col.sortable)}
                  {...(i === 0
                    ? { minWidth: 160 }
                    : { defaultWidth: widths[col.id] ?? col.width ?? 140, minWidth: Math.max(NARROW_W, Math.min(MIN_W, col.width ?? MIN_W)), maxWidth: MAX_W })}
                  className={cx(
                    "group/col relative cursor-default border-b border-line text-sm font-medium text-fg-2 outline-none data-hovered:text-fg",
                    headH,
                    padX,
                    col.align === "end" ? "text-end" : "text-start",
                    focusRing,
                    "data-focus-visible:-outline-offset-2",
                  )}
                >
                  {({ allowsSorting, sortDirection }) => (
                    <span className={cx("flex min-w-0 items-center gap-1", col.align === "end" && "justify-end")}>
                      {/* Libellé coupé : libellé complet en info-bulle (D-275). */}
                      <OverflowTooltip text={col.label} />
                      {allowsSorting && <span className="inline-grid w-3 place-items-center">{sortDirection === "ascending" ? <ArrowUp size={12} /> : sortDirection === "descending" ? <ArrowDown size={12} /> : null}</span>}
                      {i > 0 && (
                        <span
                          className="absolute top-1.5 right-0 bottom-1.5"
                          onDoubleClick={() => {
                            const next = { ...widths };
                            delete next[col.id];
                            setWidths(next);
                            setVersion((v) => v + 1);
                          }}
                        >
                          <ColumnResizer
                            aria-label={m.columnWidth(col.label)}
                            className={cx("block h-full w-1.5 cursor-col-resize border-r border-line outline-none data-hovered:border-fg-3 data-resizing:border-accent", focusRing)}
                          />
                        </span>
                      )}
                    </span>
                  )}
                </Column>
              ))}
              {withActions && <Column width={72} minWidth={72} aria-label={m.rowActions} className={cx(headH, "border-b border-line")} />}
            </TableHeader>
            <TableBody
              items={firstLoad ? [] : items}
              // Les cellules se redessinent quand la recherche ou le rendu change, même avec les mêmes lignes (D-087).
              dependencies={[terms.join("\u0000"), renderCell, rowActions]}
              renderEmptyState={() =>
                firstLoad ? <Skeleton cols={columns.length} /> : empty ? <NoResults terms={terms} onClearSearch={onClearSearch} /> : null
              }
            >
              {(item) => {
                if (isGroup(item)) return <GroupRow item={item} colCount={colCount} isCollapsed={collapsed.includes(item.group)} onToggle={() => toggleGroup(item.group)} countLabel={m.groupCount} />;
                const row = item;
                const description = rowDescription?.(row);
                return (
                <Row
                  id={row.id}
                  className={cx(
                    "group/row cursor-default outline-none",
                    "data-hovered:[&>td]:bg-hover data-selected:[&>td]:bg-selected data-selected:data-hovered:[&>td]:bg-selected",
                    focusRing,
                    "data-focus-visible:-outline-offset-2",
                  )}
                >
                  {multiple && (
                    <Cell className={cx(rowH, "border-b border-line px-3")}>
                      <Checkbox slot="selection" className={cx(checkboxClass, "invisible group-data-hovered/row:visible group-data-focus-visible/row:visible data-selected:visible [.socle-has-checked_&]:visible pointer-coarse:visible")}>
                        {({ isSelected, isIndeterminate }) => <Box isSelected={isSelected} isIndeterminate={isIndeterminate} />}
                      </Checkbox>
                    </Cell>
                  )}
                  {columns.map((col, i) => {
                    const raw = renderCell ? renderCell(row, col.id) : (row as Record<string, unknown>)[col.id];
                    const isEmpty = raw === undefined || raw === null || raw === "";
                    // Texte coupé : texte complet dans l'info-bulle Socle (Table.spec.md, Contenu).
                    const text = isEmpty ? "—" : typeof raw === "string" ? <OverflowTooltip text={raw} textClass="block min-w-0 truncate">{highlight(raw, terms)}</OverflowTooltip> : (raw as ReactNode);
                    // Ligne double : précision sous le nom, dans la colonne principale (D-273).
                    const content =
                      i === 0 && rowDescription ? (
                        <span className="flex min-w-0 flex-col leading-tight">
                          <span className="min-w-0">{text}</span>
                          {description ? <OverflowTooltip text={description} textClass="block min-w-0 truncate text-sm text-fg-3" /> : null}
                        </span>
                      ) : (
                        text
                      );
                    return (
                      <Cell
                        key={col.id}
                        className={cx(
                          "max-w-0 truncate border-b border-line whitespace-nowrap",
                          rowH,
                          padX,
                          i === 0 ? "text-fg" : "text-fg-2",
                          isEmpty && "text-fg-3",
                          col.align === "end" && "text-end tabular-nums",
                        )}
                      >
                        {i === 0 && rowIcon ? (
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="inline-grid shrink-0 text-fg-2">{rowIcon(row)}</span>
                            <span className="min-w-0 flex-1">{content}</span>
                          </span>
                        ) : (
                          content
                        )}
                      </Cell>
                    );
                  })}
                  {withActions && (
                    <Cell className={cx(rowH, "border-b border-line pr-2")}>
                      <RowActions actions={rowActions!(row).slice(0, 2)} rowTitle={rowTitle(row)} />
                    </Cell>
                  )}
                </Row>
                );
              }}
            </TableBody>
          </RACTable>
        </ResizableTableContainer>
      )}
    </div>
  );
}

/** Lignes de l'app rangées sous leurs lignes de groupe, dans l'ordre de première apparition (D-272). */
function groupRows<T extends { id: string }>(rows: T[], groupBy: (row: T) => string, collapsed: string[]): Array<T | GroupItem> {
  const groups = new Map<string, T[]>();
  for (const r of rows) {
    const g = groupBy(r);
    const list = groups.get(g);
    if (list) list.push(r);
    else groups.set(g, [r]);
  }
  const out: Array<T | GroupItem> = [];
  groups.forEach((list, g) => {
    out.push({ id: GROUP_PREFIX + g, group: g, count: list.length });
    if (!collapsed.includes(g)) out.push(...list);
  });
  return out;
}

/** Ligne de groupe : chevron, nom en gras, « · n lignes », sans fond ; clic, Entrée ou Espace replient (D-272). */
function GroupRow({ item, colCount, isCollapsed, onToggle, countLabel }: { item: GroupItem; colCount: number; isCollapsed: boolean; onToggle: () => void; countLabel: (n: number) => string }) {
  return (
    <Row
      id={item.id}
      textValue={item.group}
      onAction={onToggle}
      data-group={item.group}
      data-collapsed={isCollapsed || undefined}
      className={cx("group/grow cursor-default outline-none data-hovered:[&>td]:bg-hover", focusRing, "data-focus-visible:-outline-offset-2")}
    >
      <Cell colSpan={colCount} className="h-(--row-h) border-b border-line px-2 align-bottom pb-1 pt-2">
        <span className="flex min-w-0 items-center gap-1">
          <span aria-hidden className={cx("inline-grid shrink-0 text-fg-3", isCollapsed && "-rotate-90")}>
            <ChevronDown size={12} />
          </span>
          <span className="min-w-0 truncate font-semibold text-fg">{item.group}</span>
          <span className="shrink-0 text-fg-3">· {countLabel(item.count)}</span>
        </span>
      </Cell>
    </Row>
  );
}

/**
 * Actions au survol, au focus et sur la ligne sélectionnée (D-066) ; visibles aussi tant que leur menu est ouvert.
 * Leur nom reprend la ligne : « Archiver Rapport trimestriel », « Plus d'actions pour Rapport trimestriel ».
 */
function RowActions({ actions, rowTitle }: { actions: TableRowAction[]; rowTitle: string | undefined }) {
  const m = useMessages();
  const name = (label: string) => (!rowTitle ? label : label === m.moreActions ? m.moreActionsFor(rowTitle) : m.rowAction(label, rowTitle));
  return (
    <span className="invisible flex justify-end gap-0.5 group-data-focus-visible/row:visible group-data-hovered/row:visible group-data-selected/row:visible group-has-[[aria-haspopup][aria-expanded=true]]/row:visible">
      {actions.map((a) => {
        const button = (
          <Tooltip content={a.label}>
            <Button
              aria-label={name(a.label)}
              {...(a.menu ? { "data-row-menu": "" } : {})}
              {...(a.onPress ? { onPress: a.onPress } : {})}
              className={cx(buttonReset, "inline-grid size-6 place-items-center rounded-sm text-fg-2 data-hovered:bg-selected data-hovered:text-fg [&>svg]:size-3.5", focusRing)}
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

/** 6 lignes squelettes au premier chargement (D-084). */
function Skeleton({ cols }: { cols: number }) {
  return (
    <SkeletonGroup delay={0}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex h-(--row-h) items-center gap-6 border-b border-line px-2.5">
          {Array.from({ length: Math.min(cols, 4) }, (_, j) => (
            <Bar key={j} width={j === 0 ? `${38 + ((i * 7) % 20)}%` : "12%"} />
          ))}
        </div>
      ))}
    </SkeletonGroup>
  );
}
