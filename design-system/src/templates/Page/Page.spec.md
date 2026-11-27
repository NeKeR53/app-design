# Page
Statut : validé (2026-11-26) — Version : depuis 0.3.0 ; `PageGrid` depuis 1.20.0 ; dépôt de fichiers depuis 1.22.0 ; `PageSection` encadrée et pied depuis 1.25.0 ; place de l’anneau de focus dans la barre depuis 1.26.0
Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/DetailPage-v1.html ; `PageGrid` et vue d'ensemble : par délégation de l'utilisateur, 2026-11-26 — docs/validation/components/PageGrid-v1.html ; dépôt de fichiers : par délégation de l'utilisateur, 2026-11-26 — docs/validation/components/PageDepot-v1.html (Q1 A, Q2 A) ; `PageSection` encadrée et pied : par délégation de l'utilisateur, 2026-11-27 — docs/validation/components/PageSection-v1.html (Q1 A, Q2 A)

## Rôle
Page composée : gabarit libre de la zone `main` d'AppShell, quand aucun autre gabarit ne convient (tableau de bord, éditeur, graphique, synthèse de quelques blocs). Elle pose les zones standard ; l'app y place des composants du socle, sans HTML stylé (D-217). Ses blocs s'empilent, ou se rangent côte à côte dans `PageGrid` pour tenir sur un écran (D-403, D-404). Elle reçoit les fichiers déposés n'importe où sur la page (D-418).
Ne pas l'utiliser pour :
- une collection : `ListPage` ;
- un élément ouvert : `DetailPage` ;
- une saisie : `FormPage` ;
- les réglages : `SettingsPage`.

`PageSection` est le bloc titré de `Page` et de `DetailPage`. `PageGrid` range des blocs côte à côte, en colonnes égales.

