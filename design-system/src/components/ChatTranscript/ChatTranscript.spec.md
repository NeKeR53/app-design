# ChatTranscript
Statut : validé (2026-11-23) — Version : depuis la version qui suit 1.0.0
Validation : docs/validation/components/Chat-v1.html (Q10 A, Q11 A)

## Rôle
Zone défilante d'une conversation avec un agent : colonne centrée de 760 px qui reçoit les messages (`ChatMessage`) et le travail de l'agent (`ActivityGroup`, `WorkStatus`, `WorkSummary`). Elle suit la réponse en cours tant que l'utilisateur est en bas (D-375).
Ne pas l'utiliser pour :
- un fil de commentaires ou de notifications : prendre `List` ou `NotificationCenter` ;
- un journal technique : prendre `LogViewer`.

## Anatomie
1. Zone défilante (obligatoire) : `section` nommée, focusable, marges 12 px en haut, 16 px sur les côtés et en bas, gouttière de barre stable.
2. Colonne (obligatoire) : 760 px au plus, centrée.
3. « Afficher les messages précédents » (si `hasEarlier`) : bouton `subtle` `sm`, en haut de la colonne.
4. Emplacement vide (si aucun enfant) : `empty`, centré verticalement.
5. « Nouveaux messages ↓ » (si l'utilisateur a remonté et qu'un contenu arrive) : pastille 28 px, `--surface-raised`, ombre `--shadow-md`, centrée 12 px au-dessus du bas de la zone.
6. Région d'annonce (cachée) : `aria-live="polite"`.

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `children` | `ReactNode` | aucun | Messages et travail de l'agent. |
| `label` | `string` | « Conversation » (i18n) | Nom de la zone. |
| `followKey` | `string \| number` | aucun | Change à chaque envoi de l'utilisateur : retour en bas et recollage. |
| `announce` | `string` | aucun | Texte lu poliment quand il change (fin de réponse). Vide pendant l'écriture. |
| `empty` | `ReactNode` | aucun | Contenu d'une conversation vide (`EmptyState`). |
| `hasEarlier`, `onShowEarlier` | `boolean`, `() => void` | `false` | Messages plus anciens à charger ; la lecture ne saute pas. |

## Exclus
- Pas de virtualisation : l'app limite le nombre de tours affichés avec `hasEarlier`.
- Pas d'en-tête ni de zone de saisie : la saisie est `ChatComposer`, hors du relevé.
- Pas de défilement animé (D-026).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Collé en bas | La zone suit chaque changement de hauteur. |
| Remonté, rien de nouveau | Aucun bouton. |
| Remonté, nouveau contenu | « Nouveaux messages ↓ » au-dessus du bas. |
| Vide | `empty` au centre. |
| Focus clavier | Anneau `--focus` à l'intérieur de la zone. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| À moins de 100 px du bas, la zone suit le contenu (fragment, outil, image chargée) | verrouillé | `CollageEnBas`, `SeuilDeCollage` |
| Remonté, un nouveau contenu affiche « Nouveaux messages ↓ » ; la position ne bouge pas | verrouillé | `CollageEnBas` |
| Le bouton ramène en bas, recolle, disparaît ; le focus reste sur la zone | verrouillé | `CollageEnBas` |
| Un changement de `followKey` (envoi) ramène en bas, même remonté | réglable par l'app (`followKey`) | `CollageEnBas` |
| `announce` est lu poliment, une fois, quand il change ; jamais mot à mot | réglable par l'app (`announce`) | `AnnonceDeFin` |
| « Afficher les messages précédents » garde le message lu à sa place | réglable par l'app (`hasEarlier`) | `MessagesPrecedents` |
| L'ancrage de défilement du navigateur est coupé : seul le relevé décide | verrouillé | `MessagesPrecedents` |

## Contenu
- `announce` : une phrase courte, « Réponse terminée » ; pas le texte de la réponse.
- `label` : le titre de la conversation si l'écran en a plusieurs.

## Densité
Colonne de 760 px dans les deux densités ; les tailles de texte suivent `--fs-*`.

## Clavier
Tab atteint la zone ; flèches, Page préc./suiv., Début et Fin la font défiler. Le bouton « Nouveaux messages » est atteint au Tab après la zone.

## Accessibilité
- La zone est une `section` nommée (`region`), focusable pour défiler au clavier.
- Pas de `role="log"` : il lirait chaque fragment. La fin de réponse passe par `announce`.
- Chaque message est un `article` nommé par son auteur (`ChatMessage`).

## Taille d'écran
La colonne prend toute la largeur sous 760 px, avec 16 px de marge.

## Erreurs
Sans objet : l'erreur d'un tour est un message de l'app dans le relevé.

## Placement
Au centre d'une page ou d'un panneau de chat, au-dessus de `ChoicePrompt` et de `ChatComposer`, alignés sur la même colonne de 760 px.

## Composition
Contient `Button` (« Afficher les messages précédents »), un `Button` de React Aria et l'icône interne `ArrowDown`. Reçoit `ChatMessage`, `ActivityGroup`, `WorkStatus`, `WorkSummary`, `EmptyState`.

## Décisions
D-026, D-375

## Questions ouvertes
Aucune.
