# Inspiration : application desktop Claude

On reprend l'anatomie, les états, le comportement et le placement. On ne reprend ni le code, ni les icônes, ni les textes, ni les couleurs, ni l'identité de marque.

## 01 — Sidebar, arborescence (`01-sidebar-arborescence.png`, extrait de 140 × 444 px)

- **observé** — Un élément de liste tient sur deux lignes : un titre en texte principal foncé, puis un sous-titre plus petit, en gris, sur une seule ligne et coupé (ellipse ou fondu).
- **observé** — L'élément sélectionné a un fond gris neutre aux coins arrondis (environ 10–12 px), sans bordure et sans barre de couleur.
- **observé** — Les éléments enfants sont en retrait sous leur parent et reliés par un trait vertical fin et gris. Le dernier enfant se termine par un coude arrondi.
- **observé** — Les enfants ne portent ni fond ni puce. Ils sont séparés par un espacement vertical généreux.
- **observé** — Le fond de la sidebar est un gris très clair, uni et chaud, sans séparateur visible.
- **supposé** — Les enfants se replient et se déplient avec le parent (pas d'icône de dépliage visible sur l'extrait).
- **supposé** — Le survol donne un fond proche de celui de la sélection, en plus léger.

## 02 à 05 — Vue principale, repli, overlay, survol

Captures : `02-vue-principale.png`, `03-sidebar-repliee.png`, `04-sidebar-overlay.png`, `05-survol-action.png`. Fenêtre de 1512 × 949 pt ; les mesures ci-dessous sont des estimations en points logiques.

Ce que l'utilisateur dit aimer est une **intention de design** : la sidebar minimaliste avec l'identifiant en bas, le repli avec overlay, les icônes visibles au survol, les sections repliables, les éléments imbriqués (« important »), l'en-tête minimaliste, le contenu épuré et la colonne de détail.

### AppShell (02)

- **observé** — Trois colonnes :
  - la sidebar (~330 pt), sur un fond gris très clair ;
  - le contenu, sur un fond blanc ;
  - la colonne de détail (~340 pt), sur un fond blanc.
- **observé** — Les colonnes sont séparées par un trait vertical fin. Aucune ombre.
- **observé** — Une barre supérieure de ~44 pt court sur toute la largeur, séparée du reste par un trait fin :
  - dans la partie sidebar : le bouton de repli, les flèches précédent/suivant, puis un sélecteur segmenté de deux boutons-icônes calé à droite (le bouton actif a un fond gris) ;
  - dans la partie contenu : le titre de la page, suivi d'un chevron qui en fait un menu ;
  - à droite : six boutons-icônes, celui qui est actif a un fond gris arrondi, le dernier est « … ».
- **observé** — Le style est monochrome : noir, gris et blanc. La couleur ne sert qu'à porter un sens : lien ou non-lu en bleu, ajouts en vert, suppressions en rouge, icône d'alerte.
- **observé** — Police système (type SF Pro), ~15 pt pour le texte courant, des titres sans graisse forte.

### Sidebar (02)

- **observé** — La navigation principale est une icône en trait de 16 pt suivie d'un libellé. Lignes de ~34 pt, sans fond au repos.
- **observé** — Les en-têtes de section (« Needs input », « Idle ») sont petits, gris, sans majuscules, et suivis d'un chevron bas qui sert à replier la section.
- **observé** — L'élément sur deux lignes :
  - ligne 1 : le titre, un chevron « › » quand il a des enfants repliés, et à droite une icône d'état facultative (alerte) ;
  - ligne 2 : le sous-titre gris, coupé, et à droite une étiquette grise (le projet).
- **observé** — Enfants repliés : une ligne résumé sous le parent, du type « ╰ 19 nested · 11 unread », où le compteur de non-lus est en bleu.
- **observé** — Enfants dépliés : le chevron du parent pointe vers le bas, et l'enfant est en retrait, relié par un coude (voir 01).
- **observé** — L'élément sélectionné a un fond gris arrondi et un bouton « … » visible à droite.
- **observé** — En pied de sidebar, séparé par un trait fin :
  - à gauche, un avatar rond (initiale), le nom, « · » et le plan en gris, puis un chevron ;
  - à droite, une roue dentée pour les réglages.

