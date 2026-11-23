/*
 * Règles de FileUpload et FileList : types acceptés, taille, texte d'aide, icône du type.
 * Fonctions pures, sauf les icônes. Spec : FileUpload.spec.md.
 */
import { File, FileArchive, FileImage, FileText, Upload } from "../../icons";
import type { SocleMessages } from "../../i18n/messages";
import { formatValue } from "../FormattedValue/FormattedValue";

type Messages = Pick<SocleMessages, "locale" | "yes" | "no" | "justNow" | "fileKind" | "unknownFormat">;

/** Taille lisible : « 1,2 Mo » (même calcul que `FormattedValue` de type `bytes`). */
export function formatBytes(bytes: number, m: Pick<SocleMessages, "locale" | "yes" | "no" | "justNow">): string {
  return formatValue(bytes, { type: "bytes" }, m);
}

/** Extension en capitales (« PDF »), ou `null`. */
export function extensionOf(name: string): string | null {
  const i = name.lastIndexOf(".");
  return i > 0 && i < name.length - 1 ? name.slice(i + 1).toUpperCase() : null;
}

/** Vrai si le fichier correspond à un des motifs : `.pdf`, `image/*`, `application/pdf`. Sans motif : tout passe. */
export function isAccepted(file: { name: string; type: string }, accept: ReadonlyArray<string> | undefined): boolean {
  if (!accept || accept.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.some((raw) => {
    const p = raw.trim().toLowerCase();
    if (p.startsWith(".")) return name.endsWith(p);
    if (p.endsWith("/*")) return type.startsWith(p.slice(0, -1));
    return type === p;
  });
}

const KINDS = ["image", "video", "audio", "text"] as const;
type Kind = (typeof KINDS)[number];

/** Nom court d'un motif : `.pdf` et `application/pdf` → « PDF », `image/*` → « image ». */
function patternName(raw: string, m: Messages): string {
  const p = raw.trim().toLowerCase();
  if (p.startsWith(".")) return p.slice(1).toUpperCase();
  const [major, minor] = p.split("/");
  if (minor === "*" && (KINDS as ReadonlyArray<string>).includes(major ?? "")) return m.fileKind(major as Kind);
  const sub = (minor ?? major ?? p).replace(/^x-/, "").split(/[.+-]/).pop() ?? p;
  return sub.toUpperCase();
}

/** Types acceptés en clair : « PDF ou image ». Doublons retirés. */
export function acceptText(accept: ReadonlyArray<string>, m: Messages): string {
  const names = [...new Set(accept.map((a) => patternName(a, m)))];
  return new Intl.ListFormat(m.locale, { type: "disjunction" }).format(names);
}

/** Type affiché dans une erreur : l'extension, sinon le sous-type, sinon « inconnu ». */
export function typeName(file: { name: string; type: string }, m: Messages): string {
  return extensionOf(file.name) ?? (file.type ? patternName(file.type, m) : m.unknownFormat);
}

export type FileVisual = "image" | "document" | "archive" | "file";

const DOCS = new Set(["PDF", "DOC", "DOCX", "ODT", "RTF", "TXT", "MD", "XLS", "XLSX", "ODS", "CSV", "PPT", "PPTX", "ODP"]);
const ARCHIVES = new Set(["ZIP", "RAR", "7Z", "TAR", "GZ", "TGZ", "BZ2", "XZ"]);

/** Famille d'icône d'un fichier, par son type MIME puis son extension. */
export function visualOf(file: { name: string; type?: string | undefined }): FileVisual {
  const type = file.type ?? "";
  const ext = extensionOf(file.name) ?? "";
  if (type.startsWith("image/")) return "image";
  if (ARCHIVES.has(ext) || /zip|compressed|tar|rar/.test(type)) return "archive";
  if (DOCS.has(ext) || type.startsWith("text/") || type === "application/pdf") return "document";
  return "file";
}

/** Icône du type de fichier, 16 px, décorative. Un thème peut la remplacer (D-338). */
export function FileTypeIcon({ visual }: { visual: FileVisual }) {
  switch (visual) {
    case "image":
      return <FileImage />;
    case "document":
      return <FileText />;
    case "archive":
      return <FileArchive />;
    default:
      return <File />;
  }
}

/** Icône de la zone de dépôt (flèche vers le haut), décorative. */
export const UploadIcon = Upload;
