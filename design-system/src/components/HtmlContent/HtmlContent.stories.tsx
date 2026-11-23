import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { HtmlContent } from "./HtmlContent";

const pixel = (color: string, w = 600, h = 120) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${color}"/></svg>`)}`;
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

/** Courriel factice : styles propres, texte noir en dur, deux images distantes, deux liens. */
const mail = `
<html><head><style>.title{font-size:20px;font-weight:700;color:#111} p{color:#222}</style></head>
<body>
  <img src="https://images.exemple.com/banniere.png" width="600" height="120" alt="Bannière Boutique Exemple">
  <p class="title">Votre commande est en route</p>
  <p>Bonjour Camille, votre colis n° 4821 a quitté l'entrepôt.</p>
  <p><a href="https://suivi.exemple.com/4821">Suivre le colis</a> · <a href="mailto:aide@exemple.com">Nous écrire</a></p>
  <table border="1" cellpadding="6"><tr><th>Article</th><th>Qté</th></tr><tr><td>Lampe de bureau</td><td>1</td></tr></table>
  <img src="https://images.exemple.com/logo.png" width="120" height="40" alt="Logo">
</body></html>`;

/** Ce qu'une app passe : ici, chaque image distante est remplacée par une image locale (pas de réseau dans la démo). */
const resolveImage = (src: string) => (src.includes("banniere") ? pixel("#f4a26b") : src.includes("logo") ? pixel("#7a9cd6", 120, 40) : null);

const meta: Meta<typeof HtmlContent> = {
  title: "Composants/HtmlContent",
  component: HtmlContent,
  parameters: { layout: "padded" },
  args: { label: "Message de Boutique Exemple", html: mail, onLink: fn(), resolveImage },
};
export default meta;
type Story = StoryObj<typeof HtmlContent>;

const shadowOf = (canvas: HTMLElement) => canvas.querySelector<HTMLElement>('[role="document"]')!.shadowRoot!;

/** Courriel sur papier ; images distantes masquées, « Afficher les images » (D-318, D-319). */
export const ParDefaut: Story = {
  args: { onImagesAllowedChange: fn() },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(await c.findByText("2 images masquées.")).toBeVisible();
    const root = shadowOf(canvasElement);
    const banner = root.querySelector<HTMLImageElement>('img[alt="Bannière Boutique Exemple"]')!;
    await expect(banner.getAttribute("src")).toBeNull();
    await expect(banner.getBoundingClientRect().height).toBeGreaterThan(0);
    await userEvent.click(c.getByRole("button", { name: "Afficher les images" }));
    await expect(args.onImagesAllowedChange).toHaveBeenCalledWith(true);
    await waitFor(() => expect(c.queryByText("2 images masquées.")).toBeNull());
    await waitFor(() => expect(shadowOf(canvasElement).querySelector('img[alt="Logo"]')!.getAttribute("src")).toMatch(/^data:image\/svg/));
  },
};

/** Scripts, gestionnaires, formulaires, cadres et liens `javascript:` retirés (D-317). */
export const Nettoyage: Story = {
  args: {
    html: `<p onclick="alert(1)">Texte</p><script>window.hacked=1</script><form><input value="x"><button>Envoyer</button></form>
      <iframe src="https://exemple.com"></iframe><svg><circle r="4"/></svg><a href="javascript:alert(1)">piège</a>
      <img src="x" onerror="alert(1)"><base href="https://exemple.com/"><o:p>Office</o:p>`,
  },
  play: async ({ canvasElement }) => {
    const root = shadowOf(canvasElement);
    await waitFor(() => expect(root.textContent).toContain("Texte"));
    for (const selector of ["script", "form", "input", "button", "iframe", "svg", "base", "[onclick]", "[onerror]"])
      await expect(root.querySelector(selector)).toBeNull();
    await expect(root.querySelector("[data-href]")).toBeNull();
    await expect(root.textContent).toContain("piège");
    await expect(root.textContent).toContain("Office");
    await expect((window as { hacked?: number }).hacked).toBeUndefined();
  },
};

