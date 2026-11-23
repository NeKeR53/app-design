import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DatePicker, DateRangePicker, type DateRange } from "./DatePicker";
import { ThemeIconsContext } from "../../icons";

const meta: Meta<typeof DatePicker> = {
  title: "Composants/Champs/DatePicker",
  component: DatePicker,
  parameters: { layout: "padded" },
  args: { label: "Date de livraison", description: "Livraison du lundi au vendredi.", isRequired: true, defaultValue: "2026-11-24" },
};
export default meta;
type Story = StoryObj<typeof DatePicker>;
const body = () => within(document.body);
const dialog = () => body().getByRole("dialog");

/** Week-ends et 25 novembre indisponibles. */
const closed = (d: string) => {
  const day = new Date(`${d}T12:00:00`).getDay();
  return day === 0 || day === 6 || d === "2026-11-25";
};

export const ParDefaut: Story = {};

/** Icône calendrier interne : un thème peut la remplacer (D-338). */
export const IconeDuTheme: Story = {
  render: (args) => (
    <ThemeIconsContext.Provider value={{ viewBox: "0 0 16 16", paths: { Calendar: "M2 2h12v12H2z" } }}>
      <DatePicker {...args} />
    </ThemeIconsContext.Provider>
  ),
  play: async ({ canvasElement }) => {
    const svg = within(canvasElement).getByRole("button", { name: /calendrier/i }).querySelector("svg");
    await expect(svg?.getAttribute("data-icon-source")).toBe("theme");
    await expect(svg?.querySelector("path")?.getAttribute("d")).toBe("M2 2h12v12H2z");
  },
};

/** Tous les états, côte à côte (D-130, D-131). */
export const Etats: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <DatePicker label="Vide" />
      <DatePicker label="Remplie" isRequired defaultValue="2026-11-24" description="Date de la commande." />
      <DatePicker label="En erreur" isRequired defaultValue="2026-11-24" error="Cette date est déjà réservée." />
      <DatePicker label="Lecture seule" isRequired isReadOnly defaultValue="2026-11-24" />
      <DatePicker label="Désactivée" isDisabled defaultValue="2026-11-24" />
      <DateRangePicker label="Période" isRequired defaultValue={{ start: "2026-11-03", end: "2026-11-24" }} />
      <DateRangePicker label="Période (lecture seule)" isRequired isReadOnly defaultValue={{ start: "2026-11-03", end: "2026-11-24" }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Lecture seule : pas de bouton calendrier (D-131).
    await expect(c.getAllByRole("button", { name: /Ouvrir le calendrier/ })).toHaveLength(5);
    // Le cadre suit les largeurs de Field : sm pour une date, md pour une plage (D-133).
    const groups = c.getAllByRole("group");
    for (const g of groups) await expect(g.scrollWidth).toBeLessThanOrEqual(g.clientWidth + 1);
  },
};

function Controlled({ min, max, unavailable }: { min?: string; max?: string; unavailable?: boolean }) {
  const [v, setV] = useState<string | null>("2026-11-10");
  return (
    <div className="flex flex-col gap-2">
      <DatePicker
        label="Date de livraison"
        isRequired
        value={v}
        onChange={setV}
        {...(min ? { minValue: min } : {})}
        {...(max ? { maxValue: max } : {})}
        {...(unavailable ? { isDateUnavailable: closed } : {})}
      />
      <output data-testid="v">{v ?? "—"}</output>
    </div>
  );
}

/** Saisie au clavier : JJ / MM / AAAA dans l'ordre de la langue, ↑ ↓ changent un segment (D-354). */
export const Clavier: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const [day, month, year] = c.getAllByRole("spinbutton");
    await expect(day).toHaveAccessibleName(/jour/i);
    await expect(month).toHaveAccessibleName(/mois/i);
    await expect(year).toHaveAccessibleName(/année/i);
    await userEvent.click(day!);
    await userEvent.keyboard("24");
    // Le segment suivant prend le focus.
    await waitFor(() => expect(month).toHaveFocus());
    await userEvent.keyboard("12");
    await waitFor(() => expect(c.getByTestId("v")).toHaveTextContent("2026-12-24"));
    await userEvent.click(day!);
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => expect(c.getByTestId("v")).toHaveTextContent("2026-12-25"));
  },
};

