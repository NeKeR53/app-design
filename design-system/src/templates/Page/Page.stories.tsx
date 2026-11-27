import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Page, PageGrid, PageSection, type PageGridColumns } from "./Page";
import { Card } from "../../components/Card/Card";
import type { Action } from "../../patterns/ActionBar/ActionBar";
import { Select } from "../../components/Select/Select";
import { Table } from "../../components/Table/Table";
import { Code } from "../../components/Code/Code";
import { Badge } from "../../components/Badge/Badge";
import { ProgressBar } from "../../components/ProgressBar/ProgressBar";
import { ArrowDown } from "../../icons";
import { Copy } from "../../../.storybook/story-icons";

const meta: Meta<typeof Page> = {
  title: "Gabarits/Page",
  component: Page,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof Page>;

const Frame = ({ children, height = 480, width }: { children: React.ReactNode; height?: number; width?: number }) => (
  <div style={{ height, ...(width ? { width } : {}) }} className="border-b border-line">
    {children}
  </div>
);

/** Glisser de fichiers simulé dans le DOM. */
const files = (...names: string[]) => {
  const data = new DataTransfer();
  for (const name of names) data.items.add(new File(["date;montant"], name, { type: "text/csv" }));
  return data;
};

const actions = (): Action[] => [
  { id: "export", label: "Exporter", primary: true, onPress: fn() },
  { id: "copy", label: "Copier le lien", icon: <Copy />, onPress: fn() },
  { id: "csv", label: "Télécharger en CSV", icon: <ArrowDown />, onPress: fn() },
];

const periods = [
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
  { id: "year", label: "Année" },
];

function Filters() {
  return (
    <>
      <Select label="Période" hideLabel options={periods} defaultValue="month" width="sm" />
      <Select
        label="Service"
        hideLabel
        options={[
          { id: "all", label: "Tous les services" },
          { id: "sales", label: "Ventes" },
        ]}
        defaultValue="all"
        width="md"
      />
    </>
  );
}

const rows = Array.from({ length: 24 }, (_, i) => ({ id: String(i), ref: `DEM-${1042 - i}`, amount: `${(250 - i * 7).toFixed(2).replace(".", ",")}` }));

function Blocks() {
  return (
    <>
      <PageSection title="Plus gros montants" description="Mars, tous services." actions={[{ id: "more", label: "Voir tout", primary: true, onPress: fn() }]}>
        <Table
          label="Plus gros montants"
          columns={[
            { id: "ref", label: "Demande" },
            { id: "amount", label: "Montant", align: "end", width: 120 },
          ]}
          rows={rows}
        />
      </PageSection>
      <PageSection title="Requête">
        <Code block>{"SELECT ref, montant FROM demandes ORDER BY montant DESC"}</Code>
      </PageSection>
    </>
  );
}

/** Barre d'outils, blocs espacés de 24 px, pied (D-217). */
export const Zones: Story = {
  render: () => (
    <Frame>
      <Page toolbar={<Filters />} actions={actions()} actionsLabel="Rapport" footer="128 demandes ce mois-ci">
        <Blocks />
      </Page>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const bar = c.getByRole("toolbar", { name: "Rapport" });
    await expect(within(bar).getByRole("button", { name: "Exporter" })).toBeVisible();
    const foot = canvasElement.querySelector("footer")!;
    await expect(foot).toHaveTextContent("128 demandes ce mois-ci");
    const [a, b] = c.getAllByRole("region");
    await expect(Math.round(b!.getBoundingClientRect().top - a!.getBoundingClientRect().bottom)).toBe(24);
    // Barre et pied restent en place pendant le défilement.
    const scroller = canvasElement.querySelector<HTMLElement>("[data-page-content]")!;
    const barTop = bar.getBoundingClientRect().top;
    const footTop = foot.getBoundingClientRect().top;
    scroller.scrollTop = 300;
    await waitFor(() => expect(scroller.scrollTop).toBeGreaterThan(0));
    await expect(bar.getBoundingClientRect().top).toBe(barTop);
    await expect(foot.getBoundingClientRect().top).toBe(footTop);
    // Sans `onDropFiles`, des fichiers glissés ne montrent aucun cadre (D-418).
    const page = canvasElement.querySelector<HTMLElement>(".socle-page")!;
    page.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: files("a.csv") }));
    await expect(canvasElement.querySelector("[data-page-drop]")).toBeNull();
  },
};