### Repli et overlay (03, 04)

- **observé** — Une fois la sidebar repliée, le contenu prend la largeur libérée. Le bouton de repli et les flèches restent dans la barre supérieure, et le titre se décale à gauche. La colonne de détail reste en place.
- **observé** — Au survol du bouton de repli, la sidebar complète s'affiche **en overlay** par-dessus le contenu : elle ne le pousse pas et ne l'assombrit pas.
- **observé** — Une info-bulle sombre et compacte s'affiche, avec le libellé et le raccourci en gris clair (« Show sidebar ⌘B »).

### Survol d'un élément de navigation (05)

- **observé** — Au survol, la ligne prend un fond gris arrondi et une icône d'action « + » apparaît à droite, avec son info-bulle sombre (« New from a template »).

### Contenu (02)

- **observé** — Une colonne de lecture centrée d'environ 700 pt.
- **observé** — Les messages de l'utilisateur sont alignés à droite, dans une bulle grise. Les réponses sont du texte nu, sans cadre.
- **observé** — Sous une réponse : une rangée de petites icônes d'action grises, puis l'horodatage.
- **observé** — La zone de saisie est une carte à bord fin, aux coins arrondis, avec « + » à gauche et le micro à droite. Elle est surmontée d'une bande d'état grise et suivie d'une ligne de réglages en texte (modèle, niveau, mode).

### Colonne de détail (02)

- **observé** — Elle est organisée en sections titrées (« Environment », « Changes ») séparées par des traits fins.
- **observé** — Chaque ligne suit la forme icône + libellé + valeur grise, avec à droite une action facultative : lien souligné (« Save »), interrupteur, ou bouton gris plein (« Create PR »).
- **observé** — Certaines lignes s'ouvrent : un libellé suivi de « › », avec à droite une valeur et une mini-jauge.

### Supposés

- **supposé** — La sidebar en overlay se referme quand la souris en sort.
- **supposé** — L'état replié de la sidebar est mémorisé.
- **supposé** — La colonne de détail se masque avec le bouton-icône actif de la barre supérieure.

### Note de généricité (règle 7)

« Conversation » et « sous-agent » sont des exemples, pas des composants. Dans le design system, ils deviennent des notions génériques :
- l'élément de liste sur deux lignes, avec méta, état et enfants ;
- la section repliable ;
- la ligne résumé des enfants ;
- le panneau de détail à sections ;
- la ligne de propriété (icône, libellé, valeur, action).

## 06 — Mode sombre (`06-vue-principale-sombre.webp`)

Les valeurs ci-dessous servent à comprendre la hiérarchie des surfaces. Elles ne seront pas reprises telles quelles : les tokens auront leurs propres valeurs (étape 4).

