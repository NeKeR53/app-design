# Grille de questions

Chaque spec doit répondre à chaque question, ou noter « Sans objet » avec la raison.

1. **Rôle** : à quoi sert le composant, et quand ne pas l'utiliser (quel autre composant prendre à la place) ?
2. **Anatomie** : quelles parties, lesquelles sont obligatoires ou facultatives, dans quel ordre ?
3. **Variantes** : quelles variantes visuelles, et quand utiliser chacune ?
4. **Options** : quelles options facultatives (par exemple menu contextuel, badge, icône), leur valeur par défaut, et ce qui est explicitement exclu ?
5. **États** : par défaut, survol, focus, actif ou sélectionné, désactivé, chargement, erreur, vide. Lesquels existent et à quoi ressemblent-ils ?
6. **Comportement** : état initial, réaction à chaque interaction, persistance (aucune, session, entre deux ouvertures), animations et leur durée.
7. **Contenu** : texte trop long (tronqué avec infobulle, retour à la ligne), absence d'icône ou de libellé, valeurs extrêmes (0, très grand nombre), langues plus longues.
8. **Densité** : différences entre le thème web et le thème desktop.
9. **Clavier** : ordre de tabulation, touches (flèches, Entrée, Espace, Échap), raccourcis, gestion du focus à l'ouverture et à la fermeture.
10. **Accessibilité** : rôle et nom accessibles, annonces pour lecteur d'écran, contrastes, taille de cible minimale.
11. **Taille d'écran** : comportement en fenêtre étroite ou sur petit écran.
12. **Erreurs** : comment une erreur est montrée, où apparaît le message, comment on en sort.
13. **Niveau de réglage** : pour chaque option et règle de comportement, est-ce verrouillé, réglable par app (`DesignProvider`) ou réglable par page ?
14. **Placement** : dans quels gabarits et quelles zones le composant peut apparaître, avec quels voisins, et où il ne doit jamais apparaître.
15. **Composition** : quels composants il contient, et avec lesquels il ne se combine pas.
