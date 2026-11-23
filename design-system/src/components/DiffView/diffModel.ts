/**
 * Repris d'Alfred (src/ui/components/diffModel.ts). Décisions : D-290, D-294, D-295, D-299.
 * Modèle de `DiffView` : comparaison de deux textes ligne à ligne, lecture d’un diff unifié (celui de `git diff`,
 * plusieurs fichiers compris), mots changés dans une ligne et repli des parties inchangées. Rien ici ne dépend de React.
 */

/** Fin d’une ligne : `none` pour la dernière ligne d’un texte qui ne se termine pas par un retour à la ligne. */
export type Eol = "lf" | "crlf" | "none";

export interface DiffLine {
  kind: "context" | "removed" | "added";
  text: string;
  /** Numéro dans l’ancien texte (lignes `context` et `removed`). */
  oldNumber?: number | undefined;
  /** Numéro dans le nouveau texte (lignes `context` et `added`). */
  newNumber?: number | undefined;
  eol: Eol;
}

/** Une suite de lignes affichées, ou des lignes inchangées repliées (`lines` absent : elles ne sont pas connues). */
export type DiffSegment =
  | { type: "lines"; lines: DiffLine[] }
  | { type: "gap"; count: number; oldStart: number; newStart: number; lines?: DiffLine[] };

export type DiffFileStatus = "modified" | "added" | "deleted" | "renamed";

export interface DiffFile {
  oldPath?: string | undefined;
  newPath?: string | undefined;
  status: DiffFileStatus;
  binary: boolean;
  added: number;
  removed: number;
  segments: DiffSegment[];
  /** Toutes les lignes communes ont changé de fin de ligne dans le même sens (fichier converti). */
  eolChange?: { from: Eol; to: Eol } | undefined;
}

/** Comme git : un octet nul dans les 8 000 premiers caractères fait un fichier binaire. */
export function isBinaryText(text: string): boolean {
  return text.slice(0, 8000).includes("\0");
}

export function splitLines(text: string): { text: string; eol: Eol }[] {
  const lines: { text: string; eol: Eol }[] = [];
  let start = 0;
  while (start < text.length) {
    const end = text.indexOf("\n", start);
    if (end === -1) {
      lines.push({ text: text.slice(start), eol: "none" });
      break;
    }
    const crlf = end > start && text.charCodeAt(end - 1) === 13;
    lines.push({ text: text.slice(start, crlf ? end - 1 : end), eol: crlf ? "crlf" : "lf" });
    start = end + 1;
  }
  return lines;
}

type Op = 0 | 1 | 2; // 0 : commune, 1 : retirée de a, 2 : ajoutée de b

/**
 * Plus court script d’édition (Myers, O(ND)) entre `a[aStart, aEnd)` et `b[bStart, bEnd)`. Rend `null` au-delà de
 * `maxD` modifications : l’appelant découpe alors le problème autrement, pour rester fluide sur de gros fichiers.
 */
function myers(
  a: ArrayLike<number>,
  b: ArrayLike<number>,
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
  maxD: number,
): Op[] | null {
  const n = aEnd - aStart;
  const m = bEnd - bStart;
  const max = Math.min(n + m, maxD);
  const offset = max + 1;
  const v = new Int32Array(2 * max + 3);
  const trace: Int32Array[] = [];
  for (let d = 0; d <= max; d++) {
    // Valeurs de l’étape précédente, de k = -(d + 1) à d + 1.
    trace.push(v.slice(offset - d - 1, offset + d + 2));
    for (let k = -d; k <= d; k += 2) {
      let x =
        k === -d || (k !== d && v[offset + k - 1]! < v[offset + k + 1]!) ? v[offset + k + 1]! : v[offset + k - 1]! + 1;
      let y = x - k;
      while (x < n && y < m && a[aStart + x]! === b[bStart + y]!) {
        x++;
        y++;
      }
      v[offset + k] = x;
      if (x >= n && y >= m) return backtrack(trace, d, n, m);
    }
  }
  return null;
}

