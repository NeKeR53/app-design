# Sidebar
Statut : validé (2026-11-21, v1 et v2) — Version : depuis 0.1.0 ; hauteur des lignes et espace de travail : 1.1.0 (D-368, D-369) ; icône de l'espace : 1.3.0 (D-379), par délégation de l'utilisateur
Validation : docs/validation/components/Sidebar-v1.html (sections et éléments sur deux lignes), docs/validation/components/Sidebar-v2.html (éléments du haut), docs/validation/components/Sidebar-footer-v1.html (pied : par délégation de l'utilisateur, 2026-11-23)

## Rôle
Navigation principale d'une app, dans la colonne de gauche d'AppShell. Elle choisit la **page** ; elle n'ouvre ni ne ferme jamais d'onglet de vue (D-021).
Ne pas l'utiliser pour :
- passer d'une vue à l'autre d'une page : prendre `Tabs` (dans AppShell) ;
- des réglages : prendre `SettingsPage` ;
- du contenu de travail (formulaire, filtres) : le mettre dans le gabarit ;
- un arbre de données (fichiers, dossiers, hiérarchies sur plusieurs niveaux) : prendre `TreeView`, dans la zone de contenu (D-260).

## Anatomie
1. **Navigation** (obligatoire) : éléments de navigation `Sidebar.Item`.
2. **Sections** (facultatives, autant que nécessaire) : `Sidebar.Section`, titre repliable, qui contient soit des `Sidebar.Item`, soit des `Sidebar.TreeItem` (D-002). Jamais les deux dans la même section.
3. **Pied**, collé en bas, hors du défilement, séparé par un seul trait (D-232), dans cet ordre :
   1. **Entrées fixes** (facultatives) : `Sidebar.Item`, 3 au plus, option `footer` (D-230) ;
   2. **Espace de travail** (facultatif) : `Sidebar.Workspace`, option `workspace` (D-231) ;
   3. **Compte** (obligatoire) : `Sidebar.Account`.

### `Sidebar.Item` — élément de navigation, sur une ligne
1. Icône (obligatoire, 16 px, D-052).
2. Libellé (obligatoire).
3. Indicateur permanent (facultatif, un seul) : `external` (↗), `locked` (verrou) ou `activity` (point gris `--side-fg-3` qui pulse, fixe si les animations sont réduites, D-395) ; icône en `--fg-3` ; info-bulle ; toujours visible, à gauche des actions ; jamais avec un compteur (D-055).
4. Chevron (si l'élément a des sous-pages) : après le libellé ; il déplie les sous-pages, sur un seul niveau, reliées par le trait de D-042. Une sous-page n'a pas d'icône (D-056).
5. Actions (facultatives, deux au plus) : boutons-icônes de 22 px et de 4 px de rayon (D-040), par exemple « + » et « … » ; elles remplacent le compteur quand elles s'affichent (D-053).

### `Sidebar.TreeItem` — élément sur deux lignes, avec enfants
1. Ligne 1 : titre, chevron s'il a des enfants, icône d'état facultative à droite (alerte, en cours).
2. Ligne 2 : sous-titre en `--fg-2`, coupé ; étiquette facultative à droite en `--fg-3`.
3. Enfants (facultatifs) : des `TreeItem` d'un seul niveau, en retrait. Une fois dépliés, ils sont reliés au parent par un trait vertical de 1 px en `--tree-line` ; le dernier enfant se termine par un coude arrondi de 8 px (D-042). Une fois repliés, ils sont résumés par une ligne de 24 px sous le parent (« 4 éléments · 2 non lus ») ; un clic sur la ligne les déplie (D-043).
4. Bouton « … » (automatique si l'app fournit des actions) : visible au survol, au focus et sur l'élément sélectionné ; il ouvre un `DropdownMenu`. Place : ligne 1, tout à droite, après le point non lu et l'icône d'état ; son icône s'aligne sur le bord droit de l'étiquette de la ligne 2 (D-368).

### `Sidebar.Section`
Titre en `--fs-sm`, `--fg-3`, sans majuscules, suivi d'un chevron. Un clic sur le titre replie ou déplie la section.

### `Sidebar.Workspace` (D-231)
Nom de l'espace ouvert, puis chevron haut-bas en `--fg-3`, sans repère ni avatar : l'avatar du compte, juste en dessous, reste le seul du pied (D-369). Il ouvre un `DropdownMenu` au-dessus du pied : section « Espaces de travail » en choix unique, l'espace ouvert coché, puis un trait et les actions de l'app. Un seul espace sans action : simple étiquette.

### `Sidebar.Account`
Avatar (initiales), nom, plan ou rôle en `--fg-3`, puis le bouton Réglages (roue dentée, `IconButton`, Mod+,). Un clic sur l'avatar et le nom ouvre le menu du compte, au-dessus du pied, si l'app fournit des entrées ; un chevron double le signale (D-046).

## Variantes
Aucune.

Variante signature d'un thème d'organisation (`theme.signature.navIndicator`, D-337) ; valeur par défaut : inchangée.
- `fill` (défaut) : l'élément actif a un fond plein (D-039).
- `bar` : le même fond, plus une barre de 3 px à gauche, en `--side-indicator`.

Couleurs : la sidebar lit des rôles dédiés, égaux par défaut aux rôles génériques : `--side-bg`, `--side-fg`, `--side-fg-2`, `--side-fg-3`, `--side-hover`, `--side-selected`, `--side-selected-fg`, `--side-indicator`, `--side-line`. Tout ce qu'elle contient les suit : sections, compteurs, pied, espace de travail, compte. Le point non lu est en `--highlight`. Le texte accentué (« · n non lus » de la ligne résumé, un lien) est en `--side-highlight`, égal par défaut à `--accent-text` : dans la sidebar, `--accent-text` pointe sur `--side-highlight`, pour qu'une sidebar sombre reste lisible (AA, D-338).

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `Sidebar.Item` : `id`, `icon`, `label` | — | — (obligatoires) | Élément de navigation. |
| `Sidebar.Item` : `actions` | `{ icon, label, onPress }[]` (2 au plus) | aucune | Actions à droite (D-002, D-007, D-053). « … » ouvre un `DropdownMenu`. |
| `Sidebar.Item` : `count` | `number` | aucun | Compteur gris à droite ; « 99+ » au-delà de 99 (D-044). Exclu avec `indicator`. |
| `Sidebar.Item` : `indicator` | `"external" \| "locked" \| "activity"` | aucun | Indicateur permanent à droite, avec info-bulle (D-055). Exclu avec `count`. |
| `Sidebar.Item` : `children` | `Sidebar.Item[]` sans icône | aucun | Sous-pages, sur un seul niveau (D-056). |
| `Sidebar.Item` : `tabbar` | `boolean` | `false` | L'élément va dans la barre d'onglets mobile (4 au plus) ; sinon dans la feuille « Plus » (D-003, D-019). |
| `Sidebar.Section` : `id`, `title` | — | — (obligatoires) | Section repliable. |
| `Sidebar.Section` : `limit` | `number` | `5` | Nombre d'éléments affichés avant « Afficher plus (n) » (D-045). |
| `Sidebar.Section` : `actions` | `{ icon, label, onPress }[]` (2 au plus) | aucune | Actions du titre de la section, à droite, en boutons-icônes de 22 px ; visibles au survol, au focus clavier et menu ouvert (D-386, D-392). Exemple : « + » pour créer un élément de la section. |
| `Sidebar.TreeItem` : `id`, `title` | — | — (obligatoires) | Élément sur deux lignes. |
| `Sidebar.TreeItem` : `subtitle`, `meta`, `status`, `children`, `actions` | — | aucun | Sous-titre, étiquette, icône d'état, enfants, actions du menu « … ». |
| `Sidebar.TreeItem` : `quickActions` | `{ icon, label, onPress }[]` | aucune | Actions en bouton-icône avant le « … », au survol, au focus et sur l'élément sélectionné ; deux boutons au plus en tout (une avec `actions`, deux sans). Une action rapide n'est pas répétée dans le menu (D-381). |
| `Sidebar.TreeItem` : `indicator` | `"activity"` | aucun | Point gris qui pulse, « En cours », à droite du titre, le même que `Sidebar.Item` (D-055, D-385, D-395). |
| `Sidebar.TreeItem` : `unread` | `boolean` | `false` | Point de 6 px en `--highlight` (l'accent par défaut) à droite du titre ; compté dans la ligne résumé du parent (D-044). |
| `Sidebar.Account` : `name`, `detail`, `avatar`, `onSettings` | — | — | Compte et accès aux réglages. |
| `Sidebar.Account` : `menu` | entrées de `DropdownMenu` | aucune | Menu du compte ; sans entrée, le nom est une simple étiquette (D-046). |
| `footer` | `Sidebar.Item` (3 au plus) | aucune | Entrées fixes du bas, au-dessus du compte (D-230). |
| `workspace` | `Sidebar.Workspace` | aucun | Sélecteur d'espace de travail, entre les entrées fixes et le compte (D-231). |
| `Sidebar.Workspace` : `workspaces`, `currentId`, `onChange` | `{ id, name }[]`, `string`, `(id) => void` | — (obligatoires) | Espaces proposés, espace ouvert, choix d'un autre espace. |
| `Sidebar.Workspace` : `actions` | entrées de `DropdownMenu` | aucune | Après un trait : « Créer un espace… », « Ouvrir un autre dossier… ». |
| `Sidebar.Workspace` : `isDisabled` | `boolean` | `false` | Désactivé (opacité 40 %), par exemple pendant une ouverture. |
| `Sidebar.Workspace` : `icon` | `ReactNode` | dossier (`Folder`) | Icône de l'espace, dans une case de 24 px alignée sur l'avatar du compte (D-379). Une icône, jamais un avatar. |
| `selectedId` / `onSelectionChange` | — | — (obligatoire) | Élément sélectionné (page courante). |

## Exclus
- Pas de troisième niveau : un `TreeItem` enfant n'a pas d'enfants, et une sous-page n'a pas de sous-pages (D-056).
- Pas d'élément de navigation sans icône.
- Pas de couleur par section ni par élément ; l'accent est réservé au non-lu (D-044).
- Pas de champ de recherche dans la sidebar : la recherche passe par la palette de commandes (Mod+K, D-006).
- Pas de section ni d'élément sur deux lignes dans `footer` : des `Sidebar.Item` seulement, 3 au plus (D-230).
- Pas de raccourci d'ouverture du sélecteur d'espace, ni de pastille d'état à plusieurs tons : solutions locales de l'app (D-232).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Par défaut | Sans fond ; libellé `--fg-2` (Item) ou titre `--fg` (TreeItem). |
| Survol | Fond `--hover` ; les actions et le « … » apparaissent ; la hauteur de la ligne ne change pas (D-368). |
| Sélectionné | Fond `--selected`, fixe au survol : un clic sur l'élément sélectionné ne fait rien (D-039). Le texte tertiaire passe en `--fg-2` (contraste AA). |
| Focus clavier | Anneau de focus `--accent`, tracé sur le bord du fond, à l'intérieur de la ligne : il ne touche jamais la ligne voisine (D-395). |
| Section repliée | Chevron vers la droite ; contenu masqué. |
| Section vide | La section n'est pas affichée. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Dépliée à l'ouverture, état mémorisé ; overlay au survol une fois repliée (D-016, D-017) | verrouillé | dans `AppShell` |
| Un clic sélectionne l'élément et change de page ; il ne touche pas aux onglets (D-021) | verrouillé | `Selection` |
| Sections : repliées ou dépliées au clic sur le titre ; état mémorisé par section (D-007) | verrouillé | `Sections` |
| Item : le chevron déplie les sous-pages sans sélectionner ; le parent d'une sous-page sélectionnée reste déplié ; état mémorisé (D-056) | verrouillé | `SousPages` |
| TreeItem : le chevron replie ou déplie les enfants, sans sélectionner ; la ligne résumé les déplie (D-043) ; état mémorisé | verrouillé | `Enfants` |
| Actions et « … » : visibles au survol, au focus clavier et tant que leur menu est ouvert, jamais sur le seul élément sélectionné ; elles remplacent alors le compteur ou les signes d’état ; sur tactile, appui long (D-007, D-053, D-054, D-386, D-393) | verrouillé | `ActionsAuSurvol` |
| Hauteur de ligne fixe au survol, au focus et à la sélection ; icône du « … » alignée sur l'étiquette de la ligne 2 (D-368) | verrouillé | `HauteurStable` |
| Section longue : « Afficher plus (n) » au-delà de `limit` ; choix mémorisé ; l'élément sélectionné reste toujours visible (D-045) | réglable par app (`limit`) | `SectionLongue` |
| Aucune animation au repli des sections et des enfants (D-026) | verrouillé | `Sections` |
| Entrées fixes : en bas, hors du défilement, même sélection que la navigation (D-230, D-232) | verrouillé | `PiedFixe` |
| Espace de travail : icône de dossier (ou `icon`) puis le nom, sans repère d'initiale (D-369, D-379) ; menu au-dessus, espace ouvert coché ; choisir l'espace ouvert ne fait rien ; un seul espace sans action : étiquette (D-231) | verrouillé | `EspaceDeTravail`, `EspaceUnique` |

## Contenu
- Libellé ou titre trop long : coupé avec une ellipse, et texte complet dans une info-bulle, à droite de la ligne : elle ne couvre pas les lignes voisines (D-395).
- Sous-titre : une seule ligne, coupée.
- Nom d'espace de travail trop long : coupé avec une ellipse, nom complet en info-bulle ; dans le menu, ellipse au-delà de 320 px (spec DropdownMenu).
- Section longue : 5 éléments, puis « Afficher plus (n) » ; ensuite « Afficher moins ». Choix mémorisé par section. Si l'élément sélectionné est au-delà, la section s'affiche en entier (D-045).

## Densité
Hauteurs `--row-h` (Item) et `--row2-h` (TreeItem), marges comprises. La hauteur d'une ligne ne change jamais au survol, au focus ni à la sélection : les actions et le « … » apparaissent sans l'agrandir (D-368). Largeur `--side-w`. Rayon de 8 px (D-040). Écart de 2 px transparent en haut et en bas de chaque ligne, dans sa hauteur : deux fonds voisins (survol, sélection) restent séparés de 4 px (D-395).

## Clavier
- Tab entre dans la sidebar sur l'élément sélectionné, puis passe aux entrées fixes, à l'espace de travail et au compte.
- Espace de travail : Entrée, Espace ou flèche bas ouvrent le menu ; Échap le ferme et rend le focus au bouton.
- Flèches haut et bas : élément précédent ou suivant, titres de section compris.
- Flèche droite : déplie (section ou parent) ; flèche gauche : replie, ou remonte au parent.
- Entrée : sélectionne. Maj+F10 ou la touche Menu : ouvre le menu « … ».
- Mod+B : replie ou déplie la sidebar (D-006).

## Accessibilité
- Repère `navigation` nommé « Navigation principale ». Les entrées fixes forment un second arbre, nommé « Navigation du bas ».
- Le sélecteur d'espace est un bouton nommé « Espace de travail : {nom}. Changer d'espace » ; le menu a une section de choix unique (`menuitemradio`, `aria-checked`).
- Navigation et sections : rôle `tree` (React Aria `Tree`), avec `aria-expanded` sur les sections et les parents.
- L'élément sélectionné porte `aria-current="page"`.
- Un élément non lu est annoncé « non lu » ; le compteur est annoncé avec son libellé (« À valider, 3 »).
- Les actions et le « … » ont un nom accessible et restent atteignables au clavier.

## Taille d'écran
Bureau et tablette : colonne de gauche. Mobile : barre d'onglets en bas, avec les éléments marqués `tabbar` (entrées fixes comprises), et feuille « Plus » pour le reste, sans doublons (D-003, D-019) ; le pied reste en bas de la feuille.

## Erreurs
Sans objet : une section qui ne peut pas charger son contenu affiche une ligne « Impossible de charger » avec « Réessayer ».

## Placement
Uniquement dans la zone `sidebar` d'AppShell. Une seule sidebar par fenêtre.

## Composition
Contient `IconButton`, `Tooltip` et `DropdownMenu`. Utilisée par `AppShell`.

## Décisions
D-002, D-003, D-006, D-007, D-016, D-017, D-019, D-021, D-026, D-039, D-040, D-042, D-043, D-044, D-045, D-046, D-052, D-053, D-054, D-055, D-056, D-230, D-231, D-232, D-260, D-337, D-338, D-368, D-369, D-381, D-385, D-386, D-392, D-393, D-395

## Questions ouvertes
Aucune.
