# Select
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/FormFields-v1.html

## Rôle
Choix d'une valeur dans une liste fermée et courte (2 à 15 options environ), sans saisie de texte.
Ne pas l'utiliser pour :
- plus de 15 options, une recherche dans les options, ou plusieurs valeurs : prendre `ComboBox` (P5) ;
- 2 à 5 options qu'on veut toutes voir : prendre `RadioButtonGroup` ;
- un oui/non : prendre `Checkbox` ou `Toggle` ;
- une action : prendre `DropdownMenu`.

## Anatomie
Celle de `Field` (Field.spec.md), avec dans le cadre (D-134) :
1. **Valeur choisie** à gauche, ou le texte d'aide « Choisir… » (ou `placeholder`) en `--fg-3` ;
2. **Chevron** vers le bas, 16 px, `--fg-2`, à droite.
Puis la **liste flottante** : style du DropdownMenu (rayon 12 px, fond `--surface-raised`, bord `--line`, ombre `--shadow-md`, marge de 4 px), au moins aussi large que le cadre ; chaque option fait `--row-h`, avec la coche à droite sur la valeur choisie (D-050). Les options peuvent être rangées en sections titrées.

## Variantes
Aucune.

## Options
Les options communes de `Field`, sauf `isReadOnly`, plus :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `options` | `{ id: string; label: string; isDisabled?: boolean }[]` ou sections `{ title, options }[]` | — (obligatoire) | Les options. |
| `value` / `defaultValue` | `string \| null` | `null` | Identifiant choisi. |
| `onChange` | `(id: string \| null) => void` | aucune | Au choix d'une option. |
| `placeholder` | `string` | « Choisir… » (dictionnaire) | Texte quand rien n'est choisi. |

`width` : défaut `full`, comme les autres champs.

## Exclus
- Pas de saisie, pas de recherche, pas de choix multiple : `ComboBox`.
- Pas d'icône ni de description dans les options dans cette version.
- Pas de `<select>` natif (D-134).
- Les exclusions de `Field`.

## États
Ceux de `Field`, sauf lecture seule. Ouvert : la liste flottante est visible, le cadre garde l'anneau de focus. Option mise en avant : fond `--hover`. Option désactivée : opacité 40 %.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Clic, Espace, Entrée, flèche haut ou bas : ouvre la liste, sur la valeur choisie (D-134) | verrouillé | `Clavier` |
| Flèches, Origine, Fin : parcourent ; lettres tapées : sautent à l'option qui commence par elles ; Entrée ou clic : choisit et ferme ; Échap ou clic dehors : ferme sans changer (D-134) | verrouillé | `Clavier` |
| La liste s'ouvre en dessous, ou au-dessus si la place manque ; elle défile au-delà de la hauteur disponible | verrouillé | `ParDefaut` |
| Vérification : celle de `Field` ; un `Select` obligatoire sans valeur est en erreur à l'envoi (D-132) | verrouillé | `Verification` |

## Contenu
Valeur ou option trop longue : ellipse dans le cadre, retour à la ligne interdit ; la liste s'élargit jusqu'à 320 px, puis ellipse avec info-bulle.

## Densité
Celle de `Field` ; options de `--row-h`.

## Clavier
Voir Comportement. Le focus revient au cadre à la fermeture.

## Accessibilité
React Aria `Select` : bouton qui ouvre un `listbox` ; nom accessible = libellé ; la valeur choisie est lue avec le libellé ; un `select` caché porte la valeur dans le formulaire et la vérification.

## Taille d'écran
Celle de `Field`. Sur mobile, la liste prend la largeur du cadre.

## Erreurs
Celles de `Field`.

## Placement
Celui de `Field`. Aussi dans une ligne de réglage de `SettingsPage`, libellé masqué, largeur `md`.

## Composition
`Field`, un bouton et une liste au style du `DropdownMenu`. La liste est partagée avec `ComboBox`.

## Décisions
D-022, D-040, D-050, D-130, D-132, D-133, D-134

## Questions ouvertes
Aucune.
