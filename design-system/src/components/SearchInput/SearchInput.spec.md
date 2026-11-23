# SearchInput
Statut : validé (2026-11-22) — Version : depuis 0.1.0
Validation : docs/validation/components/SearchField-v3.html (barre seule). Pages remplacées : SearchField-v1.html, SearchField-v2.html.

## Rôle
Barre de recherche : elle recueille les critères de l'utilisateur (texte en cours, étiquettes) et les transmet à l'app (D-077). L'app s'en sert pour filtrer ou trier un tableau, une liste, souvent par une API. La barre n'affiche ni ne filtre de résultats.
Elle peut proposer des suggestions pendant la frappe et transformer chaque critère en étiquette (D-071) ; ces deux options sont facultatives et désactivées par défaut (D-072).
Ne pas l'utiliser pour :
- chercher dans toute l'app ou lancer une commande : prendre la palette de commandes (Mod+K, D-006) ;
- saisir une valeur de formulaire : prendre `TextInput` ;
- choisir une ou plusieurs valeurs enregistrées avec un formulaire : prendre `ComboBox` (liste longue ou distante) ou `Select` (liste courte, sans saisie) (D-141) ;
- filtrer par une propriété (statut, type, personne) : un bouton de filtre avec un `DropdownMenu` à choix (D-074, D-141).

## Anatomie
1. **Champ** (obligatoire), hauteur `--row-h`, largeur fixe de 320 px (D-078), rayon de 8 px (D-040), fond `--surface` et bord de 1 px `--line-strong` (D-073).
2. **Loupe** à gauche (obligatoire), 16 px, `--fg-3`.
3. **Étiquettes** (si `tagMode` ; 0 ou plus), avant le texte en cours (D-071, D-072) : libellé, puis × ; rayon de 4 px, car elles sont placées dans un autre contrôle (D-040). Quand elles ne tiennent plus, « +n » résume les plus anciennes ; un clic sur « +n » les affiche toutes, sur plusieurs lignes, tant que le champ garde le focus (D-078).
4. **Texte en cours**, avec le texte d'aide « Rechercher dans <page> » quand il n'y a ni étiquette ni texte.
5. **Indicateur d'attente** (automatique) : indicateur rotatif de 14 px, avant le ×, pendant le chargement des suggestions ; plus lent si l'utilisateur réduit les animations (D-081).
6. **Bouton « Tout effacer »** (×, automatique) : visible quand il y a du texte ou une étiquette.
7. **Raccourci** Mod+F affiché dans le champ vide (« ⌘F » ou « Ctrl+F ») (D-083).
8. **Suggestions** (si `suggestions` est fourni) : liste flottante sous le champ, au style du `DropdownMenu` (D-047 à D-051). D'abord « Rechercher « texte » », puis, sous « Éléments », jusqu'à 5 éléments dont le titre contient le texte (D-074).

## Variantes
Aucune variante visuelle : fond `--surface`, bord `--line-strong` ; au survol, bord `--fg-3` ; au focus, anneau `--accent` (D-073). Deux options de fonctionnement, indépendantes : suggestions et étiquettes (D-072). Sans elles, c'est un champ simple.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Nom accessible et base du texte d'aide. |
| `onChange` | `({ text, tags }) => void` | — (obligatoire) | Critères transmis à l'app (D-077) : après 300 ms sans frappe, à partir de 2 caractères (D-080) ; tout de suite pour une étiquette, « Tout effacer » et Échap ; jamais deux fois les mêmes (D-079). |
| `tagMode` | `boolean` | `false` | Active les étiquettes : Entrée transforme le texte en étiquette (D-071, D-072). |
| `tags` / `onTagsChange` | `{ id, label }[]` | `[]` | Étiquettes en place, si `tagMode`. |
| `suggestions` | `(text, signal) => { id, label }[] \| Promise<…>` | aucune | Éléments suggérés, 5 au plus ; synchrone ou asynchrone (API) ; `signal` permet d'abandonner une requête périmée (D-074, D-077). Sans cette option, pas de liste. |

