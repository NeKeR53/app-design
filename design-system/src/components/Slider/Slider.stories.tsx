import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { Slider } from "./Slider";

const meta: Meta<typeof Slider> = {
  title: "Composants/Champs/Slider",
  component: Slider,
  parameters: { layout: "padded" },
  args: { label: "Seuil d'alerte", defaultValue: 0.6, minValue: 0, maxValue: 1, step: 0.01, formatOptions: { style: "percent" } },
};
export default meta;
type Story = StoryObj<typeof Slider>;

/** Espaces de groupe du français (espace fine insécable) ramenées à une espace simple, pour comparer. */
const plain = (s: string | null | undefined) => (s ?? "").replace(/[\u00a0\u202f]/g, " ");

/** Couleur calculée d'un token, pour comparer. */
function token(name: string) {
  const probe = document.createElement("div");
  probe.style.backgroundColor = `var(${name})`;
  document.body.append(probe);
  const c = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return c;
}

export const ParDefaut: Story = {};

/** Libellé au-dessus, valeur formatée à droite ; piste de 4 px en --field ; partie remplie en --primary ; poignée de 16 px (D-366). */
export const Anatomie: Story = {
  args: { description: "Une alerte part quand le stock passe sous ce seuil." },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const slider = c.getByRole("slider", { name: "Seuil d'alerte" });
    await expect(slider).toHaveAttribute("aria-valuetext", expect.stringMatching(/60/));
    await expect(slider).toHaveAccessibleDescription("Une alerte part quand le stock passe sous ce seuil.");
    const output = canvasElement.querySelector("output");
    await expect(plain(output?.textContent)).toBe("60 %");
    // Valeur à droite du libellé, sur la même ligne.
    const labelBox = c.getByText("Seuil d'alerte").getBoundingClientRect();
    const outBox = output!.getBoundingClientRect();
    await expect(outBox.left).toBeGreaterThan(labelBox.right);
    await expect(Math.abs(outBox.top - labelBox.top)).toBeLessThan(4);
    const fill = canvasElement.querySelector("[data-part=fill]") as HTMLElement;
    const line = fill.parentElement!;
    await expect(line.offsetHeight).toBe(4);
    await expect(getComputedStyle(line).backgroundColor).toBe(token("--field"));
    await expect(getComputedStyle(fill).backgroundColor).toBe(token("--primary"));
    // Remplie jusqu'à la poignée : 60 % de la piste.
    await expect(Math.round((fill.offsetWidth / line.offsetWidth) * 100)).toBe(60);
    const thumb = slider.closest("[data-part=thumb]") as HTMLElement;
    await expect(thumb.offsetWidth).toBe(16);
    await expect(thumb.offsetHeight).toBe(16);
  },
};

function Controlled({ onEnd }: { onEnd?: (v: number) => void }) {
  const [v, setV] = useState(50);
  return (
    <div className="flex flex-col gap-2">
      <Slider label="Volume" value={v} onChange={setV} {...(onEnd ? { onChangeEnd: onEnd } : {})} />
      <output data-testid="v">{v}</output>
    </div>
  );
}

/** Clavier : flèches un pas, Page haut / bas dix pas, Origine / Fin minimum / maximum ; anneau de focus. */
export const Clavier: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const slider = c.getByRole("slider", { name: "Volume" });
    const v = c.getByTestId("v");
    await userEvent.tab();
    await expect(document.activeElement).toBe(slider);
    const thumb = slider.closest("[data-part=thumb]") as HTMLElement;
    await expect(thumb).toHaveAttribute("data-focus-visible");
    await expect(getComputedStyle(thumb).outlineStyle).toBe("solid");
    await userEvent.keyboard("{ArrowRight}");
    await expect(v).toHaveTextContent("51");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(v).toHaveTextContent("49");
    await userEvent.keyboard("{ArrowUp}");
    await expect(v).toHaveTextContent("50");
    await userEvent.keyboard("{PageUp}");
    await expect(v).toHaveTextContent("60");
    await userEvent.keyboard("{PageDown}{PageDown}");
    await expect(v).toHaveTextContent("40");
    await userEvent.keyboard("{End}");
    await expect(v).toHaveTextContent("100");
    await userEvent.keyboard("{PageUp}");
    await expect(v).toHaveTextContent("100");
    await userEvent.keyboard("{Home}");
    await expect(v).toHaveTextContent("0");
  },
};

const onEnd = fn();

/** `onChange` suit le geste ; `onChangeEnd` arrive une fois, au relâché : c'est là qu'on enregistre. */
export const EnregistrementAuRelache: Story = {
  render: () => <Controlled onEnd={onEnd} />,
  play: async ({ canvasElement }) => {
    onEnd.mockClear();
    const c = within(canvasElement);
    const v = c.getByTestId("v");
    const track = canvasElement.querySelector("[data-part=track]") as HTMLElement;
    const thumb = canvasElement.querySelector("[data-part=thumb]") as HTMLElement;
    const box = track.getBoundingClientRect();
    const y = box.top + box.height / 2;
    const at = (p: number) => box.left + box.width * p;
    const opts = { pointerId: 1, pointerType: "mouse", button: 0, isPrimary: true };
    fireEvent.pointerDown(thumb, { ...opts, clientX: at(0.5), clientY: y });
    fireEvent.pointerMove(thumb, { ...opts, clientX: at(0.6), clientY: y });
    fireEvent.pointerMove(thumb, { ...opts, clientX: at(0.7), clientY: y });
    await waitFor(() => expect(Number(v.textContent)).toBeGreaterThan(60));
    await expect(onEnd).not.toHaveBeenCalled();
    fireEvent.pointerUp(thumb, { ...opts, clientX: at(0.7), clientY: y });
    await waitFor(() => expect(onEnd).toHaveBeenCalledTimes(1));
    await expect(onEnd.mock.calls[0]?.[0]).toBe(Number(v.textContent));
    // Au clavier, chaque touche est un relâché.
    c.getByRole("slider").focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(onEnd).toHaveBeenCalledTimes(2);
  },
};

/** Plage : deux poignées nommées, valeurs « début – fin », les poignées ne se croisent pas. */
export const Plage: Story = {
  render: () => {
    const Range = () => {
      const [v, setV] = useState<[number, number]>([20, 80]);
      return (
        <div className="flex flex-col gap-2">
          <Slider label="Prix" value={v} onChange={setV} formatOptions={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }} />
          <output data-testid="v">{v.join("-")}</output>
        </div>
      );
    };
    return <Range />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const [lo, hi] = c.getAllByRole("slider");
    await expect(lo).toHaveAccessibleName(/Minimum/);
    await expect(lo).toHaveAccessibleName(/Prix/);
    await expect(hi).toHaveAccessibleName(/Maximum/);
    await expect(plain(canvasElement.querySelector("output")?.textContent)).toMatch(/^20\s*–\s*80 €$/);
    lo!.focus();
    await userEvent.keyboard("{End}");
    await expect(c.getByTestId("v")).toHaveTextContent("80-80");
    hi!.focus();
    await userEvent.keyboard("{Home}");
    await expect(c.getByTestId("v")).toHaveTextContent("80-80");
    await userEvent.keyboard("{End}");
    await expect(c.getByTestId("v")).toHaveTextContent("80-100");
  },
};

/** Désactivé : 40 %, la poignée ne bouge pas. */
export const Desactive: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole("slider");
    await expect(slider).toBeDisabled();
    await expect(getComputedStyle(canvasElement.querySelector(".socle-box")!).opacity).toBe("0.4");
  },
};
