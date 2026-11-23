import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { SplitButton } from "./SplitButton";
import { Button } from "../Button/Button";

const onSave = fn();
const onSaveAs = fn();
const onSaveClose = fn();

const items = [
  { id: "save-as", label: "Enregistrer sous…", onAction: onSaveAs },
  { id: "save-close", label: "Enregistrer et fermer", onAction: onSaveClose },
];

const meta: Meta<typeof SplitButton> = {
  title: "Composants/SplitButton",
  component: SplitButton,
  parameters: { layout: "padded" },
  args: { children: "Enregistrer", variant: "primary", items, onPress: onSave },
};
export default meta;
type Story = StoryObj<typeof SplitButton>;

const body = () => within(document.body);
const px = (el: Element, prop: string) => parseFloat(getComputedStyle(el).getPropertyValue(prop));

export const ParDefaut: Story = {};

/** Deux cibles accolées, deux noms ; même hauteur que Button ; coins extérieurs arrondis ; séparateur de 1 px (D-365). */
export const Anatomie: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-3">
        <SplitButton {...args} />
        <Button variant="primary">Témoin</Button>
      </div>
      <div className="flex items-center gap-3">
        <SplitButton {...args} variant="secondary" size="sm">
          Exporter
        </SplitButton>
        <Button size="sm">Témoin sm</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const main = c.getByRole("button", { name: "Enregistrer" });
    const chevron = c.getByRole("button", { name: "Plus d'options pour Enregistrer" });
    await expect(chevron).toHaveAttribute("aria-haspopup");
    // Même hauteur que Button, pour les deux tailles.
    await expect(main.offsetHeight).toBe(c.getByRole("button", { name: "Témoin" }).offsetHeight);
    await expect(chevron.offsetHeight).toBe(main.offsetHeight);
    const sm = c.getByRole("button", { name: "Plus d'options pour Exporter" });
    await expect(sm.offsetHeight).toBe(c.getByRole("button", { name: "Témoin sm" }).offsetHeight);
    // Accolés : pas d'écart.
    await expect(Math.round(chevron.getBoundingClientRect().left)).toBe(Math.round(main.getBoundingClientRect().right));
    // Rayon sur les coins extérieurs seulement.
    await expect(px(main, "border-top-left-radius")).toBe(8);
    await expect(px(main, "border-top-right-radius")).toBe(0);
    await expect(px(chevron, "border-top-left-radius")).toBe(0);
    await expect(px(chevron, "border-bottom-right-radius")).toBe(8);
    // Séparateur de 1 px.
    await expect(px(chevron, "border-left-width")).toBe(1);
  },
};

/** Le libellé lance l'action par défaut, sans ouvrir le menu. */
export const ActionParDefaut: Story = {
  play: async ({ canvasElement }) => {
    onSave.mockClear();
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Enregistrer" }));
    await expect(onSave).toHaveBeenCalledTimes(1);
    await expect(body().queryByRole("menu")).toBeNull();
  },
};

/** Le chevron ouvre le menu des variantes ; choisir lance la variante et ferme le menu. */
export const Variantes: Story = {
  play: async ({ canvasElement }) => {
    onSave.mockClear();
    onSaveAs.mockClear();
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Plus d'options pour Enregistrer" }));
    const menu = await waitFor(() => body().getByRole("menu", { name: "Plus d'options pour Enregistrer" }));
    await expect(within(menu).getAllByRole("menuitem")).toHaveLength(2);
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Enregistrer sous…" }));
    await expect(onSaveAs).toHaveBeenCalledTimes(1);
    await expect(onSave).not.toHaveBeenCalled();
    await waitFor(() => expect(body().queryByRole("menu")).toBeNull());
  },
};

/** Clavier : deux arrêts de Tab ; ↓ sur le chevron ouvre le menu sur la première variante ; Échap rend le focus. */
export const Clavier: Story = {
  render: (args) => (
    <div className="flex gap-2">
      <button type="button">Avant</button>
      <SplitButton {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    c.getByRole("button", { name: "Avant" }).focus();
    await userEvent.tab();
    await expect(document.activeElement).toBe(c.getByRole("button", { name: "Enregistrer" }));
    await userEvent.tab();
    const chevron = c.getByRole("button", { name: "Plus d'options pour Enregistrer" });
    await expect(document.activeElement).toBe(chevron);
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement).toHaveTextContent("Enregistrer sous…"));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("menu")).toBeNull());
    await expect(document.activeElement).toBe(chevron);
  },
};

/** En attente : roue dans le bouton ; les deux parties ignorent les clics et le clavier ; le focus reste (D-105). */
export const EnAttente: Story = {
  args: { isPending: true },
  play: async ({ canvasElement }) => {
    onSave.mockClear();
    const c = within(canvasElement);
    const main = c.getByRole("button", { name: /^Enregistrer/ });
    await expect(within(main).getByRole("progressbar")).toBeInTheDocument();
    await userEvent.click(main);
    await expect(onSave).not.toHaveBeenCalled();
    const chevron = c.getByRole("button", { name: "Plus d'options pour Enregistrer" });
    await userEvent.click(chevron);
    chevron.focus();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await new Promise((r) => setTimeout(r, 150));
    await expect(body().queryByRole("menu")).toBeNull();
    await expect(document.activeElement).toBe(chevron);
  },
};

/** Inactif avec une raison : les deux parties restent focusables, ne font rien et donnent la raison. */
export const Inactif: Story = {
  args: { disabledReason: "Aucune modification à enregistrer." },
  play: async ({ canvasElement }) => {
    onSave.mockClear();
    const c = within(canvasElement);
    const main = c.getByRole("button", { name: "Enregistrer" });
    const chevron = c.getByRole("button", { name: "Plus d'options pour Enregistrer" });
    for (const b of [main, chevron]) {
      await expect(b).toHaveAttribute("aria-disabled", "true");
      await expect(b).toHaveAccessibleDescription("Aucune modification à enregistrer.");
    }
    await userEvent.click(main);
    await userEvent.click(chevron);
    await new Promise((r) => setTimeout(r, 150));
    await expect(onSave).not.toHaveBeenCalled();
    await expect(body().queryByRole("menu")).toBeNull();
  },
};

/** Désactivé : les deux parties sont désactivées. */
export const Desactive: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("button", { name: "Enregistrer" })).toBeDisabled();
    await expect(c.getByRole("button", { name: "Plus d'options pour Enregistrer" })).toBeDisabled();
  },
};
