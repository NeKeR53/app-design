import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { Skeleton, SkeletonGroup } from "./Skeleton";

const meta: Meta<typeof SkeletonGroup> = {
  title: "Composants/Skeleton",
  component: SkeletonGroup,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof SkeletonGroup>;

const Row = ({ i }: { i: number }) => (
  <div className="flex items-center gap-3 border-b border-line py-2">
    <Skeleton shape="circle" />
    <div className="flex flex-1 flex-col gap-2">
      <Skeleton width={`${45 + i * 6}%`} />
      <Skeleton width={`${25 + i * 3}%`} />
    </div>
  </div>
);

/** Groupe nommé « Chargement… », affiché après 200 ms (D-165). */
export const ParDefaut: Story = {
  render: () => (
    <div className="w-96">
      <SkeletonGroup>
        {[0, 1, 2].map((i) => (
          <Row key={i} i={i} />
        ))}
      </SkeletonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole("status", { name: "Chargement…" });
    await expect(group).toHaveAttribute("aria-busy", "true");
    await expect(group.childElementCount).toBe(0);
    await waitFor(() => expect(group.childElementCount).toBe(3), { timeout: 1000 });
  },
};

/** Formes : ligne, cercle, bloc ; immobiles, en `--field` (D-165). */
export const Formes: Story = {
  render: () => (
    <SkeletonGroup delay={0}>
      <div className="flex w-96 items-center gap-4">
        <Skeleton width={120} />
        <Skeleton shape="circle" width={40} />
        <Skeleton shape="rect" width={80} height={48} />
      </div>
    </SkeletonGroup>
  ),
  play: async ({ canvasElement }) => {
    const shapes = canvasElement.querySelectorAll("i");
    await expect(shapes).toHaveLength(3);
    for (const s of shapes) await expect(getComputedStyle(s).animationName).toBe("none");
    await expect(Math.round(shapes[0]!.getBoundingClientRect().height)).toBe(10);
    await expect(Math.round(shapes[1]!.getBoundingClientRect().height)).toBe(40);
  },
};