function backtrack(trace: Int32Array[], depth: number, n: number, m: number): Op[] {
  const ops: Op[] = [];
  let x = n;
  let y = m;
  for (let d = depth; d > 0; d--) {
    const previous = trace[d]!;
    const at = (k: number) => previous[k + d + 1]!;
    const k = x - y;
    const insert = k === -d || (k !== d && at(k - 1) < at(k + 1));
    const prevK = insert ? k + 1 : k - 1;
    const prevX = at(prevK);
    const prevY = prevX - prevK;
    const midX = insert ? prevX : prevX + 1;
    while (x > midX) {
      ops.push(0);
      x--;
      y--;
    }
    ops.push(insert ? 2 : 1);
    x = prevX;
    y = prevY;
  }
  while (x > 0) {
    ops.push(0);
    x--;
  }
  return ops.reverse();
}

/** Au-delà, un bloc se découpe sur ses lignes uniques (patience) au lieu d’un Myers coûteux. */
const MAX_LINE_EDITS = 1000;

/** Script d’édition complet entre deux suites d’entiers, découpé sur les lignes uniques quand il est long. */
export function diffSequences(a: ArrayLike<number>, b: ArrayLike<number>, maxD = MAX_LINE_EDITS): Op[] {
  const ops: Op[] = [];
  diffRange(a, b, 0, a.length, 0, b.length, maxD, ops);
  return ops;
}

function diffRange(
  a: ArrayLike<number>,
  b: ArrayLike<number>,
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
  maxD: number,
  ops: Op[],
) {
  let prefix = 0;
  while (aStart + prefix < aEnd && bStart + prefix < bEnd && a[aStart + prefix] === b[bStart + prefix]) prefix++;
  let suffix = 0;
  while (
    aEnd - suffix > aStart + prefix &&
    bEnd - suffix > bStart + prefix &&
    a[aEnd - suffix - 1] === b[bEnd - suffix - 1]
  )
    suffix++;
  for (let i = 0; i < prefix; i++) ops.push(0);
  const as = aStart + prefix;
  const ae = aEnd - suffix;
  const bs = bStart + prefix;
  const be = bEnd - suffix;
  if (as === ae || bs === be) {
    for (let i = as; i < ae; i++) ops.push(1);
    for (let i = bs; i < be; i++) ops.push(2);
  } else {
    const direct = myers(a, b, as, ae, bs, be, maxD);
    if (direct) ops.push(...direct);
    else {
      const anchors = uniqueAnchors(a, b, as, ae, bs, be);
      if (!anchors.length) {
        for (let i = as; i < ae; i++) ops.push(1);
        for (let i = bs; i < be; i++) ops.push(2);
      } else {
        let ai = as;
        let bi = bs;
        for (const [anchorA, anchorB] of anchors) {
          diffRange(a, b, ai, anchorA, bi, anchorB, maxD, ops);
          ops.push(0);
          ai = anchorA + 1;
          bi = anchorB + 1;
        }
        diffRange(a, b, ai, ae, bi, be, maxD, ops);
      }
    }
  }
  for (let i = 0; i < suffix; i++) ops.push(0);
}

