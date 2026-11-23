import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { FileUpload } from "./FileUpload";
import type { FileItem } from "./FileList";
import { acceptText, isAccepted } from "./files";
import { frenchMessages } from "../../i18n/messages";

const meta: Meta<typeof FileUpload> = {
  title: "Composants/Champs/FileUpload",
  component: FileUpload,
  parameters: { layout: "padded" },
  decorators: [(S) => <div className="w-[420px]">{S()}</div>],
};
export default meta;
type Story = StoryObj<typeof FileUpload>;

const MB = 1000 * 1000;

/** Fichier de test ; `size` imposée sans allouer la mémoire. */
function file(name: string, type: string, size = 1200 * 1000) {
  const f = new File(["x"], name, { type });
  Object.defineProperty(f, "size", { value: size });
  return f;
}

const zone = (root: HTMLElement) => root.querySelector<HTMLElement>("[data-dropzone]")!;
const input = (root: HTMLElement) => root.querySelector<HTMLInputElement>('input[type="file"]')!;

/**
 * Glisse des fichiers au-dessus de la zone (dragenter, dragover), puis les dépose si `drop`.
 * Un fichier créé en script n'a pas d'entrée de système de fichiers (`webkitGetAsEntry` rend null) :
 * le temps du dépôt, on en simule une, comme pour un fichier venu du bureau.
 */
function drag(target: HTMLElement, files: File[], drop = true) {
  const dt = new DataTransfer();
  files.forEach((f) => dt.items.add(f));
  const fire = (type: string) => target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dt, clientX: 10, clientY: 10 }));
  fire("dragenter");
  fire("dragover");
  if (!drop) return;
  const proto = DataTransferItem.prototype as { webkitGetAsEntry: () => unknown };
  const original = proto.webkitGetAsEntry;
  proto.webkitGetAsEntry = function (this: DataTransferItem) {
    return original.call(this) ?? { isFile: true, isDirectory: false };
  };
  try {
    fire("drop");
  } finally {
    proto.webkitGetAsEntry = original;
  }
}

const pdfOrImage = { label: "Pièces jointes", accept: ["application/pdf", "image/*"], maxSize: 10 * MB, multiple: true };

/** Zone en pointillés : phrase et bouton, types et taille maximale écrits dans la zone (D-357). */
export const ParDefaut: Story = {
  args: { ...pdfOrImage, onAdd: fn() },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("group", { name: /Pièces jointes/ })).toBeVisible();
    await expect(c.getByText("Pièces jointes")).toHaveTextContent("Pièces jointes (facultatif)");
    await expect(zone(canvasElement)).toHaveTextContent("Déposez des fichiers ici ou choisir des fichiers");
    await expect(zone(canvasElement)).toHaveTextContent("PDF ou image, 10 Mo au plus");
    await expect(getComputedStyle(zone(canvasElement)).borderTopStyle).toBe("dashed");
    const button = c.getByRole("button", { name: "choisir des fichiers" });
    await expect(button).toHaveAccessibleDescription(/^PDF ou image, 10\s?Mo au plus$/);
    await expect(input(canvasElement)).toHaveAttribute("accept", "application/pdf,image/*");
    await expect(input(canvasElement)).toHaveAttribute("multiple");
  },
};

/** Texte des types construit à partir de `accept` ; vérification des motifs. */
export const Types: Story = {
  args: { label: "Justificatif", accept: [".pdf", ".docx", "image/png"], onAdd: fn() },
  play: async ({ canvasElement }) => {
    await expect(zone(canvasElement)).toHaveTextContent("PDF, DOCX ou PNG");
    await expect(acceptText(["video/*", "text/*"], frenchMessages)).toBe("vidéo ou texte");
    await expect(isAccepted({ name: "a.PDF", type: "" }, [".pdf"])).toBe(true);
    await expect(isAccepted({ name: "a.png", type: "image/png" }, ["image/*"])).toBe(true);
    await expect(isAccepted({ name: "a.zip", type: "application/zip" }, ["image/*", ".pdf"])).toBe(false);
    await expect(isAccepted({ name: "a.zip", type: "application/zip" }, undefined)).toBe(true);
  },
};

/** Au clavier : Tab atteint le bouton ; le choix passe par la boîte de dialogue du système (ici simulée). */
export const Choisir: Story = {
  args: { ...pdfOrImage, onAdd: fn() },
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    const button = c.getByRole("button", { name: "choisir des fichiers" });
    await userEvent.tab();
    await userEvent.tab();
    await expect(button).toHaveFocus();
    const devis = file("Devis-2026-114.pdf", "application/pdf");
    await userEvent.upload(input(canvasElement), [devis]);
    await expect(args.onAdd).toHaveBeenCalledWith([devis]);
  },
};

/** Type et taille vérifiés avant `onAdd` : les fichiers refusés sont listés avec leur erreur, jamais transmis. */
export const Refus: Story = {
  args: { ...pdfOrImage, onAdd: fn() },
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    const ok = file("Plan-atelier.png", "image/png");
    drag(zone(canvasElement), [ok, file("Archive.zip", "application/zip"), file("Scan.pdf", "application/pdf", 12 * MB)]);
    await waitFor(() => expect(args.onAdd).toHaveBeenCalledTimes(1));
    await expect(args.onAdd).toHaveBeenCalledWith([ok]);
    const list = c.getByRole("list", { name: "Fichiers refusés" });
    await expect(list).toHaveTextContent("Type non accepté : ZIP.");
    await expect(list).toHaveTextContent(/Fichier trop lourd : 12\s?Mo, 10\s?Mo au plus\./);
    // Annonce polie des refus.
    await waitFor(() => expect(canvasElement.querySelector('[aria-live="polite"]:not(:empty)')).toHaveTextContent("Archive.zip : Type non accepté : ZIP."));
    // × retire la ligne refusée.
    await userEvent.click(c.getByRole("button", { name: "Retirer Archive.zip" }));
    await expect(list).not.toHaveTextContent("Archive.zip");
    // Un nouvel essai remplace la liste des refus.
    await userEvent.upload(input(canvasElement), [file("Note.pdf", "application/pdf")]);
    await expect(c.queryByRole("list", { name: "Fichiers refusés" })).toBeNull();
  },
};

