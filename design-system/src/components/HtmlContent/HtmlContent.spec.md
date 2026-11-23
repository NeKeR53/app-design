# HtmlContent
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/Documents-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Afficher sans risque un HTML reçu de l'extérieur : corps d'un courriel, page enregistrée, description riche d'un service (D-317).
Ne pas l'utiliser pour :
- du Markdown : `Markdown` ;
- un texte produit par l'app : composants de Socle ;
- un document PDF ou une image : `DocumentViewer`.

## Anatomie
1. Bandeau des images (si des images distantes sont masquées) : trait `--line`, rayon `--radius-md`, `--fs-sm`, `--fg-2` ; « N images masquées. » + `Button` `sm` « Afficher les images » (D-318).
2. Zone isolée (racine fantôme), `role="document"`, nommée par `label`.
3. Surface : `paper` (fond `--paper`, texte `--paper-fg`, marge 16 px, rayon `--radius-md`) ou `theme` (fond transparent, texte `--fg`, sans marge) (D-319).
4. Lien : souligné, `--paper-link` ou `--accent-text`, adresse en info-bulle native.
5. Image masquée : cadre vide de sa taille, fond `--paper-fg` ou `--fg` à 8 %.

## Variantes
| Surface | Quand |
|---|---|
| `paper` (défaut) | HTML qui porte ses couleurs : courriel, page. |
| `theme` | HTML simple sans couleurs : description riche d'un service. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `html` | `string` | — (obligatoire) | HTML reçu, nettoyé par le composant. |
| `label` | `string` | — (obligatoire) | Nom accessible : « Message de Paul ». |
| `onLink` | `(url: string) => void` | aucun | Lien cliqué (http, https, mailto). Sans lui, les liens sont du texte. |
| `resolveImage` | `(src: string) => string \| null \| Promise<string \| null>` | aucun | Adresse affichable d'une image `cid:` ou distante (proxy). |
| `imagesAllowed` | `boolean` | — | Images distantes permises (contrôlé). |
| `defaultImagesAllowed` | `boolean` | `false` | Valeur de départ (non contrôlé). |
| `onImagesAllowedChange` | `(allowed: boolean) => void` | aucun | « Afficher les images » pressé. |
| `surface` | `"paper" \| "theme"` | `"paper"` | Surface (D-319). |

## Exclus
- Aucun script, formulaire, cadre, SVG, média, ni style chargé de l'extérieur. Pas de navigation dans l'app.
- Pas de `className`, pas de style ajouté par l'app dans la zone, pas d'inversion des couleurs en sombre.

## États
Images masquées (bandeau) ; images affichées ; contenu vide (zone vide, sans message).

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Liste blanche ; scripts, `on…`, formulaires, cadres, `javascript:` retirés (D-317) | verrouillé | `Nettoyage` |
| Styles de l'email bornés à la zone ; `:host`, `url()`, `@import` retirés (D-317) | verrouillé | `Isolation` |
| `position: fixed` reste dans la zone (`contain: content`) (D-317) | verrouillé | `Isolation` |
| Images distantes masquées, bandeau et « Afficher les images » (D-318) | verrouillé | `ParDefaut` |
| Image `data:` affichée ; `cid:` via `resolveImage` (D-318) | verrouillé | `ImagesJointes` |
| `imagesAllowed` contrôlé : pas de bandeau (D-318) | verrouillé | `ImagesPermises` |
| Clic ou Entrée sur un lien → `onLink(url)` (D-319) | verrouillé | `Liens` |
| Sans `onLink` : liens en texte (D-319) | verrouillé | `SansLiens` |
| Surface `theme` : couleurs du thème (D-319) | réglable par écran | `SurfaceTheme` |

## Contenu
Tableau ou image trop large : la zone défile horizontalement. Texte sans espace : coupé (`overflow-wrap: anywhere`).

## Densité
Le bandeau suit la densité ; le contenu garde ses propres tailles.

## Clavier
Tab parcourt le bouton du bandeau puis les liens du contenu. Entrée ouvre le lien.

## Accessibilité
Zone `role="document"` nommée par `label`. Bandeau `role="status"`. Libellés `imagesHidden`, `showImages` dans le dictionnaire `messages` (D-089). Les `alt` des images sont gardés.

## Taille d'écran
Prend la largeur de son conteneur.

## Erreurs
Une image qui ne se résout pas reste masquée, sans message.

## Placement
Corps d'un message dans une page de détail ou un panneau de détail.

## Composition
Contient `Button`. Peut suivre un en-tête de message de l'app.

## Décisions
D-089, D-315, D-317, D-318, D-319

## Questions ouvertes
Aucune.
