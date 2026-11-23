/*
 * Focus de repli à la fermeture d'une modale (Modal.spec.md, Accessibilité).
 * React Aria rend le focus au déclencheur. S'il a disparu (la ligne supprimée), le focus irait sur `body` :
 * on le pose sur l'élément suivant de la même collection, sinon le précédent, sinon la collection, sinon `main`.
 */

/** Élément qui reçoit le focus à la fermeture, à la place du déclencheur. */
export type ReturnFocusTarget = HTMLElement | (() => HTMLElement | null);

/** Le déclencheur et sa place dans sa collection, notés à l'ouverture. */
export interface FocusOrigin {
  trigger: HTMLElement | null;
  /** Éléments de la collection à l'ouverture, dans l'ordre. */
  items: HTMLElement[];
  /** Place du déclencheur dans `items` ; -1 hors collection. */
  index: number;
  container: HTMLElement | null;
  role: string | null;
}

/** Rôles d'élément de collection, du plus large au plus fin : une ligne passe avant sa cellule. */
const ITEM_ROLES = ["row", "option", "treeitem", "gridcell"];
const COLLECTION = "[role=grid],[role=treegrid],[role=table],[role=listbox],[role=tree]";

/** Un élément dans un menu ouvert : son déclencheur, qui reste dans la page quand le menu se ferme. */
function outsideMenus(el: HTMLElement | null): HTMLElement | null {
  let current = el;
  for (let i = 0; current && i < 5; i++) {
    const menu = current.closest<HTMLElement>("[role=menu]");
    if (!menu) return current;
    const doc = menu.ownerDocument;
    const byControls = menu.id ? doc.querySelector<HTMLElement>(`[aria-controls="${CSS.escape(menu.id)}"]`) : null;
    const labelledBy = menu.getAttribute("aria-labelledby")?.split(" ")[0];
    current = byControls ?? (labelledBy ? doc.getElementById(labelledBy) : null);
  }
  return current;
}

function itemsOf(container: HTMLElement, role: string): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(`[role=${role}]`)).filter(
    // Pas les lignes d'en-tête, ni les éléments d'une collection imbriquée.
    (el) => el.closest(COLLECTION) === container && !el.querySelector("[role=columnheader]"),
  );
}

/** Note le déclencheur (l'élément qui a le focus) et sa place, à l'ouverture. */
export function captureFocusOrigin(doc: Document = document): FocusOrigin {
  const active = doc.activeElement instanceof HTMLElement && doc.activeElement !== doc.body ? doc.activeElement : null;
  const trigger = outsideMenus(active);
  for (const role of ITEM_ROLES) {
    const item = trigger?.closest<HTMLElement>(`[role=${role}]`);
    const container = item?.closest<HTMLElement>(COLLECTION);
    if (!item || !container) continue;
    const items = itemsOf(container, role);
    return { trigger, items, index: items.indexOf(item), container, role };
  }
  return { trigger, items: [], index: -1, container: null, role: null };
}

function focus(el: HTMLElement) {
  // Un conteneur ou `main` n'est pas toujours focusable : il le devient, hors de l'ordre de tabulation.
  if (el.tabIndex < 0 && !el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus();
}

/** Cible de repli : suivant, sinon précédent, sinon la collection, sinon `main`. */
export function fallbackTarget(origin: FocusOrigin, doc: Document = document): HTMLElement | null {
  const { items, index, container, role } = origin;
  if (index >= 0) {
    const next = items.slice(index + 1).find((el) => el.isConnected);
    if (next) return next;
    const previous = items.slice(0, index).reverse().find((el) => el.isConnected);
    if (previous) return previous;
    if (container?.isConnected && role) {
      // La collection a été redessinée : l'élément à la même place, ou le dernier.
      const now = itemsOf(container, role);
      return now[Math.min(index, now.length - 1)] ?? container;
    }
  }
  return doc.querySelector<HTMLElement>("main");
}

/**
 * Après la fermeture : attend que la fenêtre `dialog` quitte la page (fin de l'animation)
 * et que React Aria ait rendu le focus, puis applique `returnFocusTo` ou le repli.
 * Rend une fonction qui annule l'attente.
 */
export function restoreFocusAfterClose(origin: FocusOrigin, dialog: HTMLElement | null, returnFocusTo?: ReturnFocusTarget): () => void {
  const doc = dialog?.ownerDocument ?? document;
  let frame = 0;
  let cancelled = false;
  const started = performance.now();
  const apply = () => {
    if (cancelled) return;
    const override = typeof returnFocusTo === "function" ? returnFocusTo() : returnFocusTo;
    if (override?.isConnected) return focus(override);
    const active = doc.activeElement;
    // Le focus est déjà sur un élément de la page : React Aria l'a rendu, ou l'app l'a déplacé.
    if (active && active !== doc.body && active.isConnected) return;
    const target = origin.trigger?.isConnected ? origin.trigger : fallbackTarget(origin, doc);
    if (target) focus(target);
  };
  const wait = () => {
    if (cancelled) return;
    // Fenêtre encore là (animation de sortie) : on attend, 2 s au plus.
    if (dialog?.isConnected && performance.now() - started < 2000) {
      frame = requestAnimationFrame(wait);
      return;
    }
    // Deux images : React Aria rend le focus une image après le retrait de la fenêtre.
    frame = requestAnimationFrame(() => (frame = requestAnimationFrame(apply)));
  };
  frame = requestAnimationFrame(wait);
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
}
