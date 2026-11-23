# Separator
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.1.0
Validation : docs/validation/components/Display-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Séparer deux groupes d'une même zone par un trait, quand un écart ne suffit pas.
Ne pas l'utiliser pour : séparer les lignes d'une liste ou d'un tableau (traits intégrés, D-064, D-068), ou les sections d'un panneau de détail (déjà séparées).

## Anatomie
Un trait `--line` de 1 px (D-168).

## Variantes
| Orientation | Rendu |
|---|---|
| `horizontal` (défaut) | Toute la largeur, marges de 12 px en haut et en bas. |
| `vertical` | Toute la hauteur du parent, marges de 2 px à gauche et à droite. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Sens du trait. |

## Exclus
Pas de libellé dans le trait, pas d'épaisseur ni de couleur réglable, pas de `className`.

## États
Statique.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Trait de 1 px horizontal (D-168) | verrouillé | `Horizontal` |
| Vertical : `aria-orientation="vertical"`, 1 px de large | verrouillé | `Vertical` |

## Contenu
Sans objet.

## Densité
Identique.

## Clavier
Non focusable.

## Accessibilité
`role="separator"` (React Aria). Trait décoratif : pas d'exigence de contraste.

## Taille d'écran
Sans changement.

## Erreurs
Sans objet.

## Placement
Entre deux groupes d'une section (DetailPage, FormPage), entre deux éléments d'une barre.

## Composition
Ne contient rien.

## Décisions
D-064, D-068, D-168

## Questions ouvertes
Aucune.
