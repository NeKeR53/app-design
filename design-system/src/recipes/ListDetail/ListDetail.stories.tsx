/*
 * Recette « Liste et fiche » (D-409). Doc : ListDetail.recipe.md.
 * Un carnet de contacts : la collection en ListPage (tableau, recherche, filtres) sur toute la page ; la fiche de
 * l'élément sélectionné dans le panneau de détail (Drawer déclaratif) ; créer et modifier par une fenêtre courte.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { List } from "../../components/List/List";
import { Copy, Pencil, Plus } from "../../icons";
import { Drawer } from "../../patterns/Drawer/Drawer";
import { ListPage } from "../../templates/ListPage/ListPage";
import { RecipeShell, resetStoredState } from "../../../.storybook/recipe-shell";
import { Mail, Trash, Users } from "../../../.storybook/story-icons";

/* ---------- Données factices ---------- */

interface Contact {
  id: string;
  nom: string;
  societe: string;
  fonction: string;
  email: string;
  telephone: string;
  ville: string;
  etiquettes: string[];
  dernier: string;
  notes: string;
}

const ago = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
const CONTACTS: Contact[] = [
  { id: "c1", nom: "Camille Martin", societe: "Maison Verre", fonction: "Directrice des achats", email: "camille.martin@maisonverre.fr", telephone: "06 12 34 56 78", ville: "Nantes", etiquettes: ["client", "prioritaire"], dernier: ago(2), notes: "Prépare la rénovation de trois boutiques en 2027. Préfère un appel le matin." },
  { id: "c2", nom: "Hugo Petit", societe: "Studio Nord", fonction: "Architecte d'intérieur", email: "hugo@studionord.fr", telephone: "06 98 76 54 32", ville: "Lille", etiquettes: ["prescripteur"], dernier: ago(5), notes: "" },
  { id: "c3", nom: "Inès Moreau", societe: "Hôtel des Arts", fonction: "Responsable technique", email: "i.moreau@hoteldesarts.fr", telephone: "02 40 11 22 33", ville: "Nantes", etiquettes: ["client"], dernier: ago(12), notes: "" },
  { id: "c4", nom: "Sarah Lefèvre", societe: "Lumens & Co", fonction: "Commerciale", email: "sarah@lumens.co", telephone: "01 44 55 66 77", ville: "Paris", etiquettes: ["fournisseur"], dernier: ago(20), notes: "" },
  { id: "c5", nom: "Tom Faure", societe: "Café Lumière", fonction: "Gérant", email: "tom@cafelumiere.fr", telephone: "04 78 90 12 34", ville: "Lyon", etiquettes: ["client"], dernier: ago(33), notes: "" },
  { id: "c6", nom: "Léa Garnier", societe: "Atelier Garnier", fonction: "Designer", email: "lea@ateliergarnier.fr", telephone: "06 11 22 33 44", ville: "Bordeaux", etiquettes: ["prescripteur", "presse"], dernier: ago(41), notes: "" },
  { id: "c7", nom: "Nicolas Roux", societe: "Maison Verre", fonction: "Chef de chantier", email: "n.roux@maisonverre.fr", telephone: "06 55 44 33 22", ville: "Nantes", etiquettes: ["client"], dernier: ago(64), notes: "" },
  { id: "c8", nom: "Julie Bernard", societe: "Électro Ouest", fonction: "Acheteuse", email: "julie.bernard@electro-ouest.fr", telephone: "02 99 88 77 66", ville: "Rennes", etiquettes: ["fournisseur"], dernier: ago(90), notes: "" },
];
const ETIQUETTES = ["client", "prescripteur", "fournisseur", "prioritaire", "presse"];
const SOCIETES = [...new Set(CONTACTS.map((c) => c.societe))].sort();

/* ---------- La page ---------- */

