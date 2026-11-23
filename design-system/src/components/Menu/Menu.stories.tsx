import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { Key } from "react-aria-components";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Menu } from "./Menu";
import { IconButton } from "../IconButton/IconButton";
import { MoreHorizontal, Plus, Search, Settings } from "../../icons";

const meta: Meta<typeof Menu> = {
  title: "Composants/Menu",
  component: Menu,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Menu>;
const body = () => within(document.body);
const onRename = fn();

const ElementMenu = () => (
  <Menu label="Actions sur l'élément" trigger={<IconButton icon={<MoreHorizontal />} label="Plus d'actions" />}>
    <Menu.Item label="Nouveau document" icon={<Plus />} shortcut="Mod+N" />
    <Menu.Item label="Rechercher" icon={<Search />} shortcut="Mod+K" />
    <Menu.Item label="Renommer…" onAction={onRename} />
    <Menu.Submenu label="Déplacer vers">
      <Menu.Item label="Achats" />
      <Menu.Item label="Compta" />
      <Menu.Item label="RH" />
    </Menu.Submenu>
    <Menu.Separator />
    <Menu.Item label="Réglages" icon={<Settings />} shortcut="Mod+," />
    <Menu.Separator />
    <Menu.Item label="Supprimer" danger />
  </Menu>
);

export const ParDefaut: Story = { render: () => <ElementMenu /> };

/** Le clavier ouvre le menu sur le premier élément ; Échap rend le focus au bouton. */
export const Ouverture: Story = {
  render: () => <ElementMenu />,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Plus d'actions" });
    button.focus();
    await userEvent.keyboard("{ArrowDown}");
    const menu = await waitFor(() => body().getByRole("menu"));
    await waitFor(() => expect(document.activeElement).toHaveTextContent("Nouveau document"));
    await expect(within(menu).getAllByRole("menuitem").length).toBeGreaterThan(3);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("menu")).toBeNull());
    await expect(document.activeElement).toBe(button);
  },
};

/** Un clic déclenche l'action et ferme le menu. */
export const Action: Story = {
  render: () => <ElementMenu />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Plus d'actions" }));
    await userEvent.click(await waitFor(() => body().getByRole("menuitem", { name: /Renommer/ })));
    await expect(onRename).toHaveBeenCalled();
    await waitFor(() => expect(body().queryByRole("menu")).toBeNull());
  },
};

/** Sous-menu sur un niveau : flèche droite l'ouvre, flèche gauche le referme (D-051). */
export const SousMenu: Story = {
  render: () => <ElementMenu />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Plus d'actions" }));
    const item = await waitFor(() => body().getByRole("menuitem", { name: /Déplacer vers/ }));
    item.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(body().getAllByRole("menu")).toHaveLength(2));
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(body().getAllByRole("menu")).toHaveLength(1));
  },
};

/** Choix : coche à droite ; un choix unique ferme le menu (D-050). */
export const Choix: Story = {
  render: () => {
    const [sort, setSort] = useState<Set<Key>>(new Set(["date"]));
    return (
      <Menu label="Trier" trigger={<IconButton icon={<MoreHorizontal />} label="Trier" />}>
        <Menu.Section title="Trier par" selectionMode="single" selectedKeys={sort} onSelectionChange={setSort}>
          <Menu.Item id="name" label="Nom" />
          <Menu.Item id="date" label="Date de modification" />
        </Menu.Section>
      </Menu>
    );
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Trier" });
    await userEvent.click(button);
    await expect(await waitFor(() => body().getByRole("menuitemradio", { name: "Date de modification" }))).toHaveAttribute("aria-checked", "true");
    await userEvent.click(body().getByRole("menuitemradio", { name: "Nom" }));
    await waitFor(() => expect(body().queryByRole("menu")).toBeNull());
    await userEvent.click(button);
    await expect(await waitFor(() => body().getByRole("menuitemradio", { name: "Nom" }))).toHaveAttribute("aria-checked", "true");
  },
};

/** Les libellés restent alignés : place réservée pour l'icône (D-047). */
export const Placement: Story = {
  render: () => <ElementMenu />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Plus d'actions" }));
    const items = await waitFor(() => body().getAllByRole("menuitem"));
    const left = (name: RegExp) => items.find((i) => name.test(i.textContent ?? ""))!.querySelector("span.truncate")!.getBoundingClientRect().left;
    await waitFor(() => expect(left(/Renommer/)).toBe(left(/Nouveau document/)));
    await expect(items.find((i) => /Nouveau/.test(i.textContent ?? ""))).toHaveAttribute("aria-keyshortcuts");
    const menu = body().getByRole("menu").getBoundingClientRect();
    await expect(menu.right).toBeLessThanOrEqual(window.innerWidth);
  },
};
