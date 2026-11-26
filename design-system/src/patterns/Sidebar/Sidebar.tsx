/*
 * Adapté du starter Tailwind de React Aria (adobe/react-spectrum, starters/tailwind),
 * licence Apache 2.0. Spec : Sidebar.spec.md (v1 et v2 ; pied : D-230 à D-232).
 */
import { Children, createContext, isValidElement, useContext, useMemo, type ReactElement, type ReactNode } from "react";
import type { Key, Selection } from "react-aria-components";
import { Button, Tree, TreeItem, TreeItemContent } from "react-aria-components/Tree";
import { useMessages, useStoredState } from "../../provider/SocleProvider";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { AlertTriangle, ChevronDown, ChevronRight, ChevronsUpDown, ExternalArrow, Folder, Lock, MoreHorizontal, Settings } from "../../icons";
import { IconButton } from "../../components/IconButton/IconButton";
import { DropdownMenu, useRowMenu } from "../../components/DropdownMenu/DropdownMenu";
import { Tooltip } from "../../components/Tooltip/Tooltip";
import { Avatar } from "../../components/Avatar/Avatar";
import { HintTooltip, OverflowTooltip } from "../../components/Tooltip/OverflowTooltip";

/* ---------- Types ---------- */
export interface SidebarAction {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  /** Si fourni, l'action ouvre ce menu (`DropdownMenu.Item`…), par exemple pour « … ». */
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
  /** Point vert « En cours », le même que `Sidebar.Item` (D-055, D-385). */
  indicator?: "activity";
  /** Entrées du menu « … » (`DropdownMenu.Item`…). */
  actions?: ReactNode;
  /**
   * Actions en bouton-icône, avant le « … » : visibles au survol, au focus et sur l'élément sélectionné, comme le
   * « … ». Deux boutons au plus en tout : une seule avec `actions`, deux sans (D-053, D-381). Une action ici n'est
   * pas répétée dans le menu.
   */
  quickActions?: SidebarAction[];
  /**
   * Ouvre l'élément déplié tant que l'utilisateur ne l'a ni replié ni déplié lui-même (D-420). Son choix, mémorisé,
   * l'emporte toujours. Défaut : replié, sauf si un enfant est la page courante.
   */
  defaultExpanded?: boolean;
  /** Enfants, sur un seul niveau (D-042, D-043). */
  children?: ReactNode;
}

