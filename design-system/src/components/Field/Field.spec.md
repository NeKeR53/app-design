# Field (anatomie commune des champs)
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/FormFields-v1.html

## Rôle
Anatomie et règles communes à tous les champs de saisie : `TextInput`, `TextArea`, `Select`, et `ComboBox` (P5). `Field` n'est pas exporté : une app n'assemble jamais un champ elle-même, elle prend un des composants ci-dessus. Les composants de Socle qui ont un cadre de champ importent ses pièces depuis `src/components/Field/Field.tsx`.
Ne pas l'utiliser pour :
- une case, un bouton radio ou un interrupteur : leur libellé est à côté du contrôle (voir `Checkbox`, `RadioButtonGroup`, `Toggle`) ;
- une recherche qui filtre une liste : prendre `SearchInput`.

## Anatomie
De haut en bas (D-022) :
1. **Libellé** (obligatoire ; peut être masqué si le contexte le donne, avec un nom accessible) : `--fs-sm`, `--fw-medium`, `--fg` (D-130). Un champ facultatif reçoit « (facultatif) » en `--fg-3`, sans astérisque, automatiquement quand `isRequired` est faux (D-022).
2. **Cadre** (obligatoire) : hauteur `--row-h` au moins, rayon 8 px (D-040), fond `--surface`, bord 1 px `--line-strong` (D-130).
3. **Aide** (facultative) : `--fs-sm`, `--fg-3`.
4. **Erreur** (quand le champ est invalide) : `--fs-sm`, `--danger` ; elle prend la place de l'aide (D-130).
Écart de 4 px entre ces parties.

## Variantes
Aucune.

## Options communes
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Libellé visible et nom accessible. |
| `hideLabel` | `boolean` | `false` | Masque le libellé à l'écran (il reste le nom accessible). Pour un champ dans une ligne de réglage ou un tableau, où le contexte nomme déjà le champ. |
| `description` | `string` | aucune | Aide sous le champ. |
| `isRequired` | `boolean` | `false` | Champ obligatoire : vérifié vide (D-132). Sans lui, « (facultatif) » suit le libellé. |
| `validate` | `(value) => string \| null` | aucune | Vérification de la valeur ; renvoie la phrase qui dit quoi corriger (D-132). |
| `error` | `string` | aucune | Erreur imposée par l'app (réponse du serveur) ; affichée tout de suite (D-132). |
| `isDisabled` | `boolean` | `false` | Désactivé. |
| `isReadOnly` | `boolean` | `false` | Lecture seule (D-131). Sans objet pour `Select`. |
| `width` | `"xs" \| "sm" \| "md" \| "lg" \| "full"` | `"full"` | 96, 160, 240, 360 px ou toute la largeur ; jamais plus large que le conteneur (D-133). |
| `name` | `string` | aucun | Nom dans le formulaire envoyé. |

## Exclus
- Pas d'astérisque, pas de marque « obligatoire » (D-022).
- Pas de libellé à gauche du champ : le placement à gauche est celui des lignes de réglage (`SettingsPage`), qui masquent le libellé du champ (`hideLabel`).
- Pas d'icône décorative dans le cadre, pas de préfixe ni de suffixe dans cette version.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Par défaut | Bord `--line-strong`. |
| Survol | Bord `--fg-3`. |
| Focus | Anneau `--accent` de 2 px, décalé de 1 px. |
| Erreur | Bord `--danger` ; la phrase d'erreur remplace l'aide. Le focus garde l'anneau `--accent`. |
| Lecture seule | Fond `--surface-side`, bord `--line`, cadenas de 14 px en `--fg-3` à droite ; texte sélectionnable ; pas de survol (D-131). |
| Désactivé | Opacité 40 % sur tout le champ, libellé compris. |
| Vide | Texte d'exemple (`placeholder`) en `--fg-3`, facultatif ; il ne remplace jamais le libellé ni l'aide. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| L'erreur s'affiche quand on quitte un champ modifié, ou à l'envoi du formulaire ; jamais pendant la frappe (D-022, D-132) | verrouillé | `TextInput/Verification` |
| À l'envoi, le focus va au premier champ en erreur (D-132) | verrouillé | `TextInput/Envoi` |
| Une erreur de l'app (`error`) s'affiche tout de suite et prime sur la vérification locale (D-132) | verrouillé | `TextInput/ErreurApp` |
| Un champ obligatoire vide reçoit « Ce champ est obligatoire. » (D-132, D-089) | verrouillé | `TextInput/Verification` |

## Contenu
- Libellé : un nom court, sans deux-points.
- Aide : une phrase courte. Erreur : une phrase qui dit quoi corriger (« Saisissez une adresse de la forme nom@domaine.fr. »), pas seulement ce qui ne va pas.
- Libellé, aide et erreur trop longs passent à la ligne.

## Densité
Cadre de `--row-h` (34 px en web, 28 px en desktop) ; texte `--fs-md` ; libellé, aide et erreur `--fs-sm`.

## Clavier
Le libellé n'est pas focalisable ; un clic dessus place le focus dans le champ. Tabulation : un arrêt par champ.

## Accessibilité
- Libellé relié au champ ; aide et erreur reliées par `aria-describedby` ; `aria-invalid` en erreur ; `aria-required` pour un champ obligatoire (React Aria).
- L'erreur est du texte, pas seulement une couleur. Le bord `--line-strong` atteint 3:1 sur `--surface` (WCAG 1.4.11).

## Taille d'écran
Sur mobile, toutes les largeurs passent à `full`.

## Erreurs
Voir États et Comportement.

## Placement
Gabarit `FormPage` (sections), formulaire dans une modale (`Modal`), ligne de réglage de `SettingsPage` (libellé masqué). Jamais dans une ligne du panneau de détail (spec Drawer) ni dans la barre supérieure.

## Composition
Contient le libellé, le cadre, l'aide et l'erreur. Le cadre contient le contrôle propre au composant.

## Décisions
D-022, D-040, D-073, D-089, D-130, D-131, D-132, D-133

## Questions ouvertes
Aucune.
