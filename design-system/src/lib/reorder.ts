/**
 * Réordonner une liste au pointeur (glisser une poignée) et au clavier (flèches sur la poignée) : ordre affiché, aperçu
 * qui suit le pointeur, retour à l'ordre d'avant si l'app refuse. Partagé par MessageQueue et les sections de Drawer.
 * Chaque élément porte `data-sortable-id` et `data-sortable-scope` (le `scope` rendu).
 */
import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cx } from "./cx";

/** Un glissement ne commence qu'après 4 px : un simple clic sur la poignée ne déplace rien. */
const DRAG_DISTANCE = 4;

type Placement = "before" | "after";

function moveTo<T extends { id: string }>(items: T[], draggedId: string, targetId: string, placement: Placement) {
  const dragged = items.find((i) => i.id === draggedId);
  if (!dragged || draggedId === targetId) return items;
  const rest = items.filter((i) => i.id !== draggedId);
  const index = rest.findIndex((i) => i.id === targetId);
  if (index < 0) return items;
  const at = index + (placement === "after" ? 1 : 0);
  return [...rest.slice(0, at), dragged, ...rest.slice(at)];
}

export const sameIds = (a: readonly { id: string }[], b: readonly { id: string }[]) => a.length === b.length && a.every((item, i) => item.id === b[i]?.id);

/** Ordre affiché, glissement au pointeur et déplacement au clavier ; l'ordre d'avant revient si l'app refuse. */
export function useReorder<T extends { id: string }>(
  items: readonly T[],
  onReorder: ((ids: string[]) => void | Promise<void>) | undefined,
  announce: (id: string, order: T[]) => void,
) {
  const scope = useId();
  const [ordered, setOrdered] = useState<T[]>([...items]);
  const [draggedId, setDraggedId] = useState<string>();
  const current = useRef<T[]>([...items]);
  const cleanup = useRef<(() => void) | undefined>(undefined);
  const saving = useRef(false);

  useEffect(() => {
    if (draggedId || saving.current) return;
    if (!sameIds(current.current, items)) setOrdered([...items]);
    current.current = [...items];
  }, [draggedId, items]);

  useEffect(() => () => cleanup.current?.(), []);

  const save = (before: T[], next: T[], moved: string) => {
    if (sameIds(before, next) || saving.current || !onReorder) return;
    current.current = next;
    setOrdered(next);
    announce(moved, next);
    saving.current = true;
    void Promise.resolve()
      .then(() => onReorder(next.map((i) => i.id)))
      .catch(() => {
        current.current = before;
        setOrdered(before);
      })
      .finally(() => {
        saving.current = false;
      });
  };

  const move = (id: string, offset: -1 | 1) => {
    const before = current.current;
    const from = before.findIndex((i) => i.id === id);
    const to = from + offset;
    if (from < 0 || to < 0 || to >= before.length) return;
    const next = [...before];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    save(before, next, id);
  };

  const startDrag = (event: ReactPointerEvent<HTMLElement>, id: string, row: HTMLElement) => {
    if (saving.current || event.button !== 0) return;
    cleanup.current?.();
    const pointerId = event.pointerId;
    const start = { x: event.clientX, y: event.clientY };
    const before = current.current;
    let preview: HTMLElement | undefined;
    let dx = 0;
    let dy = 0;
    const begin = () => {
      const bounds = row.getBoundingClientRect();
      dx = start.x - bounds.left;
      dy = start.y - bounds.top;
      preview = row.cloneNode(true) as HTMLElement;
      for (const el of preview.querySelectorAll("[id]")) el.removeAttribute("id");
      preview.removeAttribute("data-sortable-id");
      preview.removeAttribute("data-sortable-scope");
      preview.setAttribute("aria-hidden", "true");
      preview.className = cx(row.className, "pointer-events-none fixed z-50 m-0 list-none bg-surface-raised opacity-90 shadow-md");
      Object.assign(preview.style, { width: `${bounds.width}px`, height: `${bounds.height}px`, left: `${bounds.left}px`, top: `${bounds.top}px` });
      document.body.append(preview);
      setDraggedId(id);
    };
    const onMove = (pointer: PointerEvent) => {
      if (pointer.pointerId !== pointerId) return;
      if (!preview) {
        const x = pointer.clientX - start.x;
        const y = pointer.clientY - start.y;
        if (x * x + y * y < DRAG_DISTANCE ** 2) return;
        begin();
      }
      pointer.preventDefault();
      if (!preview) return;
      preview.style.left = `${pointer.clientX - dx}px`;
      preview.style.top = `${pointer.clientY - dy}px`;
      const target = document.elementFromPoint(pointer.clientX, pointer.clientY)?.closest<HTMLElement>(`[data-sortable-scope="${scope}"]`);
      const targetId = target?.dataset.sortableId;
      if (!target || !targetId || targetId === id) return;
      const bounds = target.getBoundingClientRect();
      const next = moveTo(current.current, id, targetId, pointer.clientY < bounds.top + bounds.height / 2 ? "before" : "after");
      current.current = next;
      setOrdered(next);
    };
    const stop = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      preview?.remove();
      cleanup.current = undefined;
    };
    function finish(pointer: PointerEvent) {
      if (pointer.pointerId !== pointerId) return;
      const dragged = Boolean(preview);
      stop();
      setDraggedId(undefined);
      if (dragged) save(before, current.current, id);
    }
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    cleanup.current = stop;
  };

  // Les messages de l'app font foi ; l'ordre local ne garde que ceux qui existent encore.
  const latest = new Map(items.map((i) => [i.id, i]));
  const visible = ordered.flatMap((i) => {
    const found = latest.get(i.id);
    return found ? [found] : [];
  });
  for (const item of items) if (!visible.some((v) => v.id === item.id)) visible.push(item);
  return { scope, ordered: visible, draggedId, startDrag, move };
}

