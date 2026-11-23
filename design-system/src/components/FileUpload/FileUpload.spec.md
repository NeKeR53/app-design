# FileUpload et FileList
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/Nouveaux-P2-P3-v1.html (F1 à F3, options A)

## Rôle
`FileUpload` ajoute des fichiers à un formulaire ou à un élément : par glisser-déposer ou par le bouton. Il vérifie le type et la taille avant de transmettre les fichiers à l'app. Il n'envoie rien : l'app envoie et rend l'état de chaque fichier (D-357).

`FileList` montre une liste de fichiers avec leur état d'envoi. `FileUpload` l'utilise sous sa zone ; une app peut aussi l'utiliser seule (pièces jointes d'un élément, D-018).

Ne pas l'utiliser pour :
- une image dans un texte : `MarkdownEditor` gère son propre ajout ;
- importer des données à traiter (CSV) avec un aperçu : un parcours dédié, dans une `Modal`.

## Anatomie
`FileUpload`, de haut en bas (anatomie de Field, D-022, D-130) :
1. Libellé (obligatoire, masquable) : « (facultatif) » sans `isRequired`.
2. Zone de dépôt (obligatoire) : trait de 1,5 px en pointillés `--line-strong`, rayon 8 px. Au centre : icône d'envoi, phrase « Déposez des fichiers ici ou choisir des fichiers » (le bouton est « choisir des fichiers », en `--fg`, graisse moyenne), puis l'aide de la zone « PDF ou image, 10 Mo au plus » en `--fg-3`.
3. Aide ou erreur de l'app, sous la zone (`--fs-sm`).
4. Liste des fichiers de l'app (`files`).
5. Liste des fichiers refusés, nommée « Fichiers refusés ».

`FileList`, une ligne par fichier, séparée par un trait `--line` :
1. Icône du type (image, document, archive, autre), 16 px, `--fg-2` (`--danger` en erreur).
2. Nom, coupé au milieu s'il est trop long : la fin et l'extension restent visibles.
3. Sous le nom : taille et état (« 1,2 Mo · En attente »), ou l'erreur en `--danger`.
4. Pendant l'envoi : barre fine de 3 px, `--accent` sur `--field`.
5. À droite : « Réessayer » (bouton `subtle` `sm`, en erreur) et × (`IconButton`, « Retirer <nom> »).

## Variantes
| Option | Rendu |
|---|---|
| Un fichier (défaut) | « Déposez un fichier ici ou choisir un fichier ». Un dépôt de plusieurs fichiers garde le premier et refuse les autres. |
| `multiple` | « Déposez des fichiers ici ou choisir des fichiers ». |

## Options
`FileUpload` :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Libellé et nom du groupe. |
| `hideLabel` | `boolean` | `false` | Masque le libellé ; il reste le nom accessible. |
| `description` | `string` | aucune | Aide sous la zone. |
| `isRequired` | `boolean` | `false` | Sans lui, « (facultatif) » suit le libellé. |
| `error` | `string` | aucune | Erreur de l'app, à la place de l'aide ; zone en `--danger`. |
| `isDisabled` | `boolean` | `false` | Zone et bouton désactivés, 40 %. |
| `accept` | `string[]` | tout type | Extensions (`.pdf`), types MIME (`application/pdf`), familles (`image/*`). |
| `acceptLabel` | `string` | construit | Types en clair, si le texte construit ne convient pas. |
| `maxSize` | `number` (octets) | aucune | Taille maximale d'un fichier. |
| `multiple` | `boolean` | `false` | Plusieurs fichiers à la fois. |
| `onAdd` | `(files: File[]) => void` | — (obligatoire) | Reçoit les fichiers acceptés. |
| `files` | `FileItem[]` | aucune | Fichiers ajoutés, avec leur état. |
| `onRemove`, `onRetry` | `(id: string) => void` | aucun | × et « Réessayer » des fichiers de `files`. |

`FileList` : `files` (obligatoire), `onRemove`, `onRetry`, `label` (défaut « Fichiers »). Sans `onRemove` ni `onRetry`, la liste est en lecture.

