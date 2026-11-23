# Skeleton et SkeletonGroup
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.1.0
Validation : docs/validation/components/Display-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Réserver la place d'un contenu en cours de chargement, avec des formes qui annoncent sa disposition.
Ne pas l'utiliser pour :
- un rechargement avec des résultats déjà affichés : barre de 2 px (D-084) ;
- une action longue lancée par l'utilisateur : `ProgressBar` ou état de chargement de `Button`.

## Anatomie
1. `SkeletonGroup` (obligatoire) : conteneur nommé, `aria-busy`.
2. `Skeleton` (un ou plusieurs) : forme immobile en `--field` (D-165).

## Variantes
| Forme | Rendu |
|---|---|
| `line` (défaut) | 10 px de haut, rayon 4 px, toute la largeur par défaut. |
| `circle` | Cercle, 32 px par défaut (avatar, icône). |
| `rect` | Bloc, rayon 8 px, 40 px de haut par défaut (vignette, carte). |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `shape` | `"line" \| "circle" \| "rect"` | `"line"` | Forme. |
| `width`, `height` | `number \| string` | selon la forme | Taille en px ou valeur CSS. |
| `label` (groupe) | `string` | « Chargement… » | Nom annoncé (D-089). |
| `delay` (groupe) | `number` (ms) | `200` | Délai avant l'affichage (D-165). |

## Exclus
- Pas de pulsation ni de reflet animé (D-026, D-165).
- Pas de couleur, pas de `className`.

## États
Masqué pendant le délai, puis affiché. Aucun autre état.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Groupe nommé « Chargement… », `aria-busy`, affiché après 200 ms (D-165) | réglable par page (`delay`) | `ParDefaut` |
| Formes immobiles : ligne 10 px, cercle, bloc (D-165) | verrouillé | `Formes` |

## Contenu
Disposer les formes comme le contenu attendu (une ligne par ligne de texte, un cercle par avatar). Trois à six répétitions suffisent.

## Densité
Les formes suivent la hauteur des lignes du composant qui les dispose (`--row-h`, `--row2-h`).

## Clavier
Non focusable.

## Accessibilité
Le groupe a `role="status"`, `aria-busy="true"` et un nom ; les formes sont `aria-hidden`.

## Taille d'écran
Les largeurs en % suivent le conteneur.

## Erreurs
Sans objet : l'erreur remplace le groupe.

## Placement
Premier chargement d'une page, d'un panneau de détail, d'une carte. List et Table l'utilisent pour leurs 6 lignes, sans délai (D-084, D-169).

## Composition
`SkeletonGroup` contient des `Skeleton` et des conteneurs de mise en page.

## Décisions
D-026, D-084, D-089, D-165, D-169

## Questions ouvertes
Aucune.
