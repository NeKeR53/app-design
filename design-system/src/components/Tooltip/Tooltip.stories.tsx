import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "react-aria-components/Button";
import { Tooltip } from "./Tooltip";
import { cx, focusRing } from "../../lib/cx";

const meta: Meta<typeof Tooltip> = {
  title: "Composants/Tooltip",
  component: Tooltip,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

const Target = ({ label }: { label: string }) => (
  <Button className={cx("rounded-md border border-line px-3 py-1 text-md text-fg", focusRing)}>{label}</Button>
);
const body = () => within(document.body);

export const ParDefaut: Story = {
  render: () => (
    <Tooltip content="Rechercher" shortcut="Mod+K">
      <Target label="Survolez-moi" />
    </Tooltip>
  ),
};

/** Au survol, elle attend 500 ms (D-031). Placé en premier : une bulle restée ouverte
 * dans une story précédente garderait React Aria en mode « passage immédiat ». */
export const Delai: Story = {
  render: ParDefaut.render!,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button");
    // React Aria n'ouvre au survol qu'après une interaction à la souris : un clic hors du bouton.
    await userEvent.pointer({ keys: "[MouseLeft]", target: document.body, coords: { clientX: 2, clientY: 2 } });
    await new Promise((r) => setTimeout(r, 800));
    await expect(body().queryByRole("tooltip")).toBeNull();
    const start = performance.now();
    await userEvent.hover(button);
    await waitFor(() => expect(body().getByRole("tooltip")).toBeVisible(), { timeout: 1500 });
    await expect(performance.now() - start).toBeGreaterThanOrEqual(400);
  },
};

/** Au focus clavier, l'info-bulle s'affiche tout de suite (D-031). */
export const FocusClavier: Story = {
  render: ParDefaut.render!,
  play: async () => {
    await userEvent.tab();
    await waitFor(() => expect(body().getByRole("tooltip")).toBeVisible(), { timeout: 300 });
    await expect(body().getByRole("tooltip")).toHaveTextContent("Rechercher");
  },
};

export const Fermeture: Story = {
  render: ParDefaut.render!,
  play: async () => {
    await userEvent.tab();
    await waitFor(() => expect(body().getByRole("tooltip")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("tooltip")).toBeNull());
  },
};

/** Près d'un bord, la bulle change de côté et n'est jamais coupée (layout-rules). */
export const JamaisCoupee: Story = {
  render: () => (
    <div className="fixed right-1 bottom-1">
      <Tooltip content="Une info-bulle assez longue pour toucher le bord de la fenêtre">
        <Target label="Bord" />
      </Tooltip>
    </div>
  ),
  play: async () => {
    await userEvent.tab();
    const tip = await waitFor(() => body().getByRole("tooltip"));
    await waitFor(() => {
      const r = tip.getBoundingClientRect();
      expect(r.right).toBeLessThanOrEqual(window.innerWidth);
      expect(r.bottom).toBeLessThanOrEqual(window.innerHeight);
      expect(r.left).toBeGreaterThanOrEqual(0);
    });
  },
};
