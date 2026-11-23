import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import type { Key, SortDescriptor } from "react-aria-components";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Table, type TableColumn } from "./Table";
import { Menu } from "../Menu/Menu";
import { StatusDot } from "../StatusBadge/StatusBadge";
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

/* ---------- Table dense (D-270 à D-277) ---------- */
interface Variable { id: string; service: string; name: string; value: string; state: "success" | "danger" | "warning"; modified: string; path: string }
const VARS: Variable[] = [
  ["Paiements", "API_KEY", "", "danger", "il y a 2 h"],
  ["Paiements", "WEBHOOK_SECRET", "whsec-…9a", "success", "hier"],
  ["Courriels", "SMTP_HOST", "smtp.exemple.fr", "success", "3 nov."],
  ["Paiements", "TIMEOUT_MS", "3000", "success", "12 nov."],
  ["Archives", "LEGACY_URL", "https://ancien.exemple.fr/api/v1", "warning", "2 sept."],
].map(([service, name, value, state, modified], i) => ({ id: `v${i}`, service: service!, name: name!, value: value!, state: state as Variable["state"], modified: modified!, path: `config/${service!.toLowerCase()}.env` }));
const VAR_COLS: TableColumn[] = [
  { id: "name", label: "Nom" },
  { id: "value", label: "Valeur", width: 180 },
  { id: "state", label: "État", width: 48 },
  { id: "modified", label: "Dernière modification", width: 96 },
];
const STATE_LABEL = { success: "Défini", danger: "Manquant", warning: "Obsolète" };

function Dense(props: { density?: "compact"; group?: boolean; double?: boolean; collapsed?: string[] }) {
  const [sel, setSel] = useState<Set<Key>>(new Set());
  return (
    <div className="flex h-[420px] flex-col p-4">
      <output data-testid="sel" className="mb-2 text-sm text-fg-3">{[...sel].join(",")}</output>
      <Table
        label="Variables"
        columns={VAR_COLS}
        rows={VARS}
        // Un état se dit par une pastille dans la case, pas par un fond (D-276).
        renderCell={(r, c) => (c === "state" ? <StatusDot tone={r.state} label={STATE_LABEL[r.state]} /> : String(r[c as keyof Variable]))}
        selectionMode="multiple"
        onSelectionChange={setSel}
        onAction={onOpen}
        {...(props.density ? { density: props.density } : {})}
        {...(props.group ? { groupBy: (r: Variable) => r.service } : {})}
        {...(props.collapsed ? { defaultCollapsedGroups: props.collapsed } : {})}
        {...(props.double ? { rowDescription: (r: Variable) => r.path } : {})}
      />
    </div>
  );
}

const height = (el: Element) => Math.round(el.getBoundingClientRect().height);

/** Densité compacte : lignes de 25 px, en-tête de 28 px (D-271). */
export const Compacte: Story = {
  render: () => <Dense density="compact" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(height(c.getByRole("columnheader", { name: /Nom/ }))).toBe(28);
    await expect(height(within(c.getByRole("row", { name: /SMTP_HOST/ })).getByRole("rowheader"))).toBe(25);
  },
};

/** Sans `density`, la ligne reste à `--row-h` (D-063) : rien ne change par défaut. */
export const DensiteParDefaut: Story = {
  render: () => <Dense />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const rowH = parseFloat(getComputedStyle(canvasElement).getPropertyValue("--row-h"));
    await expect(height(within(c.getByRole("row", { name: /SMTP_HOST/ })).getByRole("rowheader"))).toBe(Math.round(rowH));
  },
};

/** Lignes de groupe : ordre de première apparition, clic, Entrée et Espace replient ; état mémorisé ; jamais sélectionnées (D-272). */
export const Groupes: Story = {
  render: () => <Dense density="compact" group collapsed={["Archives"]} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const rows = () => c.getAllByRole("row").map((r) => r.textContent);
    await expect(rows()[1]).toContain("Paiements· 3 lignes");
    await expect(rows()[2]).toContain("API_KEY");
    await expect(rows()[4]).toContain("TIMEOUT_MS");
    await expect(rows()[5]).toContain("Courriels· 1 ligne");
    // Groupe replié au départ : sa ligne de titre reste.
    await expect(c.queryByRole("row", { name: /LEGACY_URL/ })).toBeNull();
    const archives = c.getAllByRole("row").find((r) => r.dataset.group === "Archives")!;
    await expect(archives).toHaveAttribute("aria-expanded", "false");
    // Clic : déplie.
    await userEvent.click(archives);
    await waitFor(() => expect(c.getByRole("row", { name: /LEGACY_URL/ })).toBeInTheDocument());
    await expect(localStorage.getItem("storybook:table:Variables:collapsed")).toBe("[]");
    // Entrée puis Espace sur la ligne de groupe : replie puis déplie.
    const paiements = () => c.getAllByRole("row").find((r) => r.dataset.group === "Paiements")!;
    paiements().focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(c.queryByRole("row", { name: /API_KEY/ })).toBeNull());
    await expect(paiements()).toHaveAttribute("aria-expanded", "false");
    paiements().focus();
    await userEvent.keyboard(" ");
    await waitFor(() => expect(c.getByRole("row", { name: /API_KEY/ })).toBeInTheDocument());
    // Une ligne de groupe ne se sélectionne pas et ne s'ouvre pas ; « Tout sélectionner » ne coche que des lignes.
    await expect(paiements()).not.toHaveAttribute("aria-selected", "true");
    await expect(onOpen).not.toHaveBeenCalledWith(expect.stringContaining("group:"));
    await userEvent.click(c.getByRole("checkbox", { name: "Tout sélectionner" }));
    await waitFor(() => expect(c.getByTestId("sel").textContent).toBe(VARS.map((v) => v.id).join(",")));
  },
};

/** Lignes doubles : précision sous le nom, hauteur `--row-h` + 12 px (D-273). */
export const LignesDoubles: Story = {
  render: () => <Dense double />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const rowH = parseFloat(getComputedStyle(canvasElement).getPropertyValue("--row-h"));
    const row = c.getByRole("row", { name: /SMTP_HOST/ });
    await expect(row).toHaveTextContent("config/courriels.env");
    await expect(height(within(row).getByRole("rowheader"))).toBe(Math.round(rowH + 12));
  },
};

/** Une largeur déclarée sous 80 px est respectée (D-274). */
export const LargeurEtroite: Story = {
  render: () => <Dense density="compact" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(Math.round(c.getByRole("columnheader", { name: /État/ }).getBoundingClientRect().width)).toBe(48));
  },
};

/** En-tête coupé par « … » : libellé complet en info-bulle, au survol après 500 ms (D-275). */
export const EnTeteCoupe: Story = {
  render: () => <Dense density="compact" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const header = c.getByRole("columnheader", { name: /Dernière modification/ });
    const label = within(header).getByText("Dernière modification");
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    await userEvent.hover(header);
    await waitFor(() => expect(body().getByRole("tooltip")).toHaveTextContent("Dernière modification"), { timeout: 2000 });
    await userEvent.unhover(header);
  },
};
