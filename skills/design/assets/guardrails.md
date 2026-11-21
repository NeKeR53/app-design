# Garde-fous techniques

À mettre en place pendant l'étape 6 de l'init, et à vérifier pendant `audit`.

## Dans le package

- **API fermée** : pas de `className` ni de `style` dans les props publiques ; variantes et options en unions TypeScript. Une option non prévue provoque une erreur de compilation.
- **Export unique** : `index.ts` est le seul point d'entrée ; les chemins internes ne sont pas exportés dans `package.json` (champ `exports`).

## `eslint-config` partagée pour les apps

- `no-restricted-imports` sur la librairie headless et les chemins internes de `@moi/ui` ;
- interdiction des attributs `style` inline sur les composants de `@moi/ui` ;
- interdiction des couleurs en dur (hex, rgb, hsl) dans le code et le CSS des apps.

## Script `check` du dépôt de référence

Il échoue si :
- un composant, pattern ou gabarit n'a pas de `.spec.md` ou de `.stories.tsx` ;
- une spec en statut « validé » a des questions ouvertes ;
- une fonction `play` échoue.

## Versions

- Semver strict, selon la règle 6 de `SKILL.md`.
- Chaque changement met à jour la version dans `package.json` et ajoute une entrée à `CHANGELOG.md`.
