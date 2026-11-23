# Button
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.1.0
Validation : docs/validation/components/Button-v1.html

## Rôle
Bouton avec un libellé, et une icône facultative. Il déclenche une action : envoyer un formulaire, confirmer, annuler, réessayer, exporter.
Ne pas l'utiliser pour :
- une action fréquente et connue dans une barre d'outils, une ligne ou un en-tête : prendre `IconButton` ;
- aller vers une autre page : prendre un élément de `Sidebar`, un onglet (`Tabs`) ou un lien ;
- ouvrir une liste de choix : prendre le déclencheur de `DropdownMenu` ;
- une action dans une ligne du panneau de détail : prendre l'action de `PropertyRow` (D-059).

## Anatomie
1. Zone cliquable (obligatoire), rayon `--radius-md` de 8 px (D-040).
2. Icône (facultative), avant le libellé, 16 px en `currentColor` (D-011, D-106).
3. Libellé (obligatoire), texte d'une ligne, en `--fw-medium`.
4. Indicateur d'attente (pendant le chargement) : une roue à la place de l'icône, ou devant le libellé (D-105).

## Variantes
| Variante | Rendu | Quand l'utiliser |
|---|---|---|
| `primary` (principale) | Fond `--fg`, texte `--surface` : noir en clair, clair en sombre (D-102). | L'action attendue de la zone. Une seule par zone (layout-rules). |
| `secondary` (secondaire, par défaut) | Fond `--field`, texte `--fg`, sans contour (D-103). | Toute autre action : « Annuler », « Parcourir… », « Réessayer ». |
| `subtle` (discrète) | Fond transparent, texte `--fg-2` (D-100). | Un retour (« Tous les projets ») ou une action d'appoint dans une zone dense. |
| `danger` | Fond `--danger`, texte `--danger-fg` (D-104). | Le bouton qui exécute une action destructrice, en général dans sa confirmation. |

Variante signature d'un thème d'organisation (`theme.signature.buttonSecondary`, D-338) ; valeur par défaut : inchangée.
- `fill` (défaut) : `secondary` a un fond `--field` (D-103).
- `outline` : `secondary` a un fond transparent, un trait de 1 px et un texte en `--accent-text` ; survol `--hover`, pressé `--selected`. Le trait est intérieur : même taille, aucun décalage. Les autres variantes ne changent pas. `IconButton` n'a pas de variante secondaire : il ne change pas.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `children` | `string` | — (obligatoire) | Libellé visible. |
| `variant` | `"primary" \| "secondary" \| "subtle" \| "danger"` | `"secondary"` | Variante (voir plus haut). |
| `size` | `"md" \| "sm"` | `"md"` | `sm` pour le pied de section du panneau de détail et les zones denses (D-101). |
| `icon` | `ReactNode` | aucune | Icône de l'app (D-011) ou icône interne de Socle (D-028), placée avant le libellé (D-106). |
| `onPress` | `() => void` | — | Action. |
| `isPending` | `boolean` | `false` | Chargement : roue, clics ignorés, focus gardé, attente annoncée (D-105). |
| `isDisabled` | `boolean` | `false` | Désactivé. |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Rôle dans un formulaire. |
| `form` | `string` | aucun | Identifiant du formulaire à envoyer, quand le bouton est hors du `<form>` (pied de FormPage, de modale). |
| `aria-label` | `string` | aucun | Nom accessible plus précis quand le libellé seul est ambigu (« Approuver Projet X »). Il commence par le libellé visible (WCAG 2.5.3). |
| `autoFocus` | `boolean` | `false` | Prend le focus à l'affichage (par exemple l'action sûre d'une confirmation). |

