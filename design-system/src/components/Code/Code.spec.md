# Code
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.1.0
Validation : docs/validation/components/Display-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Texte à chasse fixe : identifiant, chemin, commande, valeur technique (`Code`), ou extrait sur plusieurs lignes (`Code block`).
Ne pas l'utiliser pour : un champ à copier ou modifier (champ de formulaire), une mise en valeur de texte (gras).

## Anatomie
1. En ligne : texte `--font-mono` à 0,92 em, fond `--field`, rayon 4 px, marges de 5 px (D-168).
2. En bloc : `<pre>`, fond `--field`, rayon 8 px, marges de 12 × 10 px, `--fs-sm`.

## Variantes
En ligne (défaut) ; bloc (`block`).

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `children` | `ReactNode` | — (obligatoire) | Texte. |
| `block` | `boolean` | `false` | Bloc préformaté. |
| `label` | `string` | « Extrait de code » | Nom accessible du bloc (D-089). |

## Exclus
- Pas de coloration syntaxique, pas de numéros de ligne, pas de bouton « Copier » dans cette version.
- Pas de variante sans fond (D-168), pas de `className`.

## États
Bloc : focus clavier avec anneau `--accent`.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| En ligne : chasse fixe, fond, rayon 4 px (D-168) | verrouillé | `EnLigne` |
| Bloc : défilement horizontal, joignable au clavier, nommé | verrouillé | `Bloc` |

## Contenu
En ligne : court, sans retour à la ligne forcé. Bloc : retours à la ligne gardés, lignes longues défilent.

## Densité
Suit la taille du texte (en ligne) ou `--fs-sm` (bloc).

## Clavier
Le bloc est dans l'ordre de tabulation, pour défiler aux flèches (WCAG 2.1.1).

## Accessibilité
Bloc : `role="region"` et nom. `--fg` sur `--field` : AA.

## Taille d'écran
Le bloc défile ; il ne déborde jamais de son conteneur.

## Erreurs
Sans objet.

## Placement
Texte courant, ligne du panneau de détail, cellule de Table, aide d'un réglage.

## Composition
Ne contient rien d'autre. Peut être dans un `Link`.

## Décisions
D-089, D-168

## Questions ouvertes
Aucune.
