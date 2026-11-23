import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { AttachmentChip, AttachmentList } from "./AttachmentChip";

/** Petite image en ligne (SVG). */
const IMAGE =
  "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60"><rect width="80" height="60" fill="#86b6ef"/><circle cx="40" cy="30" r="14" fill="#256abf"/></svg>');
const LONG_TEXT = Array.from({ length: 40 }, (_, i) => `Ligne ${i + 1} du journal collé`).join("\n");

const onRemove = fn();

const meta: Meta<typeof AttachmentChip> = {
  title: "Composants/AttachmentChip",
  component: AttachmentChip,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof AttachmentChip>;

const px = (el: Element, prop: string) => parseFloat(getComputedStyle(el).getPropertyValue(prop));

export const ParDefaut: Story = {
  render: () => (
    <AttachmentList>
      <AttachmentChip key="i" kind="image" name="capture.png" src={IMAGE} onRemove={() => {}} />
      <AttachmentChip key="f" kind="file" name="maquette.pdf" onRemove={() => {}} />
      <AttachmentChip key="t" kind="text" name="Texte collé 1" text={LONG_TEXT} onRemove={() => {}} />
    </AttachmentList>
  ),
};

/** Vignette de 56 px ; étiquette de 28 px ; × de 20 px ; liste nommée « Pièces jointes ». */
export const Anatomie: Story = {
  render: ParDefaut.render!,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const list = c.getByRole("list", { name: "Pièces jointes" });
    await expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    const img = c.getByRole("img", { name: "capture.png" });
    await expect(img.parentElement!.getBoundingClientRect().height).toBe(56);
    const file = canvasElement.querySelector('[data-attachment="file"]')!;
    await expect(file.getBoundingClientRect().height).toBe(28);
    await expect(px(file, "border-top-left-radius")).toBe(8);
    await expect(c.getByRole("button", { name: "Retirer maquette.pdf" }).getBoundingClientRect().width).toBe(20);
  },
};

/** Le × d'une vignette n'apparaît qu'au survol ou au focus ; il retire la pièce. */
export const RetraitImage: Story = {
  render: () => <AttachmentChip kind="image" name="capture.png" src={IMAGE} onRemove={onRemove} />,
  play: async ({ canvasElement }) => {
    onRemove.mockClear();
    const remove = within(canvasElement).getByRole("button", { name: "Retirer capture.png" });
    const holder = remove.closest("span")!;
    await expect(getComputedStyle(holder).opacity).toBe("0");
    await userEvent.tab();
    await expect(remove).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(holder).opacity).toBe("1"));
    await userEvent.keyboard("{Enter}");
    await expect(onRemove).toHaveBeenCalledTimes(1);
  },
};

/** Fichier : trombone, nom coupé au milieu (l'extension reste), × qui retire. */
export const Fichier: Story = {
  render: () => (
    <div className="w-[260px]">
      <AttachmentChip kind="file" name="rapport-trimestriel-des-ventes-2026-final.pdf" onRemove={onRemove} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    onRemove.mockClear();
    const name = canvasElement.querySelector("[data-attachment-name]")!;
    await expect(name.lastElementChild!.textContent).toBe("inal.pdf");
    await expect(name.getBoundingClientRect().width).toBeLessThanOrEqual(200);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Retirer rapport-trimestriel-des-ventes-2026-final.pdf" }));
    await expect(onRemove).toHaveBeenCalledTimes(1);
  },
};

/** Texte collé : « Texte collé 1 · n caractères » ouvre le texte en lecture seule dans une modale. */
export const TexteColle: Story = {
  render: () => <AttachmentChip kind="text" name="Texte collé 1" text={LONG_TEXT} onRemove={onRemove} />,
  play: async ({ canvasElement }) => {
    const open = within(canvasElement).getByRole("button", { name: /^Voir Texte collé 1 · / });
    await userEvent.click(open);
    const dialog = await within(document.body).findByRole("dialog");
    const area = within(dialog).getByRole("textbox", { name: "Contenu de Texte collé 1" });
    await expect(area).toHaveAttribute("readonly");
    await expect((area as HTMLTextAreaElement).value).toBe(LONG_TEXT);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(document.body).queryByRole("dialog")).toBeNull());
  },
};

/** En préparation : roue nommée ; en erreur : bord rouge et icône nommée par l'erreur. */
export const Etats: Story = {
  render: () => (
    <AttachmentList>
      <AttachmentChip key="a" kind="image" name="photo.jpg" status="pending" />
      <AttachmentChip key="b" kind="file" name="notes.txt" status="pending" />
      <AttachmentChip key="c" kind="file" name="archive.zip" status="error" error="Fichier trop lourd : 40 Mo, 25 Mo au plus." onRemove={() => {}} />
    </AttachmentList>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole("status")).toHaveLength(2);
    await expect(c.getByText("Préparation de photo.jpg")).toBeInTheDocument();
    await expect(c.getByText("Préparation de notes.txt")).toBeInTheDocument();
    await expect(c.getByRole("img", { name: "Fichier trop lourd : 40 Mo, 25 Mo au plus." })).toBeInTheDocument();
    const failed = canvasElement.querySelector('[data-status="error"]')!;
    const probe = document.createElement("span");
    probe.style.color = "var(--danger)";
    document.body.append(probe);
    await expect(getComputedStyle(failed).borderTopColor).toBe(getComputedStyle(probe).color);
    probe.remove();
  },
};

/** Sans `onRemove`, pas de × ; une pièce retirée sort de la liste. */
export const SansRetrait: Story = {
  render: () => {
    function Demo() {
      const [items, setItems] = useState(["a.pdf", "b.pdf"]);
      return (
        <AttachmentList>
          {items.map((n) => (
            <AttachmentChip key={n} kind="file" name={n} onRemove={() => setItems((all) => all.filter((x) => x !== n))} />
          ))}
          <AttachmentChip key="fixe" kind="file" name="fixe.pdf" />
        </AttachmentList>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("button", { name: "Retirer fixe.pdf" })).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Retirer a.pdf" }));
    await waitFor(() => expect(c.getAllByRole("listitem")).toHaveLength(2));
  },
};
