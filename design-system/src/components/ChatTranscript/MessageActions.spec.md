# MessageActions
Statut : validé (2026-11-23) — Version : depuis la version qui suit 1.0.0
Validation : docs/validation/components/Chat-v1.html (Q8 A)

## Rôle
Barre d'actions d'un `ChatMessage` : Copier par défaut, puis Citer, Relancer, Repartir d'ici et Modifier si l'app les fournit (D-375).
Ne pas l'utiliser pour :
- des actions hors d'un message : prendre `ActionBar` ou `IconButton` ;
- plus de cinq actions : passer les autres dans un `DropdownMenu` de l'app.

## Anatomie
1. Barre (obligatoire) : `toolbar`, boutons collés (sans espace).
2. Boutons : 24 px, rayon `--radius-sm`, icône de 12 px en `--fg-3`, `--fg` et `--hover` au survol ; info-bulle au-dessus.
   Ordre : Copier, Citer, Relancer, Repartir d'ici, Modifier.

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `content` | `string` | — (obligatoire) | Texte copié, cité sans sélection, repris par Modifier. |
| `onQuote` | `(text) => void` | aucun | « Citer dans la réponse » : le passage sélectionné dans le message, sinon tout. |
| `onRetry` | `() => void` | aucun | « Relancer le message ». |
| `onFork` | `() => void` | aucun | « Repartir d'ici ». |
| `onEdit` | `(text) => void \| Promise<void>` | aucun | « Modifier le message », en place. Une promesse rejetée garde le champ. |
| `isDisabled` | `boolean` | `false` | Relancer, Repartir d'ici et Modifier inactifs ; Copier et Citer restent actifs. |

## Exclus
- Pas de notification après la copie : le retour est dans le bouton (coche) et l'info-bulle (« Copié »).
- Pas de suppression de message dans cette version.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Icône `--fg-3`. |
| Survol | Fond `--hover`, icône `--fg`, info-bulle après 500 ms. |
| Copié | Coche, nom et info-bulle « Copié » pendant 2 s, annoncé poliment. |
| Copie impossible | « Copie impossible » pendant 2 s. |
| Inactif | Opacité 40 %. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Boutons de 24 px, icônes de 12 px, sans espace | verrouillé | `Assistant` |
| Copier copie `content`, sans notification ; coche et « Copié » 2 s | verrouillé | `Copier` |
| Citer envoie le passage sélectionné dans le message, sinon tout le message | réglable par l'app (`onQuote`) | `Citer` |
| Modifier : un champ remplace le corps, focus au bout du texte ; Échap annule ; Entrée renvoie ; Maj+Entrée va à la ligne ; « Annuler » et « Envoyer » | réglable par l'app (`onEdit`) | `Modifier` |
| Après la modification, le focus revient sur « Modifier » | verrouillé | `Modifier` |
| `isDisabled` coupe Relancer, Repartir d'ici et Modifier, pas Copier ni Citer | réglable par l'app | `Inactif` |
| Flèches gauche et droite d'une action à l'autre | verrouillé | `ActionsAuFocus` |

## Contenu
Libellés internes (i18n) : « Copier le message », « Copié », « Citer dans la réponse », « Relancer le message », « Repartir d'ici », « Modifier le message », « Annuler », « Envoyer ».

## Densité
24 px dans les deux densités et sur écran tactile (cible minimale 2.5.8 ; la rangée y reste visible).

## Clavier
Tab entre dans la barre (un arrêt par message) ; flèches gauche et droite ; Entrée ou Espace agit. Dans le champ de modification : Entrée, Maj+Entrée, Échap.

## Accessibilité
- `toolbar` nommée « Actions du message » : un seul arrêt de Tab par message dans une longue conversation.
- Chaque bouton est nommé ; l'info-bulle ne double pas le nom.
- « Copié » est annoncé par une région `status`.

## Taille d'écran
Identique sur toutes les tailles.

## Erreurs
Copie refusée par le navigateur : « Copie impossible » dans le bouton et l'info-bulle.

## Placement
Dans l'emplacement `actions` de `ChatMessage` seulement (« Modifier » a besoin du message).

## Composition
`Toolbar`, `Button` et `Tooltip` de React Aria ; icônes internes `Copy`, `Check`, `TextQuote`, `RotateCcw`, `Shuffle`, `Pencil`.

## Décisions
D-031, D-304, D-375

## Questions ouvertes
Aucune.
