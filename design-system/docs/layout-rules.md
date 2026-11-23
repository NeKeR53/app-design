# Règles de mise en page — « où va une information »

Ces règles s'appliquent à toutes les apps. Si aucune règle ne couvre un cas, on pose la question avant d'inventer, puis on ajoute la règle ici.

## AppShell

| Zone | Ce qui y va | Ce qui n'y va pas |
|---|---|---|
| `topbar` | Bouton de repli de la sidebar, précédent/suivant, **nom de la page**, **onglets des vues de la page** (D-021), actions de la page (`ActionBar` `topbar` : icônes, « … », action principale à texte, D-220), cloche du centre de notifications (D-157), état durable de la page en indicateur compact (D-159), bouton du panneau de détail (icône liste), commandes (Mod+K). En Tauri, la place des boutons de fenêtre (D-020). | Les filtres, la recherche dans une liste, les actions sur un élément précis. Aucun bandeau pleine largeur dessous (D-159). |
| `sidebar` → navigation | Les pages principales : une icône, puis un libellé. Une action facultative peut apparaître au survol (D-002). | Les vues d'une page : elles sont dans les onglets (D-021). |
| `sidebar` → sections | Des sections repliables, qui contiennent soit des éléments de navigation, soit des éléments sur deux lignes avec enfants (D-002). | Des réglages, ou du contenu de travail. |
| `sidebar` → `account` | L'avatar, le nom et le plan ; le bouton Réglages (roue dentée). | Toute autre action. |
| `main` | Le gabarit de la page (ListPage, DetailPage, FormPage…). | La navigation globale. |
| `detail` | Les propriétés de l'élément courant, modifiables sur place ; l'aide contextuelle ; les pièces jointes. Ce panneau est facultatif (D-018). | Le contenu principal, et les actions destructrices sans confirmation. |
| `tabbar` (mobile) | Quatre entrées principales au plus, puis « Plus » (D-003). | Les vues d'une page. |

## Comportements globaux

- **Sidebar** : dépliée à l'ouverture, état mémorisé (D-016). Une fois repliée, elle revient en overlay au survol du bouton ; un clic la redéplie (D-017).
- **Panneau de détail** : colonne sur bureau, état mémorisé ; overlay à droite sur tablette ; plein écran sur mobile (D-018).
- **Onglets de vues** : chaque page déclare ses vues, et retient la dernière vue ouverte. Ouvrir un élément ajoute une vue fermable (D-021).
- **Mobile** : barre d'onglets en bas. « Plus » ouvre une feuille sans les entrées déjà présentes dans les onglets (D-003, D-019).
- **Réglages** : modale sur bureau et tablette, plein écran sur mobile (D-015).
- **Points de rupture** : 640 et 1024 px (D-013).
- **Messages** (D-159) : le résultat d'une action va dans un toast (D-154), avec « Annuler » si l'action se défait (D-007) ; un événement passé va dans le centre de notifications (D-156) ; un état durable de la page ou de l'app (hors ligne, lecture seule) va dans la barre du haut ; un message local reste un encart dans la zone concernée (D-085). Jamais de bandeau pleine largeur.
- **Échap** ferme ce qui flotte (overlay, feuille, détail en overlay, modale, menu).
- **Fenêtre secondaire** : `Dialog`, au-dessus de l'AppShell. Pied calé à droite : « Annuler », puis l'action (D-124). Sur mobile, `sm` et `md` centrées, `lg` et `xl` en plein écran (D-121).
- **Confirmation** : seulement avant une action irréversible (D-007), par `useConfirm` : titre en question, phrase de conséquence, bouton au verbe de l'action (D-126 à D-128).

## Actions (D-111)

Une app décrit ses actions par des données (`Action`) et les passe à `ActionBar` avec la zone. La forme suit la zone, jamais la page.

| Zone | Où | Action principale | Icônes visibles | Reste |
|---|---|---|---|---|
| `topbar` | `actions` d'AppShell | Première icône (D-112) ; sans icône, bouton à texte (D-220) | 3, puis selon la place (D-221) | « … » |
| `header` | En-tête de ListPage, DetailPage | Bouton à texte, à droite | 3 | « … » |
| `toolbar` | Barre d'outils (sélection) | Bouton à texte, à droite | 3 | « … » |
| `section` | Titre de section | Bouton secondaire `sm` (D-113) | 2 | « … » |
| `row` | Ligne de Table, List | Sans effet | 1 (D-114) | « … » |
| `empty` | État vide | Bouton à texte, seul | 0 | rien |

- Ordre : icônes, « … », action principale à droite.
- Action `danger` : dans « … », en dernier, après un trait, confirmée (D-115).
- Sous 640 px : les icônes de `topbar`, `header` et `toolbar` passent dans « … » (D-117).
- Barre du haut : quand la place manque, les icônes passent dans « … » depuis la dernière, puis le bouton à texte ; ensuite seulement les vues défilent (D-221).
- Un seul bouton plein par écran : une action principale à texte dans la barre du haut exclut celle de l'en-tête du gabarit (D-220).

## Gabarits

### ListPage
- `header` : titre et description courte.
- `actions` : une action principale au plus, les autres en secondaire.
- `toolbar` : recherche et filtres.
- `list` : lignes. On sélectionne au clic ou aux flèches, on ouvre au double-clic ou avec Entrée. L'ouverture ajoute une vue fermable.
- `footer` : compteur et « Afficher plus ».
- `empty` : icône, titre, phrase d'explication et action principale.

### DetailPage
- `header` : lien de retour vers la vue principale, titre, statut, méta, actions.
- `content` : sections titrées, séparées par des traits.
- Les propriétés vont dans le panneau de détail.

### FormPage (D-022)
- `header` : titre et phrase d'intention.
- `sections` : sections titrées. Sur bureau, le titre et l'aide sont à gauche ; ailleurs, ils passent au-dessus. Chaque champ a son libellé au-dessus et son aide ou son erreur en dessous.
- `footer` : barre d'actions collée en bas, avec l'état d'enregistrement, « Annuler » et l'action principale.

### SettingsPage (D-015)
- `nav` : recherche, groupes séparés par un trait, éléments de navigation (icône et libellé), lien externe en pied.
- `content` : titre de section, puis lignes de réglage pleine largeur. Le libellé et la description sont à gauche, le contrôle calé à droite. Les changements s'appliquent immédiatement (D-007).

## Petites règles

- Sur un fond de sélection, le texte tertiaire passe en texte secondaire (contraste AA).
- Une info-bulle se place du côté où il y a de la place ; elle n'est jamais coupée par un bord.
- Une ombre est réservée à ce qui flotte ; le reste se sépare par des traits.
- Rayons (D-040) : 8 px pour un contrôle (bouton, bouton-icône, onglet, élément de sidebar ou de menu, champ, info-bulle) ; 4 px pour un petit contrôle placé dans un autre (× d'un onglet, case à cocher) ; 12 px pour un conteneur (carte, menu flottant, modale). Aucun autre rayon.
- Interrupteur ou case (D-137) : un interrupteur s'applique tout de suite (réglage, ligne du panneau de détail) ; une case fait partie d'un formulaire qu'on envoie.
- Champs (D-130, D-133) : libellé au-dessus, aide ou erreur en dessous ; la largeur du champ annonce la longueur attendue (`xs` à `lg`), sinon toute la colonne.
