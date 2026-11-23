/*
 * Adapté du starter Tailwind de React Aria (adobe/react-spectrum, starters/tailwind),
 * licence Apache 2.0. Spec : Sidebar.spec.md (v1 et v2 ; pied : D-230 à D-232).
 */
import { Children, createContext, isValidElement, useContext, useMemo, type ReactElement, type ReactNode } from "react";
import type { Key, Selection } from "react-aria-components";
import { Button, Tree, TreeItem, TreeItemContent } from "react-aria-components/Tree";
import { useMessages, useStoredState } from "../../provider/SocleProvider";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { AlertTriangle, ChevronDown, ChevronRight, ChevronsUpDown, ExternalArrow, Lock, MoreHorizontal, Settings } from "../../icons";
import { IconButton } from "../../components/IconButton/IconButton";
import { Menu } from "../../components/Menu/Menu";
import { Tooltip } from "../../components/Tooltip/Tooltip";
import { Avatar } from "../../components/Avatar/Avatar";
import { HintTooltip, OverflowTooltip } from "../../components/Tooltip/OverflowTooltip";

/* ---------- Types ---------- */
export interface SidebarAction {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  /** Si fourni, l'action ouvre ce menu (`Menu.Item`…), par exemple pour « … ». */
  menu?: ReactNode;
}

export interface SidebarItemProps {
  id: string;
  /** Icône obligatoire (D-052), sauf pour une sous-page. */
  icon?: ReactNode;
  label: string;
  /** Compteur gris ; « 99+ » au-delà de 99 (D-044). Exclu avec `indicator`. */
  count?: number;
  /** Indicateur permanent (D-055). Exclu avec `count`. */
  indicator?: "external" | "locked" | "activity";
  /** Deux actions au plus, au survol (D-053, D-054). */
  actions?: SidebarAction[];
  /** L'élément va dans la barre d'onglets mobile (D-003, D-019). Lu par AppShell. */
  tabbar?: boolean;
  /** Sous-pages, sur un seul niveau (D-056). */
  children?: ReactNode;
}

export interface SidebarTreeItemProps {
  id: string;
  title: string;
  subtitle?: string;
  /** Étiquette à droite de la ligne 2. */
  meta?: string;
  /** Icône d'état à droite de la ligne 1. */
  status?: "warning";
  /** Point de non-lu (D-044). */
  unread?: boolean;
  /** Entrées du menu « … » (`Menu.Item`…). */
  actions?: ReactNode;
  /** Enfants, sur un seul niveau (D-042, D-043). */
  children?: ReactNode;
}

export interface SidebarSectionProps {
  id: string;
  title: string;
  /** Éléments affichés avant « Afficher plus (n) » (D-045). */
  limit?: number;
  children: ReactNode;
}

export interface SidebarAccountProps {
  name: string;
  /** Plan ou rôle, en gris. */
  detail?: string;
  /** Initiales ou image. Défaut : initiales du nom. */
  avatar?: ReactNode;
  onSettings: () => void;
  /** Entrées du menu du compte (D-046). Sans entrée : simple étiquette. */
  menu?: ReactNode;
}

export interface SidebarWorkspaceEntry {
  id: string;
  name: string;
}

export interface SidebarWorkspaceProps {
  /** Les espaces proposés, dans l'ordre voulu (les plus récents d'abord, par exemple). */
  workspaces: SidebarWorkspaceEntry[];
  /** Espace ouvert. */
  currentId: string;
  /** Appelé quand l'utilisateur choisit un autre espace. */
  onChange: (id: string) => void;
  /** Entrées `Menu.Item` après un trait : « Créer un espace… », « Ouvrir un autre dossier… » (D-231). */
  actions?: ReactNode;
  isDisabled?: boolean;
}

