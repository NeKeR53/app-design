/*
 * Messages en file d'attente, en tête du cadre de ChatComposer (D-373). Spec : MessageQueue.spec.md.
 * Une ligne de 24 px par message : poignée (glisser, ou flèches haut et bas), aperçu sur une ligne, Modifier,
 * Retirer, « Envoyer maintenant ». L'ordre affiché suit le glissement ; l'app reçoit l'ordre final au relâchement.
 */
import { useEffect, useId, useRef, useState, type ReactElement, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "react-aria-components/Button";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { Clock, ExternalArrow, GripVertical, Pencil, X } from "../../icons";
import { Tooltip } from "../Tooltip/Tooltip";
import { MentionText } from "../MentionInput/MentionInput";
import type { MentionReference } from "../MentionInput/mentions";

export interface QueuedMessage {
  /** Identifiant stable. */
  id: string;
  /** Aperçu : le texte du message, sans les pastilles. L'app donne un texte pour un message sans texte (« Texte collé »). */
  text: string;
  /** Pastilles du message, à leur position. */
  references?: MentionReference[];
  /** `false` : « Modifier » inactif (message avec pièces jointes, par exemple). Défaut : `true`. */
  isEditable?: boolean;
}

export interface MessageQueueProps {
  items: QueuedMessage[];
  /** Nouvel ordre des identifiants. Sans lui, pas de poignée. Une promesse rejetée remet l'ordre d'avant. */
  onReorder?: (ids: string[]) => void | Promise<void>;
  /** « Modifier » : l'app remet le message dans la saisie. Sans lui, pas de bouton. */
  onEdit?: (id: string) => void;
  /** « Retirer ». Sans lui, pas de bouton. */
  onRemove?: (id: string) => void;
  /** « Envoyer maintenant ». Sans lui, pas de bouton. */
  onSendNow?: (id: string) => void;
  isDisabled?: boolean;
}

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

const sameIds = (a: readonly { id: string }[], b: readonly { id: string }[]) => a.length === b.length && a.every((item, i) => item.id === b[i]?.id);

/** Ordre affiché, glissement au pointeur et déplacement au clavier ; l'ordre d'avant revient si l'app refuse. */
function useReorder(items: QueuedMessage[], onReorder: MessageQueueProps["onReorder"], announce: (id: string, order: QueuedMessage[]) => void) {
  const scope = useId();
  const [ordered, setOrdered] = useState(items);
  const [draggedId, setDraggedId] = useState<string>();
  const current = useRef(items);
  const cleanup = useRef<(() => void) | undefined>(undefined);
  const saving = useRef(false);

  useEffect(() => {
    if (draggedId || saving.current) return;
    if (!sameIds(current.current, items)) setOrdered(items);
    current.current = items;
  }, [draggedId, items]);

  useEffect(() => () => cleanup.current?.(), []);

  const save = (before: QueuedMessage[], next: QueuedMessage[], moved: string) => {
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

/** Bouton d'action d'une ligne : 24 px, icône de 14 px, info-bulle. */
function RowAction({ icon, label, onPress, isDisabled }: { icon: ReactElement; label: string; onPress: () => void; isDisabled?: boolean | undefined }) {
  return (
    <Tooltip content={label} placement="top">
      <Button
        aria-label={label}
        aria-describedby=""
        onPress={onPress}
        isDisabled={isDisabled ?? false}
        className={cx(
          buttonReset,
          "inline-grid size-6 shrink-0 cursor-default place-items-center rounded-md text-fg-2 transition-colors duration-[var(--dur-fast)] ease-standard",
          "data-hovered:bg-hover data-hovered:text-fg data-pressed:bg-selected data-disabled:opacity-40 data-disabled:data-hovered:bg-transparent",
          focusRing,
        )}
      >
        {icon}
      </Button>
    </Tooltip>
  );
}

export function MessageQueue({ items, onReorder, onEdit, onRemove, onSendNow, isDisabled = false }: MessageQueueProps) {
  const m = useMessages();
  const hintId = useId();
  const [status, setStatus] = useState("");
  const { scope, ordered, draggedId, startDrag, move } = useReorder(items, onReorder, (id, order) =>
    setStatus(m.queueMoved(order.findIndex((i) => i.id === id) + 1, order.length)),
  );
  if (!items.length) return null;
  const sortable = Boolean(onReorder) && items.length > 1 && !isDisabled;
  return (
    <section aria-label={m.queueLabel(items.length)} aria-describedby={hintId} className="socle-box -mt-0.5 mb-0.5 border-b border-line pr-1 pb-0.75 font-sans">
      <span id={hintId} hidden>
        {m.queueWaiting}
      </span>
      <ol className="m-0 list-none p-0">
        {ordered.map((item, index) => (
          <li
            key={item.id}
            data-sortable-id={item.id}
            data-sortable-scope={scope}
            className={cx("flex h-6 min-w-0 items-center gap-1 rounded-md pl-1 text-fg-2 hover:bg-surface-side", draggedId === item.id && "opacity-40")}
          >
            {sortable ? (
              <button
                type="button"
                aria-label={m.queueMove(index + 1)}
                aria-describedby={`${hintId}-move`}
                className="socle-btn inline-grid size-5 shrink-0 cursor-grab touch-none place-items-center rounded-md text-fg-2 hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus focus-visible:outline-solid"
                onPointerDown={(event) => {
                  const row = event.currentTarget.closest("li");
                  if (row) startDrag(event, item.id, row);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                  event.preventDefault();
                  move(item.id, event.key === "ArrowUp" ? -1 : 1);
                }}
              >
                <GripVertical size={12} />
              </button>
            ) : (
              <Clock size={12} className="mx-1 shrink-0" />
            )}
            <span className="min-w-0 flex-1 truncate text-sm text-fg" data-queue-text="">
              <MentionText text={item.text} references={item.references ?? []} />
            </span>
            <span className="flex shrink-0 items-center">
              {onEdit && <RowAction icon={<Pencil size={14} />} label={m.queueEdit(index + 1)} isDisabled={isDisabled || item.isEditable === false} onPress={() => onEdit(item.id)} />}
              {onRemove && <RowAction icon={<X size={14} />} label={m.queueRemove(index + 1)} isDisabled={isDisabled} onPress={() => onRemove(item.id)} />}
              {onSendNow && <RowAction icon={<ExternalArrow size={14} />} label={m.queueSendNow(index + 1)} isDisabled={isDisabled} onPress={() => onSendNow(item.id)} />}
            </span>
          </li>
        ))}
      </ol>
      <span id={`${hintId}-move`} hidden>
        {m.queueMoveHint}
      </span>
      <span role="status" className="sr-only">
        {status}
      </span>
    </section>
  );
}
