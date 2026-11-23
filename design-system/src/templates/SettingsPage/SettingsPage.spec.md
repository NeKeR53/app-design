# SettingsPage
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/SettingsPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## Rôle
Gabarit des réglages d'une app (D-015) : une navigation par rubriques à gauche, le contenu de la rubrique à droite, des lignes de réglage qui s'appliquent tout de suite (D-007). L'app décrit ses réglages par des données ; le gabarit dessine les contrôles (D-200). Il se pose dans un `Modal` `xl` (bureau, tablette) ou dans la zone `main` d'AppShell ; seul le conteneur change.

Ne pas l'utiliser pour :
- un formulaire qu'on envoie, avec « Annuler » et « Enregistrer » : prendre `FormPage` (D-022) ;
- les propriétés de l'élément courant : prendre `Drawer` et `PropertyRow` ;
- une longue liste qu'on cherche, trie et filtre : prendre `ListPage`, et `Table` ou `List` ;
- un choix ponctuel dans une modale : prendre `Modal` avec des champs.

## Anatomie
1. Navigation (`nav`, obligatoire), à gauche, `--surface-side`, 220 px en web, 200 px en desktop (D-201) :
   1. recherche (`SearchInput`, nom « Rechercher dans les réglages ») (D-202) ;
   2. groupes, séparés par un trait ; titre de groupe facultatif ;
   3. rubriques : icône (obligatoire) et libellé, `aria-current="page"` sur la rubrique courante ;
   4. lien externe en pied (facultatif), avec la flèche externe.
2. Contenu (`content`, obligatoire), défile seul (D-207) :
   1. titre de la rubrique (`h2`) ;
   2. sections : titre (`h3`, facultatif), description (facultative), actions de section (facultatives, `ActionBar` zone `section`), trait ;
   3. lignes de réglage pleine largeur : libellé et description à gauche, contrôle à droite (D-203) ; ou contenu libre de la section.

## Le modèle de données (D-200)
```ts
<SettingsPage groups={SettingsGroup[]} selectedId? onSelectionChange? footerLink? />
```
### `SettingsGroup`
| Champ | Type | Défaut | Description |
|---|---|---|---|
| `id` | `string` | — (obligatoire) | Identifiant stable. |
| `title` | `string` | aucun | Titre du groupe, en `--fs-sm` `--fg-3`. |
| `categories` | `SettingsCategory[]` | — (obligatoire) | Les rubriques du groupe. |

### `SettingsCategory` (une rubrique)
| Champ | Type | Défaut | Description |
|---|---|---|---|
| `id` | `string` | — (obligatoire) | Identifiant stable, unique dans le gabarit. |
| `label` | `string` | — (obligatoire) | Libellé dans la navigation et titre du contenu. |
| `icon` | `ReactNode` | — (obligatoire) | Icône de l'app, 16 px (D-011). |
| `keywords` | `string[]` | aucun | Mots de plus pour la recherche (D-202). |
| `sections` | `SettingsSection[]` | — (obligatoire) | Les sections du contenu. |
| `isLoading` | `boolean` | `false` | Squelettes à la place des sections (D-209). |
| `hasError` | `boolean` | `false` | Message d'erreur à la place des sections (D-209). |
| `onRetry` | `() => void` | aucun | Bouton « Réessayer » du message d'erreur. |

### `SettingsSection`
| Champ | Type | Défaut | Description |
|---|---|---|---|
| `id` | `string` | — (obligatoire) | Identifiant stable. |
| `title` | `string` | aucun | Titre de la section (`h3`). |
| `description` | `string` | aucune | Une phrase sous le titre. |
| `actions` | `Action[]` | aucune | Actions de la section, `ActionBar` zone `section` (D-113, D-206). |
| `settings` | `Setting[]` | `[]` | Les lignes. |
| `emptyMessage` | `string` | aucun | Phrase affichée quand `settings` est vide (D-206). |
| `content` | `ReactNode` | aucun | Contenu libre, sous les lignes : un composant de Socle (`Table`, `List`). |

### `Setting` (une ligne)
Champs communs : `id` (obligatoire), `label` (obligatoire, nom accessible du contrôle), `description` (facultative), `isDisabled` (facultatif ; sans effet pour `item` et `info`).

| `type` | Champs propres | Contrôle | Application |
|---|---|---|---|
| `switch` | `value: boolean`, `onChange(value)` | `Toggle` à libellé masqué (D-136) | Immédiate (D-204). |
| `select` | `value: string \| null`, `options: SelectOption[] \| SelectSection[]`, `onChange(id)`, `width?` (défaut `md`) | `Select` à libellé masqué | Immédiate (D-204). |
| `text` | `value: string`, `onChange(value)`, `inputType?: "text" \| "email" \| "url"`, `isRequired?`, `validate?`, `placeholder?`, `width?` (défaut `md`) | `TextInput` à libellé masqué | Entrée ou sortie du champ ; Échap rétablit (D-204). |
| `action` | `action: Action` | `Button` secondaire | Confirmée si `danger` ou `confirm` (D-205). |
| `item` | `code?: string`, `tags?: { label: string; tone?: StatusTone }[]`, `actions?: Action[]` | `ActionBar` zone `row` | Voir D-206. |
| `info` | `value: string`, `isCode?: boolean` | Texte `--fg-2`, ou `Code` | Lecture seule. |

