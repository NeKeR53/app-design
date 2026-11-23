# Changelog — socle-ui

Versions selon semver (règle 6 du skill design) : une nouvelle option facultative est une version mineure ; un changement qui casse l'existant est une version majeure, avec une note de migration.

## [Non publié]

### Ajouté
- Champs de formulaire (D-130 à D-138) : `TextField`, `TextArea`, `Select`, `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch`, `Fieldset`. Libellé au-dessus, aide ou erreur en dessous (D-022) ; cadre `--surface` et bord `--line-strong` (D-130) ; lecture seule en cadre gris avec cadenas (D-131) ; vérification par le composant (`isRequired`, `validate`), affichée en quittant un champ modifié ou à l'envoi, et erreur imposée par l'app (`error`) (D-132) ; cinq largeurs `width` et `TextArea` qui grandit de 3 à 10 lignes (D-133) ; `Select` en liste flottante au style du Menu (D-134).
- Anatomie commune interne `Field` (non exportée), reprise par `ComboBox`.
- Libellés du dictionnaire : `optional`, `requiredField`, `requiredChoice`, `requiredCheckbox`, `requiredGroup`, `invalidEmail`, `invalidUrl`, `invalidValue`, `choose`, `charCount` (D-089).
- Règles de placement : interrupteur ou case (D-137), champs (docs/layout-rules.md).

### Modifié
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
