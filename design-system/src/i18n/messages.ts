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
  /* Terminal (D-282 à D-284) */
  terminalDescription: string;
  terminalReadOnlyDescription: string;
  terminalOpening: string;
  terminalConnecting: string;
  terminalOpen: string;
  terminalClosed: (reason?: string) => string;
  terminalError: (reason?: string) => string;
  terminalUnavailable: (reason: string) => string;
  terminalLeave: string;
  terminalSize: string;
  terminalReadOnly: string;
  selectionCopied: string;
  copyFailed: string;
  /* LogViewer (D-285 à D-289) */
  logTools: string;
  logLevel: (level: string) => string;
  levelAll: string;
  levelWarning: string;
  levelError: string;
  levelAllLines: string;
  levelWarnings: string;
  levelErrors: string;
  logSearch: string;
  matchOf: (index: number, total: number) => string;
  noMatchingLine: string;
  previousMatch: string;
  nextMatch: string;
  followEnd: string;
  wrapLines: string;
  showTimestamps: string;
  errorList: string;
  copyLog: string;
  copySelection: string;
  copied: string;
  lineCount: (n: number) => string;
  droppedLines: (n: number) => string;
  errorCount: (n: number) => string;
  warningCount: (n: number) => string;
  logLive: string;
  logEnded: string;
  followPaused: (newLines: number) => string;
  backToEnd: string;
  loadingLog: string;
  waitingLines: string;
  emptyLog: string;
  noLineAtLevel: string;
  logErrors: string;
  errorsTitle: (n: number) => string;
  lineNumber: (n: number) => string;
  noErrors: string;
  errorListLimit: (n: number) => string;
  lineCut: string;
}

const s = (n: number) => (n > 1 ? "s" : "");
const num = (n: number) => n.toLocaleString("fr-FR");

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

  terminalDescription: "Terminal interactif : la saisie est envoyée au programme. Ctrl+Maj+C copie, Ctrl+V colle, F6 pour en sortir.",
  terminalReadOnlyDescription: "Terminal en lecture seule. F6 pour en sortir.",
  terminalOpening: "Ouverture du terminal…",
  terminalConnecting: "Connexion…",
  terminalOpen: "Connecté",
  terminalClosed: (r) => (r ? `Session terminée : ${r}` : "Session terminée"),
  terminalError: (r) => (r ? `Connexion interrompue : ${r}` : "Connexion interrompue"),
  terminalUnavailable: (r) => `Terminal indisponible : ${r}`,
  terminalLeave: "F6 pour sortir",
  terminalSize: "Taille",
  terminalReadOnly: "Lecture seule",
  selectionCopied: "Sélection copiée",
  copyFailed: "Copie impossible",

  logTools: "Outils du journal",
  logLevel: (l) => `Niveau : ${l}`,
  levelAll: "Tous",
  levelWarning: "Alertes",
  levelError: "Erreurs",
  levelAllLines: "Toutes les lignes",
  levelWarnings: "Alertes et erreurs",
  levelErrors: "Erreurs",
  logSearch: "le journal",
  matchOf: (i, n) => `${num(i)} sur ${num(n)}`,
  noMatchingLine: "Aucune ligne",
  previousMatch: "Résultat précédent",
  nextMatch: "Résultat suivant",
  followEnd: "Suivre la fin",
  wrapLines: "Retour à la ligne",
  showTimestamps: "Horodatage",
  errorList: "Liste des erreurs",
  copyLog: "Copier le journal",
  copySelection: "Copier la sélection",
  copied: "Copié",
  lineCount: (n) => `${num(n)} ligne${s(n)}`,
  droppedLines: (n) => `${num(n)} plus ancienne${s(n)} oubliée${s(n)}`,
  errorCount: (n) => `${num(n)} erreur${s(n)}`,
  warningCount: (n) => `${num(n)} alerte${s(n)}`,
  logLive: "En direct",
  logEnded: "Terminé",
  followPaused: (n) => (n ? `Suivi en pause · ${num(n)} nouvelle${s(n)} ligne${s(n)}` : "Suivi en pause"),
  backToEnd: "Revenir à la fin",
  loadingLog: "Chargement du journal…",
  waitingLines: "En attente des premières lignes…",
  emptyLog: "Journal vide",
  noLineAtLevel: "Aucune ligne de ce niveau.",
  logErrors: "Erreurs du journal",
  errorsTitle: (n) => `Erreurs · ${num(n)}`,
  lineNumber: (n) => `Ligne ${num(n)}`,
  noErrors: "Aucune erreur relevée dans ce journal.",
  errorListLimit: (n) => `Seules les ${num(n)} premières erreurs sont listées.`,
  lineCut: " … ligne coupée à l'affichage",
};
