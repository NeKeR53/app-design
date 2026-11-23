import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { IconButton } from "./IconButton";
import { ListDetail, PanelLeft, Search, Settings, X } from "../../icons";

const meta: Meta<typeof IconButton> = {
  title: "Composants/IconButton",
  component: IconButton,
  parameters: { layout: "padded" },
  args: { icon: <Search />, label: "Rechercher", shortcut: "Mod+K", onPress: fn() },
};
export default meta;
type Story = StoryObj<typeof IconButton>;
const body = () => within(document.body);

export const ParDefaut: Story = {};

/** Tous les états, côte à côte. */
export const Etats: Story = {
  render: () => (
    <div className="flex items-center gap-0.5">
      <IconButton icon={<PanelLeft />} label="Replier la sidebar" shortcut="Mod+B" />
      <IconButton icon={<ListDetail />} label="Panneau de détail" isSelected onChange={() => {}} />
      <IconButton icon={<Settings />} label="Réglages" />
      <IconButton icon={<X />} label="Fermer" isDisabled />
    </div>
  ),
};

/** L'info-bulle reprend le libellé et le raccourci (D-031, D-032). */
export const InfoBulle: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Rechercher" });
    await expect(button).toHaveAttribute("aria-keyshortcuts");
    await userEvent.tab();
    const tip = await waitFor(() => body().getByRole("tooltip"));
    await expect(tip.textContent).toMatch(/Rechercher(⌘K|Ctrl\+K)/);
  },
};

/** Bascule : un clic inverse l'état et met à jour aria-pressed (D-034). */
export const Bascule: Story = {
  render: () => {
    const [on, setOn] = useState(true);
    return <IconButton icon={<ListDetail />} label="Panneau de détail" isSelected={on} onChange={setOn} />;
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Panneau de détail" });
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "false");
  },
};

/** Désactivé : ni action, ni info-bulle. */
export const Desactive: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button");
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onPress).not.toHaveBeenCalled();
    await userEvent.hover(button, { pointerEventsCheck: 0 });
    await new Promise((r) => setTimeout(r, 700));
    await expect(body().queryByRole("tooltip")).toBeNull();
  },
};
