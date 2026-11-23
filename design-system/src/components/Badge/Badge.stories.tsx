import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Badge, BadgeDot, type StatusTone } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Composants/Badge",
  component: Badge,
  parameters: { layout: "padded" },
  args: { children: "En retard", tone: "warning" },
};
export default meta;
type Story = StoryObj<typeof Badge>;
const body = () => within(document.body);

const TONES: Array<[StatusTone, string]> = [
  ["neutral", "Archivé"],
  ["pending", "À venir"],
  ["info", "Nouveau"],
  ["success", "Terminé"],
  ["warning", "En retard"],
  ["danger", "Bloqué"],
];

export const ParDefaut: Story = {};

/** Les six tons (D-161) : le libellé est toujours visible (D-160). */
export const Tons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {TONES.map(([t, l]) => (
        <Badge key={t} tone={t}>
          {l}
        </Badge>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    for (const [, l] of TONES) await expect(c.getByText(l)).toBeVisible();
  },
};

/** Libellé trop long : coupé, sans retour à la ligne. */
export const LibelleLong: Story = {
  render: () => (
    <div className="w-32">
      <Badge tone="info">En attente de validation par le responsable</Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const label = within(canvasElement).getByText(/En attente/);
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
  },
};

/** Point seul : nommé, joignable au clavier, info-bulle au focus (D-162). */
export const PointSeul: Story = {
  render: () => (
    <div className="flex gap-2 pt-10">
      {TONES.map(([t, l]) => (
        <BadgeDot key={t} tone={t} label={l} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole("img")).toHaveLength(6);
    await userEvent.tab();
    await expect(c.getByRole("img", { name: "Archivé" })).toHaveFocus();
    const tip = await waitFor(() => body().getByRole("tooltip"));
    await expect(tip).toHaveTextContent("Archivé");
    const box = c.getByRole("img", { name: "Archivé" }).getBoundingClientRect();
    await expect(box.width).toBeGreaterThanOrEqual(24);
  },
};

/** Hors d'une grille, le point reste dans l'ordre de tabulation ; dans `Table`, voir « Point dans la grille ». */
export const PointHorsGrille: Story = {
  render: () => <BadgeDot tone="success" label="Terminé" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("img", { name: "Terminé" })).toHaveAttribute("tabindex", "0");
  },
};
