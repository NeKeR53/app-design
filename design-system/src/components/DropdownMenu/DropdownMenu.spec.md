# DropdownMenu
Statut : validé (2026-11-21) — Version : depuis 0.1.0 ; ouverture à un point et titre depuis la version qui suit 0.2.0
Validation : docs/validation/components/Menu-v1.html ; docs/validation/components/Divers-v1.html (D-327, par délégation de l'utilisateur, 2026-11-23)

## Rôle
Liste d'actions ou de choix qui s'ouvre depuis un bouton : « … » d'un élément, « Plus d'actions », menu du compte, liste « Toutes les vues ». Il s'ouvre aussi au clic droit sur une zone (menu contextuel), au point du clic (D-327).
Ne pas l'utiliser pour :
- choisir une valeur dans un formulaire : prendre `Select` ;
- naviguer entre les pages : prendre la `Sidebar` ;
- un contenu riche (texte, champ, aperçu) : prendre `Popover` (D-328).

## Anatomie
1. Conteneur flottant (obligatoire) : fond `--surface-raised`, bord `--line`, ombre `--shadow-md`, rayon de 12 px (D-040), marge intérieure de 4 px.
2. Élément `DropdownMenu.Item` (au moins un), sur une ligne de `--row-h`, rayon de 8 px (D-040) :
   1. icône (facultative, 16 px, `--fg-2`) : si au moins un élément du menu en a une, les autres gardent une place vide et les libellés restent alignés (D-047) ;
   2. libellé (obligatoire) ;
   3. raccourci (facultatif) : à droite, en `--fs-sm`, `--fg-3`, au format de la plateforme (D-048) ;
   4. coche, pour un choix : en fin de ligne, en `--fg` (D-050) ;
   5. chevron « › », s'il ouvre un sous-menu, sur un seul niveau (D-051).
3. Séparateur (facultatif) : trait `--line` entre deux groupes.
4. Titre de groupe (facultatif) : texte `--fs-sm`, `--fg-3`, non cliquable.
5. Titre du menu (facultatif, `title`) : l'objet visé (« rapport.pdf »), en tête, même style que le titre de groupe ; coupé avec une ellipse (D-327).

## Variantes
Aucune variante du conteneur. Élément danger (option `danger`) : libellé et icône en `--danger`, toujours en dernier après un séparateur, réservé aux actions destructrices, avec confirmation (D-049).

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `trigger` | élément focusable | — (obligatoire sans `anchor`) | Bouton qui ouvre le menu, le plus souvent un `IconButton`. |
| `items` | `DropdownMenu.Item`, `DropdownMenu.Section`, `DropdownMenu.Separator` | — (obligatoire) | Contenu du menu. |
| `DropdownMenu.Item` : `label`, `onAction` | — | — (obligatoires) | Élément d'action. |
| `DropdownMenu.Item` : `icon` | `ReactNode` | aucune | Icône facultative ; place réservée si une autre icône existe dans le menu (D-047). |
| `DropdownMenu.Item` : `shortcut` | `string` (ex. `"Mod+N"`) | aucun | Raccourci affiché à droite, converti selon la plateforme (D-048). |
| `DropdownMenu.Item` : `danger` | `boolean` | `false` | Action destructrice : rouge, placée en dernier après un séparateur (D-049). |
| `DropdownMenu.Item` : `isDisabled` | `boolean` | `false` | Élément désactivé. |
| `DropdownMenu.Item` : `disabledReason` | `string` | aucune | Inactif avec une raison : l'élément reste atteignable aux flèches, le choisir ne fait rien et laisse le menu ouvert ; la raison s'affiche sous le libellé, en `--fs-sm` et `--fg-3`. Prime sur `isDisabled`. Dans une section de choix, l'élément garde son état coché. |
| `DropdownMenu.Section` : `title`, `selectionMode` | `string`, `"single" \| "multiple"` | aucun | Groupe d'éléments ; avec `selectionMode`, les éléments sont des choix cochables. |
| `placement` | `"bottom start" \| "bottom end" \| "top start" \| "top end"` | `"bottom start"` | Côté préféré ; il change si la place manque. |
| `title` | `string` | aucun | Titre en tête du menu : l'objet visé (D-327). |
| `anchor` | `{ x, y }` ou référence d'élément | aucune | Ouvre le menu à un point ou contre un élément, sans `trigger` (D-327). Avec `isOpen` et `onOpenChange`. |
| `isOpen`, `onOpenChange` | `boolean`, `(v) => void` | aucun | Ouverture pilotée par l'app. |
| `useContextMenu()` | crochet | — | Rend `targetProps` (à poser sur la zone : clic droit, Maj+F10, touche Menu) et `menuProps` (à poser sur `DropdownMenu`) (D-327). |

## Exclus
- Pas de deuxième ligne de description dans un élément dans cette version.
- Pas de champ de recherche dans un menu : prendre la palette de commandes (Mod+K).
- Pas de couleur, d'image ni d'avatar dans un élément, sauf le rouge de l'élément danger (D-049).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Par défaut | Sans fond, libellé `--fg`, icône `--fg-2`. |
| Survol et focus clavier | Fond `--hover`. Un seul élément mis en avant à la fois (souris ou clavier). |
| Désactivé | Opacité 40 %, aucune action. |
| Inactif avec une raison | Opacité 40 %, raison sous le libellé (la ligne s'agrandit) ; fond `--hover` au focus et au survol ; aucune action. |
| Coché | Coche en fin de ligne (D-050). |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| S'ouvre au clic ou avec Entrée, Espace ou flèche bas sur le bouton ; le focus va au premier élément | verrouillé | `Ouverture` |
| Un clic ou Entrée sur un élément déclenche l'action et ferme le menu | verrouillé | `Action` |
| Choix : coche à droite ; un choix unique ferme le menu, un choix multiple le laisse ouvert (D-050) | verrouillé | `Choix` |
| `disabledReason` : atteint aux flèches, `aria-disabled`, raison visible et en description ; un clic ou Entrée ne fait rien et le menu reste ouvert | verrouillé | `InactifAvecRaison` |
| Échap, un clic dehors ou Tab ferment le menu ; le focus revient au bouton | verrouillé | `Fermeture` |
| Se place du côté où il y a de la place ; jamais coupé par un bord (layout-rules) | verrouillé | `Placement` |
| Ouverture et fermeture sans animation (D-026) | verrouillé | `Ouverture` |
| Sous-menu : au survol après 200 ms, au clic ou avec flèche droite ; à droite, ou à gauche si la place manque ; un seul niveau (D-051) | verrouillé | `SousMenu` |
| Clic droit sur une zone branchée par `useContextMenu` : le menu s'ouvre au point du clic, focus sur le premier élément (D-327) | verrouillé | `ClicDroit` |
| Maj+F10 ou touche Menu sur la zone : le menu s'ouvre sous elle (D-327) | verrouillé | `ClavierContextuel` |
| Ouvert à un point : un défilement ou un redimensionnement le ferme (D-327) | verrouillé | `FermeAuDefilement` |
| Titre facultatif en tête du menu (D-327) | réglable par l'app (`title`) | `AvecTitre` |

## Contenu
- Libellé : un verbe à l'infinitif pour une action (« Renommer »), un nom pour un choix (« Date de modification »). Pas de point de suspension, sauf si l'action ouvre une fenêtre qui demande encore une saisie (« Renommer… »).
- Libellé trop long : coupé avec une ellipse ; largeur de 200 à 320 px.

## Densité
Hauteur d'élément `--row-h` (34 px en web, 28 px en desktop). Texte `--fs-md`.

## Clavier
Flèches haut et bas : élément suivant ou précédent, en boucle ; un élément désactivé est sauté, un élément inactif avec une raison est atteint. Origine et Fin. Une lettre : premier élément qui commence par elle. Entrée ou Espace : action. Échap : ferme. Sur une zone branchée par `useContextMenu` : Maj+F10 ou touche Menu ouvrent le menu (D-327). Sous-menu : flèche droite l'ouvre, flèche gauche ou Échap le referme et rend le focus à l'élément parent (D-051).

## Accessibilité
- Rôles `menu`, `menuitem`, `menuitemcheckbox` ou `menuitemradio` (React Aria `Menu`).
- Le bouton porte `aria-haspopup="menu"` et `aria-expanded`.
- Si `shortcut` est fourni, l'élément reçoit `aria-keyshortcuts`.
- Inactif avec une raison : `aria-disabled="true"` ; le nom est le libellé, la raison est la description (`aria-describedby`, React Aria `Text slot="description"`).
- Les icônes sont décoratives (`aria-hidden`) ; le libellé seul porte le sens.

## Taille d'écran
Sur mobile, le menu reste un menu flottant ; ses éléments passent à 44 px de haut.

## Erreurs
Sans objet.

## Placement
Ouvert depuis un `IconButton`, un `Button` ou un élément de `Sidebar`, ou au clic droit sur une ligne, un élément ou une zone de travail (D-327). Un menu contextuel reprend les actions du « … » de l'élément : jamais d'action qu'on ne trouve qu'au clic droit. Jamais ouvert au survol seul.

## Composition
Contient `Separator` et, au besoin, un sous-menu d'un seul niveau (D-051). Utilisé par `Tabs` (toutes les vues), `Sidebar` (« … », compte) et `AppShell` (« Plus d'actions »).

## Décisions
D-006, D-026, D-032, D-040, D-047, D-048, D-049, D-050, D-051, D-327

## Questions ouvertes
Aucune.
