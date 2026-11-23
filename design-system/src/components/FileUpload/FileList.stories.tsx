import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { FileList, type FileItem } from "./FileList";
import { visualOf } from "./files";
import { ThemeIconsContext } from "../../icons";

const meta: Meta<typeof FileList> = {
  title: "Composants/Champs/FileList",
  component: FileList,
  parameters: { layout: "padded" },
  decorators: [(S) => <div className="w-[360px]">{S()}</div>],
};
export default meta;
type Story = StoryObj<typeof FileList>;

const files: FileItem[] = [
  { id: "1", name: "Devis-2026-114.pdf", size: 1200 * 1000, type: "application/pdf", status: "done" },
  { id: "2", name: "Plan-atelier.png", size: 3400 * 1000, type: "image/png", status: "uploading", progress: 60 },
  { id: "3", name: "Archive.zip", size: 800 * 1000, status: "error", error: "Type non accepté : ZIP." },
  { id: "4", name: "Contrat.docx", size: 52 * 1000, status: "pending" },
];

/** Une ligne par fichier : icône du type, nom, taille ; barre fine pendant l'envoi ; erreur sous le nom (D-357). */
export const ParDefaut: Story = {
  args: { files, onRemove: fn(), onRetry: fn() },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const list = c.getByRole("list", { name: "Fichiers" });
    const rows = within(list).getAllByRole("listitem");
    await expect(rows).toHaveLength(4);
    await expect(rows[0]).toHaveTextContent("Devis-2026-114.pdf");
    await expect(rows[0]).toHaveTextContent("1,2 Mo");
    await expect(rows[0]!.querySelector("svg")).not.toBeNull();
    // Envoi : barre de 3 px, valeur 60 et « Envoi : 60 % ».
    const bar = within(rows[1]!).getByRole("progressbar", { name: "Envoi de Plan-atelier.png" });
    await expect(bar).toHaveAttribute("aria-valuenow", "60");
    await expect(bar.getBoundingClientRect().height).toBe(3);
    await expect(rows[1]).toHaveTextContent(/Envoi : 60\s%/);
    // Erreur sous le nom, en --danger, et « Réessayer ».
    await expect(rows[2]).toHaveTextContent("Type non accepté : ZIP.");
    await expect(within(rows[2]!).getByRole("button", { name: "Réessayer Archive.zip" })).toBeVisible();
    await expect(within(rows[0]!).queryByRole("button", { name: /Réessayer/ })).toBeNull();
    await expect(rows[3]).toHaveTextContent("En attente");
  },
};

/** × « Retirer <nom> » et « Réessayer » rendent l'identifiant du fichier. */
export const Actions: Story = {
  args: { files, onRemove: fn(), onRetry: fn() },
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Retirer Plan-atelier.png" }));
    await expect(args.onRemove).toHaveBeenCalledWith("2");
    await userEvent.click(c.getByRole("button", { name: "Réessayer Archive.zip" }));
    await expect(args.onRetry).toHaveBeenCalledWith("3");
  },
};

/** Sans `onRemove` ni `onRetry` : pas de bouton (liste en lecture). */
export const Lecture: Story = {
  args: { files },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button")).toBeNull();
  },
};

/** Nom trop long : coupé au milieu, l'extension reste ; nom complet en info-bulle au survol et dans le nom du ×. */
export const NomLong: Story = {
  args: {
    files: [{ id: "l", name: "Compte-rendu-de-la-reunion-de-chantier-du-12-novembre-2026-version-finale.pdf", size: 240 * 1000 }],
    onRemove: fn(),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const name = canvasElement.querySelector<HTMLElement>("[data-file-name]")!;
    const [head, tail] = [...name.children] as HTMLElement[];
    await expect(head!.scrollWidth).toBeGreaterThan(head!.clientWidth);
    await expect(tail).toHaveTextContent("nale.pdf");
    await expect(tail).toBeVisible();
    await userEvent.hover(head!);
    await waitFor(() => expect(within(document.body).getByRole("tooltip")).toHaveTextContent(/version-finale\.pdf$/), { timeout: 2000 });
    await userEvent.unhover(head!);
    await expect(c.getByRole("button", { name: /^Retirer Compte-rendu-.*-version-finale\.pdf$/ })).toBeVisible();
  },
};

/** Icône selon le type : image, document, archive, autre. */
export const Icones: Story = {
  args: {
    files: [
      { id: "a", name: "photo.jpg", type: "image/jpeg" },
      { id: "b", name: "note.txt" },
      { id: "c", name: "lot.7z" },
      { id: "d", name: "donnees.bin" },
    ],
  },
  play: async () => {
    await expect(visualOf({ name: "photo.jpg", type: "image/jpeg" })).toBe("image");
    await expect(visualOf({ name: "note.txt" })).toBe("document");
    await expect(visualOf({ name: "lot.7z" })).toBe("archive");
    await expect(visualOf({ name: "donnees.bin" })).toBe("file");
  },
};

/** Icônes de type internes : un thème peut les remplacer (D-338) ; sans thème, tracés Lucide. */
export const IconesDuTheme: Story = {
  args: { files: [{ id: "a", name: "photo.jpg", type: "image/jpeg" }, { id: "b", name: "note.txt" }] },
  render: (args) => (
    <ThemeIconsContext.Provider value={{ viewBox: "0 0 16 16", paths: { FileImage: "M2 2h12v12H2z" } }}>
      <FileList {...args} />
    </ThemeIconsContext.Provider>
  ),
  play: async ({ canvasElement }) => {
    const icons = [...canvasElement.querySelectorAll("li")].map((li) => li.querySelector("svg"));
    await expect(icons[0]?.getAttribute("data-icon-source")).toBe("theme");
    await expect(icons[0]?.querySelector("path")?.getAttribute("d")).toBe("M2 2h12v12H2z");
    await expect(icons[1]?.getAttribute("viewBox")).toBe("0 0 24 24");
  },
};

/** Changement d'état annoncé poliment (« Devis.pdf : Envoyé ») ; rien n'est lu à l'affichage ni pendant l'avancement. */
export const Annonce: Story = {
  render: () => {
    const [list, setList] = useState<FileItem[]>([{ id: "d", name: "Devis.pdf", status: "uploading", progress: 10 }]);
    return (
      <div className="flex flex-col gap-2">
        <FileList files={list} />
        <button type="button" onClick={() => setList([{ id: "d", name: "Devis.pdf", status: "uploading", progress: 70 }])}>
          Avancer
        </button>
        <button type="button" onClick={() => setList([{ id: "d", name: "Devis.pdf", status: "done" }])}>
          Terminer
        </button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const live = canvasElement.querySelector<HTMLElement>('[aria-live="polite"]')!;
    await expect(live).toBeEmptyDOMElement();
    await userEvent.click(c.getByText("Avancer"));
    await expect(live).toBeEmptyDOMElement();
    await userEvent.click(c.getByText("Terminer"));
    await waitFor(() => expect(live).toHaveTextContent("Devis.pdf : Envoyé"));
  },
};
