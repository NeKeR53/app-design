import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { List, type ListGroup, type ListItemData } from "./List";
import { DropdownMenu } from "../DropdownMenu/DropdownMenu";
import { MoreHorizontal } from "../../icons";

const meta: Meta<typeof List> = {
  title: "Composants/List",
  component: List,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof List>;
const body = () => within(document.body);

/** Appui long au doigt : `pointerdown` tactile, 600 ms d'attente, puis `pointerup` (D-007). */
async function longPress(el: Element) {
  const r = el.getBoundingClientRect();
  const init = { bubbles: true, cancelable: true, pointerId: 7, pointerType: "touch", isPrimary: true, button: 0, clientX: r.left + 10, clientY: r.top + r.height / 2 };
  el.dispatchEvent(new PointerEvent("pointerdown", { ...init, buttons: 1 }));
  await new Promise((done) => setTimeout(done, 600));
  el.dispatchEvent(new PointerEvent("pointerup", init));
}

const ini = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const mk = (id: string, title: string, who: string, meta: string, extra: Partial<ListItemData> = {}): ListItemData => ({
  id,
  title,
  subtitle: `${who} · ${title.length > 30 ? "Détail de la demande" : "Accès en lecture pour la revue annuelle"}`,
  meta,
  visual: ini(who),
  ...extra,
});
const GROUPS: ListGroup[] = [
  { id: "today", title: "Aujourd'hui", items: [
    mk("a", "Demande d'accès au dossier Clients", "Camille Martin", "14:32", { unread: true }),
    mk("b", "Remboursement de frais de déplacement", "Louis Bernard", "11:05", { status: { label: "En attente", tone: "warning" } }),
  ] },
  { id: "yesterday", title: "Hier", items: [
    mk("c", "Commande de matériel informatique", "Hugo Petit", "Hier", { status: { label: "Traitée", tone: "success" } }),
    mk("d", "Remboursement de repas client", "Hugo Petit", "Hier", { status: { label: "Nouvelle", tone: "info" } }),
  ] },
];
const onOpen = fn();

function Demo(props: Partial<Parameters<typeof List>[0]>) {
  const [groups, setGroups] = useState(GROUPS);
  return (
    <div className="flex h-[480px] flex-col p-4">
      <List
        label="Demandes"
        groups={groups}
        leading="avatar"
        onAction={onOpen}
        itemActions={() => [{ icon: <MoreHorizontal />, label: "Plus d'actions", menu: <DropdownMenu.Item label="Archiver" /> }]}
        totalCount={24}
        onLoadMore={() => setGroups((g) => [...g, { id: "week", title: "Cette semaine", items: [mk("e", "Accès VPN", "Tom Faure", "Lun.")] }])}
        {...props}
      />
    </div>
  );
}

export const ParDefaut: Story = { render: () => <Demo /> };
export const Icones: Story = { render: () => <Demo leading="icon" /> };
export const Chargement: Story = { render: () => <Demo groups={[]} isLoading /> };
export const AucunResultat: Story = { render: () => <Demo groups={[]} searchTerms={["zzz"]} onClearSearch={() => {}} /> };

/** Clic : sélection ; double-clic : ouverture (D-021). */
export const Selection: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const row = c.getByRole("row", { name: /Commande de matériel/ });
    await userEvent.click(row);
    await expect(row).toHaveAttribute("aria-selected", "true");
    await userEvent.dblClick(row);
    await expect(onOpen).toHaveBeenCalledWith("c");
  },
};

/** Actions au survol, à la place de la méta ; clic droit : menu (D-066). */
export const Actions: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const row = c.getByRole("row", { name: /Remboursement de frais/ });
    await expect(within(row).getByText("11:05")).toBeVisible();
    await userEvent.hover(row);
    await waitFor(() => expect(within(row).getByRole("button", { name: "Plus d'actions" })).toBeVisible());
    row.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    await waitFor(() => expect(body().getByRole("menuitem", { name: "Archiver" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
  },
};

/** Les actions qui apparaissent au survol, au focus ou à la sélection ne font pas grandir la ligne (D-379). */
export const HauteurStable: Story = {
  render: () => <Demo selectionMode="single" />,
  // Densité « desktop » : la ligne y est au plus juste, l'action de 22 px la faisait grandir.
  globals: { density: "desktop" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const height = (el: Element) => el.getBoundingClientRect().height;
    const row = c.getByRole("row", { name: /Remboursement de frais/ });
    const next = c.getByRole("row", { name: /Commande de matériel/ });
    const h = height(row);
    await userEvent.hover(row);
    await waitFor(() => expect(within(row).getByRole("button", { name: "Plus d'actions" })).toBeVisible());
    await expect(height(row)).toBe(h);
    await userEvent.click(row);
    await userEvent.unhover(row);
    await expect(height(row)).toBe(h);
    await userEvent.keyboard("{ArrowDown}");
    await expect(height(next)).toBe(h);
    await expect(height(row)).toBe(h);
  },
};

/** Courte liste dans une section : sans trait entre les éléments (D-400). */
export const SansTraits: Story = {
  render: () => (
    <div className="w-80 p-4">
      <List
        label="Étapes du plan"
        selectionMode="none"
        leading="icon"
        dividers={false}
        items={[
          { id: "1", title: "Lire le code", visual: "✓" },
          { id: "2", title: "Écrire le test", visual: "•" },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByRole("row", { name: /Lire le code/ });
    await expect(getComputedStyle(row).borderBottomWidth).toBe("0px");
  },
};

/** Tactile : un appui long ouvre le menu « … » de la ligne, sans l'ouvrir ni la sélectionner (D-007). */
export const AppuiLong: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const row = c.getByRole("row", { name: /Remboursement de frais/ });
    onOpen.mockClear();
    await longPress(within(row).getByText("Remboursement de frais de déplacement"));
    await waitFor(() => expect(body().getByRole("menuitem", { name: "Archiver" })).toBeVisible());
    await new Promise((done) => setTimeout(done, 150));
    await expect(row).not.toHaveAttribute("aria-selected", "true");
    await expect(onOpen).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
  },
};

/** Groupes avec en-tête ; « Afficher plus » charge la suite (D-070). */
export const Groupes: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Aujourd'hui")).toBeVisible();
    await expect(c.getByText("4 sur 24")).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Afficher plus" }));
    await waitFor(() => expect(c.getByRole("row", { name: /Accès VPN/ })).toBeVisible());
  },
};

/** Texte cherché en gras ; non-lu par un point (D-044, D-087). */
export const SurlignageEtNonLu: Story = {
  render: () => <Demo searchTerms={["remb"]} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByText("Remb")[0]!.tagName).toBe("B");
    await expect(c.getByRole("img", { name: "Non lu" })).toBeVisible();
  },
};
