import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { ActivityGroup, AgentActivity, type ActivityItem } from "./AgentActivity";

const meta: Meta<typeof AgentActivity> = {
  title: "Composants/AgentActivity",
  component: AgentActivity,
  subcomponents: { ActivityGroup },
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-[760px] bg-surface p-4">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof AgentActivity>;

const DONE: ActivityItem[] = [
  { id: "1", kind: "read", verb: "Lu", object: "src/dates.ts" },
  { id: "2", kind: "search", verb: "Recherché", object: "formatDate" },
  { id: "3", kind: "edit", verb: "Modifié", object: "src/dates.ts" },
  { id: "4", kind: "think", verb: "Réflexion" },
  { id: "5", kind: "command", verb: "Exécuté", object: "npm test", detail: "PASS src/dates.test.ts\nTests: 12 passed" },
];

/** Une ligne par outil : icône du type, verbe, objet en police à chasse fixe ; roue pendant l'exécution ; « Échec » en rouge. */
export const Lignes: Story = {
  render: () => (
    <>
      <AgentActivity kind="command" verb="Exécuté" object="npm run build" />
      <AgentActivity kind="edit" verb="Modifié" object="src/app.tsx" />
      <AgentActivity kind="search" verb="Recherché" object="useMessages" />
      <AgentActivity kind="read" verb="Lu" object="README.md" />
      <AgentActivity kind="think" verb="Réflexion" />
      <AgentActivity kind="other" verb="Appelé" object="fetch_page" />
      <AgentActivity kind="command" verb="Exécuté" object="npm test" status="running" />
      <AgentActivity kind="command" verb="Exécuté" object="npm run lint" status="error" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(getComputedStyle(c.getByText("npm run build")).fontFamily).toBe(getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim());
    const failed = c.getByText("Échec");
    const probe = document.createElement("span");
    probe.style.color = "var(--danger)";
    document.body.append(probe);
    await expect(getComputedStyle(failed).color).toBe(getComputedStyle(probe).color);
    probe.remove();
    const running = canvasElement.querySelector('[data-activity="running"]') as HTMLElement;
    await expect(running.querySelector("[data-spinner]")).not.toBeNull();
    await expect(within(running).getByText("En cours")).toHaveClass("sr-only");
  },
};

/** Avec une sortie, la ligne s'ouvre : texte en lecture seule, de 2 à 12 lignes. */
export const Detail: Story = {
  render: () => (
    <>
      <AgentActivity kind="command" verb="Exécuté" object="npm test" detail="PASS src/dates.test.ts" />
      <AgentActivity kind="command" verb="Exécuté" object="npm run build" detail={Array.from({ length: 30 }, (_, i) => `ligne ${i + 1}`).join("\n")} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const [short, long] = c.getAllByRole("button") as [HTMLElement, HTMLElement];
    await expect(short).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(short);
    await expect(short).toHaveAttribute("aria-expanded", "true");
    const out = c.getByRole("textbox", { name: "Détail de Exécuté npm test" });
    await expect(out).toHaveAttribute("readonly");
    await expect(out).toHaveAttribute("rows", "2");
    long.focus();
    await userEvent.keyboard("{Enter}");
    await expect(c.getByRole("textbox", { name: "Détail de Exécuté npm run build" })).toHaveAttribute("rows", "12");
  },
};

/** Jusqu'à 3 outils : une ligne chacun, sans résumé. */
export const PeuDOutils: Story = {
  render: () => <ActivityGroup items={DONE.slice(0, 3)} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByText("src/dates.ts")).toHaveLength(2);
    await expect(c.queryByText(/outils exécutés/)).toBeNull();
  },
};

/** Au-delà de 3 : résumé « 5 outils exécutés », replié une fois terminé ; clic, Entrée ou Espace l'ouvrent. */
export const Groupe: Story = {
  render: () => <ActivityGroup items={DONE} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const head = c.getByRole("button", { name: "5 outils exécutés" });
    await expect(head).toHaveAttribute("aria-expanded", "false");
    await expect(c.queryByText("formatDate")).toBeNull();
    await userEvent.click(head);
    await expect(head).toHaveAttribute("aria-expanded", "true");
    await expect(c.getByRole("list", { name: "5 outils exécutés" })).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect(head).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard(" ");
    await expect(head).toHaveAttribute("aria-expanded", "true");
  },
};

/** Déplié tant qu'un outil tourne, replié à la fin ; « x en cours ». */
export const GroupeEnCours: Story = {
  render: () => {
    const [running, setRunning] = useState(true);
    const items = DONE.map((i, n) => (n === 4 ? { ...i, status: running ? ("running" as const) : ("done" as const) } : i));
    return (
      <>
        <button type="button" onClick={() => setRunning(false)}>
          Terminer
        </button>
        <ActivityGroup items={items} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const head = c.getByRole("button", { name: "5 outils exécutés · 1 en cours" });
    await expect(head).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(c.getByRole("button", { name: "Terminer" }));
    await expect(c.getByRole("button", { name: "5 outils exécutés" })).toHaveAttribute("aria-expanded", "false");
  },
};

/** Une erreur reste visible, en rouge, même groupe replié. */
export const ErreurVisible: Story = {
  render: () => <ActivityGroup items={[...DONE.slice(0, 4), { id: "5", kind: "command", verb: "Exécuté", object: "npm test", status: "error", detail: "FAIL src/dates.test.ts" }]} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const head = c.getByRole("button", { name: "5 outils exécutés · 1 en échec" });
    await expect(head).toHaveAttribute("aria-expanded", "false");
    await expect(c.getByText("Échec")).toBeVisible();
    await expect(c.getByText("npm test")).toBeVisible();
    await expect(c.queryByText("formatDate")).toBeNull();
  },
};
