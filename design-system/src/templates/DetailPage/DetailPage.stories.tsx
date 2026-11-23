import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { DetailPage, type DetailPageProps } from "./DetailPage";
import type { Action } from "../../patterns/ActionBar/ActionBar";
import { Table } from "../../components/Table/Table";
import { List } from "../../components/List/List";
import { Link } from "../../components/Link/Link";
import { Avatar } from "../../components/Avatar/Avatar";
import { Copy } from "../../../.storybook/story-icons";
import { ArrowDown, Plus } from "../../icons";

const meta: Meta<typeof DetailPage> = {
  title: "Gabarits/DetailPage",
  component: DetailPage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof DetailPage>;

/* La zone `main` d'AppShell : une hauteur fixe, comme dans l'app. */
const Frame = ({ children, height = 520 }: { children: React.ReactNode; height?: number }) => (
  <div style={{ height }} className="border-b border-line">
    {children}
  </div>
);

const actions = (onApprove = fn()): Action[] => [
  { id: "approve", label: "Approuver", primary: true, onPress: onApprove },
  { id: "copy", label: "Copier le lien", icon: <Copy />, onPress: fn() },
  { id: "export", label: "Exporter en PDF", icon: <ArrowDown />, onPress: fn() },
  { id: "dup", label: "Dupliquer", onPress: fn() },
  { id: "delete", label: "Supprimer la demande", danger: true, onPress: fn() },
];

function Sections({ historyState = "ready", emptyHistory = false }: { historyState?: "ready" | "loading" | "error"; emptyHistory?: boolean }) {
  return (
    <>
      <DetailPage.Section title="Description">
        <p className="m-0">
          Déplacement à Lyon du 28 au 29 février pour l'atelier client. Billets de train et une nuit d'hôtel, sur justificatifs.
        </p>
      </DetailPage.Section>
      <DetailPage.Section
        title="Lignes de frais"
        description="Montants TTC, en euros."
        actions={[{ id: "add", label: "Ajouter une ligne", icon: <Plus />, primary: true, onPress: fn() }]}
      >
        <Table
          label="Lignes de frais"
          columns={[
            { id: "label", label: "Libellé" },
            { id: "amount", label: "Montant", align: "end", width: 120 },
          ]}
          rows={[
            { id: "1", label: "Train Paris – Lyon (A/R)", amount: "124,00" },
            { id: "2", label: "Hôtel, une nuit", amount: "96,50" },
            { id: "3", label: "Repas", amount: "31,20" },
          ]}
        />
      </DetailPage.Section>
      <DetailPage.Section
        title="Historique"
        state={historyState}
        onRetry={fn()}
        {...(emptyHistory ? { empty: { title: "Aucun événement", description: "Les changements de la demande s'afficheront ici." } } : {})}
      >
        <List
          label="Historique"
          items={[
            { id: "a", title: "Léa Martin a créé la demande", meta: "3 mars" },
            { id: "b", title: "Hugo Bernard a ajouté un justificatif", meta: "hier" },
          ]}
        />
      </DetailPage.Section>
    </>
  );
}

const base: DetailPageProps = {
  title: "Remboursement de frais de déplacement — mission Lyon",
  back: { label: "Demandes", onPress: fn() },
  status: { label: "En attente", tone: "warning" },
  meta: [
    "DEM-1042",
    <>
      Créée le 3 mars par <Avatar name="Léa Martin" size="sm" /> Léa Martin
    </>,
    "Modifiée il y a 2 h",
  ],
};

/** Retour, titre, statut, méta, actions ; sections séparées par des traits (D-210 à D-213). */
export const ParDefaut: Story = {
  render: () => (
    <Frame>
      <DetailPage {...base} actions={actions()}>
        <Sections />
      </DetailPage>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { level: 1, name: base.title! })).toBeVisible();
    await expect(c.getByText("En attente")).toBeVisible();
    await expect(c.getByText("DEM-1042")).toBeVisible();
    const sections = c.getAllByRole("region");
    await expect(sections.map((s) => within(s).getByRole("heading", { level: 2 }).textContent)).toEqual([
      "Description",
      "Lignes de frais",
      "Historique",
    ]);
    // Trait entre deux sections, pas avant la première (D-213).
    await expect(getComputedStyle(sections[0]!).borderTopWidth).toBe("0px");
    await expect(getComputedStyle(sections[1]!).borderTopWidth).toBe("1px");
  },
};

/** L'en-tête reste fixe : seul le contenu défile (D-210). */
export const EnTeteFixe: Story = {
  render: () => (
    <Frame height={300}>
      <DetailPage {...base} actions={actions()}>
        <Sections />
      </DetailPage>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const h1 = c.getByRole("heading", { level: 1 });
    const top = h1.getBoundingClientRect().top;
    const scroller = canvasElement.querySelector<HTMLElement>("[data-page-content]")!;
    await expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
    scroller.scrollTop = 200;
    await waitFor(() => expect(scroller.scrollTop).toBeGreaterThan(0));
    await expect(h1.getBoundingClientRect().top).toBe(top);
  },
};