export interface SidebarProps {
  /** Page courante. */
  selectedId: string;
  onSelectionChange: (id: string) => void;
  /** Pied : compte et réglages. */
  account: ReactElement<SidebarAccountProps>;
  /** Entrées fixes du bas, au-dessus du compte : des `Sidebar.Item`, 3 au plus (D-230). */
  footer?: ReactNode;
  /** Sélecteur d'espace de travail, entre les entrées fixes et le compte (D-231, D-232). */
  workspace?: ReactElement<SidebarWorkspaceProps>;
  /** `Sidebar.Item` et `Sidebar.Section`. */
  children: ReactNode;
}

/* ---------- Contexte ---------- */
/** Entrées masquées dans la feuille « Plus » d'AppShell : déjà dans la barre d'onglets (D-019). */
export const HiddenNavIds = createContext<ReadonlySet<string>>(new Set());

interface Ctx {
  selectedId: string;
  isExpanded: (id: string) => boolean;
  toggle: (id: string) => void;
  showAll: (sectionId: string) => boolean;
  setShowAll: (sectionId: string, v: boolean) => void;
  containsSelected: (children: ReactNode) => boolean;
}
const SidebarCtx = createContext<Ctx | null>(null);
const useSidebar = () => useContext(SidebarCtx)!;

/** Position dans l'arbre visuel : profondeur et dernier enfant (pour le coude, D-042). */
const Depth = createContext<{ depth: number; last: boolean }>({ depth: 0, last: false });

type AnyProps = { id?: string; children?: ReactNode; title?: string };
function walk(children: ReactNode, fn: (el: ReactElement<AnyProps>, parents: string[]) => void, parents: string[] = []) {
  Children.forEach(children, (child) => {
    if (!isValidElement<AnyProps>(child)) return;
    fn(child, parents);
    if (child.props.children && typeof child.props.children !== "string") walk(child.props.children, fn, child.props.id ? [...parents, child.props.id] : parents);
  });
}

const SECTION_MARK = Symbol("SidebarSection");

/* ---------- Sidebar ---------- */
export function Sidebar({ selectedId, onSelectionChange, account, footer, workspace, children }: SidebarProps) {
  const m = useMessages();
  // Ce que l'utilisateur a déplié ou replié est mémorisé (D-007, D-043, D-056) ;
  // les sections sont dépliées par défaut, les éléments repliés.
  const [open, setOpen] = useStoredState<Record<string, boolean>>("sidebar:open", {});
  const [more, setMore] = useStoredState<Record<string, boolean>>("sidebar:show-all", {});

  const { sections, ancestors, expandable } = useMemo(() => {
    const sections = new Set<string>();
    const expandable = new Set<string>();
    let ancestors: string[] = [];
    walk([children, footer], (el, parents) => {
      const id = el.props.id;
      if (!id) return;
      if ((el.type as { [SECTION_MARK]?: boolean })[SECTION_MARK]) sections.add(id);
      else if (el.props.children && typeof el.props.children !== "string") expandable.add(id);
      if (id === selectedId) ancestors = parents;
    });
    return { sections, ancestors, expandable };
  }, [children, footer, selectedId]);

  const isExpanded = (id: string) => open[id] ?? (sections.has(id) || ancestors.includes(id));
  const expandedKeys = useMemo(
    () => new Set<Key>([...sections, ...expandable].filter((id) => open[id] ?? (sections.has(id) || ancestors.includes(id)))),
    [sections, expandable, open, ancestors],
  );

  const ctx: Ctx = {
    selectedId,
    isExpanded,
    toggle: (id) => setOpen({ ...open, [id]: !isExpanded(id) }),
    showAll: (id) => more[id] ?? false,
    setShowAll: (id, v) => setMore({ ...more, [id]: v }),
    containsSelected: (c) => {
      let found = false;
      walk(c, (el) => {
        if (el.props.id === selectedId) found = true;
      });
      return found;
    },
  };

  const onSelect = (keys: Selection) => {
    if (keys === "all") return;
    const key = [...keys][0];
    if (key === undefined) return;
    const id = String(key);
    // Lignes techniques : titre de section, « Afficher plus », ligne résumé.
    if (sections.has(id)) return ctx.toggle(id);
    if (id.endsWith("::more")) return ctx.setShowAll(id.slice(0, -6), !ctx.showAll(id.slice(0, -6)));
    if (id.endsWith("::summary")) return ctx.toggle(id.slice(0, -9));
    // Un clic sur l'élément sélectionné ne fait rien (D-039).
    if (id !== selectedId) onSelectionChange(id);
  };

  const treeProps = {
    selectionMode: "single",
    selectionBehavior: "replace",
    selectedKeys: [selectedId],
    onSelectionChange: onSelect,
    expandedKeys,
    onExpandedChange: (keys: Set<Key>) => {
      const next = { ...open };
      for (const id of [...sections, ...expandable]) {
        const now = keys.has(id);
        if (now !== isExpanded(id)) next[id] = now;
      }
      setOpen(next);
    },
  } as const;
  // Les entrées fixes masquées (déjà dans la barre d'onglets mobile, D-019) ne laissent pas d'arbre vide.
  const hidden = useContext(HiddenNavIds);
  let hasFooter = false;
  Children.forEach(footer, (c) => {
    if (isValidElement<AnyProps>(c) && !(c.props.id && hidden.has(c.props.id))) hasFooter = true;
  });

  return (
    <SidebarCtx.Provider value={ctx}>
      <nav aria-label={m.mainNavigation} className="flex h-full min-h-0 flex-col bg-surface-side font-sans text-md text-fg">
        <Tree {...treeProps} aria-label={m.mainNavigation} className="min-h-0 flex-1 overflow-auto p-1.5 outline-none">
          {children}
        </Tree>
        {/* Pied (D-232) : entrées fixes, espace de travail, compte ; un seul trait au-dessus. */}
        <div className="flex flex-col gap-0.5 border-t border-line p-2">
          {hasFooter && (
            <Tree {...treeProps} aria-label={m.footerNavigation} className="outline-none">
              {footer}
            </Tree>
          )}
          {workspace}
          {account}
        </div>
      </nav>
    </SidebarCtx.Provider>
  );
}

