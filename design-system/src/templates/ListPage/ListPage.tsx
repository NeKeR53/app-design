/*
 * Gabarit de liste. Spec : ListPage.spec.md. Décisions : D-173 à D-178, D-414 à D-416.
 * L'app décrit sa page par des données ; le gabarit dessine les zones et tous les états.
 */
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Key, SortDescriptor } from "react-aria-components";
import { Button } from "../../components/Button/Button";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { FormattedValue, isEmptyValue, isRichValue, useFormatValue, valueLayout, valueSortKey, type ValueFormat } from "../../components/FormattedValue/FormattedValue";
import { Link } from "../../components/Link/Link";
import { Pagination } from "../../components/Pagination/Pagination";
import { List, type ListItemData } from "../../components/List/List";
import { DropdownMenu } from "../../components/DropdownMenu/DropdownMenu";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import { Select } from "../../components/Select/Select";
import { Table, type TableColumn, type TableRowAction } from "../../components/Table/Table";
import { MoreHorizontal } from "../../icons";
import { norm } from "../../lib/results";
import { ActionBar, arrangeActions, useActionRunner, type Action } from "../../patterns/ActionBar/ActionBar";
import { useMessages, useStoredState } from "../../provider/SocleProvider";
import { cx } from "../../lib/cx";
import { DropOverlay, useFileDrop } from "../../lib/fileDrop";
import { TileGrid, TilePreview, type ListPageThumbnail, type TileData } from "./TileGrid";

export type { ListPageThumbnail } from "./TileGrid";

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
  /** Toujours affichée : le menu « Colonnes » ne la masque pas. La première colonne l'est toujours. */
  required?: boolean;
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
  /** Avec `pagination.pageSizes` seulement : lignes par page choisies. */
  pageSize?: number;
  /** `remote` et `allowSelectAll` : l'utilisateur a choisi « Sélectionner les N éléments ». */
  selection?: "all";
}

