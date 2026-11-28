# Drawer
Statut : validé (2026-11-21) ; forme déclarative validée par délégation de l'utilisateur (2026-11-23) — Version : depuis 0.1.0 ; forme déclarative depuis la version qui suit 0.2.0
Validation : docs/validation/components/DetailPanel-v1.html ; forme déclarative : docs/validation/components/DetailPanel-v2.html

## Rôle
Contenu du panneau de détail d'AppShell (D-018) : les propriétés et les réglages de l'élément sélectionné, rangés en sections. Il se place dans le slot `detail` d'AppShell.
Ne pas l'utiliser pour :
- le contenu principal d'un élément (texte, tableau, formulaire long) : le mettre dans le gabarit `DetailPage` ou `FormPage` ;
- les réglages de l'app : prendre `SettingsPage` (D-015).

Deux formes, qui s'excluent (D-180) :
- **à composants** : l'app compose `Drawer.Section` et `PropertyRow` ;
- **déclarative** : l'app passe `header`, `sections` et les états ; le panneau dessine tout. Il ne charge rien : l'app lit la sélection et charge l'objet.

## Anatomie
1. **En-tête** (fourni par AppShell) : titre « Détail » et × sur tablette et mobile (D-018). La largeur du panneau vient d'AppShell : `detailWidth` (`default` pour des sections, `form` pour un formulaire) et le bouton Agrandir facultatif (`detailExpandable`) (D-240 à D-242).
2. **En-tête de l'objet** (forme déclarative, facultatif, D-181) : collé en haut pendant le défilement, trait `--line` dessous.
   1. titre en `--fs-lg`, gras, deux lignes au plus ;
   2. actions à droite : `ActionBar`, règle de la zone `section` (2 icônes, « … », action principale en `Button` `secondary` `sm`) ;
   3. ligne 2 : statut (`Badge`), puis sous-titre en `--fs-sm`, `--fg-2`, une ligne.
3. **Section** `Drawer.Section` (au moins une) : titre en `--fs-sm`, `--fg-3`, suivi d'un chevron ; un clic replie ou déplie la section, état mémorisé (D-061). Après le chevron, un résumé facultatif (`Badge`), lisible même section repliée ; à droite de la ligne du titre, des actions facultatives (`ActionBar` zone `section`) (D-183). Puis ses lignes, puis son contenu libre. Les sections sont séparées par un trait `--line`.
4. **Ligne de propriété** `PropertyRow` :
   1. icône (facultative, 16 px, `--fg-2`) : si une ligne de la section en a une, les autres gardent la place vide (D-057) ;
   2. libellé (obligatoire), en `--fg-2`, dans une colonne de 96 px (D-058) ;
   3. valeur (obligatoire), en `--fg`, alignée sur la même colonne pour toutes les lignes (D-058) ;
   4. action à droite (facultative, une seule) : lien court d'un mot, interrupteur, ou bouton-icône qui peut ouvrir un menu (D-059). L'action est centrée sur la première ligne de texte (D-060).
   5. contenu dépliable (facultatif) : « › » à la place de l'action ; il se déplie sous la ligne, sur place (D-060).
5. **Pied de section** (facultatif, forme à composants) : un bouton à texte, sous les lignes (D-059).

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `Drawer.Section` : `title` | `string` | — (obligatoire) | Titre de la section. |
| `PropertyRow` : `label`, `value` | `string`, `ReactNode` texte | — (obligatoires) | Libellé et valeur. Une valeur vide s'affiche « — » en `--fg-3`. La valeur peut être un `InlineEdit` (D-324). |
| `PropertyRow` : `icon` | `ReactNode` | aucune | Icône facultative, alignée par section (D-057). |
| `PropertyRow` : `action` | `{ type: "link" \| "switch" \| "icon", … }` | aucune | Une action à droite, parmi trois types (D-059). |
| `Drawer.Section` : `footer` | `Button` | aucun | Bouton à texte en pied de section, `size="sm"`, variante `secondary` (D-059, D-101). |
| `Drawer.Section` : `summary` | `string \| { label, tone? }` | aucun | État court après le chevron, lisible même replié : « 2 en retard » (D-183). |
| `Drawer.Section` : `actions` | `ReadonlyArray<Action>` | aucune | Actions de la section, à droite du titre, zone `section` (D-110, D-113, D-183). |
| `Drawer.Section` : `defaultCollapsed` | `boolean` | `false` | Repliée tant que l'utilisateur ne l'a pas ouverte ; son choix est mémorisé (D-183). |

