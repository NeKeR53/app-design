import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Fieldset } from "./Fieldset";
import { TextField } from "../TextField/TextField";
import { Select } from "../Select/Select";

const meta: Meta<typeof Fieldset> = {
  title: "Composants/Champs/Fieldset",
  component: Fieldset,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Fieldset>;

const Adresse = ({ isDisabled = false, error }: { isDisabled?: boolean; error?: string }) => (
  <Fieldset legend="Adresse de livraison" description="L'adresse figure sur le bon de livraison." isDisabled={isDisabled} {...(error ? { error } : {})}>
    <TextField label="Rue" isRequired defaultValue="12 rue des Lilas" width="lg" />
    <div className="flex flex-wrap gap-3">
      <TextField label="Code postal" isRequired width="xs" defaultValue="69003" />
      <TextField label="Ville" isRequired width="md" defaultValue="Lyon" />
    </div>
    <Select label="Pays" isRequired width="md" defaultValue="fr" options={[{ id: "fr", label: "France" }, { id: "be", label: "Belgique" }]} />
  </Fieldset>
);

export const ParDefaut: Story = {
  render: () => <Adresse />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("group", { name: "Adresse de livraison" })).toBeVisible();
  },
};

/** Désactivé : tous les champs du groupe le sont. */
export const Desactive: Story = {
  render: () => <Adresse isDisabled />,
  play: async ({ canvasElement }) => {
    for (const t of within(canvasElement).getAllByRole("textbox")) await expect(t).toBeDisabled();
  },
};

/** L'erreur du groupe est reliée au groupe et annoncée. */
export const ErreurGroupe: Story = {
  render: () => <Adresse error="Cette adresse est hors de la zone de livraison." />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const g = c.getByRole("group", { name: "Adresse de livraison" });
    await expect(g).toHaveAccessibleDescription("Cette adresse est hors de la zone de livraison.");
    await expect(c.getByRole("alert")).toBeVisible();
  },
};