## Exclus
- Pas d'affichage ni de filtrage des résultats : chargement, erreurs, « aucun résultat », compteur et surlignage relèvent de `Table`, `List` et `ListPage` (D-077).
- Pas de syntaxe à taper (« statut:ouvert ») ni d'étiquette typée : les filtres par propriété sont des boutons dans la `toolbar` (D-074).
- Pas de recherche dans toute l'app : palette Mod+K.
- Pas de champ de recherche dans la barre supérieure ni dans la sidebar (layout-rules).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Vide | Loupe, texte d'aide, raccourci. |
| Focus | Anneau `--accent` ; le raccourci disparaît. |
| Avec étiquettes | Étiquettes puis texte en cours ; × « Tout effacer ». |
| Étiquette en focus | Fond plus foncé et anneau ; Retour arrière ou Suppr la retire. |
| Suggestions ouvertes | Liste flottante ; une suggestion mise en avant (`--hover`). |
| Suggestions en attente (API) | Indicateur dans le champ, et ligne « Recherche… » dans la liste (D-081). |
| Suggestions en erreur (API) | « Rechercher « texte » », puis la ligne « Suggestions indisponibles » avec « Réessayer » (D-082). |
| Aucune suggestion | Sous « Rechercher « texte » », la ligne « Aucun élément trouvé » en `--fg-3`. |
| Désactivé | Opacité 40 %. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Entrée : la suggestion mise en avant, ou à défaut le texte saisi, devient une étiquette ; le texte en cours se vide (D-071). Sans étiquettes, un élément choisi remplace le texte du champ (D-074) | verrouillé | `Etiquettes` |
| × d'une étiquette : la retire ; le focus revient au champ | verrouillé | `Etiquettes` |
| Retour arrière dans un champ sans texte : met en avant la dernière étiquette ; un second appui la retire | verrouillé | `Etiquettes` |
| Les étiquettes se combinent en ET ; la barre transmet la liste, l'app applique la règle (D-075) | verrouillé | `Criteres` |
| Flèches haut et bas : parcourent les suggestions ; Échap : ferme les suggestions, puis efface le texte, puis quitte le champ | verrouillé | `Clavier` |
| Suggestions par API : seule la réponse à la dernière saisie s'affiche ; les requêtes précédentes sont abandonnées (D-077) | verrouillé | `SuggestionsApi` |
| Envoi des critères et demande de suggestions : à partir de 2 caractères, après 300 ms sans frappe (D-080) ; immédiat pour une étiquette, « Tout effacer » et Échap ; jamais deux fois les mêmes (D-079) | verrouillé | `Envoi` |
| Les critères sont gardés pour la page pendant la session | verrouillé | `Memorisation` |
| Largeur fixe ; débordement : « +n » résume les étiquettes les plus anciennes, jamais coupées ; clic sur « +n » : toutes visibles (D-078) | verrouillé | `Debordement` |

## Contenu
- Texte d'aide : « Rechercher dans » suivi du nom de ce qui est filtré (« les demandes »).
- Une étiquette trop longue est coupée à 160 px, avec une info-bulle.

## Densité
Hauteur `--row-h` (34 px en web, 28 px en desktop) ; étiquettes de `--row-h` moins 10 px ; texte `--fs-md`, étiquettes `--fs-sm`.

## Clavier
Voir Comportement. Flèches gauche et droite depuis le début du texte : passent d'une étiquette à l'autre. Mod+F place le curseur dans la barre et sélectionne son texte, seulement sur une page qui a une barre de recherche (D-083).

## Accessibilité
- Rôle `combobox` (React Aria `ComboBox`) si des suggestions existent, sinon `searchbox` (React Aria `SearchField`).
- Les étiquettes forment un groupe nommé « Critères de recherche » (React Aria `TagGroup`) ; chaque × est nommé « Retirer <étiquette> ».
- L'attente des suggestions est annoncée (« Recherche en cours »).
- Le champ porte `aria-keyshortcuts` (`Meta+F` ou `Control+F`) (D-083).

## Taille d'écran
Bureau et tablette : 320 px dans la `toolbar`. Mobile : le champ prend toute la largeur, et les suggestions aussi (D-078).

## Erreurs
Seules les erreurs de suggestions sont gérées ici : une ligne « Suggestions indisponibles » avec « Réessayer » ; la recherche par le texte reste possible (D-082). Les erreurs de résultats relèvent de `Table`, `List` et `ListPage` (D-077).

## Placement
`toolbar` des gabarits `ListPage` et `SettingsPage`, au-dessus d'un tableau ou d'une liste. Une seule barre de recherche par page.

## Composition
Contient une icône interne (D-028), des `IconButton` (×) et une liste au style du `DropdownMenu`. Se combine avec `Table` ou `List`, sans les contenir.

## Décisions
D-006, D-028, D-040, D-047, D-071, D-072, D-073, D-074, D-075, D-077, D-078, D-079, D-080, D-081, D-082, D-083, D-141

## Questions ouvertes
Aucune.
