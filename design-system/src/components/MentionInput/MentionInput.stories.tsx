import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { MentionInput, type MentionInputProps } from "./MentionInput";
import type { MentionItem, MentionReference, MentionTrigger } from "./mentions";

const FILES: MentionItem[] = [
  { id: "src/OrderForm.tsx", label: "OrderForm.tsx", description: "src" },
  { id: "src/OrderList.tsx", label: "OrderList.tsx", description: "src" },
  { id: "docs/orders.md", label: "orders.md", description: "docs" },
];
const COMMANDS: MentionItem[] = [
  { id: "review", label: "review", description: "Commande" },
  { id: "test", label: "test", description: "Commande" },
];

const search = (items: MentionItem[], query: string) => items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
const demoTriggers: MentionTrigger[] = [
  { char: "@", label: "Fichier", load: async (q) => search(FILES, q) },
  { char: "/", label: "Commande", load: async (q) => search(COMMANDS, q) },
];

/** Champ contrôlé ; la valeur est recopiée sous le champ pour les tests. */
function Controlled(props: Partial<MentionInputProps> & { initial?: { text: string; references: MentionReference[] } }) {
  const [state, setState] = useState(props.initial ?? { text: "", references: [] as MentionReference[] });
  return (
    <div className="flex w-[480px] flex-col gap-2">
      <MentionInput
        label="Commentaire"
        placeholder="Écrivez, @ pour citer un fichier"
        triggers={demoTriggers}
        {...props}
        value={state.text}
        references={state.references}
        onChange={(text, references) => setState({ text, references })}
      />
      <output data-testid="value" className="font-mono text-sm text-fg-3">
        {JSON.stringify({ text: state.text, refs: state.references.map((r) => [r.trigger + r.label, r.offset]) })}
      </output>
    </div>
  );
}

const meta: Meta<typeof MentionInput> = {
  title: "Composants/MentionInput",
  component: MentionInput,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof MentionInput>;

const body = () => within(document.body);
const valueOf = (root: HTMLElement) => JSON.parse(within(root).getByTestId("value").textContent ?? "{}") as { text: string; refs: [string, number][] };

export const ParDefaut: Story = { render: () => <Controlled /> };

/** Texte d'attente tant que le champ est vide ; rôle textbox multiligne. */
export const Anatomie: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("textbox", { name: "Commentaire" });
    await expect(box).toHaveAttribute("aria-multiline", "true");
    await expect(box).toHaveAttribute("aria-autocomplete", "list");
    await expect(box).toHaveAttribute("aria-expanded", "false");
    await expect(getComputedStyle(box, "::before").content).toContain("Écrivez");
  },
};

/** `@` ouvre la liste au-dessus du curseur ; flèches, Entrée insère une pastille ; le texte tapé disparaît. */
export const SuggestionsAuClavier: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("textbox");
    await userEvent.click(box);
    await userEvent.keyboard("Voir @.tsx");
    const list = await body().findByRole("listbox", { name: "Suggestions : Fichier" });
    await waitFor(() => expect(within(list).getAllByRole("option")).toHaveLength(2));
    await expect(box).toHaveAttribute("aria-expanded", "true");
    await expect(box).toHaveAttribute("aria-controls", list.id);
    const options = within(list).getAllByRole("option");
    await expect(box).toHaveAttribute("aria-activedescendant", options[0]!.id);
    await userEvent.keyboard("{ArrowDown}");
    await expect(box).toHaveAttribute("aria-activedescendant", options[1]!.id);
    await expect(options[1]).toHaveAttribute("aria-selected", "true");
    // La liste est au-dessus de la ligne du curseur (marge intérieure du champ comprise), 224 px au plus.
    const panel = list.parentElement!;
    await expect(panel.getBoundingClientRect().bottom).toBeLessThanOrEqual(box.getBoundingClientRect().top + parseFloat(getComputedStyle(box).paddingTop) + 1);
    await expect(parseFloat(panel.style.maxHeight)).toBeLessThanOrEqual(224);
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(body().queryByRole("listbox")).toBeNull());
    await expect(valueOf(canvasElement)).toEqual({ text: "Voir ", refs: [["@OrderList.tsx", 5]] });
    await expect(box.querySelector("[data-mention-key]")?.getAttribute("contenteditable")).toBe("false");
    // Le texte tapé après la pastille suit.
    await userEvent.keyboard(" ok");
    await waitFor(() => expect(valueOf(canvasElement)).toEqual({ text: "Voir  ok", refs: [["@OrderList.tsx", 5]] }));
  },
};

