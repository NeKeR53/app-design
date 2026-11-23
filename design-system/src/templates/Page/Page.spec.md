# Page
Statut : validé (2026-11-23) — Version : depuis 0.3.0
Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/DetailPage-v1.html

## Rôle
Page composée : gabarit libre de la zone `main` d'AppShell, quand aucun autre gabarit ne convient (tableau de bord, éditeur, graphique, synthèse de quelques blocs). Elle pose les zones standard ; l'app y place des composants du socle, sans HTML stylé (D-217).
Ne pas l'utiliser pour :
- une collection : `ListPage` ;
- un élément ouvert : `DetailPage` ;
- une saisie : `FormPage` ;
- les réglages : `SettingsPage`.

`PageSection` est le bloc titré de `Page` et de `DetailPage`.

## Anatomie
1. **Barre d'outils** (facultative, fixe, trait dessous) : contenu libre à gauche sur une ligne (filtres, choix de période) ; actions à droite, zone `toolbar` (D-111).
2. **Contenu** (obligatoire, seule zone qui défile) : blocs empilés à 24 px (`PageSection` ou composants du socle).
3. **Pied** (facultatif, fixe, trait dessus) : contenu libre en `--fs-sm`, `--fg-3` (total, état d'une sélection, pagination).

`PageSection` :
1. titre `h2`, `--fs-lg`, semi-gras (obligatoire) ;
2. description d'une phrase, `--fs-sm`, `--fg-2` (facultative) ;
3. actions, zone `section`, à droite du titre (facultatives) ;
4. contenu.

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
| `children` | `ReactNode` | — | Les blocs. |
| `PageSection` : `title` | `string` | — (obligatoire) | Titre du bloc. |
| `PageSection` : `description` | `string` | aucune | Une phrase. |
| `PageSection` : `actions` | `Action[]` | aucune | Zone `section` : un bouton secondaire `sm`, 2 icônes, « … » (D-113). |
| `PageSection` : `state` | `"ready" \| "loading" \| "error"` | `"ready"` | État de la section (D-216). |
| `PageSection` : `onRetry` | `() => void` | aucun | « Réessayer » de l'état `error`. |
| `PageSection` : `empty` | `{ title: string; description?: string; action?: Action }` | aucun | Donné, il remplace le contenu par un `EmptyState` compact (D-216). |

## Exclus
- Pas d'en-tête : le nom de la page est dans la barre du haut ; un élément ouvert prend `DetailPage` (D-217).
- Pas de barre d'outils sur plusieurs lignes.
- Pas de recherche de page en tête : elle va dans la barre d'outils de `ListPage`.
- Pas de bandeau (D-159), pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| `ready` | Zones et blocs. |
| `loading` | Squelettes de deux blocs à la place du contenu, après 200 ms (D-165). La barre et le pied restent. |
| `error` | « Impossible de charger la page » avec « Réessayer » à la place du contenu (`role="alert"`). |
| Section `loading` | Titre, puis deux lignes de squelette. |
| Section `error` | Titre, puis message compact « Impossible de charger cette partie » avec « Réessayer ». |
| Section vide | Titre, puis `EmptyState` compact ; action en zone `empty`. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Barre et pied fixes, seul le contenu défile (D-217) | verrouillé | `Zones` |
| Barre d'une ligne, qui défile à l'horizontale (D-217) | verrouillé | `BarreEtroite` |
| `fill` : le contenu remplit la hauteur sans défiler (D-218) | réglable par page | `Remplir` |
| États de page et de section (D-215, D-216) | réglable par page | `Chargement`, `Erreur`, `EtatsDeSection` |

## Contenu
- Titre de section long : à la ligne.
- Pied : une ligne courte ; nombres en chiffres tabulaires.

## Densité
Marges `--pad` ; écart de 24 px entre blocs dans les deux densités.

## Clavier
Ordre de tabulation : barre d'outils (contenu libre, puis actions), contenu, pied. La barre qui défile garde chaque contrôle atteignable au clavier : le focus fait défiler la barre.

## Accessibilité
- Barre d'outils : `role="toolbar"` nommé par `actionsLabel` s'il est donné.
- Pied : `footer`.
- `PageSection` : `section` nommée par son `h2`.

## Taille d'écran
Sous 640 px : les icônes de la barre passent dans « … » (D-117) ; la barre défile à l'horizontale ; `width="text"` prend toute la largeur.

## Erreurs
Chargement en échec : état `error` (page ou section). Action en échec : toast (D-154).

## Placement
Zone `main` d'AppShell. `PageSection` : dans `Page` et `DetailPage`.

## Composition
Contient `ActionBar`, `Skeleton`, `EmptyState`, `Button`. Les zones reçoivent des composants du socle (`Select`, `ComboBox`, `Table`, `List`, `Tabs`…). Ne contient pas d'autre gabarit.

## Décisions
D-085, D-111, D-113, D-117, D-154, D-159, D-165, D-166, D-213, D-214, D-215, D-216, D-217, D-218

## Questions ouvertes
Aucune.