/* ---------- Lignes ---------- */
const rowBase = cx(
  "group relative flex cursor-default items-center rounded-md text-fg-2 outline-none select-none",
  "data-hovered:bg-hover data-hovered:text-fg",
  // Sélection : fond fixe au survol (D-039).
  "data-selected:bg-selected data-selected:text-fg data-selected:data-hovered:bg-selected",
  focusRing,
  "data-focus-visible:-outline-offset-2",
);

/** Trait et coude qui relient un enfant à son parent (D-042). */
function Connector() {
  const { depth, last } = useContext(Depth);
  if (depth === 0) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute top-0 left-4 h-full w-3">
      {last ? (
        <span className="absolute top-0 left-0 h-1/2 w-2 rounded-bl-[8px] border-b border-l border-tree-line" />
      ) : (
        <>
          <span className="absolute top-0 left-0 h-full border-l border-tree-line" />
          <span className="absolute top-1/2 left-0 w-2 border-t border-tree-line" />
        </>
      )}
    </span>
  );
}

function withDepth(children: ReactNode, depth: number) {
  const list = Children.toArray(children).filter(isValidElement);
  return list.map((child, i) => (
    <Depth.Provider key={(child as ReactElement<AnyProps>).props.id ?? i} value={{ depth, last: i === list.length - 1 }}>
      {child}
    </Depth.Provider>
  ));
}

function Actions({ actions }: { actions: SidebarAction[] }) {
  return (
    <span className="hidden items-center gap-0.5 group-data-focus-visible:flex group-data-hovered:flex group-data-selected:flex">
      {actions.slice(0, 2).map((a) =>
        a.menu ? (
          <Menu key={a.label} label={a.label} placement="bottom end" trigger={<SmallAction action={a} />}>
            {a.menu}
          </Menu>
        ) : (
          <SmallAction key={a.label} action={a} />
        ),
      )}
    </span>
  );
}

