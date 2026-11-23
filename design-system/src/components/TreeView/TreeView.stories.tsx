import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { TreeView, type TreeMoveTarget, type TreeNode, type TreeViewProps } from "./TreeView";
import { Plus } from "../../icons";
import { Doc, Folder, FolderOpen } from "../../../.storybook/story-icons";

const meta: Meta<typeof TreeView> = {
  title: "Composants/TreeView",
  component: TreeView,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof TreeView>;
const body = () => within(document.body);

const dir = (id: string, label: string, children: TreeNode[] | undefined, extra: Partial<TreeNode> = {}): TreeNode => ({
  id,
  label,
  icon: <Folder />,
  openIcon: <FolderOpen />,
  ...(children ? { children, meta: String(children.length) } : {}),
  ...extra,
});
const file = (id: string, label: string, meta: string, extra: Partial<TreeNode> = {}): TreeNode => ({ id, label, icon: <Doc />, meta, ...extra });

const NODES: TreeNode[] = [
  dir("projets", "Projets", [
    dir("refonte", "Refonte du site", [
      file("cdc", "Cahier des charges.pdf", "240 Ko"),
      dir("maquettes", "Maquettes", [file("accueil", "Accueil.png", "1,2 Mo"), file("contact", "Contact.png", "860 Ko")]),
      file("planning", "Planning.xlsx", "48 Ko"),
    ]),
    dir("migration", "Migration des données", [file("notes", "Notes.md", "4 Ko")]),
  ]),
  dir("rh", "Ressources humaines", [dir("contrats", "Contrats", []), file("reglement", "Règlement intérieur.pdf", "310 Ko")]),
  dir("archives", "Archives", undefined, { hasChildren: true }),
  file("lisez", "Lisez-moi.txt", "1 Ko"),
  file("export", "Ancien export.zip", "12 Mo", { isDisabled: true }),
];

const rowOf = (name: string) => body().getByRole("row", { name: new RegExp(`^${name}`) });

function Frame(props: Partial<TreeViewProps>) {
  return (
    <div className="flex h-[480px] w-[340px] flex-col border-r border-line p-2">
      <TreeView aria-label="Documents" nodes={NODES} defaultExpandedIds={["projets", "refonte"]} {...props} />
    </div>
  );
}

/** Explorateur de documents : dossiers dépliés, méta, nœud désactivé. */
export const ParDefaut: Story = { render: () => <Frame /> };

/** Clic : sélectionne ; le nœud désactivé ne se sélectionne pas (D-263). */
export const Selection: Story = {
  render: () => <Frame onSelectionChange={onSelection} />,
  play: async () => {
    onSelection.mockClear();
    await userEvent.click(rowOf("Planning.xlsx"));
    await expect(rowOf("Planning.xlsx")).toHaveAttribute("aria-selected", "true");
    await expect(onSelection).toHaveBeenLastCalledWith(["planning"]);
    await userEvent.click(rowOf("Cahier des charges.pdf"));
    await expect(rowOf("Planning.xlsx")).toHaveAttribute("aria-selected", "false");
    await userEvent.click(rowOf("Ancien export.zip"));
    await expect(rowOf("Ancien export.zip")).not.toHaveAttribute("aria-selected", "true");
    await expect(onSelection).toHaveBeenLastCalledWith(["cdc"]);
  },
};
const onSelection = fn();

/** Choix multiple : Mod+clic ajoute ou retire, Maj+clic prend la plage ; pas de case (D-263). */
export const SelectionMultiple: Story = {
  render: () => <Frame selectionMode="multiple" />,
  play: async () => {
    const user = userEvent.setup();
    await expect(body().getByRole("treegrid")).toHaveAttribute("aria-multiselectable", "true");
    await user.click(rowOf("Cahier des charges.pdf"));
    await user.keyboard("{Shift>}");
    await user.click(rowOf("Planning.xlsx"));
    await user.keyboard("{/Shift}");
    for (const n of ["Cahier des charges.pdf", "Maquettes", "Planning.xlsx"]) await expect(rowOf(n)).toHaveAttribute("aria-selected", "true");
    // Mod : Cmd sur macOS, Ctrl ailleurs.
    const mod = /Mac/.test(navigator.platform) ? "Meta" : "Control";
    await user.keyboard(`{${mod}>}`);
    await user.click(rowOf("Maquettes"));
    await user.keyboard(`{/${mod}}`);
    await expect(rowOf("Maquettes")).toHaveAttribute("aria-selected", "false");
    await expect(rowOf("Planning.xlsx")).toHaveAttribute("aria-selected", "true");
    await expect(within(document.body).queryAllByRole("checkbox")).toHaveLength(0);
    // Maj+flèches : la plage suit l'ordre affiché, dossiers compris.
    await user.click(rowOf("Projets"));
    await user.keyboard("{Shift>}{ArrowDown}{ArrowDown}{/Shift}");
    for (const n of ["Projets", "Refonte du site", "Cahier des charges.pdf"]) await expect(rowOf(n)).toHaveAttribute("aria-selected", "true");
    await expect(rowOf("Maquettes")).toHaveAttribute("aria-selected", "false");
  },
};

/** Le chevron plie ou déplie sans sélectionner, sans animation (D-263, D-026). */
export const Deplier: Story = {
  render: () => <Frame />,
  play: async () => {
    const row = rowOf("Ressources humaines");
    await expect(row).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(within(row).getByRole("button", { name: "Déplier Ressources humaines" }));
    await expect(rowOf("Ressources humaines")).toHaveAttribute("aria-expanded", "true");
    await expect(rowOf("Ressources humaines")).toHaveAttribute("aria-selected", "false");
    await expect(rowOf("Règlement intérieur.pdf")).toBeVisible();
    // Un dossier vide se déplie sans ligne sous lui (D-268).
    await userEvent.click(within(rowOf("Contrats")).getByRole("button", { name: "Déplier Contrats" }));
    await expect(rowOf("Contrats")).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(within(rowOf("Ressources humaines")).getByRole("button", { name: "Replier Ressources humaines" }));
    await expect(body().queryByRole("row", { name: /^Règlement/ })).not.toBeInTheDocument();
  },
};

/** Double-clic ou Entrée : `onAction` ; sans `onAction`, plie ou déplie (D-263). */
export const Ouvrir: Story = {
  render: () => (
    <div className="flex gap-4">
      <Frame onAction={onOpen} />
      <div className="flex h-[480px] w-[340px] flex-col p-2">
        <TreeView aria-label="Sans ouverture" nodes={[dir("a", "Dossier A", [file("a1", "Fichier A1", "1 Ko")])]} />
      </div>
    </div>
  ),
  play: async () => {
    onOpen.mockClear();
    await userEvent.dblClick(rowOf("Planning.xlsx"));
    await expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: "planning" }));
    await userEvent.keyboard("{ArrowUp}{Enter}");
    await expect(onOpen).toHaveBeenLastCalledWith(expect.objectContaining({ id: "maquettes" }));
    // Sans onAction : Entrée déplie.
    const tree = body().getByRole("treegrid", { name: "Sans ouverture" });
    await userEvent.click(within(tree).getByRole("row", { name: /^Dossier A/ }));
    await userEvent.keyboard("{Enter}");
    await expect(within(tree).getByRole("row", { name: /^Dossier A/ })).toHaveAttribute("aria-expanded", "true");
  },
};
const onOpen = fn();

