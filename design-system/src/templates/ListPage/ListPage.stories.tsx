import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import type { StatusMap } from "../../components/FormattedValue/FormattedValue";
import { Check, ListDetail, Pencil, Plus, X } from "../../icons";
import { pageImage, productImage } from "../../../.storybook/story-images";
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

/** Pied « pages » : « 1–50 sur 120 » et le composant `Pagination` (numéros, précédente, suivante) ; un filtre ramène à la page 1 (D-175, D-359). */
export const Pagination: Story = {
  render: () => <Frame {...base({ rows: CENT_VINGT, pagination: { mode: "pages" } })} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const nav = c.getByRole("navigation", { name: "Pagination" });
    await expect(c.getByText("1–50 sur 120")).toBeVisible();
    await expect(within(nav).getByRole("button", { name: "Page précédente" })).toBeDisabled();
    await expect(within(nav).getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    await expect(within(nav).getAllByRole("button", { name: /^Page \d$/ })).toHaveLength(3);
    await userEvent.click(within(nav).getByRole("button", { name: "Page suivante" }));
    await expect(c.getByText("51–100 sur 120")).toBeVisible();
    // Un numéro mène à sa page.
    await userEvent.click(within(nav).getByRole("button", { name: "Page 1" }));
    await expect(c.getByText("1–50 sur 120")).toBeVisible();
    await userEvent.click(within(nav).getByRole("button", { name: "Page 2" }));
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
    await userEvent.click(within(row).getByRole("button", { name: /^Plus d'actions pour Accès au VPN/ }));
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

/** Erreur au premier chargement, puis erreur avec des lignes déjà là (D-085) : avec `updatedAt`, l'âge des données (D-434). */
export const Erreur: Story = {
  render: () => {
    const retry = fn();
    return (
      <div className="grid gap-4">
        <div data-testid="a">
          <Frame {...base({ rows: undefined, hasError: true, onRetry: retry })} />
        </div>
        <div data-testid="b">
          <Frame {...base({ hasError: true, onRetry: retry, updatedAt: new Date(Date.now() - 12 * 60_000) })} />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(within(c.getByTestId("a")).getByRole("alert")).toHaveTextContent("Impossible de charger les résultats");
    await expect(within(c.getByTestId("b")).getByRole("alert")).toHaveTextContent("Résultats non mis à jour");
    await expect(within(c.getByTestId("b")).getByRole("alert")).toHaveTextContent("Dernière mise à jour il y a 12 minutes.");
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

/** Filtre actif, lignes cochées, puis une ligne change d'état au rechargement : masquée par le filtre, elle est décochée ; le compte de la barre est celui que l'action touche (D-178). */
export const SelectionMasquee: Story = {
  render: () => {
    const [rows, setRows] = useState(DOUZE);
    const [touched, setTouched] = useState<string[]>([]);
    return (
      <>
        <button type="button" onClick={() => setRows((rs) => rs.map((r) => (r.id === "D-1001" ? { ...r, etat: "close" } : r)))}>
          Recharger
        </button>
        <output data-testid="touched">{touched.join(",")}</output>
        <Frame
          {...base({
            rows,
            selectionMode: "multiple",
            selectionActions: (rs) => [{ id: "close", label: "Clore", primary: true, onPress: () => setTouched(rs.map((r) => r.id)) }],
          })}
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Tous les états/ }));
    await userEvent.click(await waitFor(() => body().getByRole("option", { name: "Nouvelle" })));
    await waitFor(() => expect(c.getByText("3 éléments")).toBeVisible());
    for (const name of [/Accès au VPN/, /Imprimante du 2e étage/]) {
      const row = c.getByRole("row", { name });
      await userEvent.hover(row);
      await userEvent.click(within(row).getByRole("checkbox"));
    }
    await waitFor(() => expect(c.getByRole("toolbar", { name: "2 sélectionnés" })).toBeVisible());
    // « Accès au VPN » (D-1001) passe à « Close » : le filtre « Nouvelle » la masque.
    await userEvent.click(c.getByRole("button", { name: "Recharger" }));
    await waitFor(() => expect(c.getByRole("toolbar", { name: "1 sélectionné" })).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: "Clore" }));
    await waitFor(() => expect(c.getByTestId("touched").textContent).toBe("D-1006"));
  },
};

/** Pied « pages » : une nouvelle page s'affiche depuis le haut ; `Pagination` garde le focus (D-175, D-359). */
export const PaginationDefilement: Story = {
  render: () => <Frame {...base({ rows: make(60), pagination: { mode: "pages" } })} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const scroller = c.getByRole("grid").closest<HTMLElement>(".overflow-auto")!;
    scroller.scrollTop = 400;
    await waitFor(() => expect(scroller.scrollTop).toBeGreaterThan(0));
    const nav = c.getByRole("navigation", { name: "Pagination" });
    await userEvent.click(within(nav).getByRole("button", { name: "Page suivante" }));
    await expect(c.getByText("51–60 sur 60")).toBeVisible();
    await waitFor(() => expect(scroller.scrollTop).toBe(0));
    // Dernière page : « Page suivante » devient inactif, le focus passe à la page courante.
    await waitFor(() => expect(within(nav).getByRole("button", { name: "Page 2" })).toHaveFocus());
  },
};

/** « Tout cocher » sur la page, puis « Sélectionner les 120 éléments » : les actions groupées reçoivent `"all"` ; une recherche efface « tout » (D-345). */
export const ToutSelectionner: Story = {
  render: () => {
    const [got, setGot] = useState("");
    return (
      <>
        <output data-testid="got">{got}</output>
        <Frame
          {...base({
            rows: CENT_VINGT,
            selectionMode: "multiple",
            allowSelectAll: true,
            selectionActions: (rows, selection) => [{ id: "close", label: "Clore", primary: true, onPress: () => setGot(`${selection}:${rows.length}`) }],
          })}
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("checkbox", { name: "Tout sélectionner" }));
    await waitFor(() => expect(c.getByRole("toolbar", { name: "50 sélectionnés" })).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: "Sélectionner les 120 éléments" }));
    await waitFor(() => expect(c.getByRole("toolbar", { name: "120 éléments sélectionnés" })).toBeVisible());
    await expect(c.getByRole("button", { name: "Effacer la sélection" })).toBeVisible();
    // « Afficher plus » : les nouvelles lignes sont cochées aussi.
    await userEvent.click(c.getByRole("button", { name: "Afficher plus" }));
    await waitFor(() => expect(c.getByRole("row", { name: /n° 60/ })).toHaveAttribute("aria-selected", "true"));
    await userEvent.click(c.getByRole("button", { name: "Clore" }));
    await waitFor(() => expect(c.getByTestId("got").textContent).toBe("all:120"));
    // Décocher une ligne quitte « tout ».
    await userEvent.click(c.getByRole("checkbox", { name: "Tout sélectionner" }));
    await userEvent.click(c.getByRole("button", { name: "Sélectionner les 120 éléments" }));
    const row = c.getByRole("row", { name: /n° 2\b/ });
    await userEvent.click(within(row).getByRole("checkbox"));
    await waitFor(() => expect(c.getByRole("toolbar", { name: "99 sélectionnés" })).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: "Tout désélectionner" }));
  },
};

