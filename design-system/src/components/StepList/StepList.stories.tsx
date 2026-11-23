import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { StepList, type StepItem } from "./StepList";
import { Button } from "../Button/Button";

const steps: StepItem[] = [
  { id: "compte", title: "Compte", description: "Nom et adresse" },
  { id: "connexion", title: "Connexion", description: "Serveur et clé" },
  { id: "import", title: "Import", description: "Données de départ" },
  { id: "verification", title: "Vérification", description: "Résumé" },
];

const meta: Meta<typeof StepList> = {
  title: "Composants/StepList",
  component: StepList,
  parameters: { layout: "padded" },
  args: { label: "Étapes de l'installation", steps, current: "connexion" },
};
export default meta;
type Story = StoryObj<typeof StepList>;

/** Pastilles reliées par un trait ; états déduits de l'étape en cours (D-325). */
export const ParDefaut: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const list = c.getByRole("list", { name: "Étapes de l'installation" });
    const items = within(list).getAllByRole("listitem");
    await expect(items).toHaveLength(4);
    await expect(items[1]).toHaveAttribute("aria-current", "step");
    await expect(items[0]).toHaveTextContent("Compte (fait)");
    // Sans onSelect : un simple repère, aucun bouton.
    await expect(c.queryByRole("button")).toBeNull();
  },
};

/** Étape en erreur : pastille rouge et « ! » (D-325). */
export const Erreur: Story = {
  args: { current: "import", steps: steps.map((s) => (s.id === "connexion" ? { ...s, status: "error" as const, description: "Connexion refusée" } : s)) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("listitem")[1]).toHaveTextContent("Connexion (erreur)");
  },
};

/** Retour en arrière : faites et en erreur cliquables ; à faire jamais (D-326). */
export const RetourArriere: Story = {
  args: { onSelect: fn(), current: "import" },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const buttons = c.getAllByRole("button");
    await expect(buttons).toHaveLength(2);
    await userEvent.click(c.getByRole("button", { name: /Connexion/ }));
    await expect(args.onSelect).toHaveBeenCalledWith("connexion");
    await userEvent.tab({ shift: true });
    await expect(c.getByRole("button", { name: /Compte/ })).toHaveFocus();
  },
};

/** Vertical : pour une liste de configuration sur le côté. */
export const Vertical: Story = { args: { orientation: "vertical" }, render: (args) => <div className="w-64"><StepList {...args} /></div> };

/** Largeur étroite : sans aide sous 560 px ; seul le titre de l'étape en cours sous 380 px (D-326). */
export const Etroit: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="w-[480px]"><StepList {...args} /></div>
      <div className="w-[340px]"><StepList {...args} label="Étapes (étroit)" /></div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByText("Serveur et clé")[0]).not.toBeVisible();
    const narrow = c.getByRole("list", { name: "Étapes (étroit)" });
    await expect(within(narrow).getByText("Compte", { exact: false })).not.toBeVisible();
    await expect(within(narrow).getByText("Connexion")).toBeVisible();
  },
};

/** Dans un assistant : les boutons du parcours avancent, la liste ramène en arrière. */
export const DansUnAssistant: Story = {
  render: (args) => {
    const [at, setAt] = useState(1);
    return (
      <div className="flex max-w-[640px] flex-col gap-4">
        <StepList {...args} current={steps[at]!.id} onSelect={(id) => setAt(steps.findIndex((s) => s.id === id))} />
        <div className="flex justify-end gap-2">
          <Button onPress={() => setAt(Math.max(0, at - 1))}>Précédent</Button>
          <Button variant="primary" onPress={() => setAt(Math.min(steps.length - 1, at + 1))}>Suivant</Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await expect(c.getAllByRole("listitem")[2]).toHaveAttribute("aria-current", "step");
    await userEvent.click(c.getByRole("button", { name: /Compte/ }));
    await expect(c.getAllByRole("listitem")[0]).toHaveAttribute("aria-current", "step");
  },
};
