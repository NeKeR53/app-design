/*
 * Recette « Tableau de bord » (D-407). Doc : Dashboard.recipe.md.
 * Page composée sur toute la largeur : période dans la barre d'outils, quatre chiffres clés (Card metric) sur une
 * rangée de PageGrid, puis le graphique (Chart, D-428) et le tableau côte à côte. Tout tient sur un écran.
 * UI d'abord (D-427) : au premier chargement, la barre et les titres sont là ; chaque bloc montre sa propre attente.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Card } from "../../components/Card/Card";
import { Chart } from "../../components/Chart/Chart";
import { FormattedValue } from "../../components/FormattedValue/FormattedValue";
import { List } from "../../components/List/List";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl";
import { Table } from "../../components/Table/Table";
import { Download } from "../../icons";
import { Page, PageGrid, PageSection } from "../../templates/Page/Page";
import { RecipeShell, resetStoredState } from "../../../.storybook/recipe-shell";

/* ---------- Données factices ---------- */

const WEEKS = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48];
const ORDERS = [212, 236, 228, 251, 247, 268, 259, 281, 274, 296, 288, 312];

interface Best {
  id: string;
  produit: string;
  commandes: number;
  ca: number;
  evolution: number;
}
const BEST: Best[] = [
  { id: "1", produit: "Suspension Halo", commandes: 182, ca: 27_118, evolution: 0.18 },
  { id: "2", produit: "Applique Orbe", commandes: 141, ca: 13_959, evolution: 0.07 },
  { id: "3", produit: "Lampe Duo", commandes: 96, ca: 18_720, evolution: -0.04 },
  { id: "4", produit: "Spot Lune", commandes: 88, ca: 5_192, evolution: 0.11 },
  { id: "5", produit: "Suspension Cloche", commandes: 64, ca: 14_656, evolution: -0.02 },
  { id: "6", produit: "Applique Arc", commandes: 51, ca: 6_579, evolution: 0.03 },
];

const WAITING = [
  { id: "C-4821", title: "Maison Verre", subtitle: "Commande C-4821 · 3 articles", meta: "1 240 €", status: { label: "En retard", tone: "danger" as const } },
  { id: "C-4830", title: "Studio Nord", subtitle: "Commande C-4830 · 1 article", meta: "389 €", status: { label: "À expédier", tone: "warning" as const } },
  { id: "C-4833", title: "Hôtel des Arts", subtitle: "Commande C-4833 · 12 articles", meta: "4 812 €", status: { label: "À expédier", tone: "warning" as const } },
  { id: "C-4835", title: "Café Lumière", subtitle: "Commande C-4835 · 2 articles", meta: "174 €", status: { label: "Paiement attendu", tone: "pending" as const } },
];
const LOW_STOCK = [
  { id: "P-207", title: "Lampe Duo", subtitle: "Lampes à poser · finition laiton", meta: "3 restants", status: { label: "Stock bas", tone: "warning" as const } },
  { id: "P-203", title: "Spot Lune", subtitle: "Spots · blanc mat", meta: "0", status: { label: "Épuisé", tone: "danger" as const } },
  { id: "P-211", title: "Applique Arc", subtitle: "Appliques · noir", meta: "5 restants", status: { label: "Stock bas", tone: "warning" as const } },
];

/* ---------- La page ---------- */

type DashboardState = "ready" | "loading" | "refreshing" | "error" | "empty" | "chart-error";

