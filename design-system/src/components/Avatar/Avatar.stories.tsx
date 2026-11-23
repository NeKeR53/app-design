import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { Avatar, initials } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Composants/Avatar",
  component: Avatar,
  parameters: { layout: "padded" },
  args: { name: "Camille Martin" },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

const PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#94a3b8"/><circle cx="16" cy="13" r="6" fill="#e2e8f0"/></svg>');

export const ParDefaut: Story = {
  play: async ({ canvasElement }) => {
    const av = within(canvasElement).getByRole("img", { name: "Camille Martin" });
    await expect(av).toHaveTextContent("CM");
  },
};

/** Trois tailles : 24, 32 et 40 px (D-163). */
export const Tailles: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Camille Martin" size="sm" />
      <Avatar name="Camille Martin" size="md" />
      <Avatar name="Camille Martin" size="lg" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const sizes = within(canvasElement)
      .getAllByRole("img")
      .map((e) => Math.round(e.getBoundingClientRect().width));
    await expect(sizes).toEqual([24, 32, 40]);
  },
};

/** Initiales : premier et dernier mot qui commencent par une lettre ; « ? » sinon (D-163). */
export const Initiales: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Jean-Baptiste de la Tour" />
      <Avatar name="Martin 5" />
      <Avatar name="2024" />
      <Avatar name="élodie" />
    </div>
  ),
  play: async () => {
    await expect(initials("Jean-Baptiste de la Tour")).toBe("JT");
    await expect(initials("Martin 5")).toBe("M");
    await expect(initials("2024")).toBe("?");
    await expect(initials("élodie")).toBe("É");
  },
};

/** Image fournie ; une image qui ne charge pas laisse la place aux initiales. */
export const Image: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Hugo Petit" src={PHOTO} />
      <Avatar name="Léa Garnier" src="data:image/png;base64,invalide" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("img", { name: "Hugo Petit" }).querySelector("img")).not.toBeNull();
    await waitFor(() => expect(c.getByRole("img", { name: "Léa Garnier" })).toHaveTextContent("LG"));
  },
};
