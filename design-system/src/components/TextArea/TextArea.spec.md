# TextArea
Statut : validé (2026-11-23) — Version : depuis 0.2.0
Validation : docs/validation/components/FormFields-v1.html

## Rôle
Champ de saisie d'un texte libre sur plusieurs lignes : une note, une description, un commentaire.
Ne pas l'utiliser pour :
- une seule ligne : prendre `TextInput` ;
- un texte mis en forme (titres, listes, liens) : prendre `MarkdownEditor`.

## Anatomie
Celle de `Field` (Field.spec.md), plus :
- dans le cadre, le texte, avec 10 px de marge à gauche et à droite et 6 px en haut et en bas ;
- **compteur** (si `maxLength`) : « 12 / 500 », en `--fs-xs`, `--fg-3`, calé à droite sur la ligne de l'aide ; au-delà de la limite, « 4 caractères en trop » en `--danger` (D-343).

## Variantes
Aucune.

## Options
Les options communes de `Field`, plus :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `value` / `defaultValue` | `string` | `""` | Valeur contrôlée ou initiale. |
| `onChange` | `(value: string) => void` | aucune | À chaque frappe. |
| `placeholder` | `string` | aucun | Exemple de valeur. |
| `maxLength` | `number` | aucune | Longueur maximale, dépassable ; affiche le compteur ; au-delà, valeur refusée (D-343). |
| `minRows` | `number` | `3` | Hauteur de départ, en lignes (D-133). |
| `maxRows` | `number` | `10` | Hauteur maximale, en lignes ; au-delà, le texte défile (D-133). |

## Exclus
- Pas de poignée de redimensionnement (D-133).
- Pas de mise en forme, pas d'envoi à Entrée (zone de message de discussion : autre composant).
- Les exclusions de `Field`.

## États
Ceux de `Field`. Compteur : « n caractères en trop » en `--danger` au-delà de la limite ; à la limite, il reste en `--fg-3` (D-343).

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Commence à `minRows` lignes, grandit avec le texte jusqu'à `maxRows`, puis défile (D-133) | réglable par page (`minRows`, `maxRows`) | `Hauteur` |
| Compteur mis à jour à chaque frappe | verrouillé | `Compteur` |
| Limite dépassable : pas de `maxlength` natif, un collage n'est pas coupé ; au-delà, compteur en `--danger`, lu par une zone `aria-live="polite"` 1 s après la dernière frappe ; erreur « Saisissez n caractères au plus. » en quittant le champ ou à l'envoi, envoi refusé (D-343) | verrouillé | `LimiteDepassable` |
| Vérification : celle de `Field` (D-132) | verrouillé | `Verification` |

## Contenu
Les lignes trop longues passent à la ligne. Les règles de libellé, d'aide et d'erreur sont celles de `Field`.

## Densité
Celle de `Field` ; la hauteur d'une ligne suit `--fs-md` et `--lh`.

## Clavier
Entrée ajoute une ligne. Tab sort du champ.

## Accessibilité
React Aria `TextField` avec `TextArea` : rôle `textbox` multiligne. Le compteur est relié au champ par `aria-describedby` ; une zone `aria-live="polite"` lit « n caractères restants » ou « n caractères en trop » après une pause d'1 s.

## Taille d'écran
Celle de `Field`.

## Erreurs
Celles de `Field`.

## Placement
Celui de `Field`.

## Composition
`Field` et un `textarea`.

## Décisions
D-022, D-130, D-131, D-132, D-133

## Questions ouvertes
Aucune.
