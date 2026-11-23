# FormPage
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/FormPage-v1.html — par délégation de l'utilisateur, 2026-11-23 ; étapes : docs/validation/components/Nouveaux-P4-v1.html (W1, option A), choix de l'utilisateur, 2026-11-23

Cette spec couvre deux éléments :
- le **modèle de champ** `FormField`, commun à `FormPage` et au formulaire en modale (`useOpenForm`, voir `FormDialog.spec.md`) ;
- le gabarit **`FormPage`**, pour un long formulaire dans le `main` d'AppShell (D-022).

## Rôle
`FormPage` montre un formulaire long, rangé en sections : créer un objet riche, modifier sa fiche, remplir une demande. L'app décrit ses champs par des données ; le gabarit les dessine avec les champs du lot 1 (D-190).

En étapes (`steps`), il guide une saisie en plusieurs temps : une étape à la fois, puis un récapitulatif et l'action (D-364).

Ne pas l'utiliser pour :
- une saisie courte (six champs au plus) : prendre `useOpenForm` (`FormDialog.spec.md`) ;
- des réglages qui s'appliquent tout de suite : prendre SettingsPage (D-015, D-007) ;
- une propriété de l'élément courant, modifiable sur place : prendre `PropertyRow` dans le panneau de détail.

## Modèle de champ (`FormField`)
Un champ est un objet. Le `type` choisit le composant (D-190).

| `type` | Composant | Valeur rendue (D-191) | Options propres |
|---|---|---|---|
| `text` (défaut), `email`, `url`, `tel`, `password` | `TextInput` | `string` (sans espaces autour, sauf `password`) | `placeholder`, `autoComplete`, `maxLength` |
| `number` | `TextInput` | `number \| null` (virgule acceptée) | `placeholder`, `min`, `max` |
| `textarea` | `TextArea` | `string` | `placeholder`, `maxLength`, `minRows`, `maxRows` |
| `select` | `Select` | `string \| null` | `options` (obligatoire, à plat ou en sections), `placeholder` |
| `combobox` | `ComboBox` | `string \| null`, ou `string[]` si `selectionMode: "multiple"` | `items` ou `loadItems`, `selectedItems`, `allowsCustomValue`, `onCreate`, `placeholder` |
| `radio` | `RadioButtonGroup` | `string \| null` | `options` (`value`, `label`, `description`), `orientation` |
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
| `requiredMessage` | `string` | aucun | Message du champ obligatoire vide ; défaut construit à partir du libellé (D-344). Sans effet sur `combobox` pour l'instant. |
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

En étapes (D-364) :
1. En-tête, comme ci-dessus.
2. `ProgressIndicator` horizontal sous l'en-tête : les étapes de l'app, puis « Récapitulatif ».
3. L'étape en cours seule, dessinée comme une section (titre, aide, champs).
4. Dernière étape, le récapitulatif : titre « Récapitulatif », puis un groupe par étape (titre, bouton « Modifier » en `sm`, et la liste des libellés et des valeurs en lecture seule).
5. Pied : état, « Annuler » (si `onCancel`), « Précédent » (`secondary`, absent à la première étape), puis « Suivant » (`primary`) ; au récapitulatif, l'action (`submitLabel`) remplace « Suivant ».

## Variantes
| Variante | Rendu |
|---|---|
| Sections (`sections`) | Toutes les sections sur la page. La disposition dépend de la place (D-193). |
| Étapes (`steps`) | Une étape à la fois, puis le récapitulatif (D-364). |

