# Pagination
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/Nouveaux-P2-P3-v1.html (P1, option A)

## Rôle
`Pagination` permet d'aller d'une page de résultats à une autre : précédent, numéros, suivant. `ListPage` l'utilise en mode `pages` (D-175, D-359).

Ne pas l'utiliser pour :
- une liste qui s'allonge : « Afficher plus » reste le défaut de `ListPage` (D-175) ;
- des étapes d'un parcours : prendre `ProgressIndicator` ;
- les pages d'un document : `DocumentViewer` a sa propre navigation.

## Anatomie
1. Repère `nav` (obligatoire), nommé « Pagination ».
2. Précédent : `IconButton` chevron gauche, « Page précédente ».
3. Numéros (bureau et tablette) : boutons de la taille d'un bouton-icône, rayon 8 px ; page courante en `--selected`, semi-gras ; « … » en `--fg-3` pour un saut.
4. Texte « Page 5 sur 13 » (mobile), à la place des numéros.
5. Suivant : `IconButton` chevron droit, « Page suivante ».

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `page` | `number` | — (obligatoire) | Page courante, à partir de 1. Ramenée entre 1 et `pageCount`. |
| `pageCount` | `number` | — (obligatoire) | Nombre de pages (1 au moins). |
| `onPageChange` | `(page: number) => void` | — (obligatoire) | Page demandée ; l'app change `page`. |
| `label` | `string` | « Pagination » (i18n) | Nom du repère, à préciser s'il y a deux paginations sur la page. |

La fonction pure `pageEntries(page, pageCount)` donne la suite affichée (numéros et sauts).

## Exclus
- Pas de champ « aller à la page », pas de « première » ni de « dernière » : 1 et le dernier numéro sont toujours visibles.
- Pas de choix du nombre de lignes : il reste dans le pied de `ListPage`.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Page courante | `aria-current="page"`, fond `--selected`. |
| Première page | « Page précédente » désactivé. |
| Dernière page | « Page suivante » désactivé. |
| Une seule page | Les deux flèches désactivées, « 1 » seul. L'app peut ne pas afficher la pagination. |

## Comportement
- Sept entrées au plus, largeur stable : `1 2 3 4 5 … 13`, `1 … 4 5 6 … 13`, `1 … 9 10 11 12 13`. Jusqu'à 7 pages, tous les numéros.
- Un clic sur un numéro, sur précédent ou suivant appelle `onPageChange`. Le numéro de la page courante n'appelle rien.
- Le focus reste dans la pagination quand le bouton pressé devient inactif (première, dernière page) : il va sur la page courante.
- L'app remonte la liste en haut et charge la page ; la pagination ne fait que demander.

## Contenu
Libellés fixes, du dictionnaire : « Page précédente », « Page suivante », « Page 5 », « Page 5 sur 13 ». Nombres au format de la langue.

## Densité
Boutons de la taille `--icon-btn` (28 px en web, 24 px en desktop ; 44 px sur écran tactile).

## Clavier
Tab parcourt précédent, chaque numéro, suivant. Entrée ou Espace active. Un bouton désactivé est sauté.

## Accessibilité
- Repère `nav` nommé ; la liste des numéros est une liste (`ul`).
- Chaque numéro est nommé « Page n » ; la page courante a `aria-current="page"`.
- « … » est caché aux lecteurs d'écran.

## Taille d'écran
- Sous 641 px (D-013) : « Page 5 sur 13 » entre les deux flèches ; les numéros sont cachés.
- À partir de 641 px : les numéros.

## Erreurs
Valeurs hors bornes ramenées : `page` entre 1 et `pageCount`, `pageCount` à 1 au moins.

## Niveau de réglage
L'app donne la page, le nombre de pages et le nom du repère. Le reste est fixe.

## Placement
Pied de liste ou de tableau, calé à droite (`ListPage`, `footer`). Une seule pagination par liste.

## Composition
`IconButton`, `Button` de React Aria pour les numéros, icônes Socle.

## Décisions
D-013, D-040, D-175, D-359.

## Questions ouvertes
