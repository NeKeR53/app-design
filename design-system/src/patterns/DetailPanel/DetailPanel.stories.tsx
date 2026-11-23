import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../../components/Button/Button";
import { DetailPanel, type DetailHeader, type DetailSection } from "./DetailPanel";
import type { Action } from "../ActionBar/ActionBar";
import { Copy } from "../../../.storybook/story-icons";

const svg = (d: string) => () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d={d} />
  </svg>
);
const Pencil = svg("M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z");
const Download = svg("M12 3v12m0 0-4-4m4 4 4-4M4 21h16");
const Plus = svg("M12 5v14M5 12h14");

const meta: Meta<typeof DetailPanel> = {
  title: "Patterns/DetailPanel",
  component: DetailPanel,
  parameters: { layout: "padded" },
  beforeEach: () => {
    for (const k of Object.keys(localStorage)) if (k.startsWith("storybook:detail")) localStorage.removeItem(k);
  },
};
export default meta;
type Story = StoryObj<typeof DetailPanel>;

export function DemoDetail() {
  const [pub, setPub] = useState(false);
  return (
    <DetailPanel>
      <DetailPanel.Section id="props" title="Propriétés">
        <DetailPanel.Row label="Statut" value="En relecture" />
        <DetailPanel.Row label="Responsable" value="Camille Martin" />
        <DetailPanel.Row label="Échéance" value="" action={{ type: "link", label: "Modifier", onPress: () => {} }} />
        <DetailPanel.Row label="Étiquettes" value="Ventes, Région Sud-Ouest, Trimestriel" />
      </DetailPanel.Section>
      <DetailPanel.Section id="share" title="Partage">
        <DetailPanel.Row label="Lien public" value={pub ? "Activé" : "Désactivé"} action={{ type: "switch", isSelected: pub, onChange: setPub }} />
        <DetailPanel.Row label="Identifiant" value="DOC-2026-0412" icon={<Copy />} action={{ type: "icon", icon: <Copy />, label: "Copier l'identifiant", onPress: () => {} }} />
        <DetailPanel.Row label="Accès" value="3 personnes" />
      </DetailPanel.Section>
      <DetailPanel.Section id="files" title="Fichiers" footer={<Button size="sm">Exporter l'historique</Button>}>
        <DetailPanel.Row label="Pièces jointes" value="2 fichiers" details={<ul className="m-0 list-none p-0"><li>synthese.pdf — 1,8 Mo</li><li>annexes.xlsx — 2,4 Mo</li></ul>} />
      </DetailPanel.Section>
    </DetailPanel>
  );
}

export const ParDefaut: Story = { render: () => <div className="w-[300px] border border-line"><DemoDetail /></div> };

export const Vide: Story = { render: () => <div className="w-[300px] border border-line"><DetailPanel /></div> };

/** Un réglage s'applique tout de suite (D-007) ; valeur vide « — » ; icônes alignées par section (D-057). */
export const ActionImmediate: Story = {
  render: ParDefaut.render!,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("switch", { name: "Lien public" }));
    await expect(c.getByText("Activé")).toBeVisible();
    await expect(c.getByText("—")).toBeVisible();
    const lab = (t: string) => c.getByText(t, { selector: "dt" }).getBoundingClientRect().left;
    await expect(lab("Accès")).toBe(lab("Identifiant"));
  },
};

/** Sections repliables, état mémorisé (D-061). */
export const Sections: Story = {
  render: ParDefaut.render!,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Propriétés/ }));
    await waitFor(() => expect(c.queryByText("Camille Martin")).toBeNull());
    await expect(localStorage.getItem("storybook:detail:sections")).toContain('"props":true');
  },
};

/** Ligne qui s'ouvre sur place (D-060). */
export const LigneDepliable: Story = {
  render: ParDefaut.render!,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const row = c.getByRole("button", { name: /Pièces jointes/ });
    await expect(row).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(row);
    await expect(row).toHaveAttribute("aria-expanded", "true");
    await expect(c.getByText(/synthese.pdf/)).toBeVisible();
  },
};

/* ---------- Forme déclarative (D-180 à D-185) ---------- */

const CLIENT = {
  nom: "Atelier Lemoine et fils, menuiserie",
  ville: "Nantes · client depuis 2019",
  encours: 12480,
  debut: "2019-03-14",
  mail: "contact@lemoine.example",
  fax: "",
  code: "CLI-00412",
  tags: ["Bois", "Grands comptes"],
  notes: "",
};

function clientPanel(log: (s: string) => void = () => {}): { header: DetailHeader; sections: DetailSection[] } {
  const actions: Action[] = [
    { id: "edit", label: "Modifier", icon: <Pencil />, onPress: () => log("Modifier") },
    { id: "pdf", label: "Exporter en PDF", icon: <Download />, onPress: () => new Promise((r) => setTimeout(r, 50)).then(() => log("Exporter en PDF")) },
    { id: "mail", label: "Envoyer un courriel", onPress: () => log("Envoyer un courriel") },
    { id: "del", label: "Supprimer le client", danger: true, onPress: () => log("Supprimer") },
  ];
  return {
    header: { title: CLIENT.nom, subtitle: CLIENT.ville, status: { label: "Actif", tone: "success" }, actions },
    sections: [
      {
        id: "infos",
        title: "Informations",
        fields: [
          { label: "Encours", value: CLIENT.encours, type: "money" },
          { label: "Client depuis", value: CLIENT.debut, type: "date" },
          { label: "Courriel", value: CLIENT.mail, type: "email" },
          { label: "Fax", value: CLIENT.fax, hideEmpty: true },
          { label: "Code", value: CLIENT.code, type: "code", action: { type: "icon", icon: <Copy />, label: "Copier le code", onPress: () => log("Copier") } },
          { label: "Étiquettes", value: CLIENT.tags, type: "tags" },
          { label: "Relance", value: null },
        ],
      },
      {
        id: "histo",
        title: "Historique",
        summary: { label: "2 en retard", tone: "warning" },
        actions: [{ id: "add", label: "Ajouter une facture", icon: <Plus />, onPress: () => log("Ajouter une facture") }],
        fields: [
          { label: "F-2026-118", value: "1 200,00 € · échue le 2 nov." },
          { label: "F-2026-131", value: "860,00 € · échue le 15 nov." },
        ],
      },
      { id: "notes", title: "Notes", content: CLIENT.notes, empty: "Aucune note", defaultCollapsed: true },
      { id: "desc", title: "Description", content: "Atelier familial.\nTrois sites en Loire-Atlantique." },
    ],
  };
}

