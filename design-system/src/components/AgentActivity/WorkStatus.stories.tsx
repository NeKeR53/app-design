import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { WorkStatus, type WorkPhase } from "./WorkStatus";

const meta: Meta<typeof WorkStatus> = {
  title: "Composants/AgentActivity/WorkStatus",
  component: WorkStatus,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-[760px] bg-surface p-4">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof WorkStatus>;

/** Les cinq étapes. */
export const Etapes: Story = {
  render: () => {
    const start = Date.now() - 12000;
    return (
      <>
        <WorkStatus phase="thinking" startedAt={start} />
        <WorkStatus phase="tool" toolName="npm test" startedAt={start} />
        <WorkStatus phase="writing" startedAt={start} />
        <WorkStatus phase="approval" startedAt={start} />
        <WorkStatus startedAt={Date.now() - 125000} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Outil en cours : npm test")).toBeInTheDocument();
    await expect(c.getAllByRole("timer")[0]).toHaveTextContent(/^depuis 1[23] s$/);
    await expect(c.getAllByRole("timer")[4]).toHaveTextContent(/^depuis 2 min [56] s$/);
  },
};

/** Seul le libellé est dans la région polie : il est lu quand il change, pas à chaque seconde. */
export const Annonce: Story = {
  render: () => {
    const [phase, setPhase] = useState<WorkPhase>("thinking");
    return (
      <>
        <button type="button" onClick={() => setPhase("writing")}>
          Rédiger
        </button>
        <WorkStatus phase={phase} startedAt={Date.now()} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const status = c.getByRole("status");
    await expect(status).toHaveTextContent(/^Réflexion en cours$/);
    const timer = c.getByRole("timer");
    const first = timer.textContent;
    await waitFor(() => expect(timer.textContent).not.toBe(first), { timeout: 2500 });
    await expect(status).toHaveTextContent(/^Réflexion en cours$/);
    await userEvent.click(c.getByRole("button", { name: "Rédiger" }));
    await expect(status).toHaveTextContent(/^Rédaction en cours$/);
  },
};