/** Le calendrier : un mois, la semaine commence le lundi en français ; choisir un jour ferme le volet (D-354). */
export const Calendrier: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Ouvrir le calendrier/ }));
    const d = await waitFor(() => dialog());
    await expect(within(d).getByRole("button", { name: /^novembre 2026, choisir le mois/ })).toBeVisible();
    // En-têtes des jours (cachés aux lecteurs d'écran par React Aria, qui nomme chaque jour en entier).
    const heads = Array.from(d.querySelectorAll("th")).map((th) => th.textContent);
    await expect(heads).toEqual(["L", "M", "M", "J", "V", "S", "D"]);
    await userEvent.click(within(d).getByRole("button", { name: "Mois suivant" }));
    await waitFor(() => expect(within(d).getByRole("button", { name: /^décembre 2026/ })).toBeVisible());
    await userEvent.click(within(d).getByRole("button", { name: /\s3 décembre 2026/ }));
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await expect(c.getByTestId("v")).toHaveTextContent("2026-12-03");
  },
};

/** Au clavier dans le calendrier : flèches entre les jours, Entrée choisit, Échap ferme sans changer. */
export const CalendrierClavier: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Ouvrir le calendrier/ }));
    const d = await waitFor(() => dialog());
    await waitFor(() => expect(within(d).getByRole("button", { name: /\s10 novembre 2026/ })).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}{ArrowDown}");
    await waitFor(() => expect(within(d).getByRole("button", { name: /\s18 novembre 2026/ })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await expect(c.getByTestId("v")).toHaveTextContent("2026-11-10");
    await userEvent.click(c.getByRole("button", { name: /Ouvrir le calendrier/ }));
    await waitFor(() => expect(within(dialog()).getByRole("button", { name: /\s10 novembre 2026/ })).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await waitFor(() => expect(c.getByTestId("v")).toHaveTextContent("2026-11-11"));
    await expect(body().queryByRole("dialog")).toBeNull();
  },
};

/** Titre cliquable : choisir le mois, changer d'année, revenir aux jours (D-354). */
export const MoisEtAnnee: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Ouvrir le calendrier/ }));
    const d = await waitFor(() => dialog());
    await userEvent.click(within(d).getByRole("button", { name: /^novembre 2026, choisir le mois/ }));
    await waitFor(() => expect(within(d).getByRole("button", { name: /^nov/ })).toHaveAttribute("aria-pressed", "true"));
    await userEvent.click(within(d).getByRole("button", { name: "Année suivante" }));
    await expect(within(d).getByRole("button", { name: /^2027, revenir aux jours/ })).toBeVisible();
    await userEvent.click(within(d).getByRole("button", { name: /^mars/ }));
    await waitFor(() => expect(within(d).getByRole("button", { name: /^mars 2027/ })).toBeVisible());
    await userEvent.click(within(d).getByRole("button", { name: /\s15 mars 2027/ }));
    await waitFor(() => expect(c.getByTestId("v")).toHaveTextContent("2027-03-15"));
  },
};

/** Jours indisponibles : barrés, non choisissables, refusés à la saisie (D-354). */
export const JourIndisponible: Story = {
  render: () => <Controlled unavailable />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Ouvrir le calendrier/ }));
    const d = await waitFor(() => dialog());
    const off = within(d).getByRole("button", { name: /\s25 novembre 2026/ });
    await expect(off).toHaveAttribute("data-unavailable", "true");
    await expect(getComputedStyle(off).textDecorationLine).toBe("line-through");
    await userEvent.click(off);
    // Le volet reste ouvert, la valeur ne change pas.
    await expect(dialog()).toBeVisible();
    await expect(c.getByTestId("v")).toHaveTextContent("2026-11-10");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    // Saisie d'un jour indisponible : refusée en quittant le champ (D-132).
    const [day] = c.getAllByRole("spinbutton");
    await userEvent.click(day!);
    await userEvent.keyboard("25");
    await userEvent.click(canvasElement);
    await waitFor(() => expect(c.getByText("Cette date n'est pas disponible. Choisissez-en une autre.")).toBeVisible());
  },
};

/** Bornes : hors bornes, les jours sont estompés ; une saisie hors bornes reçoit un message (D-132). */
export const Bornes: Story = {
  render: () => <Controlled min="2026-11-05" max="2026-12-20" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Ouvrir le calendrier/ }));
    const d = await waitFor(() => dialog());
    await expect(within(d).getByRole("button", { name: /\s4 novembre 2026/ })).toHaveAttribute("aria-disabled", "true");
    await expect(within(d).getByRole("button", { name: "Mois précédent" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    const [day] = c.getAllByRole("spinbutton");
    await userEvent.click(day!);
    await userEvent.keyboard("01");
    await userEvent.click(canvasElement);
    await waitFor(() => expect(c.getByText("Choisissez une date à partir du 5 novembre 2026.")).toBeVisible());
  },
};

/** Aujourd'hui est encadré ; le calendrier s'ouvre sur le mois du jour quand le champ est vide. */
export const Aujourdhui: Story = {
  args: { defaultValue: null, label: "Échéance", isRequired: false },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /Ouvrir le calendrier/ }));
    const d = await waitFor(() => dialog());
    const today = d.querySelector<HTMLElement>("[data-today]");
    await expect(today).not.toBeNull();
    await expect(getComputedStyle(today!).boxShadow).not.toBe("none");
  },
};

