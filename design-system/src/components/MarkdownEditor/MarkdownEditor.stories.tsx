import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { MarkdownEditor } from "./MarkdownEditor";

const meta: Meta<typeof MarkdownEditor> = {
  title: "Composants/MarkdownEditor",
  component: MarkdownEditor,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-[760px]">{Story()}</div>],
  args: { label: "Contenu" },
};
export default meta;
type Story = StoryObj<typeof MarkdownEditor>;

const NOTE = `# Compte rendu

Présents : **Lina** et _Marc_. Voir la [procédure](https://example.com/procedure).

- Mise en ligne le \`lundi\`
- Gel la veille

> Garder une marge.
`;

const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? "Meta" : "Control";

/** Attend CodeMirror et rend sa vue (pour placer la sélection avant d'agir par l'interface). */
async function editor(canvasElement: HTMLElement, name = "Contenu") {
  const box = await within(canvasElement).findByRole("textbox", { name: new RegExp(`^${name}`) }, { timeout: 5000 });
  const view = EditorView.findFromDOM(box);
  if (!view) throw new Error("Vue CodeMirror introuvable");
  return { box, view };
}
const select = (view: EditorView, word: string) => {
  const from = view.state.doc.toString().indexOf(word);
  view.dispatch({ selection: EditorSelection.range(from, from + word.length) });
};

/** Les boutons posent la marque, puis la retirent ; le texte garde le focus (D-307). */
export const MiseEnForme: Story = {
  args: { defaultValue: "Bonjour le monde", onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const { box, view } = await editor(canvasElement);
    await waitFor(() => expect(c.getByRole("button", { name: "Gras" })).toBeEnabled());
    select(view, "monde");
    await userEvent.click(c.getByRole("button", { name: "Gras" }));
    await expect(view.state.doc.toString()).toBe("Bonjour le **monde**");
    await expect(box).toHaveFocus();
    await userEvent.click(c.getByRole("button", { name: "Gras" }));
    await expect(view.state.doc.toString()).toBe("Bonjour le monde");
    await userEvent.click(c.getByRole("button", { name: "Titre 2" }));
    await expect(view.state.doc.toString()).toBe("## Bonjour le monde");
    select(view, "Bonjour");
    await userEvent.click(c.getByRole("button", { name: "Lien" }));
    await expect(view.state.doc.toString()).toBe("## [Bonjour](adresse) le monde");
    const sel = view.state.selection.main;
    await expect(view.state.sliceDoc(sel.from, sel.to)).toBe("adresse");
    await expect(args.onChange).toHaveBeenLastCalledWith("## [Bonjour](adresse) le monde");
  },
};

/** Raccourcis dans le texte : Mod+B, Mod+I, Mod+E, Mod+Alt+1, Mod+Maj+8 (D-307). */
export const Raccourcis: Story = {
  args: { defaultValue: "un deux trois" },
  play: async ({ canvasElement }) => {
    const { box, view } = await editor(canvasElement);
    box.focus();
    select(view, "un");
    await userEvent.keyboard(`{${MOD}>}b{/${MOD}}`);
    select(view, "deux");
    await userEvent.keyboard(`{${MOD}>}i{/${MOD}}`);
    select(view, "trois");
    await userEvent.keyboard(`{${MOD}>}e{/${MOD}}`);
    await expect(view.state.doc.toString()).toBe("**un** _deux_ `trois`");
    await userEvent.keyboard(`{${MOD}>}{Alt>}1{/Alt}{/${MOD}}`);
    await expect(view.state.doc.toString()).toBe("# **un** _deux_ `trois`");
    await userEvent.keyboard(`{${MOD}>}{Shift>}8{/Shift}{/${MOD}}`);
    // Une liste remplace le préfixe de liste, pas le titre : la marque s'ajoute devant.
    await expect(view.state.doc.toString()).toBe("- # **un** _deux_ `trois`");
  },
};

