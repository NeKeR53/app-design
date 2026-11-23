/*
 * Partie CodeMirror 6 de MarkdownEditor, chargée à la première ouverture d'un éditeur (D-300).
 * Commandes et raccourcis (D-307), coloration aux tokens (D-306), images collées (D-308).
 * Module interne : seul MarkdownEditor.tsx l'importe, par `import()`.
 */
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown, markdownKeymap, markdownLanguage } from "@codemirror/lang-markdown";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Compartment, EditorSelection, EditorState, Prec, type Extension } from "@codemirror/state";
import { EditorView, keymap, placeholder as placeholderText } from "@codemirror/view";
import { tags } from "@lezer/highlight";

import { COMMAND_SHORTCUTS, type MarkdownCommand } from "./commands";

export type { MarkdownCommand } from "./commands";

/** « Mod+Shift+8 » → « Mod-Shift-8 », « Mod+B » → « Mod-b » (format de CodeMirror). */
const cmKey = (shortcut: string) =>
  shortcut
    .split("+")
    .map((k) => (k.length === 1 ? k.toLowerCase() : k))
    .join("-");

export interface PastedImage {
  src: string;
  alt?: string;
}

export interface EditorCallbacks {
  onChange: (value: string) => void;
  onFocusChange: (focused: boolean) => void;
  onPasteImage?: ((file: File) => Promise<string | PastedImage>) | undefined;
  onImageError: (file: File) => void;
  /** Textes de l'éditeur, venus du dictionnaire `messages` (D-089). */
  texts: { imageUploading: (name: string) => string; image: string; linkText: string; linkUrl: string };
}

export interface EditorSettings {
  /** Attributs ARIA du texte : nom, aide, erreur, lecture seule (spec, Accessibilité). */
  attributes: Record<string, string>;
  placeholder?: string | undefined;
  isReadOnly: boolean;
  isDisabled: boolean;
  maxLength?: number | undefined;
}

/** Entoure la sélection de `marker` (gras, italique, code), ou l'en retire si elle l'est déjà (D-307). */
function toggleWrap(view: EditorView, marker: string): boolean {
  const { state } = view;
  const size = marker.length;
  view.dispatch(
    state.changeByRange((range) => {
      const before = state.sliceDoc(range.from - size, range.from);
      const after = state.sliceDoc(range.to, range.to + size);
      if (before === marker && after === marker)
        return {
          changes: [
            { from: range.from - size, to: range.from },
            { from: range.to, to: range.to + size },
          ],
          range: EditorSelection.range(range.from - size, range.to - size),
        };
      const text = state.sliceDoc(range.from, range.to);
      if (text.length >= 2 * size && text.startsWith(marker) && text.endsWith(marker))
        return {
          changes: { from: range.from, to: range.to, insert: text.slice(size, -size) },
          range: EditorSelection.range(range.from, range.to - 2 * size),
        };
      return {
        changes: [
          { from: range.from, insert: marker },
          { from: range.to, insert: marker },
        ],
        range: EditorSelection.range(range.from + size, range.to + size),
      };
    }),
    { userEvent: "input.format", scrollIntoView: true },
  );
  return true;
}

/** `[texte](adresse)`, « adresse » sélectionnée ; une adresse sélectionnée devient la cible (D-307). */
function insertLink(view: EditorView, texts: EditorCallbacks["texts"]): boolean {
  const { state } = view;
  view.dispatch(
    state.changeByRange((range) => {
      const text = state.sliceDoc(range.from, range.to);
      if (/^(https?:\/\/|mailto:)\S+$/.test(text)) {
        const insert = `[${texts.linkText}](${text})`;
        return { changes: { from: range.from, to: range.to, insert }, range: EditorSelection.range(range.from + 1, range.from + 1 + texts.linkText.length) };
      }
      const label = text || texts.linkText;
      const insert = `[${label}](${texts.linkUrl})`;
      const urlStart = range.from + label.length + 3;
      return {
        changes: { from: range.from, to: range.to, insert },
        range: text ? EditorSelection.range(urlStart, urlStart + texts.linkUrl.length) : EditorSelection.range(range.from + 1, range.from + 1 + label.length),
      };
    }),
    { userEvent: "input.format", scrollIntoView: true },
  );
  return true;
}

const headingPrefix = /^#{1,6}\s+/;
const listPrefix = /^(\s*)([-*+]|\d+[.)])\s+/;

