import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { Key } from "react-aria-components";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { DropdownMenu, useContextMenu } from "./DropdownMenu";
import { IconButton } from "../IconButton/IconButton";
import { MoreHorizontal, Plus, Search, Settings } from "../../icons";

const meta: Meta<typeof DropdownMenu> = {
  title: "Composants/DropdownMenu",
  component: DropdownMenu,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof DropdownMenu>;
const body = () => within(document.body);
const onRename = fn();

const ElementMenu = () => (
  <DropdownMenu label="Actions sur l'élément" trigger={<IconButton icon={<MoreHorizontal />} label="Plus d'actions" />}>
    <DropdownMenu.Item label="Nouveau document" icon={<Plus />} shortcut="Mod+N" />
    <DropdownMenu.Item label="Rechercher" icon={<Search />} shortcut="Mod+K" />
    <DropdownMenu.Item label="Renommer…" onAction={onRename} />
    <DropdownMenu.Submenu label="Déplacer vers">
      <DropdownMenu.Item label="Achats" />
      <DropdownMenu.Item label="Compta" />
      <DropdownMenu.Item label="RH" />
    </DropdownMenu.Submenu>
    <DropdownMenu.Separator />
    <DropdownMenu.Item label="Réglages" icon={<Settings />} shortcut="Mod+," />
    <DropdownMenu.Separator />
    <DropdownMenu.Item label="Supprimer" danger />
  </DropdownMenu>
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
    // React Aria rend le focus au bouton juste après la fermeture : on l'attend.
    await waitFor(() => expect(document.activeElement).toBe(button));
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
      <DropdownMenu label="Trier" trigger={<IconButton icon={<MoreHorizontal />} label="Trier" />}>
        <DropdownMenu.Section title="Trier par" selectionMode="single" selectedKeys={sort} onSelectionChange={setSort}>
          <DropdownMenu.Item id="name" label="Nom" />
          <DropdownMenu.Item id="date" label="Date de modification" />
        </DropdownMenu.Section>
      </DropdownMenu>
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

/* ---------- Ouverture à un point, au clic droit (D-327) ---------- */
const onOpenRow = fn();
const rows = ["Refonte du site", "Application mobile", "Rapport annuel"];

function RowsWithContextMenu() {
  const { targetProps, menuProps } = useContextMenu();
  const [target, setTarget] = useState(rows[0]!);
  return (
    <div className="w-80 border border-line">
      {rows.map((name) => (
        <div
          key={name}
          tabIndex={0}
          className="flex h-(--row-h) items-center border-b border-line px-3 outline-none last:border-b-0 focus-visible:bg-hover"
          onContextMenu={(e) => {
            setTarget(name);
            targetProps.onContextMenu(e);
          }}
          onKeyDown={(e) => {
            setTarget(name);
            targetProps.onKeyDown(e);
          }}
        >
          {name}
        </div>
      ))}
      <DropdownMenu label={`Actions sur « ${target} »`} title={target} {...menuProps}>
        <DropdownMenu.Item label="Ouvrir" onAction={() => onOpenRow(target)} />
        <DropdownMenu.Item label="Renommer…" />
        <DropdownMenu.Separator />
        <DropdownMenu.Item label="Supprimer…" danger />
      </DropdownMenu>
    </div>
  );
}

/** Clic droit : le menu s'ouvre au point du clic, avec l'objet en titre ; un choix le ferme (D-327). */
export const ClicDroit: Story = {
  render: () => <RowsWithContextMenu />,
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByText("Application mobile");
    const r = row.getBoundingClientRect();
    await userEvent.pointer({ keys: "[MouseRight]", target: row, coords: { clientX: r.left + 40, clientY: r.top + 10 } });
    const menu = await waitFor(() => body().getByRole("menu", { name: "Actions sur « Application mobile »" }));
    const box = menu.getBoundingClientRect();
    await expect(Math.abs(box.left - (r.left + 40))).toBeLessThan(12);
    await expect(body().getAllByText("Application mobile").length).toBe(2);
    await waitFor(() => expect(document.activeElement).toHaveTextContent("Ouvrir"));
    await userEvent.keyboard("{Enter}");
    await expect(onOpenRow).toHaveBeenCalledWith("Application mobile");
    await waitFor(() => expect(body().queryByRole("menu")).toBeNull());
  },
};

/** Maj+F10 sur la ligne : le menu s'ouvre sous elle ; Échap le ferme (D-327). */
export const ClavierContextuel: Story = {
  render: () => <RowsWithContextMenu />,
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await waitFor(() => body().getByRole("menu", { name: "Actions sur « Refonte du site »" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("menu")).toBeNull());
  },
};

/** Ouvert à un point : un défilement le ferme (D-327). */
export const FermeAuDefilement: Story = {
  render: () => <RowsWithContextMenu />,
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByText("Rapport annuel");
    await userEvent.pointer({ keys: "[MouseRight]", target: row });
    await waitFor(() => body().getByRole("menu"));
    window.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(body().queryByRole("menu")).toBeNull());
  },
};

/** Titre facultatif sur un menu à bouton. */
export const AvecTitre: Story = {
  render: () => (
    <DropdownMenu label="Actions sur rapport.pdf" title="rapport.pdf" trigger={<IconButton icon={<MoreHorizontal />} label="Plus d'actions" />}>
      <DropdownMenu.Item label="Ouvrir" />
      <DropdownMenu.Item label="Télécharger" />
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Plus d'actions" }));
    await waitFor(() => expect(body().getByText("rapport.pdf")).toBeVisible());
    await userEvent.keyboard("{Escape}");
  },
};

const onArchive = fn();
const onExport = fn();

/**
 * Élément inactif avec une raison : atteint aux flèches, `aria-disabled`, raison sous le libellé
 * et en description ; le choisir ne fait rien et laisse le menu ouvert.
 */
export const InactifAvecRaison: Story = {
  render: () => (
    <DropdownMenu label="Actions sur le rapport" trigger={<IconButton icon={<MoreHorizontal />} label="Plus d'actions" />}>
      <DropdownMenu.Item label="Renommer…" onAction={onRename} />
      <DropdownMenu.Item label="Archiver" onAction={onArchive} disabledReason="Un rapport en cours ne peut pas être archivé." />
      <DropdownMenu.Item label="Exporter" onAction={onExport} />
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    onArchive.mockClear();
    const button = within(canvasElement).getByRole("button", { name: "Plus d'actions" });
    button.focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement).toHaveTextContent("Renommer"));
    await userEvent.keyboard("{ArrowDown}");
    const item = body().getByRole("menuitem", { name: "Archiver" });
    await expect(document.activeElement).toBe(item);
    await expect(item).toHaveAttribute("aria-disabled", "true");
    await expect(item).toHaveAccessibleDescription("Un rapport en cours ne peut pas être archivé.");
    await expect(item).toHaveTextContent("Un rapport en cours ne peut pas être archivé.");
    await userEvent.keyboard("{Enter}");
    await userEvent.click(item);
    await expect(onArchive).not.toHaveBeenCalled();
    await expect(body().getByRole("menu")).toBeInTheDocument();
    // La flèche continue après l'élément inactif.
    item.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(document.activeElement).toHaveTextContent("Exporter");
    await userEvent.keyboard("{Escape}");
  },
};
