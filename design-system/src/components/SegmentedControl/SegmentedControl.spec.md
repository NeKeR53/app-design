# SegmentedControl
Statut : validé (2026-11-23) — Version : depuis 1.0.0
Validation : docs/validation/components/Nouveaux-P2-P3-v1.html (S1 et S2, options A)

## Rôle
`SegmentedControl` choisit une option parmi 2 à 4, et l'applique tout de suite : un mode d'affichage (liste, grille), une période (jour, semaine, mois).

Ne pas l'utiliser pour :
- changer de vue ou de contenu dans une page : prendre `Tabs` ;
- un choix dans un formulaire qu'on envoie : prendre `RadioButtonGroup` ;
- plusieurs choix à la fois : prendre `CheckboxGroup` ;
- plus de 4 options : prendre `Select`.

## Anatomie
1. Groupe (obligatoire) : fond `--field`, marge intérieure de 2 px, rayon 8 px, hauteur `--row-h`.
2. Segments (2 à 4) : texte court, ou icône et texte, ou icône seule. Rayon 4 px (contrôle dans un contrôle, D-040).
3. Segment choisi : carte, fond `--segment-selected` (`--surface` en clair, #474747 en sombre : toujours plus clair que le rail, jamais un creux), ombre `shadow-sm`, texte `--fg` en graisse moyenne (D-436).

## Variantes
| Contenu | Rendu |
|---|---|
| Texte | Libellé court. |
| Icône et texte | Icône 16 px avant le libellé. |
| Icône seule | `hideLabel` : le libellé est caché, il reste le nom accessible et s'affiche en info-bulle. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Nom du groupe, lu par le lecteur d'écran. Pas affiché. |
| `options` | `{ value, label, icon?, hideLabel?, isDisabled? }[]` | — (obligatoire) | 2 à 4 options. `label` est obligatoire, même avec `hideLabel`. |
| `value` | `string` | aucune | Valeur choisie (contrôlé). |
| `defaultValue` | `string` | première option active | Valeur de départ (non contrôlé). |
| `onChange` | `(value: string) => void` | aucun | Appelé dès qu'un segment est choisi. |
| `isDisabled` | `boolean` | `false` | Tout le groupe désactivé. |
| `name` | `string` | aucun | Nom dans le formulaire envoyé. |

## Exclus
- Pas d'aucun choix : un segment est toujours choisi.
- Pas de variante à contour (option B écartée), pas de couleur d'accent sur le segment choisi (D-001).
- Pas de compteur ni de badge dans un segment.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Texte `--fg-2`. |
| Survol | Texte `--fg`. |
| Choisi | Carte `--segment-selected`, `shadow-sm`, texte `--fg` moyen (D-436). Contrastes en sombre : texte non choisi `--fg-2` sur `--field` 6,2:1, texte choisi 7,7:1 (AA). |
| Focus clavier | Anneau `--focus` de 2 px autour du segment. |
| Option désactivée | 40 %, sautée par les flèches. |
| Groupe désactivé | 40 %, aucun segment actif. |

## Comportement
- Le choix s'applique tout de suite (D-007) : pas de bouton « Appliquer ».
- Un clic choisit le segment.
- Les flèches déplacent le focus et choisissent en même temps.

## Contenu
- Libellés : un ou deux mots, de longueur proche ; noms plutôt que verbes (« Liste », « Grille »).
- Icône seule : seulement si l'icône est connue de tous (liste, colonnes) ; le libellé reste obligatoire.

## Densité
Hauteur `--row-h` : 34 px en web, 28 px en desktop. Marge horizontale des segments : 10 px en web, 8 px en desktop.

## Clavier
- Un seul arrêt de Tab : le segment choisi.
- Flèche droite ou bas : segment suivant, choisi. Flèche gauche ou haut : segment précédent, choisi. Le parcours boucle.

## Accessibilité
- `role="radiogroup"` nommé par `label` ; chaque segment est un `radio` nommé par son libellé.
- Icône seule : le libellé est le nom accessible ; l'info-bulle s'ouvre au focus clavier, ou après 500 ms de survol (D-031).
- Le segment choisi ne se distingue pas que par la couleur : fond, ombre et graisse changent.

## Taille d'écran
Le groupe garde sa largeur naturelle ; il ne dépasse jamais son conteneur. Les libellés trop longs sont coupés par une ellipse.

## Erreurs
Aucune : il n'y a pas de valeur invalide.

## Niveau de réglage
L'app choisit les options, la valeur et le nom. Le dessin est fixe.

## Placement
Barre d'outils d'une page composée ou d'une liste (`toolbar`), en-tête d'un panneau, ligne de réglage. Pas dans la barre du haut à la place des onglets.

## Composition
`RadioGroup` et `Radio` de React Aria, `Tooltip` de React Aria avec le style de l'info-bulle Socle.

## Décisions
D-001, D-007, D-031, D-040, D-358, D-436.

## Questions ouvertes
