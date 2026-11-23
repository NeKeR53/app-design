# Tabs
Statut : validé (2026-11-21) — Version : depuis 0.1.0
Validation : docs/validation/components/Tabs-v1.html

## Rôle
Onglets de vues d'une page, dans la barre supérieure d'AppShell (D-021). Ils passent d'une vue à l'autre de la même page : « Tous les documents », « Créer un rapport », « Édition du rapport ».
Ne pas les utiliser pour :
- changer de page : c'est le rôle de la `Sidebar` ;
- des sections de réglages : prendre `SettingsPage` ;
- des onglets à l'intérieur d'une page : hors périmètre de cette version (voir Exclus).

## Anatomie
1. Liste d'onglets (obligatoire), sur une seule rangée.
2. Onglet (au moins un) : libellé, puis × s'il est fermable. Le × apparaît au survol, au focus et sur l'onglet actif ; sa place reste réservée (D-041).
3. Chevron « Toutes les vues » (automatique) : visible seulement quand la rangée déborde (D-027).
4. Menu des vues (automatique) : toutes les vues, avec leur × ; il remplace la rangée sur mobile (D-021, D-027).

## Variantes
Une seule. L'onglet actif a un fond plein et un texte `--fg`, comme l'élément actif de la sidebar (D-038).

Variante signature d'un thème d'organisation (`theme.signature.tabs`, D-337) ; valeur par défaut : inchangée.
- `pill` (défaut) : le rendu ci-dessus.
- `underline` : l'onglet actif n'a plus de fond ; texte en `--accent-text` et trait de 3 px en `--accent` sous le libellé. Le survol garde son fond `--hover`. Tailles et espacements inchangés.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `items` | `{ id, label, closable? }[]` | — (obligatoire) | Vues de la page. Les vues déclarées par la page sont fixes ; une vue ouverte depuis un élément est fermable (D-021). |
| `selectedId` / `onSelectionChange` | `string` / `(id) => void` | — (obligatoire) | Vue active. |
| `onClose` | `(id) => void \| boolean` | aucun | Fermeture d'une vue fermable, appelée avant tout changement de vue. Rendre `false` annule (par exemple pour confirmer). La vue de gauche ne s'active que quand l'app retire la vue active de `items`. Obligatoire si une vue a `closable`. |

## Exclus
- Pas d'icône ni de badge dans un onglet dans cette version.
- Pas de réordonnancement par glisser dans cette version.
- Pas d'onglets dans le contenu d'une page dans cette version : on ajoutera une option facultative si le besoin apparaît.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Par défaut | Texte `--fg-2`, sans fond. |
| Survol | Fond `--hover`, texte `--fg`. |
| Actif | Fond `--selected`, texte `--fg` (D-038). Fond fixe au survol (D-039). |
| Focus clavier | Anneau de focus `--accent`. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Un clic active la vue ; chaque page retient sa dernière vue (D-021) | verrouillé | `Selection` |
| Mod+1 à 9 activent la vue de même rang (D-021) | verrouillé | `Raccourcis` |
| Fermer la vue active active la vue de gauche ; une vue fixe n'a jamais de × (D-021) | verrouillé | `Fermeture` |
| Clic du milieu sur une vue fermable : la ferme | verrouillé | `Fermeture` |
| Trop de vues : la rangée défile, un chevron liste toutes les vues, l'onglet actif reste visible ; sur mobile, le titre de la vue ouvre la liste (D-027) | verrouillé | `Debordement` |
| Changement de vue immédiat, sans animation (D-026) | verrouillé | `Selection` |

## Contenu
- Libellé tronqué au-delà de 200 px, avec le libellé complet dans une info-bulle (`Tooltip`).
- Un libellé de vue ouverte depuis un élément reprend le nom de l'élément.

## Densité
Rayon `--radius-md` de 8 px ; le × a un rayon de 4 px (D-040). Hauteur `--row-h` moins 4 px (30 px en web, 24 px en desktop). Texte `--fs-md`.

## Clavier
- Tab entre dans la liste sur l'onglet actif, puis en sort.
- Flèches gauche et droite : passent d'un onglet à l'autre et activent la vue tout de suite (activation automatique).
- Origine et Fin : premier et dernier onglet.
- Suppr ou Retour arrière sur une vue fermable : la ferme.

## Accessibilité
- Rôles `tablist`, `tab` et `tabpanel` (React Aria). La liste porte le nom de la page : « Vues de la page Documents ».
- Le × est un bouton nommé « Fermer la vue <libellé> », hors de l'ordre de tabulation (le clavier utilise Suppr).
- Le chevron est un `IconButton` nommé « Toutes les vues ».

## Taille d'écran
Bureau et tablette : rangée d'onglets. Mobile : pas de rangée ; le titre de la vue courante, avec un chevron, ouvre le menu des vues (D-021, D-027).

## Erreurs
Sans objet.

## Placement
Uniquement dans la barre supérieure d'AppShell, après le nom de la page et un séparateur. Une seule liste d'onglets par écran.

## Composition
Contient `IconButton` (chevron), `Tooltip` (libellés tronqués) et un `DropdownMenu` (liste des vues). Utilisé par `AppShell`.

## Décisions
D-006, D-021, D-026, D-027, D-038, D-039, D-040, D-041, D-337

## Questions ouvertes
Aucune.