/** Barre étroite : une ligne qui défile à l'horizontale ; le focus reste atteignable (D-217). */
export const BarreEtroite: Story = {
  render: () => (
    <Frame width={420} height={240}>
      <Page
        toolbar={
          <>
            <Filters />
            <Select label="Responsable" hideLabel options={[{ id: "any", label: "Tous les responsables" }]} defaultValue="any" width="md" />
          </>
        }
        actions={actions()}
      >
        <PageSection title="Résumé">
          <p className="m-0">Une ligne de filtres plus large que la page.</p>
        </PageSection>
      </Page>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>("[data-page-toolbar]")!;
    await expect(row.scrollWidth).toBeGreaterThan(row.clientWidth);
    const bar = within(canvasElement).getByRole("toolbar");
    await expect(Math.round(bar.getBoundingClientRect().height)).toBeLessThan(80);
  },
};

/** `fill` : le contenu remplit la hauteur sans défiler (D-218). */
export const Remplir: Story = {
  render: () => (
    <Frame height={360}>
      <Page fill toolbar={<Filters />}>
        <div data-testid="editor" className="rounded-lg border border-line bg-field" />
      </Page>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const editor = within(canvasElement).getByTestId("editor");
    const scroller = canvasElement.querySelector<HTMLElement>("[data-page-content]")!;
    await expect(editor.getBoundingClientRect().height).toBeGreaterThan(200);
    await expect(scroller.scrollHeight).toBe(scroller.clientHeight);
  },
};

/** Chargement : squelettes à la place des blocs, barre et pied gardés (D-215). */
export const Chargement: Story = {
  render: () => (
    <Frame>
      <Page state="loading" toolbar={<Filters />} footer="—">
        <Blocks />
      </Page>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("status", { name: "Chargement…" })).toBeInTheDocument();
    await expect(c.getByRole("toolbar")).toBeVisible();
    await expect(c.queryByRole("region")).toBeNull();
  },
};

/** Erreur : message et « Réessayer » (D-215). */
export const Erreur: Story = {
  render: function E() {
    const [n, setN] = useState(0);
    return (
      <Frame>
        <Page state="error" onRetry={() => setN((x) => x + 1)}>
          <Blocks />
        </Page>
        <output data-testid="retries">{n}</output>
      </Frame>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("alert")).toHaveTextContent("Impossible de charger la page");
    await userEvent.click(c.getByRole("button", { name: "Réessayer" }));
    await expect(c.getByTestId("retries")).toHaveTextContent("1");
  },
};

/** États d'une section : chargement, erreur, vide avec action (D-216). */
export const EtatsDeSection: Story = {
  render: function S() {
    const [created, setCreated] = useState(false);
    return (
      <Frame height={560}>
        <Page>
          <PageSection title="Activité" state="loading" />
          <PageSection title="Montants" state="error" onRetry={fn()} />
          <PageSection
            title="Objectifs"
            actions={[{ id: "x", label: "Masquée en cas d'erreur", onPress: fn() }]}
            {...(created ? {} : { empty: { title: "Aucun objectif", description: "Fixez un objectif pour suivre le mois.", action: { id: "new", label: "Nouvel objectif", onPress: () => setCreated(true) } } })}
          >
            <p className="m-0">Objectif créé.</p>
          </PageSection>
        </Page>
      </Frame>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { name: "Activité" })).toBeVisible();
    await expect(c.getByRole("status")).toBeInTheDocument();
    await expect(c.getByRole("alert")).toHaveTextContent("Impossible de charger cette partie");
    await userEvent.click(c.getByRole("button", { name: "Nouvel objectif" }));
    await expect(c.getByText("Objectif créé.")).toBeVisible();
  },
};