/** Pose ou retire un préfixe sur chaque ligne de la sélection : titre, liste, citation (D-307). */
function toggleLines(view: EditorView, kind: "heading" | "bullet" | "ordered" | "quote", level = 1): boolean {
  const { state } = view;
  const lines = new Map<number, { from: number; text: string }>();
  for (const range of state.selection.ranges)
    for (let at = state.doc.lineAt(range.from).number; at <= state.doc.lineAt(range.to).number; at++) {
      const line = state.doc.line(at);
      lines.set(at, { from: line.from, text: line.text });
    }
  const all = [...lines.values()];
  const wanted = "#".repeat(level);
  const has = (text: string) =>
    kind === "heading"
      ? new RegExp(`^${wanted}\\s`).test(text)
      : kind === "quote"
        ? /^>\s?/.test(text)
        : kind === "bullet"
          ? /^\s*[-*+]\s/.test(text)
          : /^\s*\d+[.)]\s/.test(text);
  const remove = all.every((line) => has(line.text));
  const changes = all.map((line, index) => {
    const current = kind === "heading" ? headingPrefix.exec(line.text) : kind === "quote" ? /^>\s?/.exec(line.text) : listPrefix.exec(line.text);
    const end = current ? current[0].length : 0;
    // Une liste garde l'indentation de la ligne ; un titre remplace un titre d'un autre niveau.
    const indent = kind === "bullet" || kind === "ordered" ? (current?.[1] ?? /^\s*/.exec(line.text)?.[0] ?? "") : "";
    if (remove) return { from: line.from, to: line.from + end, insert: indent };
    const prefix = kind === "heading" ? `${wanted} ` : kind === "quote" ? "> " : kind === "bullet" ? "- " : `${index + 1}. `;
    const replaced = kind === "quote" ? 0 : kind === "heading" ? end : end || indent.length;
    return { from: line.from, to: line.from + replaced, insert: `${indent}${prefix}` };
  });
  view.dispatch(state.update({ changes, userEvent: "input.format", scrollIntoView: true }));
  return true;
}

export function runCommand(view: EditorView, command: MarkdownCommand, texts: EditorCallbacks["texts"]): boolean {
  if (view.state.readOnly) return false;
  switch (command) {
    case "bold":
      return toggleWrap(view, "**");
    case "italic":
      return toggleWrap(view, "_");
    case "code":
      return toggleWrap(view, "`");
    case "link":
      return insertLink(view, texts);
    case "heading1":
      return toggleLines(view, "heading", 1);
    case "heading2":
      return toggleLines(view, "heading", 2);
    case "heading3":
      return toggleLines(view, "heading", 3);
    case "bulletList":
      return toggleLines(view, "bullet");
    case "orderedList":
      return toggleLines(view, "ordered");
    case "quote":
      return toggleLines(view, "quote");
  }
}

/** Coloration aux tokens (D-306) : les marques en dernier, pour l'emporter sur le lien qui les contient. */
const highlight = HighlightStyle.define([
  { tag: [tags.heading1, tags.heading2, tags.heading3, tags.heading4, tags.heading5, tags.heading6], fontWeight: "600" },
  { tag: tags.strong, fontWeight: "700" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.quote, color: "var(--fg-2)" },
  { tag: tags.link, color: "var(--accent-text)" },
  { tag: tags.monospace, backgroundColor: "var(--field)", borderRadius: "3px" },
  { tag: [tags.url, tags.labelName], color: "var(--fg-3)", textDecoration: "underline" },
  { tag: [tags.processingInstruction, tags.contentSeparator, tags.meta], color: "var(--fg-3)", textDecoration: "none", fontWeight: "400" },
]);

/** Le cadre est celui du champ (D-305) : CodeMirror n'a ni bord, ni fond, ni anneau propre. */
const theme = EditorView.theme({
  "&": { color: "var(--fg)", backgroundColor: "transparent", height: "100%" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "var(--font-mono)",
    lineHeight: "1.6",
    overflow: "auto",
    minHeight: "calc(var(--md-min-rows, 6) * 1.6em + 16px)",
    maxHeight: "var(--md-max-height)",
  },
  ".cm-content": { padding: "8px 0", caretColor: "var(--fg)" },
  ".cm-line": { padding: "0 12px" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--fg)", borderLeftWidth: "2px" },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "color-mix(in srgb, var(--accent) 25%, transparent) !important",
  },
  ".cm-placeholder": { color: "var(--fg-3)" },
});

