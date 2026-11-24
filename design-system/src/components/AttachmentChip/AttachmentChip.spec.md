# AttachmentChip
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/Chat-v1.html (Q11)

## Rôle
Pièce jointe d'un message, avant l'envoi : une image, un fichier, ou un long texte collé. On la voit, on l'ouvre (texte), on la retire.
Ne pas l'utiliser pour :
- une liste de fichiers envoyés vers un serveur, avec avancement : prendre `FileList` ;
- une étiquette de mot-clé : prendre `Tag` ;
- une image envoyée, citée ou produite, à agrandir : prendre `ImageThumbnail` (D-383).

## Anatomie
`AttachmentList` : liste « Pièces jointes », en ligne, 8 px d'écart, alignée en bas, 4 px dessous.
1. **Image** : vignette de 56 × 56 px, rayon `--radius-md`, bord `--line`, image recadrée ; × rond de 20 px en haut à droite (6 px hors de la vignette), visible au survol et au focus.
2. **Fichier** : étiquette de 28 px, rayon `--radius-md`, bord `--line`, fond `--surface-side`, texte `--fs-sm` ; trombone de 14 px, nom coupé au milieu (200 px au plus, l'extension reste), × de 20 px.
3. **Texte collé** : même étiquette, icône de page ; « Texte collé 1 · 2 345 caractères » ouvre le texte dans une `Modal` (`lg`), en `TextArea` en lecture seule.
4. **En préparation** : `Spinner` à la place de l'icône (sur la vignette, voile `--surface` à 60 %).
5. **En erreur** : bord `--danger`, icône d'alerte en `--danger`, info-bulle avec l'erreur.

## Variantes
| `kind` | Usage |
|---|---|
| `image` | Photo, capture, image collée. |
| `file` | Tout autre fichier. |
| `text` | Collage long (`ChatComposer`, `onPasteLongText`). |

## Options
`AttachmentChip` :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `kind` | `"image" \| "file" \| "text"` | — (obligatoire) | Forme de la pièce. |
| `name` | `string` | — (obligatoire) | Nom du fichier, ou « Texte collé 1 ». |
| `src` | `string` | aucune | Vignette (`blob:`, `data:`) d'une image. Sans elle : icône d'image. |
| `text` | `string` | `""` | Contenu d'un texte collé. |
| `status` | `"ready" \| "pending" \| "error"` | `"ready"` | Prête, en préparation, en erreur. |
| `error` | `string` | « <nom> n'a pas pu être joint. » | Ce qui ne va pas. Exemple : « Fichier trop lourd : 40 Mo, 25 Mo au plus. ». |
| `onRemove` | `() => void` | aucun | × « Retirer <nom> ». Sans lui, pas de ×. |

`AttachmentList` : `label` (défaut « Pièces jointes »), `children` (des `AttachmentChip`, avec une `key`).

## Exclus
- Pas d'aperçu en grand d'une image : pour une image qu'on consulte (message envoyé, image citée), prendre `ImageThumbnail` (D-383).
- Pas de barre d'avancement : prendre `FileList`.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Prête | Rendu de base. |
| Survol ou focus d'une vignette | × visible (toujours visible sur écran sans survol). |
| En préparation | Roue « Préparation de <nom> ». |
| En erreur | Bord `--danger`, icône d'alerte nommée par l'erreur. |
| Survol du × | Fond `--hover`, × en `--fg`. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Vignette de 56 px ; étiquette de 28 px ; × de 20 px ; liste « Pièces jointes » (D-374) | verrouillé | `Anatomie` |
| × d'une vignette visible au survol et au focus ; il retire la pièce | réglable (`onRemove`) | `RetraitImage` |
| Nom de fichier coupé au milieu, 200 px au plus, l'extension reste ; nom complet en info-bulle s'il est coupé | verrouillé | `Fichier` |
| Texte collé : le résumé ouvre le texte en lecture seule ; Échap ferme | verrouillé | `TexteColle` |
| En préparation : roue ; en erreur : bord rouge, erreur dans l'info-bulle et le nom de l'icône | réglable (`status`, `error`) | `Etats` |
| Sans `onRemove`, pas de × | réglable | `SansRetrait` |

## Contenu
- Texte collé : « Texte collé n », numéroté par l'app dans l'ordre des collages.
- Erreur : ce qui ne va pas et la limite (« Fichier trop lourd : 40 Mo, 25 Mo au plus. »).

## Densité
Mêmes tailles dans les deux densités.

## Clavier
Tab atteint le résumé d'un texte collé, puis chaque ×. Entrée ou Espace les active.

## Accessibilité
- Liste `ul` nommée « Pièces jointes », un `li` par pièce.
- Image : `alt` = nom. × nommé « Retirer <nom> ».
- Résumé du texte : « Voir Texte collé 1 · 2 345 caractères » ; la modale est nommée par le résumé ; le champ, « Contenu de Texte collé 1 ».
- Préparation : `status` « Préparation de <nom> ». Erreur : icône `img` nommée par l'erreur.

## Taille d'écran
Les pièces passent à la ligne. Écran sans survol : × des vignettes toujours visible.

## Erreurs
L'app passe `status: "error"` et `error`. La pièce reste, avec son ×, pour être retirée.

## Placement
Slot `attachments` de `ChatComposer` ; aussi sous un message envoyé.

## Composition
`Modal`, `TextArea`, `Spinner`, `Tooltip`, info-bulles internes (`OverflowTooltip`, `HintTooltip`). Icônes internes `Paperclip`, `FileText`, `FileImage`, `CircleAlert`, `X`.

## Décisions
D-001, D-120, D-131, D-360, D-374, D-383.

## Questions ouvertes
Aucune.
