/*
 * Arbre de nœuds dépliables, dans le contenu d'une page. Spec : TreeView.spec.md (D-260 à D-268).
 * Repose sur React Aria `Tree` (clavier, sélection, recherche par frappe) et `useDragAndDrop`.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Button, Tree, TreeItem, TreeItemContent, TreeLoadMoreItem, type Key, type Selection } from "react-aria-components/Tree";
import { DropIndicator, useDragAndDrop } from "react-aria-components/useDragAndDrop";
import { ActionBar, type Action } from "../../patterns/ActionBar/ActionBar";
import { EmptyState } from "../EmptyState/EmptyState";
import { Spinner } from "../Spinner/Spinner";
import { useRowMenu } from "../DropdownMenu/DropdownMenu";
import { Link } from "../Link/Link";
import { OverflowTooltip } from "../Tooltip/OverflowTooltip";
import { ChevronDown, ChevronRight } from "../../icons";
import { buttonReset, cx } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";

/** Un nœud de l'arbre : un dossier, un fichier, une catégorie… */
export interface TreeNode {
  /** Identifiant unique dans tout l'arbre (un chemin complet convient). */
  id: string;
  label: string;
  /** Icône de l'app, 16 px. */
  icon?: ReactNode;
  /** Icône du nœud déplié (dossier ouvert) ; par défaut `icon`. */
  openIcon?: ReactNode;
  /** Texte court à droite : taille, nombre. */
  meta?: string;
  /** Enfants déjà connus. Un tableau vide fait un dossier vide. */
  children?: ReadonlyArray<TreeNode>;
  /** Enfants pas encore chargés : demandés à `loadChildren` à la première ouverture (D-266). */
  hasChildren?: boolean;
  /** Ni sélectionnable, ni ouvrable, ni déplaçable. */
  isDisabled?: boolean;
}

/** Cible d'un déplacement (D-267). */
export interface TreeMoveTarget {
  id: string;
  position: "before" | "after" | "inside";
}

export interface TreeViewProps {
  /** Nom de l'arbre : « Documents ». */
  "aria-label": string;
  nodes: ReadonlyArray<TreeNode>;
  /** Sélection (D-263). Défaut : `single`. */
  selectionMode?: "none" | "single" | "multiple";
  selectedIds?: ReadonlyArray<string>;
  defaultSelectedIds?: ReadonlyArray<string>;
  onSelectionChange?: (ids: string[]) => void;
  expandedIds?: ReadonlyArray<string>;
  defaultExpandedIds?: ReadonlyArray<string>;
  onExpandedChange?: (ids: string[]) => void;
  /** Ouvre le nœud : double-clic ou Entrée. Sans elle, ils plient ou déplient (D-263). */
  onAction?: (node: TreeNode) => void;
  /** Actions du nœud, dessinées par `ActionBar` zone `row` (D-265). */
  actions?: (node: TreeNode) => ReadonlyArray<Action>;
  onActionError?: (action: Action, node: TreeNode, error: unknown) => void;
  onActionDone?: (action: Action, node: TreeNode) => void;
  /** Charge les enfants d'un nœud `hasChildren` (D-266). */
  loadChildren?: (node: TreeNode, signal: AbortSignal) => Promise<ReadonlyArray<TreeNode>>;
  /** Active le glisser-déposer ; l'app applique le déplacement (D-267). */
  onMove?: (ids: string[], target: TreeMoveTarget) => void;
  /** Texte de l'arbre vide (D-268). Défaut : « Aucun élément ». */
  emptyState?: { title: string; description?: string };
}

const ERROR_SUFFIX = "::error";
const INDENT = 16;
const PAD = 4;

type LoadStatus = "loading" | "error";

