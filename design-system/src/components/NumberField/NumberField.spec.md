# NumberField
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/Nouveaux-P1-v1.html (N1 à N3, options A)

## Rôle
Champ de saisie d'un nombre : une quantité, un prix, un pourcentage, une durée en heures.
Ne pas l'utiliser pour :
- un identifiant fait de chiffres (numéro de commande, code postal, téléphone) : prendre `TextInput` ;
- un choix parmi quelques valeurs : prendre `Select` ou `RadioButtonGroup` ;
- afficher un nombre sans le modifier : prendre `FormattedValue`.

## Anatomie
Celle de `Field` (Field.spec.md) : libellé, cadre, aide ou erreur. Dans le cadre :
1. **Nombre**, aligné à droite, chiffres à chasse fixe, dans le format de la langue (« 1 250 »).
2. **Unité libre** (facultative, `unit`) : en suffixe, `--fg-3`.
3. **Flèches** (D-356) : ▲ et ▼ empilées à droite, 22 px de large, séparées par un trait `--line`. Absentes en lecture seule, remplacées par le cadenas (D-131).

## Variantes
Aucune. Devise, pourcentage et unité normalisée passent par `formatOptions` ; leur symbole est dans le texte du champ.

## Options
Les options communes de `Field` (`label`, `hideLabel`, `description`, `isRequired`, `requiredMessage`, `error`, `isDisabled`, `isReadOnly`, `width`, `name`), plus :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `value` / `defaultValue` | `number \| null` | `null` | Valeur ; `null` : vide. |
| `onChange` | `(value: number \| null) => void` | aucune | En quittant le champ, et à chaque pas. |
| `minValue` / `maxValue` | `number` | aucune | Bornes, vérifiées en quittant le champ ; Origine et Fin y mènent. |
| `step` | `number` | `1` (`0.01` en pourcentage) | Pas des flèches. |
| `formatOptions` | `Intl.NumberFormatOptions` | aucun | Décimales, devise (`style: "currency"`), pourcentage, unité normalisée (`style: "unit"`). |
| `unit` | `string` | aucune | Unité libre en suffixe (« pièces ») ; ajoutée au nom accessible (« Quantité (pièces) »). |
| `validate` | `(value: number \| null) => string \| null` | aucune | Vérification propre (D-132). |
| `placeholder` | `string` | aucun | Exemple de valeur. |
| `autoFocus` | `boolean` | `false` | Focus à l'ouverture. |
`width` vaut `sm` (160 px) par défaut.

## Exclus
- Pas de boutons − et + de part et d'autre (D-356, option B écartée), pas de champ sans flèches (option C écartée).
- Pas de molette (D-356) : faire défiler la page ne change jamais la valeur.
- Pas de correction silencieuse d'une saisie hors bornes : elle reçoit un message (D-356).
- Pas de `className` ni de `style`.

## États
Ceux de `Field`, plus : flèche désactivée (opacité 40 %) quand la borne est atteinte.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| ↑ ↓ un pas ; Maj + ↑ ↓ et Page haut / bas dix pas ; Origine / Fin minimum / maximum ; les pas restent dans les bornes (D-356) | verrouillé | `Clavier` |
| Flèches à droite, hors de l'ordre de tabulation (D-356) | verrouillé | `Fleches` |
| Molette désactivée (D-356) | verrouillé | `Molette` |
| Format de la langue ; devise, % et unité dans le champ et lus avec la valeur ; nombre aligné à droite (D-356) | réglable (`formatOptions`, `unit`) | `Formats` |
| Saisie libre, relue en quittant le champ ; champ obligatoire vide : message de `Field` (D-132) | verrouillé | `Saisie` |
| Bornes vérifiées en quittant le champ : la saisie est gardée, le message de `Field` dit l'intervalle (D-356, D-132) | réglable (`minValue`, `maxValue`) | `Bornes` |
| Lecture seule : pas de flèches, la valeur ne change pas (D-131) | réglable | `LectureSeule` |

## Contenu
Messages (dictionnaire) : « Saisissez une valeur de 0 à 100. », « Saisissez une valeur d'au moins 0. », « Saisissez une valeur de 100 au plus. », « Saisissez une valeur par pas de 5. ». Les bornes sont écrites dans le format du champ (« 12,50 € »).

## Densité
Hauteur du cadre `--row-h` ; web et desktop suivent leurs tokens ; clair et sombre aussi.

## Clavier
Tab entre et sort du champ (les flèches sont sautées). ↑ ↓, Maj + ↑ ↓, Page haut / bas, Origine, Fin. Entrée envoie le formulaire.

## Accessibilité
React Aria `NumberField` : rôle `textbox` avec `aria-roledescription` de champ nombre, valeur annoncée avec son symbole, `aria-required`, `aria-invalid`. Les flèches sont nommées « Augmenter » et « Diminuer ». Langue : celle de `SocleProvider` (`messages.locale`), passée par `I18nProvider`.

## Taille d'écran
Celle de `Field`.

## Erreurs
Celles de `Field`, plus les bornes et le pas.

## Placement
Celui de `Field`.

## Composition
`Field`, `Input`, deux boutons de React Aria.

## Décisions
D-022, D-130, D-131, D-132, D-133, D-356.

## Questions ouvertes
Aucune.
