# LoginPage
Statut : validé (2026-11-23) — Version : depuis 1.0.0
Validation : comportement validé par l'utilisateur, 2026-11-23

## Rôle
`LoginPage` montre la page de connexion d'une app : un panneau centré, avec un identifiant et un mot de passe. Elle s'affiche seule, hors d'AppShell (D-339).

Ne pas l'utiliser pour :
- créer un compte, ou changer un mot de passe : prendre `FormPage` ;
- redemander le mot de passe avant une action sensible : prendre `useOpenForm` (`FormDialog.spec.md`).

## Anatomie
1. Fond de page : `--surface-side`, sur toute la fenêtre.
2. Panneau (obligatoire) : 464 px de large au plus, fond `--surface`, trait `--line`, rayon 12 px, sans ombre (ce n'est pas un élément qui flotte).
3. En-tête : logo de l'app (facultatif, 48 px de haut au plus), titre (`--fs-xl`, `--fw-heading`), sous-titre facultatif (`--fg-2`). Centrés.
4. Message d'échec (après un envoi raté) : un seul, en haut du panneau, sous l'en-tête. Icône en `--danger`, texte `--fg`, fond teinté de `--danger`.
5. Fournisseurs d'identité (facultatif) : un bouton `secondary` pleine largeur par fournisseur, puis un trait coupé par « ou ».
6. Champs : identifiant, puis mot de passe avec un bouton-icône « Afficher le mot de passe » dans le cadre, à droite. 16 px d'écart.
7. Ligne facultative : case « Se souvenir de moi » à gauche, lien « Mot de passe oublié ? » à droite.
8. Bouton « Se connecter » (`primary`, pleine largeur).

## Variantes
Aucune variante visuelle. Les parties facultatives apparaissent selon les options.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `onSubmit` | `(values: LoginValues) => Promise<void \| { error: string }>` | — (obligatoire) | Connecte. `values` : `{ identifier, password, remember }`. Rendre `{ error }` affiche ce message ; une exception affiche « La connexion a échoué. Réessayez. ». |
| `logo` | `ReactNode` | aucun | Logo de l'app, fourni par l'app (nom accessible compris). |
| `title` | `string` | « Connexion » (i18n) | Titre de la page (`h1`). |
| `subtitle` | `string` | aucun | Phrase sous le titre. |
| `identifierLabel` | `string` | « Adresse e-mail ou identifiant » (i18n) | Libellé du champ identifiant, si l'app n'accepte qu'une adresse. |
| `defaultIdentifier` | `string` | `""` | Identifiant de départ (dernier compte utilisé). |
| `showRemember` | `boolean` | `false` | Affiche la case « Se souvenir de moi ». |
| `forgotHref` | `string` | aucun | Adresse du lien « Mot de passe oublié ? ». |
| `onForgot` | `() => void` | aucun | Action du lien ; sans `forgotHref`, le lien est un bouton. Sans l'un ni l'autre, pas de lien. |
| `providers` | `{ label, icon?, onPress }[]` | aucun | Fournisseurs d'identité (SSO), au-dessus du formulaire. `label` est complet : « Continuer avec Exemple ». |

## Exclus
- Pas de texte indicatif à la place d'un libellé : les libellés sont toujours visibles.
- Pas d'erreur de connexion sous un champ : elle dirait si l'identifiant existe.
- Pas d'inscription, de captcha, de code à usage unique ni de choix de langue dans le gabarit.
- Pas d'image de fond, de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Repos | Champs vides (ou identifiant de départ), pas de message. |
| Champ vide à l'envoi | Message sous chaque champ vide (« Saisissez votre mot de passe. »), focus sur le premier ; rien n'est envoyé. Le message part dès que le champ change. |
| Envoi | Roue dans « Se connecter », second envoi ignoré, formulaire `aria-busy`. Les fournisseurs sont désactivés. |
| Échec | Message global en haut du panneau, `role="alert"`, le focus va dessus. Les deux champs gardent leur valeur. |
| Réussite | Rien : l'app change de page. |

## Comportement
- Entrée dans un champ envoie le formulaire.
- Le bouton « Afficher le mot de passe » est une bascule (`aria-pressed`) : le champ passe en texte, puis revient en mot de passe.
- Le contrôle côté client se limite aux champs vides. Le format de l'identifiant n'est pas vérifié : il peut être une adresse ou un nom d'utilisateur.
- Après un échec, le mot de passe est gardé : la personne corrige une faute de frappe sans tout ressaisir, et peut l'afficher pour la voir (D-339).
- Un nouvel échec remet le focus sur le message, même si le texte ne change pas.

## Contenu
- Titre : « Connexion », ou le nom de l'espace (« Connexion à Exemple »).
- Message d'échec : une phrase qui ne dit pas quel champ est faux (« Identifiant ou mot de passe incorrect. »).
- Fournisseur : « Continuer avec » et le nom du fournisseur.

## Densité
Marges du panneau fixes (32 px, 20 px sur mobile) ; hauteurs des champs et boutons `--row-h` : web et desktop suivent leurs tokens.

## Clavier
Tab suit l'ordre : fournisseurs, identifiant, mot de passe, « Afficher le mot de passe », case, lien, « Se connecter ». Entrée envoie.

## Accessibilité
- La page est un repère `main` ; le panneau est une région nommée par le titre.
- `autoComplete="username"` et `autoComplete="current-password"` : les gestionnaires de mots de passe remplissent les champs.
- Le message d'échec est annoncé (`role="alert"`) et reçoit le focus.
- Les fournisseurs forment un groupe nommé « Autres moyens de connexion » ; le « ou » est décoratif (caché aux lecteurs d'écran).

## Taille d'écran
- Le panneau fait 464 px au plus et reste centré.
- Mobile : toute la largeur moins 16 px de chaque côté.

## Erreurs
Une exception levée par `onSubmit` affiche « La connexion a échoué. Réessayez. ». Un `{ error: "" }` affiche le même message.

## Niveau de réglage
L'app choisit le logo, les textes, les parties facultatives et les fournisseurs. Le reste est fixe.

## Placement
Seule dans la fenêtre, avant AppShell (layout-rules : LoginPage).

## Composition
`TextInput`, `Checkbox`, `Link`, `Button`, `IconButton`, `Field`.

## Décisions
D-130, D-132, D-191, D-339.

## Questions ouvertes
