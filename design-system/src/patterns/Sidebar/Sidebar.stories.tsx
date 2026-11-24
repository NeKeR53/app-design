import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Sidebar } from "./Sidebar";
import { DropdownMenu } from "../../components/DropdownMenu/DropdownMenu";
import { ArrowDownToLine, MoreHorizontal, Plus } from "../../icons";

const archived = fn();

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

/** Appui long au doigt : `pointerdown` tactile, 600 ms d'attente, puis `pointerup` (D-007). */
async function longPress(el: Element) {
  const r = el.getBoundingClientRect();
  const init = { bubbles: true, cancelable: true, pointerId: 7, pointerType: "touch", isPrimary: true, button: 0, clientX: r.left + 10, clientY: r.top + r.height / 2 };
  el.dispatchEvent(new PointerEvent("pointerdown", { ...init, buttons: 1 }));
  await new Promise((done) => setTimeout(done, 600));
  el.dispatchEvent(new PointerEvent("pointerup", init));
}

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
                  <DropdownMenu.Item label="Profil" />
                  <DropdownMenu.Item label="Changer de compte" />
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item label="Se déconnecter" />
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
              { icon: <MoreHorizontal />, label: "Plus d'actions", menu: <DropdownMenu.Item label="Importer" /> },
            ]}
          >
            <Sidebar.Item id="rep" label="Rapports" count={12} />
            <Sidebar.Item id="mod" label="Modèles" />
          </Sidebar.Item>
          <Sidebar.Item id="valid" icon={<Doc />} label="À valider" count={3} />
          <Sidebar.Item id="arch" icon={<Doc />} label="Archives" indicator="locked" />
          <Sidebar.Section id="todo" title="À traiter" limit={3}>
            <Sidebar.TreeItem id="t1" title="Relance fournisseur" subtitle="Validation du devis attendue" meta="Achats" status="warning" actions={<DropdownMenu.Item label="Archiver" />}>
              <Sidebar.TreeItem id="t1a" title="Devis Atelier Nord" subtitle="Envoyé le 12 nov." meta="Achats" unread />
              <Sidebar.TreeItem id="t1b" title="Devis Méca Services" subtitle="Reçu le 14 nov." meta="Achats" />
            </Sidebar.TreeItem>
            <Sidebar.TreeItem id="t2" title="Clôture mensuelle" subtitle="3 écritures à vérifier" meta="Compta" actions={<DropdownMenu.Item label="Archiver" />} />
            <Sidebar.TreeItem id="t3" title="Arrivée de Camille" subtitle="Accès à créer" meta="RH" unread quickActions={[{ icon: <ArrowDownToLine />, label: "Archiver Arrivée de Camille", onPress: archived }]} />
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

/**
 * La hauteur d'une ligne ne change ni au survol, ni au focus, ni à la sélection, même quand le « … »
 * de 22 px apparaît (D-368). L'icône du « … » s'aligne sur l'étiquette de la ligne 2.
 */
export const HauteurStable: Story = {
  render: () => <Demo />,
  // Densité « desktop » : la ligne y est au plus juste, le « … » la faisait grandir.
  globals: { density: "desktop" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const height = (el: Element) => el.getBoundingClientRect().height;
    // Une ligne avec icône d'état, une ligne sans : même hauteur au repos.
    const warn = c.getByRole("row", { name: /^Relance fournisseur/ });
    const row = c.getByRole("row", { name: /^Clôture mensuelle/ });
    const docs = c.getByRole("row", { name: /^Documents/ });
    const h = height(row);
    const hDocs = height(docs);
    await expect(height(warn)).toBe(h);
    const more = within(row).getByRole("button", { name: "Actions sur Clôture mensuelle", hidden: true });
    await expect(more).not.toBeVisible();
    // Survol : le « … » apparaît, la ligne garde sa hauteur.
    await userEvent.hover(row);
    await waitFor(() => expect(more).toBeVisible());
    await expect(height(row)).toBe(h);
    // L'icône (14 px, centrée dans 22 px) finit au même bord que l'étiquette de la ligne 2.
    const glyphRight = more.getBoundingClientRect().right - 4;
    await expect(Math.abs(glyphRight - within(row).getByText("Compta").getBoundingClientRect().right)).toBeLessThanOrEqual(1);
    await userEvent.hover(warn);
    await waitFor(() => expect(within(warn).getByRole("button", { name: "Actions sur Relance fournisseur" })).toBeVisible());
    await expect(height(warn)).toBe(h);
    // Ligne d'une ligne, avec deux actions : même règle.
    await userEvent.hover(docs);
    await waitFor(() => expect(within(docs).getByRole("button", { name: "Nouveau document" })).toBeVisible());
    await expect(height(docs)).toBe(hDocs);
    // Sélection, puis focus clavier sur la ligne voisine : même hauteur.
    await userEvent.click(row);
    await expect(row).toHaveAttribute("aria-selected", "true");
    await userEvent.unhover(row);
    // Sélectionné sans survol : les actions se cachent, l'état reste lisible (D-386).
    await expect(more).not.toBeVisible();
    await expect(height(row)).toBe(h);
    await userEvent.keyboard("{ArrowUp}");
    await expect(height(row)).toBe(h);
  },
};

