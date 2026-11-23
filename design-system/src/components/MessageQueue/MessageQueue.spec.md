# MessageQueue
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/Chat-v1.html (Q9 A)

## Rôle
Messages écrits pendant une réponse de l'agent, qui partiront à la fin de l'étape en cours. On les réordonne, on les modifie, on les retire, ou on en envoie un tout de suite.
Ne pas l'utiliser pour :
- une liste de tâches ou de fichiers : prendre `List` ou `FileList` ;
- l'historique des messages envoyés : prendre `ChatTranscript`.

## Anatomie
Dans le cadre de `ChatComposer`, en tête, séparée du texte par un filet `--line` :
1. **Ligne** de 24 px par message, rayon `--radius-md`, fond `--surface-side` au survol.
2. **Poignée** (20 px, grille de points de 12 px) : glisser ou flèches. Avec un seul message, une horloge de 12 px à la même largeur.
3. **Aperçu** sur une ligne, coupé d'une ellipse, texte `--fs-sm` en `--fg`, pastilles de références à leur place.
4. **Actions** de 24 px, icône de 14 px, en `--fg-2` : « Modifier », « Retirer », « Envoyer maintenant » (↗).

## Variantes
Une seule.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `items` | `QueuedMessage[]` | — (obligatoire) | `{ id, text, references?, isEditable? }`. Vide : rien n'est rendu. |
| `onReorder` | `(ids: string[]) => void \| Promise<void>` | aucun | Nouvel ordre. Sans lui, pas de poignée. Une promesse rejetée remet l'ordre d'avant. |
| `onEdit` | `(id) => void` | aucun | « Modifier » : l'app remet le message dans la saisie. Inactif si `isEditable: false`. |
| `onRemove` | `(id) => void` | aucun | « Retirer ». |
| `onSendNow` | `(id) => void` | aucun | « Envoyer maintenant ». |
| `isDisabled` | `boolean` | `false` | Actions inactives, pas de poignée. |

## Exclus
- Pas de file hors du cadre (Q9 option B écartée).
- Pas de pièces jointes dans l'aperçu : l'app donne un texte (« Texte collé », « Pièces jointes seules »).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Ligne transparente, aperçu en `--fg`, icônes en `--fg-2`. |
| Survol d'une ligne | Fond `--surface-side`. |
| Ligne glissée | Ligne à 40 % ; une copie suit le pointeur (`--surface-raised`, `--shadow-md`). |
| « Modifier » inactif | Opacité 40 %. |
| Désactivée | Pas de poignée ; actions à 40 %. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Lignes de 24 px, aperçu sur une ligne avec ellipse, filet sous la file (D-373) | verrouillé | `Anatomie` |
| Actions : rappel avec l'identifiant du message | réglable | `Actions` |
| Flèches haut et bas sur la poignée : le message monte ou descend, le focus le suit, le déplacement est annoncé (« Message déplacé en position 2 sur 3 ») (D-373) | verrouillé | `ReordonnerAuClavier` |
| Glisser la poignée (après 4 px) : l'ordre suit le pointeur, `onReorder` au relâchement | verrouillé | `GlisserDeposer` |
| Refus de l'app (promesse rejetée) : l'ordre d'avant revient | verrouillé | `ReordonnementRefuse` |
| Un seul message : horloge à la place de la poignée | verrouillé | `UnSeulMessage` |
| Désactivée : pas de poignée, actions inactives | réglable | `Desactivee` |

## Contenu
- Aperçu : le texte du message ; « Texte collé » pour un collage seul.

## Densité
Lignes de 24 px dans les deux densités ; actions de 24 px (cible minimale).

## Clavier
| Touche | Effet |
|---|---|
| Tab | Poignée, puis « Modifier », « Retirer », « Envoyer maintenant », ligne après ligne. |
| Flèches haut et bas (poignée) | Déplacent le message. |
| Entrée, Espace | Activent l'action. |

## Accessibilité
- `section` nommée « 3 messages en file », décrite par « En file : part à la fin de l'étape en cours » ; liste ordonnée.
- Poignée : « Déplacer le message 1 », décrite par « Flèches haut et bas pour réordonner ».
- Actions nommées avec le rang : « Retirer le message 2 ».
- Déplacement annoncé dans un `status`.

## Taille d'écran
L'aperçu se coupe ; les actions gardent leur place.

## Erreurs
Refus de réordonner : l'ordre d'avant revient ; l'app dit pourquoi (notification).

## Placement
Slot `queue` de `ChatComposer`.

## Composition
`Tooltip`, `Button` de React Aria, `MentionText`. Icônes internes `GripVertical`, `Clock`, `Pencil`, `X`, `ExternalArrow`.

## Décisions
D-001, D-373.

## Questions ouvertes
Aucune.