/** Lignes présentes une seule fois de chaque côté, dans le plus long ordre commun (diff « patience »). */
function uniqueAnchors(
  a: ArrayLike<number>,
  b: ArrayLike<number>,
  as: number,
  ae: number,
  bs: number,
  be: number,
): [number, number][] {
  const seen = new Map<number, { inA: number; inB: number; at: number; bt: number }>();
  for (let i = as; i < ae; i++) {
    const entry = seen.get(a[i]!) ?? { inA: 0, inB: 0, at: i, bt: -1 };
    entry.inA++;
    seen.set(a[i]!, entry);
  }
  for (let i = bs; i < be; i++) {
    const entry = seen.get(b[i]!);
    if (!entry) continue;
    entry.inB++;
    entry.bt = i;
  }
  const pairs: [number, number][] = [];
  for (const entry of seen.values()) if (entry.inA === 1 && entry.inB === 1) pairs.push([entry.at, entry.bt]);
  pairs.sort((left, right) => left[0] - right[0]);
  // Plus longue sous-suite croissante sur la position dans b (tri par piles).
  const tails: number[] = [];
  const previous = new Int32Array(pairs.length).fill(-1);
  for (let i = 0; i < pairs.length; i++) {
    let low = 0;
    let high = tails.length;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (pairs[tails[middle]!]![1] < pairs[i]![1]) low = middle + 1;
      else high = middle;
    }
    if (low > 0) previous[i] = tails[low - 1]!;
    tails[low] = i;
  }
  const result: [number, number][] = [];
  for (let i = tails.length ? tails[tails.length - 1]! : -1; i !== -1; i = previous[i]!) result.push(pairs[i]!);
  return result.reverse();
}

function intern(lines: string[], table: Map<string, number>): Int32Array {
  const ids = new Int32Array(lines.length);
  for (let i = 0; i < lines.length; i++) {
    let id = table.get(lines[i]!);
    if (id === undefined) {
      id = table.size;
      table.set(lines[i]!, id);
    }
    ids[i] = id;
  }
  return ids;
}

const MIN_FOLD = 4;

/** Replie les lignes communes à plus de `context` lignes d’un changement (moins de `MIN_FOLD` : laissées visibles). */
function fold(lines: DiffLine[], context: number): DiffSegment[] {
  const shown = new Uint8Array(lines.length);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]!.kind === "context") continue;
    for (let j = Math.max(0, i - context); j <= Math.min(lines.length - 1, i + context); j++) shown[j] = 1;
  }
  const segments: DiffSegment[] = [];
  let i = 0;
  while (i < lines.length) {
    let j = i;
    while (j < lines.length && shown[j] === shown[i]) j++;
    const run = lines.slice(i, j);
    if (shown[i] || run.length < MIN_FOLD) {
      const last = segments[segments.length - 1];
      if (last?.type === "lines") last.lines.push(...run);
      else segments.push({ type: "lines", lines: run });
    } else {
      segments.push({
        type: "gap",
        count: run.length,
        oldStart: run[0]!.oldNumber ?? 0,
        newStart: run[0]!.newNumber ?? 0,
        lines: run,
      });
    }
    i = j;
  }
  return segments;
}

