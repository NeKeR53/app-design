# Bloc à ajouter au `CLAUDE.md` (ou `AGENTS.md`) de chaque app

Le mode `/design install` installe `socle-ui` et ajoute ce bloc tout seul. Pour le faire à la main, copiez-le dans le `CLAUDE.md` de l'app (Claude Code) et dans son `AGENTS.md` (Codex), en adaptant le chemin du dépôt de référence.

```
## Design system
- Package : socle-ui (version : voir package.json)
- Guide pour l'IA, à la version installée : node_modules/socle-ui/ai/AI.md
  (specs dans node_modules/socle-ui/ai/specs/, règles dans node_modules/socle-ui/ai/docs/,
  recettes de pages dans node_modules/socle-ui/ai/recipes/)
- Dépôt de référence, seulement pour faire évoluer le design : ../app-design/design-system
- Skill : /design

Règles :
- Avant d'écrire de l'UI, lire node_modules/socle-ui/ai/AI.md, puis la spec du composant utilisé.
- Avant d'écrire une page, partir de la recette la plus proche (node_modules/socle-ui/ai/recipes/).
- Toute UI utilise uniquement les composants, patterns et tokens de socle-ui.
- Ne jamais créer un composant qui en remplace un existant, ni surcharger son style.
- Toute demande d'UI passe d'abord par /design check.
- Si la spec ne prévoit pas ce qui est demandé : répondre « Hors design », ne rien
  implémenter localement, et proposer /design propose.
- Placer les informations selon node_modules/socle-ui/ai/docs/layout-rules.md.
```

Le dossier `ai/` est généré par `npm run build` (`scripts/build-ai-docs.js`) et livré avec le package : l'IA lit toujours la documentation de la version installée, même sans le dépôt de référence.

## Installer le package dans une app

Le mode `/design install` pose la question de la source :
- `npm` : le package est publié sur un registre (public ou privé) ; la CI de l'app peut l'installer.
- `yalc` : le dépôt de référence est sur la même machine et le package n'est pas publié. Marche à suivre : section « Installer dans une app par yalc » du [README](../README.md).
- `git` : un tag de version (`git+<url>#v<version>`).

Pas de `file:` ni de `npm link` : les liens symboliques font charger deux copies de React.

## Mise en place technique dans l'app

1. Styles, une seule fois à la racine : `import "socle-ui/styles.css";`
2. Racine de l'app : `<SocleProvider>` (accent, densité, plateforme, préfixe de mémorisation, libellés `messages`, thème d'organisation `theme`).
3. Avec Tailwind, dans le CSS principal de l'app :
   ```css
   @import "tailwindcss";
   @import "socle-ui/theme.css";
   ```
4. Garde-fous, selon le linter de l'app.
   - Avec Biome (2.6 ou plus récent), dans `biome.json` :
     ```json
     { "extends": ["socle-ui/biome"] }
     ```
     `biome lint` vérifie aussi le CSS : `socle-check-css` n'est pas utile. Une exception justifiée s'écrit `// biome-ignore lint/plugin: <raison>`.
   - Avec ESLint, dans `eslint.config.js` :
     ```js
     import socle from "socle-ui/eslint-config";
     export default [...socle /* , config de l'app */];
     ```
     Puis, pour le CSS de l'app : `npx socle-check-css "src/**/*.css"`.
