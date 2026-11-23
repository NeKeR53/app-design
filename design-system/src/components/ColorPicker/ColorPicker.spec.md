# ColorPicker
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/Nouveaux-P4-v1.html (CP1, option A)

## Rôle
`ColorPicker` choisit une couleur dans un nuancier prédéfini : la couleur d'une étiquette, d'un projet, d'une catégorie d'agenda.
Ne pas l'utiliser pour :
- un réglage de thème : le thème passe par `SocleProvider` (D-338) ;
- un choix libre de teinte (roue, dégradé) : pas prévu ;
- un statut : la couleur ne porte que du sens, choisi par le design system (D-001).

## Anatomie
1. **Libellé** (obligatoire) : au-dessus, `--fs-sm`, `--fw-medium`.
2. **Nuancier** : 8 à 12 pastilles de 24 px, rayon 4 px, 8 px d'écart, passage à la ligne. Trait intérieur léger : une couleur claire reste visible.
3. **Pastille choisie** : anneau `--fg` de 2 px, décalé de 2 px (fond `--surface` entre les deux).
4. **Champ « Code hexadécimal »** (avec `allowsCustom`) : sous le nuancier, 160 px, cadre de `Field`.
5. **Aide** (facultative), puis **alerte de contraste** (avec `contrastWith`), en `--warning`.

## Variantes
| Nuancier | Contenu |
|---|---|
| Par défaut | Les 8 couleurs des graphiques (`--chart-1` à `--chart-8`, thème clair) : Bleu, Orange, Vert, Jaune, Rose, Vert foncé, Violet, Rouge. |
| De l'app | `colors` : 8 à 12 `{ value, name }`. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Libellé et nom accessible du nuancier. |
| `hideLabel` | `boolean` | `false` | Libellé masqué à l'écran. |
| `description` | `string` | aucune | Aide sous le nuancier. |
| `colors` | `{ value, name }[]` | palette des graphiques | Couleurs en hexadécimal à 6 chiffres, et leur nom. |
| `value` / `defaultValue` | `string` | aucune | Couleur choisie, en hexadécimal ; casse libre à l'entrée. |
| `onChange` | `(value: string) => void` | aucun | À chaque choix ; hexadécimal minuscule (« #2a78d6 »). |
| `allowsCustom` | `boolean` | `false` | Ajoute le champ « Code hexadécimal ». |
| `contrastWith` | `string` | aucune | Couleur du texte posé sur la couleur choisie ; alerte sous 4,5 pour 1. |
| `isDisabled` | `boolean` | `false` | Désactivé. |
| `width` | `FieldWidth` | `"full"` | Largeur (D-133). |

`defaultColors(messages)` rend la palette par défaut, pour la compléter.

## Exclus
- Pas de roue, de zone de teinte ni de curseur de canal (`ColorArea`, `ColorWheel`).
- Pas de transparence : 6 chiffres hexadécimaux.
- Pas de nuancier de plus de 12 couleurs.
- Pas de blocage quand le contraste est faible : une alerte seulement.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Aucune couleur | Aucune pastille choisie. |
| Choisie | Anneau `--fg` autour de la pastille. |
| Focus clavier | Anneau `--focus` de 2 px au-delà de la pastille ; info-bulle du nom. |
| Couleur hors nuancier | Aucune pastille choisie ; le champ montre le code. |
| Contraste faible | Alerte en `--warning` sous le nuancier. |
| Désactivé | 40 %, aucun choix. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Palette par défaut : les 8 couleurs des graphiques, chacune nommée (D-367) | réglable (`colors`) | `Palette`, `PaletteDeLApp` |
| Choix exclusif ; les flèches déplacent et choisissent ; un seul arrêt de Tab (D-367) | verrouillé | `ChoixAuxFleches` |
| Pastille choisie : anneau `--fg` de 2 px, décalé de 2 px (D-367) | verrouillé | `Selection` |
| Le nom de la couleur est lu, et affiché en info-bulle au focus clavier ou après 500 ms de survol (D-031, D-367) | verrouillé | `InfoBulle` |
| Saisie hexadécimale ; le champ suit le nuancier (D-367) | réglable (`allowsCustom`) | `SaisieHexadecimale` |
| Contraste sous 4,5 pour 1 avec `contrastWith` : alerte en `--warning`, décrit le nuancier, lue poliment (D-367) | réglable (`contrastWith`) | `Contraste` |
| Désactivé : 40 %, aucun choix | réglable (`isDisabled`) | `Desactive` |

## Contenu
- Noms de couleur : un ou deux mots usuels (« Bleu », « Vert foncé »), jamais le code seul.
- Alerte : « Contraste trop faible avec le texte : 2,1 pour 1, 4,5 pour 1 au moins. » (`colorLowContrast`).

## Densité
Pastilles de 24 px dans toutes les densités (cible minimale AA, `--target-min` en web et desktop).

## Clavier
- Tab : la pastille choisie (ou la première), puis le champ hexadécimal.
- Flèches : pastille voisine, choisie aussitôt. Origine / Fin : première / dernière.
- Champ : la valeur s'applique avec Entrée ou en quittant le champ ; un code invalide reprend la valeur précédente.

## Accessibilité
- Le nuancier est un `listbox` nommé par le libellé ; chaque pastille est une `option` nommée par son nom.
- Le tout est un `group` nommé par le libellé.
- L'aide et l'alerte décrivent le nuancier et le champ ; l'alerte est dans une zone `aria-live="polite"`.
- La pastille choisie se voit par l'anneau, pas seulement par la couleur.

## Taille d'écran
Les pastilles passent à la ligne ; toute la largeur sur mobile (D-133).

## Erreurs
Pas d'erreur bloquante : un code invalide est ignoré, un contraste faible donne une alerte.

## Placement
Formulaire de création ou de réglage d'un objet coloré (étiquette, projet, catégorie).

## Composition
`ColorSwatchPicker`, `ColorSwatchPickerItem`, `ColorSwatch`, `ColorField` de React Aria ; `Tooltip` de React Aria au style Socle ; `fieldBox`, `fieldRoot` de `Field` ; `contrast` de `lib/color`.

## Décisions
D-001, D-031, D-133, D-338, D-367.

## Palette par défaut
En thème sombre, la palette par défaut garde les valeurs du thème clair : une couleur choisie a la même valeur hexadécimale à l'API dans les deux modes (D-367). Une app qui veut d'autres couleurs passe `colors`.

## Questions ouvertes
Aucune.
