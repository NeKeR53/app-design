/*
 * Lecture des séquences ANSI, reprise d'Alfred (src/ui/components/ansi.ts). Décision : D-281.
 */
/**
 * Lecture des séquences ANSI d’une ligne de journal, sans jamais produire de HTML : la ligne devient une liste de
 * morceaux de texte et de leur style (couleur parmi les 16 de la palette, gras, souligné…), que React affiche comme du
 * texte. Les autres séquences (curseur, titre de fenêtre, liens OSC 8, effacements) et les caractères de contrôle sont
 * retirés. Une couleur 256 ou « vraie couleur » est ramenée à la plus proche des 16, que le thème rend lisibles.
 */

export interface AnsiStyle {
  /** Couleur du texte, 0 à 15 (noir, rouge, vert, jaune, bleu, magenta, cyan, blanc, puis leurs versions vives). */
  fg?: number | undefined;
  bg?: number | undefined;
  bold?: boolean | undefined;
  dim?: boolean | undefined;
  italic?: boolean | undefined;
  underline?: boolean | undefined;
  strike?: boolean | undefined;
  inverse?: boolean | undefined;
}

export interface AnsiSegment {
  text: string;
  format: AnsiStyle;
}

/** Palette de référence des 16 couleurs (xterm), pour ramener une couleur 256 ou RVB à la plus proche. */
const BASE: readonly [number, number, number][] = [
  [0, 0, 0],
  [205, 0, 0],
  [0, 205, 0],
  [205, 205, 0],
  [0, 0, 238],
  [205, 0, 205],
  [0, 205, 205],
  [229, 229, 229],
  [127, 127, 127],
  [255, 0, 0],
  [0, 255, 0],
  [255, 255, 0],
  [92, 92, 255],
  [255, 0, 255],
  [0, 255, 255],
  [255, 255, 255],
];

function nearest(red: number, green: number, blue: number) {
  let best = 7;
  let distance = Number.POSITIVE_INFINITY;
  BASE.forEach(([r, g, b], index) => {
    const d = (r - red) ** 2 + (g - green) ** 2 + (b - blue) ** 2;
    if (d < distance) {
      distance = d;
      best = index;
    }
  });
  return best;
}

function color256(index: number) {
  if (index < 16) return index;
  if (index >= 232) {
    const level = 8 + (index - 232) * 10;
    return nearest(level, level, level);
  }
  const cube = index - 16;
  const level = (step: number) => (step === 0 ? 0 : 55 + step * 40);
  return nearest(level(Math.floor(cube / 36)), level(Math.floor(cube / 6) % 6), level(cube % 6));
}

/** Applique une séquence SGR (`ESC [ … m`) au style courant. */
function applySgr(style: AnsiStyle, params: string): AnsiStyle {
  // Les sous-paramètres à deux-points (`38:2::255:0:0`) se lisent comme les autres.
  const codes = params === "" ? [0] : params.split(/[;:]/).map((code) => (code === "" ? 0 : Number(code)));
  let next = { ...style };
  for (let index = 0; index < codes.length; index += 1) {
    const code = codes[index]!;
    if (code === 0) next = {};
    else if (code === 1) next.bold = true;
    else if (code === 2) next.dim = true;
    else if (code === 3) next.italic = true;
    else if (code === 4) next.underline = true;
    else if (code === 7) next.inverse = true;
    else if (code === 9) next.strike = true;
    else if (code === 21 || code === 22) {
      next.bold = undefined;
      next.dim = undefined;
    } else if (code === 23) next.italic = undefined;
    else if (code === 24) next.underline = undefined;
    else if (code === 27) next.inverse = undefined;
    else if (code === 29) next.strike = undefined;
    else if (code >= 30 && code <= 37) next.fg = code - 30;
    else if (code === 39) next.fg = undefined;
    else if (code >= 40 && code <= 47) next.bg = code - 40;
    else if (code === 49) next.bg = undefined;
    else if (code >= 90 && code <= 97) next.fg = code - 90 + 8;
    else if (code >= 100 && code <= 107) next.bg = code - 100 + 8;
    else if (code === 38 || code === 48) {
      const mode = codes[index + 1];
      let value: number | undefined;
      if (mode === 5) {
        value = color256(Math.max(0, Math.min(255, codes[index + 2] ?? 0)));
        index += 2;
      } else if (mode === 2) {
        // `38;2;r;g;b`, ou `38:2:espace:r:g:b` quand un identifiant d’espace de couleurs précède.
        const rest = codes.slice(index + 2, index + 6);
        const [red, green, blue] = rest.length === 4 && params.includes(":") ? rest.slice(1) : rest;
        value = nearest(red ?? 0, green ?? 0, blue ?? 0);
        index += rest.length === 4 && params.includes(":") ? 5 : 4;
      }
      if (value !== undefined) {
        if (code === 38) next.fg = value;
        else next.bg = value;
      }
    }
  }
  return next;
}

