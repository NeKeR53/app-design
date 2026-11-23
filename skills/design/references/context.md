# Repérer le contexte

Avant tout mode, détermine où tu es.

- **Contexte « référence »** : le dossier courant contient `docs/principles.md` et `src/components/`, ou un `init-progress.md`. Tu es dans le dépôt `design-system`.
- **Contexte « app »** : le `CLAUDE.md` (ou l'`AGENTS.md`) de l'app contient un bloc `## Design system` (modèle dans `../assets/claude-md-app.md`). Lis-y le chemin du dépôt de référence et lis la version de `@moi/ui` dans le `package.json` de l'app.
- **Aucun des deux** : si le mode est `init`, c'est normal. Si `@moi/ui` n'est pas installé dans l'app, propose `install` (`../modes/install.md`). S'il est installé sans bloc, propose d'ajouter le bloc (étape 6 de `install`).

En contexte app, lis toujours la documentation **de la version installée**, dans cet ordre :
1. `node_modules/@moi/ui/ai/` : `AI.md` (point d'entrée), `specs/<X>.md`, `docs/layout-rules.md`, `docs/principles.md`, `docs/decisions.md`. Elle est livrée avec le package, donc toujours à la bonne version, même sans le dépôt de référence.
2. À défaut, le tag git de la version dans le dépôt de référence, ou la branche principale en signalant l'écart.

Le dépôt de référence reste nécessaire pour faire évoluer le design (`propose`, `define`) : on ne modifie jamais `node_modules`.

## Structure du dépôt de référence

```
design-system/
  package.json              ← package @moi/ui
  src/
    tokens/base.css         ← variables CSS par défaut
    tokens/themes/web.css   ← densité confortable
    tokens/themes/desktop.css ← densité compacte
    components/<X>/         ← <X>.tsx, <X>.spec.md, <X>.stories.tsx
    patterns/<X>/           ← même structure
    templates/<X>/          ← gabarits de page, même structure
    index.ts                ← seul point d'export public
  docs/
    principles.md
    layout-rules.md         ← « où va une information »
    decisions.md            ← journal des décisions
    checklist.md            ← grille de questions (copie de assets/checklist.md au départ)
    validation/             ← pages HTML de validation archivées
  eslint-config/            ← règles partagées pour les apps
  scripts/build-ai-docs.js  ← génère ai/ au build
  ai/                       ← documentation pour l'IA, générée et livrée avec le package (AI.md, specs/, docs/)
  .storybook/
  CHANGELOG.md
  init-progress.md          ← uniquement pendant l'init
```

Une fois l'init faite, `docs/checklist.md` du dépôt fait foi : c'est lui qui s'enrichit, pas `assets/checklist.md`.
