import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Page, PageSection } from "./Page";
import type { Action } from "../../patterns/ActionBar/ActionBar";
import { Select } from "../../components/Select/Select";
import { Table } from "../../components/Table/Table";
import { Code } from "../../components/Code/Code";
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
