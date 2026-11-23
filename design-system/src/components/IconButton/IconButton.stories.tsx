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

/** Icône de l'app (D-011), ici « actualiser ». */
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
  </svg>
);

/** Chargement (D-107) : l'icône devient une roue, les clics sont ignorés, le focus et l'info-bulle restent. */
export const Chargement: Story = {
  render: (args) => {
    const [pending, setPending] = useState(false);
    return <IconButton icon={<RefreshIcon />} label="Actualiser" shortcut="F5" isPending={pending} onPress={() => { args.onPress?.(); setPending(true); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: /Actualiser/ });
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute("data-pending", "true"));
    await expect(button).toHaveFocus();
    await expect(within(button).getByRole("progressbar", { name: "Chargement" })).toBeInTheDocument();
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
    // Un clic ferme l'info-bulle ; elle revient au survol suivant.
    await userEvent.unhover(button);
    await userEvent.hover(button);
    await waitFor(() => expect(body().getByRole("tooltip")).toHaveTextContent("Actualiser"), { timeout: 1500 });
  },
};
