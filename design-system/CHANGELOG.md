# Changelog — socle-ui

Versions selon semver (règle 6 du skill design) : une nouvelle option facultative est une version mineure ; un changement qui casse l'existant est une version majeure, avec une note de migration.

## [1.7.0] — 2026-11-24

Version mineure : une option facultative ; aucune API ne casse.

### Ajouté
- `Sidebar.TreeItem` : `indicator="activity"`, le point vert « En cours » de `Sidebar.Item` (D-385). Story `EnCours`.

## [1.6.0] — 2026-11-24

Version mineure : un gabarit, deux composants et des options facultatives ; aucune API ne casse.

### Ajouté
- `AgentActivity` : option `onObjectPress`, l'objet devient un lien en chasse fixe ; avec une sortie, un chevron à part l'ouvre (D-384). Story `ObjetCliquable`.
- `AgentActivity` : option `attachments` (ReactNode), pièces produites par l'outil sous le texte de la sortie ; une pièce seule rend la ligne ouvrable (D-384). Story `Pieces`.
- `AgentActivity` : état `status: "stopped"`, « Arrêté » en `--fg-3` ; `ActivityGroup` ajoute « · n arrêté(s) » au résumé (D-384). Story `Arrete`.
- Messages : `activityStopped`, `activityToggle`, `activityAttachments` ; `activityGroup` reçoit un 4e argument, le nombre d'arrêtés (une fonction à 3 arguments reste acceptée).
- `ImageThumbnail` : vignette d'image cliquable qui s'agrandit dans une `Modal` `xl` avec `DocumentViewer` ; formes `wide` (360 px, 4:3), `square` (160 px) et `page` (160 px, 16:10, haut de l'image) ; chargement, erreur avec « Réessayer » (`onRetry`), « Télécharger » (`onDownload`) (D-383).
- `ImageGallery` : vignettes en groupes (`images` ou `groups`), légendes coupées avec info-bulle, les plus anciennes derrière « + N » (`visible`) ; vue agrandie parcourue avec précédente · « n / N » · suivante et ← →, arrêt aux bornes ; `onView` pour une image à lire (D-383).
- Icône interne `ImageOff` ; libellés `image*` dans `messages`.
- Specs `AttachmentChip` et `DocumentViewer` : renvoi vers `ImageThumbnail` pour l'aperçu en grand et la vignette (code inchangé).
- `ChatPage` : gabarit de page de chat. Barre d'outils de `Page`, le relevé en enfant, pied aligné sur la colonne de 760 px de `ChatTranscript` (`alerts`, `question` bornée en hauteur, `composer`, `options`), cadre de dépôt sur toute la page (`onDropFiles`, `isDraggingFiles` pour un survol signalé par l'app, `dropLabel`) (D-382).
- `ChatTranscript` : options `context` et `contextDetail`, une ligne de contexte en tête du relevé, le détail en info-bulle (D-382).
- i18n : `chatPageDropHere`.

## [1.5.0] — 2026-11-24

Version mineure : une option facultative ; aucune API ne casse.

### Ajouté
- `Sidebar.TreeItem` : option `quickActions`, des actions en bouton-icône avant le « … » (deux boutons au plus en tout), visibles au survol, au focus et à la sélection (D-381). Story `ActionRapide`.

## [1.4.0] — 2026-11-24

Version mineure : de nouveaux composants et des options facultatives ; aucune API ne casse.

### Ajouté — composants de chat
- `ChatComposer`, `ChatOptions` et `ChatOptionButton` : zone de saisie d'un chat avec un agent et sa rangée d'options (D-371).
- `MentionInput` et `MentionText` : texte à pastilles de références avec suggestions fournies par l'app (D-372).
- `MessageQueue` : file de messages réordonnable dans la zone de saisie (D-373).
- `AttachmentChip` et `AttachmentList` : image, fichier, texte collé (D-374).
- `ChatTranscript`, `ChatMessage` et `MessageActions` : conversation collée en bas, « Nouveaux messages », actions près du texte (D-375).
- `AgentActivity`, `ActivityGroup`, `WorkStatus`, `WorkSummary` : travail de l'agent (D-376).
- `ChoicePrompt` : question ou autorisation de l'agent (D-377).
- `UsageRing` et `UsageMeter` : jauge de contexte qui ouvre le volet des limites (D-378).
- Raccourcis : Échap s'affiche « Échap » (`keyEscape`).
- Slider : options facultatives `formatValue` (valeur affichée et lue en mots) et `showSteps` (crans sur la piste) ; choix du modèle en volet de champs, effort en curseur à crans (D-380).

## [1.3.0] — 2026-11-24

Version mineure : une option facultative ; aucune API ne casse.

### Ajouté
- `Sidebar.Workspace` : option `icon` (D-379). Icône interne `Folder` (liste `ICON_NAMES`).

### Changé
- `Sidebar.Workspace` : une icône de dossier précède le nom de l'espace, dans une case de 24 px alignée sur l'avatar du compte. Toujours pas d'avatar ni de repère d'initiale (D-379).

### Corrigé
- `List` : un élément ne grandit plus quand ses actions apparaissent au survol, au focus ou à la sélection (D-379, comme la Sidebar en 1.1.0). Story `HauteurStable`.

## [1.2.0] — 2026-11-23

Version mineure : une option facultative, le défaut ne change pas.

### Ajouté
- `SocleProvider` : option `isFullscreen` (défaut `false`), lue par `useSocle()`. L'app dit que la fenêtre est en plein écran ; Socle ne le détecte pas (D-370).

### Changé
- `AppShell`, macOS en plein écran (`isFullscreen`) : plus de place de 78 px pour les boutons de fenêtre ; le bouton de repli prend la marge du web ; la barre du haut n'est plus une zone de déplacement. Hors plein écran, rien ne change (D-370).

## [1.1.0] — 2026-11-23

Version mineure : aucune API ne casse.

### Corrigé
- `Sidebar.TreeItem` : la ligne ne grandit plus au survol, au focus ni à la sélection quand le « … » (22 px) apparaît ; la ligne du titre a la hauteur d'une ligne de texte, et la ligne compte ses marges dans `--row2-h`, avec ou sans reset CSS dans l'app (D-368). Une ligne avec icône d'état a la même hauteur qu'une ligne sans.
- `Sidebar.TreeItem` : l'icône du « … » s'aligne sur le bord droit de l'étiquette de la ligne 2 ; sa cible finit à 4 px du bord, comme les actions de `Sidebar.Item` (D-368).

### Changé
- `Sidebar.Workspace` : le repère carré d'initiale est retiré ; le nom de l'espace et le chevron restent (D-369). Aucune option ne change.

### Déprécié
- `workspaceInitial` : plus utilisé par `Sidebar.Workspace` (D-369). Toujours exporté ; retrait en 2.0.0.