/** Champ obligatoire vide : message de Field en quittant le champ (D-132). */
export const Obligatoire: Story = {
  render: () => (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
      <DatePicker label="Date de livraison" isRequired name="livraison" />
      <button type="submit" className="w-fit">
        Envoyer
      </button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Envoyer" }));
    await waitFor(() => expect(c.getByText("Renseignez « Date de livraison ».")).toBeVisible());
  },
};

/** Lecture seule : cadenas, pas de bouton, la valeur ne change pas (D-131). */
export const LectureSeule: Story = {
  args: { isReadOnly: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("button")).toBeNull();
    const [day] = c.getAllByRole("spinbutton");
    await expect(day).toHaveAttribute("aria-readonly", "true");
    await userEvent.click(day!);
    await userEvent.keyboard("{ArrowUp}");
    await expect(day).toHaveTextContent("24");
  },
};

function Range({ presets }: { presets?: boolean }) {
  const [v, setV] = useState<DateRange | null>({ start: "2026-11-03", end: "2026-11-24" });
  return (
    <div className="flex flex-col gap-2">
      <DateRangePicker
        label="Période"
        isRequired
        value={v}
        onChange={setV}
        {...(presets
          ? {
              presets: [
                { label: "7 derniers jours", value: { start: "2026-11-17", end: "2026-11-23" } },
                { label: "Ce mois-ci", value: { start: "2026-11-01", end: "2026-11-30" } },
                { label: "Mois dernier", value: { start: "2026-10-01", end: "2026-10-31" } },
              ],
            }
          : {})}
      />
      <output data-testid="v">{v ? `${v.start} → ${v.end}` : "—"}</output>
    </div>
  );
}

/** Plage : un champ « début – fin » ; premier clic le début, second la fin, plage teintée, le volet se ferme (D-354). */
export const Plage: StoryObj<typeof DateRangePicker> = {
  render: () => <Range />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Deux groupes de segments dans un même cadre.
    await expect(c.getAllByRole("spinbutton")).toHaveLength(6);
    await userEvent.click(c.getByRole("button", { name: /Ouvrir le calendrier/ }));
    const d = await waitFor(() => dialog());
    await userEvent.click(within(d).getByRole("button", { name: /\s5 novembre 2026/ }));
    await expect(dialog()).toBeVisible();
    await userEvent.click(within(d).getByRole("button", { name: /\s20 novembre 2026/ }));
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await expect(c.getByTestId("v")).toHaveTextContent("2026-11-05 → 2026-11-20");
    // Les jours de la plage sont teintés.
    await userEvent.click(c.getByRole("button", { name: /Ouvrir le calendrier/ }));
    const d2 = await waitFor(() => dialog());
    const mid = within(d2).getByRole("button", { name: /\s12 novembre 2026/ });
    await expect(mid).toHaveAttribute("data-selected", "true");
    await expect(getComputedStyle(mid).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    await expect(within(d2).getByRole("button", { name: /\s21 novembre 2026/ })).not.toHaveAttribute("data-selected");
  },
};

/** Raccourcis de période : colonne à gauche ; un clic fixe la plage et ferme le volet (D-354). */
export const Raccourcis: StoryObj<typeof DateRangePicker> = {
  render: () => <Range presets />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Ouvrir le calendrier/ }));
    const d = await waitFor(() => dialog());
    const group = within(d).getByRole("group", { name: "Raccourcis de période" });
    await userEvent.click(within(group).getByRole("button", { name: "Ce mois-ci" }));
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await expect(c.getByTestId("v")).toHaveTextContent("2026-11-01 → 2026-11-30");
    await userEvent.click(c.getByRole("button", { name: /Ouvrir le calendrier/ }));
    const d2 = await waitFor(() => dialog());
    await expect(within(d2).getByRole("button", { name: "Ce mois-ci" })).toHaveAttribute("aria-pressed", "true");
  },
};

/** Plage inversée tapée au clavier : message en quittant le champ. */
export const PlageInversee: StoryObj<typeof DateRangePicker> = {
  render: () => <DateRangePicker label="Période" isRequired />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const [d1] = c.getAllByRole("spinbutton");
    await userEvent.click(d1!);
    await userEvent.keyboard("20112026");
    await userEvent.keyboard("05112026");
    await userEvent.click(canvasElement);
    await waitFor(() => expect(c.getByText("La date de fin doit suivre la date de début.")).toBeVisible());
  },
};