### Forme déclarative (D-180)
| Option | Type | Défaut | Description |
|---|---|---|---|
| `header` | `DetailHeader` | aucun | En-tête de l'objet (D-181). |
| `sections` | `ReadonlyArray<DetailSection>` | aucune | Sections, dans l'ordre (D-183, D-185). |
| `isLoading` | `boolean` | `false` | Chargement : squelettes sans données, barre fine avec données (D-184). |
| `hasError` | `boolean` | `false` | Échec du chargement : message, ou bandeau au-dessus des anciennes données (D-184). |
| `onRetry` | `() => void` | aucun | Bouton « Réessayer » de l'erreur. |
| `isNotFound` | `boolean` | `false` | L'élément n'existe plus : « Élément introuvable » (D-184). |
| `isForbidden` | `boolean` | `false` | Accès refusé : `EmptyState` `compact` `forbidden` (cadenas), « Vous n'avez pas accès à cet élément », « Demandez l'accès à un administrateur. » ; aucune donnée montrée (D-351). |
| `forbidden` | `{ title?, description? }` | textes de `messages` | Textes de l'accès refusé. |
| `onRequestAccess` | `() => void` | aucun | Bouton « Demander l'accès » de l'accès refusé. |
| `emptyMessage` | `string` | « Sélectionnez un élément pour voir son détail. » | Phrase quand rien n'est sélectionné. |
| `onActionDone` | `(action) => void` | aucun | Après la réussite d'une action de l'en-tête ou d'une section (par exemple recharger). |
| `onActionError` | `(action, error) => void` | aucun | Une action a échoué ; l'app affiche la notification (D-116). |
| `reorderable` | `boolean` | `false` | L'utilisateur range les sections : poignée au bord droit de chaque en-tête, après les actions (au survol, toujours atteignable au clavier), à glisser, ou flèches haut et bas sur la poignée ; déplacement annoncé (D-399). |
| `orderKey` | `string` | ordre commun | Clé de mémoire de l'ordre des sections ; une section inconnue garde sa place (D-399). |

`DetailHeader` :
| Champ | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — (obligatoire) | Nom de l'objet. Deux lignes au plus, puis « … » et info-bulle. |
| `subtitle` | `string` | aucun | Une ligne de contexte : « Nantes · client depuis 2019 ». |
| `status` | `{ label: string; tone?: StatusTone }` | aucun | État de l'objet, en `Badge`. |
| `actions` | `ReadonlyArray<Action>` | aucune | Actions sur l'objet, règle de la zone `section`. Groupe « Actions sur {title} ». |

`DetailSection` :
| Champ | Type | Défaut | Description |
|---|---|---|---|
| `id` | `string` | — (obligatoire) | Identifiant stable : il mémorise le repli. |
| `title` | `string` | — (obligatoire) | Titre de la section. |
| `fields` | `ReadonlyArray<DetailField>` | aucun | Lignes de propriété. |
| `content` | `ReactNode` | aucun | Contenu libre, sous les champs. Un texte devient un paragraphe. |
| `empty` | `string` | « Aucune information » | Texte en `--fg-3` quand il n'y a ni champ visible ni contenu. |
| `actions`, `summary`, `defaultCollapsed` | | | Comme `Drawer.Section`. |

`DetailField` (D-182) :
| Champ | Type | Défaut | Description |
|---|---|---|---|
| `id` | `string` | le libellé | Identifiant de la ligne (clé, dépliage). |
| `label` | `string` | — (obligatoire) | Libellé. |
| `value` | `unknown` | — (obligatoire) | Valeur brute, mise en forme selon `type`. |
| `type`, `statuses`, `currency`, `decimals`, `durationUnit` | `ValueFormat` (spec FormattedValue) | `type: "text"` | Rendu par `FormattedValue`, comme les colonnes de ListPage (D-170, D-182). Un texte simple (`text`, `boolean`) garde la coupe à trois lignes et l'info-bulle (D-058). `tags` (liste de textes) se rend en étiquettes : un `TagGroup` de lecture, nommé par le libellé du champ (D-433) ; en texte « a, b, c » seulement dans une ligne à `details`. |
| `hideEmpty` | `boolean` | `false` | Ligne masquée si la valeur est vide, au lieu de « — ». |
| `icon`, `action`, `details` | | | Comme `PropertyRow`. |

## Exclus
- Pas de bouton à texte ni de deuxième action dans une ligne : le bouton à texte va en pied de section (D-059).
- Pas de champ de saisie dans une ligne : une modification se fait par l'action de la ligne (menu, interrupteur, fenêtre) ou dans `FormPage`. Seule exception : un texte modifiable sur place, avec `InlineEdit` comme valeur (D-324).
- Pas de couleur dans la valeur, sauf une pastille de statut (`Badge`, à spécifier).
- Pas de `className` ni de `style`.
- Pas d'enfants avec `header` ou `sections` : une seule forme à la fois (D-180).
- Pas de déplacement des sections par l'utilisateur (D-185).
- Pas de chargement dans le panneau : pas d'option `load` (D-180).

