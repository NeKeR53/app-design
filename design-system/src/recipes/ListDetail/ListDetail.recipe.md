# Recette : Liste et fiche
Statut : validé (2026-11-26, par délégation de l'utilisateur) — Version : depuis 1.21.0
Décision : D-409. Stories : « Recettes/Liste et fiche ». Captures : [clair](ListDetail-clair.png), [sombre](ListDetail-sombre.png).

![Liste et fiche, mode clair](ListDetail-clair.png)

## Quand la prendre
- Une collection d'éléments de même nature qu'on cherche, filtre, compare et modifie : contacts, factures, fournisseurs, tâches.
- La fiche de l'élément choisi se lit à côté de la liste, sans la quitter.
- Pas pour une file qu'on vide : recette « File de tri ». Pas pour des éléments qu'on reconnaît à leur image : recette « Catalogue ».

## Zones
| Zone | Ce qui y va | Composant |
|---|---|---|
| Barre du haut, vues | Facultatives : des vues de la collection (« Clients », « Fournisseurs ») ; un élément ouvert en entier | vues de l'`AppShell` (D-021) |
| `main` | La collection sur toute la page : tableau, recherche, trois filtres au plus | `ListPage` (tableau) |
| Panneau de détail | La fiche de l'élément sélectionné : coordonnées, propriétés, notes, derniers échanges | `Drawer` déclaratif |
| Fenêtre | Créer, modifier : une saisie courte | `useOpenForm` (six champs au plus) ; `FormPage` au-delà |

## Actions
| Action | Où | Forme |
|---|---|---|
| Nouveau contact | En-tête de `ListPage` ; état vide | Action `primary` |
| Importer un fichier | En-tête de `ListPage` | Dans « … » |
| Écrire, Modifier | Ligne ; en-tête du panneau | Icônes |
| Copier une valeur | Ligne de propriété du panneau | `action` de type `icon` |
| Supprimer | Ligne ; en-tête du panneau | `danger`, dans « … », confirmé |

## États
| État | Rendu |
|---|---|
| Collection vide | `EmptyState` de `ListPage` : icône, « Aucun contact », phrase, « Nouveau contact ». |
| Aucun résultat | Rendu par `ListPage`, avec « Effacer la recherche ». |
| Chargement, erreur | `ListPage` (`rows` vaut `undefined`, `hasError`) ; `Drawer` (`isLoading`, `hasError`, `isNotFound`). |
| Aucune sélection | `emptyMessage` : « Sélectionnez un contact pour voir sa fiche. » |
| Section sans contenu | `empty` de la section : « Aucune note ». |

## Comportement
- Un clic ou les flèches sélectionnent ; la fiche suit la sélection dans le panneau.
- Double-clic ou Entrée : l'élément s'ouvre en entier dans une vue fermable (`DetailPage`), si l'app en a besoin.
- Les valeurs sont typées : `email` (lien), `tags` (étiquettes), `relative` (« il y a 2 jours ») ; le gabarit les met en forme.
- Après une écriture dans le panneau, la liste se recharge.

## Squelette
```tsx
<ListPage title="Contacts" rows={contacts} columns={COLONNES} filters={[SOCIETE, ETIQUETTE]}
  actions={[{ id: "nouveau", label: "Nouveau contact", icon: <Plus />, primary: true, onPress: creer }, importer]}
  rowActions={(c) => [ecrire(c), supprimer(c)]} selectedId={choisi} onSelect={(c) => choisir(c?.id ?? null)}
  empty={{ title: "Aucun contact", description: "Ajoutez vos clients et vos fournisseurs, ou importez un fichier." }} />

<Drawer header={{ title: c.nom, subtitle: `${c.fonction} · ${c.societe}`, actions: [ecrire, modifier, supprimer] }}
  sections={[{ id: "coordonnees", title: "Coordonnées", fields: [{ label: "E-mail", value: c.email, type: "email" }, …] },
    { id: "societe", … }, { id: "notes", title: "Notes", content: c.notes, empty: "Aucune note" },
    { id: "echanges", title: "Derniers échanges", summary: "3", content: <List dividers={false} … /> }]} />
```

## À éviter
- La liste et la fiche côte à côte dans la page : la fiche va dans le panneau de détail (D-404).
- Une colonne étroite centrée pour la liste : `ListPage` prend toute la largeur.
- Des champs de saisie dans le panneau : une valeur se modifie par l'action de sa ligne ou par une fenêtre.
- Un rendu de cellule libre : le type de la colonne décide (D-172).

## Décisions
D-021, D-111, D-170 à D-178, D-180 à D-185, D-404, D-409.
