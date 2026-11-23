# RadioGroup
Statut : validé (2026-11-23, par délégation de l'utilisateur) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/FormChoices-v1.html

## Rôle
Un seul choix parmi 2 à 5 options qu'on veut toutes voir, chacune avec une description courte si besoin.
Ne pas l'utiliser pour :
- plus de 5 options, ou des options sans besoin d'être comparées : prendre `Select` ;
- un oui/non : prendre `Checkbox` ou `Switch` ;
- changer de vue : prendre `Tabs`.

## Anatomie
1. **Libellé du groupe** (obligatoire), style de `Field` (D-130), avec « (facultatif) » si non obligatoire.
2. **Options** `RadioGroup.Option` (2 ou plus) : rond de 16 px, puis libellé à droite (8 px d'écart, `--fs-md`, `--fg`), puis description facultative en dessous (`--fs-sm`, `--fg-3`) (D-135).
3. **Aide ou erreur** du groupe en dessous (D-130).

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label`, `hideLabel`, `description`, `isRequired`, `validate`, `error`, `isDisabled`, `isReadOnly`, `name` | | | Comme `Field` (D-132). |
| `value` / `defaultValue` / `onChange` | `string \| null` | `null` | Option choisie. |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Horizontal : 2 ou 3 options courtes, retour à la ligne (D-138). |
| `Option` : `value`, `children` (libellé), `description`, `isDisabled` | | | Une option. |

## Exclus
- Pas d'option « Aucun » ajoutée automatiquement : l'app l'ajoute si elle a du sens.
- Pas d'apparence « boutons segmentés » : composant à part, hors de ce lot.
- Pas de `className` ni de `style`.

## États
Comme `Checkbox` : non choisi, survol, choisi (fond `--accent`, point `--accent-fg` de 6 px), focus, erreur, désactivé (groupe ou option), lecture seule.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Tab entre dans le groupe sur l'option choisie (ou la première) ; flèches : passent à l'option suivante et la choisissent | verrouillé | `Clavier` |
| Vérification : un groupe obligatoire sans choix est en erreur à l'envoi (D-132) | verrouillé | `Verification` |

## Contenu
Libellé long : retour à la ligne, le rond reste en face de la première ligne.

## Densité
Rond de 16 px ; option de `--target-min` au moins ; écart de 4 px entre options (20 px en horizontal).

## Clavier
Voir Comportement. Un seul arrêt de tabulation pour tout le groupe.

## Accessibilité
React Aria `RadioGroup` et `Radio` : `role="radiogroup"` nommé par le libellé, aide et erreur reliées ; chaque option est un `input type="radio"` caché.

## Taille d'écran
Sur mobile, l'orientation horizontale passe en vertical.

## Erreurs
Celles de `Field`.

## Placement
`FormPage`, formulaire en modale, page de réglage (le choix s'applique alors tout de suite, D-007). Jamais dans le panneau de détail : y mettre un `Menu`.

## Composition
Contient des `RadioGroup.Option`.

## Décisions
D-007, D-022, D-130, D-132, D-135, D-138

## Questions ouvertes
Aucune.
