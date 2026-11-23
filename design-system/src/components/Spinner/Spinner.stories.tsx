import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Spinner } from "./Spinner";

const meta: Meta<typeof Spinner> = {
  title: "Composants/Spinner",
  component: Spinner,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Spinner>;

const ring = (root: HTMLElement) => root.querySelector<HTMLElement>("[data-spinner]")!;

/** Nommée par défaut : `role="status"`, texte caché « Chargement… » (i18n). */
export const ParDefaut: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const status = c.getByRole("status");
    await expect(status).toHaveTextContent("Chargement…");
    await expect(ring(canvasElement)).toHaveAttribute("aria-hidden", "true");
    await expect((ring(canvasElement) as HTMLElement).offsetWidth).toBe(14);
  },
};

/** `label` : dit ce qui charge. */
export const Nommee: Story = {
  args: { label: "Chargement des commandes" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent("Chargement des commandes");
  },
};

/** Deux tailles : 14 px (`sm`) et 20 px (`md`). */
export const Tailles: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner label="Petite" />
      <Spinner size="md" label="Moyenne" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rings = canvasElement.querySelectorAll<HTMLElement>("[data-spinner]");
    await expect((rings[0] as HTMLElement).offsetWidth).toBe(14);
    await expect((rings[1] as HTMLElement).offsetWidth).toBe(20);
  },
};

/** Décorative, à côté d'un texte qui dit l'attente : cachée aux lecteurs d'écran, pas de `status`. */
export const Decorative: Story = {
  render: () => (
    <span className="inline-flex items-center gap-2 font-sans text-sm text-fg-2">
      <Spinner decorative />
      Synchronisation…
    </span>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("status")).toBeNull();
    await expect(ring(canvasElement)).toHaveAttribute("aria-hidden", "true");
  },
};

/** Animation `socle-spin` : 0,8 s par tour ; 2,4 s (trois fois plus lent) si le mouvement est réduit (D-014). */
export const Mouvement: Story = {
  play: async ({ canvasElement }) => {
    const style = getComputedStyle(ring(canvasElement));
    await expect(style.animationName).toBe("socle-spin");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    await expect(style.animationDuration).toBe(reduced ? "2.4s" : "0.8s");
  },
};
