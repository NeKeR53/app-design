import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, spyOn, userEvent, waitFor, within } from "storybook/test";
import { SocleProvider } from "../provider/SocleProvider";
import type { SocleTheme } from "../provider/theme";
import { Sidebar } from "../patterns/Sidebar/Sidebar";
import { Tabs, type TabItem } from "../components/Tabs/Tabs";
import { Table } from "../components/Table/Table";
import { Button } from "../components/Button/Button";
import { PageSection } from "../templates/Page/Page";

/**
 * Thème d'organisation (D-337). Le thème ci-dessous est une démo générique : le vrai thème
 * d'une organisation vit dans son propre package, hors de socle-ui.
 */
const DEMO: SocleTheme = {
  name: "demo",
  light: {
    accent: "#0f766e",
    "accent-fg": "#ffffff",
    "accent-text": "#0f766e",
    "side-bg": "#134e4a",
    "side-fg": "#f0fdfa",
    "side-fg-2": "#ccfbf1",
    "side-fg-3": "#99f6e4",
    "side-hover": "#115e59",
    "side-selected": "#0b3d3a",
    "side-selected-fg": "#ffffff",
    "side-indicator": "#5eead4",
    "side-line": "#1f5f5a",
    focus: "#0369a1",
    highlight: "#d97706",
    "table-head-bg": "#f0fdfa",
    "side-highlight": "#5eead4",
    "chart-1": "#0f766e",
    "chart-2": "#b45309",
  },
  dark: {
    accent: "#2dd4bf",
    "accent-fg": "#042f2e",
    "accent-text": "#5eead4",
    "side-bg": "#0b2b29",
    "side-fg": "#e6fffb",
    "side-indicator": "#2dd4bf",
    focus: "#38bdf8",
    "table-head-bg": "#10302d",
    "side-highlight": "#5eead4",
    "chart-1": "#2dd4bf",
  },
  radius: { md: "6px" },
  signature: { navIndicator: "bar", tabs: "underline", tableHeader: "tinted", buttonSecondary: "outline" },
  typography: { headingWeight: "700" },
  // Jeu d'icônes de démo : la roue des réglages devient un disque plein, sur une grille de 16.
  icons: { viewBox: "0 0 16 16", paths: { Settings: "M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1z" } },
};

const meta: Meta = {
  title: "Fondations/Thème d'organisation",
  parameters: { layout: "fullscreen" },
  beforeEach: () => {
    for (const k of Object.keys(localStorage)) if (k.startsWith("theme-demo")) localStorage.removeItem(k);
  },
};
export default meta;
type Story = StoryObj;

const TABS: TabItem[] = [
  { id: "all", label: "Tous" },
  { id: "mine", label: "Les miens" },
];
const ROWS = [
  { id: "1", name: "Rapport annuel", owner: "Camille" },
  { id: "2", name: "Budget", owner: "Hugo" },
];

function Demo({ initial, accent }: { initial?: SocleTheme; accent?: string }) {
  const [theme, setTheme] = useState<SocleTheme | undefined>(initial);
  const [nav, setNav] = useState("home");
  const [tab, setTab] = useState("all");
  return (
    <SocleProvider {...(theme ? { theme } : {})} {...(accent ? { accent } : {})} storageKey="theme-demo">
      <div className="flex h-[480px]">
        <div className="w-(--side-w)">
          <Sidebar selectedId={nav} onSelectionChange={setNav} account={<Sidebar.Account name="Camille Martin" detail="Admin" onSettings={() => {}} />}>
            <Sidebar.Item id="home" label="Accueil" />
            <Sidebar.Item id="docs" label="Documents" count={4} />
            <Sidebar.Item id="arch" label="Archives" />
            <Sidebar.Section id="todo" title="À traiter">
              <Sidebar.TreeItem id="t1" title="Relance fournisseur" subtitle="Devis attendu">
                <Sidebar.TreeItem id="t1a" title="Devis Atelier Nord" subtitle="Envoyé le 12 nov." unread />
                <Sidebar.TreeItem id="t1b" title="Devis Méca Services" subtitle="Reçu le 14 nov." />
              </Sidebar.TreeItem>
            </Sidebar.Section>
          </Sidebar>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <div className="flex gap-2">
            <Button onPress={() => setTheme(DEMO)}>Thème démo</Button>
            <Button onPress={() => setTheme(undefined)}>Neutre</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary">Exporter</Button>
            <span data-testid="chart" className="h-4 w-8 rounded-sm bg-chart-1" />
          </div>
          <PageSection title="Résumé">
            <p className="m-0">Contenu de la section.</p>
          </PageSection>
          <Tabs pageTitle="Documents" items={TABS} selectedId={tab} onSelectionChange={setTab} />
          <Table
            label="Documents"
            columns={[
              { id: "name", label: "Nom" },
              { id: "owner", label: "Propriétaire", width: 160 },
            ]}
            rows={ROWS}
          />
        </div>
      </div>
    </SocleProvider>
  );
}

