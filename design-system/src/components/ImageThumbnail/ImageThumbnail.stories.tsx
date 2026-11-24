import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ImageGallery, ImageThumbnail, type ImageGalleryItem } from "./ImageThumbnail";

/** Image factice en ligne (SVG), générique. */
const picture = (w: number, h: number, bg: string, fg: string, text: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${bg}"/><rect x="${w * 0.08}" y="${h * 0.06}" width="${w * 0.84}" height="${h * 0.1}" rx="8" fill="${fg}" opacity=".8"/><rect x="${w * 0.08}" y="${h * 0.22}" width="${w * 0.5}" height="${h * 0.4}" rx="10" fill="${fg}" opacity=".45"/><text x="${w / 2}" y="${h * 0.9}" font-family="sans-serif" font-size="${Math.round(h * 0.06)}" text-anchor="middle" fill="${fg}">${text}</text></svg>`,
  );
const MOCKUP = picture(800, 600, "#d9e7fb", "#1d4ed8", "maquette");
const RENDER = picture(1600, 900, "#ffe4e6", "#9f1239", "rendu");
const BROKEN = "data:image/png;base64,AAAA";
const PAGES = ["Accueil", "Tarifs", "Contact", "Aide — questions fréquentes et assistance en ligne", "Blog"];
const COLORS = [["#e6f4ea", "#13612f"], ["#eeeeee", "#333333"], ["#f3e8ff", "#6d28d9"], ["#fff7d6", "#8a6500"], ["#e0f2fe", "#075985"]] as const;
const CAPTURES: ImageGalleryItem[] = PAGES.map((page, i) => ({
  id: `c${i}`,
  src: picture(1280, 2400, COLORS[i]![0], COLORS[i]![1], page.split(" ")[0]!),
  alt: `${page.split(" — ")[0]} — exemple.com`,
  caption: page,
}));

const onDownload = fn();
const onRetry = fn();
const onView = fn();

const meta: Meta<typeof ImageThumbnail> = {
  title: "Composants/ImageThumbnail",
  component: ImageThumbnail,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof ImageThumbnail>;

const body = () => within(document.body);

export const ParDefaut: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      <ImageThumbnail src={RENDER} alt="rendu-final.png" />
      <ImageThumbnail src={MOCKUP} alt="maquette.png" shape="square" />
      <ImageThumbnail src={CAPTURES[0]!.src} alt="Accueil — exemple.com" shape="page" caption="Accueil" />
    </div>
  ),
};

/** Trois formes : 360 px en 4:3, 160 px carrée, 160 px en 16:10 (D-383). */
export const Formes: Story = {
  render: ParDefaut.render!,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const size = (name: string) => c.getByRole("button", { name }).getBoundingClientRect();
    await waitFor(() => expect(c.getAllByRole("button")).toHaveLength(3));
    await expect(size("Agrandir rendu-final.png").width).toBe(360);
    await expect(size("Agrandir rendu-final.png").height).toBe(270);
    await expect(size("Agrandir maquette.png").width).toBe(160);
    await expect(size("Agrandir maquette.png").height).toBe(160);
    await expect(size("Agrandir Accueil — exemple.com").height).toBe(100);
    await expect(getComputedStyle(c.getByRole("img", { name: "rendu-final.png" })).objectFit).toBe("contain");
    await expect(getComputedStyle(c.getByRole("img", { name: "Accueil — exemple.com" })).objectPosition).toBe("50% 0%");
  },
};

/** Un clic ouvre la vue agrandie ; « Télécharger » ; Échap ferme et rend le focus à la vignette. */
export const Agrandir: Story = {
  render: () => <ImageThumbnail src={MOCKUP} alt="maquette.png" shape="square" onDownload={onDownload} />,
  play: async ({ canvasElement }) => {
    onDownload.mockClear();
    const thumb = await within(canvasElement).findByRole("button", { name: "Agrandir maquette.png" });
    await userEvent.click(thumb);
    const dialog = await body().findByRole("dialog", { name: "maquette.png" });
    await expect(within(dialog).queryByRole("button", { name: "Image suivante" })).toBeNull();
    await userEvent.click(await within(dialog).findByRole("button", { name: "Télécharger" }));
    await expect(onDownload).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(thumb).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await body().findByRole("dialog", { name: "maquette.png" });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
  },
};

/** Image qui ne s'affiche pas : « Image indisponible », « Réessayer » relance ; ici l'app répare l'adresse. */
export const ErreurEtNouvelEssai: Story = {
  render: function Render() {
    const [src, setSrc] = useState(BROKEN);
    return <ImageThumbnail src={src} alt="photo.png" shape="square" onRetry={() => { onRetry(); setSrc(MOCKUP); }} />;
  },
  play: async ({ canvasElement }) => {
    onRetry.mockClear();
    const c = within(canvasElement);
    await c.findByText("Image indisponible");
    const retry = c.getByRole("button", { name: "Réessayer photo.png" });
    await userEvent.tab();
    await expect(retry).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onRetry).toHaveBeenCalledTimes(1);
    await c.findByRole("button", { name: "Agrandir photo.png" });
  },
};

