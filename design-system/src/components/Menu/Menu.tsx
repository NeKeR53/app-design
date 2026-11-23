/*
 * Adapté du starter Tailwind de React Aria (adobe/react-spectrum, starters/tailwind),
 * licence Apache 2.0. Spec : Menu.spec.md.
 */
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import type { Key } from "react-aria-components";
import {
  Header,
  Menu as RACMenu,
  MenuItem as RACMenuItem,
  MenuSection as RACMenuSection,
  MenuTrigger,
  Separator,
  SubmenuTrigger,
} from "react-aria-components/Menu";
import { Popover } from "react-aria-components/Popover";
import { useMessages, useSocle } from "../../provider/SocleProvider";
import { cx } from "../../lib/cx";
import { ariaShortcut, formatShortcut } from "../../lib/shortcut";
import { Check, ChevronRight } from "../../icons";

/* ---------- Contexte : un menu réserve la colonne d'icônes si un de ses éléments en a une (D-047) ---------- */
const IconColumn = createContext(false);

function hasIcon(children: ReactNode): boolean {
  let found = false;
  Children.forEach(children, (child) => {
    if (found || !isValidElement<{ icon?: ReactNode; children?: ReactNode }>(child)) return;
    if (child.props.icon) found = true;
    else if (child.props.children && typeof child.props.children !== "string") found = hasIcon(child.props.children);
  });
  return found;
}

/** Styles partagés avec les listes flottantes de Socle (liste des vues de Tabs). */
export const popoverClass =
  "min-w-[200px] max-w-[320px] overflow-auto rounded-lg border border-line bg-surface-raised p-1 font-sans text-md text-fg shadow-md outline-none";

export const itemClass = cx(
  "flex h-(--row-h) cursor-default items-center gap-2 rounded-md px-2.5 outline-none select-none",
  "data-focused:bg-hover data-open:bg-hover data-disabled:opacity-40",
);

/* ---------- Menu ---------- */
/** Point d'ouverture d'un menu contextuel, en coordonnées de la fenêtre. */
export interface MenuPoint {
  x: number;
  y: number;
}

export interface MenuProps {
  /** Bouton qui ouvre le menu, le plus souvent un `IconButton`. Inutile avec `anchor`. */
  trigger?: ReactElement;
  /** Nom accessible du menu. */
  label: string;
  /** Titre en tête du menu : l'objet visé (D-327). */
  title?: string;
  /** Côté préféré ; il change si la place manque. */
  placement?: "bottom start" | "bottom end" | "top start" | "top end";
  /** Ancre sans bouton : un point (clic droit) ou un élément (D-327). Avec `isOpen` et `onOpenChange`. */
  anchor?: MenuPoint | RefObject<Element | null>;
  /** Ouverture pilotée par l'app. */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** `Menu.Item`, `Menu.Section`, `Menu.Separator`, `Menu.Submenu`. */
  children: ReactNode;
}

function isPoint(anchor: MenuProps["anchor"]): anchor is MenuPoint {
  return Boolean(anchor) && typeof (anchor as MenuPoint).x === "number";
}

function MenuBody({ label, title, children, onClose }: { label: string; title?: string | undefined; children: ReactNode; onClose?: () => void }) {
  return (
    <IconColumn.Provider value={hasIcon(children)}>
      {title && <div className="truncate px-2.5 pt-1.5 pb-0.5 text-sm text-fg-3">{title}</div>}
      <RACMenu aria-label={label} className="outline-none" {...(onClose ? { onClose, autoFocus: "first" as const } : {})}>
        {children}
      </RACMenu>
    </IconColumn.Provider>
  );
}

export function Menu({ trigger, label, title, placement = "bottom start", anchor, isOpen, onOpenChange, children }: MenuProps) {
  if (anchor) {
    return (
      <AnchoredMenu label={label} title={title} placement={placement} anchor={anchor} isOpen={isOpen ?? false} onOpenChange={onOpenChange}>
        {children}
      </AnchoredMenu>
    );
  }
  return (
    <MenuTrigger {...(isOpen !== undefined ? { isOpen } : {})} {...(onOpenChange ? { onOpenChange } : {})}>
      {trigger}
      <Popover placement={placement} offset={4} containerPadding={8} className={popoverClass}>
        <MenuBody label={label} title={title}>
          {children}
        </MenuBody>
      </Popover>
    </MenuTrigger>
  );
}

