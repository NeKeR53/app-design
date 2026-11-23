# Card
Statut : validé (2026-11-23) — Version : depuis 1.0.0
Validation : docs/validation/components/Nouveaux-P2-P3-v1.html (C1 et C2, options A)

## Rôle
`Card` regroupe un contenu court qui forme un tout : un résumé, un chiffre clé, un élément d'une grille. Elle peut être entièrement cliquable quand elle a une seule action principale.

Ne pas l'utiliser pour :
- une liste d'éléments du même type : prendre `List` ou `Table` ;
- une section d'une page : prendre `PageSection` ;
- un contenu qui flotte (menu, info, fenêtre) : prendre `Popover` ou `Modal`.

## Anatomie
1. Conteneur (obligatoire) : fond `--surface`, trait 1 px `--line`, rayon 12 px (D-040), sans ombre (D-001). Marge intérieure `--pad`.
2. Titre (facultatif) : `h3` par défaut, `--fs-md`, `--fw-heading`.
3. Contenu (facultatif) : libre.
4. Pied d'actions (facultatif) : `ActionBar` de zone `section`, calé à droite.
5. « … » (carte cliquable avec actions) : en haut à droite, hors du lien.

## Variantes
| Variante | Rendu |
|---|---|
| `default` | Titre, contenu, pied d'actions. |
| `metric` | Libellé (`--fs-sm`, `--fg-3`, titre de la carte), valeur (`--fs-2xl`, semi-gras, chiffres à chasse fixe), évolution facultative. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `variant` | `"default" \| "metric"` | `"default"` | Carte simple ou chiffre clé. |
| `title` | `string` | aucun | Titre (`default`). Obligatoire pour une carte cliquable. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | Niveau du titre, selon la hiérarchie de la page. |
| `children` | `ReactNode` | aucun | Contenu (`default`). |
| `label` | `string` | — (obligatoire en `metric`) | Ce qui est compté. |
| `value` | `ReactNode` | — (obligatoire en `metric`) | La valeur, déjà formatée. |
| `delta` | `{ text, tone?, trend? }` | aucune | Évolution : texte complet, ton `positive`, `negative` ou `neutral` (défaut), sens de la flèche `up`, `down` ou `flat` (défaut : selon le ton). |
| `href` | `string` | aucun | Carte lien : toute la carte mène à l'adresse. |
| `onPress` | `() => void` | aucun | Carte bouton : toute la carte lance l'action. |
| `actions` | `Action[]` | aucune | Carte simple : pied d'actions (zone `section`). Carte cliquable : toutes dans « … ». |

## Exclus
- Pas d'ombre, d'image de fond, de couleur de fond ni de bordure colorée.
- Pas de lien ni de bouton dans une carte cliquable, hors du « … » : une seule cible.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Surface, trait fin. |
| Survol (cliquable) | Fond `--hover`, curseur main. |
| Pression (cliquable) | Fond `--selected`. |
| Focus clavier (cliquable) | Anneau `--focus` de 2 px autour de toute la carte. |

## Comportement
- Carte cliquable (D-361) : la cible est le titre (ou le libellé), étendue à toute la carte par un pseudo-élément. Le nom de la cible est donc le titre seul ; le contenu est lu après.
- Avec `href`, c'est un lien (`<a>`) ; avec `onPress` seul, un bouton. Avec les deux, le lien appelle aussi `onPress`.
- Les autres actions d'une carte cliquable passent dans « … », placé au-dessus de la cible et hors de l'élément lien : l'ouvrir ne suit pas le lien.
- Une action `danger` va en dernier dans « … » et se confirme (D-115).
- Sans titre (ni libellé), `href` et `onPress` sont ignorés : une cible sans nom n'est pas rendue.

## Contenu
- Titre : un nom court, sans point.
- `metric` : libellé au nom (« Commandes »), valeur formatée par `FormattedValue` ou l'app (« 1 284 », « 86 k€ »).
- `delta.text` : la variation et sa période (« +12 % sur 30 jours »). Le ton dit si c'est bien ou mal, pas le sens : moins de retards est `positive` avec `trend: "down"`.

## Densité
Marge intérieure `--pad` : 16 px en web, 12 px en desktop. Textes selon les tailles de la densité.

## Clavier
- Carte cliquable : un arrêt de Tab (la cible), puis « … » s'il existe. Entrée suit le lien ou lance l'action ; Espace lance l'action d'une carte bouton.
- Carte simple : Tab parcourt les actions du pied.

## Accessibilité
- Titre : vrai titre (`h2` à `h6`), pour la navigation par titres.
- Évolution : icône (flèche ou trait) et texte, jamais la couleur seule ; un mot caché dit le ton (« favorable », « défavorable »).
- Les actions forment un groupe nommé « Actions sur <titre> ».
- Valeur : chiffres à chasse fixe (`tabular-nums`) pour comparer d'une carte à l'autre.

## Taille d'écran
La carte prend la largeur que lui donne la grille de l'app. Le titre passe à la ligne, il n'est pas coupé.

## Erreurs
Une action qui échoue suit `ActionBar` (`onError`, D-116).

## Niveau de réglage
L'app choisit la variante, les textes, le niveau de titre, la cible et les actions. Le dessin est fixe.

## Placement
Dans une grille de la page composée (`Page`), un tableau de bord, un écran d'accueil. Pas dans une ligne de liste ni dans le panneau de détail.

## Composition
`ActionBar` (zones `section` et `row`), `DropdownMenu`, `IconButton`, icônes Socle.

## Décisions
D-001, D-040, D-111, D-115, D-116, D-361.

## Questions ouvertes