/** Action rapide en bouton-icône, sans menu « … » : visible au survol, la ligne garde sa hauteur (D-381). */
export const ActionRapide: Story = {
  render: () => <Demo />,
  globals: { density: "desktop" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const row = c.getByRole("row", { name: /^Arrivée de Camille/ });
    const h = row.getBoundingClientRect().height;
    const archive = within(row).getByRole("button", { name: "Archiver Arrivée de Camille", hidden: true });
    await expect(archive).not.toBeVisible();
    await userEvent.hover(row);
    await waitFor(() => expect(archive).toBeVisible());
    await expect(row.getBoundingClientRect().height).toBe(h);
    await expect(within(row).queryByRole("button", { name: /^Actions sur/ })).toBeNull();
    await userEvent.click(archive);
    await expect(archived).toHaveBeenCalled();
  },
};

/** Élément sur deux lignes au travail : le point vert « En cours » de Sidebar.Item (D-385). */
export const EnCours: Story = {
  render: () => (
    <div className="h-[240px] w-(--side-w)">
      <Sidebar selectedId="a" onSelectionChange={() => {}} account={<Sidebar.Account name="Camille Martin" onSettings={() => {}} />}>
        <Sidebar.Section id="conv" title="Conversations">
          <Sidebar.TreeItem id="a" title="Analyse des logs" subtitle="Claude Code" indicator="activity" />
          <Sidebar.TreeItem id="b" title="Module Prefect" subtitle="Codex" status="warning" />
          <Sidebar.TreeItem id="c" title="Tickets en onglets" subtitle="Claude Code" unread />
        </Sidebar.Section>
      </Sidebar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const row = c.getByRole("row", { name: /^Analyse des logs/ });
    await expect(row.querySelector(".bg-success")).not.toBeNull();
    await expect(c.getByRole("row", { name: /^Module Prefect/ }).querySelector(".bg-success")).toBeNull();
  },
};

const created = fn();

/** « + » sur le titre d'une section : au survol seulement, il ne replie pas la section (D-392). */
export const ActionDeSection: Story = {
  render: () => (
    <div className="h-[240px] w-(--side-w)">
      <Sidebar selectedId="a" onSelectionChange={() => {}} account={<Sidebar.Account name="Camille Martin" onSettings={() => {}} />}>
        <Sidebar.Section id="conv" title="Conversations" actions={[{ icon: <Plus />, label: "Nouvelle conversation", onPress: created }]}>
          <Sidebar.TreeItem id="a" title="Analyse des logs" subtitle="Claude Code" />
        </Sidebar.Section>
      </Sidebar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const header = c.getByRole("row", { name: /^Conversations/ });
    const plus = within(header).getByRole("button", { name: "Nouvelle conversation", hidden: true });
    await expect(plus).not.toBeVisible();
    await userEvent.hover(header);
    await waitFor(() => expect(plus).toBeVisible());
    await userEvent.click(plus);
    await expect(created).toHaveBeenCalled();
    await expect(c.getByRole("row", { name: /^Analyse des logs/ })).toBeVisible();
  },
};

/** Au survol, les actions prennent la place des signes d'état ; la souris partie, les signes reviennent (D-393). */
export const ActionsALaPlaceDeLEtat: Story = {
  render: () => (
    <div className="h-[200px] w-(--side-w)">
      <Sidebar selectedId="x" onSelectionChange={() => {}} account={<Sidebar.Account name="Camille Martin" onSettings={() => {}} />}>
        <Sidebar.Section id="conv" title="Conversations">
          <Sidebar.TreeItem id="a" title="Analyse des logs" subtitle="Claude Code" indicator="activity" quickActions={[{ icon: <ArrowDownToLine />, label: "Archiver Analyse des logs", onPress: archived }]} actions={<DropdownMenu.Item label="Renommer" />} />
        </Sidebar.Section>
      </Sidebar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByRole("row", { name: /^Analyse des logs/ });
    const dot = row.querySelector<HTMLElement>(".bg-success")!;
    const archive = within(row).getByRole("button", { name: "Archiver Analyse des logs", hidden: true });
    await expect(dot).toBeVisible();
    await expect(archive).not.toBeVisible();
    await userEvent.hover(row);
    await waitFor(() => expect(archive).toBeVisible());
    await expect(dot).not.toBeVisible();
    await userEvent.unhover(row);
    await waitFor(() => expect(dot).toBeVisible());
    await expect(archive).not.toBeVisible();
  },
};

