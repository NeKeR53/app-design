# Changelog — socle-ui

Versions selon semver (règle 6 du skill design) : une nouvelle option facultative est une version mineure ; un changement qui casse l'existant est une version majeure, avec une note de migration.

## [Non publié]

### Ajouté (tableau dense, D-270 à D-277)
- `Table` : options facultatives pour un tableau dense, sans second composant (D-270).
  - `density="compact"` : lignes de 25 px, en-tête de 28 px (D-271).
  - `groupBy` et `defaultCollapsedGroups` : lignes de groupe en texte, repliables au clic, à Entrée et à Espace ; état mémorisé par tableau (D-272).
  - `rowDescription` : lignes doubles, précision sous le nom (D-273).
- Libellé interne `groupCount` (« n lignes ») dans le dictionnaire `messages`.

### Corrigé
- `Table` : une colonne déclarée sous 80 px garde sa largeur (D-274).
- `Table` : un en-tête coupé par « … » montre son libellé complet en info-bulle (D-275).

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

### Ajouté
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
