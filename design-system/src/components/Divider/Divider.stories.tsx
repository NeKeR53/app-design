import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Divider } from "./Divider";

const meta: Meta<typeof Divider> = {
  title: "Composants/Divider",
  component: Divider,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Divider>;

/** Trait `--line` de 1 px entre deux groupes (D-168). */
export const Horizontal: Story = {
  render: () => (
    <div className="w-72 text-md text-fg">
      <div>Groupe 1</div>
      <Divider />
      <div>Groupe 2</div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const sep = within(canvasElement).getByRole("separator");
    await expect(Math.round(sep.getBoundingClientRect().height)).toBe(1);
  },
};

/** Vertical, entre deux éléments d'une barre. */
export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-2 text-md text-fg">
      <span>Projets</span>
      <Divider orientation="vertical" />
      <span className="text-fg-3">12 projets</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const sep = within(canvasElement).getByRole("separator");
    await expect(sep).toHaveAttribute("aria-orientation", "vertical");
    await expect(Math.round(sep.getBoundingClientRect().width)).toBe(1);
  },
};
