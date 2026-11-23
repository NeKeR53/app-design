# ActionBar (modèle Action)
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.1.0
Validation : docs/validation/components/ActionBar-v1.html ; zone `topbar` : docs/validation/components/AppShell-actions-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Une app décrit ses actions par des données (`Action`). `ActionBar` les dessine selon la zone où elle se trouve : bouton à texte, bouton-icône ou entrée du menu « … ». La page ne choisit aucun bouton. Les gabarits (ListPage, DetailPage, DetailPanel) s'appuient sur ce modèle.
Ne pas l'utiliser pour :
- un pied de formulaire ou de modale (« Annuler », « Enregistrer ») : prendre `Button` (placement de la spec Button) ;
- des vues d'une page : prendre `Tabs` (D-021) ;
- l'action unique d'une ligne de propriété : prendre l'action de `PropertyRow` (D-059) ;
- les actions d'un élément de `Sidebar` : prendre son option `actions`.

## Anatomie
1. Actions à icône (facultatives) : `IconButton`, avec info-bulle (libellé et raccourci).
2. Bouton « … » (automatique, s'il reste des actions) : `IconButton` qui ouvre un `Menu` :
   1. actions sans icône, ou en trop, dans l'ordre donné ;
   2. séparateur, puis actions `danger`, en rouge, en dernier (D-049, D-115).
3. Action principale (facultative) : `Button` à texte, tout à droite.

Ordre : icônes, « … », action principale (D-111). Écart de 2 px entre boutons-icônes, de 8 px avant le bouton à texte.

## Le modèle `Action` (D-110)
| Champ | Type | Défaut | Description |
|---|---|---|---|
| `id` | `string` | — (obligatoire) | Identifiant stable, unique dans la barre. |
| `label` | `string` | — (obligatoire) | Verbe à l'infinitif, et objet si le contexte ne le donne pas : « Nouveau document », « Exporter en CSV ». |
| `onPress` | `() => unknown \| Promise<unknown>` | — (obligatoire) | Ce que fait l'action. Une promesse déclenche l'attente (D-116). |
| `icon` | `ReactNode` | aucune | Icône de l'app (D-011). Sans icône, l'action va dans « … », sauf l'action principale à texte. |
| `primary` | `boolean` | `false` | L'action attendue de la zone. Une seule : la première compte. Sans effet en `row` et pour une action `danger`. |
| `danger` | `boolean` | `false` | Action destructrice : dans « … », en rouge, en dernier, toujours confirmée (D-115). |
| `confirm` | `string \| { title: string; message?: string; confirmLabel?: string }` | aucune | Question de confirmation, qui nomme l'objet. Le texte seul est le titre. Défaut pour `danger` : « {label} ? ». |
| `shortcut` | `string` (ex. `"Mod+E"`) | aucun | Raccourci affiché dans l'info-bulle ou le menu (D-032, D-048). L'app déclare le raccourci elle-même. |
| `isDisabled` | `boolean` | `false` | L'action garde sa place, désactivée. |
| `isHidden` | `boolean` | `false` | L'action n'existe pas dans cet état ; elle n'est pas rendue. |

## Règle par zone (D-111 à D-114, D-117)
| Zone | Où | Action `primary` | Actions à icône | Sans icône, ou en trop | `danger` |
|---|---|---|---|---|---|
| `topbar` | Option `actions` d'AppShell | Avec icône : première icône (D-112) ; sans icône : `Button` `primary`, à droite (D-220) | 3 au plus, puis selon la place (D-221) | « … » | « … », en dernier |
| `header` | En-tête de gabarit (ListPage `actions`, DetailPage) | `Button` `primary` | 3 au plus | « … » | « … », en dernier |
| `toolbar` | Barre d'outils (actions groupées sur la sélection) | `Button` `primary` | 3 au plus | « … » | « … », en dernier |
| `section` | Titre de section (DetailPanel, DetailPage) | `Button` `secondary`, taille `sm` (D-113) | 2 au plus | « … » | « … », en dernier |
| `row` | Ligne de Table ou de List | Sans effet | 1, puis « … » ; 2 si la ligne n'a que deux actions à icône (D-114) | « … » | « … », en dernier |
| `empty` | État vide | `Button` `primary`, seul | Rien d'autre ne s'affiche | — | — |

Sous 640 px, en `topbar`, `header` et `toolbar`, les icônes passent dans « … » ; l'action principale reste (D-117).

Dans la barre du haut d'AppShell, la place se mesure en continu (D-221) : quand elle manque, les icônes passent dans « … » depuis la dernière, avant les entrées déjà présentes ; puis le bouton à texte passe en tête de « … ». Ailleurs, rien ne se mesure.

## Variantes
Aucune variante visuelle propre : la zone décide de la forme. Les variantes viennent de `Button`, `IconButton` et `Menu`.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `actions` | `ReadonlyArray<Action>` | — (obligatoire) | Les actions, dans l'ordre voulu. |
| `zone` | `"topbar" \| "header" \| "toolbar" \| "section" \| "row" \| "empty"` | — (obligatoire) | La zone, qui fixe la règle. |
| `subject` | `string` | aucun | Objet des actions, dans le nom du groupe : « Actions sur Rapport trimestriel ». |
| `onError` | `(action, error) => void` | aucun | Appelé si `onPress` lève une erreur ou rejette sa promesse (D-116). |
| `onDone` | `(action) => void` | aucun | Appelé après la réussite d'une action (par exemple pour recharger les données). |

`arrangeActions(actions, zone, { narrow, fit })` est aussi exporté : la règle seule, sans rendu, pour un gabarit qui dessine lui-même (Table, List). `fit: { icons, primary }` (zone `topbar`) dit ce qui tient encore : le nombre d'icônes visibles, et si le bouton à texte reste (D-221).

## Exclus
- Pas de bascule de vue (`group`, `selected`) : prendre `Tabs` (D-021).
- Pas de notification de réussite ni d'échec dans `ActionBar` : le gabarit les affiche avec `onDone` et `onError` (D-116).
- Pas d'action `danger` en icône ni en bouton à texte, et pas de titre de groupe au-dessus (D-115).
- Pas de bouton à texte en `topbar` pour une action principale à icône : elle reste une icône (D-112). Sans icône, elle est à texte (D-220).
- Pas de sous-menu dans « … » dans cette version.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Par défaut | Selon la zone (tableau plus haut). |
| Action désactivée | `isDisabled` du bouton ou de l'entrée de menu : opacité 40 %, aucune action. |
| Attente | Bouton à texte ou bouton-icône en `isPending` (D-105, D-107, D-118). L'action ne se relance pas. Une entrée de menu ferme le menu tout de suite. |
| Menu ouvert | Le bouton « … » est en survol (`aria-expanded`). |
| Vide | Aucune action visible : `ActionBar` ne rend rien. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| La zone décide de la forme de chaque action (tableau de la règle) (D-111 à D-114) | verrouillé | `Zones` |
| Ordre : icônes, « … », action principale à droite ; une seule principale (D-111) | verrouillé | `Zones` |
| `isHidden` retire l'action ; `isDisabled` la garde, désactivée | verrouillé | `Etats` |
| « … » contient les actions sans icône et en trop, puis un trait et les actions `danger` en rouge (D-115) | verrouillé | `Menu` |
| Une action `danger` ou avec `confirm` demande confirmation ; « Annuler » n'appelle pas `onPress` (D-115) | verrouillé | `Confirmation` |
| Une promesse met le bouton en attente ; un second clic est ignoré ; `onDone` après réussite (D-116, D-118) | verrouillé | `Attente` |
| Une erreur, levée ou rejetée, est rendue à `onError` (D-116) | verrouillé | `Erreur` |
| Sous 640 px, les icônes de `topbar`, `header` et `toolbar` passent dans « … » (D-117) | verrouillé | `PetitEcran` |
| `topbar` : une principale sans icône est à texte, à droite (D-220) | verrouillé | `Zones`, `Regle` |
| `topbar` dans AppShell : repli selon la place, icônes puis texte (D-221) | verrouillé | `Regle`, AppShell `ActionsDePage` |

## Contenu
- `label` : court et complet, verbe à l'infinitif. Points de suspension si l'action demande une étape de plus (« Importer un fichier… »).
- `confirm` nomme l'objet : « Supprimer le document « Rapport trimestriel » ? ». `message` dit la conséquence : « Cette action est définitive. »
- Bouton à texte : jamais tronqué (spec Button). Entrée de menu : ellipse au-delà de 320 px (spec Menu).

## Densité
Aucune règle propre : `Button`, `IconButton` et `Menu` suivent les tokens de densité.

## Clavier
Tab passe d'un bouton à l'autre, dans l'ordre visuel. « … » s'ouvre avec Entrée, Espace ou flèche bas (spec Menu). Après la confirmation ou la fermeture du menu, le focus revient au bouton qui a lancé l'action.

## Accessibilité
- Groupe `role="group"` (Tab passe d'un bouton à l'autre) nommé « Actions », ou « Actions sur {subject} » si `subject` est fourni (dictionnaire `messages`, D-089), sauf en `empty` (un seul bouton). Le lecteur d'écran annonce ce nom en entrant dans le groupe : « Modifier » se lit donc avec son objet.
- Nom accessible d'un bouton-icône : `label` (le même texte que l'info-bulle). Le bouton « … » : « Plus d'actions ».
- L'attente est annoncée par `Button` et `IconButton` (`aria-busy`, D-105, D-107).

## Taille d'écran
Voir D-117. Sur écran tactile, les cibles suivent `Button` et `IconButton` (44 px).

## Erreurs
`ActionBar` ne montre pas d'erreur : elle la rend à `onError`. Le gabarit affiche la notification « « {label} » n'a pas abouti » (P6). L'action redevient disponible.

## Placement
Zones `topbar` (option `actions` d'AppShell), `header` et `toolbar` d'un gabarit, titre de section, ligne de Table ou de List, état vide (layout-rules, section « Actions »). Jamais dans un pied de formulaire ou de modale, ni dans une ligne de propriété.

## Composition
Contient `Button`, `IconButton`, `Menu` et `Tooltip` (via `IconButton`). La confirmation passe par `useConfirm` (D-127) : la modale affichée par `SocleProvider`.

## Décisions
D-011, D-013, D-021, D-032, D-048, D-049, D-059, D-066, D-089, D-105, D-107, D-110, D-111, D-112, D-113, D-114, D-115, D-116, D-117, D-118, D-220, D-221, D-222

## Questions ouvertes
Aucune.
