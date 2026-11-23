# Socle

Design system React partagé par les apps web et desktop (Tauri). Package : `socle-ui`.

| Commande | Rôle |
|---|---|
| `npm run dev` | Storybook sur http://localhost:6006 |
| `npm run build` | Librairie dans `dist/` (JS, types, `styles.css`, `theme.css`) |
| `npm run test` | Stories et fonctions `play` dans Chromium (Vitest) |
| `npm run check` | Structure (spec et stories par composant), lint, types, tests |

- Principes : [docs/principles.md](docs/principles.md)
- Où va une information : [docs/layout-rules.md](docs/layout-rules.md)
- Journal des décisions : [docs/decisions.md](docs/decisions.md)
- Intégrer Socle dans une app : [docs/claude-md-app.md](docs/claude-md-app.md)

Les composants ne se modifient que dans ce dépôt, via le skill `/design`.
