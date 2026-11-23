import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { AppShell } from "./AppShell";
import { Sidebar } from "../Sidebar/Sidebar";
import type { TabItem } from "../../components/Tabs/Tabs";
import { IconButton } from "../../components/IconButton/IconButton";
import { Button } from "../../components/Button/Button";
import { ActionBar, type Action } from "../ActionBar/ActionBar";
import { ArrowDown, Bell, Plus, Settings } from "../../icons";
import { Menu } from "../../components/Menu/Menu";
import type { PageStatus } from "./AppShell";
import { DemoDetail } from "../DetailPanel/DetailPanel.stories";
import { Doc } from "../../../.storybook/story-icons";
import { SocleProvider } from "../../provider/SocleProvider";

const meta: Meta<typeof AppShell> = {
  title: "Patterns/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
  beforeEach: () => {
    for (const k of Object.keys(localStorage)) if (k.startsWith("storybook:")) localStorage.removeItem(k);
  },
};
export default meta;
type Story = StoryObj<typeof AppShell>;
const body = () => within(document.body);
const mod = () => (/mac/i.test(navigator.platform) ? "Meta" : "Control");

const Search = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

function Demo() {
  const [page, setPage] = useState("docs");
  const [views, setViews] = useState<TabItem[]>([
    { id: "all", label: "Tous les documents" },
    { id: "new", label: "Créer un rapport" },
    { id: "r1", label: "Rapport trimestriel", closable: true },
  ]);
  const [view, setView] = useState("all");
  return (
    // L'AppShell occupe toute la fenêtre : on sort du cadre à marge des stories.
    <div className="fixed inset-0">
    <AppShell
      pageTitle="Documents"
      views={views}
      activeView={view}
      onViewChange={setView}
      onViewClose={(id) => setViews((v) => v.filter((x) => x.id !== id))}
      actions={<IconButton icon={<Search />} label="Rechercher" shortcut="Mod+K" />}
      detail={<DemoDetail />}
      sidebar={
        <Sidebar selectedId={page} onSelectionChange={setPage} account={<Sidebar.Account name="Camille Martin" detail="Admin" onSettings={() => {}} />}>
          <Sidebar.Item id="home" icon={<Doc />} label="Accueil" tabbar />
          <Sidebar.Item id="docs" icon={<Doc />} label="Documents" tabbar />
          <Sidebar.Item id="plan" icon={<Doc />} label="Planning" tabbar />
          <Sidebar.Item id="contacts" icon={<Doc />} label="Contacts" />
        </Sidebar>
      }
    >
      <div className="p-6">
        <h2 className="m-0 mb-2 text-xl font-semibold">{views.find((v) => v.id === view)?.label}</h2>
        <p className="m-0 text-fg-2">Page « {page} ». Le gabarit de la page se place ici.</p>
      </div>
    </AppShell>
    </div>
  );
}

export const ParDefaut: Story = { render: () => <Demo /> };

/** Sidebar dépliée à l'ouverture ; repliée, l'état est mémorisé (D-016). Mod+B la redéplie. */
export const SidebarMemorisee: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("navigation", { name: "Navigation principale" })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Replier la sidebar" }));
    await waitFor(() => expect(c.queryByRole("navigation", { name: "Navigation principale" })).toBeNull());
    await expect(localStorage.getItem("storybook:shell:sidebar-collapsed")).toBe("true");
    await userEvent.keyboard(`{${mod()}>}b{/${mod()}}`);
    await waitFor(() => expect(c.getByRole("navigation", { name: "Navigation principale" })).toBeVisible());
  },
};

/** Repliée : overlay au survol du bouton, fermé 250 ms après la sortie (D-017). */
export const SidebarOverlay: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Replier la sidebar" }));
    await userEvent.hover(c.getByRole("button", { name: "Déplier la sidebar" }));
    await waitFor(() => expect(c.getByRole("navigation", { name: "Navigation principale" })).toBeVisible());
    await userEvent.unhover(c.getByRole("button", { name: "Déplier la sidebar" }));
    await expect(c.getByRole("navigation", { name: "Navigation principale" })).toBeVisible();
    await waitFor(() => expect(c.queryByRole("navigation", { name: "Navigation principale" })).toBeNull(), { timeout: 1000 });
  },
};