`FileItem` : `id` (obligatoire), `name` (obligatoire), `size` (octets), `type` (MIME), `status` (`pending`, `uploading`, `done` par défaut, `error`), `progress` (0 à 100), `error` (texte).

## Exclus
- Pas d'envoi intégré vers une adresse (D-357, option B écartée) : l'authentification et l'API restent à l'app.
- Pas de vignettes d'images (D-357, option B écartée), pas d'aperçu.
- Pas de dossier entier : un dossier déposé est ignoré.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Zone en pointillés. |
| Fichier glissé au-dessus | Trait plein `--focus`, fond `--hover`. |
| Focus clavier sur la zone | Anneau `--focus` autour de la zone. |
| Erreur de l'app | Trait `--danger`, message sous la zone. |
| Désactivé | 40 %, dépôt et bouton inactifs. |
| Fichier en attente | « En attente » sous le nom. |
| Envoi | Barre fine ; « Envoi : 60 % » (indéterminée sans `progress`). |
| Envoyé | Taille seule. |
| Erreur d'un fichier | Message sous le nom, en `--danger` ; « Réessayer » si `onRetry`. |

## Comportement
- Le type et la taille sont vérifiés avant `onAdd`, au dépôt comme au choix. Un fichier refusé n'est jamais transmis.
- Un fichier refusé est listé avec son erreur : « Type non accepté : ZIP. », « Fichier trop lourd : 12 Mo, 10 Mo au plus. », « Un seul fichier à la fois. ». Son × le retire. Un nouvel ajout remplace la liste des refus.
- Le bouton ouvre la boîte de choix du système, filtrée par `accept`.
- La zone accepte aussi un fichier collé (Mod+V) quand elle a le focus.
- L'app ajoute les fichiers acceptés à `files`, puis met à jour leur `status` et leur `progress`.

## Contenu
- Aide de la zone : construite à partir de `accept` et `maxSize` (« PDF ou image, 10 Mo au plus ») ; `acceptLabel` la remplace pour les types.
- Erreur d'un fichier venue de l'app : une phrase qui dit quoi faire (« Le serveur ne répond pas. Réessayez. »).

## Densité
Zone : marges fixes (14 px en haut et en bas, 16 px sur les côtés). Lignes de fichier : 6 px de marge verticale ; textes et boutons suivent la densité.

## Clavier
- Tab : la zone (pour coller un fichier), puis « choisir des fichiers ». Entrée ou Espace sur le bouton ouvre la boîte de choix.
- Dans la liste : Tab parcourt « Réessayer » et × de chaque ligne.

## Accessibilité
- `FileUpload` est un groupe nommé par le libellé ; le bouton est décrit par l'aide de la zone et l'aide ou l'erreur du champ.
- Les fichiers forment une liste nommée (« Fichiers », « Fichiers refusés »).
- Chaque changement d'état est annoncé poliment (« Devis.pdf : Envoyé ») ; rien n'est lu à l'affichage de la liste, ni à chaque pas de l'avancement.
- La barre d'envoi est un `progressbar` nommé « Envoi de <nom> ».
- Nom coupé : le nom complet est dans l'info-bulle au survol, dans le nom du × (« Retirer <nom complet> ») et dans le texte lu.

## Taille d'écran
- La zone prend toute la largeur de la colonne.
- Mobile : le glisser-déposer n'existe pas ; le bouton ouvre le choix du système (fichiers, photos, appareil photo).

## Erreurs
- Type, taille, nombre : messages par fichier, dans la liste des refus.
- Échec d'envoi : rendu par l'app (`status: "error"`, `error`) ; sans texte, « L'envoi a échoué. ».

## Niveau de réglage
L'app choisit les types, la taille, le nombre, les textes d'aide et d'erreur, l'état des fichiers. Le dessin est fixe.

## Placement
Dans un formulaire (`FormPage`, `useOpenForm`), comme un champ ; dans le panneau de détail pour des pièces jointes (D-018).

## Composition
`DropZone` et `FileTrigger` de React Aria, `fieldRoot` de `Field`, `Button`, `IconButton`, `OverflowTooltip`, `ProgressBar` de React Aria, `formatValue` de `FormattedValue` (octets).

## Décisions
D-018, D-022, D-130, D-132, D-357.

## Questions ouvertes
