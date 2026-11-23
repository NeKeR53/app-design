import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { UsageRing } from "./UsageRing";
import { UsageMeter } from "./UsageMeter";

const meta: Meta<typeof UsageRing> = {
  title: "Composants/UsageRing",
  component: UsageRing,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof UsageRing>;
const body = () => within(document.body);

/** Couleur calculée d'un jeton, pour la comparer à un trait ou à un fond. */
function tokenColor(token: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}
const ringStroke = (root: Element) => getComputedStyle(root.querySelector("[data-usage-value]")!).stroke;
const fillColor = (root: Element) => getComputedStyle(root.querySelector("[data-usage-fill]")!).backgroundColor;

function Limits() {
  return (
    <>
      <UsageMeter label="Limite sur 5 h" value={79} resetsAt="mar. 00:10" warnAt={75} />
      <UsageMeter label="Semaine · tous modèles" value={69} resetsAt="ven. 06:00" />
    </>
  );
}

/** Bouton nommé « Contexte utilisé : 72 % » ; un clic ouvre le volet des limites (D-378). */
export const ParDefaut: Story = {
  render: () => (
    <div className="pt-48">
      <UsageRing value={72} title="Limites d'usage" action={{ href: "#limites" }}>
        <Limits />
      </UsageRing>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: /^Contexte utilisé : 72\s%$/ });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    const ring = trigger.querySelector("svg")!;
    await expect(ring.getBoundingClientRect().width).toBe(16);
    await expect(ringStroke(trigger)).toBe(tokenColor("--accent"));
    await userEvent.click(trigger);
    const dialog = await waitFor(() => body().getByRole("dialog", { name: "Limites d'usage" }));
    const meters = within(dialog).getAllByRole("meter");
    await expect(meters).toHaveLength(2);
    await expect(meters[0]).toHaveAccessibleName("Limite sur 5 h");
    await expect(within(dialog).getByText("Remise à zéro mar. 00:10")).toBeVisible();
    await expect(within(dialog).getByRole("link", { name: "Tout voir" })).toHaveAttribute("href", "#limites");
    // Placé au-dessus de la jauge.
    const box = dialog.closest(".socle-box")!.getBoundingClientRect();
    await expect(box.bottom).toBeLessThanOrEqual(trigger.getBoundingClientRect().top);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
  },
};

/** L'info-bulle reprend le nom accessible. */
export const InfoBulle: Story = {
  render: () => (
    <div className="pt-16">
      <UsageRing value={72}>
        <Limits />
      </UsageRing>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const trigger = within(canvasElement).getByRole("button");
    await expect(trigger).toHaveFocus();
    const tip = await waitFor(() => body().getByRole("tooltip"));
    await expect(tip.textContent).toBe(trigger.getAttribute("aria-label"));
    await expect(tip).toHaveTextContent(/^Contexte utilisé : 72\s%$/);
  },
};

