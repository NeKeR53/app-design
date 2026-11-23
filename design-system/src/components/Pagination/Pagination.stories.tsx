import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Pagination, pageEntries } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Composants/Pagination",
  component: Pagination,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

function Pager({ start = 5, count = 13, onPageChange }: { start?: number; count?: number; onPageChange?: (p: number) => void }) {
  const [page, setPage] = useState(start);
  return (
    <Pagination
      page={page}
      pageCount={count}
      onPageChange={(p) => {
        setPage(p);
        onPageChange?.(p);
      }}
    />
  );
}

/** Le texte visible de la liste de numéros : « 1 … 4 5 6 … 13 ». */
const shown = (nav: HTMLElement) =>
  [...nav.querySelectorAll("li")].map((li) => li.textContent?.trim()).join(" ");

/** Repère `nav` « Pagination » ; « ‹ 1 … 4 5 6 … 13 › » ; page courante `aria-current="page"`. */
export const ParDefaut: Story = {
  render: () => <Pager />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const nav = c.getByRole("navigation", { name: "Pagination" });
    await expect(shown(nav)).toBe("1 … 4 5 6 … 13");
    await expect(c.getByRole("button", { name: "Page 5" })).toHaveAttribute("aria-current", "page");
    await expect(c.getByRole("button", { name: "Page 4" })).not.toHaveAttribute("aria-current");
    await expect(c.getByRole("button", { name: "Page précédente" })).toBeEnabled();
    await expect(c.getByRole("button", { name: "Page suivante" })).toBeEnabled();
  },
};

/** Suite des numéros : sept entrées au plus, largeur stable. */
export const Suite: Story = {
  render: () => <Pager />,
  play: async () => {
    await expect(pageEntries(1, 13)).toEqual([1, 2, 3, 4, 5, "gap", 13]);
    await expect(pageEntries(4, 13)).toEqual([1, 2, 3, 4, 5, "gap", 13]);
    await expect(pageEntries(5, 13)).toEqual([1, "gap", 4, 5, 6, "gap", 13]);
    await expect(pageEntries(10, 13)).toEqual([1, "gap", 9, 10, 11, 12, 13]);
    await expect(pageEntries(13, 13)).toEqual([1, "gap", 9, 10, 11, 12, 13]);
    await expect(pageEntries(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    await expect(pageEntries(1, 1)).toEqual([1]);
    // Hors bornes : ramenée entre 1 et le nombre de pages.
    await expect(pageEntries(40, 13)).toEqual([1, "gap", 9, 10, 11, 12, 13]);
  },
};

/** Clic sur un numéro, sur précédent ou suivant : `onPageChange` avec la page demandée. La page courante ne rappelle rien. */
export const Navigation: Story = {
  args: { onPageChange: fn() },
  render: (args) => <Pager onPageChange={args.onPageChange} />,
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Page 6" }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(6);
    await expect(c.getByRole("button", { name: "Page 6" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(c.getByRole("button", { name: "Page précédente" }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(5);
    await userEvent.click(c.getByRole("button", { name: "Page suivante" }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(6);
    await userEvent.click(c.getByRole("button", { name: "Page 13" }));
    await expect(shown(c.getByRole("navigation"))).toBe("1 … 9 10 11 12 13");
    const calls = (args.onPageChange as ReturnType<typeof fn>).mock.calls.length;
    await userEvent.click(c.getByRole("button", { name: "Page 13" }));
    await expect(args.onPageChange).toHaveBeenCalledTimes(calls);
  },
};

/** Bornes : précédent désactivé en page 1, suivant en dernière page. Le focus reste dans la pagination. */
export const Bornes: Story = {
  render: () => <Pager start={2} count={3} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const prev = c.getByRole("button", { name: "Page précédente" });
    prev.focus();
    await userEvent.keyboard("{Enter}");
    await expect(prev).toBeDisabled();
    await expect(c.getByRole("button", { name: "Page 1" })).toHaveFocus();
    const next = c.getByRole("button", { name: "Page suivante" });
    next.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{Enter}");
    await expect(next).toBeDisabled();
    await expect(c.getByRole("button", { name: "Page 3" })).toHaveFocus();
  },
};

/** Peu de pages : tous les numéros, sans « … ». */
export const PeuDePages: Story = {
  render: () => <Pager start={1} count={4} />,
  play: async ({ canvasElement }) => {
    await expect(shown(within(canvasElement).getByRole("navigation"))).toBe("1 2 3 4");
  },
};

/** Sous 641 px : « Page 5 sur 13 » et les flèches ; les numéros sont cachés. Au-delà : l'inverse. */
export const PetitEcran: Story = {
  render: () => <Pager />,
  globals: { viewport: { value: "mobile1" } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const compact = canvasElement.querySelector<HTMLElement>("[data-compact]")!;
    await expect(compact).toHaveTextContent("Page 5 sur 13");
    if (window.matchMedia("(max-width: 640px)").matches) {
      await expect(compact).toBeVisible();
      await expect(c.queryByRole("button", { name: "Page 4" })).toBeNull();
    } else {
      await expect(compact).not.toBeVisible();
      await expect(c.getByRole("button", { name: "Page 4" })).toBeVisible();
    }
    await expect(c.getByRole("button", { name: "Page suivante" })).toBeVisible();
  },
};