/** Styles bornés à la zone ; `:host` et `url()` retirés ; `position: fixed` reste dans la zone (D-317). */
export const Isolation: Story = {
  args: {
    html: `<style>:host{display:none} p{color:rgb(255,0,0)} .bg{background:url(https://traceur.exemple.com/p.gif)}</style>
      <p class="bg">Rouge dans la zone</p><div style="position:fixed;top:0;left:0;width:50px;height:50px;background:url(https://t.exemple.com/x)">fixe</div>`,
  },
  render: (args) => (
    <div>
      <p className="m-0 mb-2 text-fg" id="dehors">Texte de l'app, hors de la zone.</p>
      <div className="mt-20">
        <HtmlContent {...args} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector<HTMLElement>('[role="document"]')!;
    const root = host.shadowRoot!;
    await waitFor(() => expect(root.querySelector("p")).not.toBeNull());
    await expect(getComputedStyle(root.querySelector("p")!).color).toBe("rgb(255, 0, 0)");
    await expect(getComputedStyle(canvasElement.querySelector("#dehors")!).color).not.toBe("rgb(255, 0, 0)");
    await expect(getComputedStyle(host).display).toBe("block");
    await expect(root.innerHTML).not.toContain("url(");
    const fixed = root.querySelector<HTMLElement>("div[style]")!.getBoundingClientRect();
    await expect(fixed.top).toBeGreaterThanOrEqual(host.getBoundingClientRect().top);
  },
};

/** Clic ou Entrée sur un lien : `onLink(url)` ; l'adresse s'affiche au survol (D-319). */
export const Liens: Story = {
  play: async ({ canvasElement, args }) => {
    const root = shadowOf(canvasElement);
    await waitFor(() => expect(root.querySelector("[data-href]")).not.toBeNull());
    const link = root.querySelector<HTMLElement>('[data-href^="https"]')!;
    await expect(link.title).toBe("https://suivi.exemple.com/4821");
    await userEvent.click(link);
    await expect(args.onLink).toHaveBeenCalledWith("https://suivi.exemple.com/4821");
    const mailto = root.querySelector<HTMLElement>('[data-href^="mailto"]')!;
    mailto.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onLink).toHaveBeenLastCalledWith("mailto:aide@exemple.com");
  },
};

/** Sans `onLink`, les liens deviennent du texte (D-319). */
export const SansLiens: Story = {
  render: (args) => <HtmlContent label={args.label} html={args.html} resolveImage={resolveImage} />,
  play: async ({ canvasElement }) => {
    const root = shadowOf(canvasElement);
    await waitFor(() => expect(root.textContent).toContain("Suivre le colis"));
    await expect(root.querySelector("a")).toBeNull();
  },
};

/** Image intégrée (`data:`) affichée ; pièce jointe `cid:` par `resolveImage` ; pas de bandeau (D-318). */
export const ImagesJointes: Story = {
  args: {
    html: `<p>Pièces en ligne :</p><img alt="intégrée" src="${PNG}" width="24" height="24"> <img alt="jointe" src="cid:photo@exemple" width="80" height="40">`,
    resolveImage: (src: string) => (src === "cid:photo@exemple" ? Promise.resolve(pixel("#5cc98a", 80, 40)) : null),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const root = shadowOf(canvasElement);
    await waitFor(() => expect(root.querySelector('img[alt="jointe"]')!.getAttribute("src")).toMatch(/^data:image\/svg/));
    await expect(root.querySelector('img[alt="intégrée"]')!.getAttribute("src")).toBe(PNG);
    await expect(c.queryByRole("status")).toBeNull();
  },
};

/** Images permises par l'app (expéditeur de confiance) : pas de bandeau (D-318). */
export const ImagesPermises: Story = {
  args: { imagesAllowed: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(shadowOf(canvasElement).querySelector('img[alt="Logo"]')!.getAttribute("src")).not.toBeNull());
    await expect(c.queryByText(/images masquées/)).toBeNull();
  },
};

/** La surface papier reste blanche en sombre (D-315). */
export const Papier: Story = {
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector<HTMLElement>('[role="document"]')!;
    await expect(getComputedStyle(host).backgroundColor).toBe("rgb(255, 255, 255)");
  },
};

/** HTML simple produit par un service : couleurs du thème (D-319). */
export const SurfaceTheme: Story = {
  args: {
    surface: "theme",
    html: "<p>Description du ticket : la page <b>Réglages</b> ne s'ouvre plus depuis la mise à jour. <a href='https://exemple.com/ticket/42'>Voir le ticket</a></p>",
  },
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector<HTMLElement>('[role="document"]')!;
    await expect(getComputedStyle(host).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  },
};
