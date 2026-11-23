# List
Statut : validé (2026-11-22) — Version : depuis 0.1.0
Validation : docs/validation/components/List-v1.html, docs/validation/components/Results-states-v1.html (états des résultats)

## Rôle
Liste d'éléments qui se lisent un par un : un titre, un sous-titre, une méta. Elle sert dans la zone `list` du gabarit `ListPage` (messages, demandes, tâches, contacts) et remplace le tableau sur mobile (spec de Table).
Ne pas l'utiliser pour :
- comparer plusieurs propriétés d'un élément à l'autre : prendre `Table` ;
- la navigation : prendre la `Sidebar` ;
- un choix dans un formulaire : prendre `Select` ou `RadioGroup`.

## Anatomie
1. **Élément** (au moins un) :
   1. visuel à gauche (facultatif) : un seul type par liste, icône 16 px, avatar 32 px ou vignette 40 px ; 24 px sur une seule ligne ; place gardée si un élément n'en a pas (D-069) ;
   2. ligne 1 : titre en `--fg`, coupé ; à droite, méta courte en `--fs-sm`, `--fg-3` (date, montant) ;
   3. ligne 2 (facultative) : sous-titre en `--fg-2`, coupé ; à droite, statut (`StatusBadge`, D-160, D-169) ou point de non-lu (D-044) ;
   4. actions de ligne au survol, deux au plus, à la place de la méta (D-066).
2. **En-tête de groupe** (facultatif) : `--fs-sm`, `--fg-3`, sans chevron ; collé en haut pendant le défilement (D-070).
3. **Pied** : compteur et « Afficher plus » (layout-rules, ListPage).

## Variantes
Aucune. Les éléments sont séparés par un trait horizontal `--line`, sans rayon, comme le tableau (D-064, D-068).

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `items` | `{ id, title, subtitle?, meta?, status?, unread? }[]` | — (obligatoire) | Éléments. |
| `selectionMode` | `"none" \| "single" \| "multiple"` | `"single"` | Sélection ; en multiple, case au survol (D-065). |
| `searchTerms` / `onClearSearch` | `string[]` / `() => void` | aucun | Critères de la recherche en cours, pour l'état « aucun résultat » (D-086) et la mise en gras du texte trouvé (D-087). |
| `onAction` | `(id) => void` | — | Ouverture (double-clic ou Entrée), dans une vue fermable (D-021). |
| `itemActions` | `(item) => { icon, label, onPress }[]` (2 au plus) | aucune | Actions au survol (D-066). |
| `leading` | `"icon" \| "avatar" \| "thumbnail"` | aucun | Type de visuel à gauche, le même pour toute la liste (D-069). Chaque élément fournit son icône, ses initiales ou son image. |
| `groups` | `{ id, title, items }[]` | aucun | Groupes avec en-tête collé ; ils ne se replient pas (D-070). |

## Exclus
- Pas plus de deux lignes de texte par élément : un contenu plus long va dans le panneau de détail.
- Pas d'image en grand format dans un élément : prendre une grille de cartes (à spécifier).
- Pas de `className` ni de `style`.

## États
Mêmes états que les lignes du tableau : survol `--hover`, sélection `--selected` fixe au survol (D-039), focus, chargement (squelettes au premier chargement, barre fine ensuite, D-084), vide (gabarit), aucun résultat avec rappel des critères et « Effacer la recherche » (D-086), erreur (message au premier chargement, bandeau au-dessus des anciens résultats ensuite, D-085).

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Clic : sélectionne et affiche le détail ; double-clic ou Entrée : ouvre une vue fermable (layout-rules, D-021) | verrouillé | `Selection` |
| Actions au survol, deux au plus ; clic droit ou Maj+F10 : menu « … » (D-066) | verrouillé | `Actions` |
| Sélection multiple : case au survol, toutes visibles dès qu'une est cochée (D-065) | verrouillé | `SelectionMultiple` |
| « Afficher plus » charge la suite ; la position de lecture ne bouge pas | verrouillé | `AfficherPlus` |
| Groupes : l'en-tête du groupe en cours reste collé en haut (D-070) | verrouillé | `Groupes` |
| Pas d'animation (D-026) | verrouillé | `Selection` |

## Contenu
- Titre et sous-titre coupés avec une ellipse ; texte complet en info-bulle.
- Texte qui correspond à la recherche : en `--fw-semibold`, sans casse ni accents ; un titre non lu ne passe pas en gras, le point accent suffit (D-044, D-087).
- Une liste a une seule hauteur d'élément : si un élément a un sous-titre, tous gardent la place de la ligne 2.
- Méta : date courte (« 21 nov. », « 14:32 » pour aujourd'hui), montant aligné à droite en chiffres de largeur égale.

## Densité
Élément sur deux lignes : `--row2-h` (52 px en web, 44 px en desktop) ; sur une ligne : `--row-h`.

## Clavier
Flèches haut et bas : élément suivant ou précédent. Espace : coche (sélection multiple). Entrée : ouvre. Origine et Fin. Lettre : premier élément dont le titre commence par elle (React Aria `GridList`).

## Accessibilité
- Rôle `grid` (React Aria `GridList`), avec `aria-multiselectable` en sélection multiple.
- Chaque élément est nommé par son titre ; le non-lu est annoncé « non lu ».
- Chaque groupe est nommé par son en-tête, qui n'est pas focusable (D-070).

## Taille d'écran
Identique ; sur mobile, les éléments passent à 44 px au moins par ligne de texte, et les actions passent par l'appui long.

## Erreurs
Voir États.

## Placement
Zone `list` de `ListPage`. Dans une section de page, une liste courte peut être encadrée (rayon 12 px, D-040).

## Composition
Contient `Checkbox` (à spécifier), `IconButton`, `Menu`, `Tooltip`, `StatusBadge` (D-160), `Skeleton` (D-165) et `EmptyState` (D-166) pour ses états (D-169).

## Décisions
D-021, D-026, D-039, D-040, D-044, D-064, D-065, D-066, D-068, D-069, D-070, D-084, D-085, D-086, D-087

## Questions ouvertes
Aucune.
