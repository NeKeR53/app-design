/*
 * Recette « Tableau de suivi » (D-431). Doc : TrackingBoard.recipe.md.
 * Page composée sur toute la largeur : filtre d'état dans la barre d'outils, une grille de blocs encadrés
 * (PageSection framed), un par élément suivi : état, dernière exécution et barre d'avancement en pied, actions en tête.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Badge, type StatusTone } from "../../components/Badge/Badge";
import { Sparkline } from "../../components/Chart/Chart";
import { ProgressBar } from "../../components/ProgressBar/ProgressBar";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl";
import { ExternalArrow, RotateCcw, Square } from "../../icons";
import type { Action } from "../../patterns/ActionBar/ActionBar";
import { Page, PageGrid, PageSection } from "../../templates/Page/Page";
import { RecipeShell, resetStoredState } from "../../../.storybook/recipe-shell";

/* ---------- Données factices ---------- */

type RunStatus = "success" | "failed" | "running" | "queued";

interface Tracked {
  id: string;
  name: string;
  where: string;
  status: RunStatus;
  /** Dernière exécution, déjà formatée par l'app (`FormattedValue type="relative"`). */
  when: string;
  /** Avancement de l'exécution en cours, en %. */
  progress?: number;
  /** Durées des dernières exécutions, en minutes. */
  durations: number[];
  /** Message de la dernière erreur. */
  error?: string;
}

const ITEMS: Tracked[] = [
  { id: "import", name: "Import des commandes", where: "Production · toutes les heures", status: "success", when: "il y a 12 min", durations: [4.1, 3.8, 4.4, 4.0, 3.9, 4.2, 4.6, 4.1, 3.7, 4.0, 4.3, 3.9] },
  {
    id: "export",
    name: "Export comptable",
    where: "Production · chaque lundi",
    status: "failed",
    when: "il y a 3 jours",
    durations: [11, 12, 10.5, 11.2, 12.4, 11.8, 13, 12.1, 30],
    error: "La connexion au serveur a expiré après 30 secondes. Le fichier du lundi n'a pas été envoyé.",
  },
  { id: "backup", name: "Sauvegarde nocturne", where: "Production · chaque nuit", status: "running", when: "lancée il y a 4 min", progress: 40, durations: [9, 9.5, 8.8, 10.2, 9.9, 9.4, 9.1, 9.6, 10.4, 9.8] },
  { id: "deploy", name: "Déploiement du site", where: "Recette · à chaque fusion", status: "success", when: "il y a 2 h", durations: [6.2, 5.9, 6.5, 6.1, 5.4, 5.8, 6.0, 5.6, 5.5, 5.2, 5.3, 5.1] },
  { id: "index", name: "Index de recherche", where: "Production · toutes les 6 h", status: "queued", when: "prévue dans 18 min", durations: [2.2, 2.4, 2.1, 2.6, 2.3, 2.5, 2.4, 2.8, 2.7, 2.9] },
  { id: "certs", name: "Renouvellement des certificats", where: "Tous les environnements · chaque semaine", status: "success", when: "hier à 03:00", durations: [1.2, 1.1, 1.3, 1.2, 1.2, 1.4, 1.3, 1.2] },
];

const STATUS: Record<RunStatus, { label: string; tone: StatusTone }> = {
  success: { label: "Réussie", tone: "success" },
  failed: { label: "En échec", tone: "danger" },
  running: { label: "En cours", tone: "info" },
  queued: { label: "Planifiée", tone: "pending" },
};

