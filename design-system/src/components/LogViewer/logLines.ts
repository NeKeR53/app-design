/*
 * Lignes d'un journal : stockage, heure en tête, recherche et niveau. Décisions : D-285, D-286, D-289.
 * Repris d'Alfred (src/ui/components/logLines.ts), sans le canal propre à son SDK.
 */
import { stripAnsi } from "../../lib/ansi";

/** Niveau d'une ligne : `info` dit qu'elle n'est ni une alerte ni une erreur, sans lire son texte. */
export type LogLevel = "error" | "warning" | "info";

/** Une ligne de journal : son texte (séquences ANSI comprises), ou ce texte avec son heure et son niveau. */
export type LogLine =
  | string
  | {
      text: string;
      /** Heure de la ligne : date, nombre de millisecondes ou texte ISO 8601. */
      time?: Date | number | string;
      /** Niveau connu de l'app ; sinon, il est lu dans le texte (D-286). */
      level?: LogLevel;
    };

export interface StoredLine {
  raw: string;
  time?: number | undefined;
  level?: LogLevel;
}

/** Heure ISO 8601 en tête de ligne, comme l'écrivent `docker logs --timestamps` et la plupart des services. */
const LEADING_TIME = /^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z|[+-]\d{2}:?\d{2})?) /;

function parseTime(value: Date | number | string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const time = value instanceof Date ? value.getTime() : typeof value === "number" ? value : Date.parse(value);
  return Number.isFinite(time) ? time : undefined;
}

/** Sépare l'heure placée en tête d'une ligne : elle passe dans la colonne de l'horodatage (D-289). */
function splitLeadingTime(raw: string): StoredLine {
  const found = LEADING_TIME.exec(raw);
  if (!found) return { raw };
  const time = parseTime(found[1]!.replace(",", ".").replace(" ", "T"));
  return time === undefined ? { raw } : { raw: raw.slice(found[0].length), time };
}

export function normalizeLine(line: LogLine): StoredLine {
  if (typeof line === "string") return splitLeadingTime(line);
  const stored = line.time === undefined ? splitLeadingTime(line.text) : { raw: line.text, time: parseTime(line.time) };
  return line.level ? { ...stored, level: line.level } : stored;
}

/**
 * Lignes d'un journal et leur texte nettoyé, calculé à la première demande. Un journal grandit par la fin et oublie
 * ses lignes les plus anciennes au-delà de `max`.
 */
export class LineStore {
  lines: StoredLine[] = [];
  /** Lignes oubliées en tête : le numéro affiché d'une ligne est `dropped + index + 1`. */
  dropped = 0;
  private plain: (string | undefined)[] = [];
  /** La dernière ligne d'un morceau de texte n'était pas finie : le morceau suivant la complète. */
  private partial = false;
  max: number;

  constructor(max = Number.POSITIVE_INFINITY) {
    this.max = max;
  }

  text(index: number) {
    let value = this.plain[index];
    if (value === undefined) {
      value = stripAnsi(this.lines[index]?.raw ?? "");
      this.plain[index] = value;
    }
    return value;
  }

  /** Remplace tout (journal donné en tableau). */
  replace(lines: readonly LogLine[]) {
    this.lines = lines.map(normalizeLine);
    this.plain = [];
    this.dropped = 0;
    this.partial = false;
    this.trim();
  }

  /**
   * Ajoute des lignes complètes (tableau) ou un morceau de flux (texte) : un morceau peut porter plusieurs lignes, et
   * sa dernière reste ouverte s'il ne finit pas par un saut de ligne. Les lignes sans heure prennent `now`.
   */
  append(data: string | readonly LogLine[], now = Date.now()) {
    if (typeof data !== "string") {
      for (const line of data) {
        this.partial = false;
        const stored = normalizeLine(line);
        this.lines.push(stored.time === undefined ? { ...stored, time: now } : stored);
      }
      this.trim();
      return;
    }
    if (!data) return;
    const parts = data.split("\n");
    const open = !data.endsWith("\n");
    if (!open) parts.pop();
    parts.forEach((part, index) => {
      const text = part.endsWith("\r") ? part.slice(0, -1) : part;
      if (this.partial && index === 0) {
        const last = this.lines.length - 1;
        const previous = this.lines[last]!;
        this.lines[last] = { ...previous, raw: previous.raw + text };
        this.plain[last] = undefined;
      } else {
        const stored = splitLeadingTime(text);
        this.lines.push({ ...stored, time: stored.time ?? now });
      }
    });
    this.partial = open;
    this.trim();
  }

  private trim() {
    const over = this.lines.length - this.max;
    if (over <= 0) return;
    this.lines.splice(0, over);
    this.plain.splice(0, over);
    this.dropped += over;
  }

  reset() {
    this.lines = [];
    this.plain = [];
    this.dropped = 0;
    this.partial = false;
  }
}

/** Indices des lignes qui contiennent `query` (déjà en minuscules), sans tenir compte de la casse. */
export function findLines(store: LineStore, query: string): number[] {
  if (!query) return [];
  const found: number[] = [];
  for (let index = 0; index < store.lines.length; index += 1) {
    if (store.text(index).toLocaleLowerCase().includes(query)) found.push(index);
  }
  return found;
}

const errorWord = /\b(?:ERROR|ERR|FATAL|CRITICAL|CRIT|SEVERE|PANIC|EMERG|ALERT|FAILURE|FAILED)\b/;
/** Formes usuelles : exceptions, `Error:` en préfixe, code de sortie non nul. */
const errorPhrase = /Exception\b|Error:|exit code [1-9]/;
const warningWord = /\b(?:WARN|WARNING)\b/;
const errorField =
  /(?:\b(?:level|lvl|severity|loglevel)["']?\s*[=:]\s*["']?(?:error|err|fatal|critical|crit|severe|panic)\b|[[<(](?:error|err|fatal|crit|critical|severe)[\]>)])/i;
const warningField = /(?:\b(?:level|lvl|severity|loglevel)["']?\s*[=:]\s*["']?(?:warn|warning)\b|[[<(](?:warn|warning)[\]>)])/i;

/**
 * Niveau d'une ligne de journal (texte sans ANSI) : mot-clé en majuscules (`ERROR`, `FAILURE`, `WARN`…), champ
 * `level=error` ou `[warn]`, exception ou code de sortie non nul ; sinon aucun (D-286).
 */
export function detectLevel(line: string): "error" | "warning" | undefined {
  if (errorWord.test(line) || errorField.test(line) || errorPhrase.test(line)) return "error";
  if (warningWord.test(line) || warningField.test(line)) return "warning";
  return undefined;
}