/** Overlay : reste ouvert tant que le focus clavier est dedans ; se ferme quand le focus en sort, souris dehors. */
export const SidebarOverlayFocus: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Replier la sidebar" }));
    await userEvent.hover(c.getByRole("button", { name: "Déplier la sidebar" }));
    const nav = await waitFor(() => c.getByRole("navigation", { name: "Navigation principale" }));
    // Modalité clavier, puis focus sur un élément de l'overlay.
    await userEvent.keyboard("{Shift}");
    within(nav).getAllByRole("row")[0]!.focus();
    await userEvent.unhover(c.getByRole("button", { name: "Déplier la sidebar" }));
    await new Promise((done) => setTimeout(done, 600));
    await expect(c.getByRole("navigation", { name: "Navigation principale" })).toBeVisible();
    // Le focus sort, la souris est dehors : l'overlay se ferme.
    c.getByRole("button", { name: "Panneau de détail" }).focus();
    await waitFor(() => expect(c.queryByRole("navigation", { name: "Navigation principale" })).toBeNull(), { timeout: 1000 });
  },
};

/** Panneau de détail : bascule par le bouton et Mod+. ; état mémorisé (D-018). */
export const PanneauDetail: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("complementary", { name: "Détail" })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Panneau de détail" }));
    await waitFor(() => expect(c.queryByRole("complementary", { name: "Détail" })).toBeNull());
    await userEvent.keyboard(`{${mod()}>}.{/${mod()}}`);
    await waitFor(() => expect(c.getByRole("complementary", { name: "Détail" })).toBeVisible());
  },
};

/** Largeur réglable de 240 à 480 px, flèches par 16 px, double-clic : défaut (D-025). */
export const DetailRedimensionnable: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const handle = c.getByRole("separator", { name: "Largeur du panneau de détail" });
    const panel = c.getByRole("complementary", { name: "Détail" });
    const w0 = panel.getBoundingClientRect().width;
    handle.focus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await waitFor(() => expect(Math.round(panel.getBoundingClientRect().width)).toBe(Math.round(Math.min(480, w0 + 32))));
    for (let i = 0; i < 30; i++) await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(Math.round(panel.getBoundingClientRect().width)).toBe(480));
    await userEvent.dblClick(handle);
    await waitFor(() => expect(Math.round(panel.getBoundingClientRect().width)).toBe(Math.round(w0)));
  },
};

/** Onglets de vues dans la barre ; la sidebar ne touche pas aux onglets (D-021). */
export const OngletsDeVues: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("tab", { name: /Créer un rapport/ }));
    await expect(c.getByRole("heading", { name: "Créer un rapport" })).toBeVisible();
    // Le contenu est le tabpanel de la vue active, relié par aria-controls.
    const tab = c.getByRole("tab", { name: /Créer un rapport/ });
    const panel = await waitFor(() => c.getByRole("tabpanel", { name: /Créer un rapport/ }));
    await expect(tab).toHaveAttribute("aria-controls", panel.id);
    await userEvent.click(c.getByRole("row", { name: /Planning/ }));
    await expect(c.getAllByRole("tab")).toHaveLength(3);
  },
};

/** Échap ferme ce qui flotte : l'overlay de la sidebar. */
export const Echap: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Replier la sidebar" }));
    await userEvent.hover(c.getByRole("button", { name: "Déplier la sidebar" }));
    await waitFor(() => expect(c.getByRole("navigation", { name: "Navigation principale" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("navigation", { name: "Navigation principale" })).toBeNull());
  },
};

