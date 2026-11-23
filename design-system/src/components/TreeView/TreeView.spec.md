# TreeView
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/TreeView-v1.html — par délégation de l'utilisateur, 2026-11-23

## Rôle
Arbre de nœuds dépliables, dans le contenu d'une page : fichiers et dossiers, chemins, catégories, toute hiérarchie de données. On y explore, on choisit un ou plusieurs nœuds, on agit sur eux. Une ligne par nœud, autant de niveaux que nécessaire.
Ne pas l'utiliser pour :
- la navigation de l'app, même hiérarchique : prendre la `Sidebar` (`Sidebar.Item` ou `Sidebar.TreeItem`) (D-260) ;
- une liste à plat : prendre `List` ou `Table` ;
- choisir une valeur dans un formulaire : prendre `Select` ou `ComboBox`.

### TreeView ou `Sidebar.TreeItem` (D-260)
| | TreeView | `Sidebar.TreeItem` |
|---|---|---|
| Rôle | Contenu de travail : explorer, choisir, agir | Navigation : choisir la page |
| Où | Zone de contenu (colonne d'une page, zone `list` de ListPage, section de Drawer, modale) | Seulement dans la Sidebar |
| Profondeur | Sans limite | Un niveau d'enfants (D-056) |
| Ligne | Une ligne : icône, libellé, méta | Deux lignes : titre, sous-titre, étiquette, non-lu |
| Nœud replié | Rien sous le nœud | Ligne résumé (D-043) |
| Sélection | Aucune, simple ou multiple | Simple : la page courante |
| Actions | `Action`, zone `row` (D-114) | DropdownMenu « … » |
| Chargement à la demande, glisser-déposer | En option | Non |

## Anatomie
1. **Nœud** (au moins un), sur une ligne de `--row-h` (D-261) :
   1. retrait de 16 px par niveau ;
   2. traits de niveau : un trait vertical de 1 px en `--tree-line` par niveau parent, sans coude (D-262) ;
   3. chevron de 16 px (droite replié, bas déplié), en `--fg-3` ; place gardée pour un nœud sans enfants, pour aligner les icônes ;
   4. icône de 16 px en `--fg-2` (facultative) ; `openIcon` la remplace quand le nœud est déplié (dossier ouvert) ;
   5. libellé en `--fg`, coupé avec « … » ;
   6. méta (facultative) : texte court en `--fs-sm`, `--fg-3`, à droite (taille, nombre) ;
   7. actions de nœud (facultatives) : `ActionBar` zone `row`, à la place de la méta quand elles s'affichent (D-265).
2. **Ligne d'état** sous un nœud qui charge ses enfants : « Chargement… » avec la roue, ou « Impossible de charger » avec le lien « Réessayer » (D-266).
3. **État vide** : `EmptyState` compact (D-268).
4. **Repères de dépôt** pendant un glisser-déposer : trait d'insertion de 2 px en `--accent`, ou nœud cible en `--selected` encadré d'`--accent` (D-267).

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `aria-label` | `string` | — (obligatoire) | Nom de l'arbre : « Documents ». |
| `nodes` | `TreeNode[]` | — (obligatoire) | Nœuds de premier niveau. |
| `TreeNode` : `id`, `label` | `string` | — (obligatoires) | Identifiant unique dans tout l'arbre (un chemin complet convient) ; libellé. |
| `TreeNode` : `icon`, `openIcon` | `ReactNode` | aucune | Icône de l'app ; icône du nœud déplié. |
| `TreeNode` : `meta` | `string` | aucune | Texte court à droite. |
| `TreeNode` : `children` | `TreeNode[]` | aucun | Enfants déjà connus. |
| `TreeNode` : `hasChildren` | `boolean` | `false` | Le nœud a des enfants pas encore chargés ; ils sont demandés à `loadChildren` à l'ouverture (D-266). |
| `TreeNode` : `isDisabled` | `boolean` | `false` | Nœud visible, ni sélectionnable, ni ouvrable, ni déplaçable. |
| `selectionMode` | `"none" \| "single" \| "multiple"` | `"single"` | Sélection (D-263). |
| `selectedIds` / `defaultSelectedIds` / `onSelectionChange` | `string[]` | aucune | Nœuds sélectionnés, contrôlés ou non. |
| `expandedIds` / `defaultExpandedIds` / `onExpandedChange` | `string[]` | aucun | Nœuds dépliés, contrôlés ou non. |
| `onAction` | `(node) => void` | aucun | Ouvre le nœud : double-clic ou Entrée. Sans `onAction`, double-clic et Entrée plient ou déplient (D-263). |
| `actions` | `(node) => Action[]` | aucune | Actions du nœud, dessinées par `ActionBar` zone `row` (D-265). |
| `onActionError` / `onActionDone` | `(action, node, error?) => void` | aucun | Rendus de l'`ActionBar` de la ligne (D-116). |
| `loadChildren` | `(node, signal) => Promise<TreeNode[]>` | aucun | Charge les enfants d'un nœud `hasChildren` (D-266). |
| `onMove` | `(ids, target) => void` | aucun | Active le glisser-déposer ; `target` vaut `{ id, position: "before" \| "after" \| "inside" }` (D-267). |
| `emptyState` | `{ title, description? }` | « Aucun élément » | Texte de l'arbre vide (D-268). |

## Exclus
- Pas de case à cocher par nœud ni de sélection en cascade (parent à demi coché) : la sélection multiple se fait par Mod et Maj (D-263).
- Pas de deuxième ligne de texte : prendre `Sidebar.TreeItem` dans la navigation, ou mettre le détail dans le panneau (D-260).
- Pas de renommage dans la ligne : l'action « Renommer » ouvre une modale avec `TextInput`.
- Pas de virtualisation dans cette version : un grand arbre charge ses enfants à la demande (D-266).
- Pas de couleur par nœud ; l'état d'un nœud passe par la méta.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Par défaut | Sans fond. |
| Survol | Fond `--hover` ; les actions remplacent la méta. |
| Sélectionné | Fond `--selected`, fixe au survol (D-039) ; méta en `--fg-2` ; actions visibles. |
| Focus clavier | Anneau `--accent` à l'intérieur de la ligne ; actions visibles. |
| Désactivé | Opacité 40 %, aucune action. |
| Déplié / replié | Chevron bas / droite ; `openIcon` si fournie. Sans animation (D-026). |
| Chargement des enfants | Ligne « Chargement… » avec la roue, en `--fs-sm`, `--fg-3` ; le nœud porte `aria-busy` (D-266). |
| Erreur de chargement | Ligne « Impossible de charger · Réessayer » ; le lien relance la demande (D-266). |
| Vide | `EmptyState` compact (D-268). |
| Glissé | Ligne glissée à 50 % d'opacité ; repère de dépôt sur la cible (D-267). |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Clic : sélectionne. Mod+clic : ajoute ou retire ; Maj+clic : plage (en `multiple`) (D-263) | verrouillé | `Selection`, `SelectionMultiple` |
| Le chevron plie ou déplie sans sélectionner (D-263) | verrouillé | `Deplier` |
| Double-clic ou Entrée : `onAction` ; sans `onAction`, plie ou déplie (D-263) | verrouillé | `Ouvrir` |
| Clavier du motif `tree` et recherche par frappe (D-264) | verrouillé | `Clavier` |
| Actions par `ActionBar` zone `row`, visibles au survol, au focus et sur la ligne sélectionnée ; clic droit ou Maj+F10 : menu « … » (D-265) | verrouillé | `Actions` |
| Action `danger` : dans « … », confirmée ; « Annuler » n'appelle pas `onPress` (D-115) | verrouillé | `Actions` |
| Enfants chargés à la première ouverture, gardés ensuite ; erreur avec « Réessayer » (D-266) | verrouillé | `Chargement` |
| Glisser-déposer, si `onMove` : avant, après, ou dans un nœud qui peut avoir des enfants ; jamais dans soi-même ni ses descendants (D-267) | réglable par app (`onMove`) | `Deplacer` |
| Aucune animation au repli (D-026) | verrouillé | `Deplier` |

## Contenu
- Libellé : nom de l'élément, sans préfixe ; coupé avec « … », texte complet en info-bulle.
- Méta : une valeur courte (« 240 Ko », « 12 »), en chiffres de largeur égale.
- Ordre des nœuds : celui de `nodes` ; le composant ne trie pas.

## Densité
Ligne de `--row-h` (34 px en web, 28 px en desktop). Retrait de 16 px par niveau dans les deux densités. Rayon de 8 px (D-040).

## Clavier
- Tab entre dans l'arbre sur le nœud qui a le focus en dernier, ou le premier sélectionné ; Tab suivant sort de l'arbre.
- Flèches haut et bas : nœud précédent ou suivant visible. Origine et Fin : premier et dernier. Page haut et Page bas.
- Flèche droite : déplie ; sur un nœud déplié, va au premier enfant. Flèche gauche : replie ; sur un nœud replié, va au parent.
- Entrée : `onAction`, ou plie et déplie. Espace : sélectionne (ajoute ou retire en `multiple`). Maj+flèches : étend la plage (en `multiple`).
- Lettres : va au nœud visible dont le libellé commence par le texte tapé (D-264).
- Maj+F10 ou la touche Menu : ouvre le menu « … » du nœud.

## Accessibilité
- Rôle `tree` (React Aria `Tree`), nommé par `aria-label` ; `aria-multiselectable` en `multiple`.
- Chaque nœud : `treeitem` avec `aria-level`, `aria-expanded` s'il a des enfants, `aria-selected`, `aria-disabled`, `aria-busy` pendant le chargement de ses enfants.
- Le chevron est un bouton « Déplier » ou « Replier », hors de l'ordre de tabulation.
- Les actions sont dans un groupe « Actions sur {label} » (ActionBar) ; le lien « Réessayer » est atteignable.
- Glisser-déposer au clavier et au lecteur d'écran par le bouton « Déplacer {label} », visible seulement au focus (React Aria).

## Taille d'écran
Identique. Sur écran tactile, les lignes passent à 44 px et le menu « … » s'ouvre aussi par appui long.

## Erreurs
Échec de `loadChildren` : ligne d'erreur sous le nœud (D-266). Échec d'une action : rendu à `onActionError` ; la page affiche la notification (D-116). Échec de `onMove` : à l'app de rétablir `nodes` et de notifier.

## Placement
Zone de contenu : colonne d'une page, zone `list` de `ListPage`, section de `Drawer` ou de `DetailPage`, corps d'une modale (choisir un dossier). Jamais dans la zone `sidebar` (D-260).

## Composition
Contient `ActionBar` (donc `IconButton`, `DropdownMenu`, la confirmation `useConfirm`), `Link` (« Réessayer »), `EmptyState`, `Tooltip`. Repose sur React Aria `Tree` et `useDragAndDrop`.

## Décisions
D-026, D-039, D-040, D-042, D-066, D-089, D-110, D-114, D-115, D-116, D-260, D-261, D-262, D-263, D-264, D-265, D-266, D-267, D-268

## Questions ouvertes
Aucune.