/** `remote` : « tout » part à `onStateChange` (`selection: "all"`) ; un filtre l'efface (D-345). */
export const ToutSelectionnerDistant: Story = {
  render: () => {
    const onStateChange = fn();
    (window as unknown as { __allState: typeof onStateChange }).__allState = onStateChange;
    return <Frame {...base({ rows: CENT_VINGT.slice(0, 50), remote: true, total: 312, selectionMode: "multiple", allowSelectAll: true, onStateChange, selectionActions: () => [] })} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const spy = (window as unknown as { __allState: ReturnType<typeof fn> }).__allState;
    await userEvent.click(c.getByRole("checkbox", { name: "Tout sélectionner" }));
    await userEvent.click(await waitFor(() => c.getByRole("button", { name: "Sélectionner les 312 éléments" })));
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ selection: "all" })));
    await expect(c.getByRole("toolbar", { name: "312 éléments sélectionnés" })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Effacer la sélection" }));
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith({ query: "", filters: {}, sort: null, page: 1 }));
  },
};

/** Sans `allowSelectAll`, rien ne change : pas de lien « Sélectionner les N éléments » (D-345). */
export const ToutSelectionnerParDefaut: Story = {
  render: () => <Frame {...base({ rows: CENT_VINGT, selectionMode: "multiple", selectionActions: () => [] })} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("checkbox", { name: "Tout sélectionner" }));
    await waitFor(() => expect(c.getByRole("toolbar", { name: "50 sélectionnés" })).toBeVisible());
    await expect(c.queryByRole("button", { name: /Sélectionner les/ })).toBeNull();
  },
};