## États
- Ligne : par défaut ; survol (fond `--hover`) seulement si la ligne entière est cliquable.
- Section : dépliée ou repliée ; état mémorisé par section, d'un élément à l'autre (D-061).
- Panneau vide (rien de sélectionné) : une phrase en `--fg-3`, centrée : « Sélectionnez un élément pour voir son détail. »
- Forme déclarative (D-184), par ordre de priorité :
  | État | Rendu |
  |---|---|
  | `hasError` sans données | Message centré « Impossible de charger le détail », phrase, « Réessayer ». |
  | `isLoading` sans données | Squelettes : un titre et six lignes à deux colonnes, après 200 ms (D-165). |
  | `isNotFound` | `EmptyState` compact : « Élément introuvable », « Il a peut-être été supprimé. » |
  | Ni `header` ni `sections` | Phrase vide, ou `emptyMessage`. |
  | `isLoading` avec données | Barre fine de 2 px en haut du panneau (D-084). |
  | `hasError` avec données | Bandeau sous l'en-tête : « Le détail n'a pas pu être mis à jour », « Réessayer » (D-085). |
- Section sans champ visible ni contenu : `empty` en `--fg-3`.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Colonne sur bureau, overlay sur tablette, plein écran sur mobile ; largeur réglable sur bureau (D-018, D-025) | verrouillé | dans `AppShell` |
| Le contenu suit l'élément sélectionné ; il change sans animation (D-026) | verrouillé | `Selection` |
| Un réglage de ligne (interrupteur, menu) s'applique tout de suite (D-007) | verrouillé | `ActionImmediate` |
| Sections : repliables au clic sur le titre ; état mémorisé (D-061) | verrouillé | `Sections` |
| Ligne qui s'ouvre : toute la ligne est cliquable ; clic, Entrée ou Espace déplient sur place ; état mémorisé (D-060) | verrouillé | `LigneDepliable` |
| Forme déclarative : en-tête, sections, champs typés, `hideEmpty`, `empty` (D-180 à D-183) | verrouillé | `Declaratif` |
| Actions d'en-tête et de section : règle de la zone `section` ; `onActionDone` après réussite (D-181, D-183) | verrouillé | `DeclaratifActions` |
| Section `defaultCollapsed` repliée, ouverte au clic, choix mémorisé ; résumé visible repliée (D-183) | verrouillé | `DeclaratifReplie` |
| États : erreur, chargement, introuvable, vide ; barre et bandeau avec données (D-184) | verrouillé | `DeclaratifEtats` |
| Accès refusé : cadenas, « Vous n'avez pas accès à cet élément », phrase, « Demander l'accès » facultatif ; passe avant les autres états et ne montre aucune donnée (D-351) | réglable par l'app (`isForbidden`) | `AccesRefuse` |

## Contenu
- Libellé : un nom court, sans deux-points (« Échéance »).
- Libellé trop long : passe à la ligne dans sa colonne de 96 px.
- Valeur trop longue : passe à la ligne, sur trois lignes au plus, puis ellipse et info-bulle (D-058).
- Dates et nombres au format de la langue de l'app.

## Densité
Ligne de `--row-h` au moins ; marges `--pad`. Texte `--fs-md`.

## Clavier
Ordre de tabulation : actions de l'en-tête, puis, par section, titre, actions de la section, actions des lignes et lignes qui s'ouvrent, de haut en bas. Une ligne qui s'ouvre a `aria-expanded`. Les lignes sans action ne prennent pas le focus.

## Accessibilité
- Repère `complementary` nommé « Détail » (fourni par AppShell).
- Chaque section est un groupe nommé par son titre ; les lignes forment une liste de descriptions (`dl`, `dt`, `dd`).
- Chaque action a un nom qui reprend le libellé (« Modifier l'échéance »).
- Titre de l'objet : titre de niveau 2. Actions de l'en-tête : groupe « Actions sur {title} » ; actions de section : « Actions sur {titre de la section} ».
- Squelettes : `role="status"`, « Chargement… » ; erreur : `role="alert"`.

## Taille d'écran
Identique sur toutes les tailles ; sur mobile, il occupe tout l'écran (D-018).

## Erreurs
Une action qui échoue garde l'ancienne valeur et affiche une notification avec « Réessayer » (D-007). Forme déclarative : une action de l'en-tête ou d'une section qui échoue est rendue à `onActionError` ; l'app affiche la notification (D-116).

## Placement
Uniquement dans le slot `detail` d'AppShell.

## Composition
Contient `IconButton`, `DropdownMenu`, `Toggle` (D-136), `Button` (D-100) et `Tooltip`. Forme déclarative : `ActionBar` (D-110), `Badge` (D-160), `SkeletonGroup` et `Skeleton` (D-165), `EmptyState` (D-166), et `FormattedValue` (D-170). Peut contenir `InlineEdit` comme valeur (D-324) et `Accordion` dans une section (D-321).

## Décisions
D-007, D-015, D-018, D-025, D-026, D-040, D-047, D-057, D-058, D-059, D-060, D-061, D-084, D-085, D-110, D-113, D-116, D-160, D-165, D-166, D-170, D-171, D-180, D-181, D-182, D-183, D-184, D-185, D-240, D-241, D-242, D-321, D-324, D-399, D-433

## Questions ouvertes
Aucune.
