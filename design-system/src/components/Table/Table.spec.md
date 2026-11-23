# Table
Statut : validé (2026-11-22, options denses le 2026-11-23) — Version : depuis 0.1.0 ; options denses à la prochaine mineure
Validation : docs/validation/components/Table-v1.html, docs/validation/components/Results-states-v1.html (états des résultats), docs/validation/components/Table-v2.html (tableau dense ; par délégation de l'utilisateur, 2026-11-23)

## Rôle
Tableau de données : des éléments en lignes, leurs propriétés en colonnes, avec tri et sélection. Il sert dans la zone `list` du gabarit `ListPage` quand on compare plusieurs propriétés d'un élément à l'autre.
Ne pas l'utiliser pour :
- une liste où chaque élément se lit seul (titre, sous-titre, méta) : prendre `List` ;
- la navigation : prendre la `Sidebar` ;
- les propriétés d'un seul élément : prendre `Drawer`.

## Anatomie
1. **En-tête** (obligatoire) : un libellé par colonne, en `--fs-sm`, `--fg-2` ; collé en haut quand le tableau défile. Le bord droit de chaque en-tête se glisse pour régler la largeur, de 80 à 480 px (D-067).
2. **Ligne** (au moins une) : une cellule par colonne.
3. **Colonne principale** (obligatoire, la première après la sélection) : le nom de l'élément, en `--fg`, avec une icône facultative.
4. **Case de sélection** (si la sélection multiple est activée) : visible au survol et au focus, puis sur toutes les lignes dès qu'une est cochée ; la case « Tout sélectionner » de l'en-tête est toujours visible, avec un état mixte ; toujours visible sur tactile (D-065).
5. **Actions de ligne** (facultatives, deux au plus) : à droite, dans une colonne réservée ; visibles au survol, au focus et sur la ligne sélectionnée ; « … » ouvre un `DropdownMenu`, comme le clic droit (D-066).
6. **Ligne de groupe** (si `groupBy`) : sur toute la largeur, chevron de 12 px en `--fg-3`, nom en `--fw-semibold`, « · n lignes » en `--fg-3`, sans fond ; elle se replie (D-272).
7. **Précision** (si `rowDescription`) : sous le nom, dans la colonne principale, en `--fs-sm` et `--fg-3` (D-273).
8. **Barre de sélection** (automatique) : quand au moins une ligne est cochée, la barre d'outils du gabarit affiche « n sélectionnés » et les actions groupées.

## Variantes
Aucune. Le tableau occupe toute la largeur, sans cadre (D-062). Lignes compactes (D-063), séparées par un trait horizontal `--line` ; pas de trait vertical ni de zébrage (D-064). Le tableau dense n'est pas un second composant : ce sont les options `density`, `groupBy` et `rowDescription` (D-270).

Variante signature d'un thème d'organisation (`theme.signature.tableHeader`, D-337) ; valeur par défaut : inchangée. `plain` (défaut) : en-tête sans fond propre. `tinted` : en-tête teinté en `--table-head-bg`.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `columns` | `{ id, label, align?, width?, sortable? }[]` | — (obligatoire) | Colonnes. `align: "end"` pour les nombres. Une `width` sous 80 px est aussi la largeur minimale, 32 px au moins (D-274). |
| `rows` | `{ id, … }[]` | — (obligatoire) | Lignes. |
| `selectionMode` | `"none" \| "single" \| "multiple"` | `"single"` | Sélection. |
| `sortDescriptor` / `onSortChange` | — | aucun | Tri courant. |
| `searchTerms` / `onClearSearch` | `string[]` / `() => void` | aucun | Critères de la recherche en cours, pour l'état « aucun résultat » (D-086) et la mise en gras du texte trouvé (D-087). |
| `onAction` | `(id) => void` | — | Ouverture d'une ligne (double-clic ou Entrée). |
| `rowActions` | `(row) => { icon, label, onPress }[]` (2 au plus) | aucune | Actions de ligne, au survol ; « … » et le clic droit ouvrent le même menu (D-066). |
| `density` | `"default" \| "compact"` | `"default"` | `compact` : lignes de 25 px, en-tête de 28 px, marge de case de 8 px (D-271). |
| `groupBy` | `(row) => string` | aucun | Range les lignes sous des lignes de groupe repliables, dans l'ordre de première apparition (D-272). |
| `defaultCollapsedGroups` | `string[]` | `[]` | Groupes repliés au premier affichage ; ensuite l'état est mémorisé (D-272). |
| `rowDescription` | `(row) => string \| undefined` | aucune | Précision sous le nom : toutes les lignes deviennent doubles (D-273). |

## Exclus
- Pas de cellule modifiable sur place dans cette version : on modifie dans le panneau de détail ou dans `FormPage`.
- Pas de colonne figée à gauche ni de lignes virtualisées dans cette version.
- Pas de couleur de fond par ligne ni par case ; la couleur sert seulement aux pastilles de statut : `BadgeDot` ou `Badge` dans `renderCell` (D-276).
- Pas de menu propre à une case : les actions passent par le menu de la ligne (D-066, D-277).
- Pas de ligne de groupe en bande teintée ; pas de tri des groupes par le tableau (l'app trie `rows`).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Ligne par défaut | Sans fond. |
| Ligne survolée | Fond `--hover`. |
| Ligne sélectionnée | Fond `--selected`, fixe au survol (D-039). Texte tertiaire en `--fg-2` (AA). |
| Focus clavier | Anneau de focus `--accent` sur la ligne ou la cellule. |
| Ligne de groupe | Sans fond ; survol `--hover` ; jamais sélectionnée. Repliée : chevron tourné vers la droite, lignes masquées, titre gardé (D-272). |
| Chargement | Premier chargement : 6 lignes squelettes. Nouvelle recherche : anciens résultats gardés, barre de 2 px `--accent` en haut de la zone, `aria-busy` (D-084). |
| Vide | Géré par le gabarit (`empty` de ListPage) : icône, titre, phrase, action principale. |
| Aucun résultat (recherche) | « Aucun résultat pour « … » », « Vérifiez l'orthographe ou retirez un critère. », bouton « Effacer la recherche » (D-086). |
| Erreur | Premier chargement : message centré « Impossible de charger les résultats » et « Réessayer ». Nouvelle recherche : anciens résultats gardés, bandeau « Résultats non mis à jour » avec « Réessayer » au-dessus (D-085). |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Un clic sélectionne la ligne et affiche son détail ; un double-clic ou Entrée l'ouvre dans une vue fermable (layout-rules, D-021) | verrouillé | `Selection` |
| Tri : un clic sur un en-tête triable trie ; un second clic inverse ; une flèche indique le sens | verrouillé | `Tri` |
| En-tête collé en haut quand le tableau défile | verrouillé | `Defilement` |
| Le tri et la largeur des colonnes sont mémorisés par tableau (D-007) | verrouillé | `Memorisation` |
| Colonnes redimensionnables de 80 à 480 px ; double-clic : largeur par défaut ; flèches au clavier par 16 px ; la colonne principale prend la place restante (D-067) | verrouillé | `Redimension` |
| Cases de sélection : au survol ; toutes visibles dès qu'une ligne est cochée ; en-tête toujours visible (D-065) | verrouillé | `SelectionMultiple` |
| Actions de ligne : au survol, au focus et sur la ligne sélectionnée ; clic droit ou Maj+F10 ouvrent le menu « … » (D-066) | verrouillé | `ActionsDeLigne` |
| Aucune animation au tri ni à la sélection (D-026) | verrouillé | `Tri` |
| Densité compacte : lignes de 25 px, en-tête de 28 px ; sans l'option, rien ne change (D-271) | réglable par l'app (`density`) | `Compacte`, `DensiteParDefaut` |
| Lignes de groupe : clic, Entrée ou Espace replient ; état mémorisé ; jamais sélectionnées ni ouvertes (D-272) | verrouillé | `Groupes` |
| Lignes doubles : `--row-h` + 12 px (D-273) | réglable par l'app (`rowDescription`) | `LignesDoubles` |
| Largeur déclarée sous 80 px respectée (D-274) | verrouillé | `LargeurEtroite` |
| En-tête coupé : libellé complet en info-bulle (D-275) | verrouillé | `EnTeteCoupe` |

## Contenu
- Texte trop long, en-tête compris : coupé avec une ellipse, et texte complet dans une info-bulle (D-275).
- Nombres et montants : alignés à droite, chiffres de largeur égale (`tabular-nums`).
- Valeur vide : « — » en `--fg-3`.
- Texte qui correspond à la recherche : en `--fw-semibold`, sans casse ni accents (D-087).
- Dates au format court de la langue (« 21 nov. »), avec la date complète en info-bulle.

## Densité
Hauteur de ligne et d'en-tête : `--row-h` (34 px en web, 28 px en desktop) (D-063). Texte `--fs-md` ; en-tête `--fs-sm`.
`density="compact"` : lignes de 25 px et en-tête de 28 px, en web comme en desktop ; le texte garde sa taille (D-271). Lignes doubles : `--row-h` + 12 px, soit 46, 40 ou 37 px (D-273).

## Clavier
- Tab entre dans le tableau sur la ligne sélectionnée (ou la première), puis en sort.
- Flèches haut et bas : ligne précédente ou suivante. Flèches gauche et droite : cellule par cellule (React Aria `Table`).
- Espace : coche ou décoche la ligne (sélection multiple). Mod+A : tout cocher.
- Entrée : ouvre la ligne. Maj+F10 ou touche Menu : menu « … » de la ligne.
- Sur une ligne de groupe : Entrée ou Espace replient ou déplient (D-272).

## Accessibilité
- Rôle `grid` (React Aria `Table`), avec `aria-sort` sur la colonne triée.
- La poignée de largeur a le rôle `separator`, nommée « Largeur de la colonne <libellé> ».
- La case « tout cocher » de l'en-tête a un nom : « Tout sélectionner ».
- Les actions de ligne ont un nom qui reprend la ligne : « Archiver Rapport trimestriel ».
- La ligne de groupe porte `aria-expanded` ; elle n'est pas sélectionnable (`disabledBehavior="selection"`).

## Taille d'écran
Bureau et tablette : tableau ; les colonnes de faible priorité se masquent d'abord. Mobile : voir les questions ouvertes (proposition : le tableau s'affiche comme une `List`, avec la colonne principale et deux colonnes secondaires).

## Erreurs
Voir États (erreur de chargement). Une action groupée qui échoue affiche une notification avec « Réessayer » (D-007).

## Placement
Zone `list` de `ListPage`, seul. Jamais dans le panneau de détail ni dans la sidebar.

## Composition
Contient `Checkbox` (à spécifier), `IconButton`, `DropdownMenu`, `Tooltip` `Skeleton` (D-165) et `EmptyState` (D-166) pour ses états (D-169). Une cellule de statut reçoit un `Badge` ou un `BadgeDot` (D-160, D-162).

## Décisions
D-004, D-007, D-021, D-025, D-026, D-039, D-040, D-053, D-054, D-062, D-063, D-064, D-065, D-066, D-067, D-084, D-085, D-086, D-087, D-270, D-271, D-272, D-273, D-274, D-275, D-276, D-277, D-337

## Questions ouvertes
Aucune.
