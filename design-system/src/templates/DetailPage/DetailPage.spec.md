# DetailPage
Statut : validé (2026-11-23) — Version : depuis 0.3.0 ; `isRefreshing` depuis 1.27.0
Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/DetailPage-v1.html ; `isRefreshing` : par délégation de l'utilisateur, 2026-11-27 — docs/validation/components/Relecture-Graphique-Suivi-v1.html (Q1 A)

## Rôle
Gabarit de la zone `main` d'AppShell pour un élément ouvert en entier : une demande, une facture, un document. Il montre le contenu principal de l'élément, en sections.
Ne pas l'utiliser pour :
- les propriétés de l'élément (« Échéance », « Responsable ») : elles vont dans `Drawer` (D-018, D-210) ;
- une collection : prendre `ListPage` ;
- une saisie à envoyer : prendre `FormPage` ;
- une page qui ne montre pas un élément (tableau de bord, éditeur) : prendre `Page` (D-217).

## Anatomie
1. **En-tête** (fixe, trait `--line` dessous, D-210) :
   1. lien de retour (facultatif) : « ‹ <vue principale> », au-dessus du titre (D-211) ;
   2. titre (obligatoire), `h1`, `--fs-xl`, semi-gras (D-212) ;
   3. statut (facultatif) : `Badge`, juste après le titre ;
   4. méta (facultative) : une ligne en `--fs-sm`, `--fg-2`, éléments séparés par « · » ;
   5. actions (facultatives) : `ActionBar` zone `header`, calée en haut à droite (D-111).
2. **Contenu** (seule zone qui défile) : des `DetailPage.Section` (alias de `PageSection`), séparées par un trait (D-213).

## Variantes
Aucune.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — (obligatoire) | Nom de l'élément. Facultatif pendant `state="loading"` : un squelette le remplace. |
| `back` | `{ label: string; onPress?: () => void; href?: string }` | aucun | Lien de retour vers la vue principale. `label` nomme la vue (« Demandes »). |
| `status` | `{ label: string; tone?: StatusTone }` | aucun | Statut, en `Badge`. |
| `meta` | `ReactNode[]` | aucune | Éléments de la ligne de méta (texte, `Link`, `Avatar`…), séparés par « · ». |
| `actions` | `Action[]` | aucune | Actions sur l'élément, zone `header`. |
| `onActionError`, `onActionDone` | `(action, error?) => void` | aucun | Transmis à `ActionBar` (D-116, D-118). |
| `width` | `"text" \| "full"` | `"text"` | Colonne de 760 px centrée, ou toute la largeur (D-214). |
| `state` | `"ready" \| "loading" \| "error" \| "not-found"` | `"ready"` | État de la page (D-215). |
| `onRetry` | `() => void` | aucun | « Réessayer » de l'état `error`. |
| `isRefreshing` | `boolean` | `false` | Relecture en fond : l'élément reste affiché, barre de 2 px sous l'en-tête, `aria-busy` sur le contenu. Ignoré hors de `ready` (D-426). |
| `notFound` | `{ title: string; description?: string; icon?: ReactNode; action?: Action }` | « Élément introuvable » | État `not-found` : `EmptyState`, action en zone `empty`. |
| `children` | `ReactNode` | — | Les sections. |

`DetailPage.Section` : voir `src/templates/Page/Page.spec.md` (`PageSection`).

## Exclus
- Pas de propriétés dans la page : elles vont dans le panneau de détail (D-210).
- Pas de sections repliables (D-213) ; pas de cartes.
- Pas de barre d'outils ni de pied : une fiche se lit. Un besoin de barre passe par `Page`.
- Pas de bandeau en tête (D-159).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| `ready` | En-tête complet, sections. |
| `loading` | Après 200 ms (D-165) : squelettes du titre et de la méta si `title` est absent, squelettes de deux sections à la place du contenu. Actions masquées. |
| `error` | Message centré « Impossible de charger la page » avec « Réessayer » (`role="alert"`) à la place du contenu (D-085). Actions masquées. |
| `not-found` | `EmptyState` à la place du contenu ; titre de l'en-tête masqué s'il est absent. Actions masquées. |
| rechargement par une action | Le contenu reste ; l'attente se voit sur l'action qui recharge (`ActionBar`, D-116). |
| relecture en fond (`isRefreshing`) | Le contenu et l'en-tête restent ; une barre de 2 px `--accent` défile en haut du contenu, sous le trait de l'en-tête, sans le déplacer ; le contenu porte `aria-busy` et la barre est nommée « Mise à jour… » (D-426). Fixe, à demi opaque, si l'utilisateur réduit les animations. |

Dans tous les états, le lien de retour reste visible et actif (D-215).

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| En-tête fixe, seul le contenu défile (D-210) | verrouillé | `EnTeteFixe` |
| Le lien de retour appelle `back.onPress` ; nom « Retour à <vue> » (D-211) | verrouillé | `Retour` |
| Actions de l'en-tête en zone `header` : bouton à texte à droite, 3 icônes, « … » (D-111) | verrouillé | `Actions` |
| États chargement, erreur, introuvable ; retour toujours visible (D-215) | verrouillé | `Chargement`, `Erreur`, `Introuvable` |
| Largeur de lecture par défaut, pleine largeur en option (D-214) | réglable par page | `PleineLargeur` |
| États d'une section (D-216) | réglable par section | `EtatsDeSection` |
| Relecture en fond : contenu gardé, barre de 2 px sous l'en-tête, `aria-busy` (D-426) | réglable par page (`isRefreshing`) | `Relecture` |

## Contenu
- Titre long : à la ligne, jamais tronqué (D-212).
- Méta trop longue : ses éléments passent à la ligne.
- Statut : un libellé court (« En attente »).
- Section sans contenu : prendre `empty` (D-216), jamais une section vide.

## Densité
Marges `--pad` ; tailles de texte `--fs-*` de la densité ; aucun autre écart.

## Clavier
Ordre de tabulation : lien de retour, actions de l'en-tête, puis le contenu dans l'ordre des sections. Aucun raccourci propre : Échap ne ferme pas la page (elle ne flotte pas). Le focus ne bouge pas quand l'état change.

## Accessibilité
- En-tête `header` ; titre `h1` ; sections `section` nommées par leur `h2`.
- Lien de retour : nom « Retour à Demandes » (contient le libellé visible).
- Chargement : `role="status"`, « Chargement… » ; erreur : `role="alert"`.
- Groupe d'actions nommé « Actions sur <titre> ».

## Taille d'écran
Sous 640 px : les icônes de l'en-tête passent dans « … » (D-117) ; le titre et les actions restent sur la même ligne ; la colonne prend toute la largeur.

## Erreurs
Chargement en échec : état `error`. Action en échec : `onActionError`, en général un toast (D-154).

## Placement
Uniquement dans la zone `main` d'AppShell, ouvert depuis une liste (vue fermable, D-021). Le panneau `detail` montre ses propriétés.

## Composition
Contient `Link` (retour), `Badge`, `ActionBar`, `PageSection`, `Skeleton`, `EmptyState`, `Button`. Se combine avec `Drawer` à côté. Ne contient pas de `ListPage`, `FormPage` ni `Page`.

## Décisions
D-018, D-021, D-085, D-111, D-116, D-117, D-159, D-165, D-166, D-210, D-211, D-212, D-213, D-214, D-215, D-216, D-426

## Questions ouvertes
Aucune.