/** La barre est un seul arrêt de tabulation, parcouru aux flèches ; puis Tab va au texte (D-307). */
export const BarreAuClavier: Story = {
  args: { defaultValue: "Texte" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const { box } = await editor(canvasElement);
    const bar = c.getByRole("toolbar", { name: "Mise en forme" });
    await waitFor(() => expect(c.getByRole("button", { name: "Titre 1" })).toBeEnabled());
    await userEvent.tab();
    await expect(c.getByRole("button", { name: "Titre 1" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(c.getByRole("button", { name: "Titre 2" })).toHaveFocus();
    // Tab : la barre passe au dernier bouton, puis le navigateur sort de la barre, vers le texte.
    c.getByRole("button", { name: "Titre 2" }).dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }));
    await expect(c.getByRole("button", { name: "Citation" })).toHaveFocus();
    const order = [...canvasElement.querySelectorAll<HTMLElement>("button, [contenteditable=true]")];
    await expect(order.indexOf(box)).toBe(order.indexOf(c.getByRole("button", { name: "Citation" })) + 1);
    await expect(bar.querySelectorAll("button")).toHaveLength(10);
    await expect(c.getByRole("button", { name: "Gras" })).toHaveAttribute("aria-keyshortcuts", isMac ? "Meta+B" : "Control+B");
  },
};

/** Entrée continue une liste ; sur un élément vide, elle espace la liste, puis la quitte ; Tab quitte l'éditeur (D-307). */
export const Listes: Story = {
  args: { defaultValue: "- un" },
  render: (args) => (
    <>
      <MarkdownEditor {...args} />
      <button type="button">Après</button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const { box, view } = await editor(canvasElement);
    box.focus();
    view.dispatch({ selection: EditorSelection.cursor(view.state.doc.length) });
    await userEvent.keyboard("{Enter}");
    await expect(view.state.doc.toString()).toBe("- un\n- ");
    // Élément vide : un appui espace la liste, le suivant la quitte (CodeMirror).
    await userEvent.keyboard("{Enter}");
    await expect(view.state.doc.toString()).toBe("- un\n\n- ");
    await userEvent.keyboard("{Enter}");
    await expect(view.state.doc.toString()).toBe("- un\n\n");
    await userEvent.tab();
    await expect(c.getByRole("button", { name: "Après" })).toHaveFocus();
  },
};

/** Coloration aux tokens, en clair comme en sombre (D-306). */
export const Coloration: Story = {
  args: { defaultValue: NOTE },
  play: async ({ canvasElement }) => {
    const { box } = await editor(canvasElement);
    await waitFor(() => expect(box.querySelectorAll("span").length).toBeGreaterThan(3));
    const fg3 = getComputedStyle(document.documentElement).getPropertyValue("--fg-3").trim();
    const mark = [...box.querySelectorAll("span")].find((s) => s.textContent === "#")!;
    const probe = document.createElement("span");
    probe.style.color = fg3;
    document.body.append(probe);
    await expect(getComputedStyle(mark).color).toBe(getComputedStyle(probe).color);
    probe.remove();
    await expect(getComputedStyle(box).fontFamily).toMatch(/mono|Menlo|Consolas|SF Mono/i);
  },
};

/** Compteur « n / max » ; la saisie s'arrête à la limite. */
export const Compteur: Story = {
  args: { defaultValue: "1234567", maxLength: 10, description: "Court résumé." },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const { box, view } = await editor(canvasElement);
    await expect(c.getByText("7 / 10")).toBeInTheDocument();
    box.focus();
    view.dispatch({ selection: EditorSelection.cursor(7) });
    view.dispatch(view.state.update({ changes: { from: 7, insert: "8901234" }, userEvent: "input.type" }));
    await expect(view.state.doc.toString()).toBe("1234567");
    view.dispatch(view.state.update({ changes: { from: 7, insert: "890" }, userEvent: "input.type" }));
    await expect(await c.findByText("10 / 10")).toBeInTheDocument();
  },
};

