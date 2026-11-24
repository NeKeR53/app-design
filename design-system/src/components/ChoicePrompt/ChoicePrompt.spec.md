# ChoicePrompt
Statut : validé (2026-11-23) — Version : depuis la version qui suit 1.0.0
Validation : docs/validation/components/Chat-v1.html (Q11 A)

## Rôle
Carte posée au-dessus de la zone de saisie quand l'agent attend une réponse : une question avec des options numérotées, ou une autorisation (D-377).
Ne pas l'utiliser pour :
- une confirmation hors conversation : prendre `useConfirm` ou `Modal` ;
- un choix qui demande ensuite « Valider » : prendre `RadioButtonGroup`.

## Anatomie
1. En-tête (obligatoire) : pastille de 16 px en `--accent` (« ? » ou « ! »), « Question de l'agent » ou « Autorisation demandée », `--fs-sm` en `--fg-2`.
2. Question (obligatoire) : `--fs-lg`, interligne 1,5.
3. Détail (facultatif) : bloc en chasse fixe, `--surface-side`.
4. Options : lignes de 32 px au moins, rayon `--radius-md`, numéro dans une case de 20 px, survol `--surface-side`.
5. « Autre réponse… » (question) : ligne en `--fg-2`, qui devient un champ avec « Annuler » et « Envoyer ».
Cadre neutre : bord `--line`, fond `--surface`, rayon `--radius-lg`, marges 10 × 12 px. Seule la pastille de l'en-tête porte l'accent (D-001).

## Variantes
| Type (`kind`) | Rendu |
|---|---|
| `question` (défaut) | « ? », « Autre réponse… » par défaut. |
| `permission` | « ! », pas de réponse libre par défaut. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `question` | `string` | — (obligatoire) | Question ou action à autoriser. |
| `kind` | `"question" \| "permission"` | `"question"` | Type de carte. |
| `detail` | `string` | aucun | Commande ou texte à autoriser. |
| `options` | `ChoiceOption[]` | — (obligatoire) | `id`, `label`, `description`. |
| `allowOther` | `boolean` | `true` (question), `false` (autorisation) | « Autre réponse… ». |
| `onChoose` | `(answer) => void` | — (obligatoire) | `{ id }` pour une option, `{ text }` pour une réponse libre. |
| `isDisabled` | `boolean` | `false` | Réponse impossible pour l'instant. |

## Exclus
- Pas de choix multiple.
- Pas de touche globale : les chiffres restent au champ de saisie.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Option survolée ou focus | Fond `--surface-side` ; anneau `--focus` au clavier. |
| Réponse libre ouverte | Champ à la place de « Autre réponse… ». |
| Inactive | Options et « Autre réponse… » à 40 %. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Un clic, ou Entrée sur l'option active, répond `{ id }` | verrouillé | `Question` |
| Touches 1 à 9 : l'option de ce numéro, seulement si le focus est dans la carte (hors champ libre) | verrouillé | `Touches` |
| « Autre réponse… » ouvre un champ : Entrée envoie `{ text }`, Maj+Entrée va à la ligne, Échap referme et rend le focus | réglable par l'app (`allowOther`) | `AutreReponse` |
| Autorisation : détail en chasse fixe, pas de réponse libre | réglable par l'app (`kind`) | `Autorisation` |
| Inactive : ni clic ni touche ne répondent | réglable par l'app (`isDisabled`) | `Inactive` |

## Contenu
- Libellés d'option : l'action, à l'infinitif ou en groupe nominal court (« Autoriser une fois »).
- 9 options au plus avec un numéro ; au-delà, sans numéro.

## Densité
Lignes de 32 px au moins dans les deux densités.

## Clavier
Tab entre dans la liste (un arrêt) puis atteint « Autre réponse… ». Flèches, Début, Fin et la recherche par lettres dans la liste ; Entrée répond ; 1 à 9 répondent tant que le focus est dans la carte.

## Accessibilité
- Carte : `region` nommée par la question.
- Options : `ListBox` de React Aria sans sélection (`selectionMode="none"`, `onAction`). Une option répond tout de suite : un `radiogroup` impliquerait un bouton « Valider » de plus. La liste donne un seul arrêt de Tab, les flèches et la recherche par lettres.
- Chaque option porte `aria-keyshortcuts` (son numéro) ; le numéro visible est caché aux lecteurs d'écran.

## Taille d'écran
Pleine largeur de la colonne de 760 px.

## Erreurs
Sans objet : l'app garde la carte tant que la réponse n'est pas transmise.

## Placement
Au-dessus de `ChatComposer`, dans la même colonne que `ChatTranscript`.

## Composition
`ListBox` et `Button` de React Aria, `Button` de Socle.

## Décisions
D-377

## Questions ouvertes
Aucune.
