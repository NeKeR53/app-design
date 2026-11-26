/*
 * Recette « File de tri » (D-408). Doc : TriageQueue.recipe.md.
 * Vues « À trier » et « Traitées » ; la file en ListPage (`layout="list"`, `advanceOnRemove`) ; l'élément sélectionné
 * dans le panneau de détail, avec les décisions de tri. Une demande traitée quitte la file : la suivante s'ouvre.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DropdownMenu } from "../../components/DropdownMenu/DropdownMenu";
import type { StatusMap } from "../../components/FormattedValue/FormattedValue";
import { List } from "../../components/List/List";
import { Check, ChevronDown, Clock, Pencil } from "../../icons";
import { Drawer } from "../../patterns/Drawer/Drawer";
import { ListPage } from "../../templates/ListPage/ListPage";
import { RecipeShell, resetStoredState } from "../../../.storybook/recipe-shell";
import { Inbox, Reply } from "../../../.storybook/story-icons";

/* ---------- Données factices ---------- */

interface Demande {
  id: string;
  objet: string;
  demandeur: string;
  type: string;
  priorite: string;
  recue: string;
  message: string;
  assignee: string | null;
  traitee: boolean;
}

const PRIORITES: StatusMap = {
  haute: { label: "Haute", tone: "danger" },
  normale: { label: "Normale", tone: "neutral" },
  basse: { label: "Basse", tone: "info" },
};
const TYPES = [
  { id: "incident", label: "Incident" },
  { id: "question", label: "Question" },
  { id: "commande", label: "Commande" },
];
const ago = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

const DEMANDES: Demande[] = [
  { id: "R-318", objet: "Écran qui scintille en salle B", demandeur: "Hugo Petit", type: "incident", priorite: "haute", recue: ago(2), message: "L'écran de la salle B scintille depuis ce matin, la réunion de 14 h a lieu dans cette salle.", assignee: null, traitee: false },
  { id: "R-317", objet: "Accès au partage commun", demandeur: "Inès Moreau", type: "question", priorite: "normale", recue: ago(3), message: "Je n'arrive plus à ouvrir le dossier Clients du partage commun depuis la mise à jour.", assignee: null, traitee: false },
  { id: "R-316", objet: "Commande de badges pour les stagiaires", demandeur: "Sarah Lefèvre", type: "commande", priorite: "normale", recue: ago(5), message: "Trois stagiaires arrivent lundi : il leur faut un badge d'accès.", assignee: "Tom Faure", traitee: false },
  { id: "R-315", objet: "Licence du logiciel de dessin", demandeur: "Léa Garnier", type: "commande", priorite: "basse", recue: ago(9), message: "Ma licence expire à la fin du mois.", assignee: null, traitee: false },
  { id: "R-314", objet: "Imprimante du 2e étage", demandeur: "Tom Faure", type: "incident", priorite: "normale", recue: ago(20), message: "Bourrage papier à chaque impression recto verso.", assignee: null, traitee: false },
  { id: "R-313", objet: "Mot de passe expiré", demandeur: "Hugo Petit", type: "question", priorite: "haute", recue: ago(26), message: "Mon mot de passe a expiré et le lien de réinitialisation ne marche pas.", assignee: null, traitee: false },
  { id: "R-312", objet: "Nouveau poste pour l'accueil", demandeur: "Inès Moreau", type: "commande", priorite: "normale", recue: ago(30), message: "Le poste de l'accueil a plus de six ans ; il faudrait le remplacer.", assignee: null, traitee: false },
  { id: "R-311", objet: "Réservation de la grande salle", demandeur: "Sarah Lefèvre", type: "question", priorite: "basse", recue: ago(50), message: "Peut-on réserver la grande salle le 12 décembre au soir ?", assignee: null, traitee: false },
  { id: "R-310", objet: "Clavier en panne", demandeur: "Léa Garnier", type: "incident", priorite: "basse", recue: ago(70), message: "Plusieurs touches ne répondent plus.", assignee: null, traitee: false },
  { id: "R-309", objet: "Mise à jour du site", demandeur: "Tom Faure", type: "question", priorite: "normale", recue: ago(120), message: "Les horaires de fin d'année sont à mettre en ligne.", assignee: "Camille Martin", traitee: true },
];

/* ---------- La page ---------- */