`onChange` peut rendre une promesse : si elle rejette, la valeur précédente revient et un toast `danger` s'affiche (D-204).

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `groups` | `SettingsGroup[]` | — (obligatoire) | Les groupes de rubriques. |
| `selectedId` | `string` | dernière rubrique ouverte, sinon la première | Rubrique courante, si l'app la pilote. |
| `onSelectionChange` | `(id: string) => void` | aucun | Appelée au choix d'une rubrique. |
| `footerLink` | `{ label: string; href: string }` | aucun | Lien externe en pied de navigation (nouvel onglet). |

Exclus : `className`, `style` ; un titre propre (celui du `Modal` ou de la barre du haut suffit) ; un contrôle segmenté ; un bouton « Enregistrer ».

## Variantes
Aucune variante visuelle. Le conteneur seul change : `Modal` `xl` ou zone `main` (D-208).

## États
- Rubrique : par défaut ; survol `--hover` ; courante `--selected` ; focus anneau accent (D-201).
- Ligne : par défaut ; contrôle désactivé (`isDisabled`, opacité 40 %) ; erreur de saisie sous le champ (`text`, D-132) ; action en attente (bouton en chargement, D-116).
- Rubrique en chargement : squelettes après 200 ms (D-165, D-209).
- Rubrique en erreur : message centré « Impossible de charger ces réglages », « Réessayer » (D-209).
- Section vide : `emptyMessage` en `--fg-3` (D-206).
- Recherche sans résultat : « Aucune rubrique trouvée. » (D-202).

## Comportement
- Ouverture : la rubrique `selectedId`, sinon la dernière ouverte (mémorisée, D-007), sinon la première.
- Clic sur une rubrique : son contenu s'affiche, remonté en haut (D-207).
- `switch`, `select` : appliqués tout de suite ; `text` : à Entrée ou à la sortie du champ, si la valeur a changé et passe la vérification ; Échap rétablit (D-204). Pas de toast de réussite.
- Échec d'enregistrement : valeur précédente rétablie, toast `danger` « Le réglage n'a pas été enregistré. » avec le message de l'erreur (D-204).
- Dans un `Modal`, un réglage changé ne bloque pas le clic hors (D-208).
- Aucune animation propre.

## Contenu
- Libellés de ligne et descriptions : retour à la ligne, jamais coupés ; description 72 caractères par ligne au plus.
- Libellé de rubrique trop long : coupé avec « … » dans la navigation, en entier dans le titre.
- Titre de section absent : les lignes suivent directement.
- Beaucoup de rubriques : la navigation défile ; le lien de pied reste en bas.

## Densité
| | Web | Desktop |
|---|---|---|
| Navigation | 220 px | 200 px |
| Marge du contenu | 28 px | 24 px |
| Marge verticale d'une ligne | 12 px | 10 px |
Hauteurs des rubriques et des contrôles : `--row-h`.

## Clavier
- Tab : recherche, rubriques dans l'ordre, lien de pied, puis les contrôles du contenu.
- Entrée dans la recherche : ouvre la première rubrique trouvée (D-202). Mod+F : focus dans la recherche (D-083).
- Entrée ou Espace sur une rubrique : l'ouvre.
- `text` : Entrée applique, Échap rétablit la valeur enregistrée (un second Échap ferme la modale).
- Dans un `Modal` : focus d'abord dans la recherche (premier champ, D-125).

## Accessibilité
- `nav` nommée « Rubriques des réglages » ; rubrique courante `aria-current="page"`.
- Contenu : région nommée par le libellé de la rubrique ; titres `h2` puis `h3`.
- Chaque contrôle porte le libellé de sa ligne comme nom accessible ; la description lui est liée (`aria-describedby`).
- Actions d'un `item` : groupe « Actions sur {libellé} » (ActionBar).
- Rubrique en chargement : `aria-busy` ; erreur : `role="alert"`.
- Cibles : `--row-h` au moins.

## Taille d'écran (D-208)
Requête de conteneur sur le gabarit. Sous 640 px de large : navigation seule, en liste, avec un chevron à droite de chaque rubrique ; choisir une rubrique montre son contenu, avec la flèche « Retour aux rubriques » devant le titre. Les contrôles `select` et `text` passent sous le texte de la ligne, sur toute la largeur. Au-dessus de 640 px : les deux colonnes.

## Erreurs
- Saisie invalide (`text`) : message sous le champ, bord rouge (D-132) ; la valeur n'est pas envoyée.
- Échec d'enregistrement ou d'action : toast `danger` (D-154, D-159) ; la valeur précédente revient.
- Échec du chargement d'une rubrique : message centré avec « Réessayer » (D-209).

## Niveau de réglage
| Élément | Niveau |
|---|---|
| Rendu, tailles, marges, comportement | Verrouillé |
| Rubriques, sections, réglages, lien de pied | Par page (données) |
| Libellés internes | Par app (`SocleProvider` `messages`, D-089) |

## Placement
- Dans le corps d'un `Modal` `xl`, sans pied (tout s'applique tout de suite), titré « Réglages » (D-015, D-120).
- Ou dans la zone `main` d'AppShell, le nom de la page dans la barre du haut.
- Jamais dans le panneau de détail, ni dans une modale plus petite que `xl` (sauf sur mobile, en plein écran).

## Composition
Contient : `SearchInput`, `Toggle`, `Select`, `TextInput`, `Button`, `ActionBar`, `Code`, `Badge`, `Skeleton`, `EmptyState` (message d'erreur), `IconButton` (retour).
Ne se combine pas avec : `FormPage` (pas de pied d'envoi), `Drawer`.

## Questions ouvertes
Aucune.
