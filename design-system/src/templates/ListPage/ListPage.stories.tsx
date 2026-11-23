import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import type { StatusMap } from "../../components/FormattedValue/FormattedValue";
import { Check, ListDetail, Plus, X } from "../../icons";
import type { Action } from "../../patterns/ActionBar/ActionBar";
import { ListPage, type ListPageColumn, type ListPageFilter, type ListPageProps } from "./ListPage";

/* Données factices génériques : des demandes faites à un service. */
interface Demande {
  id: string;
  titre: string;
  etat: string;
  demandeur: string;
  montant: number | null;
  creee: string;
  tags: string[];
}

const ETATS: StatusMap = {
  nouvelle: { label: "Nouvelle", tone: "info" },
  en_cours: { label: "En cours", tone: "pending" },
  attente: { label: "En attente", tone: "warning" },
  close: { label: "Close", tone: "success" },
  refusee: { label: "Refusée", tone: "danger" },
};
const NOMS = ["Accès au VPN", "Écran qui scintille", "Commande de badges", "Licence du logiciel de dessin", "Réservation de salle", "Imprimante du 2e étage", "Mot de passe expiré", "Nouveau poste pour l'accueil", "Remboursement de frais", "Mise à jour du site", "Clavier en panne", "Accès au partage commun"];
const GENS = ["Inès Moreau", "Hugo Petit", "Sarah Lefèvre", "Tom Faure", "Léa Garnier"];

const make = (n: number): Demande[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `D-${1001 + i}`,
    titre: n > NOMS.length ? `${NOMS[i % NOMS.length]} n° ${i + 1}` : NOMS[i]!,
    etat: Object.keys(ETATS)[i % 5]!,
    demandeur: GENS[i % 4]!,
    montant: i % 4 === 3 ? null : 40 + ((i * 137) % 900) + 0.5,
    creee: `2026-11-${String(22 - (i % 20)).padStart(2, "0")}`,
    tags: i % 2 ? ["matériel"] : ["accès", "urgent"],
  }));
const DOUZE = make(12);
const CENT_VINGT = make(120);

const columns: ListPageColumn<Demande>[] = [
  { id: "titre", label: "Titre" },
  { id: "etat", label: "État", type: "status", statuses: ETATS },
  { id: "demandeur", label: "Demandeur" },
  { id: "montant", label: "Montant", type: "money" },
  { id: "creee", label: "Créée", type: "date" },
];
const filters: ListPageFilter<Demande>[] = [
  { id: "etat", label: "État", allLabel: "Tous les états", options: Object.entries(ETATS).map(([id, e]) => ({ id, label: e.label })) },
  { id: "demandeur", label: "Demandeur", allLabel: "Tous les demandeurs", options: GENS.map((g) => ({ id: g, label: g })) },
];
/* Icônes internes de Socle, pour la démo seulement : une app passe ses propres icônes (D-011). */
const pageActions = (onNew = fn()): Action[] => [
  { id: "new", label: "Nouvelle demande", icon: <Plus />, primary: true, onPress: onNew },
  { id: "import", label: "Importer un fichier…", onPress: fn() },
];
const Inbox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

type Props = ListPageProps<Demande>;
const base = (over: Partial<Props> = {}): Props => ({
  title: "Demandes",
  description: "Les demandes faites au service informatique.",
  actions: pageActions(),
  rows: DOUZE,
  columns,
  filters,
  search: { label: "les demandes" },
  empty: { title: "Aucune demande", description: "Les demandes faites au service informatique apparaissent ici.", icon: <Inbox /> },
  ...over,
});

const Frame = (props: Props) => (
  <div className="h-[560px] border border-line bg-surface">
    <ListPage {...props} />
  </div>
);

