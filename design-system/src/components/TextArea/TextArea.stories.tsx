import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { TextArea } from "./TextArea";

const meta: Meta<typeof TextArea> = {
  title: "Composants/Champs/TextArea",
  component: TextArea,
  parameters: { layout: "padded" },
  args: { label: "Notes", description: "Visibles par toute l'équipe.", placeholder: "Horaires, interlocuteur, particularités…", maxLength: 500, width: "lg" },
};
export default meta;
type Story = StoryObj<typeof TextArea>;

export const ParDefaut: Story = {};

export const Etats: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TextArea label="En erreur" isRequired error="Décrivez la demande en une phrase au moins." width="lg" />
      <TextArea label="Lecture seule" isRequired isReadOnly defaultValue={"Livraison le matin.\nSonner deux fois."} width="lg" />
      <TextArea label="Désactivé" isDisabled width="lg" />
    </div>
  ),
};

/** Commence à 3 lignes, grandit jusqu'à 10, puis défile (D-133). */
export const Hauteur: Story = {
  play: async ({ canvasElement }) => {
    const ta = within(canvasElement).getByRole("textbox") as HTMLTextAreaElement;
    const start = ta.getBoundingClientRect().height;
    await userEvent.type(ta, "1{Enter}2{Enter}3{Enter}4{Enter}5");
    await waitFor(() => expect(ta.getBoundingClientRect().height).toBeGreaterThan(start));
    await userEvent.type(ta, "{Enter}6{Enter}7{Enter}8{Enter}9{Enter}10{Enter}11{Enter}12{Enter}13");
    const max = ta.getBoundingClientRect().height;
    await userEvent.type(ta, "{Enter}14{Enter}15");
    await expect(ta.getBoundingClientRect().height).toBe(max);
    await expect(getComputedStyle(ta).overflowY).toBe("auto");
  },
};

/** Compteur mis à jour à chaque frappe, relié au champ. */
export const Compteur: Story = {
  args: { maxLength: 20 },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("0 / 20")).toBeVisible();
    await userEvent.type(c.getByRole("textbox"), "Bonjour");
    await expect(c.getByText("7 / 20")).toBeVisible();
    await expect(c.getByRole("textbox").getAttribute("aria-describedby")).toContain(c.getByText("7 / 20").id);
  },
};

/** Vérification au moment de D-132. */
export const Verification: Story = {
  render: () => <TextArea label="Motif" isRequired width="lg" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole("textbox"), "a");
    await userEvent.tab();
    await userEvent.clear(c.getByRole("textbox"));
    await expect(c.queryByText("Ce champ est obligatoire.")).toBeNull();
    await userEvent.tab();
    await waitFor(() => expect(c.getByText("Ce champ est obligatoire.")).toBeVisible());
  },
};
