# ChatMessage
Statut : validé (2026-11-23) — Version : depuis la version qui suit 1.0.0
Validation : docs/validation/components/Chat-v1.html (Q8 A, actions près du texte ; Q11 A)

## Rôle
Un message d'une conversation dans `ChatTranscript` : la bulle de l'utilisateur ou la réponse de l'assistant, avec ses pièces jointes et ses actions (D-375).
Ne pas l'utiliser pour :
- le travail de l'agent (outils, état) : prendre `ActivityGroup`, `WorkStatus`, `WorkSummary` ;
- une question de l'agent qui attend une réponse : prendre `ChoicePrompt`.

## Anatomie
1. Pièces jointes (facultatif) : au-dessus de la bulle, alignées comme elle, espacées de 8 px.
2. Corps (obligatoire) :
   - utilisateur : bulle à droite, 85 % de la colonne au plus, `--surface-side`, rayon `--radius-md`, marges 8 × 12 px, texte `--fs-md`, retours à la ligne gardés ;
   - assistant : sans bulle, pleine largeur, texte `--fs-md`, interligne 1,6 (l'app passe `Markdown`).
3. Rangée d'actions (facultatif) : `actions` (un `MessageActions`) puis `meta` en `--fg-3`, `--fs-sm`.
   - utilisateur : 4 px sous la bulle, à 6 px du bord droit ; un pont de 4 px garde le survol ;
   - assistant : dans la marge basse de 28 px, 4 px sous le texte, à 6 px du bord gauche.

## Variantes
| Rôle | Rendu |
|---|---|
| `user` | Bulle à droite ; marges 16 px au-dessus, 28 px dessous. |
| `assistant` | Texte pleine largeur ; marges internes 12 px au-dessus, 28 px dessous. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `role` | `"user" \| "assistant"` | — (obligatoire) | Auteur du message. |
| `children` | `ReactNode` | — (obligatoire) | Texte, ou `Markdown` pour une réponse. |
| `attachments` | `ReactNode` | aucun | Pièces jointes (`AttachmentChip`). |
| `actions` | `ReactNode` | aucun | Un `MessageActions`. |
| `meta` | `ReactNode` | aucun | Heure, état d'envoi (« Envoyé · 14:02 »). |
| `author` | `string` | « Vous » / « Assistant » (i18n) | Nom de l'`article`, lu par le lecteur d'écran. |

## Exclus
- Pas d'avatar ni de nom visible (D-375).
- Pas de bulle pour l'assistant, pas de couleur d'accent pour l'utilisateur.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Rangée d'actions cachée (opacité 0, sans pointeur). |
| Survol du message ou focus dedans | Rangée visible, fondu de 150 ms. |
| Écran tactile (`pointer: coarse`) | Rangée toujours visible. |
| Modification | Champ à la place du corps, avec « Annuler » et « Envoyer » ; rangée cachée. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Bulle de l'utilisateur à droite, 85 % au plus, `--surface-side`, rayon 8 px | verrouillé | `Utilisateur` |
| Actions de l'utilisateur 4 px sous la bulle, à droite ; pièces jointes au-dessus | verrouillé | `Utilisateur` |
| Actions de l'assistant dans sa marge basse, à gauche, 4 px sous le texte | verrouillé | `Assistant` |
| Actions visibles au survol et dès que le focus entre dans le message | verrouillé | `ActionsAuFocus` |
| « Modifier » remplace le corps par un champ (voir `MessageActions`) | réglable par l'app (`onEdit`) | `Modifier` |

## Contenu
- `meta` : heure courte et état d'envoi, séparés par « · » ; pas de phrase.

## Densité
Mesures identiques dans les deux densités ; les tailles de texte suivent `--fs-*`.

## Clavier
Tab entre dans la barre d'actions du message (un seul arrêt) ; voir `MessageActions`.

## Accessibilité
- Chaque message est un `article` nommé par son auteur.
- La rangée cachée reste dans l'ordre du focus : le focus la rend visible (2.4.7, 2.4.11).

## Taille d'écran
Sur écran tactile, actions toujours visibles. La bulle garde 85 % au plus.

## Erreurs
Sans objet : l'état d'envoi « Échec » passe par `meta`.

## Placement
Dans `ChatTranscript` seulement.

## Composition
Contient `Button` (modification). Reçoit `MessageActions`, `Markdown`, `AttachmentChip`.

## Décisions
D-375

## Questions ouvertes
Aucune.
