# ChatComposer
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/Chat-v1.html (Q1 B, Q5 A, Q6 A, Q9 A)

## Rôle
Zone de saisie d'un chat avec un agent : écrire un message, citer des ressources (`@fichier`, `/commande`), joindre des fichiers, mettre un message en file pendant une réponse, arrêter l'agent.
Ne pas l'utiliser pour :
- un champ de commentaire ou de note sans agent : prendre `MentionInput` (variante `field`) ou `TextArea` ;
- une recherche : prendre `SearchInput` ;
- un formulaire : prendre les champs de formulaire.

## Anatomie
Un cadre (6 px de marge intérieure, rayon `--radius-md`, bord `--line-strong`, fond `--surface`, ombre `--shadow-md`), de haut en bas :
1. **File** (`queue`, facultatif) : une `MessageQueue`, séparée du texte par un filet.
2. **Pièces jointes** (`attachments`, facultatif) : des `AttachmentChip`, dans une liste « Pièces jointes », 8 px d'écart, alignées en bas.
3. **Ligne** (4 px d'écart, alignée en bas) :
   1. **« + »** (`IconButton`) : menu vers le haut (`DropdownMenu`, `top start`). Absent si le menu serait vide.
   2. **Texte** (`MentionInput`, variante `plain`) : une ligne de 20 px dans 28 px, texte `--fs-lg` ; il grandit jusqu'à 240 px, puis défile.
   3. **Emplacement** (`trailing`, facultatif) : dictée, par exemple.
   4. **« Arrêter »** : carré plein, pendant une réponse seulement, juste avant l'envoi (Q1 B).
   5. **Envoi** (`IconButton`, flèche vers le haut).
La rangée d'options sous le cadre est un composant à part : `ChatOptions`.

## Variantes
Une seule. Les états « au repos » et « pendant une réponse » (`isRunning`) changent le texte d'attente, le nom de l'envoi et font paraître « Arrêter ».

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `onSubmit` | `(text, mode, references) => void` | — (obligatoire) | Envoi. `text` est rogné ; `mode` vaut `now` ou `queue` ; `references` suivent le texte rogné. |
| `label` | `string` | « Message » | Nom accessible du champ. Exemple : « Message à l'agent ». |
| `value` / `references` / `onChange` | `string` / `MentionReference[]` / `(value, references) => void` | non contrôlé | Texte contrôlé (brouillon gardé par l'app). Sans `value`, la zone garde son texte et se vide après l'envoi. |
| `defaultValue` | `string` | `""` | Texte de départ, sans `value`. |
| `placeholder` | `string` | aucun | Texte d'attente au repos. Exemple : « Que puis-je faire pour vous ? ». |
| `runningPlaceholder` | `string` | « ⌘↩ pour mettre en file » | Texte d'attente pendant une réponse ; « Ctrl+↩ » hors macOS (Q6 A). |
| `triggers` | `MentionTrigger[]` | `[]` | Déclencheurs de suggestions (voir `MentionInput`) ; chacun a son entrée dans le menu « + ». |
| `isRunning` | `boolean` | `false` | L'agent répond. |
| `onStop` | `() => void` | aucun | Arrêter la réponse : bouton « Arrêter » et Échap. |
| `canResume` / `onResume` | `boolean` / `() => void` | `false` | Dernier envoi en échec ou interrompu : la zone vide propose « Relancer ». |
| `isPending` | `boolean` | `false` | Pièces jointes en préparation : la flèche tourne, l'envoi attend. |
| `isDisabled` | `boolean` | `false` | Rien ne se saisit ni ne s'envoie (brouillon pas encore chargé). |
| `hasAttachments` | `boolean` | `false` | Des pièces jointes attendent : l'envoi est permis sans texte. |
| `onAddFiles` | `(files: File[]) => void` | aucun | Fichiers choisis, déposés, ou images collées. Sans lui : ni « Joindre des fichiers… », ni dépôt, ni collage d'image. |
| `accept` | `string` | tous les types | Types du sélecteur de fichiers (attribut `accept`). |
| `onPasteLongText` | `(text: string) => void` | aucun | Collage long à montrer en pièce « Texte collé n ». Sans lui, le collage entre dans le champ. |
| `addMenu` | `ChatAddMenuItem[]` | `[]` | Entrées du menu « + » après les fichiers et les déclencheurs : `{ id, label, icon?, onAction, isDisabled? }`. |
| `queue` | `ReactNode` | aucun | Une `MessageQueue`. |
| `attachments` | `ReactNode` | aucun | Des `AttachmentChip`. |
| `trailing` | `ReactNode` | aucun | Un `IconButton` de l'app (dictée). |
| `ref` | `Ref<ChatComposerHandle>` | — | `focus()` ; `insertText(text)` insère au curseur (citation, déclencheur). |

Fonctions exportées : `isLongPaste(text)` (2 000 caractères ou 20 lignes), `clipboardImages(dataTransfer)`.

## Exclus
- Pas de numérotation des « Texte collé n » ni de préparation des fichiers : l'app garde ses pièces jointes, `AttachmentChip` les affiche.
- Pas de brouillon enregistré : l'app le garde par conversation avec `value` et `onChange`.
- Pas de bouton unique qui change (Q1 option A écartée) : « Arrêter » s'ajoute à côté de la flèche.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos, vide | Texte d'attente de l'app ; envoi inactif (opacité 40 %). |
| Repos, rempli | Envoi actif, « Envoyer ». |
| Focus dans le cadre | Bord teinté d'accent (55 % d'accent dans `--line-strong`) ; exception à l'anneau commun, contraste ≥ 3:1 dans les deux modes (D-425). |
| Pendant une réponse | Texte d'attente « ⌘↩ pour mettre en file » ; « Arrêter » paraît ; l'envoi devient « Envoyer maintenant ». |
| Vide après un échec (`canResume`) | Envoi actif, « Relancer ». |
| Pièces en préparation (`isPending`) | Roue à la place de la flèche, `aria-disabled`. |
| Fichiers survolés | Bord en tirets `--accent` ; texte d'attente « Déposez vos fichiers ici ». |
| Désactivé | Champ à 40 %, non éditable ; « + » et envoi inactifs. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Cadre : marge 6 px, rayon 8 px, bord `--line-strong` ; champ de 28 px, 240 px au plus puis défilement (D-371) | verrouillé | `Anatomie`, `Croissance` |
| Entrée envoie (`now`) ; la zone non contrôlée se vide, le focus reste dans le champ | verrouillé | `EnvoiAuClavier`, `EnvoiAuBouton` |
| Maj+Entrée va à la ligne | verrouillé | `EnvoiAuClavier` |
| Envoi inactif si la zone est vide, sauf `canResume` (« Relancer », `onResume`) ou `hasAttachments` | verrouillé | `Anatomie`, `Relancer`, `JoindreDesFichiers` |
| Pendant une réponse, ⌘/Ctrl+Entrée met en file (`queue`) ; Entrée et la flèche envoient maintenant ; au repos, ⌘/Ctrl+Entrée envoie (D-371) | verrouillé | `MiseEnFile`, `ModEntreeAuRepos` |
| Texte d'attente « ⌘↩ pour mettre en file » (Ctrl+↩ hors macOS) pendant une réponse (Q6 A) | réglable (`runningPlaceholder`) | `MiseEnFile` |
| « Arrêter » juste avant l'envoi pendant une réponse ; info-bulle « Arrêter Échap » ; Échap dans le champ arrête (Q1 B) | verrouillé | `Arreter` |
| Échap ferme d'abord la liste des suggestions, sans arrêter l'agent | verrouillé | `EchapFermeDAbordLaListe` |
| Saisie en composition (IME) : Entrée valide la composition, n'envoie pas | verrouillé | — (navigateur) |
| `isPending` : roue, Entrée n'envoie pas | réglable | `EnPreparation` |
| Menu « + » vers le haut : « Joindre des fichiers… », puis un déclencheur par entrée (« Commande / ») qui insère son caractère et ouvre ses suggestions, puis `addMenu` (Q5 A) | réglable (`onAddFiles`, `triggers`, `addMenu`) | `MenuPlus`, `JoindreDesFichiers` |
| Coller une image : `onAddFiles`, rien dans le texte | réglable (`onAddFiles`) | `CollerUneImage` |
| Coller au moins 2 000 caractères ou 20 lignes : `onPasteLongText` ; un collage court entre en texte brut | réglable (`onPasteLongText`) | `CollerUnLongTexte` |
| Fichiers glissés sur le cadre : tirets, « Déposez vos fichiers ici », `onAddFiles` au dépôt | réglable (`onAddFiles`) | `DeposerDesFichiers` |
| Désactivé : rien ne se saisit ni ne s'envoie | réglable | `Desactivee` |

## Contenu
- Texte d'attente au repos : une question courte, sans point (« Que puis-je faire pour vous ? »).
- Entrées d'`addMenu` : un verbe à l'infinitif, « … » si un choix suit (« Ajouter un dossier… »).
- Nom d'un déclencheur : un nom au singulier (« Fichier », « Commande », « Ticket »).

## Densité
Boutons `--icon-btn` (28 px web, 24 px desktop) ; texte `--fs-lg` sur 20 px ; marges fixes (6 px, 4 px).

## Clavier
| Touche | Effet |
|---|---|
| Entrée | Envoie (`now`). Avec la liste ouverte : insère la suggestion active. |
| Maj+Entrée | Retour à la ligne. |
| ⌘+Entrée (macOS), Ctrl+Entrée | Pendant une réponse : met en file. Au repos : envoie. |
| Échap | Ferme la liste des suggestions ; sinon, pendant une réponse, arrête. |
| Tab | Du champ vers l'emplacement, « Arrêter », l'envoi. Avec la liste ouverte : insère la suggestion active. |

## Accessibilité
- Champ : `role="textbox"`, `aria-multiline`, nommé par `label` (voir `MentionInput`).
- Envoi : nom « Envoyer », « Envoyer maintenant » ou « Relancer » ; `aria-keyshortcuts="Enter"`.
- « Arrêter » : `aria-keyshortcuts="Escape"`, info-bulle « Arrêter Échap ».
- Menu « + » : `DropdownMenu` (rôle `menu`), nommé « Ajouter au message ».
- Le sélecteur de fichiers est un `input type="file"` caché, hors de l'ordre de Tab.

## Taille d'écran
Toute la largeur du conteneur (l'app la borne, 760 px dans une conversation). Sur écran tactile, boutons de 44 px.

## Erreurs
Un envoi qui échoue relève de l'app : elle remet le texte dans `value` et passe `canResume`. Une pièce jointe refusée s'affiche en erreur dans `AttachmentChip`.

## Placement
En bas d'une conversation, sous `ChatTranscript`, suivi de `ChatOptions`. Une seule zone de saisie par conversation.

## Composition
`MessageQueue`, `AttachmentList` et `AttachmentChip`, `DropdownMenu`, `IconButton`, `MentionInput`, Tooltip de React Aria (« Arrêter »). Icônes internes `Plus`, `Paperclip`, `Square`, `ArrowUp`.

## Décisions
D-001, D-006, D-035, D-107, D-371, D-372, D-373, D-374.

## Questions ouvertes
Aucune.