const metrics = [
  { label: "Commandes", value: "1 284", delta: { text: "+12 % sur 30 jours", tone: "positive" as const } },
  { label: "En retard", value: "37", delta: { text: "+5 depuis hier", tone: "negative" as const, trend: "up" as const } },
  { label: "Chiffre d’affaires", value: "86 k€", delta: { text: "stable" } },
  { label: "Devis à relancer", value: "9" },
];

function Metrics({ count = 4 }: { count?: number }) {
  return (
    <>
      {metrics.slice(0, count).map((m) => (
        <Card key={m.label} variant="metric" label={m.label} value={m.value} {...(m.delta ? { delta: m.delta } : {})} />
      ))}
    </>
  );
}

/** Les cases d'une grille, dans l'ordre : leur rectangle à l'écran. */
const cells = (root: HTMLElement, index = 0) =>
  [...(root.querySelectorAll<HTMLElement>("[data-page-grid]")[index]?.children ?? [])].map((c) => c.getBoundingClientRect());
/** Nombre de cases sur la première ligne. */
const firstRow = (rects: DOMRect[]) => rects.filter((r) => Math.round(r.top) === Math.round(rects[0]!.top)).length;

/** Deux blocs côte à côte : même haut, 24 px entre eux, même hauteur (D-403). */
export const Grille: Story = {
  render: () => (
    <Frame width={960} height={520}>
      <Page toolbar={<Filters />}>
        <PageGrid>
          <Blocks />
        </PageGrid>
        <PageSection title="À savoir">
          <p className="m-0">Un bloc après la grille reprend toute la largeur.</p>
        </PageSection>
      </Page>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const region = (name: string) => within(canvasElement).getByRole("region", { name }).getBoundingClientRect();
    const [a, b, c] = [region("Plus gros montants"), region("Requête"), region("À savoir")];
    await expect(Math.round(a!.top)).toBe(Math.round(b!.top));
    await expect(Math.round(b!.left - a!.right)).toBe(24);
    await expect(Math.abs(a!.width - b!.width)).toBeLessThan(1);
    const [left, right] = cells(canvasElement);
    await expect(Math.round(left!.height)).toBe(Math.round(right!.height));
    // Le bloc suivant passe sous la grille, à 24 px, sur toute sa largeur.
    await expect(Math.round(c!.top - Math.max(a!.bottom, b!.bottom))).toBe(24);
    await expect(Math.round(c!.right - c!.left)).toBe(Math.round(b!.right - a!.left));
  },
};

/** Quatre chiffres clés sur une ligne, de même hauteur (D-403, D-361). */
export const GrilleDeCartes: Story = {
  render: () => (
    <Frame width={1200} height={240}>
      <Page>
        <PageGrid columns={4}>
          <Metrics />
        </PageGrid>
      </Page>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const rects = cells(canvasElement);
    await expect(rects).toHaveLength(4);
    await expect(firstRow(rects)).toBe(4);
    await expect(new Set(rects.map((r) => Math.round(r.height))).size).toBe(1);
    await expect(Math.round(rects[1]!.left - rects[0]!.right)).toBe(24);
  },
};

/** Pied d'un élément suivi : ligne d'état et barre d'avancement. */
function TrackedFooter({ status, tone, when, progress }: { status: string; tone: "success" | "danger" | "info"; when: string; progress: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-sm text-fg-3">
        <Badge tone={tone}>{status}</Badge>
        <span>{when}</span>
      </div>
      <ProgressBar label={`Exécution n° ${120 + progress}`} value={progress} showValue={progress < 100} {...(tone === "danger" ? { tone: "danger" as const } : {})} />
    </div>
  );
}

const trackedActions: Action[] = [
  { id: "run", label: "Relancer", icon: <ArrowDown size={16} />, onPress: fn() },
  { id: "copy", label: "Copier le lien", icon: <Copy />, onPress: fn() },
];

