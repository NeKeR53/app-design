import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { TabPanel, Tabs, type TabItem } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Composants/Tabs",
  component: Tabs,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Tabs>;
const body = () => within(document.body);

const BASE: TabItem[] = [
  { id: "all", label: "Tous les documents" },
  { id: "new", label: "Créer un rapport" },
  { id: "arch", label: "Archives" },
  { id: "r1", label: "Rapport trimestriel des ventes de la région Sud-Ouest", closable: true },
];

function Demo({ initial = BASE, width }: { initial?: TabItem[]; width?: number }) {
  const [items, setItems] = useState(initial);
  const [sel, setSel] = useState(initial[0]!.id);
  return (
    <div style={width ? { width } : undefined} className="flex items-center gap-2 border-b border-line pb-1">
      <span className="font-semibold text-fg">Documents</span>
      <Tabs pageTitle="Documents" items={items} selectedId={sel} onSelectionChange={setSel} onClose={(id) => setItems((xs) => xs.filter((x) => x.id !== id))} />
      <output data-testid="sel" className="ml-auto text-sm text-fg-3">{sel}</output>
    </div>
  );
}
const sel = (c: HTMLElement) => within(c).getByTestId("sel").textContent;

export const ParDefaut: Story = { render: () => <Demo /> };

/** Un clic active la vue ; flèches : activation immédiate ; Origine et Fin (D-021). */
export const Selection: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("tab", { name: /Créer un rapport/ }));
    await expect(sel(canvasElement)).toBe("new");
    await userEvent.keyboard("{ArrowRight}");
    await expect(sel(canvasElement)).toBe("arch");
    await userEvent.keyboard("{End}");
    await expect(sel(canvasElement)).toBe("r1");
    await expect(c.getByRole("tablist")).toHaveAccessibleName("Vues de la page Documents");
  },
};

/** Contenu relié aux onglets : rôle `tabpanel`, nommé par l'onglet actif, cible de `aria-controls`. */
export const AvecTabPanel: Story = {
  render: () => {
    const [sel, setSel] = useState(BASE[0]!.id);
    return (
      <div className="flex flex-col gap-2">
        <Tabs id="vues-documents" pageTitle="Documents" items={BASE} selectedId={sel} onSelectionChange={setSel} />
        <TabPanel tabs="vues-documents" className="text-sm text-fg-2">Contenu de la vue {sel}</TabPanel>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const check = async (name: RegExp) => {
      const tab = c.getByRole("tab", { name });
      const panel = c.getByRole("tabpanel");
      await waitFor(() => expect(panel).toHaveAccessibleName(tab.textContent ?? ""));
      await expect(tab).toHaveAttribute("aria-controls", panel.id);
    };
    await check(/Tous les documents/);
    await userEvent.click(c.getByRole("tab", { name: /Archives/ }));
    await check(/Archives/);
  },
};

/** Mod+1 à 9 activent la vue de même rang (D-021). */
export const Raccourcis: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const mod = /mac/i.test(navigator.platform) ? "Meta" : "Control";
    await userEvent.keyboard(`{${mod}>}3{/${mod}}`);
    await expect(sel(canvasElement)).toBe("arch");
  },
};

/** Fermer la vue active active la vue de gauche ; une vue fixe n'a pas de × (D-021, D-041). */
export const Fermeture: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("button", { name: /Fermer la vue Archives/ })).toBeNull();
    await userEvent.click(c.getByRole("tab", { name: /Rapport trimestriel/ }));
    await userEvent.click(c.getByRole("button", { name: /Fermer la vue Rapport/ }));
    await expect(c.queryByRole("tab", { name: /Rapport trimestriel/ })).toBeNull();
    await expect(sel(canvasElement)).toBe("arch");
  },
};

/** Suppr ferme la vue fermable qui a le focus. */
export const FermetureClavier: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("tab", { name: /Rapport trimestriel/ }));
    await userEvent.keyboard("{Delete}");
    await waitFor(() => expect(c.queryByRole("tab", { name: /Rapport trimestriel/ })).toBeNull());
  },
};

const MANY: TabItem[] = [
  ...BASE,
  ...["Budget 2027", "Contrat cadre fournisseur", "Plan de formation", "Compte rendu", "Note de service", "Inventaire annuel"].map((label, i) => ({
    id: `x${i}`,
    label,
    closable: true,
  })),
];

/** Trop de vues : la rangée défile, le chevron liste toutes les vues (D-027). */
export const Debordement: Story = {
  render: () => <Demo initial={MANY} width={640} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const chevron = await waitFor(() => c.getByRole("button", { name: "Toutes les vues" }));
    await userEvent.click(chevron);
    const list = await waitFor(() => body().getByRole("grid", { name: "Toutes les vues" }));
    await expect(within(list).getAllByRole("row")).toHaveLength(MANY.length);
    // Le × de la liste ferme une vue fermable (D-027).
    await userEvent.click(within(list).getByRole("button", { name: "Fermer la vue Budget 2027" }));
    await waitFor(() => expect(c.queryByRole("tab", { name: /Budget 2027/ })).toBeNull());
    await userEvent.click(within(list).getByRole("row", { name: /Inventaire annuel/ }));
    await expect(sel(canvasElement)).toBe("x5");
    await waitFor(() => expect(body().queryByRole("grid", { name: "Toutes les vues" })).toBeNull());
    const tab = c.getByRole("tab", { name: /Inventaire annuel/ });
    const tablist = c.getByRole("tablist");
    await waitFor(() => expect(tab.getBoundingClientRect().right).toBeLessThanOrEqual(tablist.getBoundingClientRect().right + 1));
  },
};

