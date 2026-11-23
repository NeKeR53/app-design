/*
 * Commandes de mise en forme et leurs raccourcis (D-307), au format de Socle (« Mod+B », D-006).
 * Fichier sans CodeMirror : MarkdownEditor.tsx l'importe avant le chargement de l'éditeur.
 */
export type MarkdownCommand = "heading1" | "heading2" | "heading3" | "bold" | "italic" | "code" | "link" | "bulletList" | "orderedList" | "quote";

export const COMMAND_SHORTCUTS: Record<MarkdownCommand, string> = {
  heading1: "Mod+Alt+1",
  heading2: "Mod+Alt+2",
  heading3: "Mod+Alt+3",
  bold: "Mod+B",
  italic: "Mod+I",
  code: "Mod+E",
  link: "Mod+K",
  bulletList: "Mod+Shift+8",
  orderedList: "Mod+Shift+7",
  quote: "Mod+Shift+9",
};