/** Maj+F10 et la touche Menu ouvrent le menu « … » de l'élément ; appui long sur tactile (Sidebar.spec.md). */
export const MenuAuClavierEtAppuiLong: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("row", { name: /^Documents/ }));
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await waitFor(() => expect(body().getByRole("menuitem", { name: "Importer" })).toBeVisible());
    // Le menu ouvert au clavier prend le focus ; Échap le ferme.
    await waitFor(() => expect(body().getByRole("menu")).toContainElement(document.activeElement as HTMLElement));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("menuitem", { name: "Importer" })).toBeNull());
    // TreeItem : menu « Actions sur … ».
    await userEvent.click(within(c.getByRole("row", { name: /^Relance fournisseur/ })).getByText("Relance fournisseur"));
    await userEvent.keyboard("{ContextMenu}");
    await waitFor(() => expect(body().getByRole("menuitem", { name: "Archiver" })).toBeVisible());
    await waitFor(() => expect(body().getByRole("menu")).toContainElement(document.activeElement as HTMLElement));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("menuitem", { name: "Archiver" })).toBeNull());
    // Appui long : le menu s'ouvre, la page ne change pas.
    await longPress(within(c.getByRole("row", { name: /^Relance fournisseur/ })).getByText("Relance fournisseur"));
    await waitFor(() => expect(body().getByRole("menuitem", { name: "Archiver" })).toBeVisible());
    await new Promise((done) => setTimeout(done, 150));
    await expect(c.getByTestId("sel")).toHaveTextContent("t1");
    await userEvent.keyboard("{Escape}");
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

/* ---------- Pied : entrées fixes et espace de travail (D-230 à D-232) ---------- */
const Chat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const WORKSPACES = [
  { id: "atelier", name: "Atelier" },
  { id: "perso", name: "Perso" },
  { id: "asso", name: "Association des parents d'élèves du quartier" },
];

function FooterDemo({ single = false }: { single?: boolean }) {
  const [sel, setSel] = useState("home");
  const [ws, setWs] = useState("atelier");
  const list = single ? WORKSPACES.slice(0, 1) : WORKSPACES;
  return (
    <div className="flex h-[480px]">
      <div className="w-(--side-w) border-r border-line" data-selected-id={sel} data-workspace={ws}>
        <Sidebar
          selectedId={sel}
          onSelectionChange={setSel}
          footer={<Sidebar.Item id="assistant" icon={<Chat />} label="Assistant" indicator="activity" />}
          workspace={
            <Sidebar.Workspace
              workspaces={list}
              currentId={ws}
              onChange={setWs}
              {...(single
                ? {}
                : {
                    actions: (
                      <>
                        <DropdownMenu.Item label="Créer un espace de travail…" icon={<Plus />} />
                        <DropdownMenu.Item label="Ouvrir un autre dossier…" icon={<Doc />} />
                      </>
                    ),
                  })}
            />
          }
          account={<Sidebar.Account name="Camille Martin" detail="Admin" onSettings={() => {}} />}
        >
          <Sidebar.Item id="home" icon={<Doc />} label="Accueil" />
          {Array.from({ length: 14 }, (_, i) => (
            <Sidebar.Item key={i} id={`p${i}`} icon={<Doc />} label={`Page ${i + 1}`} />
          ))}
        </Sidebar>
      </div>
    </div>
  );
}

