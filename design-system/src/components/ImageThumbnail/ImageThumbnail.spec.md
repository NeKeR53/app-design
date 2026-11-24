# ImageThumbnail
Statut : validé (2026-11-24) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/ImageThumbnail-v1.html (par délégation de l'utilisateur, 2026-11-24)

## Rôle
Montrer une image qu'on consulte (envoyée, citée, produite, capturée) en vignette ; un clic l'agrandit (D-383). `ImageGallery` range plusieurs vignettes en groupes.
Ne pas l'utiliser pour :
- une pièce jointe avant l'envoi, à retirer : prendre `AttachmentChip` (D-374) ;
- l'aperçu d'un document dans une page : prendre `DocumentViewer` (D-310) ;
- la photo d'une personne : prendre `Avatar`.

## Anatomie
`ImageThumbnail` :
1. **Tuile** (obligatoire) : bord `--line`, rayon `--radius-md`, fond `--surface-side`, jamais plus large que son conteneur. Prête, c'est un bouton « Agrandir <alt> », curseur loupe.
2. **Image** : selon la forme (voir Variantes).
3. **Légende** (facultative) : sous la tuile, 4 px d'écart, `--fs-sm`, `--fg-2`, une ligne coupée par « … », texte complet en info-bulle s'il est coupé.
4. **Chargement** : `Skeleton` plein dans la tuile, nommé « Chargement de <alt> » (après 200 ms, D-165).
5. **Erreur** : icône d'image barrée, « Image indisponible », bouton `sm` « Réessayer ».

**Vue agrandie** : `Modal` `xl` titrée par `alt` ; corps : `DocumentViewer` qui remplit la modale (zoom, « Télécharger » si `onDownload`) ; pied, s'il y a plusieurs images : précédente · « 2 / 5 » · suivante, calés à droite comme tout pied de modale (D-124), centrés sur mobile.

`ImageGallery` :
1. **Groupe** : liste `ul` nommée, vignettes en ligne, 8 px d'écart, alignées en haut, passent à la ligne.
2. **Tuile « + N »** (si `visible` cache des images) : en tête du groupe, de la taille d'une tuile, « + N » en `--fs-md`, `--fg-2`.
3. **Plusieurs groupes** (`groups`) : groupe nommé par `label`, 12 px entre les groupes.

## Variantes
| `shape` | Taille | Image | Usage |
|---|---|---|---|
| `wide` (défaut d'`ImageThumbnail`) | 360 px, 4:3 | entière (`contain`) | Image produite ou citée dans un message. |
| `square` (défaut d'`ImageGallery`) | 160 px, carrée | recadrée (`cover`) | Image jointe à un message envoyé, photo. |
| `page` | 160 px, 16:10 | recadrée, haut de l'image | Capture d'une page ou d'un document long. |

## Options
`ImageThumbnail` :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `alt` | `string` | — (obligatoire) | Texte de remplacement, titre de la vue agrandie. |
| `src` | `string` | aucune | Adresse (`blob:`, `data:`, `https:`). Absente : chargement (l'app lit encore le fichier). |
| `shape` | `"wide" \| "square" \| "page"` | `"wide"` | Forme. |
| `caption` | `string` | aucune | Légende sous la vignette. |
| `status` | `"loading" \| "error"` | aucun | État imposé par l'app pendant sa propre lecture. |
| `onRetry` | `() => void` | aucun | « Réessayer » relance la lecture de l'app. Une image dont l'adresse ne s'affiche pas se réessaie toujours, avec ou sans lui. |
| `onDownload` | `() => void` | aucun | « Télécharger » dans la vue agrandie. |

`ImageGallery` :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Nom de la galerie (« Captures de l'agent »). |
| `images` | `ImageGalleryItem[]` | — | Un seul groupe. `images` ou `groups`, pas les deux. |
| `groups` | `{ id, label, images }[]` | — | Plusieurs groupes (une page capturée, un jour). |
| `shape` | `ImageShape` | `"square"` | Forme des vignettes. |
| `visible` | `number` | toutes | Vignettes visibles par groupe, les plus récentes ; les autres derrière « + N ». |
| `onDownload` | `(image) => void` | aucun | « Télécharger » dans la vue agrandie. |
| `onView` | `(image) => void` | aucun | La vue agrandie montre une image sans `src` : l'app la lit, puis passe `src`. |

`ImageGalleryItem` : `id` (obligatoire), puis `src`, `alt`, `caption`, `status`, `onRetry` comme `ImageThumbnail`. Les images vont de la plus ancienne à la plus récente.

## Exclus
- Pas de largeur, de rapport ni de recadrage libres : trois formes (D-383).
- Pas de × pour retirer : c'est `AttachmentChip`.
- Pas de parcours en boucle, pas de flèches sur l'image, pas de diaporama.
- Pas de vidéo ni de PDF en vignette.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Chargement | `Skeleton` plein, « Chargement de <alt> ». |
| Prête | Image ; bouton qui agrandit. |
| Survol | Bord `--line-strong`. |
| Focus | Anneau de focus commun (`--focus`). |
| Erreur | « Image indisponible » ; « Réessayer » (si l'image vient de `src`, ou si `onRetry`). |
| Vue agrandie, image sans `src` | `Skeleton`, puis l'image quand l'app passe `src` (`onView`). |
| Vue agrandie, image en erreur | `EmptyState` compact « Image indisponible » ; « Réessayer » si `onRetry`. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Trois formes : 360 px 4:3 entière, 160 px carrée recadrée, 160 px 16:10 haut (D-383) | réglable (`shape`) | `Formes` |
| Un clic ou Entrée ouvre la vue agrandie ; Échap la ferme, le focus revient à la vignette | verrouillé | `Agrandir` |
| « Télécharger » de la vue agrandie appelle `onDownload` | réglable | `Agrandir` |
| Image qui ne s'affiche pas : « Image indisponible », « Réessayer » relance l'image (D-383) | verrouillé | `ErreurEtNouvelEssai` |
| `status: "error"` : « Réessayer » appelle `onRetry` ; sans lui, pas de bouton | réglable | `ErreurDeLApp` |
| Sans `src`, ou `status: "loading"` : chargement | réglable | `Chargement` |
| Légende sur une ligne, coupée, texte complet en info-bulle | verrouillé | `Galerie` |
| `visible` : les plus anciennes derrière « + N » en tête ; il ouvre la plus récente des cachées (D-383) | réglable | `Galerie` |
| Vue agrandie d'une galerie : précédente · « n / N » · suivante ; ← → ; arrêt aux bornes (D-383, D-314) | verrouillé | `ParcoursAuxFleches` |
| À une borne, le focus du bouton désactivé passe à l'autre bouton | verrouillé | `ParcoursAuxFleches` |
| ← → laissés à un champ et à une image zoomée qui défile en largeur | verrouillé | décrit, non testé |
| Image cachée sans `src` : `onView` la demande à l'app | réglable | `ImageALire` |

## Contenu
- `alt` : le nom du fichier ou ce que montre l'image (« Accueil — exemple.com »).
- Légende : courte, sans répéter le nom du groupe.

## Densité
Mêmes tailles dans les deux densités ; le pied et la barre de la vue agrandie suivent `--icon-btn` et `--bar-h`.

## Clavier
Tab atteint « + N », puis chaque vignette prête, puis « Réessayer » d'une vignette en erreur. Entrée ou Espace ouvre. Dans la vue agrandie : ← et → changent d'image, Échap ferme, Tab parcourt le ×, la barre de `DocumentViewer`, la zone, puis précédente et suivante.

## Accessibilité
- Vignette prête : bouton « Agrandir <alt> » ; image `alt`.
- Chargement : `status` « Chargement de <alt> ». Erreur : « Image indisponible », bouton « Réessayer <alt> ».
- Galerie : `ul` nommée par le groupe ; plusieurs groupes : `group` nommé par `label`. « + N » : « Voir N autres images de <groupe> ».
- Vue agrandie : modale nommée par `alt` ; position en `aria-live="polite"`. Libellés dans `messages` (D-089).

## Taille d'écran
La tuile ne dépasse pas son conteneur. Sur mobile, la vue agrandie est en plein écran (`Modal` `xl`, D-121).

## Erreurs
Deux sources : l'image dont l'adresse ne s'affiche pas (le composant réessaie) ; la lecture de l'app (`status: "error"`, `onRetry`).

## Placement
Sous un message (images envoyées, images produites), dans le travail d'un agent (captures), dans le corps d'une page de détail. Pas dans une ligne de `Table` ni de `List`.

## Composition
`Modal`, `DocumentViewer`, `IconButton`, `Button`, `EmptyState`, `Skeleton`, `SkeletonGroup`, info-bulle interne (`OverflowTooltip`). Icônes internes `ImageOff`, `ChevronLeft`, `ChevronRight`.

## Décisions
D-040, D-089, D-120, D-121, D-165, D-310, D-312, D-314, D-374, D-383.

## Questions ouvertes
Aucune.
