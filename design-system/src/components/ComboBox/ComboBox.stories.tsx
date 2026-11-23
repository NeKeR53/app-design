import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ComboBox, type ComboBoxItem } from "./ComboBox";

const meta: Meta<typeof ComboBox> = {
  title: "Composants/ComboBox",
  component: ComboBox,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof ComboBox>;
const body = () => within(document.body);
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

const COUNTRIES: ComboBoxItem[] = ["Allemagne", "Autriche", "Belgique", "Canada", "Danemark", "Espagne", "Finlande", "France", "Grèce", "Irlande", "Italie", "Luxembourg", "Portugal", "Suède", "Suisse"].map(
  (label, i) => ({ id: `c${i}`, label }),
);
const TAGS: ComboBoxItem[] = ["Urgent", "Interne", "Client", "Juridique", "Finance", "Ressources humaines", "Achats", "Support"].map((label, i) => ({ id: `t${i}`, label }));
const PEOPLE: ComboBoxItem[] = ["Marie Durand", "Marie Lefèvre", "Mathis Moreau", "Malik Garnier", "Manon Roux", "Hugo Fontaine", "Inès Bernard", "Léa Mallet"].map((label, i) => ({
  id: `p${i}`,
  label,
  description: `${label.split(" ")[0]?.[0]?.toLowerCase()}${label.split(" ")[1]?.toLowerCase()}@exemple.org`.normalize("NFD").replace(/[̀-ͯ]/g, ""),
}));
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
/** API simulée : 300 ms ; « err » échoue une fois sur deux appels (le second réussit). */
let failNext = true;
const api = (text: string, signal: AbortSignal) =>
  new Promise<ComboBoxItem[]>((resolve, reject) => {
    const t = setTimeout(() => {
      if (text.includes("err") && failNext) {
        failNext = false;
        reject(new Error("panne"));
      } else resolve(PEOPLE.filter((p) => norm(p.label).includes(norm(text.replace("err", ""))) || norm(p.description ?? "").includes(norm(text))));
    }, 300);
    signal.addEventListener("abort", () => clearTimeout(t));
  });

/** Affiche la valeur transmise, pour les tests. */
function Single(props: Partial<Parameters<typeof ComboBox>[0]> & { items?: ComboBoxItem[] }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div className="flex w-[480px] flex-col gap-3">
      <ComboBox label="Pays" placeholder="Choisir un pays" description="Pays de facturation du projet." isRequired items={COUNTRIES} {...(props as object)} value={value} onChange={setValue} />
      <output data-testid="value" className="font-mono text-sm text-fg-2">
        {JSON.stringify(value)}
      </output>
    </div>
  );
}
function Multiple({ allowsCustomValue = false }: { allowsCustomValue?: boolean }) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div className="flex w-[480px] flex-col gap-3">
      <ComboBox
        label="Étiquettes"
        selectionMode="multiple"
        placeholder="Ajouter des étiquettes"
        description="Plusieurs choix possibles."
        items={TAGS}
        allowsCustomValue={allowsCustomValue}
        onCreate={(text) => ({ id: `new-${text}`, label: text })}
        value={value}
        onChange={setValue}
      />
      <output data-testid="value" className="font-mono text-sm text-fg-2">
        {JSON.stringify(value)}
      </output>
    </div>
  );
}
const valueOf = (c: HTMLElement) => JSON.parse(within(c).getByTestId("value").textContent ?? "null") as unknown;

export const ParDefaut: Story = { render: () => <Single /> };
export const ChoixMultipleRendu: Story = {
  name: "Choix multiple",
  render: () => (
    <div className="w-[360px]">
      <ComboBox label="Étiquettes" selectionMode="multiple" items={TAGS} defaultValue={["t0", "t2", "t3", "t4", "t5", "t6"]} description="Les étiquettes passent à la ligne (D-143)." />
    </div>
  ),
};
export const SectionsEtDescriptions: Story = {
  render: () => (
    <div className="w-[480px]">
      <ComboBox
        label="Responsable"
        items={PEOPLE.map((p, i) => ({ ...p, section: i < 4 ? "Équipe" : "Autres personnes", isDisabled: i === 2 }))}
        description="Icône, description et section facultatives (D-146)."
      />
    </div>
  ),
};
export const Etats: Story = {
  render: () => (
    <div className="flex w-[480px] flex-col gap-5">
      <ComboBox label="En erreur" items={COUNTRIES} error="Choisissez un pays dans la liste." />
      <ComboBox label="Désactivé" items={COUNTRIES} isDisabled defaultValue="c7" />
      <ComboBox label="Lecture seule" items={COUNTRIES} isReadOnly defaultValue="c7" />
      <ComboBox label="Lecture seule, multiple" selectionMode="multiple" items={TAGS} isReadOnly defaultValue={["t0", "t1"]} />
      <ComboBox label="Petite largeur" width="sm" items={COUNTRIES} />
    </div>
  ),
};

