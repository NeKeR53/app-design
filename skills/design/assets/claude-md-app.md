# Bloc à ajouter au `CLAUDE.md` de chaque app

Copie ce bloc dans le `CLAUDE.md` de l'app, en adaptant le chemin du dépôt de référence.

```
## Design system
- Dépôt de référence : ../design-system
- Package : @moi/ui (version : voir package.json)
- Skill : /design

Règles :
- Toute UI utilise uniquement les composants, gabarits et tokens de @moi/ui.
- Ne jamais créer un composant qui en remplace un existant, ni surcharger son style.
- Toute demande d'UI passe d'abord par /design check.
- Si la spec ne prévoit pas ce qui est demandé : répondre « Hors design », ne rien
  implémenter localement, et proposer /design propose.
- Placer les informations selon docs/layout-rules.md du dépôt de référence.
```
