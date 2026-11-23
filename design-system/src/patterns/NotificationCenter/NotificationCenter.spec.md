# NotificationCenter
Statut : validé (2026-11-23, par délégation de l'utilisateur) — Version : depuis 0.2.0
Validation : docs/validation/components/Notifications-v1.html

## Rôle
Historique des notifications de l'app, ouvert depuis une cloche dans la barre du haut, avec le nombre de non-lus. Il lit la file créée par `createNotifications()` et passée à `SocleProvider` ; chaque `notify()` y ajoute une ligne, sauf `history: false` (D-156).
Ne pas l'utiliser pour :
- une liste d'éléments métier (tâches, messages) : prendre `List` dans une page ;
- un message éphémère : c'est le rôle du toast (`Toast`).

## Anatomie
1. Cloche (obligatoire) : `IconButton` avec l'icône cloche interne.
2. Compteur (facultatif) : pastille sur la cloche, visible s'il y a des non-lus (D-157).
3. Panneau (à l'ouverture) :
   1. en-tête : titre « Notifications », bouton « Tout effacer » (s'il y a des lignes) ;
   2. groupes par jour : « Aujourd'hui », « Hier », puis la date (D-158) ;
   3. lignes : icône du ton, titre, texte (facultatif), « heure · source », point de non-lu, × « Retirer » ;
   4. état vide : icône, « Aucune notification ».

## Variantes
Aucune variante.

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| — | — | — | Le composant n'a pas d'option : il lit la file du `SocleProvider`. |

Options de la file `createNotifications(options)` :

| Option | Type | Défaut | Description |
|---|---|---|---|
| `initial` | `NotificationRecord[]` | `[]` | Notifications restaurées au démarrage (D-158). |
| `onChange` | `(items: NotificationRecord[]) => void` | aucun | Appelé à chaque changement, pour persister (D-158). |

Une ligne peut s'ouvrir si sa notification a `onOpen` (D-156) : un clic ou Entrée appelle `onOpen` et ferme le panneau.

## Exclus
- L'action d'un toast (« Annuler ») n'est pas reprise dans le centre (D-156).
- Pas de filtre ni de recherche dans le centre.
- Pas de marquage « lu / non lu » ligne par ligne : ouvrir le centre marque tout comme lu (D-157).
- Pas de `className` ni de `style`. Pas de placement hors de la barre du haut.

## États
- Cloche : sans non-lu, avec non-lus (pastille), panneau ouvert (fond de survol).
- Panneau : vide, avec lignes ; ligne au survol ou au focus (× visible).

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| La pastille montre le nombre de non-lus, « 9+ » au-delà de 9 ; elle disparaît à 0 (D-157) | verrouillé | `Compteur` |
| Un clic sur la cloche ouvre le panneau ancré ; un nouveau clic, Échap ou un clic dehors le ferme (D-157) | verrouillé | `Ouverture` |
| L'ouverture marque tout comme lu ; les points restent jusqu'à la fermeture (D-157) | verrouillé | `Ouverture` |
| Lignes groupées par jour, la plus récente en haut (D-158) | verrouillé | `Groupes` |
| × retire la ligne ; « Tout effacer » vide la liste et montre l'état vide (D-158) | verrouillé | `Effacer` |
| La file garde 100 notifications au plus ; `onChange` reçoit la liste à chaque changement (D-158) | réglable par app (`initial`, `onChange`) | `Persistance` |
| Une ligne avec `onOpen` s'ouvre au clic ou avec Entrée et ferme le panneau (D-156) | réglable par appel | `Ouvrir` |

## Contenu
- Titre et texte passent à la ligne ; le texte garde ses retours à la ligne.
- Source absente : seule l'heure s'affiche.
- Panneau : 380 px de large, hauteur limitée à la fenêtre moins 56 px ; la liste défile.

## Densité
Texte `--fs-md` (titre), `--fs-sm` (texte), `--fs-xs` (méta, groupes). La cloche suit `--icon-btn` (D-035).

## Clavier
- Tab atteint la cloche ; Entrée ou Espace ouvre le panneau, et le focus va à la première ligne.
- Flèches haut et bas parcourent les lignes ; Tab atteint le × de la ligne puis « Tout effacer ».
- Échap ferme le panneau et rend le focus à la cloche.

## Accessibilité
- Cloche : nom « Notifications », ou « Notifications, 3 non lues » ; `aria-expanded`.
- Panneau : rôle `dialog`, nommé « Notifications ».
- Liste : rôle `grid` (React Aria `GridList`) ; chaque ligne est nommée par son titre ; le ton et « non lue » sont annoncés.
- Pastille : `--accent-fg` sur `--accent`, contraste AA.

## Taille d'écran
Sur mobile (≤ 640 px), le panneau occupe tout l'écran, avec un bouton « Fermer » dans l'en-tête (D-157).

## Erreurs
Sans objet : le centre affiche des notifications ; il n'en produit pas.

## Niveau de réglage
Tout est verrouillé, sauf la persistance (par app) et `onOpen` (par appel).

## Placement
Dans les `actions` de la barre du haut d'`AppShell`, une seule fois par fenêtre, en général juste avant le bouton du panneau de détail. Jamais dans la sidebar ni dans une page.

## Composition
Contient `IconButton`, `Button` (« Tout effacer »), les icônes internes (D-028) et un `Popover` React Aria. Partage la file avec `Toast`.

## Décisions
D-028, D-035, D-040, D-044, D-089, D-152, D-156, D-157, D-158, D-159

## Questions ouvertes
Aucune.
