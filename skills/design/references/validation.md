# Validation visuelle

À chaque fois qu'une décision de design doit être prise, produis une **page de validation** avant d'écrire du code.

Dès qu'il y a un changement à faire, même petit, il passe par une page : **ce qu'il y a actuellement, puis la proposition**, côte à côte, avec de quoi valider. La page ne s'arrête pas aux options : elle finit par un **avant / après** qui résume ce qui a été fait.

## La page

- **Un seul fichier HTML autonome** : CSS et JS inline, aucune dépendance réseau, lisible sur ordinateur comme sur téléphone.
- **Les tokens en variables CSS**, pour que les bascules fonctionnent.
- **Un écran réaliste** : les options sont montrées dans un vrai contexte (AppShell avec sidebar, une liste, un formulaire), avec des données factices génériques, pas en pastilles isolées.
- **Actuellement / Proposition** : en tête de page, l'écran tel qu'il est aujourd'hui (rendu de la version installée, ou capture de Storybook) à côté de l'écran proposé. Un changement sans option se valide là, d'un seul choix.
- **Les options côte à côte**, nommées A, B, C, chacune avec une ligne qui résume ce qui la distingue. Marque ta recommandation. S'il y a plusieurs questions, une rangée d'options par question, dans l'ordre où elles se valident.
- **De quoi valider, option par option** : sous chaque question, un bouton par option (« Valider A », « Valider B »…) et « Autre ». Le choix se voit sur la page (option cochée, écran mis à jour) et reste en mémoire locale du navigateur. Un bouton « Copier mes choix » donne un texte court à coller dans la conversation (`Q1 : A ; Q2 : B, avec …`).
- **Une barre de bascules** : clair/sombre, web/desktop (densité), et les états pertinents (survol, focus, désactivé, chargement, erreur, vide, replié/déplié).
- **Les comportements jouables** : replier la sidebar, ouvrir le menu contextuel, naviguer au clavier. Ce qui ne peut pas être joué est décrit.
- **Un encart « Déjà décidé »** : les décisions qui s'appliquent ici.
- **Un encart « À décider »** : les questions ouvertes de l'étape, numérotées.
- **Un badge de statut** : `PROPOSITION` tant que rien n'est validé, `VALIDÉ le <date>` une fois validé.
- **Une section « Avant / après »** en bas de page, remplie à la fin (voir « Après le code »).

## Le cycle

1. Écris la page dans `docs/validation/` : `NN-<sujet>.html` pendant l'init, `components/<X>-vN.html` ensuite.
2. Envoie-la à l'utilisateur, ou ouvre-la-lui comme page privée si l'outil le permet.
3. Pose la première question de l'encart « À décider » : on valide **option par option**, une question à la fois.
4. Mets la page à jour après chaque réponse : l'option retenue est cochée, l'écran « Proposition » la montre, les options écartées restent visibles et grisées (nouvelle version `-vN+1` si le changement est important). Renvoie-la.
5. Quand tout est tranché, passe le badge à `VALIDÉ`, écris les décisions, puis seulement code.

## Après le code

Une fois le composant codé, la référence devient **Storybook** : une story par état et par option, et une story de comportement avec une fonction `play` (test d'interaction) pour chaque règle de comportement de la spec. Lance Storybook en local et vérifie visuellement le rendu par rapport à la page validée. Signale tout écart avant de conclure.

### Avant / après (résumé de fin)

Avant de conclure, complète la section « Avant / après » de la page de validation : c'est le résumé de ce qui a été fait.

1. **Mêmes écrans, deux versions** : rends les mêmes écrans avec la version d'avant (le dernier tag, dans un `git worktree` à part) et avec la branche. Une story temporaire, non commitée, montre chaque cas avec les mêmes données. Lance les deux Storybook l'un après l'autre : ils partagent le cache de Vite.
2. **Captures** : une paire par changement, prise à la même taille de fenêtre, réduite (1400 px de large, JPEG) et intégrée à la page en `data:` pour qu'elle reste autonome. Ajoute une capture des états qui ne se voient qu'en interaction (menu ouvert, panneau agrandi).
3. **Pour chaque paire** : une ligne « Avant : … », une ligne « Après : … », et les décisions qui l'expliquent (`D-xxx`).
4. **Un tableau récapitulatif** : composant, ce qui change, nouvelle option ou changement de l'existant, décisions.
5. Renvoie la page, et reprends l'avant / après dans le résumé de la PR.
