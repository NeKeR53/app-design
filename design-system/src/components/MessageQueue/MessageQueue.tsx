/*
 * Messages en file d'attente, en tête du cadre de ChatComposer (D-373). Spec : MessageQueue.spec.md.
 * Une ligne de 24 px par message : poignée (glisser, ou flèches haut et bas), aperçu sur une ligne, Modifier,
 * Retirer, « Envoyer maintenant ». L'ordre affiché suit le glissement ; l'app reçoit l'ordre final au relâchement.
 */
import { useId, useState, type ReactElement } from "react";
import { Button } from "react-aria-components/Button";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { useReorder } from "../../lib/reorder";
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
                className="socle-btn inline-grid size-5 shrink-0 cursor-grab touch-none place-items-center rounded-md text-fg-2 hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 outline-focus focus-visible:outline-solid"
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
