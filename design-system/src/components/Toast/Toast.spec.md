# Toast
Statut : validé (2026-11-23, par délégation de l'utilisateur) — Version : depuis 0.2.0
Validation : docs/validation/components/Notifications-v1.html

## Rôle
Message éphémère qui confirme le résultat d'une action (« Document archivé ») ou signale un événement, avec une action facultative (« Annuler », D-007). Les toasts naissent d'une file de notifications unique (`createNotifications()`), passée à `SocleProvider` ; le même appel ajoute la notification au centre (`NotificationCenter`, D-156).
Ne pas l'utiliser pour :
- un état durable de la page (hors ligne, lecture seule) : il va dans la barre du haut (D-159) ;
- une erreur de champ : la mettre sous le champ ;
- une erreur de chargement d'une zone : message dans la zone (D-085) ;
- une décision à prendre : prendre `Dialog`.

## Anatomie
1. Région (automatique) : en bas à droite, rendue une fois par `SocleProvider` (D-154).
2. Carte (obligatoire), dans l'ordre :
   1. icône du ton (obligatoire, 16 px, couleur du ton, D-151) ;
   2. titre (obligatoire) ;
   3. texte (facultatif), sous le titre ;
   4. action (facultative, une au plus, D-155) ;
   5. croix « Fermer la notification » (toujours présente).

## Variantes
Quatre tons (D-152) : `success`, `info` (par défaut), `warning`, `danger`. Seule l'icône change de couleur ; la carte reste neutre (D-151).

## Options
Options de `notify()` (sur la file ou par `useNotify()`) :

| Option | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — (obligatoire) | Titre, court. |
| `description` | `string` | aucun | Texte sous le titre. Les retours à la ligne sont conservés. |
| `tone` | `"success" \| "info" \| "warning" \| "danger"` | `"info"` | Ton (D-152). |
| `action` | `{ label: string; onAction: () => void }` | aucune | Action unique ; la choisir ferme le toast (D-155). |
| `duration` | `number \| null` (ms) | 5 000 ; 8 000 avec action ; `null` pour `danger` | Durée d'affichage, 5 000 au minimum ; `null` : jusqu'à fermeture (D-153). |
| `toast` | `boolean` | `true` | `false` : ligne du centre seule, sans toast (D-156). |
| `history` | `boolean` | `true` | `false` : toast seul, hors du centre (D-156). |
| `source` | `string` | aucune | Origine, affichée dans le centre. |
| `onOpen` | `() => void` | aucun | Ouvre l'élément lié depuis le centre (D-156). |

`notify()` renvoie l'identifiant ; `notifications.dismiss(id)` ferme le toast.

Options de `createNotifications()` : `maxVisible` est fixé à 3 (D-154) ; `initial` et `onChange` servent la persistance (voir `NotificationCenter`, D-158).

## Exclus
- Pas de deuxième action, ni de bouton à icône dans la carte (D-155).
- Pas de contenu riche (liens, listes, images) : texte seul.
- Pas de position réglable : toujours en bas à droite (en bas, pleine largeur, sur mobile).
- Pas de fond coloré ni de barre de progression (D-151).
- Pas de `className` ni de `style`. Pas de dépendance à sonner (D-150).

## États
- Entrée, visible, minuterie en pause (survol, focus, fenêtre inactive), sortie.
- Focus visible sur l'action et sur la croix.

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Durée : 5 s, 8 s avec action, `danger` jusqu'à fermeture ; `duration` par appel, 5 s au minimum (D-153) | réglable par appel | `Duree` |
| La minuterie s'arrête au survol, au focus et quand la fenêtre perd le focus (D-153) | verrouillé | `Pause` |
| Trois toasts visibles au plus ; au-delà, le plus ancien se ferme ; le plus récent est en bas (D-154) | verrouillé | `Pile` |
| L'action exécute `onAction` puis ferme le toast (D-155) | verrouillé | `Action` |
| Échap ferme le toast qui a le focus ; le focus revient là où il était | verrouillé | `Clavier` |
| La croix ferme le toast ; la notification reste dans le centre (D-156) | verrouillé | `Fermeture` |
| Entrée : fondu et glissement de 8 px, `--dur-base` ; sortie immédiate ; rien ne bouge si l'utilisateur réduit les animations (D-014, D-154) | verrouillé | — (visuel) |

## Contenu
- Titre et texte passent à la ligne, sans troncature ; le texte garde ses retours à la ligne.
- 360 px de large au plus ; la carte grandit en hauteur.
- Langues plus longues : l'action passe sous le texte si la place manque.

## Densité
Texte `--fs-md` (titre) et `--fs-sm` (texte) selon la densité. Marges 10 px × 12 px et écart de 8 px dans les deux densités.

## Clavier
- F6 déplace le focus vers la région des toasts, puis revient (React Aria).
- Tab parcourt l'action puis la croix de chaque toast.
- Échap, sur un toast qui a le focus, le ferme.
- À la fermeture d'un toast qui avait le focus, le focus passe au toast suivant, sinon revient là où il était avant (React Aria).

## Accessibilité
- Région : repère `region`, nommée « Notifications ».
- Chaque toast a le rôle `alertdialog` (non modal), nommé par son titre et décrit par son texte ; son contenu est annoncé dès l'apparition (`role="alert"`, React Aria). Le ton est lu avant le titre (« Succès », « Alerte »…, D-152).
- La croix et l'action font 24 px au moins ; contrastes AA sur `--surface-raised`.

## Taille d'écran
Sur mobile (≤ 640 px) : pleine largeur moins 8 px de chaque côté, au-dessus de la barre d'onglets (D-154).

## Erreurs
Un toast `danger` reste jusqu'à sa fermeture (D-153) et propose de préférence « Réessayer ».

## Niveau de réglage
Tout est verrouillé, sauf `duration` par appel.

## Placement
Région unique par fenêtre, rendue par `SocleProvider` quand il reçoit `notifications`. Jamais placée à la main dans une page.

## Composition
Contient les icônes internes de Socle (D-028), `Button` (action) et `IconButton` (croix). Partage la file avec `NotificationCenter`.

## Décisions
D-001, D-007, D-014, D-028, D-040, D-089, D-150, D-151, D-152, D-153, D-154, D-155, D-156, D-159

## Questions ouvertes
Aucune.
