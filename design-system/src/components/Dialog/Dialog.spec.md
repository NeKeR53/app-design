# Dialog
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.1.0
Validation : docs/validation/components/Dialog-v1.html

Cette spec couvre deux éléments :
- `Dialog`, la modale : titre, contenu, pied d'actions ;
- `useConfirm`, la confirmation d'une action irréversible.

## Rôle
`Dialog` ouvre une fenêtre secondaire, bloquante, posée sur l'app : un formulaire court (créer, renommer), un aperçu à vérifier, un espace à part comme les Réglages (D-015). AppShell y renvoie pour toute fenêtre secondaire.
`useConfirm` demande une confirmation avant une action irréversible (supprimer, vider, révoquer), selon D-007.

Ne pas l'utiliser pour :
- un contenu lié à l'élément courant et consultable en travaillant : prendre le panneau de détail (`DetailPanel`) ;
- un petit contenu ancré à un bouton (filtres, choix) : prendre `Menu` ou un Popover ;
- un message après une action : prendre une notification ;
- un long formulaire ou un écran de travail : prendre une page (`FormPage`, `DetailPage`) ;
- une confirmation d'action réversible : la faire tout de suite, avec une annulation possible (D-007).

## Anatomie
### Dialog
1. Fond (obligatoire) : `--scrim` sur toute la fenêtre.
2. Fenêtre (obligatoire) : surface `--surface-raised`, rayon 12 px (D-040), ombre `--shadow-lg`, bord `--line` (comme Menu).
3. En-tête (obligatoire) :
   - titre (obligatoire), en `--fs-lg` et `--fw-semibold` ;
   - description (facultative), en `--fg-2`, sous le titre ;
   - bouton × (`IconButton`, libellé « Fermer »), en haut à droite.
4. Corps (facultatif) : marges `--dlg-pad`, défile seul quand il est trop haut. En `xl`, sans marge.
5. Trait sous l'en-tête et au-dessus du pied : seulement quand le corps défile (D-123).
6. Pied (facultatif) : boutons calés à droite, « Annuler » puis l'action (D-124).

### Confirmation
1. Fenêtre `sm`, sans × ni icône (D-126).
2. Titre (obligatoire) : la question (« Supprimer « Atelier » ? »).
3. Message (facultatif) : la conséquence, en une ou deux phrases.
4. Erreur (pendant un échec, D-128) : en `--danger`, au-dessus du pied.
5. Pied : « Annuler » (`secondary`), puis le bouton de confirmation (`danger` par défaut, `primary` pour une action irréversible non destructrice).

## Variantes
| Taille | Largeur | Usage |
|---|---|---|
| `sm` | 400 px | Une question, un champ ; la confirmation. |
| `md` (défaut) | 560 px | Un formulaire court. |
| `lg` | 800 px | Un tableau, un aperçu. |
| `xl` | 1080 × 720 px, corps sans marge | Un gabarit dans la modale : SettingsPage (D-015). |

Toutes les tailles restent à 32 px au moins des bords de la fenêtre (D-120).

## Options
### Dialog
| Option | Type | Défaut | Description |
|---|---|---|---|
| `isOpen` | `boolean` | — (obligatoire) | Ouverte ou fermée. L'app pilote la modale. |
| `onOpenChange` | `(isOpen: boolean) => void` | — (obligatoire) | Appelée avec `false` par Échap, le × et le clic hors (sauf refus, D-122). |
| `title` | `string` | — (obligatoire) | Titre, et nom accessible. |
| `description` | `ReactNode` | aucune | Phrase sous le titre, annoncée avec lui. |
| `children` | `ReactNode` | aucun | Corps. |
| `footer` | `ReactNode` | aucun | Pied : des `Button`, « Annuler » puis l'action (D-124). |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Taille (D-120). |
| `isBusy` | `boolean` | `false` | Action en cours : rien ne ferme la modale, le × est désactivé, `aria-busy`. L'app met son bouton en chargement (`Button isPending`). |