/** Action imbriquée : 22 px, rayon 4 px (D-040, D-053). */
function SmallAction({ action }: { action: SidebarAction }) {
  return (
    <Tooltip content={action.label}>
      <Button
        aria-label={action.label}
        {...(action.onPress ? { onPress: action.onPress } : {})}
        className={cx(buttonReset, "inline-grid size-[22px] place-items-center rounded-sm text-fg-2 data-hovered:bg-selected data-hovered:text-fg", focusRing)}
      >
        <span className="inline-grid size-3.5 place-items-center [&>svg]:size-3.5">{action.icon}</span>
      </Button>
    </Tooltip>
  );
}

const INDICATORS = {
  external: { icon: <ExternalArrow size={14} />, label: "opensInBrowser" },
  locked: { icon: <Lock size={14} />, label: "readOnly" },
  activity: { icon: <span className="size-2 rounded-full bg-success" />, label: "activity" },
} as const;

/* ---------- Sidebar.Item ---------- */
function Item({ id, icon, label, count, indicator, actions, children }: SidebarItemProps) {
  const { depth } = useContext(Depth);
  const hidden = useContext(HiddenNavIds);
  if (hidden.has(id)) return null;
  const m = useMessages();
  const ind = indicator ? { icon: INDICATORS[indicator].icon, label: m[INDICATORS[indicator].label] } : null;
  const hasKids = Boolean(children);
  return (
    <TreeItem id={id} textValue={label} className={cx(rowBase, "h-(--row-h)", depth > 0 ? "pl-8" : "pl-2", "pr-1")}>
      <TreeItemContent>
        {({ isExpanded }) => (
          <>
            <Connector />
            {depth === 0 && <span className="mr-2 inline-grid w-4 shrink-0 place-items-center">{icon}</span>}
            <OverflowTooltip text={label} />
            {hasKids && (
              <Button slot="chevron" aria-label={isExpanded ? m.collapseItem(label) : m.expandItem(label)} className={cx(buttonReset, "ml-1 inline-grid size-4 place-items-center rounded-sm text-fg-3 data-hovered:bg-selected")}>
                <ChevronRight size={12} className={cx("shrink-0", isExpanded && "rotate-90")} />
              </Button>
            )}
            <span className="flex-1" />
            {ind && (
              <HintTooltip label={ind.label} frameClass="mx-1 inline-grid place-items-center text-fg-3 group-data-selected:text-fg-2">
                {ind.icon}
              </HintTooltip>
            )}
            {count !== undefined && !ind && (
              <span className={cx("px-1 text-sm text-fg-3 tabular-nums group-data-selected:text-fg-2", Boolean(actions?.length) && "group-data-focus-visible:hidden group-data-hovered:hidden group-data-selected:hidden")}>
                {count > 99 ? "99+" : count}
              </span>
            )}
            {actions?.length ? <Actions actions={actions} /> : null}
          </>
        )}
      </TreeItemContent>
      {hasKids && withDepth(children, depth + 1)}
    </TreeItem>
  );
}

