# Popover
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/Divers-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Volet flottant ouvert depuis un bouton, sans voile : un contenu court et riche (texte, quelques champs, liste courte) sans quitter la page. Exemples : partager, filtrer, aperçu rapide, réglages rapides.
Ne pas l'utiliser pour :
- une liste d'actions ou de choix : prendre `DropdownMenu` ;
- un texte d'aide au survol : prendre `Tooltip` ;
- une tâche longue, un formulaire de plus de trois champs, une confirmation : prendre `Modal` ou `useConfirm` ;
- les notifications : prendre `NotificationCenter`.

## Anatomie
1. Bouton (obligatoire) : `IconButton` ou `Button` ; il porte `aria-expanded`.
2. Surface (obligatoire) : `--surface-raised`, bord `--line`, ombre `--shadow-md`, rayon 12 px (D-040, D-328), à 4 px du bouton.
3. En-tête (facultatif) : titre `--fs-md` en gras, puis × (`IconButton` « Fermer ») (D-328).
4. Corps (obligatoire) : marges de 14 px ; il défile si la hauteur manque.

## Variantes
| Largeur | Rendu |
|---|---|
| `sm` | 280 px. |
| `md` (défaut) | 360 px. |
| `lg` | 440 px. |
Jamais plus large que la fenêtre moins 16 px.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `trigger` | élément focusable | — (obligatoire) | Bouton qui ouvre le volet. |
| `children` | `ReactNode` | — (obligatoire) | Contenu. |
| `title` | `string` | aucun | Titre visible, avec × ; nom accessible du volet. |
| `label` | `string` | — (obligatoire sans `title`) | Nom accessible sans titre visible. |
| `width` | `"sm" \| "md" \| "lg"` | `"md"` | Largeur (D-328). |
| `placement` | `"bottom start" \| "bottom end" \| "right start"` | `"bottom end"` | Côté préféré ; il change si la place manque. `right start` : à droite d'un bouton de la sidebar. |
| `isOpen`, `onOpenChange` | `boolean`, `(v) => void` | aucun | Ouverture pilotée par l'app. |
| `isBusy` | `boolean` | `false` | Action en cours : rien ne ferme le volet, × désactivé (D-329). |

## Exclus
- Pas de voile sur la page ni de flèche vers le bouton (D-328, D-033).
- Pas d'ouverture au survol seul.
- Pas de pied d'actions imposé : les boutons vont dans le corps, alignés à droite, « Annuler » puis l'action (D-124).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Fermé | Seul le bouton est visible. |
| Ouvert | Surface sous le bouton (ou à droite) ; le bouton garde son fond de survol. |
| Fermeture refusée | Rebond de la surface (D-122, D-329). |
| Occupé (`isBusy`) | × désactivé ; Échap et clic à côté sans effet. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| S'ouvre au clic, Entrée ou Espace sur le bouton ; focus sur le premier champ, sinon sur le volet (D-329) | verrouillé | `ParDefaut` |
| Échap, × ou clic à côté ferment ; le focus revient au bouton (D-329) | verrouillé | `ParDefaut`, `Fermeture` |
| Après une saisie, un clic à côté est refusé (rebond) ; Échap ferme toujours (D-329) | verrouillé | `Fermeture` |
| `isBusy` refuse toute fermeture (D-329) | réglable par l'app | `Occupe` |
| Se place du côté où il y a de la place ; jamais coupé par un bord (layout-rules) | verrouillé | `ADroite` |
| Ouverture et fermeture sans animation (D-026) | verrouillé | `ParDefaut` |

## Contenu
- Titre : un nom ou un verbe à l'infinitif (« Partager le projet »), sans point final.
- Contenu court : il tient sans défiler sur un écran de portable.

## Densité
Marges de 14 px ; les champs et boutons du corps suivent la densité (`--row-h`).

## Clavier
Tab parcourt le contenu ; le focus reste dans le volet tant qu'il est ouvert. Échap ferme.

## Accessibilité
- Rôle `dialog`, nommé par `title` ou `label`.
- Le bouton porte `aria-haspopup="dialog"` et `aria-expanded` (React Aria `DialogTrigger`).
- Le reste de la page est masqué aux lecteurs d'écran pendant l'ouverture.

## Taille d'écran
Sur mobile, le volet reste ancré au bouton et prend au plus la largeur de l'écran moins 16 px.

## Erreurs
Une action du volet qui échoue affiche son erreur dans le volet (message de champ ou ligne en `--danger`) ; le volet reste ouvert.

## Placement
Ouvert depuis la `topbar`, une barre d'outils ou un élément de la `sidebar` (`right start`). Jamais depuis un autre Popover.

## Composition
Contient `IconButton` (×) ; reprend le rebond et le focus de `Modal` (D-122, D-125). Peut contenir `TextInput`, `TextArea`, `Select`, `Button`, `List`.

## Décisions
D-026, D-033, D-040, D-122, D-124, D-125, D-328, D-329

## Questions ouvertes
Aucune.
