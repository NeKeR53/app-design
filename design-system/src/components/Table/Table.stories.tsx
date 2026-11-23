import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import type { Key, SortDescriptor } from "react-aria-components";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Table, type TableColumn } from "./Table";
import { Menu } from "../Menu/Menu";
import { MoreHorizontal } from "../../icons";
import { Doc } from "../../../.storybook/story-icons";

const meta: Meta = {
  title: "Composants/Table",
  parameters: { layout: "fullscreen" },
  beforeEach: () => {
    for (const k of Object.keys(localStorage)) if (k.startsWith("storybook:table")) localStorage.removeItem(k);
  },
};
export default meta;
type Story = StoryObj;
const body = () => within(document.body);

interface Docu { id: string; name: string; owner: string; date: string; size: number }
const ROWS: Docu[] = [
  ["Rapport trimestriel des ventes de la région Sud-Ouest et analyse des écarts", "Camille Martin", "2026-11-21", 4200],
  ["Budget 2027", "Louis Bernard", "2026-11-20", 860],
  ["Compte rendu de la réunion d'équipe", "", "2026-11-18", 120],
  ["Contrat cadre fournisseur", "Camille Martin", "2026-11-12", 1530],
  ["Remboursement de repas client", "Hugo Petit", "2026-11-03", 340],
].map(([name, owner, date, size], i) => ({ id: `r${i}`, name: name as string, owner: owner as string, date: date as string, size: size as number }));
const COLS: TableColumn[] = [
  { id: "name", label: "Nom", sortable: true },
  { id: "owner", label: "Responsable", width: 160, sortable: true },
  { id: "date", label: "Modifié le", width: 120, sortable: true },
  { id: "size", label: "Taille", width: 96, align: "end", sortable: true },
];
const onOpen = fn();

function Demo(props: { isLoading?: boolean; hasError?: boolean; terms?: string[]; rows?: Docu[] }) {
  const [sort, setSort] = useState<SortDescriptor>({ column: "date", direction: "descending" });
  const [sel, setSel] = useState<Set<Key>>(new Set());
  const rows = useMemo(() => {
    const r = [...(props.rows ?? ROWS)];
    const c = sort.column as keyof Docu;
    r.sort((a, b) => (a[c] > b[c] ? 1 : a[c] < b[c] ? -1 : 0) * (sort.direction === "ascending" ? 1 : -1));
    return r;
  }, [sort, props.rows]);
  return (
    <div className="flex h-[420px] flex-col p-4">
      <output data-testid="sel" className="mb-2 text-sm text-fg-3">{[...sel].join(",")}</output>
      <Table
        label="Documents"
        columns={COLS}
        rows={rows}
        rowIcon={() => <Doc />}
        renderCell={(r, c) => (c === "size" ? `${r.size >= 1000 ? (r.size / 1000).toFixed(1).replace(".", ",") + " Mo" : r.size + " Ko"}` : String(r[c as keyof Docu]))}
        selectionMode="multiple"
        onSelectionChange={setSel}
        sortDescriptor={sort}
        onSortChange={setSort}
        onAction={onOpen}
        rowActions={() => [{ icon: <MoreHorizontal />, label: "Plus d'actions", menu: <><Menu.Item label="Renommer" /><Menu.Item label="Supprimer" danger /></> }]}
        {...(props.isLoading ? { isLoading: true } : {})}
        {...(props.hasError ? { hasError: true, onRetry: () => {} } : {})}
        {...(props.terms ? { searchTerms: props.terms, onClearSearch: () => {} } : {})}
      />
    </div>
  );
}

export const ParDefaut: Story = { render: () => <Demo /> };
export const PremierChargement: Story = { render: () => <Demo isLoading rows={[]} /> };
export const Rechargement: Story = { render: () => <Demo isLoading terms={["remb"]} /> };
export const ErreurRechargement: Story = { render: () => <Demo hasError /> };
export const AucunResultat: Story = { render: () => <Demo rows={[]} terms={["zzz", "hugo"]} /> };

/** Clic : sélection ; double-clic ou Entrée : ouverture (layout-rules, D-021). */
export const Selection: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const row = c.getByRole("row", { name: /Budget 2027/ });
    await userEvent.click(row);
    await expect(row).toHaveAttribute("aria-selected", "true");
    await userEvent.dblClick(row);
    await expect(onOpen).toHaveBeenCalled();
  },
};

/** Tri par en-tête, avec flèche ; mémorisé (D-007). */
export const Tri: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const col = c.getByRole("columnheader", { name: /Nom/ });
    await userEvent.click(col);
    await expect(col).toHaveAttribute("aria-sort", "ascending");
    await expect(c.getAllByRole("row")[1]).toHaveTextContent("Budget 2027");
    await expect(localStorage.getItem("storybook:table:Documents:sort")).toContain("name");
  },
};

/** Cases au survol ; toutes visibles dès que plusieurs lignes sont cochées (D-065). */
export const SelectionMultiple: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("checkbox", { name: "Tout sélectionner" }));
    await waitFor(() => expect(within(canvasElement).getByTestId("sel").textContent?.split(",")).toHaveLength(ROWS.length));
  },
};

/** Clic droit sur une ligne : le menu « … » (D-066). */
export const ActionsDeLigne: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const cell = within(c.getByRole("row", { name: /Budget 2027/ })).getAllByRole("rowheader")[0]!;
    cell.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    await waitFor(() => expect(body().getByRole("menuitem", { name: "Renommer" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
  },
};

/** États des résultats (D-084 à D-087). */
export const EtatsDesResultats: Story = {
  render: () => (
    <div>
      <div data-testid="a"><Demo isLoading rows={[]} /></div>
      <div data-testid="b"><Demo isLoading terms={["remb"]} /></div>
      <div data-testid="c"><Demo hasError /></div>
      <div data-testid="d"><Demo rows={[]} terms={["zzz"]} /></div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(within(c.getByTestId("a")).queryAllByRole("row")).toHaveLength(2);
    await expect(within(c.getByTestId("b")).getByRole("progressbar")).toBeInTheDocument();
    await expect(within(c.getByTestId("b")).getAllByText("Remb")[0]!.tagName).toBe("B");
    await expect(within(c.getByTestId("c")).getByRole("alert")).toHaveTextContent("Résultats non mis à jour");
    await expect(within(c.getByTestId("d")).getByText(/Aucun résultat pour/)).toHaveTextContent("« zzz »");
  },
};

/** Largeur mémorisée et double-clic : largeur par défaut (D-067).
 * Le glisser est vérifié à la vraie souris dans Storybook : la souris simulée des tests ne le déclenche pas. */
export const Redimension: Story = {
  beforeEach: () => {
    localStorage.setItem("storybook:table:Documents:widths", JSON.stringify({ owner: 260 }));
  },
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const col = c.getByRole("columnheader", { name: /Responsable/ });
    await waitFor(() => expect(Math.round(col.getBoundingClientRect().width)).toBe(260));
    await userEvent.dblClick(col.querySelector<HTMLElement>(".cursor-col-resize")!);
    await waitFor(() => expect(Math.round(c.getByRole("columnheader", { name: /Responsable/ }).getBoundingClientRect().width)).toBe(160));
  },
};
