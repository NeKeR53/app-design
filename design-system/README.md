# Socle

Design system React partagé par les apps web et desktop (Tauri). Package : `socle-ui`.

| Commande | Rôle |
|---|---|
| `npm run dev` | Storybook sur http://localhost:6006 |
| `npm run build` | Librairie dans `dist/` (JS, types, `styles.css`, `theme.css`) |
| `npm run test` | Stories et fonctions `play` dans Chromium (Vitest) |
| `npm run check` | Structure (spec et stories par composant), version, config Biome, lint, types, tests |
| `npm run publish:local` | Build, puis copie du package dans le magasin yalc et dans chaque app qui l'utilise |

- Principes : [docs/principles.md](docs/principles.md)
- Où va une information : [docs/layout-rules.md](docs/layout-rules.md)
- Journal des décisions : [docs/decisions.md](docs/decisions.md)
- Intégrer Socle dans une app : [docs/claude-md-app.md](docs/claude-md-app.md)

Les composants ne se modifient que dans ce dépôt, via le skill `/design`.

## Installer dans une app par yalc

Le package n'est pas publié sur un registre : on le copie d'un dépôt à l'autre sur la même machine avec [yalc](https://github.com/wclr/yalc). Pas de `file:` vers ce dépôt ni de `npm link` : les liens symboliques font charger deux copies de React.

**Première installation**
1. Ici, dans `design-system/` : `npm install`, puis `npm run publish:local`. Le build part dans le magasin yalc de la machine (`~/.yalc`).
2. Dans l'app : `npx yalc add socle-ui`, puis l'installation habituelle (`pnpm install` ou `npm install`). yalc copie le package dans `.yalc/socle-ui` et écrit `"socle-ui": "file:.yalc/socle-ui"` dans le `package.json` de l'app.
3. Dans le `.gitignore` de l'app : `.yalc` et `yalc.lock`. Le `package.json` de l'app, lui, se commite avec la ligne `file:.yalc/socle-ui`.

**Après chaque changement du design system** : `npm run publish:local` ici. La commande met à jour le `.yalc` de chaque app qui a fait `yalc add`, puis y relance l'installation. Rien à faire dans l'app.

**Clone neuf de l'app** (autre dossier, autre machine) : `.yalc` est absent, donc l'installation échoue sur `file:.yalc/socle-ui`. Il faut d'abord remplir le magasin yalc, puis recréer la copie :
1. Cloner ce dépôt à côté de l'app (`../app-design`), puis, dans `design-system/` : `npm install` et `npm run publish:local`.
2. Dans l'app : `npx yalc add socle-ui`, puis l'installation habituelle.

La version installée se lit dans `node_modules/socle-ui/package.json` ; sa documentation pour l'IA, dans `node_modules/socle-ui/ai/AI.md`.

## Versions

- Semver : une option facultative nouvelle donne une version mineure ; un changement qui casse l'existant donne une version majeure, avec une note de migration dans `CHANGELOG.md`.
- Chaque version publiée a son tag git `v<version>` (`v0.1.0`, `v0.2.0`…) sur `main`.
- Pour une version : `version` dans `package.json`, `SOCLE_VERSION` dans `src/index.ts`, et l'entrée `## [Non publié]` du `CHANGELOG.md` renommée en `## [x.y.z] — AAAA-MM-JJ`. `npm run check` échoue si ces trois versions diffèrent.

## Garde-fous pour les apps

| Linter de l'app | Mise en place |
|---|---|
| Biome (2.6 ou plus récent) | `"extends": ["socle-ui/biome"]` dans `biome.json` : imports interdits, `style` et `className` sur un composant Socle, couleurs en dur dans le code et le CSS. |
| ESLint | `import socle from "socle-ui/eslint-config";` dans `eslint.config.js`, puis `npx socle-check-css "src/**/*.css"` pour le CSS. |

Détail et limites : [docs/claude-md-app.md](docs/claude-md-app.md) et décisions D-330 à D-333.
