# FormattedValue
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/ListPage-v1.html, section « Valeurs typées » (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Afficher une valeur de donnée d'après son **type** : texte, nombre, montant, date, statut, lien… Le type fixe le format de la langue, l'alignement, la largeur de colonne et le tri. L'app ne formate rien elle-même : elle déclare le type.
Il sert dans les colonnes de `ListPage`, dans les lignes de propriétés de `DetailPanel` (P9) et partout où une donnée brute s'affiche.
Ne pas l'utiliser pour :
- un texte de l'interface (titre, phrase, libellé) : c'est du texte simple ;
- une valeur modifiable : c'est un champ (`TextField`, `Select`…) ;
- un avancement : `ProgressBar`.

## Anatomie
Une seule pièce : la valeur formatée, en ligne. Selon le type, c'est du texte, un `StatusBadge`, un `Link` ou un `Code` (D-170).

## Types (D-170)
| `type` | Valeur reçue | Affiché (français) | Rendu | Colonne (D-172) |
|---|---|---|---|---|
| `text` (défaut) | texte | le texte | texte | place restante, à gauche |
| `longtext` | texte | le texte, retours à la ligne gardés | paragraphe ; une ligne coupée dans une colonne | place restante, à gauche |
| `number` | nombre ou texte numérique | « 1 234,5 » | chiffres de largeur égale | 110 px, à droite |
| `money` | nombre | « 1 234,50 € » (`currency`, `EUR` par défaut) | idem | 130 px, à droite |
| `percent` | fraction | 0,25 → « 25 % » | idem | 90 px, à droite |
| `bytes` | nombre d'octets | « 1,2 Mo » | idem | 90 px, à droite |
| `date` | `Date`, ISO, `AAAA-MM-JJ`, horodatage | « 20 nov. 2026 » | `<time>` | 120 px, à droite |
| `datetime` | idem | « 20 nov. 2026, 14:30 » | `<time>` | 160 px, à droite |
| `relative` | idem | « il y a 3 jours », « demain », « à l'instant » | `<time>` | 130 px, à droite |
| `duration` | nombre (`durationUnit`, secondes par défaut) | « 45 s », « 12 min », « 1 h 5 min », « 3 j 4 h » | chiffres de largeur égale | 100 px, à droite |
| `boolean` | `true`/`false`, `1`/`0`, `"true"`/`"false"` | « Oui » ou « Non » | texte | 80 px, à gauche |
| `status` | clé de `statuses` | libellé de la clé | `StatusBadge` au ton de la clé | 140 px, à gauche |
| `email` | adresse | l'adresse | `Link` `mailto:` | place restante, à gauche |
| `url` | adresse web | l'adresse | `Link` externe | place restante, à gauche |
| `code` | identifiant | l'identifiant | `Code` en ligne | 140 px, à gauche |
| `tags` | liste de textes | « a, b, c » | texte | place restante, à gauche |

Règles de format :
- Nombres : séparateur de milliers et virgule de la langue ; `decimals` fixe le nombre de décimales (sinon 0 à 2 pour `number`, 2 pour `money`, 0 à 1 pour `percent` et `bytes`).
- Dates : un texte `AAAA-MM-JJ` est une date locale, sans fuseau ; un horodatage en nombre est en secondes sous 10¹², en millisecondes au-delà.
- `relative` : l'unité la plus grande qui donne au moins 1 (années, mois, semaines, jours, heures, minutes) ; moins d'une minute : « à l'instant ».
- `duration` : la plus grande unité non nulle parmi jours, heures, minutes, secondes, puis l'unité suivante si elle n'est pas nulle (3 605 s → « 1 h ») ; zéro : « 0 s ».
- `bytes` : unités de 1 000 (o, ko, Mo, Go, To).

## Variantes
Aucune. Le rendu suit le type.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `value` | `unknown` | — (obligatoire) | La donnée brute. |
| `type` | `ValueType` | `"text"` | Le type (tableau ci-dessus). |
| `statuses` | `StatusMap` (`{ [clé]: { label, tone } }`) | aucune | Pour `status` : clé → libellé et ton (`StatusTone`). |
| `currency` | `string` (ISO 4217) | `"EUR"` | Pour `money`. |
| `decimals` | `number` | selon le type | Pour `number`, `money`, `percent`, `bytes`. |
| `durationUnit` | `"ms" \| "s" \| "min"` | `"s"` | Unité de la valeur reçue, pour `duration`. |

Les options sauf `value` forment le type `ValueFormat`, partagé par les colonnes de `ListPage` et les propriétés de `DetailPanel`.

Fonctions exportées, pour les gabarits et l'app :
| Fonction | Rôle |
|---|---|
| `useFormatValue()` | Renvoie `(value, format) => string` : le texte affiché, dans la langue de `SocleProvider`. Sert à la recherche et aux noms accessibles. |
| `valueSortKey(value, format)` | Clé de tri : le nombre, l'horodatage, `0`/`1` pour un booléen, sinon le texte affiché ; `null` pour une valeur vide (toujours en dernier). |
| `valueLayout(type)` | `{ align: "start" \| "end", width?: number }` : alignement et largeur de colonne (D-172). |

## Exclus
- Pas de rendu personnalisé ni de fonction de format fournie par l'app : une donnée qui ne rentre dans aucun type se convertit en texte avant (`value` d'une colonne).
- Pas d'heure seule, pas d'unité physique (km, kg) dans cette version.
- `tags` n'a pas de pastilles : un texte suffit en liste et se lit d'un coup d'œil.
- Pas d'info-bulle sur une date relative : la cellule ne doit pas devenir un arrêt de tabulation.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Valeur présente | Le format du type. |
| Valeur vide (`null`, `undefined`, `""`, liste vide) | « — » en `--fg-3` (D-171). |
| Valeur illisible pour son type (date invalide, texte non numérique) | Le texte brut, sans erreur (D-171). |
| Statut inconnu de `statuses` | Le texte brut, ton `neutral`. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Chaque type suit son format français (D-170) | verrouillé | `TousLesTypes` |
| Valeur vide : « — » ; valeur illisible : texte brut (D-171) | verrouillé | `Vides` |
| La langue vient de `SocleProvider` (`messages.locale`) | verrouillé | `TousLesTypes` |
| `relative` se calcule à l'affichage, sans minuterie | verrouillé | `TousLesTypes` |

## Contenu
Le texte affiché vient des données. Les seuls libellés internes (« Oui », « Non », « à l'instant ») sont dans `messages` (D-089).

## Densité
Hérite de la taille du texte autour. Rien ne dépend de la densité.

## Clavier
Seuls `email` et `url` reçoivent le focus (ce sont des liens).

## Accessibilité
Les dates sont dans `<time datetime>`. Le statut a toujours un libellé (D-160). « — » est lu « vide » (`aria-label`).

## Taille d'écran
Sans objet : la valeur suit la place que lui donne son conteneur.

## Erreurs
Aucune erreur levée : une valeur illisible s'affiche telle quelle (D-171).

## Placement
Cellules de `ListPage` (Table et List), propriétés de `DetailPanel`, méta d'une ligne de `List`.

## Composition
Utilise `StatusBadge`, `Link` et `Code`. Pas d'autre composant.

## Décisions
D-089, D-160, D-170, D-171, D-172

## Questions ouvertes
Aucune.
