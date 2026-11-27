# DatePicker (et DateRangePicker)
Statut : validé (2026-11-23) — Version : depuis 1.0.0
Validation : docs/validation/components/Nouveaux-P1-v1.html (D1 à D4, options A)

## Rôle
`DatePicker` saisit une date : une échéance, une date de livraison, une date de naissance. `DateRangePicker` saisit une période : du 3 au 24 novembre.
Ne pas l'utiliser pour :
- une date et une heure : non couvert dans cette version ;
- afficher une date sans la modifier : prendre `FormattedValue` (`type: "date"`), ou la lecture seule ;
- filtrer une liste par « aujourd'hui », « cette semaine » seulement : prendre un `Select` de périodes.

## Anatomie
Celle de `Field` (Field.spec.md) : libellé, cadre, aide ou erreur.
1. **Cadre** : les segments JJ / MM / AAAA dans l'ordre de la langue (React Aria `DateInput`), 10 px de marge à gauche. Plage : deux groupes de segments séparés par « – » en `--fg-3`, dans un seul cadre (D-354).
2. **Bouton calendrier** (24 px, à droite, icône calendrier en `--fg-2`) : ouvre le volet. Absent en lecture seule, remplacé par le cadenas (D-131).
3. **Volet** : surface `--surface-raised`, trait `--line`, rayon 12 px, ombre `--shadow-md`, sous le champ, aligné à gauche, décalé de 4 px.
4. **Calendrier** (D-354) : un mois. En-tête : « ‹ », titre « novembre 2026 » cliquable, « › ». Initiales des jours en `--fg-3` (`--fs-xs`), semaine qui commence selon la langue (lundi en français). Cases de `--icon-btn`.
5. **Vue des mois** (après un clic sur le titre) : « ‹ » année « › », puis les 12 mois en 3 colonnes ; le mois affiché est marqué (`--selected`).
6. **Raccourcis** (plage, facultatifs, D-354) : une colonne de boutons à gauche du calendrier, séparée par un trait `--line`. Sur mobile : au-dessus du calendrier, en ligne.

## Variantes
| Variante | Usage |
|---|---|
| `DatePicker` | Une date. |
| `DateRangePicker` | Une période, avec raccourcis en option. |

## Options
Les options communes de `Field` (`label`, `hideLabel`, `description`, `isRequired`, `requiredMessage`, `error`, `isDisabled`, `isReadOnly`, `width`, `name`), plus :
| Option | Type | Défaut | Description |
|---|---|---|---|
| `value` / `defaultValue` | `string \| null` (ISO `AAAA-MM-JJ`) | `null` | Date choisie. Plage : `{ start, end } \| null`. |
| `onChange` | `(value) => void` | aucune | Appelé quand la date est complète, ou vidée. |
| `minValue` / `maxValue` | `string` (ISO) | aucune | Bornes : jours hors bornes estompés et non choisissables ; saisie vérifiée en quittant le champ. |
| `isDateUnavailable` | `(date: string) => boolean` | aucune | Jour indisponible (férié, complet) : barré, non choisissable, refusé à la saisie. |
| `autoFocus` | `boolean` | `false` | Focus sur le premier segment à l'ouverture. |
| `presets` (plage) | `{ label, value: { start, end } }[]` | aucun | Raccourcis calculés par l'app (« 7 derniers jours », « Ce mois-ci »). |
| `startName` / `endName` (plage) | `string` | aucun | Noms des deux dates dans le formulaire envoyé (à la place de `name`). |
`width` vaut `sm` (160 px) pour une date et `md` (240 px) pour une plage.

## Exclus
- Pas d'heure, pas de fuseau : granularité au jour, valeurs ISO sans heure.
- Pas de deux mois côte à côte (D-354, option B écartée), pas de deux champs « Du » et « Au » (D-354, option B écartée).
- Pas de bouton « Appliquer » : choisir un jour, ou la fin d'une plage, ferme le volet (D-007).
- Pas de texte libre « 24 nov. » (D-354, option B écartée) : la saisie se fait par segments.
- Pas de `className` ni de `style`.

