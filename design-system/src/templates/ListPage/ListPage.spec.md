# ListPage
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/ListPage-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Gabarit d'une page qui liste des éléments de même nature : demandes, contacts, factures, fichiers. L'app **décrit** sa page par des données (titre, colonnes typées, filtres, actions) ; le gabarit dessine tout, y compris le chargement, le vide, l'absence de résultat et l'erreur (D-173). Il se place dans la zone `main` d'`AppShell`.
Ne pas l'utiliser pour :
- un seul élément : `DetailPage` ;
- un formulaire : `FormPage` ;
- une page composée de plusieurs blocs (tableau de bord) : assembler `Table` ou `List` à la main.

## Anatomie
1. **`header`** (obligatoire) : titre de la page (`--fs-lg`, `--fw-semibold`) et description courte facultative (`--fs-sm`, `--fg-2`) à gauche ; actions de la page à droite, en `ActionBar` zone `header` (D-111).
2. **`toolbar`** (si recherche ou filtres) : `SearchInput` puis les filtres en `Select` à gauche (D-174). Quand des lignes sont cochées, la barre devient la barre de sélection : « 3 sélectionnés », « Tout désélectionner », et les actions groupées en `ActionBar` zone `toolbar` à droite (D-178).
3. **`list`** (obligatoire) : `Table` (défaut) ou `List`, selon `layout`. Chaque cellule est une `FormattedValue` du type de sa colonne (D-170, D-172). Actions de ligne en zone `row` (D-114).
4. **`footer`** : compteur à gauche ; pagination « 1–50 sur 312 » avec page précédente et suivante, ou bouton « Afficher plus » (D-175).
5. **`empty`** (à la place de `toolbar`, `list` et `footer` quand il n'y a aucun élément) : `EmptyState` avec icône, titre, phrase et l'action principale de la page en zone `empty` (D-176).

## Variantes
| `layout` | Quand | Rendu |
|---|---|---|
| `table` (défaut) | On compare des propriétés d'un élément à l'autre. | `Table` : une colonne par `columns`. |
| `list` | Chaque élément se lit seul (titre, sous-titre, méta). | `List` : `item` dit quelles colonnes donnent le titre, le sous-titre, la méta et le statut. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — (obligatoire) | Titre de la page : « Demandes ». |
| `description` | `string` | aucune | Une phrase sous le titre. |
| `actions` | `Action[]` | aucune | Actions de la page (zone `header`). L'action `primary` revient dans l'état vide. |
| `rows` | `Row[] \| undefined` | — (obligatoire) | Les lignes, chacune avec un `id` texte. `undefined` : premier chargement. |
| `columns` | `ListPageColumn<Row>[]` | — (obligatoire) | Colonnes : `{ id, label, value?, sortable?, …ValueFormat }`. `id` est lu dans la ligne, sauf si `value(row)` est donné. La première est le nom de l'élément. |
| `layout` | `"table" \| "list"` | `"table"` | Variante. |
| `item` | `{ title, subtitle?, meta?, status? }` | `title` = 1re colonne | Pour `list` : l'`id` de la colonne qui donne chaque pièce de la ligne. |
| `search` | `boolean \| { label?, text? }` | `true` | Recherche dans la barre. `label` : nom accessible (« les demandes ») ; `text(row)` : le texte où chercher (défaut : le texte affiché de toutes les colonnes). |
| `filters` | `ListPageFilter<Row>[]` (3 au plus) | aucun | `{ id, label, allLabel, options: { id, label }[], value? }`. `value(row)` rend une clé ou une liste de clés (défaut : `row[id]`). |
| `rowActions` | `(row) => Action[]` | aucune | Actions d'une ligne (zone `row`). |
| `selectionMode` | `"single" \| "multiple"` | `"single"` | `multiple` : cases et barre de sélection. |
| `selectedId` / `onSelect` | `string \| null` / `(row \| null) => void` | aucun | Ligne sélectionnée (clic ou flèches), par exemple pour le panneau de détail. |
| `selectionActions` | `(rows) => Action[]` | aucune | Actions groupées sur les lignes cochées (`multiple`). |
| `onOpen` | `(row) => void` | aucun | Ouverture (double-clic ou Entrée), dans une vue fermable (D-021). |
| `pagination` | `{ mode?: "more" \| "pages", pageSize? }` | `{ mode: "more", pageSize: 50 }` | Pied de liste (D-175). |
| `empty` | `{ title, description?, icon? }` | — (obligatoire) | État vide : « Aucune demande ». |
| `isLoading` | `boolean` | `false` | Rechargement avec des lignes déjà là : barre fine (D-084). |
| `hasError` / `onRetry` | `boolean` / `() => void` | `false` | Le dernier chargement a échoué (D-085). |
| `remote` | `boolean` | `false` | Données côté serveur : le gabarit ne filtre, ne trie, ne découpe rien ; il signale chaque changement à `onStateChange` (D-174). |
| `total` | `number` | nombre de lignes | En mode `remote` : nombre total d'éléments qui correspondent. |
| `onStateChange` | `(state: ListPageState) => void` | aucun | `{ query, filters, sort, page }` à chaque changement. |
| `storageId` | `string` | `title` | Clé de mémorisation des filtres et du tri (D-177). |
| `onActionError` / `onActionDone` | comme `ActionBar` | aucun | Transmis à toutes les `ActionBar` du gabarit. |

## Exclus
- Pas de rendu de cellule libre ni de largeur de colonne fixée par l'app : le type décide (D-172).
- Pas de vues enregistrées ni de boutons segmentés dans la barre : les vues d'une page vont dans les onglets de l'`AppShell` (D-021).
- Pas de bouton « Actualiser » dans le gabarit : l'app le met dans ses actions si elle en a besoin.
- Pas de visuel (icône, avatar) en `list` dans cette version.
- Pas de regroupement de lignes ni de tri multiple.
- Pas de bandeau en tête de page (D-159).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Premier chargement (`rows` vaut `undefined`) | En-tête, puis 6 lignes squelettes (D-084). Pas de barre ni de pied. |
| Rechargement (`isLoading` avec des lignes) | Lignes gardées, barre de 2 px en haut de la liste, `aria-busy` (D-084). |
| Vide (aucune ligne, aucun critère) | En-tête (sans l'action `primary`, qui passe dans l'état vide), puis `EmptyState` : icône, titre, phrase, action principale. Ni barre, ni pied (D-176). |
| Aucun résultat (critères actifs) | Barre gardée ; message « Aucun résultat pour « … » » avec « Effacer la recherche », qui vide la recherche et les filtres (D-086, D-176). |
| Erreur au premier chargement | En-tête, puis message centré « Impossible de charger les résultats » et « Réessayer » (D-085). |
| Erreur avec des lignes | Lignes gardées, bandeau « Résultats non mis à jour » et « Réessayer » au-dessus (D-085). |
| Lignes cochées | Barre de sélection à la place de la barre d'outils (D-178). |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| La recherche filtre les lignes à chaque frappe (2 caractères, D-080), sans casse ni accents, chaque mot devant apparaître ; le texte trouvé passe en gras (D-087) | verrouillé | `Recherche` |
| Un filtre garde les lignes dont la valeur est la clé choisie (ou la contient, pour une liste) ; les filtres se combinent en ET (D-174) | verrouillé | `Filtres` |
| « Effacer la recherche » vide la recherche et les filtres (D-176) | verrouillé | `AucunResultat` |
| Tri au clic sur l'en-tête, sur la valeur et non sur le texte ; vides en dernier (D-172) | verrouillé | `Tri` |
| Les filtres et le tri sont mémorisés par page ; la recherche ne l'est pas (D-177) | verrouillé | `Memorisation` |
| Pied « more » : « 50 sur 312 » et « Afficher plus » ajoute une page ; « pages » : « 1–50 sur 312 » et flèches ; une recherche ou un filtre ramène à la page 1 (D-175) | verrouillé | `Pagination`, `AfficherPlus` |
| Tout tient sur une page : le pied ne montre que le compteur « 12 éléments » (D-175) | verrouillé | `ParDefaut` |
| Clic ou flèches : sélection (`onSelect`) ; double-clic ou Entrée : ouverture (`onOpen`) | verrouillé | `Ouverture` |
| Lignes cochées : barre « n sélectionnés », actions groupées, « Tout désélectionner » (D-178) | verrouillé | `Selection` |
| Vide : `EmptyState` avec l'action `primary` de la page ; pas de barre ni de pied (D-176) | verrouillé | `Vide` |
| `remote` : rien n'est filtré ni découpé par le gabarit ; `onStateChange` reçoit chaque changement (D-174) | verrouillé | `Distant` |

## Contenu
- Titre au pluriel, nom de ce qui est listé : « Demandes ».
- Titre vide au négatif : « Aucune demande » ; phrase qui dit à quoi sert la page.
- Libellés de filtre : nom au singulier (« État ») et première entrée « Tous les états ». Un filtre fait 160 px (`Select` largeur `sm`) : un libellé plus long est coupé.
- Recherche : `SearchInput`, 320 px (D-078) ; `search.label` complète « Rechercher dans … » (« les demandes »). Défaut : le titre en minuscules.
- Les libellés internes (compteur, pagination, sélection) sont dans `messages` (D-089).

## Densité
Hauteurs de ligne de `Table` et `List` (`--row-h`, `--row2-h`). Marges de l'en-tête, de la barre et du pied : `--pad` (16 px en web, 12 px en desktop). Pied : hauteur `--bar-h`. Barre de sélection : même hauteur que la barre d'outils (`--row-h`), la liste ne bouge pas.

## Clavier
Ordre de tabulation : actions de l'en-tête, recherche, filtres, liste, pied. Dans la liste : clavier de `Table` ou `List`. Mod+F n'est pas pris par le gabarit.

## Accessibilité
Le titre est un `h1`. La liste porte le nom du titre. Le compteur du pied est une région `aria-live="polite"`. La pagination est un `nav` nommé « Pagination ».

## Taille d'écran
Sous 640 px : actions de l'en-tête dans « … » (D-117) ; la barre passe à la ligne (recherche pleine largeur, filtres dessous).

## Erreurs
Erreur de chargement : états ci-dessus (D-085). Erreur d'une action : `onActionError`, que l'app relaie par un toast (D-154).

## Placement
Zone `main` d'`AppShell` (layout-rules, gabarit ListPage). Le panneau de détail montre la ligne sélectionnée.

## Composition
`ActionBar`, `SearchInput`, `Select`, `Table`, `List`, `EmptyState`, `FormattedValue`, `Button`, `IconButton`. Rien d'autre.

## Décisions
D-021, D-080, D-084 à D-087, D-111, D-114, D-117, D-159, D-170 à D-178

## Questions ouvertes
Aucune.