/** Compare deux textes. Une conversion de tout le fichier (CRLF → LF) est dite une fois, pas ligne par ligne. */
export function diffTexts(before: string, after: string, context = 3): DiffFile {
  if (isBinaryText(before) || isBinaryText(after)) {
    return {
      status: "modified",
      binary: true,
      added: 0,
      removed: 0,
      segments: [],
    };
  }
  const oldLines = splitLines(before);
  const newLines = splitLines(after);
  const table = new Map<string, number>();
  const ops = diffSequences(
    intern(
      oldLines.map((line) => line.text),
      table,
    ),
    intern(
      newLines.map((line) => line.text),
      table,
    ),
  );

  // Fins de ligne des lignes communes : une seule conversion pour toutes vaut un avis sur le fichier.
  const changes = new Set<string>();
  let common = 0;
  {
    let i = 0;
    let j = 0;
    for (const op of ops) {
      if (op === 0) {
        common++;
        if (oldLines[i]!.eol !== newLines[j]!.eol) changes.add(`${oldLines[i]!.eol}>${newLines[j]!.eol}`);
        else changes.add("same");
        i++;
        j++;
      } else if (op === 1) i++;
      else j++;
    }
  }
  const converted = common > 0 && changes.size === 1 && !changes.has("same");
  const eolChange = converted ? (([from, to]) => ({ from, to }))([...changes][0]!.split(">") as [Eol, Eol]) : undefined;

  const lines: DiffLine[] = [];
  let added = 0;
  let removed = 0;
  let i = 0;
  let j = 0;
  const pendingRemoved: DiffLine[] = [];
  const pendingAdded: DiffLine[] = [];
  const flush = () => {
    lines.push(...pendingRemoved, ...pendingAdded);
    pendingRemoved.length = 0;
    pendingAdded.length = 0;
  };
  for (const op of ops) {
    if (op === 0) {
      const oldLine = oldLines[i]!;
      const newLine = newLines[j]!;
      if (oldLine.eol !== newLine.eol && !converted) {
        // Seule la fin de ligne change : une ligne retirée et une ajoutée, comme git.
        pendingRemoved.push({ kind: "removed", text: oldLine.text, oldNumber: i + 1, eol: oldLine.eol });
        pendingAdded.push({ kind: "added", text: newLine.text, newNumber: j + 1, eol: newLine.eol });
        removed++;
        added++;
      } else {
        flush();
        lines.push({ kind: "context", text: newLine.text, oldNumber: i + 1, newNumber: j + 1, eol: newLine.eol });
      }
      i++;
      j++;
    } else if (op === 1) {
      pendingRemoved.push({ kind: "removed", text: oldLines[i]!.text, oldNumber: i + 1, eol: oldLines[i]!.eol });
      removed++;
      i++;
    } else {
      pendingAdded.push({ kind: "added", text: newLines[j]!.text, newNumber: j + 1, eol: newLines[j]!.eol });
      added++;
      j++;
    }
  }
  flush();
  return { status: "modified", binary: false, added, removed, segments: fold(lines, context), eolChange };
}

