# DiffView
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/DiffView-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Différences entre deux versions d'un texte (code, Markdown, configuration), ou lecture d'un diff unifié (`git diff`, `diff -u`). `DiffStat` montre seul les compteurs « +12 −3 » (D-290).
Ne pas l'utiliser pour : un texte seul (`Code` en bloc), un historique de valeurs de champs (`Table`), une édition ou une fusion de versions (hors périmètre).

## Anatomie
1. Cadre : bord `--line`, rayon 8 px, fond `--surface`.
2. En-tête (`--bar-h`, fond `--surface-side`) : nom du fichier en chasse fixe (facultatif), résumé, `DiffStat` ; à droite, boutons-icônes « Côte à côte » (bascule), « Afficher les lignes inchangées » (bascule, si un repli existe), « Changement précédent », « Changement suivant » (D-296).
3. Zone du diff, qui défile : rangées de 20 px en `--font-mono` `--fs-sm` (D-298).
   - Vue unifiée : numéro avant, numéro après, signe, texte.
   - Vue côte à côte : numéro et texte avant, puis numéro et texte après ; une demi-ligne sans vis-à-vis est hachurée.
4. Rangée de repli (32 px) : « N lignes inchangées » et `Button` `subtle` `sm` « Afficher N lignes » (D-295).
5. Rangée de titre de fichier (patch à plusieurs fichiers) : nom, statut, `DiffStat`.
6. Rangée d'avis : binaire, fins de ligne converties, diff coupé (D-299).

## Variantes
Côte à côte (défaut) ; unifiée (D-291).

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Nom accessible de la zone du diff (« Modifications de server.ts »). |
| `before` | `string` | `""` | Texte d'avant. |
| `after` | `string` | `""` | Texte d'après. |
| `fileName` | `string` | — | Nom affiché dans l'en-tête (avec `before` et `after`). |
| `patch` | `string` | — | Diff unifié, un ou plusieurs fichiers ; remplace `before` et `after`. |
| `truncated` | `boolean` | `false` | Le diff est coupé : un avis le dit à la fin. |
| `mode` | `"split" \| "unified"` | — | Vue contrôlée. |
| `defaultMode` | `"split" \| "unified"` | `"split"` | Vue de départ, non contrôlée. |
| `onModeChange` | `(mode) => void` | — | Appelé quand l'utilisateur change de vue. |
| `context` | `number` | `3` | Lignes inchangées gardées autour d'un changement. |
| `fill` | `boolean` | `false` | Prend la hauteur de son conteneur au lieu de 720 px au plus. |

`DiffStat` : `added: number`, `removed: number` (obligatoires).

## Exclus
- Pas de coloration syntaxique, pas de retour à la ligne, pas de fusion à trois voies.
- Pas d'action sur un changement (accepter, rejeter, commenter) : l'app les place hors du composant.
- Pas de couleurs réglables, pas de `className`.

## États
| État | Rendu |
|---|---|
| Changements | Rangées, résumé « N changements », compteurs. |
| Aucune différence | `EmptyState` compact « Aucune différence » ; boutons de navigation désactivés. |
| Binaire | Avis « Fichier binaire : contenu non comparé » ; résumé « Fichier binaire ». |
| Coupé | Avis final « Diff coupé : la suite n'est pas affichée ». |
| Focus de la zone | Anneau `--accent` sur le cadre. |
| Changement courant | Trait `--accent` de 3 px à gauche de ses rangées. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Côte à côte par défaut ; bascule « Côte à côte » (D-291) | réglable (`mode`, `defaultMode`) | `BasculeDeVue` |
| Unifiée imposée sous 641 px, bascule cachée (D-291) | verrouillé | `Etroit` |
| Couleurs tirées de `--success` et `--danger`, jamais en dur (D-292) | verrouillé | `Couleurs` |
| Signes et texte caché, `<ins>` et `<del>` (D-293) | verrouillé | `Accessibilite` |
| Mots changés surlignés si 40 % de texte commun (D-294) | verrouillé | `MotsChanges` |
| Repli au-delà de `context` lignes, bouton par repli et bascule globale (D-295) | réglable (`context`) | `Replis` |
| Patch à plusieurs fichiers : un titre par fichier, total dans l'en-tête (D-296) | verrouillé | `Patch` |
| F7, Maj+F7, Alt+↓, Alt+↑ et boutons : changement suivant ou précédent, annoncé (D-297) | verrouillé | `Navigation` |
| Seules les rangées visibles sont dessinées (D-298) | verrouillé | `GrosFichier` |
| Avis binaire, fins de ligne, coupé (D-299) | verrouillé | `Avis` |
| Deux textes identiques : état vide (D-296) | verrouillé | `Identique` |

## Contenu
Libellés internes dans `messages` (D-089) : résumé, boutons, avis, textes cachés. Le nom de fichier est celui de l'app.

## Densité
L'en-tête suit `--bar-h` et `--icon-btn`. Les rangées de code gardent 20 px dans les deux densités (D-298).

## Clavier
Tab : boutons de l'en-tête, puis la zone du diff (défile aux flèches), puis les boutons « Afficher N lignes » visibles. Dans la zone : F7 ou Alt+↓ (suivant), Maj+F7 ou Alt+↑ (précédent). Le raccourci est décrit à la zone par `aria-describedby`.

## Accessibilité
Zone `section` nommée par `label`. En-tête `role="toolbar"`. Annonce polie du changement courant. Signes visibles et texte caché par ligne changée ; compteurs avec texte caché (D-293). Contraste élevé : mots barrés ou soulignés, signes en gras. Texte `--fg` sur les fonds de ligne : AA.

## Taille d'écran
Sous 641 px : vue unifiée seule. Le diff défile à l'horizontale d'un seul bloc ; l'en-tête passe à la ligne si besoin.

## Erreurs
Sans objet : un patch mal formé donne ce qu'il a pu lire.

## Placement
Contenu d'une page de détail (onglet « Modifications »), d'un panneau large, d'une modale `lg` ou `xl`. `DiffStat` : en fin de ligne d'une `List` ou d'une cellule de `Table`.

## Composition
Contient `IconButton`, `Button`, `EmptyState`. Ne contient pas d'autre composant de l'app.

## Décisions
D-013, D-034, D-089, D-160, D-166, D-168, D-290 à D-299

## Questions ouvertes
Aucune.
