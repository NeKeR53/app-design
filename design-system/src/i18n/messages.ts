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
  detailLoadErrorTitle: string;
  detailLoadErrorText: string;
  detailNotUpdated: string;
  detailNotFoundTitle: string;
  detailNotFoundText: string;
  detailSectionEmpty: string;
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
  /* Button, IconButton et squelettes : un seul libellé d'attente */
  loading: string;
  /* Petits éléments d'affichage (D-160 à D-169) */
  codeSample: string;
  progressOf: (value: string, max: string) => string;
  /* ActionBar */
  moreActions: string;
  confirmQuestion: (label: string) => string;
  /* Notifications (Toast, NotificationCenter) */
  notifications: string;
  notificationsUnread: (n: number) => string;
  closeNotification: string;
  removeNotification: string;
  noNotifications: string;
  unreadNotification: string;
  noNotificationsHint: string;
  today: string;
  yesterday: string;
  toneSuccess: string;
  toneInfo: string;
  toneWarning: string;
  toneDanger: string;
  closeNotificationCenter: string;
  /* Dialog et confirmation */
  close: string;
  cancel: string;
  actionFailed: string;
  /* Champs de formulaire (D-022, D-132) */
  optional: string;
  requiredField: string;
  requiredChoice: string;
  requiredCheckbox: string;
  requiredGroup: string;
  invalidEmail: string;
  invalidUrl: string;
  invalidValue: string;
  choose: string;
  charCount: (n: number, max: number) => string;
  /* ComboBox */
  showChoices: string;
  chosenItems: (label: string) => string;
  removeItem: (label: string) => string;
  addValue: (text: string) => string;
  typeMoreChars: (n: number) => string;
  resultsUnavailable: string;
  noResults: string;
  /* Valeurs typées (D-170, D-171) */
  locale: string;
  yes: string;
  no: string;
  justNow: string;
  emptyValue: string;
  /* ListPage (D-173 à D-178) */
  itemCount: (n: string) => string;
  rangeOf: (first: string, last: string, total: string) => string;
  shownOf: (n: string, total: string) => string;
  pagination: string;
  previousPage: string;
  nextPage: string;
  selectedCount: (n: string) => string;
  clearSelection: string;
  /* Formulaires déclaratifs : FormPage, useOpenForm (D-190 à D-198) */
  unsavedChanges: string;
  saving: string;
  saved: string;
  saveFailed: string;
  fixErrors: string;
  discardTitle: string;
  discardMessage: string;
  discard: string;
  invalidNumber: string;
  numberTooSmall: (min: number) => string;
  numberTooLarge: (max: number) => string;
  /* SettingsPage */
  settingsSections: string;
  /** Ce que cherche la recherche des réglages : « Rechercher dans {…} ». */
  settingsSearchScope: string;
  noSettingsFound: string;
  backToSections: string;
  settingNotSaved: string;
  settingsLoadError: string;
  settingsLoadErrorText: string;
  loadingSettings: string;
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
  detailLoadErrorTitle: "Impossible de charger le détail",
  detailLoadErrorText: "Le service ne répond pas.",
  detailNotUpdated: "Le détail n'a pas pu être mis à jour.",
  detailNotFoundTitle: "Élément introuvable",
  detailNotFoundText: "Il a peut-être été supprimé.",
  detailSectionEmpty: "Aucune information",
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
  loading: "Chargement…",
  codeSample: "Extrait de code",
  progressOf: (v, max) => `${v} sur ${max}`,
  moreActions: "Plus d'actions",
  confirmQuestion: (l) => `${l} ?`,
  notifications: "Notifications",
  notificationsUnread: (n) => `Notifications, ${n} non lue${s(n)}`,
  closeNotification: "Fermer la notification",
  removeNotification: "Retirer la notification",
  noNotifications: "Aucune notification",
  unreadNotification: "non lue",
  noNotificationsHint: "Les événements de l'app apparaîtront ici.",
  today: "Aujourd'hui",
  yesterday: "Hier",
  toneSuccess: "Succès",
  toneInfo: "Information",
  toneWarning: "Alerte",
  toneDanger: "Erreur",
  closeNotificationCenter: "Fermer les notifications",
  close: "Fermer",
  cancel: "Annuler",
  actionFailed: "L'action a échoué. Réessayez.",
  optional: "(facultatif)",
  requiredField: "Ce champ est obligatoire.",
  requiredChoice: "Choisissez une option.",
  requiredCheckbox: "Cochez cette case pour continuer.",
  requiredGroup: "Cochez au moins une case.",
  invalidEmail: "Saisissez une adresse de la forme nom@domaine.fr.",
  invalidUrl: "Saisissez une adresse web complète, qui commence par https://.",
  invalidValue: "Vérifiez cette valeur.",
  choose: "Choisir…",
  charCount: (n, max) => `${n} / ${max}`,

  showChoices: "Afficher les choix",
  chosenItems: (l) => `${l} choisis`,
  removeItem: (l) => `Retirer ${l}`,
  addValue: (t) => `Ajouter « ${t} »`,
  typeMoreChars: (n) => `Tapez au moins ${n} caractères.`,
  resultsUnavailable: "Résultats indisponibles",
  noResults: "Aucun résultat",

  locale: "fr-FR",
  yes: "Oui",
  no: "Non",
  justNow: "à l'instant",
  emptyValue: "vide",

  itemCount: (n) => `${n} élément${n === "0" || n === "1" ? "" : "s"}`,
  rangeOf: (a, b, t) => `${a}–${b} sur ${t}`,
  shownOf: (n, t) => `${n} sur ${t}`,
  pagination: "Pagination",
  previousPage: "Page précédente",
  nextPage: "Page suivante",
  selectedCount: (n) => `${n} sélectionné${n === "1" ? "" : "s"}`,
  clearSelection: "Tout désélectionner",
  unsavedChanges: "Modifications non enregistrées",
  saving: "Enregistrement…",
  saved: "Enregistré",
  saveFailed: "L'enregistrement a échoué. Réessayez.",
  fixErrors: "Corrigez les champs signalés.",
  discardTitle: "Abandonner les modifications ?",
  discardMessage: "Les modifications non enregistrées seront perdues.",
  discard: "Abandonner",
  invalidNumber: "Saisissez un nombre.",
  numberTooSmall: (min) => `Saisissez un nombre supérieur ou égal à ${min}.`,
  numberTooLarge: (max) => `Saisissez un nombre inférieur ou égal à ${max}.`,
  settingsSections: "Rubriques des réglages",
  settingsSearchScope: "les réglages",
  noSettingsFound: "Aucune rubrique trouvée.",
  backToSections: "Retour aux rubriques",
  settingNotSaved: "Le réglage n'a pas été enregistré.",
  settingsLoadError: "Impossible de charger ces réglages",
  settingsLoadErrorText: "Le service ne répond pas. Réessayez dans un instant.",
  loadingSettings: "Chargement des réglages",
};
