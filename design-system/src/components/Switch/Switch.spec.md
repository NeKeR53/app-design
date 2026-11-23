# Switch
Statut : validé (2026-11-23, par délégation de l'utilisateur) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/FormChoices-v1.html

## Rôle
Interrupteur marche/arrêt pour un réglage qui s'applique tout de suite (D-007, D-137).
Ne pas l'utiliser pour :
- une valeur envoyée avec un formulaire : prendre `Checkbox` (D-137) ;
- un choix entre plus de deux états : prendre `RadioGroup` ou `Select` ;
- afficher ou cacher une zone de l'écran : prendre un `IconButton` en bascule.

## Anatomie
1. **Interrupteur** (obligatoire) : 30 × 18 px, rond ; pastille blanche de 14 px (D-136).
2. **Libellé** : visible à droite (8 px d'écart, `--fs-md`, `--fg`) dans un formulaire ; masqué dans une ligne (ligne de réglage, `PropertyRow`), où il sert de nom accessible (D-136).
3. **Description** (facultative, libellé visible) sous le libellé, `--fs-sm`, `--fg-3`.

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `children` | `string` | — (obligatoire) | Libellé ; nom accessible. |
| `hideLabel` | `boolean` | `false` | Masque le libellé (ligne de réglage, `PropertyRow`) (D-136). |
| `description` | `string` | aucune | Ligne sous le libellé visible. |
| `isSelected` / `defaultSelected` / `onChange` | `boolean` | `false` | État. |
| `isDisabled` | `boolean` | `false` | Désactivé. |
| `isReadOnly` | `boolean` | `false` | Lecture seule. |

## Exclus
- Pas de texte « Oui/Non » ni d'icône dans l'interrupteur.
- Pas de taille propre au formulaire (D-136).
- Pas d'état d'erreur ni de vérification : un réglage immédiat qui échoue revient à l'ancienne valeur, avec une notification (D-007).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Éteint | Fond `--selected`. |
| Allumé | Fond `--accent` ; pastille à droite. |
| Focus | Anneau `--accent` de 2 px autour de l'interrupteur. |
| Désactivé | Opacité 40 %. |
| Lecture seule | Rendu normal ; un clic ne change rien. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Clic sur l'interrupteur ou son libellé visible, ou Espace : bascule ; la pastille glisse en `--dur-fast`, sans animation si l'utilisateur les réduit (D-014) | verrouillé | `Bascule` |
| L'effet s'applique tout de suite ; l'app appelle son action dans `onChange` (D-007, D-137) | verrouillé | `Bascule` |
| Dans `PropertyRow`, même composant, libellé masqué, nom repris de la ligne (D-136) | verrouillé | `DetailPanel/ActionImmediate` |

## Contenu
Libellé long : retour à la ligne, l'interrupteur reste en face de la première ligne.

## Densité
30 × 18 px dans les deux densités ; zone cliquable de `--target-min` au moins.

## Clavier
Tab : un arrêt. Espace : bascule.

## Accessibilité
React Aria `Switch` : `input role="switch"` caché, `aria-checked`, nom = libellé (même masqué). Contraste : le fond éteint `--selected` est complété par la position de la pastille.

## Taille d'écran
Identique.

## Erreurs
Voir Exclus.

## Placement
Ligne de réglage de `SettingsPage` (calé à droite, libellé masqué) ; `PropertyRow` (D-059) ; formulaire, seulement pour un effet immédiat (D-137).

## Composition
Aucun composant contenu.

## Décisions
D-007, D-014, D-059, D-135, D-136, D-137

## Questions ouvertes
Aucune.