let uploads = 0;

/** Images collées ou déposées : texte d'attente, puis `![alt](adresse)` ; échec : texte retiré (D-308). */
function imageHandler(callbacks: () => EditorCallbacks): Extension {
  const insertImages = (view: EditorView, files: File[], at: number) => {
    const { onPasteImage, onImageError, texts } = callbacks();
    if (!onPasteImage) return false;
    let position = at;
    for (const file of files) {
      const token = `![${texts.imageUploading(file.name || texts.image)}](socle-image-${++uploads})`;
      const text = `${token}\n`;
      view.dispatch({ changes: { from: position, insert: text }, selection: EditorSelection.cursor(position + text.length), userEvent: "input.paste", scrollIntoView: true });
      position += text.length;
      const replace = (insert: string) => {
        const from = view.state.doc.toString().indexOf(token);
        if (from === -1) return;
        view.dispatch({ changes: { from, to: from + token.length + (insert ? 0 : 1), insert }, userEvent: "input.paste" });
      };
      onPasteImage(file).then(
        (result) => {
          const image = typeof result === "string" ? { src: result } : result;
          const alt = (image.alt ?? file.name.replace(/\.[^.]+$/, "")).replace(/[[\]]/g, "");
          replace(`![${alt}](${image.src.replace(/[()\s]/g, encodeURIComponent)})`);
        },
        () => {
          replace("");
          onImageError(file);
        },
      );
    }
    return true;
  };
  const images = (list: FileList | undefined | null) => Array.from(list ?? []).filter((file) => file.type.startsWith("image/"));
  return EditorView.domEventHandlers({
    paste(event, view) {
      const files = images(event.clipboardData?.files);
      if (!files.length || !callbacks().onPasteImage || view.state.readOnly) return false;
      event.preventDefault();
      const range = view.state.selection.main;
      if (!range.empty) view.dispatch({ changes: { from: range.from, to: range.to }, userEvent: "delete" });
      return insertImages(view, files, view.state.selection.main.from);
    },
    drop(event, view) {
      const files = images(event.dataTransfer?.files);
      if (!files.length || !callbacks().onPasteImage || view.state.readOnly) return false;
      event.preventDefault();
      const at = view.posAtCoords({ x: event.clientX, y: event.clientY }) ?? view.state.selection.main.head;
      return insertImages(view, files, at);
    },
  });
}

/** Réglages qui changent sans toucher au texte ni à l'historique. */
const settings = new Compartment();
function settingsExtension(options: EditorSettings): Extension {
  const { maxLength } = options;
  return [
    EditorState.readOnly.of(options.isReadOnly || options.isDisabled),
    EditorView.editable.of(!options.isDisabled),
    EditorView.contentAttributes.of({ ...options.attributes, "aria-multiline": "true", role: "textbox" }),
    options.placeholder ? placeholderText(options.placeholder) : [],
    // La saisie s'arrête à `maxLength` ; un texte déjà plus long peut encore raccourcir.
    maxLength === undefined
      ? []
      : EditorState.transactionFilter.of((tr) => (tr.docChanged && tr.newDoc.length > maxLength && tr.newDoc.length > tr.startState.doc.length ? [] : tr)),
  ];
}

export function updateSettings(view: EditorView, options: EditorSettings) {
  view.dispatch({ effects: settings.reconfigure(settingsExtension(options)) });
}

export function createState(doc: string, options: EditorSettings, callbacks: () => EditorCallbacks): EditorState {
  return EditorState.create({
    doc,
    extensions: [
      history(),
      markdown({ base: markdownLanguage }),
      syntaxHighlighting(highlight),
      EditorView.lineWrapping,
      theme,
      settings.of(settingsExtension(options)),
      imageHandler(callbacks),
      Prec.high(
        keymap.of(
          (Object.keys(COMMAND_SHORTCUTS) as MarkdownCommand[]).map((command) => ({
            key: cmKey(COMMAND_SHORTCUTS[command]),
            run: (view: EditorView) => runCommand(view, command, callbacks().texts),
          })),
        ),
      ),
      keymap.of([...markdownKeymap, ...historyKeymap, ...defaultKeymap]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) callbacks().onChange(update.state.doc.toString());
        if (update.focusChanged) callbacks().onFocusChange(update.view.hasFocus);
      }),
    ],
  });
}

export function createEditor(parent: HTMLElement, state: EditorState): EditorView {
  return new EditorView({ state, parent });
}