function stripPrefix(path: string): string | undefined {
  const clean = path.replace(/\t.*$/, "").replace(/^"(.*)"$/, "$1");
  if (clean === "/dev/null") return undefined;
  return clean.replace(/^[ab]\//, "");
}

/**
 * Lit un diff unifié : celui de `git diff` (plusieurs fichiers, renommages, binaires, « \ No newline at end of file »)
 * ou celui de `diff -u`. Les lignes entre deux blocs ne sont pas dans le diff : elles deviennent un repli sans contenu.
 * Les comptes de l’en-tête `@@` disent où finit un bloc : une ligne « --- » à l’intérieur est un contenu retiré.
 */
export function parsePatch(patch: string): DiffFile[] {
  const files: DiffFile[] = [];
  let file: DiffFile | undefined;
  let hunk: DiffLine[] | undefined;
  let oldLeft = 0;
  let newLeft = 0;
  let oldNo = 0;
  let newNo = 0;
  let oldEnd = 1;
  const start = (): DiffFile => {
    file = { status: "modified", binary: false, added: 0, removed: 0, segments: [] };
    files.push(file);
    hunk = undefined;
    oldEnd = 1;
    return file;
  };
  for (const raw of splitLines(patch)) {
    const line = raw.text;
    const eol: Eol = raw.eol === "crlf" ? "crlf" : "lf";
    if (hunk && file && (oldLeft > 0 || newLeft > 0)) {
      const text = line.slice(1);
      if (line[0] === " " || line === "") {
        hunk.push({ kind: "context", text, oldNumber: oldNo++, newNumber: newNo++, eol });
        oldLeft--;
        newLeft--;
        continue;
      }
      if (line[0] === "-") {
        hunk.push({ kind: "removed", text, oldNumber: oldNo++, eol });
        file.removed++;
        oldLeft--;
        continue;
      }
      if (line[0] === "+") {
        hunk.push({ kind: "added", text, newNumber: newNo++, eol });
        file.added++;
        newLeft--;
        continue;
      }
    }
    if (line.startsWith("\\")) {
      const last = hunk?.[hunk.length - 1];
      if (last) last.eol = "none";
      continue;
    }
    const header = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (header) {
      const target = file ?? start();
      oldNo = Number(header[1]);
      newNo = Number(header[3]);
      oldLeft = Number(header[2] ?? "1");
      newLeft = Number(header[4] ?? "1");
      // Un côté vide commence à 0 : sa première ligne serait la 1.
      if (oldLeft === 0) oldNo++;
      if (newLeft === 0) newNo++;
      const skipped = oldNo - oldEnd;
      if (skipped > 0 && oldLeft > 0) {
        target.segments.push({ type: "gap", count: skipped, oldStart: oldEnd, newStart: newNo - skipped });
      }
      hunk = [];
      target.segments.push({ type: "lines", lines: hunk });
      oldEnd = oldNo + oldLeft;
      continue;
    }
    if (line.startsWith("diff --git ")) {
      const target = start();
      const paths = /^diff --git "?a\/(.+?)"? "?b\/(.+?)"?$/.exec(line);
      if (paths) {
        target.oldPath = paths[1];
        target.newPath = paths[2];
      }
      continue;
    }
    if (line.startsWith("--- ")) {
      // Sans « diff --git », chaque « --- » ouvre un fichier.
      const target = file && !file.segments.length ? file : start();
      const path = stripPrefix(line.slice(4));
      if (path) target.oldPath = path;
      else target.status = "added";
      continue;
    }
    if (!file) continue;
    if (line.startsWith("+++ ")) {
      const path = stripPrefix(line.slice(4));
      if (path) file.newPath = path;
      else file.status = "deleted";
    } else if (line.startsWith("new file mode")) file.status = "added";
    else if (line.startsWith("deleted file mode")) file.status = "deleted";
    else if (line.startsWith("rename from ")) {
      file.status = "renamed";
      file.oldPath = line.slice(12);
    } else if (line.startsWith("rename to ")) file.newPath = line.slice(10);
    else if (line.startsWith("Binary files ") || line === "GIT binary patch") file.binary = true;
  }
  return files;
}

/** Morceaux d’une ligne pour le surlignage : mots, espaces, ponctuation. */
const TOKEN = /[\p{L}\p{N}_]+|\s+|[^\p{L}\p{N}_\s]/gu;

/** Au-delà, une ligne n’a pas de surlignage des mots : elle est surtout affichée. */
const MAX_WORD_LINE = 2000;

export type Range = [number, number];

/**
 * Parties changées d’une ligne retirée et de la ligne ajoutée qui lui répond. `null` quand les deux lignes n’ont
 * presque rien en commun : toute la ligne est changée, surligner les mots n’aiderait pas.
 */
export function wordChanges(before: string, after: string): { before: Range[]; after: Range[] } | null {
  if (before === after) return { before: [], after: [] };
  if (before.length > MAX_WORD_LINE || after.length > MAX_WORD_LINE) return null;
  const left = before.match(TOKEN) ?? [];
  const right = after.match(TOKEN) ?? [];
  const table = new Map<string, number>();
  const ops = myers(intern(left, table), intern(right, table), 0, left.length, 0, right.length, 200);
  if (!ops) return null;
  const result: { before: Range[]; after: Range[] } = { before: [], after: [] };
  let i = 0;
  let j = 0;
  let leftAt = 0;
  let rightAt = 0;
  let commonLength = 0;
  const push = (ranges: Range[], from: number, to: number) => {
    const last = ranges[ranges.length - 1];
    if (last && last[1] === from) last[1] = to;
    else ranges.push([from, to]);
  };
  for (const op of ops) {
    if (op === 0) {
      commonLength += left[i]!.trim() ? left[i]!.length : 0;
      leftAt += left[i++]!.length;
      rightAt += right[j++]!.length;
    } else if (op === 1) {
      push(result.before, leftAt, leftAt + left[i]!.length);
      leftAt += left[i++]!.length;
    } else {
      push(result.after, rightAt, rightAt + right[j]!.length);
      rightAt += right[j++]!.length;
    }
  }
  const visible = Math.max(before.replace(/\s/g, "").length, after.replace(/\s/g, "").length);
  if (visible > 0 && commonLength / visible < 0.4) return null;
  return result;
}