const root = () => document.documentElement;
const inline = (name: string) => root().style.getPropertyValue(name);
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};
const ATTRS = ["data-socle-theme", "data-nav-indicator", "data-tabs", "data-table-header", "data-button-secondary"];
const withLight = async (run: () => Promise<void>) => {
  const prev = root().dataset.theme;
  root().dataset.theme = "light";
  try {
    await run();
  } finally {
    if (prev) root().dataset.theme = prev;
    else delete root().dataset.theme;
  }
};
const activeRow = (c: HTMLElement) => within(c).getByRole("row", { name: /Accueil/ });
const activeTab = (c: HTMLElement) => within(c).getByRole("tab", { name: "Tous" });

/** Rendu neutre : aucune variable en ligne, aucun attribut de thème, signature par défaut. */
export const Neutre: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    for (const a of ATTRS) await expect(root().hasAttribute(a)).toBe(false);
    await expect(root().getAttribute("style") ?? "").not.toContain("--");
    await expect(getComputedStyle(activeRow(canvasElement), "::before").content).toBe("none");
    await expect(getComputedStyle(activeTab(canvasElement), "::after").content).toBe("none");
    // Les nouveaux rôles valent les rôles génériques.
    const cs = getComputedStyle(root());
    await expect(cs.getPropertyValue("--focus").trim()).toBe(cs.getPropertyValue("--accent").trim());
    await expect(cs.getPropertyValue("--side-bg").trim()).toBe(cs.getPropertyValue("--surface-side").trim());
    await expect(cs.getPropertyValue("--highlight").trim()).toBe(cs.getPropertyValue("--accent").trim());
  },
};

/** Thème démo : variables du mode clair en ligne sur <html>, attributs des variantes. */
export const ThemeDemo: Story = {
  render: () => <Demo initial={DEMO} />,
  play: async ({ canvasElement }) => {
    const prev = root().dataset.theme;
    root().dataset.theme = "light";
    try {
      await waitFor(() => expect(inline("--accent")).toBe("#0f766e"));
      await expect(root().getAttribute("data-socle-theme")).toBe("demo");
      await expect(root().getAttribute("data-nav-indicator")).toBe("bar");
      await expect(root().getAttribute("data-tabs")).toBe("underline");
      await expect(root().getAttribute("data-table-header")).toBe("tinted");
      await expect(inline("--radius-md")).toBe("6px");
      await expect(getComputedStyle(within(canvasElement).getByRole("navigation")).backgroundColor).toBe(rgb("#134e4a"));

      // Mode sombre : les valeurs du mode sombre remplacent celles du clair ; une clé absente est retirée.
      root().dataset.theme = "dark";
      await waitFor(() => expect(inline("--accent")).toBe("#2dd4bf"));
      await expect(inline("--side-bg")).toBe("#0b2b29");
      await expect(inline("--highlight")).toBe("");
      root().dataset.theme = "light";
      await waitFor(() => expect(inline("--accent")).toBe("#0f766e"));
      await expect(inline("--highlight")).toBe("#d97706");
    } finally {
      if (prev) root().dataset.theme = prev;
      else delete root().dataset.theme;
    }
  },
};

/** navIndicator « bar » : l'entrée active garde son fond et prend une barre de 3 px. */
export const BarreDeNavigation: Story = {
  render: () => <Demo initial={DEMO} />,
  play: async ({ canvasElement }) => {
    const prev = root().dataset.theme;
    root().dataset.theme = "light";
    try {
      await waitFor(() => expect(inline("--side-indicator")).toBe("#5eead4"));
      const row = activeRow(canvasElement);
      const bar = getComputedStyle(row, "::before");
      await expect(bar.width).toBe("3px");
      await expect(bar.backgroundColor).toBe(rgb("#5eead4"));
      await expect(getComputedStyle(row).backgroundColor).toBe(rgb("#0b3d3a"));
      await expect(getComputedStyle(row).color).toBe(rgb("#ffffff"));
      // Les autres lignes n'ont pas de barre.
      await expect(getComputedStyle(within(canvasElement).getByRole("row", { name: /Archives/ }), "::before").content).toBe("none");
    } finally {
      if (prev) root().dataset.theme = prev;
      else delete root().dataset.theme;
    }
  },
};