### useConfirm
`const confirm = useConfirm();` puis `const ok = await confirm(options);`. La promesse rend `true` si l'utilisateur confirme, `false` s'il annule.

| Option de `confirm` | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — (obligatoire) | La question. |
| `message` | `ReactNode` | aucun | La conséquence. |
| `confirmLabel` | `string` | — (obligatoire) | Libellé du bouton de confirmation : le verbe de l'action (« Supprimer »). |
| `cancelLabel` | `string` | « Annuler » (`messages.cancel`) | Libellé du bouton d'annulation. |
| `tone` | `"danger" \| "default"` | `"danger"` | `danger` : bouton rouge. `default` : bouton `primary`, pour une action irréversible non destructrice (envoyer). |
| `onConfirm` | `() => Promise<void> \| void` | aucune | Action lancée au clic ; la confirmation reste ouverte pendant l'action, et montre l'erreur si elle échoue (D-128). |

## Exclus
- Pas de modale non bloquante, ni de position libre, ni de glisser.
- Pas de saisie du nom de l'élément pour confirmer.
- Pas de modale sans × (sauf la confirmation) : une modale doit toujours pouvoir se fermer.
- Pas de clic hors désactivable par option : la règle D-122 vaut partout.
- Pas d'icône dans la confirmation (D-126).
- Pas d'ordre des boutons selon le système (D-124).
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Ouverture | Fondu du fond et de la fenêtre, avec un léger zoom (97 % → 100 %), en `--dur-slow` (260 ms, D-014). Aucun mouvement si l'utilisateur réduit les animations. |
| Fermeture | Fondu en `--dur-base` (180 ms). |
| Défilement | Trait sous l'en-tête dès que le corps a défilé ; trait au-dessus du pied tant qu'il reste du contenu (D-123). |
| Fermeture refusée | Court rebond de la fenêtre (102 %, 260 ms) ; aucun rebond si l'utilisateur réduit les animations (D-122). |
| Occupée (`isBusy`) | × désactivé ; Échap et clic hors sans effet. |
| Confirmation en cours | Bouton en chargement (D-105), « Annuler » désactivé (D-128). |
| Confirmation en erreur | Message en `--danger` au-dessus du pied, `role="alert"` ; bouton de nouveau actif (D-128). |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Échap ferme la modale la plus haute, et seulement elle (layout-rules) | verrouillé | `Echap`, `Empilement` |
| Le × ferme la modale | verrouillé | `Echap` |
| Clic hors : ferme, sauf si une saisie a commencé depuis l'ouverture ; alors rebond, la modale reste (D-122) | verrouillé | `ClicHors` |
| `isBusy` : ni Échap, ni clic hors, ni × ne ferment (D-122) | verrouillé | `Occupee` |
| Focus à l'ouverture : `autoFocus`, sinon premier champ du corps, sinon la modale (D-125) | verrouillé | `FocusFormulaire`, `FocusModale` |
| Tab et Maj+Tab restent dans la modale (D-008) | verrouillé | `FocusFormulaire` |
| À la fermeture, le focus revient au déclencheur (D-125) | verrouillé | `Echap` |
| Traits seulement quand le corps défile (D-123) | verrouillé | `Defilement` |
| La page sous la modale ne défile pas | verrouillé | — (React Aria) |
| Confirmation : focus sur « Annuler » ; Échap ou « Annuler » rendent `false` ; le bouton rend `true` (D-125, D-127) | verrouillé | `Confirmation` |
| Confirmation : une nouvelle demande annule la précédente (`false`) (D-127) | verrouillé | `ConfirmationRemplacee` |
| Confirmation avec `onConfirm` : chargement, fermeture bloquée ; succès → fermeture et `true` (D-128) | verrouillé | `ConfirmationLongue` |
| Confirmation avec `onConfirm` qui échoue : message sur place, bouton de nouveau actif (D-128) | verrouillé | `ConfirmationErreur` |
| Sur mobile, `sm` et `md` centrées, `lg` et `xl` en plein écran (D-121) | verrouillé | `Tailles` (selon la largeur de la fenêtre de test), `Mobile` (visuel) |

