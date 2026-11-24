# AgentActivity
Statut : validé (2026-11-23) — Version : depuis la version qui suit 1.0.0
Validation : docs/validation/components/Chat-v1.html (Q7 A, Q11 A) ; docs/validation/components/AgentActivity-v2.html (Q1 A, Q2 A, Q3 A, D-384)

## Rôle
`AgentActivity` montre un outil appelé par l'agent sur une ligne ; `ActivityGroup` montre une suite d'outils et la groupe derrière un résumé au-delà de 3, ou du seuil choisi par l'app (D-376, D-390).
Ne pas l'utiliser pour :
- l'étape en cours avec son temps écoulé : prendre `WorkStatus` ;
- le travail d'un tour terminé : le mettre dans `WorkSummary` ;
- un journal de commandes complet : prendre `LogViewer` ou `Terminal`.

## Anatomie
1. Ligne (obligatoire) : 28 px de haut au moins, `--fs-sm` en `--fg-2`, espaces de 8 px.
   - Icône de 15 px selon le type, ou `Spinner` `sm` pendant l'exécution.
   - Verbe puis objet en `--font-mono`, coupés avec une ellipse (texte entier en `title`). Avec `onObjectPress`, l'objet est un `Link` (D-167) en chasse fixe (D-384).
   - « Échec » en `--danger`, si l'outil a échoué ; « Arrêté » en `--fg-3`, si l'outil a été interrompu (D-384).
2. Chevron (si `detail` ou `attachments`) : la ligne devient un bouton qui ouvre la sortie. Si l'objet est un lien, le chevron est un bouton à part de 24 px, juste après le texte (D-384).
3. Sortie (si ouverte) : zone de texte en lecture seule, `--surface-side`, rayon `--radius-md`, marges 12 px, police à chasse fixe, de 2 à 12 lignes, 320 px au plus.
   - Pièces (si `attachments`) : sous le texte, espacées de 8 px, en rangée qui passe à la ligne ; groupe nommé « Pièces de … » (D-384).
4. Résumé du groupe (plus de 3 outils) : « 5 outils exécutés · 1 en cours · 1 en échec », chevron ; liste de 280 px au plus, qui défile.

## Variantes
| Type (`kind`) | Icône |
|---|---|
| `command` | Invite dans un cadre |
| `edit` | Crayon |
| `search` | Loupe |
| `read` | Livre ouvert |
| `think` | Cerveau |
| `other` (défaut) | Clé |

## Options
`AgentActivity`
| Option | Type | Défaut | Description |
|---|---|---|---|
| `kind` | `ActivityKind` | `"other"` | Type d'outil. |
| `verb` | `string` | — (obligatoire) | « Exécuté », « Modifié », « Lu ». |
| `object` | `string` | aucun | Commande, chemin, motif, en chasse fixe. |
| `status` | `"running" \| "done" \| "error" \| "stopped"` | `"done"` | État de l'outil ; `stopped` : interrompu (D-384). |
| `detail` | `string` | aucun | Sortie de l'outil, montrée à l'ouverture. |
| `onObjectPress` | `() => void` | aucun | Ouvre l'objet (fichier lu ou modifié) ; l'objet devient un lien. Sans `object`, sans effet (D-384). |
| `attachments` | `ReactNode` | aucun | Pièces produites par l'outil (vignettes d'image, `AttachmentChip`), sous le texte de la sortie ; rend la ligne ouvrable (D-384). |

