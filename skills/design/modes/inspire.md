# Mode `inspire <source> "<élément>"`

Observe un élément d'une autre application et en tire une proposition.

## Options

- `--for <Composant>` : applique l'inspiration à un composant existant au lieu d'en créer un.

## Observer

- **Source web** : ouvre la page dans un navigateur. Inspecte la structure de l'élément et teste-le réellement : clic, survol, focus, clavier (Tab, flèches, Échap, Entrée), repli, fenêtre étroite. Capture chaque état.
- **Source desktop** : travaille à partir des captures ou de la vidéo fournies. Si le contrôle de l'ordinateur est disponible et que l'utilisateur l'accepte, manipule l'app de la même façon.

## Ce que tu reprends, et ce que tu ne reprends pas

- **Tu reprends** : l'anatomie, les états, les options, le comportement, le placement.
- **Tu ne reprends jamais** : le code, les images, les icônes, les textes, les couleurs et l'identité de marque. Le rendu se fait avec les tokens du design system.

## Produire

1. Remplis la grille (`docs/checklist.md`) en marquant chaque réponse `observé` (constaté pendant le test) ou `supposé` (déduit sans pouvoir le vérifier).
2. Fais une page de validation (`../references/validation.md`) qui montre l'élément d'origine (captures) à côté de la proposition rendue avec les tokens.
3. Enchaîne sur `define` (`define.md`), qui ne pose que les questions `supposé` ou sans réponse.
