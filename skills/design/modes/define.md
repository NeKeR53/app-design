# Mode `define <Composant>`

Spécifie un composant, un pattern ou un gabarit, nouveau ou existant.

## Options

- `--gaps` : ne traite que les sections de la spec sans réponse.

## Déroulé

1. Lis `docs/checklist.md`, `docs/principles.md`, `docs/layout-rules.md`, les décisions qui s'appliquent et la spec existante si elle existe.
2. Si une inspiration est fournie (ou vient d'`inspire`), pars de la grille pré-remplie.
3. Pour chaque section de la grille encore vide, propose une réponse cohérente avec le reste du design. Regroupe tes propositions dans la page de validation (`../references/validation.md`), puis pose les questions **une à la fois**, en commençant par celles qui changent le plus le rendu.
4. Écris chaque réponse dans `<X>.spec.md` (modèle : `../assets/spec-template.md`) au fur et à mesure, et chaque décision dans `docs/decisions.md` (`../references/decisions.md`). Ce que l'utilisateur veut laisser en suspens va dans « Questions ouvertes ».
5. Quand il ne reste aucune question ouverte et que la page est validée : code le composant, ses stories (une par état et option, une `play` par règle de comportement) et ses tests, et exporte-le dans `index.ts`.
6. L'API suit la spec à la lettre : une prop par option prévue, des unions de chaînes pour les variantes, pas de `className` ni de `style` libres, des slots typés seulement là où la spec prévoit une zone libre.
7. Si un cas apparaît qui n'est couvert par aucune question de la grille, ajoute la question à `docs/checklist.md` et propose `review` (`review.md`).
