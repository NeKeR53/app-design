/*
 * Gabarit de liste. Spec : ListPage.spec.md. Décisions : D-173 à D-178.
 * L'app décrit sa page par des données ; le gabarit dessine les zones et tous les états.
 */
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Key, SortDescriptor } from "react-aria-components";
import { Button } from "../../components/Button/Button";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { FormattedValue, isEmptyValue, isRichValue, useFormatValue, valueLayout, valueSortKey, type ValueFormat } from "../../components/FormattedValue/FormattedValue";
import { IconButton } from "../../components/IconButton/IconButton";
import { List, type ListItemData } from "../../components/List/List";
import { DropdownMenu } from "../../components/DropdownMenu/DropdownMenu";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import { Select } from "../../components/Select/Select";
import { Table, type TableColumn, type TableRowAction } from "../../components/Table/Table";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "../../icons";
import { norm } from "../../lib/results";
import { ActionBar, arrangeActions, useActionRunner, type Action } from "../../patterns/ActionBar/ActionBar";
import { useMessages, useStoredState } from "../../provider/SocleProvider";

/** Une colonne, décrite par sa donnée : le type fixe format, alignement, largeur et tri (D-172). */
export interface ListPageColumn<Row> extends ValueFormat {
  /** Identifiant ; lu dans la ligne (`row[id]`) sauf si `value` est donné. */
  id: string;
  /** En-tête court : « État », « Montant ». */
  label: string;
  /** Valeur de la ligne, quand elle ne se lit pas dans `row[id]`. */
  value?: (row: Row) => unknown;
  /** Défaut : vrai. */
  sortable?: boolean;
}

/** Un filtre de la barre : un `Select` « Tous les … » suivi des options (D-174). */
export interface ListPageFilter<Row> {
  id: string;
  /** Nom du filtre : « État ». */
  label: string;
  /** Première entrée, sans filtre : « Tous les états ». */
  allLabel: string;
  options: ReadonlyArray<{ id: string; label: string }>;
  /** Clé (ou clés) de la ligne comparée aux options. Défaut : `row[id]`. */
  value?: (row: Row) => string | ReadonlyArray<string> | null | undefined;
}

export interface ListPageSort {
  column: string;
  direction: "ascending" | "descending";
}

/** État de la page, signalé à `onStateChange` (D-174). `page` commence à 1. */
export interface ListPageState {
  query: string;
  filters: Readonly<Record<string, string>>;
  sort: ListPageSort | null;
  page: number;
}

export interface ListPageProps<Row extends { id: string }> {
  /** Titre de la page : « Demandes ». */
  title: string;
  /** Une phrase sous le titre. */
  description?: string;
  /** Actions de la page (zone `header`) ; l'action `primary` revient dans l'état vide. */
  actions?: ReadonlyArray<Action>;
  /** Les lignes. `undefined` : premier chargement. */
  rows: ReadonlyArray<Row> | undefined;
  columns: ReadonlyArray<ListPageColumn<Row>>;
  /** `table` (défaut) ou `list`. */
  layout?: "table" | "list";
  /** Pour `list` : l'`id` de la colonne qui donne chaque pièce. Défaut : titre = première colonne. */
  item?: { title: string; subtitle?: string; meta?: string; status?: string };
  /** Recherche dans la barre. Défaut : vrai. */
  search?: boolean | { label?: string; text?: (row: Row) => string };
  /** Trois au plus. */
  filters?: ReadonlyArray<ListPageFilter<Row>>;
  /** Actions d'une ligne (zone `row`). */
  rowActions?: (row: Row) => ReadonlyArray<Action>;
  selectionMode?: "single" | "multiple";
  /** Ligne sélectionnée (panneau de détail). */
  selectedId?: string | null;
  onSelect?: (row: Row | null) => void;
  /** Actions groupées sur les lignes cochées (`multiple`) (D-178). */
  selectionActions?: (rows: ReadonlyArray<Row>) => ReadonlyArray<Action>;
  /** Ouverture : double-clic ou Entrée (D-021). */
  onOpen?: (row: Row) => void;
  /** Pied de liste (D-175). Défaut : `{ mode: "more", pageSize: 50 }`. */
  pagination?: { mode?: "more" | "pages"; pageSize?: number };
  /** État vide (D-176). */
  empty: { title: string; description?: string; icon?: ReactNode };
  /** Rechargement avec des lignes déjà là (D-084). */
  isLoading?: boolean;
  /** Le dernier chargement a échoué (D-085). */
  hasError?: boolean;
  onRetry?: () => void;
  /** Données côté serveur : rien n'est filtré, trié ni découpé ici (D-174). */
  remote?: boolean;
  /** `remote` : nombre total d'éléments qui correspondent. */
  total?: number;
  onStateChange?: (state: ListPageState) => void;
  /** Clé de mémorisation des filtres et du tri (D-177). Défaut : `title`. */
  storageId?: string;
  onActionError?: (action: Action, error: unknown) => void;
  onActionDone?: (action: Action) => void;
}

