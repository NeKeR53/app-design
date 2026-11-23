# Checkbox et CheckboxGroup
Statut : validé (2026-11-23, par délégation de l'utilisateur) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/FormChoices-v1.html

## Rôle
`Checkbox` : une valeur oui/non qui fait partie d'un formulaire qu'on envoie, ou une acceptation (« J'ai lu les conditions »). `CheckboxGroup` : plusieurs choix indépendants dans une liste courte, sous un libellé commun.
Ne pas l'utiliser pour :
- un réglage qui s'applique tout de suite : prendre `Toggle` (D-137) ;
- un seul choix parmi plusieurs : prendre `RadioButtonGroup` ou `Select` ;
- plus de 10 choix, ou une recherche : prendre `ComboBox` en choix multiple (P5) ;
- la sélection des lignes d'un tableau : `Table` a sa propre case (D-065).

## Anatomie
`Checkbox` (D-135) :
1. **Case** (obligatoire) : 16 px, rayon 4 px (D-040), centrée sur la première ligne du libellé.
2. **Libellé** (obligatoire) à droite, 8 px d'écart, `--fs-md`, `--fg`. Un clic dessus coche.
3. **Description** (facultative) sous le libellé, `--fs-sm`, `--fg-3`.
4. **Erreur** (case seule obligatoire non cochée) sous la case, `--fs-sm`, `--danger`.
`CheckboxGroup` (D-138) : libellé du groupe (style de `Field`, D-130, avec « (facultatif) »), puis les cases, puis l'aide ou l'erreur du groupe.

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `Checkbox` : `children` | `string` | — (obligatoire) | Libellé. |
| `Checkbox` : `description` | `string` | aucune | Ligne sous le libellé. |
| `Checkbox` : `isSelected` / `defaultSelected` / `onChange` | `boolean` | `false` | Hors groupe. |
| `Checkbox` : `value` | `string` | — (obligatoire dans un groupe) | Valeur dans le groupe. |
| `Checkbox` : `isIndeterminate` | `boolean` | `false` | État mixte : case parente d'une liste partiellement cochée. |
| `Checkbox` : `isRequired`, `validate`, `error`, `isDisabled`, `isReadOnly`, `name` | | | Comme `Field` (D-132). |
| `CheckboxGroup` : `label`, `hideLabel`, `description`, `isRequired`, `validate`, `error`, `isDisabled`, `name` | | | Comme `Field`. `isRequired` : au moins une case. |
| `CheckboxGroup` : `value` / `defaultValue` / `onChange` | `string[]` | `[]` | Valeurs cochées. |
| `CheckboxGroup` : `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Horizontal : 2 ou 3 options courtes (D-138). |

## Exclus
- Pas de case sans libellé, sauf dans `Table`.
- Pas de couleur autre que l'accent pour l'état coché (D-135).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Non cochée | Fond `--surface`, bord `--line-strong`. |
| Survol | Bord `--fg-3`. |
| Cochée | Fond et bord `--accent`, coche `--accent-fg` (D-135). |
| Mixte | Fond `--accent`, trait `--accent-fg`. |
| Focus | Anneau `--accent` de 2 px autour de la case. |
| Erreur | Bord `--danger` ; message sous la case ou sous le groupe. |
| Désactivée | Opacité 40 %, case et libellé. |
| Lecture seule | Rendu normal ; un clic ne change rien. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Clic sur la case ou le libellé, ou Espace : coche ou décoche | verrouillé | `ParDefaut` |
| Case parente : placée au-dessus du groupe, hors de lui, avec le groupe décalé de 24 px ; l'app calcule l'état mixte ; un clic sur une case mixte coche tout | verrouillé | `Mixte` |
| Vérification : celle de `Field` ; erreur au changement ou à l'envoi (D-132) | verrouillé | `Verification` |
| La valeur est envoyée avec le formulaire ; rien ne s'applique avant (D-137) | verrouillé | `Groupe` |

## Contenu
Libellé long : retour à la ligne, la case reste en face de la première ligne.

## Densité
Case de 16 px dans les deux densités ; ligne de `--target-min` au moins (24 px, 44 px sur mobile) ; texte `--fs-md`.

## Clavier
Tab : une case après l'autre (chaque case est un arrêt). Espace : coche.

## Accessibilité
React Aria `Checkbox` et `CheckboxGroup` : `input type="checkbox"` caché, nom = libellé, état mixte porté par la propriété `indeterminate` de la case, lue « mixte » par les lecteurs d'écran ; groupe `role="group"` nommé par son libellé, aide et erreur reliées.

## Taille d'écran
Sur mobile, un groupe horizontal passe en vertical.

## Erreurs
Voir États ; la phrase dit quoi faire (« Cochez cette case pour continuer. »).

## Placement
`FormPage`, formulaire en modale. Jamais dans une ligne de réglage ni dans le panneau de détail : y mettre un `Toggle` (D-137).

## Composition
Le groupe contient des `Checkbox`. Ne contient pas d'autre champ.

## Décisions
D-022, D-040, D-130, D-132, D-135, D-137, D-138

## Questions ouvertes
Aucune.