/** Menu ouvert sans bouton, à un point ou contre un élément (D-327). */
function AnchoredMenu({
  label,
  title,
  placement,
  anchor,
  isOpen,
  onOpenChange,
  children,
}: Required<Pick<MenuProps, "label" | "placement" | "anchor" | "isOpen">> & Pick<MenuProps, "children"> & { title: string | undefined; onOpenChange: MenuProps["onOpenChange"] }) {
  const pointRef = useRef<HTMLSpanElement>(null);
  const point = isPoint(anchor) ? anchor : null;
  const close = useRef(onOpenChange);
  close.current = onOpenChange;

  // Ouvert à un point : un défilement ou un redimensionnement lui fait perdre son sens ; il se ferme (D-327).
  useEffect(() => {
    if (!isOpen || !point) return;
    const shut = (e: Event) => {
      if (e.type === "scroll" && e.target instanceof Element && e.target.closest("[role=menu]")) return;
      close.current?.(false);
    };
    window.addEventListener("scroll", shut, true);
    window.addEventListener("resize", shut);
    return () => {
      window.removeEventListener("scroll", shut, true);
      window.removeEventListener("resize", shut);
    };
  }, [isOpen, point]);

  const triggerRef = (point ? pointRef : anchor) as RefObject<Element | null>;
  return (
    <>
      {point &&
        isOpen &&
        createPortal(<span ref={pointRef} aria-hidden className="pointer-events-none fixed size-0" style={{ left: point.x, top: point.y }} />, document.body)}
      {(!point || isOpen) && (
        <Popover
          triggerRef={triggerRef}
          isOpen={isOpen}
          onOpenChange={(open) => onOpenChange?.(open)}
          placement={placement}
          offset={point ? 0 : 4}
          containerPadding={8}
          className={popoverClass}
        >
          <MenuBody label={label} title={title} onClose={() => onOpenChange?.(false)}>
            {children}
          </MenuBody>
        </Popover>
      )}
    </>
  );
}

/* ---------- Appui long sur tactile (D-007) ---------- */
const LONG_PRESS_MS = 500;
const LONG_PRESS_SLOP = 8;

export interface LongPressProps {
  onPointerDownCapture: (e: PointerEvent<Element>) => void;
  onPointerMoveCapture: (e: PointerEvent<Element>) => void;
  onPointerUpCapture: () => void;
  onPointerCancelCapture: () => void;
  onClickCapture: (e: MouseEvent<Element>) => void;
}

/**
 * Appui long au doigt ou au stylet : 500 ms sans bouger de plus de 8 px.
 * iOS Safari n'envoie pas `contextmenu` : cet appui long le remplace.
 * `onLongPress` rend `false` s'il n'a rien ouvert ; sinon l'appui en cours est annulé
 * (pas de sélection ni de clic au relâcher).
 */
export function useTouchLongPress(onLongPress: (target: Element, point: MenuPoint) => boolean | void): LongPressProps {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const start = useRef<MenuPoint | null>(null);
  const swallowClick = useRef(false);
  useEffect(() => () => clearTimeout(timer.current), []);
  const cancel = () => {
    clearTimeout(timer.current);
    start.current = null;
  };
  return {
    onPointerDownCapture: (e) => {
      cancel();
      swallowClick.current = false;
      // Souris exclue ; un appui venu d'un portail (le menu ouvert) ne compte pas.
      if (e.pointerType === "mouse" || e.button !== 0 || !e.currentTarget.contains(e.target as Node)) return;
      const point = { x: e.clientX, y: e.clientY };
      const target = e.target as Element;
      const { pointerId, pointerType } = e;
      start.current = point;
      timer.current = setTimeout(() => {
        start.current = null;
        if (onLongPress(target, point) === false) return;
        swallowClick.current = true;
        // Annule l'appui React Aria en cours : le relâcher ne sélectionne pas la ligne.
        target.ownerDocument.dispatchEvent(new globalThis.PointerEvent("pointercancel", { bubbles: true, pointerId, pointerType }));
      }, LONG_PRESS_MS);
    },
    onPointerMoveCapture: (e) => {
      const s = start.current;
      if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > LONG_PRESS_SLOP) cancel();
    },
    onPointerUpCapture: cancel,
    onPointerCancelCapture: cancel,
    onClickCapture: (e) => {
      if (!swallowClick.current) return;
      swallowClick.current = false;
      e.preventDefault();
      e.stopPropagation();
    },
  };
}

