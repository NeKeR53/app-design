import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { type BackgroundTask, BackgroundTasks } from "./BackgroundTasks";

const meta: Meta<typeof BackgroundTasks> = {
  title: "Composants/BackgroundTasks",
  component: BackgroundTasks,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="w-[320px] bg-surface p-4">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof BackgroundTasks>;

const ago = (seconds: number) => Date.now() - seconds * 1000;

/** Trois tâches en cours : la durée avance chaque seconde. */
export const EnCours: Story = {
  args: {
    tasks: [
      { id: "1", kind: "command", title: "npm run dev -- --port 5173 --host 127.0.0.1", startedAt: ago(60), onStop: () => undefined },
      { id: "2", kind: "agent", title: "Relire le module de facturation", startedAt: ago(12), onStop: () => undefined },
      { id: "3", kind: "command", title: "cargo build --release", startedAt: ago(3725) },
    ],
    finished: 82,
    failed: 3,
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const [one, two, three] = c.getAllByRole("timer") as [HTMLElement, HTMLElement, HTMLElement];
    await expect(one).toHaveTextContent(/^1 min [01] s$/);
    await expect(three).toHaveTextContent(/^1 h 2 min [56] s$/);
    const first = two.textContent;
    await waitFor(() => expect(two.textContent).not.toBe(first), { timeout: 2500 });
    // Sans onStop, pas de bouton.
    await expect(c.getAllByRole("button")).toHaveLength(2);
  },
};

/** Le bouton d'arrêt est visible sans survol ; il attend la promesse de l'app. */
export const Arret: Story = {
  render: () => {
    const [tasks, setTasks] = useState<BackgroundTask[]>([
      {
        id: "1",
        kind: "command",
        title: "python serveur.py",
        startedAt: ago(30),
        onStop: () => new Promise<void>((resolve) => setTimeout(() => {
          setTasks([]);
          resolve();
        }, 300)),
      },
    ]);
    return <BackgroundTasks tasks={tasks} finished={tasks.length ? 0 : 1} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const stop = c.getByRole("button", { name: "Arrêter python serveur.py" });
    await expect(stop).toBeVisible();
    await userEvent.click(stop);
    await waitFor(() => expect(c.queryByRole("button")).not.toBeInTheDocument());
    await expect(c.getByText("1 terminée")).toBeInTheDocument();
  },
};

/** Résumé : terminées à gauche, échecs en rouge à droite. */
export const Resume: Story = {
  args: { tasks: [], finished: 82, failed: 3 },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("82 terminées")).toBeInTheDocument();
    const failed = c.getByText("3 en échec");
    await expect(failed.className).toContain("text-danger");
    await expect(c.queryByRole("list")).not.toBeInTheDocument();
  },
};

/** Rien en cours ni fini. */
export const Vide: Story = {
  args: { tasks: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Aucune tâche en cours")).toBeInTheDocument();
  },
};

/** L'appel à onStop. */
export const AppelArret: Story = {
  args: { tasks: [{ id: "1", kind: "agent", title: "Sous-agent", startedAt: ago(5), onStop: fn() }] },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Arrêter Sous-agent" }));
    await expect(args.tasks[0]?.onStop).toHaveBeenCalledOnce();
  },
};
