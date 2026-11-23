# TextField
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/FormFields-v1.html

## Rôle
Champ de saisie d'une ligne de texte libre : un nom, une adresse e-mail, une URL, un numéro de téléphone, un mot de passe.
Ne pas l'utiliser pour :
- un texte sur plusieurs lignes : prendre `TextArea` ;
- un choix dans une liste fermée : prendre `Select` (peu d'options) ou `ComboBox` (beaucoup d'options, ou recherche) ;
- filtrer une liste ou un tableau : prendre `SearchField` ;
- une valeur oui/non : prendre `Checkbox` ou `Switch`.

## Anatomie
Celle de `Field` (Field.spec.md) : libellé, cadre, aide ou erreur. Dans le cadre : le texte, avec 10 px de marge à gauche et à droite ; en lecture seule, le cadenas à droite (D-131).

## Variantes
Aucune.

## Options
Les options communes de `Field` (`label`, `hideLabel`, `description`, `isRequired`, `validate`, `error`, `isDisabled`, `isReadOnly`, `width`, `name`), plus :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `value` / `defaultValue` | `string` | `""` | Valeur contrôlée ou initiale. |
| `onChange` | `(value: string) => void` | aucune | À chaque frappe. |
| `onBlur` | `() => void` | aucune | En quittant le champ. |
| `type` | `"text" \| "email" \| "url" \| "tel" \| "password"` | `"text"` | Clavier adapté sur mobile ; `email` et `url` vérifient aussi le format (message du navigateur remplacé par le dictionnaire). |
| `placeholder` | `string` | aucun | Exemple de valeur, jamais une consigne. |
| `autoComplete` | `string` | aucun | Aide au remplissage du navigateur. |
| `maxLength` | `number` | aucune | Longueur maximale. |
| `autoFocus` | `boolean` | `false` | Focus à l'ouverture (premier champ d'une modale). |

## Exclus
- Pas de nombre avec flèches (`NumberField`, à spécifier), pas de date (`DateField`, à spécifier).
- Pas de bouton « Afficher le mot de passe », pas de préfixe ni de suffixe, pas d'icône dans cette version.
- Pas de compteur de caractères (seul `TextArea` en a un).
- Les exclusions de `Field`.

## États
Ceux de `Field` : par défaut, survol, focus, erreur, lecture seule, désactivé, vide.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Vérification en quittant un champ modifié ou à l'envoi ; jamais pendant la frappe (D-132) | verrouillé | `Verification` |
| À l'envoi, focus sur le premier champ en erreur (D-132) | verrouillé | `Envoi` |
| Erreur de l'app affichée tout de suite (D-132) | verrouillé | `ErreurApp` |
| Lecture seule : le texte se sélectionne, la valeur ne change pas (D-131) | verrouillé | `LectureSeule` |

## Contenu
Texte plus long que le cadre : il défile dans le cadre, sans ellipse. Les règles de libellé, d'aide et d'erreur sont celles de `Field`.

## Densité
Celle de `Field`.

## Clavier
Tab entre et sort ; Entrée envoie le formulaire (comportement du navigateur) ; Échap ne vide pas le champ.

## Accessibilité
React Aria `TextField` : rôle `textbox`, libellé, aide, erreur, `aria-required`, `aria-invalid`, `aria-readonly`.

## Taille d'écran
Celle de `Field`.

## Erreurs
Celles de `Field`.

## Placement
Celui de `Field`.

## Composition
`Field` et un `input`.

## Décisions
D-022, D-130, D-131, D-132, D-133

## Questions ouvertes
Aucune.