/** Portée d'une action groupée : les lignes cochées, ou tous les éléments qui correspondent. */
export type ListPageSelection = "rows" | "all";

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
  /** `table` (défaut), `list`, ou `grid` : des vignettes (catalogue, documents) (D-414). */
  layout?: "table" | "list" | "grid";
  /** Pour `list` et `grid` : l'`id` de la colonne qui donne chaque pièce. Défaut : titre = première colonne. */
  item?: { title: string; subtitle?: string; meta?: string; status?: string };
  /** Pour `grid` (aperçu 4:3) et `list` (visuel de 40 px) : l'image de l'élément, ou son type de fichier (D-414). */
  thumbnail?: (row: Row) => ListPageThumbnail | undefined;
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
  /**
   * File de tri (`single`) : quand la ligne sélectionnée quitte `rows` (traitée, déplacée, supprimée), `onSelect`
   * reçoit la ligne qui la suivait à l'écran, ou la précédente si c'était la dernière, ou `null` (D-415). Défaut : faux.
   */
  advanceOnRemove?: boolean;
  /**
   * Actions groupées sur les lignes cochées (`multiple`) (D-178). `selection` vaut `"all"` après
   * « Sélectionner les N éléments » : `rows` sont alors les lignes connues ; en `remote`, l'app agit sur tout.
   */
  selectionActions?: (rows: ReadonlyArray<Row>, selection: ListPageSelection) => ReadonlyArray<Action>;
  /** Après « tout cocher » sur la page, propose « Sélectionner les N éléments » quand il en reste ailleurs. Défaut : faux. */
  allowSelectAll?: boolean;
  /** Menu « Colonnes » dans la barre : l'utilisateur masque des colonnes ; choix mémorisé. Défaut : faux. */
  allowColumnChoice?: boolean;
  /** Tri à trois états : croissant, décroissant, puis ordre d'origine. Défaut : faux. */
  allowsUnsort?: boolean;
  /** Ouverture : double-clic ou Entrée (D-021). */
  onOpen?: (row: Row) => void;
  /**
   * Pied de liste (D-175). Défaut : `{ mode: "more", pageSize: 50 }`. `pageSizes` (mode `pages`) :
   * choix des lignes par page, mémorisé ; `true` vaut `[25, 50, 100]`.
   */
  pagination?: { mode?: "more" | "pages"; pageSize?: number; pageSizes?: true | ReadonlyArray<number> };
  /** État vide (D-176). */
  empty: { title: string; description?: string; icon?: ReactNode };
  /** L'utilisateur n'a pas le droit de voir la liste : état « accès refusé » à la place de tout le reste. */
  isForbidden?: boolean;
  /** Textes de l'accès refusé. Défaut : « Vous n'avez pas accès à cette liste », « Demandez l'accès à un administrateur. » */
  forbidden?: { title?: string; description?: string };
  /** Avec `isForbidden` : bouton « Demander l'accès ». */
  onRequestAccess?: () => void;
  /** Rechargement avec des lignes déjà là (D-084). */
  isLoading?: boolean;
  /** Le dernier chargement a échoué (D-085). */
  hasError?: boolean;
  onRetry?: () => void;
  /** Date de la dernière lecture réussie : en erreur avec des lignes, le bandeau dit l'âge des données (D-434). */
  updatedAt?: Date | number | string;
  /** Données côté serveur : rien n'est filtré, trié ni découpé ici (D-174). */
  remote?: boolean;
  /** `remote` : nombre total d'éléments qui correspondent. */
  total?: number;
  onStateChange?: (state: ListPageState) => void;
  /** Clé de mémorisation des filtres et du tri (D-177). Défaut : `title`. */
  storageId?: string;
  onActionError?: (action: Action, error: unknown) => void;
  onActionDone?: (action: Action) => void;
  /** Fichiers déposés n'importe où sur la page (D-416). Sans lui, pas de dépôt DOM. */
  onDropFiles?: (files: File[]) => void;
  /** Survol de fichiers vu par l'app (glisser-déposer du système, Tauri) : affiche le cadre de dépôt. */
  isDraggingFiles?: boolean;
  /** Texte du cadre de dépôt. Défaut : « Déposez les fichiers pour les ajouter » (i18n). */
  dropLabel?: string;
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
  thumbnail,
  search = true,
  filters = [],
  rowActions,
  selectionMode = "single",
  selectedId,
  onSelect,
  advanceOnRemove = false,
  selectionActions,
  allowSelectAll = false,
  allowColumnChoice = false,
  allowsUnsort = false,
  onOpen,
  pagination,
  empty,
  isForbidden = false,
  forbidden,
  onRequestAccess,
  isLoading = false,
  hasError = false,
  updatedAt,
  onRetry,
  remote = false,
  total: totalProp,
  onStateChange,
  storageId,
  onActionError,
  onActionDone,
  onDropFiles,
  isDraggingFiles,
  dropLabel,
}: ListPageProps<Row>) {
  const m = useMessages();
  const fmt = useFormatValue();
  const key = `listpage:${storageId ?? title}`;
  const { dropProps, showDrop } = useFileDrop({ onDropFiles, isDraggingFiles });
  const mode = pagination?.mode ?? "more";
  // Lignes par page au choix (mode `pages`), mémorisées par page (D-177).
  const sizes = mode === "pages" && pagination?.pageSizes ? (pagination.pageSizes === true ? [25, 50, 100] : [...pagination.pageSizes]) : null;
  const [storedSize, setStoredSize] = useStoredState<number | null>(`${key}:pageSize`, null);
  const baseSize = pagination?.pageSize ?? 50;
  const pageSize = Math.max(1, sizes ? (storedSize && sizes.includes(storedSize) ? storedSize : sizes.includes(baseSize) ? baseSize : (sizes[0] ?? baseSize)) : baseSize);
  const nf = useMemo(() => new Intl.NumberFormat(m.locale), [m.locale]);
  // Colonnes masquées par l'utilisateur, mémorisées par page (D-007).
  const [hiddenCols, setHiddenCols] = useStoredState<string[]>(`${key}:hidden`, []);

  // Filtres et tri mémorisés, recherche oubliée (D-177).
  const [storedFilters, setStoredFilters] = useStoredState<Record<string, string>>(`${key}:filters`, {});
  const [sort, setSort] = useStoredState<ListPageSort | null>(`${key}:sort`, null);
  const [query, setQuery] = useState("");
  const [searchVersion, setSearchVersion] = useState(0);
  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  // « Sélectionner les N éléments » : tous les éléments qui correspondent, chargés ou non.
  const [allSelected, setAllSelected] = useState(false);

  const known = new Set(filters.map((f) => f.id));
  const activeFilters = Object.fromEntries(Object.entries(storedFilters).filter(([id, v]) => v && known.has(id)));
  const criteria = query !== "" || Object.keys(activeFilters).length > 0;

  const read: ReadFn<Row> = (row, column) => (column.value ? column.value(row) : (row as Record<string, unknown>)[column.id]);
  const byId = new Map(columns.map((c) => [c.id, c]));

  // État signalé à l'app à chaque changement (mode `remote` surtout).
  const state = JSON.stringify({ query, filters: activeFilters, sort, page, ...(sizes ? { pageSize } : {}), ...(remote && allSelected ? { selection: "all" } : {}) });
  // Une recherche ou un filtre change ce que « tous » désigne : la sélection « tout » s'efface.
  const criteriaKey = JSON.stringify({ query, filters: activeFilters });
  useEffect(() => {
    setAllSelected(false);
  }, [criteriaKey]);
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
  }, [rows, remote, query, criteriaKey, sort, columns, filters, search, fmt, m.locale]);

  const total = remote ? (totalProp ?? matching.length) : matching.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  const shown = remote ? matching : mode === "pages" ? matching.slice((current - 1) * pageSize, current * pageSize) : matching.slice(0, current * pageSize);

  // File de tri (D-415) : la ligne sélectionnée quitte `rows` ; la sélection passe à celle qui la suivait à l'écran.
  // L'ordre lu est celui du rendu précédent (tri, filtres, page), gardé tant que des lignes sont là.
  const shownKey = rows === undefined ? null : shown.map((r) => r.id).join("\u0000");
  const lastShown = useRef<string[]>([]);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  useEffect(() => {
    if (!advanceOnRemove || selectionMode !== "single" || !selectedId || rows === undefined) return;
    if (rows.some((r) => r.id === selectedId)) return;
    const previous = lastShown.current;
    const at = previous.indexOf(selectedId);
    if (at < 0) return;
    const visible = new Map(shown.map((r) => [r.id, r]));
    const next = previous.slice(at + 1).find((id) => visible.has(id)) ?? previous.slice(0, at).reverse().find((id) => visible.has(id));
    selectRef.current?.(next ? (visible.get(next) ?? null) : null);
    // Seul un changement des lignes compte : une recherche ou un tri ne déplace pas la sélection.
  }, [rows]);
  useEffect(() => {
    if (shownKey !== null) lastShown.current = shownKey ? shownKey.split("\u0000") : [];
  }, [shownKey]);

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

  // Pied « pages » : une nouvelle page s'affiche depuis son début. `Pagination` garde le focus (D-359).
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.querySelectorAll<HTMLElement>("*").forEach((el) => {
      if (el.scrollTop > 0) el.scrollTop = 0;
    });
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
    selectedKeys: multiple ? (allSelected ? shown.map((r) => r.id) : [...checked]) : selectedId ? [selectedId] : [],
    onSelectionChange: (keys: Set<Key>) => {
      const ids = [...keys].map(String);
      if (multiple) {
        setChecked(new Set(ids));
        setAllSelected(false);
      }
      onSelect?.(ids.length === 1 ? (rowById.get(ids[0]!) ?? null) : null);
    },
    ...(onOpen ? { onAction: (id: string) => { const r = rowById.get(id); if (r) onOpen(r); } } : {}),
    isLoading: firstLoad || isLoading,
    hasError,
    ...(onRetry ? { onRetry } : {}),
    ...(updatedAt !== undefined ? { updatedAt } : {}),
    searchTerms: criteria ? terms : [],
    onClearSearch: clearCriteria,
  };

  const cellText = (row: Row, column: ListPageColumn<Row>): ReactNode => {
    const v = read(row, column);
    if (isEmptyValue(v)) return null;
    return isRichValue(column.type) ? <FormattedValue value={v} {...column} /> : fmt(v, column);
  };

  let list: ReactNode;
  if (layout === "list" || layout === "grid") {
    const pick = (row: Row, id: string | undefined) => {
      const c = id ? byId.get(id) : undefined;
      if (!c) return undefined;
      const v = read(row, c);
      return isEmptyValue(v) ? undefined : fmt(v, c);
    };
    const titleId = item?.title ?? columns[0]?.id;
    const items: TileData[] = shown.map((row) => {
      const statusCol = item?.status ? byId.get(item.status) : undefined;
      const sv = statusCol ? read(row, statusCol) : undefined;
      const subtitle = pick(row, item?.subtitle);
      const meta = pick(row, item?.meta);
      const thumb = thumbnail?.(row);
      return {
        id: row.id,
        title: pick(row, titleId) ?? row.id,
        ...(subtitle ? { subtitle } : {}),
        ...(meta ? { meta } : {}),
        ...(statusCol && !isEmptyValue(sv) ? { status: { label: fmt(sv, statusCol), tone: statusCol.statuses?.[String(sv)]?.tone ?? "neutral" } } : {}),
        ...(thumb ? { thumbnail: thumb } : {}),
      };
    });
    const actionsOf = rowActions ? { itemActions: (it: { id: string }) => toRowActions(rowById.get(it.id)!) } : {};
    if (layout === "grid") {
      list = <TileGrid label={title} items={items} {...selectionProps} {...actionsOf} />;
    } else {
      const listItems: ListItemData[] = items.map(({ thumbnail: thumb, ...rest }) => (thumbnail ? { ...rest, visual: <TilePreview thumbnail={thumb} size="row" /> } : rest));
      list = <List label={title} items={listItems} {...(thumbnail ? { leading: "thumbnail" as const } : {})} {...selectionProps} {...actionsOf} />;
    }
  } else {
    const tableColumns: TableColumn[] = columns.map((c, i) => {
      const l = valueLayout(c.type);
      return { id: c.id, label: c.label, align: l.align, sortable: c.sortable ?? true, ...(i > 0 && l.width ? { width: l.width } : {}), ...(c.required ? { required: true } : {}) };
    });
    // Tri : `null` (trois états, `allowsUnsort`) rend l'ordre d'origine.
    const onSort = (d: SortDescriptor | null) => {
      setSort(d ? { column: String(d.column), direction: d.direction } : null);
      setPage(1);
    };
    list = (
      <Table
        label={title}
        storageId={key}
        columns={tableColumns}
        rows={shown}
        renderCell={(row, id) => cellText(row, byId.get(id)!)}
        {...selectionProps}
        {...(sort ? { sortDescriptor: sort as SortDescriptor } : {})}
        {...(allowsUnsort ? { allowsUnsort: true as const, onSortChange: onSort } : { onSortChange: onSort })}
        {...(allowColumnChoice ? { hiddenColumns: hiddenCols } : {})}
        {...(rowActions ? { rowActions: toRowActions } : {})}
      />
    );
  }

  const searchLabel = typeof search === "object" && search.label ? search.label : title.toLocaleLowerCase(m.locale);
  const checkedRows = allSelected ? matching : [...checked].map((id) => rowById.get(id)).filter((r): r is Row => Boolean(r));
  const clearChecked = () => {
    setChecked(new Set());
    setAllSelected(false);
  };
  // Toute la page cochée et d'autres éléments ailleurs : « Sélectionner les N éléments » (D-345).
  const canSelectAll = allowSelectAll && multiple && !allSelected && shown.length > 0 && total > shown.length && shown.every((r) => checked.has(r.id));
  const countText = allSelected ? m.allSelectedCount(nf.format(total)) : m.selectedCount(nf.format(checkedRows.length));

  // Menu « Colonnes » : une case par colonne ; la première et les `required` restent cochées (D-346).
  const columnsMenu =
    allowColumnChoice && layout === "table" ? (
      <span className="ml-auto">
        <DropdownMenu
          label={m.columns}
          placement="bottom end"
          trigger={
            <Button variant="subtle" size="sm">
              {m.columns}
            </Button>
          }
        >
          <DropdownMenu.Section
            selectionMode="multiple"
            selectedKeys={columns.filter((c, i) => i === 0 || c.required || !hiddenCols.includes(c.id)).map((c) => c.id)}
            onSelectionChange={(keys) => setHiddenCols(columns.filter((c, i) => i > 0 && !c.required && !keys.has(c.id)).map((c) => c.id))}
          >
            {columns.map((c, i) => (
              <DropdownMenu.Item key={c.id} id={c.id} label={c.label} {...(i === 0 || c.required ? { isDisabled: true } : {})} />
            ))}
          </DropdownMenu.Section>
        </DropdownMenu>
      </span>
    ) : null;

  const toolbar =
    multiple && checkedRows.length > 0 ? (
      <div role="toolbar" aria-label={countText} className="flex min-h-(--row-h) flex-wrap items-center gap-2 rounded-md bg-field pr-0.5 pl-(--pad)">
        <span className="text-sm font-medium text-fg" aria-live="polite">
          {countText}
        </span>
        {canSelectAll && (
          <span className="text-sm">
            <Link onPress={() => setAllSelected(true)}>{m.selectAllMatching(nf.format(total))}</Link>
          </span>
        )}
        <Button variant="subtle" size="sm" onPress={clearChecked}>
          {allSelected ? m.clearAllSelection : m.clearSelection}
        </Button>
        <span className="ml-auto">
          <ActionBar
            zone="toolbar"
            actions={selectionActions ? selectionActions(checkedRows, allSelected ? "all" : "rows") : []}
            {...(onActionError ? { onError: onActionError } : {})}
            onDone={(a) => {
              clearChecked();
              onActionDone?.(a);
            }}
          />
        </span>
      </div>
    ) : search || filters.length || columnsMenu ? (
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
        {columnsMenu}
      </div>
    ) : null;

  let footer: ReactNode = null;
  if (!firstLoad && shown.length > 0) {
    // Tout est affiché : seulement le compteur (D-175).
    const fits = mode === "pages" ? total <= pageSize : shown.length >= total;
    // Choix des lignes par page (D-348) : utile dès que la liste dépasse la plus petite taille.
    const sizeChoice =
      sizes && total > Math.min(...sizes) ? (
        <span className="ml-auto flex items-center gap-2">
          <span aria-hidden>{m.rowsPerPage}</span>
          <Select
            label={m.rowsPerPage}
            hideLabel
            width="xs"
            options={sizes.map((n) => ({ id: String(n), label: nf.format(n) }))}
            value={String(pageSize)}
            onChange={(v) => {
              if (!v) return;
              setStoredSize(Number(v));
              setPage(1);
            }}
          />
        </span>
      ) : null;
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
        {sizeChoice}
        {!fits && mode === "pages" && (
          <div className={cx("flex", !sizeChoice && "ml-auto")}>
            <Pagination page={current} pageCount={pages} onPageChange={setPage} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="socle-box relative flex h-full min-h-0 flex-col font-sans text-md text-fg" data-dragging={showDrop || undefined} {...dropProps}>
      <header className="flex flex-wrap items-start gap-3 px-(--pad) pt-(--pad) pb-2">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-lg font-heading">{title}</h1>
          {description && <p className="m-0 mt-0.5 text-sm text-fg-2">{description}</p>}
        </div>
        {actions.length > 0 && !isForbidden && (
          <ActionBar zone="header" actions={isEmpty ? actions.map((a) => (a.primary ? { ...a, isHidden: true } : a)) : actions} subject={title} {...(onActionError ? { onError: onActionError } : {})} {...(onActionDone ? { onDone: onActionDone } : {})} />
        )}
      </header>
      {isForbidden ? (
        <EmptyState
          variant="forbidden"
          title={forbidden?.title ?? m.forbiddenList}
          description={forbidden?.description ?? m.forbiddenText}
          {...(onRequestAccess ? { action: <Button variant="primary" onPress={onRequestAccess}>{m.requestAccess}</Button> } : {})}
        />
      ) : isEmpty ? (
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
      {showDrop && <DropOverlay marker="data-list-page-drop" label={dropLabel ?? m.listPageDropHere} />}
    </div>
  );
}