/** tabs « underline » : texte en accent, trait de 3 px, pas de fond. */
export const OngletsSoulignes: Story = {
  render: () => <Demo initial={DEMO} />,
  play: async ({ canvasElement }) => {
    const prev = root().dataset.theme;
    root().dataset.theme = "light";
    try {
      await waitFor(() => expect(inline("--accent-text")).toBe("#0f766e"));
      const tab = activeTab(canvasElement);
      await expect(getComputedStyle(tab).backgroundColor).toBe("rgba(0, 0, 0, 0)");
      await expect(getComputedStyle(tab).color).toBe(rgb("#0f766e"));
      const line = getComputedStyle(tab, "::after");
      await expect(line.height).toBe("3px");
      await expect(line.backgroundColor).toBe(rgb("#0f766e"));
      await expect(getComputedStyle(within(canvasElement).getByRole("tab", { name: "Les miens" }), "::after").content).toBe("none");
      // tableHeader « tinted » : teinte posée sur le fond de l'en-tête.
      const head = canvasElement.querySelector(".socle-table-head") as HTMLElement;
      await expect(getComputedStyle(head).backgroundImage).toContain(rgb("#f0fdfa"));
    } finally {
      if (prev) root().dataset.theme = prev;
      else delete root().dataset.theme;
    }
  },
};

/** L'anneau de focus suit --focus, pas l'accent. */
export const Focus: Story = {
  render: () => <Demo initial={DEMO} />,
  play: async ({ canvasElement }) => {
    const prev = root().dataset.theme;
    root().dataset.theme = "light";
    try {
      await waitFor(() => expect(inline("--focus")).toBe("#0369a1"));
      const btn = within(canvasElement).getByRole("button", { name: "Thème démo" });
      btn.focus();
      await userEvent.tab();
      await userEvent.tab({ shift: true });
      await expect(btn).toHaveAttribute("data-focus-visible");
      // Le bouton anime ses couleurs (120 ms) : on attend la fin de la transition.
      await waitFor(() => expect(getComputedStyle(btn).outlineColor).toBe(rgb("#0369a1")));
    } finally {
      if (prev) root().dataset.theme = prev;
      else delete root().dataset.theme;
    }
  },
};

/** Retirer le thème rend le neutre : variables et attributs retirés. */
export const RetourAuNeutre: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Thème démo" }));
    await waitFor(() => expect(root().getAttribute("data-socle-theme")).toBe("demo"));
    await expect(root().getAttribute("style") ?? "").toContain("--side-bg");
    await userEvent.click(c.getByRole("button", { name: "Neutre" }));
    await waitFor(() => expect(root().hasAttribute("data-socle-theme")).toBe(false));
    for (const a of ATTRS) await expect(root().hasAttribute(a)).toBe(false);
    await expect(root().getAttribute("style") ?? "").not.toContain("--");
    await expect(getComputedStyle(activeRow(canvasElement), "::before").content).toBe("none");
  },
};

/** L'option `accent` de l'app (D-029) passe avant l'accent du thème. */
export const AccentDeLApp: Story = {
  render: () => <Demo initial={DEMO} accent="#7c3aed" />,
  play: async () => {
    const prev = root().dataset.theme;
    root().dataset.theme = "light";
    try {
      await waitFor(() => expect(inline("--side-bg")).toBe("#134e4a"));
      await expect(inline("--accent")).toBe("");
      await expect(getComputedStyle(root()).getPropertyValue("--accent").trim()).toBe("#7c3aed");
    } finally {
      if (prev) root().dataset.theme = prev;
      else delete root().dataset.theme;
    }
  },
};

/** Contraste sous AA : avertissement en console, thème appliqué quand même. */
export const ContrasteInsuffisant: Story = {
  render: () => <Demo initial={{ name: "pale", light: { accent: "#7dd3fc" } }} />,
  beforeEach: () => {
    const warn = spyOn(console, "warn").mockImplementation(() => {});
    return () => warn.mockRestore();
  },
  play: async () => {
    await waitFor(() => expect(root().getAttribute("data-socle-theme")).toBe("pale"));
    await expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("contraste insuffisant"));
  },
};

/** Couleurs des graphiques (D-338) : le thème redéfinit --chart-n ; les autres gardent la palette neutre. */
export const CouleursDeGraphique: Story = {
  render: () => <Demo initial={DEMO} />,
  play: async ({ canvasElement }) =>
    withLight(async () => {
      await waitFor(() => expect(inline("--chart-1")).toBe("#0f766e"));
      await expect(getComputedStyle(within(canvasElement).getByTestId("chart")).backgroundColor).toBe(rgb("#0f766e"));
      await expect(getComputedStyle(root()).getPropertyValue("--chart-3").trim()).toBe("#1baf7a");
      root().dataset.theme = "dark";
      await waitFor(() => expect(inline("--chart-1")).toBe("#2dd4bf"));
      await expect(inline("--chart-2")).toBe("");
    }),
};