const meta: Meta<typeof ListPage<Demande>> = {
  title: "Gabarits/ListPage",
  component: ListPage,
  parameters: { layout: "padded" },
  beforeEach: () => {
    try {
      localStorage.clear();
    } catch {
      /* stockage indisponible */
    }
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
const body = () => within(document.body);
const titles = (c: HTMLElement) => within(c).getAllByRole("rowheader").map((r) => r.textContent);

/** En-tête, barre, tableau typé ; tout tient : le pied montre « 12 éléments » (D-173, D-175). */
export const ParDefaut: Story = {
  render: () => <Frame {...base()} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { level: 1, name: "Demandes" })).toBeVisible();
    await expect(c.getByRole("button", { name: "Nouvelle demande" })).toBeVisible();
    await expect(c.getByRole("combobox", { name: /Rechercher/ })).toBeVisible();
    await expect(c.getByText("12 éléments")).toBeVisible();
    await expect(c.getAllByText("Nouvelle").length).toBeGreaterThan(0);
    await expect(c.getAllByText(/€/).length).toBeGreaterThan(0);
  },
};

/** Recherche sans casse ni accents, chaque mot doit apparaître ; texte trouvé en gras (D-087). */
export const Recherche: Story = {
  render: () => <Frame {...base()} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole("combobox", { name: /Rechercher/ }), "ecran");
    await waitFor(() => expect(titles(canvasElement)).toEqual(["Écran qui scintille"]));
    await expect(canvasElement.querySelector("[role=rowheader] b")?.textContent).toBe("Écran");
    await expect(c.getByText("1 élément")).toBeVisible();
  },
};

/** Filtres en ET ; ils ramènent au début (D-174). */
export const Filtres: Story = {
  render: () => <Frame {...base()} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Tous les états/ }));
    await userEvent.click(await waitFor(() => body().getByRole("option", { name: "Close" })));
    await waitFor(() => expect(titles(canvasElement)).toHaveLength(2));
    await userEvent.click(c.getByRole("button", { name: /Tous les demandeurs/ }));
    await userEvent.click(await waitFor(() => body().getByRole("option", { name: "Tom Faure" })));
    await waitFor(() => expect(titles(canvasElement)).toEqual(["Licence du logiciel de dessin"]));
  },
};

/** Aucun résultat : rappel des critères ; « Effacer la recherche » vide aussi les filtres (D-176). */
export const AucunResultat: Story = {
  render: () => <Frame {...base()} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Tous les états/ }));
    await userEvent.click(await waitFor(() => body().getByRole("option", { name: "Refusée" })));
    await userEvent.type(c.getByRole("combobox", { name: /Rechercher/ }), "zzz");
    await waitFor(() => expect(c.getByText(/Aucun résultat pour/)).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: "Effacer la recherche" }));
    await waitFor(() => expect(titles(canvasElement)).toHaveLength(12));
    await expect(c.getByRole("combobox", { name: /Rechercher/ })).toHaveValue("");
    await expect(c.getByRole("button", { name: /Tous les états/ })).toBeVisible();
  },
};

/** Tri sur la valeur, pas sur le texte ; vides en dernier dans les deux sens (D-172). */
export const Tri: Story = {
  render: () => <Frame {...base()} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const header = c.getByRole("columnheader", { name: /Montant/ });
    const amounts = () => c.getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("gridcell")[2]!.textContent);
    const num = (t: string | null) => Number(t!.replace(/[^\d,]/g, "").replace(",", "."));
    await userEvent.click(header);
    await waitFor(() => expect(header).toHaveAttribute("aria-sort", "ascending"));
    let a = amounts();
    const filled = a.filter((t) => t !== "—");
    await expect(filled.map(num)).toEqual([...filled.map(num)].sort((x, y) => x - y));
    await expect(a.slice(-3)).toEqual(["—", "—", "—"]);
    await userEvent.click(header);
    await waitFor(() => expect(header).toHaveAttribute("aria-sort", "descending"));
    a = amounts();
    await expect(a.slice(-3)).toEqual(["—", "—", "—"]);
    await expect(num(a[0]!)).toBeGreaterThan(num(a[1]!));
  },
};

/** Filtres et tri mémorisés ; recherche oubliée (D-177). */
export const Memorisation: Story = {
  render: () => {
    const [n, setN] = useState(0);
    return (
      <div>
        <button type="button" onClick={() => setN(n + 1)}>
          Rouvrir la page
        </button>
        <Frame key={n} {...base({ storageId: "memo" })} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Tous les états/ }));
    await userEvent.click(await waitFor(() => body().getByRole("option", { name: "Close" })));
    await userEvent.type(c.getByRole("combobox", { name: /Rechercher/ }), "licence");
    await waitFor(() => expect(titles(canvasElement)).toHaveLength(1));
    await userEvent.click(c.getByRole("button", { name: "Rouvrir la page" }));
    await waitFor(() => expect(c.getByRole("combobox", { name: /Rechercher/ })).toHaveValue(""));
    await expect(c.getByRole("button", { name: /Close/ })).toBeVisible();
    await expect(titles(canvasElement)).toHaveLength(2);
  },
};