/** Maj+F10 ou la touche Menu (D-327). */
export const isContextMenuKey = (e: KeyboardEvent<Element>) => (e.key === "F10" && e.shiftKey) || e.key === "ContextMenu";

export interface RowMenuProps extends LongPressProps {
  onContextMenu: (e: MouseEvent<Element>) => void;
}

/**
 * Menu « … » d'une ligne (D-066) : clic droit, appui long, et `onKey` pour Maj+F10 ou la touche Menu.
 * Cherche le déclencheur `selector` dans la ligne (`role="row"`) visée et le presse.
 */
export function useRowMenu(selector = "[data-row-menu]"): { rowMenuProps: RowMenuProps; onKey: (e: KeyboardEvent<Element>) => boolean } {
  const open = (from: EventTarget | null) => {
    const row = from instanceof Element ? from.closest('[role="row"]') : null;
    const trigger = row?.querySelector<HTMLElement>(selector);
    if (!trigger) return false;
    // Déjà ouvert (Android envoie aussi `contextmenu` après un appui long) : on ne le referme pas.
    if (trigger.getAttribute("aria-expanded") !== "true") trigger.click();
    return true;
  };
  const longPress = useTouchLongPress((target) => open(target));
  return {
    rowMenuProps: {
      ...longPress,
      onContextMenu: (e) => {
        if (open(e.target)) e.preventDefault();
      },
    },
    onKey: (e) => {
      if (!isContextMenuKey(e) || !open(e.target)) return false;
      e.preventDefault();
      e.stopPropagation();
      // Ouvert au clavier, le menu doit avoir le focus (Échap le ferme) : si la ligne l'a
      // repris, on le rend à la première entrée.
      const doc = (e.target as Element).ownerDocument;
      requestAnimationFrame(() => {
        if (doc.activeElement?.closest('[role="menu"]')) return;
        doc.querySelector<HTMLElement>('[role="menu"] [role="menuitem"]:not([aria-disabled="true"])')?.focus();
      });
      return true;
    },
  };
}

/* ---------- Menu contextuel : clic droit, appui long, Maj+F10, touche Menu (D-327, D-007) ---------- */
export interface ContextMenuTargetProps extends LongPressProps {
  onContextMenu: (e: MouseEvent<Element>) => void;
  onKeyDown: (e: KeyboardEvent<Element>) => void;
}

export interface ContextMenuState {
  /** À poser sur la zone : clic droit, appui long, Maj+F10 et touche Menu ouvrent le menu. */
  targetProps: ContextMenuTargetProps;
  /** À poser sur `Menu` : `anchor`, `isOpen`, `onOpenChange`. */
  menuProps: { anchor: MenuPoint; isOpen: boolean; onOpenChange: (isOpen: boolean) => void };
  /** Vrai quand le menu est ouvert. */
  isOpen: boolean;
}

/**
 * Branche un menu contextuel sur une zone : le menu s'ouvre au point du clic droit ou de l'appui long,
 * ou sous la zone avec Maj+F10 ou la touche Menu (D-327, D-007).
 */
export function useContextMenu(): ContextMenuState {
  const [point, setPoint] = useState<MenuPoint | null>(null);
  const longPress = useTouchLongPress((_, p) => setPoint(p));
  return {
    targetProps: {
      ...longPress,
      onContextMenu: (e) => {
        e.preventDefault();
        setPoint({ x: e.clientX, y: e.clientY });
      },
      onKeyDown: (e) => {
        if (!isContextMenuKey(e)) return;
        e.preventDefault();
        const r = e.currentTarget.getBoundingClientRect();
        setPoint({ x: r.left + 8, y: r.bottom });
      },
    },
    menuProps: { anchor: point ?? { x: 0, y: 0 }, isOpen: point !== null, onOpenChange: (open) => !open && setPoint(null) },
    isOpen: point !== null,
  };
}

