# InlineEdit
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/Divers-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Texte modifiable sur place : le titre d'un élément, une valeur du panneau de détail (layout-rules : « propriétés modifiables sur place »), le nom d'une liste ou d'une vue.
Ne pas l'utiliser pour :
- un formulaire de plusieurs champs : prendre `TextInput` et `FormPage` ;
- un choix dans une liste : action de ligne avec `DropdownMenu` (D-059) ou `Select` ;
- une date, un nombre avec unité, une saisie riche (mentions) : solution de l'app, hors de cette version (D-324).

## Anatomie
1. Valeur (obligatoire) : le texte, dans la police de son conteneur. Vide : texte d'invite en `--fg-3`, ou « — ».
2. Bouton caché « Modifier « libellé » » : porte le clavier et le nom accessible.
3. En saisie : cadre de champ (D-130) à la même place, puis message d'erreur sous le cadre.

## Variantes
| Mode | Rendu |
|---|---|
| `line` (défaut) | Une ligne ; Entrée enregistre. |
| `multiline` | De 2 à 10 lignes, retours à la ligne gardés ; Mod+Entrée enregistre. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `value` | `string` | — (obligatoire) | Valeur affichée. |
| `label` | `string` | — (obligatoire) | Nom du champ (accessible, et « Modifier « libellé » »). |
| `onSave` | `(value) => void \| Promise` | — (obligatoire) | Enregistre ; une promesse rejetée garde la saisie ouverte (D-323). |
| `mode` | `"line" \| "multiline"` | `"line"` | Une ou plusieurs lignes. |
| `placeholder` | `string` | « — » | Texte d'invite d'une valeur vide. |
| `isRequired` | `boolean` | `false` | Valeur vide refusée (D-132), avec « Renseignez « <libellé> ». » (D-344). |
| `requiredMessage` | `string` | aucun | Remplace ce message (D-344). |
| `validate` | `(value) => string \| null` | aucune | Vérification ; la phrase s'affiche sous le champ (D-132). |
| `isDisabled` | `boolean` | `false` | Texte simple, sans saisie. |
| `isEditing`, `onEditingChange` | `boolean`, `(v) => void` | aucun | Ouverture pilotée par l'app (« Renommer » dans un menu). |
| `maxLength` | `number` | aucune | Longueur maximale, dépassable : au-delà, « n caractères en trop » sous le champ et enregistrement refusé (D-343). |

## Exclus
- Pas d'éditeur fourni par l'app (`renderEditor` d'Alfred) : du texte seulement (D-324).
- Pas de boutons « Enregistrer » et « Annuler » à côté du champ (D-323).
- Pas d'icône crayon, de fond ni de soulignement au repos (D-322).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Texte seul, sans bord. |
| Survol | Bord de 1 px `--line-strong`, rayon 8 px (D-322). |
| Focus clavier | Bord et anneau accent. |
| Saisie | Cadre de champ (D-130) à la même place ; texte dans la même police. |
| Attente | Champ en lecture seule, curseur d'attente, `aria-busy`. |
| Erreur | Bord `--danger`, message sous le champ ; la saisie reste ouverte. |
| Vide | Texte d'invite en `--fg-3`. |
| Désactivé | Texte simple. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Un clic, Entrée ou F2 ouvre la saisie ; une sélection de texte n'ouvre rien (D-323) | verrouillé | `ParDefaut`, `Clavier` |
| Entrée enregistre ; Mod+Entrée en plusieurs lignes, où Entrée passe à la ligne (D-323) | verrouillé | `ParDefaut`, `PlusieursLignes` |
| Un clic à côté ou Tab enregistre (D-323) | verrouillé | `ClicACote` |
| Échap annule ; valeur inchangée : pas d'appel à `onSave` (D-323) | verrouillé | `Clavier` |
| Promesse en cours : lecture seule ; rejetée : saisie ouverte, valeur gardée, message `actionFailed` (D-323) | verrouillé | `Echec` |
| `isRequired` et `validate` bloquent l'enregistrement, message sous le champ (D-132) ; message d'obligation construit à partir du libellé, ou `requiredMessage` (D-344) | réglable par l'app | `Obligatoire`, `MessageObligatoire` |
| Limite dépassable : la saisie continue ; au-delà, « n caractères en trop » en `--danger`, lu après 1 s de pause ; Entrée ou sortie : « Saisissez n caractères au plus. », saisie ouverte (D-343) | verrouillé | `LimiteDepassable` |
| Après Entrée ou Échap, le focus revient à la valeur (D-323) | verrouillé | `ParDefaut`, `Clavier` |
| Le texte ne bouge pas à l'ouverture (D-322) | verrouillé | `DansLePanneau` |

## Contenu
- `label` : un nom court (« Nom », « Responsable »).
- `placeholder` : une invite à l'infinitif (« Ajouter une description »).
- Valeur longue : passe à la ligne.

## Densité
La valeur et le champ suivent la police du conteneur. Marges de 2 px sur 6 px, compensées par une marge négative : la valeur reste alignée sur les autres textes.

## Clavier
Tab atteint le bouton caché. Entrée, Espace ou F2 ouvrent. En saisie : Entrée (ou Mod+Entrée), Échap, Tab.

## Accessibilité
- Bouton « Modifier « libellé » » avec `aria-keyshortcuts="F2"` ; il reste dans l'ordre de tabulation.
- Le champ porte le libellé (caché à l'écran) et son message d'erreur (`aria-describedby`).
- `aria-busy` pendant l'enregistrement.

## Taille d'écran
Identique sur toutes les tailles ; sur un écran tactile, un appui ouvre la saisie.

## Erreurs
Vérification : message sous le champ (D-132). Échec de `onSave` : message `actionFailed` sous le champ, saisie ouverte (D-323). L'app peut aussi afficher une notification.

## Placement
Titre d'un élément (en-tête de `DetailPage`, haut du panneau de détail) ; valeur d'une `PropertyRow` de `Drawer` (D-324). Jamais dans une cellule de `Table` dans cette version.

## Composition
Reprend les pièces internes de `Field` (cadre D-130, libellé, erreur) et le `TextField` de React Aria.

## Décisions
D-040, D-130, D-132, D-322, D-323, D-324 ; D-343, D-344

## Questions ouvertes
Aucune.
