# Bloc à ajouter au `CLAUDE.md` et à l'`AGENTS.md` de chaque app

Le mode `install` ajoute ce bloc tout seul. Sinon, copie-le dans le `CLAUDE.md` de l'app (Claude Code) et dans son `AGENTS.md` (Codex), en adaptant le nom du package et le chemin du dépôt de référence. Le dépôt de référence en garde une copie à jour dans `docs/claude-md-app.md`, qui fait foi.

```
## Design system
- Package : @moi/ui (version : voir package.json)
- Guide pour l'IA, à la version installée : node_modules/@moi/ui/ai/AI.md
  (specs dans node_modules/@moi/ui/ai/specs/, règles dans node_modules/@moi/ui/ai/docs/)
- Dépôt de référence, seulement pour faire évoluer le design : ../design-system
- Skill : /design

Règles :
- Avant d'écrire de l'UI, lire node_modules/@moi/ui/ai/AI.md, puis la spec du composant utilisé.
- Toute UI utilise uniquement les composants, gabarits et tokens de @moi/ui.
- Ne jamais créer un composant qui en remplace un existant, ni surcharger son style.
- Toute demande d'UI passe d'abord par /design check.
- Si la spec ne prévoit pas ce qui est demandé : répondre « Hors design », ne rien
  implémenter localement, et proposer /design propose.
- Placer les informations selon node_modules/@moi/ui/ai/docs/layout-rules.md.
```
