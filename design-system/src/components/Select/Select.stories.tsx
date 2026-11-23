import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Select } from "./Select";

const COUNTRIES = ["Allemagne", "Belgique", "Canada", "Espagne", "France", "Italie", "Luxembourg", "Suisse"].map((l) => ({ id: l.toLowerCase(), label: l }));

const meta: Meta<typeof Select> = {
  title: "Composants/Champs/Select",
  component: Select,
  parameters: { layout: "padded" },
  args: { label: "Pays", description: "Détermine la TVA appliquée.", options: COUNTRIES, isRequired: true, width: "md" },
};
export default meta;
type Story = StoryObj<typeof Select>;
const body = () => within(document.body);

export const ParDefaut: Story = {};

export const Etats: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Select label="Choisi" options={COUNTRIES} defaultValue="france" isRequired width="md" />
      <Select label="En erreur" options={COUNTRIES} isRequired error="Choisissez un pays." width="md" />
      <Select label="Désactivé" options={COUNTRIES} isDisabled defaultValue="france" width="md" />
    </div>
  ),
};

export const Sections: Story = {
  args: {
    label: "Fuseau horaire",
    description: "Heure des rappels.",
    options: [
      { title: "Europe", options: [{ id: "paris", label: "Paris" }, { id: "londres", label: "Londres" }] },
      { title: "Amérique", options: [{ id: "montreal", label: "Montréal" }, { id: "ny", label: "New York", isDisabled: true }] },
    ],
  },
};

/** Clavier : ouvre, parcourt, saute par lettres, choisit, Échap ferme sans changer (D-134). */
export const Clavier: Story = {
  render: () => {
    const [v, setV] = useState<string | null>(null);
    return (
      <div className="flex flex-col gap-2">
        <Select label="Pays" options={COUNTRIES} isRequired width="md" value={v} onChange={setV} />
        <output data-testid="v">{v ?? "—"}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    const list = await waitFor(() => body().getByRole("listbox"));
    await userEvent.keyboard("lu");
    await waitFor(() => expect(within(list).getByRole("option", { name: "Luxembourg" })).toHaveAttribute("data-focused", "true"));
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(c.getByTestId("v")).toHaveTextContent("luxembourg"));
    await expect(body().queryByRole("listbox")).toBeNull();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => body().getByRole("listbox"));
    await userEvent.keyboard("{ArrowDown}{Escape}");
    await waitFor(() => expect(body().queryByRole("listbox")).toBeNull());
    await expect(c.getByTestId("v")).toHaveTextContent("luxembourg");
    await waitFor(() => expect(c.getByRole("button", { name: /Luxembourg/ })).toHaveFocus());
  },
};

/** Obligatoire sans valeur : en erreur à l'envoi (D-132). */
export const Verification: Story = {
  render: () => (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
      <Select label="Pays" options={COUNTRIES} isRequired width="md" name="pays" />
      <button type="submit" className="w-fit">Valider</button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Valider" }));
    await waitFor(() => expect(c.getByText("Choisissez une valeur pour « Pays ».")).toBeVisible());
  },
};

const LONG = "Établissement secondaire de Clermont-Ferrand, service des achats et de la comptabilité fournisseurs";

/** Option ou valeur trop longue : ellipse, info-bulle avec le texte complet, seulement si le texte est coupé. */
export const TexteLong: Story = {
  args: {
    label: "Établissement",
    description: "Lieu de facturation.",
    options: [
      { id: "siege", label: "Siège" },
      { id: "long", label: LONG },
    ],
  },
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    const list = await waitFor(() => body().getByRole("listbox"));
    await waitFor(() => expect(within(list).getByRole("option", { name: "Siège" })).toHaveAttribute("data-focused", "true"));
    await new Promise((r) => setTimeout(r, 50));
    await expect(body().queryByRole("tooltip")).toBeNull();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(body().getByRole("tooltip")).toHaveTextContent(LONG));
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(body().queryByRole("listbox")).toBeNull());
    // Le focus revient au cadre : la valeur coupée a aussi son info-bulle.
    await waitFor(() => expect(body().getByRole("tooltip")).toHaveTextContent(LONG));
  },
};

/** Lecture seule (D-131, D-342) : cadre gris et cadenas ; la valeur se sélectionne ; la liste ne s'ouvre pas. */
export const LectureSeule: Story = {
  render: () => (
    <form>
      <Select label="Pays" options={COUNTRIES} defaultValue="france" isReadOnly isRequired width="md" name="pays" description="Fixé à la création." />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByRole("textbox", { name: "Pays" });
    await expect(field).toHaveValue("France");
    await expect(field).toHaveAttribute("readonly");
    await expect(canvasElement.querySelector('[title="Lecture seule"]')).not.toBeNull();
    await userEvent.click(field);
    await userEvent.keyboard("{ArrowDown}");
    await expect(body().queryByRole("listbox")).toBeNull();
    await expect(field).toHaveValue("France");
    // Texte sélectionnable, valeur envoyée avec le formulaire.
    const input = field as HTMLInputElement;
    input.select();
    await expect(input.value.slice(input.selectionStart ?? 0, input.selectionEnd ?? 0)).toBe("France");
    const form = canvasElement.querySelector("form");
    await expect(form && new FormData(form).get("pays")).toBe("france");
  },
};
