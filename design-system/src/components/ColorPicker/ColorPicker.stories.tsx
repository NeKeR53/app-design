import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ColorPicker } from "./ColorPicker";

const onChange = fn();

const meta: Meta<typeof ColorPicker> = {
  title: "Composants/Champs/ColorPicker",
  component: ColorPicker,
  parameters: { layout: "padded" },
  args: { label: "Couleur de l'étiquette", onChange },
};
export default meta;
type Story = StoryObj<typeof ColorPicker>;

const body = () => within(document.body);

/** Couleur calculée d'un token, pour comparer. */
function token(name: string) {
  const probe = document.createElement("div");
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

export const ParDefaut: Story = {};

/** Palette par défaut : les 8 couleurs des graphiques, chacune nommée ; pastilles de 24 px (D-367). */
export const Palette: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const list = c.getByRole("listbox", { name: "Couleur de l'étiquette" });
    const options = within(list).getAllByRole("option");
    await expect(options).toHaveLength(8);
    await expect(options.map((o) => o.getAttribute("aria-label"))).toEqual(["Bleu", "Orange", "Vert", "Jaune", "Rose", "Vert foncé", "Violet", "Rouge"]);
    await expect(c.getByRole("option", { name: "Bleu" }).offsetWidth).toBe(24);
    // Aucune couleur choisie par défaut.
    await expect(options.filter((o) => o.getAttribute("aria-selected") === "true")).toHaveLength(0);
  },
};

/** Choix exclusif : un clic choisit ; les flèches déplacent et choisissent ; un seul arrêt de Tab. */
export const ChoixAuxFleches: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2">
      <ColorPicker {...args} />
      <button type="button">Après</button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    onChange.mockClear();
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("option", { name: "Bleu" }));
    await expect(onChange).toHaveBeenLastCalledWith("#2a78d6");
    await expect(c.getByRole("option", { name: "Bleu" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowRight}");
    await expect(onChange).toHaveBeenLastCalledWith("#eb6834");
    await expect(c.getByRole("option", { name: "Orange" })).toHaveAttribute("aria-selected", "true");
    await expect(c.getByRole("option", { name: "Bleu" })).toHaveAttribute("aria-selected", "false");
    await expect(c.getAllByRole("option").filter((o) => o.getAttribute("aria-selected") === "true")).toHaveLength(1);
    await userEvent.keyboard("{End}");
    await expect(onChange).toHaveBeenLastCalledWith("#e34948");
    await userEvent.keyboard("{Home}");
    await expect(onChange).toHaveBeenLastCalledWith("#2a78d6");
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.tab();
    await expect(document.activeElement).toBe(c.getByRole("button", { name: "Après" }));
    await userEvent.tab({ shift: true });
    await expect(document.activeElement).toBe(c.getByRole("option", { name: "Orange" }));
  },
};

/** Pastille choisie : anneau --fg de 2 px, décalé de 2 px ; les autres n'en ont pas. */
export const Selection: Story = {
  args: { defaultValue: "#1BAF7A" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const on = c.getByRole("option", { name: "Vert" });
    await expect(on).toHaveAttribute("aria-selected", "true");
    const shadow = getComputedStyle(on).boxShadow;
    await expect(shadow).toContain(token("--fg"));
    await expect(shadow).toContain("0px 0px 0px 4px");
    await expect(shadow).toContain("0px 0px 0px 2px");
    await expect(getComputedStyle(c.getByRole("option", { name: "Bleu" })).boxShadow).toBe("none");
  },
};

/** Le nom de la couleur s'affiche en info-bulle, tout de suite au focus clavier. */
export const InfoBulle: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(document.activeElement).toBe(within(canvasElement).getByRole("option", { name: "Bleu" }));
    await waitFor(() => expect(body().getByRole("tooltip")).toHaveTextContent("Bleu"));
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(body().getByRole("tooltip")).toHaveTextContent("Orange"));
  },
};