/** S'ouvre à la frappe, au chevron, à flèche bas ; pas au focus (D-147). */
export const Ouverture: Story = {
  render: () => <Single />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("combobox", { name: /Pays/ });
    await userEvent.click(input);
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{ArrowDown}");
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await expect(body().getAllByRole("option")).toHaveLength(COUNTRIES.length);
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(c.getByRole("button", { name: "Afficher les choix" }));
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(c.getByRole("button", { name: "Afficher les choix" }));
    await expect(input).toHaveAttribute("aria-expanded", "false");
  },
};

/** Filtre « contient », sans casse ni accents ; texte trouvé en gras (D-145, D-087). */
export const Filtre: Story = {
  render: () => <Single />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox", { name: /Pays/ });
    await userEvent.type(input, "GRE");
    const options = body().getAllByRole("option");
    await expect(options).toHaveLength(1);
    await expect(options[0]).toHaveTextContent("Grèce");
    await expect(options[0]?.querySelector("strong")).toHaveTextContent("Grè");
    await userEvent.clear(input);
    await userEvent.type(input, "zz");
    await expect(body().getByText("Aucun résultat")).toBeInTheDocument();
  },
};

/** Choix simple : Entrée choisit, remplace le texte, ferme la liste (D-144). */
export const ChoixSimple: Story = {
  render: () => <Single />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox", { name: /Pays/ });
    await userEvent.type(input, "fra{Enter}");
    await expect(input).toHaveValue("France");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await expect(valueOf(canvasElement)).toBe("c7");
    await userEvent.keyboard("{ArrowDown}");
    await expect(body().getByRole("option", { name: /France/ })).toHaveAttribute("aria-selected", "true");
  },
};

/** Choix multiple : liste ouverte, coche, second choix retire ; × et Retour arrière retirent (D-144, D-147). */
export const ChoixMultiple: Story = {
  render: () => <Multiple />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("combobox", { name: /Étiquettes/ });
    await userEvent.type(input, "urg{Enter}");
    await expect(input).toHaveValue("");
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await userEvent.type(input, "cli{Enter}");
    await expect(valueOf(canvasElement)).toEqual(["t0", "t2"]);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await userEvent.click(body().getByRole("option", { name: /Urgent/ }));
    await expect(valueOf(canvasElement)).toEqual(["t2"]);
    await userEvent.type(input, "fin{Enter}");
    await userEvent.click(c.getByRole("button", { name: "Retirer Client" }));
    await expect(valueOf(canvasElement)).toEqual(["t4"]);
    await userEvent.keyboard("{Escape}{Backspace}");
    await expect(valueOf(canvasElement)).toEqual(["t4"]);
    await userEvent.keyboard("{Backspace}");
    await expect(valueOf(canvasElement)).toEqual([]);
  },
};

/** Flèches, Échap qui ferme puis rétablit le texte (D-147). */
export const Clavier: Story = {
  render: () => <Single />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox", { name: /Pays/ });
    await userEvent.type(input, "an");
    await expect(input.getAttribute("aria-activedescendant")).toBeTruthy();
    const first = input.getAttribute("aria-activedescendant");
    await userEvent.keyboard("{ArrowDown}");
    await expect(input.getAttribute("aria-activedescendant")).not.toBe(first);
    await userEvent.keyboard("{Enter}");
    const chosen = (input as HTMLInputElement).value;
    await userEvent.type(input, "xyz");
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveValue(chosen);
  },
};