function TrackedBlocks() {
  return (
    <>
      <PageSection framed title="Import des commandes" description="Production · tous les jours" actions={trackedActions} footer={<TrackedFooter status="Réussi" tone="success" when="il y a 2 h" progress={100} />} />
      <PageSection
        framed
        title="Export comptable"
        description="Production · chaque lundi"
        actions={trackedActions}
        footer={<TrackedFooter status="En échec" tone="danger" when="il y a 3 jours" progress={100} />}
      >
        <p className="m-0 text-sm text-danger">La connexion au serveur a expiré après 30 secondes. Le fichier du lundi n'a pas été envoyé.</p>
      </PageSection>
      <PageSection framed title="Sauvegarde nocturne" description="Recette" actions={trackedActions} footer={<TrackedFooter status="En cours" tone="info" when="lancée il y a 4 min" progress={40} />}>
        <p className="m-0 text-sm text-fg-3">Exécution précédente : réussie.</p>
      </PageSection>
    </>
  );
}

/**
 * Blocs encadrés d'une grille (D-423) : trait fin, titre `--fs-md`, marge `--pad`. Le pied (ligne d'état, barre
 * d'avancement) est collé en bas : les trois pieds sont alignés, quelle que soit la hauteur du contenu.
 */
export const GrilleDeBlocsEncadres: Story = {
  render: () => (
    <Frame width={1100} height={320}>
      <Page>
        <PageGrid columns={3}>
          <TrackedBlocks />
        </PageGrid>
      </Page>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const rects = cells(canvasElement);
    await expect(firstRow(rects)).toBe(3);
    await expect(new Set(rects.map((r) => Math.round(r.height))).size).toBe(1);
    const sections = [...canvasElement.querySelectorAll<HTMLElement>("[data-page-grid] > section")];
    for (const section of sections) {
      const s = getComputedStyle(section);
      await expect(s.borderTopWidth).toBe("1px");
      await expect(s.borderTopLeftRadius).toBe("12px");
      // Titre compact : la taille de texte de base, pas celle d'un titre de section.
      const h2 = section.querySelector("h2")!;
      const fsMd = getComputedStyle(section).getPropertyValue("--fs-md").trim();
      await expect(getComputedStyle(h2).fontSize).toBe(fsMd);
    }
    // Pieds collés en bas : même bas, à la marge intérieure du bloc.
    const feet = sections.map((section) => section.querySelector<HTMLElement>("[data-section-footer]")!.getBoundingClientRect());
    await expect(new Set(feet.map((r) => Math.round(r.bottom))).size).toBe(1);
    const pad = parseFloat(getComputedStyle(sections[0]!).paddingBottom);
    await expect(Math.round(sections[0]!.getBoundingClientRect().bottom - feet[0]!.bottom)).toBe(Math.round(pad + 1));
    // Le bloc le plus court a de la place libre au-dessus de son pied.
    const firstHead = sections[0]!.querySelector("h2")!.getBoundingClientRect();
    await expect(feet[0]!.top - firstHead.bottom).toBeGreaterThan(24);
  },
};

/** Le pied ne montre que des données prêtes : caché pendant le chargement, l'erreur et l'état vide (D-423). Sans `framed`, pas de cadre. */
export const PiedDeBloc: Story = {
  render: () => (
    <Frame width={1100} height={360}>
      <Page>
        <PageGrid columns={3}>
          <PageSection framed title="Chargement" state="loading" footer={<TrackedFooter status="Réussi" tone="success" when="hier" progress={100} />} />
          <PageSection framed title="Erreur" state="error" onRetry={fn()} footer={<TrackedFooter status="Réussi" tone="success" when="hier" progress={100} />} />
          <PageSection framed title="Vide" empty={{ title: "Aucune exécution" }} footer={<TrackedFooter status="Réussi" tone="success" when="hier" progress={100} />} />
        </PageGrid>
        <PageSection title="Sans cadre" footer={<TrackedFooter status="Réussi" tone="success" when="hier" progress={100} />}>
          <p className="m-0">Un bloc sans `framed` garde son dessin ; son pied vient après le contenu.</p>
        </PageSection>
      </Page>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryAllByRole("progressbar")).toHaveLength(1);
    const plain = c.getByRole("region", { name: "Sans cadre" });
    await expect(getComputedStyle(plain).borderTopWidth).toBe("0px");
    await expect(plain).not.toHaveAttribute("data-framed");
    await expect(within(plain).getByRole("progressbar")).toBeVisible();
  },
};