/** Palette de l'app : ses couleurs et ses noms. */
export const PaletteDeLApp: Story = {
  args: {
    label: "Couleur du projet",
    colors: [
      { value: "#0f766e", name: "Sarcelle" },
      { value: "#b91c1c", name: "Brique" },
      { value: "#1e3a8a", name: "Marine" },
      { value: "#a16207", name: "Ocre" },
      { value: "#6d28d9", name: "Prune" },
      { value: "#334155", name: "Ardoise" },
      { value: "#be185d", name: "Framboise" },
      { value: "#15803d", name: "Sapin" },
      { value: "#c2410c", name: "Rouille" },
      { value: "#0369a1", name: "Océan" },
    ],
    value: "#1e3a8a",
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole("option")).toHaveLength(10);
    await expect(c.getByRole("option", { name: "Marine" })).toHaveAttribute("aria-selected", "true");
  },
};

function Custom() {
  const [v, setV] = useState("#2a78d6");
  return (
    <div className="flex flex-col gap-2">
      <ColorPicker label="Couleur" allowsCustom value={v} onChange={setV} />
      <output data-testid="v">{v}</output>
    </div>
  );
}

/** Saisie hexadécimale (`allowsCustom`) : une couleur hors du nuancier ; le champ suit le nuancier. */
export const SaisieHexadecimale: Story = {
  render: () => <Custom />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByRole("textbox", { name: "Code hexadécimal" });
    await expect(field).toHaveValue("#2A78D6");
    await userEvent.clear(field);
    await userEvent.type(field, "#123456{Enter}");
    await expect(c.getByTestId("v")).toHaveTextContent("#123456");
    // Couleur hors du nuancier : aucune pastille choisie.
    await expect(c.getAllByRole("option").filter((o) => o.getAttribute("aria-selected") === "true")).toHaveLength(0);
    await userEvent.click(c.getByRole("option", { name: "Rouge" }));
    await expect(c.getByTestId("v")).toHaveTextContent("#e34948");
    await waitFor(() => expect(field).toHaveValue("#E34948"));
    // Code invalide : la valeur précédente revient.
    await userEvent.clear(field);
    await userEvent.type(field, "#zz{Enter}");
    await userEvent.tab();
    await expect(c.getByTestId("v")).toHaveTextContent("#e34948");
    await waitFor(() => expect(field).toHaveValue("#E34948"));
  },
};

function Contrast() {
  const [v, setV] = useState("#6250d6");
  return <ColorPicker label="Fond de l'étiquette" description="Le texte de l'étiquette est blanc." contrastWith="#ffffff" value={v} onChange={setV} />;
}

/** `contrastWith` : sous 4,5 pour 1 avec la couleur du texte, une alerte en --warning s'affiche et décrit le nuancier. */
export const Contraste: Story = {
  render: () => <Contrast />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const list = c.getByRole("listbox");
    await expect(c.queryByText(/Contraste trop faible/)).toBeNull();
    await expect(list).toHaveAccessibleDescription("Le texte de l'étiquette est blanc.");
    await userEvent.click(c.getByRole("option", { name: "Jaune" }));
    const warning = await waitFor(() => c.getByText(/Contraste trop faible avec le texte/));
    await expect(warning).toHaveTextContent("4,5 pour 1 au moins");
    await expect(getComputedStyle(warning).color).toBe(token("--warning"));
    await expect(warning).toHaveAttribute("aria-live", "polite");
    await expect(list).toHaveAccessibleDescription(/Contraste trop faible/);
    await userEvent.click(c.getByRole("option", { name: "Violet" }));
    await waitFor(() => expect(c.queryByText(/Contraste trop faible/)).toBeNull());
  },
};

/** Désactivé : 40 %, aucune pastille ne se choisit. */
export const Desactive: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    onChange.mockClear();
    const c = within(canvasElement);
    await expect(getComputedStyle(c.getByRole("group")).opacity).toBe("0.4");
    await userEvent.click(c.getByRole("option", { name: "Bleu" }));
    await expect(onChange).not.toHaveBeenCalled();
  },
};
