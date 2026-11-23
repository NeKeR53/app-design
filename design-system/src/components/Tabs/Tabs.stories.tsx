import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Tabs, type TabItem } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Composants/Tabs",
  component: Tabs,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Tabs>;
const body = () => within(document.body);

const BASE: TabItem[] = [
  { id: "all", label: "Tous les documents" },
  { id: "new", label: "Créer un rapport" },
  { id: "arch", label: "Archives" },
  { id: "r1", label: "Rapport trimestriel des ventes de la région Sud-Ouest", closable: true },
];

function Demo({ initial = BASE, width }: { initial?: TabItem[]; width?: number }) {
  const [items, setItems] = useState(initial);
  const [sel, setSel] = useState(initial[0]!.id);
  return (
    <div style={width ? { width } : undefined} className="flex items-center gap-2 border-b border-line pb-1">
      <span className="font-semibold text-fg">Documents</span>
      <Tabs pageTitle="Documents" items={items} selectedId={sel} onSelectionChange={setSel} onClose={(id) => setItems((xs) => xs.filter((x) => x.id !== id))} />
      <output data-testid="sel" className="ml-auto text-sm text-fg-3">{sel}</output>
    </div>
  );
}
const sel = (c: HTMLElement) => within(c).getByTestId("sel").textContent;

export const ParDefaut: Story = { render: () => <Demo /> };

/** Un clic active la vue ; flèches : activation immédiate ; Origine et Fin (D-021). */
export const Selection: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("tab", { name: /Créer un rapport/ }));
    await expect(sel(canvasElement)).toBe("new");
    await userEvent.keyboard("{ArrowRight}");
    await expect(sel(canvasElement)).toBe("arch");
    await userEvent.keyboard("{End}");
    await expect(sel(canvasElement)).toBe("r1");
    await expect(c.getByRole("tablist")).toHaveAccessibleName("Vues de la page Documents");
  },
};

/** Mod+1 à 9 activent la vue de même rang (D-021). */
export const Raccourcis: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const mod = /mac/i.test(navigator.platform) ? "Meta" : "Control";
    await userEvent.keyboard(`{${mod}>}3{/${mod}}`);
    await expect(sel(canvasElement)).toBe("arch");
  },
};

/** Fermer la vue active active la vue de gauche ; une vue fixe n'a pas de × (D-021, D-041). */
export const Fermeture: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("button", { name: /Fermer la vue Archives/ })).toBeNull();
    await userEvent.click(c.getByRole("tab", { name: /Rapport trimestriel/ }));
    await userEvent.click(c.getByRole("button", { name: /Fermer la vue Rapport/ }));
    await expect(c.queryByRole("tab", { name: /Rapport trimestriel/ })).toBeNull();
    await expect(sel(canvasElement)).toBe("arch");
  },
};

/** Suppr ferme la vue fermable qui a le focus. */
export const FermetureClavier: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("tab", { name: /Rapport trimestriel/ }));
    await userEvent.keyboard("{Delete}");
    await waitFor(() => expect(c.queryByRole("tab", { name: /Rapport trimestriel/ })).toBeNull());
  },
};

const MANY: TabItem[] = [
  ...BASE,
  ...["Budget 2027", "Contrat cadre fournisseur", "Plan de formation", "Compte rendu", "Note de service", "Inventaire annuel"].map((label, i) => ({
    id: `x${i}`,
    label,
    closable: true,
  })),
];

/** Trop de vues : la rangée défile, le chevron liste toutes les vues (D-027). */
export const Debordement: Story = {
  render: () => <Demo initial={MANY} width={640} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const chevron = await waitFor(() => c.getByRole("button", { name: "Toutes les vues" }));
    await userEvent.click(chevron);
    const list = await waitFor(() => body().getByRole("grid", { name: "Toutes les vues" }));
    await expect(within(list).getAllByRole("row")).toHaveLength(MANY.length);
    // Le × de la liste ferme une vue fermable (D-027).
    await userEvent.click(within(list).getByRole("button", { name: "Fermer la vue Budget 2027" }));
    await waitFor(() => expect(c.queryByRole("tab", { name: /Budget 2027/ })).toBeNull());
    await userEvent.click(within(list).getByRole("row", { name: /Inventaire annuel/ }));
    await expect(sel(canvasElement)).toBe("x5");
    await waitFor(() => expect(body().queryByRole("grid", { name: "Toutes les vues" })).toBeNull());
    const tab = c.getByRole("tab", { name: /Inventaire annuel/ });
    const tablist = c.getByRole("tablist");
    await waitFor(() => expect(tab.getBoundingClientRect().right).toBeLessThanOrEqual(tablist.getBoundingClientRect().right + 1));
  },
};

/** Libellé tronqué à 200 px : texte complet dans l'info-bulle Socle, au focus clavier. */
export const LibelleTronque: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("tab", { name: /Tous les documents/ }));
    await userEvent.keyboard("{End}");
    const tip = await waitFor(() => body().getByRole("tooltip"));
    await expect(tip).toHaveTextContent("Rapport trimestriel des ventes de la région Sud-Ouest");
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(body().queryByRole("tooltip")).toBeNull());
  },
};
