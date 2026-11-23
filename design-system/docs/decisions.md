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
