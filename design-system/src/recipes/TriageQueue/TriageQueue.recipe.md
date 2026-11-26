# Recette : File de tri
Statut : validé (2026-11-26, par délégation de l'utilisateur) — Version : depuis 1.21.0 ; zones expliquées depuis 1.21.1
Décision : D-408. Stories : « Recettes/File de tri ». Captures : [clair](TriageQueue-clair.png), [sombre](TriageQueue-sombre.png).

![File de tri, mode clair](TriageQueue-clair.png)

## Quand la prendre
- Des éléments qui arrivent et qu'on traite un par un : demandes, messages, tickets, notes de frais à valider.
- Chaque élément se lit, reçoit une décision (traiter, répondre, reporter, assigner), puis quitte la file.
- Pas pour une collection qu'on consulte sans la vider : recette « Liste et fiche ».

## Zones
Une zone de l'écran, une responsabilité (D-404, D-417) : chaque zone ci-dessous dit ce qu'elle porte dans cette page, avec quel composant, quand la prendre et pourquoi.

| Zone | Sa responsabilité ici | Composant | Quand, pourquoi |
|---|---|---|---|
| Onglet fixe « À trier » | La file des éléments à traiter, de la plus urgente à la plus récente | `ListPage` `layout="list"`, `advanceOnRemove` | L'usage de tous les jours : trier. La file prend toute la page, avec sa recherche et ses filtres. |
| Onglet fixe « Traitées » | Les éléments déjà traités | `ListPage` | Un autre contexte : retrouver une décision, sans encombrer la file. |
| Panneau de droite | La vue détail de l'élément sélectionné : le message, les décisions de tri, l'historique replié | `Drawer` déclaratif | Ouvert pendant tout le tri : on lit et on décide à côté de la file. Après une décision, l'élément suivant s'y ouvre. |
| En-tête du panneau | Les décisions : « Traiter », « Répondre », les autres dans « … » | `header.actions` du `Drawer`, zone `section` | La décision porte sur l'élément ouvert : elle est en tête de son détail, pas dans la page. Libellés courts : le panneau est étroit. |
| Entrée de la sidebar, compteur | Le nombre d'éléments à trier | `count` de `Sidebar.Item` | Ce qui attend l'utilisateur se voit sans ouvrir la page. |
| Fenêtre | Un geste court : assigner, écrire une réponse | formulaire court en `Modal` | Elle passe devant le tri, puis le rend tel quel. |

## Actions
| Action | Où | Forme |
|---|---|---|
| Traiter | En-tête du panneau ; ligne de la file | Action `primary` de la zone `section` (bouton) ; icône de ligne |
| Répondre | En-tête du panneau | Icône |
| Reporter, autres décisions | En-tête du panneau | Dans « … » |
| Changer la priorité, le type | Ligne de la section « Tri » | Menu de choix (`action` de type `icon` avec `menu`) |
| Assigner | Ligne de la section « Tri » | Icône qui ouvre une saisie courte |

Libellés courts dans l'en-tête du panneau : « Traiter », pas « Marquer comme traitée » ; le panneau est étroit.

## États
| État | Rendu |
|---|---|
| File vide | `EmptyState` de `ListPage` : « Rien à trier », « Les nouvelles demandes arrivent ici. », sans action. Le panneau dit « Rien à trier. ». |
| Aucune sélection | `emptyMessage` du panneau : « Sélectionnez une demande pour la trier. » |
| Chargement, erreur | Rendus par `ListPage` et `Drawer` (`isLoading`, `hasError`, `onRetry`). |
| Élément traité | Il quitte « À trier » et passe dans « Traitées » ; le compteur de la sidebar baisse. |

## Comportement
- `advanceOnRemove` : l'élément traité quitte `rows` ; la sélection passe à celui qui le suivait à l'écran, ou au précédent s'il était le dernier (D-415). Le panneau montre aussitôt le suivant : on trie sans revenir à la liste.
- La priorité se lit d'un coup d'œil : statut de chaque ligne (`Badge`), avec le ton (`danger` pour haute).
- La date de réception est relative (« il y a 2 heures »).
- Les sections du panneau se replient ; l'historique est replié au départ (`defaultCollapsed`), son résumé dit combien d'événements.

## Squelette
```tsx
<ListPage title="À trier" rows={aTrier} columns={COLONNES} layout="list"
  item={{ title: "objet", subtitle: "demandeur", meta: "recue", status: "priorite" }}
  filters={[TYPE, PRIORITE]} selectedId={choisie} onSelect={(d) => choisir(d?.id ?? null)} advanceOnRemove
  empty={{ title: "Rien à trier", description: "Les nouvelles demandes arrivent ici." }} />

<Drawer header={{ title: d.objet, subtitle: `${type} · ${d.demandeur}`, status: PRIORITES[d.priorite],
  actions: [{ id: "traiter", label: "Traiter", icon: <Check />, primary: true, onPress: traiter }, repondre, reporter] }}
  sections={[{ id: "demande", title: "Demande", content: d.message }, { id: "tri", title: "Tri", fields: [...] },
    { id: "historique", title: "Historique", summary: "2 événements", defaultCollapsed: true, content: <List … /> }]} />
```

## À éviter
- Un bouton « Suivant » ou une sélection remise à zéro après chaque décision : `advanceOnRemove` le fait.
- Les décisions en gros boutons dans la page : elles vont dans l'en-tête du panneau.
- La file et l'élément côte à côte dans la page : l'élément va dans le panneau de détail (D-404).
- Des champs de saisie dans le panneau : une valeur se change par l'action de sa ligne.

## Décisions
D-021, D-059, D-111, D-113, D-183, D-404, D-408, D-415, D-417.
