# UsageRing
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/Chat-v1.html (Q4, option A sans barre d'usage)

## Rôle
`UsageRing` montre une part utilisée (contexte d'une conversation, quota) dans une petite jauge en anneau. Un clic ouvre le volet des limites, dont l'app donne le contenu, le plus souvent des lignes `UsageMeter`.

`UsageMeter` est une ligne de ce volet : le nom d'une limite, sa remise à zéro, son pourcentage et une barre.

Ne pas les utiliser pour :
- une tâche qui avance : prendre `ProgressBar` ;
- une valeur saisie par l'utilisateur : prendre `Slider` ;
- un indicateur d'étapes : prendre `ProgressIndicator`.

## Anatomie
UsageRing :
1. Anneau (obligatoire) : 16 px, trait de 2 px. Rail en `--line-strong`, valeur en `--accent`, en `--warning` à `warnAt` et au-delà, en `--danger` à `dangerAt` et au-delà. La valeur part du haut, dans le sens horaire.
2. Bouton (avec contenu) : bouton à texte, sans contour, comme les déclencheurs d'options du chat. Hauteur `--btn-h-sm`, fond `--hover` au survol et volet ouvert.
3. Info-bulle (avec contenu) : le nom accessible, au-dessus.
4. Volet (avec contenu) : forme de `Popover` (D-328), largeur `lg` (440 px, pour lire le nom et la remise à zéro sans coupure), placé au-dessus, côté fin. En-tête facultatif : titre à gauche en `--fg-2`, lien « Tout voir → » à droite. Puis le contenu de l'app.

UsageMeter :
1. Libellé (obligatoire), à gauche, en `--fg`.
2. Remise à zéro (facultative) et pourcentage, à droite, en `--fg-2` : « Remise à zéro mar. 00:10 · 79 % ».
3. Barre (obligatoire) : 4 px, rail `--field`, remplissage `--accent`, `--warning` ou `--danger` selon les seuils.

## Variantes
| Variante | Rendu |
|---|---|
| Avec contenu (`children`) | Bouton, info-bulle, volet. |
| Sans contenu | Jauge seule, `role="meter"`, ni bouton ni info-bulle. |

## Options
UsageRing :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `value` | `number` | — | Part utilisée, en pour cent (0 à 100, bornée). |
| `label` | `string` | « Contexte utilisé » (i18n) | Ce qui est mesuré. |
| `warnAt` | `number` | `80` | Seuil d'alerte, en pour cent. |
| `dangerAt` | `number` | `95` | Seuil critique, en pour cent. |
| `children` | `ReactNode` | — | Contenu du volet. Sans contenu, pas de volet. |
| `title` | `string` | — | Titre de l'en-tête du volet. Il nomme le volet. |
| `action` | `{ label?, href?, onPress? }` | — | Lien de l'en-tête. `label` : « Tout voir » (i18n) par défaut ; la flèche est ajoutée. |
| `isOpen`, `onOpenChange` | `boolean`, `(open) => void` | — | Ouverture pilotée par l'app. |

UsageMeter :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Nom de la limite. |
| `value` | `number` | — | Part utilisée, en pour cent (0 à 100, bornée). |
| `resetsAt` | `string \| Date` | — | Remise à zéro. Texte déjà formaté par l'app, ou date formatée selon la langue. |
| `warnAt`, `dangerAt` | `number` | `80`, `95` | Seuils, comme UsageRing. |

## Exclus
- Pas de barre d'usage au-dessus de la zone de saisie (`UsageBar`) : écartée à la validation (Q4).
- Pas de valeur visible à côté de l'anneau : la valeur est dans le nom et l'info-bulle.
- Pas d'autre taille ni d'autre couleur ; pas de `className` ni de `style`.
- Pas de `max` : l'app donne un pourcentage.

## États
| État | Rendu |
|---|---|
| Sous `warnAt` | Accent. |
| À `warnAt` et au-delà | `--warning`, mot « Élevé » lu. |
| À `dangerAt` et au-delà | `--danger`, mot « Critique » lu. |
| Survol | Fond `--hover`. |
| Pression | Fond `--selected`. |
| Volet ouvert | Fond `--hover`, `aria-expanded="true"`. |
| Focus clavier | Anneau de focus commun (D-337). |

## Comportement
- Clic, Entrée ou Espace : ouvre le volet. Le focus va dans le volet.
- Échap, clic à côté ou nouveau clic sur la jauge : ferme le volet. Le focus revient à la jauge (D-329).
- Le volet change de côté si la place manque.
- L'app ferme le volet après « Tout voir » si l'action reste dans la même vue (`isOpen`, `onOpenChange`).
- Changement de valeur : l'anneau et la barre glissent en `--dur-slow` ; pas d'animation si le mouvement est réduit (D-014).

## Contenu
- `label` : un nom, sans verbe conjugué (« Contexte utilisé », « Limite sur 5 h »).
- `title` : « Limites d'usage ».
- `resetsAt` en texte : jour court et heure (« mar. 00:10 »). En date : jour court et heure dans les 6 jours, sinon jour et mois (« 24 nov., 00:10 »).
- Pourcentage : entier, format de la langue (« 72 % »).

## Densité
Tailles fixes en web et en desktop. Seule la hauteur du bouton suit `--btn-h-sm`.

## Clavier
| Touche | Action |
|---|---|
| Tab | Atteint la jauge (avec contenu). |
| Entrée, Espace | Ouvre le volet. |
| Échap | Ferme le volet, focus rendu à la jauge. |
| Tab dans le volet | Parcourt le lien d'en-tête et le contenu ; reste dans le volet. |

## Accessibilité
- Avec contenu : bouton nommé « <label> : 72 % », avec le mot du seuil : « Contexte utilisé : 85 % (Élevé) ». L'info-bulle répète ce nom ; elle n'est pas reliée par `aria-describedby`, pour ne pas lire le nom deux fois.
- Sans contenu : `role="meter"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuetext` (« 85 % (Élevé) »).
- Volet : `role="dialog"`, nommé par `title`, sinon « Limites d'usage » (i18n).
- UsageMeter : la barre porte `role="meter"`, nommée par le libellé visible ; `aria-valuetext` dit le pourcentage et le mot du seuil. Le pourcentage visible est caché aux lecteurs d'écran (la barre le lit déjà).
- La couleur ne porte jamais seule le seuil : le mot « Élevé » ou « Critique » est lu.
- La flèche de « Tout voir → » est cachée aux lecteurs d'écran.

## Taille d'écran
Le volet ne dépasse pas l'écran (marge de 8 px) et défile si le contenu est long.

## Erreurs
Aucune : une valeur hors de 0 à 100, ou non finie, est bornée.

## Niveau de réglage
L'app choisit la valeur, le libellé, les seuils, le contenu et l'en-tête du volet. Le dessin, les couleurs et le placement sont fixes.

## Placement
Dans la barre d'options de la zone de saisie du chat, à droite. Ailleurs : un en-tête de panneau, une barre d'état.

## Composition
`Tooltip`. Le volet reprend la forme de `Popover` sans son en-tête (pas de ×) ; il est construit ici, car `Popover` n'offre pas le placement au-dessus. `UsageMeter` va dans le volet ; l'app peut aussi le poser seul.

## Décisions
D-014, D-328, D-329, D-337, D-378.

## Limites connues
- Le volet reprend la forme de `Popover` sans l'utiliser : `Popover` n'a pas le placement `top end`.

## Questions ouvertes
Aucune.
