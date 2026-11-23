# Changelog — socle-ui

Versions selon semver (règle 6 du skill design) : une nouvelle option facultative est une version mineure ; un changement qui casse l'existant est une version majeure, avec une note de migration.

## [Non publié]

### Ajouté
- `Button` : bouton à texte avec icône facultative au début (D-100, D-106). Variantes `primary` monochrome (D-102), `secondary` par défaut sur fond `--field` (D-103), `subtle`, `danger` en rouge plein (D-104). Tailles `md` et `sm` (D-101). Chargement `isPending` : roue, libellé gardé (D-105). Options `type`, `form`, `aria-label`, `autoFocus`.
- `IconButton` : option facultative `isPending` (chargement, par exemple « Actualiser ») (D-107).
- Tokens `--btn-h-sm` (26 px web, 24 px desktop) et `--danger-fg` (D-101, D-104).
- Libellé interne `loading` (« Chargement ») dans le dictionnaire `messages`.

### Ajouté — petits éléments d'affichage (D-160 à D-169)
- `StatusBadge` (point et libellé, sans fond) et `StatusDot` (point seul, nom obligatoire, info-bulle) ; six tons, dont `pending` à point creux (D-160 à D-162). Type `StatusTone`.
- `Avatar` : image ou initiales sur fond neutre, 24, 32 ou 40 px ; les initiales remplacent une image en erreur (D-163).
- `ProgressBar` : rail de 4 px, libellé au-dessus, valeur à droite, tons `warning` et `danger`, mode indéterminé (D-164).
- `Skeleton` et `SkeletonGroup` : formes immobiles, groupe nommé « Chargement… », affiché après 200 ms (D-165).
- `EmptyState` : icône de 32 px, titre, phrase, action principale ; taille `compact` (D-166).
- `Link` : toujours souligné ; lien externe avec flèche et texte caché ; bouton d'apparence lien sans `href` (D-167).
- `Code` (en ligne ou en bloc) et `Divider` (horizontal ou vertical) (D-168).
- Libellés `loading`, `codeSample` et `progressOf` dans le dictionnaire `messages` (D-089).

### Modifié
- `List` affiche son statut avec `StatusBadge` ; `ListItemData.status.tone` accepte aussi `pending` (D-169).
- `List` et `Table` dessinent leurs squelettes avec `Skeleton` et leurs messages centrés avec `EmptyState`, sans changement de rendu ; le groupe de squelettes est désormais annoncé « Chargement… » (D-169).
- `Sidebar.Account` dessine l'avatar par défaut avec `Avatar`, masqué aux lecteurs d'écran (le nom est écrit à côté). Les initiales prennent le premier et le dernier mot du nom, au lieu des deux premiers (D-163, D-169).

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
