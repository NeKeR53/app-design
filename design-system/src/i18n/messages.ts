/**
 * Libellés internes de Socle (D-089), en français par défaut.
 * Une app les remplace, en tout ou en partie, par l'option `messages` de SocleProvider.
 */
export interface SocleMessages {
  /* Raccourcis, hors macOS (D-006) */
  keyShift: string;
  keyBackspace: string;
  keyDelete: string;
  keyEnter: string;
  /* AppShell */
  expandSidebar: string;
  collapseSidebar: string;
  back: string;
  forward: string;
  detailPanel: string;
  detail: string;
  closeDetail: string;
  detailWidth: string;
  more: string;
  /* Sidebar */
  mainNavigation: string;
  expandItem: (label: string) => string;
  collapseItem: (label: string) => string;
  childCount: (n: number) => string;
  unreadCount: (n: number) => string;
  unread: string;
  toDo: string;
  showMoreCount: (n: number) => string;
  showLess: string;
  actionsOn: (title: string) => string;
  account: string;
  settings: string;
  opensInBrowser: string;
  readOnly: string;
  activity: string;
  /* Tabs */
  viewsOf: (page: string) => string;
  closeView: (label: string) => string;
  allViews: string;
  currentView: (label: string) => string;
  /* DetailPanel */
  detailEmpty: string;
  /* Table et List */
  selectAll: string;
  columnWidth: (label: string) => string;
  rowActions: string;
  showMore: string;
  countOf: (n: number, total: number) => string;
  loadingResults: string;
  retry: string;
  notUpdated: string;
  loadErrorTitle: string;
  loadErrorText: string;
  noResultsFor: string;
  noResultsHint: string;
  clearSearch: string;
  /* SearchField */
  searchIn: (label: string) => string;
  searchCriteria: string;
  removeCriterion: (label: string) => string;
  moreCriteria: (n: number) => string;
  searching: string;
  searchingRow: string;
  suggestions: string;
  searchFor: (text: string) => string;
  elements: string;
  suggestionsUnavailable: string;
  noElements: string;
  clearAll: string;
  /* Button et IconButton */
  loading: string;
}

const s = (n: number) => (n > 1 ? "s" : "");

export const frenchMessages: SocleMessages = {
  keyShift: "Maj",
  keyBackspace: "Retour arrière",
  keyDelete: "Suppr",
  keyEnter: "Entrée",
  expandSidebar: "Déplier la sidebar",
  collapseSidebar: "Replier la sidebar",
  back: "Précédent",
  forward: "Suivant",
  detailPanel: "Panneau de détail",
  detail: "Détail",
  closeDetail: "Fermer le détail",
  detailWidth: "Largeur du panneau de détail",
  more: "Plus",
  mainNavigation: "Navigation principale",
  expandItem: (l) => `Déplier ${l}`,
  collapseItem: (l) => `Replier ${l}`,
  childCount: (n) => `${n} élément${s(n)}`,
  unreadCount: (n) => `${n} non lu${s(n)}`,
  unread: "Non lu",
  toDo: "À traiter",
  showMoreCount: (n) => `Afficher plus (${n})`,
  showLess: "Afficher moins",
  actionsOn: (t) => `Actions sur ${t}`,
  account: "Compte",
  settings: "Réglages",
  opensInBrowser: "S'ouvre dans le navigateur",
  readOnly: "Lecture seule",
  activity: "Activité en cours",
  viewsOf: (p) => `Vues de la page ${p}`,
  closeView: (l) => `Fermer la vue ${l}`,
  allViews: "Toutes les vues",
  currentView: (l) => `Vue : ${l}`,
  detailEmpty: "Sélectionnez un élément pour voir son détail.",
  selectAll: "Tout sélectionner",
  columnWidth: (l) => `Largeur de la colonne ${l}`,
  rowActions: "Actions",
  showMore: "Afficher plus",
  countOf: (n, t) => `${n} sur ${t}`,
  loadingResults: "Chargement des résultats",
  retry: "Réessayer",
  notUpdated: "Résultats non mis à jour : le service ne répond pas.",
  loadErrorTitle: "Impossible de charger les résultats",
  loadErrorText: "Le service ne répond pas. Vos critères sont gardés.",
  noResultsFor: "Aucun résultat pour",
  noResultsHint: "Vérifiez l'orthographe ou retirez un critère.",
  clearSearch: "Effacer la recherche",
  searchIn: (l) => `Rechercher dans ${l}`,
  searchCriteria: "Critères de recherche",
  removeCriterion: (l) => `Retirer ${l}`,
  moreCriteria: (n) => `Afficher les ${n} autres critères`,
  searching: "Recherche en cours",
  searchingRow: "Recherche…",
  suggestions: "Suggestions",
  searchFor: (t) => `Rechercher « ${t} »`,
  elements: "Éléments",
  suggestionsUnavailable: "Suggestions indisponibles",
  noElements: "Aucun élément trouvé",
  clearAll: "Tout effacer",
  loading: "Chargement",
};
