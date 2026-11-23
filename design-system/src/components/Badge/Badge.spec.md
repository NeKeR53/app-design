# Badge et BadgeDot
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.1.0
Validation : docs/validation/components/Display-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Montrer l'état d'un élément : « Terminé », « En retard », « À venir ». `Badge` montre un point et un libellé ; `BadgeDot` montre le point seul, nommé, quand le libellé ne tient pas.
Ne pas l'utiliser pour :
- un non-lu : point accent de List et Sidebar (D-044) ;
- une erreur de chargement : bandeau ou message de Table et List (D-085) ;
- un compteur ou une étiquette de catégorie : à spécifier (`Tag`).

## Anatomie
1. Point de 7 px (obligatoire), coloré par le ton ; creux pour `pending` (D-161).
2. Libellé (obligatoire pour `Badge`), `--fs-xs`, `--fg-2`, sans fond (D-160).
3. `BadgeDot` : le point dans une cible de 24 px, avec une info-bulle qui donne le libellé (D-162).

## Variantes
| Ton | Point | Quand |
|---|---|---|
| `neutral` (défaut) | `--fg-3` | Un fait sans enjeu : « Archivé », « Désactivé ». |
| `pending` | creux, contour `--fg-3` | Pas encore commencé, à configurer : « À venir » (D-161). |
| `info` | `--info` | Nouveau, en cours. |
| `success` | `--success` | Terminé, actif, réussi. |
| `warning` | `--warning` | Un vrai avertissement : « En retard ». Jamais pour « à faire ». |
| `danger` | `--danger` | Bloqué, en échec. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `children` (Badge) | `string` | — (obligatoire) | Libellé de l'état. |
| `label` (BadgeDot) | `string` | — (obligatoire) | Nom accessible et texte de l'info-bulle (D-162). |
| `tone` | `StatusTone` | `"neutral"` | Ton (voir Variantes). |

## Exclus
- Pas de pastille à fond ni de fond teinté (D-160).
- Pas d'icône à la place du point, pas de couleur libre, pas de `className`.
- Pas d'action au clic : un statut se modifie dans le panneau de détail.

## États
Statique. `BadgeDot` : focus clavier avec anneau `--accent` de 2 px, info-bulle au survol (500 ms) et au focus (immédiat), comme Tooltip.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Six tons, libellé toujours visible (D-160, D-161) | verrouillé | `Tons` |
| Libellé trop long : coupé sur une ligne | verrouillé | `LibelleLong` |
| Point seul : nom accessible, focus clavier, info-bulle, cible de 24 px (D-162) | verrouillé | `PointSeul` |

## Contenu
- Libellé court : un ou deux mots, au participe ou à l'adjectif.
- Trop long : coupé avec « … » ; prévoir un libellé court plutôt que compter sur la coupe.

## Densité
Identique ; le texte suit `--fs-xs` de la densité.

## Clavier
`Badge` n'est pas focusable. `BadgeDot` est dans l'ordre de tabulation ; le focus affiche l'info-bulle. Dans une `Table` (grille), il sort de l'ordre de tabulation : les flèches lui donnent le focus, comme à toute cellule.

## Accessibilité
- `Badge` : le libellé est lu ; le point est `aria-hidden`.
- `BadgeDot` : `role="img"` et `aria-label` = `label`.
- Le libellé en `--fg-2` est AA dans les deux modes. Le sens ne repose jamais sur la couleur seule.

## Taille d'écran
Sans changement. Sur écran tactile, préférer `Badge` : l'info-bulle n'y apparaît pas.

## Erreurs
Sans objet.

## Placement
Ligne 2 d'un élément de List (D-044), cellule de Table, en-tête de DetailPage (statut), ligne du panneau de détail. `BadgeDot` : colonne étroite de Table, ligne de Sidebar.

## Composition
`BadgeDot` contient `Tooltip`. Ne pas mettre un statut et un point de non-lu côte à côte (D-044).

## Décisions
D-044, D-160, D-161, D-162, D-169

## Questions ouvertes
Aucune.
