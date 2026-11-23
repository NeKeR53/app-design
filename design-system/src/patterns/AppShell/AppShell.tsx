/*
 * Cadre commun de toutes les apps. Spec : AppShell.spec.md.
 * Décisions : D-003, D-016 à D-021, D-025 à D-027, D-220 à D-222, D-240 à D-242, D-250 à D-252.
 */
import { Children, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactElement, type ReactNode } from "react";
import { Button } from "react-aria-components/Button";
import { Dialog as AriaDialog } from "react-aria-components/Dialog";
import { Modal, ModalOverlay } from "react-aria-components/Modal";
import { useMessages, useSocle, useStoredState } from "../../provider/SocleProvider";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { ChevronLeft, ChevronRight, ListDetail, Maximize, Minimize, MoreHorizontal, PanelLeft, X } from "../../icons";
import { IconButton } from "../../components/IconButton/IconButton";
import { Tabs, useTabPanelProps, type TabItem } from "../../components/Tabs/Tabs";
import { DropdownMenu } from "../../components/DropdownMenu/DropdownMenu";
import { Tooltip } from "../../components/Tooltip/Tooltip";
import { OverflowTooltip } from "../../components/Tooltip/OverflowTooltip";
import { Badge, type StatusTone } from "../../components/Badge/Badge";
import { Focusable } from "react-aria-components/Focusable";
import { HiddenNavIds, Sidebar, type SidebarItemProps, type SidebarProps } from "../Sidebar/Sidebar";

export interface TabbarEntry {
  id: string;
  label: string;
  icon: ReactNode;
}

/** État durable de la page ou de l'app, en indicateur compact après le titre (D-159, D-251). */
export interface PageStatus {
  /** Libellé court : « Lecture seule », « Hors ligne », « Exemple ». */
  label: string;
  /** Ton du point (D-161). */
  tone?: StatusTone;
  /** Phrase d'explication, dans l'info-bulle ou le nom du bouton. */
  description?: string;
  /** Entrées `DropdownMenu.Item` : l'indicateur devient un bouton qui ouvre ce menu (« Quitter les données d'exemple »). */
  menu?: ReactNode;
}

export interface AppShellProps {
  /** Nom de la page, dans la barre supérieure. */
  pageTitle: string;
  /** Court résumé après le titre, texte seul : « 3 personnes · 2 en écart » (D-250). */
  pageSummary?: string;
  /** État durable de la page, un seul à la fois (D-251, D-252). */
  pageStatus?: PageStatus;
  /** Vues de la page en onglets (D-021). */
  views?: TabItem[];
  activeView?: string;
  onViewChange?: (id: string) => void;
  onViewClose?: (id: string) => void;
  /** Actions de la page : `ActionBar zone="topbar"` et boutons-icônes `IconButton` (cloche…) (D-222). */
  actions?: ReactNode;
  /** La sidebar de l'app (`Sidebar`). */
  sidebar: ReactElement<SidebarProps>;
  /** Contenu du panneau de détail ; sans lui, ni colonne ni bouton (D-018). */
  detail?: ReactNode;
  /** Largeur de départ du panneau : `default` (sections, `--detail-w`) ou `form` (formulaire, `--detail-w-form`) (D-240). */
  detailWidth?: "default" | "form";
  /** Bouton Agrandir dans la barre du haut, sur bureau : panneau large (D-241). */
  detailExpandable?: boolean;
  /** Entrées de la barre d'onglets mobile (4 au plus). Défaut : éléments `tabbar` de la sidebar, sinon les 4 premiers (D-003, D-019). */
  tabbar?: TabbarEntry[];
  /** Affiche précédent/suivant. */
  history?: boolean;
  /** Le gabarit de la page. */
  children: ReactNode;
}

const DETAIL_MIN = 240;
const DETAIL_MAX = 480;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/** Éléments atteignables à la tabulation dans `root`, dans l'ordre du document (éléments visibles seulement). */
function tabbables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.tabIndex >= 0 && el.getClientRects().length > 0);
}
const OVERLAY_CLOSE_DELAY = 250;