`ActivityGroup`
| Option | Type | Défaut | Description |
|---|---|---|---|
| `items` | `ActivityItem[]` | — (obligatoire) | Outils (`id` + options d'`AgentActivity`). |
| `defaultExpanded` | `boolean` | déplié si un outil tourne | Ouverture au premier affichage. Avec `false`, le groupe reste replié pendant le travail ; le résumé suit le compte. |
| `groupAbove` | `number` | `3` | Nombre d'outils au-delà duquel ils se groupent derrière le résumé. Avec `1`, deux outils qui se suivent forment une seule ligne repliable (D-390). |

## Exclus
- Pas d'adresse (`href`) sur l'objet : l'app ouvre le fichier dans `onObjectPress` (D-384).
- Socle ne dessine pas les pièces : l'app fournit leur rendu dans `attachments` (D-384).
- Pas de pièces visibles sortie fermée (D-384).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| En cours | Roue à la place de l'icône ; « En cours » lu par le lecteur d'écran. |
| Terminé | Icône du type ; « Terminé » lu par le lecteur d'écran. |
| Échec | « Échec » visible en `--danger`. |
| Arrêté | Icône du type ; « Arrêté » visible en `--fg-3` (D-384). |
| Groupe avec arrêtés | « · n arrêté(s) » dans le résumé ; replié, les outils arrêtés ne restent pas visibles (D-384). |
| Groupe replié avec échec | Résumé en `--danger` ; les outils en échec restent visibles sous le résumé. |
| Survol d'une ligne ouvrable | Texte `--fg`. |
| Survol de l'objet en lien | Soulignement de 2 px (D-167). |
| Survol du chevron à part | Fond `--hover`, chevron `--fg`. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Icône par type, objet en chasse fixe, roue pendant l'exécution, « Échec » en `--danger` | verrouillé | `Lignes` |
| Avec `detail`, clic, Entrée ou Espace ouvrent la sortie, de 2 à 12 lignes | réglable par l'app (`detail`) | `Detail` |
| Jusqu'à 3 outils, une ligne chacun, sans résumé | réglable par l'app (`groupAbove`) | `PeuDOutils` |
| Au-delà de 3, résumé repliable au clavier | réglable par l'app (`groupAbove`) | `Groupe` |
| Résumé « n outils · r en cours » pendant le travail, « n outils exécutés » ensuite ; à jour à chaque outil (D-390) | verrouillé | `GroupeEnCours`, `UneLigneRepliee` |
| Déplié tant qu'un outil tourne, replié à la fin (sauf choix de l'utilisateur) | verrouillé | `GroupeEnCours` |
| Un outil en échec reste visible, groupe replié | verrouillé | `ErreurVisible` |
| Avec `onObjectPress`, l'objet est un lien ; la sortie s'ouvre par un chevron à part | réglable par l'app (`onObjectPress`) | `ObjetCliquable` |
| Les pièces viennent sous le texte de la sortie ; une pièce seule rend la ligne ouvrable | réglable par l'app (`attachments`) | `Pieces` |
| « Arrêté » en `--fg-3`, compté dans le résumé, pas gardé visible groupe replié | verrouillé | `Arrete` |

## Contenu
- Verbe au participe passé (« Exécuté », « Modifié », « Lu », « Recherché ») ; « Réflexion » pour `think`.
- Objet : la commande ou le chemin tels quels.

## Densité
Ligne de 28 px au moins dans les deux densités ; texte `--fs-sm`.

## Clavier
Tab atteint le résumé et chaque ligne ouvrable ; Entrée ou Espace ouvre ou ferme ; la sortie est atteinte au Tab et défile aux flèches. Si l'objet est un lien, Tab atteint le lien puis le chevron ; Entrée sur le lien ouvre l'objet (D-384).

## Accessibilité
- Résumé et lignes ouvrables : boutons avec `aria-expanded` et `aria-controls`.
- La liste du groupe est nommée par le résumé.
- Le chevron à part s'appelle « Sortie de <verbe objet> » ; les pièces sont un groupe nommé « Pièces de <verbe objet> » (D-384).
- L'état de chaque outil est un texte (caché sauf « Échec » et « Arrêté »), pas une couleur seule (1.4.1).
- Les icônes et la roue sont décoratives.

## Taille d'écran
Identique ; l'objet se coupe avec une ellipse.

## Erreurs
Un outil en échec : « Échec » en rouge, toujours visible ; sa sortie dans `detail`.

## Placement
Dans `ChatTranscript`, entre les messages, ou dans `WorkSummary`.

## Composition
`Button` de React Aria, `Link`, `Spinner`, icônes internes `SquareTerminal`, `Pencil`, `Search`, `BookOpen`, `Brain`, `Wrench`, `ChevronDown`.

## Décisions
D-360, D-376, D-384

## Questions ouvertes
Aucune.
