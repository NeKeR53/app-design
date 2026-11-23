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
  expandDetail: string;
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
  footerNavigation: string;
  workspaces: string;
  workspaceLabel: string;
  workspaceSwitch: (name: string) => string;
  settings: string;
  opensInBrowser: string;
  readOnly: string;
  activity: string;
  /* Tabs */
  viewsOf: (page: string) => string;
  closeView: (label: string) => string;
  allViews: string;
  currentView: (label: string) => string;
  /* Drawer */
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
  /** Nom d'une action de ligne : « Archiver Rapport trimestriel » (Table.spec.md). */
  rowAction: (action: string, row: string) => string;
  /** Nom du bouton « … » d'une ligne. */
  moreActionsFor: (row: string) => string;
  groupCount: (n: number) => string;
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
  /* SearchInput */
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
  /* Gabarits DetailPage et Page */
  backTo: (label: string) => string;
  pageLoadErrorTitle: string;
  pageLoadErrorText: string;
  sectionLoadError: string;
  notFoundTitle: string;
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
  /* Modal et confirmation */
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
  /* Message d'un champ obligatoire vide, construit à partir du libellé (D-344) */
  requiredText: (label: string) => string;
  requiredPick: (label: string) => string;
  requiredTick: (label: string) => string;
  /* Limite de caractères dépassable (D-343) */
  charsOver: (n: number) => string;
  charsLeft: (n: number) => string;
  tooLong: (max: number) => string;
  /* Récapitulatif des erreurs de FormPage (D-341) */
  errorSummary: (n: number) => string;
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
  /* TreeView (D-266 à D-268) */
  childrenLoadFailed: string;
  noItems: string;
  /** Bouton chevron d'un nœud ; React Aria y ajoute le libellé du nœud. */
  expand: string;
  collapse: string;
  moveItem: (label: string) => string;
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
  /* DiffView (D-290 à D-299) */
  diffToolbar: string;
  diffSideBySide: string;
  diffShowUnchanged: string;
  diffPrevious: string;
  diffNext: string;
  diffKeysHint: string;
  diffAddedLine: string;
  diffRemovedLine: string;
  diffStat: (added: number, removed: number) => string;
  diffChanges: (n: number) => string;
  diffNone: string;
  diffNoneText: string;
  diffBinary: string;
  diffBinaryNotice: string;
  diffEolNotice: (from: string, to: string) => string;
  diffNoEol: string;
  diffTruncated: string;
  diffUnchanged: (n: number) => string;
  diffShowLines: (n: number) => string;
  diffUnchangedFrom: (n: number, line: number) => string;
  diffChangeAt: (index: number, total: number, before?: string, after?: string) => string;
  diffLines: (from: number, to: number) => string;
  diffFile: string;
  diffFileAdded: string;
  diffFileDeleted: string;
  diffFileRenamed: string;
  /* DocumentViewer et HtmlContent (D-310 à D-319) */
  documentToolbar: string;
  pageOf: (n: number, total: number) => string;
  pageNumber: (n: number) => string;
  documentPages: (label: string, n: number) => string;
  zoomIn: string;
  zoomOut: string;
  fitWidth: string;
  zoomPercent: (n: number) => string;
  download: string;
  readingDocument: string;
  documentUnreadable: string;
  documentReadFailed: string;
  pdfPassword: string;
  pdfInvalid: string;
  pdfUnavailable: string;
  unsupportedFormat: string;
  unsupportedFormatText: (kind: string) => string;
  unknownFormat: string;
  imagesHidden: (n: number) => string;
  showImages: string;
  /* InlineEdit, ProgressIndicator (D-323, D-325) */
  editValue: (label: string) => string;
  stepDone: string;
  stepError: string;
  /* Markdown et MarkdownEditor (D-303 à D-309) */
  copyBlock: string;
  blockCopied: string;
  table: string;
  taskDone: string;
  taskTodo: string;
  image: string;
  formatting: string;
  heading: (level: number) => string;
  bold: string;
  italic: string;
  inlineCode: string;
  link: string;
  bulletList: string;
  orderedList: string;
  quote: string;
  preview: string;
  nothingToPreview: string;
  imageUploading: (name: string) => string;
  imageNotAdded: (name: string) => string;
  linkTextPlaceholder: string;
  linkUrlPlaceholder: string;
  /* LoginPage (D-339) */
  loginTitle: string;
  loginIdentifier: string;
  loginPassword: string;
  loginShowPassword: string;
  loginRemember: string;
  loginForgot: string;
  loginSubmit: string;
  loginOr: string;
  loginFailed: string;
  loginIdentifierMissing: string;
  loginPasswordMissing: string;
  loginProviders: string;
  /* Tableau, onglets, zones, accès refusé (D-345 à D-351) */
  selectAllMatching: (n: string) => string;
  allSelectedCount: (n: string) => string;
  clearAllSelection: string;
  columns: string;
  rowsPerPage: string;
  pageOfPages: (page: string, pages: string) => string;
  modified: string;
  skipToContent: string;
  forbiddenList: string;
  forbiddenItem: string;
  forbiddenText: string;
  requestAccess: string;
  /* DatePicker, DateRangePicker (Nouveaux P1, D1 à D4) */
  openCalendar: string;
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  /** Titre du calendrier, bouton qui ouvre le choix du mois : « novembre 2026, choisir le mois et l'année ». */
  pickMonthYear: (current: string) => string;
  /** Titre de la vue des mois, bouton qui revient aux jours : « 2026, revenir aux jours ». */
  backToDays: (year: string) => string;
  datePresets: string;
  dateTooEarly: (min: string) => string;
  dateTooLate: (max: string) => string;
  dateUnavailable: string;
  dateRangeReversed: string;
  /* NumberField (Nouveaux P1, N1 à N3) */
  increase: string;
  decrease: string;
  numberRange: (min: string, max: string) => string;
  numberMin: (min: string) => string;
  numberMax: (max: string) => string;
  numberStep: (step: string) => string;
  /* Alert (Nouveaux P1, A1 à A3) */
  closeAlert: string;
  /* FileUpload, FileList (Nouveaux P2-P3, F1 à F3) */
  /** Début de la phrase de la zone, avant le bouton : « Déposez des fichiers ici ou ». */
  fileDropHere: (multiple: boolean) => string;
  /** Bouton de la zone : « choisir des fichiers ». */
  fileChoose: (multiple: boolean) => string;
  /** Aide de la zone : « PDF ou image, 10 Mo au plus ». */
  fileHint: (types: string | undefined, maxSize: string | undefined) => string;
  /** Famille de types dans l'aide : `image/*` → « image ». */
  fileKind: (kind: "image" | "video" | "audio" | "text") => string;
  fileTypeRejected: (type: string) => string;
  fileTooLarge: (size: string, maxSize: string) => string;
  fileOnlyOne: string;
  fileList: string;
  filesRejected: string;
  fileStatusPending: string;
  fileStatusUploading: (percent: string | undefined) => string;
  fileStatusDone: string;
  fileStatusError: string;
  fileUploadingName: (name: string) => string;
  fileAnnounce: (name: string, status: string) => string;
  retryFile: (name: string) => string;
  /* Card (Nouveaux P2-P3, C1) : ton d'une évolution, lu après le texte. */
  cardDeltaTone: (tone: "positive" | "negative") => string;
}

