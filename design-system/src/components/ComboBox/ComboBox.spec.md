# ComboBox
Statut : validé (2026-11-23) — Version : depuis 0.2.0 (non publié)
Validation : docs/validation/components/ComboBox-v1.html

## Rôle
Champ de formulaire qui propose une liste de choix pendant la saisie. On choisit un élément (choix simple) ou plusieurs (choix multiple, en étiquettes), dans une liste connue ou chargée par une API (D-140). La valeur choisie (un id, ou une liste d'ids) est enregistrée avec le formulaire.
Ne pas l'utiliser pour (D-141) :
- filtrer ou trier le tableau ou la liste d'une page : prendre `SearchField` ;
- filtrer par une propriété (statut, type, personne) : un bouton de filtre avec un `Menu` à choix, dans la `toolbar` ;
- choisir dans une liste courte (7 éléments au plus), sans taper : prendre `Select` ;
- saisir un texte libre sans liste : prendre `TextField` ;
- chercher dans toute l'app ou lancer une commande : palette Mod+K (D-006).

## Anatomie
1. **Libellé** (obligatoire), au-dessus du champ ; « (facultatif) » si le champ l'est (D-022, D-130).
2. **Champ** (obligatoire), hauteur `--row-h` au repos, rayon de 8 px (D-040), fond `--surface`, bord de 1 px `--line-strong` (D-130, D-073). Il contient, dans l'ordre :
   1. **Étiquettes** (choix multiple ; 0 ou plus) : libellé, puis × ; rayon de 4 px ; elles passent à la ligne et le champ grandit (D-143) ;
   2. **Texte en cours**, avec un texte d'aide facultatif (`placeholder`) quand il n'y a ni texte ni étiquette ;
   3. **Indicateur d'attente** (automatique, source asynchrone) : indicateur rotatif de 14 px (D-081, D-145) ;
   4. **Chevron** (obligatoire), à droite : ouvre et ferme la liste (D-147).
3. **Aide** (facultative), sous le champ, en `--fs-sm`, `--fg-3` ; l'erreur prend sa place (D-130).
4. **Liste** (flottante), sous le champ, à sa largeur, au style du `Menu` : conteneur de 12 px, 8 lignes visibles puis défilement (D-145). Chaque élément tient sur une ligne : icône facultative, libellé, description facultative, coche à droite (D-146, D-047, D-050). Sections titrées facultatives.
5. **Lignes d'information** de la liste (automatiques) : « Ajouter « texte » » (D-142), « Tapez au moins 2 caractères », « Recherche… », « Résultats indisponibles » avec « Réessayer », « Aucun résultat » (D-145).

## Variantes
Aucune variante visuelle : même apparence que `TextField` (D-130). Deux réglages de fonctionnement, indépendants : choix simple ou multiple (`selectionMode`), source locale ou asynchrone (`items` ou `loadItems`) (D-140).

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Libellé visible et nom accessible. |
| `selectionMode` | `"single" \| "multiple"` | `"single"` | Choix simple ou multiple (D-140). |
| `items` | `ComboBoxItem[]` | — | Source locale : la liste se filtre à chaque lettre (D-145). |
| `loadItems` | `(text, signal) => Promise<ComboBoxItem[]>` | — | Source asynchrone : à partir de 2 caractères, après 300 ms ; `signal` abandonne une demande périmée (D-145). Fournir `items` ou `loadItems`, pas les deux. |
| `value` / `defaultValue` | `string \| null` (simple) ; `string[]` (multiple) | `null` ; `[]` | Id(s) choisi(s). |
| `onChange` | `(value) => void` | — | Appelée à chaque choix ou retrait. |
| `selectedItems` | `ComboBoxItem[]` | — | Source asynchrone : éléments déjà choisis, pour afficher leur libellé avant toute recherche. |
| `allowsCustomValue` | `boolean` | `false` | Ligne « Ajouter « texte » » (D-142). |
| `onCreate` | `(text) => ComboBoxItem \| Promise<ComboBoxItem>` | — | Obligatoire avec `allowsCustomValue` : l'app crée l'élément et le renvoie ; il est choisi (D-142). |
| `placeholder` | `string` | aucun | Texte d'aide dans le champ vide. |
| `description` | `string` | aucune | Aide sous le champ (D-130). |
| `errorMessage` | `string` | aucun | Erreur fournie par l'app (D-132). |
| `isRequired`, `validate` | `boolean`, `(value) => string \| null` | — | Vérification par le composant, au moment de D-022 (D-132). |
| `isDisabled` | `boolean` | `false` | Champ désactivé. |
| `isOptional` | `boolean` | `false` | Ajoute « (facultatif) » au libellé (D-022). |
| `width` | `"xs" \| "sm" \| "md" \| "lg" \| "full"` | `"full"` | Largeur, comme `TextField` (D-133). |
| `name` | `string` | — | Nom pour l'envoi du formulaire. |

`ComboBoxItem` : `{ id: string; label: string; description?: string; icon?: ReactNode; isDisabled?: boolean; section?: string }`. Les éléments qui partagent `section` sont groupés sous ce titre, dans l'ordre d'apparition.

## Exclus
- Pas d'usage dans la `toolbar`, ni comme filtre de page (D-141).
- Pas de « +n » : toutes les étiquettes restent visibles (D-143).
- Pas d'élément sur deux lignes, ni d'avatar ou de couleur dans un élément (D-146).
- Pas d'appel à l'API sans texte (D-145).
- Pas de lecture seule dans cette version : afficher la valeur avec le panneau de détail ou un `TextField` en lecture seule.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Vide | Texte d'aide (s'il existe), chevron. |
| Survol | Bord `--fg-3`. |
| Focus | Anneau `--accent` de 2 px. |
| Liste ouverte | Liste flottante ; un élément mis en avant en `--hover`. |
| Élément choisi | Coche en fin de ligne (D-144). |
| Étiquette en focus | Fond plus foncé et anneau ; Retour arrière la retire (D-147). |
| Attente (asynchrone) | Indicateur dans le champ ; ligne « Recherche… » dans la liste (D-145, D-081). |
| Erreur de chargement | Ligne « Résultats indisponibles » et « Réessayer » (D-145, D-082). |
| Aucun résultat | Ligne « Aucun résultat » en `--fg-3` ; avec `allowsCustomValue`, seulement « Ajouter « texte » ». |
| Erreur de validation | Bord `--danger`, message sous le champ (D-022, D-130). |
| Désactivé | Opacité 40 %. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| La liste s'ouvre à la frappe, au chevron ou avec flèche bas ; pas au simple focus (D-147) | verrouillé | `Ouverture` |
| Source locale : filtre à chaque lettre, « contient », sans casse ni accents ; texte trouvé en gras (D-145, D-087) | verrouillé | `Filtre` |
| Choix simple : un clic ou Entrée choisit, remplace le texte et ferme la liste (D-144) | verrouillé | `ChoixSimple` |
| Choix multiple : un clic ou Entrée ajoute ou retire l'élément ; la liste reste ouverte ; le texte se vide (D-144) | verrouillé | `ChoixMultiple` |
| × d'une étiquette la retire ; Retour arrière dans un texte vide met en avant la dernière étiquette, un second appui la retire (D-147) | verrouillé | `ChoixMultiple` |
| Échap ferme la liste, puis rétablit le texte de la valeur choisie (D-147) | verrouillé | `Clavier` |
| Choix simple : quitter le champ avec un texte non reconnu rétablit le texte de la valeur choisie ; la valeur ne change jamais sans un choix (D-147) | verrouillé | `Sortie` |
| Valeur libre : « Ajouter « texte » » en tête si aucun élément n'a ce libellé ; le premier élément trouvé reste mis en avant (D-142) | verrouillé | `ValeurLibre` |
| Source asynchrone : 2 caractères, 300 ms ; seule la dernière réponse s'affiche ; attente et erreur visibles ; « Réessayer » relance (D-145) | verrouillé | `Asynchrone` |
| La liste se place sous le champ, au-dessus si la place manque ; jamais coupée par un bord | verrouillé | `Ouverture` |

