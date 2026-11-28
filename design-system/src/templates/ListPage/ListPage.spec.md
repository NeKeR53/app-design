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
2. **`toolbar`** (si recherche, filtres ou choix des colonnes) : `SearchInput` puis les filtres en `Select` à gauche (D-174) ; bouton « Colonnes » à droite si `allowColumnChoice` (D-346). Quand des lignes sont cochées, la barre devient la barre de sélection : « 3 sélectionnés », « Tout désélectionner », et les actions groupées en `ActionBar` zone `toolbar` à droite (D-178). Avec `allowSelectAll`, toute la page cochée et d'autres éléments ailleurs : lien « Sélectionner les 312 éléments » ; choisi, la barre dit « 312 éléments sélectionnés » et « Effacer la sélection » (D-345).
3. **`list`** (obligatoire) : `Table` (défaut), `List` ou grille de vignettes, selon `layout`. Chaque cellule est une `FormattedValue` du type de sa colonne (D-170, D-172). Actions de ligne en zone `row` (D-114).
   Grille (`grid`, D-414) : vignettes de 200 px de large au moins, autant par ligne que la place le permet, 12 px d'écart. Chaque vignette : trait `--line`, rayon 12 px, fond `--surface` ; aperçu 4:3 sur `--surface-side` (image recadrée par le haut ; sans image, icône du type de fichier de 32 px et son nom en capitales, `--fs-xs`, `--fg-3` ; ni image ni type : aperçu vide) ; puis titre (`--fw-medium`, coupé), sous-titre (`--fs-sm`, `--fg-2`), méta à gauche et statut (`Badge`) à droite. Actions de la vignette en haut à droite de l'aperçu, au survol, au focus ou à la sélection ; case de sélection en haut à gauche (`multiple`).