/** Entrées fixes du bas : hors du défilement, même sélection que la navigation (D-230, D-232). */
export const PiedFixe: Story = {
  render: () => <FooterDemo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const bottom = c.getByRole("treegrid", { name: "Navigation du bas" });
    const main = c.getByRole("treegrid", { name: "Navigation principale" });
    // L'entrée fixe est sous la navigation, au-dessus de l'espace de travail et du compte.
    const assistant = within(bottom).getByRole("row", { name: /Assistant/ });
    await expect(assistant.getBoundingClientRect().top).toBeGreaterThan(main.getBoundingClientRect().bottom - 1);
    await expect(c.getByRole("button", { name: /Espace de travail/ }).getBoundingClientRect().top).toBeGreaterThan(assistant.getBoundingClientRect().top);
    // La navigation défile ; le pied reste visible.
    main.scrollTop = main.scrollHeight;
    await expect(assistant).toBeVisible();
    await userEvent.click(assistant);
    await waitFor(() => expect(canvasElement.querySelector("[data-selected-id]")).toHaveAttribute("data-selected-id", "assistant"));
    await expect(assistant).toHaveAttribute("aria-selected", "true");
    await userEvent.click(c.getByRole("row", { name: /Accueil/ }));
    await expect(assistant).toHaveAttribute("aria-selected", "false");
  },
};

/** Sélecteur d'espace de travail : menu au-dessus, espace courant coché, actions de l'app après un trait (D-231). */
export const EspaceDeTravail: Story = {
  render: () => <FooterDemo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const trigger = c.getByRole("button", { name: "Espace de travail : Atelier. Changer d'espace" });
    // Le nom seul, sans repère d'initiale : l'avatar du compte reste le seul du pied (D-369).
    await expect(trigger).toHaveTextContent(/^Atelier$/);
    await userEvent.click(trigger);
    const menu = await waitFor(() => body().getByRole("menu"));
    await expect(within(menu).getByRole("menuitemradio", { name: "Atelier" })).toHaveAttribute("aria-checked", "true");
    await expect(within(menu).getByRole("menuitem", { name: "Créer un espace de travail…" })).toBeVisible();
    // Le menu s'ouvre au-dessus du bouton.
    await expect(menu.getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger.getBoundingClientRect().top + 1);
    await userEvent.click(within(menu).getByRole("menuitemradio", { name: "Perso" }));
    await waitFor(() => expect(canvasElement.querySelector("[data-workspace]")).toHaveAttribute("data-workspace", "perso"));
    await expect(c.getByRole("button", { name: /Espace de travail : Perso/ })).toBeVisible();
    // Au clavier : flèche bas ouvre, Échap ferme et rend le focus.
    c.getByRole("button", { name: /Espace de travail : Perso/ }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(body().getByRole("menu")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(c.getByRole("button", { name: /Espace de travail : Perso/ })).toHaveFocus());
    // Un clic à côté du menu le ferme.
    await userEvent.click(c.getByRole("button", { name: /Espace de travail : Perso/ }));
    await waitFor(() => expect(body().getByRole("menu")).toBeVisible());
    await userEvent.click(document.body, { pointerEventsCheck: 0 });
    await waitFor(() => expect(body().queryByRole("menu")).toBeNull());
  },
};

/** Un seul espace, sans action : simple étiquette, sans menu (D-231). */
export const EspaceUnique: Story = {
  render: () => <FooterDemo single />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("button", { name: /Espace de travail/ })).toBeNull();
    await expect(c.getByText("Atelier")).toBeVisible();
  },
};

/** Les flèches déplacent le focus sans changer de page ; Entrée sélectionne (Sidebar.spec.md, Clavier). */
export const FlechesSansChangerDePage: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("row", { name: /Accueil/ }));
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(c.getByRole("row", { name: /^Documents/ })).toHaveFocus());
    await expect(sel(canvasElement)).toBe("home");
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(c.getByRole("row", { name: /À valider/ })).toHaveFocus());
    await expect(sel(canvasElement)).toBe("home");
    await expect(c.getByRole("row", { name: /Accueil/ })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Enter}");
    await expect(sel(canvasElement)).toBe("valid");
    await expect(c.getByRole("row", { name: /À valider/ })).toHaveAttribute("aria-selected", "true");
  },
};

/** L'élément de la page courante porte `aria-current="page"`, et lui seul (Sidebar.spec.md, Accessibilité). */
export const PageCourante: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("row", { name: /Accueil/ })).toHaveAttribute("aria-current", "page");
    await expect(canvasElement.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    await userEvent.click(within(c.getByRole("row", { name: /^Relance fournisseur/ })).getByText("Relance fournisseur"));
    await waitFor(() => expect(c.getByRole("row", { name: /^Relance fournisseur/ })).toHaveAttribute("aria-current", "page"));
    await expect(c.getByRole("row", { name: /Accueil/ })).not.toHaveAttribute("aria-current");
    await expect(canvasElement.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  },
};