const ESC = "\u001b";

/**
 * Découpe une ligne en morceaux stylés. `\r` (barre de progression réécrite) ne garde que ce qui suit le dernier
 * retour chariot ; une tabulation reste, les autres caractères de contrôle disparaissent.
 */
export function parseAnsi(input: string): AnsiSegment[] {
  let line = input.endsWith("\r") ? input.slice(0, -1) : input;
  const carriage = line.lastIndexOf("\r");
  if (carriage >= 0) line = line.slice(carriage + 1);
  const segments: AnsiSegment[] = [];
  let style: AnsiStyle = {};
  let text = "";
  const flush = () => {
    if (!text) return;
    const last = segments.at(-1);
    if (last && last.format === style) last.text += text;
    else segments.push({ text, format: style });
    text = "";
  };
  let index = 0;
  while (index < line.length) {
    const char = line[index];
    const code = line.charCodeAt(index);
    if (char === ESC || code === 0x9b) {
      const csi = code === 0x9b || line[index + 1] === "[";
      if (csi) {
        // CSI : paramètres (0x30–0x3F), intermédiaires (0x20–0x2F), puis un octet final (0x40–0x7E).
        let end = index + (code === 0x9b ? 1 : 2);
        while (end < line.length && line.charCodeAt(end) >= 0x20 && line.charCodeAt(end) <= 0x3f) end += 1;
        if (end >= line.length) break;
        const final = line[end];
        if (final === "m") {
          const params = line.slice(index + (code === 0x9b ? 1 : 2), end);
          if (/^[\d;:]*$/.test(params)) {
            flush();
            style = applySgr(style, params);
          }
        }
        index = end + 1;
        continue;
      }
      const kind = line[index + 1];
      if (kind === "]" || kind === "P" || kind === "X" || kind === "^" || kind === "_") {
        // OSC, DCS… : jusqu’à BEL ou ESC \ ; le texte d’un lien OSC 8 reste, entre ses deux séquences.
        let end = index + 2;
        while (end < line.length && line[end] !== "\u0007" && !(line[end] === ESC && line[end + 1] === "\\")) end += 1;
        index = line[end] === "\u0007" ? end + 1 : end + 2;
        continue;
      }
      // Séquence à deux caractères (ESC 7, ESC =…), ou ESC isolé en fin de ligne.
      index += 2;
      continue;
    }
    if (code < 0x20 || code === 0x7f || (code >= 0x80 && code < 0xa0)) {
      if (char === "\t") text += char;
      else if (char === "\b") text = text.slice(0, -1);
      index += 1;
      continue;
    }
    text += char;
    index += 1;
  }
  flush();
  return segments;
}

/** Texte lisible d’une ligne, sans ses séquences : ce qu’on cherche et ce qu’on copie. */
export function stripAnsi(input: string): string {
  // Chemin rapide : la plupart des lignes n’ont ni séquence ni caractère de contrôle.
  if (!/[\u0000-\u0008\u000a-\u001f\u007f-\u009f]/.test(input)) return input;
  return parseAnsi(input)
    .map((segment) => segment.text)
    .join("");
}
