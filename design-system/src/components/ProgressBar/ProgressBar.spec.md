# ProgressBar
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.1.0
Validation : docs/validation/components/Display-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Montrer l'avancement d'une tâche (import, envoi) ou la part utilisée d'un quota.
Ne pas l'utiliser pour :
- le rechargement d'une liste ou d'un tableau : barre de 2 px de Table et List (D-084) ;
- une attente courte dans un bouton : état de chargement de `Button` ;
- un chargement de page : `SkeletonGroup`.

## Anatomie
1. Libellé (obligatoire), au-dessus, `--fs-sm`, `--fg-2`.
2. Valeur (facultative), à droite du libellé, `--fg-3`, chiffres tabulaires : « 60 % » ou « 18 / 30 ».
3. Rail de 4 px (obligatoire), `--field`, rayon plein (D-164).
4. Remplissage, `--accent` par défaut.

## Variantes
| Ton | Quand |
|---|---|
| `accent` (défaut) | Avancement normal. |
| `warning` | Seuil proche : quota presque plein. |
| `danger` | Seuil dépassé. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Ce qui avance ; nom accessible. |
| `value` | `number` | aucune | Valeur ; sans elle, barre indéterminée. |
| `max` | `number` | `100` | Valeur maximale ; à 100, la valeur s'affiche en pourcentage. |
| `showValue` | `boolean` | `true` | Affiche la valeur. |
| `tone` | `"accent" \| "warning" \| "danger"` | `"accent"` | Ton du remplissage. |

## Exclus
- Pas de barre circulaire, pas de segments, pas de texte dans la barre.
- Pas d'autre couleur, pas de `className`.

## États
Déterminée ; indéterminée (un segment de 30 % défile) ; terminée (100 %).

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Valeur en % à droite ; rail de 4 px (D-164) | verrouillé | `ParDefaut` |
| `max` autre que 100 : « 18 / 30 », annoncé « 18 sur 30 » | verrouillé | `Fraction` |
| Valeur hors bornes ramenée entre 0 et `max` | verrouillé | `Bornes` |
| Sans valeur : indéterminée, segment qui défile, fixe et à demi opaque si animations réduites | verrouillé | `Indeterminee` |
| Changement de valeur : largeur animée en `--dur-slow` | verrouillé | `Tons` |

## Contenu
Libellé long : coupé sur une ligne. Valeur 0 : rail vide. Grands nombres : affichés tels quels.

## Densité
Le texte suit la densité ; le rail garde 4 px.

## Clavier
Non focusable.

## Accessibilité
`role="progressbar"` (React Aria), `aria-label` = `label`, `aria-valuenow`, `aria-valuemax`, `aria-valuetext` (« 60 % » ou « 18 sur 30 », dictionnaire `progressOf`, D-089). Remplissage accent : contraste 3:1 sur `--field`.

## Taille d'écran
Prend toute la largeur de son conteneur.

## Erreurs
Une tâche en échec n'est pas une barre rouge : on remplace la barre par un message (notification ou bandeau).

## Placement
Panneau de détail, ligne de réglage, carte de tâche, notification. Jamais dans la `topbar`.

## Composition
Ne contient rien d'autre. Peut suivre un `StatusBadge`.

## Décisions
D-014, D-084, D-089, D-164

## Questions ouvertes
Aucune.