type ReadFn<Row> = (row: Row, column: ListPageColumn<Row>) => unknown;

export function ListPage<Row extends { id: string }>({
  title,
  description,
  actions = [],
  rows,
  columns,
  layout = "table",
  item,
  search = true,
  filters = [],
  rowActions,
  selectionMode = "single",
  selectedId,
  onSelect,
  selectionActions,
  onOpen,
  pagination,
  empty,
  isLoading = false,
  hasError = false,
  onRetry,
  remote = false,
  total: totalProp,
  onStateChange,
  storageId,
  onActionError,
  onActionDone,
}: ListPageProps<Row>) {
  const m = useMessages();
  const fmt = useFormatValue();
  const key = `listpage:${storageId ?? title}`;
  const mode = pagination?.mode ?? "more";
  const pageSize = Math.max(1, pagination?.pageSize ?? 50);
  const nf = useMemo(() => new Intl.NumberFormat(m.locale), [m.locale]);

  // Filtres et tri mémorisés, recherche oubliée (D-177).
  const [storedFilters, setStoredFilters] = useStoredState<Record<string, string>>(`${key}:filters`, {});
  const [sort, setSort] = useStoredState<ListPageSort | null>(`${key}:sort`, null);
  const [query, setQuery] = useState("");
  const [searchVersion, setSearchVersion] = useState(0);
  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());

  const known = new Set(filters.map((f) => f.id));
  const activeFilters = Object.fromEntries(Object.entries(storedFilters).filter(([id, v]) => v && known.has(id)));
  const criteria = query !== "" || Object.keys(activeFilters).length > 0;

  const read: ReadFn<Row> = (row, column) => (column.value ? column.value(row) : (row as Record<string, unknown>)[column.id]);
  const byId = new Map(columns.map((c) => [c.id, c]));

  // État signalé à l'app à chaque changement (mode `remote` surtout).
  const state = JSON.stringify({ query, filters: activeFilters, sort, page });
  const reported = useRef(state);
  const report = useRef(onStateChange);
  report.current = onStateChange;
  useEffect(() => {
    if (reported.current === state) return;
    reported.current = state;
    report.current?.(JSON.parse(state) as ListPageState);
  }, [state]);

  const setFilter = (id: string, value: string | null) => {
    setStoredFilters({ ...activeFilters, [id]: value ?? "" });
    setPage(1);
  };
  const clearCriteria = () => {
    setQuery("");
    setSearchVersion((v) => v + 1);
    setStoredFilters({});
    setPage(1);
  };

  // Recherche, filtres et tri locaux (D-174), sauf en mode `remote`.
  const matching = useMemo(() => {
    const all = rows ?? [];
    if (remote) return [...all];
    const words = norm(query).split(/\s+/).filter(Boolean);
    const textOf = (row: Row) =>
      typeof search === "object" && search.text ? search.text(row) : columns.map((c) => fmt(read(row, c), c)).join(" ");
    const result = all.filter((row) => {
      for (const f of filters) {
        const wanted = activeFilters[f.id];
        if (!wanted) continue;
        const v = f.value ? f.value(row) : (row as Record<string, unknown>)[f.id];
        const ok = Array.isArray(v) ? v.includes(wanted) : String(v ?? "") === wanted;
        if (!ok) return false;
      }
      if (!words.length) return true;
      const text = norm(textOf(row));
      return words.every((w) => text.includes(w));
    });
    const col = sort ? byId.get(sort.column) : undefined;
    if (!col || !sort) return result;
    const dir = sort.direction === "descending" ? -1 : 1;
    const collator = new Intl.Collator(m.locale, { numeric: true, sensitivity: "base" });
    return result
      .map((row) => {
        const v = read(row, col);
        return { row, empty: isEmptyValue(v), k: valueSortKey(v, col), t: fmt(v, col) };
      })
      .sort((a, b) => {
        // Valeur vide toujours en dernier (D-172).
        if (a.empty !== b.empty) return a.empty ? 1 : -1;
        const c = a.k !== null && b.k !== null ? a.k - b.k : collator.compare(a.t, b.t);
        return c * dir;
      })
      .map((x) => x.row);
  }, [rows, remote, query, state, columns, filters, search, fmt, m.locale]);

  const total = remote ? (totalProp ?? matching.length) : matching.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  const shown = remote ? matching : mode === "pages" ? matching.slice((current - 1) * pageSize, current * pageSize) : matching.slice(0, current * pageSize);

  // Les cases cochées restent dans les lignes qui correspondent : une recherche, un filtre ou un
  // rechargement décoche les lignes masquées. Le compte de la barre de sélection est donc toujours
  // celui des lignes que l'action groupée touchera (D-178).
  useEffect(() => {
    const visible = new Set(matching.map((r) => r.id));
    setChecked((prev) => {
      const kept = [...prev].filter((id) => visible.has(id));
      return kept.length === prev.size ? prev : new Set(kept);
    });
  }, [matching]);

  // Pied « pages » : une nouvelle page s'affiche depuis son début. Le focus reste dans la pagination,
  // même quand le bouton pressé devient inactif (première ou dernière page).
  const listRef = useRef<HTMLDivElement>(null);
  const pagerRef = useRef<HTMLElement>(null);
  const pagerPressed = useRef(false);
  const goTo = (p: number) => {
    pagerPressed.current = true;
    setPage(p);
  };
  useEffect(() => {
    listRef.current?.querySelectorAll<HTMLElement>("*").forEach((el) => {
      if (el.scrollTop > 0) el.scrollTop = 0;
    });
    if (!pagerPressed.current) return;
    pagerPressed.current = false;
    const nav = pagerRef.current;
    const active = document.activeElement as HTMLButtonElement | null;
    if (nav && (!active || !nav.contains(active) || active.disabled)) nav.querySelector<HTMLElement>("button:not([disabled])")?.focus();
  }, [current]);

  const firstLoad = rows === undefined;
  const isEmpty = !firstLoad && !hasError && (rows.length === 0 && (!remote || !criteria));
  const terms = [...query.split(/\s+/).filter(Boolean), ...filters.flatMap((f) => f.options.filter((o) => o.id === activeFilters[f.id]).map((o) => o.label))];

  const { run } = useActionRunner({ onError: onActionError, onDone: onActionDone });
  const toRowActions = (row: Row): TableRowAction[] => {
    if (!rowActions) return [];
    const { icons, menu, danger } = arrangeActions(rowActions(row), "row");
    const out: TableRowAction[] = icons.map((a) => ({ icon: a.icon, label: a.label, onPress: () => void run(a) }));
    if (menu.length + danger.length > 0) {
      const entry = (a: Action) => (
        <DropdownMenu.Item key={a.id} id={a.id} label={a.label} onAction={() => void run(a)} {...(a.icon ? { icon: a.icon } : {})} {...(a.shortcut ? { shortcut: a.shortcut } : {})} {...(a.danger ? { danger: true } : {})} {...(a.isDisabled ? { isDisabled: true } : {})} />
      );
      out.push({
        icon: <MoreHorizontal />,
        label: m.moreActions,
        menu: (
          <Fragment>
            {menu.map(entry)}
            {menu.length > 0 && danger.length > 0 && <DropdownMenu.Separator />}
            {danger.map(entry)}
          </Fragment>
        ),
      });
    }
    return out;
  };

  const rowById = new Map((rows ?? []).map((r) => [r.id, r]));
  const multiple = selectionMode === "multiple";
  const selectionProps = {
    selectionMode,
    selectedKeys: multiple ? [...checked] : selectedId ? [selectedId] : [],
    onSelectionChange: (keys: Set<Key>) => {
      const ids = [...keys].map(String);
      if (multiple) setChecked(new Set(ids));
      onSelect?.(ids.length === 1 ? (rowById.get(ids[0]!) ?? null) : null);
    },
    ...(onOpen ? { onAction: (id: string) => { const r = rowById.get(id); if (r) onOpen(r); } } : {}),
    isLoading: firstLoad || isLoading,
    hasError,
    ...(onRetry ? { onRetry } : {}),
    searchTerms: criteria ? terms : [],
    onClearSearch: clearCriteria,
  };

  const cellText = (row: Row, column: ListPageColumn<Row>): ReactNode => {
    const v = read(row, column);
    if (isEmptyValue(v)) return null;
    return isRichValue(column.type) ? <FormattedValue value={v} {...column} /> : fmt(v, column);
  };

  let list: ReactNode;
  if (layout === "list") {
    const pick = (row: Row, id: string | undefined) => {
      const c = id ? byId.get(id) : undefined;
      if (!c) return undefined;
      const v = read(row, c);
      return isEmptyValue(v) ? undefined : fmt(v, c);
    };
    const titleId = item?.title ?? columns[0]?.id;
    const items: ListItemData[] = shown.map((row) => {
      const statusCol = item?.status ? byId.get(item.status) : undefined;
      const sv = statusCol ? read(row, statusCol) : undefined;
      const subtitle = pick(row, item?.subtitle);
      const meta = pick(row, item?.meta);
      return {
        id: row.id,
        title: pick(row, titleId) ?? row.id,
        ...(subtitle ? { subtitle } : {}),
        ...(meta ? { meta } : {}),
        ...(statusCol && !isEmptyValue(sv) ? { status: { label: fmt(sv, statusCol), tone: statusCol.statuses?.[String(sv)]?.tone ?? "neutral" } } : {}),
      };
    });
    list = <List label={title} items={items} {...selectionProps} {...(rowActions ? { itemActions: (it: ListItemData) => toRowActions(rowById.get(it.id)!) } : {})} />;
  } else {
    const tableColumns: TableColumn[] = columns.map((c, i) => {
      const l = valueLayout(c.type);
      return { id: c.id, label: c.label, align: l.align, sortable: c.sortable ?? true, ...(i > 0 && l.width ? { width: l.width } : {}) };
    });
    list = (
      <Table
        label={title}
        storageId={key}
        columns={tableColumns}
        rows={shown}
        renderCell={(row, id) => cellText(row, byId.get(id)!)}
        {...selectionProps}
        {...(sort ? { sortDescriptor: sort as SortDescriptor } : {})}
        onSortChange={(d) => {
          setSort({ column: String(d.column), direction: d.direction });
          setPage(1);
        }}
        {...(rowActions ? { rowActions: toRowActions } : {})}
      />
    );
  }

  const searchLabel = typeof search === "object" && search.label ? search.label : title.toLocaleLowerCase(m.locale);
  const checkedRows = [...checked].map((id) => rowById.get(id)).filter((r): r is Row => Boolean(r));

  const toolbar =
    multiple && checkedRows.length > 0 ? (
      <div role="toolbar" aria-label={m.selectedCount(nf.format(checkedRows.length))} className="flex min-h-(--row-h) flex-wrap items-center gap-2 rounded-md bg-field pr-0.5 pl-(--pad)">
        <span className="text-sm font-medium text-fg" aria-live="polite">
          {m.selectedCount(nf.format(checkedRows.length))}
        </span>
        <Button variant="subtle" size="sm" onPress={() => setChecked(new Set())}>
          {m.clearSelection}
        </Button>
        <span className="ml-auto">
          <ActionBar
            zone="toolbar"
            actions={selectionActions ? selectionActions(checkedRows) : []}
            {...(onActionError ? { onError: onActionError } : {})}
            onDone={(a) => {
              setChecked(new Set());
              onActionDone?.(a);
            }}
          />
        </span>
      </div>
    ) : search || filters.length ? (
      <div className="flex flex-wrap items-center gap-2">
        {search && (
          <SearchInput
            key={searchVersion}
            label={searchLabel}
            onChange={(c) => {
              setQuery(c.text);
              setPage(1);
            }}
          />
        )}
        {filters.slice(0, 3).map((f) => (
          <Select
            key={f.id}
            label={f.label}
            hideLabel
            width="sm"
            options={[{ id: "", label: f.allLabel }, ...f.options.map((o) => ({ id: o.id, label: o.label }))]}
            value={activeFilters[f.id] ?? ""}
            onChange={(v) => setFilter(f.id, v)}
          />
        ))}
      </div>
    ) : null;

  let footer: ReactNode = null;
  if (!firstLoad && shown.length > 0) {
    // Tout est affiché : seulement le compteur (D-175).
    const fits = mode === "pages" ? total <= pageSize : shown.length >= total;
    footer = (
      <div className="flex min-h-(--bar-h) items-center gap-3 border-t border-line px-(--pad) text-sm text-fg-3 tabular-nums">
        <span aria-live="polite">
          {fits
            ? m.itemCount(nf.format(total))
            : mode === "pages"
              ? m.rangeOf(nf.format((current - 1) * pageSize + 1), nf.format((current - 1) * pageSize + shown.length), nf.format(total))
              : m.shownOf(nf.format(shown.length), nf.format(total))}
        </span>
        {!fits && mode === "more" && shown.length < total && (
          <Button size="sm" onPress={() => setPage(current + 1)} isPending={remote && isLoading}>
            {m.showMore}
          </Button>
        )}
        {!fits && mode === "pages" && (
          <nav ref={pagerRef} aria-label={m.pagination} className="ml-auto flex items-center gap-0.5">
            <IconButton icon={<ChevronLeft />} label={m.previousPage} isDisabled={current <= 1} onPress={() => goTo(current - 1)} />
            <IconButton icon={<ChevronRight />} label={m.nextPage} isDisabled={current >= pages} onPress={() => goTo(current + 1)} />
          </nav>
        )}
      </div>
    );
  }

  return (
    <div className="socle-box flex h-full min-h-0 flex-col font-sans text-md text-fg">
      <header className="flex flex-wrap items-start gap-3 px-(--pad) pt-(--pad) pb-2">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-lg font-heading">{title}</h1>
          {description && <p className="m-0 mt-0.5 text-sm text-fg-2">{description}</p>}
        </div>
        {actions.length > 0 && (
          <ActionBar zone="header" actions={isEmpty ? actions.map((a) => (a.primary ? { ...a, isHidden: true } : a)) : actions} subject={title} {...(onActionError ? { onError: onActionError } : {})} {...(onActionDone ? { onDone: onActionDone } : {})} />
        )}
      </header>
      {isEmpty ? (
        <EmptyState
          title={empty.title}
          {...(empty.description ? { description: empty.description } : {})}
          {...(empty.icon ? { icon: empty.icon } : {})}
          action={<ActionBar zone="empty" actions={actions} {...(onActionError ? { onError: onActionError } : {})} {...(onActionDone ? { onDone: onActionDone } : {})} />}
        />
      ) : (
        <>
          {!firstLoad && toolbar && <div className="px-(--pad) py-2">{toolbar}</div>}
          <div ref={listRef} className="flex min-h-0 flex-1 flex-col px-[calc(var(--pad)-6px)]">{list}</div>
          {footer}
        </>
      )}
    </div>
  );
}
