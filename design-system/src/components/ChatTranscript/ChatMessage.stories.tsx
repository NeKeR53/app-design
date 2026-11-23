import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ChatMessage } from "./ChatMessage";
import { MessageActions } from "./MessageActions";
import { Markdown } from "../Markdown/Markdown";

const meta: Meta<typeof ChatMessage> = {
  title: "Composants/ChatTranscript/ChatMessage",
  component: ChatMessage,
  subcomponents: { MessageActions },
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="mx-auto max-w-[760px] bg-surface p-4">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof ChatMessage>;

const TEXT = "Peux-tu résumer le rapport trimestriel ?";
const quoteSpy = fn();
const editSpy = fn();
const REPLY = "Le chiffre d'affaires progresse de 4 %. Les coûts restent stables.";

/**
 * Les actions cachées ignorent le pointeur (`pointer-events: none`) et le survol simulé ne pose pas `:hover` :
 * le focus les montre, puis le clic agit.
 */
async function press(el: HTMLElement) {
  el.focus();
  await userEvent.click(el);
}

/** Compare une couleur calculée à celle d'un token. */
function sameColor(el: Element, token: string) {
  const probe = document.createElement("div");
  probe.style.background = `var(${token})`;
  document.body.append(probe);
  const ok = getComputedStyle(el).backgroundColor === getComputedStyle(probe).backgroundColor;
  probe.remove();
  return ok;
}

/** Utilisateur : bulle à droite, 85 % au plus, `--surface-side`, rayon 8 px ; actions 4 px sous la bulle, à droite. */
export const Utilisateur: Story = {
  render: () => (
    <ChatMessage role="user" meta="Envoyé · 14:02" attachments={<span className="rounded-md border border-line px-3 py-2 text-sm">rapport.pdf</span>} actions={<MessageActions content={TEXT} onEdit={fn()} />}>
      {TEXT}
    </ChatMessage>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const article = c.getByRole("article", { name: "Vous" });
    const bubble = article.querySelector("[data-message-body]") as HTMLElement;
    await expect(sameColor(bubble, "--surface-side")).toBe(true);
    await expect(getComputedStyle(bubble).borderTopLeftRadius).toBe("8px");
    await expect(getComputedStyle(article).maxWidth).toBe("85%");
    const row = article.querySelector("[data-message-actions]") as HTMLElement;
    const a = article.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    await expect(Math.round(r.top - a.bottom)).toBe(4);
    await expect(Math.round(a.right - r.right)).toBe(6);
    await expect(c.getByText("Envoyé · 14:02")).toBeInTheDocument();
    // Pièce jointe au-dessus de la bulle.
    await expect(c.getByText("rapport.pdf").getBoundingClientRect().bottom).toBeLessThanOrEqual(bubble.getBoundingClientRect().top);
  },
};

/** Assistant : sans bulle, pleine largeur ; actions dans la marge basse, à gauche, près du texte. */
export const Assistant: Story = {
  render: () => (
    <ChatMessage role="assistant" meta="14:03" actions={<MessageActions content={REPLY} onQuote={fn()} onRetry={fn()} onFork={fn()} />}>
      <Markdown>{REPLY}</Markdown>
    </ChatMessage>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const article = c.getByRole("article", { name: "Assistant" });
    const body = article.querySelector("[data-message-body]") as HTMLElement;
    const row = article.querySelector("[data-message-actions]") as HTMLElement;
    const a = article.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    await expect(Math.round(a.bottom - r.top)).toBe(24);
    await expect(Math.round(r.left - a.left)).toBe(6);
    await expect(Math.round(r.top - body.getBoundingClientRect().bottom)).toBe(4);
    // Boutons de 24 px, icônes de 12 px, sans espace entre eux.
    const [copy, quote] = within(row).getAllByRole("button") as [HTMLElement, HTMLElement];
    await expect(copy.getBoundingClientRect().width).toBe(24);
    await expect(copy.querySelector("svg")?.getAttribute("width")).toBe("12");
    await expect(quote.getBoundingClientRect().left).toBe(copy.getBoundingClientRect().right);
  },
};

/** Au repos, les actions sont cachées ; au clavier, elles s'affichent dès que le focus y entre. */
export const ActionsAuFocus: Story = {
  render: () => (
    <>
      <button type="button">Avant</button>
      <ChatMessage role="assistant" actions={<MessageActions content={REPLY} onQuote={fn()} />}>
        {REPLY}
      </ChatMessage>
    </>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const row = canvasElement.querySelector("[data-message-actions]") as HTMLElement;
    await expect(getComputedStyle(row).opacity).toBe("0");
    c.getByRole("button", { name: "Avant" }).focus();
    await userEvent.tab();
    await expect(c.getByRole("button", { name: "Copier le message" })).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(row).opacity).toBe("1"));
    // Barre d'outils : les flèches passent d'une action à l'autre.
    await expect(c.getByRole("toolbar", { name: "Actions du message" })).toBeInTheDocument();
    await userEvent.keyboard("{ArrowRight}");
    await expect(c.getByRole("button", { name: "Citer dans la réponse" })).toHaveFocus();
  },
};

