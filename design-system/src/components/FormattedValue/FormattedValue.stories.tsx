import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { FormattedValue, valueLayout, valueSortKey, type ValueFormat } from "./FormattedValue";

const meta: Meta<typeof FormattedValue> = {
  title: "Composants/FormattedValue",
  component: FormattedValue,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof FormattedValue>;

const STATUSES = { en_cours: { label: "En cours", tone: "pending" }, close: { label: "Close", tone: "success" } } as const;
const now = Date.now();

const SAMPLES: Array<{ id: string; value: unknown; format: ValueFormat; note: string }> = [
  { id: "text", value: "Accès au VPN", format: {}, note: "texte" },
  { id: "longtext", value: "Première ligne\nDeuxième ligne", format: { type: "longtext" }, note: "retours gardés" },
  { id: "number", value: 1234.5, format: { type: "number" }, note: "" },
  { id: "money", value: 1234.5, format: { type: "money" }, note: "EUR par défaut" },
  { id: "percent", value: 0.25, format: { type: "percent" }, note: "" },
  { id: "bytes", value: 1234567, format: { type: "bytes" }, note: "" },
  { id: "date", value: "2026-11-20", format: { type: "date" }, note: "AAAA-MM-JJ" },
  { id: "datetime", value: "2026-11-20T14:30:00", format: { type: "datetime" }, note: "" },
  { id: "relative", value: new Date(now - 3 * 86400000), format: { type: "relative" }, note: "" },
  { id: "relative-now", value: new Date(now - 10000), format: { type: "relative" }, note: "moins d'une minute" },
  { id: "duration", value: 3900, format: { type: "duration" }, note: "secondes" },
  { id: "duration-ms", value: 45000, format: { type: "duration", durationUnit: "ms" }, note: "millisecondes" },
  { id: "boolean", value: true, format: { type: "boolean" }, note: "" },
  { id: "status", value: "en_cours", format: { type: "status", statuses: STATUSES }, note: "" },
  { id: "email", value: "ines@exemple.fr", format: { type: "email" }, note: "" },
  { id: "url", value: "https://exemple.fr", format: { type: "url" }, note: "" },
  { id: "code", value: "D-1003", format: { type: "code" }, note: "" },
  { id: "tags", value: ["vpn", "accès"], format: { type: "tags" }, note: "" },
];

const Grid = ({ samples }: { samples: typeof SAMPLES }) => (
  <table className="border-separate border-spacing-x-4 border-spacing-y-1 font-sans text-md text-fg">
    <tbody>
      {samples.map((s) => (
        <tr key={s.id}>
          <td className="text-sm text-fg-3">{s.format.type ?? "text"}</td>
          <td data-testid={s.id}>
            <FormattedValue value={s.value} {...s.format} />
          </td>
          <td className="text-sm text-fg-3">{s.note}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const cell = (el: HTMLElement, id: string) => within(el).getByTestId(id).textContent?.replace(/ | /g, " ");

/** Chaque type et son format français (D-170). */
export const TousLesTypes: Story = {
  render: () => <Grid samples={SAMPLES} />,
  play: async ({ canvasElement: c }) => {
    await expect(cell(c, "number")).toBe("1 234,5");
    await expect(cell(c, "money")).toBe("1 234,50 €");
    await expect(cell(c, "percent")).toBe("25 %");
    await expect(cell(c, "bytes")).toBe("1,2 Mo");
    await expect(cell(c, "date")).toBe("20 nov. 2026");
    await expect(cell(c, "datetime")).toMatch(/^20 nov\. 2026,? (à )?14:30$/);
    await expect(cell(c, "relative")).toBe("il y a 3 jours");
    await expect(cell(c, "relative-now")).toBe("à l'instant");
    await expect(cell(c, "duration")).toBe("1 h 5 min");
    await expect(cell(c, "duration-ms")).toBe("45 s");
    await expect(cell(c, "boolean")).toBe("Oui");
    await expect(cell(c, "status")).toBe("En cours");
    await expect(cell(c, "tags")).toBe("vpn, accès");
    await expect(within(c).getByRole("link", { name: /ines@exemple\.fr/ })).toHaveAttribute("href", "mailto:ines@exemple.fr");
    await expect(c.querySelector("[data-testid=date] time")).toHaveAttribute("datetime");
    await expect(c.querySelector("[data-testid=code] code")).not.toBeNull();
  },
};

/** Vide : « — » lu « vide » ; illisible : texte brut (D-171). */
export const Vides: Story = {
  render: () => (
    <Grid
      samples={[
        { id: "null", value: null, format: { type: "money" }, note: "null" },
        { id: "blank", value: "", format: {}, note: "texte vide" },
        { id: "list", value: [], format: { type: "tags" }, note: "liste vide" },
        { id: "bad-date", value: "bientôt", format: { type: "date" }, note: "date illisible" },
        { id: "bad-number", value: "beaucoup", format: { type: "number" }, note: "nombre illisible" },
        { id: "unknown", value: "archivee", format: { type: "status", statuses: STATUSES }, note: "statut inconnu" },
      ]}
    />
  ),
  play: async ({ canvasElement: c }) => {
    await expect(cell(c, "null")).toBe("—vide");
    await expect(cell(c, "list")).toBe("—vide");
    await expect(cell(c, "bad-date")).toBe("bientôt");
    await expect(cell(c, "bad-number")).toBe("beaucoup");
    await expect(cell(c, "unknown")).toBe("archivee");
  },
};

/** Tri sur la valeur, alignement et largeur par type (D-172). */
export const TriEtColonnes: Story = {
  render: () => <p className="font-sans text-sm text-fg-2">Fonctions pures : voir le test.</p>,
  play: async () => {
    await expect(valueSortKey("9", { type: "number" })).toBeLessThan(valueSortKey("10", { type: "number" })!);
    await expect(valueSortKey("2026-01-02", { type: "date" })).toBeGreaterThan(valueSortKey("2025-12-31", { type: "date" })!);
    await expect(valueSortKey(null, { type: "number" })).toBeNull();
    await expect(valueLayout("money")).toEqual({ align: "end", width: 130 });
    await expect(valueLayout("text")).toEqual({ align: "start" });
  },
};
