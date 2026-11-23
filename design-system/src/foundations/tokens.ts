/** Liste des tokens affichés dans Fondations (les valeurs viennent du CSS). */
export const COLOR_TOKENS = [
  ["--surface", "Contenu principal"],
  ["--surface-side", "Surface secondaire : sidebar, barre d'onglets"],
  ["--surface-raised", "Ce qui flotte : menus, notifications, modales"],
  ["--field", "Champs, boutons secondaires"],
  ["--hover", "Survol"],
  ["--selected", "Sélection (texte tertiaire → secondaire dessus)"],
  ["--line", "Traits de séparation"],
  ["--fg", "Texte principal"],
  ["--fg-2", "Texte secondaire"],
  ["--fg-3", "Texte tertiaire"],
  ["--accent", "Accent (redéfinissable par app)"],
  ["--accent-text", "Accent utilisé comme texte"],
  ["--success", "Succès"],
  ["--warning", "Alerte"],
  ["--danger", "Erreur"],
  ["--danger-fg", "Texte sur fond danger"],
  ["--info", "Information"],
  ["--tip-bg", "Fond des info-bulles (sombre dans les deux modes)"],
  ["--tip-fg", "Texte des info-bulles"],
  ["--ansi-0", "ANSI 0 : noir (D-281)"],
  ["--ansi-1", "ANSI 1 : rouge (D-281)"],
  ["--ansi-2", "ANSI 2 : vert (D-281)"],
  ["--ansi-3", "ANSI 3 : jaune (D-281)"],
  ["--ansi-4", "ANSI 4 : bleu (D-281)"],
  ["--ansi-5", "ANSI 5 : magenta (D-281)"],
  ["--ansi-6", "ANSI 6 : cyan (D-281)"],
  ["--ansi-7", "ANSI 7 : blanc (D-281)"],
  ["--ansi-8", "ANSI 8 : noir vif (D-281)"],
  ["--ansi-9", "ANSI 9 : rouge vif (D-281)"],
  ["--ansi-10", "ANSI 10 : vert vif (D-281)"],
  ["--ansi-11", "ANSI 11 : jaune vif (D-281)"],
  ["--ansi-12", "ANSI 12 : bleu vif (D-281)"],
  ["--ansi-13", "ANSI 13 : magenta vif (D-281)"],
  ["--ansi-14", "ANSI 14 : cyan vif (D-281)"],
  ["--ansi-15", "ANSI 15 : blanc vif (D-281)"],
] as const;

export const TEXT_TOKENS = ["--fs-xs", "--fs-sm", "--fs-md", "--fs-lg", "--fs-xl", "--fs-2xl"] as const;
export const SPACE_TOKENS = ["--sp-1", "--sp-1-5", "--sp-2", "--sp-3", "--sp-4", "--sp-5", "--sp-6", "--sp-8", "--sp-10", "--sp-12"] as const;
export const RADIUS_TOKENS = ["--radius-sm", "--radius-md", "--radius-lg"] as const;
export const SHADOW_TOKENS = ["--shadow-sm", "--shadow-md", "--shadow-lg"] as const;