/** Choix simple : un texte non reconnu revient à la valeur choisie à la sortie ; la valeur ne change pas (D-147). */
export const Sortie: Story = {
  render: () => <Single />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox", { name: /Pays/ });
    await userEvent.type(input, "bel{Enter}");
    await userEvent.clear(input);
    await userEvent.type(input, "zz");
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveValue("Belgique"));
    await expect(valueOf(canvasElement)).toBe("c2");
  },
};

/** « Ajouter « texte » » ; le premier élément trouvé reste mis en avant (D-142). */
export const ValeurLibre: Story = {
  render: () => <Multiple allowsCustomValue />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox", { name: /Étiquettes/ });
    await userEvent.type(input, "sup");
    await expect(body().getAllByRole("option")[0]).toHaveTextContent("Ajouter « sup »");
    await userEvent.keyboard("{Enter}");
    await expect(valueOf(canvasElement)).toEqual(["t7"]);
    await userEvent.type(input, "Nouveau{Enter}");
    await waitFor(() => expect(valueOf(canvasElement)).toEqual(["t7", "new-Nouveau"]));
  },
};

/** Source asynchrone : 2 caractères, attente, dernière réponse seule, erreur et « Réessayer » (D-145). */
export const Asynchrone: Story = {
  render: () => (
    <div className="w-[480px]">
      <ComboBox label="Responsable" placeholder="Rechercher une personne" loadItems={api} isRequired />
    </div>
  ),
  play: async ({ canvasElement }) => {
    failNext = true;
    const input = within(canvasElement).getByRole("combobox", { name: /Responsable/ });
    await userEvent.type(input, "m");
    await expect(body().getByText("Tapez au moins 2 caractères.")).toBeInTheDocument();
    await userEvent.type(input, "a");
    await expect(body().getByText("Recherche…")).toBeInTheDocument();
    // Le Spinner de socle (D-360) : décoratif dans la liste, nommé dans le champ.
    await expect(body().getByText("Recherche…").closest("[role=status]")?.querySelector("[data-spinner]")).not.toBeNull();
    await pause(100);
    await userEvent.type(input, "r");
    await waitFor(() => expect(body().getAllByRole("option")).toHaveLength(2), { timeout: 2000 });
    await expect(body().getAllByRole("option")[0]).toHaveTextContent("mdurand@exemple.org");
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveValue("Marie Durand");
    await userEvent.clear(input);
    await userEvent.type(input, "err");
    await waitFor(() => expect(body().getByRole("alert")).toHaveTextContent("Résultats indisponibles"), { timeout: 2000 });
    await userEvent.click(body().getByRole("button", { name: "Réessayer" }));
    await waitFor(() => expect(body().queryByRole("alert")).toBeNull(), { timeout: 2000 });
  },
};

/** L'erreur s'affiche à la sortie d'un champ modifié, ou à l'envoi ; le focus va au premier champ en erreur (D-132). */
export const Verification: Story = {
  render: () => (
    <form
      className="flex w-[480px] flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <ComboBox label="Pays" items={COUNTRIES} isRequired />
      <ComboBox label="Destination" items={COUNTRIES} isRequired requiredMessage="Choisissez le pays de livraison." />
      <ComboBox label="Étiquettes" selectionMode="multiple" items={TAGS} validate={(v) => (v.length > 3 ? "Choisissez 3 étiquettes au plus." : null)} />
      <button type="submit" className="w-fit rounded-md bg-field px-3 py-1 text-sm">
        Envoyer
      </button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const pays = c.getByRole("combobox", { name: /Pays/ });
    await userEvent.click(pays);
    await userEvent.tab();
    await expect(c.queryByText("Choisissez une valeur pour « Pays ».")).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Envoyer" }));
    // Message construit à partir du libellé, ou `requiredMessage` (D-344).
    await waitFor(() => expect(c.getByText("Choisissez une valeur pour « Pays ».")).toBeInTheDocument());
    await expect(c.getByText("Choisissez le pays de livraison.")).toBeInTheDocument();
    await expect(pays).toHaveAttribute("aria-invalid", "true");
    await expect(pays).toHaveFocus();
    await userEvent.type(pays, "ita{Enter}");
    await userEvent.tab();
    await waitFor(() => expect(c.queryByText("Choisissez une valeur pour « Pays ».")).toBeNull());
    await expect(c.getByText("(facultatif)")).toBeInTheDocument();
  },
};
