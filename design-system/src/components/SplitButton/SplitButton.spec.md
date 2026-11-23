# SplitButton
Statut : validé (2026-11-23) — Version : depuis 1.0.0
Validation : docs/validation/components/Nouveaux-P4-v1.html (SB1, option A)

## Rôle
`SplitButton` lance une action par défaut et propose ses variantes dans un menu : « Enregistrer », puis « Enregistrer sous… » et « Enregistrer et fermer ».
Ne pas l'utiliser pour :
- des actions sans lien entre elles : prendre un `Button` et un menu « … » (`DropdownMenu`, ou `ActionBar`) ;
- une seule action : prendre `Button` ;
- un choix de valeur : prendre `Select` ou `SegmentedControl`.

## Anatomie
Deux boutons accolés, sans écart :
1. **Bouton principal** (obligatoire) : un `Button` (libellé, icône facultative). Il lance l'action par défaut.
2. **Chevron** (obligatoire) : icône ↓ de 16 px, marge de 6 px. Il ouvre un `DropdownMenu` des variantes, aligné sur le bord droit.
3. **Séparateur** : trait de 1 px à gauche du chevron, `--primary-fg` à 30 % sur `primary`, `--fg` à 15 % sur `secondary`.
Rayon 8 px sur les coins extérieurs seulement (D-040). Même hauteur que `Button` : `--row-h` en `md`, `--btn-h-sm` en `sm`.

## Variantes
| Variante | Rendu | Quand l'utiliser |
|---|---|---|
| `secondary` (défaut) | Fond `--field`, texte `--fg` (D-103). | Une action d'appoint avec des variantes. |
| `primary` | Fond `--primary`, texte `--primary-fg` (D-102). | L'action attendue de la zone ; une seule par zone (D-100). |

Thème `buttonSecondary: "outline"` (D-338) : chaque partie a son trait intérieur ; le séparateur disparaît.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `children` | `string` | — (obligatoire) | Libellé de l'action par défaut. |
| `items` | `DropdownMenuItemProps[]` | — (obligatoire) | Variantes : `label`, `onAction`, `id`, `icon`, `shortcut`, `danger`, `isDisabled`, `disabledReason`. |
| `onPress` | `() => void` | aucun | Action par défaut. |
| `variant` | `"primary" \| "secondary"` | `"secondary"` | Variante. |
| `size` | `"md" \| "sm"` | `"md"` | Comme `Button` (D-101). |
| `icon` | `ReactNode` | aucune | Icône avant le libellé (D-106). |
| `isPending` | `boolean` | `false` | Chargement : roue dans le bouton principal ; les deux parties ignorent les clics (D-105). |
| `isDisabled` | `boolean` | `false` | Les deux parties sont désactivées. |
| `disabledReason` | `string` | aucune | Inactif avec une raison, sur les deux parties. Prime sur `isDisabled`. |
| `type`, `form` | comme `Button` | `"button"` | Envoi d'un formulaire par l'action par défaut. |

## Exclus
- Pas de variante `subtle` ni `danger` : une action destructrice va en dernier dans le menu (`danger`, D-049).
- Pas de menu sans action par défaut : prendre `DropdownMenu` avec un `Button` comme déclencheur.
- Pas d'action par défaut qui change avec le dernier choix : le libellé reste stable.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos, survol, pressé | Comme `Button`, partie par partie. |
| Menu ouvert | Le chevron garde le focus ; le menu est sous lui, aligné à droite. |
| En attente | Roue dans le bouton principal ; le chevron ne réagit plus ; le focus reste. |
| Désactivé | 40 % sur les deux parties. |
| Inactif avec une raison | 40 %, les deux parties focusables, info-bulle et description donnent la raison. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Deux cibles accolées, même hauteur que `Button`, rayon sur les coins extérieurs, séparateur de 1 px (D-365) | verrouillé | `Anatomie` |
| Le libellé lance l'action par défaut, sans ouvrir le menu (D-365) | verrouillé | `ActionParDefaut` |
| Le chevron ouvre le menu des variantes ; un choix lance la variante et ferme le menu (D-365) | réglable (`items`) | `Variantes` |
| Deux arrêts de Tab ; ↓ ouvre le menu sur la première variante ; Échap rend le focus au chevron | verrouillé | `Clavier` |
| En attente, les deux parties ignorent clics et touches ; le focus reste (D-105, D-365) | réglable (`isPending`) | `EnAttente` |
| Inactif avec une raison sur les deux parties | réglable (`disabledReason`) | `Inactif` |
| Désactivé sur les deux parties | réglable (`isDisabled`) | `Desactive` |

## Contenu
- Libellé : le verbe de l'action par défaut (« Enregistrer », « Exporter »).
- Variantes : le même verbe, précisé (« Enregistrer sous… », « Exporter en PDF »). Points de suspension si une boîte de dialogue suit.
- 2 à 6 variantes.

## Densité
Hauteur et marges du `Button` ; chevron de 6 px de marge, au moins `--target-min` de large.

## Clavier
- Tab : bouton principal, puis chevron.
- Entrée ou Espace sur le bouton principal : action par défaut.
- ↓, Entrée ou Espace sur le chevron : ouvre le menu sur la première variante. Échap le ferme et rend le focus au chevron.

## Accessibilité
- Bouton principal : nommé par son libellé.
- Chevron : `aria-haspopup="menu"`, nommé « Plus d'options pour <libellé> » (`splitMoreOptions`, i18n) ; le même texte est en info-bulle et nomme le menu.
- En attente : la roue est lue avec le libellé (D-105).
- Inactif : `aria-disabled="true"` et raison en description, sur les deux parties.

## Taille d'écran
Largeur naturelle ; pas de passage à la ligne. Sur tactile, chaque partie fait au moins `--target-min` (44 px).

## Erreurs
Sans objet : l'app signale l'échec de l'action (toast, `Alert`).

## Placement
Là où irait le `Button` de l'action : pied de formulaire, barre d'outils, en-tête de page.

## Composition
`Button`, `DropdownMenu` et `DropdownMenu.Item`, `Tooltip`, `Button` de React Aria pour le chevron.

## Décisions
D-040, D-049, D-100, D-101, D-102, D-103, D-105, D-338, D-365.

## Questions ouvertes
Aucune.
