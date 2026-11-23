# Spinner
Statut : validé (2026-11-23) — Version : depuis 1.0.0
Validation : docs/validation/components/Nouveaux-P2-P3-v1.html (SP1, option A)

## Rôle
`Spinner` montre une attente courte et locale : une cellule, un panneau, une ligne qui se met à jour. C'est l'indicateur rotatif de `Button` et `SearchInput` (D-081), exposé.

Ne pas l'utiliser pour :
- une action lancée par un bouton : prendre `isPending` de `Button` ou `IconButton` (D-105, D-107) ;
- un contenu dont on connaît la forme : prendre `Skeleton` ;
- une attente longue, ou dont on connaît l'avancement : prendre `ProgressBar`.

## Anatomie
1. Cercle (obligatoire) : trait de 2 px en couleur du texte (`--fg-2`), quart droit transparent. Il tourne.
2. Texte caché (si nommé) : lu par le lecteur d'écran.

## Variantes
| Taille | Rendu |
|---|---|
| `sm` (défaut) | 14 px. À côté d'un texte, dans une cellule, dans une ligne. |
| `md` | 20 px. Au centre d'un panneau ou d'une zone vide. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `size` | `"sm" \| "md"` | `"sm"` | 14 ou 20 px. |
| `label` | `string` | « Chargement… » (i18n) | Ce qui charge, lu par le lecteur d'écran. |
| `decorative` | `boolean` | `false` | Un texte visible à côté dit déjà l'attente : la roue est cachée aux lecteurs d'écran. |

## Exclus
- Pas d'autre taille, pas d'autre couleur, pas de texte visible intégré : l'app écrit son texte à côté.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Nommé | `role="status"` et texte caché (`label` ou « Chargement… »). |
| Décoratif | `aria-hidden="true"`, aucun rôle. |

## Comportement
- Animation `socle-spin` : un tour en 0,8 s.
- Mouvement réduit (`prefers-reduced-motion`) : un tour en 2,4 s, trois fois plus lent ; la roue tourne encore, pour dire que l'attente continue (D-014).
- L'app retire la roue quand l'attente finit ; un délai d'affichage (200 ms) reste à l'app si l'attente est souvent courte.

## Contenu
- `label` : un nom, sans verbe conjugué (« Chargement des commandes »).
- Texte visible à côté d'une roue décorative : un nom suivi de « … » (« Synchronisation… »).

## Densité
Tailles fixes, les mêmes en web et en desktop.

## Clavier
Rien : la roue ne prend pas le focus.

## Accessibilité
- Nommée : `role="status"` (zone d'annonce polie) ; le cercle est `aria-hidden`.
- Décorative : rien n'est lu ; le texte visible voisin porte le sens.
- Jamais nommée et décorative à la fois : `decorative` l'emporte.

## Taille d'écran
Aucune différence.

## Erreurs
Aucune : une attente qui échoue est remplacée par un message de l'app (`EmptyState`, encart, toast).

## Niveau de réglage
L'app choisit la taille, le nom ou le mode décoratif. Le dessin et la vitesse sont fixes.

## Placement
Dans la zone qui attend : une cellule, l'en-tête d'un panneau, une ligne. Jamais seule au centre d'une page entière (prendre `Skeleton`).

## Composition
Aucun composant Socle. `Button` et `IconButton` (roue interne `src/lib/pending.tsx`, qui garde son rôle `progressbar`) et `SearchInput` l'utilisent en mode décoratif. Dans un bouton, le cercle prend la couleur du bouton (variable interne `--spinner-fg`).

## Décisions
D-014, D-081, D-105, D-107, D-360.

## Questions ouvertes
