# MarkdownEditor
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/Markdown-v1.html (par délégation de l'utilisateur, 2026-11-23)
Import : `import { MarkdownEditor } from "socle-ui/markdown-editor";` (sous-entrée, D-300)
Dépendances facultatives à installer par l'app : `@codemirror/state`, `@codemirror/view`, `@codemirror/commands`, `@codemirror/language`, `@codemirror/lang-markdown`, `@lezer/highlight`, plus `react-markdown` et `remark-gfm` (aperçu).

## Rôle
Champ de formulaire pour écrire un texte mis en forme en Markdown : note, description longue, compte rendu, modèle de message.
Ne pas l'utiliser pour :
- un texte libre sans mise en forme : prendre `TextArea` ;
- afficher du Markdown : prendre `Markdown`.

## Anatomie
Celle de `Field` (Field.spec.md), plus, dans le cadre (D-305) :
1. **barre de mise en forme** : trois groupes d'`IconButton`, séparés par un `Separator` vertical (D-307) ; bouton « Aperçu » en fin de barre si `preview="toggle"` (D-309) ;
2. trait `--line` ;
3. **texte** (CodeMirror 6), en chasse fixe et coloré (D-306) ;
4. **aperçu** (facultatif) : `Markdown`, à droite ou à la place du texte (D-309).
Sous le cadre : aide, erreur, ou « Image non ajoutée » (D-308), et compteur si `maxLength`.

## Variantes
Aucune.

## Options
Les options communes de `Field` (`label`, `hideLabel`, `description`, `error`, `isRequired`, `isDisabled`, `width`, `name`), plus :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `value` / `defaultValue` / `onChange` | `string` | `""` | Texte, contrôlé ou non. Un `value` venu de l'app qui diffère du texte repart d'un historique vide. |
| `onBlur` | `() => void` | — | Sortie du champ. |
| `isReadOnly` | `boolean` | `false` | Lecture seule (D-131, D-305). |
| `placeholder` | `string` | — | Texte d'attente. |
| `maxLength` | `number` | — | Longueur maximale, dépassable ; affiche le compteur ; au-delà, refusée en quittant le champ et à l'envoi du formulaire (D-343). |
| `minRows` / `maxRows` | `number` | `6` / `20` | Hauteur du texte en lignes ; au-delà, il défile (D-305). |
| `fill` | `boolean` | `false` | Occupe la hauteur du conteneur. |
| `preview` | `"toggle" \| "split"` | — | Aperçu (D-309). |
| `onPasteImage` | `(file: File) => Promise<string \| { src: string; alt?: string }>` | — | Image collée ou déposée (D-308). |
| `onLinkPress`, `renderImage` | comme `Markdown` | — | Pour l'aperçu. |

## Exclus
- Pas de compte des modifications non enregistrées, pas de Mod+S, pas d'onglets Écrire / Aperçu, pas d'extensions (D-309).
- Pas de vérification `validate` : l'app passe `error`.
- Pas de `className`, pas de `style`.

## États
| État | Aspect |
|---|---|
| Par défaut | Cadre `--surface`, bord `--line-strong` (D-130). |
| Survol | Bord `--fg-3`. |
| Focus | Anneau `--accent` de 2 px autour du cadre. |
| Chargement de CodeMirror | Texte affiché tel quel, en chasse fixe ; barre désactivée. |
| Désactivé | Opacité 40 %, rien n'est joignable. |
| Lecture seule | Fond `--surface-side`, bord `--line`, cadenas ; barre masquée ; texte sélectionnable (D-131). |
| Erreur | Bord `--danger`, message sous le champ (D-132). |
| Vide | Texte d'attente en `--fg-3` ; aperçu « Rien à afficher ». |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Barre : un arrêt de tabulation, flèches gauche et droite (D-307) | verrouillé | `BarreAuClavier` |
| Commande : pose ou retire la marque ; le clic garde la sélection (D-307) | verrouillé | `MiseEnForme` |
| Raccourcis Mod+B, I, E, K, Mod+Alt+1…3, Mod+Maj+7, 8, 9 (D-307) | verrouillé | `Raccourcis` |
| Entrée continue une liste, puis la quitte sur un élément vide (deux appuis) ; Tab quitte l'éditeur (D-307) | verrouillé | `Listes` |
| Coloration aux tokens, clair et sombre (D-306) | verrouillé | `Coloration` |
| Compteur et limite `maxLength` dépassable : pas d'arrêt de la saisie ; au-delà, « n caractères en trop » en `--danger`, lu après 1 s de pause ; en quittant le champ, « Saisissez n caractères au plus. » ; dans un `<form>`, l'envoi est refusé et le focus va au texte (D-343) | par page | `Compteur`, `LimiteEnvoi` |
| Désactivé, lecture seule, erreur (D-305) | par page | `Etats` |
| Aperçu en bascule ou côte à côte (D-309) | par page | `Apercu` |
| Image collée : attente, puis lien ; échec : message (D-308) | par page | `ImageCollee` |

## Contenu
Lignes longues : retour à la ligne automatique. Texte très long : le cadre s'arrête à `maxRows` puis défile.

## Densité
Suit `--fs-sm` et `--icon-btn` : plus compact en desktop.

## Clavier
Ordre : barre (un arrêt), texte, bouton « Aperçu » compris dans la barre. Flèches gauche et droite dans la barre. Raccourcis dans le texte (D-307). Échap : sans effet propre (il remonte à la modale).

## Accessibilité
- Le texte a `role="textbox"`, `aria-multiline`, le nom du libellé, `aria-describedby` vers l'aide ou l'erreur, `aria-invalid` en erreur, `aria-readonly` en lecture seule.
- Barre : `role="toolbar"` « Mise en forme » ; chaque bouton est nommé, avec son raccourci dans `aria-keyshortcuts`.
- Message « Image non ajoutée » : région `status`.

## Taille d'écran
Sous 560 px de large, l'aperçu `split` passe sous le texte. La barre passe à la ligne si elle manque de place.

## Erreurs
Erreur de l'app (`error`) sous le champ, à la place de l'aide (D-132). Image non ajoutée : message jusqu'à la saisie suivante (D-308).

## Niveau de réglage
Barre, raccourcis, coloration : verrouillés. Hauteur, aperçu, images, compteur : par page.

## Placement
Comme les champs : `FormPage`, formulaire en `Modal` (taille `lg`), ligne de réglage pleine largeur, page d'édition d'une note (`fill`). Jamais dans une barre ni dans une cellule de `Table`.

## Composition
Contient `IconButton`, `Separator`, `Markdown` (aperçu), les pièces de `Field`. Ne se met pas dans un `Fieldset` avec d'autres éditeurs.

## Décisions
D-006, D-032, D-089, D-130, D-131, D-132, D-300, D-305, D-306, D-307, D-308, D-309; D-343

## Questions ouvertes
Aucune.
