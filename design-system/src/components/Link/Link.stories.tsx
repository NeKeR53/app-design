import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Link } from "./Link";

const meta: Meta<typeof Link> = {
  title: "Composants/Link",
  component: Link,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Link>;

/** Toujours souligné, en `--accent-text` (D-167). */
export const ParDefaut: Story = {
  render: () => (
    <p className="text-md text-fg">
      Voir la <Link href="#procedure">procédure de mise en ligne</Link> avant de publier.
    </p>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "procédure de mise en ligne" });
    await expect(getComputedStyle(link).textDecorationLine).toContain("underline");
    await expect(link).toHaveAttribute("href", "#procedure");
    await expect(link).not.toHaveAttribute("target");
  },
};

/** Adresse externe : nouvel onglet, flèche, et texte caché « S'ouvre dans le navigateur ». */
export const Externe: Story = {
  render: () => <Link href="https://example.com/doc">Cahier des charges</Link>,
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: /Cahier des charges.*S'ouvre dans le navigateur/ });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link.querySelector("svg")).not.toBeNull();
  },
};

/** `mailto:` et `tel:` : pas de nouvel onglet, pas de flèche, pas de « S'ouvre dans le navigateur ». */
export const Messagerie: Story = {
  render: () => (
    <p className="text-md text-fg">
      Écrire au <Link href="mailto:support@example.com">support</Link> ou appeler le <Link href="tel:+33100000000">01 00 00 00 00</Link>.
    </p>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    for (const name of ["support", "01 00 00 00 00"]) {
      const link = c.getByRole("link", { name });
      await expect(link).not.toHaveAttribute("target");
      await expect(link.querySelector("svg")).toBeNull();
      await expect(link.textContent).not.toMatch(/navigateur/);
    }
  },
};

/** Sans `href` : bouton à l'apparence de lien ; Entrée déclenche l'action. */
export const Action: Story = {
  args: { onPress: fn() },
  render: (args) => (
    <p className="text-md text-fg">
      Identifiant gardé. <Link {...args}>Copier l'identifiant</Link>
    </p>
  ),
  play: async ({ canvasElement, args }) => {
    const btn = within(canvasElement).getByRole("button", { name: "Copier l'identifiant" });
    await expect(getComputedStyle(btn).textDecorationLine).toContain("underline");
    await userEvent.tab();
    await expect(btn).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};