## Options (FormPage)
| Option | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — (obligatoire) | Titre du formulaire. |
| `description` | `string` | aucune | Phrase d'intention. |
| `sections` | `FormSection[]` | — (obligatoire sans `steps`) | `{ title, description?, fields: FormField[] }`. |
| `steps` | `FormStep[]` | aucune | `{ id, title, description?, fields: FormField[] }`. Formulaire en étapes, à la place de `sections` : on donne l'un ou l'autre, jamais les deux (D-364). De 2 à 6 étapes (le récapitulatif s'ajoute seul). |
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
- En étapes : pas de saut vers une étape à venir (D-326) ; pas de sections dans une étape (un groupe passe par `fieldset`) ; pas de récapitulatif masqué ni de titre de récapitulatif réglable.

## États
| État | Rendu |
|---|---|
| Chargement (`isLoading`) | Squelettes à la place des champs, pied masqué. En étapes : squelettes de la première étape. |
| Repos | Pied sans phrase. |
| Modifié | « Modifications non enregistrées » (D-194). |
| Envoi | « Enregistrement… », action en chargement, « Annuler » désactivé (D-196). |
| Enregistré | « Enregistré » ; les valeurs envoyées deviennent la référence. |
| Échec | Phrase en `--danger`, annoncée ; erreurs de champ sous les champs (D-192). |
| Champ en erreur | Règles de `Field` (D-130, D-132). |
| Étape en erreur | Une étape dont un champ porte une erreur rendue par `onSubmit` est marquée en erreur dans `ProgressIndicator` ; la marque part quand ses champs en erreur changent (D-364). |
| Récapitulatif des valeurs | Libellé en `--fs-sm` `--fg-3`, valeur au-dessous : libellé de l'option choisie, « Oui » ou « Non » pour une case, liste séparée par des virgules, « — » (lu « vide ») pour un champ vide, mot de passe masqué (D-171, D-364). |
| Récapitulatif | À partir de 2 champs en erreur à l'envoi : encart en haut du formulaire, sous le titre ; bord 1 px `--danger`, rayon 8 px ; icône d'alerte et « n erreurs à corriger » en `--danger`, `--fw-medium` ; puis un lien par champ (son libellé), dans l'ordre du formulaire (D-341). |

## Comportement
- L'envoi vérifie tous les champs ; s'il en reste en erreur, il s'arrête (D-132, D-192). Une seule erreur : le focus va au champ. Deux erreurs ou plus (vérification locale ou erreurs rendues par `onSubmit`) : le récapitulatif s'affiche et prend le focus ; un lien met le focus dans son champ. Le récapitulatif se met à jour, ou disparaît, au prochain envoi (D-341). Test : `Recapitulatif`, `RecapitulatifServeur`, `Verification`.
- Entrée dans un champ d'une ligne envoie ; Mod+Entrée envoie de partout (D-196).
- « Annuler » après une saisie demande « Abandonner les modifications ? » (D-195).
- Une erreur rendue par `onSubmit` pour un champ disparaît dès que ce champ change.

En étapes (D-364) :
- « Suivant » vérifie les champs de l'étape en cours seulement, avec les mêmes règles et le même récapitulatif des erreurs (D-341). S'il en reste en erreur, l'utilisateur reste sur l'étape. Test : `EtapesVerification`.
- Après un changement d'étape (« Suivant », « Précédent », une étape faite de `ProgressIndicator`, « Modifier »), le focus va au titre de l'étape. Test : `EtapesNavigation`.
- On revient en arrière, on n'avance pas : une étape faite est un bouton dans `ProgressIndicator`, une étape à venir jamais (D-326). Pour retourner au récapitulatif après « Modifier », on repasse par « Suivant ». Test : `EtapesNavigation`, `EtapesRecapitulatif`.
- Les valeurs restent d'une étape à l'autre ; `onSubmit` reçoit toutes les valeurs, envoyées depuis le récapitulatif. Test : `EtapesNavigation`, `EtapesRecapitulatif`.
- Erreurs rendues par `onSubmit` : retour à la première étape qui en a ; le focus va à son champ, ou à son récapitulatif à partir de 2 erreurs dans l'étape. Les autres étapes en erreur sont marquées dans `ProgressIndicator`. Une erreur sans champ (`message` seul) reste au récapitulatif, dans le pied. Test : `EtapesErreurServeur`, `EtapesErreurServeurRecapitulatif`.
- « Annuler » après une saisie demande confirmation, à toutes les étapes (D-195). Test : `EtapesAnnuler`.

## Contenu
- Titre : le verbe et l'objet (« Nouveau projet », « Modifier le contact »).
- Titre de section : un nom court ; aide : une phrase.
- Libellé de l'action : un verbe (« Créer », « Enregistrer », « Envoyer »).

## Densité
Marges `--pad`, hauteurs des champs et boutons `--row-h` : web et desktop suivent leurs tokens.

## Clavier
Tab suit l'ordre des champs, puis « Annuler » et l'action. Entrée et Mod+Entrée envoient (D-196).
En étapes, Tab passe d'abord par les étapes faites de `ProgressIndicator` ; dans le pied, « Annuler », « Précédent », puis « Suivant ». Entrée et Mod+Entrée valent « Suivant », et l'action au récapitulatif.

## Accessibilité
- Chaque section est une région nommée par son titre.
- Le récapitulatif est une région `role="alert"`, nommée par sa phrase, focalisable (`tabIndex=-1`) ; ses liens sont des `<a>`.
- La phrase d'état est annoncée poliment (`aria-live="polite"`) ; l'erreur, tout de suite (`role="alert"`).
- Le formulaire est `aria-busy` pendant l'envoi.
- En étapes : la liste des étapes est nommée « Étapes du formulaire » ; le titre de l'étape (`h3`, `tabIndex=-1`) prend le focus au changement d'étape ; chaque groupe du récapitulatif est une région nommée par le titre de l'étape, en liste de définitions (`dl`) ; « Modifier » est nommé « Modifier « <étape> » ».

## Taille d'écran
- 800 px de large ou plus (conteneur) : section sur deux colonnes, 240 px puis 560 px au plus (D-193).
- En dessous : titre de section au-dessus des champs.
- Mobile : boutons du pied sur toute la largeur, état au-dessus ; en étapes, « Annuler », « Précédent » et « Suivant » se partagent la ligne.
- En étapes, `ProgressIndicator` se resserre comme d'habitude : sans aide sous 560 px, seul le titre de l'étape en cours sous 380 px (D-326). Test : `EtapesMobile`.

## Erreurs
Une exception levée par `onSubmit` affiche son message (sinon « L'enregistrement a échoué. Réessayez. ») dans le pied. La saisie reste.

## Niveau de réglage
L'app choisit les champs, leur ordre et leurs textes. Le reste est fixe.

## Placement
Dans le `main` d'AppShell (layout-rules : FormPage).

## Composition
`TextInput`, `TextArea`, `Select`, `ComboBox`, `RadioButtonGroup`, `Checkbox`, `CheckboxGroup`, `Fieldset`, `Button`, `Skeleton`, `useConfirm` ; en étapes, `ProgressIndicator` et `FormattedValue`.

## Décisions
D-022, D-130 à D-138, D-190 à D-196 ; D-326, D-341, D-344, D-364.

## Questions ouvertes
