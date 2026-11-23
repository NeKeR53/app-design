# AppShell
Statut : validé — Version : depuis 0.1.0
Validation : docs/validation/components/AppShell-v1.html ; actions de page : docs/validation/components/AppShell-actions-v1.html ; largeurs du détail : docs/validation/components/DetailPanel-width-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Cadre commun de toutes les apps : barre supérieure, sidebar, zone de contenu, panneau de détail et, sur mobile, barre d'onglets. Chaque écran d'une app est rendu dans un AppShell. On ne l'utilise pas pour une fenêtre secondaire ou une modale : dans ce cas, prendre `Modal`.

## Anatomie
1. `topbar` (obligatoire) :
   - bouton de repli de la sidebar et précédent/suivant (facultatifs) ;
   - nom de la page (obligatoire) ;
   - onglets des vues de la page (facultatifs, D-021) ;
   - actions de la page (facultatives) : boutons-icônes de l'app (cloche), puis `ActionBar` `zone="topbar"` : icônes, « … », action principale à texte (D-220 à D-222) ;
   - bouton Agrandir (facultatif, `detailExpandable`, bureau, panneau ouvert, D-241) ;
   - bouton du panneau de détail, avec l'icône liste (présent si `detail` est fourni) ;
   - en Tauri, la place réservée aux boutons de fenêtre (D-020).
2. `sidebar` (obligatoire sur bureau et tablette) : navigation, sections, puis le pied : entrées fixes, espace de travail, compte (voir `Sidebar`, D-230 à D-232).
3. `main` (obligatoire) : le gabarit de la page.
4. `detail` (facultatif) : panneau de détail (D-018).
5. `tabbar` (mobile uniquement) : quatre entrées au plus, puis « Plus » (D-003, D-019).

## Variantes
Aucune variante visuelle. La disposition dépend de la largeur (D-013) et de la plateforme (`web`, `macos`, `windows`).

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `pageTitle` | `string` | — (obligatoire) | Nom de la page, dans la barre supérieure. |
| `views` | `{ id, label, closable?, isDirty? }[]` | aucune | Vues de la page en onglets (D-021) ; `isDirty` : vue modifiée (Tabs, D-349). |
| `activeView` / `onViewChange` / `onViewClose` | — | — | Vue active et ses événements. |
| `actions` | slot `ReactNode` : `ActionBar` `zone="topbar"` et boutons-icônes `IconButton` | aucune | Actions de la page (D-222). Le slot prend la place libre ; `ActionBar` y replie ses actions selon la place (D-221). |
| `sidebar` | slot `Sidebar` | — (obligatoire) | Contenu de la sidebar. |
| `detail` | slot `ReactNode` | aucun | Contenu du panneau de détail ; s'il est absent, ni la colonne ni le bouton ne s'affichent. |
| `detailWidth` | `"default" \| "form"` | `"default"` | Largeur de départ du panneau : sections (`--detail-w`) ou formulaire (`--detail-w-form`) (D-240). |
| `detailExpandable` | `boolean` | `false` | Bouton Agrandir dans la barre du haut, sur bureau : panneau large (D-241). |
| `tabbar` | `{ id, label, icon }[]` (4 au plus) | les 4 premières entrées de navigation | Entrées de la barre d'onglets mobile. Les entrées fixes du bas de la Sidebar peuvent y aller (`tabbar`, D-230). |
| `history` | `boolean` | `true` | Affiche précédent/suivant. |

## Exclus
- Pas de deuxième barre d'outils sous la barre supérieure : les filtres vont dans la `toolbar` du gabarit.
- Pas de pied de page global.
- Pas de résumé ni d'indicateur d'état après le titre : un état durable se dit dans le contenu, par un encart local (D-085, D-253). Pas de bandeau sous la barre (D-159).
- Pas de bascule de vue à boutons accolés dans `actions` : les vues passent par `views` (D-021, D-222).
- Pas de `className` ni de `style`.

