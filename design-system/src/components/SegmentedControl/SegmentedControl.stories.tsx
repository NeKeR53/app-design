import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Columns, ListDetail } from "../../icons";
import { SegmentedControl } from "./SegmentedControl";

const meta: Meta<typeof SegmentedControl> = {
  title: "Composants/SegmentedControl",
  component: SegmentedControl,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof SegmentedControl>;

const views = [
  { value: "list", label: "Liste" },
  { value: "grid", label: "Grille" },
  { value: "card", label: "Carte" },
];

/** Fond `--field` ; le segment choisi est une carte claire (`--surface`, `shadow-sm`). Défaut : la première option. */
export const ParDefaut: Story = {
  args: { label: "Affichage", options: views },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const group = c.getByRole("radiogroup", { name: "Affichage" });
    const probe = document.createElement("div");
    probe.style.background = "var(--field)";
    group.append(probe);
    await expect(getComputedStyle(group).backgroundColor).toBe(getComputedStyle(probe).backgroundColor);
    probe.remove();
    const list = c.getByRole("radio", { name: "Liste" });
    await expect(list).toBeChecked();
    const chosen = list.closest("label")!;
    const other = c.getByRole("radio", { name: "Grille" }).closest("label")!;
    await expect(getComputedStyle(chosen).boxShadow).not.toBe("none");
    await expect(getComputedStyle(other).boxShadow).toBe("none");
    await expect(getComputedStyle(chosen).backgroundColor).not.toBe(getComputedStyle(other).backgroundColor);
  },
};

/** Un seul arrêt de Tab ; les flèches déplacent et choisissent ; le choix s'applique tout de suite. */
export const Clavier: Story = {
  args: { label: "Affichage", options: views, onChange: fn() },
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await expect(c.getByRole("radio", { name: "Liste" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(c.getByRole("radio", { name: "Grille" })).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith("grid");
    await userEvent.keyboard("{ArrowRight}");
    await expect(c.getByRole("radio", { name: "Carte" })).toBeChecked();
    // Le parcours boucle ; bas et haut font comme droite et gauche.
    await userEvent.keyboard("{ArrowRight}");
    await expect(c.getByRole("radio", { name: "Liste" })).toBeChecked();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(c.getByRole("radio", { name: "Carte" })).toBeChecked();
    await userEvent.keyboard("{ArrowUp}");
    await expect(c.getByRole("radio", { name: "Grille" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(c.getByRole("radio", { name: "Carte" })).toBeChecked();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(c.getByRole("radio", { name: "Grille" })).toHaveFocus();
    // Tab quitte le groupe : un seul arrêt.
    await userEvent.tab();
    await expect(canvasElement.contains(document.activeElement)).toBe(false);
  },
};

/** Clic : choix immédiat. Contrôlé par l'app (`value`, `onChange`). */
export const Controle: Story = {
  render: () => {
    const [v, setV] = useState("grid");
    return (
      <div className="flex flex-col gap-2 font-sans text-sm">
        <SegmentedControl label="Affichage" options={views} value={v} onChange={setV} />
        <span data-testid="value">{v}</span>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("radio", { name: "Grille" })).toBeChecked();
    await userEvent.click(c.getByText("Carte"));
    await expect(c.getByRole("radio", { name: "Carte" })).toBeChecked();
    await expect(c.getByTestId("value")).toHaveTextContent("card");
  },
};

/** Icône et libellé ; ou icône seule : le libellé reste le nom accessible et s'affiche en info-bulle au focus. */
export const Icones: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <SegmentedControl
        label="Disposition"
        options={[
          { value: "list", label: "Liste", icon: <ListDetail /> },
          { value: "cols", label: "Colonnes", icon: <Columns /> },
        ]}
      />
      <SegmentedControl
        label="Disposition compacte"
        options={[
          { value: "list", label: "Liste", icon: <ListDetail />, hideLabel: true },
          { value: "cols", label: "Colonnes", icon: <Columns />, hideLabel: true },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const compact = c.getByRole("radiogroup", { name: "Disposition compacte" });
    const cols = within(compact).getByRole("radio", { name: "Colonnes" });
    await expect(within(compact).getByText("Colonnes")).toHaveClass("sr-only");
    within(compact).getByRole("radio", { name: "Liste" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(cols).toBeChecked();
    await waitFor(() => expect(within(document.body).getByRole("tooltip")).toHaveTextContent("Colonnes"));
    await userEvent.tab();
    await waitFor(() => expect(within(document.body).queryByRole("tooltip")).toBeNull());
  },
};

/** Option désactivée : sautée par les flèches. Groupe désactivé : 40 %. */
export const Desactive: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <SegmentedControl label="Période" options={[{ value: "d", label: "Jour" }, { value: "w", label: "Semaine", isDisabled: true }, { value: "m", label: "Mois" }]} />
      <SegmentedControl label="Affichage" options={views} isDisabled />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const period = within(c.getByRole("radiogroup", { name: "Période" }));
    period.getByRole("radio", { name: "Jour" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(period.getByRole("radio", { name: "Mois" })).toBeChecked();
    const off = c.getByRole("radiogroup", { name: "Affichage" });
    await expect(getComputedStyle(off).opacity).toBe("0.4");
    for (const r of within(off).getAllByRole("radio")) await expect(r).toBeDisabled();
  },
};

/** La hauteur suit la densité : `--row-h` (34 px en web, 28 px en desktop). */
export const Densite: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <div data-density="web"><SegmentedControl label="Web" options={views} /></div>
      <div data-density="desktop"><SegmentedControl label="Desktop" options={views} /></div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("radiogroup", { name: "Web" }).getBoundingClientRect().height).toBe(34);
    await expect(c.getByRole("radiogroup", { name: "Desktop" }).getBoundingClientRect().height).toBe(28);
  },
};

/** Sombre : le segment choisi est plus clair que le rail, jamais un creux ; libellés non choisis au-dessus de 4,5:1 (D-436). */
export const Sombre: Story = {
  globals: { theme: "dark" },
  render: () => <SegmentedControl label="État" options={[{ value: "all", label: "Toutes" }, { value: "failed", label: "En échec (1)" }, { value: "running", label: "En cours (2)" }]} defaultValue="all" />,
  play: async ({ canvasElement }) => {
    const rgb = (c: string) => c.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number);
    const lum = (c: string) => {
      const [r, g, b] = rgb(c).map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    const ratio = (a: string, b: string) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi! + 0.05) / (lo! + 0.05);
    };
    const group = within(canvasElement).getByRole("radiogroup", { name: "État" });
    const rail = getComputedStyle(group).backgroundColor;
    const label = (name: string) => within(group).getByRole("radio", { name }).closest("label")!;
    const on = getComputedStyle(label("Toutes"));
    const off = getComputedStyle(label("En échec (1)"));
    await expect(lum(on.backgroundColor)).toBeGreaterThan(lum(rail));
    await expect(ratio(off.color, rail)).toBeGreaterThanOrEqual(4.5);
    await expect(ratio(on.color, on.backgroundColor)).toBeGreaterThanOrEqual(4.5);
  },
};
