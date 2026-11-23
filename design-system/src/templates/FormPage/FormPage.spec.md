# FormPage
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/FormPage-v1.html — par délégation de l'utilisateur, 2026-11-23

Cette spec couvre deux éléments :
- le **modèle de champ** `FormField`, commun à `FormPage` et au formulaire en modale (`useOpenForm`, voir `FormDialog.spec.md`) ;
- le gabarit **`FormPage`**, pour un long formulaire dans le `main` d'AppShell (D-022).

## Rôle
`FormPage` montre un formulaire long, rangé en sections : créer un objet riche, modifier sa fiche, remplir une demande. L'app décrit ses champs par des données ; le gabarit les dessine avec les champs du lot 1 (D-190).

Ne pas l'utiliser pour :
- une saisie courte (six champs au plus) : prendre `useOpenForm` (`FormDialog.spec.md`) ;
- des réglages qui s'appliquent tout de suite : prendre SettingsPage (D-015, D-007) ;
- une propriété de l'élément courant, modifiable sur place : prendre `PropertyRow` dans le panneau de détail.

## Modèle de champ (`FormField`)
Un champ est un objet. Le `type` choisit le composant (D-190).

| `type` | Composant | Valeur rendue (D-191) | Options propres |
|---|---|---|---|
| `text` (défaut), `email`, `url`, `tel`, `password` | `TextField` | `string` (sans espaces autour, sauf `password`) | `placeholder`, `autoComplete`, `maxLength` |
| `number` | `TextField` | `number \| null` (virgule acceptée) | `placeholder`, `min`, `max` |
| `textarea` | `TextArea` | `string` | `placeholder`, `maxLength`, `minRows`, `maxRows` |
| `select` | `Select` | `string \| null` | `options` (obligatoire, à plat ou en sections), `placeholder` |
| `combobox` | `ComboBox` | `string \| null`, ou `string[]` si `selectionMode: "multiple"` | `items` ou `loadItems`, `selectedItems`, `allowsCustomValue`, `onCreate`, `placeholder` |
| `radio` | `RadioGroup` | `string \| null` | `options` (`value`, `label`, `description`), `orientation` |
| `checkbox` | `Checkbox` | `boolean` | — (le `label` est à droite de la case) |
| `checkboxGroup` | `CheckboxGroup` | `string[]` | `options`, `orientation` |
| `fieldset` | `Fieldset` | — (ses champs rendent leurs valeurs) | `legend`, `fields`, `isOptional` ; pas de `name` |

Options communes à tous les champs (sauf `fieldset`) :

| Option | Type | Défaut | Description |
|---|---|---|---|
| `name` | `string` | — (obligatoire) | Clé de la valeur dans `values`. |
| `label` | `string` | — (obligatoire) | Libellé ; « (facultatif) » s'ajoute seul (D-022). |
| `description` | `string` | aucune | Aide sous le champ. |
| `isRequired` | `boolean` | `false` | Champ obligatoire (case : doit être cochée). |
| `isDisabled` | `boolean` | `false` | Champ désactivé. |
| `width` | `FieldWidth` | `sm` pour `number`, sinon `full` | Largeur (D-133, D-191). Sans effet sur les groupes de choix. |
| `defaultValue` | selon le type | vide | Valeur de départ, si `initialValues` ne la donne pas. |
| `validate` | `(valeur, valeurs) => string \| null \| undefined` | aucune | Règle propre ; reçoit aussi les autres valeurs (D-192). |

Exemple :
```ts
const sections: FormSection[] = [
  {
    title: "Général",
    description: "Ce qui identifie le projet dans les listes.",
    fields: [
      { type: "text", name: "name", label: "Nom", isRequired: true },
      { type: "select", name: "state", label: "État", isRequired: true, width: "md", options: STATES },
      { type: "number", name: "budget", label: "Budget", description: "En euros.", min: 0 },
    ],
  },
];
```

## Anatomie (FormPage)
1. En-tête (obligatoire) : titre (`--fs-xl`, semibold) et phrase d'intention facultative (`--fg-2`).
2. Sections (au moins une) : titre (semibold), aide facultative (`--fs-sm`, `--fg-3`), puis les champs, l'un sous l'autre, 16 px d'écart (D-191). Un trait `--line` sépare deux sections.
3. Pied (obligatoire), collé en bas : état d'enregistrement à gauche (D-194), puis « Annuler » (`secondary`, si `onCancel`) et l'action principale (`primary`), à droite (D-022, D-124).