/** Sans `onRetry`, l'image elle-même se réessaie : la tuile repasse par le chargement, puis l'erreur. */
export const NouvelEssaiSansApp: Story = {
  render: () => <ImageThumbnail src={BROKEN} alt="photo.png" shape="square" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByRole("button", { name: "Réessayer photo.png" }));
    await waitFor(() => expect(canvasElement.querySelector("[data-image-state]")!.getAttribute("data-image-state")).toBe("error"));
    await expect(c.getByRole("button", { name: "Réessayer photo.png" })).toBeVisible();
  },
};

/** Lecture de l'app en échec : « Réessayer » appelle `onRetry` ; sans lui, pas de bouton. */
export const ErreurDeLApp: Story = {
  render: () => (
    <div className="flex gap-3">
      <ImageThumbnail alt="scan.png" shape="page" status="error" onRetry={onRetry} />
      <ImageThumbnail alt="archive.png" shape="page" status="error" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    onRetry.mockClear();
    const c = within(canvasElement);
    await expect(c.getAllByText("Image indisponible")).toHaveLength(2);
    await userEvent.click(c.getByRole("button", { name: "Réessayer scan.png" }));
    await expect(onRetry).toHaveBeenCalledTimes(1);
    await expect(c.queryByRole("button", { name: "Réessayer archive.png" })).toBeNull();
  },
};

/** Sans `src`, ou `status: "loading"` : chargement nommé. */
export const Chargement: Story = {
  render: () => (
    <div className="flex gap-3">
      <ImageThumbnail alt="photo.png" shape="square" />
      <ImageThumbnail alt="rendu.png" src={RENDER} status="loading" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("status", { name: "Chargement de photo.png" })).toBeInTheDocument();
    await expect(c.getByRole("status", { name: "Chargement de rendu.png" })).toBeInTheDocument();
    await expect(c.queryByRole("button")).toBeNull();
  },
};

/** Galerie en groupes : légendes coupées, « + N » en tête, qui ouvre la plus récente des cachées. */
export const Galerie: Story = {
  render: () => (
    <div className="w-[720px] max-w-full">
      <ImageGallery
        label="Captures de l'agent"
        shape="page"
        visible={3}
        groups={[
          { id: "exemple.com", label: "exemple.com", images: CAPTURES },
          { id: "docs.exemple.org", label: "docs.exemple.org", images: [{ id: "d0", src: MOCKUP, alt: "Guide — docs.exemple.org", caption: "Guide" }] },
        ]}
        onDownload={onDownload}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const group = c.getByRole("group", { name: "Captures de l'agent" });
    const first = within(group).getByRole("list", { name: "exemple.com" });
    await expect(within(first).getAllByRole("listitem")).toHaveLength(4);
    const more = within(first).getByRole("button", { name: "Voir 2 autres images de exemple.com" });
    await expect(more.textContent).toBe("+ 2");
    await waitFor(() => expect(within(first).getAllByRole("button", { name: /^Agrandir/ })).toHaveLength(3));
    await expect(more.getBoundingClientRect().height).toBe(100);
    const caption = [...canvasElement.querySelectorAll("figcaption span")].find((el) => el.textContent!.startsWith("Aide"))!;
    await expect(caption.scrollWidth).toBeGreaterThan(caption.clientWidth);
    await userEvent.click(more);
    const dialog = await body().findByRole("dialog", { name: "Tarifs — exemple.com" });
    await expect(within(dialog).getByText("2 / 5")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
  },
};

/** Vue agrandie d'un groupe : ← → et boutons, arrêt aux bornes. */
export const ParcoursAuxFleches: Story = {
  render: () => <ImageGallery label="Captures" shape="page" images={CAPTURES} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByRole("button", { name: "Agrandir Aide — exemple.com" }));
    let dialog = await body().findByRole("dialog", { name: "Aide — exemple.com" });
    await expect(within(dialog).getByText("4 / 5")).toBeInTheDocument();
    await userEvent.keyboard("{ArrowRight}");
    dialog = await body().findByRole("dialog", { name: "Blog — exemple.com" });
    await expect(within(dialog).getByText("5 / 5")).toBeInTheDocument();
    await expect(within(dialog).getByRole("button", { name: "Image suivante" })).toBeDisabled();
    await userEvent.keyboard("{ArrowRight}");
    await expect(within(dialog).getByText("5 / 5")).toBeInTheDocument();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    dialog = await body().findByRole("dialog", { name: "Contact — exemple.com" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Image précédente" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Image précédente" }));
    dialog = await body().findByRole("dialog", { name: "Accueil — exemple.com" });
    await expect(within(dialog).getByRole("button", { name: "Image précédente" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
  },
};

/** Image cachée sans `src` : la vue agrandie la demande à l'app (`onView`), puis l'affiche. */
export const ImageALire: Story = {
  render: function Render() {
    const [images, setImages] = useState<ImageGalleryItem[]>(() => CAPTURES.map((image, i) => (i < 2 ? { ...image, src: undefined } : image)));
    return (
      <ImageGallery
        label="Captures"
        shape="page"
        visible={3}
        images={images}
        onView={(image) => {
          onView(image.id);
          setImages((list) => list.map((item) => (item.id === image.id ? { ...item, src: CAPTURES.find((c) => c.id === image.id)!.src } : item)));
        }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    onView.mockClear();
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Voir 2 autres images de Captures" }));
    const dialog = await body().findByRole("dialog", { name: "Tarifs — exemple.com" });
    await expect(onView).toHaveBeenCalledWith("c1");
    await within(dialog).findByRole("img", { name: "Tarifs — exemple.com" });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
  },
};
