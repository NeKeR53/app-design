# IconButton
Statut : validé (2026-11-21, chargement ajouté le 2026-11-23) — Version : depuis 0.1.0 ; `isPending` depuis la version qui suit 0.1.0
Validation : docs/validation/components/IconButton-v1.html

## Rôle
Bouton qui ne montre qu'une icône. Il sert aux actions fréquentes et connues : barre supérieure, actions d'une ligne, pied de sidebar, en-tête du panneau de détail.
Ne pas l'utiliser pour :
- l'action principale d'un écran ou d'un formulaire : prendre `Button` avec un libellé ;
- une action rare ou dont l'icône n'est pas évidente : prendre `Button` ou une entrée de `Menu` ;
- un lien de navigation : prendre un élément de `Sidebar`.

## Anatomie
1. Zone cliquable (obligatoire), carrée, rayon `--radius-md` de 8 px (D-036).
2. Icône (obligatoire), centrée, en `currentColor`.
3. Info-bulle (automatique) : le libellé, et le raccourci s'il existe (`Tooltip`, D-030 à D-033).

## Variantes
Une seule, transparente : fond seulement au survol, à la pression ou en sélection (D-037).

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `icon` | `ReactNode` | — (obligatoire) | Icône de l'app (D-011) ou icône interne de Socle (D-028). |
| `label` | `string` | — (obligatoire) | Nom accessible (`aria-label`) et texte de l'info-bulle. |
| `shortcut` | `string` (ex. `"Mod+B"`) | aucun | Raccourci affiché dans l'info-bulle (D-032). Le raccourci lui-même est déclaré par l'app. |
| `onPress` | `() => void` | — | Action. |
| `isDisabled` | `boolean` | `false` | Désactivé : pas d'info-bulle (voir Tooltip). |
| `isPending` | `boolean` | `false` | Chargement : l'icône devient une roue, clics ignorés, focus et info-bulle gardés (D-107). Exemple : « Actualiser ». |
| `isSelected` / `onChange` | `boolean` / `(v) => void` | non défini | Si fourni, le bouton devient une bascule (`aria-pressed`). Exemple : afficher le panneau de détail. |
| `tooltipPlacement` | `"top" \| "bottom" \| "start" \| "end"` | `"bottom"` | Côté préféré de l'info-bulle. |

## Exclus
- Pas de libellé visible : prendre `Button`.
- Pas de couleur d'accent ni de danger : une action dangereuse demande une confirmation, et c'est la confirmation qui est en rouge.
- Pas de badge ni de compteur dans cette version.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Par défaut | Fond transparent, icône en `--fg-2`. |
| Survol | Fond `--hover`, icône en `--fg`. |
| Pressé | Fond `--selected`. |
| Focus clavier | Anneau de focus `--accent`, 2 px. |
| Sélectionné (bascule) | Fond `--hover` (clair), icône en `--fg` (D-034). |
| Sélectionné + survol | Fond `--selected` (plus foncé) : le survol reste visible (D-034). |
| Désactivé | Opacité 40 %, aucun survol, pas d'info-bulle. |
| Chargement | Une roue de 14 px remplace l'icône ; aucun survol ; `aria-busy` (D-107). |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| L'info-bulle affiche `label`, et `shortcut` s'il existe (D-031, D-032) | verrouillé | `InfoBulle` |
| Bascule : un clic inverse `isSelected` et met à jour `aria-pressed` | verrouillé | `Bascule` |
| Désactivé : ni action, ni info-bulle | verrouillé | `Desactive` |
| Chargement : clics ignorés, focus gardé, `aria-busy`, attente annoncée (D-107) | verrouillé | `Chargement` |
| Sélectionné : le survol fonce le fond, pour rester visible (D-034) | verrouillé | `Bascule` |
| Changements d'état sans transition de couleur supérieure à 120 ms (D-014) | verrouillé | `Etats` |

## Contenu
- Pas de texte visible : le `label` est obligatoire, et TypeScript refuse un IconButton sans `label`.
- Icône : taille `--icon` (16 px), quelle que soit la taille du bouton.

## Densité
Token `--icon-btn` : 28 × 28 px en web, 24 × 24 px en desktop, 44 × 44 px sur écran tactile (D-035). L'icône garde 16 px.

## Clavier
Focusable avec Tab. Entrée ou Espace déclenche l'action. Le focus affiche l'info-bulle tout de suite (D-031).

## Accessibilité
- Rôle `button`, nom accessible = `label`.
- Bascule : `aria-pressed`.
- Chargement : `aria-busy="true"` et un `progressbar` nommé « Chargement » (dictionnaire `messages`).
- Cible d'au moins 24 × 24 px (WCAG 2.2, critère 2.5.8).
- Contraste de l'icône d'au moins 3:1 sur le fond, dans tous les états actifs.

## Taille d'écran
Sur écran tactile (mobile), la zone cliquable passe à 44 × 44 px ; l'icône garde sa taille. Pas d'info-bulle.

## Erreurs
Sans objet.

## Placement
Barre supérieure (zone `actions` d'AppShell), actions d'une ligne de liste, pied de sidebar, en-tête du panneau de détail, barre d'outils d'un gabarit. Jamais dans le corps d'un formulaire à la place d'un bouton d'envoi.

## Composition
Contient `Tooltip` et une icône. Les boutons-icônes voisins sont espacés de 2 px.

## Décisions
D-001, D-011, D-014, D-028, D-030, D-031, D-032, D-033, D-034, D-035, D-036, D-037, D-040, D-107

## Questions ouvertes
Aucune.