function Dashboard({ state = "ready" }: { state?: DashboardState }) {
  const [period, setPeriod] = useState("30j");
  const [opened, setOpened] = useState<string | null>(null);
  const empty = state === "empty";
  const loading = state === "loading";
  const section = loading ? "loading" : "ready";
  const card = (label: string, value: ReactNode, delta?: { text: string; tone: "positive" | "negative" | "neutral"; trend?: "up" | "down" | "flat" }, trend?: { values: number[]; label: string }) => (
    <Card
      variant="metric"
      label={label}
      value={value}
      isLoading={loading}
      {...(delta && !empty ? { delta } : {})}
      {...(trend && !empty ? { trend: trend.values, trendLabel: trend.label } : {})}
      onPress={() => setOpened(label)}
    />
  );
  return (
    <RecipeShell
      page="ventes"
      pageTitle="Ventes"
      views={[
        { id: "apercu", label: "Vue d'ensemble" },
        { id: "commandes", label: "Commandes" },
      ]}
      activeView={opened ? "commandes" : "apercu"}
      onViewChange={(id) => setOpened(id === "commandes" ? "Commandes" : null)}
    >
      {opened ? (
        <Page>
          <PageSection title={`Commandes · ${opened}`} description="La vue « Commandes » montre la liste ; une carte y mène, filtrée.">
            {null}
          </PageSection>
        </Page>
      ) : (
        <Page
          toolbar={
            <SegmentedControl
              label="Période"
              options={[
                { value: "7j", label: "7 jours" },
                { value: "30j", label: "30 jours" },
                { value: "12m", label: "12 mois" },
              ]}
              value={period}
              onChange={setPeriod}
            />
          }
          actions={[{ id: "exporter", label: "Exporter", icon: <Download />, onPress: () => undefined }]}
          actionsLabel="Ventes"
          state={state === "error" ? "error" : "ready"}
          isRefreshing={state === "refreshing"}
          onRetry={() => undefined}
        >
          <PageGrid columns={4}>
            {card("Commandes", empty ? "0" : <FormattedValue value={1284} type="number" />, { text: "+12 % sur 30 jours", tone: "positive" }, { values: ORDERS, label: "Commandes sur 12 semaines, de 212 à 312" })}
            {card("Chiffre d'affaires", empty ? "0 €" : <FormattedValue value={86420} type="money" decimals={0} />, { text: "+8 % sur 30 jours", tone: "positive" }, { values: [71, 74, 72, 76, 75, 79, 78, 81, 80, 83, 84, 86], label: "Chiffre d'affaires sur 12 semaines, de 71 k€ à 86 k€" })}
            {card("Panier moyen", empty ? "—" : <FormattedValue value={67.3} type="money" />, { text: "−3 % sur 30 jours", tone: "negative" }, { values: [70.1, 69.8, 70.4, 69.5, 69.9, 69.2, 68.8, 69.1, 68.4, 68.0, 67.9, 67.3], label: "Panier moyen sur 12 semaines, de 70,10 € à 67,30 €" })}
            {card("Retours", empty ? "—" : <FormattedValue value={0.021} type="percent" decimals={1} />, { text: "−0,4 pt sur 30 jours", tone: "positive", trend: "down" }, { values: [2.6, 2.5, 2.7, 2.5, 2.4, 2.4, 2.3, 2.4, 2.2, 2.2, 2.1, 2.1], label: "Retours sur 12 semaines, de 2,6 % à 2,1 %" })}
          </PageGrid>
          <PageGrid columns={2}>
            <PageSection
              title="Commandes par semaine"
              description="Les 12 dernières semaines."
              state={state === "chart-error" ? "error" : section}
              onRetry={() => undefined}
              {...(empty ? { empty: { title: "Aucune commande sur la période", description: "Choisissez une période plus longue.", action: { id: "12m", label: "Voir 12 mois", onPress: () => setPeriod("12m") } } } : {})}
            >
              <Chart
                type="bar"
                label={`Commandes par semaine, de la semaine ${WEEKS[0]} à la semaine ${WEEKS[WEEKS.length - 1]} : de ${ORDERS[0]} à ${ORDERS[ORDERS.length - 1]}`}
                categories={WEEKS.map((w) => `S${w}`)}
                series={[{ id: "commandes", label: "Commandes", values: ORDERS }]}
              />
            </PageSection>
            <PageSection
              title="Meilleures ventes"
              state={section}
              description="Sur 30 jours, par chiffre d'affaires."
              actions={[{ id: "tout", label: "Voir tout", primary: true, onPress: () => setOpened("Meilleures ventes") }]}
              {...(empty ? { empty: { title: "Aucune vente sur la période" } } : {})}
            >
              <Table<Best>
                label="Meilleures ventes"
                density="compact"
                selectionMode="none"
                columns={[
                  { id: "produit", label: "Produit" },
                  { id: "commandes", label: "Commandes", align: "end", width: 96 },
                  { id: "ca", label: "CA", align: "end", width: 96 },
                  { id: "evolution", label: "Évolution", align: "end", width: 92 },
                ]}
                rows={BEST}
                renderCell={(row, id) =>
                  id === "produit" ? row.produit : id === "commandes" ? <FormattedValue value={row.commandes} type="number" /> : id === "ca" ? <FormattedValue value={row.ca} type="money" decimals={0} /> : <FormattedValue value={row.evolution} type="percent" />
                }
              />
            </PageSection>
          </PageGrid>
          <PageGrid columns={2}>
            <PageSection
              title="Commandes en attente"
              state={section}
              description="À expédier ou en retard."
              actions={[{ id: "toutes", label: "Voir tout", primary: true, onPress: () => setOpened("Commandes en attente") }]}
              {...(empty ? { empty: { title: "Aucune commande en attente" } } : {})}
            >
              <List label="Commandes en attente" items={WAITING} selectionMode="none" />
            </PageSection>
            <PageSection
              title="Stock bas"
              state={section}
              description="Sous le seuil d'alerte."
              actions={[{ id: "catalogue", label: "Voir le catalogue", primary: true, onPress: () => setOpened("Stock bas") }]}
              {...(empty ? { empty: { title: "Aucun produit sous le seuil" } } : {})}
            >
              <List label="Stock bas" items={LOW_STOCK} selectionMode="none" />
            </PageSection>
          </PageGrid>
        </Page>
      )}
    </RecipeShell>
  );
}

