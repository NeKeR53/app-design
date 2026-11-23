# Journal des décisions

## D-001 — Ton visuel : sobre fidèle
- Date : 2026-11-21
- Portée : global
- Décision : direction A, « sobre fidèle » : neutres légèrement chauds, rayons moyens (~10 px), respiration confortable. Monochrome, la couleur d'accent ne porte que du sens.
- Raison : c'est la direction décrite par l'utilisateur à partir de l'app desktop Claude, et elle tient dans les deux densités.
- Options écartées : B « compact technique » (gris froids, rayons 6 px) ; C « doux aéré » (fonds crème, rayons 14 px).
- Validation : docs/validation/02-principes.html

## D-002 — Sections de sidebar : deux types d'éléments
- Date : 2026-11-21
- Portée : Sidebar
- Décision : une section repliable de la sidebar peut contenir soit des éléments de navigation (icône + libellé, avec action facultative au survol), soit des éléments sur deux lignes avec enfants.
- Raison : l'utilisateur veut des sections qui ne servent pas seulement à des listes de type conversation.
- Options écartées : sections réservées aux éléments sur deux lignes.
- Validation : docs/validation/02-principes.html

## D-003 — Navigation mobile : barre d'onglets en bas avec « Plus »
- Date : 2026-11-21
- Portée : AppShell
- Décision : en largeur mobile, la sidebar est remplacée par une barre d'onglets en bas d'écran (variante M1). Un dernier onglet « Plus » ouvre le menu complet dans une feuille montant du bas : navigation, sections, profil et réglages. La variante M2 (action centrale) reste une option facultative du composant. Sur tablette et bureau, la sidebar est conservée.
- Raison : une sidebar cachée est difficile à utiliser au doigt ; M1 garde tout accessible en deux touches avec une seule structure pour toutes les apps.
- Options écartées : sidebar en overlay sur mobile ; M2 comme comportement par défaut.
- Validation : docs/validation/02-principes.html

## D-004 — Deux densités : web confortable, desktop compact
- Date : 2026-11-21
- Portée : tokens
- Décision : deux densités portées par les tokens. « Web » (confortable) est la densité par défaut des apps web, « desktop » (compacte) celle des apps Tauri. Les composants sont identiques, seuls les espacements, les hauteurs de ligne et les tailles de texte changent.
- Raison : la densité web convient au tactile sur tablette et mobile, la densité compacte à la saisie intensive sur desktop.
- Options écartées : une seule densité partout.
- Validation : docs/validation/02-principes.html

## D-005 — Mode clair / sombre : suivre le système
- Date : 2026-11-21
- Portée : global
- Décision : clair et sombre sont tous deux pris en charge. Par défaut, l'app suit le réglage du système. Un choix manuel « Système / Clair / Sombre » est proposé dans les réglages, et il est mémorisé.
- Raison : c'est le comportement attendu sur toutes les plateformes, sans effort pour l'utilisateur.
- Options écartées : clair par défaut ; un seul mode.
- Validation : docs/validation/02-principes.html

## D-006 — Clavier : raccourcis multiplateformes et palette de commandes
- Date : 2026-11-21
- Portée : global
- Décision : la souris suffit partout, et tout est aussi faisable au clavier.
  - La navigation se fait entièrement au clavier : Tab, flèches, Entrée, Échap.
  - Les raccourcis sont déclarés une fois avec le modificateur « Mod », qui vaut ⌘ sur macOS et Ctrl sur Windows.
  - Leur affichage suit le système : « ⌘K », « ⌥ », « ⇧ » sur macOS ; « Ctrl+K », « Alt », « Maj » sur Windows.
  - Sur le web, aucun raccourci ne prend la place d'un raccourci du navigateur ou du système (Ctrl+N, Ctrl+T, Ctrl+W…).
  - Une palette de commandes commune s'ouvre avec Mod+K.
- Raison : ce sont des apps de travail à saisie intensive, utilisées sur macOS et Windows, sur le web comme en desktop.
- Options écartées : pas de palette ; raccourcis écrits en dur pour un seul système.
- Validation : docs/validation/02-principes.html

## D-007 — Réduction des clics : quatre règles
- Date : 2026-11-21
- Portée : global
- Décision :
  1. Les actions fréquentes d'un élément apparaissent au survol. Sur tactile, elles restent accessibles par un appui long ou par le menu « … ».
  2. Un réglage s'applique dès qu'on le change, sans bouton « Enregistrer ». La validation explicite est réservée aux formulaires longs et aux actions risquées.
  3. Chaque option a une valeur par défaut raisonnable, et les derniers choix de l'utilisateur sont mémorisés (sidebar repliée, sections ouvertes, filtres).
  4. On ne demande confirmation que pour l'irréversible (supprimer, envoyer). Le reste agit immédiatement et peut être annulé depuis une notification.
- Raison : des apps de travail où chaque clic évité compte ; ces règles reprennent les comportements appréciés dans l'inspiration.
- Options écartées : enregistrement explicite partout ; confirmations systématiques.
- Validation : docs/validation/02-principes.html

## D-008 — Librairie headless : React Aria Components
- Date : 2026-11-21
- Portée : global
- Décision : les comportements et l'accessibilité des composants reposent sur React Aria Components (`react-aria-components`, licence Apache 2.0). Le design system en contrôle seul l'apparence.
- Raison : c'est la meilleure prise en charge du tactile (appui, appui long, survol contre toucher), des langues et de l'accessibilité AA pour les listes, arborescences et menus.
- Options écartées : Radix (licence MIT), plus simple et répandu, mais moins complet sur le tactile et les langues.
- Validation : aucune page (décision technique).

## D-009 — Méthode de style : Tailwind sur des tokens en variables CSS
- Date : 2026-11-21
- Portée : global
- Décision : les composants sont stylés avec Tailwind. Les tokens restent des variables CSS (rôles de surface, densités, accent, clair et sombre), exposées à Tailwind comme thème. Les états de React Aria (`data-hovered`, `data-pressed`, `data-focus-visible`…) se ciblent avec des variantes Tailwind.
- Raison : choix de l'utilisateur ; Tailwind est aussi utilisé pour assembler les écrans des apps, ce qui donne un seul langage de style.
- Options écartées : CSS Modules avec variables CSS (recommandés pour l'autonomie du package).
- Validation : aucune page (décision technique).

## D-010 — Distribution des styles : CSS compilé et thème Tailwind partagé
- Date : 2026-11-21
- Portée : global
- Décision : le package livre deux éléments.
  - `@moi/ui/styles.css` : la feuille déjà compilée de tous les composants, importée une fois par l'app.
  - `@moi/ui/theme.css` : le thème Tailwind des tokens, importé par les apps qui utilisent Tailwind pour assembler leurs écrans.
  Les apps ne scannent jamais le code du package.
- Raison : les composants s'affichent de la même façon dans toutes les apps, quelle que soit leur version ou configuration de Tailwind, et les apps partagent les mêmes noms de tokens.
- Options écartées : scan du package par la configuration Tailwind de chaque app.
- Validation : aucune page (décision technique).

## D-011 — Icônes : ReactNode, Lucide recommandée
- Date : 2026-11-21
- Portée : global
- Décision : les composants reçoivent leurs icônes en `ReactNode` et ne dépendent d'aucune librairie. Le design system fixe la taille (16 px, 20 px dans la barre d'onglets mobile), l'épaisseur du trait et la couleur au moyen des tokens. Lucide (`lucide-react`, licence ISC) est la librairie recommandée aux apps, sans être obligatoire.
- Raison : son style au trait fin correspond à l'inspiration, son catalogue est large, et l'épaisseur de son trait se règle.
- Options écartées : icônes intégrées au package ; Phosphor ou Tabler par défaut.
- Validation : aucune page (décision technique).

## D-012 — Jeu de tokens : neutre pur
- Date : 2026-11-21
- Portée : tokens
- Décision : jeu T2 « neutre pur » : des gris sans teinte pour toutes les surfaces et tous les textes ; du texte en 14 px (web) et 13 px (desktop) ; des rayons de 4, 8 et 12 px ; un accent bleu `#1d4ed8` en clair et `#5b8def` en sombre. Sur un fond de sélection, le texte tertiaire passe en secondaire, pour respecter le niveau AA.
- Raison : choix de l'utilisateur ; le rendu est plus « outil », et tous les contrastes passent le niveau AA dans les deux modes.
- Options écartées : T1 « chaud discret » (recommandé) ; T3 « chaud contrasté ».
- Note : ce choix nuance D-001, qui reste valable pour la sobriété, la structure et la respiration ; seuls les gris deviennent neutres au lieu de chauds.
- Validation : docs/validation/04-tokens.html

## D-013 — Points de rupture
- Date : 2026-11-21
- Portée : tokens
- Décision : trois formats.
  - Mobile, jusqu'à 640 px : barre d'onglets en bas (D-003).
  - Tablette, de 641 à 1024 px : la sidebar reste, et le panneau de détail passe en overlay.
  - Bureau, au-delà de 1024 px : trois colonnes.
  Une fenêtre desktop Tauri rétrécie suit les mêmes règles.
- Raison : ces valeurs couvrent les téléphones en portrait, les tablettes en portrait et en paysage (768 et 1024 px) et les fenêtres d'ordinateur.
- Options écartées : aucune proposée.
- Validation : docs/validation/04-tokens.html

## D-014 — Mouvement
- Date : 2026-11-21
- Portée : tokens
- Décision : trois durées, toutes avec la courbe `cubic-bezier(.2, 0, 0, 1)`.
  - `dur-fast`, 120 ms : survol, interrupteur, pression.
  - `dur-base`, 180 ms : repli de section, menus.
  - `dur-slow`, 260 ms : sidebar en overlay, feuille mobile, modale.
  Avec `prefers-reduced-motion: reduce`, toutes les durées passent à 0.
- Raison : une interface vive pour des apps de travail ; le respect de la préférence système est attendu par le niveau AA.
- Options écartées : aucune proposée.
- Validation : docs/validation/04-tokens.html

## D-015 — Réglages : modale sur bureau et tablette, plein écran sur mobile
- Date : 2026-11-21
- Portée : SettingsPage
- Décision : sur bureau et tablette, les réglages s'ouvrent dans une grande modale posée sur l'app : titre, bouton de fermeture, navigation à gauche avec recherche et groupes, lignes de réglage pleine largeur. Sur mobile, ils s'ouvrent en plein écran, avec la navigation sous forme de liste puis le détail d'une section. Le gabarit `SettingsPage` est le même dans les deux cas ; seul son conteneur change.
- Raison : les réglages restent un espace à part sans faire perdre l'écran de travail, ce qui correspond à l'inspiration et au souhait de l'utilisateur.
- Options écartées : page dédiée dans le contenu principal.
- Validation : docs/validation/05-layout.html

## D-016 — Sidebar à l'ouverture : dépliée, état mémorisé
- Date : 2026-11-21
- Portée : AppShell
- Décision : sur bureau et tablette, la sidebar est dépliée par défaut. L'état choisi par l'utilisateur (dépliée ou repliée) est mémorisé pour chaque app et restauré au lancement suivant. Sur mobile, la barre d'onglets la remplace (D-003).
- Raison : la navigation est visible au premier lancement, et le choix de l'utilisateur est respecté ensuite (D-007, règle 3).
- Options écartées : repliée par défaut sur tablette.
- Validation : docs/validation/05-layout.html

## D-017 — Overlay de la sidebar repliée
- Date : 2026-11-21
- Portée : AppShell
- Décision : quand la sidebar est repliée, elle s'affiche en overlay au survol du bouton de repli, sans déplacer le contenu. Elle se referme 250 ms après que la souris a quitté le bouton et la sidebar, ou avec Échap. Un clic sur le bouton, Mod+B ou Entrée au clavier la redéplie pour de bon ; ce nouvel état est mémorisé (D-016).
- Raison : c'est le comportement observé et apprécié dans l'inspiration ; le délai pardonne les mouvements imprécis, et le clavier garde un équivalent.
- Options écartées : overlay ouvert seulement au clic.
- Validation : docs/validation/05-layout.html

## D-018 — Panneau de détail selon la largeur
- Date : 2026-11-21
- Portée : AppShell
- Décision :
  - Bureau : colonne à droite, visible par défaut. Elle s'affiche ou se masque avec le bouton à icône liste ou Mod+., et ce choix est mémorisé.
  - Tablette : fermé par défaut. Il s'ouvre en overlay à droite, avec un titre et un bouton ×, et Échap le ferme.
  - Mobile : il s'ouvre en plein écran sous la barre supérieure, avec un bouton ×.
  Le panneau est facultatif : sans contenu de détail, ni la colonne ni le bouton ne s'affichent. Les éléments visuels du repli et du dépli (animation, poignée, largeur réglable) seront définis dans la spec de l'AppShell.
- Raison : le contenu garde sa place sur les écrans étroits, et le détail reste à un clic partout.
- Options écartées : colonne permanente quelle que soit la largeur.
- Validation : docs/validation/05-layout.html

## D-019 — Feuille « Plus » sans doublons
- Date : 2026-11-21
- Portée : AppShell
- Décision : sur mobile, la feuille « Plus » n'affiche pas les entrées de navigation déjà présentes dans la barre d'onglets. Elle contient le reste de la navigation, les sections, puis le profil et les réglages en pied. L'app déclare ses entrées une seule fois et indique celles qui vont dans les onglets ; le composant en déduit le contenu de la feuille.
- Raison : la feuille reste courte et ne montre que ce qu'on ne trouve pas ailleurs.
- Options écartées : feuille identique à la sidebar complète.
- Validation : docs/validation/05-layout.html

## D-020 — Tauri : barre de titre personnalisée
- Date : 2026-11-21
- Portée : AppShell
- Décision : dans les apps Tauri, la barre supérieure de l'AppShell sert aussi de barre de fenêtre.
  - Sur macOS, les trois boutons du système restent en haut à gauche ; l'AppShell leur réserve leur place avant le bouton de repli.
  - Sur Windows, réduire, agrandir et fermer sont dessinés en haut à droite, après les actions de la page, aux dimensions de Windows ; le survol de « fermer » passe au rouge.
  - Toute zone vide de la barre déplace la fenêtre, et un double-clic l'agrandit ; les boutons restent cliquables.
  Sur le web, aucune place n'est réservée.
- Raison : une seule bande en haut, comme dans l'inspiration, tout en respectant les conventions de chaque système.
- Options écartées : barre de titre native au-dessus de l'app.
- Validation : docs/validation/05-layout.html

## D-021 — Onglets de vues dans la barre de titre
- Date : 2026-11-21
- Portée : AppShell
- Décision :
  - La barre de titre affiche le nom de la page courante, puis ses vues sous forme d'onglets. Exemple : Documents │ Tous les documents · Créer un rapport · Édition du rapport.
  - La sidebar choisit la page ; elle n'ouvre ni ne ferme jamais d'onglet.
  - Chaque page déclare ses vues, qui sont fixes et sans ×.
  - Le × est facultatif : ouvrir un élément ajoute une vue fermable à son nom, ou active celle qui le montre déjà.
  - Chaque page retient sa dernière vue. Mod+1 à 9 passent d'une vue à l'autre.
  - Sur mobile, la barre affiche le nom de la page, puis la vue courante avec un chevron qui ouvre la liste des vues.
- Raison : l'utilisateur veut naviguer entre plusieurs vues d'une même page (créer, éditer…) sans passer par le menu.
- Options écartées : onglets de pages façon navigateur, liés à la navigation de la sidebar.
- Validation : docs/validation/05-layout.html

## D-022 — Formulaires
- Date : 2026-11-21
- Portée : FormPage
- Décision :
  - Le libellé est au-dessus de chaque champ, l'aide ou l'erreur en dessous. Un champ facultatif est marqué « (facultatif) », sans astérisques.
  - Les champs sont regroupés en sections titrées. Sur bureau, le titre et l'aide de la section sont à gauche et les champs à droite ; sur tablette et mobile, ils passent au-dessus.
  - Une barre d'actions reste collée en bas : état d'enregistrement à gauche, « Annuler » et l'action principale à droite.
  - Une erreur s'affiche sous le champ concerné, avec une bordure rouge et une phrase qui dit quoi corriger. Elle apparaît quand on quitte le champ ou qu'on valide, jamais pendant la saisie.
  Ces règles valent pour les formulaires longs ; les réglages restent à application immédiate (D-007).
- Raison : c'est la disposition la plus lisible ; elle tient sur mobile et supporte des libellés plus longs dans d'autres langues.
- Options écartées : libellés à gauche des champs ; astérisques sur les champs obligatoires.
- Validation : docs/validation/05-layout.html

## D-023 — Nom : Socle (`socle-ui`)
- Date : 2026-11-21
- Portée : global
- Décision : le design system s'appelle « Socle » ; son package s'appelle `socle-ui` (nom vérifié libre sur npm le 2026-11-21). Les apps importent `socle-ui`, `socle-ui/styles.css` et `socle-ui/theme.css`.
- Raison : choix de l'utilisateur ; c'est la base commune de toutes les apps.
- Options écartées : Établi, Ardoise, Trame ; un nom à portée (`@…/ui`), qui reste possible plus tard.
- Validation : aucune page.

## D-024 — Base de code : starter Tailwind officiel de React Aria
- Date : 2026-11-21
- Portée : global
- Décision : pour coder chaque composant, on part du fichier correspondant du starter Tailwind officiel de React Aria (`adobe/react-spectrum`, dossier `starters/tailwind`, licence Apache 2.0). On le copie dans Socle, puis on l'adapte aux tokens et à la spec ; on retire `className` et `style` de l'API publique (API fermée). La mention de licence Apache 2.0 est conservée en tête des fichiers repris.
- Raison : le gain de temps est comparable à celui de shadcn, sans abandonner React Aria (D-008).
- Options écartées : shadcn/ui (Radix, `className` partout, rendu par défaut reconnaissable) ; écrire chaque composant à partir de zéro.
- Validation : aucune page.

## D-025 — Panneau de détail : largeur réglable
- Date : 2026-11-21
- Portée : AppShell
- Décision : sur bureau, l'utilisateur règle la largeur du panneau de détail avec une poignée, entre 240 et 480 px. La largeur est mémorisée. Un double-clic sur la poignée revient à la largeur par défaut (`--detail-w`). Au clavier, la poignée a le rôle `separator` et les flèches changent la largeur par pas de 16 px. Sur tablette et sur mobile, il n'y a pas de poignée.
- Raison : le contenu du détail varie selon l'app ; l'app Claude permet aussi ce réglage.
- Options écartées : largeur fixe ; largeur choisie par l'app seulement.
- Validation : docs/validation/components/AppShell-v1.html

## D-026 — Panneaux sans animation
- Date : 2026-11-21
- Portée : AppShell
- Décision : le panneau de détail et l'overlay de la sidebar s'ouvrent et se ferment sans animation, sur toutes les tailles d'écran. Les durées de D-014 restent pour les autres éléments (survol, menus, info-bulles).
- Raison : choix de l'utilisateur après essai ; l'affichage immédiat est plus direct dans une app de travail.
- Options écartées : glissement de 260 ms à l'ouverture et à la fermeture.
- Validation : docs/validation/components/AppShell-v1.html

## D-027 — Trop de vues : défilement et chevron
- Date : 2026-11-21
- Portée : AppShell
- Décision : sur bureau et sur tablette, quand les onglets de vues dépassent la largeur, la rangée défile. Un chevron « Toutes les vues » s'affiche alors en fin de rangée et ouvre la liste de toutes les vues. L'onglet actif reste toujours visible. Sur mobile, il n'y a pas d'onglets : le titre de la vue, avec son chevron, ouvre la même liste. Un seul chevron est visible à la fois.
- Raison : une seule rangée reste lisible, et chaque vue s'atteint en un clic depuis la liste.
- Options écartées : onglets sur deux lignes ; onglets réduits jusqu'à l'illisible ; menu « Plus » qui regroupe seulement les vues cachées.
- Validation : docs/validation/components/AppShell-v1.html

## D-028 — Icônes internes : jeu intégré
- Date : 2026-11-21
- Portée : global
- Décision : Socle contient son propre petit jeu d'icônes internes en SVG (chevrons, ×, repli de la sidebar, liste du détail, plus, précédent, suivant, engrenage), dessinées dans le style de Lucide (grille 24, trait 1,5 à 2, `currentColor`). Ces icônes ne servent qu'aux composants de Socle et ne sont pas exportées. Socle ne dépend pas de Lucide ; les apps restent libres de leurs icônes (D-011).
- Raison : aucune dépendance imposée aux apps, et un rendu identique partout.
- Options écartées : dépendance à `lucide-react` dans Socle.
- Validation : docs/validation/components/AppShell-v1.html

