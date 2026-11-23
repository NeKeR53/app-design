import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Checkbox, CheckboxGroup } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Composants/Champs/Checkbox",
  component: Checkbox,
  parameters: { layout: "padded" },
  args: { children: "Recevoir une copie par e-mail" },
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const ParDefaut: Story = {
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("checkbox");
    await userEvent.click(within(canvasElement).getByText("Recevoir une copie par e-mail"));
    await expect(box).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(box).not.toBeChecked();
  },
};

/** Tous les états (D-135). */
export const Etats: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <Checkbox>Non cochée</Checkbox>
      <Checkbox defaultSelected>Cochée</Checkbox>
      <Checkbox isIndeterminate>Mixte</Checkbox>
      <Checkbox description="Une ligne d'explication sous le libellé.">Avec description</Checkbox>
      <Checkbox error="Cochez cette case pour continuer.">En erreur</Checkbox>
      <Checkbox isDisabled defaultSelected>Désactivée</Checkbox>
    </div>
  ),
};

const KIDS = ["exp", "liv", "ret"];
function Parent() {
  const [v, setV] = useState<string[]>(["exp"]);
  const all = v.length === KIDS.length;
  return (
    <div className="flex flex-col gap-1">
      <Checkbox isSelected={all} isIndeterminate={v.length > 0 && !all} onChange={(on) => setV(on ? KIDS : [])}>Tous les avis</Checkbox>
      <div className="pl-6">
        <CheckboxGroup label="Avis envoyés" hideLabel value={v} onChange={setV} description="Par e-mail.">
          <Checkbox value="exp">À l'expédition</Checkbox>
          <Checkbox value="liv">À la livraison</Checkbox>
          <Checkbox value="ret">En cas de retard</Checkbox>
        </CheckboxGroup>
      </div>
    </div>
  );
}

/** Case parente : l'app calcule l'état mixte ; un clic sur une case mixte coche tout. */
export const Mixte: Story = {
  render: () => <Parent />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const parent = c.getByRole("checkbox", { name: "Tous les avis" });
    await expect(parent).toBePartiallyChecked();
    await userEvent.click(parent);
    for (const n of ["À l'expédition", "À la livraison", "En cas de retard"]) await expect(c.getByRole("checkbox", { name: n })).toBeChecked();
  },
};

/** Groupe : valeur envoyée avec le formulaire ; obligatoire = au moins une case (D-132, D-137). */
export const Groupe: Story = {
  render: () => {
    const [sent, setSent] = useState("");
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(new FormData(e.currentTarget).getAll("jours").join(","));
        }}
        className="flex flex-col gap-3"
      >
        <CheckboxGroup label="Jours de livraison" name="jours" isRequired orientation="horizontal">
          <Checkbox value="lun">Lundi</Checkbox>
          <Checkbox value="mer">Mercredi</Checkbox>
          <Checkbox value="ven">Vendredi</Checkbox>
        </CheckboxGroup>
        <button type="submit" className="w-fit">Valider</button>
        <output data-testid="sent">{sent}</output>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("group", { name: "Jours de livraison" })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Valider" }));
    await waitFor(() => expect(c.getByText("Choisissez une valeur pour « Jours de livraison ».")).toBeVisible());
    await userEvent.click(c.getByText("Mercredi"));
    await userEvent.click(c.getByRole("button", { name: "Valider" }));
    await waitFor(() => expect(c.getByTestId("sent")).toHaveTextContent("mer"));
  },
};

/** Case seule obligatoire : erreur à l'envoi (D-132). */
export const Verification: Story = {
  render: () => (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
      <Checkbox isRequired>Le client a accepté les conditions de vente</Checkbox>
      <button type="submit" className="w-fit">Valider</button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Valider" }));
    await waitFor(() => expect(c.getByText("Cochez « Le client a accepté les conditions de vente ».")).toBeVisible());
    await expect(c.getByRole("checkbox")).toHaveFocus();
  },
};

/** Lecture seule (D-342) : case grise, coche en `--fg-2`, cadenas ; focusable, un clic ne change rien. */
export const LectureSeule: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox isReadOnly defaultSelected>Facturé</Checkbox>
      <CheckboxGroup label="Suivi" isReadOnly defaultValue={["mail"]}>
        <Checkbox value="mail">Par e-mail</Checkbox>
        <Checkbox value="sms">Par SMS</Checkbox>
      </CheckboxGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const billed = c.getByRole("checkbox", { name: "Facturé" });
    await expect(billed).toHaveAttribute("aria-readonly", "true");
    await userEvent.click(c.getByText("Facturé"));
    await expect(billed).toBeChecked();
    await userEvent.click(c.getByText("Par SMS"));
    await expect(c.getByRole("checkbox", { name: "Par SMS" })).not.toBeChecked();
    // Focusable au clavier ; Espace ne change rien.
    (document.activeElement as HTMLElement | null)?.blur();
    await userEvent.tab();
    await expect(billed).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(billed).toBeChecked();
    // Cadenas : après le libellé de la case seule, après le libellé du groupe (pas sur chaque case).
    await expect(canvasElement.querySelectorAll('[title="Lecture seule"]')).toHaveLength(2);
    const box = c.getByText("Facturé").closest("label")?.querySelector(".size-4");
    await expect(box).toHaveClass("bg-surface-side", "text-fg-2");
  },
};