function Narrow({ width, columns, count }: { width: number; columns: PageGridColumns; count: number }) {
  return (
    <Frame width={width} height={300}>
      <Page>
        <PageGrid columns={columns}>
          <Metrics count={count} />
        </PageGrid>
      </Page>
    </Frame>
  );
}

/** La grille prend moins de colonnes quand elle rétrécit : 4 passe à 2 (jamais 3), 3 passe à 2, puis une seule (D-403). */
export const GrilleEtroite: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Narrow width={720} columns={4} count={4} />
      <Narrow width={700} columns={3} count={3} />
      <Narrow width={420} columns={2} count={2} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const four = cells(canvasElement, 0);
    await expect(firstRow(four)).toBe(2);
    await expect(Math.round(four[2]!.left)).toBe(Math.round(four[0]!.left));
    const three = cells(canvasElement, 1);
    await expect(firstRow(three)).toBe(2);
    const two = cells(canvasElement, 2);
    await expect(firstRow(two)).toBe(1);
    await expect(Math.round(two[1]!.top - two[0]!.bottom)).toBe(24);
    // Jamais sous 240 px par colonne.
    for (const r of [...four, ...three, ...two]) await expect(r.width).toBeGreaterThanOrEqual(240);
  },
};

/** Fichiers glissés au-dessus de la page : cadre sur toute la page, barre et pied compris ; le dépôt appelle `onDropFiles` (D-418). */
export const DepotDeFichiers: Story = {
  args: { onDropFiles: fn() },
  render: (args) => (
    <Frame>
      <Page toolbar={<Filters />} actions={actions()} actionsLabel="Rapport" footer="128 demandes ce mois-ci" onDropFiles={args.onDropFiles ?? fn()}>
        <Blocks />
      </Page>
    </Frame>
  ),
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const page = canvasElement.querySelector<HTMLElement>(".socle-page")!;
    const label = "Déposez les fichiers pour les ajouter";
    page.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: files("releve.csv") }));
    const frame = await c.findByText(label);
    await expect(frame).toBeVisible();
    // Toute la page, à 12 px des bords : la barre d'outils et le pied sont sous le cadre.
    const box = page.getBoundingClientRect();
    const drawn = frame.getBoundingClientRect();
    await expect(Math.round(drawn.top - box.top)).toBe(12);
    await expect(Math.round(box.bottom - drawn.bottom)).toBe(12);
    await expect(drawn.top).toBeLessThan(c.getByRole("toolbar", { name: "Rapport" }).getBoundingClientRect().bottom);
    await expect(getComputedStyle(frame).pointerEvents).toBe("none");
    // Le glisser sort de la page : le cadre disparaît.
    page.dispatchEvent(new DragEvent("dragleave", { bubbles: true, relatedTarget: document.body }));
    await waitFor(() => expect(c.queryByText(label)).toBeNull());
    // Il revient, puis le dépôt transmet les fichiers et retire le cadre.
    const data = files("releve-novembre.csv", "releve-decembre.csv");
    page.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: data }));
    await c.findByText(label);
    page.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: data }));
    await waitFor(() => expect(c.queryByText(label)).toBeNull());
    await expect(args.onDropFiles).toHaveBeenCalledTimes(1);
    await expect(args.onDropFiles).toHaveBeenCalledWith([...data.files]);
  },
};