function navItems(sidebar: ReactElement<SidebarProps>): SidebarItemProps[] {
  const out: SidebarItemProps[] = [];
  // Navigation, puis entrées fixes du bas (D-230) : elles peuvent aussi aller dans la barre d'onglets.
  Children.forEach([sidebar.props.children, sidebar.props.footer], (child) => {
    if (isValidElement<SidebarItemProps>(child) && child.type === Sidebar.Item) out.push(child.props);
  });
  return out;
}

function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return match;
}

export function AppShell({ pageTitle, pageSummary, pageStatus, views, activeView, onViewChange, onViewClose, actions, sidebar, detail, detailWidth: detailKind = "default", detailExpandable = false, tabbar, history = true, children }: AppShellProps) {
  const { isMac, platform } = useSocle();
  const m = useMessages();
  const isMobile = useMedia("(max-width: 640px)");
  const isTablet = useMedia("(min-width: 641px) and (max-width: 1024px)");
  // Les vues (Tabs) et le contenu (main) sont reliés : rôle `tabpanel` sur main (Tabs.spec.md).
  const viewsId = useId();
  const hasViews = Boolean(views && views.length > 0 && activeView && onViewChange);
  const panelProps = useTabPanelProps(hasViews ? viewsId : undefined);

  // Sidebar dépliée par défaut, état mémorisé (D-016).
  const [collapsed, setCollapsed] = useStoredState("shell:sidebar-collapsed", false);
  const [overlay, setOverlay] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Panneau de détail : colonne mémorisée sur bureau (D-018), largeur réglable (D-025).
  const [detailOpen, setDetailOpen] = useStoredState("shell:detail-open", true);
  const [detailFloat, setDetailFloat] = useState(false);
  // Largeur réglée, mémorisée à part pour chaque largeur de départ (D-240) ; panneau large (D-241).
  const [detailWidth, setDetailWidth] = useStoredState<number | null>(detailKind === "form" ? "shell:detail-width:form" : "shell:detail-width", null);
  const [wideStored, setWide] = useStoredState("shell:detail-wide", false);
  const [sheet, setSheet] = useState(false);
  const floating = isMobile || isTablet;
  const showDetail = Boolean(detail) && (floating ? detailFloat : detailOpen);
  const wide = detailExpandable && !floating && wideStored;

  const toggleSidebar = () => {
    setOverlay(false);
    setCollapsed(!collapsed);
  };
  const toggleDetail = () => (floating ? setDetailFloat(!detailFloat) : setDetailOpen(!detailOpen));

  // Raccourcis (D-006) : Mod+B sidebar, Mod+. détail ; Échap ferme ce qui flotte.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "b" && !isMobile) {
        e.preventDefault();
        toggleSidebar();
      } else if (mod && e.key === "." && detail) {
        e.preventDefault();
        toggleDetail();
      } else if (e.key === "Escape") {
        if (overlay) setOverlay(false);
        else if (floating && detailFloat) setDetailFloat(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Overlay de la sidebar repliée : au survol du bouton, fermeture 250 ms après la sortie (D-017).
  // Tant que le focus clavier est dedans (menu « … » compris), il reste ouvert ;
  // il se ferme quand le focus en sort et que la souris est dehors.
  const overlayHover = useRef(false);
  const overlayFocus = useRef(false);
  const keyboardFocusInside = () => overlayFocus.current && Boolean(document.activeElement?.matches(":focus-visible"));
  const enterOverlay = () => {
    overlayHover.current = true;
    clearTimeout(closeTimer.current);
    if (collapsed && !isMobile) setOverlay(true);
  };
  const leaveOverlay = () => {
    overlayHover.current = false;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      if (!keyboardFocusInside()) setOverlay(false);
    }, OVERLAY_CLOSE_DELAY);
  };
  // Focus et blur React remontent aussi des portails : un menu ouvert depuis l'overlay compte comme dedans.
  const focusOverlay = () => {
    overlayFocus.current = true;
  };
  const blurOverlay = () => {
    overlayFocus.current = false;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      if (!overlayHover.current && !keyboardFocusInside()) setOverlay(false);
    }, 0);
  };
  useEffect(() => {
    if (!overlay) overlayFocus.current = false;
  }, [overlay]);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Barre d'onglets mobile : 4 entrées au plus, puis « Plus » (D-003, D-019).
  const nav = navItems(sidebar);
  const entries: TabbarEntry[] = (
    tabbar ?? (nav.some((n) => n.tabbar) ? nav.filter((n) => n.tabbar) : nav).map((n) => ({ id: n.id, label: n.label, icon: n.icon }))
  ).slice(0, 4);
  const hidden = new Set(entries.map((e) => e.id));

  const sidebarVisible = !isMobile && !collapsed;
  const winControls = platform === "windows";
  const macControls = platform === "macos";
  const dragRegion = platform === "web" ? {} : { "data-tauri-drag-region": "" };
  const width = detailWidth ?? undefined;

  return (
    <div className="relative box-border grid h-dvh max-h-full grid-rows-[var(--bar-h)_minmax(0,1fr)] overflow-hidden bg-surface font-sans text-md text-fg max-tablet:grid-rows-[var(--bar-h)_minmax(0,1fr)_auto]">
      {/* ---------- Barre supérieure ---------- */}
      <header className="flex min-w-0 border-b border-line" {...dragRegion}>
        <div
          className={cx(
            "flex shrink-0 items-center gap-0.5 px-2",
            sidebarVisible && "socle-side box-border w-(--side-w) border-r border-line bg-surface-side",
            macControls && "pl-[78px]",
          )}
          {...dragRegion}
        >
          {!isMobile && (
            <span onPointerEnter={enterOverlay} onPointerLeave={leaveOverlay}>
              <IconButton icon={<PanelLeft />} label={collapsed ? m.expandSidebar : m.collapseSidebar} shortcut="Mod+B" onPress={toggleSidebar} />
            </span>
          )}
          {history && !isMobile && (
            <>
              {sidebarVisible && <span className="flex-1" />}
              <IconButton icon={<ChevronLeft />} label={m.back} onPress={() => window.history.back()} />
              <IconButton icon={<ChevronRight />} label={m.forward} onPress={() => window.history.forward()} />
            </>
          )}
        </div>
        <div className={cx("flex min-w-0 flex-1 items-center gap-2 pr-2 pl-4 max-tablet:pl-2", winControls && "pr-[138px]")} {...dragRegion}>
          <h1 className="m-0 max-w-[40%] shrink-0 truncate text-md font-heading">{pageTitle}</h1>
          {pageStatus && <StatusIndicator status={pageStatus} />}
          {/* Annonce de l'état quand il apparaît ou change (D-252). */}
          <span role="status" className="sr-only">
            {pageStatus ? (pageStatus.description ? `${pageStatus.label} : ${pageStatus.description}` : pageStatus.label) : ""}
          </span>
          {pageSummary && (
            <>
              <span aria-hidden className="h-4 w-px shrink-0 bg-line max-tablet:hidden" />
              <span className="flex min-w-0 max-w-[min(320px,30%)] shrink-[2] text-sm text-fg-2 max-tablet:hidden">
                <OverflowTooltip text={pageSummary} />
              </span>
            </>
          )}
          {views && views.length > 0 && activeView && onViewChange && (
            <>
              <span aria-hidden className="h-4 w-px shrink-0 bg-line max-tablet:hidden" />
              <Tabs id={viewsId} pageTitle={pageTitle} items={views} selectedId={activeView} onSelectionChange={onViewChange} {...(onViewClose ? { onClose: onViewClose } : {})} />
            </>
          )}
          {/* Actions de la page (D-222) : le slot prend la place libre, sans dépendre de son contenu ;
              ActionBar y replie ses actions quand la place manque (D-221), avant les onglets de vues.
              Sa largeur minimale (--socle-fit-min) est posée par ActionBar : ce qui reste tout replié. */}
          <div data-socle-fit="" className="flex min-w-[var(--socle-fit-min,min-content)] flex-1 basis-0 items-center justify-end gap-0.5">
            {actions}
            {detail && detailExpandable && !floating && showDetail && (
              <IconButton icon={wide ? <Minimize /> : <Maximize />} label={m.expandDetail} isSelected={wide} onChange={setWide} />
            )}
            {detail && <IconButton icon={<ListDetail />} label={m.detailPanel} shortcut="Mod+." isSelected={showDetail} onChange={toggleDetail} />}
          </div>
        </div>
      </header>

      {/* ---------- Corps ---------- */}
      <div className="relative flex min-h-0 min-w-0">
        {/* Pas de repère `complementary` autour de la sidebar : son repère est la `navigation`
            nommée qu'elle contient (AppShell.spec.md, Accessibilité). */}
        {sidebarVisible && <div className="socle-side box-border w-(--side-w) shrink-0 border-r border-line">{sidebar}</div>}
        {overlay && collapsed && !isMobile && (
          <div
            onPointerEnter={enterOverlay}
            onPointerLeave={leaveOverlay}
            onFocus={focusOverlay}
            onBlur={blurOverlay}
            className="socle-side absolute top-0 bottom-0 left-0 z-40 box-border w-(--side-w) border-r border-line shadow-lg"
          >
            {sidebar}
          </div>
        )}
        {/* Panneau large : le contenu garde au moins 360 px (D-241). */}
        <main {...panelProps} className={cx("min-w-0 flex-1 overflow-auto", wide && showDetail && "min-w-[360px]")}>{children}</main>
        {detail && showDetail && (
          <DetailColumn
            floating={floating}
            fullscreen={isMobile}
            width={width}
            form={detailKind === "form"}
            wide={wide}
            onWidth={setDetailWidth}
            onClose={() => setDetailFloat(false)}
          >
            {detail}
          </DetailColumn>
        )}
      </div>

      {/* ---------- Barre d'onglets mobile (D-003) ---------- */}
      {isMobile && (
        <nav aria-label={m.mainNavigation} className="flex border-t border-line bg-surface-side px-1.5 py-1">
          {entries.map((e) => {
            const on = sidebar.props.selectedId === e.id;
            return (
              <Button
                key={e.id}
                onPress={() => sidebar.props.onSelectionChange(e.id)}
                aria-current={on ? "page" : false}
                className={cx(buttonReset, "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-md text-xs", on ? "text-fg" : "text-fg-2", focusRing)}
              >
                <span className="inline-grid size-5 place-items-center [&>svg]:size-5">{e.icon}</span>
                {e.label}
              </Button>
            );
          })}
          <Button onPress={() => setSheet(true)} className={cx(buttonReset, "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-md text-xs text-fg-2", focusRing)}>
            <MoreHorizontal size={20} />
            {m.more}
          </Button>
        </nav>
      )}
      {/* Feuille « Plus » : le reste de la navigation, sans doublons (D-019). */}
      <ModalOverlay isOpen={sheet} onOpenChange={setSheet} isDismissable className="fixed inset-0 z-50 bg-scrim">
        <Modal className="socle-side absolute inset-x-0 top-[16%] bottom-0 overflow-hidden rounded-t-[16px] border border-b-0 border-line bg-surface-side shadow-lg">
          <AriaDialog aria-label={m.more} className="flex h-full flex-col outline-none">
            <span aria-hidden className="mx-auto mt-2 block h-1 w-9 shrink-0 rounded-full bg-fg-3 opacity-50" />
            <div className="min-h-0 flex-1">
              <HiddenNavIds.Provider value={hidden}>{sidebar}</HiddenNavIds.Provider>
            </div>
          </AriaDialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}

