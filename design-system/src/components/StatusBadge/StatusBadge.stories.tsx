import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { StatusBadge, StatusDot, type StatusTone } from "./StatusBadge";

const meta: Meta<typeof StatusBadge> = {
  title: "Composants/StatusBadge",
  component: StatusBadge,
  parameters: { layout: "padded" },
  args: { children: "En retard", tone: "warning" },
};
export default meta;
type Story = StoryObj<typeof StatusBadge>;
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
        <StatusBadge key={t} tone={t}>
          {l}
        </StatusBadge>
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
      <StatusBadge tone="info">En attente de validation par le responsable</StatusBadge>
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
        <StatusDot key={t} tone={t} label={l} />
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