## États
- Sidebar : dépliée, repliée, ou affichée en overlay.
- Panneau de détail : visible, masqué, ou affiché en overlay (tablette) ou en plein écran (mobile).
- Feuille « Plus » (mobile) : ouverte ou fermée.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Sidebar dépliée à l'ouverture, état mémorisé (D-016) | verrouillé | `SidebarMemorisee` |
| Une fois repliée, l'overlay s'ouvre au survol du bouton et se ferme 250 ms après la sortie ; un clic, Mod+B ou Entrée la redéplie (D-017) | verrouillé | `SidebarOverlay` |
| Panneau de détail : colonne mémorisée sur bureau, overlay sur tablette, plein écran sur mobile (D-018) | verrouillé | `PanneauDetail` |
| Panneau de détail : largeur réglable sur bureau de 240 à 480 px, mémorisée ; double-clic pour revenir au défaut ; flèches au clavier par pas de 16 px (D-025) | verrouillé | `DetailRedimensionnable` |
| Panneau de détail : largeur de départ `default` ou `form`, largeur réglée mémorisée pour chacune (D-240) | réglable par page (`detailWidth`) | `DetailFormulaire` |
| Agrandir : bouton bascule, panneau de 960 px au plus, contenu d'au moins 360 px, sans poignée, état mémorisé ; deux états (D-241, D-242) | réglable par page (`detailExpandable`) | `DetailLarge` |
| Onglets de vues : chaque page retient sa dernière vue, Mod+1 à 9 (D-021) | verrouillé | `OngletsDeVues` |
| Panneau de détail et overlay de la sidebar : affichage immédiat, sans animation (D-026) | verrouillé | `PanneauDetail` |
| Trop de vues : la rangée défile et un chevron liste toutes les vues ; l'onglet actif reste visible ; sur mobile, le titre de la vue ouvre la liste ; un seul chevron visible (D-027) | verrouillé | `VuesEnDebordement` |
| Actions de la page : principale à texte si elle n'a pas d'icône ; repli en « … » selon la place, icônes puis texte, avant les onglets de vues ; la cloche et le bouton du détail restent (D-220, D-221) | verrouillé | `ActionsDePage` |
| Échap ferme ce qui flotte | verrouillé | `Echap` |
| F6 et Maj+F6 : zone suivante ou précédente (barre supérieure, sidebar, contenu, détail, barre d'onglets mobile), en sautant les zones masquées ; le focus va au dernier élément focalisé de la zone, sinon au premier atteignable, sinon à la zone (D-350) | verrouillé | `ZonesF6` |
| Web : lien « Aller au contenu », premier élément atteignable, caché jusqu'au focus ; il envoie le focus sur `main`. En bureau (Tauri), pas de lien (D-350, WCAG 2.4.1) | verrouillé | `LienEvitement`, `SansLienEnBureau` |
| Mobile : barre d'onglets, feuille « Plus » sans doublons (D-003, D-019) | verrouillé | `Mobile` |

## Contenu
- Nom de page trop long : il est tronqué, avec une info-bulle.
- Trop de vues pour la largeur : défilement et chevron « Toutes les vues » (D-027).
- Trop d'actions pour la largeur : elles passent dans « … », puis seulement les vues défilent (D-221).

## Densité
`--bar-h`, `--side-w`, `--detail-w`, `--detail-w-form` et `--row-h` suivent la densité (D-004, D-240).

## Clavier
Ordre de tabulation : lien « Aller au contenu » (web seulement), barre supérieure (vues, actions), sidebar, contenu, poignée du détail, panneau de détail. Raccourcis : Mod+B (sidebar), Mod+. (détail), Mod+1 à 9 (vues), Mod+, (réglages), Mod+K (commandes) (D-006). F6 / Maj+F6 : zone suivante / précédente, comme les apps de bureau (D-350). F6 ne fait rien quand le focus est dans une fenêtre hors du cadre (dialogue).

## Accessibilité
- Repères : `banner` (barre supérieure), `navigation` (sidebar, barre d'onglets), `main`, `complementary` (détail).
- Les onglets de vues ont le rôle `tablist`.
- Web : le lien d'évitement « Aller au contenu » répond à WCAG 2.4.1 ; il devient visible en haut à gauche quand il prend le focus.
- Chaque bouton-icône a un nom accessible.
- La poignée du détail a le rôle `separator`, avec `aria-valuenow`, `aria-valuemin` et `aria-valuemax`.
- Le bouton Agrandir est un bouton bascule (`aria-pressed`), nommé « Agrandir le panneau de détail ».

## Taille d'écran
Points de rupture à 640 et 1024 px (D-013). Voir Comportement.

## Erreurs
Sans objet : les erreurs sont gérées par les gabarits et les composants.

## Placement
Racine de chaque écran, à l'intérieur du `SocleProvider` de l'app (D-029) ; un seul AppShell par fenêtre. La plateforme et le préfixe de mémorisation viennent du provider.

Options du `SocleProvider` : `accent`, `density`, `platform`, `storageKey` (D-029), `messages` (D-089), `notifications` (D-154) et `theme`, le thème d'une organisation (D-337). Sans `theme`, le rendu est neutre et inchangé. Avec `theme`, seuls les tokens et les variantes signature changent ; le conteneur de la sidebar, son overlay et la feuille « Plus » suivent les rôles `--side-*`. Le thème peut aussi fixer les couleurs des graphiques (`--chart-*`), la graisse des titres (`typography.headingWeight`), le bouton secondaire (`signature.buttonSecondary`) et un jeu d'icônes pour les icônes internes (`icons`, D-338).

## Composition
Contient les icônes internes de Socle (D-028), `Sidebar`, `IconButton`, `Tabs` (onglets de vues), `Tooltip` et un gabarit (`ListPage`, `DetailPage`, `FormPage`). `SettingsPage` s'ouvre dans un `Modal` par-dessus l'AppShell (D-015).

## Décisions
Libellés internes : dictionnaire `messages` de SocleProvider (D-089).
D-003, D-004, D-006, D-013, D-015, D-016, D-017, D-018, D-019, D-020, D-021, D-025, D-026, D-027, D-028, D-029, D-220, D-221, D-222, D-240, D-241, D-242, D-253, D-337, D-338

## Questions ouvertes
Aucune.