- **observé** — Mise en page, structure et composants sont identiques au mode clair. Seules les surfaces et le texte changent.
- **observé** — La hiérarchie des surfaces s'inverse par rapport au mode clair :
  - en clair, la sidebar est **plus foncée** que le contenu (gris ~#ededec contre blanc) ;
  - en sombre, la sidebar est **plus claire** que le contenu (~#282624 contre ~#1a1a1a). La colonne de détail et la barre supérieure sont au niveau du contenu, voire un cran plus sombres.
  - Règle déduite : la sidebar est une « surface secondaire », qui se distingue du contenu dans les deux modes, et non une « surface plus foncée ».
- **observé** — Les gris sont légèrement chauds en sombre (une pointe de brun sur la sidebar), et neutres pour le contenu.
- **observé** — La sélection est un fond nettement plus clair que la sidebar (~#474544). En clair, c'est l'inverse : un fond plus foncé (~#d5d4d4). Dans les deux cas, la sélection est un cran de contraste au-dessus de la surface.
- **observé** — Le bouton actif de la barre supérieure a un fond à peine plus clair que la barre.
- **observé** — La zone de saisie est un peu plus claire que le contenu (~#303030), sans bordure marquée.
- **observé** — Les traits de séparation sont très discrets (~#3a3b38), sur le même principe qu'en clair.
- **observé** — Les couleurs de sens restent les mêmes en sombre : bleu pour le non-lu et les liens, vert et rouge pour les changements. Le bouton gris plein (« Create PR ») reste un gris un cran au-dessus de la surface.
- **observé** — Le texte secondaire est gris moyen, le texte principal blanc cassé (pas de blanc pur).

## 07 — Réglages, mode sombre (`07-reglages-sombre.webp`)

### Conteneur

- **observé** — Les réglages s'ouvrent dans une **grande fenêtre modale** posée sur l'app, et non dans une page. On y trouve :
  - le titre « Settings » en haut à gauche ;
  - un bouton de fermeture « × » en haut à droite ;
  - un trait sous l'en-tête.
- **observé** — Deux colonnes : une navigation à gauche (~200 pt), le contenu à droite. Les deux sont séparées par un trait vertical fin, sur la même surface sombre.

### Navigation des réglages

- **observé** — Un champ de recherche en tête : une loupe, le texte indicatif « Search », un fond un cran plus clair, sans bordure, coins arrondis.
- **observé** — Les éléments suivent la forme icône en trait + libellé, comme dans la sidebar principale (même composant visuel).
- **observé** — Les éléments sont rangés en groupes séparés par des traits courts en retrait, sans titre de groupe :
  - compte (Account, Billing, Usage) ;
  - préférences (Appearance, …, Wellbeing) ;
  - extensions (Plugins, Code) ;
  - application (Desktop app).
- **observé** — L'élément actif a un fond gris arrondi, sur la même logique que la sélection de la sidebar.
- **observé** — En pied de navigation, un lien externe discret : un libellé gris avec une flèche « ↗ » à droite (« API keys »).

### Contenu : la ligne de réglage (`SettingRow`)

- **observé** — Le titre de la section (« Claude Code ») est en haut, en texte moyen, sans graisse forte.
- **observé** — Chaque réglage est une ligne :
  - à gauche, le libellé (texte principal) et une description dessous (texte secondaire gris, sur plusieurs lignes si besoin) ;
  - à droite, le contrôle, aligné sur le libellé ou centré verticalement.
- **observé** — Les lignes sont séparées par des traits fins, avec un espacement vertical généreux (~24 pt de marge interne).
- **observé** — Contrôles rencontrés à droite :
  - champ texte : fond un cran plus clair, sans bordure, coins arrondis, largeur fixe (~210 pt) ;
  - interrupteur : bleu quand il est activé, pastille blanche (seule couleur d'accent de l'écran) ;
  - contrôle segmenté à trois options : l'option active a un fond plus clair et une bordure fine ;
  - bouton secondaire (« Open Appearance ») : fond gris un cran plus clair, sans bordure ;
  - liste déroulante : fond un cran plus clair, valeur à gauche, chevron bas à droite, même largeur que le champ texte.
- **observé** — Un badge facultatif peut suivre le libellé (« Local only ») : petit texte gris sur une pastille arrondie un cran plus claire.
- **supposé** — La recherche filtre les réglages de toutes les sections.
- **supposé** — Échap ferme la modale.
- **supposé** — Sur une fenêtre étroite, la navigation passe au-dessus du contenu ou se transforme en liste.

### Intentions de l'utilisateur sur les réglages

- La **recherche** en tête de la navigation des réglages est à reprendre.
- La **séparation en groupes thématiques** (traits courts, sans titre) est à reprendre.
- Les **éléments de navigation** sont les mêmes que dans la sidebar principale : icône puis libellé.
- Les réglages sont **vraiment séparés** du reste de l'app : un espace à part, avec sa propre navigation.
- Les **contrôles occupent toute la largeur** de la ligne : texte à gauche, contrôle calé au bord droit. Pas de formulaire étroit et centré.