/** Désactivé, lecture seule et erreur (D-305). */
export const Etats: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <MarkdownEditor label="Désactivé" defaultValue="Texte" isDisabled minRows={2} />
      <MarkdownEditor label="Lecture seule" defaultValue="Texte **figé**" isReadOnly minRows={2} />
      <MarkdownEditor label="Erreur" defaultValue="" error="Le contenu est obligatoire." isRequired minRows={2} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const off = await editor(canvasElement, "Désactivé");
    await expect(off.box).toHaveAttribute("contenteditable", "false");
    await expect(off.box).toHaveAttribute("aria-disabled", "true");
    const ro = await editor(canvasElement, "Lecture seule");
    await expect(ro.box).toHaveAttribute("aria-readonly", "true");
    await expect(c.getAllByRole("toolbar")).toHaveLength(2);
    await expect(c.getByTitle("Lecture seule")).toBeInTheDocument();
    const err = await editor(canvasElement, "Erreur");
    await expect(err.box).toHaveAttribute("aria-invalid", "true");
    await expect(err.box).toHaveAccessibleDescription("Le contenu est obligatoire.");
  },
};

/** Aperçu en bascule : il remplace le texte et désactive la mise en forme (D-309). */
export const Apercu: Story = {
  args: { defaultValue: NOTE, preview: "toggle" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await editor(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Aperçu" }));
    const region = c.getByRole("region", { name: "Aperçu" });
    await expect(within(region).getByRole("heading", { name: "Compte rendu" })).toBeInTheDocument();
    await expect(c.getByRole("button", { name: "Gras" })).toBeDisabled();
    await expect(c.queryByRole("textbox", { name: /^Contenu/ })).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Aperçu" }));
    await expect(c.getByRole("textbox", { name: /^Contenu/ })).toBeVisible();
  },
};

/** Aperçu côte à côte, mis à jour pendant la saisie ; vide : « Rien à afficher ». */
export const ApercuCoteACote: Story = {
  args: { defaultValue: "", preview: "split", placeholder: "Écrivez en Markdown…" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const { view } = await editor(canvasElement);
    const region = c.getByRole("region", { name: "Aperçu" });
    await expect(region).toHaveTextContent("Rien à afficher");
    view.dispatch({ changes: { from: 0, insert: "## Titre" } });
    await waitFor(() => expect(within(region).getByRole("heading", { name: "Titre" })).toBeInTheDocument());
  },
};

/** Image collée : texte d'attente, puis `![alt](adresse)` ; échec : message sous le champ (D-308). */
export const ImageCollee: Story = {
  args: {
    defaultValue: "",
    onPasteImage: (file) => (file.name === "refus.png" ? Promise.reject(new Error("refus")) : Promise.resolve({ src: "images/plan 1.png", alt: "Plan" })),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const { box, view } = await editor(canvasElement);
    const paste = (name: string) => {
      const data = new DataTransfer();
      data.items.add(new File(["x"], name, { type: "image/png" }));
      box.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    };
    paste("plan.png");
    await waitFor(() => expect(view.state.doc.toString()).toBe("![Plan](images/plan%201.png)\n"));
    paste("refus.png");
    await waitFor(() => expect(c.getByRole("status")).toHaveTextContent("Image non ajoutée : refus.png"));
    await expect(view.state.doc.toString()).toBe("![Plan](images/plan%201.png)\n");
  },
};

/** Valeur contrôlée par l'app : un autre texte remplace le contenu. */
export const Controle: Story = {
  render: function Render() {
    const [text, setText] = useState("Note A");
    return (
      <>
        <MarkdownEditor label="Contenu" value={text} onChange={setText} name="contenu" />
        <button type="button" onClick={() => setText("Note B")}>
          Ouvrir B
        </button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const { view } = await editor(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Ouvrir B" }));
    await waitFor(() => expect(EditorView.findFromDOM(c.getByRole("textbox", { name: /^Contenu/ }))!.state.doc.toString()).toBe("Note B"));
    await expect(canvasElement.querySelector<HTMLInputElement>("input[name=contenu]")!.value).toBe("Note B");
    void view;
  },
};
