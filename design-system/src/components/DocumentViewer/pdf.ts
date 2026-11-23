/*
 * Accès à pdf.js, fourni par l'app (D-311). Socle n'importe jamais `pdfjs-dist` :
 * les types ci-dessous décrivent la seule partie de son API utilisée ici.
 */

/** Ce que DocumentViewer utilise de pdf.js : le module `pdfjs-dist` convient tel quel. */
export interface PdfEngine {
  getDocument(source: { data: Uint8Array }): {
    promise: Promise<PdfDocumentHandle>;
    destroy(): unknown;
  };
}

export interface PdfDocumentHandle {
  numPages: number;
  getPage(number: number): Promise<PdfPageHandle>;
}

export interface PdfPageHandle {
  getViewport(options: { scale: number }): { width: number; height: number };
  render(parameters: {
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    viewport: never;
    transform?: number[];
  }): { promise: Promise<unknown>; cancel(): void };
}

export interface PdfPageSize {
  width: number;
  height: number;
}

/** Erreur de lecture, traduite par le composant. */
export type PdfErrorKind = "password" | "invalid" | "unavailable" | "read";

export class DocumentError extends Error {
  constructor(public readonly kind: PdfErrorKind) {
    super(kind);
  }
}

/** Ouvre un PDF et mesure ses pages à l'échelle 1. */
export async function openPdf(
  loadPdf: (() => Promise<PdfEngine>) | undefined,
  bytes: Uint8Array,
): Promise<{ document: PdfDocumentHandle; sizes: PdfPageSize[]; destroy: () => void }> {
  if (!loadPdf) throw new DocumentError("unavailable");
  let engine: PdfEngine;
  try {
    engine = await loadPdf();
  } catch {
    throw new DocumentError("unavailable");
  }
  // pdf.js transfère le tampon reçu : une copie garde les octets de l'appelant intacts.
  const task = engine.getDocument({ data: bytes.slice() });
  const destroy = () => void task.destroy();
  try {
    const document = await task.promise;
    const sizes: PdfPageSize[] = [];
    for (let n = 1; n <= document.numPages; n += 1) {
      const viewport = (await document.getPage(n)).getViewport({ scale: 1 });
      sizes.push({ width: viewport.width, height: viewport.height });
    }
    return { document, sizes, destroy };
  } catch (cause) {
    destroy();
    const name = (cause as { name?: string } | null)?.name;
    if (name === "PasswordException") throw new DocumentError("password");
    if (name === "InvalidPDFException") throw new DocumentError("invalid");
    throw new DocumentError("read");
  }
}

/** Dessine une page dans un nouveau canevas ; `cancel` interrompt le dessin. */
export function renderPdfPage(document: PdfDocumentHandle, number: number, scale: number) {
  let cancelRender: (() => void) | undefined;
  let cancelled = false;
  const promise = (async () => {
    const page = await document.getPage(number);
    if (cancelled) throw new Error("cancelled");
    const viewport = page.getViewport({ scale });
    const ratio = window.devicePixelRatio || 1;
    const canvas = window.document.createElement("canvas");
    canvas.width = Math.floor(viewport.width * ratio);
    canvas.height = Math.floor(viewport.height * ratio);
    canvas.setAttribute("aria-hidden", "true");
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) throw new Error("canvas");
    const task = page.render({
      canvas,
      canvasContext,
      viewport: viewport as never,
      ...(ratio === 1 ? {} : { transform: [ratio, 0, 0, ratio, 0, 0] }),
    });
    cancelRender = () => task.cancel();
    await task.promise;
    return canvas;
  })();
  return {
    promise,
    cancel: () => {
      cancelled = true;
      cancelRender?.();
    },
  };
}
