/*
 * Modèle de MentionInput (D-372) : le texte sans pastilles, et des références posées à une position du texte.
 * Fonctions pures et lecture ou écriture du champ éditable. Spec : MentionInput.spec.md.
 */
import type { ReactNode } from "react";

/** Une suggestion fournie par l'app : un fichier, une commande, un ticket. */
export interface MentionItem {
  /** Identifiant stable de la ressource (chemin, nom de commande). */
  id: string;
  /** Nom affiché dans la liste et dans la pastille. */
  label: string;
  /** Détail à droite de la suggestion (dossier, « Commande »). */
  description?: string;
  /** Icône de l'app, 16 px. */
  icon?: ReactNode;
}

/** Référence posée dans le texte : `offset` est sa position, en caractères, dans le texte sans pastilles. */
export interface MentionReference {
  /** Identifiant unique de cette pastille (deux pastilles peuvent viser la même ressource). */
  key: string;
  /** Caractère qui l'a ouverte (`@`, `/`, `#`). */
  trigger: string;
  /** `MentionItem.id`. */
  id: string;
  /** `MentionItem.label`. */
  label: string;
  offset: number;
}

/** Un déclencheur déclaré par l'app : son caractère, son nom, et la recherche des suggestions. */
export interface MentionTrigger {
  /** Un caractère, tapé en début de mot : `@`, `/`, `#`. */
  char: string;
  /** Nom de la liste, et entrée du menu « + » de ChatComposer : « Fichier », « Commande ». */
  label: string;
  /** Suggestions pour le texte tapé après le caractère ; `signal` annule une recherche dépassée. */
  load: (query: string, signal: AbortSignal) => Promise<MentionItem[]>;
}

export interface MentionQuery {
  trigger: MentionTrigger;
  query: string;
  /** Position du caractère déclencheur. */
  start: number;
  /** Position du curseur. */
  end: number;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Mot en cours de frappe juste avant le curseur, s'il commence par un caractère déclencheur (en début de mot). */
export function findMentionQuery(text: string, cursor: number, triggers: readonly MentionTrigger[]): MentionQuery | undefined {
  if (!triggers.length) return undefined;
  const chars = triggers.map((t) => escapeRegExp(t.char)).join("|");
  const match = new RegExp(`(?:^|\\s)(${chars})(\\S*)$`).exec(text.slice(0, cursor));
  if (!match) return undefined;
  const trigger = triggers.find((t) => t.char === match[1]);
  if (!trigger) return undefined;
  const query = match[2] ?? "";
  return { trigger, query, start: cursor - query.length - trigger.char.length, end: cursor };
}

/**
 * Décale les pastilles après le remplacement de `start`–`end` par `length` caractères : celles d'avant ne bougent
 * pas, celles d'après suivent, celles du passage remplacé se posent à sa fin.
 */
export function replaceMentionRange(references: readonly MentionReference[], start: number, end: number, length = 0): MentionReference[] {
  const delta = length - (end - start);
  return references.map((r) => ({
    ...r,
    offset: r.offset <= start ? r.offset : r.offset >= end ? r.offset + delta : start + length,
  }));
}

/** Positions des pastilles dans le texte rogné (`text.trim()`), celui qui part avec le message. */
export function trimMentionReferences(text: string, references: readonly MentionReference[]): MentionReference[] {
  const leading = text.length - text.trimStart().length;
  const length = text.trim().length;
  return references.map((r) => ({ ...r, offset: Math.max(0, Math.min(length, r.offset - leading)) }));
}

let counter = 0;
/** Clé unique d'une pastille. */
export function mentionKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `mention-${++counter}`;
}

/** Pastilles triées par position, à intercaler dans le texte. */
export function orderedMentions(text: string, references: readonly MentionReference[]): Array<{ text: string } | { reference: MentionReference }> {
  const ordered = references
    .map((reference, index) => ({ reference, index }))
    .sort((a, b) => a.reference.offset - b.reference.offset || a.index - b.index);
  const parts: Array<{ text: string } | { reference: MentionReference }> = [];
  let cursor = 0;
  for (const { reference } of ordered) {
    const offset = Math.max(cursor, Math.min(text.length, reference.offset));
    if (offset > cursor) parts.push({ text: text.slice(cursor, offset) });
    parts.push({ reference });
    cursor = offset;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });
  return parts;
}

/* ---------- Champ éditable : lecture et écriture du DOM ---------- */

/** Pastille dans le champ : non éditable, effacée d'un bloc, retirée par son ×. */
export const PILL_CLASS =
  "mx-0.5 inline-flex max-w-[min(100%,32ch)] min-h-5 items-center overflow-hidden rounded-full bg-selected pl-1.5 align-baseline font-sans text-sm leading-5 whitespace-nowrap text-fg select-all";
const PILL_REMOVE_CLASS =
  "socle-btn ml-0.5 inline-grid size-5 shrink-0 cursor-default place-items-center rounded-full text-fg-2 hover:bg-surface hover:text-fg outline-focus focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2"; // dans la pastille, qui rogne : anneau tracé dedans (D-425)

export interface EditorState {
  text: string;
  references: MentionReference[];
}

