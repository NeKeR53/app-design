# Sidebar
Statut : validé (2026-11-21, v1 et v2) — Version : depuis 0.1.0
Validation : docs/validation/components/Sidebar-v1.html (sections et éléments sur deux lignes), docs/validation/components/Sidebar-v2.html (éléments du haut)

## Rôle
Navigation principale d'une app, dans la colonne de gauche d'AppShell. Elle choisit la **page** ; elle n'ouvre ni ne ferme jamais d'onglet de vue (D-021).
Ne pas l'utiliser pour :
- passer d'une vue à l'autre d'une page : prendre `Tabs` (dans AppShell) ;
- des réglages : prendre `SettingsPage` ;
- du contenu de travail (formulaire, filtres) : le mettre dans le gabarit.

## Anatomie
1. **Navigation** (obligatoire) : éléments de navigation `Sidebar.Item`.
2. **Sections** (facultatives, autant que nécessaire) : `Sidebar.Section`, titre repliable, qui contient soit des `Sidebar.Item`, soit des `Sidebar.TreeItem` (D-002). Jamais les deux dans la même section.
3. **Compte** (obligatoire) : `Sidebar.Account`, collé en bas, séparé par un trait.

### `Sidebar.Item` — élément de navigation, sur une ligne
1. Icône (obligatoire, 16 px, D-052).
2. Libellé (obligatoire).
3. Indicateur permanent (facultatif, un seul) : `external` (↗), `locked` (verrou) ou `activity` (point `--success`) ; icône en `--fg-3` ; info-bulle ; toujours visible, à gauche des actions ; jamais avec un compteur (D-055).
4. Chevron (si l'élément a des sous-pages) : après le libellé ; il déplie les sous-pages, sur un seul niveau, reliées par le trait de D-042. Une sous-page n'a pas d'icône (D-056).
5. Actions (facultatives, deux au plus) : boutons-icônes de 22 px et de 4 px de rayon (D-040), par exemple « + » et « … » ; elles remplacent le compteur quand elles s'affichent (D-053).

### `Sidebar.TreeItem` — élément sur deux lignes, avec enfants
1. Ligne 1 : titre, chevron s'il a des enfants, icône d'état facultative à droite (alerte, en cours).
2. Ligne 2 : sous-titre en `--fg-2`, coupé ; étiquette facultative à droite en `--fg-3`.
3. Enfants (facultatifs) : des `TreeItem` d'un seul niveau, en retrait. Une fois dépliés, ils sont reliés au parent par un trait vertical de 1 px en `--tree-line` ; le dernier enfant se termine par un coude arrondi de 8 px (D-042). Une fois repliés, ils sont résumés par une ligne de 24 px sous le parent (« 4 éléments · 2 non lus ») ; un clic sur la ligne les déplie (D-043).
4. Bouton « … » (automatique si l'app fournit des actions) : visible au survol et sur l'élément sélectionné ; il ouvre un `Menu`.

### `Sidebar.Section`
Titre en `--fs-sm`, `--fg-3`, sans majuscules, suivi d'un chevron. Un clic sur le titre replie ou déplie la section.

### `Sidebar.Account`
Avatar (initiales), nom, plan ou rôle en `--fg-3`, puis le bouton Réglages (roue dentée, `IconButton`, Mod+,). Un clic sur l'avatar et le nom ouvre le menu du compte, au-dessus du pied, si l'app fournit des entrées ; un chevron double le signale (D-046).

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `Sidebar.Item` : `id`, `icon`, `label` | — | — (obligatoires) | Élément de navigation. |
| `Sidebar.Item` : `actions` | `{ icon, label, onPress }[]` (2 au plus) | aucune | Actions à droite (D-002, D-007, D-053). « … » ouvre un `Menu`. |
| `Sidebar.Item` : `count` | `number` | aucun | Compteur gris à droite ; « 99+ » au-delà de 99 (D-044). Exclu avec `indicator`. |
| `Sidebar.Item` : `indicator` | `"external" \| "locked" \| "activity"` | aucun | Indicateur permanent à droite, avec info-bulle (D-055). Exclu avec `count`. |
| `Sidebar.Item` : `children` | `Sidebar.Item[]` sans icône | aucun | Sous-pages, sur un seul niveau (D-056). |
| `Sidebar.Item` : `tabbar` | `boolean` | `false` | L'élément va dans la barre d'onglets mobile (4 au plus) ; sinon dans la feuille « Plus » (D-003, D-019). |
| `Sidebar.Section` : `id`, `title` | — | — (obligatoires) | Section repliable. |
| `Sidebar.Section` : `limit` | `number` | `5` | Nombre d'éléments affichés avant « Afficher plus (n) » (D-045). |
| `Sidebar.TreeItem` : `id`, `title` | — | — (obligatoires) | Élément sur deux lignes. |
| `Sidebar.TreeItem` : `subtitle`, `meta`, `status`, `children`, `actions` | — | aucun | Sous-titre, étiquette, icône d'état, enfants, actions du menu « … ». |
| `Sidebar.TreeItem` : `unread` | `boolean` | `false` | Point accent de 6 px à droite du titre ; compté dans la ligne résumé du parent (D-044). |
| `Sidebar.Account` : `name`, `detail`, `avatar`, `onSettings` | — | — | Compte et accès aux réglages. |
| `Sidebar.Account` : `menu` | entrées de `Menu` | aucune | Menu du compte ; sans entrée, le nom est une simple étiquette (D-046). |
| `selectedId` / `onSelectionChange` | — | — (obligatoire) | Élément sélectionné (page courante). |

## Exclus
- Pas de troisième niveau : un `TreeItem` enfant n'a pas d'enfants, et une sous-page n'a pas de sous-pages (D-056).
- Pas d'élément de navigation sans icône.
- Pas de couleur par section ni par élément ; l'accent est réservé au non-lu (D-044).
- Pas de champ de recherche dans la sidebar : la recherche passe par la palette de commandes (Mod+K, D-006).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Par défaut | Sans fond ; libellé `--fg-2` (Item) ou titre `--fg` (TreeItem). |
| Survol | Fond `--hover` ; les actions et le « … » apparaissent. |
| Sélectionné | Fond `--selected`, fixe au survol : un clic sur l'élément sélectionné ne fait rien (D-039). Le texte tertiaire passe en `--fg-2` (contraste AA). |
| Focus clavier | Anneau de focus `--accent`. |
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
| Actions et « … » : visibles au survol, au focus et sur l'élément sélectionné ; elles remplacent alors le compteur ; sur tactile, appui long (D-007, D-053, D-054) | verrouillé | `ActionsAuSurvol` |
| Section longue : « Afficher plus (n) » au-delà de `limit` ; choix mémorisé ; l'élément sélectionné reste toujours visible (D-045) | réglable par app (`limit`) | `SectionLongue` |
| Aucune animation au repli des sections et des enfants (D-026) | verrouillé | `Sections` |

## Contenu
- Libellé ou titre trop long : coupé avec une ellipse, et texte complet dans une info-bulle.
- Sous-titre : une seule ligne, coupée.
- Section longue : 5 éléments, puis « Afficher plus (n) » ; ensuite « Afficher moins ». Choix mémorisé par section. Si l'élément sélectionné est au-delà, la section s'affiche en entier (D-045).

## Densité
Hauteurs `--row-h` (Item) et `--row2-h` (TreeItem). Largeur `--side-w`. Rayon de 8 px (D-040).

## Clavier
- Tab entre dans la sidebar sur l'élément sélectionné, puis passe au compte.
- Flèches haut et bas : élément précédent ou suivant, titres de section compris.
- Flèche droite : déplie (section ou parent) ; flèche gauche : replie, ou remonte au parent.
- Entrée : sélectionne. Maj+F10 ou la touche Menu : ouvre le menu « … ».
- Mod+B : replie ou déplie la sidebar (D-006).

## Accessibilité
- Repère `navigation` nommé « Navigation principale ».
- Navigation et sections : rôle `tree` (React Aria `Tree`), avec `aria-expanded` sur les sections et les parents.
- L'élément sélectionné porte `aria-current="page"`.
- Un élément non lu est annoncé « non lu » ; le compteur est annoncé avec son libellé (« À valider, 3 »).
- Les actions et le « … » ont un nom accessible et restent atteignables au clavier.

## Taille d'écran
Bureau et tablette : colonne de gauche. Mobile : barre d'onglets en bas, avec les éléments marqués `tabbar`, et feuille « Plus » pour le reste, sans doublons (D-003, D-019).

## Erreurs
Sans objet : une section qui ne peut pas charger son contenu affiche une ligne « Impossible de charger » avec « Réessayer ».

## Placement
Uniquement dans la zone `sidebar` d'AppShell. Une seule sidebar par fenêtre.

## Composition
Contient `IconButton`, `Tooltip` et `Menu`. Utilisée par `AppShell`.

## Décisions
D-002, D-003, D-006, D-007, D-016, D-017, D-019, D-021, D-026, D-039, D-040, D-042, D-043, D-044, D-045, D-046, D-052, D-053, D-054, D-055, D-056

## Questions ouvertes
Aucune.
