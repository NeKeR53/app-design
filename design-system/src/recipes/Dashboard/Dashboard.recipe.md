# Recette : Tableau de bord
Statut : validé (2026-11-26, par délégation de l'utilisateur) — Version : depuis 1.21.0 ; zones expliquées depuis 1.21.1 ; UI d'abord, `Chart` et relecture depuis 1.27.0
Décision : D-407 ; D-427 (UI d'abord), D-428 (graphique). Stories : « Recettes/Tableau de bord ». Captures : [clair](Dashboard-clair.png), [sombre](Dashboard-sombre.png).

![Tableau de bord, mode clair](Dashboard-clair.png)

## Quand la prendre
- Une vue d'ensemble d'une activité : quelques chiffres clés, une évolution, ce qui demande une action.
- Tout tient sur un écran de bureau (1440 × 900), sans défiler.
- Pas pour une collection à parcourir : `ListPage`. Pas pour un rapport à lire : `DetailPage`.

## Zones
Une zone de l'écran, une responsabilité (D-404, D-417) : chaque zone ci-dessous dit ce qu'elle porte dans cette page, avec quel composant, quand la prendre et pourquoi.

| Zone | Sa responsabilité ici | Composant | Quand, pourquoi |
|---|---|---|---|
| Onglet fixe « Vue d'ensemble » | Suivre l'activité d'un coup d'œil | `Page` sur toute la largeur | L'usage « suivre » a son onglet ; les listes détaillées ont les leurs (« Commandes »). Jamais `width="text"`. |
| Barre d'outils de la page | La période et un filtre au plus, à gauche ; « Exporter », à droite | `Page` `toolbar` (`SegmentedControl` ou `Select`), `actions` zone `toolbar` | Ce réglage vaut pour toute la page : il est au-dessus d'elle, pas dans un bloc. Il s'applique tout de suite. |
| Contenu, rangée 1 | Les chiffres clés, quatre au plus, et leur tendance | `PageGrid columns={4}`, `Card variant="metric"` (`trend` facultatif) | Toujours en haut : c'est ce qu'on lit d'abord. Chaque carte mène à l'onglet qui détaille son chiffre. La petite courbe montre la tendance sans prendre un bloc ; toutes les cartes de la rangée en ont une, ou aucune. |
| Contenu, rangée 2 | L'évolution (graphique) et le détail (tableau), côte à côte | `PageGrid columns={2}`, `PageSection` ; `Chart` ; `Table density="compact"` | Côte à côte : on compare sans défiler. Une pile les mettrait sur deux écrans. |
| Contenu, rangée 3 (facultative) | Ce qui attend une action | `PageGrid columns={2}`, `PageSection`, `List` | Quand des éléments demandent un geste (une commande en retard, un stock bas). Sinon, pas de rangée. |
| Onglet fixe « Commandes » | La liste que résume un chiffre | `ListPage` | Quand l'utilisateur veut le détail : une carte y mène. La synthèse reste intacte dans son onglet. |
| Panneau de droite (facultatif) | La vue détail d'un élément choisi dans un tableau | `Drawer` déclaratif | Quand une ligne se choisit. Sinon, pas de panneau : la synthèse garde toute la largeur. |

Trois rangées au plus.

## Le graphique
`Chart` (D-428) : `type="bar"` pour comparer des quantités (par semaine, par canal), `type="line"` pour suivre une évolution longue ou plusieurs séries. Une série : `--chart-1`, pas de légende, le titre du bloc la nomme, étiquette directe sur la dernière valeur. Plusieurs séries : légende, `--chart-1` à `--chart-8` dans l'ordre. `label` résume le graphique et son mouvement (« Commandes par semaine, de 212 à 312 »). Un autre type de graphique est hors design.

## Actions
| Action | Où | Forme |
|---|---|---|
| Changer la période | Barre d'outils de `Page` | `SegmentedControl` (2 à 4 périodes), appliqué tout de suite |
| Exporter | Barre d'outils de `Page`, à droite | Icône |
| Ouvrir le détail d'un chiffre | Toute la carte | `Card` `onPress` : la vue qui liste ce que le chiffre compte |
| Voir tout | Titre de chaque section | Action `primary` de la zone `section` (bouton secondaire `sm`) |

Un chiffre sans action n'a pas sa place (D-361).

## États
| État | Rendu |
|---|---|
| Premier chargement | UI d'abord (D-427) : la barre d'outils, les libellés des cartes et les titres des blocs s'affichent tout de suite. Chaque carte attend sa valeur (`Card` `isLoading`), chaque bloc attend son contenu (`PageSection state="loading"`). Jamais `Page state="loading"`. |
| Relecture (nouvelle période, « Actualiser », relecture en fond) | Tout reste affiché : `Page isRefreshing` (barre de 2 px sous la barre d'outils), ou `isRefreshing` du seul bloc ou de la seule carte qui relit (D-426). |
| Échec de la page | `Page state="error"` et `onRetry` : seulement quand rien ne peut s'afficher (la période elle-même est illisible). Sinon, l'échec de chaque bloc. |
| Échec d'un bloc | `PageSection state="error"` et `onRetry` : les autres blocs restent. |
| Période sans données | Cartes à « 0 » ou « — », sans évolution ; sections en `empty` avec l'action qui élargit la période. |
| Chargement d'un bloc | `PageSection state="loading"` ; une carte : `Card` `isLoading`. |

## Comportement
- La période s'applique tout de suite ; elle est gardée par la page. Les anciens chiffres restent pendant la relecture (`isRefreshing`) : l'écran ne clignote pas.
- Une carte mène à la vue qui liste ce qu'elle compte, filtrée (onglet de la barre du haut).
- Les blocs d'une rangée ont la même hauteur ; sous 1032 px de large, quatre cartes passent sur deux lignes de deux (`PageGrid`, D-403).

## Squelette
```tsx
<Page toolbar={<SegmentedControl label="Période" options={PERIODES} value={periode} onChange={setPeriode} />}
  actions={[{ id: "exporter", label: "Exporter", icon: <Download />, onPress: exporter }]}
  isRefreshing={relecture}>
  {/* UI d'abord : chaque carte et chaque bloc attendent à leur place (D-427). */}
  <PageGrid columns={4}>
    <Card variant="metric" label="Commandes" value={commandes && <FormattedValue value={commandes.total} type="number" />}
      isLoading={commandes === undefined} delta={{ text: "+12 % sur 30 jours", tone: "positive" }}
      trend={commandes?.parSemaine} trendLabel="Commandes sur 12 semaines, de 212 à 312" onPress={() => ouvrir("commandes")} />
    {/* trois autres cartes */}
  </PageGrid>
  <PageGrid columns={2}>
    <PageSection title="Commandes par semaine" description="Les 12 dernières semaines." state={commandes ? "ready" : "loading"}>
      <Chart type="bar" label="Commandes par semaine, de 212 à 312" categories={SEMAINES}
        series={[{ id: "commandes", label: "Commandes", values: commandes?.parSemaine ?? [] }]} />
    </PageSection>
    <PageSection title="Meilleures ventes" actions={[voirTout]} state={ventes ? "ready" : "loading"}><Table density="compact" … /></PageSection>
  </PageGrid>
  <PageGrid columns={2}>
    <PageSection title="Commandes en attente"><List … /></PageSection>
    <PageSection title="Stock bas"><List … /></PageSection>
  </PageGrid>
</Page>
```

## À éviter
- Une pile de sections dans une colonne de 760 px (D-404).
- Plus de quatre chiffres clés, ou un mur de cartes identiques.
- Un chiffre sans action, une carte décorative.
- Deux axes sur un même graphique ; une couleur d'état pour une série ; une librairie de graphiques à côté de `Chart`.
- `Page state="loading"` au premier chargement : la page entière disparaît derrière des squelettes (D-427).
- « … » ou « 0 » à la place d'une valeur pas encore lue : `Card` `isLoading`.
- Une recherche ou des filtres de liste dans la barre d'outils : la liste a sa vue.

## Décisions
D-021, D-111, D-213, D-216, D-361, D-403, D-404, D-407, D-417, D-426, D-427, D-428.