/** Libellé tronqué à 200 px : texte complet dans l'info-bulle Socle, au focus clavier. */
export const LibelleTronque: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("tab", { name: /Tous les documents/ }));
    await userEvent.keyboard("{End}");
    const tip = await waitFor(() => body().getByRole("tooltip"));
    await expect(tip).toHaveTextContent("Rapport trimestriel des ventes de la région Sud-Ouest");
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(body().queryByRole("tooltip")).toBeNull());
  },
};

/** L'app confirme avant de fermer : `onClose` vient d'abord ; la vue reste active tant que l'onglet est là. Annuler ou renvoyer `false` ne change rien. */
export const FermetureConfirmee: Story = {
  render: () => {
    const [items, setItems] = useState(BASE);
    const [sel, setSel] = useState("r1");
    const [asking, setAsking] = useState<string | null>(null);
    const [refuse, setRefuse] = useState(false);
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Tabs
            pageTitle="Documents"
            items={items}
            selectedId={sel}
            onSelectionChange={setSel}
            onClose={(id) => {
              if (refuse) return false;
              setAsking(id);
            }}
          />
          <output data-testid="sel" className="ml-auto text-sm text-fg-3">{sel}</output>
        </div>
        <label className="text-sm"><input type="checkbox" checked={refuse} onChange={(e) => setRefuse(e.target.checked)} /> Refuser</label>
        {asking && (
          <div role="alertdialog" aria-label="Fermer la vue ?" className="flex gap-2">
            <button type="button" onClick={() => setAsking(null)}>Annuler</button>
            <button type="button" onClick={() => { setItems((xs) => xs.filter((x) => x.id !== asking)); setAsking(null); }}>Fermer</button>
          </div>
        )}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const closeBtn = () => c.getByRole("button", { name: /Fermer la vue Rapport/ });
    // Demande, puis annulation : la vue active ne bouge pas.
    await userEvent.click(closeBtn());
    await expect(c.getByRole("alertdialog")).toBeVisible();
    await expect(sel(canvasElement)).toBe("r1");
    await userEvent.click(c.getByRole("button", { name: "Annuler" }));
    await expect(sel(canvasElement)).toBe("r1");
    await expect(c.getByRole("tab", { name: /Rapport trimestriel/ })).toHaveAttribute("aria-selected", "true");
    // `onClose` renvoie `false` : rien ne change.
    await userEvent.click(c.getByRole("checkbox", { name: "Refuser" }));
    await userEvent.click(closeBtn());
    await expect(c.queryByRole("alertdialog")).toBeNull();
    await expect(sel(canvasElement)).toBe("r1");
    await userEvent.click(c.getByRole("checkbox", { name: "Refuser" }));
    // Confirmation : l'onglet part, la voisine de gauche s'active.
    await userEvent.click(closeBtn());
    await userEvent.click(c.getByRole("button", { name: "Fermer" }));
    await waitFor(() => expect(sel(canvasElement)).toBe("arch"));
    await expect(c.queryByRole("tab", { name: /Rapport trimestriel/ })).toBeNull();
    await expect(c.getByRole("tab", { name: /Archives/ })).toHaveAttribute("aria-selected", "true");
  },
};

/** Vue modifiée (`isDirty`) : un point remplace le × ; au survol, le × revient ; nom « (modifié) » ; `onClose` peut refuser (D-349). */
export const VueModifiee: Story = {
  render: () => {
    const [items, setItems] = useState<TabItem[]>([{ id: "all", label: "Tous" }, { id: "r3", label: "Rapport T3", closable: true, isDirty: true }]);
    const [sel, setSel] = useState("r3");
    const [asked, setAsked] = useState(0);
    return (
      <div className="flex items-center gap-2">
        <Tabs
          pageTitle="Documents"
          items={items}
          selectedId={sel}
          onSelectionChange={setSel}
          onClose={(id) => {
            const it = items.find((x) => x.id === id);
            // Vue modifiée : l'app demande confirmation ; ici, le premier essai est refusé.
            if (it?.isDirty && asked === 0) {
              setAsked(1);
              return false;
            }
            setItems((xs) => xs.filter((x) => x.id !== id));
            return true;
          }}
        />
        <output data-testid="asked">{asked}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const tab = c.getByRole("tab", { name: /Rapport T3/ });
    await expect(tab).toHaveAccessibleName("Rapport T3 (modifié)");
    const dot = tab.querySelector<HTMLElement>("[data-dirty]")!;
    await expect(dot).toBeVisible();
    await expect(c.queryByRole("button", { name: "Fermer la vue Rapport T3" })).toBeNull();
    await userEvent.hover(tab);
    const close = await waitFor(() => c.getByRole("button", { name: "Fermer la vue Rapport T3" }));
    await expect(dot).not.toBeVisible();
    await userEvent.click(close);
    await waitFor(() => expect(c.getByTestId("asked").textContent).toBe("1"));
    await expect(c.getByRole("tab", { name: /Rapport T3/ })).toBeVisible();
    // Clavier : Suppr passe aussi par `onClose`.
    await userEvent.unhover(tab);
    tab.focus();
    await userEvent.keyboard("{Delete}");
    await waitFor(() => expect(c.queryByRole("tab", { name: /Rapport T3/ })).toBeNull());
  },
};
