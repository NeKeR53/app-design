# Validation visuelle

À chaque fois qu'une décision de design doit être prise, produis une **page de validation** avant d'écrire du code.

## La page

- **Un seul fichier HTML autonome** : CSS et JS inline, aucune dépendance réseau, lisible sur ordinateur comme sur téléphone.
- **Les tokens en variables CSS**, pour que les bascules fonctionnent.
- **Un écran réaliste** : les options sont montrées dans un vrai contexte (AppShell avec sidebar, une liste, un formulaire), avec des données factices génériques, pas en pastilles isolées.
- **Les options côte à côte**, nommées A, B, C, chacune avec une ligne qui résume ce qui la distingue. Marque ta recommandation.
- **Une barre de bascules** : clair/sombre, web/desktop (densité), et les états pertinents (survol, focus, désactivé, chargement, erreur, vide, replié/déplié).
- **Les comportements jouables** : replier la sidebar, ouvrir le menu contextuel, naviguer au clavier. Ce qui ne peut pas être joué est décrit.
- **Un encart « Déjà décidé »** : les décisions qui s'appliquent ici.
- **Un encart « À décider »** : les questions ouvertes de l'étape, numérotées.
- **Un badge de statut** : `PROPOSITION` tant que rien n'est validé, `VALIDÉ le <date>` une fois validé.

## Le cycle

1. Écris la page dans `docs/validation/` : `NN-<sujet>.html` pendant l'init, `components/<X>-vN.html` ensuite.
2. Envoie-la à l'utilisateur, ou ouvre-la-lui comme page privée si l'outil le permet.
3. Pose la première question de l'encart « À décider ».
4. Mets la page à jour après chaque réponse (nouvelle version `-vN+1` si le changement est important) et renvoie-la.
5. Quand tout est tranché, passe le badge à `VALIDÉ`, écris les décisions, puis seulement code.

## Après le code

Une fois le composant codé, la référence devient **Storybook** : une story par état et par option, et une story de comportement avec une fonction `play` (test d'interaction) pour chaque règle de comportement de la spec. Lance Storybook en local et vérifie visuellement le rendu par rapport à la page validée. Signale tout écart avant de conclure.
