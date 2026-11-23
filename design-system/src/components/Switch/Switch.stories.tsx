import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Composants/Champs/Switch",
  component: Switch,
  parameters: { layout: "padded" },
  args: { children: "Facture en PDF jointe", description: "S'applique tout de suite à cette commande." },
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const ParDefaut: Story = {};

/** États ; ligne de réglage : libellé masqué, interrupteur calé à droite (D-136). */
export const Etats: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-2">
      <Switch>Éteint</Switch>
      <Switch defaultSelected>Allumé</Switch>
      <Switch isDisabled defaultSelected>Désactivé</Switch>
      <div className="flex items-center gap-4 border-t border-line py-2.5">
        <div className="flex-1">
          Rappels par e-mail
          <div className="text-sm text-fg-3">Un e-mail la veille de chaque échéance.</div>
        </div>
        <Switch hideLabel defaultSelected>Rappels par e-mail</Switch>
      </div>
    </div>
  ),
};

/** Clic ou Espace : bascule ; l'effet s'applique tout de suite (D-007, D-137). */
export const Bascule: Story = {
  render: () => {
    const [on, setOn] = useState(false);
    return (
      <div className="flex flex-col gap-2">
        <Switch isSelected={on} onChange={setOn}>Mode avion</Switch>
        <output data-testid="etat">{on ? "Activé" : "Désactivé"}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const sw = c.getByRole("switch", { name: "Mode avion" });
    await userEvent.click(c.getByText("Mode avion"));
    await expect(sw).toBeChecked();
    await expect(c.getByTestId("etat")).toHaveTextContent("Activé");
    await userEvent.keyboard(" ");
    await expect(c.getByTestId("etat")).toHaveTextContent("Désactivé");
  },
};

/** Libellé masqué : il reste le nom accessible (D-136). */
export const LibelleMasque: Story = {
  args: { hideLabel: true, children: "Lien public" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("switch", { name: "Lien public" })).toBeInTheDocument();
    await expect(c.queryByText("Lien public")).toBeNull();
  },
};