/** Seuils : accent sous 80 %, alerte à 80 %, critique à 95 % ; le mot est dans le nom, pas seulement la couleur. */
export const Seuils: Story = {
  render: () => (
    <div className="flex gap-3 pt-16">
      {[50, 80, 95].map((v) => (
        <UsageRing key={v} value={v}>
          <UsageMeter label="Contexte" value={v} />
        </UsageRing>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const low = c.getByRole("button", { name: /^Contexte utilisé : 50\s%$/ });
    const high = c.getByRole("button", { name: /^Contexte utilisé : 80\s% \(Élevé\)$/ });
    const critical = c.getByRole("button", { name: /^Contexte utilisé : 95\s% \(Critique\)$/ });
    await expect(ringStroke(low)).toBe(tokenColor("--accent"));
    await expect(ringStroke(high)).toBe(tokenColor("--warning"));
    await expect(ringStroke(critical)).toBe(tokenColor("--danger"));
  },
};

/** Seuils réglables : `warnAt` et `dangerAt`. */
export const SeuilsReglables: Story = {
  args: { value: 60, warnAt: 50, dangerAt: 90, label: "Espace utilisé" },
  play: async ({ canvasElement }) => {
    const meter = within(canvasElement).getByRole("meter", { name: "Espace utilisé" });
    await expect(meter).toHaveAttribute("aria-valuetext", expect.stringMatching(/^60\s% \(Élevé\)$/));
    await expect(ringStroke(canvasElement)).toBe(tokenColor("--warning"));
  },
};

/** Sans contenu : une jauge seule (`role="meter"`), sans bouton. */
export const SansVolet: Story = {
  args: { value: 72 },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("button")).toBeNull();
    const meter = c.getByRole("meter", { name: "Contexte utilisé" });
    await expect(meter).toHaveAttribute("aria-valuenow", "72");
    await expect(meter).toHaveAttribute("aria-valuemin", "0");
    await expect(meter).toHaveAttribute("aria-valuemax", "100");
    await expect(meter).toHaveAttribute("aria-valuetext", expect.stringMatching(/^72\s%$/));
  },
};

/** Clavier : Entrée et Espace ouvrent ; Échap ferme et rend le focus à la jauge. */
export const Clavier: Story = {
  render: () => (
    <div className="pt-48">
      <UsageRing value={72} title="Limites d'usage">
        <Limits />
      </UsageRing>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button");
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(body().getByRole("dialog", { name: "Limites d'usage" })).toBeVisible());
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard(" ");
    await waitFor(() => expect(body().getByRole("dialog")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

const onSeeAll = fn();

/** Volet sans titre (nom « Limites d'usage » par défaut) ; lien d'en-tête par `onPress`. */
export const ActionSansTitre: Story = {
  render: () => (
    <div className="pt-48">
      <UsageRing value={40} action={{ label: "Détails", onPress: onSeeAll }}>
        <Limits />
      </UsageRing>
    </div>
  ),
  play: async ({ canvasElement }) => {
    onSeeAll.mockClear();
    await userEvent.click(within(canvasElement).getByRole("button"));
    const dialog = await waitFor(() => body().getByRole("dialog", { name: "Limites d'usage" }));
    await expect(within(dialog).queryByRole("heading")).toBeNull();
    await userEvent.click(within(dialog).getByRole("button", { name: "Détails" }));
    await expect(onSeeAll).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
  },
};

/** UsageMeter : barre de 4 px, `role="meter"`, mot « Élevé » ou « Critique » lu au-delà des seuils. */
export const Lignes: StoryObj<typeof UsageMeter> = {
  render: () => (
    <div className="flex w-[340px] flex-col gap-2.5">
      <UsageMeter label="Normale" value={42} resetsAt="mar. 00:10" />
      <UsageMeter label="Élevée" value={86} />
      <UsageMeter label="Critique" value={97} resetsAt={new Date(Date.now() + 2 * 86_400_000)} />
      <UsageMeter label="Hors bornes" value={140} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const rows = canvasElement.querySelectorAll("[data-usage-meter]");
    const normal = c.getByRole("meter", { name: "Normale" });
    await expect(normal).toHaveAttribute("aria-valuenow", "42");
    await expect(normal).toHaveAttribute("aria-valuetext", expect.stringMatching(/^42\s%$/));
    await expect(normal.getBoundingClientRect().height).toBe(4);
    await expect(getComputedStyle(normal).backgroundColor).toBe(tokenColor("--field"));
    await expect(fillColor(rows[0]!)).toBe(tokenColor("--accent"));
    await expect(c.getByText("Remise à zéro mar. 00:10")).toBeVisible();

    await expect(c.getByRole("meter", { name: "Élevée" })).toHaveAttribute("aria-valuetext", expect.stringMatching(/^86\s% \(Élevé\)$/));
    await expect(fillColor(rows[1]!)).toBe(tokenColor("--warning"));

    await expect(c.getByRole("meter", { name: "Critique" })).toHaveAttribute("aria-valuetext", expect.stringMatching(/^97\s% \(Critique\)$/));
    await expect(fillColor(rows[2]!)).toBe(tokenColor("--danger"));
    // Une date dans les 6 jours : jour court et heure.
    await expect(rows[2]!.textContent).toMatch(/Remise à zéro \S+ \d{2}:\d{2}/);

    const over = c.getByRole("meter", { name: "Hors bornes" });
    await expect(over).toHaveAttribute("aria-valuenow", "100");
    // Remplissage proportionnel.
    const fill = rows[0]!.querySelector("[data-usage-fill]")!.getBoundingClientRect().width;
    await expect(Math.round((fill / normal.getBoundingClientRect().width) * 100)).toBe(42);
  },
};