## D-029 — Réglages par app : `SocleProvider`
- Date : 2026-11-21
- Portée : global
- Décision : chaque app place un seul `SocleProvider` à sa racine. Il accepte quatre options facultatives : `accent` (couleur de marque ; défaut : bleu T2, D-012), `density` (`web` ou `desktop` par défaut ; défaut : `desktop` en Tauri, `web` sinon), `platform` (`web`, `macos`, `windows` ; défaut : détection automatique) et `storageKey` (préfixe des données mémorisées ; défaut : nom de l'app). L'accent sombre est calculé à partir de l'accent clair, et les deux paires de contraste doivent passer AA ; sinon le provider garde le défaut et avertit en console. Les choix de l'utilisateur (mode, densité, animations réduites) passent avant les défauts de l'app. Tout le reste est verrouillé.
- Raison : ces quatre réglages varient vraiment d'une app à l'autre ; le préfixe évite que deux apps du même domaine écrasent leurs données.
- Options écartées : réglages passés à chaque composant ; variables CSS modifiées par l'app ; aucun réglage par app.
- Validation : docs/validation/components/AppShell-v1.html

## D-030 — Info-bulle : sombre constant
- Date : 2026-11-21
- Portée : Tooltip, tokens
- Décision : la bulle reste sombre dans les deux modes. Nouveaux tokens : `--tip-bg`, `--tip-fg`, `--tip-fg-2` (raccourci) et `--tip-line`. Clair : #1f1f1f, #f2f2f2, #a8a8a8, sans bord. Sombre : #3a3a3a, #f2f2f2, #b5b5b5, avec un bord #4a4a4a. Contrastes : au moins 5,5:1 pour le raccourci, 10:1 pour le texte.
- Raison : la bulle se distingue toujours du contenu, sans éblouir en mode sombre ; c'est le rendu déjà validé dans l'AppShell.
- Options écartées : B inversée (claire en mode sombre) ; C flottante comme les menus.
- Validation : docs/validation/components/Tooltip-v1.html

## D-031 — Info-bulle : délai de 500 ms (fenêtre de passage remplacée par D-088)
- Date : 2026-11-21
- Portée : Tooltip
- Décision : au premier survol, l'info-bulle apparaît après 500 ms. D'un élément à l'autre, elle apparaît tout de suite, tant que la souris ne quitte pas les éléments plus de 600 ms. Au focus clavier, elle apparaît tout de suite. Elle se ferme dès que la souris quitte l'élément. Réglages React Aria : `delay={500}`, `closeDelay={0}` ; la fenêtre de 600 ms est réglée dans `TooltipTrigger` de Socle.
- Raison : les boutons-icônes se lisent vite, sans bulles qui s'ouvrent quand la souris ne fait que passer.
- Options écartées : aucun délai ; 1 s ; 1,5 s (défaut de React Aria).
- Validation : docs/validation/components/Tooltip-v1.html

## D-032 — Info-bulle : raccourci clavier affiché
- Date : 2026-11-21
- Portée : Tooltip
- Décision : l'option facultative `shortcut` (par exemple `"Mod+K"`) affiche le raccourci après le texte, en `--tip-fg-2`. Socle le convertit selon la plateforme du `SocleProvider` (D-006, D-029) : « ⌘K » sur macOS, « Ctrl+K » sur Windows et sur le web hors macOS. Le raccourci est aussi ajouté à l'élément avec `aria-keyshortcuts`.
- Raison : c'est le seul endroit où l'on découvre les raccourcis sans ouvrir de menu.
- Options écartées : texte seul ; raccourcis listés seulement dans la palette de commandes.
- Validation : docs/validation/components/Tooltip-v1.html

## D-033 — Info-bulle : sans flèche
- Date : 2026-11-21
- Portée : Tooltip
- Décision : la bulle n'a pas de flèche. Elle est placée à 6 px de l'élément.
- Raison : la bulle reste proche de son élément, et une flèche alourdit le dessin des petites bulles (D-001).
- Options écartées : flèche de 8 px vers l'élément.
- Validation : docs/validation/components/Tooltip-v1.html

## D-034 — Bouton-icône sélectionné : le survol reste visible
- Date : 2026-11-21
- Portée : IconButton
- Décision : un bouton-icône sélectionné (bascule) a un fond clair `--hover`. Au survol, son fond fonce en `--selected`. Au repos, un bouton sélectionné ressemble donc à un bouton non sélectionné survolé ; l'icône en `--fg` et `aria-pressed` marquent la sélection.
- Raison : demande de l'utilisateur ; avec le fond `--selected` au repos, le survol d'un bouton sélectionné ne se voyait pas.
- Options écartées : fond `--selected` au repos, sans changement au survol.
- Validation : docs/validation/components/IconButton-v1.html

## D-035 — Bouton-icône : 28 px en web, 24 px en desktop
- Date : 2026-11-21
- Portée : IconButton, tokens
- Décision : nouveau token de densité `--icon-btn` : 28 px en web, 24 px en desktop, 44 px sur écran tactile (`pointer: coarse`). L'icône garde 16 px.
- Raison : c'est la taille déjà validée dans l'AppShell ; elle passe le minimum de 24 px (WCAG 2.2) et reste légère en desktop.
- Options écartées : B, 32 px en web et 28 px en desktop.
- Validation : docs/validation/components/IconButton-v1.html

## D-036 — Bouton-icône : rayon de 8 px
- Date : 2026-11-21
- Portée : IconButton
- Décision : le bouton-icône a le rayon `--radius-md` (8 px), dans tous les états et sur toutes les tailles.
- Raison : même forme au survol que les éléments de la sidebar et les onglets.
- Options écartées : bouton rond.
- Validation : docs/validation/components/IconButton-v1.html

## D-037 — Bouton-icône : une seule variante
- Date : 2026-11-21
- Portée : IconButton
- Décision : le bouton-icône n'a qu'une variante, transparente : il n'a de fond qu'au survol, à la pression ou quand il est sélectionné. Une variante avec fond pourra être ajoutée plus tard comme option facultative, en version mineure.
- Raison : les apps de travail placent rarement un bouton sur une image ; une seule variante garde l'API simple.
- Options écartées : variante avec fond `--field` pour un bouton isolé.
- Validation : docs/validation/components/IconButton-v1.html

## D-038 — Onglet actif : fond plein
- Date : 2026-11-21
- Portée : Tabs
- Décision : l'onglet actif a un fond plein et un texte `--fg`, comme l'élément actif de la sidebar. La barre garde le fond du contenu ; pas de trait accent.
- Raison : la sidebar et les onglets utilisent le même signe de sélection, et l'accent reste rare (D-001).
- Options écartées : B soulignement accent de 2 px ; C onglet relié au contenu, façon navigateur (proche des onglets de pages écartés par D-021).
- Validation : docs/validation/components/Tabs-v1.html

## D-039 — Onglet actif : fond fixe au survol
- Date : 2026-11-21
- Portée : Tabs
- Décision : l'onglet actif garde le fond `--selected` au repos comme au survol. Les autres onglets prennent `--hover` au survol.
- Raison : un clic sur l'onglet actif ne fait rien, donc le survol n'annonce aucune action ; et l'onglet actif reste distinct d'un onglet survolé. La règle D-034 ne vaut que pour un élément dont le clic change l'état.
- Options écartées : fond clair `--hover` qui fonce en `--selected` au survol (comme D-034).
- Validation : docs/validation/components/Tabs-v1.html

## D-040 — Rayons : une règle pour tous les contrôles
- Date : 2026-11-21
- Portée : global
- Décision : le rayon dépend du rôle de l'élément, avec les trois rayons de D-012.
  - 8 px (`--radius-md`) : tout contrôle qui prend un fond au survol ou à la sélection (bouton, bouton-icône, onglet, élément de sidebar, élément de menu, champ, liste déroulante). L'info-bulle prend aussi 8 px.
  - 4 px (`--radius-sm`) : un petit contrôle placé dans un autre (× d'un onglet, action au survol d'un élément de sidebar, case à cocher, pastille).
  - 12 px (`--radius-lg`) : un conteneur (carte, liste encadrée, menu flottant, modale).
  Aucun autre rayon n'est permis. Le rayon de 6 px de l'info-bulle (spec de Tooltip) est remplacé par 8 px.
- Raison : demande de l'utilisateur ; des contrôles homogènes ont la même forme au survol, côte à côte dans une barre.
- Options écartées : rayon choisi composant par composant ; onglets à 4 px ; info-bulle à 6 px.
- Validation : docs/validation/components/Tabs-v1.html

## D-041 — Onglets : × au survol et sur l'onglet actif
- Date : 2026-11-21
- Portée : Tabs
- Décision : sur un onglet fermable, le × n'apparaît qu'au survol de l'onglet, au focus clavier et sur l'onglet actif. Sa place reste réservée, pour que la largeur de l'onglet ne change pas. Le clic du milieu et Suppr ferment aussi la vue.
- Raison : une rangée de × charge la barre et réduit la place des libellés.
- Options écartées : × toujours visible.
- Validation : docs/validation/components/Tabs-v1.html

## D-042 — Enfants dépliés : trait et coude
- Date : 2026-11-21
- Portée : Sidebar, tokens
- Décision : les enfants dépliés d'un élément sont reliés au parent par un trait vertical de 1 px ; le dernier enfant se termine par un coude arrondi de 8 px, et chaque autre enfant par un petit trait horizontal. Nouveau token `--tree-line` : #cfcfcf en clair, #4a4a4a en sombre.
- Raison : l'utilisateur tient aux éléments imbriqués ; le trait montre à quel parent appartient chaque enfant, même dans une longue liste.
- Options écartées : simple retrait, sans trait.
- Validation : docs/validation/components/Sidebar-v1.html

## D-043 — Enfants repliés : ligne résumé
- Date : 2026-11-21
- Portée : Sidebar
- Décision : sous un parent replié, une ligne résumé de 24 px affiche le nombre d'enfants et, s'il y en a, le nombre de non-lus (« 4 éléments · 2 non lus »), avec le même coude que les enfants. Un clic sur la ligne déplie les enfants ; le chevron du titre reste aussi disponible. Texte en `--fs-sm`, `--fg-3` ; le compte des non-lus suit la règle du non-lu.
- Raison : on voit ce qui attend sans rien déplier ; c'est le comportement apprécié dans l'inspiration.
- Options écartées : chevron seul.
- Validation : docs/validation/components/Sidebar-v1.html

## D-044 — Sidebar : point de non-lu et compteur
- Date : 2026-11-21
- Portée : Sidebar
- Décision : deux signes facultatifs.
  - Non-lu : un point `--accent` de 6 px à droite du titre d'un `TreeItem` (option `unread`). Dans la ligne résumé, le nombre de non-lus est en `--accent-text`. Le lecteur d'écran annonce « non lu ».
  - Compteur : un nombre en `--fs-sm`, `--fg-3` (`--fg-2` sur l'élément sélectionné), à droite d'un `Sidebar.Item` (option `count`). Au-delà de 99, il affiche « 99+ ».
- Raison : ce sont des signes de sens (D-001) ; le bleu reste réservé au non-lu, et le compteur reste gris pour ne pas charger la navigation.
- Options écartées : aucun signe ; compteur en pastille colorée.
- Validation : docs/validation/components/Sidebar-v1.html

## D-045 — Section longue : 5 éléments, puis « Afficher plus »
- Date : 2026-11-21
- Portée : Sidebar
- Décision : une section affiche ses 5 premiers éléments, puis une ligne « Afficher plus (n) ». Un clic affiche le reste, et la ligne devient « Afficher moins ». Ce choix est mémorisé par section (D-007). Si l'élément sélectionné est au-delà du 5ᵉ, la section s'affiche en entier. L'app peut changer le nombre avec l'option facultative `limit` de `Sidebar.Section`.
- Raison : une section longue ne repousse pas les autres hors de l'écran ; les éléments placés en premier par l'app restent visibles.
- Options écartées : tout afficher.
- Validation : docs/validation/components/Sidebar-v1.html

## D-046 — Menu du compte
- Date : 2026-11-21
- Portée : Sidebar
- Décision : un clic sur l'avatar et le nom, en pied de sidebar, ouvre un menu au-dessus du pied. L'app fournit ses entrées avec l'option facultative `menu` de `Sidebar.Account` (par exemple « Profil », « Changer de compte », « Se déconnecter »). Un chevron double signale que le nom est cliquable. Sans entrée, le nom est une simple étiquette, sans chevron. Le bouton Réglages reste à part, à droite (Mod+,).
- Raison : changer de compte ou se déconnecter se fait en deux clics, sans ouvrir les réglages ; c'est le comportement de l'inspiration.
- Options écartées : nom non cliquable, accès au compte seulement par les réglages.
- Validation : docs/validation/components/Sidebar-v1.html

## D-047 — Menu : icônes facultatives, libellés alignés
- Date : 2026-11-21
- Portée : Menu
- Décision : l'icône d'un élément de menu est facultative (16 px, `--fg-2`). Si au moins un élément du menu a une icône, les éléments sans icône gardent une place vide de 16 px, et tous les libellés restent alignés. Un menu sans aucune icône n'a pas de colonne vide.
- Raison : une icône aide à repérer une action fréquente, mais toutes les actions n'en ont pas d'évidente ; la place réservée garde l'alignement.
- Options écartées : B jamais d'icône ; C icône obligatoire.
- Validation : docs/validation/components/Menu-v1.html

## D-048 — Menu : raccourci affiché à droite
- Date : 2026-11-21
- Portée : Menu
- Décision : l'option facultative `shortcut` d'un élément de menu (par exemple `"Mod+N"`) affiche le raccourci à droite, en `--fs-sm`, `--fg-3`, au format de la plateforme : « ⌘N » sur macOS, « Ctrl+N » sur Windows (D-006). Même option et même conversion que l'info-bulle (D-032) ; l'élément reçoit `aria-keyshortcuts`. Le raccourci lui-même est déclaré par l'app.
- Raison : avec les info-bulles, le menu est l'endroit où l'on découvre les raccourcis ; le gris ne gêne pas la lecture.
- Options écartées : pas de raccourci dans les menus.
- Validation : docs/validation/components/Menu-v1.html

## D-049 — Menu : élément danger en rouge, en dernier
- Date : 2026-11-21
- Portée : Menu
- Décision : l'option facultative `danger` d'un élément de menu met son libellé et son icône en `--danger`. Un élément danger est toujours le dernier du menu, après un séparateur. Il est réservé aux actions destructrices (supprimer, retirer l'accès) ; son clic ouvre une confirmation (D-007). Contraste vérifié sur `--surface-raised` et sur `--hover`, en clair et en sombre (au moins 4,5:1).
- Raison : le rouge porte un sens (D-001) : l'action est irréversible.
- Options écartées : élément danger neutre, distingué seulement par sa place.
- Validation : docs/validation/components/Menu-v1.html

## D-050 — Menu : coche à droite
- Date : 2026-11-21
- Portée : Menu
- Décision : dans une section de choix (`selectionMode`), la coche de l'élément choisi s'affiche en fin de ligne, en `--fg`, 16 px. La colonne de gauche reste réservée aux icônes (D-047). Choix unique : rôle `menuitemradio` ; choix multiple : `menuitemcheckbox`. Un choix ne ferme pas le menu en sélection multiple ; il le ferme en sélection unique.
- Raison : un menu peut mélanger actions avec icône et choix ; les libellés restent alignés.
- Options écartées : coche à gauche, à la place de l'icône.
- Validation : docs/validation/components/Menu-v1.html

## D-051 — Menu : sous-menu sur un seul niveau
- Date : 2026-11-21
- Portée : Menu
- Décision : un élément de menu peut ouvrir un sous-menu, signalé par « › » en fin de ligne. Le sous-menu s'ouvre au survol après 200 ms, au clic, ou avec flèche droite ; flèche gauche ou Échap le referment et rendent le focus à l'élément parent. Il se place à droite du menu, ou à gauche si la place manque. Un sous-menu ne contient pas d'autre sous-menu.
- Raison : ranger un élément se fait en deux clics, sans fenêtre ; un seul niveau reste simple au clavier et à la souris.
- Options écartées : aucun sous-menu (fenêtre de choix « Déplacer vers… ») ; sous-menus sur plusieurs niveaux.
- Validation : docs/validation/components/Menu-v1.html

## D-052 — Éléments du haut : icône obligatoire
- Date : 2026-11-21
- Portée : Sidebar
- Décision : chaque élément du haut de la sidebar (`Sidebar.Item`) a une icône de 16 px à gauche ; TypeScript refuse un élément sans `icon`. Les sous-éléments n'ont pas d'icône.
- Raison : l'icône sert de repère rapide, et la colonne d'icônes donne un rythme régulier en haut de la sidebar.
- Options écartées : icône facultative avec place gardée.
- Validation : docs/validation/components/Sidebar-v2.html

## D-053 — Éléments du haut : deux actions au plus
- Date : 2026-11-21
- Portée : Sidebar
- Décision : un élément du haut peut avoir jusqu'à deux actions à droite, chacune un bouton-icône de 22 px et de 4 px de rayon (D-040), avec info-bulle. La seconde est en général « … », qui ouvre un `Menu` avec les autres actions. Quand les actions s'affichent, elles remplacent le compteur, pour garder la place du libellé. Remplace l'action unique de la v1 (option `action` devient `actions`).
- Raison : l'action la plus fréquente reste à un clic, les autres sont dans « … » ; au-delà de deux icônes, le libellé se coupe trop tôt.
- Options écartées : une seule action ; plus de deux actions.
- Validation : docs/validation/components/Sidebar-v2.html

## D-054 — Éléments du haut : actions au survol
- Date : 2026-11-21
- Portée : Sidebar
- Décision : les actions d'un élément du haut apparaissent au survol, au focus clavier et sur l'élément sélectionné ; le reste du temps, la ligne montre son compteur ou rien. Sur écran tactile, elles passent par un appui long ou par le « … » (D-007). Confirme la règle de la v1.
- Raison : la sidebar reste calme ; c'est le comportement apprécié dans l'inspiration.
- Options écartées : actions toujours visibles.
- Validation : docs/validation/components/Sidebar-v2.html

## D-055 — Éléments du haut : un indicateur permanent
- Date : 2026-11-21
- Portée : Sidebar
- Décision : un élément du haut peut avoir un seul indicateur permanent à droite (option `indicator`), parmi une liste fermée : `external` (↗, s'ouvre dans le navigateur), `locked` (verrou, lecture seule) et `activity` (point de 8 px, activité en cours). Les icônes sont en `--fg-3` (14 px) ; le point d'activité est en `--success`. Chaque indicateur a une info-bulle et un nom accessible (« Lecture seule »). Il reste visible au survol, à gauche des actions. Un élément ne peut pas avoir à la fois un indicateur et un compteur.
- Raison : l'état de la page se voit sans l'ouvrir ; une liste fermée garde la sidebar homogène entre les apps.
- Options écartées : aucun indicateur ; indicateurs libres fournis par l'app ; plusieurs indicateurs par élément.
- Validation : docs/validation/components/Sidebar-v2.html

## D-056 — Éléments du haut : sous-pages sur un niveau
- Date : 2026-11-21
- Portée : Sidebar
- Décision : un élément du haut peut se déplier sur des sous-pages (option `children`), sur un seul niveau, avec un chevron après le libellé. Les sous-pages sont reliées au parent par le trait et le coude de D-042. Une sous-page a un libellé, et peut avoir un compteur, un indicateur et des actions, mais pas d'icône. Le dépliage est mémorisé (D-007) ; quand une sous-page est sélectionnée, son parent reste déplié. Un clic sur le parent ouvre sa propre page ; seul le chevron déplie. Les vues d'une page restent dans les onglets (D-021).
- Raison : une app avec beaucoup de pages garde un haut de sidebar court, avec le même signe de liaison que les éléments sur deux lignes.
- Options écartées : aucun sous-élément ; plusieurs niveaux.
- Validation : docs/validation/components/Sidebar-v2.html

## D-057 — Panneau de détail : icônes facultatives, alignées par section
- Date : 2026-11-21
- Portée : DetailPanel
- Décision : l'icône d'une ligne de propriété est facultative (16 px, `--fg-2`). Si au moins une ligne d'une section a une icône, les lignes sans icône de cette section gardent une place vide, et les libellés restent alignés. Une section sans aucune icône n'a pas de colonne vide. Même règle que le Menu (D-047), appliquée section par section.
- Raison : une icône aide à repérer une propriété, mais toutes n'en ont pas d'évidente.
- Options écartées : B jamais d'icône ; C icône obligatoire.
- Validation : docs/validation/components/DetailPanel-v1.html

## D-058 — Panneau de détail : deux colonnes alignées
- Date : 2026-11-21
- Portée : DetailPanel
- Décision : dans une ligne de propriété, le libellé occupe une colonne de 96 px (`--fg-2`), puis la valeur commence au même endroit sur toutes les lignes du panneau. Un libellé ou une valeur trop longs passent à la ligne (valeur : trois lignes au plus, puis ellipse et info-bulle). Le haut du libellé et le haut de la valeur sont alignés.
- Raison : on parcourt les valeurs d'un coup d'œil, de haut en bas.
- Options écartées : A valeur collée à droite ; C valeur sous le libellé.
- Validation : docs/validation/components/DetailPanel-v1.html

## D-059 — Panneau de détail : une action par ligne, bouton à texte en pied de section
- Date : 2026-11-21
- Portée : DetailPanel
- Décision : une ligne de propriété a au plus une action à droite, parmi trois types : lien court d'un mot (`--accent-text`, `--fs-sm`), interrupteur (`Switch`), ou bouton-icône (`IconButton` de 22 px, rayon 4 px, D-040), qui peut ouvrir un `Menu`. Un bouton à texte (« Exporter l'historique ») ne va jamais dans une ligne : il va en pied de section, sous les lignes (option `footer` de `DetailPanel.Section`). Le nom accessible de l'action reprend le libellé de la ligne.
- Raison : dans un panneau d'environ 300 px, la valeur garde sa place, et chaque ligne garde le même rythme.
- Options écartées : plusieurs actions par ligne ; bouton à texte dans la ligne.
- Validation : docs/validation/components/DetailPanel-v1.html

## D-060 — Panneau de détail : ligne qui s'ouvre, sur place
- Date : 2026-11-21
- Portée : DetailPanel
- Décision : une ligne de propriété qui a du contenu caché affiche « › » comme action ; toute la ligne est cliquable (fond `--hover` au survol). Un clic, Entrée ou Espace déplie le contenu sous la ligne, sur place, et le chevron pivote vers le bas ; un second clic replie. L'état est mémorisé (D-007), sans animation (D-026). Un contenu trop riche pour se déplier s'ouvre dans une vue fermable (D-021). Dans toute ligne, l'action est centrée sur la première ligne de texte.
- Raison : on garde le contexte de l'élément, et un clic suffit pour replier.
- Options écartées : sous-niveau qui remplace le panneau, avec retour.
- Validation : docs/validation/components/DetailPanel-v1.html

## D-061 — Panneau de détail : sections repliables
- Date : 2026-11-21
- Portée : DetailPanel
- Décision : un clic sur le titre d'une section la replie ou la déplie ; un chevron de 12 px suit le titre. L'état est mémorisé par section et reste le même d'un élément à l'autre (D-007). Sans animation (D-026). Le titre est un bouton avec `aria-expanded`.
- Raison : on garde en vue les sections utiles ; même geste que les sections de la sidebar.
- Options écartées : sections toujours ouvertes.
- Validation : docs/validation/components/DetailPanel-v1.html

## D-062 — Tableau : pleine largeur, sans cadre
- Date : 2026-11-21
- Portée : Table
- Décision : le tableau occupe toute la largeur de la zone `list`, sans bord ni rayon. L'en-tête est séparé des lignes par un trait `--line` ; il reste collé en haut quand le tableau défile.
- Raison : plus sobre (D-001), et toute la largeur sert aux données.
- Options écartées : tableau encadré (bord, rayon 12 px).
- Validation : docs/validation/components/Table-v1.html

## D-063 — Tableau : lignes compactes
- Date : 2026-11-21
- Portée : Table
- Décision : une ligne du tableau a la hauteur `--row-h` : 34 px en web, 28 px en desktop. L'en-tête a la même hauteur. Une cellule ne passe jamais à la ligne : le texte se coupe avec une ellipse et une info-bulle.
- Raison : plus de lignes visibles sans défiler, et le même rythme que la sidebar et les menus ; la densité règle déjà l'écart entre web et desktop (D-004).
- Options écartées : lignes confortables (44 px en web, 36 px en desktop).
- Validation : docs/validation/components/Table-v1.html

## D-064 — Tableau : traits horizontaux
- Date : 2026-11-21
- Portée : Table
- Décision : chaque ligne du tableau est séparée de la suivante par un trait horizontal de 1 px en `--line`. Pas de trait vertical entre les colonnes ; pas de zébrage.
- Raison : c'est le signe de séparation déjà utilisé partout (layout-rules) ; un zébrage se confondrait avec le survol et demanderait un token de plus.
- Options écartées : lignes zébrées.
- Validation : docs/validation/components/Table-v1.html

## D-065 — Tableau : case de sélection au survol
- Date : 2026-11-21
- Portée : Table
- Décision : en sélection multiple, la case d'une ligne apparaît au survol de la ligne et au focus clavier. Dès qu'une ligne est cochée, les cases de toutes les lignes restent visibles. La case « Tout sélectionner » de l'en-tête est toujours visible, avec un état mixte quand une partie est cochée. Sur écran tactile, les cases sont toujours visibles. Espace coche la ligne.
- Raison : le tableau reste calme à la lecture ; même règle que les actions au survol (D-007, D-054) ; la case de l'en-tête signale la sélection multiple.
- Options écartées : cases toujours visibles.
- Validation : docs/validation/components/Table-v1.html

## D-066 — Tableau : actions de ligne au survol
- Date : 2026-11-21
- Portée : Table
- Décision : une ligne a deux actions au plus, à droite, dans une colonne réservée. Elles apparaissent au survol, au focus et sur la ligne sélectionnée (même règle que la sidebar, D-053, D-054). La seconde est en général « … », qui ouvre un `Menu` ; un clic droit sur la ligne ou Maj+F10 ouvrent le même menu. Sur écran tactile : appui long ou « … » (D-007).
- Raison : une seule règle d'actions dans toute l'app ; le tableau reste calme à la lecture.
- Options écartées : colonne « … » toujours visible.
- Validation : docs/validation/components/Table-v1.html

## D-067 — Tableau : colonnes redimensionnables
- Date : 2026-11-21
- Portée : Table
- Décision : le bord droit de chaque en-tête se glisse pour régler la largeur de la colonne, de 80 à 480 px. La largeur est mémorisée par tableau (D-007). Un double-clic sur le bord rend la largeur par défaut. Au clavier, la poignée a le rôle `separator`, et les flèches changent la largeur de 16 px. La colonne principale prend la place restante. Même geste que le panneau de détail (D-025).
- Raison : dans un tableau de travail, chacun ajuste les colonnes à son contenu.
- Options écartées : largeurs fixées par l'app.
- Validation : docs/validation/components/Table-v1.html

## D-068 — Liste : traits horizontaux
- Date : 2026-11-21
- Portée : List
- Décision : les éléments d'une liste sont séparés par un trait horizontal de 1 px en `--line`, sans rayon, comme les lignes du tableau (D-064). Le survol et la sélection remplissent toute la largeur de l'élément. Les coins arrondis restent le signe de la navigation (sidebar, menus).
- Raison : la liste et le tableau occupent la même zone et s'échangent sur mobile ; ils doivent se ressembler.
- Options écartées : éléments arrondis sans trait.
- Validation : docs/validation/components/List-v1.html

## D-069 — Liste : visuel à gauche facultatif, un type par liste
- Date : 2026-11-21
- Portée : List
- Décision : une liste peut avoir un visuel à gauche de chaque élément (option `leading` de la liste), d'un seul type pour toute la liste : `icon` (16 px, `--fg-2`), `avatar` (32 px, rond, initiales sur `--field`, ou photo) ou `thumbnail` (40 px, rayon 8 px, D-040). Sur une seule ligne, l'avatar et la vignette passent à 24 px. Un élément sans visuel garde la place vide.
- Raison : l'app choisit le visuel adapté à son contenu ; un seul type garde les titres alignés.
- Options écartées : jamais de visuel ; types mélangés dans une même liste.
- Validation : docs/validation/components/List-v1.html

## D-070 — Liste : groupes avec en-têtes collés
- Date : 2026-11-21
- Portée : List
- Décision : une liste peut ranger ses éléments en groupes (option facultative `groups`), avec un en-tête en `--fs-sm`, `--fg-3`, sans chevron : un groupe de liste ne se replie pas. L'en-tête du groupe en cours reste collé en haut pendant le défilement. L'en-tête n'est pas focusable ; il nomme le groupe pour le lecteur d'écran.
- Raison : une longue liste se parcourt plus vite, et on sait où l'on se trouve.
- Options écartées : pas de groupes ; groupes repliables.
- Validation : docs/validation/components/List-v1.html

## D-071 — Barre de recherche : suggestions et étiquettes
- Date : 2026-11-21
- Portée : SearchField
- Décision : la barre de recherche propose des suggestions pendant la frappe, dans une liste sous le champ. Entrée transforme le texte saisi, ou la suggestion choisie, en étiquette placée dans la barre, avant le texte en cours. Chaque étiquette a un × pour la retirer. Le contenu est filtré par toutes les étiquettes. Remplace les exclusions de la v1 (« pas de suggestions », « pas de filtres dans le champ »).
- Raison : demande de l'utilisateur ; on construit une recherche précise sans quitter le clavier.
- Options écartées : champ de texte simple sans suggestions ni étiquettes (v1).
- Validation : docs/validation/components/SearchField-v2.html

## D-072 — Barre de recherche : suggestions et étiquettes facultatives
- Date : 2026-11-22
- Portée : SearchField
- Décision : les suggestions et les étiquettes sont deux options facultatives et indépendantes de la barre de recherche (`suggestions`, `tagMode`). Sans elles, la barre est un champ simple : le texte filtre la page, et Entrée ne crée rien. Par défaut, les deux sont désactivées ; l'app les active selon son besoin. Complète D-071.
- Raison : demande de l'utilisateur ; toutes les pages n'ont pas besoin d'une recherche à critères.
- Options écartées : suggestions et étiquettes toujours présentes.
- Validation : docs/validation/components/SearchField-v2.html

## D-073 — Barre de recherche : bord fin
- Date : 2026-11-22
- Portée : SearchField, tokens
- Décision : la barre de recherche a un fond `--surface` et un bord de 1 px en `--line-strong`, nouveau token (#cfcfcf en clair, #4a4a4a en sombre). Au survol, le bord passe en `--fg-3` ; au focus, l'anneau `--accent` s'ajoute. `--tree-line` (D-042) reprend la valeur de `--line-strong`.
- Raison : choix de l'utilisateur ; le champ se distingue des boutons de la barre d'outils.
- Options écartées : fond `--field` sans bord.
- Validation : docs/validation/components/SearchField-v2.html

## D-074 — Barre de recherche : suggestions d'éléments
- Date : 2026-11-22
- Portée : SearchField
- Décision : la liste de suggestions affiche d'abord « Rechercher « texte » », puis, sous le titre « Éléments », jusqu'à 5 éléments de la page dont le titre contient le texte (sans casse ni accents). Choisir un élément ajoute une étiquette de texte avec son titre si les étiquettes sont activées ; sinon, le titre remplace le texte du champ. Il n'y a pas d'étiquettes typées (« Statut : … ») : l'option `types` est retirée de la spec.
- Raison : choix de l'utilisateur ; les suggestions montrent directement ce qu'on cherche.
- Options écartées : A, valeurs rangées par type avec étiquettes typées.
- Validation : docs/validation/components/SearchField-v2.html

## D-075 — Barre de recherche : étiquettes combinées en ET
- Date : 2026-11-22
- Portée : SearchField
- Décision : un élément est affiché seulement s'il contient le texte de toutes les étiquettes (et le texte en cours, si l'aperçu est actif). Chaque étiquette ajoutée réduit donc les résultats.
- Raison : c'est le comportement attendu d'une recherche : on ajoute un mot pour préciser ; les filtres de la `toolbar` servent à élargir.
- Options écartées : combinaison en OU.
- Validation : docs/validation/components/SearchField-v2.html

## D-076 — Barre de recherche : source locale ou API (remplacée par D-077)
- Date : 2026-11-22
- Portée : SearchField
- Décision : la barre de recherche fonctionne avec deux sources. Locale : elle filtre le contenu déjà chargé. API : l'app fournit des fonctions asynchrones pour les suggestions et pour les résultats ; la barre gère l'attente, l'erreur et l'abandon des requêtes devenues inutiles (seule la réponse à la dernière saisie est affichée). L'apparence et le clavier sont les mêmes pour les deux sources.
- Raison : demande de l'utilisateur ; certaines recherches portent sur des données qui ne sont pas affichées.
- Options écartées : recherche locale seulement.
- Validation : docs/validation/components/SearchField-v2.html

## D-077 — Barre de recherche : la barre seule, qui transmet des critères
- Date : 2026-11-22
- Portée : SearchField
- Décision : le composant couvre la barre seule : champ, étiquettes, liste de suggestions. Il transmet ses critères à l'app (texte en cours et étiquettes) par `onChange` ; il n'affiche ni ne filtre de résultats. Le chargement, les erreurs, l'état « aucun résultat », le compteur et le surlignage des résultats relèvent du composant qui les affiche (`Table`, `List`) et du gabarit `ListPage`. Seules les suggestions peuvent venir d'une API : la barre gère leur attente, leur erreur et l'abandon des requêtes périmées. Remplace D-076.
- Raison : demande de l'utilisateur ; la barre sert à filtrer ou trier un tableau ou une liste dont les données viennent d'une API : ce sont deux composants distincts.
- Options écartées : barre qui gère aussi les résultats (D-076).
- Validation : docs/validation/components/SearchField-v3.html

## D-078 — Barre de recherche : largeur fixe, « +n » pour le débordement
- Date : 2026-11-22
- Portée : SearchField
- Décision : la barre a une largeur fixe de 320 px (toute la largeur de la `toolbar` sur mobile) ; elle ne s'élargit jamais. Quand les étiquettes ne tiennent plus à côté d'un texte de 80 px au moins, une pastille « +n » résume les plus anciennes ; les plus récentes restent visibles, jamais coupées. L'info-bulle de « +n » les nomme ; un clic sur « +n » les affiche toutes, sur plusieurs lignes, tant que le champ garde le focus.
- Raison : choix de l'utilisateur ; la barre d'outils garde une mise en page stable.
- Options écartées : champ qui s'élargit jusqu'à 560 px ; champ toujours sur plusieurs lignes.
- Validation : docs/validation/components/SearchField-v3.html

## D-079 — Barre de recherche : critères envoyés pendant la frappe
- Date : 2026-11-22
- Portée : SearchField
- Décision : la barre appelle `onChange({ text, tags })` après une pause dans la frappe (délai : voir la spec) ; un ajout ou un retrait d'étiquette, × « Tout effacer » et Échap qui vide le champ envoient tout de suite. Les mêmes critères ne sont jamais envoyés deux fois de suite.
- Raison : le tableau ou la liste réagit sans geste de plus ; le délai évite une requête par lettre.
- Options écartées : envoi seulement à Entrée et à chaque étiquette.
- Validation : docs/validation/components/SearchField-v3.html

## D-080 — Barre de recherche : 2 caractères, 300 ms
- Date : 2026-11-22
- Portée : SearchField
- Décision : les suggestions sont demandées, et le texte est envoyé à l'app, à partir de 2 caractères et après 300 ms sans frappe. En dessous de 2 caractères, le texte est transmis vide et la liste de suggestions reste fermée. Verrouillé, identique pour toutes les apps.
- Raison : une seule lettre donne trop de résultats ; 300 ms suit le rythme normal de la frappe.
- Options écartées : 1 caractère et 150 ms ; 3 caractères et 500 ms.
- Validation : docs/validation/components/SearchField-v3.html

## D-081 — Barre de recherche : attente montrée dans le champ et dans la liste
- Date : 2026-11-22
- Portée : SearchField
- Décision : pendant le chargement des suggestions, un indicateur rotatif de 14 px (`--line-strong`, segment `--fg-2`) s'affiche dans le champ, avant le × ; dans la liste, la ligne « Recherche… » s'affiche sous « Rechercher « texte » ». Si l'utilisateur réduit les animations, l'indicateur tourne trois fois plus lentement. Le lecteur d'écran annonce « Recherche en cours ».
- Raison : l'indicateur du champ reste visible liste fermée ; la ligne explique pourquoi la liste est vide.
- Options écartées : indicateur dans le champ seul ; ligne dans la liste seule.
- Validation : docs/validation/components/SearchField-v3.html

## D-082 — Barre de recherche : erreur des suggestions en une ligne
- Date : 2026-11-22
- Portée : SearchField
- Décision : si les suggestions ne peuvent pas être chargées, la liste garde « Rechercher « texte » », puis affiche sous « Éléments » la ligne « Suggestions indisponibles » en `--fg-3`, avec le lien « Réessayer » (`--accent`) à droite. « Réessayer » relance la même demande. La ligne est annoncée au lecteur d'écran (`role="alert"`). La recherche par le texte reste possible.
- Raison : l'utilisateur comprend pourquoi les éléments manquent, et réessaie sans retaper.
- Options écartées : liste fermée sans message.
- Validation : docs/validation/components/SearchField-v3.html

## D-083 — Barre de recherche : raccourci Mod+F
- Date : 2026-11-22
- Portée : SearchField
- Décision : Mod+F (⌘F sur macOS, Ctrl+F sur Windows, D-006) place le curseur dans la barre de recherche de la page et sélectionne son texte. Le raccourci est affiché dans le champ vide (« ⌘F »). Il n'est actif que sur une page qui a une barre de recherche ; ailleurs, la recherche du navigateur reste disponible. Le champ porte `aria-keyshortcuts`.
- Raison : c'est le geste « chercher » que tout le monde connaît.
- Options écartées : « / » ; aucun raccourci.
- Validation : docs/validation/components/SearchField-v3.html

## D-084 — Résultats : squelettes au premier chargement, barre fine ensuite
- Date : 2026-11-22
- Portée : Table, List
- Décision : au premier chargement, 6 lignes squelettes (`--field`) remplacent les résultats. Lors d'une nouvelle recherche, les anciens résultats restent affichés, avec leur surlignage et leur compteur, jusqu'à la réponse ; une barre de 2 px en `--accent` défile en haut de la zone ; la zone porte `aria-busy="true"`. Si l'utilisateur réduit les animations, la barre reste fixe, à demi opaque.
- Raison : l'écran ne clignote pas à chaque requête, et l'utilisateur garde ses repères ; la barre suffit à montrer l'attente.
- Options écartées : squelettes à chaque recherche.
- Validation : docs/validation/components/Results-states-v1.html

## D-085 — Résultats : erreur de rechargement en bandeau
- Date : 2026-11-22
- Portée : Table, List
- Décision : si une nouvelle recherche échoue, les anciens résultats restent affichés, avec leur compteur. Au-dessus, un bandeau `--field`, rayon 8 px, icône d'alerte `--warning`, texte `--fg-2` : « Résultats non mis à jour : le service ne répond pas. », et le lien « Réessayer » (`--accent`) à droite. Le bandeau est annoncé (`role="alert"`) et disparaît à la réponse suivante. Au premier chargement, l'erreur reste un message centré à la place des résultats, avec « Réessayer ».
- Raison : l'utilisateur garde ce qu'il avait, et sait que la liste n'est pas à jour.
- Options écartées : message à la place des résultats à chaque erreur.
- Validation : docs/validation/components/Results-states-v1.html

## D-086 — Résultats : aucun résultat, avec rappel des critères
- Date : 2026-11-22
- Portée : Table, List
- Décision : quand une recherche ne donne rien, la zone affiche au centre « Aucun résultat pour « critère 1 », « critère 2 » » (`--fg`, critères entre guillemets), la phrase « Vérifiez l'orthographe ou retirez un critère. » (`--fg-2`, `--fs-sm`) et le bouton « Effacer la recherche » (option `onClearSearch`). Ce message se distingue de l'état vide du gabarit (aucune donnée, action principale).
- Raison : l'utilisateur voit ce qui a bloqué et en sort en un clic.
- Options écartées : message simple « Aucun résultat ».
- Validation : docs/validation/components/Results-states-v1.html

## D-087 — Résultats : texte cherché en gras
- Date : 2026-11-22
- Portée : Table, List
- Décision : dans les résultats, le texte qui correspond à un critère de recherche (sans casse ni accents) passe en `--fw-semibold`, sans changer de couleur. Le titre d'un élément non lu ne passe pas en gras : le non-lu reste signalé par le point accent (D-044). Aucun nouveau token.
- Raison : choix de l'utilisateur ; mise en avant sobre, sans nouvelle couleur.
- Options écartées : fond jaune pâle (`--mark-bg`) ; aucune mise en avant.
- Validation : docs/validation/components/Results-states-v1.html

## D-088 — Info-bulle : fenêtre de passage de 500 ms
- Date : 2026-11-22
- Portée : Tooltip
- Décision : d'un élément à l'autre, l'info-bulle apparaît tout de suite tant que la souris ne quitte pas les éléments plus de 500 ms, valeur fixe de React Aria. Remplace les 600 ms de D-031 ; le reste de D-031 (500 ms au premier survol, apparition immédiate au focus, fermeture immédiate) est inchangé.
- Raison : React Aria fixe cette fenêtre à 500 ms ; la changer obligerait à retarder la fermeture des bulles. L'écart de 100 ms est presque imperceptible.
- Options écartées : 600 ms, au prix d'une fermeture retardée.
- Validation : aucune page (alignement technique).

## D-089 — Libellés internes : dictionnaire `messages` dans SocleProvider
- Date : 2026-11-22
- Portée : global
- Décision : tous les libellés internes des composants (noms accessibles, textes d'état, texte d'aide, noms des touches de raccourci) viennent d'un dictionnaire unique, avec les valeurs françaises par défaut. Une app les remplace par l'option facultative `messages` de `SocleProvider` (traductions partielles permises ; une entrée absente garde la valeur française). Aucun composant n'écrit de texte en dur. Précise le principe « Langues » (docs/principles.md) : les libellés passent par le provider plutôt que par une prop dans chaque composant.
- Raison : plus de 40 libellés ; une app les traduit une seule fois, au même endroit, et l'API des composants reste simple.
- Options écartées : une prop par libellé dans chaque composant.
- Validation : aucune page (règle technique).

## D-100 — Bouton à texte : un composant `Button`, quatre variantes
- Date : 2026-11-23
- Portée : Button
- Décision : `Button` affiche un libellé texte (`children: string`) et une icône facultative. Il a quatre variantes : `primary`, `secondary` (par défaut), `subtle` et `danger`. `subtle` a un fond transparent et un texte `--fg-2`, avec un fond `--hover` au survol, comme IconButton. Un `aria-label` facultatif précise le nom accessible et commence par le libellé visible. Pas de `className`, pas de pleine largeur, pas de lien.
- Raison : toute app a besoin d'un bouton à texte ; le pied de section du panneau de détail en attend un (D-059).
- Options écartées : contenu libre (`ReactNode`) dans le bouton ; variante « lien ».
- Validation : docs/validation/components/Button-v1.html

## D-101 — Bouton à texte : deux tailles, `md` et `sm`
- Date : 2026-11-23
- Portée : Button, tokens
- Décision : `md` (par défaut) a la hauteur d'une ligne, `--row-h` (34 px web, 28 px desktop). `sm` a la hauteur du nouveau token `--btn-h-sm` (26 px web, 24 px desktop), pour le pied de section du panneau de détail et les zones denses. Sur mobile, la hauteur minimale passe à `--target-min` (44 px).
- Raison : le bouton s'aligne sur les champs ; le rendu de 26 px du pied de section est déjà validé (D-059).
- Options écartées : une seule taille.
- Validation : docs/validation/components/Button-v1.html

## D-102 — Bouton à texte : principale monochrome
- Date : 2026-11-23
- Portée : Button
- Décision : la variante `primary` a un fond `--fg` et un texte `--surface` : noir en mode clair, clair en mode sombre.
- Raison : le principe monochrome réserve l'accent au sens (sélection, lien, non-lu).
- Options écartées : fond `--accent`.
- Validation : docs/validation/components/Button-v1.html

## D-103 — Bouton à texte : secondaire sur fond, sans contour
- Date : 2026-11-23
- Portée : Button
- Décision : la variante `secondary` a un fond `--field` et un texte `--fg`, sans contour ; `--hover` au survol, `--selected` à la pression.
- Raison : même rendu que le pied de section validé (D-059), sans trait décoratif.
- Options écartées : fond `--surface` avec contour `--line-strong`.
- Validation : docs/validation/components/Button-v1.html

## D-104 — Bouton à texte : danger en rouge plein
- Date : 2026-11-23
- Portée : Button, tokens
- Décision : la variante `danger` a un fond `--danger` et un texte `--danger-fg`, nouveau token : blanc en clair, #1f0a08 en sombre (le rouge du mode sombre est clair). Elle sert au bouton qui exécute l'action destructrice, en général dans la confirmation.
- Raison : l'action destructrice doit se voir, et c'est la confirmation qui porte le rouge (spec IconButton).
- Options écartées : texte rouge sur fond `--field` ; contour rouge.
- Validation : docs/validation/components/Button-v1.html

## D-105 — Bouton à texte : chargement avec roue et libellé
- Date : 2026-11-23
- Portée : Button
- Décision : avec `isPending`, une roue remplace l'icône, ou se place devant le libellé ; le libellé reste. Avec une icône, la largeur ne change pas ; sans icône, le bouton s'élargit de la place de la roue (22 px). Le bouton garde le focus, ignore les clics, porte `aria-disabled` et annonce l'attente (`progressbar` nommé par le dictionnaire `messages`). Pas de libellé de remplacement.
- Précision au codage (2026-11-23) : la page de validation montrait déjà l'élargissement sans icône ; React Aria ne pose pas `aria-busy`, il pose `aria-disabled` et annonce l'attente.
- Raison : le libellé reste lisible et le bouton ne saute pas.
- Options écartées : roue seule au centre, libellé caché ; libellé de remplacement (`loadingLabel`).
- Validation : docs/validation/components/Button-v1.html

## D-106 — Bouton à texte : icône au début seulement
- Date : 2026-11-23
- Portée : Button
- Décision : l'icône facultative se place avant le libellé. Pas d'icône en fin, pas de chevron.
- Raison : un chevron de menu relève du déclencheur de `Menu`, pas du bouton.
- Options écartées : option `iconPosition` (début ou fin).
- Validation : docs/validation/components/Button-v1.html

## D-107 — Bouton-icône : état de chargement facultatif
- Date : 2026-11-23
- Portée : IconButton
- Décision : `IconButton` gagne l'option facultative `isPending`. L'icône devient une roue ; le bouton garde le focus, ignore les clics, porte `aria-disabled` et garde son info-bulle. Elle sert par exemple à « Actualiser ». Cela retire l'exclusion « pas d'état de chargement » de la spec.
- Raison : la barre d'outils n'accepte que des boutons-icônes, et une action « Actualiser » doit montrer son attente.
- Options écartées : un `Button` discret « Actualiser » avec icône ; un composant `RefreshButton` dédié.
- Validation : docs/validation/components/Button-v1.html

## D-160 — Statut : point et libellé, sans fond
- Date : 2026-11-23
- Portée : StatusBadge
- Décision : un statut s'affiche avec un point de 7 px coloré par le ton, suivi de son libellé en `--fs-xs` et `--fg-2`, sans fond ni contour. C'est le dessin du statut de List (D-044), qui devient le composant `StatusBadge`. Le libellé est obligatoire : un état n'est jamais une couleur seule.
- Raison : sobre, monochrome hors du point, et tient dans une ligne dense.
- Options écartées : pastille neutre `--field` avec point ; pastille teintée par ton (dessin d'Alfred).
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Display-v1.html

## D-161 — Statut : six tons, dont « en attente » à point creux
- Date : 2026-11-23
- Portée : StatusBadge, StatusDot
- Décision : six tons : `neutral` (`--fg-3`), `pending` (point creux, contour `--fg-3`), `info`, `success`, `warning`, `danger`. `pending` sert à ce qui n'a pas commencé ou reste à configurer ; `warning` est réservé à un vrai avertissement.
- Raison : sans ton « en attente », les apps détournent `warning` pour ce qui reste simplement à faire.
- Options écartées : cinq tons seulement.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Display-v1.html

## D-162 — Point de statut seul : nom obligatoire et info-bulle
- Date : 2026-11-23
- Portée : StatusDot
- Décision : `StatusDot` affiche le point seul, là où le libellé ne tient pas (colonne étroite, sidebar). Son option `label` est obligatoire : elle donne le nom accessible (`role="img"`) et le texte d'une info-bulle, montrée au survol et au focus. Le point est donc joignable au clavier, dans une cible de 24 px.
- Raison : un état n'est jamais une couleur seule, même sans libellé visible.
- Options écartées : point toujours décoratif ; `label` facultatif.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Display-v1.html

## D-163 — Avatar : fond neutre, trois tailles
- Date : 2026-11-23
- Portée : Avatar
- Décision : l'avatar est un cercle de 24, 32 ou 40 px (`sm`, `md`, `lg`, défaut `md`) : l'image fournie, ou à défaut les initiales en `--fw-semibold` sur fond neutre (`--field`, `--selected` dans la sidebar). Initiales : première lettre du premier et du dernier mot qui commencent par une lettre ; « ? » sinon. Une image qui ne charge pas laisse la place aux initiales.
- Raison : style monochrome ; la couleur ne porte que du sens, pas l'identité d'une personne.
- Options écartées : fond teinté calculé à partir du nom.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Display-v1.html

## D-164 — Barre de progression : 4 px, libellé au-dessus
- Date : 2026-11-23
- Portée : ProgressBar
- Décision : rail de 4 px en `--field`, rayon plein, remplissage `--accent`. Le libellé est au-dessus, la valeur à droite (« 60 % », ou « 18 / 30 » si `max` n'est pas 100). Ton facultatif `warning` ou `danger` pour un seuil franchi. Sans `value`, la barre est indéterminée : un segment défile, fixe à demi opaque si l'utilisateur réduit les animations (comme D-084).
- Raison : discrète, proche de la barre de 2 px des résultats (D-084).
- Options écartées : rail de 6 px.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Display-v1.html

## D-165 — Squelette : fixe, affiché après 200 ms
- Date : 2026-11-23
- Portée : Skeleton
- Décision : un squelette est une forme immobile en `--field` : ligne (10 px de haut, rayon 4 px), cercle, ou bloc (rayon 8 px). Un groupe de squelettes (`SkeletonGroup`) porte `aria-busy` et le nom « Chargement… », et n'apparaît qu'après 200 ms (option `delay`) pour éviter un clignotement quand la réponse est rapide.
- Raison : pas d'animation de résultats (D-026, D-084) ; le délai évite un flash inutile.
- Options écartées : pulsation douce ; affichage sans délai par défaut.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Display-v1.html

## D-166 — État vide : icône de 32 px, titre, phrase, action
- Date : 2026-11-23
- Portée : EmptyState
- Décision : l'état vide est centré : icône facultative de 32 px en `--fg-3`, sans fond ; titre en `--fg`, `--fw-medium` ; phrase facultative en `--fg-2`, `--fs-sm` ; action principale facultative (emplacement `action`, qui reçoit un `Button` variante `primary`). La taille `compact` retire l'icône et réduit les marges, pour un panneau. Les messages centrés de Table et List (D-085, D-086) utilisent ce composant sans icône.
- Raison : c'est la règle `empty` de ListPage ; l'icône seule reste sobre.
- Options écartées : icône dans un cercle `--field` de 48 px.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Display-v1.html

## D-167 — Lien : toujours souligné
- Date : 2026-11-23
- Portée : Link
- Décision : un lien est en `--accent-text`, souligné (1 px, 2 px au survol). Une adresse externe (`http:`, `https:`, `mailto:`) s'ouvre hors de l'app, porte une flèche de 12 px et le texte caché « S'ouvre dans le navigateur ». Sans `href`, `Link` est un bouton à l'apparence de lien, pour une action secondaire dans une phrase.
- Raison : WCAG 1.4.1 : dans un texte, un lien ne se distingue pas par la couleur seule.
- Options écartées : souligné au survol seulement.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Display-v1.html

## D-168 — Code : fond `--field` ; séparateur d'un trait
- Date : 2026-11-23
- Portée : Code, Divider
- Décision : `Code` en ligne est en `--font-mono` à 0,92 em, sur fond `--field`, rayon 4 px. En bloc (`block`), fond `--field`, rayon 8 px, retours à la ligne gardés, défilement horizontal, joignable au clavier avec un nom accessible. `Divider` est un trait `--line` de 1 px, horizontal (marges de 12 px) ou vertical, décoratif (`role="separator"`).
- Raison : une valeur technique se distingue du texte qui l'entoure.
- Options écartées : chasse fixe seule, sans fond ; option `plain`.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Display-v1.html

## D-169 — List, Table et Sidebar reprennent ces composants
- Date : 2026-11-23
- Portée : List, Table, Sidebar
- Décision : le statut de List est rendu par `StatusBadge` ; le compte de la Sidebar par `Avatar` (taille `sm`, fond `--selected`) quand l'app ne fournit pas de visuel ; les squelettes de List et Table par `Skeleton`, sans délai, comme avant (D-084) ; les messages centrés de Table et List par `EmptyState`. Le rendu ne change pas. Dans un `Table`, une cellule de statut reçoit un `StatusBadge` ou un `StatusDot`.
- Raison : un seul dessin par élément, sans doublon.
- Options écartées : garder des copies internes.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Display-v1.html

## D-110 — Modèle Action : les champs
- Date : 2026-11-23
- Portée : ActionBar
- Décision : une action est une donnée `{ id, label, icon?, onPress, primary?, danger?, confirm?, shortcut?, isDisabled?, isHidden? }`. `confirm` est un texte (la question) ou `{ title, message?, confirmLabel? }`. `shortcut` est seulement affiché (info-bulle, menu) ; l'app déclare le raccourci elle-même. `onPress` peut rendre une promesse.
- Raison : l'app décrit ce que fait l'action ; Socle choisit sa forme. Les noms suivent Socle (`onPress`, `isDisabled`).
- Options écartées : bascule de vue dans le modèle (`group`, `selected` : les vues vont dans `Tabs`, D-021) ; message de réussite (`success` : les notifications restent au gabarit, D-115).
- Validation : docs/validation/components/ActionBar-v1.html

## D-111 — Modèle Action : six zones et une règle par zone
- Date : 2026-11-23
- Portée : ActionBar, layout-rules
- Décision : `ActionBar` reçoit une `zone` parmi `topbar`, `header`, `toolbar`, `section`, `row` et `empty`. La règle de la zone décide de la forme : action principale en `Button` à texte, actions à icône en `IconButton` (3 au plus en `topbar`, `header`, `toolbar` ; 2 en `section` ; voir D-113 pour `row`), le reste dans le menu « … ». Ordre : icônes, « … », action principale tout à droite. Une seule action principale par zone (la première marquée) ; une action `danger` n'est jamais principale ni icône. `isHidden` retire l'action ; `isDisabled` la garde à sa place. En `empty`, seule l'action principale s'affiche.
- Raison : les gabarits ne posent plus de boutons ; la même donnée prend la bonne forme partout.
- Options écartées : fusionner `header` et `toolbar`.
- Validation : docs/validation/components/ActionBar-v1.html

## D-112 — Modèle Action : action principale en icône dans la barre du haut
- Date : 2026-11-23
- Portée : ActionBar (zone `topbar`)
- Décision : dans la zone `topbar`, l'action principale reste un bouton-icône, placé en premier. Sans icône, elle va en tête du menu « … ». La spec AppShell (boutons-icônes uniquement) ne change pas.
- Raison : respecter AppShell aujourd'hui ; P13 pourra ajouter le texte en option, sans casser cette règle.
- Options écartées : bouton à texte dans la barre du haut dès maintenant.
- Validation : docs/validation/components/ActionBar-v1.html

## D-113 — Modèle Action : action principale d'une section en bouton secondaire
- Date : 2026-11-23
- Portée : ActionBar (zone `section`)
- Décision : dans la zone `section`, l'action principale est un `Button` `secondary` de taille `sm`.
- Raison : un seul bouton plein par écran reste lisible ; un panneau a souvent plusieurs sections.
- Options écartées : bouton principal plein.
- Validation : docs/validation/components/ActionBar-v1.html

## D-114 — Modèle Action : une icône puis « … » dans une ligne
- Date : 2026-11-23
- Portée : ActionBar (zone `row`)
- Décision : dans la zone `row`, deux contrôles au plus (D-066) : une icône, puis « … » s'il reste des actions. Si la ligne n'a que deux actions, toutes deux à icône et sans danger, elles s'affichent en deux icônes. `primary` n'a pas d'effet dans une ligne. Le gabarit (Table, List) garde la règle d'apparition au survol et le clic droit (D-066).
- Raison : respecter D-066 ; une ligne reste calme.
- Options écartées : deux icônes puis « … » (trois contrôles).
- Validation : docs/validation/components/ActionBar-v1.html

## D-115 — Modèle Action : danger dans « … », après un trait, confirmé
- Date : 2026-11-23
- Portée : ActionBar
- Décision : une action `danger` va toujours dans le menu « … », en dernier, après un séparateur, en rouge (D-049), sans titre de groupe. Elle est toujours confirmée ; une action non danger l'est si elle a `confirm`. La question par défaut est « {label} ? » ; le bouton de confirmation reprend le libellé de l'action.
- Raison : suivre D-049 ; le rouge et la confirmation suffisent à signaler le risque.
- Options écartées : titre « Actions définitives » au-dessus des actions danger.
- Validation : docs/validation/components/ActionBar-v1.html

## D-116 — Modèle Action : exécution (confirmation, attente, erreur)
- Date : 2026-11-23
- Portée : ActionBar
- Décision : au clic, `ActionBar` confirme si besoin (D-115), appelle `onPress`, puis montre l'attente tant que la promesse court (`isPending` du bouton). Une erreur, levée ou rejetée, est rendue à `onError(action, error)` ; `onDone(action)` est appelé après une réussite. `ActionBar` n'affiche aucune notification : le gabarit les branche (P6). Pendant l'attente, l'action ne se relance pas.
- Raison : aucune dépendance aux notifications ; les gabarits du lot 2 gardent la main sur le message.
- Options écartées : notifications de réussite et d'échec dans `ActionBar` (champ `success`).
- Validation : docs/validation/components/ActionBar-v1.html

## D-117 — Modèle Action : petit écran
- Date : 2026-11-23
- Portée : ActionBar
- Décision : sous 640 px (D-013), dans les zones `topbar`, `header` et `toolbar`, les icônes passent dans « … » ; l'action principale reste visible (bouton à texte, ou icône en `topbar`). Les zones `section`, `row` et `empty` ne changent pas.
- Raison : la barre tient sur un téléphone, et l'action attendue reste en vue.
- Options écartées : garder une icône avant « … » sur mobile.
- Validation : docs/validation/components/ActionBar-v1.html

## D-118 — Modèle Action : attente d'une action à icône
- Date : 2026-11-23
- Portée : ActionBar
- Décision : une action à icône qui attend sa promesse prend l'état `isPending` d'`IconButton` (D-107) : roue, focus gardé, `aria-busy`. Une entrée du menu « … » ferme le menu tout de suite ; l'attente n'y est pas montrée.
- Raison : une seule règle d'attente pour `Button` et `IconButton`. La question posée proposait « désactivé et `aria-busy` », car `IconButton` n'avait pas de chargement ; P1 l'a ajouté le même jour (D-107).
- Options écartées : bouton-icône désactivé sans roue.
- Validation : docs/validation/components/ActionBar-v1.html

## D-150 — Toasts : moteur React Aria, sans sonner
- Date : 2026-11-23
- Portée : Toast
- Décision : les toasts reposent sur le Toast de React Aria (`UNSTABLE_ToastRegion`, `UNSTABLE_ToastQueue`), déjà dans les dépendances. Socle l'enveloppe : les apps n'importent jamais React Aria ni le préfixe `UNSTABLE_`. La librairie sonner n'entre pas dans socle-ui.
- Raison : React Aria gère déjà la file, la minuterie, la pause, la région F6 et le retour du focus ; sonner ajouterait une dépendance à restyler.
- Options écartées : garder sonner ; tout écrire nous-mêmes.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Notifications-v1.html

## D-151 — Toasts : carte neutre, l'icône porte le ton
- Date : 2026-11-23
- Portée : Toast
- Décision : un toast est une carte `--surface-raised`, trait `--line`, rayon 12 px (D-040), ombre `--shadow-lg`, 360 px de large au plus. Seule l'icône de 16 px prend la couleur du ton. Titre en `--fw-semibold`, texte en `--fs-sm` `--fg-2`.
- Raison : style monochrome (D-001) ; même surface que tout ce qui flotte.
- Options écartées : fond teinté par le ton ; sombre constant comme l'info-bulle.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Notifications-v1.html

## D-152 — Notifications : quatre tons
- Date : 2026-11-23
- Portée : Toast, NotificationCenter
- Décision : quatre tons, `success`, `info` (par défaut), `warning` et `danger`, avec les tokens `--success`, `--info`, `--warning`, `--danger` et une icône propre à chacun. Le ton est aussi dit au lecteur d'écran (« Succès », « Information », « Alerte », « Erreur »).
- Raison : les tokens existent déjà ; une alerte n'est ni un succès ni une erreur.
- Options écartées : trois tons, sans alerte.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Notifications-v1.html

## D-153 — Toasts : durée
- Date : 2026-11-23
- Portée : Toast
- Décision : un toast reste 5 s, ou 8 s s'il porte une action. Un toast `danger` reste jusqu'à sa fermeture. L'option `duration` le règle par appel (5 s au minimum ; `null` : jusqu'à fermeture). La minuterie s'arrête au survol, au focus et quand la fenêtre perd le focus.
- Raison : temps de lecture suffisant (WCAG 2.2.1) ; une erreur ne disparaît pas avant d'être lue.
- Options écartées : 8 s pour toute erreur (Alfred).
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Notifications-v1.html

## D-154 — Toasts : pile de trois, en bas à droite
- Date : 2026-11-23
- Portée : Toast
- Décision : les toasts s'empilent en bas à droite, à 16 px des bords, 8 px entre eux, le plus récent en bas. Trois sont visibles au plus : au-delà, le plus ancien se ferme (il reste dans le centre). Sur mobile, la pile prend la largeur, au-dessus de la barre d'onglets. Entrée par un fondu et un glissement de 8 px (`--dur-base`) ; sortie immédiate, car React Aria retire le toast ; rien ne bouge si l'utilisateur réduit les animations.
- Raison : une pile courte ne cache pas le contenu ; le centre garde ce qui sort.
- Options écartées : quatre ou cinq visibles ; file d'attente qui ressort les anciens toasts.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Notifications-v1.html

## D-155 — Toasts : une action au plus
- Date : 2026-11-23
- Portée : Toast
- Décision : un toast a une action texte au plus (« Annuler », « Réessayer »), un `Button` petit et secondaire, et toujours la croix « Fermer la notification ». Choisir l'action ferme le toast.
- Raison : un toast reste lisible d'un coup d'œil ; plus d'actions demandent une page ou un dialogue.
- Options écartées : deux actions (Alfred).
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Notifications-v1.html

## D-156 — Notifications : toast et centre liés
- Date : 2026-11-23
- Portée : Toast, NotificationCenter
- Décision : par défaut, `notify()` montre un toast et ajoute une ligne au centre. `history: false` donne un toast seul (confirmation triviale : « Lien copié ») ; `toast: false` donne une ligne seule (événement de fond). L'action d'un toast expire avec lui et ne passe pas dans le centre ; une ligne du centre peut s'ouvrir (option `onOpen`).
- Raison : une seule fonction pour l'app ; un « Annuler » tardif depuis le centre serait trompeur.
- Options écartées : reprendre l'action dans le centre ; deux fonctions séparées.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Notifications-v1.html

## D-157 — Centre de notifications : cloche, compteur et panneau
- Date : 2026-11-23
- Portée : NotificationCenter
- Décision : le centre s'ouvre depuis un bouton-icône cloche dans les `actions` de la barre du haut. Une pastille `--accent` (texte `--accent-fg`, `--fs-xs`, rayon plein) montre le nombre de non-lus, « 9+ » au-delà de 9, et disparaît à 0. Le panneau est ancré sous la cloche, 380 px de large, sur `--surface-raised` avec rayon 12 px et `--shadow-md` ; il est plein écran sur mobile. L'ouvrir marque tout comme lu ; les points de non-lu restent visibles jusqu'à sa fermeture.
- Raison : le nombre dit l'urgence ; la couleur d'accent signale le non-lu (D-044).
- Options écartées : simple point ; panneau dans la colonne de détail.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Notifications-v1.html

## D-158 — Centre de notifications : contenu et mémoire
- Date : 2026-11-23
- Portée : NotificationCenter
- Décision : en-tête « Notifications » et « Tout effacer ». Lignes groupées par jour (« Aujourd'hui », « Hier », puis la date), la plus récente en haut. Une ligne : icône du ton, titre, texte, « heure · source » en `--fg-3`, point de non-lu de 6 px, et × au survol ou au focus pour la retirer. État vide : « Aucune notification ». La file garde 100 notifications en mémoire ; l'app peut fournir `initial` et suivre `onChange` pour les garder entre deux ouvertures.
- Raison : l'historique se lit comme une liste ; la persistance dépend de chaque app.
- Options écartées : persistance intégrée au stockage local.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Notifications-v1.html

## D-159 — Pas de bandeau pleine largeur ; avenir de FeedbackBanner
- Date : 2026-11-23
- Portée : global (layout-rules)
- Décision : aucune app n'affiche de bandeau pleine largeur sous la barre du haut. Un état durable de la page ou de l'app (hors ligne, lecture seule) se signale dans la barre du haut, par un indicateur compact. Un message local reste un encart dans le contenu (comme D-085). Le résultat d'une action va dans un toast. L'indicateur de barre du haut et l'encart feront chacun une proposition à part ; l'apparence `bar` de `FeedbackBanner` (Alfred) n'a pas d'équivalent.
- Raison : choix de l'utilisateur ; un bandeau décale tout le contenu et se confond avec la barre.
- Options écartées : bandeau pleine largeur.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Notifications-v1.html

## D-120 — Dialog : quatre tailles fixes
- Date : 2026-11-23
- Portée : Dialog
- Décision : la largeur d'une modale suit le type de contenu, avec quatre tailles fixes : `sm` 400 px (question courte, confirmation), `md` 560 px par défaut (formulaire court), `lg` 800 px (tableau, aperçu), `xl` 1080 × 720 px. En `xl`, le corps n'a pas de marge intérieure, pour recevoir un gabarit (SettingsPage, D-015). Toutes les tailles restent à 32 px au moins des bords de la fenêtre et le corps défile au-delà.
- Raison : une largeur fixe ne saute pas pendant la saisie, et quatre tailles couvrent les usages relevés dans Alfred.
- Options écartées : largeur au contenu (320 à 800 px) ; deux largeurs (480 et 880 px).
- Validation : docs/validation/components/Dialog-v1.html

## D-121 — Dialog : petit écran, centrée ou plein écran
- Date : 2026-11-23
- Portée : Dialog
- Décision : sur mobile (≤ 640 px, D-013), `sm` et `md` restent centrées, sur toute la largeur moins 16 px de marge ; `lg` et `xl` passent en plein écran, sans rayon. Les boutons du pied se partagent alors la largeur.
- Raison : c'est la règle déjà prise pour les Réglages (D-015), et une petite question n'a pas besoin de tout l'écran.
- Options écartées : feuille qui monte du bas pour toutes ; tout en plein écran.
- Validation : docs/validation/components/Dialog-v1.html

## D-122 — Dialog : clic hors de la modale, sauf saisie commencée
- Date : 2026-11-23
- Portée : Dialog
- Décision : un clic sur le fond ferme la modale, sauf si une saisie a commencé depuis son ouverture : la modale fait alors un court rebond et reste ouverte. Échap et le × ferment toujours. Pendant une action en cours (`isBusy`), rien ne la ferme.
- Raison : un clic égaré ne fait jamais perdre une saisie, et une modale de consultation se ferme vite.
- Options écartées : le clic hors ferme toujours ; le clic hors ne ferme jamais.
- Validation : docs/validation/components/Dialog-v1.html

## D-123 — Dialog : traits seulement quand le corps défile
- Date : 2026-11-23
- Portée : Dialog
- Décision : aucun trait entre l'en-tête, le corps et le pied quand tout tient. Quand le corps défile, un trait `--line` apparaît sous l'en-tête dès qu'on a défilé, et au-dessus du pied tant qu'il reste du contenu en dessous. En `xl`, le trait sous l'en-tête est toujours là (le gabarit a sa propre navigation).
- Raison : pas de décoration inutile (principes), et le trait garde son sens « il y a plus ».
- Options écartées : traits toujours présents.
- Validation : docs/validation/components/Dialog-v1.html

## D-124 — Dialog : même ordre des boutons partout
- Date : 2026-11-23
- Portée : Dialog, confirmation
- Décision : le pied est calé à droite, avec « Annuler » (`secondary`) puis l'action (`primary` ou `danger`) tout à droite, sur macOS, Windows et le web.
- Raison : les apps web et multiplateformes, dont l'inspiration, gardent cet ordre partout, et une même app ne change pas d'un poste à l'autre.
- Options écartées : ordre selon le système (action principale à gauche sous Windows).
- Validation : docs/validation/components/Dialog-v1.html

## D-125 — Dialog : focus à l'ouverture
- Date : 2026-11-23
- Portée : Dialog, confirmation
- Décision : à l'ouverture, le focus va à l'élément marqué `autoFocus`, sinon au premier champ du corps, sinon à la modale elle-même (le lecteur d'écran lit le titre). Dans une confirmation, il va à « Annuler ». À la fermeture, il revient à l'élément qui a ouvert la modale.
- Raison : on tape tout de suite dans un formulaire, et Entrée ne déclenche jamais une suppression par erreur.
- Options écartées : premier élément focusable (souvent le ×) ; action principale.
- Validation : docs/validation/components/Dialog-v1.html

## D-126 — Confirmation : sobre, sans × ni icône
- Date : 2026-11-23
- Portée : confirmation
- Décision : une confirmation est une modale `sm` avec un titre, une phrase facultative et deux boutons. Elle n'a ni × ni icône d'alerte : seul le bouton `danger` porte le danger. Rôle `alertdialog`.
- Raison : monochrome et sans décoration (principes), et « Annuler » rend le × inutile.
- Options écartées : icône d'alerte rouge ; Dialog `sm` ordinaire avec ×.
- Validation : docs/validation/components/Dialog-v1.html

## D-127 — Confirmation : affichée par `SocleProvider`
- Date : 2026-11-23
- Portée : confirmation, SocleProvider
- Décision : `SocleProvider` affiche la confirmation. `useConfirm()` renvoie seulement la fonction `confirm(options)`, qui rend une promesse de `true` (confirmé) ou `false` (annulé). Une seule confirmation est ouverte à la fois : une nouvelle demande annule la précédente (`false`).
- Raison : l'app n'a rien à placer dans chaque écran, et deux confirmations ne peuvent pas s'empiler par erreur.
- Options écartées : le hook renvoie aussi un élément que l'écran doit rendre.
- Validation : docs/validation/components/Dialog-v1.html

## D-128 — Confirmation : action longue et erreur sur place
- Date : 2026-11-23
- Portée : confirmation
- Décision : l'option facultative `onConfirm` (fonction asynchrone) garde la confirmation ouverte pendant l'action : le bouton passe en chargement (D-105), « Annuler », Échap et le clic hors sont bloqués. Si l'action échoue, son message s'affiche en rouge au-dessus du pied, annoncé au lecteur d'écran, et le bouton redevient actif pour réessayer. Si elle réussit, la confirmation se ferme et la promesse rend `true`. Sans `onConfirm`, la confirmation se ferme tout de suite.
- Raison : l'utilisateur voit le résultat là où il a agi, sans dépendre des notifications.
- Options écartées : fermer tout de suite et montrer la suite par une notification.
- Validation : docs/validation/components/Dialog-v1.html

## D-130 — Champs : surface et bord marqué ; libellé, aide et erreur
- Date : 2026-11-23
- Portée : Field (TextField, TextArea, Select, ComboBox)
- Décision :
  - Le cadre d'un champ a le fond `--surface` et un bord de 1 px `--line-strong` ; au survol, le bord passe en `--fg-3` ; au focus, anneau `--accent` de 2 px (comme la barre de recherche, D-073). En erreur, le bord passe en `--danger`.
  - Le libellé est en `--fs-sm`, `--fw-medium`, `--fg`. L'aide est en `--fs-sm`, `--fg-3`. L'erreur est en `--fs-sm`, `--danger`, et prend la place de l'aide : une seule ligne sous le champ.
- Raison : un champ se distingue d'un bouton secondaire (fond `--field`) et garde la forme de la barre de recherche ; un libellé net mais discret.
- Options écartées : fond `--field` sans bord (ressemble à un bouton) ; fond `--field` et bord `--line` (contraste du bord sous 3:1) ; libellé `--fs-md` en `--fg-2` ; aide gardée sous l'erreur.
- Validation : docs/validation/components/FormFields-v1.html

## D-131 — Champs : lecture seule en cadre gris, avec cadenas
- Date : 2026-11-23
- Portée : Field (TextField, TextArea, Select, ComboBox)
- Décision : un champ en lecture seule garde son cadre, avec le fond `--surface-side`, le bord `--line` et un cadenas de 14 px en `--fg-3` à droite. Le texte reste en `--fg` et se sélectionne. Il prend le focus, sans anneau de modification, et n'a pas d'état de survol.
- Raison : on voit que c'est un champ figé, et on peut copier sa valeur.
- Options écartées : texte nu sans cadre ; bord en pointillé.
- Validation : docs/validation/components/FormFields-v1.html

## D-132 — Champs : le composant vérifie, au moment fixé par D-022
- Date : 2026-11-23
- Portée : Field (TextField, TextArea, Select, ComboBox)
- Décision : un champ accepte `isRequired` et `validate`, et vérifie seul. L'erreur s'affiche quand on quitte un champ qu'on a modifié, ou à l'envoi du formulaire ; jamais pendant la frappe. Elle se met à jour quand on quitte à nouveau le champ. À l'envoi, le focus va au premier champ en erreur. L'app peut aussi imposer une erreur (option `error`, par exemple une réponse du serveur) ; elle s'affiche tout de suite. Un champ obligatoire vide reçoit le message « Ce champ est obligatoire. » du dictionnaire (D-089). Précise D-022 : un champ quitté sans modification n'affiche pas d'erreur avant l'envoi.
- Raison : la règle de D-022 est écrite une fois, dans Socle, au lieu d'une fois par app.
- Options écartées : l'app seule passe le message d'erreur.
- Validation : docs/validation/components/FormFields-v1.html

## D-133 — Champs : cinq largeurs ; TextArea qui grandit
- Date : 2026-11-23
- Portée : Field (TextField, TextArea, Select, ComboBox)
- Décision :
  - Option `width` : `xs` 96 px (code, nombre), `sm` 160 px, `md` 240 px, `lg` 360 px, `full` (défaut : toute la largeur du conteneur). Un champ n'est jamais plus large que son conteneur.
  - `TextArea` commence à 3 lignes, grandit avec le texte jusqu'à 10 lignes, puis défile. Les deux bornes sont réglables par l'app (`minRows`, `maxRows`). Pas de poignée de redimensionnement.
- Raison : la largeur annonce la longueur attendue ; pas de défilement interne pour un texte court, pas de poignée à viser.
- Options écartées : champs toujours pleine largeur ; TextArea de hauteur fixe avec poignée.
- Validation : docs/validation/components/FormFields-v1.html

## D-134 — Select : liste flottante au style du Menu
- Date : 2026-11-23
- Portée : Select (et la liste de ComboBox)
- Décision : `Select` est un bouton au style du champ (D-130), avec la valeur à gauche et un chevron à droite, qui ouvre une liste flottante React Aria au style du Menu : rayon 12 px, éléments de `--row-h`, élément mis en avant en `--hover`, coche à droite sur la valeur choisie (D-050). La liste est au moins aussi large que le bouton. Taper des lettres saute à l'option qui commence par elles.
- Raison : même rendu sur macOS, Windows et web ; même liste que ComboBox.
- Options écartées : `<select>` natif (rendu propre à chaque système, peu stylable).
- Validation : docs/validation/components/FormFields-v1.html

## D-135 — Case et bouton radio : accent quand c'est coché
- Date : 2026-11-23
- Portée : Checkbox, CheckboxGroup, RadioGroup
- Décision : une case fait 16 px, rayon 4 px (D-040) ; un bouton radio fait 16 px, rond. Non coché : fond `--surface`, bord 1 px `--line-strong` (`--fg-3` au survol, `--danger` en erreur). Coché : fond et bord `--accent`, coche (ou point de 6 px) en `--accent-fg`. État mixte d'une case : un trait à la place de la coche. Le libellé est à droite, en `--fs-md`, `--fg`, avec une description facultative en dessous en `--fs-sm`, `--fg-3` ; un clic sur le libellé coche.
- Raison : l'accent porte l'état choisi, comme l'interrupteur actif ; le principe « l'accent ne porte que du sens » le permet.
- Options écartées : fond `--fg` (monochrome).
- Validation : docs/validation/components/FormChoices-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-136 — Interrupteur : une seule taille ; libellé selon le contexte
- Date : 2026-11-23
- Portée : Switch, PropertyRow, SettingsPage
- Décision : l'interrupteur fait 30 × 18 px, rond, partout (celui du panneau de détail). Éteint : fond `--selected` ; allumé : fond `--accent` ; pastille blanche de 14 px qui glisse en `--dur-fast`. Dans un formulaire, l'interrupteur est à gauche et son libellé à droite, comme une case. Dans une ligne (ligne de réglage, `PropertyRow`), le libellé est masqué et l'interrupteur calé à droite ; son nom accessible reprend le libellé de la ligne. `PropertyRow` (`action type "switch"`) utilise le composant `Switch`, sans changer son rendu.
- Raison : un seul interrupteur, partout le même ; la ligne donne déjà le libellé.
- Options écartées : 36 × 20 px dans un formulaire ; libellé toujours à gauche.
- Validation : docs/validation/components/FormChoices-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-137 — Interrupteur ou case : selon le moment où ça s'applique
- Date : 2026-11-23
- Portée : Switch, Checkbox
- Décision : un interrupteur s'applique tout de suite (D-007) : réglage, ligne du panneau de détail. Une case fait partie d'un formulaire qu'on envoie, ou d'une sélection (lignes d'un tableau). On ne met jamais un interrupteur dans un formulaire qui a un bouton d'envoi pour une valeur qui attend cet envoi.
- Raison : l'utilisateur sait si son geste agit tout de suite.
- Options écartées : laisser le choix à l'app.
- Validation : docs/validation/components/FormChoices-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-138 — Groupes de choix et Fieldset
- Date : 2026-11-23
- Portée : CheckboxGroup, RadioGroup, Fieldset
- Décision :
  - `RadioGroup` et `CheckboxGroup` portent leur propre libellé (au style de D-130), leurs options, puis l'aide ou l'erreur du groupe. Les options sont l'une sous l'autre par défaut, avec 4 px d'écart ; l'option `orientation="horizontal"` les met côte à côte (20 px d'écart), avec retour à la ligne, pour 2 ou 3 options courtes.
  - `Fieldset` regroupe des champs différents qui forment un tout (une adresse) : légende au style d'un libellé, champs avec 12 px d'écart, aide ou erreur du groupe en dessous. Il n'enveloppe pas un `RadioGroup` ou un `CheckboxGroup` seul.
- Raison : le rôle accessible du groupe (`radiogroup`, `group`) vient avec le composant ; une liste verticale se lit d'un coup d'œil.
- Options écartées : un seul `Fieldset` pour tous les groupes.
- Validation : docs/validation/components/FormChoices-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-140 — ComboBox : un seul composant, choix simple ou multiple, source locale ou asynchrone
- Date : 2026-11-23
- Portée : ComboBox
- Décision : un seul composant `ComboBox` couvre les trois cas. `selectionMode="single" | "multiple"` choisit le choix simple ou multiple (`"single"` par défaut). La source est soit locale (`items`), soit asynchrone (`loadItems(texte, signal)`). L'anatomie et le clavier sont les mêmes dans tous les cas.
- Raison : choix de l'utilisateur ; trois composants voisins dériveraient ; React Aria gère déjà le choix multiple dans un seul ComboBox, comme `selectionMode` du Menu.
- Options écartées : trois composants (`Combobox`, `MultiSelectCombobox`, `SearchCombobox`, comme dans Alfred).
- Validation : docs/validation/components/ComboBox-v1.html

## D-141 — ComboBox, SearchField, Select : choisir par le résultat
- Date : 2026-11-23
- Portée : ComboBox, SearchField, Select
- Décision : on choisit le composant par ce qu'il produit.
  - `SearchField` produit des critères (`{ text, tags }`) qui filtrent ou trient le tableau ou la liste de la page ; il va dans la `toolbar` (D-077).
  - Un filtre par propriété (statut, type, personne) est un bouton de filtre avec un `Menu` à choix, dans la `toolbar` (D-074).
  - `Select` choisit une valeur dans une liste fermée et courte (15 options environ), sans taper (spec Select).
  - `ComboBox` sert au-delà, ou dès qu'il faut chercher dans les options ou en choisir plusieurs.
  - `ComboBox` choisit une ou plusieurs valeurs d'un formulaire dans une liste plus longue, connue ou distante ; la valeur (un id ou une liste d'ids) est enregistrée avec le formulaire. Il va là où vont les champs (spec Field : `FormPage`, formulaire en modale, ligne de réglage), jamais dans la `toolbar`.
- Raison : choix de l'utilisateur ; deux règles nettes évitent deux composants pour le même besoin.
- Options écartées : ComboBox multiple autorisé comme filtre dans la `toolbar` (mode `compact` d'Alfred).
- Validation : docs/validation/components/ComboBox-v1.html

## D-142 — ComboBox : valeur libre en option
- Date : 2026-11-23
- Portée : ComboBox
- Décision : l'option facultative `allowsCustomValue` (désactivée par défaut) permet d'ajouter une valeur absente de la liste. Activée, la ligne « Ajouter « texte » » s'affiche en tête de liste quand aucun élément n'a exactement ce libellé (sans casse ni accents). Le premier élément trouvé reste mis en avant, et Entrée le choisit ; « Ajouter » est mis en avant seulement s'il n'y a aucun élément. Choisir « Ajouter » appelle `onCreate(texte)` : l'app crée l'élément (en local ou par son API) et le renvoie ; le ComboBox le choisit. Désactivée, seuls des éléments de la liste sont acceptés.
- Raison : choix de l'utilisateur ; même forme que « Rechercher « texte » » (D-074), et par défaut on ne garde que des valeurs connues.
- Options écartées : aucune valeur libre.
- Validation : docs/validation/components/ComboBox-v1.html

## D-143 — ComboBox : étiquettes toutes visibles, retour à la ligne
- Date : 2026-11-23
- Portée : ComboBox
- Décision : en choix multiple, chaque élément choisi est une étiquette dans le champ, avant le texte en cours (rayon de 4 px, D-040 ; × « Retirer <libellé> »). Quand elles ne tiennent plus sur une ligne, elles passent à la ligne et le champ grandit en hauteur ; toutes restent visibles. Le texte en cours garde au moins 60 px. Une étiquette trop longue est coupée à 200 px, avec une info-bulle.
- Raison : choix de l'utilisateur ; dans un formulaire, on doit voir tout ce qu'on enregistre ; « +n » (D-078) sert une barre d'outils à largeur fixe.
- Options écartées : « +n » comme la barre de recherche.
- Validation : docs/validation/components/ComboBox-v1.html

## D-144 — ComboBox : élément choisi coché, liste ouverte en choix multiple
- Date : 2026-11-23
- Portée : ComboBox
- Décision : un élément choisi reste dans la liste, avec la coche en fin de ligne (D-050). En choix multiple, un clic ou Entrée ajoute ou retire l'élément ; la liste reste ouverte et le texte en cours se vide. En choix simple, le choix remplace le texte du champ et ferme la liste.
- Raison : choix de l'utilisateur ; même règle que le Menu à choix (D-050) ; on retire aussi un choix depuis la liste.
- Options écartées : élément choisi retiré de la liste.
- Validation : docs/validation/components/ComboBox-v1.html

## D-145 — ComboBox : source locale filtrée à chaque lettre, source asynchrone au rythme de la recherche
- Date : 2026-11-23
- Portée : ComboBox
- Décision : source locale (`items`) : la liste se filtre à chaque lettre, sans délai ; un élément reste s'il contient le texte (sans casse ni accents, D-074) ; la liste montre 8 lignes, puis défile. Source asynchrone (`loadItems(texte, signal)`) : la demande part à partir de 2 caractères, après 300 ms sans frappe (D-080) ; seule la réponse à la dernière saisie s'affiche, et les demandes périmées sont abandonnées par `signal` ; l'attente se montre dans le champ et par la ligne « Recherche… » (D-081) ; une erreur se montre par la ligne « Résultats indisponibles » avec « Réessayer » (D-082). Sous 2 caractères, la liste ouverte affiche « Tapez au moins 2 caractères ». Le texte cherché passe en gras dans les éléments (D-087).
- Raison : choix de l'utilisateur ; un seul rythme pour toutes les recherches distantes du design system.
- Options écartées : appel de l'API dès l'ouverture, sans texte.
- Validation : docs/validation/components/ComboBox-v1.html

## D-146 — ComboBox : un élément sur une ligne
- Date : 2026-11-23
- Portée : ComboBox
- Décision : un élément de la liste tient sur une ligne de `--row-h`, au style du Menu : icône facultative de 16 px à gauche (place réservée si un autre élément en a une, D-047), libellé, description courte facultative en `--fs-sm` et `--fg-3` juste après le libellé, coche en fin de ligne (D-050). Le libellé et la description se coupent avec « … » ; la description se coupe d'abord. Un élément peut être désactivé (opacité 40 %). Les éléments peuvent être groupés en sections titrées, comme le Menu.
- Raison : choix de l'utilisateur ; la description distingue deux homonymes sans doubler la hauteur de la liste.
- Options écartées : description sur une deuxième ligne ; libellé seul.
- Validation : docs/validation/components/ComboBox-v1.html

## D-147 — ComboBox : ouverture, clavier et sortie du champ
- Date : 2026-11-23
- Portée : ComboBox
- Décision : un chevron à droite du champ montre que c'est une liste ; il l'ouvre et la ferme. La liste s'ouvre aussi à la frappe et avec flèche bas ; elle ne s'ouvre pas au simple focus. Flèches haut et bas parcourent les éléments ; Entrée choisit ; Échap ferme la liste, puis rétablit le texte de la valeur choisie. En choix simple, quitter le champ avec un texte qui ne correspond à aucun élément rétablit le texte de la valeur choisie (ou vide le champ) : la valeur ne change jamais sans un choix. En choix multiple, Retour arrière dans un texte vide met en avant la dernière étiquette, un second appui la retire (comme D-071). La liste se place sous le champ, ou au-dessus si la place manque ; elle est au moins aussi large que le champ (D-134).
- Raison : comportements montrés dans la page de validation v1 et repris de la barre de recherche (D-071) et du Menu, pour un seul clavier dans le design system.
- Options écartées : liste ouverte au focus (Alfred) ; champ sans chevron (Combobox d'Alfred).
- Validation : docs/validation/components/ComboBox-v1.html

## D-330 — Garde-fous pour Biome : config partagée `socle-ui/biome`
- Date : 2026-11-23
- Portée : global (apps qui lintent avec Biome)
- Décision : socle-ui livre une config Biome dans `biome/` (export `socle-ui/biome`). L'app l'étend par le nom du package : `"extends": ["socle-ui/biome"]` dans son `biome.json`. Elle reprend les règles de `socle-ui/eslint-config` : imports interdits par `noRestrictedImports` (`react-aria-components`, `react-aria`, `@react-aria/*`, `@react-stately/*`, et tout chemin `socle-ui/…` sauf `styles.css`, `theme.css`, `eslint-config` et `biome`), puis deux règles en plugins GritQL (D-331, D-332). Les plugins se résolvent depuis le dossier de la config partagée (`resolutionKind: "config"`) : Biome 2.6 ou plus récent est requis. La config ne touche ni au formateur ni aux autres règles de l'app.
- Raison : Alfred lint avec Biome, pas ESLint ; une app ne doit pas recopier les garde-fous à la main, ni les voir dériver d'une version à l'autre.
- Options écartées : plugin Biome publié par manifeste (`biome-manifest.json`) : l'app devrait lister chaque règle en plus de l'`extends` ; ESLint en plus de Biome dans l'app : deux linters pour un seul besoin.
- Validation : par délégation de l'utilisateur, 2026-11-23

## D-331 — Biome : `style` et `className` interdits sur un composant Socle, reconnu par son nom
- Date : 2026-11-23
- Portée : global (config `socle-ui/biome`)
- Décision : le plugin `no-socle-override.grit` signale `style` et `className` posés directement sur une balise JSX dont le nom est un composant exporté par socle-ui (`Button`, `Sidebar.Item`…). La liste des noms est générée par `scripts/build-biome.js` à chaque build, depuis `src/index.ts` ; le fichier généré n'est pas suivi par git. Limites, connues et acceptées : un import renommé (`import { Button as B }`) échappe à la règle ; un composant d'une autre librairie qui porte le même nom qu'un composant Socle est signalé, et l'app écrit alors `// biome-ignore lint/plugin: <raison>`. Un attribut posé sur un élément passé en option (`icon={<span className="…" />}`) n'est pas signalé.
- Raison : un plugin GritQL de Biome ne voit pas le module entier : il ne relie pas une balise à son import, contrairement à la règle ESLint. La liste des exports est le meilleur substitut, et elle suit les versions toute seule.
- Options écartées : signaler tout composant en PascalCase (faux positifs sur les composants de l'app) ; plugin JavaScript de Biome (encore en préversion) ; script à part `socle-check-ts` : Biome couvre le besoin, un second outil serait oublié.
- Validation : par délégation de l'utilisateur, 2026-11-23

## D-332 — Biome : couleurs en dur dans le code et dans le CSS
- Date : 2026-11-23
- Portée : global (config `socle-ui/biome`)
- Décision : deux plugins reprennent le motif de `socle/no-hardcoded-color` et de `socle-check-css` (hex, `rgb()`, `rgba()`, `hsl()`, `hsla()`, `oklch()`, `oklab()`) : `no-hardcoded-color.grit` sur les chaînes, les attributs JSX et les gabarits du code ; `no-hardcoded-color-css.grit` sur les déclarations CSS. Une app sous Biome n'a donc pas besoin de `socle-check-css` ; les apps sous ESLint le gardent.
- Raison : Biome lit aussi le CSS ; un seul outil, une seule commande (`biome check`) dans l'app.
- Options écartées : garder `socle-check-css` à côté de Biome.
- Validation : par délégation de l'utilisateur, 2026-11-23

## D-333 — La config Biome est testée par `npm run check`
- Date : 2026-11-23
- Portée : dépôt de référence
- Décision : `scripts/check-biome.js` crée une app de test temporaire, y relie socle-ui dans `node_modules`, étend `socle-ui/biome` par le nom du package et lance `biome lint` sur `scripts/biome-fixtures/`. Chaque garde-fou doit se déclencher à la ligne attendue dans `bad.tsx` et `bad.css`, et rien ne doit être signalé dans `good.tsx` et `good.css`. Biome devient une dépendance de développement du dépôt.
- Raison : les noms de nœuds GritQL peuvent changer d'une version de Biome à l'autre ; une règle qui ne se déclenche plus doit faire échouer le check, pas passer en silence.
- Options écartées : test à la main dans Alfred.
- Validation : par délégation de l'utilisateur, 2026-11-23

## D-334 — Installation locale par yalc ; le `package.json` de l'app pointe sur `.yalc`
- Date : 2026-11-23
- Portée : global (installation)
- Décision : tant que le package n'est pas publié, une app l'installe par yalc : `npm run publish:local` ici, puis `npx yalc add socle-ui` dans l'app. `.yalc` et `yalc.lock` restent hors git ; le `package.json` de l'app se commite avec `"socle-ui": "file:.yalc/socle-ui"`. Un clone neuf de l'app refait d'abord `npm run publish:local` dans ce dépôt, puis `npx yalc add socle-ui` dans l'app. La marche à suivre est dans le README.
- Raison : yalc copie le package au lieu de le lier : une seule copie de React. Sans `.yalc` dans git, l'app ne commite pas de build.
- Options écartées : `.yalc` commité dans l'app (build dans l'historique, conflits) ; `yalc link` (lien symbolique, mêmes défauts que `npm link`) ; dépendance git par tag, gardée pour quand une CI devra installer l'app.
- Validation : par délégation de l'utilisateur, 2026-11-23

## D-335 — `npm run check` vérifie que les versions concordent
- Date : 2026-11-23
- Portée : dépôt de référence
- Décision : `scripts/check.js` échoue si la version de `package.json` diffère de celle de la dernière entrée datée de `CHANGELOG.md` (`## [x.y.z] — AAAA-MM-JJ`, la section `[Non publié]` n'est pas datée), ou de la constante `SOCLE_VERSION` de `src/index.ts`. Chaque version publiée a son tag `v<version>` sur `main`.
- Raison : la version de l'app se lit dans `package.json`, l'IA la lit dans `AI.md`, l'humain dans le CHANGELOG : elles doivent dire la même chose. Le contrôle a trouvé `SOCLE_VERSION` restée à 0.1.0.
- Options écartées : contrôle du tag git dans le check (un clone sans tags échouerait).
- Validation : par délégation de l'utilisateur, 2026-11-23

## D-170 — Valeurs typées : un type par donnée, format fixé par Socle
- Date : 2026-11-23
- Portée : FormattedValue, ListPage, DetailPanel
- Décision : une donnée s'affiche par son type : `text`, `longtext`, `number`, `money`, `percent`, `bytes`, `date`, `datetime`, `relative`, `duration`, `boolean`, `status`, `email`, `url`, `code`, `tags`. Socle fixe le format de la langue (« 1 234,50 € », « 20 nov. 2026 », « il y a 3 jours », « 1 h 5 min », « Oui »). Le statut devient un `StatusBadge` d'après une table clé → libellé et ton ; `email` et `url` deviennent des `Link` ; `code` un `Code` ; `tags` un texte « a, b, c ».
- Raison : l'app déclare ce qu'est la donnée, jamais comment l'écrire ; toutes les apps affichent alors les mêmes formats.
- Options écartées : fonction de rendu libre par colonne ; pastilles pour `tags` (aucun composant d'étiquette en lecture seule, et un texte suffit en liste).
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/ListPage-v1.html

## D-171 — Valeurs typées : vide « — », illisible en texte brut
- Date : 2026-11-23
- Portée : FormattedValue
- Décision : une valeur vide (`null`, `undefined`, `""`, liste vide) s'affiche « — » en `--fg-3`, lu « vide ». Une valeur illisible pour son type (date invalide, nombre en texte libre) s'affiche telle quelle, sans erreur.
- Raison : une donnée imparfaite ne doit jamais casser une liste ni cacher l'information.
- Options écartées : cellule vide ; message d'erreur dans la cellule.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/ListPage-v1.html

## D-172 — Valeurs typées : le type fixe l'alignement, la largeur et le tri
- Date : 2026-11-23
- Portée : FormattedValue, ListPage
- Décision : nombres, montants, pourcentages, tailles, dates et durées sont alignés à droite en chiffres de largeur égale ; le reste à gauche. Chaque type a une largeur de colonne par défaut (de 80 à 160 px) ; texte, liens et étiquettes prennent la place restante. Le tri se fait sur la valeur (nombre, horodatage), jamais sur le texte affiché ; une valeur vide va toujours en dernier.
- Raison : l'app n'a plus à régler de largeur ni d'alignement, et « 9 » ne passe pas après « 10 ».
- Options écartées : largeur fixée par l'app à chaque colonne.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/ListPage-v1.html

## D-173 — ListPage : gabarit déclaratif qui dessine tous les états
- Date : 2026-11-23
- Portée : ListPage
- Décision : l'app passe des données (titre, lignes, colonnes typées, filtres, recherche, `Action`) ; le gabarit dessine l'en-tête, la barre, la liste (`Table` ou `List`), le pied, et les états chargement, vide, aucun résultat et erreur. Les lignes `undefined` signifient « premier chargement ».
- Raison : une page de liste se décrit en quelques lignes, et toutes les listes de toutes les apps se ressemblent.
- Options écartées : gabarit à zones libres (`header`, `toolbar`… en `ReactNode`), qui laisse chaque app réinventer les états ; chargement par une fonction `load` dans le gabarit, qui lie le gabarit à une façon de charger.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/ListPage-v1.html

## D-174 — ListPage : recherche et filtres dans la barre ; local par défaut, distant en option
- Date : 2026-11-23
- Portée : ListPage
- Décision : la barre porte la recherche (`SearchField`), puis trois filtres au plus en `Select`, première entrée « Tous les … ». Par défaut, le gabarit cherche, filtre, trie et découpe lui-même les lignes reçues. Avec `remote`, il ne touche à rien et signale `{ query, filters, sort, page }` à `onStateChange` ; l'app recharge.
- Raison : la plupart des listes tiennent en mémoire ; une grosse liste garde la même page en passant par son API.
- Options écartées : recherche dans la barre du haut (layout-rules : la recherche d'une liste n'y va pas) ; filtres en étiquettes dans la recherche.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/ListPage-v1.html

## D-175 — ListPage : pied à compteur, « Afficher plus » par défaut, pagination en option
- Date : 2026-11-23
- Portée : ListPage
- Décision : le pied montre le compteur à gauche. Par défaut (`more`), 50 lignes, « 50 sur 312 » et « Afficher plus » qui ajoute 50 lignes. En `pages`, « 1–50 sur 312 » et les boutons page précédente et suivante. Si tout tient, seulement « 12 éléments ». Une recherche ou un filtre ramène au début.
- Raison : c'est la règle `footer` de layout-rules ; « Afficher plus » garde la sélection et la position, la pagination sert aux très longues listes.
- Options écartées : défilement infini (pas de pied joignable, compteur caché) ; numéros de page.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/ListPage-v1.html

## D-176 — ListPage : vide sans barre ; aucun résultat avec « Effacer la recherche »
- Date : 2026-11-23
- Portée : ListPage
- Décision : sans aucune ligne ni critère, le gabarit montre l'en-tête puis un `EmptyState` (icône, titre, phrase, action `primary` de la page), sans barre ni pied. Avec des critères et aucun résultat, la barre reste et le message de `Table` ou `List` propose « Effacer la recherche », qui vide aussi les filtres.
- Raison : une barre de recherche sur une liste vide n'a rien à chercher ; un résultat vide doit se défaire en un clic.
- Options écartées : compteurs à zéro dans le pied ; bouton « Effacer les filtres » séparé.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/ListPage-v1.html

## D-177 — ListPage : filtres et tri mémorisés, recherche oubliée
- Date : 2026-11-23
- Portée : ListPage
- Décision : les filtres et le tri sont mémorisés par page (`storageId`, défaut : le titre), comme les largeurs de `Table` (D-067). La recherche repart vide à chaque ouverture.
- Raison : un filtre traduit une habitude de travail ; une recherche répond à un besoin du moment, et une recherche oubliée cacherait des lignes sans qu'on le voie.
- Options écartées : tout mémoriser ; ne rien mémoriser.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/ListPage-v1.html

## D-178 — ListPage : barre de sélection à la place de la barre d'outils
- Date : 2026-11-23
- Portée : ListPage
- Décision : en `selectionMode="multiple"`, dès qu'une ligne est cochée, la barre d'outils devient la barre de sélection : « 3 sélectionnés », bouton « Tout désélectionner », puis les actions de `selectionActions(rows)` en `ActionBar` zone `toolbar`, à droite. Décocher tout rend la barre d'outils.
- Raison : c'est la barre de sélection prévue par `Table` (anatomie, pièce 6), au même endroit que les outils, sans décaler la liste.
- Options écartées : barre flottante en bas de l'écran ; actions groupées dans l'en-tête.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/ListPage-v1.html

## D-180 — DetailPanel : forme déclarative, à côté de la forme à composants
- Date : 2026-11-23
- Portée : DetailPanel
- Décision : `DetailPanel` accepte, en option, des données au lieu d'enfants : `header` (en-tête de l'objet) et `sections` (sections et champs typés), plus les états `isLoading`, `hasError`, `onRetry`, `isNotFound` et `emptyMessage`. Le panneau dessine tout avec les pièces existantes (`DetailPanel.Section`, `PropertyRow`, `ActionBar`, `StatusBadge`, `Skeleton`, `EmptyState`). La forme à composants reste. Les deux formes s'excluent : avec `header` ou `sections`, les enfants ne sont pas acceptés (types TypeScript). Le panneau ne charge rien : l'app lit la sélection, charge l'objet et passe les états.
- Raison : une app « liste + détail » décrit son objet sans recomposer le panneau ; le chargement reste à l'app, qui seule connaît sa source. Validation : par délégation de l'utilisateur, 2026-11-23.
- Options écartées : nouveau composant `DetailView` (deux noms pour un seul panneau) ; fonction qui renvoie des éléments ; option `load(id)` dans le panneau (lié au transport de l'app).
- Validation : docs/validation/components/DetailPanel-v2.html

## D-181 — DetailPanel : en-tête de l'objet
- Date : 2026-11-23
- Portée : DetailPanel
- Décision : `header` = `{ title, subtitle?, status?, actions? }`. En haut du panneau, collé en haut pendant le défilement, séparé des sections par un trait `--line`. Ligne 1 : titre en `--fs-lg`, gras, sur deux lignes au plus (puis « … » et info-bulle) ; actions à droite, dessinées par `ActionBar` avec la règle de la zone `section` (2 icônes au plus, « … », action principale en `Button` `secondary` `sm`, D-113). Ligne 2 : statut en `StatusBadge`, puis sous-titre en `--fs-sm`, `--fg-2`, sur une ligne avec « … ». Le groupe d'actions est nommé « Actions sur {title} ».
- Raison : à 320 px, la règle `header` (3 icônes et bouton à texte) écrase le titre ; la zone `section` garde le titre lisible. Validation : par délégation de l'utilisateur, 2026-11-23.
- Options écartées : règle de la zone `header` ; actions sur une ligne à part sous le titre (plus haut, pour rien) ; actions dans l'en-tête d'AppShell (changerait AppShell).
- Validation : docs/validation/components/DetailPanel-v2.html

## D-182 — DetailPanel : champ typé
- Date : 2026-11-23
- Portée : DetailPanel
- Décision : un champ = `{ id?, label, value, type?, hideEmpty?, icon?, action?, details? }`, plus les options de format `ValueFormat` (D-170). La valeur est rendue par `FormattedValue`, comme les colonnes de ListPage : un type rend la même chose dans une liste et dans le panneau. Valeur vide : « — » (D-058), ou ligne masquée avec `hideEmpty`. `icon`, `action` (un des trois types de D-059) et `details` (ligne qui s'ouvre, D-060) sont ceux de `PropertyRow`. Le champ devient une `PropertyRow`.
- Raison : une seule définition des types pour tout le design system ; aucune mise en forme dans l'app. Validation : par délégation de l'utilisateur, 2026-11-23.
- Options écartées : formateur propre au panneau ; valeur `ReactNode` seule (l'app formate elle-même).
- Validation : docs/validation/components/DetailPanel-v2.html

## D-183 — DetailPanel : section déclarative ; résumé et section repliée par défaut
- Date : 2026-11-23
- Portée : DetailPanel
- Décision : une section = `{ id, title, fields?, content?, empty?, actions?, summary?, defaultCollapsed? }`. Elle montre ses champs, puis son contenu libre (un texte devient un paragraphe en `--fg`). Sans champ visible ni contenu, elle affiche `empty` en `--fg-3` (défaut : « Aucune information »). `actions` va à droite de la ligne du titre, hors du bouton qui replie, par `ActionBar` zone `section` (D-113). `summary` (`string` ou `{ label, tone }`) est un état court après le chevron, lisible même section repliée, en `StatusBadge`. `defaultCollapsed` replie la section tant que l'utilisateur ne l'a pas ouverte ; le choix de l'utilisateur est mémorisé (D-061). `summary`, `actions` et `defaultCollapsed` sont aussi ajoutés à `DetailPanel.Section`.
- Raison : les mêmes sections dans les deux formes ; le résumé évite d'ouvrir une section pour lire son état. Validation : par délégation de l'utilisateur, 2026-11-23.
- Options écartées : actions en pied de section (le pied garde le bouton à texte de la forme à composants, D-059) ; résumé en couleur seule.
- Validation : docs/validation/components/DetailPanel-v2.html

## D-184 — DetailPanel : chargement, erreur, introuvable, vide
- Date : 2026-11-23
- Portée : DetailPanel
- Décision : priorité, de haut en bas. (1) `hasError` sans données : message centré « Impossible de charger le détail », phrase, bouton « Réessayer » (`onRetry`) (comme D-085). (2) `isLoading` sans données : squelettes d'un titre et de six lignes à deux colonnes (`SkeletonGroup`, après 200 ms, D-165). (3) `isNotFound` : `EmptyState` compact « Élément introuvable », « Il a peut-être été supprimé. ». (4) Ni `header` ni `sections` : la phrase vide existante, ou `emptyMessage`. Avec des données : `isLoading` ajoute la barre fine de 2 px en haut (D-084) ; `hasError` ajoute sous l'en-tête le bandeau « Le détail n'a pas pu être mis à jour » avec « Réessayer » (D-085). « Données » = `header` ou `sections` fournis.
- Raison : les mêmes états que Table et List ; l'ancien détail reste lisible pendant un rechargement. Validation : par délégation de l'utilisateur, 2026-11-23.
- Options écartées : bandeau `danger` en rouge (Alfred) ; état introuvable laissé à l'app.
- Validation : docs/validation/components/DetailPanel-v2.html

## D-185 — DetailPanel : pas de déplacement des sections
- Date : 2026-11-23
- Portée : DetailPanel
- Décision : l'utilisateur replie les sections, mais ne les déplace pas (ni poignée, ni Alt+↑/↓). L'ordre est celui que donne l'app.
- Raison : besoin rare, coût élevé (glisser, clavier, mémoire de l'ordre) ; à revoir si une deuxième app le demande. Validation : par délégation de l'utilisateur, 2026-11-23.
- Options écartées : sections déplaçables comme dans Alfred (`PanelSections`).
- Validation : docs/validation/components/DetailPanel-v2.html

## D-190 — Formulaire déclaratif : l'app décrit les champs, Socle les dessine
- Date : 2026-11-23
- Portée : FormPage, formulaire en modale (`useOpenForm`)
- Décision : `FormPage` et `openForm` reçoivent les champs sous forme de données (`FormField`) : `type`, `name`, `label`, `description`, `isRequired`, `validate`, `defaultValue`, et les options propres au type. Types : `text`, `email`, `url`, `tel`, `password`, `number`, `textarea` (→ `TextField`, `TextArea`), `select` (→ `Select`), `combobox` (→ `ComboBox`), `radio` (→ `RadioGroup`), `checkbox` (→ `Checkbox`), `checkboxGroup` (→ `CheckboxGroup`), et le groupe `fieldset` (→ `Fieldset`, qui contient d'autres champs). Pas de type `switch` (D-137). Pas de date ni d'heure tant que Socle n'a pas de sélecteur. Pas de champ dessiné par l'app.
- Raison : deux apps qui décrivent le même formulaire obtiennent le même écran ; les règles de D-022 et D-130 à D-138 s'appliquent sans effort.
- Options écartées : composants enfants libres dans le gabarit ; type `custom` avec une fonction de rendu.
- Validation : docs/validation/components/FormPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-191 — Formulaire déclaratif : valeurs, largeurs et disposition
- Date : 2026-11-23
- Portée : FormPage, formulaire en modale
- Décision :
  - Valeur rendue par type : texte (`string`, sans espaces autour, sauf `password` ; `""` si vide) ; `number` (`number` ou `null`, virgule acceptée) ; `select`, `radio`, `combobox` simple (`string` ou `null`) ; `combobox` multiple et `checkboxGroup` (`string[]`) ; `checkbox` (`boolean`).
  - Valeur de départ : `initialValues[name]` (l'objet lu en base convient), sinon `defaultValue` du champ, sinon vide.
  - Largeur : celle du champ (`width`, D-133) ; par défaut `sm` pour `number`, toute la colonne pour les autres.
  - Chaque champ est sur sa ligne, l'un sous l'autre, avec 16 px d'écart. Des champs qui vont ensemble passent par `fieldset`.
- Raison : des valeurs typées évitent les conversions dans chaque app ; une colonne unique se lit et se parcourt au clavier sans surprise.
- Options écartées : valeurs toujours en texte (« 1 » / « 0 ») ; deux champs courts consécutifs sur une ligne (Alfred).
- Validation : docs/validation/components/FormPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-192 — Formulaire déclaratif : vérification et erreurs de l'envoi
- Date : 2026-11-23
- Portée : FormPage, formulaire en modale
- Décision : chaque champ vérifie seul, au moment fixé par D-132 (`isRequired`, format, puis `validate(valeur, valeurs)`, qui reçoit aussi les autres valeurs pour une règle croisée). L'envoi est bloqué tant qu'un champ est en erreur ; le focus va au premier. `onSubmit` peut rendre `{ errors: { champ: "phrase" }, message? }` : les phrases s'affichent sous les champs (D-132, option `error`) et disparaissent dès que le champ change. Une exception levée par `onSubmit` affiche son message sur place.
- Raison : l'erreur du serveur reste à côté de ce qu'il faut corriger (D-159).
- Options écartées : notification de l'échec par un toast.
- Validation : docs/validation/components/FormPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-193 — FormPage : mise en page
- Date : 2026-11-23
- Portée : FormPage
- Décision : en-tête (titre en `--fs-xl` semibold, phrase d'intention en `--fg-2`), puis les sections séparées par un trait. Quand le gabarit a au moins 800 px de large (requête de conteneur, donc juste même à côté d'une sidebar ou d'un panneau), la section a deux colonnes : titre et aide sur 240 px à gauche, champs sur 560 px au plus à droite, 32 px d'écart ; en dessous, le titre passe au-dessus des champs. Contenu sur 880 px au plus, calé à gauche, marges `--pad`. Pied collé en bas de la zone qui défile (`sticky`), fond `--surface`, trait au-dessus. Sur mobile, les boutons du pied prennent toute la largeur et l'état passe au-dessus. Pendant le chargement (`isLoading`), des `Skeleton` remplacent les champs.
- Raison : D-022 ; la requête de conteneur suit la place réelle, pas la fenêtre.
- Options écartées : points de rupture de la fenêtre (640 / 1024 px) ; contenu centré.
- Validation : docs/validation/components/FormPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-194 — FormPage : état d'enregistrement dans le pied
- Date : 2026-11-23
- Portée : FormPage
- Décision : à gauche du pied, une phrase en `--fs-sm` : rien tant que rien ne change ; « Modifications non enregistrées » après une saisie ; « Enregistrement… » pendant l'envoi (l'action principale en chargement, D-105) ; « Enregistré » après la réussite ; en `--danger`, la phrase d'erreur après un échec (annoncée, `role="alert"`). La phrase est annoncée poliment aux lecteurs d'écran. Après la réussite, les valeurs envoyées deviennent la référence.
- Raison : l'utilisateur sait toujours si son travail est en sûreté, sans icône d'ornement.
- Options écartées : pastille seule ; aucun état.
- Validation : docs/validation/components/FormPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-195 — FormPage : « Annuler » après une saisie
- Date : 2026-11-23
- Portée : FormPage
- Décision : « Annuler » appelle `onCancel` tout de suite si rien n'a changé. Après une saisie, il demande d'abord « Abandonner les modifications ? » par `useConfirm` (« Les modifications non enregistrées seront perdues. », bouton « Abandonner », ton `danger`). L'option `onDirtyChange` prévient l'app pour qu'elle protège aussi la navigation. Sans `onCancel`, pas de bouton « Annuler ». Le formulaire en modale garde D-122 (saisie courte, Échap ferme).
- Raison : un long formulaire perdu coûte cher ; D-007 réserve la confirmation à l'irréversible, et l'abandon d'une saisie l'est.
- Options écartées : quitter sans demander.
- Validation : docs/validation/components/FormPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-196 — Formulaire déclaratif : action principale toujours active ; Mod+Entrée envoie
- Date : 2026-11-23
- Portée : FormPage, formulaire en modale
- Décision : l'action principale n'est jamais grisée ; un envoi incomplet montre les erreurs. Entrée dans un champ d'une ligne envoie (comportement natif) ; Mod+Entrée envoie de partout, zone de texte comprise. Pendant l'envoi, l'action est en chargement et « Annuler » désactivé.
- Raison : un bouton grisé n'explique pas ce qui manque.
- Options écartées : bouton grisé tant que rien ne change ou qu'un champ obligatoire est vide.
- Validation : docs/validation/components/FormPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-197 — Formulaire en modale : `useOpenForm`, une promesse des valeurs
- Date : 2026-11-23
- Portée : formulaire en modale
- Décision : `const openForm = useOpenForm();` puis `const values = await openForm({ title, description?, fields, initialValues?, submitLabel, cancelLabel?, onSubmit? })`. La promesse rend les valeurs (D-191) une fois le formulaire envoyé, ou `null` si l'utilisateur ferme. Avec `onSubmit`, la modale reste ouverte et attend la promesse ; elle se ferme à la réussite seulement. L'hôte est dans `SocleProvider`, comme la confirmation (D-127) ; une nouvelle demande ferme la précédente (qui rend `null`).
- Raison : rien à poser dans la page ; même forme que `useConfirm`.
- Options écartées : `true` / `false` (Alfred) ; composant `FormDialog` piloté par l'app.
- Validation : docs/validation/components/FormPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-198 — Formulaire en modale : taille, attente et erreur
- Date : 2026-11-23
- Portée : formulaire en modale
- Décision : la modale prend `sm` (400 px) jusqu'à quatre champs sans zone de texte ni groupe, sinon `md` (560 px). Six champs au plus : au-delà, une FormPage. Pied : « Annuler », puis l'action (D-124), qui envoie le formulaire. Pendant `onSubmit`, la modale est occupée (`isBusy`, D-122) et l'action en chargement. Une erreur s'affiche en `--danger` à la fin du corps, juste au-dessus du pied (D-128) ; les erreurs de champ vont sous les champs (D-192).
- Raison : une saisie courte tient dans une petite fenêtre ; l'erreur reste dans la modale.
- Options écartées : toujours `md` ; taille au choix de l'app.
- Validation : docs/validation/components/FormPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-200 — SettingsPage : API déclarative, réglages typés
- Date : 2026-11-23
- Portée : SettingsPage
- Décision : l'app décrit ses réglages par des données : des groupes de rubriques (`groups`), chaque rubrique avec ses sections, chaque section avec ses réglages typés. Sept types : `switch` (interrupteur), `select` (liste, toujours un `Select`, même pour deux ou trois choix), `text` (champ d'une ligne), `action` (bouton), `item` (élément d'une liste), `info` (valeur en lecture seule) ; une section peut aussi recevoir un contenu libre (`content`, par exemple une `Table`). Le gabarit choisit le contrôle, sa place et son comportement.
- Raison : toutes les apps ont des réglages ; décrits par des données, ils gardent partout le même rendu, sans ligne recomposée à la main.
- Options écartées : composants à assembler (`SettingsPage.Nav`, `SettingRow`) ; contrôle segmenté pour un choix court (nouveau composant, à proposer à part).
- Validation : docs/validation/components/SettingsPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-201 — SettingsPage : navigation
- Date : 2026-11-23
- Portée : SettingsPage
- Décision : à gauche, sur `--surface-side`, 220 px en web et 200 px en desktop : la recherche en tête, puis les groupes séparés par un trait, chacun avec un titre facultatif (`--fs-sm`, `--fg-3`) ; chaque rubrique est une ligne de `--row-h` avec une icône (obligatoire) et un libellé, au style d'un élément de Sidebar (survol `--hover`, rubrique courante `--selected`, `aria-current="page"`). Un lien externe facultatif se cale en pied, avec la flèche externe. Sans `selectedId` fourni par l'app, la dernière rubrique ouverte est mémorisée (D-007).
- Raison : la même navigation que la Sidebar, pour un espace à part (D-015).
- Options écartées : onglets en haut ; arbre à plusieurs niveaux.
- Validation : docs/validation/components/SettingsPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-202 — SettingsPage : recherche
- Date : 2026-11-23
- Portée : SettingsPage
- Décision : la recherche est le `SearchField` de Socle, à son rythme (2 caractères, 300 ms, D-080 ; Mod+F y place le focus, D-083), sur toute la largeur de la navigation (et non 320 px, D-078). Elle filtre les rubriques sans casse ni accents (D-074). Une rubrique reste si son libellé, ses mots-clés (`keywords`), le titre d'une de ses sections ou le libellé d'un de ses réglages contient le texte. Un groupe sans rubrique restante disparaît avec son trait. Entrée ouvre la première rubrique trouvée. Sans résultat : « Aucune rubrique trouvée. » en `--fg-3`.
- Raison : on cherche un réglage par son nom, pas seulement par sa rubrique.
- Options écartées : filtre des lignes dans le contenu ; recherche sur le libellé de rubrique seul (Alfred) ; champ de recherche propre au gabarit, filtré à chaque lettre.
- Validation : docs/validation/components/SettingsPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-203 — SettingsPage : ligne de réglage
- Date : 2026-11-23
- Portée : SettingsPage
- Décision : une ligne prend toute la largeur. À gauche : le libellé (`--fs-md`, `--fg`), puis la description (`--fs-sm`, `--fg-2`, 72 caractères par ligne au plus) ; à droite : le contrôle, centré en hauteur. Marge verticale de 12 px en web, 10 px en desktop ; un trait `--line` sous chaque ligne. Le libellé passe à la ligne ; il n'est jamais coupé. Le contrôle porte le libellé de la ligne comme nom accessible (D-136). `select` et `text` prennent la largeur `md` (240 px) par défaut, réglable par `width` (D-133).
- Raison : le rendu de l'inspiration et des Réglages d'Alfred ; une ligne lisible d'un coup d'œil.
- Options écartées : libellé au-dessus du contrôle (formulaire, D-022).
- Validation : docs/validation/components/SettingsPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-204 — SettingsPage : application immédiate et échec
- Date : 2026-11-23
- Portée : SettingsPage
- Décision : `switch` et `select` s'appliquent dès qu'ils changent : la nouvelle valeur s'affiche tout de suite et `onChange` est appelé. `text` s'applique à Entrée ou en quittant le champ, si la valeur a changé et passe la vérification (`isRequired`, `validate`, format `email` ou `url`) ; sinon l'erreur s'affiche sous le champ (D-132) ; Échap rétablit la valeur enregistrée. Si `onChange` rejette sa promesse, la valeur précédente revient et un toast `danger` dit « Le réglage n'a pas été enregistré. », avec le message de l'erreur en description. Pas de toast de réussite. Pas de bouton « Enregistrer ».
- Raison : D-007 ; une saisie validée à Entrée ou à la sortie du champ évite deux clics et une ligne qui bouge.
- Options écartées : boutons « Annuler » et « Enregistrer » qui apparaissent à la modification (Alfred) ; toast « Réglage enregistré ».
- Validation : docs/validation/components/SettingsPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-205 — SettingsPage : réglage « action »
- Date : 2026-11-23
- Portée : SettingsPage
- Décision : un réglage `action` reçoit une `Action` (D-110) et l'affiche en `Button` secondaire, à droite de la ligne. Une action `danger` ou avec `confirm` est confirmée par `useConfirm`, et le bouton rouge n'apparaît que dans la confirmation (D-104, D-115). Pendant sa promesse, le bouton est en chargement (D-116) ; un échec ouvre un toast `danger`.
- Raison : une seule façon d'exécuter une action dans Socle ; le rouge reste réservé au geste qui détruit.
- Options écartées : bouton `primary` ou `danger` directement dans la ligne.
- Validation : docs/validation/components/SettingsPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-206 — SettingsPage : listes dans une section
- Date : 2026-11-23
- Portée : SettingsPage
- Décision : un réglage `item` est un élément d'une liste gérée dans les réglages (un environnement, une clé). Il a un libellé, un `Code` court facultatif à côté, une description facultative et des étiquettes d'état facultatives (`StatusBadge`) sous la description. Ses actions passent par `ActionBar` en zone `row` (D-114) : une icône, puis « … » ; une action `danger` va dans « … », en dernier, confirmée (D-115). Les actions de la section (« Nouvel environnement ») passent par `ActionBar` en zone `section` (D-113), à droite du titre. Une section sans ligne affiche `emptyMessage` en `--fg-3`, à la place des lignes.
- Raison : Alfred et d'autres apps gèrent des listes courtes dans leurs réglages ; le modèle Action garde la règle des lignes.
- Options écartées : corbeille rouge visible sur la ligne (Alfred) ; `EmptyState` centré dans une section.
- Validation : docs/validation/components/SettingsPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-207 — SettingsPage : contenu d'une rubrique
- Date : 2026-11-23
- Portée : SettingsPage
- Décision : le contenu défile seul, avec une marge de 28 px sur les côtés en web, 24 px en desktop. En tête : le libellé de la rubrique (`h2`, `--fs-lg`, `--fw-semibold`). Puis les sections, à 28 px l'une de l'autre : titre facultatif (`h3`, `--fs-md`, `--fw-semibold`), description facultative (`--fs-sm`, `--fg-2`), actions à droite, un trait dessous, puis les lignes. Le contenu libre d'une section (`content`) prend toute la largeur, sous le titre. Changer de rubrique remonte le contenu en haut.
- Raison : une hiérarchie simple : rubrique, section, ligne.
- Options écartées : titre de rubrique absent (le titre de section seul) ; sections en cartes.
- Validation : docs/validation/components/SettingsPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-208 — SettingsPage : conteneur et petite largeur
- Date : 2026-11-23
- Portée : SettingsPage, Dialog
- Décision : le gabarit remplit son parent : le corps d'un `Dialog` `xl` (sans marge, D-120) ou la zone `main` d'AppShell. Il n'a pas de titre propre : celui du `Dialog` ou de la barre du haut suffit. Sous 640 px de large (requête de conteneur sur le gabarit, pas sur l'écran), il montre la navigation en liste, avec un chevron à droite de chaque rubrique ; choisir une rubrique montre son contenu, avec une flèche « Retour aux rubriques » devant son titre (D-015). Dans un `Dialog`, un réglage changé ne compte pas comme une saisie commencée : le clic hors ferme toujours la modale (D-122), car tout est déjà appliqué.
- Raison : D-015 ; la largeur du conteneur décide, car la même modale est plein écran sur mobile (D-121).
- Options écartées : requête média sur l'écran ; navigation repliée en menu.
- Validation : docs/validation/components/SettingsPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-209 — SettingsPage : chargement et erreur d'une rubrique
- Date : 2026-11-23
- Portée : SettingsPage
- Décision : une rubrique peut être en chargement (`isLoading`) : des squelettes de lignes prennent la place des sections, après 200 ms (D-165). Elle peut avoir échoué (`hasError`, `onRetry`) : un message centré prend la place des sections, comme pour les résultats (D-085) : « Impossible de charger ces réglages », une phrase, puis « Réessayer ». La navigation reste utilisable.
- Raison : les réglages viennent souvent d'un serveur ; on reprend les états des résultats déjà décidés.
- Options écartées : chargement de toutes les rubriques d'un coup ; bandeau d'erreur.
- Validation : docs/validation/components/SettingsPage-v1.html — par délégation de l'utilisateur, 2026-11-23.

## D-210 — DetailPage : en-tête fixe, contenu qui défile ; propriétés au panneau
- Date : 2026-11-23
- Portée : DetailPage
- Décision : DetailPage remplit la zone `main` d'AppShell. L'en-tête (retour, titre, statut, méta, actions) reste fixe, séparé du contenu par un trait ; seul le contenu défile. Le contenu est une suite de sections. Les propriétés de l'élément vont dans le panneau de détail (D-018), jamais dans la page.
- Raison : les actions restent à portée quand on lit une longue fiche ; même découpe que les autres gabarits.
- Options écartées : en-tête qui défile avec le contenu ; propriétés dans une section de la page.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/DetailPage-v1.html

## D-211 — DetailPage : lien de retour en texte, au-dessus du titre
- Date : 2026-11-23
- Portée : DetailPage
- Décision : le retour est un lien texte « ‹ Demandes » au-dessus du titre, en `--fs-sm` et `--fg-2`, souligné au survol. Il nomme la vue principale où il mène (`back.label`) ; son nom accessible est « Retour à Demandes ». Il reste visible dans tous les états de la page. Il est facultatif.
- Raison : il dit où il mène, et le titre reste aligné sur les sections.
- Options écartées : bouton-icône à gauche du titre (Alfred) ; fil d'Ariane qui répète le titre.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/DetailPage-v1.html

## D-212 — DetailPage : titre, statut et méta
- Date : 2026-11-23
- Portée : DetailPage
- Décision : le titre est le `h1` de la page, en `--fs-xl`, semi-gras ; un titre long passe à la ligne, il n'est jamais tronqué. Le statut est un `StatusBadge` juste après le titre. La méta tient sur une ligne sous le titre, en `--fs-sm` et `--fg-2` ; ses éléments sont séparés par « · » et passent à la ligne si la place manque. Les actions (`ActionBar`, zone `header`) sont calées en haut à droite.
- Raison : le titre est l'identité de l'élément ; la méta le situe sans prendre la place des propriétés.
- Options écartées : titre tronqué avec info-bulle ; statut sous le titre.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/DetailPage-v1.html

## D-213 — Sections de page : titre, description, actions ; séparées par un trait
- Date : 2026-11-23
- Portée : PageSection (DetailPage, Page)
- Décision : `PageSection` a un titre `h2` en `--fs-lg`, semi-gras, une description facultative en `--fs-sm` et `--fg-2`, et des actions facultatives (`ActionBar`, zone `section`) à droite du titre. Dans DetailPage, deux sections sont séparées par un trait `--line`, avec 20 px au-dessus et au-dessous. Dans Page, les blocs sont espacés de 24 px, sans trait. Une section ne se replie pas.
- Raison : une page se lit en entier ; le repli est réservé au panneau de détail (D-061).
- Options écartées : sections repliables ; sections en cartes.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/DetailPage-v1.html

## D-214 — Largeur : colonne de lecture pour DetailPage, pleine largeur pour Page
- Date : 2026-11-23
- Portée : DetailPage, Page
- Décision : option `width` : `"text"` limite la colonne à 760 px, centrée ; `"full"` prend toute la largeur. Défaut `"text"` pour DetailPage, `"full"` pour Page. L'en-tête suit la même colonne que le contenu.
- Raison : une fiche se lit ; une page composée porte souvent un tableau ou un graphique.
- Options écartées : colonne calée à gauche ; même défaut pour les deux gabarits.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/DetailPage-v1.html

## D-215 — États de la page : chargement, erreur, introuvable
- Date : 2026-11-23
- Portée : DetailPage, Page
- Décision : option `state` : `"loading"` montre des squelettes après 200 ms (D-165), à la place du titre et de la méta si le titre n'est pas encore connu, et à la place du contenu ; `"error"` montre « Impossible de charger » avec « Réessayer » (`onRetry`) à la place du contenu (D-085) ; `"not-found"` montre l'`EmptyState` décrit par `notFound` (titre, phrase, action en zone `empty`). Dans ces trois états, les actions de l'en-tête sont masquées et le lien de retour reste. Un rechargement garde le contenu : l'attente se voit sur l'action (« Actualiser »), par `ActionBar` (D-116).
- Raison : le gabarit rend chaque état, et l'utilisateur peut toujours revenir à la liste.
- Options écartées : spinner plein écran ; squelettes à chaque rechargement.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/DetailPage-v1.html

## D-216 — États d'une section : chargement, erreur, vide
- Date : 2026-11-23
- Portée : PageSection
- Décision : une section qui charge ses données à part prend `state="loading"` (deux lignes de squelette), `state="error"` (message compact avec « Réessayer ») ou `empty` (`EmptyState` compact, avec action facultative en zone `empty`). Le titre de la section reste visible ; le reste de la page n'est pas touché.
- Raison : une partie lente (historique, pièces jointes) ne bloque pas toute la fiche.
- Options écartées : état géré par l'app avec ses propres composants.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/DetailPage-v1.html

## D-217 — Page composée : barre d'outils, contenu, pied
- Date : 2026-11-23
- Portée : Page
- Décision : `Page` sert quand aucun gabarit ne convient. Elle pose trois zones : `toolbar` (fixe, une ligne : contenu libre à gauche, qui défile à l'horizontale si la place manque ; `actions` en zone `toolbar` à droite), le contenu (blocs empilés à 24 px, seule zone qui défile), `footer` (fixe, trait au-dessus, `--fs-sm`, `--fg-3`). Elle n'a pas d'en-tête : le nom de la page est dans la barre du haut ; un élément ouvert prend DetailPage. L'app pose des composants du socle dans les zones, sans HTML stylé.
- Raison : une page hors gabarit garde les mêmes marges, la même barre et le même pied que les autres.
- Options écartées : en-tête libre dans Page (Alfred) ; barre d'outils sur plusieurs lignes.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/DetailPage-v1.html

## D-218 — Page : contenu qui remplit la hauteur
- Date : 2026-11-23
- Portée : Page
- Décision : option `fill` : le contenu prend la hauteur disponible sans défiler et sans marge basse ; son unique enfant (un éditeur, un grand tableau) gère son propre défilement.
- Raison : un tableau garde son en-tête visible et un éditeur tient dans la fenêtre.
- Options écartées : hauteur fixe en pixels.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/DetailPage-v1.html

## D-260 — TreeView ou Sidebar.TreeItem : choisir par la zone et la profondeur
- Date : 2026-11-23
- Portée : TreeView, Sidebar
- Décision : `TreeView` sert le contenu de travail (explorer, choisir et agir sur une hiérarchie de données), dans une zone de contenu, sur autant de niveaux que nécessaire, une ligne par nœud. `Sidebar.TreeItem` reste la navigation, dans la Sidebar seulement, sur deux lignes et un niveau d'enfants (D-056). La navigation de l'app va dans la Sidebar, même hiérarchique ; un arbre de données ne va jamais dans la Sidebar. Les deux ne partagent pas de rendu, seulement les tokens et React Aria `Tree`.
- Raison : validation par délégation de l'utilisateur, 2026-11-23 ; deux rôles nets évitent deux composants pour le même besoin.
- Options écartées : étendre `Sidebar.TreeItem` à plusieurs niveaux ; un seul composant d'arbre avec une variante « navigation ».
- Validation : docs/validation/components/TreeView-v1.html

## D-261 — TreeView : un nœud sur une ligne
- Date : 2026-11-23
- Portée : TreeView
- Décision : un nœud tient sur une ligne de `--row-h`, rayon de 8 px : retrait de 16 px par niveau, chevron de 16 px (place gardée sans enfants), icône facultative de 16 px (`openIcon` une fois déplié), libellé coupé, méta courte à droite en `--fs-sm`, `--fg-3`.
- Raison : validation par délégation de l'utilisateur, 2026-11-23 ; densité d'un explorateur, colonnes d'icônes alignées.
- Options écartées : deux lignes par nœud ; retrait qui suit la densité.
- Validation : docs/validation/components/TreeView-v1.html

## D-262 — TreeView : un trait vertical par niveau, sans coude
- Date : 2026-11-23
- Portée : TreeView
- Décision : sous un nœud déplié, chaque niveau parent est marqué par un trait vertical de 1 px en `--tree-line`, aligné sur le chevron du parent, sans coude ni trait horizontal.
- Raison : validation par délégation de l'utilisateur, 2026-11-23 ; on repère la profondeur sans bruit, même à cinq niveaux ; le coude de D-042 sert un seul niveau.
- Options écartées : coude de D-042 (B) ; aucun trait (C).
- Validation : docs/validation/components/TreeView-v1.html

## D-263 — TreeView : sélection et ouverture
- Date : 2026-11-23
- Portée : TreeView
- Décision : un clic sélectionne le nœud (`selectionMode` `single` par défaut, `multiple` ou `none`). En `multiple`, Mod+clic ajoute ou retire, Maj+clic prend la plage ; pas de case à cocher. Le chevron plie ou déplie sans sélectionner. Double-clic ou Entrée appellent `onAction` ; sans `onAction`, ils plient ou déplient le nœud.
- Raison : validation par délégation de l'utilisateur, 2026-11-23 ; c'est le geste d'un explorateur de fichiers ; une case par nœud appelle la sélection en cascade, hors de ce besoin.
- Options écartées : case au survol comme la liste (D-065) ; sélection en cascade.
- Validation : docs/validation/components/TreeView-v1.html

## D-264 — TreeView : clavier du motif tree et recherche par frappe
- Date : 2026-11-23
- Portée : TreeView
- Décision : clavier du motif `tree` de l'ARIA (React Aria `Tree`) : flèches haut et bas, droite (déplie, puis premier enfant), gauche (replie, puis parent), Origine, Fin, Page haut et bas, Entrée, Espace, Maj+flèches en `multiple`. Des lettres tapées vont au nœud visible dont le libellé commence par elles. Maj+F10 ou la touche Menu ouvrent le menu « … ».
- Raison : validation par délégation de l'utilisateur, 2026-11-23 ; même clavier que la Sidebar et que tout arbre du système.
- Options écartées : touche `*` (déplier les frères), absente de React Aria.
- Validation : docs/validation/components/TreeView-v1.html

## D-265 — TreeView : actions de nœud par le modèle Action
- Date : 2026-11-23
- Portée : TreeView
- Décision : `actions(node)` rend des `Action` ; la ligne les dessine avec `ActionBar` zone `row` (D-114) : une icône puis « … », l'action `danger` en dernier dans « … », confirmée (D-115). Les actions apparaissent au survol, au focus et sur la ligne sélectionnée, à la place de la méta ; un clic droit ou Maj+F10 ouvrent « … » (D-066).
- Raison : validation par délégation de l'utilisateur, 2026-11-23 ; une seule règle d'actions de ligne dans tout le système.
- Options écartées : boutons-icônes libres en bout de ligne (Alfred).
- Validation : docs/validation/components/TreeView-v1.html

## D-266 — TreeView : enfants chargés à la demande
- Date : 2026-11-23
- Portée : TreeView
- Décision : un nœud `hasChildren` sans `children` demande ses enfants à `loadChildren(node, signal)` à sa première ouverture. Pendant l'attente, une ligne « Chargement… » avec la roue s'affiche sous lui, et il porte `aria-busy`. En cas d'échec, la ligne devient « Impossible de charger » avec le lien « Réessayer ». Les enfants chargés sont gardés ; replier puis déplier ne relance pas la demande. Replier pendant l'attente abandonne la demande (`signal`).
- Raison : validation par délégation de l'utilisateur, 2026-11-23 ; un grand arbre reste léger, et l'erreur reste au nœud concerné.
- Options écartées : squelettes à la place des enfants ; erreur en notification.
- Validation : docs/validation/components/TreeView-v1.html

## D-267 — TreeView : glisser-déposer facultatif
- Date : 2026-11-23
- Portée : TreeView
- Décision : avec `onMove(ids, target)`, les nœuds se déplacent au glisser-déposer. Cible : avant ou après un nœud (trait d'insertion de 2 px en `--accent`, au retrait de la cible), ou dans un nœud qui peut avoir des enfants (fond `--selected` encadré d'`--accent`). Jamais dans le nœud glissé ni ses descendants. La ligne glissée passe à 50 % d'opacité. Le composant ne change pas `nodes` : l'app applique le déplacement. Au clavier, React Aria fournit le bouton « Déplacer », visible au focus.
- Raison : validation par délégation de l'utilisateur, 2026-11-23 ; c'est le besoin le plus courant d'un arbre de fichiers, sans imposer de règle métier.
- Options écartées : réordonner seulement entre frères ; poignée toujours visible.
- Validation : docs/validation/components/TreeView-v1.html

## D-268 — TreeView : arbre vide
- Date : 2026-11-23
- Portée : TreeView
- Décision : sans nœud, l'arbre affiche `EmptyState` compact, avec le titre et la phrase de `emptyState` (défaut : « Aucun élément »). Un dossier vide se déplie sans ligne sous lui.
- Raison : validation par délégation de l'utilisateur, 2026-11-23 ; même état vide que le reste du système (D-166).
- Options écartées : ligne « Dossier vide » sous chaque dossier vide.
- Validation : docs/validation/components/TreeView-v1.html

## D-270 — Table dense : des options de Table, pas de second composant
- Date : 2026-11-23
- Portée : Table
- Décision : le tableau dense d'Alfred (`DataGrid`, `DataTable`) devient un jeu d'options facultatives de `Table` : `density` (D-271), `groupBy` (D-272), `rowDescription` (D-273). Deux corrections s'y ajoutent : largeur étroite respectée (D-274) et info-bulle d'en-tête (D-275). Les cases de sélection (D-065), les séparateurs d'en-tête (D-067) et l'absence de cadre (D-062) existent déjà. Sans ces options, `Table` ne change pas. L'édition dans la case, les colonnes figées et la virtualisation restent exclues.
- Raison : un seul tableau à apprendre et à maintenir ; les besoins d'Alfred sont des réglages, pas un autre composant.
- Options écartées : un composant `DataGrid` séparé ; une variante `appearance="plain"` (c'est déjà le seul rendu).
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Table-v2.html

## D-271 — Table : densité compacte
- Date : 2026-11-23
- Portée : Table
- Décision : `density="compact"` donne des lignes de 25 px, un en-tête de 28 px et une marge de case de 8 px, en web comme en desktop. Le texte garde sa taille (`--fs-md`, en-tête `--fs-sm`). Par défaut (`"default"`), la ligne reste à `--row-h` (D-063).
- Raison : journaux, variables et inventaires montrent beaucoup de lignes ; 25 px reste lisible et cliquable à la souris.
- Options écartées : réduire aussi le texte ; une densité par plateforme seulement.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Table-v2.html

## D-272 — Table : lignes de groupe en texte, repliables
- Date : 2026-11-23
- Portée : Table
- Décision : `groupBy(row)` range les lignes sous une ligne de groupe, dans l'ordre de leur première apparition ; l'ordre des lignes dans un groupe suit `rows` (l'app trie). La ligne de groupe occupe toute la largeur : chevron de 12 px en `--fg-3`, nom en `--fw-semibold`, puis « · n lignes » en `--fg-3`, sans fond (D-064). Clic, Entrée ou Espace replient ou déplient le groupe, sans animation (D-026). Un groupe replié garde sa ligne de titre. `defaultCollapsedGroups` replie des groupes au départ ; l'état replié est mémorisé par tableau (D-007). La ligne de groupe ne se sélectionne pas et ne s'ouvre pas.
- Raison : forme A de la page de validation ; le chevron montre qu'on peut replier, sans fond de ligne.
- Options écartées : B, bande teintée (fond de ligne, contre D-064) ; C, texte sans chevron (Alfred : rien n'indique le repli).
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Table-v2.html

## D-273 — Table : lignes doubles
- Date : 2026-11-23
- Portée : Table
- Décision : `rowDescription(row)` ajoute une précision sous le nom, dans la colonne principale, en `--fs-sm` et `--fg-3`, coupée par « … » avec info-bulle. Toutes les lignes passent alors à `--row-h` + 12 px (46 px web, 40 px desktop, 37 px compact). Les autres colonnes restent sur une ligne, centrées en hauteur.
- Raison : nom et courriel, fichier et chemin : deux informations d'un même élément, sans colonne de plus.
- Options écartées : deux lignes dans n'importe quelle case (Alfred) ; hauteur double fixe de 44 px.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Table-v2.html

## D-274 — Table : une largeur étroite déclarée est respectée
- Date : 2026-11-23
- Portée : Table
- Décision : une colonne déclarée sous 80 px (une pastille de statut, par exemple) garde sa largeur : sa largeur minimale devient sa largeur déclarée, sans descendre sous 32 px. Les autres règles de largeur ne changent pas (D-067).
- Raison : une colonne de pastilles à 80 px gaspille la place d'un tableau dense.
- Options écartées : des largeurs fixes, non redimensionnables.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Table-v2.html

## D-275 — Table : en-tête coupé, libellé en info-bulle
- Date : 2026-11-23
- Portée : Table
- Décision : un libellé d'en-tête trop long se coupe par « … » ; le libellé complet s'affiche en info-bulle au survol (500 ms, D-031) et au focus clavier, seulement s'il est coupé. C'est la règle « Contenu » de la spec, appliquée aussi à l'en-tête.
- Raison : correction ; sans elle, une colonne étroite cache son nom.
- Options écartées : libellé sur deux lignes.
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Table-v2.html

## D-276 — Table : pas de case teintée
- Date : 2026-11-23
- Portée : Table
- Décision : `Table` ne teinte pas le fond d'une case selon sa ligne. Une case qui signale un état reçoit un `StatusDot` ou un `StatusBadge` par `renderCell` (D-160).
- Raison : un fond de couleur par case contredit D-064 et la règle « la couleur sert aux pastilles ».
- Options écartées : `tone` avec `fill` ou `frame` (Alfred).
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Table-v2.html

## D-277 — Table : pas de menu propre à une case
- Date : 2026-11-23
- Portée : Table
- Décision : un clic de case n'ouvre pas de menu. Les actions d'un élément passent par le menu « … » de la ligne et le clic droit (D-066). Une matrice d'actions (une case = un objet) est une solution locale de l'app.
- Raison : échoue au test du générique : propre à la matrice de déploiement d'Alfred ; une ligne a déjà son menu.
- Options écartées : `column.menu` (Alfred).
- Validation : par délégation de l'utilisateur, 2026-11-23 — docs/validation/components/Table-v2.html

## D-280 — Terminal : xterm.js reste côté app, peer dependency facultative
- Date : 2026-11-23
- Portée : Terminal
- Décision : Socle n'importe jamais xterm.js. `@xterm/xterm` et `@xterm/addon-fit` sont des peer dependencies facultatives (`peerDependenciesMeta.optional`) : elles fixent les versions prises en charge, sans être installées d'office. L'app qui affiche un terminal installe xterm, importe `@xterm/xterm/css/xterm.css` et passe le moteur par l'option `engine` : `() => Promise<{ Terminal, FitAddon }>` (chargé à l'ouverture) ou l'objet lui-même. Socle décrit les types dont il a besoin, sans dépendre de ceux d'xterm.
- Raison : une app sans terminal ne télécharge ni ne résout xterm (un `import()` dans Socle casserait sa compilation) ; l'app choisit quand charger les 300 ko d'xterm.
- Options écartées : dépendance directe (poids pour toutes les apps) ; peer dependency importée par Socle (échec de compilation des apps sans xterm) ; point d'entrée `socle-ui/terminal` (contraire au point d'entrée unique).
- Validation : docs/validation/components/Terminal-LogViewer-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-281 — Couleurs ANSI : seize tokens, lisibles en clair et en sombre
- Date : 2026-11-23
- Portée : tokens, Terminal, LogViewer
- Décision : les 16 couleurs ANSI sont des tokens `--ansi-0` à `--ansi-15` (noir, rouge, vert, jaune, bleu, magenta, cyan, blanc, puis leurs versions vives), redéfinis en sombre. Chacun atteint au moins 4,5:1 sur `--surface`. « Noir » et « blanc » deviennent des gris lisibles sur le fond du mode ; « blanc vif » vaut `--fg`. Aucune couleur ANSI n'est écrite en dur dans un composant : le Terminal lit les tokens calculés, le LogViewer les applique par `var(--ansi-n)`. Une couleur 256 ou RVB est ramenée à la plus proche des 16 dans le journal ; xterm garde un contraste minimum de 4,5:1 (`minimumContrastRatio`). Curseur : `--accent` ; sélection : `--accent` à 30 %.
- Raison : une couleur d'un programme pensé pour un fond noir doit rester lisible sur le fond clair ; un token se recale avec le thème.
- Options écartées : palette xterm d'origine (illisible en clair) ; terminal toujours sombre (ne suit pas le mode, demande refusée par le besoin).
- Validation : docs/validation/components/Terminal-LogViewer-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-282 — Terminal : écran, cadre et barre d'état
- Date : 2026-11-23
- Portée : Terminal
- Décision : l'écran est sur `--surface`, dans un cadre de 1 px `--line` au rayon de 8 px ; police `--font-mono` à 13 px, interligne 1,2, 5 000 lignes d'historique. Une barre d'état de 28 px, sur `--surface-side`, donne l'état (`StatusDot` et texte : « Ouverture du terminal… », « Connecté », « Session terminée », « Connexion interrompue » avec la raison), une aide (« F6 pour sortir », « Lecture seule », « Sélection copiée ») et la taille « 120 × 32 ». Tant que le terminal a le focus, le cadre passe à `--accent`. Hauteur par défaut : entre 280 et 560 px ; `fill` occupe la hauteur restante.
- Raison : le terminal garde le clavier ; l'utilisateur doit voir quand il est dedans et comment en sortir.
- Options écartées : sans barre d'état (état et sortie invisibles) ; barre d'outils intégrée (les actions sont celles de la page, par la poignée).
- Validation : docs/validation/components/Terminal-LogViewer-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-283 — Terminal : clavier, copier et coller
- Date : 2026-11-23
- Portée : Terminal
- Décision : raccourcis de Windows Terminal. Ctrl+C copie quand du texte est choisi, sinon il part au programme (interruption) ; Ctrl+Maj+C copie toujours ; Ctrl+V et Ctrl+Maj+V collent ; F6 et Maj+F6 sortent du terminal vers le contrôle suivant ou précédent (WCAG 2.1.2). Sur macOS, ⌘C et ⌘V restent ceux du système. Le collage suit le collage encadré quand le programme l'a demandé : un texte sur plusieurs lignes ne s'exécute pas d'office. Mode lecteur d'écran d'xterm actif ; le champ caché porte le nom et une description des raccourcis.
- Raison : mêmes gestes que le terminal du système ; aucun piège au clavier.
- Options écartées : Tab pour sortir (Tab sert à la complétion du shell) ; Ctrl+C toujours copie (empêche d'interrompre un programme).
- Validation : docs/validation/components/Terminal-LogViewer-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-284 — Terminal : branchement générique et poignée
- Date : 2026-11-23
- Portée : Terminal
- Décision : le terminal ne connaît aucun protocole. L'app branche une `connection` `{ send(data), subscribe(write) }`, reçoit la taille par `onResize` (la première tout de suite, puis une seule à la fin d'un redimensionnement, 120 ms) et donne l'état par `state` (`connecting`, `open`, `closed`, `error`) et `reason`. La poignée (`ref`) offre `write`, `clear`, `text(lignes?)`, `selection`, `paste`, `bracketedPaste` et `focus` ; ses méthodes ne font rien tant que le moteur n'est pas chargé, et `write` met en attente ce qui arrive avant. Les actions « Effacer », « Copier la session », « Coller une commande » sont des actions de la page (ActionBar), qui appellent la poignée.
- Raison : un canal WebSocket, un processus Tauri ou un faux terminal de démonstration se branchent de la même façon.
- Options écartées : lecture d'un canal propre à une app (solution locale dans Alfred : un adaptateur vers `connection`) ; boutons intégrés au terminal.
- Validation : docs/validation/components/Terminal-LogViewer-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-285 — LogViewer : anatomie
- Date : 2026-11-23
- Portée : LogViewer
- Décision : dans un cadre de 1 px `--line` au rayon de 8 px : une barre d'outils (réglages de l'app `tools`, filtre de niveau, `SearchField`, « n sur N », résultat précédent et suivant, puis à droite : Suivre, Retour à la ligne, Horodatage, Liste des erreurs, Copier, actions de l'app en `IconButton`), la zone des lignes, puis une barre d'état de 28 px sur `--surface-side` (« n lignes », erreurs en `--danger`, alertes en `--warning`, « En direct » pour un journal en direct, « Suivi en pause » avec « Revenir à la fin »). Une ligne : numéro en `--fg-3` dans une gouttière, heure en `--fg-3` (HH:MM:SS.mmm), texte en `--font-mono` 12,5 px. Une erreur a une marque de 3 px `--danger` au bord de la gouttière, une alerte `--warning` (jamais la couleur seule : le niveau est aussi lu par les lecteurs d'écran). La liste est virtualisée : seules les lignes visibles sont dans la page, jusqu'à 500 000 lignes gardées.
- Raison : reprend le journal d'Alfred, éprouvé sur des journaux de build et de conteneur.
- Options écartées : lignes en `Table` (trop lourd au-delà de quelques milliers) ; barre d'outils sous le journal.
- Validation : docs/validation/components/Terminal-LogViewer-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-286 — LogViewer : filtre de niveau par Menu à choix, avec compteurs
- Date : 2026-11-23
- Portée : LogViewer
- Décision : avec `levels`, un bouton « Niveau : Tous » ouvre un Menu à choix : « Toutes les lignes », « Alertes et erreurs », « Erreurs », chacun avec son compteur. Les compteurs d'erreurs et d'alertes restent visibles dans la barre d'état. Le niveau d'une ligne vient de l'app (`level` de la ligne) ou, à défaut, du texte : `ERROR`, `FATAL`, `WARN`, `level=error`, `[warn]`, une exception, un code de sortie non nul. Une ligne `stderr` sans autre indice n'est pas une erreur.
- Raison : même geste que les filtres par propriété des listes (D-141), sans composant nouveau ; un contrôle segmenté pourra le remplacer quand Socle en aura un.
- Options écartées : boutons segmentés (composant absent de Socle) ; compteurs de la barre d'état cliquables (peu découvrables).
- Validation : docs/validation/components/Terminal-LogViewer-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-287 — LogViewer : liste des erreurs en panneau à droite
- Date : 2026-11-23
- Portée : LogViewer
- Décision : avec `levels`, le bouton « Liste des erreurs » ouvre un panneau de 260 px à droite des lignes, titré « Erreurs · n ». Chaque erreur montre « Ligne n » et son texte sur une ligne (« … »). Un clic remet le filtre sur « Toutes les lignes », suspend le suivi, centre la ligne et la marque (`--selected`). Les 200 premières erreurs sont listées ; au-delà, une phrase le dit. Sans erreur : `EmptyState` compact. Sous 640 px de large, le panneau passe sous les lignes.
- Raison : on garde la liste ouverte pendant qu'on lit le contexte de chaque erreur.
- Options écartées : Menu des erreurs (se ferme à chaque clic) ; saut à l'erreur suivante seul (pas de vue d'ensemble).
- Validation : docs/validation/components/Terminal-LogViewer-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-288 — LogViewer : Suivre la fin
- Date : 2026-11-23
- Portée : LogViewer
- Décision : un journal en direct (`live`) suit la fin au départ : chaque nouvelle ligne fait défiler. Le suivi se met en pause dès qu'on remonte (molette, flèche haut, Page haut, Début, recherche, clic dans la liste des erreurs) ; la barre d'état dit « Suivi en pause · n nouvelles lignes » et propose « Revenir à la fin ». Le suivi reprend en arrivant en bas, par la touche Fin, par « Revenir à la fin » ou par la bascule « Suivre » (`IconButton` sélectionnable) de la barre d'outils. Un journal terminé n'a pas de bascule Suivre.
- Raison : on lit un passage sans que le journal parte ; on sait toujours ce qu'on manque.
- Options écartées : suivi qu'il faut couper à la main (la lecture saute) ; bouton flottant sur les lignes (cache du texte).
- Validation : docs/validation/components/Terminal-LogViewer-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-289 — LogViewer : recherche, retour à la ligne, horodatage et copie
- Date : 2026-11-23
- Portée : LogViewer
- Décision : la recherche passe par `SearchField` (à partir de 2 caractères, 300 ms, D-080) et garde les lignes : celles qui contiennent le texte (sans casse) sont teintées `--field`, le texte trouvé est surligné, la ligne courante est en `--selected` et centrée. « n sur N » ou « Aucune ligne » à côté. Entrée et F3 vont au résultat suivant, Maj+Entrée et Maj+F3 au précédent ; une nouvelle recherche mène au plus récent résultat si le journal suivait la fin, sinon au premier sous la lecture. Retour à la ligne : coupé au départ (`wrap`), les longues lignes défilent à l'horizontale. Horodatage : affiché au départ (`timestamps`), bascule présente seulement si des lignes ont une heure ; une heure ISO en tête de ligne passe dans la colonne. Copier : la sélection faite dans le journal, sinon toutes les lignes affichées (filtre compris), sans séquences ANSI ; l'icône devient une coche et l'info-bulle « Copié » 1,6 s, annoncé aux lecteurs d'écran. Les séquences ANSI sont lues sans jamais produire de HTML.
- Raison : on cherche dans un journal pour voir le contexte, pas pour le réduire ; la copie colle du texte propre.
- Options écartées : recherche qui filtre les lignes ; copie qui garde les couleurs.
- Validation : docs/validation/components/Terminal-LogViewer-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-290 — DiffView : un composant, deux sources, et DiffStat
- Date : 2026-11-23
- Portée : DiffView, DiffStat
- Décision : `DiffView` montre les différences entre deux textes (`before`, `after`, avec `fileName` facultatif), ou lit un diff unifié (`patch`, un ou plusieurs fichiers, format de `git diff` et de `diff -u`). `DiffStat` montre seul les compteurs « +12 −3 », par exemple dans une ligne de liste de fichiers. Le composant compare et affiche ; il ne colore pas la syntaxe et ne modifie rien (pas d'acceptation ni de rejet de changement).
- Raison : test du générique réussi (code, Markdown, configuration, réglages versionnés) ; Alfred écrit aujourd'hui ses compteurs en hexadécimal dans `agent.css`.
- Options écartées : deux composants (texte et patch) ; coloration syntaxique ; fusion à trois voies.
- Validation : docs/validation/components/DiffView-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-291 — DiffView : côte à côte par défaut, bascule par bouton-icône
- Date : 2026-11-23
- Portée : DiffView
- Décision : la vue côte à côte est celle par défaut ; l'unifiée est au choix (`mode`, `defaultMode`, `onModeChange`). La bascule est un `IconButton` à bascule « Côte à côte » dans l'en-tête (D-034). Sous 641 px (D-013), la vue unifiée s'impose et la bascule disparaît.
- Raison : option A de la page de validation ; rien de nouveau à créer, et la bascule tient dans une barre étroite.
- Options écartées : contrôle segmenté (absent de Socle, spec RadioGroup) ; Menu « Affichage » (un clic de plus).
- Validation : docs/validation/components/DiffView-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-292 — DiffView : couleurs tirées de --success et --danger
- Date : 2026-11-23
- Portée : DiffView, DiffStat
- Décision : une ligne ajoutée a un fond `--success` à 12 % sur `--surface` ; une ligne retirée, `--danger` à 10 %. Les mots changés et la colonne des numéros de ces lignes ont le même ton à 32 % et 30 %. Signes et compteurs sont écrits en `--success` et `--danger`. Les mélanges sont calculés dans le composant (`color-mix`) : pas de nouveau token global, aucune couleur en dur. Le changement courant a un trait de 3 px `--accent` à gauche. La demi-ligne vide d'un côté est hachurée `--surface-side`.
- Raison : les tons suivent le mode sombre et un thème d'app sans réglage de plus ; le texte reste `--fg` sur ces fonds (AA).
- Options écartées : tokens `--diff-*` globaux (aucun autre composant n'en a l'usage) ; texte coloré au lieu de fonds.
- Validation : docs/validation/components/DiffView-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-293 — DiffView : le sens ne passe pas par la couleur seule
- Date : 2026-11-23
- Portée : DiffView, DiffStat
- Décision : chaque ligne a son signe visible (« + », « − », espace) et un texte caché au début (« Ajoutée : », « Retirée : »). Les mots changés sont dans `<ins>` et `<del>`. Les compteurs ont un texte caché (« 12 lignes ajoutées, 3 retirées »). En contraste élevé (`forced-colors`), les mots retirés sont barrés, les ajoutés soulignés, et les signes en gras.
- Raison : principe « jamais une couleur seule » (D-160) et WCAG 1.4.1.
- Options écartées : couleur seule, comme les compteurs actuels d'Alfred.
- Validation : docs/validation/components/DiffView-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-294 — DiffView : mots changés dans une ligne
- Date : 2026-11-23
- Portée : DiffView
- Décision : une ligne retirée et la ligne ajoutée qui la remplace (appariées dans l'ordre) sont comparées par mots, espaces et signes. Les parties changées sont surlignées. Si les deux lignes ont moins de 40 % de texte commun, ou plus de 2 000 caractères, rien n'est surligné : toute la ligne a changé.
- Raison : surligner presque toute une ligne n'aide pas à la lecture ; la règle vient d'Alfred, éprouvée.
- Options écartées : comparaison caractère par caractère (trop de fragments).
- Validation : docs/validation/components/DiffView-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-295 — DiffView : lignes inchangées repliées
- Date : 2026-11-23
- Portée : DiffView
- Décision : seules `context` lignes inchangées (3 par défaut) restent visibles autour d'un changement. Au-delà, une suite d'au moins 4 lignes devient une rangée « N lignes inchangées » avec un `Button` `subtle` `sm` « Afficher N lignes ». Un `IconButton` à bascule de l'en-tête, « Afficher les lignes inchangées », ouvre ou referme tous les replis. Dans un patch, les lignes absentes du diff sont dites (« N lignes inchangées, à partir de la ligne X ») sans bouton. Un nouveau contenu repart replié.
- Raison : le changement reste au centre ; une suite de moins de 4 lignes coûte plus à replier qu'à montrer.
- Options écartées : tout montrer par défaut ; replis sans bouton global.
- Validation : docs/validation/components/DiffView-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-296 — DiffView : en-tête et fichiers
- Date : 2026-11-23
- Portée : DiffView
- Décision : l'en-tête (fond `--surface-side`, hauteur `--bar-h`) montre le nom du fichier en chasse fixe (`fileName`, si fourni), le résumé (« 3 changements », « Aucune différence », « Fichier binaire ») et `DiffStat`, puis à droite les boutons-icônes : vue, lignes inchangées, changement précédent, changement suivant. Dans un patch à plusieurs fichiers, chaque fichier a sa rangée de titre (nom, statut « Ajouté », « Supprimé » ou « Renommé », `DiffStat`), et l'en-tête montre le total. Deux textes identiques montrent un `EmptyState` compact « Aucune différence ».
- Raison : le nom et l'ampleur du changement se lisent avant le contenu ; le reste réutilise des composants existants.
- Options écartées : compteurs en bas ; bouton à texte pour la vue.
- Validation : docs/validation/components/DiffView-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-297 — DiffView : navigation de changement en changement
- Date : 2026-11-23
- Portée : DiffView
- Décision : la zone du diff est joignable au clavier (une tabulation) et défile aux flèches. F7 ou Alt+↓ va au changement suivant, Maj+F7 ou Alt+↑ au précédent, en boucle ; les boutons de l'en-tête font de même. Le changement courant est marqué (D-292), placé au tiers haut de la zone et annoncé : « Changement 2 sur 3 : avant, ligne 7 ; après, lignes 7 à 8 ». Le focus de la zone se voit sur le cadre du diff (anneau `--accent`).
- Raison : un long diff se parcourt sans souris ; F7 suit l'usage des éditeurs de code.
- Options écartées : touches N et P (prises par la frappe d'un lecteur d'écran).
- Validation : docs/validation/components/DiffView-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-298 — DiffView : rangées de hauteur fixe, seules les visibles dessinées
- Date : 2026-11-23
- Portée : DiffView
- Décision : une rangée de code fait 20 px, en `--font-mono` à `--fs-sm`, dans les deux densités ; repli et titre de fichier, 32 px. Seules les rangées visibles sont dessinées. La hauteur du diff suit son contenu jusqu'à 720 px puis défile ; avec `fill`, il prend la hauteur de son conteneur. Les lignes longues ne passent pas à la ligne : le diff défile à l'horizontale, d'un seul bloc.
- Raison : un fichier de dizaines de milliers de lignes reste fluide ; le code se lit mieux sans retour à la ligne.
- Options écartées : retour à la ligne (hauteurs variables, alignement côte à côte perdu).
- Validation : docs/validation/components/DiffView-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-299 — DiffView : avis sur le contenu
- Date : 2026-11-23
- Portée : DiffView
- Décision : une rangée d'avis, en `--fg-2`, dit ce qui ne se compare pas ligne à ligne : « Fichier binaire : contenu non comparé » (octet nul dans les 8 000 premiers caractères, ou patch binaire), « Fins de ligne converties : CRLF → LF » (une fois pour le fichier), « Diff coupé : la suite n'est pas affichée » (`truncated`). Une ligne dont seule la fin de ligne change, ou sans fin de ligne finale, porte une petite étiquette « LF », « CRLF » ou « sans fin de ligne ».
- Raison : un diff vide ou étrange s'explique au lieu de tromper.
- Options écartées : avis en `Toast` (perdu au défilement).
- Validation : docs/validation/components/DiffView-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-310 — DocumentViewer : rôle, sources et formats
- Date : 2026-11-23
- Portée : DocumentViewer
- Décision : `DocumentViewer` affiche l'aperçu d'un document dans une page : PDF (dessiné par pdf.js) et image. La source est une adresse (`src` : `data:`, `blob:` ou `https:`) ou des octets (`data` : `Blob`, `File`, `Uint8Array`, `ArrayBuffer`). Le format vient du type MIME (`type`, ou celui du `Blob`), puis de l'extension de `name`. Tout autre format montre « Format non pris en charge » avec « Télécharger » si l'app le permet. Le texte brut et le Markdown ne sont pas pris en charge : l'app compose `Code` ou `Markdown`.
- Raison : PDF et image couvrent l'aperçu de pièces jointes dans toute app ; le texte a déjà ses composants.
- Options écartées : source « fichier du module » (propre à Alfred) ; rendu du texte et du Markdown dans la visionneuse.
- Validation : docs/validation/components/Documents-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-311 — DocumentViewer : pdf.js en peer dependency facultative, chargée par l'app
- Date : 2026-11-23
- Portée : DocumentViewer
- Décision : Socle n'importe jamais pdf.js. `pdfjs-dist` (>= 5) est une peer dependency facultative. L'app passe `loadPdf={() => import("pdfjs-dist")}` et règle elle-même le worker (`GlobalWorkerOptions.workerSrc`, ou faux worker quand le cadre interdit les workers). Sans `loadPdf`, un PDF montre l'erreur « Aperçu PDF indisponible ».
- Raison : une app sans PDF n'installe rien et son bundler n'a rien à résoudre ; le réglage du worker dépend de l'hôte (CSP), donc de l'app.
- Options écartées : import dynamique de `pdfjs-dist` dans Socle ; dépendance directe (~1,7 Mo pour toutes les apps).
- Validation : docs/validation/components/Documents-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-312 — DocumentViewer : barre d'outils
- Date : 2026-11-23
- Portée : DocumentViewer
- Décision : une barre de `--bar-h` au-dessus du document, `role="toolbar"`. À gauche : « Page n / N » pour un PDF, sinon le nom du fichier, coupé par « … ». À droite, en `IconButton` : page précédente et suivante (PDF) ; zoom arrière, pourcentage, zoom avant, « Ajuster à la largeur » (bascule) ; « Télécharger » si `onDownload` ; puis les `actions` de l'app, rangées par `ActionBar` en zone `toolbar`. Un trait vertical sépare les groupes. Télécharger reste à l'app : Socle ne crée aucun fichier.
- Raison : les commandes d'une visionneuse courante, en boutons-icônes avec info-bulle comme toute barre d'outils de Socle (D-035).
- Options écartées : champ de saisie du numéro de page ; menu de zoom ; impression.
- Validation : docs/validation/components/Documents-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-313 — DocumentViewer : zoom
- Date : 2026-11-23
- Portée : DocumentViewer
- Décision : à l'ouverture, le document est ajusté à la largeur de la zone ; une image n'est jamais agrandie au-delà de 100 % en mode ajusté. Paliers : 25, 50, 75, 100, 125, 150, 200, 300, 400 %. Ctrl ou ⌘ + molette zoome en continu autour du pointeur. Ctrl/⌘ + « + » et « − » passent au palier suivant, Ctrl/⌘ + « 0 » ajuste à la largeur, quand le focus est dans la visionneuse. Un zoom par bouton garde en haut la page qui y était.
- Raison : comportement repris d'Alfred, éprouvé ; les raccourcis sont ceux des navigateurs.
- Options écartées : ajuster à la page entière ; zoom par pincement géré à part (le navigateur l'envoie comme Ctrl + molette).
- Validation : docs/validation/components/Documents-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-314 — DocumentViewer : pages d'un PDF
- Date : 2026-11-23
- Portée : DocumentViewer
- Décision : les pages sont l'une sous l'autre, centrées, espacées de 12 px, sur le fond `--surface-side`. Chaque page garde sa place dès l'ouverture et n'est dessinée qu'à moins de 600 px de la zone visible ; pendant un zoom, le dessin précédent reste jusqu'au nouveau. La page courante est celle qui occupe le tiers haut de la zone. La zone de défilement est focusable : flèches et Page préc./suiv. défilent.
- Raison : un long document reste fluide et la barre dit toujours où l'on est.
- Options écartées : une page à la fois ; vignettes dans une colonne.
- Validation : docs/validation/components/Documents-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-315 — Tokens « papier » : le rendu d'un document reste blanc
- Date : 2026-11-23
- Portée : tokens
- Décision : trois tokens, identiques en clair et en sombre : `--paper` (#ffffff, fond d'une page de document), `--paper-fg` (#1a1a1a, texte sur papier), `--paper-link` (#1d4ed8, lien sur papier). La page d'un PDF et la surface papier de `HtmlContent` les utilisent. Tout le reste de la visionneuse suit les tokens du thème.
- Raison : une page de PDF ou un courriel est un rendu du document, pas de l'interface ; il garde ses couleurs dans les deux thèmes, sans couleur en dur dans les composants.
- Options écartées : couleurs `#fff` et repli `rgba(...)` en dur dans le composant (Alfred) ; page inversée en sombre.
- Validation : docs/validation/components/Documents-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-316 — DocumentViewer : chargement et erreurs
- Date : 2026-11-23
- Portée : DocumentViewer
- Décision : pendant la lecture, la zone montre un `SkeletonGroup` en forme de page, nommé « Lecture du document… » (après 200 ms, D-165). Une erreur remplace la zone par un `EmptyState` compact « Document illisible » avec la cause (PDF protégé par mot de passe, PDF invalide ou abîmé, aperçu PDF indisponible, lecture impossible) et « Réessayer ». La barre reste affichée, avec le nom et « Télécharger ».
- Raison : mêmes états que le reste de Socle ; le téléchargement reste possible quand l'aperçu échoue.
- Options écartées : notification d'erreur (Alfred `PdfPreview`) ; barre masquée en erreur.
- Validation : docs/validation/components/Documents-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-317 — HtmlContent : HTML nettoyé dans une racine fantôme
- Date : 2026-11-23
- Portée : HtmlContent
- Décision : le HTML est lu dans un document inerte (`DOMParser`), puis recopié par liste blanche de balises et d'attributs. Sont retirés : scripts, gestionnaires `on…`, formulaires, cadres, SVG, MathML, médias, `<base>`, `<meta>`, `<link>`, liens autres que http, https, mailto. Dans les styles : `url()`, `@import`, `expression()`, `behavior`, `-moz-binding` et les règles `:host`. Le résultat vit dans une racine fantôme (shadow DOM) : ses styles ne débordent pas sur l'app. L'hôte a `contain: content` : un élément `position: fixed` reste dans la zone. La zone prend la hauteur de son contenu ; un contenu trop large défile dans la zone.
- Raison : sûr sans iframe, donc utilisable dans un hôte qui interdit les cadres, avec une hauteur naturelle.
- Options écartées : iframe `sandbox` (hauteur à mesurer, interdite par certaines CSP) ; DOMPurify (dépendance de plus pour le même résultat).
- Validation : docs/validation/components/Documents-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-318 — HtmlContent : images distantes bloquées par défaut
- Date : 2026-11-23
- Portée : HtmlContent
- Décision : une image distante (http, https) n'est pas chargée par défaut : un cadre vide de même taille la remplace, et un bandeau au-dessus du contenu dit « N images masquées. » avec le bouton « Afficher les images ». Une image intégrée (`data:image/...`) s'affiche toujours. Une autre source (`cid:` d'une pièce jointe) passe par `resolveImage`, qui rend une adresse affichable ou `null`. Le choix est contrôlable : `imagesAllowed`, `defaultImagesAllowed`, `onImagesAllowedChange` (l'app peut retenir un expéditeur de confiance). Images permises : l'adresse passe aussi par `resolveImage` si elle est fournie (l'app peut passer par un proxy).
- Raison : une image distante trace l'ouverture d'un courriel ; l'utilisateur décide.
- Options écartées : images toujours chargées ; images bloquées sans moyen de les afficher (Alfred).
- Validation : docs/validation/components/Documents-v1.html (par délégation de l'utilisateur, 2026-11-23)

## D-319 — HtmlContent : liens interceptés et surface papier
- Date : 2026-11-23
- Portée : HtmlContent
- Décision : un lien http, https ou mailto reste un lien : souligné, focusable, l'adresse en info-bulle native (`title`). Un clic ou Entrée appelle `onLink(url)` ; rien ne navigue dans l'app. Sans `onLink`, le lien devient du texte simple. Surface : `paper` par défaut (fond `--paper`, texte `--paper-fg`, liens `--paper-link`, rayon `--radius-md`, marge 16 px) ; `theme` pour un HTML simple produit par l'app (fond transparent, texte `--fg`, liens `--accent-text`).
- Raison : un courriel porte ses propres couleurs ; sur papier, il reste lisible en sombre. L'adresse visible protège de l'hameçonnage.
- Options écartées : surface du thème par défaut (texte noir en dur illisible en sombre) ; inversion automatique des couleurs.
- Validation : docs/validation/components/Documents-v1.html (par délégation de l'utilisateur, 2026-11-23)