## Contenu
- Libellé et description d'un élément : une ligne, coupés avec « … » ; la description se coupe d'abord (D-146).
- Étiquette trop longue : coupée à 200 px, avec une info-bulle (D-143).
- Très grand nombre d'éléments locaux : la liste défile ; au-delà de quelques centaines, préférer `loadItems`.
- Libellés internes (« Ajouter », « Recherche… », « Aucun résultat »…) : dictionnaire `messages` (D-089).

## Densité
Hauteur `--row-h` (34 px en web, 28 px en desktop) pour le champ et les éléments ; étiquettes de `--row-h` moins 10 px ; texte `--fs-md`, étiquettes, aide et description `--fs-sm`.

## Clavier
Tab entre et sort du champ (le chevron n'est pas dans l'ordre de tabulation). Flèche bas ouvre la liste ; flèches haut et bas parcourent les éléments ; Entrée choisit ; Échap ferme puis rétablit. Flèches gauche et droite depuis le début du texte : passent d'une étiquette à l'autre (choix multiple).

## Accessibilité
- React Aria `ComboBox` : rôle `combobox` sur le champ, `listbox` sur la liste ; `aria-multiselectable` en choix multiple.
- Le libellé nomme le champ ; l'aide et l'erreur le décrivent (`aria-describedby`).
- Le chevron est nommé « Afficher les choix » ; chaque × « Retirer <libellé> » ; les étiquettes forment un groupe nommé « <libellé> choisis ».
- L'attente est annoncée (« Recherche en cours ») ; l'erreur de chargement porte `role="alert"`.
- Cibles : chevron et × de 24 px au moins.

## Taille d'écran
Le champ prend la largeur demandée (`width`), jamais plus que sa colonne. Sur mobile, la liste prend la largeur du champ, qui est celle de la colonne.

## Erreurs
Erreur de validation : sous le champ, au moment de D-022 (D-130, D-132). Erreur de chargement (asynchrone) : ligne dans la liste avec « Réessayer » ; le choix reste possible après une nouvelle frappe (D-145).

## Niveau de réglage
Toutes les règles sont verrouillées. Options par usage : `selectionMode`, source, `allowsCustomValue`, `width`.

## Placement
Formulaires (`FormPage`, formulaire en modale), panneau de détail (`detail`), lignes de réglage (`SettingsPage`). Jamais dans la `toolbar`, la `topbar` ni la `sidebar` (D-141).

## Composition
Reprend l'anatomie commune des champs (libellé, aide, erreur, D-130), des étiquettes au style de `SearchField` et une liste au style du `Menu`. Ne contient pas d'autre champ. Ne se combine pas avec `SearchField` dans un même usage.

## Décisions
D-006, D-022, D-040, D-047, D-050, D-073, D-074, D-081, D-082, D-087, D-089, D-130, D-132, D-133, D-140, D-141, D-142, D-143, D-144, D-145, D-146, D-147

## Questions ouvertes
Aucune.
