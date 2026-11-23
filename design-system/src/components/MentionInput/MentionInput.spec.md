# MentionInput
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/Chat-v1.html (Q5 A, Q11)

## Rôle
Champ de texte multiligne où l'on cite des ressources de l'app par un caractère : `@` pour un fichier, `/` pour une commande, `#` pour un ticket. Chaque ressource choisie devient une pastille non éditable, à sa place dans le texte.
Ne pas l'utiliser pour :
- un texte simple, sans citation : prendre `TextArea` ;
- choisir une valeur dans une liste : prendre `ComboBox` ;
- des étiquettes à part du texte : prendre `TagGroup`.

## Anatomie
1. **Champ** éditable, texte brut et retours à la ligne. Variante `field` : cadre de champ ; variante `plain` : sans cadre (dans `ChatComposer`).
2. **Texte d'attente** (`placeholder`) en `--fg-3`, tant que le champ est vide.
3. **Pastilles** : `caractère + nom` (« @OrderForm.tsx »), fond `--selected`, rayon `--radius-full`, hauteur 20 px, texte `--fs-sm`, 32 caractères au plus ; × de 20 px (12 px d'icône).
4. **Liste des suggestions**, au-dessus du curseur : surface flottante (`--surface-raised`, bord `--line`, rayon `--radius-lg`, `--shadow-md`), 320 px de large, 224 px de haut au plus ; une ligne `--row-h` par suggestion : icône, nom, détail à droite en `--fg-3`.
5. **État de la liste** : « Recherche… » (roue), « Aucun résultat », « Recherche indisponible. Fermez puis réessayez. ».

## Variantes
| Variante | Usage |
|---|---|
| `field` (défaut) | Champ seul dans une page (commentaire, note). |
| `plain` | Dans un conteneur qui porte le cadre : `ChatComposer`. Une ligne de 20 px dans 28 px, texte `--fs-lg`, 240 px au plus. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Nom accessible du champ. |
| `value` | `string` | — (obligatoire) | Texte, sans les pastilles. |
| `references` | `MentionReference[]` | `[]` | Pastilles : `{ key, trigger, id, label, offset }` ; `offset` est la position dans `value`. |
| `onChange` | `(value, references) => void` | — (obligatoire) | Chaque frappe, choix ou retrait. |
| `triggers` | `MentionTrigger[]` | `[]` | `{ char, label, load(query, signal) }` : caractère, nom de la liste, recherche. `load` rend une promesse de `MentionItem[]` (`{ id, label, description?, icon? }`). |
| `placeholder` | `string` | aucun | Texte d'attente. |
| `isDisabled` | `boolean` | `false` | Non éditable, hors de l'ordre de Tab, opacité 40 %. |
| `variant` | `"field" \| "plain"` | `"field"` | Avec ou sans cadre. |
| `onKeyDown` | `(event) => void` | aucun | Touches, après celles de la liste ouverte. `preventDefault()` sur Entrée empêche le retour à la ligne. |
| `onPaste` | `(event) => void` | aucun | Collage, avant le collage en texte brut ; `preventDefault()` le remplace. |
| `ref` | `Ref<MentionInputHandle>` | — | `focus()`, `insertText(text)` (au curseur ; un caractère déclencheur reçoit une espace devant si besoin). |

Exports liés : `MentionText` (texte et pastilles en lecture seule), `trimMentionReferences(text, references)`.

## Exclus
- Pas de mise en forme (gras, liens) : le collage arrive en texte brut.
- Pas de recherche dans Socle : l'app filtre et trie dans `load`, et garde ses catalogues en cache.
- Pas de pastille modifiable : on la retire et on en choisit une autre.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Vide | Texte d'attente en `--fg-3`. |
| Focus (`field`) | Anneau `--focus` 2 px ; dans `ChatComposer`, le cadre se teinte. |
| Liste ouverte | Suggestion active en `--hover`. |
| Recherche en cours | Suggestions précédentes du même caractère gardées ; sans elles, « Recherche… » avec roue ; `aria-busy`. |
| Aucun résultat | « Aucun résultat ». |
| Erreur de recherche | « Recherche indisponible. Fermez puis réessayez. ». |
| Désactivé | Opacité 40 %, curseur interdit. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Un caractère déclencheur en début de mot ouvre la liste de ce déclencheur, au-dessus du curseur, 224 px au plus (D-372) | réglable (`triggers`) | `SuggestionsAuClavier` |
| Recherche après 150 ms sans frappe ; une recherche dépassée est annulée (`signal`) (D-372) | verrouillé | `EtatsDeLaListe` |
| Flèches haut et bas parcourent la liste en boucle ; Entrée ou Tab insère la suggestion active ; le texte tapé (`@Ord`) disparaît, la pastille prend sa place, le curseur la suit | verrouillé | `SuggestionsAuClavier`, `TabEtEchap` |
| Échap ferme la liste sans rien insérer ; l'événement ne remonte pas | verrouillé | `TabEtEchap` |
| Liste vide ou en erreur : Entrée la ferme et garde son effet (envoi dans `ChatComposer`) ; pendant la recherche sans suggestion, Entrée attend | verrouillé | — |
| Un clic dans la liste choisit, le focus reste dans le champ | verrouillé | — |
| × d'une pastille la retire ; Retour arrière l'efface d'un bloc | verrouillé | `RetraitDePastille` |
| Entrée sans gestionnaire et Maj+Entrée insèrent un retour à la ligne (`<br>`) | verrouillé | `RetourALaLigneEtCollage` |
| Collage en texte brut | réglable (`onPaste`) | `RetourALaLigneEtCollage` |
| La valeur reçue ne redessine le champ que si elle diffère de son contenu : la frappe garde le curseur | verrouillé | `SuggestionsAuClavier` |
| Désactivé : non éditable, `tabindex="-1"` | réglable | `Desactive` |

## Contenu
- Nom d'une suggestion : le nom de la ressource (« OrderForm.tsx »), pas son chemin ; le chemin va dans `description` (« src »).
- Nom d'un déclencheur : un nom au singulier (« Fichier »).

## Densité
Ligne de suggestion `--row-h` (34 px web, 28 px desktop). Variante `field` : hauteur minimale `--row-h`.

## Clavier
| Touche | Effet |
|---|---|
| Caractère déclencheur | Ouvre la liste (en début de mot). |
| Flèches haut et bas | Suggestion précédente ou suivante (liste ouverte). |
| Entrée, Tab | Insère la suggestion active. |
| Échap | Ferme la liste. |
| Retour arrière | Efface la pastille avant le curseur. |
| Maj+Entrée | Retour à la ligne. |

## Accessibilité
- `role="textbox"`, `aria-multiline="true"`, nommé par `label`, `aria-placeholder`.
- Motif de combobox pour les suggestions : `aria-autocomplete="list"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` vers le `listbox`, `aria-activedescendant` vers l'option active (`aria-selected`). Le focus ne quitte jamais le champ.
- Liste nommée « Suggestions : <nom du déclencheur> » ; l'état (« Recherche… », « Aucun résultat ») est un `status`, annoncé poliment.
- × d'une pastille nommé « Retirer @OrderForm.tsx », hors de l'ordre de Tab : Retour arrière le remplace au clavier.
- `aria-expanded` est posé sur un `textbox` : ARIA le réserve au `combobox`, mais un `combobox` ne peut pas être multiligne ; les lecteurs d'écran l'annoncent.

## Taille d'écran
La liste garde 8 px des bords de la fenêtre et suit le défilement. Sur mobile, 320 px ou la largeur de la fenêtre moins 16 px.

## Erreurs
Une recherche rejetée affiche « Recherche indisponible. Fermez puis réessayez. » ; la cause relève de l'app (notification).

## Placement
Dans `ChatComposer` (variante `plain`), ou seul pour un commentaire qui cite des ressources (variante `field`).

## Composition
Élément éditable, `Spinner`, liste en portail. `MentionText` partage le rendu des pastilles avec `MessageQueue`.

## Décisions
D-001, D-372.

## Questions ouvertes
Aucune.