/* ---------- Stories ---------- */

const meta: Meta<typeof Dashboard> = {
  title: "Recettes/Tableau de bord",
  component: Dashboard,
  parameters: { layout: "fullscreen" },
  beforeEach: resetStoredState,
};
export default meta;
type Story = StoryObj<typeof Dashboard>;

/** Référence (captures) : période, quatre chiffres clés, graphique et tableau côte à côte, sur un écran. */
export const Reference: Story = {};

/** Tout tient sur un écran : rien ne défile dans une fenêtre de bureau (1440 × 900). */
export const UnEcran: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const cards = c.getAllByRole("button", { name: /^(Commandes|Chiffre d'affaires|Panier moyen|Retours)$/ });
    await expect(cards).toHaveLength(4);
    // Les quatre cartes sur une rangée, si la place le permet.
    const tops = new Set(cards.map((b) => Math.round(b.closest("[data-page-grid] > *")!.getBoundingClientRect().top)));
    if (window.innerWidth >= 1400) await expect(tops.size).toBe(1);
    // Graphique et tableau côte à côte.
    const chart = c.getByRole("group", { name: /^Commandes par semaine/ });
    const table = c.getByRole("grid", { name: "Meilleures ventes" });
    if (window.innerWidth >= 1200) await expect(Math.abs(chart.getBoundingClientRect().top - table.getBoundingClientRect().top)).toBeLessThan(80);
  },
};

/** Un chiffre clé mène à la liste qu'il résume (vue « Commandes ») ; la période s'applique tout de suite. */
export const ChiffreQuiMene: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("radio", { name: "12 mois" }));
    await expect(c.getByRole("radio", { name: "12 mois" })).toBeChecked();
    await userEvent.click(c.getByRole("button", { name: "Retours" }));
    await waitFor(() => expect(c.getByRole("tab", { name: "Commandes" })).toHaveAttribute("aria-selected", "true"));
  },
};

/**
 * Premier chargement, UI d'abord (D-427) : la barre, les libellés des cartes et les titres des blocs sont là tout de
 * suite ; chaque valeur et chaque bloc montrent leur propre attente. La page ne passe pas en `loading`.
 */
export const Chargement: Story = {
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("radio", { name: "30 jours" })).toBeVisible();
    await expect(c.getByRole("button", { name: "Commandes" })).toBeVisible();
    await expect(canvasElement.querySelectorAll("[data-card-value-loading]")).toHaveLength(4);
    await expect(c.getByRole("heading", { name: "Commandes par semaine" })).toBeVisible();
  },
};

/** Relecture (nouvelle période, actualisation) : tout reste affiché ; une barre de 2 px sous la barre d'outils (D-426). */
export const Relecture: Story = {
  args: { state: "refreshing" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-page-content]")).toHaveAttribute("aria-busy", "true");
    await expect(within(canvasElement).getByRole("img", { name: /^Commandes sur 12 semaines/ })).toBeVisible();
  },
};

/** Échec du chargement de la page : message et « Réessayer ». */
export const Erreur: Story = {
  args: { state: "error" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toBeVisible();
  },
};

/** Échec d'un seul bloc : les autres restent ; le bloc dit son échec et propose « Réessayer ». */
export const ErreurDUnBloc: Story = {
  args: { state: "chart-error" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Impossible de charger cette partie")).toBeVisible();
    await expect(c.getByRole("grid", { name: "Meilleures ventes" })).toBeVisible();
  },
};

/** Période sans données : les blocs disent l'absence et proposent la suite. */
export const Vide: Story = {
  args: { state: "empty" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Aucune commande sur la période")).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Voir 12 mois" }));
    await expect(c.getByRole("radio", { name: "12 mois" })).toBeChecked();
  },
};