## [1.0.0] — 2026-11-23

Version majeure. Les composants prennent les noms de Component Gallery (D-336) ; les anciens noms restent exportés, dépréciés, jusqu'à 2.0.0. Avec : le thème d'organisation (D-337, D-338), LoginPage (D-339), la revue UX des groupes A et B (D-340 à D-353) et les nouveaux composants (D-354 à D-367). Deux changements de comportement : `maxLength` ne bloque plus la saisie (D-343) et le message d'un champ obligatoire cite le libellé (D-344).

### Cassé (1.0.0)
Les composants prennent les noms de component.gallery (D-336). Les types de props suivent.
- `Disclosure` → `Accordion`
- `Switch` → `Toggle`
- `Divider` → `Separator`
- `Dialog` → `Modal` (`DialogSize` → `ModalSize` ; `useConfirm` ne change pas)
- `Menu` → `DropdownMenu` (`MenuItemProps`, `MenuSectionProps`, `MenuSubmenuProps` → `DropdownMenu…Props` ; `useContextMenu`, `MenuPoint` ne changent pas)
- `TextField` → `TextInput`
- `SearchField` → `SearchInput`
- `StepList` → `ProgressIndicator`
- `StatusBadge`, `StatusDot` → `Badge`, `BadgeDot` (`StatusTone` ne change pas)
- `DetailPanel` → `Drawer`, `DetailPanel.Section` → `Drawer.Section` (`DetailPanelProps`, `DetailPanelSectionProps`, `DetailPanelComposedProps`, `DetailPanelDeclarativeProps` → `Drawer…Props` ; `DetailHeader`, `DetailSection`, `DetailField`, `SectionSummary`, l'option `detail` d'AppShell et `DetailPage` ne changent pas)
- `RadioGroup` → `RadioButtonGroup`
- Storybook : les stories passent sous les nouveaux titres (`Composants/Modal`, `Patterns/Drawer`…).

**Migration.** Les anciens noms marchent encore : ils sont exportés comme alias dépréciés (`@deprecated`), avec leurs parties (`DetailPanel.Section`, `Menu.Item`). Ils seront retirés en 2.0.0. Pour migrer, chercher et remplacer dans l'app, en mot entier, selon la liste ci-dessus : `Disclosure` → `Accordion`, `Switch` → `Toggle`, `Divider` → `Separator`, `Dialog` → `Modal`, `Menu` → `DropdownMenu`, `TextField` → `TextInput`, `SearchField` → `SearchInput`, `StepList` → `ProgressIndicator`, `StatusBadge` → `Badge`, `StatusDot` → `BadgeDot`, `DetailPanel` → `Drawer`, `RadioGroup` → `RadioButtonGroup`. Ne remplacer que les imports de `socle-ui` et leurs balises.

Mise en conformité avec les specs existantes, après une revue UX comparée à React Bits. Pas de nouvelle décision de design.

### Ajouté
- Tokens `--primary` et `--primary-fg` (défaut : `--fg` et `--surface`, rendu inchangé) : un thème d'organisation peut colorer le bouton principal et l'étape en cours (D-338).
- Thème d'organisation, compléments (D-338), tous facultatifs, rendu neutre inchangé : couleurs des graphiques `--chart-1` à `--chart-8` et `--chart-seq-1` à `--chart-seq-5` (palette neutre par défaut, clair et sombre, utilitaires `bg-chart-1`…) ; `signature.buttonSecondary` (`fill` ou `outline`, attribut `data-button-secondary`) ; `typography.headingWeight` (token `--fw-heading`, utilitaire `font-heading`, lu par les titres de page, section, modale et panneau) ; `icons` (`{ viewBox, paths }`, type `IconName` et liste `ICON_NAMES` exportés) pour remplacer des icônes internes par des tracés pleins ; token `--side-highlight` : le résumé « n non lus » de la sidebar reste lisible sur une sidebar sombre.
- Gabarit `LoginPage` (D-339) : page de connexion centrée, logo, identifiant, mot de passe avec bascule d'affichage, « Se souvenir de moi », « Mot de passe oublié ? », fournisseurs d'identité, message d'échec global focalisé. Types `LoginPageProps`, `LoginValues`, `LoginProvider`, `LoginResult`. Libellés internes `login…`.
- Thème d'organisation (D-337) : option facultative `theme` de `SocleProvider` (type `SocleTheme`, liste `THEME_TOKENS`). Tokens clair et sombre, polices, rayons et trois variantes signature : `navIndicator` (`fill` ou `bar`), `tabs` (`pill` ou `underline`), `tableHeader` (`plain` ou `tinted`). Sans thème, rendu inchangé. Nouveaux tokens, égaux par défaut aux rôles génériques : `--side-bg`, `--side-fg`, `--side-fg-2`, `--side-fg-3`, `--side-hover`, `--side-selected`, `--side-selected-fg`, `--side-indicator`, `--side-line`, `--focus`, `--highlight`, `--table-head-bg` ; utilitaires Tailwind correspondants (`bg-side-bg`, `outline-focus`, `bg-highlight`…). L'anneau de focus lit `--focus` ; les points non lus (Sidebar, List, NotificationCenter) lisent `--highlight`.
- `TabPanel` et `useTabPanelProps` : la zone de contenu reçoit le rôle `tabpanel`, nommée par l'onglet actif ; option facultative `id` sur `Tabs`. `AppShell` les relie tout seul quand il a des vues (Tabs.spec.md).
- Libellés internes `rowAction` et `moreActionsFor`.

### Ajouté — nouveaux composants (revue Component Gallery)
- `DatePicker` et `DateRangePicker` : saisie par segments dans l'ordre de la langue, calendrier d'un mois avec choix du mois et de l'année, jours indisponibles, bornes, raccourcis de période en option ; valeurs ISO `AAAA-MM-JJ` (D-354). Dépendance `@internationalized/date` déclarée.
- `Alert` : encart dans le contenu, carte neutre avec icône de ton, une action, croix facultative (jamais pour une erreur), annonce `status` / `alert` en option (D-355).
- `NumberField` : flèches empilées, Maj et Page haut/bas pour dix pas, molette désactivée, format de la langue, devise, % et unité, bornes vérifiées en quittant le champ (D-356).
- `FileUpload` et `FileList` : dépôt ou choix de fichiers, type et taille vérifiés avant `onAdd`, fichiers refusés listés, état par fichier avec « Réessayer » (D-357).
- `SegmentedControl` : choix exclusif de 2 à 4 options, rôle `radiogroup` (D-358).
- `Pagination` : précédent, numéros avec « … », suivant ; « Page n sur N » sous 641 px ; ListPage l'utilise (D-359).
- `Spinner` : indicateur rotatif de 14 ou 20 px, nommé ou décoratif ; Button, IconButton et SearchInput l'utilisent (D-360).
- `Card` : conteneur neutre, variante `metric`, carte cliquable avec « … » hors de la cible (D-361).
- Icônes internes : calendrier et types de fichier, remplaçables par un thème (D-338).

