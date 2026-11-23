# Tooltip
Statut : validé (2026-11-21) — Version : depuis 0.1.0
Validation : docs/validation/components/Tooltip-v1.html

## Rôle
Info-bulle : un court texte qui nomme ou complète un élément au survol ou au focus clavier. Elle sert surtout aux boutons-icônes (`IconButton`) et aux textes tronqués.
Ne pas l'utiliser pour :
- une information indispensable : la mettre dans la page ;
- un contenu interactif (lien, bouton) : prendre `Popover` ;
- un message d'erreur : le mettre sous le champ (voir `TextField`).

## Anatomie
1. Bulle (obligatoire).
2. Texte (obligatoire) : une ligne de préférence, deux au plus.
3. Raccourci clavier (facultatif) : après le texte, en `--tip-fg-2` (D-032).

## Variantes
Aucune variante. La bulle reste sombre dans les deux modes : `--tip-bg`, `--tip-fg`, `--tip-fg-2` pour le raccourci, `--tip-line` pour le bord fin du mode sombre (D-030). Rayon `--radius-md` de 8 px (D-040), sans ombre, sans flèche ; écart de 6 px avec l'élément (D-033).

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `content` | `string` | — (obligatoire) | Texte de l'info-bulle. Texte seul, sans mise en forme. |
| `placement` | `"top" \| "bottom" \| "start" \| "end"` | `"bottom"` | Côté préféré. Il change si la place manque (voir Comportement). |
| `shortcut` | `string` (ex. `"Mod+K"`) | aucun | Raccourci affiché après le texte, converti selon la plateforme : « ⌘K » sur macOS, « Ctrl+K » ailleurs (D-032). |
| `children` | élément focusable | — (obligatoire) | Élément qui déclenche l'info-bulle. |

## Exclus
- Pas de contenu interactif ni de texte riche : prendre `Popover`.
- Pas d'info-bulle sur un élément désactivé : React Aria ne la déclenche pas. Si la raison doit être connue, l'écrire dans la page.
- Pas d'info-bulle sur écran tactile : le nom accessible suffit.
- Pas de `className` ni de `style`.

## États
- Masquée.
- Visible.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Se place du côté préféré ; si la place manque, passe du côté opposé ; puis glisse le long du bord pour ne jamais être coupée (marge de 8 px avec le bord de la fenêtre) | verrouillé | `JamaisCoupee` |
| Au focus clavier : s'affiche tout de suite | verrouillé | `FocusClavier` |
| Se ferme en quittant l'élément, au clic et avec Échap | verrouillé | `Fermeture` |
| Au premier survol : apparition après 500 ms ; d'un élément à l'autre : apparition immédiate tant que la souris ne s'arrête pas plus de 500 ms hors des éléments (D-031, D-088) | verrouillé | `Delai` |
| Apparition et disparition en fondu, 120 ms (D-014) ; aucun mouvement si l'utilisateur réduit les animations | verrouillé | `Delai` |

## Contenu
- Largeur maximale : 240 px. Au-delà, le texte passe à la ligne.
- Texte tronqué dans la page : l'info-bulle affiche le texte complet.
- Pas de point final pour un libellé court (« Replier la sidebar »).

## Densité
Taille de texte `--fs-sm` (12,5 px en web, 11,5 px en desktop). Marges internes de 3 px × 8 px dans les deux densités.

## Clavier
L'info-bulle ne prend jamais le focus. Elle s'ouvre au focus clavier de l'élément et se ferme avec Échap, sans fermer ce qui est derrière.

## Accessibilité
- Rôle `tooltip`, relié à l'élément par `aria-describedby` (React Aria).
- Si `shortcut` est fourni, l'élément reçoit `aria-keyshortcuts` (par exemple `Meta+K` ou `Control+K`).
- Pour un bouton-icône, le nom accessible vient de `aria-label`, pas de l'info-bulle : les deux portent le même texte.
- Contraste du texte et du raccourci : au moins 4,5:1 sur le fond de la bulle, en clair et en sombre.

## Taille d'écran
Identique sur toutes les tailles. Sur écran tactile, aucune info-bulle.

## Erreurs
Sans objet : l'info-bulle ne montre jamais d'erreur.

## Placement
Partout où un élément focusable a besoin d'un nom visible ou d'un complément court. Une seule info-bulle visible à la fois.

## Composition
Utilisée par `IconButton`, `AppShell` (titres tronqués) et `Sidebar` (éléments tronqués, bouton Réglages). Ne contient aucun autre composant.

## Décisions
D-006, D-014, D-029, D-030, D-031, D-032, D-033, D-040, D-088

## Questions ouvertes
Aucune.