function TriageQueue({ empty = false, initialSelected = "R-318" }: { empty?: boolean; initialSelected?: string | null }) {
  const [view, setView] = useState("a-trier");
  const [all, setAll] = useState<Demande[]>(empty ? DEMANDES.map((d) => ({ ...d, traitee: true })) : DEMANDES);
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const todo = view === "a-trier";
  const rows = all.filter((d) => d.traitee !== todo);
  const current = all.find((d) => d.id === selected) ?? null;
  const update = (id: string, change: Partial<Demande>) => setAll((list) => list.map((d) => (d.id === id ? { ...d, ...change } : d)));

  const panel = (
    <Drawer
      {...(current
        ? {
            header: {
              title: current.objet,
              subtitle: `${TYPES.find((t) => t.id === current.type)?.label} · ${current.demandeur}`,
              status: PRIORITES[current.priorite]!,
              actions: current.traitee
                ? [{ id: "rouvrir", label: "Remettre à trier", icon: <Clock />, primary: true, onPress: () => update(current.id, { traitee: false }) }]
                : [
                    { id: "traiter", label: "Traiter", icon: <Check />, primary: true, onPress: () => update(current.id, { traitee: true }) },
                    { id: "repondre", label: "Répondre", icon: <Reply />, onPress: () => undefined },
                    { id: "reporter", label: "Reporter à demain", onPress: () => undefined },
                  ],
            },
            sections: [
              { id: "demande", title: "Demande", content: current.message },
              {
                id: "tri",
                title: "Tri",
                summary: current.assignee ? "Assignée" : "À assigner",
                fields: [
                  {
                    label: "Priorité",
                    value: current.priorite,
                    type: "status" as const,
                    statuses: PRIORITES,
                    action: {
                      type: "icon" as const,
                      icon: <ChevronDown />,
                      label: "Changer la priorité",
                      menu: (
                        <DropdownMenu.Section selectionMode="single" selectedKeys={[current.priorite]} onSelectionChange={(keys) => update(current.id, { priorite: String([...keys][0]) })}>
                          {Object.entries(PRIORITES).map(([id, p]) => (
                            <DropdownMenu.Item key={id} id={id} label={p.label} />
                          ))}
                        </DropdownMenu.Section>
                      ),
                    },
                  },
                  { label: "Type", value: TYPES.find((t) => t.id === current.type)?.label },
                  { label: "Assignée à", value: current.assignee, action: { type: "icon" as const, icon: <Pencil />, label: "Changer la personne assignée", onPress: () => undefined } },
                  { label: "Reçue", value: current.recue, type: "relative" as const },
                ],
              },
              {
                id: "historique",
                title: "Historique",
                summary: "2 événements",
                defaultCollapsed: true,
                content: (
                  <List
                    label="Historique"
                    selectionMode="none"
                    dividers={false}
                    items={[
                      { id: "1", title: "Demande reçue", meta: "il y a 2 h" },
                      { id: "2", title: "Accusé de réception envoyé", meta: "il y a 2 h" },
                    ]}
                  />
                ),
              },
            ],
          }
        : {})}
      emptyMessage={todo && rows.length === 0 ? "Rien à trier." : "Sélectionnez une demande pour la trier."}
    />
  );

  return (
    <RecipeShell
      page="demandes"
      pageTitle="Demandes"
      queueCount={all.filter((d) => !d.traitee).length}
      views={[
        { id: "a-trier", label: "À trier" },
        { id: "traitees", label: "Traitées" },
      ]}
      activeView={view}
      onViewChange={(id) => {
        setView(id);
        setSelected(null);
      }}
      detail={panel}
      isDetailOpen
    >
      <ListPage<Demande>
        title={todo ? "À trier" : "Traitées"}
        description={todo ? "Les demandes reçues, à traiter de la plus urgente à la plus récente." : "Les demandes déjà traitées."}
        rows={rows}
        columns={[
          { id: "objet", label: "Objet" },
          { id: "demandeur", label: "Demandeur" },
          { id: "recue", label: "Reçue", type: "relative" },
          { id: "priorite", label: "Priorité", type: "status", statuses: PRIORITES },
          { id: "type", label: "Type", value: (d) => TYPES.find((t) => t.id === d.type)?.label },
        ]}
        layout="list"
        item={{ title: "objet", subtitle: "demandeur", meta: "recue", status: "priorite" }}
        search={{ label: "les demandes" }}
        filters={[
          { id: "type", label: "Type", allLabel: "Tous les types", options: TYPES },
          { id: "priorite", label: "Priorité", allLabel: "Toutes les priorités", options: Object.entries(PRIORITES).map(([id, p]) => ({ id, label: p.label })) },
        ]}
        rowActions={(d) => (d.traitee ? [] : [{ id: "traiter", label: "Traiter", icon: <Check />, onPress: () => update(d.id, { traitee: true }) }])}
        selectedId={selected}
        onSelect={(d) => setSelected(d?.id ?? null)}
        advanceOnRemove
        empty={todo ? { title: "Rien à trier", description: "Les nouvelles demandes arrivent ici.", icon: <Inbox /> } : { title: "Aucune demande traitée" }}
      />
    </RecipeShell>
  );
}

/* ---------- Stories ---------- */

const meta: Meta<typeof TriageQueue> = {
  title: "Recettes/File de tri",
  component: TriageQueue,
  parameters: { layout: "fullscreen" },
  beforeEach: resetStoredState,
};
export default meta;
type Story = StoryObj<typeof TriageQueue>;

/** Référence (captures) : la file à gauche, la demande sélectionnée et ses décisions dans le panneau. */
export const Reference: Story = {};

/** Traiter une demande : elle quitte la file, la suivante s'ouvre aussitôt dans le panneau (D-415). */
export const TraiterPuisSuivante: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const panel = () => within(c.getByRole("complementary", { name: "Détail" }));
    await expect(panel().getByRole("heading", { name: "Écran qui scintille en salle B" })).toBeVisible();
    await userEvent.click(panel().getByRole("button", { name: "Traiter" }));
    await waitFor(() => expect(panel().getByRole("heading", { name: "Accès au partage commun" })).toBeVisible());
    await expect(c.queryByText("Écran qui scintille en salle B")).toBeNull();
    // Le compteur de l'entrée « Demandes » suit la file.
    await expect(c.getByRole("row", { name: /^Demandes/ })).toHaveTextContent("8");
  },
};

/** File vide : « Rien à trier » ; le panneau le dit aussi. */
export const RienATrier: Story = {
  args: { empty: true, initialSelected: null },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("heading", { name: "Rien à trier" })).toBeVisible();
  },
};