### Ajouté — lot 4
- `TagGroup` et `Tag` : étiquettes neutres à retirer (croix, Suppr, Retour arrière) ou à choisir pour filtrer ; un seul arrêt de Tab (D-362).
- `CodeField` : code à usage unique de 4 à 8 cases sur un seul vrai champ (`one-time-code`) ; collage, flèches, `onComplete`, code vidé sur une nouvelle erreur, « n sur N » annoncé (D-363).
- FormPage : mode en étapes (`steps`) : ProgressIndicator, « Précédent » et « Suivant », vérification par étape, récapitulatif avec « Modifier », erreurs du serveur renvoyées à leur étape (D-364). ProgressIndicator : l'étape en cours peut être en erreur ; une étape à venir n'est jamais un bouton. Type `FormStep`.
- `SplitButton` : action par défaut et menu des variantes (D-365).
- `Slider` : une ou deux poignées, valeur formatée, Page ×10, `onChangeEnd` au relâché (D-366).
- `ColorPicker` : nuancier prédéfini, choix aux flèches, saisie hexadécimale en option, alerte de contraste (D-367).
- Pas de fil d'Ariane : D-211 est confirmé.

### Ajouté — revue UX, groupe B (options facultatives, défaut inchangé sauf mention)
- `disabledReason` sur Button, IconButton, `DropdownMenu.Item` et `Action` : contrôle focusable, raison en info-bulle et en description (D-340). Tooltip : option `description`.
- FormPage : récapitulatif des erreurs à partir de 2 erreurs, avec un lien par champ (D-341).
- Lecture seule visible sur Checkbox, CheckboxGroup, RadioButtonGroup et Toggle ; Select gagne `isReadOnly` (D-342).
- `maxLength` ne bloque plus la saisie (TextInput, TextArea, InlineEdit, MarkdownEditor) : compteur « n caractères en trop », valeur refusée au-delà (D-343). **Changement de comportement.**
- Message d'un champ obligatoire vide construit à partir du libellé (« Renseignez « Date de début ». ») ; option `requiredMessage` (D-344). **Changement de texte.**
- ListPage : `allowSelectAll` (D-345), `allowColumnChoice` et `TableColumn.required` (D-346), `allowsUnsort` (D-347), `pagination.pageSizes` (D-348), `isForbidden`, `forbidden`, `onRequestAccess` (D-351). `selectionActions` reçoit un second argument `"rows" | "all"`. Table : `allowsUnsort`, `hiddenColumns`.
- Tabs : `TabItem.isDirty` (D-349).
- AppShell : F6 et Maj+F6 entre les zones ; lien « Aller au contenu » en web (D-350).
- EmptyState : `variant="forbidden"` ; Drawer : `isForbidden` (D-351).
- Modal et `useConfirm` : focus de repli quand le déclencheur a disparu ; option `returnFocusTo` (D-352).
- ActionBar : « … » en attente pendant une action lancée depuis son menu (D-353).

### Corrigé
- TreeView : déplacer un nœud au clavier fonctionne aussi quand le focus arrive directement sur la poignée « Déplacer » (lecteur d'écran) ; une seconde Entrée trop rapide ne relance plus le glissement. La poignée sort de l'ordre de tabulation, comme le chevron (D-267).
- ComboBox et TreeView utilisent le Spinner (D-360).
- Toast : au retour sur la fenêtre, la minuterie ne repart plus si la souris ou le focus sont sur un toast (D-153). Échap ferme aussi le toast depuis son action ou sa croix.
- FormattedValue : une valeur négative arrondie à zéro s'affiche « 0 », pas « -0 » (`number`, `money`, `percent`).
- SettingsPage : quand les réponses arrivent dans le désordre, l'échec d'un ancien envoi ne rétablit plus une valeur dépassée (D-204).
- Appui long au doigt ou au stylet (500 ms) : il ouvre le menu « … » des lignes de `List`, `Table`, `TreeView` et `Sidebar`, et le menu de `useContextMenu` (D-007). iOS Safari n'envoie pas `contextmenu`.
- Sidebar : Maj+F10 et la touche Menu ouvrent le menu « … » de l'élément. Table et List : Maj+F10 aussi. Ouvert au clavier, le menu prend toujours le focus.
- AppShell : l'overlay de la sidebar repliée reste ouvert tant que le focus clavier est dedans.
- List : lignes de 44 px au toucher (List.spec.md).
- Table : les actions de ligne sont nommées avec la ligne, « Archiver Budget 2027 », « Plus d'actions pour Budget 2027 » (Table.spec.md).
- ProgressIndicator : le focus reste sur l'étape après un clic ; sous 380 px, une étape garde son nom accessible.
- DocumentViewer, LogViewer, DiffView : leur barre d'outils se parcourt avec les flèches (Toolbar de React Aria) ; dans un champ texte, les flèches déplacent le curseur.
- Select : info-bulle sur une option ou une valeur coupée. SearchInput : info-bulle sur une étiquette coupée, au survol et au clavier, à la place de `title`. Annonce « Recherche en cours » fiable, sans doublon.
- FormattedValue : exemple de statut « En cours » en ton `info` (D-161) ; spec alignée sur le texte masqué de « — ».

- Toast : au-delà de trois toasts, le plus ancien toast à minuterie se ferme d'abord ; une erreur `danger` sans durée n'est plus évincée par des succès (D-153).
- Sidebar : les flèches déplacent le focus sans changer de page ; Entrée, Espace ou un clic sélectionnent. L'élément de la page courante porte `aria-current="page"`.
- AppShell : le panneau de détail en overlay (tablette) ou plein écran (mobile) prend le focus à l'ouverture, le garde avec Tab et le rend au bouton à la fermeture. La sidebar n'est plus un repère `complementary` sans nom.
- ListPage : après une recherche, un filtre ou un rechargement, seules les lignes cochées encore visibles restent cochées. Un changement de page remet la liste en haut.
- Tabs : `onClose` est appelé avant tout changement de vue ; rendre `false` annule la fermeture (option facultative).
- Table : un `BadgeDot` dans une cellule n'ajoute plus d'arrêt de tabulation.
- EmptyState : `description` accepte un `ReactNode` (lien dans la phrase) ; le titre est un vrai titre, option facultative `headingLevel`.
- IconButton : le nom n'est plus lu deux fois (l'info-bulle ne sert de description que si elle ajoute un raccourci).
- Link : `mailto:` et `tel:` s'ouvrent dans le même onglet, sans mention « navigateur ».
- Drawer : le bouton de section est dans un titre `h3` et pilote son contenu par `aria-controls`.

