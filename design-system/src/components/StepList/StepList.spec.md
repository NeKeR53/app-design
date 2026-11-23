# StepList
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/Divers-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Étapes numérotées d'un parcours guidé, avec leur état : installation, configuration d'un compte, import en plusieurs temps.
Ne pas l'utiliser pour :
- naviguer entre des vues indépendantes : prendre `Tabs` ;
- montrer l'avancement d'une tâche longue : prendre `ProgressBar` ;
- une liste de tâches à cocher : prendre `List` ou `CheckboxGroup`.

## Anatomie
1. Liste ordonnée nommée (obligatoire).
2. Étape (au moins deux) :
   1. pastille ronde de 22 px : numéro, coche (fait) ou « ! » (erreur) (D-325) ;
   2. titre (obligatoire) ;
   3. aide (facultative), `--fs-sm`, `--fg-3`.
3. Trait de 1 px `--line-strong` entre deux étapes (D-325).

## Variantes
| Orientation | Rendu |
|---|---|
| `horizontal` (défaut) | Étapes sur une ligne, en haut d'un assistant. Traits extensibles entre elles. |
| `vertical` | Étapes en colonne, trait vertical de 12 px ; l'aide reste visible. |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Nom de la liste. |
| `steps` | `{ id, title, description?, status? }[]` | — (obligatoire) | Étapes. `status` impose un état, sinon il vient de `current`. |
| `current` | `string` | — (obligatoire) | Étape en cours. |
| `onSelect` | `(id) => void` | aucune | Rend cliquables les étapes faites ou en erreur (D-326). |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Sens de la liste. |

## Exclus
- Pas de saut vers une étape à faire, ni d'option `isAvailable` (D-326).
- Pas de cartes encadrées ni d'icône d'app dans la pastille (D-325).
- Pas de couleur d'accent : l'étape en cours est monochrome (D-102).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| À faire | Bord `--line-strong`, numéro `--fg-3`, titre `--fg-2`. |
| En cours | Pastille pleine `--fg`, numéro `--surface`, titre `--fg` en `--fw-medium`. |
| Fait | Bord et coche `--success`, titre `--fg-2`. |
| Erreur | Pastille pleine `--danger`, « ! » en `--danger-fg`, titre `--danger`. |
| Survol (étape cliquable) | Fond `--hover`. |
| Focus clavier | Anneau accent. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| États déduits de `current`, sauf `status` donné (D-325) | réglable par l'app (`status`) | `ParDefaut`, `Erreur` |
| Avec `onSelect`, une étape faite ou en erreur est un bouton ; une étape à faire ne l'est jamais (D-326) | verrouillé | `RetourArriere` |
| Sans `onSelect`, la liste n'a aucun bouton | verrouillé | `ParDefaut` |
| Horizontal : aide masquée sous 560 px ; sous 380 px, seul le titre de l'étape en cours (D-326) | verrouillé | `Etroit` |
| Changement d'étape sans animation (D-026) | verrouillé | `DansUnAssistant` |

## Contenu
- Titre : un nom court (« Connexion »), sans numéro (la pastille le porte).
- Aide : quelques mots ; en erreur, la cause courte (« Connexion refusée »).
- Titre ou aide trop longs : coupés avec une ellipse.
- De 2 à 7 étapes.

## Densité
Pastille de 22 px ; texte `--fs-md`, aide `--fs-sm`.

## Clavier
Tab atteint les étapes cliquables, dans l'ordre ; Entrée ou Espace y revient.

## Accessibilité
- `ol` nommée par `label` ; l'étape en cours porte `aria-current="step"`.
- L'état « fait » ou « erreur » est dit par un texte caché (« Compte (fait) ») ; la pastille est décorative.

## Taille d'écran
Horizontal : se resserre selon la largeur de son conteneur (règle ci-dessus). Sur mobile, préférer `vertical` si l'aide compte.

## Erreurs
Une étape en erreur porte `status: "error"` et sa cause dans `description` ; le détail reste dans le contenu de l'étape.

## Placement
En haut du contenu d'un assistant (au-dessus du formulaire de l'étape), ou à gauche en `vertical`. Les boutons « Précédent » et « Suivant » restent dans le pied du parcours.

## Composition
Contient un `Button` de React Aria et l'icône interne `Check`.

## Décisions
D-026, D-102, D-325, D-326

## Questions ouvertes
Aucune.
