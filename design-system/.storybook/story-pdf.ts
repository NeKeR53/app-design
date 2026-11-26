/*
 * Aides des stories qui montrent un PDF : pdf.js chargé à la demande (D-311) et un PDF minimal fabriqué pour la démo.
 */
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { PdfEngine } from "../src/components/DocumentViewer/pdf";

/** Ce qu'une app écrit une fois : pdf.js chargé à la demande, worker réglé par l'app (D-311). */
export const loadPdf = async (): Promise<PdfEngine> => {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
};

/** PDF minimal, fabriqué pour la démo : une page A4 par titre (texte ASCII). */
export function makePdf(titles: string[]): Uint8Array {
  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${titles.map((_, i) => `${4 + i * 2} 0 R`).join(" ")}] /Count ${titles.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  titles.forEach((title, i) => {
    const lines = Array.from({ length: 14 }, (_, k) => `72 ${640 - k * 28} ${k % 3 === 2 ? 300 : 451} 10 re f`).join("\n");
    const stream = `BT /F1 22 Tf 72 740 Td (${title}) Tj ET\nBT /F1 11 Tf 72 700 Td (Page ${i + 1} sur ${titles.length}) Tj ET\n0.82 g\n${lines}`;
    objects[4 + i * 2] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5 + i * 2} 0 R >>`;
    objects[5 + i * 2] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let k = 1; k < objects.length; k += 1) {
    offsets.push(out.length);
    out += `${k} 0 obj\n${objects[k]}\nendobj\n`;
  }
  const xref = out.length;
  out += `xref\n0 ${objects.length}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(out);
}
