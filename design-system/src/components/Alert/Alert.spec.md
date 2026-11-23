# Alert
Statut : validé (2026-11-23) — Version : depuis 1.0.0
Validation : docs/validation/components/Nouveaux-P1-v1.html (A1 à A3, options A)

## Rôle
`Alert` est un encart de message dans le contenu, au-dessus de ce qu'il concerne : un stock bas sur une fiche, une synchronisation impossible au-dessus d'une liste, une adresse vérifiée sous un formulaire. Il dit aussi un état durable de la page ou de l'app (lecture seule, hors ligne, données d'exemple), en tête du contenu : la barre du haut n'en affiche plus (D-253).
Ne pas l'utiliser pour :
- le résultat d'une action qui n'a pas de place dans la page : prendre un toast (`useNotify`, D-154) ;
- une erreur de champ : elle va sous le champ (`Field`, D-132) ;
- un bandeau pleine largeur : il n'existe pas (D-159).

## Anatomie
Carte en grille à trois colonnes :
1. **Icône de ton** (16 px) : seule partie colorée (`--info`, `--success`, `--warning`, `--danger`) (D-151).
2. **Contenu** : titre facultatif (`--fw-semibold`, `--fg`), texte (`--fs-sm`, `--fg-2` sous un titre, `--fg` seul), action facultative dessous (8 px).
3. **Croix** (`IconButton`, 14 px) : seulement avec `onDismiss`, jamais pour `danger`.
Fond `--surface`, trait 1 px `--line`, rayon 8 px, sans ombre ; marges 10 px en haut et en bas, 12 px à gauche.

## Variantes
| Ton | Icône | Usage |
|---|---|---|
| `info` (défaut) | cercle « i » | Information utile, sans urgence. |
| `success` | cercle coché | Vérification réussie, sur place. |
| `warning` | triangle | Risque à venir. |
| `danger` | cercle « ! » | Erreur qui bloque ; pas de croix. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `tone` | `"info" \| "success" \| "warning" \| "danger"` | `"info"` | Ton. |
| `title` | `string` | aucun | Titre court. |
| `children` | `ReactNode` | — (obligatoire) | Texte, une ou deux phrases ; un `Link` est permis. |
| `action` | `{ label, onPress }` | aucune | Une seule action, bouton `secondary` `sm`. |
| `onDismiss` | `() => void` | aucune | Affiche la croix ; sans effet pour `danger`. |
| `announce` | `boolean` | `false` | L'encart apparaît après une action : `role="status"`, ou `role="alert"` pour `danger`. |

## Exclus
- Pas de fond ni de trait teintés (D-355, option B écartée), pas de barre de ton à gauche (option C écartée).
- Pas de deuxième action (D-355, option B écartée).
- Pas de bandeau pleine largeur, pas de position fixe (D-159).
- Pas de fermeture automatique.
- Pas de `className` ni de `style`.

## États
Statique (présent au chargement) ou annoncé (`announce`). Pas de survol : seuls l'action, le lien et la croix réagissent.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Carte neutre pour tous les tons ; seule l'icône est colorée ; le ton est lu avant le titre (D-355, D-151) | verrouillé | `Tons` |
| Une action au plus ; un lien est permis dans le texte (D-355) | réglable (`action`) | `AvecAction` |
| La croix n'existe que si l'app fournit `onDismiss` (D-355) | réglable | `Fermeture` |
| Une alerte `danger` n'a jamais de croix (D-355) | verrouillé | `ErreurSansCroix` |
| Présente au chargement : simple bloc ; après une action : `status`, ou `alert` pour `danger` (D-355) | réglable (`announce`) | `Annonce` |

## Contenu
- Titre : quelques mots, sans point (« Stock bas »).
- Texte : ce qui se passe, puis ce qu'on peut faire (« L'article A-12 sera épuisé dans 3 jours. »).
- Action : un verbe (« Commander », « Réessayer »).

## Densité
Marges fixes ; l'action et la croix suivent `--btn-h-sm` et `--icon-btn`. Clair et sombre par les tokens.

## Clavier
Tab passe par le lien, l'action, puis la croix. L'encart lui-même ne prend pas le focus.

## Accessibilité
- Le nom du ton (« Alerte : », « Erreur : ») est lu avant le titre (texte masqué, comme les toasts, D-152).
- `announce` : `role="status"` (poli) ou `role="alert"` (immédiat) ; l'app insère l'encart après l'action pour qu'il soit lu.
- La croix est nommée « Fermer le message ».

## Taille d'écran
Toute la largeur de son conteneur, jamais de la fenêtre ; le texte passe à la ligne.

## Erreurs
Sans objet.

## Placement
Au-dessus de ce qu'il concerne, dans le contenu (D-085, D-159) : en tête d'une section, d'un formulaire, d'une liste.

## Composition
`ToneIcon` (Toast), `Button`, `IconButton`.

## Décisions
D-085, D-151, D-152, D-159, D-355.

## Questions ouvertes
Aucune.
