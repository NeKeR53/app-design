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
import { DemoDetail } from "../Drawer/Drawer.stories";
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

/** Largeur réglable de 240 px jusqu'à laisser 360 px au contenu, flèches par 16 px, double-clic : défaut (D-025, D-402). */
export const DetailRedimensionnable: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const handle = c.getByRole("separator", { name: "Largeur du panneau de détail" });
    const panel = c.getByRole("complementary", { name: "Détail" });
    const main = canvasElement.ownerDocument.querySelector("main") as HTMLElement;
    const w0 = panel.getBoundingClientRect().width;
    const max = Math.round(w0 + main.getBoundingClientRect().width - 360);
    handle.focus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await waitFor(() => expect(Math.round(panel.getBoundingClientRect().width)).toBe(Math.round(Math.min(max, w0 + 32))));
    for (let i = 0; i < 80; i++) await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(Math.round(panel.getBoundingClientRect().width)).toBe(max));
    await expect(Math.round(main.getBoundingClientRect().width)).toBe(360);
    await userEvent.dblClick(handle);
    await waitFor(() => expect(Math.round(panel.getBoundingClientRect().width)).toBe(Math.round(w0)));
    // À la souris : glisser la poignée vers la gauche élargit le panneau.
    const box = handle.getBoundingClientRect();
    const at = (x: number, buttons = 1) => ({ clientX: x, clientY: box.top + 100, bubbles: true, pointerId: 1, buttons });
    handle.dispatchEvent(new PointerEvent("pointerdown", at(box.left + 3)));
    window.dispatchEvent(new PointerEvent("pointermove", at(box.left - 97)));
    window.dispatchEvent(new PointerEvent("pointerup", at(box.left - 97, 0)));
    await waitFor(() => expect(Math.round(panel.getBoundingClientRect().width)).toBe(Math.round(Math.min(max, w0 + 100))));
  },
};

/** Glisser au-dessus d'une iframe (une page) : un voile couvre la fenêtre ; un relâché perdu
 *  ne laisse pas le glisser actif, le survol suivant ne déplace plus la poignée (D-402). */
export const DetailGlisserSurIframe: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const doc = canvasElement.ownerDocument;
    const frame = doc.createElement("iframe");
    frame.title = "Page";
    frame.srcdoc = "<body style='margin:0'>Page</body>";
    frame.style.cssText = "width:100%;height:400px;border:0";
    doc.querySelector("main")?.prepend(frame);
    const handle = c.getByRole("separator", { name: "Largeur du panneau de détail" });
    const panel = c.getByRole("complementary", { name: "Détail" });
    const w0 = Math.round(panel.getBoundingClientRect().width);
    const box = handle.getBoundingClientRect();
    const at = (x: number, buttons: number) => ({ clientX: x, clientY: box.top + 100, bubbles: true, pointerId: 1, buttons });
    handle.dispatchEvent(new PointerEvent("pointerdown", at(box.left + 3, 1)));
    // Pendant le glisser, le voile passe au-dessus de l'iframe.
    await waitFor(() => expect(doc.querySelector("[data-socle-drag-veil]")).not.toBeNull());
    window.dispatchEvent(new PointerEvent("pointermove", at(box.left - 57, 1)));
    await waitFor(() => expect(Math.round(panel.getBoundingClientRect().width)).toBe(w0 + 60));
    // Le relâché est perdu (hors de la fenêtre) : le mouvement suivant arrive sans bouton pressé.
    window.dispatchEvent(new PointerEvent("pointermove", at(box.left - 157, 0)));
    await waitFor(() => expect(doc.querySelector("[data-socle-drag-veil]")).toBeNull());
    window.dispatchEvent(new PointerEvent("pointermove", at(box.left - 257, 0)));
    await expect(Math.round(panel.getBoundingClientRect().width)).toBe(w0 + 60);
    // Un nouveau glisser repart de la largeur atteinte.
    const box2 = handle.getBoundingClientRect();
    handle.dispatchEvent(new PointerEvent("pointerdown", { ...at(box2.left + 3, 1), clientY: box.top + 100 }));
    window.dispatchEvent(new PointerEvent("pointermove", { ...at(box2.left - 37, 1) }));
    window.dispatchEvent(new PointerEvent("pointerup", at(box2.left - 37, 0)));
    await waitFor(() => expect(Math.round(panel.getBoundingClientRect().width)).toBe(w0 + 100));
    frame.remove();
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


