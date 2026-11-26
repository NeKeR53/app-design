# SourceList
Statut : validé (2026-11-26, par délégation de l'utilisateur) — Version : depuis 1.21.0
Validation : docs/validation/components/Recettes-v1.html (question 2)

## Rôle
`SourceList` montre les sources citées par une réponse : une puce numérotée par source, sous la réponse. Un clic ouvre la source : le document à la bonne page, la page web citée, l'élément de l'app (D-411).

Ne pas l'utiliser pour :
- une pièce jointe d'un message, avant ou après l'envoi : `AttachmentChip`, `ImageThumbnail` ;
- des étiquettes ou des filtres : `TagGroup` ;
- une liste de documents à parcourir : `ListPage`, `List`.

## Anatomie
1. **Libellé** (obligatoire) : « Sources », `--fs-sm`, `--fg-3`, devant les puces, sur la première ligne.
2. **Puces** (une par source), en ligne, 6 px d'écart, elles passent à la ligne :
   - hauteur 28 px, rayon 8 px (D-040), trait `--line`, fond `--surface-side` ;
   - numéro : carré de 18 px, rayon 4 px, fond `--surface`, `--fs-xs`, `--fg-2`, chiffres tabulaires ;
   - titre : `--fs-sm`, `--fg`, coupé par « … » ;
   - détail (facultatif) : `--fs-sm`, `--fg-3`, jamais coupé (« p. 12 ») ;
   - largeur : 320 px au plus, et jamais plus large que la place.
3. **Info-bulle** (puce cliquable) : titre entier et détail, puis le passage cité entre guillemets, en seconde ligne.

## Variantes
Aucune. Sans `onOpen`, les puces se lisent sans être cliquables.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `sources` | `SourceItem[]` | — (obligatoire) | Les sources, dans l'ordre où la réponse les cite : la première porte le numéro 1. Vide : rien n'est rendu. |
| `onOpen` | `(source, index) => void` | aucun | Ouvre la source. Sans lui, les puces ne sont pas cliquables. |
| `currentId` | `string \| null` | aucun | Source montrée en ce moment (panneau de détail) : puce marquée. |
| `label` | `string` | « Sources » (i18n) | Libellé devant les puces, nom de la liste. |

`SourceItem` : `id` (obligatoire, stable), `title` (obligatoire : titre du document ou de la page), `detail` (où dans la source : « p. 12 », « § 3 »), `excerpt` (passage cité, en info-bulle ; coupé au-delà de 200 caractères).

## Exclus
- Pas d'icône par source, pas d'aperçu en vignette : la puce reste courte ; le document s'ouvre en entier.
- Pas de « + N » : une réponse cite peu de sources, toutes visibles.
- Pas de retrait (×), pas de sélection multiple.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Fond `--surface-side`, trait `--line`. |
| Survol | Fond `--hover`. |
| Pression | Fond `--selected`. |
| Focus clavier | Anneau `--focus` de 2 px. |
| Source courante (`currentId`) | Fond `--selected`, trait `--line-strong`, `aria-current="true"`. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Numéro = rang dans `sources`, à partir de 1 (D-411) | verrouillé | `ParDefaut` |
| Un clic ou Entrée appelle `onOpen` avec la source et son rang (D-411) | verrouillé | `ParDefaut` |
| La source courante est marquée (D-411) | réglable (`currentId`) | `SourceCourante` |
| Info-bulle : titre entier, détail, passage cité (D-411) | verrouillé | `PassageEnInfoBulle` |
| Titre coupé, puce de 320 px au plus, détail visible | verrouillé | `TitreLong` |
| Les puces passent à la ligne | verrouillé | `Etroite` |
| Sans `onOpen` : puces non cliquables | réglable | `SansOuverture` |

## Contenu
- Titre : le nom du document tel que l'utilisateur le connaît, sans extension (« Guide des drivers LED », pas « guide_drivers_v3.pdf »).
- Détail : court, avec l'abréviation de la langue (« p. 12 »).
- Dans le texte de la réponse, l'app cite chaque source par son numéro entre crochets, écrit en lien Markdown (`[1](#source-1)`) ; `onLinkPress` de `Markdown` ouvre la même source que la puce.

## Densité
Mêmes tailles dans les deux densités.

## Clavier
Chaque puce cliquable est un bouton : Tab passe de l'une à l'autre, Entrée ou Espace ouvre la source. Le focus montre l'info-bulle.

## Accessibilité
- Liste `ul` nommée par le libellé (« Sources »).
- Chaque puce est nommée « Source n : titre, détail » ; le numéro visible est caché au lecteur d'écran, qui le lit dans le nom.
- Source courante : `aria-current="true"`.
- Libellés dans le dictionnaire `messages` (D-089).

## Taille d'écran
Les puces passent à la ligne ; sur un écran étroit, une puce prend au plus la largeur disponible.

## Erreurs
Aucune : une source qui ne s'ouvre plus (document supprimé) se dit là où elle s'ouvre (panneau de détail, état « introuvable »).

## Placement
Sous la réponse, dans le corps d'un `ChatMessage` de l'assistant, ou sous un bloc de réponse d'une page composée. Pas dans une ligne de liste ni dans un tableau.

## Composition
Contient `Tooltip` et le `Button` de React Aria.

## Décisions
D-040, D-089, D-411.

## Questions ouvertes