### Interne
- `tsconfig.json` : types `ES2023.Intl`.

## [0.4.0] — 2026-11-23

Retrait de P16 à la relecture. Version qui casse l'existant (en 0.x, la version mineure monte).

> **Changement qui casse l'existant** : `AppShell` perd les options `pageSummary` et `pageStatus`, et le type `PageStatus` n'est plus exporté (D-253).

### Retiré
- `AppShell` : options `pageSummary` (résumé après le titre) et `pageStatus` (indicateur d'état), type `PageStatus` (D-250 à D-252, retirées par D-253). Migration : retirer ces deux options des appels à `AppShell`. Un état durable (lecture seule, hors ligne, données d'exemple) se dit dans le contenu de la page, par un encart local (D-085) ; un chiffre clé va dans l'en-tête du gabarit ou dans le contenu.

### Corrigé
- Tests : le menu de `Sidebar.Workspace` se ferme par un clic à côté ; la poignée du panneau de détail s'élargit à la souris.
- Pages de validation `Sidebar-footer-v1.html` et `AppShell-actions-v1.html` : un menu ouvert se ferme par un clic à côté et par Échap. `DetailPanel-width-v1.html` : la poignée se glisse (240 à 480 px), les flèches la règlent, le double-clic revient au défaut.

## [0.3.0] — 2026-11-23

Lots 2 à 5 de la migration d'Alfred : gabarits de page (ListPage, DetailPanel déclaratif, FormPage, SettingsPage, DetailPage et Page), coquille (actions de page, pied de Sidebar, largeurs du détail, résumé et état), composants spécialisés (TreeView, tableau dense, Terminal, LogViewer, DiffView, Markdown, DocumentViewer, HtmlContent, Disclosure, InlineEdit, StepList, Popover) et garde-fous Biome (décisions D-170 à D-335). Version mineure : tout est nouveau ou facultatif ; les petits changements de l'existant sont listés sous « Modifié ».

### Ajouté
- Config Biome partagée `socle-ui/biome` pour les apps qui lintent avec Biome 2.6 ou plus récent : `"extends": ["socle-ui/biome"]` dans `biome.json` (D-330). Imports interdits (librairie headless, chemins internes) ; `style` et `className` interdits sur un composant Socle, reconnu par son nom (D-331) ; couleurs en dur interdites dans le code et le CSS (D-332).
- `npm run check` teste la config Biome sur des fichiers d'exemple (D-333) et vérifie que `package.json`, la dernière entrée datée du CHANGELOG et `SOCLE_VERSION` ont la même version (D-335).
- README : installation dans une app par yalc, clone neuf compris, et règles de version (D-334).
- `FormattedValue` : une donnée affichée d'après son type (`text`, `longtext`, `number`, `money`, `percent`, `bytes`, `date`, `datetime`, `relative`, `duration`, `boolean`, `status`, `email`, `url`, `code`, `tags`), au format de la langue (D-170). Vide « — », valeur illisible en texte brut (D-171). Le type fixe l'alignement, la largeur de colonne et le tri (D-172). Exports : `useFormatValue`, `valueSortKey`, `valueLayout`, types `ValueType`, `ValueFormat`, `StatusMap`.
- `ListPage` : gabarit déclaratif (titre, lignes, colonnes typées, recherche, filtres, `Action`) qui dessine l'en-tête, la barre, la liste (`Table` ou `List`), le pied et les états chargement, vide, aucun résultat et erreur (D-173). Recherche et filtres locaux, ou `remote` avec `onStateChange` (D-174). Pied « Afficher plus » par défaut, pagination en option (D-175). Vide sans barre ; « Effacer la recherche » vide aussi les filtres (D-176). Filtres et tri mémorisés (D-177). Barre de sélection en sélection multiple (D-178).
- Libellés internes : `locale`, `yes`, `no`, `justNow`, `emptyValue`, `itemCount`, `rangeOf`, `shownOf`, `pagination`, `previousPage`, `nextPage`, `selectedCount`, `clearSelection`.
- `DetailPanel` : forme déclarative, facultative (D-180). L'app passe `header` (titre, sous-titre, statut, actions ; D-181) et `sections` (champs typés rendus par `FormattedValue`, contenu libre, texte vide ; D-182, D-183). Le panneau gère le chargement, l'erreur, l'élément introuvable et le vide (`isLoading`, `hasError`, `onRetry`, `isNotFound`, `emptyMessage` ; D-184). Actions d'en-tête et de section par `ActionBar`, règle de la zone `section` ; `onActionDone` et `onActionError`. Types exportés : `DetailHeader`, `DetailSection`, `DetailField`, `SectionSummary`, `DetailPanelComposedProps`, `DetailPanelDeclarativeProps`.
- `DetailPanel.Section` : options facultatives `summary` (état court lisible même repliée), `actions` et `defaultCollapsed` (D-183).
- `DetailPanel` (forme à composants) : option facultative `emptyMessage`.
- Libellés internes `detailLoadErrorTitle`, `detailLoadErrorText`, `detailNotUpdated`, `detailNotFoundTitle`, `detailNotFoundText`, `detailSectionEmpty`.
- Gabarit `FormPage` (D-022, D-193) : en-tête, sections titrées (titre et aide à gauche à partir de 800 px de conteneur, au-dessus en dessous), pied collé en bas avec l'état d'enregistrement (D-194), « Annuler » (confirmé après une saisie, D-195) et l'action principale, toujours active (D-196). Options `initialValues`, `onDirtyChange`, `isLoading` (squelettes).
- Formulaire en modale : `const openForm = useOpenForm(); const values = await openForm({ title, fields, submitLabel, onSubmit? })` rend les valeurs, ou `null` si l'utilisateur ferme (D-197). Taille automatique `sm` ou `md`, attente et erreur sur place (D-198). L'hôte est dans `SocleProvider`.
- Modèle de champ déclaratif `FormField`, commun aux deux : `text`, `email`, `url`, `tel`, `password`, `number`, `textarea`, `select`, `combobox`, `radio`, `checkbox`, `checkboxGroup` et le groupe `fieldset`, dessinés avec les champs du lot 1 (D-190). Pas d'interrupteur (D-137). Valeurs typées (D-191) ; vérification par les champs, règle croisée `validate(valeur, valeurs)`, erreurs rendues par `onSubmit` (`{ errors, message }`) sous les champs (D-192). Entrée et Mod+Entrée envoient (D-196). Types exportés : `FormField`, `FormValues`, `FormSubmitResult`, etc.
- Libellés du dictionnaire `messages` : `unsavedChanges`, `saving`, `saved`, `saveFailed`, `fixErrors`, `discardTitle`, `discardMessage`, `discard`, `invalidNumber`, `numberTooSmall`, `numberTooLarge`.
- Règles de placement : FormPage et saisie courte en modale (docs/layout-rules.md).
- Gabarit `SettingsPage` (D-015, D-200 à D-209) : API déclarative `groups → categories → sections → settings`. Réglages typés `switch`, `select`, `text`, `action`, `item`, `info`, et contenu libre de section (`content`, par exemple une `Table`). Navigation avec recherche, groupes, icônes et lien externe en pied ; dernière rubrique mémorisée. Application immédiate ; un échec rétablit la valeur et ouvre un toast `danger`. Listes dans une section : code, étiquettes `StatusBadge`, actions de ligne par `ActionBar`. États de chargement et d'erreur d'une rubrique. Tient dans un `Dialog` `xl` comme en pleine page ; sous 640 px de large : liste, puis rubrique avec « Retour ». Types exportés : `SettingsPageProps`, `SettingsGroup`, `SettingsCategory`, `SettingsSection`, `Setting` et un type par réglage.
- Tokens `--settings-nav-w`, `--settings-pad`, `--setting-py` (web et desktop).
- Libellés internes : `settingsSections`, `settingsSearchScope`, `noSettingsFound`, `backToSections`, `settingNotSaved`, `settingsLoadError`, `settingsLoadErrorText`, `loadingSettings`.
- `Table` : options facultatives pour un tableau dense, sans second composant (D-270).
  - `density="compact"` : lignes de 25 px, en-tête de 28 px (D-271).
  - `groupBy` et `defaultCollapsedGroups` : lignes de groupe en texte, repliables au clic, à Entrée et à Espace ; état mémorisé par tableau (D-272).
  - `rowDescription` : lignes doubles, précision sous le nom (D-273).
