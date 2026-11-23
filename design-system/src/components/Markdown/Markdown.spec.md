# Markdown
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/Markdown-v1.html (par délégation de l'utilisateur, 2026-11-23)
Import : `import { Markdown } from "socle-ui/markdown";` (sous-entrée, D-300)
Dépendances facultatives à installer par l'app : `react-markdown` (10), `remark-gfm` (4).

## Rôle
Afficher un texte écrit en Markdown (GFM) avec la typographie de Socle : note, description, message, compte rendu, fichier README.
Ne pas l'utiliser pour :
- un texte court sans mise en forme : un simple paragraphe ;
- saisir du Markdown : prendre `MarkdownEditor` ;
- un tableau de données à trier ou sélectionner : prendre `Table`.

## Anatomie
Une colonne de blocs, sans cadre ni fond :
1. titres (`#` à `######`) ;
2. paragraphes, avec **gras**, _italique_, ~~barré~~, `Code` en ligne, `Link` ;
3. listes à puces, numérotées, imbriquées ; listes de tâches à cases statiques ;
4. citations ;
5. blocs de code (`Code block`) avec « Copier le bloc » ;
6. tableaux ;
7. traits (`Divider`) ;
8. images, seulement par `renderImage` (sinon un lien).

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `children` | `string` | — (obligatoire) | Texte Markdown. |
| `headingLevel` | `1 … 6` | `2` | Niveau HTML de `#` (D-302). |
| `onLinkPress` | `(href: string) => void` | — | Reçoit chaque lien et annule la navigation du navigateur (D-303). |
| `renderImage` | `(src: string, alt: string) => ReactNode` | — | Affiche une image. Sans lui, l'image devient un lien (D-303). |
| `renderCode` | `(language: string, text: string) => ReactNode \| undefined` | — | Rendu propre d'un bloc d'un langage (un schéma) ; `undefined` garde le bloc (D-304). |

## Exclus
- Pas de HTML brut : il est ignoré (D-303).
- Pas d'extension remark ou rehype, pas de `renderLink`, pas de coloration syntaxique (D-304, D-309).
- Pas de `className`, pas de `style`.

## États
| État | Aspect |
|---|---|
| Par défaut | Texte `--fg`, interligne 1,6 (D-301). |
| Survol d'un lien | Soulignement de 2 px (D-167). |
| Focus | Anneau `--accent` sur un lien, un bloc de code, un tableau ou le bouton « Copier le bloc ». |
| Bloc copié | Coche, libellé « Bloc copié » pendant 2 s ; échec : « Copie impossible » (D-304). |
| Vide | Rien n'est rendu. L'app affiche son état vide (`EmptyState`) si besoin. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Titres, listes, citation, code, tableau, trait au style de D-301 | verrouillé | `Document` |
| `headingLevel` règle le niveau HTML, pas la taille (D-302) | par page | `NiveauDesTitres` |
| Lien : `Link`, externe avec flèche ; `onLinkPress` reçoit l'adresse sans naviguer (D-303) | par page | `Liens` |
| Adresse `javascript:` retirée ; HTML ignoré (D-303) | verrouillé | `Securite` |
| Image : lien sans `renderImage`, rendu de l'app avec (D-303) | par page | `Images` |
| « Copier le bloc » : copie sans le retour final, coche 2 s (D-304) | verrouillé | `CopierLeBloc` |
| `renderCode` remplace un bloc d'un langage (D-304) | par page | `RenduDeCode` |
| Tableau statique, région « Tableau », alignement GFM (D-304) | verrouillé | `Tableau` |
| Cases de tâches statiques, « Fait » ou « À faire » (D-304) | verrouillé | `Taches` |

## Contenu
- Mot très long ou adresse longue : coupé n'importe où (`overflow-wrap: anywhere`).
- Bloc de code et tableau larges : défilent seuls à l'horizontale, jamais la page.
- Lien sans texte : l'adresse sert de texte (comportement de GFM).
- Image sans texte alternatif : « Image ».

## Densité
Texte en `--fs-md` : 14 px web, 13 px desktop. Les écarts sont fixes.

## Clavier
Tab passe d'un lien à l'autre, puis aux blocs de code et aux tableaux (régions qui défilent aux flèches, WCAG 2.1.1), et au bouton « Copier le bloc ».

## Accessibilité
- Titres de vrais niveaux HTML, réglés par `headingLevel`.
- Bloc de code : région « Extrait de code » ; tableau : région « Tableau ».
- Case de tâche : `role="img"` nommé « Fait » ou « À faire ».
- Lien externe : texte caché « S'ouvre dans le navigateur » (D-167).
- Contrastes : `--fg-2` et `--accent-text` sur `--surface` : AA.

## Taille d'écran
Le texte se replie. Blocs de code et tableaux défilent dans leur largeur.

## Erreurs
Un Markdown mal formé s'affiche comme du texte (règle de GFM). Copie impossible : libellé « Copie impossible ».

## Niveau de réglage
Typographie verrouillée. `headingLevel`, `onLinkPress`, `renderImage`, `renderCode` : par page.

## Placement
Corps d'une `DetailPage`, section du `DetailPanel`, corps d'une `Dialog`, message d'une liste, aperçu de `MarkdownEditor`. Jamais dans une barre (`toolbar`, `topbar`) ni dans une cellule de `Table`.

## Composition
Contient `Link`, `Code`, `Divider`, `IconButton`. Ne contient pas de `Table` (D-304) ni de `Checkbox`.

## Décisions
D-089, D-167, D-168, D-300, D-301, D-302, D-303, D-304

## Questions ouvertes
Aucune.
