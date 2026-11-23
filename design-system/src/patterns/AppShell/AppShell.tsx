/*
 * Cadre commun de toutes les apps. Spec : AppShell.spec.md.
 * Décisions : D-003, D-016 à D-021, D-025 à D-027, D-220 à D-222.
 */
import { Children, isValidElement, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactElement, type ReactNode } from "react";
import { Button } from "react-aria-components/Button";
import { Dialog } from "react-aria-components/Dialog";
import { Modal, ModalOverlay } from "react-aria-components/Modal";
import { useMessages, useSocle, useStoredState } from "../../provider/SocleProvider";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { ChevronLeft, ChevronRight, ListDetail, MoreHorizontal, PanelLeft, X } from "../../icons";
import { IconButton } from "../../components/IconButton/IconButton";
import { Tabs, type TabItem } from "../../components/Tabs/Tabs";
import { HiddenNavIds, Sidebar, type SidebarItemProps, type SidebarProps } from "../Sidebar/Sidebar";

export interface TabbarEntry {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface AppShellProps {
  /** Nom de la page, dans la barre supérieure. */
  pageTitle: string;
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
  /** Entrées de la barre d'onglets mobile (4 au plus). Défaut : éléments `tabbar` de la sidebar, sinon les 4 premiers (D-003, D-019). */
  tabbar?: TabbarEntry[];
  /** Affiche précédent/suivant. */
  history?: boolean;
  /** Le gabarit de la page. */
  children: ReactNode;
}

const DETAIL_MIN = 240;
const DETAIL_MAX = 480;
const OVERLAY_CLOSE_DELAY = 250;

function navItems(sidebar: ReactElement<SidebarProps>): SidebarItemProps[] {
  const out: SidebarItemProps[] = [];
  Children.forEach(sidebar.props.children, (child) => {
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

export function AppShell({ pageTitle, views, activeView, onViewChange, onViewClose, actions, sidebar, detail, tabbar, history = true, children }: AppShellProps) {
  const { isMac, platform } = useSocle();
  const m = useMessages();
  const isMobile = useMedia("(max-width: 640px)");
  const isTablet = useMedia("(min-width: 641px) and (max-width: 1024px)");

  // Sidebar dépliée par défaut, état mémorisé (D-016).
  const [collapsed, setCollapsed] = useStoredState("shell:sidebar-collapsed", false);
  const [overlay, setOverlay] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Panneau de détail : colonne mémorisée sur bureau (D-018), largeur réglable (D-025).
  const [detailOpen, setDetailOpen] = useStoredState("shell:detail-open", true);
  const [detailFloat, setDetailFloat] = useState(false);
  const [detailWidth, setDetailWidth] = useStoredState<number | null>("shell:detail-width", null);
  const [sheet, setSheet] = useState(false);
  const floating = isMobile || isTablet;
  const showDetail = Boolean(detail) && (floating ? detailFloat : detailOpen);

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
  const enterOverlay = () => {
    clearTimeout(closeTimer.current);
    if (collapsed && !isMobile) setOverlay(true);
  };
  const leaveOverlay = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOverlay(false), OVERLAY_CLOSE_DELAY);
  };
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
            sidebarVisible && "box-border w-(--side-w) border-r border-line bg-surface-side",
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
          <h1 className="m-0 max-w-[40%] shrink-0 truncate text-md font-semibold">{pageTitle}</h1>
          {views && views.length > 0 && activeView && onViewChange && (
            <>
              <span aria-hidden className="h-4 w-px shrink-0 bg-line max-tablet:hidden" />
              <Tabs pageTitle={pageTitle} items={views} selectedId={activeView} onSelectionChange={onViewChange} {...(onViewClose ? { onClose: onViewClose } : {})} />
            </>
          )}
          {/* Actions de la page (D-222) : le slot prend la place libre, sans dépendre de son contenu ;
              ActionBar y replie ses actions quand la place manque (D-221), avant les onglets de vues.
              Sa largeur minimale (--socle-fit-min) est posée par ActionBar : ce qui reste tout replié. */}
          <div data-socle-fit="" className="flex min-w-[var(--socle-fit-min,min-content)] flex-1 basis-0 items-center justify-end gap-0.5">
            {actions}
            {detail && <IconButton icon={<ListDetail />} label={m.detailPanel} shortcut="Mod+." isSelected={showDetail} onChange={toggleDetail} />}
          </div>
        </div>
      </header>

      {/* ---------- Corps ---------- */}
      <div className="relative flex min-h-0 min-w-0">
        {sidebarVisible && <aside className="box-border w-(--side-w) shrink-0 border-r border-line">{sidebar}</aside>}
        {overlay && collapsed && !isMobile && (
          <aside
            onPointerEnter={enterOverlay}
            onPointerLeave={leaveOverlay}
            className="absolute top-0 bottom-0 left-0 z-40 box-border w-(--side-w) border-r border-line shadow-lg"
          >
            {sidebar}
          </aside>
        )}
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
        {detail && showDetail && (
          <DetailColumn
            floating={floating}
            fullscreen={isMobile}
            width={width}
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
        <Modal className="absolute inset-x-0 top-[16%] bottom-0 overflow-hidden rounded-t-[16px] border border-b-0 border-line bg-surface-side shadow-lg">
          <Dialog aria-label={m.more} className="flex h-full flex-col outline-none">
            <span aria-hidden className="mx-auto mt-2 block h-1 w-9 shrink-0 rounded-full bg-fg-3 opacity-50" />
            <div className="min-h-0 flex-1">
              <HiddenNavIds.Provider value={hidden}>{sidebar}</HiddenNavIds.Provider>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}

/** Panneau de détail : colonne réglable sur bureau, overlay sur tablette, plein écran sur mobile (D-018, D-025). */
function DetailColumn({ floating, fullscreen, width, onWidth, onClose, children }: {
  floating: boolean;
  fullscreen: boolean;
  width: number | undefined;
  onWidth: (w: number | null) => void;
  onClose: () => void;
  children: ReactNode;
}) {
  const m = useMessages();
  const ref = useRef<HTMLElement>(null);
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
      style={!floating && width ? { width } : undefined}
      className={cx(
        "box-border flex min-h-0 flex-col border-l border-line bg-surface",
        !floating && "relative w-(--detail-w) shrink-0",
        floating && !fullscreen && "absolute top-0 right-0 bottom-0 z-40 w-(--detail-w) shadow-lg",
        fullscreen && "absolute inset-0 z-40 border-l-0",
      )}
    >
      {!floating && (
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
          className="absolute top-0 bottom-0 -left-[3px] z-10 w-1.5 cursor-col-resize outline-none hover:bg-line focus-visible:bg-accent"
        />
      )}
      {floating && (
        <div className="flex h-(--bar-h) shrink-0 items-center border-b border-line pr-2 pl-4 font-semibold">
          <span className="flex-1">{m.detail}</span>
          <IconButton icon={<X />} label={m.closeDetail} onPress={onClose} />
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </aside>
  );
}