/** Indicateur d'état de la page : cadre de 24 px, point du ton et libellé (D-251). */
function StatusIndicator({ status }: { status: PageStatus }) {
  const frame = "inline-flex h-6 max-w-40 min-w-0 shrink-0 items-center rounded-md border border-line bg-surface px-2 max-tablet:max-w-30";
  const content = <Badge tone={status.tone ?? "neutral"}>{status.label}</Badge>;
  const name = status.description ? `${status.label} : ${status.description}` : status.label;
  if (status.menu) {
    return (
      <DropdownMenu
        label={status.label}
        placement="bottom start"
        trigger={
          <Button aria-label={name} className={cx(buttonReset, frame, "cursor-default data-hovered:bg-hover data-pressed:bg-hover", focusRing)}>
            {content}
          </Button>
        }
      >
        {status.menu}
      </DropdownMenu>
    );
  }
  if (!status.description) return <span className={frame}>{content}</span>;
  return (
    <Tooltip content={status.description} placement="bottom">
      <Focusable>
        <span tabIndex={0} aria-label={name} role="img" className={cx(frame, "cursor-default outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus focus-visible:outline-solid")}>
          {content}
        </span>
      </Focusable>
    </Tooltip>
  );
}

/** Panneau de détail : colonne réglable sur bureau, overlay sur tablette, plein écran sur mobile (D-018, D-025). */
function DetailColumn({ floating, fullscreen, width, form, wide, onWidth, onClose, children }: {
  floating: boolean;
  fullscreen: boolean;
  width: number | undefined;
  form: boolean;
  wide: boolean;
  onWidth: (w: number | null) => void;
  onClose: () => void;
  children: ReactNode;
}) {
  const m = useMessages();
  const ref = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  // Overlay (tablette) et plein écran (mobile) : le panneau est modal pour le focus (motif dialog WAI-ARIA).
  // À l'ouverture, le focus va sur le titre du panneau ; à la fermeture (Échap, ×), il revient
  // à l'élément qui l'a ouvert. Sans animation (D-026). Sur bureau, la colonne n'est pas modale.
  useLayoutEffect(() => {
    if (!floating) return;
    const panel = ref.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    titleRef.current?.focus();
    return () => {
      // Le focus ne revient que s'il était dans le panneau (ou perdu) : on ne le vole pas ailleurs.
      const active = document.activeElement;
      const lost = !active || active === document.body || Boolean(panel?.contains(active));
      if (lost && opener?.isConnected) opener.focus();
    };
  }, [floating]);
  // Tab et Maj+Tab restent dans le panneau tant qu'il flotte.
  const trapTab = (e: ReactKeyboardEvent) => {
    const panel = ref.current;
    if (!floating || e.key !== "Tab" || !panel || !(e.target instanceof Node) || !panel.contains(e.target)) return;
    const list = tabbables(panel);
    const first = list[0];
    const last = list[list.length - 1];
    if (!first || !last) return;
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === titleRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };
  const current = () => ref.current?.getBoundingClientRect().width ?? DETAIL_MIN;
  const clamp = (w: number) => Math.round(Math.min(DETAIL_MAX, Math.max(DETAIL_MIN, w)));
  const startDrag = (e: ReactPointerEvent) => {
    e.preventDefault();
    const x0 = e.clientX;
    const w0 = current();
    const move = (ev: PointerEvent) => onWidth(clamp(w0 + (x0 - ev.clientX)));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return (
    <aside
      ref={ref}
      aria-label={m.detail}
      onKeyDown={trapTab}
      style={!floating && !wide && width ? { width } : undefined}
      data-width={wide ? "wide" : form ? "form" : "default"}
      className={cx(
        "box-border flex min-h-0 flex-col border-l border-line bg-surface",
        !floating && !wide && cx("relative shrink-0", form ? "w-(--detail-w-form)" : "w-(--detail-w)"),
        // Large : 960 px au plus ; il rétrécit pour laisser 360 px au contenu (D-241).
        !floating && wide && "relative w-[960px] min-w-(--detail-w) shrink",
        floating && !fullscreen && cx("absolute top-0 right-0 bottom-0 z-40 max-w-full shadow-lg", form ? "w-(--detail-w-form)" : "w-(--detail-w)"),
        fullscreen && "absolute inset-0 z-40 border-l-0",
      )}
    >
      {!floating && !wide && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={m.detailWidth}
          aria-valuemin={DETAIL_MIN}
          aria-valuemax={DETAIL_MAX}
          aria-valuenow={Math.round(width ?? current())}
          tabIndex={0}
          onPointerDown={startDrag}
          onDoubleClick={() => onWidth(null)}
          onKeyDown={(e) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            onWidth(clamp(current() + (e.key === "ArrowLeft" ? 16 : -16)));
          }}
          className="absolute top-0 bottom-0 -left-[3px] z-10 w-1.5 cursor-col-resize outline-none hover:bg-line focus-visible:bg-focus"
        />
      )}
      {floating && (
        <div className="flex h-(--bar-h) shrink-0 items-center border-b border-line pr-2 pl-4 font-heading">
          <span ref={titleRef} tabIndex={-1} className="flex-1 outline-none">
            {m.detail}
          </span>
          <IconButton icon={<X />} label={m.closeDetail} onPress={onClose} />
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </aside>
  );
}
