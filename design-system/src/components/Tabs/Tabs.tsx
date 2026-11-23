/*
 * Adapté du starter Tailwind de React Aria (adobe/react-spectrum, starters/tailwind),
 * licence Apache 2.0. Spec : Tabs.spec.md.
 */
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from "react";
import { Tab, TabList, Tabs as RACTabs } from "react-aria-components/Tabs";
import { Button } from "react-aria-components/Button";
import { Dialog, DialogTrigger } from "react-aria-components/Dialog";
import { GridList, GridListItem } from "react-aria-components/GridList";
import { Popover } from "react-aria-components/Popover";
import { useMessages, useSocle } from "../../provider/SocleProvider";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { Check, ChevronDown, X } from "../../icons";
import { IconButton } from "../IconButton/IconButton";
import { itemClass, popoverClass } from "../Menu/Menu";
import { OverflowTooltip } from "../Tooltip/OverflowTooltip";

export interface TabItem {
  id: string;
  label: string;
  /** Vue ouverte depuis un élément : elle se ferme (D-021). Les vues de la page sont fixes. */
  closable?: boolean;
}

export interface TabsProps {
  /** Vues de la page (D-021). */
  items: TabItem[];
  selectedId: string;
  onSelectionChange: (id: string) => void;
  /** Fermeture d'une vue fermable. */
  onClose?: (id: string) => void;
  /** Nom de la page, pour le nom accessible : « Vues de la page Documents ». */
  pageTitle: string;
  /**
   * Relie les onglets à la zone de contenu : même valeur que `tabs` sur `TabPanel`.
   * Sans lui, pas de lien `aria-controls` / `aria-labelledby`.
   */
  id?: string;
}

/*
 * Lien entre Tabs et TabPanel (rôle `tabpanel`, Tabs.spec.md). Les onglets sont dans la
 * barre supérieure et le contenu dans `main` : pas de parent commun pour un contexte.
 * Tabs publie les identifiants que React Aria donne à l'onglet actif (son `id` et son
 * `aria-controls`) ; TabPanel les reprend.
 */
interface PanelLink {
  tab: string;
  panel: string;
}
const links = new Map<string, PanelLink>();
const listeners = new Set<() => void>();
function publish(key: string, link: PanelLink | undefined) {
  const old = links.get(key);
  if (old?.tab === link?.tab && old?.panel === link?.panel) return;
  if (link) links.set(key, link);
  else links.delete(key);
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export interface TabPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "role" | "id" | "aria-labelledby"> {
  /** Valeur de `id` sur le `Tabs` qui pilote ce contenu. */
  tabs: string;
}

/**
 * Attributs de la zone de contenu de la vue active (rôle `tabpanel`, nommée par l'onglet
 * actif), à poser sur l'élément qui l'affiche. Sans `tabs`, ne rend rien.
 */
export function useTabPanelProps(tabs: string | undefined): HTMLAttributes<HTMLElement> {
  const link = useSyncExternalStore(subscribe, () => (tabs ? links.get(tabs) : undefined), () => undefined);
  if (!tabs) return {};
  return { role: "tabpanel", ...(link ? { id: link.panel, "aria-labelledby": link.tab } : {}) };
}

/** Zone de contenu de la vue active, quand l'app n'a pas d'élément à elle où poser `useTabPanelProps`. */
export function TabPanel({ tabs, children, ...rest }: TabPanelProps) {
  return (
    <div {...rest} {...useTabPanelProps(tabs)}>
      {children}
    </div>
  );
}

/** Onglet : rayon 8 px (D-040), fond plein fixe quand il est actif (D-038, D-039). */
const tabClass = cx(
  "group relative flex h-[calc(var(--row-h)-4px)] max-w-[200px] shrink-0 cursor-default items-center rounded-md pl-2.5 text-md text-fg-2 select-none",
  "data-hovered:bg-hover data-hovered:text-fg",
  "data-selected:bg-selected data-selected:text-fg data-selected:data-hovered:bg-selected",
  focusRing,
  "data-focus-visible:-outline-offset-2",
);

export function Tabs({ items, selectedId, onSelectionChange, onClose, pageTitle, id }: TabsProps) {
  const { isMac } = useSocle();
  const m = useMessages();
  const listRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);

  // Débordement : la rangée défile et le chevron apparaît (D-027).
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const update = () => setOverflow(el.scrollWidth > el.clientWidth + 1);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  // Publie l'onglet actif pour TabPanel : son id et le contenu qu'il contrôle.
  // React Aria rend les onglets après un premier passage : on suit le DOM de la liste.
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!id || !el) return;
    const sync = () => {
      const tab = el.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      const panel = tab?.getAttribute("aria-controls");
      publish(id, tab?.id && panel ? { tab: tab.id, panel } : undefined);
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-selected", "aria-controls", "id"] });
    return () => {
      mo.disconnect();
      publish(id, undefined);
    };
  }, [id]);

  // L'onglet actif reste toujours visible (D-027).
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selectedId]);

  // Mod+1 à 9 : vue de même rang (D-021).
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (!(isMac ? e.metaKey : e.ctrlKey) || e.altKey || e.shiftKey || !/^[1-9]$/.test(e.key)) return;
      const item = items[Number(e.key) - 1];
      if (item) {
        e.preventDefault();
        onSelectionChange(item.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, isMac, onSelectionChange]);

  // React Aria garde en cache le rendu des onglets : le × lit toujours l'état le plus récent.
  const latest = useRef({ items, selectedId, onSelectionChange, onClose });
  latest.current = { items, selectedId, onSelectionChange, onClose };
  const close = (id: string) => {
    const { items, selectedId, onSelectionChange, onClose } = latest.current;
    const i = items.findIndex((t) => t.id === id);
    const item = items[i];
    if (!item?.closable || !onClose) return;
    if (id === selectedId) {
      const next = items[i - 1] ?? items[i + 1];
      if (next) onSelectionChange(next.id);
    }
    onClose(id);
  };

  const tabIdFromEvent = (e: { target: EventTarget }) =>
    (e.target as HTMLElement).closest('[role="tab"]')?.querySelector<HTMLElement>("[data-tab-id]")?.dataset.tabId;
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Delete" && e.key !== "Backspace") return;
    const id = tabIdFromEvent(e);
    if (id) {
      e.preventDefault();
      close(id);
    }
  };
  const onAuxClick = (e: MouseEvent) => {
    if (e.button !== 1) return;
    const id = tabIdFromEvent(e);
    if (id) close(id);
  };

  const current = items.find((t) => t.id === selectedId);
  const viewList = (trigger: ReactElement, placement: "bottom end" | "bottom start") => (
    <ViewList trigger={trigger} placement={placement} items={items} selectedId={selectedId} onSelect={onSelectionChange} onClose={close} />
  );

  return (
    <div className="flex min-w-0 items-center gap-1">
      {/* Bureau et tablette : rangée d'onglets */}
      <RACTabs
        selectedKey={selectedId}
        onSelectionChange={(k) => onSelectionChange(String(k))}
        keyboardActivation="automatic"
        className="flex min-w-0 max-tablet:hidden"
      >
        {/* Suppr ou Retour arrière, et clic du milieu, ferment une vue fermable (Tabs.spec.md). */}
        <div className="flex min-w-0" onKeyDownCapture={onKeyDown} onAuxClick={onAuxClick}>
        <TabList
          ref={listRef}
          aria-label={m.viewsOf(pageTitle)}
          items={items}
          className="flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]"
        >
          {(t) => (
            <Tab id={t.id} className={cx(tabClass, t.closable ? "pr-1" : "pr-2.5")}>
              <span data-tab-id={t.id} className="contents">
                <OverflowTooltip text={t.label} />
              </span>
              {t.closable && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={m.closeView(t.label)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    close(t.id);
                  }}
                  className={cx(
                    buttonReset,
                    "ml-0.5 inline-grid size-5 shrink-0 place-items-center rounded-sm text-fg-2 hover:bg-field hover:text-fg",
                    // × au survol, au focus et sur l'onglet actif ; place réservée (D-041).
                    "invisible group-data-hovered:visible group-data-focus-visible:visible group-data-selected:visible",
                  )}
                >
                  <X size={12} />
                </button>
              )}
            </Tab>
          )}
        </TabList>
        </div>
      </RACTabs>
      {overflow && (
        <span className="max-tablet:hidden">{viewList(<IconButton icon={<ChevronDown />} label={m.allViews} />, "bottom end")}</span>
      )}
      {/* Mobile : le titre de la vue ouvre la liste des vues (D-021, D-027) */}
      <span className="hidden min-w-0 max-tablet:inline-flex">
        {viewList(
          <Button aria-label={m.currentView(current?.label ?? "")} className={cx(buttonReset, "flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 font-medium text-fg", focusRing)}>
            <span className="truncate">{current?.label}</span>
            <ChevronDown size={12} className="shrink-0 text-fg-3" />
          </Button>,
          "bottom start",
        )}
      </span>
    </div>
  );
}