/** Glisser-déposer : la zone se marque au survol d'un fichier glissé, puis transmet les fichiers déposés. */
export const Depot: Story = {
  args: { ...pdfOrImage, onAdd: fn() },
  play: async ({ args, canvasElement }) => {
    const z = zone(canvasElement);
    const before = getComputedStyle(z).borderTopStyle;
    await expect(before).toBe("dashed");
    const devis = file("Devis.pdf", "application/pdf");
    drag(z, [devis], false);
    await waitFor(() => expect(z).toHaveAttribute("data-drop-target"));
    await expect(getComputedStyle(z).borderTopStyle).toBe("solid");
    drag(z, [devis]);
    await waitFor(() => expect(args.onAdd).toHaveBeenCalled());
    const sent = (args.onAdd as ReturnType<typeof fn>).mock.calls.at(-1)![0] as File[];
    await expect(sent.map((f) => f.name)).toEqual(["Devis.pdf"]);
    await waitFor(() => expect(z).not.toHaveAttribute("data-drop-target"));
  },
};

/** Sans `multiple` : un seul fichier ; les suivants sont refusés. */
export const UnSeul: Story = {
  args: { label: "Devis signé", isRequired: true, accept: [".pdf"], onAdd: fn() },
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    await expect(zone(canvasElement)).toHaveTextContent("Déposez un fichier ici ou choisir un fichier");
    await expect(c.getByText("Devis signé")).not.toHaveTextContent("(facultatif)");
    drag(zone(canvasElement), [file("A.pdf", "application/pdf"), file("B.pdf", "application/pdf")]);
    await waitFor(() => expect(args.onAdd).toHaveBeenCalled());
    const sent = (args.onAdd as ReturnType<typeof fn>).mock.calls.at(-1)![0] as File[];
    await expect(sent.map((f) => f.name)).toEqual(["A.pdf"]);
    await expect(c.getByRole("list", { name: "Fichiers refusés" })).toHaveTextContent("Un seul fichier à la fois.");
  },
};

/** Aide sous la zone ; erreur de l'app à sa place, zone en `--danger` ; désactivée à 40 %. */
export const Etats: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <FileUpload label="Avec aide" description="Le devis signé par le client." onAdd={() => {}} />
      <FileUpload label="En erreur" isRequired error="Ajoutez le devis signé." description="Cachée par l'erreur" onAdd={() => {}} />
      <FileUpload label="Désactivée" isDisabled onAdd={() => {}} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Le devis signé par le client.")).toBeVisible();
    await expect(c.getByText("Ajoutez le devis signé.")).toBeVisible();
    await expect(c.queryByText("Cachée par l'erreur")).toBeNull();
    const err = c.getByRole("group", { name: /En erreur/ });
    const danger = getComputedStyle(c.getByText("Ajoutez le devis signé.")).color;
    await expect(getComputedStyle(err.querySelector<HTMLElement>("[data-dropzone]")!).borderTopColor).toBe(danger);
    await expect(within(err).getByRole("button", { name: "choisir un fichier" })).toHaveAccessibleDescription("Ajoutez le devis signé.");
    const off = c.getByRole("group", { name: /Désactivée/ });
    await expect(getComputedStyle(off).opacity).toBe("0.4");
    await expect(within(off).getByRole("button", { name: "choisir un fichier" })).toBeDisabled();
  },
};

/** Parcours complet : l'app reçoit les fichiers et rend leur état (envoi, envoyé, erreur, réessayer). */
export const Parcours: Story = {
  render: () => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const set = (id: string, patch: Partial<FileItem>) => setFiles((l) => l.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    return (
      <div className="flex flex-col gap-3">
        <FileUpload
          {...pdfOrImage}
          files={files}
          onAdd={(added) => setFiles((l) => [...l, ...added.map((f) => ({ id: f.name, name: f.name, size: f.size, type: f.type, status: "uploading" as const, progress: 40 }))])}
          onRemove={(id) => setFiles((l) => l.filter((f) => f.id !== id))}
          onRetry={(id) => set(id, { status: "uploading", progress: 0 })}
        />
        <div className="flex gap-2">
          <button type="button" onClick={() => files[0] && set(files[0].id, { status: "done" })}>
            Terminer
          </button>
          <button type="button" onClick={() => files[0] && set(files[0].id, { status: "error", error: "Le serveur ne répond pas." })}>
            Échouer
          </button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.upload(input(canvasElement), [file("Devis-2026-114.pdf", "application/pdf")]);
    const list = c.getByRole("list", { name: "Fichiers" });
    await expect(within(list).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
    await userEvent.click(c.getByText("Échouer"));
    await expect(list).toHaveTextContent("Le serveur ne répond pas.");
    await waitFor(() => expect(canvasElement.querySelector('[aria-live="polite"]:not(:empty)')).toHaveTextContent("Devis-2026-114.pdf : Le serveur ne répond pas."));
    await userEvent.click(c.getByRole("button", { name: "Réessayer Devis-2026-114.pdf" }));
    await expect(within(list).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    await userEvent.click(c.getByText("Terminer"));
    await expect(within(list).queryByRole("progressbar")).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Retirer Devis-2026-114.pdf" }));
    await expect(c.queryByRole("list", { name: "Fichiers" })).toBeNull();
  },
};