/** Clavier du motif tree et recherche par frappe (D-264). */
export const Clavier: Story = {
  render: () => <Frame />,
  play: async () => {
    await userEvent.click(rowOf("Projets"));
    await userEvent.keyboard("{ArrowDown}");
    await expect(rowOf("Refonte du site")).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(rowOf("Refonte du site")).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{ArrowLeft}");
    await expect(rowOf("Projets")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(rowOf("Lisez-moi.txt")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(rowOf("Projets")).toHaveFocus();
    // Recherche par frappe.
    await userEvent.keyboard("ress");
    await expect(rowOf("Ressources humaines")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(rowOf("Ressources humaines")).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowRight}");
    await expect(rowOf("Contrats")).toHaveFocus();
  },
};

/** Actions par ActionBar zone `row` : une icône puis « … » ; `danger` confirmée ; clic droit et Maj+F10 (D-265, D-115). */
export const Actions: Story = {
  render: () => (
    <Frame
      actions={(n) => [
        ...(n.children || n.hasChildren ? [{ id: "new", label: "Nouveau document", icon: <Plus />, onPress: onNew }] : []),
        { id: "rename", label: "Renommer", onPress: fn() },
        { id: "del", label: "Supprimer", danger: true, confirm: `Supprimer « ${n.label} » ?`, onPress: onDelete },
      ]}
    />
  ),
  play: async () => {
    onNew.mockClear();
    onDelete.mockClear();
    // Survol : l'action à icône apparaît à la place de la méta.
    await userEvent.hover(rowOf("Maquettes"));
    await userEvent.click(within(rowOf("Maquettes")).getByRole("button", { name: "Nouveau document" }));
    await expect(onNew).toHaveBeenCalledTimes(1);
    // Clic droit : menu « … » ; Supprimer demande confirmation ; Annuler n'appelle rien.
    await userEvent.pointer({ keys: "[MouseRight]", target: rowOf("Planning.xlsx") });
    await userEvent.click(await waitFor(() => body().getByRole("menuitem", { name: "Supprimer" })));
    const dialog = await waitFor(() => body().getByRole("alertdialog"));
    await expect(within(dialog).getByText("Supprimer « Planning.xlsx » ?")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Annuler" }));
    await waitFor(() => expect(body().queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(onDelete).not.toHaveBeenCalled();
    // Maj+F10 sur la ligne qui a le focus : même menu.
    await userEvent.click(rowOf("Cahier des charges.pdf"));
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await expect(await waitFor(() => body().getByRole("menuitem", { name: "Renommer" }))).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  },
};
const onNew = fn();
const onDelete = fn();

/** Enfants chargés à la première ouverture ; erreur avec « Réessayer » ; gardés ensuite (D-266). */
export const Chargement: Story = {
  render: () => <LazyDemo />,
  play: async () => {
    loads.length = 0;
    failNext = true;
    await userEvent.click(within(rowOf("Archives")).getByRole("button", { name: "Déplier Archives" }));
    await expect(await waitFor(() => body().getByText("Chargement…"))).toBeInTheDocument();
    await expect(await waitFor(() => body().getByText("Impossible de charger"))).toBeInTheDocument();
    await userEvent.click(body().getByRole("button", { name: "Réessayer" }));
    await expect(await waitFor(() => rowOf("2024"))).toBeVisible();
    await expect(loads).toEqual(["archives", "archives"]);
    // Replier puis déplier : pas de nouvelle demande.
    await userEvent.click(within(rowOf("Archives")).getByRole("button", { name: "Replier Archives" }));
    await userEvent.click(within(rowOf("Archives")).getByRole("button", { name: "Déplier Archives" }));
    await expect(rowOf("2024")).toBeVisible();
    await expect(loads).toHaveLength(2);
  },
};
const loads: string[] = [];
let failNext = false;
function LazyDemo() {
  return (
    <Frame
      loadChildren={(n) => {
        loads.push(n.id);
        const fail = failNext;
        failNext = false;
        return new Promise((resolve, reject) =>
          setTimeout(() => (fail ? reject(new Error("hors ligne")) : resolve([dir(`${n.id}/2024`, "2024", [file("bilan", "Bilan 2024.pdf", "2 Mo")]), dir(`${n.id}/2023`, "2023", [])])), 300),
        );
      }}
    />
  );
}

/** Glisser-déposer : l'app applique le déplacement (D-267). Ici, au clavier, par le bouton « Déplacer ». */
export const Deplacer: Story = {
  render: () => <MoveDemo />,
  play: async () => {
    moves.length = 0;
    const handle = within(rowOf("Notes.md")).getByRole("button", { name: "Déplacer Notes.md" });
    handle.focus();
    await userEvent.keyboard("{Enter}");
    // La première cible proposée au clavier, puis Entrée pour déposer.
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(moves).toHaveLength(1));
    await expect(moves[0]![0]).toEqual(["notes"]);
  },
};
const moves: [string[], TreeMoveTarget][] = [];
function MoveDemo() {
  const [nodes, setNodes] = useState(NODES);
  return (
    <Frame
      nodes={nodes}
      defaultExpandedIds={["projets", "migration"]}
      onMove={(ids, target) => {
        moves.push([ids, target]);
        setNodes((list) => moveNodes(list, ids, target));
      }}
    />
  );
}

/** Déplacement appliqué par l'app (exemple). */
function moveNodes(list: ReadonlyArray<TreeNode>, ids: string[], target: TreeMoveTarget): TreeNode[] {
  const taken: TreeNode[] = [];
  const strip = (l: ReadonlyArray<TreeNode>): TreeNode[] =>
    l.flatMap((n) => (ids.includes(n.id) ? (taken.push(n), []) : [n.children ? { ...n, children: strip(n.children) } : n]));
  const insert = (l: TreeNode[]): TreeNode[] =>
    l.flatMap((n) => {
      if (n.id === target.id) {
        if (target.position === "inside") return [{ ...n, children: [...(n.children ?? []), ...taken] }];
        return target.position === "before" ? [...taken, n] : [n, ...taken];
      }
      return [n.children ? { ...n, children: insert([...n.children]) } : n];
    });
  return insert(strip(list));
}

/** Arbre vide : EmptyState compact (D-268). */
export const Vide: Story = {
  render: () => <Frame nodes={[]} emptyState={{ title: "Aucun document", description: "Les documents ajoutés s'afficheront ici." }} />,
  play: async () => {
    await expect(body().getByText("Aucun document")).toBeInTheDocument();
  },
};
