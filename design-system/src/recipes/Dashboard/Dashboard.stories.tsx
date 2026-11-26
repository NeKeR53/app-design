/*
 * Recette « Tableau de bord » (D-407). Doc : Dashboard.recipe.md.
 * Page composée sur toute la largeur : période dans la barre d'outils, quatre chiffres clés (Card metric) sur une
 * rangée de PageGrid, puis le graphique et le tableau côte à côte. Tout tient sur un écran.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Card } from "../../components/Card/Card";
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

/* ---------- Le graphique de l'app ----------
 * Socle ne dessine pas de graphique : l'app prend sa librairie et les tokens `--chart-*`, `--line`, `--fg-3`.
 * Ici, un histogramme minimal en SVG tient ce rôle : une série, barres de 24 px au plus, bout arrondi de 4 px,
 * grille fine, étiquette directe sur la dernière valeur, info-bulle par barre.
 */
function WeeklyChart({ weeks, values }: { weeks: number[]; values: number[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(520);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(240, Math.floor(el.clientWidth)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const height = 232;
  const left = 36;
  const bottom = 24;
  const top = 16;
  const max = 350;
  const plotH = height - bottom - top;
  const slot = (width - left) / values.length;
  const bar = Math.min(24, slot - 8);
  const y = (v: number) => top + plotH - (v / max) * plotH;
  const last = values.length - 1;
  return (
    <div ref={box} className="w-full">
      <svg width={width} height={height} role="img" aria-label={`Commandes par semaine, de la semaine ${weeks[0]} à la semaine ${weeks[last]} : de ${values[0]} à ${values[last]}.`} className="block font-sans">
        {[0, 100, 200, 300].map((t) => (
          <g key={t}>
            <line x1={left} x2={width} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1} />
            <text x={left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--fg-3)">
              {t}
            </text>
          </g>
        ))}
        {values.map((v, i) => {
          const x = left + i * slot + (slot - bar) / 2;
          const h = y(0) - y(v);
          const r = 4;
          return (
            <g key={weeks[i]}>
              <path d={`M${x},${y(0)} V${y(v) + r} Q${x},${y(v)} ${x + r},${y(v)} H${x + bar - r} Q${x + bar},${y(v)} ${x + bar},${y(v) + r} V${y(0)} Z`} fill="var(--chart-1)">
                <title>{`Semaine ${weeks[i]} : ${v} commandes`}</title>
              </path>
              <text x={x + bar / 2} y={height - 6} textAnchor="middle" fontSize="11" fill="var(--fg-3)">
                {`S${weeks[i]}`}
              </text>
              {i === last && h > 0 && (
                <text x={x + bar / 2} y={y(v) - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--fg-2)">
                  {v}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------- La page ---------- */

type DashboardState = "ready" | "loading" | "error" | "empty" | "chart-error";

function Dashboard({ state = "ready" }: { state?: DashboardState }) {
  const [period, setPeriod] = useState("30j");
  const [opened, setOpened] = useState<string | null>(null);
  const empty = state === "empty";
  const card = (label: string, value: ReactNode, delta?: { text: string; tone: "positive" | "negative" | "neutral"; trend?: "up" | "down" | "flat" }) => (
    <Card variant="metric" label={label} value={value} {...(delta && !empty ? { delta } : {})} onPress={() => setOpened(label)} />
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
          state={state === "loading" ? "loading" : state === "error" ? "error" : "ready"}
          onRetry={() => undefined}
        >
          <PageGrid columns={4}>
            {card("Commandes", empty ? "0" : <FormattedValue value={1284} type="number" />, { text: "+12 % sur 30 jours", tone: "positive" })}
            {card("Chiffre d'affaires", empty ? "0 €" : <FormattedValue value={86420} type="money" decimals={0} />, { text: "+8 % sur 30 jours", tone: "positive" })}
            {card("Panier moyen", empty ? "—" : <FormattedValue value={67.3} type="money" />, { text: "−3 % sur 30 jours", tone: "negative" })}
            {card("Retours", empty ? "—" : <FormattedValue value={0.021} type="percent" decimals={1} />, { text: "−0,4 pt sur 30 jours", tone: "positive", trend: "down" })}
          </PageGrid>
          <PageGrid columns={2}>
            <PageSection
              title="Commandes par semaine"
              description="Les 12 dernières semaines."
              state={state === "chart-error" ? "error" : "ready"}
              onRetry={() => undefined}
              {...(empty ? { empty: { title: "Aucune commande sur la période", description: "Choisissez une période plus longue.", action: { id: "12m", label: "Voir 12 mois", onPress: () => setPeriod("12m") } } } : {})}
            >
              <WeeklyChart weeks={WEEKS} values={ORDERS} />
            </PageSection>
            <PageSection
              title="Meilleures ventes"
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
              description="À expédier ou en retard."
              actions={[{ id: "toutes", label: "Voir tout", primary: true, onPress: () => setOpened("Commandes en attente") }]}
              {...(empty ? { empty: { title: "Aucune commande en attente" } } : {})}
            >
              <List label="Commandes en attente" items={WAITING} selectionMode="none" />
            </PageSection>
            <PageSection
              title="Stock bas"
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
    const chart = c.getByRole("img", { name: /^Commandes par semaine/ });
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

/** Premier chargement : la barre reste, des squelettes à la place des blocs. */
export const Chargement: Story = {
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByRole("radio", { name: "30 jours" })).toBeVisible());
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