/* ---------- Élément ---------- */
export interface MenuItemProps {
  label: string;
  /** Identifiant, obligatoire dans une section de choix. */
  id?: Key;
  onAction?: () => void;
  /** Icône facultative ; place réservée si une autre icône existe dans le menu (D-047). */
  icon?: ReactNode;
  /** Raccourci affiché à droite, par exemple "Mod+N" (D-048). */
  shortcut?: string;
  /** Action destructrice : rouge, à placer en dernier après un séparateur (D-049). */
  danger?: boolean;
  isDisabled?: boolean;
}

function ItemContent({ icon, label, shortcut, isSelected, selectable, hasSubmenu, danger }: {
  icon?: ReactNode;
  danger?: boolean | undefined;
  label: string;
  shortcut?: string | undefined;
  isSelected?: boolean;
  selectable?: boolean;
  hasSubmenu?: boolean;
}) {
  const iconColumn = useContext(IconColumn);
  const { isMac } = useSocle();
  const m = useMessages();
  return (
    <>
      {iconColumn && <span className={cx("inline-grid w-4 shrink-0 place-items-center", danger ? "text-danger" : "text-fg-2")}>{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {shortcut && <kbd className="ml-4 font-sans text-sm text-fg-3">{formatShortcut(shortcut, isMac, m)}</kbd>}
      {selectable && <span className="inline-grid w-4 shrink-0 place-items-center">{isSelected && <Check />}</span>}
      {hasSubmenu && <ChevronRight className="shrink-0 text-fg-3" />}
    </>
  );
}

function Item({ label, id, onAction, icon, shortcut, danger, isDisabled }: MenuItemProps) {
  const { isMac } = useSocle();
  return (
    <RACMenuItem
      textValue={label}
      className={cx(itemClass, danger && "text-danger")}
      {...(id !== undefined ? { id } : {})}
      {...(onAction ? { onAction } : {})}
      {...(isDisabled ? { isDisabled } : {})}
      {...(shortcut ? { ref: (el: HTMLDivElement | null) => el?.setAttribute("aria-keyshortcuts", ariaShortcut(shortcut, isMac)) } : {})}
    >
      {({ isSelected, selectionMode, hasSubmenu }) => (
        <ItemContent icon={icon} label={label} shortcut={shortcut} isSelected={isSelected} selectable={selectionMode !== "none"} hasSubmenu={hasSubmenu} danger={danger} />
      )}
    </RACMenuItem>
  );
}

/* ---------- Section ---------- */
export interface MenuSectionProps {
  title?: string;
  /** Section de choix : la coche s'affiche à droite (D-050). */
  selectionMode?: "single" | "multiple";
  selectedKeys?: Iterable<Key>;
  onSelectionChange?: (keys: Set<Key>) => void;
  children: ReactNode;
}

function Section({ title, selectionMode, selectedKeys, onSelectionChange, children }: MenuSectionProps) {
  return (
    <RACMenuSection
      className="[&+&]:mt-1"
      {...(selectionMode ? { selectionMode } : {})}
      {...(selectedKeys ? { selectedKeys } : {})}
      {...(onSelectionChange ? { onSelectionChange: (k: "all" | Set<Key>) => onSelectionChange(k === "all" ? new Set() : k) } : {})}
    >
      {title && <Header className="px-2.5 pt-1.5 pb-0.5 text-sm text-fg-3">{title}</Header>}
      {children}
    </RACMenuSection>
  );
}

/* ---------- Séparateur ---------- */
function MenuSeparator() {
  return <Separator className="mx-1.5 my-1 border-t border-line" />;
}

/* ---------- Sous-menu, sur un seul niveau (D-051) ---------- */
export interface MenuSubmenuProps {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}

function Submenu({ label, icon, children }: MenuSubmenuProps) {
  return (
    <SubmenuTrigger delay={200}>
      <RACMenuItem textValue={label} className={itemClass}>
        {({ hasSubmenu }) => <ItemContent icon={icon} label={label} hasSubmenu={hasSubmenu} />}
      </RACMenuItem>
      <Popover offset={-2} crossOffset={-5} containerPadding={8} className={popoverClass}>
        <IconColumn.Provider value={hasIcon(children)}>
          <RACMenu aria-label={label} className="outline-none">
            {children}
          </RACMenu>
        </IconColumn.Provider>
      </Popover>
    </SubmenuTrigger>
  );
}

Menu.Item = Item;
Menu.Section = Section;
Menu.Separator = MenuSeparator;
Menu.Submenu = Submenu;