/** Liste de toutes les vues, avec le × des vues fermables (D-027). */
function ViewList({ trigger, placement, items, selectedId, onSelect, onClose }: {
  trigger: ReactElement;
  placement: "bottom end" | "bottom start";
  items: TabItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}) {
  const [listOpen, setListOpen] = useState(false);
  const m = useMessages();
  const close = onClose;
  const onSelectionChange = onSelect;
  return (
    <DialogTrigger isOpen={listOpen} onOpenChange={setListOpen}>
      {trigger}
      <Popover placement={placement} offset={4} containerPadding={8} className={popoverClass}>
        <Dialog aria-label={m.allViews} className="outline-none">
          <div
            onKeyDownCapture={(e: KeyboardEvent) => {
              if (e.key !== "Delete" && e.key !== "Backspace") return;
              const id = (e.target as HTMLElement).closest('[role="row"]')?.querySelector<HTMLElement>("[data-view-id]")?.dataset.viewId;
              if (id) {
                e.preventDefault();
                close(id);
              }
            }}
          >
          <GridList
            aria-label={m.allViews}
            items={items}
            selectionMode="single"
            selectionBehavior="replace"
            disallowEmptySelection
            selectedKeys={[selectedId]}
            onSelectionChange={(keys) => {
              const id = keys === "all" ? undefined : [...keys][0];
              if (id !== undefined) onSelectionChange(String(id));
              setListOpen(false);
            }}
            className="outline-none"
          >
            {(t) => (
              <GridListItem id={t.id} textValue={t.label} className={cx(itemClass, "group pr-1 data-hovered:bg-hover data-focus-visible:bg-hover")}>
                {({ isSelected }) => (
                  <>
                    <span data-view-id={t.id} className="min-w-0 flex-1 truncate">{t.label}</span>
                    <span className="inline-grid w-4 shrink-0 place-items-center">{isSelected && <Check />}</span>
                    {t.closable && (
                      <Button
                        aria-label={m.closeView(t.label)}
                        onPress={() => close(t.id)}
                        className={cx(buttonReset, "inline-grid size-5 shrink-0 place-items-center rounded-sm text-fg-2 data-hovered:bg-selected data-hovered:text-fg", focusRing)}
                      >
                        <X size={12} />
                      </Button>
                    )}
                  </>
                )}
              </GridListItem>
            )}
          </GridList>
          </div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