Persistance : aucune. Le contenu n'est rendu que pendant l'ouverture : une saisie abandonnée repart de zéro.

## Contenu
- Titre : court, sans point final ; il passe à la ligne s'il est trop long, sans troncature.
- Description et message : une ou deux phrases. Le message d'une confirmation dit ce qui sera perdu (« Le projet et ses 12 tâches seront supprimés. »).
- Bouton de confirmation : le verbe de l'action, jamais « OK » ni « Oui ».
- Corps trop haut : il défile seul ; l'en-tête et le pied restent visibles.
- Langues plus longues : les boutons du pied passent à la ligne s'ils manquent de place.

## Densité
| | Web | Desktop |
|---|---|---|
| Marge intérieure `--dlg-pad` | 20 px | 16 px |
| Titre | `--fs-lg` (16 px) | `--fs-lg` (15 px) |
| Boutons | `--row-h` (34 px) | `--row-h` (28 px) |

Les largeurs sont les mêmes dans les deux densités.

## Clavier
- Tab et Maj+Tab parcourent la modale en boucle ; le focus n'en sort pas.
- Échap ferme la modale la plus haute (sauf `isBusy`). Un menu ouvert dans la modale se ferme d'abord.
- Entrée dans un champ envoie le formulaire si l'app a placé un `<form>` et un `Button type="submit"` (option `form` de Button).
- Focus à l'ouverture et à la fermeture : voir D-125.

## Accessibilité
- Dialog : rôle `dialog`, `aria-modal`, nommé par le titre (`aria-labelledby`), décrit par la description (`aria-describedby`).
- Confirmation : rôle `alertdialog`, nommée par le titre, décrite par le message.
- Le reste de l'app est masqué aux lecteurs d'écran pendant l'ouverture (React Aria).
- Erreur de la confirmation : `role="alert"`, annoncée tout de suite.
- `isBusy` : `aria-busy="true"` sur la fenêtre.
- Contrastes : ceux des tokens (AA) ; le fond `--scrim` n'est pas une information.

## Taille d'écran
- Mobile (≤ 640 px, D-013) : `sm` et `md` centrées, sur toute la largeur moins 16 px de marge ; `lg` et `xl` en plein écran, sans rayon ni bord (D-121).
- Sur mobile, les boutons du pied se partagent la largeur.
- Tablette et bureau : tailles de D-120, réduites si la fenêtre est plus petite.

## Erreurs
- Dialog : l'app montre l'erreur dans le corps (message sous le champ, D-022) et garde la modale ouverte.
- Confirmation : voir D-128. On en sort par « Annuler » ou en réessayant.

## Niveau de réglage
Tout est verrouillé, sauf ce que l'app passe par props : taille, description, pied, `isBusy` ; pour la confirmation, libellés, `tone` et `onConfirm`. Les libellés internes (« Fermer », « Annuler ») passent par `messages` (D-089). L'hôte de la confirmation est dans `SocleProvider` (D-127).

## Placement
- Au-dessus de l'AppShell, jamais dans une de ses zones.
- Réglages : `SettingsPage` dans un Dialog `xl` (D-015).
- Une confirmation peut s'ouvrir au-dessus d'un Dialog. Deux Dialog empilés sont permis mais à éviter : préférer une seule modale.
- Jamais à l'ouverture d'un écran sans action de l'utilisateur.

## Composition
- Contient : `IconButton` (×), `Button` (pied et confirmation), des champs, `Table`, `List`, un gabarit (`xl`).
- Ne contient pas : `AppShell`, `Sidebar`, ni une autre `Dialog` dans son corps (l'empilement passe par une seconde `Dialog` à côté).
- `Action.confirm` (modèle Action, P2) appelle `useConfirm`.

## Décisions
D-007, D-008, D-013, D-014, D-015, D-022, D-040, D-089, D-105, D-120, D-121, D-122, D-123, D-124, D-125, D-126, D-127, D-128

## Questions ouvertes
Aucune.