function ListDetail({ rows = CONTACTS, initialSelected = "c1" }: { rows?: Contact[] | undefined; initialSelected?: string | null }) {
  const [contacts, setContacts] = useState(rows);
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const current = contacts?.find((c) => c.id === selected) ?? null;

  const panel = (
    <Drawer
      {...(current
        ? {
            header: {
              title: current.nom,
              subtitle: `${current.fonction} · ${current.societe}`,
              actions: [
                { id: "ecrire", label: "Écrire", icon: <Mail />, onPress: () => undefined },
                { id: "modifier", label: "Modifier", icon: <Pencil />, onPress: () => undefined },
                { id: "supprimer", label: "Supprimer", danger: true, confirm: { title: `Supprimer « ${current.nom} » ?`, message: "Le contact et son historique seront effacés." }, onPress: () => setContacts((all) => all?.filter((c) => c.id !== current.id)) },
              ],
            },
            sections: [
              {
                id: "coordonnees",
                title: "Coordonnées",
                fields: [
                  { label: "E-mail", value: current.email, type: "email" as const, action: { type: "icon" as const, icon: <Copy />, label: "Copier l'e-mail", onPress: () => undefined } },
                  { label: "Téléphone", value: current.telephone },
                  { label: "Ville", value: current.ville },
                ],
              },
              {
                id: "societe",
                title: "Société",
                fields: [
                  { label: "Société", value: current.societe },
                  { label: "Fonction", value: current.fonction },
                  { label: "Étiquettes", value: current.etiquettes, type: "tags" as const },
                ],
              },
              { id: "notes", title: "Notes", ...(current.notes ? { content: current.notes } : {}), empty: "Aucune note" },
              {
                id: "echanges",
                title: "Derniers échanges",
                summary: "3",
                content: (
                  <List
                    label="Derniers échanges"
                    selectionMode="none"
                    dividers={false}
                    items={[
                      { id: "1", title: "Devis des suspensions envoyé", meta: "il y a 2 j" },
                      { id: "2", title: "Appel : choix des finitions", meta: "il y a 9 j" },
                      { id: "3", title: "Visite du showroom", meta: "il y a 3 sem." },
                    ]}
                  />
                ),
              },
            ],
          }
        : {})}
      emptyMessage="Sélectionnez un contact pour voir sa fiche."
    />
  );

  return (
    <RecipeShell page="contacts" pageTitle="Contacts" detail={panel} isDetailOpen>
      <ListPage<Contact>
        title="Contacts"
        description="Clients, prescripteurs et fournisseurs."
        rows={contacts}
        columns={[
          { id: "nom", label: "Nom" },
          { id: "societe", label: "Société" },
          { id: "fonction", label: "Fonction" },
          { id: "email", label: "E-mail", type: "email" },
          { id: "etiquettes", label: "Étiquettes", type: "tags" },
          { id: "dernier", label: "Dernier échange", type: "relative" },
        ]}
        search={{ label: "les contacts" }}
        filters={[
          { id: "societe", label: "Société", allLabel: "Toutes les sociétés", options: SOCIETES.map((s) => ({ id: s, label: s })) },
          { id: "etiquettes", label: "Étiquette", allLabel: "Toutes les étiquettes", options: ETIQUETTES.map((e) => ({ id: e, label: e })) },
        ]}
        actions={[
          { id: "nouveau", label: "Nouveau contact", icon: <Plus />, primary: true, onPress: () => undefined },
          { id: "importer", label: "Importer un fichier…", onPress: () => undefined },
        ]}
        rowActions={(c) => [
          { id: "ecrire", label: `Écrire à ${c.nom}`, icon: <Mail />, onPress: () => undefined },
          { id: "supprimer", label: "Supprimer", icon: <Trash />, danger: true, confirm: { title: `Supprimer « ${c.nom} » ?` }, onPress: () => undefined },
        ]}
        selectedId={selected}
        onSelect={(c) => setSelected(c?.id ?? null)}
        empty={{ title: "Aucun contact", description: "Ajoutez vos clients et vos fournisseurs, ou importez un fichier.", icon: <Users /> }}
      />
    </RecipeShell>
  );
}

/* ---------- Stories ---------- */

const meta: Meta<typeof ListDetail> = {
  title: "Recettes/Liste et fiche",
  component: ListDetail,
  parameters: { layout: "fullscreen" },
  beforeEach: resetStoredState,
};
export default meta;
type Story = StoryObj<typeof ListDetail>;

/** Référence (captures) : le carnet sur toute la page, la fiche du contact sélectionné dans le panneau. */
export const Reference: Story = {};

/** Choisir une ligne montre sa fiche dans le panneau ; la recherche garde la sélection visible. */
export const ChoisirUnContact: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByText("Hugo Petit"));
    const panel = within(c.getByRole("complementary", { name: "Détail" }));
    await waitFor(() => expect(panel.getByRole("heading", { name: "Hugo Petit" })).toBeVisible());
    await expect(panel.getByText("Architecte d'intérieur · Studio Nord")).toBeVisible();
  },
};

/** Carnet vide : l'état vide porte « Nouveau contact ». */
export const Vide: Story = {
  args: { rows: [], initialSelected: null },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { name: "Aucun contact" })).toBeVisible();
    await expect(c.getByRole("button", { name: "Nouveau contact" })).toBeVisible();
  },
};

/** Premier chargement : squelettes de lignes ; le panneau attend une sélection. */
export const Chargement: Story = {
  args: { rows: undefined, initialSelected: null },
};
