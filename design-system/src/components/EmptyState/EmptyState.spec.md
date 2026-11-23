# EmptyState
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.1.0
Validation : docs/validation/components/Display-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Dire qu'une zone est vide et proposer la suite : zone `empty` de ListPage (aucune donnée), panneau sans élément.
Ne pas l'utiliser pour :
- une recherche sans résultat : message de Table et List avec rappel des critères (D-086) ;
- une erreur de chargement : message de Table et List (D-085) ;
- un panneau de détail sans sélection : message de Drawer.

## Anatomie
1. Icône (facultative), 32 px, `--fg-3`, sans fond (D-166).
2. Titre (obligatoire), `--fg`, `--fw-medium` : ce qui manque.
3. Phrase (facultative), `--fg-2`, `--fs-sm` : pourquoi, ou quoi faire.
4. Action principale (facultative) : un seul `Button` variante `primary`.

## Variantes
| Taille | Rendu |
|---|---|
| `default` | Centré, marges de 56 px en haut et en bas, largeur maximale 420 px. |
| `compact` | Sans icône, marges de 20 px : panneau de détail, liste imbriquée. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `title` | `ReactNode` | — (obligatoire) | Ce qui manque : « Aucun projet ». |
| `description` | `ReactNode` | aucune | Phrase d'explication ; peut contenir un `Link`. |
| `headingLevel` | `2 \| 3 \| 4` | `2` | Niveau du titre (`h2` à `h4`), selon la page. |
| `icon` | `ReactNode` | aucune | Icône de l'app (D-011), affichée en 32 px. |
| `action` | `ReactNode` | aucune | Action principale : `<Button variant="primary">`. |
| `size` | `"default" \| "compact"` | `"default"` | Taille. |

## Exclus
- Pas d'illustration, pas d'icône dans un cercle (D-166).
- Pas plus d'une action ; une action secondaire passe par un `Link` dans la phrase.
- Pas de `className`.

## États
Statique.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Icône de 32 px, titre, phrase, action ; l'action est joignable au clavier (D-166) | verrouillé | `ParDefaut` |
| `compact` : pas d'icône | verrouillé | `Compact` |

## Contenu
Titre court au négatif (« Aucun projet »). Phrase qui dit quoi faire. Textes longs : retour à la ligne, centrés.

## Densité
Les textes suivent la densité ; les marges ne changent pas.

## Clavier
Seule l'action reçoit le focus. Le focus n'est pas déplacé à l'affichage.

## Accessibilité
Le titre est un vrai titre (`h2` par défaut, `headingLevel`), puis la phrase, lus dans l'ordre. L'icône est décorative (`aria-hidden` dans l'icône de l'app). Contrastes : `--fg` et `--fg-2` AA.

## Taille d'écran
Largeur maximale 420 px ; sur mobile, marges latérales de 16 px.

## Erreurs
Sans objet : une erreur n'est pas un état vide.

## Placement
Zone `empty` de ListPage (layout-rules), section vide d'un panneau de détail (`compact`). Les messages centrés de Table et List l'utilisent sans icône (D-169).

## Composition
Contient une icône de l'app et un `Button` (P1). Pas d'autre composant.

## Décisions
D-011, D-085, D-086, D-166, D-169

## Questions ouvertes
Aucune.