/** Menu « Colonnes » (`allowColumnChoice`) : une case par colonne, la première et les `required` ne se masquent pas ; choix mémorisé (D-346, D-007). */
export const Colonnes: Story = {
  render: () => {
    const [n, setN] = useState(0);
    return (
      <div>
        <button type="button" onClick={() => setN(n + 1)}>
          Rouvrir la page
        </button>
        <Frame key={n} {...base({ allowColumnChoice: true, columns: columns.map((col) => (col.id === "etat" ? { ...col, required: true } : col)) })} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const heads = () => c.getAllByRole("columnheader").map((h) => h.textContent);
    await userEvent.click(c.getByRole("button", { name: "Colonnes" }));
    const menu = await waitFor(() => body().getByRole("menu", { name: "Colonnes" }));
    await expect(within(menu).getByRole("menuitemcheckbox", { name: "Titre" })).toHaveAttribute("aria-disabled", "true");
    await expect(within(menu).getByRole("menuitemcheckbox", { name: "État" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(within(menu).getByRole("menuitemcheckbox", { name: "Montant" }));
    await waitFor(() => expect(heads()).not.toContain("Montant"));
    await expect(within(menu).getByRole("menuitemcheckbox", { name: "Montant" })).toHaveAttribute("aria-checked", "false");
    await userEvent.keyboard("{Escape}");
    await userEvent.click(c.getByRole("button", { name: "Rouvrir la page" }));
    await waitFor(() => expect(heads()).toEqual(["Titre", "État", "Demandeur", "Créée"]));
  },
};

/** Tri à trois états (`allowsUnsort`) : croissant, décroissant, puis ordre d'origine ; `onStateChange` reçoit `sort: null` (D-347). */
export const TriTroisEtats: Story = {
  render: () => <Frame {...base({ allowsUnsort: true })} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const original = titles(canvasElement);
    const header = () => c.getByRole("columnheader", { name: /Titre/ });
    await userEvent.click(header());
    await waitFor(() => expect(header()).toHaveAttribute("aria-sort", "ascending"));
    await userEvent.click(header());
    await waitFor(() => expect(header()).toHaveAttribute("aria-sort", "descending"));
    await userEvent.click(header());
    await waitFor(() => expect(titles(canvasElement)).toEqual(original));
    await expect(header()).not.toHaveAttribute("aria-sort", "ascending");
    await expect(header()).not.toHaveAttribute("aria-sort", "descending");
    await expect(localStorage.getItem("storybook:listpage:Demandes:sort")).toBe("null");
  },
};

/**
 * Lignes par page (`pageSizes`) : 25, 50 ou 100, mémorisé ; retour à la page 1 au changement (D-348).
 * La page courante se lit dans `Pagination` (numéro `aria-current`) ; « Page n sur N » n'apparaît que sous 641 px.
 */
export const LignesParPage: Story = {
  render: () => {
    const [n, setN] = useState(0);
    return (
      <div>
        <button type="button" onClick={() => setN(n + 1)}>
          Rouvrir la page
        </button>
        <Frame key={n} {...base({ rows: CENT_VINGT, pagination: { mode: "pages", pageSizes: true } })} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("1–50 sur 120")).toBeVisible();
    const nav = () => c.getByRole("navigation", { name: "Pagination" });
    const currentPage = () => within(nav()).getByRole("button", { current: "page" });
    await expect(currentPage()).toHaveAccessibleName("Page 1");
    await expect(within(nav()).getAllByRole("button", { name: /^Page \d$/ })).toHaveLength(3);
    // Pas de « Page n sur N » en double à côté du choix des lignes : seule la version mobile de Pagination le porte.
    await expect(c.getByText("Page 1 sur 3")).not.toBeVisible();
    await userEvent.click(c.getByRole("button", { name: /Lignes par page/ }));
    await userEvent.click(await waitFor(() => body().getByRole("option", { name: "25" })));
    await waitFor(() => expect(c.getByText("1–25 sur 120")).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: "Page suivante" }));
    await expect(currentPage()).toHaveAccessibleName("Page 2");
    await expect(within(nav()).getByRole("button", { name: "Page 5" })).toBeInTheDocument();
    await expect(c.getAllByRole("rowheader")).toHaveLength(25);
    await userEvent.click(c.getByRole("button", { name: "Rouvrir la page" }));
    await waitFor(() => expect(c.getByText("1–25 sur 120")).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: /Lignes par page/ }));
    await userEvent.click(await waitFor(() => body().getByRole("option", { name: "100" })));
    await waitFor(() => expect(currentPage()).toHaveAccessibleName("Page 1"));
    await expect(within(nav()).getAllByRole("button", { name: /^Page \d$/ })).toHaveLength(2);
  },
};