export interface SidebarSectionProps {
  id: string;
  title: string;
  /** Éléments affichés avant « Afficher plus (n) » (D-045). */
  limit?: number;
  /**
   * Actions du titre de la section, à droite : boutons-icônes de 22 px, deux au plus, par exemple « + » pour créer un
   * élément de la section. Visibles au survol, au focus clavier et menu ouvert, comme celles d'un élément (D-386, D-392).
   */
  actions?: SidebarAction[];
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
  /** Entrées `DropdownMenu.Item` après un trait : « Créer un espace… », « Ouvrir un autre dossier… » (D-231). */
  actions?: ReactNode;
  isDisabled?: boolean;
  /** Icône de l'espace, à la place du dossier par défaut (D-379). Une icône, jamais un avatar. */
  icon?: ReactNode;
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

type AnyProps = { id?: string; children?: ReactNode; title?: string; defaultExpanded?: boolean };
function walk(children: ReactNode, fn: (el: ReactElement<AnyProps>, parents: string[]) => void, parents: string[] = []) {
  Children.forEach(children, (child) => {
    if (!isValidElement<AnyProps>(child)) return;
    fn(child, parents);
    if (child.props.children && typeof child.props.children !== "string") walk(child.props.children, fn, child.props.id ? [...parents, child.props.id] : parents);
  });
}

const SECTION_MARK = Symbol("SidebarSection");

/**
 * `aria-current="page"` sur la ligne de la page courante (Sidebar.spec.md, Accessibilité).
 * TreeItem ne transmet pas cet attribut : on le pose sur l'élément du DOM, à chaque rendu.
 */
function useCurrentPageRef(id: string) {
  const isCurrent = useContext(SidebarCtx)?.selectedId === id;
  return (el: HTMLDivElement | null) => {
    if (!el) return;
    if (isCurrent) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  };
}

/* ---------- Sidebar ---------- */
export function Sidebar({ selectedId, onSelectionChange, account, footer, workspace, children }: SidebarProps) {
  const m = useMessages();
  // Clic droit, appui long sur tactile, Maj+F10 ou touche Menu : menu « … » de l'élément (D-007, D-053).
  const { rowMenuProps, onKey: onRowMenuKey } = useRowMenu();
  // Ce que l'utilisateur a déplié ou replié est mémorisé (D-007, D-043, D-056) ;
  // les sections sont dépliées par défaut, les éléments repliés, sauf `defaultExpanded` (D-420).
  const [open, setOpen] = useStoredState<Record<string, boolean>>("sidebar:open", {});
  const [more, setMore] = useStoredState<Record<string, boolean>>("sidebar:show-all", {});

  const { sections, ancestors, expandable, preferred } = useMemo(() => {
    const sections = new Set<string>();
    const expandable = new Set<string>();
    // Éléments ouverts dépliés par l'app (`defaultExpanded`, D-420), relus à chaque rendu, jamais mémorisés.
    const preferred = new Set<string>();
    let ancestors: string[] = [];
    walk([children, footer], (el, parents) => {
      const id = el.props.id;
      if (!id) return;
      if ((el.type as { [SECTION_MARK]?: boolean })[SECTION_MARK]) sections.add(id);
      else if (el.props.children && typeof el.props.children !== "string") expandable.add(id);
      if (el.props.defaultExpanded) preferred.add(id);
      if (id === selectedId) ancestors = parents;
    });
    return { sections, ancestors, expandable, preferred };
  }, [children, footer, selectedId]);

  const byDefault = (id: string) => sections.has(id) || ancestors.includes(id) || preferred.has(id);
  const isExpanded = (id: string) => open[id] ?? byDefault(id);
  const expandedKeys = useMemo(
    () => new Set<Key>([...sections, ...expandable].filter((id) => open[id] ?? (sections.has(id) || ancestors.includes(id) || preferred.has(id)))),
    [sections, expandable, open, ancestors, preferred],
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

  // « toggle » : la sélection ne suit pas le focus. Les flèches déplacent le focus,
  // Entrée, Espace ou un clic sélectionnent (Sidebar.spec.md, Clavier).
  // `disallowEmptySelection` : recliquer l'élément sélectionné ne le désélectionne pas (D-039).
  const treeProps = {
    selectionMode: "single",
    selectionBehavior: "toggle",
    disallowEmptySelection: true,
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
      <nav
        aria-label={m.mainNavigation}
        className="socle-side flex h-full min-h-0 flex-col bg-surface-side font-sans text-md text-fg"
        {...rowMenuProps}
        onKeyDownCapture={(e) => onRowMenuKey(e)}
      >
        <Tree {...treeProps} aria-label={m.mainNavigation} className="min-h-0 flex-1 overflow-auto p-1.5 outline-none">
          {children}
        </Tree>
        {/* Pied (D-232) : entrées fixes, espace de travail, compte ; un seul trait au-dessus. */}
        <div className="flex flex-col gap-0.5 border-t border-line px-1.5 py-2">
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
  // socle-nav-item : barre de l'entrée active si le thème le demande (navIndicator « bar », D-337).
  "socle-nav-item group relative flex cursor-default items-center rounded-md text-fg-2 outline-none select-none",
  "data-hovered:bg-hover data-hovered:text-fg",
  // Sélection : fond fixe au survol (D-039).
  "data-selected:bg-selected data-selected:text-fg data-selected:data-hovered:bg-selected",
  // Texte de l'entrée active : --side-selected-fg (D-337), repris par tout ce qui est en --fg dans la ligne.
  "data-selected:[--fg:var(--side-selected-fg)]",
  // Écart entre deux lignes (D-395) : 2 px transparents en haut et en bas, dans la hauteur de la ligne ;
  // le fond s'arrête au bord intérieur. Deux fonds voisins (survol, sélection) restent séparés de 4 px.
  "border-y-2 border-transparent bg-clip-padding",
  // Anneau de focus posé sur le bord du fond, dans la ligne : il ne touche jamais la ligne voisine (D-395).
  // Pas `focusRing` suivi d'un décalage : son `outline-offset-1` l'emporterait.
  "data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-focus data-focus-visible:-outline-offset-4",
);

/**
 * Trait et coude qui relient un enfant à son parent (D-042).
 * `depth` et `last` arrivent en props : React Aria rend `TreeItemContent` depuis sa collection, hors du
 * `Depth.Provider` posé par `withDepth`. Seule la ligne (`Item`, `TwoLine`) lit le contexte, au bon endroit (D-420).
 */
function Connector({ depth, last }: { depth: number; last: boolean }) {
  // Le trait couvre aussi l'écart transparent des lignes (D-395) : il reste continu d'un enfant à l'autre.
  if (depth === 0) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute -top-0.5 left-4 h-[calc(100%+4px)] w-3">
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

/** Visibles aussi tant que leur menu est ouvert : il reste ancré à son bouton (appui long, Maj+F10). */
function Actions({ actions }: { actions: SidebarAction[] }) {
  const shown = actions.slice(0, 2);
  // Le dernier menu (en général « … ») s'ouvre aussi au clic droit, à l'appui long et à Maj+F10.
  const rowMenu = shown.map((a) => Boolean(a.menu)).lastIndexOf(true);
  return (
    <span className="hidden items-center gap-0.5 group-data-focus-visible:flex group-data-hovered:flex group-has-[[aria-haspopup][aria-expanded=true]]:flex">
      {shown.map((a, i) =>
        a.menu ? (
          <DropdownMenu key={a.label} label={a.label} placement="bottom end" trigger={<SmallAction action={a} rowMenu={i === rowMenu} />}>
            {a.menu}
          </DropdownMenu>
        ) : (
          <SmallAction key={a.label} action={a} />
        ),
      )}
    </span>
  );
}

/** Action imbriquée : 22 px, rayon 4 px (D-040, D-053). */
function SmallAction({ action, rowMenu }: { action: SidebarAction; rowMenu?: boolean }) {
  return (
    <Tooltip content={action.label}>
      <Button
        aria-label={action.label}
        {...(rowMenu ? { "data-row-menu": "" } : {})}
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
  // Point gris qui pulse (D-395) : le vert se lisait comme « terminé ». Fixe si le système réduit les animations.
  activity: { icon: <span data-activity="" className="size-2 rounded-full bg-side-fg-3 animate-pulse motion-reduce:animate-none" />, label: "activity" },
} as const;

/* ---------- Sidebar.Item ---------- */
function Item({ id, icon, label, count, indicator, actions, children }: SidebarItemProps) {
  const { depth, last } = useContext(Depth);
  const hidden = useContext(HiddenNavIds);
  const currentRef = useCurrentPageRef(id);
  if (hidden.has(id)) return null;
  const m = useMessages();
  const ind = indicator ? { icon: INDICATORS[indicator].icon, label: m[INDICATORS[indicator].label] } : null;
  const hasKids = Boolean(children);
  return (
    <TreeItem ref={currentRef} id={id} textValue={label} className={cx(rowBase, "h-(--row-h)", depth > 0 ? "pl-8" : "pl-2", "pr-1")}>
      <TreeItemContent>
        {({ isExpanded }) => (
          <>
            <Connector depth={depth} last={last} />
            {depth === 0 && <span className="mr-2 inline-grid w-4 shrink-0 place-items-center">{icon}</span>}
            <OverflowTooltip text={label} beside />
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
              <span className={cx("px-1 text-sm text-fg-3 tabular-nums group-data-selected:text-fg-2", Boolean(actions?.length) && "group-data-focus-visible:hidden group-data-hovered:hidden group-has-[[aria-haspopup][aria-expanded=true]]:hidden")}>
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
function TwoLine({ id, title, subtitle, meta, status, unread, indicator, actions, quickActions, children }: SidebarTreeItemProps) {
  const m = useMessages();
  const { depth, last } = useContext(Depth);
  const ctx = useSidebar();
  const currentRef = useCurrentPageRef(id);
  const kids = Children.toArray(children).filter(isValidElement) as ReactElement<SidebarTreeItemProps>[];
  const unreadKids = kids.filter((k) => k.props.unread).length;
  const showSummary = kids.length > 0 && !ctx.isExpanded(id);
  const row = (
    <TreeItem ref={currentRef} id={id} textValue={title} className={cx(rowBase, "box-border min-h-(--row2-h) py-1", depth > 0 ? "pl-8" : "pl-2", "pr-2")}>
      <TreeItemContent>
        {({ isExpanded }) => (
          <>
            <Connector depth={depth} last={last} />
            <span className="flex min-w-0 flex-1 flex-col">
              {/* Ligne du titre : hauteur fixe d'une ligne de texte (h-lh). Ni le « … » de 22 px,
                  ni l'icône d'état ne la font grandir, au survol, au focus ou à la sélection (D-368). */}
              <span className="flex h-lh min-w-0 items-center gap-1.5">
                <OverflowTooltip text={title} textClass="min-w-0 truncate text-fg" beside />
                {kids.length > 0 && (
                  <Button slot="chevron" aria-label={isExpanded ? m.collapseItem(title) : m.expandItem(title)} className={cx(buttonReset, "inline-grid size-4 shrink-0 place-items-center rounded-sm text-fg-3 data-hovered:bg-selected")}>
                    <ChevronRight size={12} className={cx(isExpanded && "rotate-90")} />
                  </Button>
                )}
                <span className="flex-1" />
                {/* Signes d'état : quand les actions apparaissent (survol, focus clavier, menu ouvert), elles prennent
                    leur place, comme pour le compteur d'un élément ; ensuite, les signes reviennent (D-393). */}
                {(indicator || unread || status === "warning") && (
                  <span
                    className={cx(
                      "flex shrink-0 items-center gap-1.5",
                      Boolean(actions || quickActions?.length) &&
                        "group-data-focus-visible:hidden group-data-hovered:hidden group-has-[[aria-haspopup][aria-expanded=true]]:hidden",
                    )}
                  >
                    {indicator && (
                      <HintTooltip label={m[INDICATORS[indicator].label]} frameClass="inline-grid place-items-center">
                        {INDICATORS[indicator].icon}
                      </HintTooltip>
                    )}
                    {unread && <span role="img" aria-label={m.unread} className="size-1.5 shrink-0 rounded-full bg-highlight" />}
                    {status === "warning" && (
                      <span role="img" aria-label={m.toDo} className="text-warning">
                        <AlertTriangle size={14} />
                      </span>
                    )}
                  </span>
                )}
                {/* « … » à droite de la ligne du titre ; son icône s'aligne sur l'étiquette de la ligne 2 (D-368). */}
                {(actions || quickActions?.length) && (
                  <span className="-mr-1 hidden gap-0.5 group-data-focus-visible:inline-flex group-data-hovered:inline-flex group-has-[[aria-haspopup][aria-expanded=true]]:inline-flex">
                    {/* Deux boutons au plus : une action rapide avec le « … », deux sans lui (D-053, D-381). */}
                    {quickActions?.slice(0, actions ? 1 : 2).map((a) => <SmallAction key={a.label} action={a} />)}
                    {actions && (
                      <DropdownMenu label={m.actionsOn(title)} placement="bottom end" trigger={<SmallAction action={{ icon: <MoreHorizontal />, label: m.actionsOn(title) }} rowMenu />}>
                        {actions}
                      </DropdownMenu>
                    )}
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
          <Connector depth={depth + 1} last />
          {label}
          {unreadKids > 0 && (
            <span className="text-side-highlight">
              &nbsp;· {m.unreadCount(unreadKids)}
            </span>
          )}
        </TreeItemContent>
      </TreeItem>
    </>
  );
}

/* ---------- Sidebar.Section ---------- */
function Section({ id, title, limit = 5, actions, children }: SidebarSectionProps) {
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
          <>
            <span className="flex items-center gap-1">
              {title}
              <ChevronDown size={12} className={cx(!isExpanded && "-rotate-90")} />
            </span>
            {actions?.length ? (
              <>
                <span className="flex-1" />
                <Actions actions={actions} />
              </>
            ) : null}
          </>
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
        <DropdownMenu
          label={m.account}
          placement="top start"
          trigger={
            <Button className={cx(buttonReset, "flex h-(--row-h) min-w-0 flex-1 cursor-default items-center gap-1 rounded-md px-1 text-left data-hovered:bg-hover", focusRing)}>
              {who}
              <ChevronsUpDown size={12} className="shrink-0 text-fg-3" />
            </Button>
          }
        >
          {menu}
        </DropdownMenu>
      ) : (
        <span className="flex h-(--row-h) min-w-0 flex-1 items-center gap-1 px-1">{who}</span>
      )}
      {/* Case de 24 px : la roue tombe sur la colonne de droite du pied dans les deux densités (bouton de 24 ou 28 px) (D-394). */}
      <span className="flex w-6 shrink-0 justify-center">
        <IconButton icon={<Settings />} label={m.settings} shortcut="Mod+," onPress={onSettings} tooltipPlacement="top" />
      </span>
    </div>
  );
}

/* ---------- Sidebar.Workspace (D-231, D-369) ---------- */
/**
 * Lettre du repère d'un espace : la première lettre ou le premier chiffre de son nom.
 * @deprecated Depuis 1.1.0 : `Sidebar.Workspace` n'a plus de repère (D-369). Retrait prévu en 2.0.0.
 */
export function workspaceInitial(name: string): string {
  const ch = Array.from(name).find((c) => /[\p{L}\p{N}]/u.test(c));
  return (ch ?? "·").toLocaleUpperCase();
}

function Workspace({ workspaces, currentId, onChange, actions, isDisabled, icon }: SidebarWorkspaceProps) {
  const m = useMessages();
  const current = workspaces.find((w) => w.id === currentId) ?? workspaces[0];
  if (!current) return null;
  // Une icône de dossier, dans une case de 24 px comme l'avatar du compte : les trois lignes du pied s'alignent
  // (entrée fixe : icône, espace : icône, compte : avatar). Jamais d'avatar pour l'espace (D-369, D-379).
  const who = (
    <>
      <span aria-hidden className="inline-grid size-6 shrink-0 place-items-center text-fg-2 [&>svg]:size-4">
        {icon ?? <Folder />}
      </span>
      <OverflowTooltip text={current.name} />
    </>
  );
  // Un seul espace et aucune action : simple étiquette (comme le compte, D-046).
  if (workspaces.length < 2 && !actions) {
    return (
      <span className="flex h-(--row-h) min-w-0 items-center gap-1 px-1 text-fg">
        <span className="sr-only">{m.workspaceLabel}</span>
        {who}
      </span>
    );
  }
  return (
    <DropdownMenu
      label={m.workspaces}
      placement="top start"
      trigger={
        <Button
          aria-label={m.workspaceSwitch(current.name)}
          {...(isDisabled ? { isDisabled } : {})}
          className={cx(
            buttonReset,
            "flex h-(--row-h) w-full min-w-0 cursor-default items-center gap-1 rounded-md px-1 text-left text-fg data-disabled:opacity-40 data-hovered:bg-hover data-pressed:bg-hover",
            focusRing,
          )}
        >
          {who}
          <span className="flex-1" />
          {/* Case de 16 px : le chevron tombe sur la colonne de droite du pied, celle du point « En cours » et de la roue
              des réglages (D-394). */}
          <span aria-hidden className="inline-grid w-4 shrink-0 place-items-center text-fg-3">
            <ChevronsUpDown size={12} />
          </span>
        </Button>
      }
    >
      <DropdownMenu.Section
        title={m.workspaces}
        selectionMode="single"
        selectedKeys={[current.id]}
        onSelectionChange={(keys) => {
          const id = [...keys][0];
          if (id !== undefined && String(id) !== current.id) onChange(String(id));
        }}
      >
        {workspaces.map((w) => (
          <DropdownMenu.Item key={w.id} id={w.id} label={w.name} />
        ))}
      </DropdownMenu.Section>
      {actions && <DropdownMenu.Separator />}
      {actions}
    </DropdownMenu>
  );
}

Sidebar.Item = Item;
Sidebar.TreeItem = TwoLine;
Sidebar.Section = Section;
Sidebar.Account = Account;
Sidebar.Workspace = Workspace;