4. **`footer`** : compteur à gauche ; en mode `pages`, « 1–50 sur 312 » et le composant `Pagination` à droite (‹ 1 2 3 … 7 › ; sous 641 px : ‹ Page 2 sur 7 ›) ; en mode `more`, bouton « Afficher plus » (D-175, D-359). Avec `pagination.pageSizes` : « Lignes par page [25] » avant `Pagination` (D-348).
5. **`empty`** (à la place de `toolbar`, `list` et `footer` quand il n'y a aucun élément) : `EmptyState` avec icône, titre, phrase et l'action principale de la page en zone `empty` (D-176).
6. **`forbidden`** (si `isForbidden`, à la place de tout sauf le titre) : `EmptyState` variante `forbidden` (cadenas), « Vous n'avez pas accès à cette liste », « Demandez l'accès à un administrateur. », bouton « Demander l'accès » si `onRequestAccess` (D-351).

## Variantes
| `layout` | Quand | Rendu |
|---|---|---|
| `table` (défaut) | On compare des propriétés d'un élément à l'autre. | `Table` : une colonne par `columns`. |
| `list` | Chaque élément se lit seul (titre, sous-titre, méta). | `List` : `item` dit quelles colonnes donnent le titre, le sous-titre, la méta et le statut ; `thumbnail` ajoute un visuel de 40 px. |
| `grid` | Les éléments se reconnaissent à leur image : un catalogue, des photos, des documents (D-414). | Vignettes : `item` comme pour `list`, `thumbnail` donne l'aperçu. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — (obligatoire) | Titre de la page : « Demandes ». |
| `description` | `string` | aucune | Une phrase sous le titre. |
| `actions` | `Action[]` | aucune | Actions de la page (zone `header`). L'action `primary` revient dans l'état vide. |
| `rows` | `Row[] \| undefined` | — (obligatoire) | Les lignes, chacune avec un `id` texte. `undefined` : premier chargement. |
| `columns` | `ListPageColumn<Row>[]` | — (obligatoire) | Colonnes : `{ id, label, value?, sortable?, required?, …ValueFormat }`. `id` est lu dans la ligne, sauf si `value(row)` est donné. La première est le nom de l'élément. `required` : le menu « Colonnes » ne la masque pas. |
| `layout` | `"table" \| "list" \| "grid"` | `"table"` | Variante (D-414). |
| `item` | `{ title, subtitle?, meta?, status? }` | `title` = 1re colonne | Pour `list` et `grid` : l'`id` de la colonne qui donne chaque pièce de la ligne. |
| `thumbnail` | `(row) => { src?, type? } \| undefined` | aucun | Pour `grid` (aperçu 4:3) et `list` (visuel de 40 px) : `src`, adresse de l'image (`blob:`, `data:`, `https:`) ; sans image, `type` (« pdf », « xlsx ») choisit l'icône et s'écrit sur l'aperçu (D-414). |
| `search` | `boolean \| { label?, text? }` | `true` | Recherche dans la barre. `label` : nom accessible (« les demandes ») ; `text(row)` : le texte où chercher (défaut : le texte affiché de toutes les colonnes). |
| `filters` | `ListPageFilter<Row>[]` (3 au plus) | aucun | `{ id, label, allLabel, options: { id, label }[], value? }`. `value(row)` rend une clé ou une liste de clés (défaut : `row[id]`). |
| `rowActions` | `(row) => Action[]` | aucune | Actions d'une ligne (zone `row`). |
| `selectionMode` | `"single" \| "multiple"` | `"single"` | `multiple` : cases et barre de sélection. |
| `selectedId` / `onSelect` | `string \| null` / `(row \| null) => void` | aucun | Ligne sélectionnée (clic ou flèches), par exemple pour le panneau de détail. |
| `advanceOnRemove` | `boolean` | `false` | File de tri (`single`) : quand la ligne sélectionnée quitte `rows` (traitée, déplacée, supprimée), `onSelect` reçoit celle qui la suivait à l'écran, ou la précédente si c'était la dernière, ou `null` (D-415). |
| `selectionActions` | `(rows, selection) => Action[]` | aucune | Actions groupées sur les lignes cochées (`multiple`). `selection` : `"rows"`, ou `"all"` après « Sélectionner les N éléments » (`rows` = lignes connues ; en `remote`, l'app agit sur tous les éléments qui correspondent). |
| `allowSelectAll` | `boolean` | `false` | Lien « Sélectionner les N éléments » quand toute la page est cochée et qu'il reste des éléments (D-345). |
| `allowColumnChoice` | `boolean` | `false` | Menu « Colonnes » : une case par colonne ; choix mémorisé par page (D-346, D-007). |
| `allowsUnsort` | `boolean` | `false` | Tri à trois états : croissant, décroissant, ordre d'origine (D-347). |
| `onOpen` | `(row) => void` | aucun | Ouverture (double-clic ou Entrée), dans une vue fermable (D-021). |
| `pagination` | `{ mode?: "more" \| "pages", pageSize?, pageSizes? }` | `{ mode: "more", pageSize: 50 }` | Pied de liste (D-175). `pageSizes` (mode `pages`) : `true` (25, 50, 100) ou une liste ; choix mémorisé (D-348). |
| `empty` | `{ title, description?, icon? }` | — (obligatoire) | État vide : « Aucune demande ». |
| `isForbidden` | `boolean` | `false` | Accès refusé : état dédié à la place de la liste (D-351). |
| `forbidden` | `{ title?, description? }` | textes de `messages` | Textes de l'accès refusé : « Vous n'avez pas accès à ces demandes ». |
| `onRequestAccess` | `() => void` | aucun | Bouton « Demander l'accès » de l'accès refusé. |
| `isLoading` | `boolean` | `false` | Rechargement avec des lignes déjà là : barre fine (D-084). |
| `hasError` / `onRetry` | `boolean` / `() => void` | `false` | Le dernier chargement a échoué (D-085). |
| `updatedAt` | `Date \| number \| string \| undefined` | aucune | Date de la dernière lecture réussie. En erreur avec des lignes, le bandeau dit l'âge des données : « Dernière mise à jour il y a 12 minutes. » (D-434). |
| `remote` | `boolean` | `false` | Données côté serveur : le gabarit ne filtre, ne trie, ne découpe rien ; il signale chaque changement à `onStateChange` (D-174). |
| `total` | `number` | nombre de lignes | En mode `remote` : nombre total d'éléments qui correspondent. |
| `onStateChange` | `(state: ListPageState) => void` | aucun | `{ query, filters, sort, page }` à chaque changement ; plus `pageSize` avec `pageSizes`, et `selection: "all"` en `remote` après « Sélectionner les N éléments ». |
| `storageId` | `string` | `title` | Clé de mémorisation des filtres et du tri (D-177). |
| `onActionError` / `onActionDone` | comme `ActionBar` | aucun | Transmis à toutes les `ActionBar` du gabarit. |
| `onDropFiles` | `(files: File[]) => void` | aucun | Fichiers déposés n'importe où sur la page : cadre « Déposez les fichiers pour les ajouter », puis l'app ajoute (D-416). Sans lui, pas de dépôt. |
| `isDraggingFiles` | `boolean` | `false` | Survol de fichiers vu par l'app (glisser-déposer du système, Tauri) : affiche le cadre (D-416). |
| `dropLabel` | `string` | « Déposez les fichiers pour les ajouter » (i18n) | Texte du cadre de dépôt. |

## Exclus
- Pas de rendu de cellule libre ni de largeur de colonne fixée par l'app : le type décide (D-172).
- Pas de vues enregistrées ni de boutons segmentés dans la barre : les vues d'une page vont dans les onglets de l'`AppShell` (D-021).
- Pas de bouton « Actualiser » dans le gabarit : l'app le met dans ses actions si elle en a besoin.
- Pas de visuel libre (icône, avatar) en `list` : seulement l'aperçu de `thumbnail` (D-414).
- Pas de bascule liste / grille dans la barre : une page choisit sa variante (D-414).
- Pas de taille de vignette ni de rapport d'aperçu réglables : 200 px au moins, 4:3 (D-414).
- Pas de zone de dépôt dessinée dans la page : le dépôt prend toute la page (D-416).
- Pas de regroupement de lignes ni de tri multiple.
- Pas de réordonnancement des colonnes par glisser ; le menu « Colonnes » ne fait que masquer.
- Pas de bandeau en tête de page (D-159).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Premier chargement (`rows` vaut `undefined`) | En-tête, puis 6 lignes squelettes (D-084), ou 8 vignettes squelettes en `grid` (D-414). Pas de barre ni de pied. |
| Rechargement (`isLoading` avec des lignes) | Lignes gardées, barre de 2 px en haut de la liste, `aria-busy` (D-084). |
| Vide (aucune ligne, aucun critère) | En-tête (sans l'action `primary`, qui passe dans l'état vide), puis `EmptyState` : icône, titre, phrase, action principale. Ni barre, ni pied (D-176). |
| Aucun résultat (critères actifs) | Barre gardée ; message « Aucun résultat pour « … » » avec « Effacer la recherche », qui vide la recherche et les filtres (D-086, D-176). |
| Erreur au premier chargement | En-tête, puis message centré « Impossible de charger les résultats » et « Réessayer » (D-085). |
| Erreur avec des lignes | Lignes gardées, bandeau « Résultats non mis à jour » et « Réessayer » au-dessus (D-085) ; avec `updatedAt`, l'âge des données suit : « Dernière mise à jour il y a 12 minutes. », relu chaque minute (D-434). Une app qui garde des données passe toujours `updatedAt`. |
| Lignes cochées | Barre de sélection à la place de la barre d'outils (D-178). |
| Tous les éléments sélectionnés (`allowSelectAll`) | « 312 éléments sélectionnés » et « Effacer la sélection » ; les lignes chargées ensuite sont cochées (D-345). |
| Accès refusé (`isForbidden`) | Titre de la page, puis `EmptyState` `forbidden` ; ni actions, ni barre, ni liste, ni pied (D-351). |
| Fichiers au-dessus de la page (`onDropFiles`, ou `isDraggingFiles`) | Cadre pointillé `--accent` posé sur toute la page, texte « Déposez les fichiers pour les ajouter » (D-416). |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| La recherche filtre les lignes à chaque frappe (2 caractères, D-080), sans casse ni accents, chaque mot devant apparaître ; le texte trouvé passe en gras (D-087) | verrouillé | `Recherche` |
| Un filtre garde les lignes dont la valeur est la clé choisie (ou la contient, pour une liste) ; les filtres se combinent en ET (D-174) | verrouillé | `Filtres` |
| « Effacer la recherche » vide la recherche et les filtres (D-176) | verrouillé | `AucunResultat` |
| Tri au clic sur l'en-tête, sur la valeur et non sur le texte ; vides en dernier (D-172) | verrouillé | `Tri` |
| Les filtres, le tri, les colonnes masquées et les lignes par page sont mémorisés par page ; la recherche et la sélection ne le sont pas (D-177) | verrouillé | `Memorisation`, `Colonnes`, `LignesParPage` |
| Pied « more » : « 50 sur 312 » et « Afficher plus » ajoute une page ; « pages » : « 1–50 sur 312 » et `Pagination` (numéros, précédente, suivante ; focus gardé dans la pagination) ; une nouvelle page s'affiche depuis le haut ; une recherche ou un filtre ramène à la page 1 (D-175, D-359) | verrouillé | `Pagination`, `PaginationDefilement`, `AfficherPlus` |
| Tout tient sur une page : le pied ne montre que le compteur « 12 éléments » (D-175) | verrouillé | `ParDefaut` |
| Clic ou flèches : sélection (`onSelect`) ; double-clic ou Entrée : ouverture (`onOpen`) | verrouillé | `Ouverture` |
| Lignes cochées : barre « n sélectionnés », actions groupées, « Tout désélectionner » (D-178) | verrouillé | `Selection` |
| Vide : `EmptyState` avec l'action `primary` de la page ; pas de barre ni de pied (D-176) | verrouillé | `Vide` |
| `remote` : rien n'est filtré ni découpé par le gabarit ; `onStateChange` reçoit chaque changement (D-174) | verrouillé | `Distant` |
| Toute la page cochée, d'autres éléments ailleurs : « Sélectionner les N éléments » ; l'état « tout » va aux actions groupées (`"all"`) et, en `remote`, à `onStateChange` ; une recherche, un filtre ou une ligne décochée l'efface (D-345) | réglable par l'app (`allowSelectAll`) | `ToutSelectionner`, `ToutSelectionnerDistant`, `ToutSelectionnerParDefaut` |
| Menu « Colonnes » : une case par colonne ; la première et les `required` sont inactives ; choix mémorisé par page (D-346, D-007) | réglable par l'app (`allowColumnChoice`) | `Colonnes` |
| Tri à trois états : le troisième clic rend l'ordre d'origine, mémorisé comme le tri (D-347, D-177) | réglable par l'app (`allowsUnsort`) | `TriTroisEtats` |
| Lignes par page : 25, 50 ou 100 (liste réglable), mémorisé ; la page courante se lit dans `Pagination`, sans « Page n sur N » en double (seulement sous 641 px, dans `Pagination`) ; le changement ramène à la page 1 (D-348) | réglable par l'app (`pagination.pageSizes`) | `LignesParPage` |
| Accès refusé : cadenas, titre, phrase, « Demander l'accès » facultatif (D-351) | réglable par l'app (`isForbidden`) | `AccesRefuse` |
| Grille : vignettes de 200 px au moins, aperçu 4:3, sélection sur toute la vignette (D-414) | réglable par l'app (`layout="grid"`) | `Grille`, `GrilleChargement` |
| Grille : les flèches suivent la grille à l'écran (droite : la voisine ; bas : celle du dessous) ; Entrée ouvre (D-414) | verrouillé | `GrilleClavier` |
| Sans image, l'aperçu montre l'icône du type de fichier et son nom (D-414) | réglable par l'app (`thumbnail`) | `GrilleDocuments` |
| `thumbnail` en `list` : visuel de 40 px (D-414) | réglable par l'app | `ListeAvecVignettes` |
| File de tri : la ligne sélectionnée quitte `rows` ; la sélection passe à la suivante à l'écran, ou à la précédente si c'était la dernière ; une recherche ou un tri ne la déplace pas (D-415) | réglable par l'app (`advanceOnRemove`) | `AvancerApresTraitement` |
| Dépôt de fichiers sur toute la page ; un glisser qui sort ou finit ailleurs retire le cadre (D-416) | réglable par l'app (`onDropFiles`, `isDraggingFiles`) | `DepotDeFichiers`, `DepotSignaleParLApp` |

## Contenu
- Titre au pluriel, nom de ce qui est listé : « Demandes ».
- Titre vide au négatif : « Aucune demande » ; phrase qui dit à quoi sert la page.
- Libellés de filtre : nom au singulier (« État ») et première entrée « Tous les états ». Un filtre fait 160 px (`Select` largeur `sm`) : un libellé plus long est coupé.
- Recherche : `SearchInput`, 320 px (D-078) ; `search.label` complète « Rechercher dans … » (« les demandes »). Défaut : le titre en minuscules.
- Les libellés internes (compteur, pagination, sélection) sont dans `messages` (D-089).

## Densité
Hauteurs de ligne de `Table` et `List` (`--row-h`, `--row2-h`). Marges de l'en-tête, de la barre et du pied : `--pad` (16 px en web, 12 px en desktop). Pied : hauteur `--bar-h`. Barre de sélection : même hauteur que la barre d'outils (`--row-h`), la liste ne bouge pas.

## Clavier
Ordre de tabulation : actions de l'en-tête, recherche, filtres, liste, pied. Dans la liste : clavier de `Table` ou `List` ; en grille, les flèches se déplacent dans les deux sens, comme les vignettes à l'écran (D-414). Mod+F n'est pas pris par le gabarit.

## Accessibilité
Le titre est un `h1`. La liste porte le nom du titre. En grille, l'aperçu est décoratif (le titre nomme la vignette). Le compteur du pied est une région `aria-live="polite"`. La pagination est un `nav` nommé « Pagination ».

## Taille d'écran
Sous 640 px : actions de l'en-tête dans « … » (D-117) ; la barre passe à la ligne (recherche pleine largeur, filtres dessous).

## Erreurs
Erreur de chargement : états ci-dessus (D-085). Erreur d'une action : `onActionError`, que l'app relaie par un toast (D-154).

## Placement
Zone `main` d'`AppShell` (layout-rules, gabarit ListPage). Le panneau de détail montre la ligne sélectionnée.

## Composition
`ActionBar`, `SearchInput`, `Select`, `Table`, `List`, `EmptyState`, `FormattedValue`, `Button`, `Pagination`, `Badge` (grille). Rien d'autre.

## Décisions
D-021, D-080, D-084 à D-087, D-111, D-114, D-117, D-159, D-170 à D-178, D-382, D-414, D-415, D-416, D-434

## Questions ouvertes
Aucune.
