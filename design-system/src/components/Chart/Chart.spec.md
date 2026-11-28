# Chart
Statut : validé (2026-11-27, par délégation de l'utilisateur) — Version : depuis 1.27.0
Validation : docs/validation/components/Relecture-Graphique-Suivi-v1.html (Q4 A, Q5 A, Q6 A)

## Rôle
`Chart` dessine un graphique simple aux tokens du socle : des barres pour comparer des quantités, des lignes pour suivre une évolution. `Sparkline` dessine la petite courbe d'un chiffre clé, sans axe (dans `Card variant="metric"`, option `trend`).

Ne pas l'utiliser pour :
- un chiffre seul : `Card variant="metric"` ;
- un avancement ou une part d'un quota : `ProgressBar` ou `UsageRing` ;
- des valeurs à lire une par une, ou plus de 8 séries : `Table` ;
- un autre type de graphique (secteurs, nuage de points, carte de chaleur, carte) : hors design, à proposer (`/design propose`).

## Anatomie
`Chart` :
1. Légende (seulement avec 2 séries ou plus) : au-dessus du tracé, à gauche ; une pastille (carré de 10 px pour des barres, trait de 12 × 2 px pour des lignes) et le nom, `--fs-sm`, `--fg-2`. Une seule série n'a pas de légende : le titre du bloc la nomme (D-429).
2. Tracé : graduations horizontales en `--line` (la ligne du zéro en `--line-strong`), valeurs de l'axe à gauche en `--fs-xs`, `--fg-3`, chiffres à chasse fixe ; environ quatre graduations « rondes » (1, 2, 2,5, 5 × 10ⁿ), à partir de zéro.
3. Axe horizontal : les catégories en `--fs-xs`, `--fg-3` ; une sur k quand elles se chevaucheraient, comptées depuis la dernière (la plus récente est toujours nommée).
4. Marques : barres de 24 px au plus, bout arrondi de 4 px côté valeur, 2 px entre les barres d'un groupe ; lignes de 2 px, jointures arrondies. Couleurs `--chart-1` à `--chart-8`, dans l'ordre des séries (D-338).
5. Étiquette directe (une seule série) : la valeur qui compte (la dernière par défaut, ou la plus haute), en `--fs-xs` semi-gras `--fg-2`, au-dessus de la marque.
6. Info-bulle (survol ou clavier) : catégorie en `--tip-fg-2`, puis la valeur de chaque série, aux couleurs de `Tooltip` ; posée au-dessus de la plus haute valeur de la catégorie.
7. Repère de la catégorie active : bande `--hover` derrière les barres ; trait vertical `--line-strong` et points de 3,5 px cernés de `--surface` pour les lignes.

`Sparkline` : une série, 32 px de haut, toute la largeur ; trait de 1,5 px `--chart-1`, point de 2,5 px sur la dernière valeur ; ni axe, ni graduation, ni info-bulle.

## Variantes
| Variante | Rendu |
|---|---|
| `type="bar"` | Barres verticales, groupées par catégorie ; 3 séries au plus (les suivantes sont ignorées : prendre des lignes). |
| `type="line"` | Une ligne par série, 8 au plus ; une valeur `null` coupe la ligne. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `type` | `"bar" \| "line"` | — (obligatoire) | Barres ou lignes. |
| `label` | `string` | — (obligatoire) | Nom accessible, qui résume : « Commandes par semaine, de 212 à 312 ». |
| `categories` | `string[]` | — (obligatoire) | Catégories de l'axe horizontal, dans l'ordre. |
| `series` | `{ id, label, values: (number \| null)[] }[]` | — (obligatoire) | De 1 à 8 séries (3 pour des barres), une valeur par catégorie. |
| `formatValue` | `(value: number) => string` | nombre français | Formate l'axe, l'étiquette, l'info-bulle et le tableau. |
| `highlight` | `"last" \| "max" \| "none"` | `"last"` | Valeur qui reçoit l'étiquette directe (une seule série). |
| `size` | `"sm" \| "md"` | `"md"` | Hauteur du tracé : 160 ou 232 px. |
| `Sparkline` : `values` | `number[]` | — (obligatoire) | Les valeurs, dans l'ordre du temps ; deux au moins, sinon rien n'est rendu. |
| `Sparkline` : `label` | `string` | — (obligatoire) | Nom accessible : ce que montre la courbe, son début et sa fin. |
| `Sparkline` : `formatValue` | `(v: number) => string` | aucune | Écrit la dernière valeur et son unité à droite de la courbe (« 4 min »), `--fg` moyen, chiffres de largeur égale (D-435). |
| `Sparkline` : `fromZero` | `boolean` | `false` | Échelle depuis zéro, avec un trait de base `--line-strong` : un écart de 10 % ne se dessine pas comme un saut (D-435). |

## Exclus
- Pas de couleur choisie par l'app, pas de couleur d'état pour une série (D-338), pas de dégradé ni d'aire remplie.
- Pas de second axe vertical, pas de barres empilées, pas de barres horizontales, pas de graphique en secteurs.
- Pas d'animation d'entrée.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Tracé, étiquette directe. |
| Survol | Catégorie sous le pointeur : repère, info-bulle, nom de la catégorie en `--fg`. |
| Focus clavier | Anneau `--focus` de 2 px autour du tracé (D-425) ; la catégorie active a son repère et son info-bulle. |
| Sans données | « Aucune donnée » centré, `--fs-sm`, `--fg-3`, à la hauteur du tracé ; pas d'arrêt de Tab. |
| Chargement, erreur | Portés par le bloc qui contient le graphique : `PageSection state="loading"` ou `"error"`, `isRefreshing` (D-426). |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Une série : pas de légende, étiquette directe ; barres de 24 px au plus, `--chart-1` (D-429) | verrouillé | `Barres` |
| Plusieurs séries : couleurs dans l'ordre, légende ; un `null` coupe la ligne (D-429) | verrouillé | `Lignes` |
| Barres : 3 séries au plus (D-429) | verrouillé | `BarresGroupees` |
| Un seul arrêt de Tab ; flèches, Début, Fin, Échap ; la valeur est annoncée ; tableau caché (D-430) | verrouillé | `Clavier` |
| Survol : repère et info-bulle de la catégorie (D-430) | verrouillé | `Survol` |
| Sans données : message, pas d'arrêt de Tab | verrouillé | `SansDonnees` |
| Axe dense : une étiquette sur k, sans chevauchement, la dernière nommée (D-429) | verrouillé | `AxeDense` |
| `Sparkline` : 32 px, `--chart-1`, nommée (D-429) | verrouillé | `PetiteCourbe` |
| `Sparkline` hors de `Card metric` : la dernière valeur et son unité à droite (`formatValue`), sinon pas de courbe (D-435) | réglable (`formatValue`, `fromZero`) | `PetiteCourbeChiffree` |

## Contenu
- `label` résume ce que le graphique montre et son mouvement : « Commandes par semaine, de 212 à 312 ». Le titre du bloc reste court : « Commandes par semaine ».
- Une courbe porte au moins sa valeur courante et son unité (D-435) : dans `Card metric`, c'est le chiffre de la carte ; ailleurs, `formatValue`. Une courbe sans valeur ni repère décore sans informer : ne pas l'afficher. Une durée, une taille ou un compte se lisent depuis zéro (`fromZero`).
- Catégories courtes : « S48 », « 12/11 », « T4 ». Les valeurs passent par `formatValue` (« 86 k€ », « 3,5 min »).
- Noms de série au nom (« Commandes », « Retours »), sans unité si le titre la donne.

## Densité
Même dessin dans les deux densités ; les textes suivent `--fs-xs` et `--fs-sm` de la densité.

## Clavier
- Tab : un seul arrêt sur le tracé.
- Flèche gauche ou haut / droite ou bas : catégorie précédente / suivante. La première flèche part de la valeur mise en avant.
- Début / Fin : première / dernière catégorie. Échap : ferme l'info-bulle. Quitter le tracé la ferme aussi.

## Accessibilité
- Le tracé est un groupe (`role="group"`) nommé par `label` ; le dessin SVG est caché aux lecteurs d'écran.
- Un vrai tableau, caché à l'écran, donne toutes les valeurs (légende « Données du graphique : … », une ligne par catégorie, une colonne par série) ; il décrit le groupe (`aria-describedby`).
- La catégorie atteinte au clavier est annoncée (`aria-live="polite"`) : « S47 : 288 ».
- Une série ne se distingue jamais par la seule couleur dans le texte : légende et info-bulle la nomment.
- `Sparkline` : `role="img"`, nommée par `label`.

## Taille d'écran
Le graphique prend la largeur de son bloc et se redessine quand elle change (pas selon la fenêtre). Les étiquettes de l'axe horizontal s'espacent quand la place manque.

## Erreurs
Aucune erreur propre : une lecture en échec se montre sur le bloc (`PageSection state="error"`).

## Niveau de réglage
L'app choisit le type, les données, les noms, le format des valeurs, la valeur mise en avant et la hauteur. Le dessin, les couleurs et le comportement sont fixes.

## Placement
Dans une `PageSection` (titre et description du bloc), le plus souvent côte à côte avec un tableau dans une `PageGrid` (recette « Tableau de bord ») ; `Sparkline` dans `Card variant="metric"` (option `trend`) ou dans un bloc encadré (recette « Tableau de suivi »). Pas dans une ligne de liste ni dans une cellule de tableau.

## Composition
SVG maison, sans dépendance (D-428) ; couleurs et textes aux tokens ; info-bulle aux tokens de `Tooltip` ; anneau de focus commun (`nativeFocusRing`, D-425).

## Décisions
D-338, D-425, D-426, D-428, D-429, D-430, D-435.

## Questions ouvertes
Aucune.
