# Règles de mise en page — « où va une information »

Ces règles s'appliquent à toutes les apps. Si aucune règle ne couvre un cas, on pose la question avant d'inventer, puis on ajoute la règle ici.

## AppShell

| Zone | Ce qui y va | Ce qui n'y va pas |
|---|---|---|
| `topbar` | Bouton de repli de la sidebar, précédent/suivant, **nom de la page**, **onglets des vues de la page** (D-021), actions de la page en boutons-icônes, bouton du panneau de détail (icône liste), commandes (Mod+K). En Tauri, la place des boutons de fenêtre (D-020). | Les filtres, la recherche dans une liste, les actions sur un élément précis. |
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
- **Échap** ferme ce qui flotte (overlay, feuille, détail en overlay, modale, menu).

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