/** Pied « more » : 50 lignes, « Afficher plus » ajoute 50 lignes (D-175). */
export const AfficherPlus: Story = {
  render: () => <Frame {...base({ rows: CENT_VINGT })} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("50 sur 120")).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Afficher plus" }));
    await expect(c.getByText("100 sur 120")).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Afficher plus" }));
    await expect(c.getByText("120 éléments")).toBeVisible();
    await expect(c.queryByRole("button", { name: "Afficher plus" })).toBeNull();
  },
};

/** Pied « pages » : « 1–50 sur 120 », page précédente et suivante ; un filtre ramène à la page 1 (D-175). */
export const Pagination: Story = {
  render: () => <Frame {...base({ rows: CENT_VINGT, pagination: { mode: "pages" } })} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const nav = c.getByRole("navigation", { name: "Pagination" });
    await expect(c.getByText("1–50 sur 120")).toBeVisible();
    await expect(within(nav).getByRole("button", { name: "Page précédente" })).toBeDisabled();
    await userEvent.click(within(nav).getByRole("button", { name: "Page suivante" }));
    await expect(c.getByText("51–100 sur 120")).toBeVisible();
    await userEvent.click(within(nav).getByRole("button", { name: "Page suivante" }));
    await expect(c.getByText("101–120 sur 120")).toBeVisible();
    await expect(within(nav).getByRole("button", { name: "Page suivante" })).toBeDisabled();
    await userEvent.click(c.getByRole("button", { name: /Tous les états/ }));
    await userEvent.click(await waitFor(() => body().getByRole("option", { name: "Close" })));
    await waitFor(() => expect(c.getByText("24 éléments")).toBeVisible());
  },
};

/** Clic : sélection (`onSelect`) ; double-clic ou Entrée : ouverture (`onOpen`). */
export const Ouverture: Story = {
  render: () => {
    const [sel, setSel] = useState<string | null>(null);
    return <Frame {...base({ selectedId: sel, onSelect: (r) => setSel(r?.id ?? null), onOpen: fn() })} />;
  },
  args: {},
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const row = c.getByRole("row", { name: /Commande de badges/ });
    await userEvent.click(row);
    await waitFor(() => expect(row).toHaveAttribute("aria-selected", "true"));
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(c.getByRole("row", { name: /Licence du logiciel/ })).toHaveAttribute("aria-selected", "true"));
  },
};