/** Accès refusé (`isForbidden`) : cadenas, « Vous n'avez pas accès à … », « Demander l'accès » ; ni barre, ni liste, ni actions (D-351). */
export const AccesRefuse: Story = {
  render: () => <Frame {...base({ isForbidden: true, forbidden: { title: "Vous n'avez pas accès à ces demandes" }, onRequestAccess: fn() })} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { level: 2, name: "Vous n'avez pas accès à ces demandes" })).toBeVisible();
    await expect(c.getByText("Demandez l'accès à un administrateur.")).toBeVisible();
    await expect(c.getByRole("button", { name: "Demander l'accès" })).toBeVisible();
    await expect(c.queryByRole("grid")).toBeNull();
    await expect(c.queryByRole("combobox", { name: /Rechercher/ })).toBeNull();
    await expect(c.queryByRole("button", { name: "Nouvelle demande" })).toBeNull();
  },
};

/* Grille de vignettes (D-414) : un catalogue de produits, des documents. */
interface Produit {
  id: string;
  nom: string;
  gamme: string;
  prix: number;
  stock: string;
  photo?: string;
}
const STOCKS: StatusMap = {
  en_stock: { label: "En stock", tone: "success" },
  bas: { label: "Stock bas", tone: "warning" },
  epuise: { label: "Épuisé", tone: "danger" },
};
const PRODUITS: Produit[] = ["Suspension Halo", "Applique Orbe", "Lampe Duo", "Spot Lune", "Suspension Cloche", "Applique Arc", "Lampe Totem", "Spot Trio", "Suspension Nid", "Applique Fil"].map((nom, i) => ({
  id: `P-${200 + i}`,
  nom,
  gamme: ["Suspensions", "Appliques", "Lampes à poser", "Spots"][i % 4]!,
  prix: 89 + ((i * 53) % 400),
  stock: ["en_stock", "en_stock", "bas", "epuise"][i % 4]!,
  ...(i === 7 ? {} : { photo: productImage(i) }),
}));
const produitColumns: ListPageColumn<Produit>[] = [
  { id: "nom", label: "Nom" },
  { id: "gamme", label: "Gamme" },
  { id: "prix", label: "Prix", type: "money" },
  { id: "stock", label: "Stock", type: "status", statuses: STOCKS },
];

function Catalogue(over: Partial<ListPageProps<Produit>>) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="h-[640px] border border-line bg-surface">
      <ListPage<Produit>
        title="Catalogue"
        rows={PRODUITS}
        columns={produitColumns}
        layout="grid"
        item={{ title: "nom", subtitle: "gamme", meta: "prix", status: "stock" }}
        thumbnail={(p) => (p.photo ? { src: p.photo } : undefined)}
        filters={[{ id: "gamme", label: "Gamme", allLabel: "Toutes les gammes", options: ["Suspensions", "Appliques", "Lampes à poser", "Spots"].map((g) => ({ id: g, label: g })) }]}
        search={{ label: "le catalogue" }}
        empty={{ title: "Aucun produit", description: "Ajoutez un produit au catalogue." }}
        actions={[{ id: "new", label: "Nouveau produit", icon: <Plus />, primary: true, onPress: fn() }]}
        rowActions={() => [{ id: "edit", label: "Modifier", icon: <Pencil />, onPress: fn() }, { id: "archive", label: "Archiver", onPress: fn() }]}
        selectedId={selected}
        onSelect={(p) => setSelected(p?.id ?? null)}
        {...over}
      />
    </div>
  );
}

