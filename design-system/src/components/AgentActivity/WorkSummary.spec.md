# WorkSummary
Statut : validé (2026-11-23) — Version : depuis la version qui suit 1.0.0
Validation : docs/validation/components/Chat-v1.html (Q7 A)

## Rôle
Résumé du travail d'un tour terminé : « A travaillé pendant 42 s · 4 outils appelés », replié ; il s'ouvre sur les outils. La réponse de l'agent reste visible, hors du résumé (D-376).
Ne pas l'utiliser pour :
- le travail en cours : prendre `ActivityGroup` et `WorkStatus` ;
- un bloc repliable sans rapport avec un agent : prendre `Accordion`.

## Anatomie
1. Titre (obligatoire) : titre d'`Accordion` (`--fs-sm`, `--fg-3`, chevron de 12 px).
2. Contenu (si fourni) : outils et messages intermédiaires, créés à l'ouverture.

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `durationMs` | `number` | — (obligatoire) | Durée du travail. |
| `toolCount` | `number` | — (obligatoire) | Nombre d'outils appelés. |
| `children` | `ReactNode` | aucun | Travail replié ; sans lui, le résumé est un texte simple. |
| `defaultExpanded` | `boolean` | `false` | Déplié au premier affichage. |

## Exclus
- La réponse finale n'entre pas dans le résumé.
- Pas de `className` ni de `style`.

## États
Ceux d'`Accordion` ; sans contenu, texte simple en `--fg-3`.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Replié par défaut ; clic, Entrée ou Espace l'ouvrent | verrouillé | `Replie` |
| Sans contenu, pas de bouton | verrouillé | `SansOutil` |

## Contenu
Texte interne (i18n), durée à la seconde : « A travaillé pendant 1 min 4 s · 1 outil appelé ».

## Densité
Celle d'`Accordion`.

## Clavier
Celui d'`Accordion`.

## Accessibilité
Celle d'`Accordion` : bouton avec `aria-expanded`, contenu nommé par le titre.

## Taille d'écran
Identique.

## Erreurs
Sans objet : un outil en échec reste visible dans son `ActivityGroup`.

## Placement
Dans `ChatTranscript`, au-dessus de la réponse finale d'un tour terminé.

## Composition
`Accordion`.

## Décisions
D-320, D-376

## Questions ouvertes
Aucune.
