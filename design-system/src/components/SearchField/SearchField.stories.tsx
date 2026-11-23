import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { SearchField, type SearchCriteria, type SearchSuggestion } from "./SearchField";

const meta: Meta<typeof SearchField> = {
  title: "Composants/SearchField",
  component: SearchField,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof SearchField>;
const body = () => within(document.body);

const TITLES = ["Demande d'accès au dossier Clients", "Accès au parking — badge perdu", "Accès VPN pour le télétravail", "Remboursement de frais de déplacement", "Remboursement de repas client"];
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
/** API simulée : 300 ms ; « err » échoue. */
const api = (text: string, signal: AbortSignal) =>
  new Promise<SearchSuggestion[]>((resolve, reject) => {
    const t = setTimeout(() => (text.includes("err") ? reject(new Error("panne")) : resolve(TITLES.filter((x) => norm(x).includes(norm(text))).map((label, i) => ({ id: `s${i}`, label })))), 300);
    signal.addEventListener("abort", () => clearTimeout(t));
  });

function Demo({ tagMode = true, withSuggestions = true }: { tagMode?: boolean; withSuggestions?: boolean }) {
  const [sent, setSent] = useState<SearchCriteria[]>([]);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SearchField label="les demandes" tagMode={tagMode} onChange={(c) => setSent((s) => [...s, c])} {...(withSuggestions ? { suggestions: api } : {})} />
        <span className="text-sm text-fg-3">(barre seule : l'app reçoit les critères)</span>
      </div>
      <output data-testid="sent" className="font-mono text-sm text-fg-2">{sent.map((c) => JSON.stringify(c)).join("\n")}</output>
    </div>
  );
}
const sent = (c: HTMLElement) => within(c).getByTestId("sent").textContent?.split("\n").filter(Boolean) ?? [];

export const ParDefaut: Story = { render: () => <Demo /> };
export const ChampSimple: Story = { render: () => <Demo tagMode={false} withSuggestions={false} /> };

/** Entrée : étiquette ; × la retire ; Retour arrière deux fois retire la dernière (D-071). */
export const Etiquettes: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("combobox");
    await userEvent.type(input, "remb{Enter}");
    await expect(c.getByRole("group", { name: "Critères de recherche" })).toHaveTextContent("remb");
    await userEvent.type(input, "hugo{Enter}");
    await userEvent.click(c.getByRole("button", { name: "Retirer remb" }));
    await expect(c.queryByRole("button", { name: "Retirer remb" })).toBeNull();
    await userEvent.type(input, "{Backspace}{Backspace}");
    await expect(c.queryByRole("group", { name: "Critères de recherche" })).toBeNull();
  },
};

/** Critères envoyés après 300 ms sans frappe, à partir de 2 caractères ; jamais deux fois les mêmes (D-079, D-080). */
export const Envoi: Story = {
  render: () => <Demo tagMode={false} withSuggestions={false} />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox");
    await userEvent.type(input, "r");
    await new Promise((r) => setTimeout(r, 400));
    await expect(sent(canvasElement)).toHaveLength(0);
    await userEvent.type(input, "emb");
    await expect(sent(canvasElement)).toHaveLength(0);
    await waitFor(() => expect(sent(canvasElement)).toEqual(['{"text":"remb","tags":[]}']));
    await userEvent.keyboard("{Enter}");
    await expect(sent(canvasElement)).toHaveLength(1);
    await userEvent.keyboard("{Escape}");
    await expect(sent(canvasElement).at(-1)).toBe('{"text":"","tags":[]}');
  },
};

/** Suggestions par API : attente, éléments, choix au clavier (D-074, D-081). */
export const SuggestionsApi: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole("combobox"), "acc");
    await waitFor(() => expect(body().getByText("Recherche…")).toBeVisible());
    // Une seule zone d'état, avec un texte : « Recherche en cours » (pas d'annonce en double).
    // (le <output> de la démo a lui aussi le rôle status : on l'écarte)
    const zones = () => body().getAllByRole("status").filter((z) => z.tagName !== "OUTPUT");
    await waitFor(() => expect(zones().map((z) => z.textContent)).toEqual(["Recherche en cours"]));
    await waitFor(() => expect(body().getAllByRole("option")).toHaveLength(4), { timeout: 2000 });
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(c.getByRole("group", { name: "Critères de recherche" })).toHaveTextContent("Demande d'accès au dossier Clients");
  },
};

/** Erreur des suggestions : une ligne avec « Réessayer » (D-082). */
export const ErreurSuggestions: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    await userEvent.type(within(canvasElement).getByRole("combobox"), "err");
    await waitFor(() => expect(body().getByRole("alert")).toHaveTextContent("Suggestions indisponibles"), { timeout: 2000 });
    await expect(body().getByRole("button", { name: "Réessayer" })).toBeVisible();
  },
};

/** Mod+F place le curseur dans la barre (D-083). */
export const Raccourci: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const mod = /mac/i.test(navigator.platform) ? "Meta" : "Control";
    await userEvent.keyboard(`{${mod}>}f{/${mod}}`);
    await expect(document.activeElement).toBe(within(canvasElement).getByRole("combobox"));
  },
};

/** Largeur fixe ; « +n » résume les étiquettes les plus anciennes (D-078). */
export const Debordement: Story = {
  render: () => <Demo withSuggestions={false} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("combobox");
    for (const t of ["remboursement", "hugo", "compta", "urgent", "décembre"]) await userEvent.type(input, `${t}{Enter}`);
    const field = c.getByRole("search");
    await expect(Math.round(field.getBoundingClientRect().width)).toBe(320);
    await waitFor(() => expect(c.getByRole("button", { name: /autres critères/ })).toBeVisible());
  },
};

/** Étiquette trop longue : coupée à 160 px, info-bulle au survol ou mise en avant au clavier. */
export const EtiquetteLongue: Story = {
  render: () => <Demo withSuggestions={false} />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox");
    const long = "Remboursement des frais de déplacement";
    await userEvent.type(input, "hugo{Enter}");
    await userEvent.keyboard("{Backspace}");
    await new Promise((r) => setTimeout(r, 50));
    await expect(body().queryByRole("tooltip")).toBeNull(); // « hugo » n'est pas coupée
    await userEvent.keyboard("{Escape}");
    await userEvent.click(input);
    await userEvent.type(input, `${long}{Enter}`);
    await userEvent.keyboard("{Backspace}");
    await waitFor(() => expect(body().getByRole("tooltip")).toHaveTextContent(long));
    await expect(within(canvasElement).getByText(long)).not.toHaveAttribute("title");
  },
};
