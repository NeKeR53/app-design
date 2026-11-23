import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { NumberField } from "./NumberField";

const meta: Meta<typeof NumberField> = {
  title: "Composants/Champs/NumberField",
  component: NumberField,
  parameters: { layout: "padded" },
  args: { label: "Quantité", description: "Nombre de pièces à commander.", isRequired: true, defaultValue: 1250, unit: "pièces" },
};
export default meta;
type Story = StoryObj<typeof NumberField>;

/** Espaces de groupe du français (espace fine insécable) ramenées à une espace simple, pour comparer. */
const plain = (s: string) => s.replace(/[  ]/g, " ");

export const ParDefaut: Story = {};

/** Tous les états, côte à côte (D-130, D-131). */
export const Etats: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <NumberField label="Vide" />
      <NumberField label="Rempli" isRequired defaultValue={1250} unit="pièces" description="Stock disponible : 4 000." />
      <NumberField label="En erreur" isRequired defaultValue={12} error="Le lot minimum est de 50 pièces." />
      <NumberField label="Lecture seule" isRequired isReadOnly defaultValue={1250} unit="pièces" />
      <NumberField label="Désactivé" isDisabled defaultValue={3} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Lecture seule : pas de flèches, cadenas (D-131).
    await expect(c.getAllByRole("button", { name: /^Augmenter/ })).toHaveLength(4);
    await expect(c.getByRole("textbox", { name: /Lecture seule/ })).toHaveAttribute("readonly");
  },
};

/** Format de la langue, unité dans le champ et lue avec la valeur ; chiffres alignés à droite (D-356). */
export const Formats: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <NumberField label="Quantité" defaultValue={1250} unit="pièces" />
      <NumberField label="Prix unitaire" defaultValue={12.5} formatOptions={{ style: "currency", currency: "EUR" }} step={0.5} />
      <NumberField label="Remise" defaultValue={0.15} formatOptions={{ style: "percent" }} minValue={0} maxValue={1} />
      <NumberField label="Poids" defaultValue={2.4} formatOptions={{ style: "unit", unit: "kilogram", maximumFractionDigits: 1 }} step={0.1} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const qty = c.getByRole("textbox", { name: /Quantité/ });
    await expect(plain((qty as HTMLInputElement).value)).toBe("1 250");
    await expect(qty).toHaveAccessibleName(/pièces/);
    await expect(getComputedStyle(qty).textAlign).toBe("right");
    await expect(plain((c.getByRole("textbox", { name: /Prix unitaire/ }) as HTMLInputElement).value)).toBe("12,50 €");
    await expect(plain((c.getByRole("textbox", { name: /Remise/ }) as HTMLInputElement).value)).toBe("15 %");
    await expect(plain((c.getByRole("textbox", { name: /Poids/ }) as HTMLInputElement).value)).toBe("2,4 kg");
  },
};

function Controlled() {
  const [v, setV] = useState<number | null>(10);
  return (
    <div className="flex flex-col gap-2">
      <NumberField label="Quantité" isRequired value={v} onChange={setV} minValue={0} maxValue={100} />
      <output data-testid="v">{v ?? "—"}</output>
      <button type="button">Après</button>
    </div>
  );
}

/** Clavier : ↑ ↓ un pas, Maj dix pas, Page haut / bas dix pas, Origine / Fin minimum / maximum (D-356). */
export const Clavier: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox", { name: /Quantité/ });
    const v = c.getByTestId("v");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => expect(v).toHaveTextContent("11"));
    await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}");
    await waitFor(() => expect(v).toHaveTextContent("21"));
    await userEvent.keyboard("{PageDown}");
    await waitFor(() => expect(v).toHaveTextContent("11"));
    await userEvent.keyboard("{PageUp}{PageUp}");
    await waitFor(() => expect(v).toHaveTextContent("31"));
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(v).toHaveTextContent("100"));
    // Au maximum, un pas de plus ne dépasse pas.
    await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}{ArrowUp}");
    await waitFor(() => expect(v).toHaveTextContent("100"));
    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(v).toHaveTextContent("0"));
    await userEvent.keyboard("{ArrowDown}{PageDown}");
    await waitFor(() => expect(v).toHaveTextContent("0"));
    await expect(input).toHaveValue("0");
  },
};

/** Flèches empilées à droite, hors de l'ordre de tabulation (D-356). */
export const Fleches: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const up = c.getByRole("button", { name: /^Augmenter/ });
    const down = c.getByRole("button", { name: /^Diminuer/ });
    await expect(up).toHaveAttribute("tabindex", "-1");
    await expect(down).toHaveAttribute("tabindex", "-1");
    await userEvent.click(up);
    await userEvent.click(up);
    await waitFor(() => expect(c.getByTestId("v")).toHaveTextContent("12"));
    await userEvent.click(down);
    await waitFor(() => expect(c.getByTestId("v")).toHaveTextContent("11"));
    // Tab passe du champ au bouton suivant de la page, sans s'arrêter sur les flèches.
    await userEvent.click(c.getByRole("textbox", { name: /Quantité/ }));
    await userEvent.tab();
    await expect(c.getByRole("button", { name: "Après" })).toHaveFocus();
  },
};

/** Molette désactivée : faire défiler la page ne change pas la valeur (D-356). */
export const Molette: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox", { name: /Quantité/ });
    await userEvent.click(input);
    fireEvent.wheel(input, { deltaY: -100 });
    fireEvent.wheel(input, { deltaY: -100 });
    await expect(c.getByTestId("v")).toHaveTextContent("10");
  },
};

/** Minimum et maximum vérifiés en quittant le champ, avec le message de Field ; la saisie est gardée (D-356, D-132). */
export const Bornes: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox", { name: /Quantité/ });
    await userEvent.clear(input);
    await userEvent.type(input, "500");
    // Pas de message pendant la frappe.
    await expect(c.queryByText(/Saisissez une valeur/)).toBeNull();
    await userEvent.tab();
    await waitFor(() => expect(c.getByText("Saisissez une valeur de 0 à 100.")).toBeVisible());
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveValue("500");
    // Une flèche ramène dans les bornes et efface le message.
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(c.getByTestId("v")).toHaveTextContent("100"));
    await userEvent.tab();
    await waitFor(() => expect(c.queryByText("Saisissez une valeur de 0 à 100.")).toBeNull());
  },
};

/** Saisie libre, relue en quittant le champ dans le format de la langue (D-356). */
export const Saisie: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox", { name: /Quantité/ });
    await userEvent.clear(input);
    await userEvent.type(input, "42");
    await userEvent.tab();
    await waitFor(() => expect(c.getByTestId("v")).toHaveTextContent("42"));
    await userEvent.clear(input);
    await userEvent.tab();
    await waitFor(() => expect(c.getByText("Renseignez « Quantité ».")).toBeVisible());
  },
};

/** Lecture seule : la valeur ne change pas, ni au clavier ni à la molette (D-131). */
export const LectureSeule: Story = {
  args: { isReadOnly: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox", { name: /Quantité/ });
    await expect(c.queryByRole("button")).toBeNull();
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowUp}{Shift>}{ArrowUp}{/Shift}{PageUp}");
    await expect(plain((input as HTMLInputElement).value)).toBe("1 250");
  },
};