const s = (n: number) => (n > 1 ? "s" : "");
const num = (n: number) => n.toLocaleString("fr-FR");
/** Libellé dans une phrase : initiale en minuscule, sauf sigle (« URL du site » reste tel quel). */
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
  expandDetail: "Agrandir le panneau de détail",
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
  footerNavigation: "Navigation du bas",
  workspaces: "Espaces de travail",
  workspaceLabel: "Espace de travail :",
  workspaceSwitch: (name) => `Espace de travail : ${name}. Changer d'espace`,
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
  rowAction: (a, r) => `${a} ${r}`,
  moreActionsFor: (r) => `Plus d'actions pour ${r}`,
  groupCount: (n) => `${n} ligne${n > 1 ? "s" : ""}`,
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
  backTo: (l) => `Retour à ${l}`,
  pageLoadErrorTitle: "Impossible de charger la page",
  pageLoadErrorText: "Le service ne répond pas. Réessayez dans un instant.",
  sectionLoadError: "Impossible de charger cette partie",
  notFoundTitle: "Élément introuvable",
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
  requiredText: (l) => `Renseignez « ${l} ».`,
  requiredPick: (l) => `Choisissez une valeur pour « ${l} ».`,
  requiredTick: (l) => `Cochez « ${l} ».`,
  charsOver: (n) => `${num(n)} caractère${s(n)} en trop`,
  charsLeft: (n) => `${num(n)} caractère${s(n)} restant${s(n)}`,
  tooLong: (max) => `Saisissez ${num(max)} caractère${s(max)} au plus.`,
  errorSummary: (n) => `${n} erreur${s(n)} à corriger`,

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
  childrenLoadFailed: "Impossible de charger",
  noItems: "Aucun élément",
  expand: "Déplier",
  collapse: "Replier",
  moveItem: (l) => `Déplacer ${l}`,
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
  diffToolbar: "Affichage des différences",
  diffSideBySide: "Côte à côte",
  diffShowUnchanged: "Afficher les lignes inchangées",
  diffPrevious: "Changement précédent",
  diffNext: "Changement suivant",
  diffKeysHint: "F7 ou Alt+Flèche bas : changement suivant ; Maj+F7 ou Alt+Flèche haut : changement précédent.",
  diffAddedLine: "Ajoutée : ",
  diffRemovedLine: "Retirée : ",
  diffStat: (a, r) => `${a} ligne${s(a)} ajoutée${s(a)}, ${r} retirée${s(r)}`,
  diffChanges: (n) => `${n} changement${s(n)}`,
  diffNone: "Aucune différence",
  diffNoneText: "Les deux versions sont identiques.",
  diffBinary: "Fichier binaire",
  diffBinaryNotice: "Fichier binaire : contenu non comparé",
  diffEolNotice: (from, to) => `Fins de ligne converties : ${from} → ${to}`,
  diffNoEol: "sans fin de ligne",
  diffTruncated: "Diff coupé : la suite n'est pas affichée",
  diffUnchanged: (n) => `${n} ligne${s(n)} inchangée${s(n)}`,
  diffShowLines: (n) => `Afficher ${n} ligne${s(n)}`,
  diffUnchangedFrom: (n, line) => `${n} ligne${s(n)} inchangée${s(n)}, à partir de la ligne ${line}`,
  diffChangeAt: (i, total, before, after) =>
    `Changement ${i} sur ${total}` + [before ? ` : avant, ${before}` : "", after ? `${before ? " ;" : " :"} après, ${after}` : ""].join(""),
  diffLines: (from, to) => (from === to ? `ligne ${from}` : `lignes ${from} à ${to}`),
  diffFile: "Fichier",
  diffFileAdded: "Ajouté",
  diffFileDeleted: "Supprimé",
  diffFileRenamed: "Renommé",
  documentToolbar: "Affichage du document",
  pageOf: (n, t) => `Page ${n} / ${t}`,
  pageNumber: (n) => `Page ${n}`,
  documentPages: (l, n) => `${l}, ${n} page${s(n)}`,
  zoomIn: "Zoom avant",
  zoomOut: "Zoom arrière",
  fitWidth: "Ajuster à la largeur",
  zoomPercent: (n) => `${n} %`,
  download: "Télécharger",
  readingDocument: "Lecture du document…",
  documentUnreadable: "Document illisible",
  documentReadFailed: "Le fichier n'a pas pu être lu.",
  pdfPassword: "Ce PDF est protégé par un mot de passe.",
  pdfInvalid: "Ce fichier n'est pas un PDF valide, ou il est abîmé.",
  pdfUnavailable: "Aperçu PDF indisponible dans cette app.",
  unsupportedFormat: "Format non pris en charge",
  unsupportedFormatText: (k) => `Ce type de fichier (${k}) ne s'affiche pas ici.`,
  unknownFormat: "inconnu",
  imagesHidden: (n) => (n > 1 ? `${n} images masquées.` : "1 image masquée."),
  showImages: "Afficher les images",
  editValue: (l) => `Modifier « ${l} »`,
  stepDone: "fait",
  stepError: "erreur",
  copyBlock: "Copier le bloc",
  blockCopied: "Bloc copié",
  table: "Tableau",
  taskDone: "Fait",
  taskTodo: "À faire",
  image: "Image",
  formatting: "Mise en forme",
  heading: (n) => `Titre ${n}`,
  bold: "Gras",
  italic: "Italique",
  inlineCode: "Code",
  link: "Lien",
  bulletList: "Liste à puces",
  orderedList: "Liste numérotée",
  quote: "Citation",
  preview: "Aperçu",
  nothingToPreview: "Rien à afficher",
  imageUploading: (n) => `Envoi de ${n}…`,
  imageNotAdded: (n) => `Image non ajoutée : ${n}`,
  linkTextPlaceholder: "texte",
  linkUrlPlaceholder: "adresse",
  loginTitle: "Connexion",
  loginIdentifier: "Adresse e-mail ou identifiant",
  loginPassword: "Mot de passe",
  loginShowPassword: "Afficher le mot de passe",
  loginRemember: "Se souvenir de moi",
  loginForgot: "Mot de passe oublié ?",
  loginSubmit: "Se connecter",
  loginOr: "ou",
  loginFailed: "La connexion a échoué. Réessayez.",
  loginIdentifierMissing: "Saisissez votre adresse e-mail ou votre identifiant.",
  loginPasswordMissing: "Saisissez votre mot de passe.",
  loginProviders: "Autres moyens de connexion",
  selectAllMatching: (n) => `Sélectionner les ${n} éléments`,
  allSelectedCount: (n) => `${n} éléments sélectionnés`,
  clearAllSelection: "Effacer la sélection",
  columns: "Colonnes",
  rowsPerPage: "Lignes par page",
  pageOfPages: (p, n) => `Page ${p} sur ${n}`,
  modified: "modifié",
  skipToContent: "Aller au contenu",
  forbiddenList: "Vous n'avez pas accès à cette liste",
  forbiddenItem: "Vous n'avez pas accès à cet élément",
  forbiddenText: "Demandez l'accès à un administrateur.",
  requestAccess: "Demander l'accès",
  openCalendar: "Ouvrir le calendrier",
  previousMonth: "Mois précédent",
  nextMonth: "Mois suivant",
  previousYear: "Année précédente",
  nextYear: "Année suivante",
  pickMonthYear: (c) => `${c}, choisir le mois et l'année`,
  backToDays: (y) => `${y}, revenir aux jours`,
  datePresets: "Raccourcis de période",
  dateTooEarly: (min) => `Choisissez une date à partir du ${min}.`,
  dateTooLate: (max) => `Choisissez une date jusqu'au ${max}.`,
  dateUnavailable: "Cette date n'est pas disponible. Choisissez-en une autre.",
  dateRangeReversed: "La date de fin doit suivre la date de début.",
  increase: "Augmenter",
  decrease: "Diminuer",
  numberRange: (min, max) => `Saisissez une valeur de ${min} à ${max}.`,
  numberMin: (min) => `Saisissez une valeur d'au moins ${min}.`,
  numberMax: (max) => `Saisissez une valeur de ${max} au plus.`,
  numberStep: (step) => `Saisissez une valeur par pas de ${step}.`,
  closeAlert: "Fermer le message",
  fileDropHere: (multiple) => (multiple ? "Déposez des fichiers ici ou" : "Déposez un fichier ici ou"),
  fileChoose: (multiple) => (multiple ? "choisir des fichiers" : "choisir un fichier"),
  fileHint: (types, max) => [types, max ? `${max} au plus` : ""].filter(Boolean).join(", "),
  fileKind: (k) => ({ image: "image", video: "vidéo", audio: "audio", text: "texte" })[k],
  fileTypeRejected: (t) => `Type non accepté : ${t}.`,
  fileTooLarge: (size, max) => `Fichier trop lourd : ${size}, ${max} au plus.`,
  fileOnlyOne: "Un seul fichier à la fois.",
  fileList: "Fichiers",
  filesRejected: "Fichiers refusés",
  fileStatusPending: "En attente",
  fileStatusUploading: (p) => (p ? `Envoi : ${p}` : "Envoi en cours"),
  fileStatusDone: "Envoyé",
  fileStatusError: "L'envoi a échoué.",
  fileUploadingName: (n) => `Envoi de ${n}`,
  fileAnnounce: (n, status) => `${n} : ${status}`,
  retryFile: (n) => `Réessayer ${n}`,
  cardDeltaTone: (t) => (t === "positive" ? "favorable" : "défavorable"),
};
