import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { MessageQueue, type QueuedMessage } from "./MessageQueue";

const START: QueuedMessage[] = [
  { id: "a", text: "Ensuite, mets à jour la doc du formulaire" },
  { id: "b", text: "Vérifie aussi  et ses tests", references: [{ key: "r1", trigger: "@", id: "src/OrderForm.tsx", label: "OrderForm.tsx", offset: 14 }] },
  { id: "c", text: "Texte collé", isEditable: false },
];

const onEdit = fn();
const onRemove = fn();
const onSendNow = fn();
const onReorder = fn();

/** File contrôlée : l'ordre et les retraits sont appliqués comme le ferait l'app. */
function Demo({ initial = START, reject = false }: { initial?: QueuedMessage[]; reject?: boolean }) {
  const [items, setItems] = useState(initial);
  return (
    <div className="w-[520px] rounded-md border border-line-strong bg-surface p-1.5">
      <MessageQueue
        items={items}
        onEdit={onEdit}
        onRemove={(id) => {
          onRemove(id);
          setItems((all) => all.filter((i) => i.id !== id));
        }}
        onSendNow={onSendNow}
        onReorder={async (ids) => {
          onReorder(ids);
          if (reject) throw new Error("refusé");
          setItems((all) => ids.map((id) => all.find((i) => i.id === id)!));
        }}
      />
      <div className="p-1 text-fg-3">Texte de la saisie…</div>
    </div>
  );
}

const meta: Meta<typeof MessageQueue> = {
  title: "Composants/MessageQueue",
  component: MessageQueue,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof MessageQueue>;

const order = (root: HTMLElement) => [...root.querySelectorAll("[data-queue-text]")].map((el) => el.textContent);

export const ParDefaut: Story = { render: () => <Demo /> };

/** Lignes de 24 px, aperçu sur une ligne, filet sous la file ; pastilles à leur place. */
export const Anatomie: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const section = c.getByRole("region", { name: "3 messages en file" });
    await expect(getComputedStyle(section).borderBottomWidth).toBe("1px");
    const rows = within(section).getAllByRole("listitem");
    await expect(rows).toHaveLength(3);
    for (const row of rows) await expect(row.getBoundingClientRect().height).toBe(24);
    const text = rows[0]!.querySelector("[data-queue-text]")!;
    await expect(getComputedStyle(text).whiteSpace).toBe("nowrap");
    await expect(getComputedStyle(text).textOverflow).toBe("ellipsis");
    await expect(order(canvasElement)[1]).toBe("Vérifie aussi @OrderForm.tsx et ses tests");
    // « Modifier » inactif pour un message qui ne se reprend pas.
    await expect(c.getByRole("button", { name: "Modifier le message 3" })).toBeDisabled();
  },
};

/** Modifier, Retirer, Envoyer maintenant renvoient l'identifiant du message. */
export const Actions: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    onEdit.mockClear();
    onSendNow.mockClear();
    onRemove.mockClear();
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Modifier le message 1" }));
    await expect(onEdit).toHaveBeenCalledWith("a");
    await userEvent.click(c.getByRole("button", { name: "Envoyer le message 2 maintenant" }));
    await expect(onSendNow).toHaveBeenCalledWith("b");
    await userEvent.click(c.getByRole("button", { name: "Retirer le message 1" }));
    await expect(onRemove).toHaveBeenCalledWith("a");
    await waitFor(() => expect(c.getByRole("region", { name: "2 messages en file" })).toBeInTheDocument());
  },
};

/** Flèches haut et bas sur la poignée : le message change de place, le focus le suit, le déplacement est annoncé. */
export const ReordonnerAuClavier: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    onReorder.mockClear();
    const c = within(canvasElement);
    const handle = c.getByRole("button", { name: "Déplacer le message 1" });
    await expect(handle).toHaveAccessibleDescription("Flèches haut et bas pour réordonner");
    handle.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(onReorder).toHaveBeenLastCalledWith(["b", "a", "c"]);
    await waitFor(() => expect(order(canvasElement)[1]).toBe("Ensuite, mets à jour la doc du formulaire"));
    await expect(handle).toHaveFocus();
    await expect(c.getByRole("status")).toHaveTextContent("Message déplacé en position 2 sur 3");
    // Premier en haut : Flèche haut au premier ne fait rien.
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    await waitFor(() => expect(onReorder).toHaveBeenLastCalledWith(["a", "b", "c"]));
    await expect(onReorder).toHaveBeenCalledTimes(2);
  },
};

/** L'app refuse le nouvel ordre : l'ordre d'avant revient. */
export const ReordonnementRefuse: Story = {
  render: () => <Demo reject />,
  play: async ({ canvasElement }) => {
    within(canvasElement).getByRole("button", { name: "Déplacer le message 1" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(order(canvasElement)[0]).toBe("Ensuite, mets à jour la doc du formulaire"));
  },
};

/** Glisser la poignée au pointeur : l'ordre suit, l'app reçoit l'ordre final au relâchement. */
export const GlisserDeposer: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    onReorder.mockClear();
    const c = within(canvasElement);
    const handle = c.getByRole("button", { name: "Déplacer le message 1" });
    const rows = c.getAllByRole("listitem");
    const from = handle.getBoundingClientRect();
    const target = rows[2]!.getBoundingClientRect();
    const x = from.left + from.width / 2;
    const fire = (type: string, y: number, el: EventTarget = window) =>
      el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 7, button: 0, clientX: x, clientY: y, pointerType: "mouse" }));
    fire("pointerdown", from.top + 4, handle);
    fire("pointermove", from.top + 12);
    fire("pointermove", target.bottom - 4);
    await waitFor(() => expect(document.body.querySelector('[aria-hidden="true"][data-sortable-id], li[aria-hidden="true"]')).not.toBeNull());
    fire("pointerup", target.bottom - 4);
    await waitFor(() => expect(onReorder).toHaveBeenCalledWith(["b", "c", "a"]));
    await expect(document.body.querySelector('li[aria-hidden="true"]')).toBeNull();
  },
};

/** Un seul message : une horloge à la place de la poignée, à la même largeur. */
export const UnSeulMessage: Story = {
  render: () => <Demo initial={[START[0]!]} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("button", { name: /Déplacer/ })).toBeNull();
    await expect(c.getByRole("region", { name: "1 message en file" })).toBeInTheDocument();
  },
};

/** Désactivée : actions inactives, pas de poignée. */
export const Desactivee: Story = {
  render: () => <MessageQueue items={START} isDisabled onReorder={() => {}} onRemove={() => {}} onSendNow={() => {}} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("button", { name: /Déplacer/ })).toBeNull();
    await expect(c.getByRole("button", { name: "Retirer le message 1" })).toBeDisabled();
  },
};
