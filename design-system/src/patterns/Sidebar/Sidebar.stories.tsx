import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Sidebar } from "./Sidebar";
import { Menu } from "../../components/Menu/Menu";
import { MoreHorizontal, Plus } from "../../icons";

const meta: Meta<typeof Sidebar> = {
  title: "Patterns/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
  beforeEach: () => {
    // Chaque story part d'un état mémorisé vide.
    for (const k of Object.keys(localStorage)) if (k.startsWith("storybook:sidebar")) localStorage.removeItem(k);
  },
};
export default meta;
type Story = StoryObj<typeof Sidebar>;
const body = () => within(document.body);

const Doc = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
  </svg>
);

function Demo({ initial = "home" }: { initial?: string }) {
  const [sel, setSel] = useState(initial);
  return (
    <div className="flex h-[640px]">
      <div className="w-(--side-w) border-r border-line">
        <Sidebar
          selectedId={sel}
          onSelectionChange={setSel}
          account={
            <Sidebar.Account
              name="Camille Martin"
              detail="Admin"
              onSettings={() => setSel("settings")}
              menu={
                <>
                  <Menu.Item label="Profil" />
                  <Menu.Item label="Changer de compte" />
                  <Menu.Separator />
                  <Menu.Item label="Se déconnecter" />
                </>
              }
            />
          }
        >
          <Sidebar.Item id="home" icon={<Doc />} label="Accueil" />
          <Sidebar.Item
            id="docs"
            icon={<Doc />}
            label="Documents"
            actions={[
              { icon: <Plus />, label: "Nouveau document" },
              { icon: <MoreHorizontal />, label: "Plus d'actions", menu: <Menu.Item label="Importer" /> },
            ]}
          >
            <Sidebar.Item id="rep" label="Rapports" count={12} />
            <Sidebar.Item id="mod" label="Modèles" />
          </Sidebar.Item>
          <Sidebar.Item id="valid" icon={<Doc />} label="À valider" count={3} />
          <Sidebar.Item id="arch" icon={<Doc />} label="Archives" indicator="locked" />
          <Sidebar.Section id="todo" title="À traiter" limit={3}>
            <Sidebar.TreeItem id="t1" title="Relance fournisseur" subtitle="Validation du devis attendue" meta="Achats" status="warning" actions={<Menu.Item label="Archiver" />}>
              <Sidebar.TreeItem id="t1a" title="Devis Atelier Nord" subtitle="Envoyé le 12 nov." meta="Achats" unread />
              <Sidebar.TreeItem id="t1b" title="Devis Méca Services" subtitle="Reçu le 14 nov." meta="Achats" />
            </Sidebar.TreeItem>
            <Sidebar.TreeItem id="t2" title="Clôture mensuelle" subtitle="3 écritures à vérifier" meta="Compta" />
            <Sidebar.TreeItem id="t3" title="Arrivée de Camille" subtitle="Accès à créer" meta="RH" unread />
            <Sidebar.TreeItem id="t4" title="Contrat de maintenance" subtitle="Échéance le 30 nov." meta="Juridique" />
            <Sidebar.TreeItem id="t5" title="Inventaire annuel" subtitle="Planifié le 15 déc." meta="Logistique" />
          </Sidebar.Section>
        </Sidebar>
      </div>
      <output data-testid="sel" className="p-4 text-fg-2">{sel}</output>
    </div>
  );
}
const sel = (c: HTMLElement) => within(c).getByTestId("sel").textContent;

export const ParDefaut: Story = { render: () => <Demo /> };

/** Un clic sélectionne et change de page ; cliquer l'élément sélectionné ne fait rien (D-039). */
export const Selection: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("row", { name: /À valider/ }));
    await expect(sel(canvasElement)).toBe("valid");
    await expect(c.getByRole("row", { name: /À valider/ })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowUp}{Enter}");
    await expect(sel(canvasElement)).toBe("docs");
  },
};

/** Une section se replie au clic sur son titre ; état mémorisé (D-007). */
export const Sections: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("row", { name: /Clôture mensuelle/ })).toBeVisible();
    await userEvent.click(c.getByRole("row", { name: /^À traiter/ }));
    await waitFor(() => expect(c.queryByRole("row", { name: /Clôture mensuelle/ })).toBeNull());
    await expect(localStorage.getItem("storybook:sidebar:open")).toContain('"todo":false');
  },
};

/** Ligne résumé sous un parent replié ; un clic la déplie ; trait et coude (D-042, D-043). */
export const Enfants: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const summary = c.getByRole("row", { name: /2 éléments/ });
    await expect(summary).toHaveTextContent("1 non lu");
    await userEvent.click(summary);
    await waitFor(() => expect(c.getByRole("row", { name: /Devis Atelier Nord/ })).toBeVisible());
    await expect(c.queryByRole("row", { name: /2 éléments/ })).toBeNull();
  },
};

/** Sous-pages : le chevron déplie sans sélectionner ; le parent d'une sous-page sélectionnée reste déplié (D-056). */
export const SousPages: Story = {
  render: () => <Demo initial="rep" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("row", { name: /Rapports/ })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(c.getByRole("button", { name: /Replier Documents/ }));
    await waitFor(() => expect(c.queryByRole("row", { name: /Modèles/ })).toBeNull());
    await expect(sel(canvasElement)).toBe("rep");
  },
};

/** Actions au survol, deux au plus ; le compteur laisse sa place (D-053, D-054, D-055). */
export const ActionsAuSurvol: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const docs = c.getByRole("row", { name: /^Documents/ });
    await expect(within(docs).getByRole("button", { name: "Nouveau document", hidden: true })).not.toBeVisible();
    await userEvent.hover(docs);
    await waitFor(() => expect(within(docs).getByRole("button", { name: "Nouveau document" })).toBeVisible());
    const lock = c.getByRole("img", { name: "Lecture seule" });
    await expect(lock).toBeVisible();
    // L'indicateur a son info-bulle (D-055).
    await userEvent.hover(lock);
    await waitFor(() => expect(body().getByRole("tooltip")).toHaveTextContent("Lecture seule"), { timeout: 1500 });
  },
};

/** Section longue : « Afficher plus (n) », puis « Afficher moins » (D-045). */
export const SectionLongue: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("row", { name: /Inventaire annuel/ })).toBeNull();
    await userEvent.click(c.getByRole("row", { name: /Afficher plus \(2\)/ }));
    await waitFor(() => expect(c.getByRole("row", { name: /Inventaire annuel/ })).toBeVisible());
    await expect(c.getByRole("row", { name: /Afficher moins/ })).toBeVisible();
  },
};

/** Menu du compte et réglages (D-046). */
export const Compte: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Camille Martin/ }));
    await waitFor(() => expect(body().getByRole("menuitem", { name: "Se déconnecter" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await userEvent.click(c.getByRole("button", { name: "Réglages" }));
    await expect(sel(canvasElement)).toBe("settings");
  },
};
