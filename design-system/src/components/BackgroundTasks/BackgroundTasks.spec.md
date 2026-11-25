# BackgroundTasks
Statut : validé (2026-11-25, par délégation de l'utilisateur) — Version : depuis 1.19.0
Validation : docs/validation/components/BackgroundTasks-v1.html

## Rôle
Tâches qui durent, lancées par un agent ou par l'app : une commande en arrière-plan (un serveur), un sous-agent, un script long. On voit ce qui tourne, depuis quand, et on l'arrête ; puis combien de tâches sont finies, et combien ont échoué (D-401).
Ne pas l'utiliser pour :
- les outils appelés pendant une réponse, dans le relevé : prendre `AgentActivity` ;
- l'état du travail en cours sous le relevé : prendre `WorkStatus` ;
- l'avancement d'une tâche dont la durée est connue : prendre `ProgressBar`.

## Anatomie
1. **Ligne de tâche** (une par tâche en cours), hauteur `--row-h` :
   1. icône du type, 16 px, `--fg-2` : `command` terminal, `agent` robot, `other` outil ;
   2. libellé en `--fg`, coupé sur une ligne, texte complet en info-bulle ;
   3. durée écoulée en `--fs-sm`, `--fg-3`, chiffres tabulaires, mise à jour chaque seconde (« 1 min 5 s », format de `WorkStatus`) ;
   4. bouton d'arrêt : `IconButton` carré plein, toujours visible (pas au survol), nommé « Arrêter {libellé} ».
2. **Ligne de résumé** (facultative, dès qu'une tâche est finie) : « 82 terminées » en `--fs-sm`, `--fg-3` à gauche ; « 3 en échec » en `--danger`, `--fw-medium`, à droite.
3. **Vide** : « Aucune tâche en cours », en `--fg-3`.

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `tasks` | `{ id, title, kind?, startedAt, onStop? }[]` | — (obligatoire) | Tâches en cours. `startedAt` : horodatage en ms ou date. Sans `onStop`, pas de bouton : l'app ne sait pas arrêter cette tâche. Une promesse rendue par `onStop` garde le bouton en attente. |
| `finished` | `number` | 0 | Tâches finies, échecs compris. |
| `failed` | `number` | 0 | Tâches finies en échec. |
| `label` | `string` | « Tâches en arrière-plan » | Nom accessible de la liste. |

## Exclus
- Pas de sortie de la tâche ni de journal : l'app ouvre `LogViewer` ou `Terminal` ailleurs.
- Pas de liste des tâches finies : seulement leur compte.
- Pas de sélection ni de tri.
- Pas de `className` ni de `style`.

## États
- Tâche en cours ; arrêt demandé (bouton en roue, `isPending`, D-107) ; la tâche quitte la liste quand l'app la retire.
- Aucune tâche en cours, des tâches finies : le résumé seul.
- Rien : la phrase vide.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| La durée de chaque tâche avance chaque seconde, sans être annoncée (`timer`) | verrouillé | `EnCours` |
| Le bouton d'arrêt est toujours visible ; il appelle `onStop` et attend sa promesse | verrouillé | `Arret` |
| Résumé : terminées à gauche, échecs en `--danger` à droite ; absent tant que rien n'est fini | verrouillé | `Resume` |
| Sans tâche ni tâche finie : « Aucune tâche en cours » | verrouillé | `Vide` |

## Contenu
- Libellé : la commande ou la description donnée par l'agent, telle quelle.
- Pas de point final.

## Densité
Ligne de `--row-h` (34 px en web, 28 px en desktop).

## Clavier
Tab atteint chaque bouton d'arrêt, dans l'ordre des lignes. Les lignes ne prennent pas le focus.

## Accessibilité
- Liste `ul` nommée par `label`.
- Durée dans `role="timer"` : non annoncée chaque seconde.
- Bouton nommé « Arrêter {libellé} ».
- Icône du type décorative.

## Taille d'écran
Identique ; le libellé se coupe d'abord.

## Erreurs
Un arrêt qui échoue : la promesse rejetée remet le bouton ; l'app affiche la notification.

## Placement
Dans le contenu d'une section de `Drawer` (« Tâches en arrière-plan » du panneau d'une conversation), avec le nombre de tâches en cours en résumé de section.

## Composition
`IconButton`, `Tooltip` (libellé coupé).

## Décisions
D-107, D-401

## Questions ouvertes
Aucune.
