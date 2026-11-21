# Repérer le contexte

Avant tout mode, détermine où tu es.

- **Contexte « référence »** : le dossier courant contient `docs/principles.md` et `src/components/`, ou un `init-progress.md`. Tu es dans le dépôt `design-system`.
- **Contexte « app »** : le `CLAUDE.md` de l'app contient un bloc `## Design system` (modèle dans `../assets/claude-md-app.md`). Lis-y le chemin du dépôt de référence et lis la version de `@moi/ui` dans le `package.json` de l'app.
- **Aucun des deux** : si le mode est `init`, c'est normal. Sinon, demande le chemin du dépôt `design-system` et propose d'ajouter le bloc au `CLAUDE.md` de l'app.

En contexte app, lis toujours la spec **de la version installée** (le tag git correspondant dans le dépôt de référence, ou à défaut la branche principale en signalant l'écart).

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
  .storybook/
  CHANGELOG.md
  init-progress.md          ← uniquement pendant l'init
```

Une fois l'init faite, `docs/checklist.md` du dépôt fait foi : c'est lui qui s'enrichit, pas `assets/checklist.md`.
