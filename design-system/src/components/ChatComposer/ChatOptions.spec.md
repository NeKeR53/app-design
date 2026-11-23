# ChatOptions
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/Chat-v1.html (Q2 A, sans le résumé Git dans Socle)

## Rôle
Rangée de réglages sous `ChatComposer` : à gauche un état court, à droite les contrôles de la conversation (modèle, autonomie, jauge de contexte), en boutons texte.
Ne pas l'utiliser pour :
- une barre d'outils au-dessus d'un contenu : prendre `ActionBar` ;
- des actions sur un message : prendre les actions de `ChatMessage`.

## Anatomie
1. **Emplacement gauche** (`start`, facultatif) : texte en `--fg-2`, coupé si la place manque.
2. **Espace** qui pousse les contrôles à droite.
3. **Contrôles** (`children`) : des `ChatOptionButton`, seuls ou en déclencheur d'un `DropdownMenu` ou d'un `Popover`, 4 px d'écart.

`ChatOptionButton` : texte `--fs-sm`, hauteur `--btn-h-sm`, marges de 8 px, rayon `--radius-md`, sans bord ni fond ; icône facultative en `--fg-2` ; valeur secondaire en `--fg-3` (« Modèle avancé Moyen »).

## Variantes
Une seule.

## Options
`ChatOptions` :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `start` | `ReactNode` | aucun | État à gauche (fichiers modifiés, dossier). Le résumé Git est fourni par l'app. |
| `children` | `ReactNode` | aucun | Contrôles, alignés à droite. |
| `label` | `string` | aucun | Nom du groupe (« Réglages de la conversation »). |

`ChatOptionButton` :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Texte du bouton (« Autonomie complète »). |
| `value` | `string` | aucune | Valeur secondaire (« Moyen »). |
| `icon` | `ReactNode` | aucune | Icône de l'app, 16 px. |
| `onPress` | `() => void` | — | Action ; inutile dans un `DropdownMenu` ou un `Popover`. |
| `isDisabled` | `boolean` | `false` | Opacité 40 %, aucun survol. |
| `aria-label` | `string` | le texte | Nom plus précis ; il commence par le texte visible. |

## Exclus
- Pas de chevron ▾ (Q2 option B écartée).
- Pas de contenu imposé : la rangée n'apporte aucun contrôle.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Fond transparent, texte `--fg`. |
| Survol | Fond `--hover`. |
| Pressé | Fond `--selected`. |
| Menu ou volet ouvert (`aria-expanded`) | Fond `--hover`, pas `--selected`. |
| Focus clavier | Anneau `--focus` 2 px. |
| Désactivé | Opacité 40 %. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| 4 px sous le cadre de `ChatComposer`, une seule ligne, contrôles alignés à droite, `start` à gauche (D-371) | verrouillé | `ChatComposer` › `Options` |
| Boutons sans bord ni fond ; `--hover` au survol et quand le menu est ouvert ; valeur en `--fg-3` (Q2 A) | verrouillé | `ChatComposer` › `Options` |
| `ChatOptionButton` ouvre un `DropdownMenu` (`aria-expanded`) | verrouillé | `ChatComposer` › `Options` |

## Contenu
- Texte d'un bouton : la valeur choisie, pas le nom du réglage (« Modèle avancé », pas « Modèle : avancé »).
- `start` : quelques mots (« 3 fichiers modifiés »).

## Densité
Hauteur `--btn-h-sm` : 26 px en web, 24 px en desktop.

## Clavier
Chaque bouton est un arrêt de Tab. Entrée ou Espace l'active ou ouvre son menu.

## Accessibilité
- `role="group"`, nommé par `label` s'il est donné.
- Nom d'un bouton : texte puis valeur (« Modèle avancé Moyen »).

## Taille d'écran
Une seule ligne : `start` se coupe d'abord, les contrôles gardent leur largeur (240 px au plus chacun, texte coupé au-delà).

## Erreurs
Sans objet.

## Placement
Juste sous `ChatComposer`, dans la même colonne, sans écart ajouté par l'app.

## Composition
`Button` de React Aria ; compatible avec `DropdownMenu`, `Popover` et `UsageRing`.

## Décisions
D-001, D-101, D-371.

## Questions ouvertes
Aucune.