/** « Copier » copie le texte ; coche et « Copié » dans l'info-bulle pendant 2 s, sans notification. */
export const Copier: Story = {
  render: () => (
    <ChatMessage role="assistant" actions={<MessageActions content={REPLY} />}>
      {REPLY}
    </ChatMessage>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const write = fn().mockResolvedValue(undefined);
    const original = navigator.clipboard.writeText;
    Object.defineProperty(navigator.clipboard, "writeText", { value: write, configurable: true });
    try {
      await press(c.getByRole("button", { name: "Copier le message" }));
      await expect(write).toHaveBeenCalledWith(REPLY);
      await waitFor(() => expect(c.getByRole("button", { name: "Copié" })).toBeInTheDocument());
      await waitFor(() => expect(within(document.body).getByRole("tooltip")).toHaveTextContent("Copié"));
      await expect(c.getByRole("status")).toHaveTextContent("Copié");
      await waitFor(() => expect(c.getByRole("button", { name: "Copier le message" })).toBeInTheDocument(), { timeout: 3000 });
    } finally {
      Object.defineProperty(navigator.clipboard, "writeText", { value: original, configurable: true });
    }
  },
};

/** « Citer » : le passage sélectionné dans le message, sinon tout le message. */
export const Citer: Story = {
  render: () => (
    <ChatMessage role="assistant" actions={<MessageActions content={REPLY} onQuote={quoteSpy} />}>
      <p data-testid="texte" className="m-0">
        {REPLY}
      </p>
    </ChatMessage>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const spy = quoteSpy;
    spy.mockClear();
    await press(c.getByRole("button", { name: "Citer dans la réponse" }));
    await expect(spy).toHaveBeenLastCalledWith(REPLY);
    const node = c.getByTestId("texte").firstChild as Text;
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, 23);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    await press(c.getByRole("button", { name: "Citer dans la réponse" }));
    await expect(spy).toHaveBeenLastCalledWith("Le chiffre d'affaires p");
    selection?.removeAllRanges();
  },
};

/** « Modifier » en place : un champ remplace la bulle ; Échap annule, Entrée renvoie ; focus rendu à « Modifier ». */
export const Modifier: Story = {
  render: () => (
    <ChatMessage role="user" meta="Envoyé" actions={<MessageActions content={TEXT} onEdit={editSpy} />}>
      {TEXT}
    </ChatMessage>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const spy = editSpy;
    spy.mockClear();
    await press(c.getByRole("button", { name: "Modifier le message" }));
    const field = c.getByRole("textbox", { name: "Modifier le message" });
    await expect(field).toHaveFocus();
    await expect(field).toHaveValue(TEXT);
    await expect(c.queryByText(TEXT, { selector: "[data-message-body]" })).toBeNull();
    await userEvent.keyboard(" Bref.");
    await userEvent.keyboard("{Escape}");
    await expect(c.queryByRole("textbox")).toBeNull();
    await expect(spy).not.toHaveBeenCalled();
    await waitFor(() => expect(c.getByRole("button", { name: "Modifier le message" })).toHaveFocus());
    // Nouvelle modification : Entrée renvoie le texte.
    await press(c.getByRole("button", { name: "Modifier le message" }));
    await userEvent.clear(c.getByRole("textbox", { name: "Modifier le message" }));
    await userEvent.type(c.getByRole("textbox", { name: "Modifier le message" }), "Résume le rapport annuel.");
    await expect(c.getByRole("button", { name: "Envoyer" })).toBeEnabled();
    await userEvent.keyboard("{Enter}");
    await expect(spy).toHaveBeenCalledWith("Résume le rapport annuel.");
    await expect(c.queryByRole("textbox")).toBeNull();
    // Boutons « Annuler » et « Envoyer ».
    await press(c.getByRole("button", { name: "Modifier le message" }));
    await userEvent.click(c.getByRole("button", { name: "Annuler" }));
    await expect(c.queryByRole("textbox")).toBeNull();
  },
};

/** Pendant une réponse : Relancer, Repartir d'ici et Modifier sont inactifs ; Copier et Citer restent actifs. */
export const Inactif: Story = {
  render: () => (
    <ChatMessage role="user" actions={<MessageActions content={TEXT} onQuote={fn()} onRetry={fn()} onFork={fn()} onEdit={fn()} isDisabled />}>
      {TEXT}
    </ChatMessage>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("button", { name: "Relancer le message" })).toBeDisabled();
    await expect(c.getByRole("button", { name: "Repartir d'ici" })).toBeDisabled();
    await expect(c.getByRole("button", { name: "Modifier le message" })).toBeDisabled();
    await expect(c.getByRole("button", { name: "Copier le message" })).toBeEnabled();
    await expect(c.getByRole("button", { name: "Citer dans la réponse" })).toBeEnabled();
  },
};
