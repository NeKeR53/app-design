/*
 * Recette « Catalogue » (D-410). Doc : Catalog.recipe.md.
 * Des éléments qu'on reconnaît à leur image : ListPage en vignettes (`layout="grid"`, `thumbnail`), recherche et
 * filtres ; la fiche du produit sélectionné dans le panneau de détail ; photos déposées sur toute la page.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { StatusMap } from "../../components/FormattedValue/FormattedValue";
import { ImageThumbnail } from "../../components/ImageThumbnail/ImageThumbnail";
import { Table } from "../../components/Table/Table";
import { Pencil, Plus, Upload } from "../../icons";
import { Drawer } from "../../patterns/Drawer/Drawer";
import { ListPage } from "../../templates/ListPage/ListPage";
import { RecipeShell, resetStoredState } from "../../../.storybook/recipe-shell";
import { productImage } from "../../../.storybook/story-images";
import { CopyPlus, Package } from "../../../.storybook/story-icons";

/* ---------- Données factices ---------- */

interface Produit {
  id: string;
  nom: string;
  gamme: string;
  reference: string;
  prix: number;
  stock: number;
  etat: string;
  photo?: string;
  description: string;
}

const STOCK: StatusMap = {
  en_stock: { label: "En stock", tone: "success" },
  bas: { label: "Stock bas", tone: "warning" },
  epuise: { label: "Épuisé", tone: "danger" },
};
const GAMMES = ["Suspensions", "Appliques", "Lampes à poser", "Spots"];
const NOMS = ["Suspension Halo", "Applique Orbe", "Lampe Duo", "Spot Lune", "Suspension Cloche", "Applique Arc", "Lampe Totem", "Spot Trio", "Suspension Nid", "Applique Fil", "Lampe Galet", "Spot Iris"];
const PRODUITS: Produit[] = NOMS.map((nom, i) => {
  const stock = [42, 18, 3, 0, 27, 5, 61, 12, 9, 33, 0, 24][i]!;
  return {
    id: `P-${200 + i}`,
    nom,
    gamme: GAMMES[i % 4]!,
    reference: `${nom.split(" ")[0]!.slice(0, 2).toUpperCase()}-${200 + i}`,
    prix: 89 + ((i * 53) % 400),
    stock,
    etat: stock === 0 ? "epuise" : stock < 10 ? "bas" : "en_stock",
    ...(i === 10 ? {} : { photo: productImage(i) }),
    description: "Corps en aluminium brossé, diffuseur en verre soufflé. Driver garanti cinq ans.",
  };
});

/* ---------- La page ---------- */