## Anatomie
1. **Barre d'outils** (facultative, fixe, trait dessous) : contenu libre à gauche sur une ligne (filtres, choix de période) ; actions à droite, zone `toolbar` (D-111).
2. **Contenu** (obligatoire, seule zone qui défile) : blocs empilés à 24 px (`PageSection` ou composants du socle), ou rangés côte à côte par `PageGrid`.
3. **Pied** (facultatif, fixe, trait dessus) : contenu libre en `--fs-sm`, `--fg-3` (total, état d'une sélection, pagination).
4. **Cadre de dépôt** (quand des fichiers survolent la page, avec `onDropFiles` ou `isDraggingFiles`) : posé sur toute la page, barre d'outils et pied compris, à 12 px des bords ; tirets 1 px `--accent`, rayon `--radius-md`, fond `--accent` à 6 % sur `--surface`, texte centré `--fs-md` `--accent` « Déposez les fichiers pour les ajouter ». Ne capte pas la souris (D-418).

`PageSection` :
1. titre `h2`, `--fs-lg`, semi-gras (obligatoire) ;
2. description d'une phrase, `--fs-sm`, `--fg-2` (facultative) ;
3. actions, zone `section`, à droite du titre (facultatives) ;
4. contenu ;
5. pied (facultatif, `footer`, D-423) : après le contenu, à 12 px ; collé en bas quand le bloc est plus haut que son contenu (ligne d'une `PageGrid`). Caché pendant le chargement, l'erreur et l'état vide.

`PageSection` encadrée (`framed`, D-423) : bloc compact d'une `PageGrid`. Fond `--surface`, trait 1 px `--line`, rayon 12 px, sans ombre, comme `Card` ; marge intérieure `--pad` ; titre `h2` en `--fs-md` ; 8 px sous l'en-tête.

`PageGrid` (D-403) :
1. colonnes égales, de 2 à 4 (`columns`), écart de 24 px entre colonnes et entre lignes, comme entre les blocs de `Page` (D-213) ;
2. les blocs dans l'ordre de lecture, ligne par ligne ; ceux d'une même ligne prennent la même hauteur ;
3. le nombre de colonnes suit la largeur de la grille, pas celle de la fenêtre : une colonne garde 240 px au moins. 2 colonnes à partir de 504 px ; 3 colonnes à partir de 768 px, 2 au-dessous ; 4 colonnes à partir de 1032 px, 2 au-dessous ; une seule sous 504 px.

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `toolbar` | `ReactNode` | aucune | Contenu libre de la barre, à gauche. Une seule ligne ; elle défile à l'horizontale si la place manque. |
| `actions` | `Action[]` | aucune | Actions de la barre, zone `toolbar`. La barre apparaît dès que `toolbar` ou `actions` est donné. |
| `actionsLabel` | `string` | aucun | Sujet des actions, pour leur nom accessible. |
| `footer` | `ReactNode` | aucun | Pied fixe. |
| `width` | `"full" \| "text"` | `"full"` | Toute la largeur, ou colonne de 760 px centrée (D-214). |
| `fill` | `boolean` | `false` | Le contenu prend la hauteur sans défiler (D-218). |
| `state` | `"ready" \| "loading" \| "error"` | `"ready"` | État de la page (D-215). |
| `onRetry` | `() => void` | aucun | « Réessayer » de l'état `error`. |
| `loadingLabel` | `string` | « Chargement… » | Nom annoncé pendant le chargement. |
| `onDropFiles` | `(files: File[]) => void` | aucun | Fichiers déposés n'importe où sur la page : cadre « Déposez les fichiers pour les ajouter », puis l'app ajoute (D-418). Sans lui, pas de dépôt DOM. |
| `isDraggingFiles` | `boolean` | `false` | Survol de fichiers vu par l'app (glisser-déposer du système, Tauri) : affiche le cadre (D-418). |
| `dropLabel` | `string` | « Déposez les fichiers pour les ajouter » (i18n) | Texte du cadre de dépôt. |
| `children` | `ReactNode` | — | Les blocs. |
| `PageSection` : `title` | `string` | — (obligatoire) | Titre du bloc. |
| `PageSection` : `description` | `string` | aucune | Une phrase. |
| `PageSection` : `actions` | `Action[]` | aucune | Zone `section` : un bouton secondaire `sm`, 2 icônes, « … » (D-113). |
| `PageSection` : `state` | `"ready" \| "loading" \| "error"` | `"ready"` | État de la section (D-216). |
| `PageSection` : `onRetry` | `() => void` | aucun | « Réessayer » de l'état `error`. |
| `PageSection` : `empty` | `{ title: string; description?: string; action?: Action }` | aucun | Donné, il remplace le contenu par un `EmptyState` compact (D-216). |
| `PageSection` : `framed` | `boolean` | `false` | Bloc encadré et compact, pour une `PageGrid` (D-423). |
| `PageSection` : `footer` | `ReactNode` | aucun | Pied du bloc, collé en bas : une ligne d'état, une barre d'avancement (D-423). |
| `PageGrid` : `columns` | `2 \| 3 \| 4` | `2` | Colonnes égales quand la place le permet ; moins de colonnes quand une colonne passerait sous 240 px (D-403). |
| `PageGrid` : `children` | `ReactNode` | — | Les blocs : `PageSection`, `Card`, un composant du socle. |

## Exclus
- Pas d'en-tête : le nom de la page est dans la barre du haut ; un élément ouvert prend `DetailPage` (D-217).
- Pas de barre d'outils sur plusieurs lignes.
- Pas de recherche de page en tête : elle va dans la barre d'outils de `ListPage`.
- Pas de bandeau (D-159), pas de `className` ni de `style`.
- Pas de zone de dépôt dessinée dans la page, ni de bloc `FileUpload` pour ajouter des fichiers à la page : le dépôt prend toute la page (D-404, D-418).
- `PageSection` : pas d'ombre, de fond coloré ni de bordure colorée, encadrée ou non ; pas d'actions dans le pied (elles restent dans l'en-tête, zone `section`) (D-423).
- `PageGrid` : pas de colonnes inégales, pas de largeur de colonne réglable, pas de bloc qui s'étend sur deux colonnes, pas de grille dans une grille (D-403).

## États
| État | Rendu |
|---|---|
| `ready` | Zones et blocs. |
| `loading` | Squelettes de deux blocs à la place du contenu, après 200 ms (D-165). La barre et le pied restent. |
| `error` | « Impossible de charger la page » avec « Réessayer » à la place du contenu (`role="alert"`). |
| Section `loading` | Titre, puis deux lignes de squelette. |
| Section `error` | Titre, puis message compact « Impossible de charger cette partie » avec « Réessayer ». |
| Section vide | Titre, puis `EmptyState` compact ; action en zone `empty`. |
| Fichiers au-dessus de la page (`onDropFiles`, ou `isDraggingFiles`) | Cadre pointillé `--accent` posé sur toute la page, texte « Déposez les fichiers pour les ajouter » (D-418). |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Barre et pied fixes, seul le contenu défile (D-217) | verrouillé | `Zones` |
| Barre d'une ligne, qui défile à l'horizontale (D-217) | verrouillé | `BarreEtroite` |
| `fill` : le contenu remplit la hauteur sans défiler (D-218) | réglable par page | `Remplir` |
| États de page et de section (D-215, D-216) | réglable par page | `Chargement`, `Erreur`, `EtatsDeSection` |
| `PageGrid` : blocs côte à côte, écart de 24 px, même hauteur sur une ligne (D-403) | réglable par page (`columns`) | `Grille`, `GrilleDeCartes` |
| `PageSection` : pied collé en bas, pieds d'une ligne alignés, cadre et titre compacts avec `framed` (D-423) | réglable par bloc (`framed`, `footer`) | `GrilleDeBlocsEncadres` |
| `PageSection` : pied caché pendant le chargement, l'erreur et l'état vide ; sans `framed`, pas de cadre (D-423) | verrouillé | `PiedDeBloc` |
| `PageGrid` : moins de colonnes quand la grille rétrécit, jamais sous 240 px par colonne ; 4 passe à 2 (D-403) | verrouillé | `GrilleEtroite` |
| Dépôt de fichiers sur toute la page ; un glisser qui sort ou finit ailleurs retire le cadre ; un dépôt déjà pris par un enfant (`FileUpload`, `ChatComposer`) n'est pas compté deux fois ; sans `onDropFiles`, aucun cadre (D-418) | réglable par l'app (`onDropFiles`) | `DepotDeFichiers`, `Zones` |
| `isDraggingFiles` affiche le cadre sans dépôt DOM ; `dropLabel` change son texte (D-418) | réglable par l'app (`isDraggingFiles`, `dropLabel`) | `DepotSignaleParLApp` |

## Contenu
- Titre de section long : à la ligne.
- Pied : une ligne courte ; nombres en chiffres tabulaires.
- Pied d'une `PageSection` (D-423) : ce qui se compare d'un bloc à l'autre, sur la même ligne de la grille (état, date, avancement). Le reste (une erreur, une note) va dans le contenu.
- Vue d'ensemble d'abord (D-404) : les informations clés tiennent sur un écran. Les blocs courts et de même rang (chiffres clés, listes courtes) se rangent côte à côte dans `PageGrid` ; pas de longue pile de blocs qu'il faut faire défiler pour comprendre la page.
- `width="text"` sert à un texte à lire (une note, une procédure). Un tableau de bord, une synthèse ou une page de travail prennent toute la largeur (D-214, D-404).
- Une action (importer, ajouter, actualiser) est une `Action` de la barre d'outils ou d'une section, jamais un bloc à elle seule (D-404).
- `dropLabel` : une phrase courte, sans point final, qui dit ce qui se passe : « Déposez le relevé pour l'importer » (D-418).

## Densité
Marges `--pad` ; `PageSection` encadrée : marge intérieure `--pad` (16 px en web, 12 px en desktop) ; écart de 24 px entre blocs dans les deux densités, et entre les colonnes de `PageGrid`.

## Clavier
Ordre de tabulation : barre d'outils (contenu libre, puis actions), contenu, pied. La barre qui défile garde chaque contrôle atteignable au clavier : le focus fait défiler la barre jusqu'au contrôle entier. Elle réserve `--focus-room` autour de ses contrôles : l'anneau de focus n'est jamais rogné (D-425). Dans `PageGrid`, l'ordre suit les blocs, ligne par ligne, de gauche à droite. Le dépôt est un geste de souris : au clavier, l'action « Ajouter… » ou « Importer… » de la barre d'outils (D-404, D-418).

## Accessibilité
- Barre d'outils : `role="toolbar"` nommé par `actionsLabel` s'il est donné.
- Pied : `footer`.
- `PageSection` : `section` nommée par son `h2`, encadrée ou non ; le pied est lu après le contenu, sans rôle propre.
- `PageGrid` : aucun rôle, aucune annonce ; l'ordre du document est l'ordre de lecture.
- Cadre de dépôt : un texte visible, sans rôle ; il ne prend jamais le focus (D-418).

## Taille d'écran
Sous 640 px : les icônes de la barre passent dans « … » (D-117) ; la barre défile à l'horizontale ; `width="text"` prend toute la largeur. `PageGrid` suit la largeur de sa grille : avec le panneau de détail ouvert, elle prend moins de colonnes (D-403).

## Erreurs
Chargement en échec : état `error` (page ou section). Action en échec : toast (D-154).

## Placement
Zone `main` d'AppShell. `PageSection` : dans `Page` et `DetailPage`. `PageGrid` : dans le contenu de `Page`, ou dans une `PageSection` (une rangée de `Card`) ; jamais dans `DetailPage` (colonne de lecture), un `Drawer`, une `Modal` ou un `Popover`.

## Composition
Contient `ActionBar`, `Skeleton`, `EmptyState`, `Button`, et le cadre de dépôt partagé avec `ListPage` et `ChatPage`. Les zones reçoivent des composants du socle (`Select`, `ComboBox`, `Table`, `List`, `Tabs`…). Ne contient pas d'autre gabarit. `PageGrid` reçoit des `PageSection`, des `Card` et des composants du socle ; pas une autre `PageGrid`.

## Décisions
D-085, D-111, D-113, D-117, D-154, D-159, D-165, D-166, D-213, D-214, D-215, D-216, D-217, D-218, D-382, D-403, D-404, D-416, D-418, D-423

## Questions ouvertes
Aucune.
