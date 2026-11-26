# Recette : Catalogue
Statut : validé (2026-11-26, par délégation de l'utilisateur) — Version : depuis 1.21.0
Décision : D-410. Stories : « Recettes/Catalogue ». Captures : [clair](Catalog-clair.png), [sombre](Catalog-sombre.png).

![Catalogue, mode clair](Catalog-clair.png)

## Quand la prendre
- Des éléments qu'on reconnaît à leur image : produits, photos, modèles, documents avec leur aperçu.
- On les parcourt en vignettes, on filtre, on ouvre la fiche à côté.
- Pas pour des éléments qu'on compare propriété par propriété : recette « Liste et fiche » (tableau).

## Zones
| Zone | Ce qui y va | Composant |
|---|---|---|
| Barre du haut, vues | « En vente », « Archivés » | vues de l'`AppShell` (D-021) |
| `main` | Les vignettes sur toute la page : image, nom, gamme, prix, stock ; recherche et filtres | `ListPage` `layout="grid"`, `item`, `thumbnail` |
| Panneau de détail | La fiche du produit : photo, prix et stock, description, finitions | `Drawer` déclaratif, `ImageThumbnail`, `Table density="compact"` |
| Toute la page | Dépôt de photos | `onDropFiles` de `ListPage` |

## Actions
| Action | Où | Forme |
|---|---|---|
| Nouveau produit | En-tête de `ListPage` ; état vide | Action `primary` |
| Importer des photos | En-tête de `ListPage` | Icône |
| Modifier, Dupliquer | Vignette (au survol) ; en-tête du panneau | Icônes |
| Archiver | Vignette ; en-tête du panneau | Dans « … » |

## États
| État | Rendu |
|---|---|
| Catalogue vide | `EmptyState` de `ListPage` : « Aucun produit », « Créez un produit, ou déposez ses photos sur la page. », « Nouveau produit ». |
| Premier chargement | Vignettes en squelette (`rows` vaut `undefined`). |
| Aucun résultat, erreur | Rendus par `ListPage`. |
| Produit sans photo | Aperçu vide ; pour un document, l'icône et le type de fichier (`thumbnail.type`). |
| Aucune sélection | `emptyMessage` : « Sélectionnez un produit pour voir sa fiche. » |
| Photos au-dessus de la page | Cadre « Déposez les photos pour créer les produits ». |

## Comportement
- Vignettes de 200 px au moins, autant par ligne que la place le permet ; aperçu 4:3, image recadrée par le haut (D-414).
- Un clic ou les flèches (dans les deux sens) sélectionnent ; la fiche suit dans le panneau. Entrée ouvre.
- Le stock se lit sur chaque vignette : statut (`Badge`) « En stock », « Stock bas », « Épuisé ».
- Dans la fiche, la photo s'agrandit d'un clic (`ImageThumbnail`).

## Squelette
```tsx
<ListPage title="En vente" rows={produits} columns={COLONNES} layout="grid"
  item={{ title: "nom", subtitle: "gamme", meta: "prix", status: "etat" }}
  thumbnail={(p) => (p.photo ? { src: p.photo } : undefined)}
  filters={[GAMME, STOCK]} actions={[nouveau, importerPhotos]} rowActions={(p) => [modifier(p), archiver(p)]}
  selectedId={choisi} onSelect={(p) => choisir(p?.id ?? null)} onDropFiles={creerDepuisPhotos}
  empty={{ title: "Aucun produit", description: "Créez un produit, ou déposez ses photos sur la page." }} />

<Drawer header={{ title: p.nom, subtitle: `${p.gamme} · réf. ${p.reference}`, status: STOCK[p.etat], actions: [...] }}
  sections={[{ id: "photo", title: "Photo", content: <ImageThumbnail alt={p.nom} src={p.photo} /> },
    { id: "vente", title: "Prix et stock", fields: [{ label: "Prix", value: p.prix, type: "money" }, …] },
    { id: "finitions", title: "Finitions", defaultCollapsed: true, content: <Table density="compact" … /> }]} />
```
Pour des documents : `thumbnail={(d) => ({ src: d.apercu, type: "pdf" })}` ; sans aperçu, l'icône et « PDF » le remplacent.

## À éviter
- Un mur de `Card` faites à la main : la grille de `ListPage` dessine les vignettes, leurs états et leur clavier.
- Une bascule liste / grille dans la page : la recette choisit la grille.
- Des images de tailles libres : l'aperçu est 4:3, recadré.

## Décisions
D-021, D-111, D-383, D-404, D-410, D-414, D-416.