/** Survol vu par l'app (le système capte le glisser, Tauri) : le cadre s'affiche sans événement du DOM, avec son texte (D-418). */
export const DepotSignaleParLApp: Story = {
  render: () => (
    <Frame>
      <Page toolbar={<Filters />} actions={actions()} actionsLabel="Rapport" footer="128 demandes ce mois-ci" isDraggingFiles dropLabel="Déposez le relevé pour l'importer">
        <Blocks />
      </Page>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Déposez le relevé pour l'importer")).toBeVisible();
  },
};

/**
 * Relecture en fond (D-426) : la page et ses blocs restent affichés. `Page isRefreshing` : une barre de 2 px sous la
 * barre d'outils, sans déplacer le contenu, et `aria-busy` sur le contenu. `PageSection isRefreshing` : la barre sous
 * le titre du bloc, ou sur le bord haut du cadre avec `framed`. Hors de l'état `ready`, l'option est ignorée.
 */
export const Relecture: Story = {
  render: () => {
    const [page, setPage] = useState(false);
    return (
      <Frame width={1100} height={520}>
        <Page
          toolbar={<span className="text-sm text-fg-2">Période : 30 jours</span>}
          actions={[{ id: "toggle", label: page ? "Arrêter la relecture" : "Relire la page", primary: true, onPress: () => setPage((v) => !v) }]}
          isRefreshing={page}>
          <PageGrid columns={3}>
            <PageSection framed title="Bloc encadré qui relit" isRefreshing footer={<TrackedFooter status="Réussi" tone="success" when="il y a 2 h" progress={100} />}>
              <p className="m-0 text-sm text-fg-2">Les données restent ; la barre suit le bord haut du cadre.</p>
            </PageSection>
            <PageSection framed title="Bloc encadré au repos" footer={<TrackedFooter status="Réussi" tone="success" when="hier" progress={100} />} />
            <PageSection framed title="Chargement : l'option est ignorée" state="loading" isRefreshing />
          </PageGrid>
          <PageSection title="Bloc sans cadre qui relit" description="La barre passe sous le titre." isRefreshing>
            <p className="m-0">Le contenu ne bouge pas.</p>
          </PageSection>
        </Page>
      </Frame>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const framed = c.getByRole("region", { name: "Bloc encadré qui relit" });
    await expect(framed).toHaveAttribute("aria-busy", "true");
    const bar = within(framed).getByRole("progressbar", { name: "Mise à jour…" });
    // Sur le bord haut du cadre, à l'intérieur du trait.
    await expect(Math.abs(bar.getBoundingClientRect().top - framed.getBoundingClientRect().top)).toBeLessThanOrEqual(1);
    await expect(bar.getBoundingClientRect().height).toBe(2);
    await expect(c.getByRole("region", { name: "Bloc encadré au repos" })).not.toHaveAttribute("aria-busy");
    await expect(c.getByRole("region", { name: "Chargement : l'option est ignorée" })).not.toHaveAttribute("aria-busy");
    // Sans cadre : la barre est entre le titre et le contenu, le contenu ne bouge pas.
    const plain = c.getByRole("region", { name: "Bloc sans cadre qui relit" });
    const plainBar = within(plain).getByRole("progressbar");
    const head = within(plain).getByRole("heading").getBoundingClientRect();
    await expect(plainBar.getBoundingClientRect().top).toBeGreaterThanOrEqual(head.bottom);
    // Page : la barre ne déplace pas le contenu.
    const content = canvasElement.querySelector<HTMLElement>("[data-page-content]")!;
    const firstTop = framed.getBoundingClientRect().top;
    await userEvent.click(c.getByRole("button", { name: "Relire la page" }));
    await waitFor(() => expect(content).toHaveAttribute("aria-busy", "true"));
    await expect(framed.getBoundingClientRect().top).toBe(firstTop);
    const pageBar = content.querySelector<HTMLElement>(":scope > div > [data-reload-bar]")!;
    await expect(Math.round(pageBar.getBoundingClientRect().top)).toBe(Math.round(content.getBoundingClientRect().top));
  },
};