function Catalog({ rows = PRODUITS, initialSelected = "P-200" }: { rows?: Produit[] | undefined; initialSelected?: string | null }) {
  const [view, setView] = useState("en-vente");
  const [produits, setProduits] = useState(rows);
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const current = produits?.find((p) => p.id === selected) ?? null;

  const addPhotos = (files: File[]) =>
    setProduits((all) => [
      ...files.map((f, i) => ({ id: `N-${i}-${f.name}`, nom: f.name.replace(/\.[a-z]+$/i, ""), gamme: "À classer", reference: "—", prix: 0, stock: 0, etat: "epuise", description: "" })),
      ...(all ?? []),
    ]);

  const panel = (
    <Drawer
      {...(current
        ? {
            header: {
              title: current.nom,
              subtitle: `${current.gamme} · réf. ${current.reference}`,
              status: STOCK[current.etat]!,
              actions: [
                { id: "modifier", label: "Modifier", icon: <Pencil />, onPress: () => undefined },
                { id: "dupliquer", label: "Dupliquer", icon: <CopyPlus />, onPress: () => undefined },
                { id: "archiver", label: "Archiver", onPress: () => undefined },
              ],
            },
            sections: [
              ...(current.photo ? [{ id: "photo", title: "Photo", content: <ImageThumbnail alt={current.nom} src={current.photo} /> }] : []),
              {
                id: "vente",
                title: "Prix et stock",
                fields: [
                  { label: "Prix", value: current.prix, type: "money" as const },
                  { label: "Stock", value: current.stock, type: "number" as const },
                  { label: "Référence", value: current.reference, type: "code" as const },
                ],
              },
              { id: "description", title: "Description", content: current.description },
              {
                id: "finitions",
                title: "Finitions",
                summary: "3",
                defaultCollapsed: true,
                content: (
                  <Table
                    label="Finitions"
                    density="compact"
                    selectionMode="none"
                    columns={[
                      { id: "finition", label: "Finition" },
                      { id: "stock", label: "Stock", align: "end", width: 72 },
                    ]}
                    rows={[
                      { id: "1", finition: "Laiton brossé", stock: "18" },
                      { id: "2", finition: "Noir mat", stock: "12" },
                      { id: "3", finition: "Blanc", stock: "12" },
                    ]}
                  />
                ),
              },
            ],
          }
        : {})}
      emptyMessage="Sélectionnez un produit pour voir sa fiche."
    />
  );

  return (
    <RecipeShell
      page="catalogue"
      pageTitle="Catalogue"
      views={[
        { id: "en-vente", label: "En vente" },
        { id: "archives", label: "Archivés" },
      ]}
      activeView={view}
      onViewChange={setView}
      detail={panel}
      isDetailOpen
    >
      <ListPage<Produit>
        title={view === "en-vente" ? "En vente" : "Archivés"}
        description="Les produits proposés à la vente, avec leur prix et leur stock."
        rows={view === "en-vente" ? produits : []}
        columns={[
          { id: "nom", label: "Nom" },
          { id: "gamme", label: "Gamme" },
          { id: "prix", label: "Prix", type: "money" },
          { id: "etat", label: "Stock", type: "status", statuses: STOCK },
        ]}
        layout="grid"
        item={{ title: "nom", subtitle: "gamme", meta: "prix", status: "etat" }}
        thumbnail={(p) => (p.photo ? { src: p.photo } : undefined)}
        search={{ label: "le catalogue" }}
        filters={[
          { id: "gamme", label: "Gamme", allLabel: "Toutes les gammes", options: GAMMES.map((g) => ({ id: g, label: g })) },
          { id: "etat", label: "Stock", allLabel: "Tous les stocks", options: Object.entries(STOCK).map(([id, s]) => ({ id, label: s.label })) },
        ]}
        actions={[
          { id: "nouveau", label: "Nouveau produit", icon: <Plus />, primary: true, onPress: () => undefined },
          { id: "photos", label: "Importer des photos", icon: <Upload />, onPress: () => undefined },
        ]}
        rowActions={() => [
          { id: "modifier", label: "Modifier", icon: <Pencil />, onPress: () => undefined },
          { id: "archiver", label: "Archiver", onPress: () => undefined },
        ]}
        selectedId={selected}
        onSelect={(p) => setSelected(p?.id ?? null)}
        onDropFiles={addPhotos}
        dropLabel="Déposez les photos pour créer les produits"
        empty={view === "en-vente" ? { title: "Aucun produit", description: "Créez un produit, ou déposez ses photos sur la page.", icon: <Package /> } : { title: "Aucun produit archivé" }}
      />
    </RecipeShell>
  );
}

/* ---------- Stories ---------- */

const meta: Meta<typeof Catalog> = {
  title: "Recettes/Catalogue",
  component: Catalog,
  parameters: { layout: "fullscreen" },
  beforeEach: resetStoredState,
};
export default meta;
type Story = StoryObj<typeof Catalog>;

/** Référence (captures) : les vignettes sur toute la page, la fiche du produit sélectionné dans le panneau. */
export const Reference: Story = {};

/** Choisir une vignette montre sa fiche ; les flèches passent d'une vignette à l'autre. */
export const ChoisirUnProduit: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByText("Lampe Duo"));
    const panel = within(c.getByRole("complementary", { name: "Détail" }));
    await waitFor(() => expect(panel.getByRole("heading", { name: "Lampe Duo" })).toBeVisible());
    await expect(panel.getByText("Stock bas")).toBeVisible();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(panel.getByRole("heading", { name: "Spot Lune" })).toBeVisible());
  },
};

/** Catalogue vide : l'état vide porte « Nouveau produit » et dit qu'on peut déposer des photos. */
export const Vide: Story = {
  args: { rows: [], initialSelected: null },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { name: "Aucun produit" })).toBeVisible();
    await expect(c.getByRole("button", { name: "Nouveau produit" })).toBeVisible();
  },
};

/** Premier chargement : des vignettes en squelette. */
export const Chargement: Story = {
  args: { rows: undefined, initialSelected: null },
};