/** Sélection multiple : la barre devient « n sélectionnés » avec les actions groupées (D-178). */
export const Selection: Story = {
  render: () => {
    const close = fn();
    return (
      <Frame
        {...base({
          selectionMode: "multiple",
          selectionActions: (rows) => [
            { id: "close", label: `Clore (${rows.length})`, primary: true, onPress: close },
            { id: "del", label: "Supprimer", danger: true, onPress: fn() },
          ],
        })}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    for (const name of [/Accès au VPN/, /Réservation de salle/]) {
      const row = c.getByRole("row", { name });
      await userEvent.hover(row);
      await userEvent.click(within(row).getByRole("checkbox"));
    }
    await waitFor(() => expect(c.getByRole("toolbar", { name: "2 sélectionnés" })).toBeVisible());
    await expect(c.queryByRole("combobox", { name: /Rechercher/ })).toBeNull();
    await expect(c.getByRole("button", { name: /Clore \(\d+\)/ })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Tout désélectionner" }));
    await waitFor(() => expect(c.getByRole("combobox", { name: /Rechercher/ })).toBeVisible());
  },
};

/** Actions de ligne, en zone `row` (D-114) ; le reste dans « … ». */
export const ActionsDeLigne: Story = {
  render: () => (
    <Frame
      {...base({
        rowActions: (r) => [
          { id: "open", label: "Ouvrir", icon: <ListDetail />, onPress: fn() },
          { id: "close", label: "Clore", icon: <Check />, onPress: fn() },
          { id: "del", label: `Supprimer ${r.id}`, icon: <X />, danger: true, onPress: fn() },
        ],
      })}
    />
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const row = c.getByRole("row", { name: /Accès au VPN/ });
    await userEvent.hover(row);
    await userEvent.click(within(row).getByRole("button", { name: "Plus d'actions" }));
    await waitFor(() => expect(body().getByRole("menuitem", { name: "Supprimer D-1001" })).toBeVisible());
    await expect(body().getByRole("menuitem", { name: "Clore" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
  },
};

/** Variante `list` : titre, sous-titre, méta et statut tirés des colonnes. */
export const EnListe: Story = {
  render: () => <Frame {...base({ layout: "list", item: { title: "titre", subtitle: "demandeur", meta: "creee", status: "etat" } })} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const row = c.getByRole("row", { name: /Accès au VPN/ });
    await expect(within(row).getByText("Inès Moreau")).toBeVisible();
    await expect(within(row).getByText("22 nov. 2026")).toBeVisible();
    await expect(within(row).getByText("Nouvelle")).toBeVisible();
    await userEvent.type(c.getByRole("combobox", { name: /Rechercher/ }), "partage");
    await waitFor(() => expect(c.getAllByRole("row")).toHaveLength(1));
  },
};

/** Vide : en-tête, puis EmptyState avec l'action principale ; ni barre ni pied (D-176). */
export const Vide: Story = {
  render: () => {
    const onNew = fn();
    return <Frame {...base({ rows: [], actions: pageActions(onNew) })} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Aucune demande")).toBeVisible();
    await expect(c.queryByRole("combobox", { name: /Rechercher/ })).toBeNull();
    await expect(c.queryByText(/élément/)).toBeNull();
    await expect(c.getAllByRole("button", { name: "Nouvelle demande" })).toHaveLength(1);
  },
};

/** Premier chargement : squelettes, sans barre ni pied (D-084). */
export const Chargement: Story = {
  render: () => <Frame {...base({ rows: undefined })} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("status", { name: "Chargement…" })).toHaveAttribute("aria-busy", "true");
    await expect(c.queryByRole("combobox", { name: /Rechercher/ })).toBeNull();
  },
};

/** Erreur au premier chargement, puis erreur avec des lignes déjà là (D-085). */
export const Erreur: Story = {
  render: () => {
    const retry = fn();
    return (
      <div className="grid gap-4">
        <div data-testid="a">
          <Frame {...base({ rows: undefined, hasError: true, onRetry: retry })} />
        </div>
        <div data-testid="b">
          <Frame {...base({ hasError: true, onRetry: retry })} />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(within(c.getByTestId("a")).getByRole("alert")).toHaveTextContent("Impossible de charger les résultats");
    await expect(within(c.getByTestId("b")).getByRole("alert")).toHaveTextContent("Résultats non mis à jour");
    await expect(within(c.getByTestId("b")).getAllByRole("rowheader")).toHaveLength(12);
  },
};

/** Rechargement : lignes gardées, barre fine (D-084). */
export const Rechargement: Story = {
  render: () => <Frame {...base({ isLoading: true })} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("progressbar")).toBeInTheDocument();
    await expect(c.getAllByRole("rowheader")).toHaveLength(12);
  },
};

/** `remote` : rien n'est filtré ni découpé ici ; chaque changement part à `onStateChange` (D-174). */
export const Distant: Story = {
  render: () => {
    const onStateChange = fn();
    (window as unknown as { __listState: typeof onStateChange }).__listState = onStateChange;
    return <Frame {...base({ rows: CENT_VINGT.slice(0, 50), remote: true, total: 312, onStateChange })} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const spy = (window as unknown as { __listState: ReturnType<typeof fn> }).__listState;
    await expect(c.getByText("50 sur 312")).toBeVisible();
    await userEvent.type(c.getByRole("combobox", { name: /Rechercher/ }), "vpn");
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith({ query: "vpn", filters: {}, sort: null, page: 1 }));
    await expect(c.getAllByRole("rowheader")).toHaveLength(50);
    await userEvent.click(c.getByRole("button", { name: "Afficher plus" }));
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
  },
};