/** Repère du bouton de repli : sa zone, à gauche de la barre du haut. */
const collapseZone = (root: HTMLElement) => {
  const zone = within(root).getByRole("button", { name: "Replier la sidebar" }).closest("span")?.parentElement;
  if (!zone) throw new Error("zone du bouton de repli introuvable");
  return zone;
};

/** macOS fenêtré : 78 px réservés aux boutons de fenêtre, la barre déplace la fenêtre (D-020). */
export const MacFenetre: Story = {
  render: () => (
    <SocleProvider platform="macos" storageKey="storybook:mac">
      <Demo />
    </SocleProvider>
  ),
  play: async ({ canvasElement }) => {
    const zone = collapseZone(canvasElement);
    await expect(getComputedStyle(zone).paddingLeft).toBe("78px");
    await expect(within(canvasElement).getByRole("banner")).toHaveAttribute("data-tauri-drag-region");
  },
};

/**
 * macOS plein écran (`isFullscreen`) : les boutons de fenêtre sont cachés, aucune place réservée ;
 * le bouton de repli se place comme sur le web ; la barre ne déplace plus la fenêtre (D-020).
 */
export const MacPleinEcran: Story = {
  render: () => (
    <SocleProvider platform="macos" isFullscreen storageKey="storybook:mac-fs">
      <Demo />
    </SocleProvider>
  ),
  play: async ({ canvasElement }) => {
    const zone = collapseZone(canvasElement);
    await expect(getComputedStyle(zone).paddingLeft).not.toBe("78px");
    await expect(getComputedStyle(zone).paddingLeft).toBe(getComputedStyle(zone).paddingRight);
    const banner = within(canvasElement).getByRole("banner");
    await expect(banner).not.toHaveAttribute("data-tauri-drag-region");
    await expect(banner.querySelector("[data-tauri-drag-region]")).toBeNull();
    // Le bouton reste cliquable : la sidebar se replie.
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Replier la sidebar" }));
    await waitFor(() => expect(within(canvasElement).getByRole("button", { name: "Déplier la sidebar" })).toBeInTheDocument());
  },
};

/** Fenêtre Windows pilotée par la story : l'état agrandi suit le bouton du milieu, comme `onResized` dans une app. */
function WindowsDemo({ onAction }: { onAction?: (a: string) => void }) {
  const [maximized, setMaximized] = useState(false);
  return (
    <SocleProvider
      platform="windows"
      storageKey="storybook:win"
      windowControls={{
        onMinimize: () => onAction?.("minimize"),
        onToggleMaximize: () => {
          onAction?.("toggle-maximize");
          setMaximized((v) => !v);
        },
        onClose: () => onAction?.("close"),
        isMaximized: maximized,
      }}
    >
      <Demo />
    </SocleProvider>
  );
}

/**
 * Windows avec `windowControls` : réduire, agrandir (puis restaurer) et fermer, en haut à droite, 46 px chacun,
 * toute la hauteur de la barre ; ils ne déplacent pas la fenêtre et restent hors de la tabulation (D-020, D-422).
 */
