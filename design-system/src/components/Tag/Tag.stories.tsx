import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Tag, TagGroup, type TagGroupProps } from "./Tag";

const meta: Meta<typeof TagGroup> = {
  title: "Composants/Tag",
  component: TagGroup,
  subcomponents: { Tag },
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof TagGroup>;

/** Compare une couleur calculée à celle d'un token. */
function sameColor(el: Element, token: string, prop: "backgroundColor" | "color" = "backgroundColor") {
  const probe = document.createElement("div");
  probe.style.background = `var(${token})`;
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const ok = getComputedStyle(el)[prop] === getComputedStyle(probe)[prop];
  probe.remove();
  return ok;
}

/** Pastille neutre : fond `--field`, texte `--fg`, rayon 4 px, hauteur `--btn-h-sm` (D-362). */
export const ParDefaut: Story = {
  render: () => (
    <TagGroup label="Étiquettes du ticket">
      <Tag id="urgent">Urgent</Tag>
      <Tag id="client">Client</Tag>
      <Tag id="interne">Interne</Tag>
    </TagGroup>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("grid", { name: "Étiquettes du ticket" })).toBeVisible();
    const tag = c.getByRole("row", { name: "Urgent" });
    await expect(sameColor(tag, "--field")).toBe(true);
    await expect(sameColor(tag, "--fg", "color")).toBe(true);
    await expect(getComputedStyle(tag).borderTopLeftRadius).toBe("4px");
    const probe = document.createElement("div");
    probe.style.height = "var(--btn-h-sm)";
    canvasElement.append(probe);
    await expect(tag.getBoundingClientRect().height).toBe(probe.getBoundingClientRect().height);
    probe.remove();
    // Sans `onRemove`, pas de croix ; sans `selectionMode`, rien n'est choisi.
    await expect(c.queryByRole("button")).toBeNull();
    await expect(tag).not.toHaveAttribute("aria-selected");
  },
};

const initial = [
  { id: "urgent", label: "Urgent" },
  { id: "client", label: "Client" },
  { id: "interne", label: "Interne" },
];

function Removable(props: Partial<TagGroupProps>) {
  const [tags, setTags] = useState(initial);
  return (
    <div className="flex flex-col gap-3">
      <button type="button" className="w-fit">Avant</button>
      <TagGroup
        label="Étiquettes du ticket"
        emptyText="Aucune étiquette"
        {...props}
        onRemove={(ids) => {
          props.onRemove?.(ids);
          setTags((t) => t.filter((x) => !ids.includes(x.id)));
        }}
      >
        {tags.map((t) => (
          <Tag key={t.id} id={t.id}>
            {t.label}
          </Tag>
        ))}
      </TagGroup>
      <button type="button" className="w-fit">Après</button>
    </div>
  );
}

/** La croix « Retirer <nom> » retire l'étiquette ; `onRemove` reçoit son id (D-362). */
export const Retrait: Story = {
  render: (args) => <Removable {...args} />,
  args: { onRemove: fn() },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Retirer Client" }));
    await expect(args.onRemove).toHaveBeenCalledWith(["client"]);
    await waitFor(() => expect(c.queryByRole("row", { name: "Client" })).toBeNull());
    await expect(c.getAllByRole("row")).toHaveLength(2);
  },
};

