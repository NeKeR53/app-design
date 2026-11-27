# Card
Statut : validé (2026-11-23) — Version : depuis 1.0.0 ; `isLoading`, `isRefreshing`, `trend` (metric) depuis 1.27.0
Validation : docs/validation/components/Nouveaux-P2-P3-v1.html (C1 et C2, options A) ; attente, relecture et petite courbe : par délégation de l'utilisateur, 2026-11-27 — docs/validation/components/Relecture-Graphique-Suivi-v1.html (Q1 A, Q6 A)

## Rôle
`Card` regroupe un contenu court qui forme un tout : un résumé, un chiffre clé, un élément d'une grille. Elle peut être entièrement cliquable quand elle a une seule action principale.

Ne pas l'utiliser pour :
- une liste d'éléments du même type : prendre `List` ou `Table` ;
- une section d'une page : prendre `PageSection` ;
- un bloc de grille avec titre, actions dans l'en-tête et pied collé en bas (un élément suivi) : prendre `PageSection` avec `framed` et `footer` (D-423) ;
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
| `metric` | Libellé (`--fs-sm`, `--fg-3`, titre de la carte), valeur (`--fs-2xl`, semi-gras, chiffres à chasse fixe), évolution facultative, petite courbe facultative (`Sparkline`, 32 px, D-428). |

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
| `isLoading` | `boolean` | `false` | `metric` : valeur pas encore lue. Squelette de la hauteur du chiffre à la place de la valeur, de l'évolution et de la courbe ; libellé et cible gardés (D-426). À la place d'un « … » écrit par l'app. |
| `isRefreshing` | `boolean` | `false` | `metric` : relecture en fond. Valeur gardée, barre de 2 px sur le bord haut, `aria-busy`. Ignoré avec `isLoading` (D-426). |
| `trend` | `number[]` | aucune | `metric` : valeurs de la période, dans l'ordre ; petite courbe sous l'évolution (`Sparkline`, D-428). |
| `trendLabel` | `string` | le libellé | `metric` : nom accessible de la courbe, avec son début et sa fin : « Commandes sur 12 semaines, de 212 à 312 ». |
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
| Survol (cliquable) | Fond `--hover` en fondu `--dur-fast`, curseur main. |
| Changement de thème | Le fond change d'un coup, en même temps que les textes : pas de fondu au repos (D-424). |
| Pression (cliquable) | Fond `--selected`. |
| Focus clavier (cliquable) | Anneau `--focus` de 2 px autour de toute la carte. |
| Valeur en attente (`metric`, `isLoading`) | Libellé, puis une forme `--field` de 45 % de large à la hauteur du chiffre (la carte garde sa taille) ; `aria-busy`, nom « Chargement… » ; pas d'évolution ni de courbe (D-426). |
| Relecture (`metric`, `isRefreshing`) | Valeur, évolution et courbe gardées ; barre de 2 px `--accent` qui défile sur le bord haut, dans le rayon, sans capter la souris ; `aria-busy` (D-426). |

## Comportement
- Carte cliquable (D-361) : la cible est le titre (ou le libellé), étendue à toute la carte par un pseudo-élément. Le nom de la cible est donc le titre seul ; le contenu est lu après.
- Avec `href`, c'est un lien (`<a>`) ; avec `onPress` seul, un bouton. Avec les deux, le lien appelle aussi `onPress`.
- Les autres actions d'une carte cliquable passent dans « … », placé au-dessus de la cible et hors de l'élément lien : l'ouvrir ne suit pas le lien.
- Une action `danger` va en dernier dans « … » et se confirme (D-115).
- Sans titre (ni libellé), `href` et `onPress` sont ignorés : une cible sans nom n'est pas rendue.

## Contenu
- Titre : un nom court, sans point.
- `metric` : libellé au nom (« Commandes »), valeur formatée par `FormattedValue` ou l'app (« 1 284 », « 86 k€ »).
- Valeur pas encore lue : `isLoading`, jamais « … », « — » ou « 0 » écrits par l'app (« — » reste pour une valeur qui n'existe pas sur la période).
- `trendLabel` : ce que montre la courbe, sa période, son début et sa fin.
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
La carte prend la largeur que lui donne sa `PageGrid` (D-403). Le titre passe à la ligne, il n'est pas coupé.

## Erreurs
Une action qui échoue suit `ActionBar` (`onError`, D-116).

## Niveau de réglage
L'app choisit la variante, les textes, le niveau de titre, la cible et les actions. Le dessin est fixe.

## Placement
Dans une `PageGrid` de la page composée (`Page`) : une rangée de chiffres clés, un tableau de bord, un écran d'accueil (D-403). Pas dans une ligne de liste ni dans le panneau de détail.

## Composition
`ActionBar` (zones `section` et `row`), `DropdownMenu`, `IconButton`, `Skeleton`, `Sparkline` (D-428), la barre de relecture commune (D-084, D-426), icônes Socle.

## Décisions
D-001, D-040, D-111, D-115, D-116, D-361, D-403, D-423, D-424, D-426, D-428.

## Questions ouvertes
