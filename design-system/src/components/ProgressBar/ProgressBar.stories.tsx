import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ProgressBar } from "./ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "Composants/ProgressBar",
  component: ProgressBar,
  parameters: { layout: "padded" },
  args: { label: "Import des contacts", value: 60 },
  decorators: [(S) => <div className="w-72">{S()}</div>],
};
export default meta;
type Story = StoryObj<typeof ProgressBar>;

/** Pourcentage à droite du libellé ; rail de 4 px (D-164). */
export const ParDefaut: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const bar = c.getByRole("progressbar", { name: "Import des contacts" });
    await expect(bar).toHaveAttribute("aria-valuenow", "60");
    await expect(bar).toHaveTextContent(/60\s?%/);
    const track = bar.querySelector(".bg-field") as HTMLElement;
    await expect(track.getBoundingClientRect().height).toBe(4);
  },
};

/** `max` autre que 100 : « 18 / 30 », annoncé « 18 sur 30 ». */
export const Fraction: Story = {
  args: { label: "Tâches faites", value: 18, max: 30 },
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole("progressbar");
    await expect(bar).toHaveTextContent("18 / 30");
    await expect(bar).toHaveAttribute("aria-valuetext", "18 sur 30");
  },
};

/** Valeurs hors bornes : ramenées entre 0 et `max`. */
export const Bornes: Story = {
  args: { label: "Espace utilisé", value: 140 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  },
};

export const Tons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ProgressBar label="Avancement" value={40} />
      <ProgressBar label="Espace utilisé" value={92} tone="warning" />
      <ProgressBar label="Quota dépassé" value={100} tone="danger" />
    </div>
  ),
};

/** Sans valeur : indéterminée, sans valeur affichée ni `aria-valuenow`. */
export const Indeterminee: Story = {
  render: () => <ProgressBar label="Import des fichiers" />,
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole("progressbar");
    await expect(bar).not.toHaveAttribute("aria-valuenow");
    await expect(bar.querySelector(".socle-reload")).not.toBeNull();
  },
};