/** Libellés internes traduits par l'option `messages` de SocleProvider (D-089). */
export const Traduction: Story = {
  render: () => (
    <SocleProvider storageKey="storybook" messages={{ collapseSidebar: "Collapse sidebar", detailPanel: "Detail panel", mainNavigation: "Main navigation", settings: "Settings", viewsOf: (p) => `Views of ${p}` }}>
      <Demo />
    </SocleProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
    await expect(c.getByRole("button", { name: "Detail panel" })).toBeVisible();
    await expect(c.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
    await expect(c.getByRole("tablist", { name: "Views of Documents" })).toBeVisible();
    // Une entrée absente garde la valeur française.
    await expect(c.getByRole("button", { name: "Précédent" })).toBeVisible();
  },
};

/* ---------- P13 : actions de page (D-220 à D-222) ---------- */
const topbarActions: Action[] = [
  { id: "new", label: "Nouveau document", primary: true, onPress: () => {} },
  { id: "export", label: "Exporter en CSV", icon: <ArrowDown />, onPress: () => {} },
  { id: "add", label: "Ajouter un dossier", icon: <Plus />, onPress: () => {} },
  { id: "settings", label: "Réglages de la liste", icon: <Settings />, onPress: () => {} },
  { id: "import", label: "Importer un fichier…", onPress: () => {} },
];

function ActionsDemo() {
  const [width, setWidth] = useState<number | undefined>(undefined);
  return (
    <div className="fixed inset-y-0 left-0" style={{ width: width ?? "100%" }}>
      <AppShell
        pageTitle="Documents"
        views={[
          { id: "all", label: "Tous les documents" },
          { id: "shared", label: "Partagés" },
        ]}
        activeView="all"
        onViewChange={() => {}}
        actions={
          <>
            <IconButton icon={<Bell />} label="Notifications" />
            <ActionBar zone="topbar" actions={topbarActions} />
          </>
        }
        detail={<DemoDetail />}
        sidebar={
          <Sidebar selectedId="docs" onSelectionChange={() => {}} account={<Sidebar.Account name="Camille Martin" onSettings={() => {}} />}>
            <Sidebar.Item id="docs" icon={<Doc />} label="Documents" />
          </Sidebar>
        }
      >
        <div className="flex gap-2 p-6">
          <Button onPress={() => setWidth(undefined)}>Fenêtre large</Button>
          <Button onPress={() => setWidth(900)}>Fenêtre moyenne</Button>
          <Button onPress={() => setWidth(700)}>Fenêtre étroite</Button>
        </div>
      </AppShell>
    </div>
  );
}

/**
 * Action principale à texte dans la barre du haut (D-220) ; repli selon la place (D-221) :
 * les icônes passent dans « … » depuis la fin, puis le bouton à texte. La cloche reste.
 */
export const ActionsDePage: Story = {
  render: () => <ActionsDemo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const bar = () => within(c.getByRole("banner"));
    await waitFor(() => expect(bar().getByRole("button", { name: "Nouveau document" })).toHaveTextContent("Nouveau document"));
    await expect(bar().getByRole("button", { name: "Réglages de la liste" })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Fenêtre moyenne" }));
    await waitFor(() => expect(bar().queryByRole("button", { name: "Réglages de la liste" })).toBeNull());
    await expect(bar().getByRole("button", { name: "Nouveau document" })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Fenêtre étroite" }));
    await waitFor(() => expect(bar().queryByRole("button", { name: "Nouveau document" })).toBeNull());
    await expect(bar().getByRole("button", { name: "Notifications" })).toBeVisible();
    // Le bouton à texte replié passe en tête de « … », puis les icônes, dans leur ordre.
    await userEvent.click(bar().getByRole("button", { name: "Plus d'actions" }));
    const items = await waitFor(() => body().getAllByRole("menuitem"));
    await expect(items[0]).toHaveAccessibleName("Nouveau document");
    await userEvent.keyboard("{Escape}");
    await userEvent.click(c.getByRole("button", { name: "Fenêtre large" }));
    await waitFor(() => expect(bar().getByRole("button", { name: "Réglages de la liste" })).toBeVisible());
  },
};

/* ---------- P15 : largeurs du panneau de détail (D-240 à D-242) ---------- */
function WidthDemo({ form = false }: { form?: boolean }) {
  return (
    <div className="fixed inset-0">
      <AppShell
        pageTitle="Contacts"
        detail={<DemoDetail />}
        {...(form ? { detailWidth: "form" as const } : {})}
        detailExpandable
        sidebar={
          <Sidebar selectedId="contacts" onSelectionChange={() => {}} account={<Sidebar.Account name="Camille Martin" onSettings={() => {}} />}>
            <Sidebar.Item id="contacts" icon={<Doc />} label="Contacts" />
          </Sidebar>
        }
      >
        <div className="p-6">Liste des contacts.</div>
      </AppShell>
    </div>
  );
}

const cssPx = (name: string) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));

/** Largeur de départ `form` (--detail-w-form) ; la largeur réglée est mémorisée à part (D-240). */
export const DetailFormulaire: Story = {
  render: () => <WidthDemo form />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const panel = c.getByRole("complementary", { name: "Détail" });
    await expect(Math.round(panel.getBoundingClientRect().width)).toBe(Math.round(cssPx("--detail-w-form")));
    c.getByRole("separator", { name: "Largeur du panneau de détail" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(localStorage.getItem("storybook:shell:detail-width:form")).not.toBeNull());
    await expect(localStorage.getItem("storybook:shell:detail-width")).toBeNull();
  },
};