/* ---------- Sidebar.TreeItem ---------- */
function TwoLine({ id, title, subtitle, meta, status, unread, actions, children }: SidebarTreeItemProps) {
  const m = useMessages();
  const { depth } = useContext(Depth);
  const ctx = useSidebar();
  const kids = Children.toArray(children).filter(isValidElement) as ReactElement<SidebarTreeItemProps>[];
  const unreadKids = kids.filter((k) => k.props.unread).length;
  const showSummary = kids.length > 0 && !ctx.isExpanded(id);
  const row = (
    <TreeItem id={id} textValue={title} className={cx(rowBase, "min-h-(--row2-h) py-1.5", depth > 0 ? "pl-8" : "pl-2", "pr-1")}>
      <TreeItemContent>
        {({ isExpanded }) => (
          <>
            <Connector />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex min-w-0 items-center gap-1.5">
                <OverflowTooltip text={title} textClass="min-w-0 truncate text-fg" />
                {kids.length > 0 && (
                  <Button slot="chevron" aria-label={isExpanded ? m.collapseItem(title) : m.expandItem(title)} className={cx(buttonReset, "inline-grid size-4 shrink-0 place-items-center rounded-sm text-fg-3 data-hovered:bg-selected")}>
                    <ChevronRight size={12} className={cx(isExpanded && "rotate-90")} />
                  </Button>
                )}
                <span className="flex-1" />
                {unread && <span role="img" aria-label={m.unread} className="size-1.5 shrink-0 rounded-full bg-accent" />}
                {status === "warning" && (
                  <span role="img" aria-label={m.toDo} className="text-warning">
                    <AlertTriangle size={14} />
                  </span>
                )}
                {actions && (
                  <span className="hidden group-data-focus-visible:inline-flex group-data-hovered:inline-flex group-data-selected:inline-flex">
                    <Menu label={m.actionsOn(title)} placement="bottom end" trigger={<SmallAction action={{ icon: <MoreHorizontal />, label: m.actionsOn(title) }} />}>
                      {actions}
                    </Menu>
                  </span>
                )}
              </span>
              {(subtitle || meta) && (
                <span className="flex min-w-0 items-center gap-1.5 text-sm">
                  <span className="min-w-0 flex-1 truncate text-fg-2">{subtitle}</span>
                  {meta && <span className="shrink-0 text-xs text-fg-3 group-data-selected:text-fg-2">{meta}</span>}
                </span>
              )}
            </span>
          </>
        )}
      </TreeItemContent>
      {kids.length > 0 && withDepth(children, depth + 1)}
    </TreeItem>
  );
  if (!showSummary) return row;
  // Ligne résumé sous un parent replié (D-043) ; un clic la déplie.
  const label = m.childCount(kids.length);
  return (
    <>
      {row}
      <TreeItem id={`${id}::summary`} textValue={label} className={cx(rowBase, "h-6 pl-8 text-sm text-fg-3")}>
        <TreeItemContent>
          <Depth.Provider value={{ depth: depth + 1, last: true }}>
            <Connector />
          </Depth.Provider>
          {label}
          {unreadKids > 0 && (
            <span className="text-accent-text">
              &nbsp;· {m.unreadCount(unreadKids)}
            </span>
          )}
        </TreeItemContent>
      </TreeItem>
    </>
  );
}

/* ---------- Sidebar.Section ---------- */
function Section({ id, title, limit = 5, children }: SidebarSectionProps) {
  const m = useMessages();
  const ctx = useSidebar();
  const list = Children.toArray(children).filter(isValidElement);
  // L'élément sélectionné reste toujours visible (D-045).
  const all = ctx.showAll(id) || list.slice(limit).some((c) => ctx.containsSelected(c));
  const shown = all ? list : list.slice(0, limit);
  const rest = list.length - limit;
  return (
    <TreeItem id={id} textValue={title} className={cx("group mt-2.5 flex h-7 cursor-default items-center rounded-md px-2 text-sm text-fg-3 outline-none data-hovered:text-fg-2", focusRing)}>
      <TreeItemContent>
        {({ isExpanded }) => (
          <span className="flex items-center gap-1">
            {title}
            <ChevronDown size={12} className={cx(!isExpanded && "-rotate-90")} />
          </span>
        )}
      </TreeItemContent>
      {withDepth(shown, 0)}
      {rest > 0 && !list.slice(limit).some((c) => ctx.containsSelected(c)) && (
        <TreeItem id={`${id}::more`} textValue={ctx.showAll(id) ? m.showLess : m.showMoreCount(rest)} className={cx(rowBase, "h-7 px-2 text-sm text-fg-3")}>
          <TreeItemContent>{ctx.showAll(id) ? m.showLess : m.showMoreCount(rest)}</TreeItemContent>
        </TreeItem>
      )}
    </TreeItem>
  );
}
(Section as unknown as Record<symbol, boolean>)[SECTION_MARK] = true;

