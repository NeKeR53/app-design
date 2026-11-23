# CodeField
Statut : validé (2026-11-23) — Version : prochaine version mineure (non publiée)
Validation : docs/validation/components/Nouveaux-P4-v1.html (K1, option A)

## Rôle
`CodeField` saisit un code à usage unique de 4 à 8 caractères : code reçu par SMS ou par e-mail, code d'une application d'authentification.
Ne pas l'utiliser pour :
- un mot de passe : prendre `TextInput` avec `type="password"` ;
- un identifiant ou une référence de longueur variable : prendre `TextInput` ;
- un nombre : prendre `NumberField`.

## Anatomie
Anatomie de `Field` (D-130) :
1. **Libellé** au-dessus ; « (facultatif) » sans `isRequired` ; cadenas en lecture seule.
2. **Cases** : 4 à 8, 6 px d'écart ; 34 px de large, hauteur `--row-h` + 12 px, bord `--line-strong`, rayon 8 px, fond `--surface`, chiffres de 18 px à chasse fixe.
3. **Champ réel** : un seul `<input>` transparent posé sur les cases. Il reçoit le focus, le clavier, le collage et le remplissage automatique.
4. **Aide**, puis **erreur** à sa place (D-132).

## Variantes
| Type | Caractères | Clavier mobile |
|---|---|---|
| `numeric` (défaut) | chiffres | numérique (`inputmode="numeric"`, `pattern="[0-9]*"`) |
| `alphanumeric` | lettres et chiffres, casse gardée | texte |

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Libellé et nom accessible. |
| `hideLabel` | `boolean` | `false` | Libellé masqué à l'écran. |
| `description` | `string` | aucune | Aide sous les cases (« Le code envoyé au 06 •• •• •• 42. »). |
| `length` | `number` | `6` | Nombre de cases, ramené entre 4 et 8 ; c'est aussi `maxlength`. |
| `type` | `"numeric" \| "alphanumeric"` | `"numeric"` | Caractères permis. |
| `value` / `defaultValue` | `string` | `""` | Valeur contrôlée ou de départ ; les caractères non permis sont retirés. |
| `onChange` | `(value) => void` | aucun | À chaque changement, y compris le vidage sur erreur (`""`). |
| `onComplete` | `(code) => void` | aucun | Quand toutes les cases sont remplies, à chaque nouveau code complet. |
| `error` | `string` | aucune | Erreur de l'app (code refusé), sous les cases (D-132). |
| `clearOnError` | `boolean` | `true` | Une nouvelle erreur vide le code et ramène le focus au début. |
| `isRequired` | `boolean` | `false` | Obligatoire : message « Renseignez « <libellé> ». » à l'envoi (D-344). |
| `requiredMessage` | `string` | aucun | Message d'obligation propre (D-344). |
| `isDisabled` / `isReadOnly` | `boolean` | `false` | Désactivé ; lecture seule (D-131). |
| `name` | `string` | aucun | Nom dans le formulaire envoyé (porté par le champ réel). |
| `autoFocus` | `boolean` | `false` | Focus à l'ouverture (écran qui ne demande que le code). |

## Exclus
- Pas un champ par case (D-363, option B écartée) : le collage et le remplissage automatique y marchent mal.
- Pas de masquage des caractères : un code à usage unique n'est pas un secret durable.
- Pas de séparateur visuel au milieu (« 123 456 »).
- Pas de largeur (`width`) : la largeur suit le nombre de cases.
- Pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Bord `--line-strong` ; survol : bord `--fg-3`. |
| Focus | Anneau `--focus` 2 px sur la case active seulement. |
| Erreur | Bord `--danger` sur toutes les cases ; erreur sous les cases. |
| Lecture seule | Fond `--surface-side`, bord `--line`, cadenas après le libellé ; le code ne change pas. |
| Désactivé | Opacité 40 %, hors de l'ordre de Tab. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Un seul vrai champ, `autocomplete="one-time-code"`, `inputmode` selon le type, `maxlength` = nombre de cases ; il couvre les cases (D-363) | verrouillé | `ParDefaut` |
| Un caractère permis remplit la case active, puis la suivante devient active ; un caractère non permis est ignoré (D-363) | verrouillé | `Saisie` |
| « n sur N » est lu poliment à chaque changement de longueur (D-363) | verrouillé | `Saisie` |
| Le collage remplit toutes les cases depuis la première ; espaces et tirets ignorés (D-363) | verrouillé | `Collage` |
| `onComplete` part quand la dernière case se remplit, et à chaque nouveau code complet (D-363) | réglable (`onComplete`) | `Complet`, `Collage` |
| Retour arrière efface la case active si elle est remplie, sinon la précédente, et recule (D-363) | verrouillé | `RetourArriere` |
| Flèches, Origine et Fin déplacent la case active, jamais au-delà de la première case vide ; Suppr efface la case active (D-363) | verrouillé | `Fleches` |
| Nouvelle erreur : affichée sous les cases ; le code se vide ; le focus revient à la première case (D-363) | réglable (`clearOnError`) | `ErreurVideLeCode`, `ErreurSansEffacer` |
| Code incomplet en quittant un champ modifié : « Saisissez les 6 chiffres du code. » ; vide et obligatoire à l'envoi : message d'obligation, focus sur le champ (D-132, D-344) | verrouillé | `Incomplet` |
| `alphanumeric` : lettres et chiffres, clavier texte | réglable (`type`) | `Alphanumerique` |
| 4 à 8 cases ; une autre valeur est ramenée dans cet intervalle | réglable (`length`) | `Longueurs` |
| Lecture seule : ni frappe ni collage ; désactivé : 40 % ; erreur présente au chargement : le code reste | réglable | `Etats` |

