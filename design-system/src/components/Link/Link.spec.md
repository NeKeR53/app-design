# Link
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.1.0
Validation : docs/validation/components/Display-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Lien dans un texte, une cellule ou une ligne de détail : aller vers une page, un document, une adresse externe ; ou action secondaire dans une phrase (sans `href`).
Ne pas l'utiliser pour :
- la navigation principale : `Sidebar`, `Tabs` ;
- une action principale ou isolée : `Button`.

## Anatomie
1. Texte (obligatoire), `--accent-text`, souligné de 1 px (D-167).
2. Flèche de 12 px (lien externe seulement), et texte caché « S'ouvre dans le navigateur ».

## Variantes
| Variante | Rendu |
|---|---|
| Avec `href` | Lien (`<a>`). Externe si `http:` ou `https:` : nouvel onglet, flèche. `mailto:` et `tel:` ne sont pas externes : même onglet, sans flèche. |
| Sans `href` | Bouton à l'apparence de lien. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `children` | `ReactNode` | — (obligatoire) | Texte du lien. |
| `href` | `string` | aucun | Adresse. La navigation interne passe par le `RouterProvider` de React Aria fourni par l'app. |
| `onPress` | `() => void` | aucun | Action (obligatoire sans `href`). |
| `external` | `boolean` | selon `href` | Force l'ouverture hors de l'app, ou l'empêche. |

## Exclus
- Pas de lien sans soulignement (D-167), pas d'autre couleur, pas de `className`.
- Pas de lien désactivé : on retire le lien et on garde le texte.

## États
| État | Rendu |
|---|---|
| Par défaut | `--accent-text`, souligné 1 px. |
| Survol | Soulignement de 2 px. |
| Focus clavier | Anneau `--accent`, 2 px. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Toujours souligné (D-167) | verrouillé | `ParDefaut` |
| Externe : nouvel onglet, `rel="noopener noreferrer"`, flèche, texte caché | verrouillé | `Externe` |
| Sans `href` : bouton ; Entrée ou Espace appelle `onPress` | verrouillé | `Action` |

## Contenu
Texte qui dit où l'on va (« procédure de mise en ligne »), jamais « ici ». Peut passer à la ligne dans une phrase.

## Densité
Suit la taille du texte qui l'entoure.

## Clavier
Dans l'ordre de tabulation. Entrée suit le lien ; Entrée ou Espace déclenche le bouton.

## Accessibilité
Rôle `link` ou `button`. Le nom d'un lien externe inclut « S'ouvre dans le navigateur » (dictionnaire `opensInBrowser`, D-089). `--accent-text` AA sur `--surface` ; le soulignement évite la couleur seule (WCAG 1.4.1).

## Taille d'écran
Sans changement.

## Erreurs
Sans objet.

## Placement
Texte courant, phrase d'un `EmptyState`, ligne du panneau de détail, cellule de Table.

## Composition
Contient une icône interne (flèche). Ne pas mettre un `Link` dans un `Button` ni dans un élément cliquable.

## Décisions
D-028, D-089, D-167

## Questions ouvertes
Aucune.
