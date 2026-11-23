import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { WorkSummary } from "./WorkSummary";
import { ActivityGroup } from "./AgentActivity";

const meta: Meta<typeof WorkSummary> = {
  title: "Composants/AgentActivity/WorkSummary",
  component: WorkSummary,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-[760px] bg-surface p-4">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof WorkSummary>;

/** Après le tour : replié derrière « A travaillé pendant 42 s · 4 outils appelés » ; il s'ouvre sur les outils. */
export const Replie: Story = {
  render: () => (
    <WorkSummary durationMs={42000} toolCount={4}>
      <ActivityGroup
        items={[
          { id: "1", kind: "read", verb: "Lu", object: "src/dates.ts" },
          { id: "2", kind: "edit", verb: "Modifié", object: "src/dates.ts" },
          { id: "3", kind: "command", verb: "Exécuté", object: "npm test" },
        ]}
      />
    </WorkSummary>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const head = c.getByRole("button", { name: "A travaillé pendant 42 s · 4 outils appelés" });
    await expect(head).toHaveAttribute("aria-expanded", "false");
    await expect(c.queryByText("npm test")).toBeNull();
    await userEvent.click(head);
    await expect(c.getByText("npm test")).toBeVisible();
  },
};

/** Sans outil : un simple texte, pas de bouton. */
export const SansOutil: Story = {
  args: { durationMs: 3200, toolCount: 0 },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("A travaillé pendant 3 s · 0 outils appelés")).toBeInTheDocument();
    await expect(c.queryByRole("button")).toBeNull();
  },
};