/** Vignettes : aperçu 4:3 recadré, nom, gamme, prix et stock ; la sélection se voit sur toute la vignette (D-414). */
export const Grille: Story = {
  render: () => <Catalogue />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const grid = c.getByRole("grid", { name: "Catalogue" });
    const tiles = within(grid).getAllByRole("row");
    await expect(tiles).toHaveLength(10);
    // Plusieurs vignettes par ligne, de 200 px au moins.
    await expect(tiles[1]!.getBoundingClientRect().top).toBe(tiles[0]!.getBoundingClientRect().top);
    await expect(tiles[0]!.getBoundingClientRect().width).toBeGreaterThanOrEqual(200);
    await expect(within(tiles[0]!).getByText("Suspension Halo")).toBeVisible();
    await expect(within(tiles[3]!).getByText("Épuisé")).toBeVisible();
    // Une vignette sans image ni type garde un aperçu vide.
    await expect(tiles[7]!.querySelector("[data-tile-preview]")!.childElementCount).toBe(0);
    await expect(tiles[0]!.querySelector("img")).not.toBeNull();
    await userEvent.click(within(tiles[2]!).getByText("Lampe Duo"));
    await expect(tiles[2]).toHaveAttribute("aria-selected", "true");
  },
};

/** Les flèches suivent la grille à l'écran : droite passe à la voisine, bas à la vignette du dessous. */
export const GrilleClavier: Story = {
  render: () => <Catalogue />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const tiles = within(c.getByRole("grid", { name: "Catalogue" })).getAllByRole("row");
    const perRow = tiles.filter((t) => t.getBoundingClientRect().top === tiles[0]!.getBoundingClientRect().top).length;
    await userEvent.click(within(tiles[0]!).getByText("Suspension Halo"));
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(tiles[1]).toHaveAttribute("aria-selected", "true"));
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(tiles[1 + perRow]).toHaveAttribute("aria-selected", "true"));
  },
};

/** Documents sans aperçu : l'icône et le type de fichier tiennent la place de l'image. */
export const GrilleDocuments: Story = {
  render: () => (
    <div className="h-[420px] border border-line bg-surface">
      <ListPage<{ id: string; nom: string; type: string; pages: number; ajoute: string; apercu?: string }>
        title="Documents"
        rows={[
          { id: "1", nom: "Guide des drivers LED", type: "pdf", pages: 48, ajoute: "2026-11-02", apercu: pageImage("Guide des drivers LED") },
          { id: "2", nom: "Conditions générales de vente", type: "pdf", pages: 6, ajoute: "2026-10-14" },
          { id: "3", nom: "Tarifs 2026", type: "xlsx", pages: 1, ajoute: "2026-09-30" },
          { id: "4", nom: "Photos du showroom", type: "zip", pages: 1, ajoute: "2026-09-12" },
          { id: "5", nom: "Plan de pose", type: "png", pages: 1, ajoute: "2026-08-21" },
        ]}
        columns={[
          { id: "nom", label: "Nom" },
          { id: "ajoute", label: "Ajouté le", type: "date" },
        ]}
        layout="grid"
        item={{ title: "nom", meta: "ajoute" }}
        thumbnail={(d) => ({ type: d.type, ...(d.apercu ? { src: d.apercu } : {}) })}
        empty={{ title: "Aucun document" }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tiles = within(within(canvasElement).getByRole("grid", { name: "Documents" })).getAllByRole("row");
    await expect(tiles[0]!.querySelector("img")).not.toBeNull();
    await expect(within(tiles[1]!).getByText("PDF")).toBeVisible();
    await expect(within(tiles[2]!).getByText("XLSX")).toBeVisible();
  },
};

/** Premier chargement de la grille : des vignettes en squelette. */
export const GrilleChargement: Story = {
  render: () => <Catalogue rows={undefined} />,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll(".aspect-\\[4\\/3\\]").length).toBeGreaterThanOrEqual(8);
  },
};

