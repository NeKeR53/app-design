import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { SourceList, type SourceItem } from "./SourceList";

const meta: Meta<typeof SourceList> = {
  title: "Composants/SourceList",
  component: SourceList,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof SourceList>;

const SOURCES: SourceItem[] = [
  { id: "p-12", title: "Guide des drivers LED", detail: "p. 12", excerpt: "Les drivers sont garantis cinq ans à compter de la date de livraison, pièces et main-d'œuvre." },
  { id: "p-3", title: "Conditions générales de vente", detail: "p. 3", excerpt: "La garantie ne couvre pas une pose non conforme aux indications de la notice." },
  { id: "p-41", title: "Catalogue 2026 — gamme Halo, appliques et suspensions", detail: "p. 41" },
];

/** Une puce par source, numérotée dans l'ordre de la réponse ; un clic ouvre la source (D-411). */
export const ParDefaut: Story = {
  args: { sources: SOURCES, onOpen: fn() },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("list", { name: "Sources" })).toBeVisible();
    await expect(c.getAllByRole("listitem")).toHaveLength(3);
    const second = c.getByRole("button", { name: "Source 2 : Conditions générales de vente, p. 3" });
    await userEvent.click(second);
    await expect(args.onOpen).toHaveBeenCalledWith(SOURCES[1], 1);
  },
};

/** La source montrée dans le panneau de détail est marquée (`aria-current`). */
function Courante() {
  const [current, setCurrent] = useState<string | null>("p-12");
  return <SourceList sources={SOURCES} currentId={current} onOpen={(s) => setCurrent(s.id)} />;
}

export const SourceCourante: Story = {
  render: () => <Courante />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const first = c.getByRole("button", { name: /^Source 1/ });
    const third = c.getByRole("button", { name: /^Source 3/ });
    await expect(first).toHaveAttribute("aria-current", "true");
    await expect(third).not.toHaveAttribute("aria-current");
    await userEvent.click(third);
    await expect(third).toHaveAttribute("aria-current", "true");
    await expect(first).not.toHaveAttribute("aria-current");
  },
};

/** Au survol ou au focus, l'info-bulle donne le titre entier et le passage cité. */
export const PassageEnInfoBulle: Story = {
  args: { sources: SOURCES, onOpen: fn() },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await expect(c.getByRole("button", { name: /^Source 1/ })).toHaveFocus();
    const tip = await within(document.body).findByRole("tooltip");
    await expect(tip).toHaveTextContent("Guide des drivers LED · p. 12");
    await expect(tip).toHaveTextContent("garantis cinq ans");
  },
};

/** Un titre long est coupé par « … » ; la puce ne dépasse pas 320 px, le détail reste visible. */
export const TitreLong: Story = {
  args: { sources: [SOURCES[2]!], onOpen: fn() },
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByRole("button");
    await expect(chip.getBoundingClientRect().width).toBeLessThanOrEqual(320);
    await expect(within(chip).getByText("p. 41")).toBeVisible();
  },
};

/** Sans `onOpen`, les puces se lisent sans être cliquables. */
export const SansOuverture: Story = {
  args: { sources: SOURCES },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("button")).toBeNull();
    await expect(c.getByText("Source 1 : Guide des drivers LED, p. 12")).toBeInTheDocument();
  },
};

/** Les puces passent à la ligne dans une colonne étroite. */
export const Etroite: Story = {
  args: { sources: SOURCES, onOpen: fn() },
  decorators: [(Story) => <div style={{ width: 340 }}><Story /></div>],
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole("listitem");
    await waitFor(() => expect(items[2]!.getBoundingClientRect().top).toBeGreaterThan(items[0]!.getBoundingClientRect().top));
  },
};

/** Aucune source : rien n'est rendu. */
export const Vide: Story = {
  args: { sources: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-source-list]")).toBeNull();
  },
};
