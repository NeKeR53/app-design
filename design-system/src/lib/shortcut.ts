/**
 * Raccourcis « Mod » (D-006) : ⌘ sur macOS, Ctrl ailleurs.
 * Les raccourcis sont déclarés une fois, par exemple "Mod+K" ou "Mod+Shift+P".
 */
const MAC_KEYS: Record<string, string> = { Mod: "⌘", Shift: "⇧", Alt: "⌥", Ctrl: "⌃", Backspace: "⌫", Delete: "⌦", Enter: "↩" };
/** Noms des touches hors macOS : ils dépendent de la langue (D-089). */
export interface KeyNames {
  keyShift: string;
  keyBackspace: string;
  keyDelete: string;
  keyEnter: string;
  keyEscape: string;
}

/** Texte affiché : « ⌘K » sur macOS, « Ctrl+K » ailleurs. */
export function formatShortcut(shortcut: string, isMac: boolean, names: KeyNames): string {
  const win: Record<string, string> = { Mod: "Ctrl", Shift: names.keyShift, Alt: "Alt", Ctrl: "Ctrl", Backspace: names.keyBackspace, Delete: names.keyDelete, Enter: names.keyEnter };
  // Échap s'écrit en toutes lettres, sur macOS comme ailleurs (libellé traduit).
  const parts = shortcut.split("+").map((k) => (k === "Escape" ? names.keyEscape : ((isMac ? MAC_KEYS[k] : win[k]) ?? k.toUpperCase())));
  return isMac ? parts.join("") : parts.join("+");
}

/** Valeur de l'attribut aria-keyshortcuts : « Meta+K » ou « Control+K ». */
export function ariaShortcut(shortcut: string, isMac: boolean): string {
  return shortcut
    .split("+")
    .map((k) => (k === "Mod" ? (isMac ? "Meta" : "Control") : k === "Ctrl" ? "Control" : k))
    .join("+");
}