const minutes = (v: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(v)} min`;

/* ---------- Un bloc par élément suivi ---------- */

/** Pied : l'état et la dernière exécution sur une ligne, l'avancement dessous. Il se compare d'un bloc à l'autre. */
function RunFooter({ item }: { item: Tracked }) {
  const s = STATUS[item.status];
  const done = item.status === "success" || item.status === "failed";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-sm text-fg-3">
        <Badge tone={s.tone}>{s.label}</Badge>
        <span>{item.when}</span>
      </div>
      {item.status !== "queued" && (
        <ProgressBar
          label={item.status === "running" ? "Exécution en cours" : "Dernière exécution"}
          {...(item.status === "running" ? { value: item.progress ?? 0 } : { value: 100 })}
          showValue={!done}
          {...(item.status === "failed" ? { tone: "danger" as const } : {})}
        />
      )}
    </div>
  );
}

function TrackedBlock({ item, onRun, refreshing }: { item: Tracked; onRun: (id: string) => void; refreshing: boolean }) {
  const running = item.status === "running";
  const actions: Action[] = [
    running
      ? { id: "stop", label: "Arrêter", icon: <Square />, onPress: () => undefined, confirm: { title: `Arrêter « ${item.name} » ?`, confirmLabel: "Arrêter" } }
      : { id: "run", label: "Relancer", icon: <RotateCcw />, onPress: () => onRun(item.id) },
    { id: "logs", label: "Ouvrir le journal", icon: <ExternalArrow />, onPress: () => undefined },
    { id: "pause", label: "Suspendre la planification", onPress: () => undefined },
  ];
  const last = item.durations[item.durations.length - 1]!;
  return (
    <PageSection framed title={item.name} description={item.where} actions={actions} isRefreshing={refreshing} footer={<RunFooter item={item} />}>
      {item.error ? (
        <p className="m-0 text-sm text-danger">{item.error}</p>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="m-0 text-sm text-fg-2">
            Dernière durée : <span className="tabular-nums">{minutes(last)}</span>
          </p>
          <Sparkline values={item.durations} label={`Durée des ${item.durations.length} dernières exécutions, de ${minutes(item.durations[0]!)} à ${minutes(last)}`} />
        </div>
      )}
    </PageSection>
  );
}

/* ---------- La page ---------- */

type BoardState = "ready" | "loading" | "refreshing" | "empty" | "block-error";

function TrackingBoard({ state = "ready" }: { state?: BoardState }) {
  const [filter, setFilter] = useState("all");
  const [rerun, setRerun] = useState<string | null>(null);
  const [view, setView] = useState("taches");
  const items = state === "empty" ? [] : ITEMS.filter((i) => filter === "all" || (filter === "failed" ? i.status === "failed" : i.status === "running"));
  const failed = ITEMS.filter((i) => i.status === "failed").length;
  const running = ITEMS.filter((i) => i.status === "running").length;
  return (
    <RecipeShell
      page="suivi"
      pageTitle="Suivi"
      views={[
        { id: "taches", label: "Tâches" },
        { id: "historique", label: "Historique" },
      ]}
      activeView={view}
      onViewChange={setView}
    >
      {view === "historique" ? (
        <Page>
          <PageSection title="Historique" description="La liste des exécutions (ListPage) : un bloc y mène, filtré.">
            {null}
          </PageSection>
        </Page>
      ) : (
        <Page
          toolbar={
            <SegmentedControl
              label="État"
              options={[
                { value: "all", label: "Toutes" },
                { value: "failed", label: `En échec (${failed})` },
                { value: "running", label: `En cours (${running})` },
              ]}
              value={filter}
              onChange={setFilter}
            />
          }
          actions={[{ id: "refresh", label: "Actualiser", icon: <RotateCcw />, onPress: () => undefined }]}
          actionsLabel="Tâches"
          isRefreshing={state === "refreshing"}
          footer={state === "loading" ? undefined : `${ITEMS.length} tâches suivies · ${failed} en échec · mis à jour il y a 30 s`}
        >
          {state === "loading" ? (
            // UI d'abord : la barre d'outils tout de suite ; seul le bloc qui attend montre son attente.
            <PageSection framed title="Tâches" state="loading" />
          ) : items.length === 0 ? (
            <PageSection
              framed
              title="Tâches"
              empty={
                state === "empty"
                  ? { title: "Aucune tâche suivie", description: "Ajoutez une tâche pour suivre ses exécutions.", action: { id: "add", label: "Ajouter une tâche", onPress: () => undefined } }
                  : { title: "Aucune tâche dans cet état", action: { id: "all", label: "Voir toutes les tâches", onPress: () => setFilter("all") } }
              }
            />
          ) : (
            <PageGrid columns={3}>
              {items.map((item) =>
                state === "block-error" && item.id === "index" ? (
                  <PageSection key={item.id} framed title={item.name} description={item.where} state="error" onRetry={() => undefined} />
                ) : (
                  <TrackedBlock key={item.id} item={item} onRun={setRerun} refreshing={rerun === item.id} />
                ),
              )}
            </PageGrid>
          )}
        </Page>
      )}
    </RecipeShell>
  );
}

/* ---------- Stories ---------- */

const meta: Meta<typeof TrackingBoard> = {
  title: "Recettes/Tableau de suivi",
  component: TrackingBoard,
  parameters: { layout: "fullscreen" },
  beforeEach: resetStoredState,
};
export default meta;
type Story = StoryObj<typeof TrackingBoard>;

/** Référence (captures) : filtre d'état, six blocs encadrés sur deux lignes de trois, pieds alignés. */
export const Reference: Story = {};

/** Les blocs d'une ligne ont la même hauteur et leurs pieds sont alignés (D-423) ; tout tient sur un écran. */
export const GrilleAlignee: Story = {
  play: async ({ canvasElement }) => {
    const sections = [...canvasElement.querySelectorAll<HTMLElement>("[data-page-grid] > section")];
    await expect(sections).toHaveLength(6);
    const feet = sections.slice(0, 3).map((s) => Math.round(s.querySelector("[data-section-footer]")!.getBoundingClientRect().bottom));
    if (window.innerWidth >= 1200) await expect(new Set(feet).size).toBe(1);
  },
};

/** Le filtre s'applique tout de suite ; un filtre sans élément dit l'absence et ramène à « Toutes ». */
export const Filtre: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("radio", { name: "En échec (1)" }));
    await waitFor(() => expect(canvasElement.querySelectorAll("[data-page-grid] > section")).toHaveLength(1));
    await expect(c.getByRole("region", { name: "Export comptable" })).toBeVisible();
  },
};

/** « Relancer » : le bloc garde ses données, une barre de 2 px défile sur son bord haut, il porte `aria-busy` (D-426). */
export const Relancer: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const block = c.getByRole("region", { name: "Import des commandes" });
    await userEvent.click(within(block).getByRole("button", { name: /Relancer/ }));
    await waitFor(() => expect(block).toHaveAttribute("aria-busy", "true"));
    await expect(within(block).getByRole("progressbar", { name: "Mise à jour…" })).toBeInTheDocument();
    await expect(within(block).getByText("Réussie")).toBeVisible();
  },
};

/** Premier chargement : barre d'outils tout de suite ; un seul bloc attend, la page ne passe pas en `loading` (D-427). */
export const Chargement: Story = {
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("radio", { name: "Toutes" })).toBeVisible();
    await expect(c.getByRole("region", { name: "Tâches" })).toBeVisible();
  },
};

/** « Actualiser » : toute la page relit, les blocs restent ; une barre de 2 px sous la barre d'outils (D-426). */
export const Relecture: Story = {
  args: { state: "refreshing" },
  play: async ({ canvasElement }) => {
    const content = canvasElement.querySelector("[data-page-content]")!;
    await expect(content).toHaveAttribute("aria-busy", "true");
    await expect(canvasElement.querySelectorAll("[data-page-grid] > section")).toHaveLength(6);
  },
};

/** Échec d'un seul élément : son bloc dit l'échec et propose « Réessayer » ; les autres restent. */
export const ErreurDUnBloc: Story = {
  args: { state: "block-error" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(within(c.getByRole("region", { name: "Index de recherche" })).getByRole("button", { name: "Réessayer" })).toBeVisible();
    await expect(c.getByRole("region", { name: "Export comptable" })).toBeVisible();
  },
};

/** Aucun élément suivi : un bloc dit l'absence et propose d'en ajouter un. */
export const Vide: Story = {
  args: { state: "empty" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Aucune tâche suivie")).toBeVisible();
  },
};
