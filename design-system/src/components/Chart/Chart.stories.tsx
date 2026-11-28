import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Chart, Sparkline } from "./Chart";
import { PageSection } from "../../templates/Page/Page";

const meta: Meta<typeof Chart> = {
  title: "Composants/Chart",
  component: Chart,
  parameters: { layout: "padded" },
  decorators: [(S) => <div className="w-[560px]">{S()}</div>],
};
export default meta;
type Story = StoryObj<typeof Chart>;

const WEEKS = ["S37", "S38", "S39", "S40", "S41", "S42", "S43", "S44", "S45", "S46", "S47", "S48"];
const ORDERS = [212, 236, 228, 251, 247, 268, 259, 281, 274, 296, 288, 312];
const RETURNS = [12, 9, 14, 11, 8, 10, 9, 12, 7, 8, 9, 6];

const body = () => within(document.body);

/** Barres d'une série (D-429) : `--chart-1`, 24 px au plus, bout arrondi de 4 px ; étiquette directe sur la dernière valeur ; pas de légende. */
export const Barres: Story = {
  render: () => (
    <PageSection title="Commandes par semaine" description="Les 12 dernières semaines.">
      <Chart type="bar" label="Commandes par semaine, de 212 à 312" categories={WEEKS} series={[{ id: "c", label: "Commandes", values: ORDERS }]} />
    </PageSection>
  ),
  play: async ({ canvasElement }) => {
    const chart = within(canvasElement).getByRole("group", { name: "Commandes par semaine, de 212 à 312" });
    const bars = [...chart.querySelectorAll<SVGPathElement>("svg path")];
    await expect(bars).toHaveLength(12);
    for (const b of bars) await expect(b.getBBox().width).toBeLessThanOrEqual(24);
    await expect(bars[0]!.getAttribute("fill")).toBe("var(--chart-1)");
    await expect(within(chart).getByText("312", { selector: "text" })).toBeInTheDocument();
    await expect(canvasElement.querySelector(".socle-chart ul")).toBeNull();
  },
};

/** Lignes de plusieurs séries : `--chart-1`, `--chart-2`… dans l'ordre, trait de 2 px, légende au-dessus. Un trou (`null`) coupe la ligne. */
export const Lignes: Story = {
  render: () => (
    <Chart
      type="line"
      label="Commandes et retours par semaine"
      categories={WEEKS}
      series={[
        { id: "c", label: "Commandes", values: ORDERS.map((v) => v / 10) },
        { id: "r", label: "Retours", values: [...RETURNS.slice(0, 5), null, ...RETURNS.slice(6)] },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const lines = [...canvasElement.querySelectorAll<SVGPathElement>("svg path")];
    await expect(lines.map((l) => l.getAttribute("stroke"))).toEqual(["var(--chart-1)", "var(--chart-2)"]);
    await expect(lines[1]!.getAttribute("d")!.match(/M/g)).toHaveLength(2);
    await expect(within(canvasElement.querySelector<HTMLElement>(".socle-chart ul")!).getByText("Retours")).toBeVisible();
  },
};

/** Barres groupées : trois séries au plus ; au-delà, elles sont ignorées (préférer des lignes). */
export const BarresGroupees: Story = {
  render: () => (
    <Chart
      type="bar"
      label="Ventes par canal et par trimestre"
      categories={["T1", "T2", "T3", "T4"]}
      series={[
        { id: "web", label: "Site", values: [120, 150, 170, 210] },
        { id: "shop", label: "Boutique", values: [90, 85, 100, 120] },
        { id: "pro", label: "Revendeurs", values: [40, 55, 60, 58] },
        { id: "x", label: "Ignorée", values: [1, 2, 3, 4] },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("svg path")).toHaveLength(12);
    await expect(within(canvasElement).queryByText("Ignorée")).toBeNull();
  },
};

/**
 * Clavier et lecteur d'écran (D-430) : un seul arrêt de Tab ; les flèches passent d'une catégorie à l'autre,
 * l'info-bulle suit et la valeur est annoncée ; Échap ferme. Un tableau caché donne toutes les valeurs.
 */
export const Clavier: Story = {
  render: () => <Chart type="bar" label="Commandes par semaine" categories={WEEKS} series={[{ id: "c", label: "Commandes", values: ORDERS }]} />,
  play: async ({ canvasElement }) => {
    const chart = within(canvasElement).getByRole("group", { name: "Commandes par semaine" });
    await userEvent.tab();
    await expect(chart).toHaveFocus();
    await expect(getComputedStyle(chart).outlineStyle).toBe("solid");
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(canvasElement.querySelector("[data-chart-tooltip]")).toHaveTextContent("S48312"));
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvasElement.querySelector("[aria-live]")).toHaveTextContent("S47 : 288");
    await userEvent.keyboard("{Home}");
    await expect(canvasElement.querySelector("[aria-live]")).toHaveTextContent("S37 : 212");
    await userEvent.keyboard("{Escape}");
    await expect(canvasElement.querySelector("[data-chart-tooltip]")).toBeNull();
    const table = body().getByRole("table", { name: "Données du graphique : Commandes par semaine" });
    await expect(within(table).getAllByRole("row")).toHaveLength(13);
  },
};

/** Survol : bande `--hover` derrière la catégorie et info-bulle aux couleurs de `Tooltip`. */
export const Survol: Story = {
  render: () => <Chart type="bar" label="Commandes par semaine" categories={WEEKS} series={[{ id: "c", label: "Commandes", values: ORDERS }]} />,
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector("svg")!;
    const r = svg.getBoundingClientRect();
    await userEvent.pointer({ target: svg, coords: { clientX: r.right - 10, clientY: r.top + 60 } });
    await waitFor(() => expect(canvasElement.querySelector("[data-chart-tooltip]")).toHaveTextContent("S48"));
    await expect(svg.querySelector("rect")!.getAttribute("fill")).toBe("var(--hover)");
  },
};