/** En liste, `thumbnail` donne le visuel de 40 px de chaque ligne. */
export const ListeAvecVignettes: Story = {
  render: () => <Catalogue layout="list" />,
  play: async ({ canvasElement }) => {
    const rows = within(within(canvasElement).getByRole("grid", { name: "Catalogue" })).getAllByRole("row");
    const img = rows[0]!.querySelector("img")!;
    await expect(img.getBoundingClientRect().width).toBe(40);
  },
};

/** File de tri (D-415) : la demande traitée quitte la liste ; la sélection passe à celle qui la suivait à l'écran. */
function FileDeTri() {
  const [rows, setRows] = useState(DOUZE.slice(0, 5));
  const [selected, setSelected] = useState<string | null>(DOUZE[1]!.id);
  const traiter = () => setRows((all) => all.filter((r) => r.id !== selected));
  return (
    <div className="flex flex-col gap-2">
      <span>
        <button type="button" className="socle-btn rounded-md border border-line px-2 py-1 text-sm" onClick={traiter}>
          Traiter la demande sélectionnée
        </button>
      </span>
      <Frame {...base({ rows, layout: "list", item: { title: "titre", subtitle: "demandeur", status: "etat" }, selectedId: selected, onSelect: (r) => setSelected(r?.id ?? null), advanceOnRemove: true })} />
      <output data-current-id="">{selected ?? "aucune"}</output>
    </div>
  );
}

export const AvancerApresTraitement: Story = {
  render: () => <FileDeTri />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const shown = () => canvasElement.querySelector("[data-current-id]")!.textContent;
    await expect(shown()).toBe(DOUZE[1]!.id);
    await userEvent.click(c.getByRole("button", { name: "Traiter la demande sélectionnée" }));
    await waitFor(() => expect(shown()).toBe(DOUZE[2]!.id));
    // Encore une : la suivante à l'écran.
    await userEvent.click(c.getByRole("button", { name: "Traiter la demande sélectionnée" }));
    await waitFor(() => expect(shown()).toBe(DOUZE[3]!.id));
    // La dernière traitée : la sélection remonte à la précédente.
    await userEvent.click(within(c.getByRole("grid")).getByText(DOUZE[4]!.titre));
    await userEvent.click(c.getByRole("button", { name: "Traiter la demande sélectionnée" }));
    await waitFor(() => expect(shown()).toBe(DOUZE[3]!.id));
  },
};

/** Fichiers déposés n'importe où sur la page : cadre « Déposez… », puis `onDropFiles` (D-416). */
export const DepotDeFichiers: Story = {
  render: (args) => <Frame {...base({ onDropFiles: args.onDropFiles ?? fn() })} />,
  args: { onDropFiles: fn() },
  play: async ({ canvasElement, args }) => {
    const page = canvasElement.querySelector<HTMLElement>(".socle-box.relative")!;
    const file = new File(["%PDF"], "notice.pdf", { type: "application/pdf" });
    const data = new DataTransfer();
    data.items.add(file);
    page.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: data }));
    await waitFor(() => expect(within(canvasElement).getByText("Déposez les fichiers pour les ajouter")).toBeVisible());
    page.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: data }));
    await waitFor(() => expect(within(canvasElement).queryByText("Déposez les fichiers pour les ajouter")).toBeNull());
    await expect(args.onDropFiles).toHaveBeenCalledWith([file]);
  },
};

/** Survol vu par l'app (Tauri) : le cadre s'affiche sans événement du DOM. */
export const DepotSignaleParLApp: Story = {
  render: () => <Frame {...base({ onDropFiles: fn(), isDraggingFiles: true, dropLabel: "Déposez les PDF pour les indexer" })} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Déposez les PDF pour les indexer")).toBeVisible();
  },
};