/** Le lien de retour nomme la vue et appelle `back.onPress` (D-211). */
export const Retour: Story = {
  render: function R() {
    const [back] = useState(() => fn());
    return (
      <Frame>
        <DetailPage {...base} back={{ label: "Demandes", onPress: back }} actions={actions()}>
          <Sections />
        </DetailPage>
        <output data-testid="calls">{String(back.mock.calls.length)}</output>
      </Frame>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const link = c.getByRole("button", { name: "Retour à Demandes" });
    await expect(link).toHaveTextContent("Demandes");
    // Premier arrêt de tabulation : le retour, puis les actions de l'en-tête.
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.tab();
    await expect(c.getByRole("button", { name: "Copier le lien" })).toHaveFocus();
  },
};

/** Actions en zone `header` : icônes, « … », bouton à texte à droite ; `danger` dans « … » (D-111, D-115). */
export const Actions: Story = {
  render: function A() {
    const [approve] = useState(() => fn());
    return (
      <Frame>
        <DetailPage {...base} actions={actions(approve)}>
          <Sections />
        </DetailPage>
      </Frame>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const group = c.getByRole("group", { name: `Actions sur ${base.title}` });
    const buttons = within(group).getAllByRole("button");
    await expect(buttons.at(-1)).toHaveTextContent("Approuver");
    await expect(within(group).getByRole("button", { name: "Plus d'actions" })).toBeVisible();
    await userEvent.click(within(group).getByRole("button", { name: "Plus d'actions" }));
    const body = within(document.body);
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Supprimer la demande" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
  },
};

/** Chargement : squelettes après 200 ms, retour visible, actions masquées (D-215). */
export const Chargement: Story = {
  render: () => (
    <Frame>
      <DetailPage back={base.back!} state="loading" actions={actions()} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("button", { name: "Retour à Demandes" })).toBeVisible();
    await expect(c.queryByRole("group", { name: /Actions sur/ })).toBeNull();
    const busy = c.getAllByRole("status");
    await expect(busy.length).toBeGreaterThan(0);
    await waitFor(() => expect(busy[0]!.querySelector("i")).not.toBeNull(), { timeout: 1000 });
  },
};

/** Erreur : message et « Réessayer » à la place du contenu (D-215). */
export const Erreur: Story = {
  render: function E() {
    const [retry] = useState(() => fn());
    const [n, setN] = useState(0);
    return (
      <Frame>
        <DetailPage
          {...base}
          state="error"
          onRetry={() => {
            retry();
            setN((x) => x + 1);
          }}
          actions={actions()}
        />
        <output data-testid="retries">{n}</output>
      </Frame>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("alert")).toHaveTextContent("Impossible de charger la page");
    await expect(c.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(c.queryByText("En attente")).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Réessayer" }));
    await expect(c.getByTestId("retries")).toHaveTextContent("1");
  },
};

/** Introuvable : EmptyState avec une action en zone `empty` (D-215). */
export const Introuvable: Story = {
  render: () => (
    <Frame>
      <DetailPage
        back={base.back!}
        state="not-found"
        notFound={{
          title: "Demande introuvable",
          description: "Elle a peut-être été supprimée ou déplacée.",
          action: { id: "list", label: "Revenir aux demandes", onPress: fn() },
        }}
      />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Demande introuvable")).toBeVisible();
    await expect(c.getByRole("button", { name: "Revenir aux demandes" })).toBeVisible();
    await expect(c.queryByRole("heading", { level: 1 })).toBeNull();
    await expect(c.getByRole("button", { name: "Retour à Demandes" })).toBeVisible();
  },
};

/** États d'une section : chargement, erreur, vide ; le reste de la page est intact (D-216). */
export const EtatsDeSection: Story = {
  render: () => (
    <div className="grid gap-4">
      <Frame height={360}>
        <DetailPage {...base}>
          <Sections historyState="error" />
        </DetailPage>
      </Frame>
      <Frame height={360}>
        <DetailPage {...base}>
          <Sections emptyHistory />
        </DetailPage>
      </Frame>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("alert")).toHaveTextContent("Impossible de charger cette partie");
    await expect(c.getByText("Aucun événement")).toBeInTheDocument();
    await expect(c.getAllByRole("heading", { name: "Historique" })).toHaveLength(2);
    await expect(c.getAllByRole("heading", { name: "Lignes de frais" })).toHaveLength(2);
  },
};

/** Largeur : 760 px par défaut, toute la largeur en option (D-214). */
export const PleineLargeur: Story = {
  render: () => (
    <div style={{ width: 1200 }}>
      <Frame height={220}>
        <DetailPage {...base} width="full">
          <DetailPage.Section title="Description">
            <p className="m-0">Contenu sur toute la largeur.</p>
          </DetailPage.Section>
        </DetailPage>
      </Frame>
      <Frame height={220}>
        <DetailPage {...base}>
          <DetailPage.Section title="Description">
            <p className="m-0">
              Contenu dans la colonne de lecture. <Link href="https://example.com">Voir le contrat</Link>
            </p>
          </DetailPage.Section>
        </DetailPage>
      </Frame>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [full, text] = within(canvasElement).getAllByRole("heading", { level: 1 });
    const pad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--pad")) || 16;
    await expect(full!.parentElement!.getBoundingClientRect().width).toBeGreaterThan(1000);
    const col = text!.closest("header")!.firstElementChild as HTMLElement;
    await expect(Math.round(col.getBoundingClientRect().width)).toBe(760 + 2 * pad);
  },
};
