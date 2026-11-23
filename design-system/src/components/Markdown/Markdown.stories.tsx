import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Markdown } from "./Markdown";

const meta: Meta<typeof Markdown> = {
  title: "Composants/Markdown",
  component: Markdown,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-[640px]">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof Markdown>;

const DOC = `# Compte rendu du 12 mars

Présents : **Lina**, _Marc_ et l'équipe support. Voir la [procédure](https://example.com/procedure) et la [page interne](#suivi).

## Décisions
- Mise en ligne le \`lundi\`
- Gel des changements la veille
  - sauf correctifs ~~mineurs~~ urgents

1. Prévenir
2. Publier

## Suivi
- [x] Prévenir les clients
- [ ] Mettre à jour la FAQ

> Garder une marge d'une journée en cas de retour.

| Tâche | Responsable | Jours |
|---|:---:|---:|
| Tests | Lina | 2 |
| Documentation | Marc | 1 |

---

\`\`\`sh
npm run build && npm run deploy
\`\`\`
`;

/** Titres, listes, citation, code, tableau et trait au style de D-301. */
export const Document: Story = {
  args: { children: DOC },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const h = c.getByRole("heading", { name: "Compte rendu du 12 mars" });
    await expect(h.tagName).toBe("H2");
    await expect(getComputedStyle(h).fontWeight).toBe("600");
    const quote = canvasElement.querySelector("blockquote")!;
    await expect(getComputedStyle(quote).borderLeftWidth).toBe("3px");
    await expect(c.getByRole("separator")).toBeInTheDocument();
    await expect(c.getByText("lundi").tagName).toBe("CODE");
    await expect(c.getByText("mineurs").tagName).toBe("DEL");
    await expect(canvasElement.querySelector("ol")).not.toBeNull();
  },
};

/** `headingLevel` règle le niveau HTML, pas la taille (D-302). */
export const NiveauDesTitres: Story = {
  args: { children: "# Titre\n\n## Sous-titre\n\n###### Petit", headingLevel: 3 },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { name: "Titre" }).tagName).toBe("H3");
    await expect(c.getByRole("heading", { name: "Sous-titre" }).tagName).toBe("H4");
    await expect(c.getByRole("heading", { name: "Petit" }).tagName).toBe("H6");
    const size = (n: string) => parseFloat(getComputedStyle(c.getByRole("heading", { name: n })).fontSize);
    await expect(size("Titre")).toBeGreaterThan(size("Sous-titre"));
  },
};

/** Liens : `Link`, externe avec flèche ; `onLinkPress` reçoit l'adresse sans naviguer (D-303). */
export const Liens: Story = {
  args: { children: "Lire la [procédure](https://example.com/procedure) ou la [note](notes/suivi.md).", onLinkPress: fn() },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const ext = c.getByRole("link", { name: /procédure.*S'ouvre dans le navigateur/ });
    await expect(ext).toHaveAttribute("href", "https://example.com/procedure");
    let prevented = false;
    const spy = (e: MouseEvent) => (prevented = e.defaultPrevented);
    canvasElement.addEventListener("click", spy);
    await userEvent.click(c.getByRole("link", { name: "note" }));
    canvasElement.removeEventListener("click", spy);
    await expect(args.onLinkPress).toHaveBeenCalledWith("notes/suivi.md");
    await expect(prevented).toBe(true);
    await userEvent.tab({ shift: true });
    await expect(ext).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onLinkPress).toHaveBeenCalledWith("https://example.com/procedure");
  },
};

/** Adresse `javascript:` retirée ; HTML écrit dans le texte ignoré (D-303). */
export const Securite: Story = {
  args: { children: 'Un [piège](javascript:alert(1)) et <b data-testid="html">du HTML</b> <script>alert(1)</script>.' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("link")).toBeNull();
    await expect(c.getByText(/piège/)).toBeInTheDocument();
    await expect(canvasElement.querySelector("[data-testid=html]")).toBeNull();
    await expect(canvasElement.querySelector("script")).toBeNull();
  },
};

/** Image : un lien sans `renderImage` ; le rendu de l'app avec (D-303). */
export const Images: Story = {
  args: { children: "![Schéma du réseau](https://example.com/reseau.png)\n\n![](https://example.com/sans-texte.png)" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(canvasElement.querySelector("img")).toBeNull();
    await expect(c.getByRole("link", { name: /Schéma du réseau/ })).toHaveAttribute("href", "https://example.com/reseau.png");
    await expect(c.getByRole("link", { name: /^Image/ })).toBeInTheDocument();
  },
};

/** Avec `renderImage`, l'app affiche l'image elle-même. */
export const ImagesParLApp: Story = {
  args: {
    children: "![Logo](logo.png)",
    renderImage: (src, alt) => <span data-testid="image">{`${alt} : ${src}`}</span>,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("image")).toHaveTextContent("Logo : logo.png");
  },
};

/** « Copier le bloc » : copie sans le retour final, coche et « Bloc copié » (D-304). */
export const CopierLeBloc: Story = {
  args: { children: "```\nnpm run build\n```" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const write = fn().mockResolvedValue(undefined);
    const original = navigator.clipboard.writeText;
    Object.defineProperty(navigator.clipboard, "writeText", { value: write, configurable: true });
    try {
      await expect(c.getByRole("region", { name: "Extrait de code" })).toHaveTextContent("npm run build");
      await userEvent.click(c.getByRole("button", { name: "Copier le bloc" }));
      await expect(write).toHaveBeenCalledWith("npm run build");
      await waitFor(() => expect(c.getByRole("button", { name: "Bloc copié" })).toBeInTheDocument());
    } finally {
      Object.defineProperty(navigator.clipboard, "writeText", { value: original, configurable: true });
    }
  },
};

/** `renderCode` remplace un bloc d'un langage ; les autres blocs restent (D-304). */
export const RenduDeCode: Story = {
  args: {
    children: "```schema\nA -> B\n```\n\n```js\nconst a = 1;\n```",
    renderCode: (language, text) => (language === "schema" ? <div data-testid="schema">{`Schéma : ${text}`}</div> : undefined),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByTestId("schema")).toHaveTextContent("Schéma : A -> B");
    await expect(c.getAllByRole("region", { name: "Extrait de code" })).toHaveLength(1);
  },
};

/** Tableau statique dans une région « Tableau », alignement GFM (D-304). */
export const Tableau: Story = {
  args: { children: "| Tâche | Jours |\n|---|---:|\n| Tests de bout en bout sur tous les navigateurs | 2 |" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const region = c.getByRole("region", { name: "Tableau" });
    await expect(region).toHaveAttribute("tabindex", "0");
    await expect(c.queryByRole("grid")).toBeNull();
    await expect(getComputedStyle(c.getByRole("columnheader", { name: "Jours" })).textAlign).toBe("end");
  },
};

/** Cases statiques, nommées « Fait » ou « À faire » (D-304). */
export const Taches: Story = {
  args: { children: "- [x] Prévenir les clients\n- [ ] Mettre à jour la FAQ" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("checkbox")).toBeNull();
    await expect(c.getByRole("img", { name: "Fait" })).toBeInTheDocument();
    await expect(c.getByRole("img", { name: "À faire" })).toBeInTheDocument();
  },
};
