# Garde-fous techniques

À mettre en place pendant l'étape 6 de l'init, et à vérifier pendant `audit`.

## Dans le package

- **API fermée** : pas de `className` ni de `style` dans les props publiques ; variantes et options en unions TypeScript. Une option non prévue provoque une erreur de compilation.
- **Export unique** : `index.ts` est le seul point d'entrée ; les chemins internes ne sont pas exportés dans `package.json` (champ `exports`).

## `eslint-config` partagée pour les apps

- `no-restricted-imports` sur la librairie headless et les chemins internes de `@moi/ui` ;
- interdiction des attributs `style` inline sur les composants de `@moi/ui` ;
- interdiction des couleurs en dur (hex, rgb, hsl) dans le code et le CSS des apps.

## Config Biome partagée pour les apps

Pour une app qui lint avec Biome (2.6 ou plus récent) : une config `biome.json` livrée dans le package (export `@moi/ui/biome`), que l'app étend par `"extends": ["@moi/ui/biome"]`. Mêmes règles que l'`eslint-config` : `noRestrictedImports`, puis des plugins GritQL (déclarés avec `resolutionKind: "config"`) pour `style` et `className` sur les composants du package (reconnus par leur nom, liste générée depuis les exports) et pour les couleurs en dur dans le code et le CSS. Le script `check` teste cette config sur des fichiers d'exemple.

## Script `check` du dépôt de référence

Il échoue si :
- un composant, pattern ou gabarit n'a pas de `.spec.md` ou de `.stories.tsx` ;
- une spec en statut « validé » a des questions ouvertes ;
- une fonction `play` échoue.

## Versions

- Semver strict, selon la règle 6 de `SKILL.md`.
- Chaque changement met à jour la version dans `package.json` et ajoute une entrée à `CHANGELOG.md`.
- Le script `check` échoue si la version de `package.json` diffère de celle de la dernière entrée datée de `CHANGELOG.md`.
- Chaque version publiée a son tag git `v<version>`.
