# DetailPanel
Statut : validé (2026-11-21) — Version : depuis 0.1.0
Validation : docs/validation/components/DetailPanel-v1.html

## Rôle
Contenu du panneau de détail d'AppShell (D-018) : les propriétés et les réglages de l'élément sélectionné, rangés en sections. Il se place dans le slot `detail` d'AppShell.
Ne pas l'utiliser pour :
- le contenu principal d'un élément (texte, tableau, formulaire long) : le mettre dans le gabarit `DetailPage` ou `FormPage` ;
- les réglages de l'app : prendre `SettingsPage` (D-015).

## Anatomie
1. **En-tête** (fourni par AppShell) : titre « Détail » et × sur tablette et mobile (D-018).
2. **Section** `DetailPanel.Section` (au moins une) : titre en `--fs-sm`, `--fg-3`, suivi d'un chevron ; un clic replie ou déplie la section, état mémorisé (D-061). Puis ses lignes. Les sections sont séparées par un trait `--line`.
3. **Ligne de propriété** `PropertyRow` :
   1. icône (facultative, 16 px, `--fg-2`) : si une ligne de la section en a une, les autres gardent la place vide (D-057) ;
   2. libellé (obligatoire), en `--fg-2`, dans une colonne de 96 px (D-058) ;
   3. valeur (obligatoire), en `--fg`, alignée sur la même colonne pour toutes les lignes (D-058) ;
   4. action à droite (facultative, une seule) : lien court d'un mot, interrupteur, ou bouton-icône qui peut ouvrir un menu (D-059). L'action est centrée sur la première ligne de texte (D-060).
   5. contenu dépliable (facultatif) : « › » à la place de l'action ; il se déplie sous la ligne, sur place (D-060).
4. **Pied de section** (facultatif) : un bouton à texte, sous les lignes (D-059).

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `DetailPanel.Section` : `title` | `string` | — (obligatoire) | Titre de la section. |
| `PropertyRow` : `label`, `value` | `string`, `ReactNode` texte | — (obligatoires) | Libellé et valeur. Une valeur vide s'affiche « — » en `--fg-3`. |
| `PropertyRow` : `icon` | `ReactNode` | aucune | Icône facultative, alignée par section (D-057). |
| `PropertyRow` : `action` | `{ type: "link" \| "switch" \| "icon", … }` | aucune | Une action à droite, parmi trois types (D-059). |
| `DetailPanel.Section` : `footer` | `Button` | aucun | Bouton à texte en pied de section, `size="sm"`, variante `secondary` (D-059, D-101). |

## Exclus
- Pas de bouton à texte ni de deuxième action dans une ligne : le bouton à texte va en pied de section (D-059).
- Pas de champ de saisie dans une ligne : une modification se fait par l'action de la ligne (menu, interrupteur, fenêtre) ou dans `FormPage`.
- Pas de couleur dans la valeur, sauf une pastille de statut (`Badge`, à spécifier).
- Pas de `className` ni de `style`.

## États
- Ligne : par défaut ; survol (fond `--hover`) seulement si la ligne entière est cliquable.
- Section : dépliée ou repliée ; état mémorisé par section, d'un élément à l'autre (D-061).
- Panneau vide (rien de sélectionné) : une phrase en `--fg-3`, centrée : « Sélectionnez un élément pour voir son détail. »

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Colonne sur bureau, overlay sur tablette, plein écran sur mobile ; largeur réglable sur bureau (D-018, D-025) | verrouillé | dans `AppShell` |
| Le contenu suit l'élément sélectionné ; il change sans animation (D-026) | verrouillé | `Selection` |
| Un réglage de ligne (interrupteur, menu) s'applique tout de suite (D-007) | verrouillé | `ActionImmediate` |
| Sections : repliables au clic sur le titre ; état mémorisé (D-061) | verrouillé | `Sections` |
| Ligne qui s'ouvre : toute la ligne est cliquable ; clic, Entrée ou Espace déplient sur place ; état mémorisé (D-060) | verrouillé | `LigneDepliable` |

## Contenu
- Libellé : un nom court, sans deux-points (« Échéance »).
- Libellé trop long : passe à la ligne dans sa colonne de 96 px.
- Valeur trop longue : passe à la ligne, sur trois lignes au plus, puis ellipse et info-bulle (D-058).
- Dates et nombres au format de la langue de l'app.

## Densité
Ligne de `--row-h` au moins ; marges `--pad`. Texte `--fs-md`.

## Clavier
Ordre de tabulation : actions des lignes et lignes qui s'ouvrent, de haut en bas. Une ligne qui s'ouvre a `aria-expanded`. Les lignes sans action ne prennent pas le focus.

## Accessibilité
- Repère `complementary` nommé « Détail » (fourni par AppShell).
- Chaque section est un groupe nommé par son titre ; les lignes forment une liste de descriptions (`dl`, `dt`, `dd`).
- Chaque action a un nom qui reprend le libellé (« Modifier l'échéance »).

## Taille d'écran
Identique sur toutes les tailles ; sur mobile, il occupe tout l'écran (D-018).

## Erreurs
Une action qui échoue garde l'ancienne valeur et affiche une notification avec « Réessayer » (D-007).

## Placement
Uniquement dans le slot `detail` d'AppShell.

## Composition
Contient `IconButton`, `Menu`, `Switch` (à spécifier), `Button` et `Tooltip`.

Contient `IconButton`, `Menu`, `Switch` (D-136), `Button` (à spécifier) et `Tooltip`.

## Décisions
D-007, D-015, D-018, D-025, D-026, D-040, D-047, D-057, D-058, D-059, D-060, D-061

## Questions ouvertes
Aucune.
