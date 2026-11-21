# Mode `init`

Crée le design system de zéro, en 7 étapes, avec une validation visuelle aux étapes qui le demandent (`../references/validation.md`).

## Options

- `--resume` : reprend à l'étape en cours.
- `--step <n>` : revient sur une étape.
- `--from <chemin-app>` : analyse une app existante et pré-remplit les étapes 1 à 5 avec ce qu'elle fait déjà, en le présentant comme une proposition, pas comme un acquis.

## Suivi de progression

Au démarrage, crée `init-progress.md` :

```
# Init du design system
Étape en cours : <n> — <nom>
## Étapes
- [x] 1. Contexte — validé le <date>
- [ ] 2. Principes
...
## Questions ouvertes
- <question> (étape <n>)
```

Mets-le à jour à chaque réponse. Avec `--resume`, lis-le, résume en trois lignes où on en est, et reprends à la question suivante.

À n'importe quelle étape, si l'utilisateur cite un élément d'une autre application, lance `inspire` (`inspire.md`) puis reviens à l'étape.

## Étape 1 — Contexte

Questions : types d'apps (web, desktop Tauri, les deux), utilisateurs et usage (saisie intensive, consultation…), apps existantes à analyser, inspirations (URL, captures), contraintes (accessibilité, langues, marque imposée ou non).

Sortie : section « Contexte » de `docs/principles.md`. Pas de page de validation, un résumé à confirmer suffit.

## Étape 2 — Principes

Questions : densité générale, ton visuel (sobre, chaleureux, technique…), clair et/ou sombre, niveau d'accessibilité visé, rapport clavier/souris, règles de réduction des clics.

Sortie : `docs/principles.md`. Page de validation `02-principes.html` : le même écran rendu selon 2 ou 3 directions.

## Étape 3 — Base technique

Décisions : librairie headless pour les comportements et l'accessibilité (recommande Radix ou React Aria, n'en impose aucune), méthode de style (variables CSS + CSS modules, Tailwind…), gestion des icônes (le composant reçoit un `ReactNode`, la librairie d'icônes reste libre).

Sortie : entrées dans `docs/decisions.md`. Pas de page de validation, sauf si l'utilisateur veut comparer des rendus.

## Étape 4 — Tokens

Propose 2 ou 3 jeux complets : palette (neutres, accent, sémantiques succès/alerte/erreur/info), typographie (familles, échelle), espacements, rayons, ombres, bordures, durées d'animation, et les deux densités web et desktop.

Sortie : page `04-tokens.html` (les jeux appliqués au même écran, avec bascules clair/sombre et web/desktop), puis `src/tokens/` une fois validé.

## Étape 5 — Mise en page

Définis l'`AppShell` (sidebar repliable, en-tête, zone de contenu) et les gabarits : `ListPage`, `DetailPage`, `FormPage`, `SettingsPage`. Pour chaque gabarit, ses zones nommées et ce qui va dans chacune. Pose les règles de comportement globales (état de la sidebar à l'ouverture, persistance, fenêtre étroite).

Sortie : page `05-layout.html` (chaque gabarit jouable), puis `docs/layout-rules.md`.

## Étape 6 — Squelette

Crée le dépôt selon la structure de `../references/context.md` :

- `package.json` du package, avec `index.ts` comme seul export ;
- Storybook, avec les sections Fondations, Composants, Patterns, Gabarits, Règles (où s'affichent `principles.md` et `layout-rules.md`) et les sélecteurs de thème et de mode ;
- les scripts `build`, `test` et `check`, et `eslint-config/`, selon `../assets/guardrails.md` ;
- `docs/checklist.md`, copie de `../assets/checklist.md` ;
- le modèle de bloc pour les apps, à partir de `../assets/claude-md-app.md` ;
- `CHANGELOG.md`.

Vérifie que Storybook démarre et que `build`, `test` et `check` passent.

## Étape 7 — Socle de composants et gabarits

Enchaîne `define` (`define.md`) sur, dans l'ordre :

1. `AppShell` et `Sidebar`, `MenuItem` ;
2. `Button`, `TextField`, `Select` ;
3. `SettingRow`, puis les gabarits `ListPage`, `DetailPage`, `FormPage`, `SettingsPage`.

Chaque gabarit est codé avec ses zones nommées en props et une story qui le montre rempli de données factices. Propose d'ajouter d'autres composants selon l'inventaire de l'étape 1.

À la fin : fixe la version à `0.1.0` dans `package.json` et `CHANGELOG.md`, supprime `init-progress.md` (son contenu est dans `docs/decisions.md`), et propose de choisir une app pilote pour `apply`.