**Nouvelle erreur.** L'effacement part quand `error` passe d'une valeur à une autre (ou de rien à une phrase). L'app efface donc son erreur dès que l'utilisateur tape : `onChange={(v) => v && setError(undefined)}`. Le vidage appelle `onChange("")`, qui ne doit pas effacer l'erreur. Une erreur présente au chargement ne vide pas le code.

**Case active.** Le choix retenu : les flèches, Origine et Fin déplacent vraiment la case active (pas de curseur bloqué à la fin). Une frappe remplace la case active ; le code reste sans trou (un effacement au milieu décale la suite vers la gauche). Un clic place la case active sous le pointeur, sans dépasser la première case vide.

## Contenu
- Libellé : « Code de vérification ».
- Aide : où le code a été envoyé (« Le code envoyé par SMS au 06 •• •• •• 42. »).
- Erreur de l'app : ce qui ne va pas, puis quoi faire (« Ce code est incorrect. Vérifiez le dernier SMS reçu. », « Ce code a expiré. Demandez-en un nouveau. »).

## Densité
Hauteur des cases `--row-h` + 12 px : 40 px en desktop, 46 px en web. Largeur fixe de 34 px.

## Clavier
| Touche | Effet |
|---|---|
| Caractère permis | Remplit la case active, avance. |
| Retour arrière | Efface la case active remplie, sinon la précédente, et recule. |
| Suppr | Efface la case active. |
| Flèches gauche et droite | Case précédente ou suivante. |
| Origine (ou flèche haut) / Fin (ou flèche bas) | Première case / première case vide (ou dernière). |
| Coller | Remplit toutes les cases. |

## Accessibilité
- Le champ réel porte le nom (libellé), l'aide et l'erreur (`aria-describedby`), `aria-invalid` et `aria-required` ; le lecteur d'écran lit sa valeur comme un champ texte.
- Les cases dessinées sont masquées (`aria-hidden`) : elles ne font que refléter la valeur.
- L'avancement « 3 sur 6 » est lu dans une zone `aria-live="polite"`, seulement quand la longueur change.
- Le texte du champ réel est à 16 px : pas de zoom automatique sur iOS.

## Taille d'écran
Largeur fixe : 8 cases tiennent en 314 px. Le champ ne prend pas toute la largeur.

## Erreurs
Erreur de l'app par `error` (code refusé, expiré), prioritaire. Vérification propre : code incomplet en quittant le champ, champ obligatoire vide à l'envoi (D-132, D-344). L'erreur propre disparaît dès que le code est complet.

## Placement
Seul ou presque sur un écran de vérification (`FormPage`, `Modal`), sous un texte qui dit où le code a été envoyé, avec un lien « Renvoyer le code » dessous.

## Composition
Pièces de `Field` (`FieldLabel`, `FieldHelp`, `requiredText`).

## Décisions
D-130, D-131, D-132, D-344, D-363.

## Limites connues
- Saisie mobile sans événement clavier (Android) : le caractère est inséré à la case active, pas en remplacement ; code plein, il faut d'abord effacer. À vérifier sur un appareil.

## Questions ouvertes
Aucune.