- Libellé interne `groupCount` (« n lignes ») dans le dictionnaire `messages`.
- `Disclosure` : bloc repliable avec un titre, même forme que les sections de `Sidebar` et `DetailPanel` ; replié par défaut, contenu créé à l'ouverture, état mémorisé avec `id` (D-320, D-321).
- `InlineEdit` : texte modifiable sur place, sur une ou plusieurs lignes ; fin contour au survol (D-322) ; clic, Entrée ou F2 ouvrent, Entrée (ou Mod+Entrée) et clic à côté enregistrent, Échap annule ; promesse rejetée : saisie gardée avec un message (D-323) ; `isRequired`, `validate`, `placeholder`, `isEditing` (D-324).
- `StepList` : étapes numérotées, quatre états (à faire, en cours, fait, erreur), horizontal ou vertical ; retour aux étapes passées avec `onSelect` ; resserrement sous 560 et 380 px (D-325, D-326). Fonction `stepStatus` interne.
- `Popover` : volet flottant ancré à un bouton, sans voile ; titre facultatif avec × ; largeurs `sm`, `md`, `lg` ; placements `bottom start`, `bottom end`, `right start` ; fermeture et focus de la modale, rebond après saisie, `isBusy` (D-328, D-329).
- `Menu` : options facultatives `title`, `anchor` (point ou élément), `isOpen`, `onOpenChange` ; `trigger` devient facultatif avec `anchor`. Crochet `useContextMenu()` : clic droit, Maj+F10 et touche Menu ; un menu ouvert à un point se ferme au défilement (D-327).
- Libellés internes `editValue`, `stepDone`, `stepError` dans le dictionnaire `messages`.
- `DetailPanel` (spec) : la valeur d'une `PropertyRow` peut être un `InlineEdit` (D-324) ; `Disclosure` permis dans une section (D-321).
- Deux sous-entrées, avec des dépendances facultatives (D-300) : `socle-ui/markdown` (`Markdown`) et `socle-ui/markdown-editor` (`MarkdownEditor`). `react-markdown`, `remark-gfm`, `@codemirror/state`, `@codemirror/view`, `@codemirror/commands`, `@codemirror/language`, `@codemirror/lang-markdown` et `@lezer/highlight` sont des peer dependencies facultatives : une app les installe seulement si elle importe ces sous-entrées. `socle-ui` reste l'entrée de tout le reste ; `scripts/check.js` et `socle-ui/eslint-config` autorisent ces deux sous-entrées.
- `Markdown` : rendu de GFM avec la typographie de Socle (D-301) ; `headingLevel` (D-302) ; liens en `Link`, `onLinkPress` qui annule la navigation, adresses dangereuses retirées, HTML ignoré, images seulement par `renderImage` (D-303) ; blocs de code en `Code` avec « Copier le bloc », `renderCode`, tableaux statiques au style de `Table`, cases de tâches statiques (D-304).
- `MarkdownEditor` : champ de formulaire sur CodeMirror 6, chargé à la première ouverture (D-305) ; chasse fixe et coloration aux tokens, en clair et en sombre (D-306) ; barre de mise en forme et raccourcis (D-307) ; images collées ou déposées par `onPasteImage` (D-308) ; aperçu facultatif en bascule ou côte à côte (D-309). États du lot 1 : désactivé, lecture seule, erreur ; compteur avec `maxLength`.
- Libellés internes ajoutés au dictionnaire `messages` : `copyBlock`, `blockCopied`, `copyFailed`, `table`, `taskDone`, `taskTodo`, `image`, `formatting`, `heading`, `bold`, `italic`, `inlineCode`, `link`, `bulletList`, `orderedList`, `quote`, `preview`, `nothingToPreview`, `imageUploading`, `imageNotAdded`, `linkTextPlaceholder`, `linkUrlPlaceholder`.
- `ActionBar`, zone `topbar` : une action principale sans icône devient un bouton à texte, tout à droite (D-220). Dans la barre du haut d'AppShell, repli selon la place : les icônes passent dans « … » depuis la dernière, puis le bouton à texte (D-221). Option `fit` de `arrangeActions`, type `ActionFit`.
- `AppShell` : le slot `actions` prend la place libre de la barre et accepte `ActionBar zone="topbar"` avec les boutons-icônes de l'app (D-222).
- `Sidebar` : option `footer`, des `Sidebar.Item` fixes en bas, au-dessus du compte, hors du défilement (D-230). Nouveau `Sidebar.Workspace` (option `workspace`) : sélecteur d'espace de travail, menu au-dessus, espace ouvert coché, actions de l'app après un trait (D-231). Ordre du pied : entrées fixes, espace, compte (D-232). Fonction `workspaceInitial`, types `SidebarWorkspaceProps` et `SidebarWorkspaceEntry`.
- `AppShell` : option `detailWidth` (`"default"` ou `"form"`), largeur de départ du panneau de détail, largeur réglée mémorisée pour chacune (D-240). Option `detailExpandable` : bouton bascule Agrandir dans la barre du haut, panneau large de 960 px au plus, sans poignée (D-241, D-242). Token `--detail-w-form` (460 px web, 420 px desktop). Libellé interne `expandDetail`.
- `AppShell` : option `pageSummary`, court résumé en texte après le titre, coupé avec info-bulle, masqué sur mobile (D-250). Option `pageStatus` (`{ label, tone?, description?, menu? }`) : indicateur d'état durable après le titre, avec info-bulle ou menu, annoncé quand il change ; un seul à la fois (D-251, D-252). Type `PageStatus`.
- Libellés internes `footerNavigation`, `workspaces`, `workspaceLabel` et `workspaceSwitch` dans le dictionnaire `messages`.

