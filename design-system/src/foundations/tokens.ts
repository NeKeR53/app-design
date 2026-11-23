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
  ["--info", "Information"],
  ["--tip-bg", "Fond des info-bulles (sombre dans les deux modes)"],
  ["--tip-fg", "Texte des info-bulles"],
] as const;

export const TEXT_TOKENS = ["--fs-xs", "--fs-sm", "--fs-md", "--fs-lg", "--fs-xl", "--fs-2xl"] as const;
export const SPACE_TOKENS = ["--sp-1", "--sp-1-5", "--sp-2", "--sp-3", "--sp-4", "--sp-5", "--sp-6", "--sp-8", "--sp-10", "--sp-12"] as const;
export const RADIUS_TOKENS = ["--radius-sm", "--radius-md", "--radius-lg"] as const;
export const SHADOW_TOKENS = ["--shadow-sm", "--shadow-md", "--shadow-lg"] as const;