/** buttonSecondary « outline » : fond transparent, trait et texte en --accent-text, même taille. */
export const BoutonSecondaireContour: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) =>
    withLight(async () => {
      const c = within(canvasElement);
      const btn = c.getByRole("button", { name: "Exporter" });
      const before = btn.getBoundingClientRect();
      await expect(getComputedStyle(btn).boxShadow).toBe("none");
      await userEvent.click(c.getByRole("button", { name: "Thème démo" }));
      await waitFor(() => expect(root().getAttribute("data-button-secondary")).toBe("outline"));
      // Le bouton anime ses couleurs (120 ms) : on attend la fin de la transition.
      await waitFor(() => expect(getComputedStyle(btn).backgroundColor).toBe("rgba(0, 0, 0, 0)"));
      await waitFor(() => expect(getComputedStyle(btn).color).toBe(rgb("#0f766e")));
      await expect(getComputedStyle(btn).boxShadow).toBe(`${rgb("#0f766e")} 0px 0px 0px 1px inset`);
      const after = btn.getBoundingClientRect();
      await expect(after.width).toBe(before.width);
      await expect(after.height).toBe(before.height);
    }),
};

/** Graisse des titres : --fw-heading suit `typography.headingWeight` ; 600 sans thème. */
export const GraisseDesTitres: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const title = c.getByRole("heading", { name: "Résumé" });
    await expect(getComputedStyle(title).fontWeight).toBe("600");
    await userEvent.click(c.getByRole("button", { name: "Thème démo" }));
    await waitFor(() => expect(getComputedStyle(title).fontWeight).toBe("700"));
    await expect(inline("--fw-heading")).toBe("700");
    await userEvent.click(c.getByRole("button", { name: "Neutre" }));
    await waitFor(() => expect(getComputedStyle(title).fontWeight).toBe("600"));
  },
};

/** Jeu d'icônes : une icône citée par le thème prend son tracé plein ; les autres restent Lucide. */
export const IconesDuTheme: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const settings = () => c.getByRole("button", { name: /Réglages/ }).querySelector("svg") as SVGSVGElement;
    await expect(settings().getAttribute("viewBox")).toBe("0 0 24 24");
    await userEvent.click(c.getByRole("button", { name: "Thème démo" }));
    await waitFor(() => expect(settings().getAttribute("viewBox")).toBe("0 0 16 16"));
    const svg = settings();
    await expect(svg.getAttribute("fill")).toBe("currentColor");
    await expect(svg.getAttribute("stroke")).toBe("none");
    await expect(svg.getAttribute("aria-hidden")).toBe("true");
    await expect(svg.getAttribute("focusable")).toBe("false");
    await expect(svg.querySelector("path")?.getAttribute("d")).toBe("M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1z");
    await expect(svg.getAttribute("width")).toBe("16");
    // Une icône que le thème ne cite pas garde son tracé Lucide (chevron de la ligne parente).
    const chevron = c.getByRole("button", { name: /Relance fournisseur/ }).querySelector("svg") as SVGSVGElement;
    await expect(chevron.getAttribute("viewBox")).toBe("0 0 24 24");
    await userEvent.click(c.getByRole("button", { name: "Neutre" }));
    await waitFor(() => expect(settings().getAttribute("viewBox")).toBe("0 0 24 24"));
  },
};

/** Sidebar sombre : le résumé « n non lus » suit --side-highlight, lisible (AA) sur --side-bg. */
export const ResumeNonLusSidebar: Story = {
  render: () => <Demo initial={DEMO} />,
  play: async ({ canvasElement }) =>
    withLight(async () => {
      await waitFor(() => expect(inline("--side-highlight")).toBe("#5eead4"));
      const unread = within(canvasElement).getByText(/1 non lu/);
      await expect(getComputedStyle(unread).color).toBe(rgb("#5eead4"));
      // Hors de la sidebar, --accent-text garde la valeur du thème.
      await expect(getComputedStyle(root()).getPropertyValue("--accent-text").trim()).toBe("#0f766e");
    }),
};

/** Bouton principal : `--primary` et `--primary-fg` du thème ; sans thème, monochrome inversé (D-102). */
export const BoutonPrincipal: Story = {
  render: () => (
    <SocleProvider theme={{ name: "demo-primary", light: { primary: "#0f766e", "primary-fg": "#ffffff" } }} storageKey="theme-primary">
      <Button variant="primary">Enregistrer</Button>
    </SocleProvider>
  ),
  play: async ({ canvasElement }) => {
    const b = within(canvasElement).getByRole("button", { name: "Enregistrer" });
    await waitFor(() => expect(getComputedStyle(b).backgroundColor).toBe("rgb(15, 118, 110)"));
    await expect(getComputedStyle(b).color).toBe("rgb(255, 255, 255)");
  },
};