const frame = (node: ReactNode) => <div className="h-[560px] w-[320px] overflow-auto border border-line">{node}</div>;

export const Declaratif: Story = {
  render: () => frame(<DetailPanel {...clientPanel()} />),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { level: 2, name: CLIENT.nom })).toBeVisible();
    await expect(c.getByText("Actif")).toBeVisible();
    await expect(c.getByText("Nantes · client depuis 2019")).toBeVisible();
    // hideEmpty retire « Fax » ; une valeur vide sans hideEmpty affiche « — ».
    await expect(c.queryByText("Fax")).toBeNull();
    await expect(c.getByText("Relance", { selector: "dt" })).toBeVisible();
    await expect(c.getByText("Étiquettes", { selector: "dt" })).toBeVisible();
    // Section sans champ ni contenu : texte vide ; texte libre : paragraphe.
    await expect(c.getByText(/Trois sites/)).toBeVisible();
    await expect(c.getByRole("button", { name: /Notes/ })).toHaveAttribute("aria-expanded", "false");
  },
};

export const DeclaratifActions: Story = {
  render: function Render() {
    const [done, setDone] = useState<string[]>([]);
    return (
      <div>
        {frame(<DetailPanel {...clientPanel()} onActionDone={(a) => setDone((d) => [...d, a.label])} />)}
        <p className="mt-2 text-sm text-fg-2" data-testid="done">{done.join(" | ")}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const head = c.getByRole("group", { name: `Actions sur ${CLIENT.nom}` });
    // Zone section : 2 icônes au plus, le reste dans « … ».
    await expect(within(head).getByRole("button", { name: "Modifier" })).toBeVisible();
    await expect(within(head).getByRole("button", { name: "Exporter en PDF" })).toBeVisible();
    await expect(within(head).getByRole("button", { name: "Plus d'actions" })).toBeVisible();
    await userEvent.click(within(head).getByRole("button", { name: "Exporter en PDF" }));
    await waitFor(() => expect(c.getByTestId("done")).toHaveTextContent("Exporter en PDF"));
    const sec = c.getByRole("group", { name: "Actions sur Historique" });
    await userEvent.click(within(sec).getByRole("button", { name: "Ajouter une facture" }));
    await waitFor(() => expect(c.getByTestId("done")).toHaveTextContent("Ajouter une facture"));
  },
};

export const DeclaratifReplie: Story = {
  render: () => frame(<DetailPanel {...clientPanel()} />),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const notes = c.getByRole("button", { name: /Notes/ });
    await expect(c.queryByText("Aucune note")).toBeNull();
    await userEvent.click(notes);
    await expect(c.getByText("Aucune note")).toBeVisible();
    await expect(localStorage.getItem("storybook:detail:sections")).toContain('"notes":false');
    // Le résumé reste lisible, section repliée.
    await userEvent.click(c.getByRole("button", { name: /Historique/ }));
    await waitFor(() => expect(c.queryByText("F-2026-118")).toBeNull());
    await expect(c.getByText("2 en retard")).toBeVisible();
  },
};

function EtatsDemo() {
  const [state, setState] = useState<"loading" | "error" | "notfound" | "empty" | "reload" | "stale">("loading");
  const data = clientPanel();
  const props =
    state === "loading" ? { isLoading: true } :
    state === "error" ? { hasError: true, onRetry: () => setState("reload") } :
    state === "notfound" ? { isNotFound: true } :
    state === "empty" ? { emptyMessage: "Aucun client sélectionné." } :
    state === "reload" ? { ...data, isLoading: true } :
    { ...data, hasError: true, onRetry: () => setState("reload") };
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1">
        {(["loading", "error", "notfound", "empty", "reload", "stale"] as const).map((s) => (
          <Button key={s} size="sm" onPress={() => setState(s)}>{s}</Button>
        ))}
      </div>
      {frame(<DetailPanel {...props} />)}
    </div>
  );
}

export const DeclaratifEtats: Story = {
  render: () => <EtatsDemo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByRole("status", { name: "Chargement…" })).toBeInTheDocument());
    await userEvent.click(c.getByRole("button", { name: "error" }));
    await expect(c.getByRole("alert")).toHaveTextContent("Impossible de charger le détail");
    await userEvent.click(c.getByRole("button", { name: "Réessayer" }));
    // Rechargement avec données : barre fine, données gardées.
    await expect(c.getByRole("progressbar")).toBeInTheDocument();
    await expect(c.getByRole("heading", { level: 2, name: CLIENT.nom })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "stale" }));
    await expect(c.getByRole("alert")).toHaveTextContent("Le détail n'a pas pu être mis à jour.");
    await expect(c.getByRole("heading", { level: 2, name: CLIENT.nom })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "notfound" }));
    await expect(c.getByText("Élément introuvable")).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "empty" }));
    await expect(c.getByText("Aucun client sélectionné.")).toBeVisible();
  },
};