### Modifié
- `Dialog` : un changement fait dans un gabarit à application immédiate (`SettingsPage`) ne compte plus comme une saisie commencée ; le clic hors ferme la modale (D-208). Aucun effet ailleurs.
- `ActionBar` : la fonction interne `confirmRequest` est exportée dans le module (pas dans `index.ts`), pour être réutilisée par `SettingsPage`.
- Gabarit `DetailPage` : un élément ouvert en entier. En-tête fixe avec lien de retour vers la vue principale, titre `h1`, statut, méta et actions en zone `header` ; sections séparées par des traits ; colonne de lecture de 760 px par défaut (D-210 à D-214). États `loading`, `error` et `not-found` rendus par le gabarit, lien de retour toujours visible (D-215).
- Gabarit `Page` (page composée) : barre d'outils sur une ligne (contenu libre et actions en zone `toolbar`), contenu en blocs espacés de 24 px, pied ; options `width`, `fill`, `state` (D-214, D-215, D-217, D-218).
- `PageSection` (aussi `DetailPage.Section` et `Page.Section`) : bloc titré avec description, actions en zone `section`, états `loading`, `error` et `empty` (D-213, D-216).
- Libellés internes `backTo`, `pageLoadErrorTitle`, `pageLoadErrorText`, `sectionLoadError`, `notFoundTitle`.
- Règles de mise en page : DetailPage précisé, section « Page composée » ajoutée dans `docs/layout-rules.md`.
- `TreeView` : arbre de nœuds dépliables dans le contenu d'une page (fichiers, dossiers, hiérarchies), sur autant de niveaux que nécessaire (D-260 à D-268). Un nœud sur une ligne : chevron, icône (`openIcon` une fois déplié), libellé, méta (D-261) ; un trait vertical `--tree-line` par niveau (D-262). Sélection `none`, `single` (défaut) ou `multiple` par Mod et Maj ; double-clic ou Entrée : `onAction`, sinon plie ou déplie (D-263). Clavier du motif `tree` et recherche par frappe (D-264). Actions de nœud par le modèle `Action` et `ActionBar` zone `row`, action `danger` confirmée, clic droit et Maj+F10 (D-265). Enfants chargés à la demande par `loadChildren(node, signal)`, avec « Chargement… » et « Impossible de charger · Réessayer » (D-266). Glisser-déposer facultatif par `onMove(ids, { id, position })` : avant, après, dans (D-267). Arbre vide : `EmptyState` compact (D-268). Types `TreeViewProps`, `TreeNode`, `TreeMoveTarget`.
- Libellés internes `childrenLoadFailed`, `noItems`, `moveItem`, `expand` et `collapse` dans le dictionnaire `messages` (D-089).
- Règle de choix entre `TreeView` et `Sidebar.TreeItem` (D-260), reportée dans la spec `Sidebar`.
- `Dialog` : `useEscapeFlag` et `FocusFirstField` sont exportés du module (interne, non exporté par `index.ts`) pour `Popover`. Aucun changement de comportement.
- Spec `TextArea` : renvoie à `MarkdownEditor` pour un texte mis en forme.
- `ActionBar`, zone `topbar` : une action `primary` **sans icône** était en tête de « … » ; elle est maintenant un bouton à texte (D-220, remplace une partie de D-112). Migration : pour une forme compacte, donner une icône à l’action principale (elle reste alors une icône, en premier, D-112) ; pour la garder dans « … », retirer `primary`.

### Corrigé
- `SOCLE_VERSION` valait encore `0.1.0` dans la 0.2.0 ; elle suit désormais `package.json`.
- `Table` : les cellules se redessinent quand seuls les critères de recherche changent ; le texte trouvé passe bien en gras (D-087).
- `Table` : une colonne déclarée sous 80 px garde sa largeur (D-274).
- `Table` : un en-tête coupé par « … » montre son libellé complet en info-bulle (D-275).
- `Terminal` : terminal interactif sur xterm.js (D-280 à D-284). Branchement générique `connection` `{ send, subscribe }`, taille par `onResize`, état par `state` et `reason`, lecture seule, `fill`. Poignée `ref` : `write`, `clear`, `text`, `selection`, `paste`, `bracketedPaste`, `focus`. Clavier de Windows Terminal ; F6 et Maj+F6 sortent du terminal. Barre d'état : état, aide, taille.
- xterm.js reste côté app (D-280) : `@xterm/xterm` et `@xterm/addon-fit` sont des peer dependencies facultatives ; l'app passe le moteur par `engine` et importe `@xterm/xterm/css/xterm.css`. Une app sans terminal n'a rien à installer.
- `LogViewer` : journal en lignes horodatées, virtualisé jusqu'à 500 000 lignes (D-285). Filtre de niveau par Menu à choix avec compteurs (D-286), liste des erreurs (D-287), Suivre la fin avec pause et « Revenir à la fin » (D-288), recherche, retour à la ligne, horodatage, copie (D-289). Alimenté par `lines` ou par la poignée `ref.append()`.
- Tokens `--ansi-0` à `--ansi-15` : les 16 couleurs ANSI, en clair et en sombre, au moins 4,5:1 sur `--surface` (D-281).
- Libellés du Terminal et du LogViewer dans le dictionnaire `messages` (`terminalOpening`, `logLevel`, `followPaused`…).
- `DiffView` : différences entre deux textes (`before`, `after`, `fileName`) ou lecture d'un diff unifié (`patch`, plusieurs fichiers) (D-290). Vue côte à côte par défaut, unifiée au choix par un `IconButton` à bascule ; unifiée imposée sous 641 px (D-291). Fonds tirés de `--success` et `--danger`, jamais en dur (D-292). Signes + et −, texte caché, `<ins>` et `<del>` (D-293). Mots changés surlignés (D-294). Lignes inchangées repliées, `context` réglable (D-295). En-tête avec nom, résumé et compteurs ; titre par fichier dans un patch (D-296). Navigation F7, Maj+F7, Alt+↓, Alt+↑, annoncée (D-297). Seules les rangées visibles sont dessinées ; option `fill` (D-298). Avis binaire, fins de ligne, diff coupé (D-299).
- `DiffStat` : compteurs « +12 −3 » seuls, avec texte caché (D-290).
- Libellés internes `diff…` dans le dictionnaire `messages` (D-089).
- `DocumentViewer` : aperçu d'un PDF ou d'une image, source `src` (`data:`, `blob:`, `https:`) ou `data` (`Blob`, `ArrayBuffer`, `Uint8Array`) (D-310). Barre d'outils : « Page n / N », page précédente et suivante, zoom −/%/+, « Ajuster à la largeur », « Télécharger » (`onDownload`), actions de l'app (`actions`, zone `toolbar`) (D-312). Zoom par paliers 25 → 400 %, Ctrl/⌘ + molette, Ctrl/⌘ + « + » / « − » / « 0 » (D-313). Pages dessinées à l'approche de la zone visible (D-314). Chargement en squelette, erreurs en `EmptyState` avec « Réessayer », format non pris en charge avec « Télécharger » (D-316). Options `height` (`fixed`, `fill`), `name`, `type`.
- pdf.js en peer dependency facultative (`pdfjs-dist` >= 5) : Socle ne l'importe jamais ; l'app passe `loadPdf={() => import("pdfjs-dist")}` et règle son worker (D-311). Types exportés : `PdfEngine`, `PdfDocumentHandle`, `PdfPageHandle`, `DocumentData`, `DocumentFormat` ; fonction `detectFormat` ; constante `ZOOM_STEPS`.
- `HtmlContent` : HTML reçu (courriel, page) nettoyé par liste blanche et isolé dans une racine fantôme, `contain: content` (D-317). Images distantes masquées par défaut, bandeau « N images masquées » + « Afficher les images » ; `imagesAllowed`, `defaultImagesAllowed`, `onImagesAllowedChange`, `resolveImage` (`cid:`, proxy) (D-318). Liens http, https, mailto interceptés par `onLink`, adresse au survol ; sans `onLink`, texte simple. Surface `paper` (défaut) ou `theme` (D-319).
- Tokens `--paper`, `--paper-fg`, `--paper-link`, identiques en clair et en sombre, et utilitaires `bg-paper`, `text-paper-fg`, `text-paper-link` (D-315).
- Libellés internes ajoutés au dictionnaire `messages` : `documentToolbar`, `pageOf`, `pageNumber`, `documentPages`, `previousPage`, `nextPage`, `zoomIn`, `zoomOut`, `fitWidth`, `zoomPercent`, `download`, `readingDocument`, `documentUnreadable`, `documentReadFailed`, `pdfPassword`, `pdfInvalid`, `pdfUnavailable`, `unsupportedFormat`, `unsupportedFormatText`, `unknownFormat`, `imagesHidden`, `showImages`.

