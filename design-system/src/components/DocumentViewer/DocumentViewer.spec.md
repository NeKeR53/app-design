# DocumentViewer
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/Documents-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Montrer l'aperçu d'un document dans une page : PDF (dessiné par pdf.js) ou image (D-310).
Ne pas l'utiliser pour :
- du texte brut ou du code : `Code` en bloc ;
- du Markdown : `Markdown` ;
- un HTML reçu (courriel, page) : `HtmlContent` ;
- une vignette dans une liste : `Avatar` ou l'image de l'app.

## Anatomie
1. Cadre (obligatoire) : bord `--line`, rayon `--radius-lg`, fond `--surface`.
2. Barre d'outils (obligatoire), hauteur `--bar-h`, trait bas `--line` (D-312) :
   - position : « Page n / N » pour un PDF, sinon le nom ; `--fs-sm`, `--fg-2`, chiffres tabulaires, coupé par « … » ;
   - page précédente, page suivante (PDF prêt) ;
   - zoom arrière, pourcentage, zoom avant, « Ajuster à la largeur » (bascule) (document prêt) ;
   - « Télécharger » (si `onDownload`) ;
   - actions de l'app (`actions`, `ActionBar` zone `toolbar`).
   Un trait vertical `Divider` sépare les groupes.
3. Zone du document : fond `--surface-side`, marge 16 px, défilement propre, focusable.
4. Page d'un PDF : fond `--paper` (blanc dans les deux thèmes, D-315), ombre `--shadow-sm`, espacées de 12 px, centrées.
5. Image : centrée, sans fond.
6. Message (chargement, erreur, format non pris en charge) à la place de la zone.

## Variantes
Aucune. Le format choisit le contenu de la zone.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Nom accessible du document : « Facture F-2026-114 ». |
| `src` | `string` | — | Adresse `data:`, `blob:` ou `https:`. Une seule source : `src` ou `data`. |
| `data` | `Blob \| ArrayBuffer \| Uint8Array` | — | Octets du document (un `File` déposé, une réponse lue). |
| `name` | `string` | nom du `File` | Nom du fichier : affiché dans la barre, sert à reconnaître le format. |
| `type` | `string` | type du `Blob` | Type MIME, quand la source ne le dit pas. |
| `loadPdf` | `() => Promise<PdfEngine>` | aucun | Charge pdf.js : `() => import("pdfjs-dist")` (D-311). Sans lui, un PDF est en erreur. |
| `onDownload` | `() => void` | aucun | Affiche « Télécharger » ; l'app crée le fichier. |
| `actions` | `Action[]` | `[]` | Actions de l'app à la fin de la barre (zone `toolbar`, D-111). |
| `height` | `"fixed" \| "fill"` | `"fixed"` | `fixed` : hauteur bornée entre 360 et 720 px ; `fill` : remplit son conteneur flex. |

## Exclus
- Pas de texte, de Markdown, de tableur, de vidéo. Pas d'annotation, de recherche dans le PDF, de sélection de texte, d'impression.
- Pas de saisie du numéro de page, pas de vignettes, pas de rotation.
- Pas de `className`, pas de couleur de page réglable.

## États
| État | Rendu |
|---|---|
| Chargement | `SkeletonGroup` en forme de page, « Lecture du document… », après 200 ms (D-316). |
| Prêt | Pages ou image. |
| Erreur | `EmptyState` compact « Document illisible » + cause + « Réessayer » (D-316). |
| Format non pris en charge | `EmptyState` compact « Format non pris en charge » + extension + « Télécharger » si `onDownload`. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Format par type MIME, puis par extension (D-310) | verrouillé | `FormatInconnu`, `ImagePetite` |
| Ouverture ajustée à la largeur ; image jamais agrandie au-delà de 100 % en mode ajusté (D-313) | verrouillé | `ImagePetite` |
| Zoom par paliers 25 → 400 % ; boutons désactivés aux bornes (D-313) | verrouillé | `Zoom` |
| Ctrl/⌘ + « + », « − », « 0 » dans la visionneuse (D-313) | verrouillé | `ZoomClavier` |
| Ctrl/⌘ + molette : zoom continu autour du pointeur (D-313) | verrouillé | décrit, non testé |
| Pages dessinées à l'approche de la zone visible ; dessin gardé pendant le zoom (D-314) | verrouillé | `Pdf` |
| « Page n / N » suit la page en haut ; précédente/suivante y font défiler (D-314) | verrouillé | `Pages` |
| Sans `loadPdf` : erreur « Aperçu PDF indisponible » (D-311) | verrouillé | `SansPdfJs` |
| PDF invalide : erreur, « Réessayer » relance la lecture (D-316) | verrouillé | `Erreur` |
| « Télécharger » appelle `onDownload`, présent aussi en erreur (D-312, D-316) | verrouillé | `Erreur` |
| Une adresse `blob:` créée par le composant est libérée au démontage | verrouillé | — |

## Contenu
Nom long : coupé par « … ». PDF d'une page : précédente et suivante désactivées. Grande image : défile dans la zone.

## Densité
La barre suit `--bar-h` et `--icon-btn` ; le document garde sa taille.

## Clavier
Tab : boutons de la barre, puis la zone du document. Dans la zone : flèches et Page préc./suiv. défilent. Ctrl/⌘ + « + » / « − » / « 0 » partout dans la visionneuse.

## Accessibilité
Cadre `section` nommé par `label`. Barre `role="toolbar"`, nommée « Affichage du document ». Position en `aria-live="polite"`. Zone `role="document"`, nommée « {label}, N pages ». Chaque page `role="img"` « Page n ». Image : `alt` = `label`. Libellés dans le dictionnaire `messages` (D-089).

## Taille d'écran
Mobile : la barre garde position, zoom et Télécharger ; les actions de l'app passent dans « … » (ActionBar, D-117).

## Erreurs
Messages : PDF protégé par mot de passe ; PDF invalide ou abîmé ; aperçu PDF indisponible (pas de `loadPdf`, ou chargement de pdf.js en échec) ; lecture impossible.

## Placement
Corps d'une page de détail, panneau de détail large, modale `xl`. Pas dans une ligne de liste.

## Composition
Contient `IconButton`, `Divider`, `ActionBar`, `SkeletonGroup`, `EmptyState`, `Button`.

## Décisions
D-011, D-035, D-089, D-111, D-165, D-166, D-310 à D-316

## Questions ouvertes
Aucune.