## Variantes
Aucune variante visuelle. La disposition des sections dépend de la place (D-193).

## Options (FormPage)
| Option | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — (obligatoire) | Titre du formulaire. |
| `description` | `string` | aucune | Phrase d'intention. |
| `sections` | `FormSection[]` | — (obligatoire) | `{ title, description?, fields: FormField[] }`. |
| `initialValues` | `Record<string, unknown>` | aucune | Valeurs de départ ; l'objet lu en base convient (D-191). |
| `submitLabel` | `string` | — (obligatoire) | Verbe de l'action : « Créer », « Enregistrer ». |
| `onSubmit` | `(values) => void \| FormSubmitResult \| Promise<…>` | — (obligatoire) | Enregistre. Peut rendre `{ errors, message }` ou lever une erreur (D-192). |
| `cancelLabel` | `string` | « Annuler » | Libellé du bouton d'annulation. |
| `onCancel` | `() => void` | aucun | Sans lui, pas de bouton « Annuler ». Confirmé après une saisie (D-195). |
| `onDirtyChange` | `(dirty: boolean) => void` | aucun | Prévient l'app d'une saisie non enregistrée (navigation à protéger). |
| `isLoading` | `boolean` | `false` | Données en chargement : des squelettes remplacent les champs (D-193). |

## Exclus
- Pas de champ dessiné par l'app, pas de `className` ni de `style` (D-190).
- Pas d'interrupteur (D-137) : une valeur qui attend l'envoi est une case.
- Pas de date ni d'heure : à ajouter avec un sélecteur de date Socle.
- Pas de deux champs sur une ligne (D-191) : un groupe passe par `fieldset`.
- Pas d'enregistrement automatique, pas d'action secondaire dans le pied.
- Pas de bouton grisé (D-196).

## États
| État | Rendu |
|---|---|
| Chargement (`isLoading`) | Squelettes à la place des champs, pied masqué. |
| Repos | Pied sans phrase. |
| Modifié | « Modifications non enregistrées » (D-194). |
| Envoi | « Enregistrement… », action en chargement, « Annuler » désactivé (D-196). |
| Enregistré | « Enregistré » ; les valeurs envoyées deviennent la référence. |
| Échec | Phrase en `--danger`, annoncée ; erreurs de champ sous les champs (D-192). |
| Champ en erreur | Règles de `Field` (D-130, D-132). |

## Comportement
- L'envoi vérifie tous les champs ; s'il en reste en erreur, il s'arrête et le focus va au premier (D-132, D-192).
- Entrée dans un champ d'une ligne envoie ; Mod+Entrée envoie de partout (D-196).
- « Annuler » après une saisie demande « Abandonner les modifications ? » (D-195).
- Une erreur rendue par `onSubmit` pour un champ disparaît dès que ce champ change.

## Contenu
- Titre : le verbe et l'objet (« Nouveau projet », « Modifier le contact »).
- Titre de section : un nom court ; aide : une phrase.
- Libellé de l'action : un verbe (« Créer », « Enregistrer », « Envoyer »).

## Densité
Marges `--pad`, hauteurs des champs et boutons `--row-h` : web et desktop suivent leurs tokens.

## Clavier
Tab suit l'ordre des champs, puis « Annuler » et l'action. Entrée et Mod+Entrée envoient (D-196).

## Accessibilité
- Chaque section est une région nommée par son titre.
- La phrase d'état est annoncée poliment (`aria-live="polite"`) ; l'erreur, tout de suite (`role="alert"`).
- Le formulaire est `aria-busy` pendant l'envoi.

## Taille d'écran
- 800 px de large ou plus (conteneur) : section sur deux colonnes, 240 px puis 560 px au plus (D-193).
- En dessous : titre de section au-dessus des champs.
- Mobile : boutons du pied sur toute la largeur, état au-dessus.

## Erreurs
Une exception levée par `onSubmit` affiche son message (sinon « L'enregistrement a échoué. Réessayez. ») dans le pied. La saisie reste.

## Niveau de réglage
L'app choisit les champs, leur ordre et leurs textes. Le reste est fixe.

## Placement
Dans le `main` d'AppShell (layout-rules : FormPage).

## Composition
`TextField`, `TextArea`, `Select`, `ComboBox`, `RadioGroup`, `Checkbox`, `CheckboxGroup`, `Fieldset`, `Button`, `Skeleton`, `useConfirm`.

## Décisions
D-022, D-130 à D-138, D-190 à D-196.

## Questions ouvertes
