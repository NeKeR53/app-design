# ChatPage
Statut : validé (2026-11-24) — Version : depuis la version qui suit 1.5.0
Validation : par délégation de l'utilisateur, 2026-11-24 — docs/validation/components/ChatPage-v1.html (Q1 A, Q2 A, Q3 A, Q4 A)

## Rôle
Gabarit d'une page de chat avec un agent, dans la zone `main` d'AppShell ou dans une fenêtre à part : barre d'outils, relevé (`ChatTranscript`), puis un pied aligné sur la colonne de 760 px du relevé (alertes, question de l'agent, saisie, options). Il porte la zone de dépôt de fichiers de toute la page (D-382).
Ne pas l'utiliser pour :
- un chat dans un panneau étroit ou une modale : poser `ChatTranscript` et `ChatComposer` dans le conteneur ;
- un fil de commentaires : `List`.

## Anatomie
1. **Barre d'outils** (facultative, fixe, trait dessous) : la même que `Page` (D-217) ; contenu libre à gauche (titre de la conversation, harnais), actions en zone `toolbar` à droite.
2. **Relevé** (obligatoire) : l'enfant, un `ChatTranscript`. Il prend la hauteur restante et défile seul.
3. **Pied** (fixe) : colonne de 760 px au plus, centrée, marges de 16 px sur les côtés et en bas, aligné sur la colonne du relevé. Zones empilées à 8 px :
   1. `alerts` (facultatif) : `Alert` liés à la saisie (sauvegarde en échec, limite atteinte) ;
   2. `question` (facultatif) : `ChoicePrompt` ; hauteur bornée à 40 % de la hauteur de la page de chat (360 px au plus), défile au-delà ; rien n'est rendu si la zone est vide ;
   3. `composer` (facultatif) : `ChatComposer` ;
   4. `options` (facultatif) : `ChatOptions`, juste sous la saisie, sans écart (spec de `ChatOptions`).
4. **Cadre de dépôt** (quand des fichiers survolent la page) : sous la barre d'outils, à 12 px des bords, tirets 1 px `--accent`, rayon `--radius-md`, fond `--accent` à 6 % sur `--surface`, texte centré `--fs-md` `--accent` « Déposez les fichiers pour les joindre ». Ne capte pas la souris.

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `children` | `ReactNode` | — (obligatoire) | Le relevé : un `ChatTranscript`. |
| `toolbar` | `ReactNode` | aucun | Contenu libre de la barre, à gauche, sur une ligne (comme `Page`). |
| `actions` | `Action[]` | aucune | Actions de la barre, zone `toolbar`. La barre apparaît dès que `toolbar` ou `actions` est donné. |
| `actionsLabel` | `string` | aucun | Sujet des actions, pour leur nom accessible. |
| `onActionError`, `onActionDone` | `(action, error?) => void` | aucun | Comme `Page`. |
| `alerts` | `ReactNode` | aucun | `Alert` liés à la saisie, au-dessus de la question. |
| `question` | `ReactNode` | aucun | Question ou autorisation de l'agent (`ChoicePrompt`). Bornée en hauteur. |
| `composer` | `ReactNode` | aucun | La saisie (`ChatComposer`). Absente : conversation en lecture seule. |
| `options` | `ReactNode` | aucun | La rangée d'options (`ChatOptions`). |
| `onDropFiles` | `(files: File[]) => void` | aucun | Fichiers déposés n'importe où sur la page. Sans lui, pas de dépôt DOM. |
| `isDraggingFiles` | `boolean` | `false` | Survol de fichiers vu par l'app (glisser-déposer du système, Tauri) : affiche le cadre de dépôt. |
| `dropLabel` | `string` | « Déposez les fichiers pour les joindre » (i18n) | Texte du cadre de dépôt. |

## Exclus
- Pas d'états de page (`loading`, `error`) : chargement et échec vont dans l'emplacement vide du relevé (`ChatTranscript`, option `empty`).
- Pas de panneau latéral : le suivi des conversations va dans le panneau de détail d'AppShell, ou à côté du gabarit dans une fenêtre à part.
- Pas de ligne de contexte dans le gabarit : elle défile avec les messages, c'est l'option `context` de `ChatTranscript` (D-382).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Barre, relevé, pied. |
| Fichiers survolés (DOM, avec `onDropFiles`) | Cadre de dépôt au-dessus du relevé et du pied. |
| Fichiers survolés (app, `isDraggingFiles`) | Même cadre ; le dépôt est traité par l'app. |
| Question longue | La zone de question défile ; le relevé et la saisie restent visibles. |
| Sans `composer` | Le pied ne garde que les alertes et la question. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Le pied est aligné sur la colonne de 760 px du relevé, dans les deux densités | verrouillé | `Alignement` |
| La question est bornée à 40 % de la hauteur de la page de chat (360 px au plus) et défile ; vide, elle ne prend pas de place | verrouillé | `QuestionLongue` |
| Des fichiers DOM qui survolent la page montrent le cadre ; il disparaît en sortant de la page | réglable par l'app (`onDropFiles`) | `DeposerDesFichiers` |
| Un dépôt sur la page appelle `onDropFiles` ; un dépôt déjà pris par `ChatComposer` n'est pas compté deux fois | réglable par l'app (`onDropFiles`) | `DeposerDesFichiers` |
| `isDraggingFiles` affiche le cadre sans dépôt DOM | réglable par l'app (`isDraggingFiles`) | `SurvolVenuDuSysteme` |

## Contenu
- `dropLabel` : une phrase courte, sans point final.
- `alerts` : une alerte à la fois de préférence ; la plus grave d'abord.

## Densité
Colonne de 760 px et marges de 16 px dans les deux densités ; textes en `--fs-*`.

## Clavier
Ordre de tabulation : barre d'outils, relevé, alertes, question, saisie, options. Le dépôt est un geste de souris : au clavier, « Joindre des fichiers… » du menu « + » de `ChatComposer`.

## Accessibilité
- Barre d'outils : `role="toolbar"` nommé par `actionsLabel` s'il est donné (comme `Page`).
- Le relevé est la `region` nommée de `ChatTranscript`.
- Le cadre de dépôt est un texte visible, sans rôle ; il ne prend jamais le focus.

## Taille d'écran
Sous 792 px de large, la colonne du pied prend toute la largeur avec 16 px de marge, comme le relevé.

## Erreurs
Échec d'une sauvegarde ou d'un envoi lié à la saisie : `Alert` dans `alerts`. Erreur d'un tour : message de l'app dans le relevé.

## Placement
Zone `main` d'AppShell, ou fenêtre à part (avec le suivi des conversations à côté, construit par l'app).

## Composition
Contient la barre d'outils de `Page` (`ActionBar`). Reçoit `ChatTranscript`, `Alert`, `ChoicePrompt`, `ChatComposer`, `ChatOptions`. Ne contient pas d'autre gabarit.

## Décisions
D-111, D-217, D-371, D-375, D-377, D-382

## Questions ouvertes
Aucune.