/* ---------- Sidebar.Account ---------- */
function Account({ name, detail, avatar, onSettings, menu }: SidebarAccountProps) {
  const m = useMessages();
  const who = (
    <>
      {avatar ? (
        <span className="inline-grid size-6 shrink-0 place-items-center overflow-hidden rounded-full bg-selected text-xs font-semibold text-fg">{avatar}</span>
      ) : (
        <span aria-hidden className="contents [--avatar-bg:var(--selected)]">
          <Avatar name={name} size="sm" />
        </span>
      )}
      <span className="min-w-0 truncate text-fg">{name}</span>
      {detail && <span className="shrink-0 text-sm text-fg-3">· {detail}</span>}
    </>
  );
  return (
    <div className="flex items-center gap-1">
      {menu ? (
        <Menu
          label={m.account}
          placement="top start"
          trigger={
            <Button className={cx(buttonReset, "flex h-(--row-h) min-w-0 flex-1 cursor-default items-center gap-2 rounded-md px-1.5 text-left data-hovered:bg-hover", focusRing)}>
              {who}
              <ChevronsUpDown size={12} className="shrink-0 text-fg-3" />
            </Button>
          }
        >
          {menu}
        </Menu>
      ) : (
        <span className="flex h-(--row-h) min-w-0 flex-1 items-center gap-2 px-1.5">{who}</span>
      )}
      <IconButton icon={<Settings />} label={m.settings} shortcut="Mod+," onPress={onSettings} tooltipPlacement="top" />
    </div>
  );
}

/* ---------- Sidebar.Workspace (D-231) ---------- */
/** Lettre du repère d'un espace : la première lettre ou le premier chiffre de son nom. */
export function workspaceInitial(name: string): string {
  const ch = Array.from(name).find((c) => /[\p{L}\p{N}]/u.test(c));
  return (ch ?? "·").toLocaleUpperCase();
}

function Workspace({ workspaces, currentId, onChange, actions, isDisabled }: SidebarWorkspaceProps) {
  const m = useMessages();
  const current = workspaces.find((w) => w.id === currentId) ?? workspaces[0];
  if (!current) return null;
  const who = (
    <>
      <span aria-hidden className="inline-grid size-6 shrink-0 place-items-center rounded-sm bg-selected text-xs font-semibold text-fg">
        {workspaceInitial(current.name)}
      </span>
      <OverflowTooltip text={current.name} />
    </>
  );
  // Un seul espace et aucune action : simple étiquette (comme le compte, D-046).
  if (workspaces.length < 2 && !actions) {
    return (
      <span className="flex h-(--row-h) min-w-0 items-center gap-2 px-1.5 text-fg">
        <span className="sr-only">{m.workspaceLabel}</span>
        {who}
      </span>
    );
  }
  return (
    <Menu
      label={m.workspaces}
      placement="top start"
      trigger={
        <Button
          aria-label={m.workspaceSwitch(current.name)}
          {...(isDisabled ? { isDisabled } : {})}
          className={cx(
            buttonReset,
            "flex h-(--row-h) w-full min-w-0 cursor-default items-center gap-2 rounded-md px-1.5 text-left text-fg data-disabled:opacity-40 data-hovered:bg-hover data-pressed:bg-hover",
            focusRing,
          )}
        >
          {who}
          <span className="flex-1" />
          <ChevronsUpDown size={12} className="shrink-0 text-fg-3" />
        </Button>
      }
    >
      <Menu.Section
        title={m.workspaces}
        selectionMode="single"
        selectedKeys={[current.id]}
        onSelectionChange={(keys) => {
          const id = [...keys][0];
          if (id !== undefined && String(id) !== current.id) onChange(String(id));
        }}
      >
        {workspaces.map((w) => (
          <Menu.Item key={w.id} id={w.id} label={w.name} />
        ))}
      </Menu.Section>
      {actions && <Menu.Separator />}
      {actions}
    </Menu>
  );
}

Sidebar.Item = Item;
Sidebar.TreeItem = TwoLine;
Sidebar.Section = Section;
Sidebar.Account = Account;
Sidebar.Workspace = Workspace;

