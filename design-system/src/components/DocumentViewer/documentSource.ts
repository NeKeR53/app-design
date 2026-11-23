/*
 * Lecture de la source d'un DocumentViewer. Spec : DocumentViewer.spec.md (D-310).
 */

/** Ce que la visionneuse sait afficher. */
export type DocumentFormat = "pdf" | "image";

/** Octets d'un document : un `Blob` (un `File` déposé), un tampon ou un tableau d'octets. */
export type DocumentData = Blob | ArrayBuffer | Uint8Array;

/** Document lu, prêt à être affiché. */
export type LoadedDocument =
  | { format: "pdf"; name: string; mime: string; bytes: Uint8Array }
  | { format: "image"; name: string; mime: string; url: string }
  | { format: null; name: string; mime: string };

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "svg", "ico"]);

/** Extension en minuscules, sans le point ; `undefined` sans extension. */
export function extensionOf(name: string | undefined): string | undefined {
  return name?.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
}

/** Format d'après le type MIME, puis l'extension du nom ; `null` pour un format non pris en charge (D-310). */
export function detectFormat(mime: string | undefined, name: string | undefined): DocumentFormat | null {
  const type = (mime ?? "").split(";")[0]!.trim().toLowerCase();
  if (type === "application/pdf") return "pdf";
  if (type.startsWith("image/")) return "image";
  const extension = extensionOf(name);
  if (extension === "pdf") return "pdf";
  if (extension && IMAGE_EXTENSIONS.has(extension)) return "image";
  return null;
}

function base64Bytes(data: string): Uint8Array {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Lit une adresse `data:` sans `fetch`, qu'un cadre restreint peut refuser. */
export function parseDataUrl(url: string): { mime: string; bytes: Uint8Array } {
  const match = url.match(/^data:([^,]*),(.*)$/s);
  if (!match) throw new Error("data: URL");
  const meta = match[1]!.split(";");
  const mime = meta[0] || "text/plain";
  const base64 = meta.slice(1).some((part) => part.toLowerCase() === "base64");
  const bytes = base64 ? base64Bytes(match[2]!) : new TextEncoder().encode(decodeURIComponent(match[2]!));
  return { mime, bytes };
}

function toBytes(data: ArrayBuffer | Uint8Array): Uint8Array {
  return data instanceof Uint8Array ? data : new Uint8Array(data);
}

/**
 * Lit la source. `track` reçoit les adresses `blob:` créées ici : l'appelant les libère
 * quand le document n'est plus affiché.
 */
export async function loadDocument(
  source: { src: string } | { data: DocumentData },
  options: { name?: string | undefined; type?: string | undefined; track: (url: string) => void },
): Promise<LoadedDocument> {
  if ("data" in source) {
    const { data } = source;
    if (data instanceof Blob) {
      const name = options.name ?? (data as Partial<File>).name ?? "";
      const mime = options.type ?? data.type;
      const format = detectFormat(mime, name);
      if (format === "pdf") return { format, name, mime, bytes: new Uint8Array(await data.arrayBuffer()) };
      if (format === "image") {
        const url = URL.createObjectURL(data);
        options.track(url);
        return { format, name, mime, url };
      }
      return { format: null, name, mime };
    }
    const name = options.name ?? "";
    const mime = options.type ?? "";
    const format = detectFormat(mime, name);
    if (format === "pdf") return { format, name, mime, bytes: toBytes(data) };
    if (format === "image") {
      const url = URL.createObjectURL(new Blob([toBytes(data) as BlobPart], mime ? { type: mime } : {}));
      options.track(url);
      return { format, name, mime, url };
    }
    return { format: null, name, mime };
  }

  const { src } = source;
  const name = options.name ?? decodeURIComponent(src.match(/^[a-z]+:\/\/[^?#]*\/([^/?#]+)/i)?.[1] ?? "");
  if (/^data:/i.test(src)) {
    const parsed = parseDataUrl(src);
    const mime = options.type ?? parsed.mime;
    const format = detectFormat(mime, name);
    if (format === "pdf") return { format, name, mime, bytes: parsed.bytes };
    if (format === "image") return { format, name, mime, url: src };
    return { format: null, name, mime };
  }
  // Une image s'affiche par son adresse, sans la lire.
  const known = detectFormat(options.type, name);
  if (known === "image") return { format: known, name, mime: options.type ?? "", url: src };
  const response = await fetch(src);
  if (!response.ok) throw new Error(String(response.status));
  const blob = await response.blob();
  return loadDocument({ data: blob }, { ...options, name, type: options.type ?? (blob.type || undefined) });
}
