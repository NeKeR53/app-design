import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { RadioButtonGroup } from "./RadioButtonGroup";

const meta: Meta<typeof RadioButtonGroup> = {
  title: "Composants/Champs/RadioButtonGroup",
  component: RadioButtonGroup,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof RadioButtonGroup>;

const options = (
  <>
    <RadioButtonGroup.Option value="std" description="3 à 5 jours ouvrés">Standard</RadioButtonGroup.Option>
    <RadioButtonGroup.Option value="exp" description="Le lendemain avant 13 h">Express</RadioButtonGroup.Option>
    <RadioButtonGroup.Option value="mag" description="Indisponible pour cette adresse" isDisabled>Retrait en magasin</RadioButtonGroup.Option>
  </>
);

export const ParDefaut: Story = {
  render: () => (
    <RadioButtonGroup label="Mode de livraison" isRequired description="Le délai court à partir de la validation.">
      {options}
    </RadioButtonGroup>
  ),
};

export const Etats: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <RadioButtonGroup label="Choisi" isRequired defaultValue="exp">{options}</RadioButtonGroup>
      <RadioButtonGroup label="En erreur" isRequired error="Choisissez un mode de livraison.">{options}</RadioButtonGroup>
      <RadioButtonGroup label="Désactivé" isDisabled defaultValue="std">{options}</RadioButtonGroup>
    </div>
  ),
};

/** Horizontal : 2 ou 3 options courtes (D-138). */
export const Horizontal: Story = {
  render: () => (
    <RadioButtonGroup label="Format" isRequired orientation="horizontal" defaultValue="pdf">
      <RadioButtonGroup.Option value="pdf">PDF</RadioButtonGroup.Option>
      <RadioButtonGroup.Option value="csv">CSV</RadioButtonGroup.Option>
      <RadioButtonGroup.Option value="xlsx">Excel</RadioButtonGroup.Option>
    </RadioButtonGroup>
  ),
};

/** Un arrêt de tabulation ; les flèches choisissent ; une option désactivée est sautée. */
export const Clavier: Story = {
  render: () => <RadioButtonGroup label="Mode de livraison" isRequired>{options}</RadioButtonGroup>,
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
      <RadioButtonGroup label="Mode de livraison" isRequired name="mode">{options}</RadioButtonGroup>
      <button type="submit" className="w-fit">Valider</button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Valider" }));
    await waitFor(() => expect(c.getByText("Choisissez une option.")).toBeVisible());
  },
};