### Interne
- `ActionBar` : la logique de lancement (confirmation, attente, `onDone`, `onError`) passe dans un hook interne `useActionRunner`, réutilisé par les actions de ligne de `ListPage`. Rendu et API inchangés.

## [0.2.0] — 2026-11-23

Lot 1 de la migration d'Alfred : bouton à texte, actions, modale, champs, ComboBox, notifications et petits éléments d'affichage (décisions D-100 à D-169). Version mineure : tout est nouveau ou facultatif, rien ne casse.

### Ajouté
- `Button` : bouton à texte avec icône facultative au début (D-100, D-106). Variantes `primary` monochrome (D-102), `secondary` par défaut sur fond `--field` (D-103), `subtle`, `danger` en rouge plein (D-104). Tailles `md` et `sm` (D-101). Chargement `isPending` : roue, libellé gardé (D-105). Options `type`, `form`, `aria-label`, `autoFocus`.
- `IconButton` : option facultative `isPending` (chargement, par exemple « Actualiser ») (D-107).
- Tokens `--btn-h-sm` (26 px web, 24 px desktop) et `--danger-fg` (D-101, D-104).
- Libellé interne `loading` (« Chargement… », partagé par Button, IconButton et Skeleton) dans le dictionnaire `messages`.
- Modèle `Action` et `ActionBar` : une app décrit ses actions par des données ; la zone (`topbar`, `header`, `toolbar`, `section`, `row`, `empty`) décide de leur forme : bouton à texte, bouton-icône ou entrée du menu « … » (D-110 à D-114, D-117). Action `danger` dans « … », en dernier, toujours confirmée (D-115). Attente pendant la promesse de `onPress`, erreur rendue à `onError`, réussite à `onDone` (D-116, D-118). La règle seule est exportée : `arrangeActions`.
- Libellés internes `moreActions` (« Plus d'actions ») et `confirmQuestion` (« {label} ? »).
- Règles de mise en page : section « Actions » dans `docs/layout-rules.md` (D-111).
- `StatusBadge` (point et libellé, sans fond) et `StatusDot` (point seul, nom obligatoire, info-bulle) ; six tons, dont `pending` à point creux (D-160 à D-162). Type `StatusTone`.
- `Avatar` : image ou initiales sur fond neutre, 24, 32 ou 40 px ; les initiales remplacent une image en erreur (D-163).
- `ProgressBar` : rail de 4 px, libellé au-dessus, valeur à droite, tons `warning` et `danger`, mode indéterminé (D-164).
- `Skeleton` et `SkeletonGroup` : formes immobiles, groupe nommé « Chargement… », affiché après 200 ms (D-165).
- `EmptyState` : icône de 32 px, titre, phrase, action principale ; taille `compact` (D-166).
- `Link` : toujours souligné ; lien externe avec flèche et texte caché ; bouton d'apparence lien sans `href` (D-167).
- `Code` (en ligne ou en bloc) et `Divider` (horizontal ou vertical) (D-168).
- `ComboBox` : champ de formulaire qui propose une liste de choix pendant la saisie. Un seul composant : choix simple ou multiple (`selectionMode`), source locale (`items`) ou asynchrone (`loadItems(texte, signal)`) (D-140).
- Choix multiple en étiquettes, toutes visibles, avec retour à la ligne (D-143) ; élément choisi coché, liste ouverte (D-144).
- Valeur libre facultative : `allowsCustomValue` et `onCreate` (D-142).
- Source asynchrone : 2 caractères, 300 ms, attente et erreur comme `SearchField` (D-145) ; éléments avec icône, description et sections facultatives (D-146).
- Options communes des champs, avec les pièces internes de `Field` : `hideLabel`, `description`, `isRequired`, `validate`, `error`, `isDisabled`, `isReadOnly`, `width`, `name` (D-130 à D-133).
- Libellés ajoutés au dictionnaire `messages` : `showChoices`, `chosenItems`, `removeItem`, `addValue`, `typeMoreChars`, `resultsUnavailable`, `noResults`.
- Règle de choix entre `ComboBox`, `SearchField`, `Select` et filtres de la `toolbar` (D-141), reportée dans la spec `SearchField`.
- Libellés `codeSample` et `progressOf` dans le dictionnaire `messages` (D-089).
- Notifications (D-150 à D-158) : file `createNotifications({ initial?, onChange? })`, passée à `SocleProvider` par l'option facultative `notifications` ; `notify()` sur la file ou par `useNotify()` ; `useNotifications()`. Toasts sur le Toast de React Aria, sans sonner (D-150) : carte neutre (D-151), quatre tons (D-152), 5 s, 8 s avec action, erreur jusqu'à fermeture, pause au survol, au focus et fenêtre inactive (D-153), trois visibles en bas à droite (D-154), une action au plus (D-155). Pattern `NotificationCenter` pour la barre du haut d'`AppShell` : cloche, pastille de non-lus « 9+ », panneau groupé par jour, « Tout effacer », 100 notifications en mémoire (D-156 à D-158).
- Libellés internes des notifications dans le dictionnaire `messages` (`notifications`, `closeNotification`, `toneSuccess`…).
- Règle de placement « Messages » (D-159) : pas de bandeau pleine largeur ; un état durable de la page va dans la barre du haut (docs/layout-rules.md).
- `Dialog` : modale avec titre, description, corps et pied d'actions. Tailles `sm`, `md` (défaut), `lg`, `xl` (corps sans marge, pour SettingsPage) (D-120) ; centrée ou plein écran sur mobile (D-121). Échap, × et clic hors ferment, sauf clic hors après une saisie (rebond) et action en cours `isBusy` (D-122). Traits seulement quand le corps défile (D-123). Focus sur le premier champ, rendu au déclencheur (D-125).
- `useConfirm` : `await confirm({ title, message, confirmLabel, tone, onConfirm })` rend `true` ou `false`. Sans × ni icône (D-126), affichée par `SocleProvider` (D-127), action longue avec chargement et erreur sur place (D-128). Même ordre des boutons partout : « Annuler », puis l'action (D-124).
- Token `--dlg-pad` (20 px web, 16 px desktop). Libellés internes `close`, `cancel` et `actionFailed`.
- Champs de formulaire (D-130 à D-138) : `TextField`, `TextArea`, `Select`, `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch`, `Fieldset`. Libellé au-dessus, aide ou erreur en dessous (D-022) ; cadre `--surface` et bord `--line-strong` (D-130) ; lecture seule en cadre gris avec cadenas (D-131) ; vérification par le composant (`isRequired`, `validate`), affichée en quittant un champ modifié ou à l'envoi, et erreur imposée par l'app (`error`) (D-132) ; cinq largeurs `width` et `TextArea` qui grandit de 3 à 10 lignes (D-133) ; `Select` en liste flottante au style du Menu (D-134).
- Anatomie commune interne `Field` (non exportée), reprise par `ComboBox`.
- Libellés du dictionnaire : `optional`, `requiredField`, `requiredChoice`, `requiredCheckbox`, `requiredGroup`, `invalidEmail`, `invalidUrl`, `invalidValue`, `choose`, `charCount` (D-089).
- Règles de placement : interrupteur ou case (D-137), champs (docs/layout-rules.md).

### Modifié
- `List` affiche son statut avec `StatusBadge` ; `ListItemData.status.tone` accepte aussi `pending` (D-169).
- `List` et `Table` dessinent leurs squelettes avec `Skeleton` et leurs messages centrés avec `EmptyState`, sans changement de rendu ; le groupe de squelettes est désormais annoncé « Chargement… » (D-169).
- `Sidebar.Account` dessine l'avatar par défaut avec `Avatar`, masqué aux lecteurs d'écran (le nom est écrit à côté). Les initiales prennent le premier et le dernier mot du nom, au lieu des deux premiers (D-163, D-169).
- `PropertyRow` (`action type "switch"`) utilise le composant `Switch` (D-136). Même rendu, même API.

### Corrigé
- Interrupteur du panneau de détail : la pastille blanche n'apparaissait pas (`bg-white` n'existe pas dans le thème Socle).

