import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Code } from "./Code";

const meta: Meta<typeof Code> = {
  title: "Composants/Code",
  component: Code,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Code>;

/** En ligne : chasse fixe, fond `--field`, rayon 4 px (D-168). */
export const EnLigne: Story = {
  render: () => (
    <p className="text-md text-fg">
      Identifiant du projet : <Code>prj_4821</Code>.
    </p>
  ),
  play: async ({ canvasElement }) => {
    const code = canvasElement.querySelector("code")!;
    await expect(getComputedStyle(code).borderRadius).toBe("4px");
    await expect(getComputedStyle(code).fontFamily).toMatch(/mono|Menlo|Consolas|SF Mono/i);
  },
};

/** Bloc : défile à l'horizontale, joignable au clavier, nommé. */
export const Bloc: Story = {
  render: () => (
    <div className="w-72">
      <Code block>{"npm run build -- --mode production --out-dir dist/production\ngit push origin main"}</Code>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole("region", { name: "Extrait de code" });
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    await userEvent.tab();
    await expect(region).toHaveFocus();
  },
};
