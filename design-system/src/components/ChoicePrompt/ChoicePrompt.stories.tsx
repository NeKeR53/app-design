import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ChoicePrompt } from "./ChoicePrompt";

const meta: Meta<typeof ChoicePrompt> = {
  title: "Composants/ChoicePrompt",
  component: ChoicePrompt,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-[760px] bg-surface p-4">{Story()}</div>],
  args: {
    question: "Quelle base de données utiliser pour les tests ?",
    options: [
      { id: "sqlite", label: "SQLite en mémoire", description: "Rapide, sans service à lancer" },
      { id: "pg", label: "PostgreSQL dans un conteneur" },
      { id: "mock", label: "Données simulées" },
    ],
    onChoose: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof ChoicePrompt>;

/** Question : options numérotées ; un clic ou Entrée sur une option répond. */
export const Question: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("region", { name: "Quelle base de données utiliser pour les tests ?" })).toBeInTheDocument();
    await expect(c.getByText("Question de l'agent")).toBeInTheDocument();
    const list = c.getByRole("listbox", { name: "Réponses proposées" });
    await expect(within(list).getAllByRole("option")).toHaveLength(3);
    await userEvent.click(c.getByRole("option", { name: /PostgreSQL/ }));
    await expect(args.onChoose).toHaveBeenLastCalledWith({ id: "pg" });
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(args.onChoose).toHaveBeenLastCalledWith({ id: "mock" });
  },
};

/** Touches 1 à 9 : seulement quand le focus est dans la carte ; ailleurs, la touche reste au champ de saisie. */
export const Touches: Story = {
  render: (args) => (
    <>
      <input aria-label="Message" />
      <ChoicePrompt {...args} />
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const onChoose = args.onChoose as ReturnType<typeof fn>;
    onChoose.mockClear();
    await userEvent.click(c.getByRole("textbox", { name: "Message" }));
    await userEvent.keyboard("2");
    await expect(onChoose).not.toHaveBeenCalled();
    await expect(c.getByRole("textbox", { name: "Message" })).toHaveValue("2");
    await userEvent.tab();
    await expect(c.getByRole("option", { name: /SQLite/ })).toHaveFocus();
    await expect(c.getByRole("option", { name: /SQLite/ })).toHaveAttribute("aria-keyshortcuts", "1");
    await userEvent.keyboard("2");
    await expect(onChoose).toHaveBeenLastCalledWith({ id: "pg" });
    await userEvent.keyboard("3");
    await expect(onChoose).toHaveBeenLastCalledWith({ id: "mock" });
    // Sans option 9 : rien.
    await userEvent.keyboard("9");
    await expect(onChoose).toHaveBeenCalledTimes(2);
  },
};

/** « Autre réponse… » devient un champ : Entrée envoie le texte, Échap referme ; les chiffres y sont du texte. */
export const AutreReponse: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const onChoose = args.onChoose as ReturnType<typeof fn>;
    onChoose.mockClear();
    await userEvent.click(c.getByRole("button", { name: "Autre réponse…" }));
    const field = c.getByRole("textbox", { name: "Votre réponse" });
    await expect(field).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(c.queryByRole("textbox")).toBeNull();
    await waitFor(() => expect(c.getByRole("button", { name: "Autre réponse…" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("MySQL 8");
    await expect(onChoose).not.toHaveBeenCalled();
    await expect(c.getByRole("textbox", { name: "Votre réponse" })).toHaveValue("MySQL 8");
    await userEvent.keyboard("{Enter}");
    await expect(onChoose).toHaveBeenCalledWith({ text: "MySQL 8" });
  },
};

/** Autorisation : détail en chasse fixe, pas de réponse libre. */
export const Autorisation: Story = {
  args: {
    kind: "permission",
    question: "Autoriser la commande suivante ?",
    detail: "rm -rf build/",
    options: [
      { id: "once", label: "Autoriser une fois" },
      { id: "always", label: "Toujours autoriser dans ce dossier" },
      { id: "deny", label: "Refuser" },
    ],
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Autorisation demandée")).toBeInTheDocument();
    await expect(c.getByText("rm -rf build/")).toBeInTheDocument();
    await expect(c.queryByRole("button", { name: "Autre réponse…" })).toBeNull();
  },
};

/** Inactive pendant que l'agent écrit : ni clic ni touche ne répondent. */
export const Inactive: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const onChoose = args.onChoose as ReturnType<typeof fn>;
    onChoose.mockClear();
    await userEvent.click(c.getByRole("option", { name: /SQLite/ }));
    await expect(onChoose).not.toHaveBeenCalled();
    await expect(c.getByRole("button", { name: "Autre réponse…" })).toBeDisabled();
  },
};