## [0.1.0] — 2026-11-22

Première version de Socle, issue de l'init (décisions D-001 à D-089, dans docs/decisions.md).

### Ajouté (P9 — DetailPanel déclaratif)
- `SocleProvider` (D-029) : accent (refusé s'il ne passe pas AA), densité par défaut, plateforme, préfixe des données mémorisées ; choix de l'utilisateur pour le mode et la densité (D-005).
- Libellés internes traduisibles : dictionnaire `messages` de `SocleProvider`, en français par défaut ; `frenchMessages` et le type `SocleMessages` sont exportés (D-089).
- Composants : `Tooltip`, `IconButton`, `Menu`, `Tabs`, `Table`, `List`, `SearchField`.
- Patterns : `AppShell`, `Sidebar`, `DetailPanel`.
- Icônes internes, non exportées (D-028) ; aucune dépendance à Lucide, tailwind-variants ou tailwind-merge.
- Nouveaux tokens : `--tip-*` (D-030), `--icon-btn` (D-035), `--line-strong` et `--tree-line` (D-042, D-073) ; base d'espacement fixe de 4 px.
- Classes de remise à zéro `socle-btn` et `socle-box`, dans la couche `base` de `styles.css`, sans reset global (D-010).
- Documentation pour l'IA livrée avec le package, générée au build : `ai/AI.md` (règles, mise en place, exports et options), `ai/specs/`, `ai/docs/`. Le bloc `CLAUDE.md` des apps y renvoie (docs/claude-md-app.md).
- Stories et tests d'interaction (`play`) pour chaque composant : 75 tests dans Chromium.

### Corrigé
- Tokens sombres de l'info-bulle et du trait des enfants : ils sont aussi appliqués quand l'utilisateur choisit le mode sombre (`data-theme="dark"`), pas seulement le mode du système.

### Fondations
- Tokens du jeu « neutre pur » (D-012) : couleurs par rôle en clair et en sombre, typographie, espacements, rayons, ombres, mouvement (D-014), deux densités (D-004).
- `socle-ui/styles.css` (feuille compilée) et `socle-ui/theme.css` (thème Tailwind) (D-010).
- `socle-ui/eslint-config` et `socle-check-css` : garde-fous pour les apps.
- Storybook : Fondations, Composants, Patterns, Gabarits, Règles ; sélecteurs de mode et de densité.

### Pas encore inclus
- Composants prévus mais non spécifiés : `Button`, `TextField`, `Select`, `Checkbox`, `Switch` (une version interne sert au panneau de détail), `Badge`, `Dialog`, `Popover`, `SettingRow`, palette de commandes (Mod+K).
- Gabarits : `ListPage`, `DetailPage`, `FormPage`, `SettingsPage` (zones décidées dans docs/layout-rules.md, à spécifier avec `define`).
