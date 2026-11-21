# Mode `review`

Remet toutes les specs au niveau de `docs/checklist.md`, typiquement après l'ajout d'une question à la grille.

## Options

- `--component <X>` : revoir un seul composant.

## Déroulé

1. Pour chaque spec (`src/components`, `src/patterns`, `src/templates`), liste les sections de la grille sans réponse.
2. Présente le tableau : composant × questions manquantes.
3. Propose de les traiter composant par composant avec `define --gaps` (`define.md`), en commençant par les plus utilisés.