/** Relit le champ : le texte (retours à la ligne compris) et les pastilles à leur position. */
export function readEditor(root: Node, known: ReadonlyMap<string, MentionReference>): EditorState {
  let text = "";
  const references: MentionReference[] = [];
  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent ?? "";
      return;
    }
    if (!(node instanceof HTMLElement)) {
      node.childNodes.forEach(visit);
      return;
    }
    const key = node.dataset.mentionKey;
    if (key) {
      const reference = known.get(key);
      if (reference) references.push({ ...reference, offset: text.length });
      return;
    }
    if (node.tagName === "BR") {
      text += "\n";
      return;
    }
    const block = node.tagName === "DIV" || node.tagName === "P";
    if (block && text && !text.endsWith("\n")) text += "\n";
    node.childNodes.forEach(visit);
    if (block && node.nextSibling && !text.endsWith("\n")) text += "\n";
  };
  root.childNodes.forEach(visit);
  return { text: text.replace(/\n$/, ""), references };
}

export function editorSignature(text: string, references: readonly MentionReference[]): string {
  return JSON.stringify([text, references.map((r) => [r.key, r.offset, r.trigger, r.id, r.label])]);
}

function appendText(root: HTMLElement, text: string) {
  text.split("\n").forEach((part, index) => {
    if (index) root.append(document.createElement("br"));
    if (part) root.append(document.createTextNode(part));
  });
}

const SVG = "http://www.w3.org/2000/svg";
/** Croix de 12 px, même tracé que l'icône interne `X`. */
function crossIcon(): SVGSVGElement {
  const svg = document.createElementNS(SVG, "svg");
  for (const [k, v] of Object.entries({ width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false" }))
    svg.setAttribute(k, v);
  svg.style.strokeWidth = "var(--icon-stroke)";
  const path = document.createElementNS(SVG, "path");
  path.setAttribute("d", "M18 6 6 18M6 6l12 12");
  svg.append(path);
  return svg;
}

/** Redessine le champ : texte, retours à la ligne en `<br>`, pastilles. */
export function renderEditor(root: HTMLElement, text: string, references: readonly MentionReference[], removeLabel: (label: string) => string, removable: boolean) {
  root.replaceChildren();
  for (const part of orderedMentions(text, references)) {
    if ("text" in part) {
      appendText(root, part.text);
      continue;
    }
    const { reference } = part;
    const pill = document.createElement("span");
    pill.className = PILL_CLASS + (removable ? "" : " pr-1.5");
    // Attribut plutôt que propriété : le même rendu partout.
    pill.setAttribute("contenteditable", "false");
    pill.dataset.mentionKey = reference.key;
    const name = document.createElement("span");
    name.className = "min-w-0 truncate";
    name.textContent = `${reference.trigger}${reference.label}`;
    pill.append(name);
    if (removable) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.tabIndex = -1;
      remove.className = PILL_REMOVE_CLASS;
      remove.dataset.mentionRemove = reference.key;
      remove.setAttribute("aria-label", removeLabel(`${reference.trigger}${reference.label}`));
      remove.append(crossIcon());
      pill.append(remove);
    }
    root.append(pill);
  }
}

function textOffset(root: HTMLElement, container: Node, offset: number): number {
  try {
    const range = document.createRange();
    range.setStart(root, 0);
    range.setEnd(container, offset);
    return readEditor(range.cloneContents(), new Map()).text.length;
  } catch {
    return readEditor(root, new Map()).text.length;
  }
}

/** Sélection du champ, en positions dans le texte sans pastilles ; à défaut, la fin du texte. */
export function editorSelection(root: HTMLElement): { start: number; end: number } {
  const selection = window.getSelection();
  if (!selection?.rangeCount || !selection.anchorNode || !root.contains(selection.anchorNode) || !selection.focusNode || !root.contains(selection.focusNode)) {
    const end = readEditor(root, new Map()).text.length;
    return { start: end, end };
  }
  const range = selection.getRangeAt(0);
  const start = textOffset(root, range.startContainer, range.startOffset);
  const end = textOffset(root, range.endContainer, range.endOffset);
  return { start: Math.min(start, end), end: Math.max(start, end) };
}

/** Point du DOM à une position du texte sans pastilles. */
export function pointAtOffset(root: HTMLElement, target: number): { node: Node; offset: number } {
  let cursor = 0;
  for (let index = 0; index < root.childNodes.length; index++) {
    const node = root.childNodes[index]!;
    if (node.nodeType === Node.TEXT_NODE) {
      const length = node.textContent?.length ?? 0;
      if (target <= cursor + length) return { node, offset: Math.max(0, target - cursor) };
      cursor += length;
    } else if (node instanceof HTMLBRElement) {
      if (target <= cursor) return { node: root, offset: index };
      cursor += 1;
      if (target <= cursor) return { node: root, offset: index + 1 };
    }
  }
  return { node: root, offset: root.childNodes.length };
}

/** Place le curseur (ou la sélection) à une position du texte sans pastilles. */
export function setEditorSelection(root: HTMLElement, start: number, end = start) {
  const selection = window.getSelection();
  if (!selection) return;
  const from = pointAtOffset(root, start);
  const to = pointAtOffset(root, end);
  const range = document.createRange();
  range.setStart(from.node, from.offset);
  range.setEnd(to.node, to.offset);
  selection.removeAllRanges();
  selection.addRange(range);
}