/** Sans données : « Aucune donnée », à la hauteur du graphique ; pas d'arrêt de Tab. */
export const SansDonnees: Story = {
  render: () => <Chart type="line" label="Commandes" categories={[]} series={[{ id: "c", label: "Commandes", values: [] }]} size="sm" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Aucune donnée")).toBeVisible();
    await expect(within(canvasElement).getByRole("group")).toHaveAttribute("tabindex", "-1");
  },
};

/** Beaucoup de catégories : une étiquette sur k, comptée depuis la dernière, sans chevauchement. */
export const AxeDense: Story = {
  render: () => {
    const days = Array.from({ length: 60 }, (_, i) => `${(i % 30) + 1}/${i < 30 ? 10 : 11}`);
    return <Chart type="line" label="Visites par jour" categories={days} series={[{ id: "v", label: "Visites", values: days.map((_, i) => 400 + Math.round(120 * Math.sin(i / 5)) + i * 3) }]} highlight="max" />;
  },
  play: async ({ canvasElement }) => {
    const labels = [...canvasElement.querySelectorAll<SVGTextElement>("svg text[text-anchor='middle']")].filter((t) => t.textContent?.includes("/"));
    await expect(labels.length).toBeLessThan(20);
    await expect(labels[labels.length - 1]!.textContent).toBe("30/11");
    const boxes = labels.map((t) => t.getBBox());
    for (let i = 1; i < boxes.length; i++) await expect(boxes[i]!.x).toBeGreaterThan(boxes[i - 1]!.x + boxes[i - 1]!.width);
  },
};

/** Petite courbe (D-429) : une série, 32 px de haut, trait de 1,5 px `--chart-1`, point sur la dernière valeur ; `role="img"` nommée. */
export const PetiteCourbe: Story = {
  render: () => (
    <div className="w-40">
      <Sparkline values={ORDERS} label="Commandes sur 12 semaines, de 212 à 312" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const img = within(canvasElement).getByRole("img", { name: "Commandes sur 12 semaines, de 212 à 312" });
    await expect(img.getBoundingClientRect().height).toBe(32);
    await expect(img.querySelector("path")!.getAttribute("stroke")).toBe("var(--chart-1)");
  },
};

/** Courbe seule, hors de `Card metric` : la dernière valeur et son unité à droite, échelle depuis zéro avec un trait de base (D-435). */
export const PetiteCourbeChiffree: Story = {
  render: () => (
    <div className="w-64">
      <Sparkline values={[4.1, 3.8, 4.4, 4.0, 3.9, 4.2, 4.6, 4.1]} formatValue={(v) => `${v.toLocaleString("fr-FR")} min`} fromZero label="Durée des 8 dernières exécutions, de 4,1 à 4,1 min" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-sparkline-value]")).toHaveTextContent("4,1 min");
    await expect(within(canvasElement).getByRole("img").querySelector("line")).not.toBeNull();
  },
};
