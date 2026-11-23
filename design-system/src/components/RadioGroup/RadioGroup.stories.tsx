import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { RadioGroup } from "./RadioGroup";

const meta: Meta<typeof RadioGroup> = {
  title: "Composants/Champs/RadioGroup",
  component: RadioGroup,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof RadioGroup>;

const options = (
  <>
    <RadioGroup.Option value="std" description="3 à 5 jours ouvrés">Standard</RadioGroup.Option>
    <RadioGroup.Option value="exp" description="Le lendemain avant 13 h">Express</RadioGroup.Option>
    <RadioGroup.Option value="mag" description="Indisponible pour cette adresse" isDisabled>Retrait en magasin</RadioGroup.Option>
  </>
);

export const ParDefaut: Story = {
  render: () => (
    <RadioGroup label="Mode de livraison" isRequired description="Le délai court à partir de la validation.">
      {options}
    </RadioGroup>
  ),
};

export const Etats: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <RadioGroup label="Choisi" isRequired defaultValue="exp">{options}</RadioGroup>
      <RadioGroup label="En erreur" isRequired error="Choisissez un mode de livraison.">{options}</RadioGroup>
      <RadioGroup label="Désactivé" isDisabled defaultValue="std">{options}</RadioGroup>
    </div>
  ),
};

/** Horizontal : 2 ou 3 options courtes (D-138). */
export const Horizontal: Story = {
  render: () => (
    <RadioGroup label="Format" isRequired orientation="horizontal" defaultValue="pdf">
      <RadioGroup.Option value="pdf">PDF</RadioGroup.Option>
      <RadioGroup.Option value="csv">CSV</RadioGroup.Option>
      <RadioGroup.Option value="xlsx">Excel</RadioGroup.Option>
    </RadioGroup>
  ),
};

/** Un arrêt de tabulation ; les flèches choisissent ; une option désactivée est sautée. */
export const Clavier: Story = {
  render: () => <RadioGroup label="Mode de livraison" isRequired>{options}</RadioGroup>,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("radiogroup", { name: "Mode de livraison" })).toBeVisible();
    await userEvent.tab();
    await expect(c.getByRole("radio", { name: /Standard/ })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(c.getByRole("radio", { name: /Express/ })).toBeChecked();
    await userEvent.keyboard("{ArrowDown}");
    await expect(c.getByRole("radio", { name: /Standard/ })).toBeChecked();
  },
};

/** Obligatoire sans choix : erreur à l'envoi (D-132). */
export const Verification: Story = {
  render: () => (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
      <RadioGroup label="Mode de livraison" isRequired name="mode">{options}</RadioGroup>
      <button type="submit" className="w-fit">Valider</button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Valider" }));
    await waitFor(() => expect(c.getByText("Choisissez une option.")).toBeVisible());
  },
};
