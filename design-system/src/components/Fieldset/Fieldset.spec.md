# Fieldset
Statut : validé (2026-11-23, par délégation de l'utilisateur) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/FormChoices-v1.html

## Rôle
Regroupe des champs différents qui forment un tout, sous une légende : une adresse (rue, code postal, ville), une période (début, fin).
Ne pas l'utiliser pour :
- un groupe de cases ou de boutons radio : prendre `CheckboxGroup` ou `RadioButtonGroup`, qui ont leur libellé (D-138) ;
- une section titrée d'un formulaire : c'est une section de `FormPage` (D-022).

## Anatomie
1. **Légende** (obligatoire) : style d'un libellé de champ (D-130), avec « (facultatif) » si tous les champs le sont (option `isOptional`).
2. **Champs** : l'un sous l'autre, 12 px d'écart ; plusieurs champs courts sur une ligne si l'app les met dans une ligne.
3. **Aide ou erreur** du groupe (facultative), en dessous (D-130).

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `legend` | `string` | — (obligatoire) | Légende ; nom du groupe. |
| `description` | `string` | aucune | Aide du groupe. |
| `error` | `string` | aucune | Erreur du groupe (« La date de fin suit la date de début. »). |
| `isOptional` | `boolean` | `false` | Ajoute « (facultatif) » à la légende. |
| `isDisabled` | `boolean` | `false` | Désactive tous les champs du groupe. |
| `children` | champs Socle | — (obligatoire) | `TextInput`, `Select`, `ComboBox`, `TextArea`, `Checkbox`. |

## Exclus
- Pas de cadre ni de fond autour du groupe.
- Pas de `Fieldset` dans un `Fieldset`.
- Pas de `className` ni de `style`.

## États
Normal ; erreur (phrase `--danger` sous le groupe, sans bord) ; désactivé (opacité 40 % sur les champs).

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Désactivé : tous les champs du groupe sont désactivés | verrouillé | `Desactive` |
| L'erreur du groupe est reliée au groupe et annoncée | verrouillé | `ErreurGroupe` |

## Contenu
Légende longue : retour à la ligne.

## Densité
Écart de 12 px entre champs dans les deux densités.

## Clavier
Pas d'arrêt propre ; Tab parcourt les champs.

## Accessibilité
`fieldset` natif et `legend` ; aide et erreur reliées par `aria-describedby`.

## Taille d'écran
Les champs d'une même ligne passent l'un sous l'autre quand la place manque.

## Erreurs
L'erreur d'un champ reste sous ce champ ; seule une erreur qui concerne plusieurs champs va sous le groupe.

## Placement
`FormPage` (dans une section), formulaire en modale.

## Composition
Contient des champs Socle. Ne contient ni `Fieldset`, ni bouton d'envoi.

## Décisions
D-022, D-130, D-138

## Questions ouvertes
Aucune.
