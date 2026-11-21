# Mode `apply [app]`

Met une app en conformité avec le design.

## Options

- `--plan-only` : s'arrête au plan.
- `--scope …` et `--component <X>` : comme pour `audit`.

## Déroulé

1. Lance `audit` (`audit.md`) sur le périmètre demandé.
2. Présente un plan ordonné : par écran ou par composant, ce qui change, et les écarts qui demandent un `propose` (`propose.md`) plutôt qu'une correction.
3. Avec `--plan-only`, arrête-toi là.
4. Sinon, attends la validation du plan, puis applique-le par lots cohérents. Après chaque lot : build, tests, et vérification visuelle des écrans touchés.
5. Termine par un nouvel audit qui montre ce qui reste.
