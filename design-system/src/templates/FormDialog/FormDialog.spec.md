# FormDialog (formulaire en modale)
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/FormPage-v1.html — par délégation de l'utilisateur, 2026-11-23

## Rôle
`useOpenForm()` rend la fonction `openForm(spec)`, qui ouvre une saisie courte dans une `Dialog` : créer un élément simple, renommer, inviter. Elle rend une promesse des valeurs (D-197). Les champs se décrivent avec le modèle `FormField` de `FormPage.spec.md` (D-190).

Ne pas l'utiliser pour :
- plus de six champs, ou des sections : prendre `FormPage` (D-198) ;
- une question oui / non : prendre `useConfirm` ;
- un aperçu ou un choix dans une liste : prendre `Dialog`.

## Anatomie
1. `Dialog` : titre (verbe et objet), description facultative, × (D-120 à D-125).
2. Corps : les champs, l'un sous l'autre, 16 px d'écart (D-191). À la fin, l'erreur d'envoi éventuelle, en `--danger` (D-198).
3. Pied : « Annuler », puis l'action (`primary`), qui envoie le formulaire (D-124).

## Variantes
Taille automatique : `sm` jusqu'à quatre champs sans zone de texte ni groupe, sinon `md` (D-198).

## Options
`const openForm = useOpenForm();` puis `const values = await openForm(spec);` — `values` vaut `null` si l'utilisateur ferme.

| Option de `spec` | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — (obligatoire) | Titre et nom accessible. |
| `description` | `string` | aucune | Phrase sous le titre. |
| `fields` | `FormField[]` | — (obligatoire) | Six au plus (D-198). |
| `initialValues` | `Record<string, unknown>` | aucune | Valeurs de départ (D-191). |
| `submitLabel` | `string` | — (obligatoire) | Verbe de l'action. |
| `cancelLabel` | `string` | « Annuler » | Libellé du bouton d'annulation. |
| `onSubmit` | `(values) => void \| FormSubmitResult \| Promise<…>` | aucun | Enregistre avant de fermer : attente, erreur sur place (D-197, D-198). |

## Exclus
- Pas de taille au choix de l'app, pas de sections, pas d'action secondaire.
- Pas d'interrupteur (D-137), pas de champ dessiné par l'app (D-190).
- Pas de confirmation à la fermeture : Échap ferme, clic hors refusé après une saisie (D-122).

## États
| État | Rendu |
|---|---|
| Ouvert | Focus sur le premier champ (D-125). |
| Envoi (`onSubmit`) | Modale occupée (`isBusy`), action en chargement, « Annuler » désactivé. |
| Échec | Phrase en `--danger` au-dessus du pied ; erreurs de champ sous les champs (D-192). |

## Comportement
- L'action vérifie tous les champs ; le focus va au premier en erreur (D-132).
- Sans `onSubmit`, la modale se ferme et rend les valeurs. Avec, elle attend la promesse et ne se ferme qu'à la réussite.
- Entrée dans un champ d'une ligne envoie ; Mod+Entrée envoie de partout (D-196).
- Une nouvelle demande ferme la précédente, qui rend `null` (D-197).

## Contenu
Titre : verbe et objet (« Nouveau contact ») ; action : un verbe (« Ajouter », « Renommer »).

## Densité
Celle de `Dialog` (`--dlg-pad`) et des champs.

## Clavier
Celui de `Dialog`, plus Entrée et Mod+Entrée (D-196).

## Accessibilité
Celle de `Dialog` ; `aria-busy` pendant l'envoi ; erreur annoncée (`role="alert"`).

## Taille d'écran
Celle de `Dialog` (D-121) : centrée sur mobile ; boutons du pied sur toute la largeur.

## Erreurs
Une exception levée par `onSubmit` affiche son message, sinon « L'enregistrement a échoué. Réessayez. ».

## Niveau de réglage
L'app choisit les champs et les textes. La taille et le reste sont fixes.

## Placement
Fenêtre secondaire (layout-rules). Souvent ouverte par une `Action` (`onPress: () => openForm(…)`).

## Composition
`Dialog`, `Button` et les champs du modèle `FormField`. L'hôte est dans `SocleProvider` (D-197).

## Décisions
D-122, D-124, D-125, D-128, D-190 à D-192, D-196 à D-198.

## Questions ouvertes