/** Tab insère aussi ; Échap ferme la liste sans rien insérer. */
export const TabEtEchap: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("textbox");
    await userEvent.click(box);
    await userEvent.keyboard("/re");
    await waitFor(() => expect(body().getAllByRole("option")).toHaveLength(1));
    await userEvent.keyboard("{Escape}");
    await expect(body().queryByRole("listbox")).toBeNull();
    await expect(box).toHaveFocus();
    await userEvent.keyboard("v");
    await waitFor(() => expect(body().getAllByRole("option")).toHaveLength(1));
    await userEvent.keyboard("{Tab}");
    await waitFor(() => expect(valueOf(canvasElement).refs).toEqual([["/review", 0]]));
    await expect(box).toHaveFocus();
  },
};

/** Recherche après 150 ms de pause ; « Recherche… » pendant, « Aucun résultat », erreur. */
export const EtatsDeLaListe: Story = {
  render: () => (
    <Controlled
      triggers={[
        {
          char: "#",
          label: "Ticket",
          load: (q) =>
            new Promise((resolve, reject) => setTimeout(() => (q === "panne" ? reject(new Error("réseau")) : resolve(q === "12" ? [{ id: "12", label: "Ticket 12" }] : [])), 300)),
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("textbox");
    await userEvent.click(box);
    await userEvent.keyboard("#1");
    await expect(await body().findByText("Recherche…")).toBeInTheDocument();
    await expect(body().getByRole("listbox")).toHaveAttribute("aria-busy", "true");
    await userEvent.keyboard("2");
    await expect(await body().findByRole("option", { name: "Ticket 12" }, { timeout: 2000 })).toBeInTheDocument();
    await userEvent.keyboard("3");
    await expect(await body().findByText("Aucun résultat", {}, { timeout: 2000 })).toBeInTheDocument();
    await userEvent.keyboard("{Backspace}{Backspace}{Backspace}panne");
    await expect(await body().findByText("Recherche indisponible. Fermez puis réessayez.", {}, { timeout: 2000 })).toBeInTheDocument();
  },
};

/** Le × d'une pastille la retire ; Retour arrière l'efface d'un bloc. */
export const RetraitDePastille: Story = {
  render: () => (
    <Controlled
      initial={{
        text: "Voir  et ",
        references: [
          { key: "a", trigger: "@", id: "src/OrderForm.tsx", label: "OrderForm.tsx", offset: 5 },
          { key: "b", trigger: "@", id: "docs/orders.md", label: "orders.md", offset: 9 },
        ],
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("textbox");
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Retirer @OrderForm.tsx" }));
    await waitFor(() => expect(valueOf(canvasElement).refs).toEqual([["@orders.md", 9]]));
    // Curseur à la fin : Retour arrière efface la dernière pastille.
    box.focus();
    const range = document.createRange();
    range.selectNodeContents(box);
    range.collapse(false);
    getSelection()?.removeAllRanges();
    getSelection()?.addRange(range);
    await userEvent.keyboard("{Backspace}");
    await waitFor(() => expect(valueOf(canvasElement).refs).toEqual([]));
  },
};

/** Maj+Entrée (et Entrée sans gestionnaire) va à la ligne ; un collage arrive en texte brut. */
export const RetourALaLigneEtCollage: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("textbox");
    await userEvent.click(box);
    await userEvent.keyboard("Ligne 1{Shift>}{Enter}{/Shift}Ligne 2");
    await waitFor(() => expect(valueOf(canvasElement).text).toBe("Ligne 1\nLigne 2"));
    const data = new DataTransfer();
    data.setData("text/html", "<b>gras</b>");
    data.setData("text/plain", " gras");
    box.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    await waitFor(() => expect(valueOf(canvasElement).text).toBe("Ligne 1\nLigne 2 gras"));
    await expect(box.querySelector("b")).toBeNull();
  },
};

/** Désactivé : non éditable, hors de l'ordre de Tab, `aria-disabled`. */
export const Desactive: Story = {
  render: () => <Controlled isDisabled initial={{ text: "Lecture", references: [] }} />,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("textbox");
    await expect(box).toHaveAttribute("aria-disabled", "true");
    await expect(box).toHaveAttribute("contenteditable", "false");
    await expect(box).toHaveAttribute("tabindex", "-1");
  },
};
