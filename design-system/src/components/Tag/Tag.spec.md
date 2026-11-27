# Tag
Statut : validé (2026-11-23) — Version : depuis 1.0.0
Validation : docs/validation/components/Nouveaux-P4-v1.html (T1 et T2, options A)

## Rôle
`TagGroup` affiche une liste d'étiquettes interactives (`Tag`) : des mots-clés qu'on retire (étiquettes d'un ticket), ou des filtres qu'on choisit (« Urgent », « Client »).
Ne pas l'utiliser pour :
- un statut : prendre `Badge`, statique (D-160) ;
- lancer une action : prendre `Button` (D-100). Une étiquette n'est jamais un bouton ;
- choisir des valeurs dans une longue liste : prendre `ComboBox` en choix multiple (D-140) ;
- basculer entre 2 à 4 vues : prendre `SegmentedControl`.

## Anatomie
1. **Libellé du groupe** au-dessus (`--fs-sm`, `--fw-medium`), visible ou masqué (`hideLabel`) ; il reste le nom du groupe.
2. **Étiquettes** en ligne, retour à la ligne, 4 px d'écart. Pastille neutre : fond `--field`, texte `--fg` (`--fs-xs`), rayon 4 px, hauteur `--btn-h-sm`, 240 px au plus (texte tronqué, titre au survol).
3. **Coche** (12 px) avant le texte, seulement sur une étiquette choisie ; fond `--selected`, `--fw-medium`.
4. **Croix** (12 px dans 18 px, `--fg-3`), seulement avec `onRemove`.
5. **Aide** facultative sous le groupe (`--fs-sm`, `--fg-3`).
6. **État vide** facultatif (`emptyText`, `--fg-3`).

## Variantes
| Mode | Usage |
|---|---|
| Lecture (défaut) | Étiquettes affichées, focus et flèches seulement. |
| Retrait (`onRemove`) | Croix sur chaque étiquette ; Suppr et Retour arrière retirent. |
| Sélection (`selectionMode`) | `single` ou `multiple`, pour filtrer. |

Retrait et sélection se combinent : Suppr retire alors toutes les étiquettes choisies si celle qui a le focus l'est (React Aria).

## Options
`TagGroup` :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Nom du groupe. |
| `hideLabel` | `boolean` | `false` | Libellé masqué à l'écran, gardé comme nom. |
| `description` | `string` | aucune | Aide sous le groupe, liée au groupe. |
| `children` | `<Tag>` | — (obligatoire) | Étiquettes. |
| `onRemove` | `(ids: string[]) => void` | aucun | Active le retrait ; l'app retire les ids de sa liste. |
| `selectionMode` | `"none" \| "single" \| "multiple"` | `"none"` | Sélection pour filtrer. |
| `selectedIds` / `defaultSelectedIds` | `string[]` | aucun | Sélection contrôlée ou de départ. |
| `onSelectionChange` | `(ids: string[]) => void` | aucun | Nouvelle sélection. |
| `emptyText` | `string` | aucun | Texte du groupe vide (« Aucune étiquette »). |

`Tag` :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `id` | `string` | — (obligatoire) | Identifiant rendu par les rappels. |
| `children` | `string` | — (obligatoire) | Libellé court ; nom de l'étiquette et de sa croix. |
| `isDisabled` | `boolean` | `false` | Ni choisie, ni retirée, sautée par les flèches. |

## Exclus
- Pas de couleur par catégorie (D-362, option B écartée) : la couleur ne porte que du sens (D-001).
- Pas d'action au clic (`onAction`, lien) : une étiquette n'est pas un bouton (D-362).
- Pas d'icône ni d'avatar dans l'étiquette.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Fond `--field`. |
| Survol (étiquette à choisir) | Fond `--hover`. |
| Choisie | Fond `--selected`, coche, `--fw-medium`. |
| Focus clavier | Anneau `--focus` 2 px, décalé de 1 px ; sur le groupe quand il est vide (D-425). |
| Désactivée | Opacité 40 % ; croix inactive. |
| Survol de la croix | Fond `--line-strong`, croix `--fg`. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Pastille neutre : `--field`, `--fg`, rayon 4 px, hauteur `--btn-h-sm` (D-362) | verrouillé | `ParDefaut` |
| Croix « Retirer <nom> » seulement avec `onRemove` ; un clic retire l'étiquette (D-362) | réglable (`onRemove`) | `Retrait` |
| Un seul arrêt de Tab ; flèches d'étiquette en étiquette ; Suppr et Retour arrière retirent ; le focus reste dans le groupe (D-362) | verrouillé | `RetraitAuClavier` |
| Groupe vide : `emptyText` s'affiche | réglable | `RetraitAuClavier` |
| Sélection multiple : clic ou Espace ; `--selected`, coche, `aria-selected` (D-362) | réglable (`selectionMode`) | `SelectionMultiple` |
| Sélection simple : choisir une étiquette retire la précédente | réglable | `SelectionSimple` |
| Étiquette désactivée : ni choisie, ni retirée, sautée par les flèches | réglable (`isDisabled`) | `Desactivee` |
| Libellé masqué : il reste le nom du groupe ; l'aide est sa description | réglable (`hideLabel`) | `LibelleMasque` |

## Contenu
- Libellé du groupe : un nom (« Étiquettes du ticket », « Filtrer par type »).
- Étiquette : un ou deux mots, sans point, majuscule initiale (« Urgent »).
- État vide : « Aucune étiquette ».

## Densité
Hauteur `--btn-h-sm` : 24 px en desktop, 26 px en web. Texte `--fs-xs`.

## Clavier
| Touche | Effet |
|---|---|
| Tab | Entre dans le groupe (dernière étiquette qui avait le focus), puis en sort. La croix n'est pas un arrêt. |
| Flèches gauche et droite, Origine, Fin | Déplacent le focus entre les étiquettes. |
| Espace, Entrée | Choisit ou retire de la sélection (mode sélection). |
| Suppr, Retour arrière | Retire l'étiquette (avec `onRemove`). |

## Accessibilité
- React Aria `TagGroup` : rôle `grid`, étiquettes en `row`, nommé par le libellé ; `aria-selected` sur les étiquettes en mode sélection (le motif WAI-ARIA de grille remplace `aria-pressed` de la page de validation).
- La croix est nommée « Retirer <nom> » (`removeItem`, déjà utilisé par ComboBox) ; elle est hors de l'ordre de Tab, Suppr la remplace au clavier.
- Au clavier, React Aria ajoute la description « Appuyez sur Suppr pour retirer » quand le retrait est possible.

## Taille d'écran
Les étiquettes passent à la ligne ; aucune barre de défilement horizontal.

## Erreurs
Sans objet : pas de vérification.

## Placement
Sous un titre de fiche (étiquettes d'un objet), au-dessus d'une liste (filtres rapides), dans un `Drawer`.

## Composition
React Aria `TagGroup`, `TagList`, `Tag`, `Button` (slot `remove`) ; icônes internes `Check` et `X`. Même croix et même rayon que les étiquettes de `ComboBox`.

## Décisions
D-001, D-100, D-140, D-160, D-362.

## Questions ouvertes
Aucune.
