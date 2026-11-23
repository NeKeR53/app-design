# Principes du design system

## Contexte

### Apps visées
- **Desktop** : apps Tauri.
- **Web** : apps responsives sur trois formats (bureau, tablette, mobile).
- Ce sont de **vraies applications de travail** : on y saisit, on y consulte et on y pilote. Pas de landing pages ni de sites vitrines.

### Inspiration
- **Référence principale** : l'application desktop Claude. On reprend sa structure et son comportement :
  - un AppShell à trois colonnes (sidebar, contenu, panneau de détail) ;
  - une sidebar repliable, qui revient en overlay au survol ;
  - des sections repliables, avec des éléments imbriqués sur deux lignes ;
  - un en-tête minimaliste ;
  - des réglages dans un espace à part, avec recherche, groupes et lignes pleine largeur ;
  - un style monochrome où la couleur ne porte que du sens.
- **On ne reprend pas** son identité : ni le nom, ni le logo, ni les icônes, ni les textes, ni les couleurs propres.
- Les observations détaillées et les captures sont dans `docs/inspirations/claude-desktop/`.

### Apps existantes
- Aucune app n'est à analyser pour l'instant. La première app pilote sera choisie à la fin de l'init.

### Contraintes
- **Marque** : style neutre, sans marque imposée. Une seule couleur d'accent, configurable par app.
- **Langues** : apps en français, composants prêts pour d'autres langues :
  - aucun texte en dur : les libellés internes viennent d'un dictionnaire, en français par défaut, que l'app traduit avec l'option `messages` de `SocleProvider` (D-089) ;
  - les mises en page tolèrent des textes plus longs.
- **Plateformes** : macOS et Windows, pour le desktop Tauri comme pour le web. Les raccourcis, leur affichage, les contrôles de fenêtre et les conventions de chaque système sont pris en compte.
- **Accessibilité** : WCAG 2.2 niveau AA :
  - contrastes suffisants dans les deux modes, y compris pour le texte secondaire ;
  - tout est utilisable au clavier, avec un focus visible ;
  - zones cliquables d'au moins 24 px ;
  - libellés accessibles, y compris pour les boutons-icônes.

## Principes

### Ton
- **Sobre fidèle** (D-001) : neutres légèrement chauds, rayons moyens, respiration confortable.
- **Monochrome** : la couleur d'accent ne porte que du sens (sélection forte, interrupteur actif, non-lu, lien). Les états succès, alerte, erreur et info ont leurs propres couleurs.
- **Surfaces par rôle** : surface principale, surface secondaire (sidebar), sélection, survol, champ, trait. La hiérarchie s'inverse entre clair et sombre.
- **Pas de décoration** : pas de dégradés, des ombres réservées à ce qui flotte (overlay, menus, feuilles), des traits fins pour séparer.

### Densité
- **Deux densités portées par les tokens** (D-004) : web confortable, desktop compact. Les composants sont les mêmes dans les deux cas.

### Clair et sombre
- **Les deux modes** sont pris en charge. Par défaut, l'app suit le système, avec un choix manuel dans les réglages (D-005).

### Formats
- **Bureau et tablette** : sidebar repliable, qui revient en overlay au survol.
- **Mobile** : barre d'onglets en bas avec « Plus », qui ouvre le menu complet dans une feuille (D-003).

### Clavier et souris
- **La souris suffit**, et tout se fait aussi au clavier.
- **Raccourcis « Mod »** : ⌘ sur macOS, Ctrl sur Windows, avec un affichage propre à chaque système. Aucun conflit avec le navigateur.
- **Palette de commandes** : Mod+K (D-006).

### Réduction des clics (D-007)
1. **Actions au survol**, avec un équivalent tactile.
2. **Application immédiate** des réglages.
3. **Bonnes valeurs par défaut** et mémorisation des choix.
4. **Confirmation seulement pour l'irréversible**, sinon annulation possible.
