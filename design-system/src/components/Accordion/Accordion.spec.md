# Accordion
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/Divers-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Bloc secondaire repliable, avec un titre toujours visible : « Options avancées » d'un formulaire, détails d'une erreur, éléments repliés d'un panneau (D-321).
Ne pas l'utiliser pour :
- une section de la sidebar : prendre `Sidebar.Section` ;
- une section du panneau de détail : prendre `Drawer.Section` ;
- une ligne de propriété qui s'ouvre : prendre `PropertyRow` avec `details` (D-060) ;
- masquer une information dont on a besoin à chaque fois : la montrer.

## Anatomie
1. Titre (obligatoire) : bouton, texte `--fs-sm` en `--fg-3`, `--fg-2` au survol, puis chevron de 12 px. Même forme que les titres de section (D-061, D-320).
2. Contenu (obligatoire) : sous le titre, sans retrait ni cadre. Créé seulement à l'ouverture.

## Variantes
Aucune (D-320).

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — (obligatoire) | Titre du bloc. |
| `children` | `ReactNode` | — (obligatoire) | Contenu. |
| `defaultExpanded` | `boolean` | `false` | Déplié au premier affichage. |
| `isExpanded`, `onExpandedChange` | `boolean`, `(v) => void` | aucun | Ouverture pilotée par l'app. |
| `id` | `string` | aucun | Identifiant stable : l'état est mémorisé par `SocleProvider` (comme D-061). |

## Exclus
- Pas d'icône, de compteur ni d'action dans le titre dans cette version.
- Pas d'Accordion dans un Accordion (D-321).
- Pas d'apparence `subtle`, de cadre ni de chevron devant le titre (D-320).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Replié | Chevron tourné vers la droite ; contenu absent. |
| Déplié | Chevron vers le bas ; contenu sous le titre. |
| Survol du titre | Texte en `--fg-2`. |
| Focus clavier | Anneau accent autour du titre. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Un clic, Entrée ou Espace sur le titre replie ou déplie ; replié par défaut (D-320) | verrouillé | `Repli` |
| Le contenu n'est créé qu'à l'ouverture (D-320) | verrouillé | `Repli` |
| Avec `id`, l'état est mémorisé d'un affichage à l'autre (D-320) | réglable par l'app (`id`) | `Memorise` |
| Aucune animation (D-026) | verrouillé | `Repli` |

## Contenu
- Titre : un nom court, sans deux-points ni point final (« Options avancées »).
- Titre trop long : coupé avec une ellipse.

## Densité
Titre de 24 px de haut ; texte `--fs-sm`. Le contenu suit la densité de ses composants.

## Clavier
Tab atteint le titre ; Entrée ou Espace replie ou déplie.

## Accessibilité
- Le titre est un bouton avec `aria-expanded` et `aria-controls`.
- Le contenu est un groupe nommé par le titre.
- Le chevron est décoratif.

## Taille d'écran
Identique sur toutes les tailles.

## Erreurs
Sans objet.

## Placement
Dans une section de `Drawer`, dans un formulaire (après les champs principaux), dans une page de contenu. Jamais dans la `topbar` ni dans la `sidebar`.

## Composition
Contient un `Button` de React Aria et l'icône interne `ChevronDown`.

## Décisions
D-026, D-061, D-320, D-321

## Questions ouvertes
Aucune.