/** Arbre de nœuds dépliables : sélection, clavier, actions de nœud, chargement à la demande, glisser-déposer. */
export function TreeView({
  "aria-label": ariaLabel,
  nodes,
  selectionMode = "single",
  selectedIds,
  defaultSelectedIds,
  onSelectionChange,
  expandedIds,
  defaultExpandedIds,
  onExpandedChange,
  onAction,
  actions,
  onActionError,
  onActionDone,
  loadChildren,
  onMove,
  emptyState,
}: TreeViewProps) {
  const m = useMessages();
  const [ownExpanded, setOwnExpanded] = useState<ReadonlySet<string>>(() => new Set(defaultExpandedIds));
  const expanded = useMemo(() => (expandedIds ? new Set(expandedIds) : ownExpanded), [expandedIds, ownExpanded]);
  const [ownSelected, setOwnSelected] = useState<ReadonlySet<string>>(() => new Set(defaultSelectedIds));
  const selected = useMemo(() => (selectedIds ? new Set(selectedIds) : ownSelected), [selectedIds, ownSelected]);
  const [loaded, setLoaded] = useState<ReadonlyMap<string, ReadonlyArray<TreeNode>>>(() => new Map());
  const [status, setStatus] = useState<ReadonlyMap<string, LoadStatus>>(() => new Map());
  const controllers = useRef(new Map<string, AbortController>());
  const dragged = useRef<ReadonlySet<string>>(new Set());
  const box = useRef<HTMLDivElement>(null);
  const shift = useRef(false);
  const anchor = useRef<string | null>(null);

  const kidsOf = useCallback((n: TreeNode) => n.children ?? loaded.get(n.id), [loaded]);
  /** Un nœud qui peut avoir des enfants : dossier, même vide (D-267, D-268). */
  const isParent = useCallback((n: TreeNode) => n.children !== undefined || Boolean(n.hasChildren), []);

  // Index de tous les nœuds connus : nœud, niveau, ancêtres.
  const index = useMemo(() => {
    const map = new Map<string, { node: TreeNode; level: number; ancestors: string[] }>();
    const walk = (list: ReadonlyArray<TreeNode>, level: number, ancestors: string[]) => {
      for (const n of list) {
        map.set(n.id, { node: n, level, ancestors });
        const kids = kidsOf(n);
        if (kids) walk(kids, level + 1, [...ancestors, n.id]);
      }
    };
    walk(nodes, 1, []);
    return map;
  }, [nodes, kidsOf]);

  const load = useCallback(
    (n: TreeNode) => {
      if (!loadChildren || n.children || loaded.has(n.id) || controllers.current.has(n.id)) return;
      const ctrl = new AbortController();
      controllers.current.set(n.id, ctrl);
      setStatus((s) => new Map(s).set(n.id, "loading"));
      loadChildren(n, ctrl.signal).then(
        (kids) => {
          if (ctrl.signal.aborted) return;
          controllers.current.delete(n.id);
          setLoaded((l) => new Map(l).set(n.id, kids));
          setStatus((s) => {
            const next = new Map(s);
            next.delete(n.id);
            return next;
          });
        },
        () => {
          if (ctrl.signal.aborted) return;
          controllers.current.delete(n.id);
          setStatus((s) => new Map(s).set(n.id, "error"));
        },
      );
    },
    [loadChildren, loaded],
  );

  const cancel = (id: string) => {
    const ctrl = controllers.current.get(id);
    if (!ctrl) return;
    ctrl.abort();
    controllers.current.delete(id);
    setStatus((s) => {
      const next = new Map(s);
      next.delete(id);
      return next;
    });
  };

  // Un nœud déplié d'emblée dont les enfants manquent les demande aussitôt (D-266).
  useEffect(() => {
    for (const id of expanded) {
      const entry = index.get(id);
      if (entry?.node.hasChildren && !kidsOf(entry.node) && !status.has(id)) load(entry.node);
    }
  }, [expanded, index, kidsOf, status, load]);

  useEffect(() => {
    const all = controllers.current;
    return () => {
      for (const c of all.values()) c.abort();
    };
  }, []);

  const commitExpanded = (next: Set<string>) => {
    for (const id of expanded) if (!next.has(id)) cancel(id);
    if (!expandedIds) setOwnExpanded(next);
    onExpandedChange?.([...next]);
  };

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    commitExpanded(next);
  };

  const retry = (id: string) => {
    const entry = index.get(id);
    if (!entry) return;
    setStatus((s) => {
      const next = new Map(s);
      next.delete(id);
      return next;
    });
    load(entry.node);
  };

  const onSelect = (keys: Selection) => {
    const ids = keys === "all" ? [...index.keys()] : [...keys].map(String);
    // Les lignes d'erreur ne se sélectionnent pas.
    let next = new Set(ids.filter((id) => !id.endsWith(ERROR_SUFFIX) && index.has(id)));
    const added = [...next].filter((id) => !selected.has(id));
    if (selectionMode === "multiple" && shift.current && anchor.current) {
      // Plage (Maj) : React Aria saute les nœuds parents ; on prend toutes les lignes visibles
      // entre l'ancre et le nœud atteint, dans l'ordre affiché (D-263).
      const rows = [...(box.current?.querySelectorAll<HTMLElement>('[role="row"][data-key]') ?? [])].map((r) => r.dataset.key ?? "");
      const ends = [anchor.current, ...added].map((id) => rows.indexOf(id)).filter((i) => i >= 0);
      if (ends.length > 1) {
        const range = rows.slice(Math.min(...ends), Math.max(...ends) + 1).filter((id) => index.has(id) && !index.get(id)!.node.isDisabled);
        next = new Set([...next, ...range]);
      }
    } else if (added.length === 1) {
      anchor.current = added[0]!;
    } else if (selectionMode !== "multiple" && next.size === 1) {
      anchor.current = [...next][0]!;
    }
    if (!selectedIds) setOwnSelected(next);
    onSelectionChange?.([...next]);
  };

  const onTreeAction = (key: Key) => {
    const id = String(key);
    if (id.endsWith(ERROR_SUFFIX)) return retry(id.slice(0, -ERROR_SUFFIX.length));
    const entry = index.get(id);
    if (!entry || entry.node.isDisabled) return;
    if (onAction) onAction(entry.node);
    else if (isParent(entry.node)) toggle(id);
  };

  /* ---------- Glisser-déposer (D-267) ---------- */
  const { dragAndDropHooks } = useDragAndDrop({
    isDisabled: !onMove,
    getItems: (keys) => [...keys].map((k) => ({ "text/plain": index.get(String(k))?.node.label ?? String(k) })),
    onDragStart: (e) => {
      dragged.current = new Set([...e.keys].map(String));
    },
    onDragEnd: () => {
      dragged.current = new Set();
    },
    getDropOperation: (target) => {
      if (target.type !== "item") return "cancel";
      const id = String(target.key);
      const entry = index.get(id);
      if (!entry || entry.node.isDisabled) return "cancel";
      // Jamais dans le nœud glissé ni dans ses descendants.
      if (dragged.current.has(id) || entry.ancestors.some((a) => dragged.current.has(a))) return "cancel";
      if (target.dropPosition === "on" && !isParent(entry.node)) return "cancel";
      return "move";
    },
    onMove: (e) => {
      const position = e.target.dropPosition === "on" ? "inside" : e.target.dropPosition;
      onMove?.([...e.keys].map(String), { id: String(e.target.key), position });
    },
    renderDropIndicator: (target) => {
      const level = target.type === "item" ? (index.get(String(target.key))?.level ?? 1) : 1;
      return (
        <DropIndicator
          target={target}
          className="relative h-0 outline-none data-drop-target:before:absolute data-drop-target:before:-top-px data-drop-target:before:right-1 data-drop-target:before:left-(--drop-left) data-drop-target:before:h-0.5 data-drop-target:before:rounded-full data-drop-target:before:bg-accent data-drop-target:before:content-['']"
          style={{ ["--drop-left" as string]: `${PAD + (level - 1) * INDENT + 20}px` }}
        />
      );
    },
  });

  /** Clic droit, appui long sur tactile, Maj+F10 ou touche Menu : menu « … » de la ligne (D-265, D-066, D-007). */
  const { rowMenuProps, onKey: onRowMenuKey } = useRowMenu("[data-tree-actions] [aria-haspopup]");
  const onKeyDown = (e: KeyboardEvent) => {
    // Flèche droite sur un nœud déplié : premier enfant (motif tree de l'ARIA, D-264).
    const target = e.target as HTMLElement;
    if (e.key === "ArrowRight" && target.getAttribute("role") === "row" && target.getAttribute("aria-expanded") === "true") {
      const level = Number(target.getAttribute("aria-level"));
      const next = target.nextElementSibling;
      if (next instanceof HTMLElement && next.getAttribute("role") === "row" && Number(next.getAttribute("aria-level")) > level) {
        e.preventDefault();
        e.stopPropagation();
        next.focus();
      }
      return;
    }
    onRowMenuKey(e);
  };

  /**
   * React Aria ne propose la première cible qu'à l'image suivante (requestAnimationFrame) ; jusque-là
   * le focus reste sur « Déplacer ». Une seconde Entrée trop tôt relançait le glisser et levait
   * « Cannot begin dragging while already dragging ». Pendant un déplacement, la poignée ignore
   * Entrée et Espace (D-267).
   */
  const pressOnDraggingHandle = (e: KeyboardEvent) => {
    if (dragged.current.size === 0 || (e.key !== "Enter" && e.key !== " ")) return false;
    if (!(e.target as HTMLElement).hasAttribute("data-tree-drag")) return false;
    e.preventDefault();
    e.stopPropagation();
    return true;
  };

  /* ---------- Rendu ---------- */
  const renderNode = (n: TreeNode): ReactNode => {
    const kids = kidsOf(n);
    const parent = isParent(n);
    const open = expanded.has(n.id);
    const st = status.get(n.id);
    const nodeActions = actions?.(n) ?? [];
    return (
      <TreeItem
        key={n.id}
        id={n.id}
        textValue={n.label}
        hasChildItems={parent}
        {...(n.isDisabled ? { isDisabled: true } : {})}
        className={cx(
          "group/row relative flex h-(--row-h) cursor-default items-center gap-1 rounded-md pr-1 text-fg outline-none select-none pointer-coarse:h-11",
          "data-hovered:bg-hover data-selected:bg-selected data-selected:data-hovered:bg-selected",
          "data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-focus data-focus-visible:outline-solid",
          "data-disabled:opacity-40 data-dragging:opacity-50",
          "data-drop-target:bg-selected data-drop-target:outline-2 data-drop-target:-outline-offset-2 data-drop-target:outline-accent data-drop-target:outline-solid",
        )}
        style={({ level }) => ({ paddingInlineStart: `${PAD + (level - 1) * INDENT}px` })}
        {...(st === "loading" ? { "aria-busy": true } : {})}
      >
        <TreeItemContent>
          {({ isExpanded, level }) => (
            <>
              <Guides level={level} />
              {onMove && !n.isDisabled && (
                <Button
                  slot="drag"
                  data-tree-drag=""
                  excludeFromTabOrder
                  aria-label={m.moveItem(n.label)}
                  className={cx(buttonReset, "sr-only focus-visible:not-sr-only")}
                >
                  ⠿
                </Button>
              )}
              {parent ? (
                <Button
                  slot="chevron"
                  excludeFromTabOrder
                  aria-label={isExpanded ? m.collapse : m.expand}
                  className={cx(buttonReset, "inline-grid size-4 shrink-0 place-items-center rounded-sm text-fg-3 data-hovered:bg-selected data-hovered:text-fg")}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </Button>
              ) : (
                <span aria-hidden className="size-4 shrink-0" />
              )}
              {(n.icon || n.openIcon) && (
                <span aria-hidden className="inline-grid size-(--icon) shrink-0 place-items-center text-fg-2 [&>svg]:size-(--icon)">
                  {isExpanded && n.openIcon ? n.openIcon : n.icon}
                </span>
              )}
              <span className="ml-1 flex min-w-0 flex-1">
                <OverflowTooltip text={n.label} />
              </span>
              {(n.meta || nodeActions.length > 0) && (
                <span className="grid shrink-0 items-center justify-items-end">
                  {n.meta && (
                    <span
                      className={cx(
                        "[grid-area:1/1] px-1 text-sm text-fg-3 tabular-nums group-data-selected/row:text-fg-2",
                        nodeActions.length > 0 && "group-data-focus-visible/row:invisible group-data-hovered/row:invisible group-data-selected/row:invisible group-has-[[aria-haspopup][aria-expanded=true]]/row:invisible",
                      )}
                    >
                      {n.meta}
                    </span>
                  )}
                  {nodeActions.length > 0 && (
                    <span
                      data-tree-actions=""
                      className="invisible [grid-area:1/1] group-data-focus-visible/row:visible group-data-focus-within/row:visible group-data-hovered/row:visible group-data-selected/row:visible group-has-[[aria-haspopup][aria-expanded=true]]/row:visible pointer-coarse:visible"
                    >
                      <ActionBar
                        zone="row"
                        actions={nodeActions}
                        subject={n.label}
                        {...(onActionError ? { onError: (a: Action, err: unknown) => onActionError(a, n, err) } : {})}
                        {...(onActionDone ? { onDone: (a: Action) => onActionDone(a, n) } : {})}
                      />
                    </span>
                  )}
                </span>
              )}
            </>
          )}
        </TreeItemContent>
        {kids?.map(renderNode)}
        {/* React Aria ne voit un nœud dépliable que s'il a un enfant dans la collection :
            la ligne de chargement sert aussi de place pour un dossier vide ou pas encore chargé. */}
        {parent && !kids?.length && (
          <TreeLoadMoreItem isLoading={open && !kids && st === "loading"} className="relative flex h-(--row-h) items-center gap-2 text-sm text-fg-3">
            <StatusIndent level={(index.get(n.id)?.level ?? 1) + 1} />
            <Spinner decorative />
            {m.loading}
          </TreeLoadMoreItem>
        )}
        {open && !kids && st === "error" && (
          <TreeItem
            id={`${n.id}${ERROR_SUFFIX}`}
            textValue={m.childrenLoadFailed}
            className="relative flex h-(--row-h) cursor-default items-center gap-1 rounded-md pr-2 text-sm text-fg-2 outline-none data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-focus data-focus-visible:outline-solid"
            style={({ level }) => ({ paddingInlineStart: `${PAD + (level - 1) * INDENT + 20}px` })}
          >
            <TreeItemContent>
              {({ level }) => (
                <>
                  <Guides level={level} />
                  <span>{m.childrenLoadFailed}</span>
                  <span aria-hidden>·</span>
                  <Link onPress={() => retry(n.id)}>{m.retry}</Link>
                </>
              )}
            </TreeItemContent>
          </TreeItem>
        )}
      </TreeItem>
    );
  };

  const disabledKeys = useMemo(() => [...index.values()].filter((e) => e.node.isDisabled).map((e) => e.node.id), [index]);

  return (
    <div
      ref={box}
      className="socle-box flex min-h-0 flex-1 flex-col font-sans text-md text-fg"
      {...rowMenuProps}
      onFocusCapture={(e) => {
        // Focus posé tout droit sur un bouton « Déplacer » depuis l'extérieur de l'arbre (curseur
        // d'un lecteur d'écran, `focus()`) : React Aria ne retient pas sa ligne et renvoie le focus
        // sur la première ligne ; Entrée plie alors cette ligne au lieu de commencer le déplacement.
        // On fait d'abord retenir la ligne, puis on rend le focus au bouton (D-267).
        const target = e.target as HTMLElement;
        if (!target.hasAttribute("data-tree-drag")) return;
        if (e.relatedTarget instanceof Node && box.current?.contains(e.relatedTarget)) return;
        const row = target.closest<HTMLElement>('[role="row"]');
        if (!row) return;
        e.stopPropagation();
        row.focus();
        target.focus();
      }}
      onKeyDownCapture={(e) => {
        shift.current = e.shiftKey;
        if (pressOnDraggingHandle(e)) return;
        onKeyDown(e);
      }}
      onKeyUpCapture={pressOnDraggingHandle}
      onPointerDownCapture={(e) => {
        shift.current = e.shiftKey;
        rowMenuProps.onPointerDownCapture(e);
      }}
    >
      <Tree
        aria-label={ariaLabel}
        selectionMode={selectionMode}
        selectionBehavior="replace"
        selectedKeys={[...selected]}
        onSelectionChange={onSelect}
        expandedKeys={[...expanded]}
        onExpandedChange={(keys) => commitExpanded(new Set([...keys].map(String)))}
        onAction={onTreeAction}
        disabledKeys={disabledKeys}
        {...(onMove ? { dragAndDropHooks } : {})}
        renderEmptyState={() => <EmptyState size="compact" title={emptyState?.title ?? m.noItems} {...(emptyState?.description ? { description: emptyState.description } : {})} />}
        className="min-h-0 flex-1 overflow-auto p-1 outline-none"
      >
        {nodes.map(renderNode)}
      </Tree>
    </div>
  );
}

/** Traits de niveau : un trait vertical par niveau parent, aligné sur son chevron, sans coude (D-262). */
function Guides({ level }: { level: number }) {
  if (level <= 1) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0">
      {Array.from({ length: level - 1 }, (_, i) => (
        <span key={i} className="absolute inset-y-0 border-l border-tree-line" style={{ left: `${PAD + i * INDENT + 8}px` }} />
      ))}
    </span>
  );
}

/** Retrait et traits d'une ligne d'état (chargement). */
function StatusIndent({ level }: { level: number }) {
  return (
    <>
      <Guides level={level} />
      <span aria-hidden className="shrink-0" style={{ width: `${PAD + (level - 1) * INDENT + 16}px` }} />
    </>
  );
}