/** Un seul arrêt de Tab ; les flèches vont d'étiquette en étiquette ; Suppr et Retour arrière retirent (D-362). */
export const RetraitAuClavier: Story = {
  render: () => <Removable />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Avant" }));
    await userEvent.tab();
    await expect(c.getByRole("row", { name: "Urgent" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(c.getByRole("row", { name: "Client" })).toHaveFocus();
    // Un seul arrêt : Tab quitte le groupe (la croix n'est pas un arrêt de plus).
    await userEvent.tab();
    await expect(c.getByRole("button", { name: "Après" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(c.getByRole("row", { name: "Client" })).toHaveFocus();
    await userEvent.keyboard("{Delete}");
    await waitFor(() => expect(c.queryByRole("row", { name: "Client" })).toBeNull());
    // Le focus reste dans le groupe, sur une étiquette voisine.
    await waitFor(() => expect(c.getByRole("grid").contains(document.activeElement)).toBe(true));
    await userEvent.keyboard("{Backspace}");
    await waitFor(() => expect(c.getAllByRole("row")).toHaveLength(1));
    await userEvent.keyboard("{Backspace}");
    // Groupe vide : le texte d'état vide s'affiche.
    await waitFor(() => expect(c.getByText("Aucune étiquette")).toBeVisible());
  },
};

/** Sélection multiple, pour filtrer : fond `--selected`, coche, `aria-selected` ; clic ou Espace (D-362). */
export const SelectionMultiple: Story = {
  render: (args) => (
    <TagGroup {...args} label="Filtrer par type" selectionMode="multiple" defaultSelectedIds={["client"]}>
      <Tag id="urgent">Urgent</Tag>
      <Tag id="client">Client</Tag>
      <Tag id="interne">Interne</Tag>
    </TagGroup>
  ),
  args: { onSelectionChange: fn() },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const client = c.getByRole("row", { name: "Client" });
    const urgent = c.getByRole("row", { name: "Urgent" });
    await expect(client).toHaveAttribute("aria-selected", "true");
    await expect(urgent).toHaveAttribute("aria-selected", "false");
    await expect(sameColor(client, "--selected")).toBe(true);
    await expect(sameColor(urgent, "--field")).toBe(true);
    await expect(client.querySelector("svg")).not.toBeNull();
    await expect(urgent.querySelector("svg")).toBeNull();
    await userEvent.click(urgent);
    await expect(urgent).toHaveAttribute("aria-selected", "true");
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["client", "urgent"]);
    // Au clavier : Espace retire « Client » de la sélection.
    await userEvent.keyboard("{ArrowRight}");
    await expect(client).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(client).toHaveAttribute("aria-selected", "false");
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["urgent"]);
  },
};

/** Sélection simple : choisir une étiquette retire la précédente. */
export const SelectionSimple: Story = {
  render: () => (
    <TagGroup label="Période" selectionMode="single" defaultSelectedIds={["week"]}>
      <Tag id="day">Aujourd'hui</Tag>
      <Tag id="week">Cette semaine</Tag>
      <Tag id="month">Ce mois-ci</Tag>
    </TagGroup>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("row", { name: "Ce mois-ci" }));
    await expect(c.getByRole("row", { name: "Ce mois-ci" })).toHaveAttribute("aria-selected", "true");
    await expect(c.getByRole("row", { name: "Cette semaine" })).toHaveAttribute("aria-selected", "false");
  },
};

/** Étiquette désactivée : opacité 40 %, ni choisie ni retirée, sautée par les flèches. */
export const Desactivee: Story = {
  render: (args) => (
    <TagGroup {...args} label="Filtrer par type" selectionMode="multiple">
      <Tag id="urgent">Urgent</Tag>
      <Tag id="client" isDisabled>
        Client
      </Tag>
      <Tag id="interne">Interne</Tag>
    </TagGroup>
  ),
  args: { onRemove: fn() },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const client = c.getByRole("row", { name: "Client" });
    await expect(client).toHaveAttribute("aria-disabled", "true");
    await expect(getComputedStyle(client).opacity).toBe("0.4");
    await userEvent.click(client);
    await expect(client).not.toHaveAttribute("aria-selected", "true");
    await userEvent.click(c.getByRole("row", { name: "Urgent" }));
    await userEvent.keyboard("{ArrowRight}");
    await expect(c.getByRole("row", { name: "Interne" })).toHaveFocus();
    await expect(c.getByRole("button", { name: "Retirer Client" })).toBeDisabled();
    await expect(args.onRemove).not.toHaveBeenCalled();
  },
};

/** Libellé masqué : il reste le nom du groupe ; l'aide est liée au groupe. */
export const LibelleMasque: Story = {
  render: () => (
    <TagGroup label="Étiquettes" hideLabel description="Cliquez sur une étiquette pour filtrer." selectionMode="single">
      <Tag id="a">Ouvert</Tag>
      <Tag id="b">Fermé</Tag>
    </TagGroup>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const grid = c.getByRole("grid", { name: "Étiquettes" });
    await expect(c.getByText("Étiquettes")).toHaveClass("sr-only");
    await expect(grid).toHaveAccessibleDescription("Cliquez sur une étiquette pour filtrer.");
  },
};
