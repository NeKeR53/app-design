import type { Meta, StoryObj } from "@storybook/react-vite";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ExternalArrow } from "../../icons";
import { DocumentViewer } from "./DocumentViewer";
import type { PdfEngine } from "./pdf";

/** Ce qu'une app écrit une fois : pdf.js chargé à la demande, worker réglé par l'app (D-311). */
const loadPdf = async (): Promise<PdfEngine> => {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
};

/** PDF minimal, fabriqué pour la démo : une page A4 par titre (texte ASCII). */
function makePdf(titles: string[]): Uint8Array {
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

const invoice = makePdf(["Facture F-2026-114", "Conditions generales", "Annexe"]);
const pdfBlob = () => new Blob([invoice as BlobPart], { type: "application/pdf" });
const svg = (w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#e8eef9"/><path d="M0 ${h} L${w / 3} ${h / 3} L${w / 2} ${h / 2} L${(2 * w) / 3} ${h / 4} L${w} ${h}Z" fill="#7a9cd6"/></svg>`,
  )}`;

const meta: Meta<typeof DocumentViewer> = {
  title: "Composants/DocumentViewer",
  component: DocumentViewer,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof DocumentViewer>;

const pressed = (el: HTMLElement) => el.getAttribute("aria-pressed");

/** PDF de 3 pages, ajusté à la largeur ; la page reste blanche dans les deux modes (D-314, D-315). */
export const Pdf: Story = {
  args: { label: "Facture F-2026-114", data: pdfBlob(), name: "Facture F-2026-114.pdf", loadPdf, onDownload: fn() },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByText("Page 1 / 3")).toBeVisible(), { timeout: 8000 });
    await expect(c.getByRole("document", { name: "Facture F-2026-114, 3 pages" })).toBeVisible();
    const first = canvasElement.querySelector<HTMLElement>('[data-page="1"]')!;
    await waitFor(() => expect(first.querySelector("canvas")).not.toBeNull(), { timeout: 8000 });
    await expect(getComputedStyle(first).backgroundColor).toBe("rgb(255, 255, 255)");
    await expect(pressed(c.getByRole("button", { name: "Ajuster à la largeur" }))).toBe("true");
  },
};

/** Page précédente et suivante ; la position suit la page en haut de la zone (D-314). */
export const Pages: Story = {
  args: { label: "Facture F-2026-114", data: pdfBlob(), name: "Facture.pdf", loadPdf },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByText("Page 1 / 3")).toBeVisible(), { timeout: 8000 });
    await expect(c.getByRole("button", { name: "Page précédente" })).toBeDisabled();
    await userEvent.click(c.getByRole("button", { name: "Page suivante" }));
    await waitFor(() => expect(c.getByText("Page 2 / 3")).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: "Page suivante" }));
    await waitFor(() => expect(c.getByText("Page 3 / 3")).toBeVisible());
    await expect(c.getByRole("button", { name: "Page suivante" })).toBeDisabled();
  },
};

/** Paliers de 25 à 400 % ; boutons désactivés aux bornes (D-313). */
export const Zoom: Story = {
  args: { label: "Plan", src: svg(800, 500), name: "Plan.svg" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const out = await c.findByRole("button", { name: "Zoom arrière" });
    await waitFor(() => expect(out).toBeEnabled());
    for (let i = 0; i < 8; i += 1) if (!(out as HTMLButtonElement).disabled) await userEvent.click(out);
    await expect(c.getByText("25 %")).toBeVisible();
    await expect(out).toBeDisabled();
    await expect(pressed(c.getByRole("button", { name: "Ajuster à la largeur" }))).toBe("false");
    await userEvent.click(c.getByRole("button", { name: "Zoom avant" }));
    await expect(c.getByText("50 %")).toBeVisible();
    await expect(canvasElement.querySelector("img")!.getBoundingClientRect().width).toBe(400);
  },
};

/** Ctrl/⌘ + « + », « − », « 0 » quand le focus est dans la visionneuse (D-313). */
export const ZoomClavier: Story = {
  args: { label: "Plan", src: svg(800, 500), name: "Plan.svg" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const zone = await c.findByRole("document", { name: "Plan" });
    await waitFor(() => expect(c.getByRole("button", { name: "Zoom avant" })).toBeEnabled());
    zone.focus();
    await userEvent.keyboard("{Control>}={/Control}");
    await expect(pressed(c.getByRole("button", { name: "Ajuster à la largeur" }))).toBe("false");
    await userEvent.keyboard("{Control>}0{/Control}");
    await expect(pressed(c.getByRole("button", { name: "Ajuster à la largeur" }))).toBe("true");
  },
};

/** Image plus petite que la zone : jamais agrandie en mode ajusté (D-313). */
export const ImagePetite: Story = {
  args: { label: "Logo", src: svg(200, 120), name: "Logo.svg" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByText("100 %")).toBeVisible());
    await expect(c.getByText("Logo.svg")).toBeVisible();
    await expect(c.getByRole("img", { name: "Logo" }).getBoundingClientRect().width).toBe(200);
  },
};

/** Format inconnu : message, extension et « Télécharger » (D-310). */
export const FormatInconnu: Story = {
  args: {
    label: "Export",
    data: new Blob(["a;b"], { type: "application/vnd.ms-excel" }),
    name: "Export.xlsx",
    onDownload: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(await c.findByText("Format non pris en charge")).toBeVisible();
    await expect(c.getByText("Ce type de fichier (.xlsx) ne s'affiche pas ici.")).toBeVisible();
    const buttons = c.getAllByRole("button", { name: "Télécharger" });
    await userEvent.click(buttons[buttons.length - 1]!);
    await expect(args.onDownload).toHaveBeenCalledOnce();
  },
};

/** Sans `loadPdf`, un PDF ne s'affiche pas (D-311). */
export const SansPdfJs: Story = {
  args: { label: "Facture", data: pdfBlob(), name: "Facture.pdf" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(await c.findByText("Aperçu PDF indisponible dans cette app.")).toBeVisible();
  },
};

/** PDF abîmé : cause, « Réessayer », et « Télécharger » reste dans la barre (D-316). */
export const Erreur: Story = {
  args: {
    label: "Rapport",
    data: new Blob(["%PDF-1.4 abîmé"], { type: "application/pdf" }),
    name: "Rapport.pdf",
    loadPdf,
    onDownload: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByText("Document illisible")).toBeVisible(), { timeout: 8000 });
    await expect(c.getByRole("button", { name: "Réessayer" })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Télécharger" }));
    await expect(args.onDownload).toHaveBeenCalledOnce();
    await userEvent.click(c.getByRole("button", { name: "Réessayer" }));
    await waitFor(() => expect(c.getByText("Document illisible")).toBeVisible(), { timeout: 8000 });
  },
};

/** Lecture en cours : squelette en forme de page, après 200 ms (D-316). */
export const Chargement: Story = {
  args: { label: "Facture", data: pdfBlob(), name: "Facture.pdf", loadPdf: () => new Promise<PdfEngine>(() => undefined) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("status", { name: "Lecture du document…" })).toHaveAttribute("aria-busy", "true");
  },
};

/** Actions de l'app à la fin de la barre, rangées par ActionBar (D-312). */
export const AvecActions: Story = {
  args: {
    label: "Facture F-2026-114",
    data: pdfBlob(),
    name: "Facture F-2026-114.pdf",
    loadPdf,
    onDownload: fn(),
    actions: [{ id: "open", label: "Ouvrir avec l'application du système", icon: <ExternalArrow />, onPress: fn() }],
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("button", { name: "Ouvrir avec l'application du système" })).toBeVisible();
  },
};

/** En situation : `height="fill"` dans un panneau qui occupe la hauteur. */
export const EnSituation: Story = {
  render: () => (
    <div className="flex h-[640px] gap-3">
      <div className="w-56 shrink-0 rounded-lg border border-line p-2 text-sm text-fg-2">Pièces jointes</div>
      <div className="flex min-w-0 flex-1 flex-col">
        <DocumentViewer label="Facture F-2026-114" data={pdfBlob()} name="Facture F-2026-114.pdf" loadPdf={loadPdf} onDownload={fn()} height="fill" />
      </div>
    </div>
  ),
};
