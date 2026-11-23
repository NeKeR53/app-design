# Slider
Statut : validé (2026-11-23) — Version : depuis 1.0.0
Validation : docs/validation/components/Nouveaux-P4-v1.html (SL1, option A)

## Rôle
`Slider` règle une valeur approximative dans une étendue : un seuil d'alerte, un volume, une opacité, une fourchette de prix.
Ne pas l'utiliser pour :
- une valeur exacte (quantité, montant, durée précise) : prendre `NumberField` ;
- un choix parmi quelques options : prendre `SegmentedControl` ou `RadioButtonGroup` ;
- montrer un avancement : prendre `ProgressBar`.

## Anatomie
1. **Ligne du haut** : libellé à gauche (`--fs-sm`, `--fw-medium`, comme `Field`), valeur à droite (`--fs-sm`, `--fg-2`, chiffres tabulaires), formatée par `formatOptions`.
2. **Piste** : 4 px de haut, `--field`, rayon plein ; zone cliquable de 16 px de haut.
3. **Partie remplie** : `--primary` (`--fg` par défaut), du début à la poignée, ou entre les deux poignées.
4. **Poignée** : 16 px, ronde, fond `--surface`, trait de 2 px `--primary`.
5. **Aide** (facultative) : sous la piste, `--fs-sm`, `--fg-3`.

## Variantes
| Valeur | Rendu |
|---|---|
| Un nombre | Une poignée. |
| `[début, fin]` | Deux poignées ; la partie remplie va de l'une à l'autre ; la valeur affichée est « 20–80 € ». |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Libellé et nom accessible. |
| `hideLabel` | `boolean` | `false` | Libellé masqué à l'écran ; la valeur reste affichée. |
| `description` | `string` | aucune | Aide sous la piste. |
| `value` / `defaultValue` | `number \| [number, number]` | `minValue` | Valeur ; un tableau donne deux poignées. |
| `onChange` | `(value) => void` | aucun | À chaque déplacement : pour l'aperçu. |
| `onChangeEnd` | `(value) => void` | aucun | Au relâché et à chaque touche : pour enregistrer. |
| `minValue` / `maxValue` | `number` | `0` / `100` | Étendue. |
| `step` | `number` | `1` | Pas des flèches ; Page haut / bas : dix pas. |
| `formatOptions` | `Intl.NumberFormatOptions` | aucun | Format affiché et lu : pourcentage, devise, unité. |
| `isDisabled` | `boolean` | `false` | Désactivé. |
| `width` | `FieldWidth` | `"md"` | Largeur (D-133). |
| `name` | `string` | aucun | Nom dans le formulaire envoyé. |

## Exclus
- Jamais pour une valeur exacte : `NumberField` (D-366).
- Pas de champ de saisie à côté de la piste, pas de graduations ni de bulle au-dessus de la poignée.
- Pas de curseur vertical.
- Pas de « (facultatif) » : un curseur a toujours une valeur.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Piste `--field`, remplie `--primary`, poignée claire. |
| Focus clavier | Anneau `--focus` de 2 px autour de la poignée (D-337). |
| Glissé | Poignée en `--field`. |
| Désactivé | 40 % ; la poignée ne bouge pas. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Libellé au-dessus, valeur formatée à droite ; piste de 4 px `--field` ; remplie `--primary` ; poignée de 16 px (D-366) | verrouillé | `Anatomie` |
| Flèches : un pas ; Page haut / bas : dix pas ; Origine / Fin : minimum / maximum ; anneau de focus (D-366) | verrouillé | `Clavier` |
| `onChange` suit le geste ; `onChangeEnd` arrive au relâché, et à chaque touche (D-366) | verrouillé | `EnregistrementAuRelache` |
| Deux poignées nommées « Minimum » et « Maximum » ; elles ne se croisent pas | réglable (valeur `[a, b]`) | `Plage` |
| Désactivé : 40 %, aucun déplacement | réglable (`isDisabled`) | `Desactive` |

## Contenu
- Libellé : ce qu'on règle (« Seuil d'alerte », « Opacité »).
- Valeur : toujours formatée (« 60 % », « 20–80 € ») ; pas de valeur brute de 0 à 1.
- Enregistrement : dans `onChangeEnd`, jamais dans `onChange` (une requête par geste, pas une par pixel).

## Densité
Hauteurs fixes (piste 4 px, poignée 16 px, zone 16 px) ; écart de 4 px entre les lignes, comme `Field`.

## Clavier
- Tab : chaque poignée.
- ← ↓ / → ↑ : un pas. Page bas / Page haut : dix pas. Origine / Fin : minimum / maximum (ou la borne de l'autre poignée).

## Accessibilité
- Chaque poignée est un `slider` (champ `range` caché) nommé par le libellé ; en plage, « Minimum » et « Maximum » sont ajoutés (i18n `sliderMinimum`, `sliderMaximum`).
- `aria-valuetext` reprend la valeur formatée.
- L'aide est la description de chaque poignée.
- La valeur affichée (`output`) n'est pas annoncée en direct : le lecteur d'écran lit déjà la poignée.

## Taille d'écran
Largeur `md` (240 px) par défaut ; toute la largeur sur mobile (D-133). Glisser au doigt marche sur la poignée et sur la piste.

## Erreurs
Aucune : la valeur reste dans l'étendue.

## Placement
Formulaire de réglages, panneau de filtres, ligne de réglage. Libellé au-dessus (D-022).

## Composition
`Slider`, `Label`, `SliderOutput`, `SliderTrack`, `SliderFill`, `SliderThumb` de React Aria ; `fieldRoot` de `Field`.

## Décisions
D-022, D-133, D-337, D-356, D-366.

## Questions ouvertes
Aucune.
