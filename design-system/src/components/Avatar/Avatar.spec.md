# Avatar
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.1.0
Validation : docs/validation/components/Display-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Représenter une personne (ou un compte) par son image ou ses initiales, à côté de son nom.
Ne pas l'utiliser pour :
- une icône d'élément ou une vignette de fichier : visuel `icon` ou `thumbnail` de List (D-069) ;
- un logo d'app ou de marque.

## Anatomie
1. Cercle (obligatoire), 24, 32 ou 40 px.
2. Image (facultative), qui remplit le cercle.
3. Initiales (à défaut d'image), `--fw-semibold`, `--fg`, sur fond neutre `--field` (D-163).

## Variantes
Une seule, à fond neutre. Dans la sidebar, le fond passe à `--selected` pour rester visible sur `--surface-side` (D-169).

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `name` | `string` | — (obligatoire) | Nom accessible et source des initiales. |
| `src` | `string` | aucune | Adresse de l'image. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 24, 32 ou 40 px. |

## Exclus
- Pas de fond teinté calculé à partir du nom (D-163).
- Pas de pastille de présence, pas de groupe d'avatars empilés, pas d'action au clic dans cette version.

## États
Avec image ; sans image (initiales) ; image en erreur (initiales).

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Initiales : premier et dernier mot qui commencent par une lettre ; « ? » sinon (D-163) | verrouillé | `Initiales` |
| Trois tailles : 24, 32, 40 px | verrouillé | `Tailles` |
| Image en erreur : les initiales la remplacent | verrouillé | `Image` |

## Contenu
Nom très long : seules deux lettres s'affichent. Nom sans lettre : « ? ».

## Densité
Identique dans les deux densités : la taille est choisie par l'usage (`sm` dans une ligne d'une ligne, `md` dans un élément sur deux lignes).

## Clavier
Non focusable.

## Accessibilité
`role="img"`, `aria-label` = `name`. Quand le nom est écrit juste à côté (compte de la sidebar), l'avatar est masqué aux lecteurs d'écran par le composant qui l'utilise. Initiales `--fg` sur `--field` : AA.

## Taille d'écran
Sans changement.

## Erreurs
Image qui ne charge pas : initiales, sans message.

## Placement
Visuel `avatar` de List (32 px), compte de la Sidebar (24 px), ligne du panneau de détail (24 px), en-tête d'une fiche de personne (40 px).

## Composition
Ne contient rien d'autre. Se place à gauche d'un nom.

## Décisions
D-069, D-163, D-169

## Questions ouvertes
Aucune.