## États
Ceux de `Field` (par défaut, survol, focus, erreur, lecture seule, désactivé, vide), plus :
| État | Rendu |
|---|---|
| Segment qui a le focus | Fond `--accent`, texte `--accent-fg`. |
| Segment vide | Exemple de la langue (« jj », « mm », « aaaa ») en `--fg-3`. |
| Volet ouvert | Anneau de focus sur le cadre. |
| Bouton calendrier au clavier | Fond `--hover` ; l'anneau reste sur le cadre, jamais un second anneau (D-425). |
| Jour d'aujourd'hui | Trait intérieur `--line-strong`, graisse 600. |
| Jour choisi | Fond `--accent`, texte `--accent-fg`. |
| Jours d'une plage | Fond `--accent` à 14 % ; début et fin en `--accent`. |
| Jour indisponible | `--fg-3`, barré, pas de survol. |
| Jour hors bornes | Opacité 40 %. |
| Jour d'un autre mois | `--fg-3`. |
| Raccourci actif | Fond `--selected`, graisse 500. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Segments dans l'ordre de la langue ; un segment complet passe au suivant ; ↑ ↓ changent le segment (D-354) | verrouillé | `Clavier` |
| Calendrier d'un mois, semaine selon la langue ; « ‹ » « › » changent de mois ; choisir un jour ferme le volet (D-354) | verrouillé | `Calendrier` |
| Au clavier dans le calendrier : flèches entre les jours, Entrée choisit, Échap ferme sans changer | verrouillé | `CalendrierClavier` |
| Titre cliquable : vue des mois, année « ‹ » « › », un mois ramène aux jours (D-354) | verrouillé | `MoisEtAnnee` |
| Aujourd'hui encadré ; champ vide : le calendrier s'ouvre sur le mois du jour | verrouillé | `Aujourdhui` |
| Jour indisponible barré, non choisissable ; saisi, il reçoit un message en quittant le champ (D-354, D-132) | réglable (`isDateUnavailable`) | `JourIndisponible` |
| Bornes : jours hors bornes non choisissables, mois précédent ou suivant bloqué ; saisie hors bornes refusée avec un message (D-132) | réglable (`minValue`, `maxValue`) | `Bornes` |
| Champ obligatoire vide : message de `Field` (D-132) | réglable (`isRequired`) | `Obligatoire` |
| Lecture seule : pas de bouton, segments non modifiables (D-131) | réglable | `LectureSeule` |
| Plage : premier clic le début, second la fin, plage teintée, le volet se ferme (D-354) | verrouillé | `Plage` |
| Raccourci : un clic fixe la plage et ferme le volet ; le raccourci actif est marqué (D-354) | réglable (`presets`) | `Raccourcis` |
| Plage dont la fin précède le début : message en quittant le champ | verrouillé | `PlageInversee` |

## Contenu
- Messages (dictionnaire) : « Choisissez une date à partir du 5 novembre 2026. », « Choisissez une date jusqu'au … », « Cette date n'est pas disponible. Choisissez-en une autre. », « La date de fin doit suivre la date de début. ».
- Raccourcis : courts, au présent (« 7 derniers jours », « Ce mois-ci », « Mois dernier »).

## Densité
Hauteur du cadre `--row-h` ; cases du calendrier `--icon-btn` (28 px web, 24 px desktop, 44 px au toucher). Web et desktop suivent leurs tokens ; clair et sombre aussi.

## Clavier
- Champ : Tab entre dans le premier segment, puis passe de segment en segment, puis au bouton calendrier. Chiffres pour taper, ↑ ↓ pour changer, Retour arrière pour vider un segment. Alt + ↓ ouvre le volet.
- Volet : le focus va sur le jour choisi (ou aujourd'hui). Flèches entre les jours, Page haut / bas d'un mois, Entrée choisit, Échap ferme et rend le focus au champ.

## Accessibilité
React Aria `DatePicker` / `DateRangePicker` : groupe nommé par le libellé, segments en `spinbutton` (« jour », « mois », « année »), volet en `dialog`, calendrier en `grid` nommé par le mois, chaque jour nommé en entier (« mardi 24 novembre 2026 »). Langue : celle de `SocleProvider` (`messages.locale`), passée à React Aria par `I18nProvider`. Boutons nommés par le dictionnaire (« Ouvrir le calendrier », « Mois précédent », « novembre 2026, choisir le mois et l'année »).

## Taille d'écran
Le volet tient dans la fenêtre (8 px de marge) ; sur mobile, les raccourcis passent au-dessus du calendrier.

## Erreurs
Celles de `Field` ; la vérification a lieu en quittant le champ ou à l'envoi, jamais pendant la frappe (D-132).

## Placement
Celui de `Field` : dans un formulaire, une barre de filtres (plage), une ligne de réglage (`hideLabel`).

## Composition
`Field`, `DateInput`, un bouton, `Popover` et `Dialog` de React Aria, `Calendar` / `RangeCalendar` (fichier interne `Calendar.tsx`).

## Décisions
D-007, D-022, D-130, D-131, D-132, D-133, D-328, D-354.

## Questions ouvertes
Aucune.