/** Agrandir : bouton bascule ; panneau large, sans poignée ; le contenu garde 360 px ; état mémorisé (D-241). */
export const DetailLarge: Story = {
  render: () => <WidthDemo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const panel = () => c.getByRole("complementary", { name: "Détail" });
    const w0 = panel().getBoundingClientRect().width;
    const expand = c.getByRole("button", { name: "Agrandir le panneau de détail" });
    await expect(expand).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(expand);
    await waitFor(() => expect(panel().getBoundingClientRect().width).toBeGreaterThan(w0 + 100));
    await expect(panel().getBoundingClientRect().width).toBeLessThanOrEqual(960);
    await expect(c.getByRole("main").getBoundingClientRect().width).toBeGreaterThanOrEqual(359);
    await expect(c.queryByRole("separator", { name: "Largeur du panneau de détail" })).toBeNull();
    await expect(expand).toHaveAttribute("aria-pressed", "true");
    await expect(localStorage.getItem("storybook:shell:detail-wide")).toBe("true");
    // Réduire rend la largeur d'avant.
    await userEvent.click(expand);
    await waitFor(() => expect(Math.round(panel().getBoundingClientRect().width)).toBe(Math.round(w0)));
    // Panneau fermé : pas de bouton Agrandir.
    await userEvent.click(c.getByRole("button", { name: "Panneau de détail" }));
    await waitFor(() => expect(c.queryByRole("button", { name: "Agrandir le panneau de détail" })).toBeNull());
  },
};

/* ---------- P16 : résumé après le titre et état de la page (D-250 à D-252) ---------- */
function SummaryDemo({ status }: { status?: PageStatus }) {
  const [current, setCurrent] = useState<PageStatus | undefined>(status);
  return (
    <div className="fixed inset-0">
      <AppShell
        pageTitle="Accès"
        pageSummary="3 personnes · 2 en écart · 6 environnements"
        {...(current ? { pageStatus: current } : {})}
        views={[
          { id: "people", label: "Personnes" },
          { id: "envs", label: "Environnements" },
        ]}
        activeView="people"
        onViewChange={() => {}}
        sidebar={
          <Sidebar selectedId="access" onSelectionChange={() => {}} account={<Sidebar.Account name="Camille Martin" onSettings={() => {}} />}>
            <Sidebar.Item id="access" icon={<Doc />} label="Accès" />
          </Sidebar>
        }
      >
        <div className="flex gap-2 p-6">
          <Button onPress={() => setCurrent({ label: "Hors ligne", tone: "danger", description: "Les modifications partiront au retour de la connexion" })}>Passer hors ligne</Button>
          <Button onPress={() => setCurrent(undefined)}>Retirer l'état</Button>
        </div>
      </AppShell>
    </div>
  );
}

/** Résumé après le titre, coupé avec info-bulle ; ordre : titre, état, résumé, vues (D-250). */
export const ResumeDePage: Story = {
  render: () => <SummaryDemo status={{ label: "Lecture seule", description: "Vous pouvez consulter cette page, pas la modifier" }} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const bar = within(c.getByRole("banner"));
    const title = bar.getByRole("heading", { name: "Accès" });
    const status = bar.getByRole("img", { name: /Lecture seule/ });
    const summary = bar.getByText("3 personnes · 2 en écart · 6 environnements");
    const tabs = bar.getByRole("tablist");
    const x = (el: Element) => el.getBoundingClientRect().left;
    await expect(x(status)).toBeGreaterThan(x(title));
    await expect(x(summary)).toBeGreaterThan(x(status));
    await expect(x(tabs)).toBeGreaterThan(x(summary));
    // Sans menu : focusable, l'info-bulle donne l'explication.
    await expect(status).toHaveAttribute("tabindex", "0");
    await userEvent.hover(status);
    await waitFor(() => expect(body().getByRole("tooltip")).toHaveTextContent("Vous pouvez consulter cette page, pas la modifier"), { timeout: 1500 });
  },
};

/** État avec menu : bouton qui ouvre le menu ; changement annoncé (D-251, D-252). */
export const EtatDePage: Story = {
  render: () => (
    <SummaryDemo
      status={{ label: "Exemple", tone: "warning", description: "Cette page affiche des données d'exemple", menu: <Menu.Item label="Quitter les données d'exemple" /> }}
    />
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const bar = within(c.getByRole("banner"));
    const trigger = bar.getByRole("button", { name: "Exemple : Cette page affiche des données d'exemple" });
    await userEvent.click(trigger);
    await waitFor(() => expect(body().getByRole("menuitem", { name: "Quitter les données d'exemple" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(bar.getByRole("status")).toHaveTextContent("Exemple : Cette page affiche des données d'exemple");
    await userEvent.click(c.getByRole("button", { name: "Passer hors ligne" }));
    await waitFor(() => expect(bar.getByRole("status")).toHaveTextContent(/^Hors ligne/));
    await userEvent.click(c.getByRole("button", { name: "Retirer l'état" }));
    await waitFor(() => expect(bar.getByRole("status")).toHaveTextContent(""));
    await expect(bar.queryByRole("img", { name: /Hors ligne/ })).toBeNull();
  },
};