export const WindowsFenetre: Story = {
  render: () => <WindowsDemo onAction={(a) => ((window as unknown as { __winActions?: string[] }).__winActions ??= []).push(a)} />,
  play: async ({ canvasElement }) => {
    const w = window as unknown as { __winActions?: string[] };
    w.__winActions = [];
    const c = within(canvasElement);
    const banner = c.getByRole("banner");
    const reduce = c.getByRole("button", { name: "Réduire" });
    const close = c.getByRole("button", { name: "Fermer" });
    // 46 px × hauteur de la barre, collés au bord droit, dans les 138 px réservés.
    const bar = banner.getBoundingClientRect();
    for (const b of [reduce, c.getByRole("button", { name: "Agrandir" }), close]) {
      const r = b.getBoundingClientRect();
      await expect(r.width).toBe(46);
      await expect(r.height).toBe(bar.height - 1);
      await expect(b).not.toHaveAttribute("data-tauri-drag-region");
      await expect(b).toHaveAttribute("tabindex", "-1");
    }
    await expect(Math.round(close.getBoundingClientRect().right)).toBe(Math.round(bar.right));
    await expect(Math.round(bar.right - reduce.getBoundingClientRect().left)).toBe(138);
    // Les actions de la page s'arrêtent avant les boutons.
    const actions = banner.querySelector<HTMLElement>("[data-socle-fit]")!;
    await expect(actions.getBoundingClientRect().right).toBeLessThanOrEqual(reduce.getBoundingClientRect().left);
    // Survol de « Fermer » : rouge de Windows, glyphe blanc.
    await userEvent.hover(close);
    await waitFor(() => expect(getComputedStyle(close).backgroundColor).toBe("rgb(196, 43, 28)"));
    await expect(getComputedStyle(close).color).toBe("rgb(255, 255, 255)");
    await userEvent.unhover(close);
    // Les actions arrivent à l'app ; « Agrandir » devient « Restaurer ».
    await userEvent.click(reduce);
    await userEvent.click(c.getByRole("button", { name: "Agrandir" }));
    await waitFor(() => expect(c.getByRole("button", { name: "Restaurer" })).toBeInTheDocument());
    await userEvent.click(c.getByRole("button", { name: "Restaurer" }));
    await waitFor(() => expect(c.getByRole("button", { name: "Agrandir" })).toBeInTheDocument());
    await userEvent.click(close);
    await expect(w.__winActions).toEqual(["minimize", "toggle-maximize", "toggle-maximize", "close"]);
  },
};

/** Windows sans `windowControls` : la place est réservée, aucun bouton n'est dessiné (comportement d'avant D-422). */
export const WindowsSansBoutons: Story = {
  render: () => (
    <SocleProvider platform="windows" storageKey="storybook:win-none">
      <Demo />
    </SocleProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("button", { name: "Réduire" })).toBeNull();
    await expect(c.queryByRole("button", { name: "Fermer" })).toBeNull();
    const actions = c.getByRole("banner").querySelector<HTMLElement>("[data-socle-fit]")!.parentElement!;
    await expect(getComputedStyle(actions).paddingRight).toBe("138px");
  },
};

/** macOS : `windowControls` est ignorée, macOS garde ses boutons du système (D-422). */
export const MacIgnoreWindowControls: Story = {
  render: () => (
    <SocleProvider platform="macos" storageKey="storybook:mac-wc" windowControls={{ onMinimize: () => {}, onToggleMaximize: () => {}, onClose: () => {} }}>
      <Demo />
    </SocleProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button", { name: "Réduire" })).toBeNull();
    await expect(getComputedStyle(collapseZone(canvasElement)).paddingLeft).toBe("78px");
  },
};

/** L'app ouvre le panneau : un élément choisi dans la page l'ouvre, le bouton le referme (D-398). */
function PiloteDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed inset-0">
      <AppShell
        pageTitle="Tickets"
        detail={<DemoDetail />}
        isDetailOpen={open}
        onDetailOpenChange={setOpen}
        sidebar={
          <Sidebar selectedId="t" onSelectionChange={() => {}} account={<Sidebar.Account name="Camille Martin" onSettings={() => {}} />}>
            <Sidebar.Item id="t" icon={<Doc />} label="Tickets" />
          </Sidebar>
        }
      >
        <div className="p-6">
          <Button onPress={() => setOpen(true)}>Ouvrir le ticket</Button>
        </div>
      </AppShell>
    </div>
  );
}

export const PanneauPilote: Story = {
  render: () => <PiloteDemo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("complementary", { name: "Détail" })).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Ouvrir le ticket" }));
    await waitFor(() => expect(c.getByRole("complementary", { name: "Détail" })).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: "Panneau de détail" }));
    await waitFor(() => expect(c.queryByRole("complementary", { name: "Détail" })).toBeNull());
    await userEvent.click(c.getByRole("button", { name: "Ouvrir le ticket" }));
    await waitFor(() => expect(c.getByRole("complementary", { name: "Détail" })).toBeVisible());
  },
};
