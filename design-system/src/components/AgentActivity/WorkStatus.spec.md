# WorkStatus
Statut : validé (2026-11-23) — Version : depuis la version qui suit 1.0.0
Validation : docs/validation/components/Chat-v1.html (Q7 A)

## Rôle
Ligne d'état pendant que l'agent travaille : l'étape en cours et le temps écoulé (D-376).
Ne pas l'utiliser pour :
- un chargement court sans étape : prendre `Spinner` ;
- le résumé après le tour : prendre `WorkSummary`.

## Anatomie
1. Roue (obligatoire) : `Spinner` `sm`, décorative.
2. Libellé (obligatoire) : l'étape, `--fs-md` en `--fg-2`.
3. Temps écoulé (obligatoire) : « · depuis 12 s », chiffres tabulaires, mis à jour chaque seconde.

## Variantes
| Étape (`phase`) | Libellé |
|---|---|
| `thinking` | « Réflexion en cours » |
| `tool` | « Outil en cours : X » |
| `writing` | « Rédaction en cours » |
| `approval` | « Autorisation requise » |
| `working` (défaut) | « Travail en cours » |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `phase` | `WorkPhase` | `"working"` | Étape. |
| `toolName` | `string` | aucun | Nom de l'outil pour `tool`. |
| `label` | `string` | aucun | Libellé propre à l'app ; remplace celui de `phase`. |
| `startedAt` | `number \| Date` | — (obligatoire) | Début du travail. |

## Exclus
- Pas de barre d'avancement : la durée n'est pas connue.
- Pas de bouton « Arrêter » : il est dans `ChatComposer`.
- Pas de `className` ni de `style`.

## États
Un seul état, qui change de libellé.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Le temps écoulé avance chaque seconde : « 12 s », « 2 min 5 s », « 1 h 2 min 5 s » | verrouillé | `Etapes`, `Annonce` |
| Seul le libellé est dans la région `status` : il est lu quand il change, pas à chaque seconde | verrouillé | `Annonce` |

## Contenu
`label` : un groupe nominal suivi de « en cours » ; pas de point final.

## Densité
Marges 12 px au-dessus et dessous dans les deux densités.

## Clavier
Rien à atteindre.

## Accessibilité
- Libellé dans `role="status"` (poli).
- Temps écoulé dans `role="timer"` : non annoncé, lisible à la demande.
- Roue cachée aux lecteurs d'écran.

## Taille d'écran
Le temps passe à la ligne si la place manque.

## Erreurs
Sans objet.

## Placement
En bas de `ChatTranscript`, sous le dernier outil, pendant la réponse seulement.

## Composition
`Spinner`.

## Décisions
D-360, D-376

## Questions ouvertes
Aucune.