## Exclus
- Pas d'icône seule : prendre `IconButton`.
- Pas d'icône après le libellé, ni de chevron de menu (D-106).
- Pas de libellé de remplacement pendant le chargement (`loadingLabel`) : le libellé reste (D-105).
- Pas de couleur d'accent : l'accent ne porte que du sens (D-102).
- Pas de pleine largeur, pas de bascule (`aria-pressed`), pas de rendu en lien (`href`) dans cette version.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Par défaut | Selon la variante. |
| Survol | `primary` : fond `--fg` mêlé à 18 % de `--surface`. `secondary` et `subtle` : fond `--hover` (texte `--fg` pour `subtle`). `danger` : rouge plus foncé en clair, plus clair en sombre. |
| Pressé | `primary` : mélange à 28 %. `secondary` et `subtle` : fond `--selected`. `danger` : mélange plus marqué. |
| Focus clavier | Anneau `--accent`, 2 px, décalé de 1 px. |
| Désactivé | Opacité 40 %, ni survol ni action. |
| Chargement | La roue remplace l'icône : la largeur ne change pas. Sans icône, la roue se place devant le libellé et le bouton s'élargit de 22 px. Ni survol ni action (D-105). |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Un clic, Entrée ou Espace appelle `onPress` | verrouillé | `Clavier` |
| Chargement : clics ignorés, focus gardé, `aria-disabled`, attente annoncée au lecteur d'écran (D-105) | verrouillé | `Chargement` |
| Chargement avec icône : la largeur du bouton ne change pas (D-105) | verrouillé | `Chargement` |
| Désactivé : aucune action | verrouillé | `Desactive` |
| `type="submit"` envoie le formulaire, même hors du `<form>` avec `form` | verrouillé | `Formulaire` |
| Changements d'état sans transition de couleur supérieure à 120 ms (D-014) | verrouillé | `Etats` |

## Contenu
- Libellé court : un verbe à l'infinitif, éventuellement suivi d'un nom (« Enregistrer », « Exporter l'historique »). Points de suspension si l'action demande une étape de plus (« Parcourir… »).
- Le libellé tient sur une ligne et n'est jamais tronqué : la largeur suit le texte. Les langues plus longues élargissent le bouton.
- Sans icône, le libellé est seul ; l'icône ne change pas la hauteur.

## Densité
| Taille | Web | Desktop |
|---|---|---|
| `md` | hauteur `--row-h` (34 px), marges 12 px, texte `--fs-md` | `--row-h` (28 px), marges 10 px, texte `--fs-md` |
| `sm` | `--btn-h-sm` (26 px), marges 10 px, texte `--fs-sm` | `--btn-h-sm` (24 px), marges 8 px, texte `--fs-sm` |

Icône de 16 px dans les deux tailles, écart de 6 px avec le libellé (D-101).

## Clavier
Focusable avec Tab. Entrée ou Espace déclenche l'action. Pendant le chargement, le bouton garde le focus.

## Accessibilité
- Rôle `button`, nom accessible = libellé visible, ou `aria-label` s'il est fourni.
- Chargement : `aria-disabled="true"` et un indicateur `progressbar` nommé « Chargement… » (dictionnaire `messages`, D-089). L'entrée et la sortie de l'attente sont annoncées au lecteur d'écran quand le bouton a le focus (React Aria).
- Contraste du libellé d'au moins 4,5:1 dans toutes les variantes et les deux modes : `--danger-fg` est blanc en clair et sombre en mode sombre (D-104).
- Cible d'au moins `--target-min` : 24 px, 44 px sur mobile.

## Taille d'écran
Sur mobile (≤ 640 px), la hauteur minimale passe à `--target-min` (44 px), pour les deux tailles. Les boutons d'une barre d'actions passent à la ligne s'ils manquent de place.

## Erreurs
Le bouton ne montre pas d'erreur. Après un échec, l'écran l'affiche (notification, bandeau ou message sous le champ), et le bouton revient à l'état par défaut.

## Placement
- Pied de FormPage et de modale : « Annuler » (`secondary`) puis l'action (`primary` ou `danger`), à droite.
- Zone `actions` de ListPage et en-tête de DetailPage : une `primary` au plus, les autres en `secondary`.
- Pied de section du panneau de détail : `size="sm"`, en `secondary` (D-059).
- État vide et erreur de chargement : une action (« Réessayer », « Effacer les filtres »).
- Jamais dans la barre supérieure (`IconButton` seulement), ni dans une ligne de liste, de tableau ou de propriété.

## Composition
Contient une icône facultative et un indicateur d'attente. Boutons voisins espacés de 8 px. Se combine avec `IconButton` dans une barre d'actions ; ne contient ni `Tooltip` ni `DropdownMenu`.

## Décisions
D-011, D-014, D-028, D-040, D-059, D-089, D-100, D-101, D-102, D-103, D-104, D-105, D-106, D-338

## Questions ouvertes
Aucune.
