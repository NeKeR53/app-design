import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "./Button";
import { ChevronLeft, Plus } from "../../icons";

const meta: Meta<typeof Button> = {
  title: "Composants/Button",
  component: Button,
  parameters: { layout: "padded" },
  args: { children: "Enregistrer", onPress: fn() },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const ParDefaut: Story = {};

const VARIANTS = [
  ["primary", "Enregistrer"],
  ["secondary", "Annuler"],
  ["subtle", "Tous les projets"],
  ["danger", "Supprimer"],
] as const;

/** Les quatre variantes (D-100 à D-104), dans chaque état et dans les deux tailles. */
export const Etats: Story = {
  render: () => (
    <div className="grid grid-cols-[repeat(5,max-content)] items-center gap-x-6 gap-y-3 font-sans text-sm text-fg-2">
      <span />
      <span>Par défaut</span>
      <span>Avec icône</span>
      <span>Désactivé</span>
      <span>Petite (sm)</span>
      {VARIANTS.map(([variant, label]) => (
        <div key={variant} className="contents">
          <span>{variant}</span>
          <Button variant={variant}>{label}</Button>
          <Button variant={variant} icon={<Plus />}>Ajouter</Button>
          <Button variant={variant} isDisabled>{label}</Button>
          <Button variant={variant} size="sm">{label}</Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getAllByRole("button", { name: "Annuler" })[0]!;
    // Transition de couleur ≤ 120 ms (D-014).
    const ms = parseFloat(getComputedStyle(button).transitionDuration) * 1000;
    await expect(ms).toBeLessThanOrEqual(120);
  },
};

/** Un clic, Entrée ou Espace appelle onPress. */
export const Clavier: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Enregistrer" });
    await userEvent.click(button);
    await userEvent.tab();
    await userEvent.tab({ shift: true });
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(args.onPress).toHaveBeenCalledTimes(3);
  },
};

/** Chargement (D-105) : la roue prend la place de l'icône, le libellé reste, les clics sont ignorés, le focus reste. */
export const Chargement: Story = {
  render: (args) => {
    const [pending, setPending] = useState(false);
    return (
      <div className="flex gap-2">
        <Button {...args} variant="primary" icon={<Plus />} isPending={pending} onPress={() => { args.onPress?.(); setPending(true); }}>
          Ajouter
        </Button>
        <Button variant="secondary" isPending>Envoyer</Button>
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /Ajouter/ });
    const width = button.getBoundingClientRect().width;
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute("data-pending", "true"));
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await expect(button).toHaveTextContent("Ajouter");
    const bar = within(button).getByRole("progressbar", { name: "Chargement…" });
    // Case de 16 px, cercle `Spinner` de 14 px dans la couleur du bouton (D-105, D-360).
    await expect(bar.getBoundingClientRect().width).toBe(16);
    const ring = bar.querySelector<HTMLElement>("[data-spinner]")!;
    await expect((ring as HTMLElement).offsetWidth).toBe(14); // taille avant rotation
    await expect(getComputedStyle(ring).color).toBe(getComputedStyle(button).color);
    // Avec une icône, la largeur ne change pas.
    await expect(button.getBoundingClientRect().width).toBe(width);
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};

/** Désactivé : aucune action. */
export const Desactive: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button");
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/** type="submit" envoie le formulaire, même hors du <form> avec `form` (pied de modale, de FormPage). */
export const Formulaire: Story = {
  render: () => {
    const [sent, setSent] = useState(0);
    return (
      <div className="flex flex-col items-start gap-3 font-sans text-md text-fg">
        <form id="demo-form" onSubmit={(e) => { e.preventDefault(); setSent((n) => n + 1); }}>
          <label className="flex flex-col gap-1 text-sm text-fg-2">
            Nom
            <input name="nom" defaultValue="Projet Atlas" className="h-(--row-h) rounded-md border border-line-strong bg-surface px-2 text-md text-fg" />
          </label>
        </form>
        <div className="flex gap-2">
          <Button>Annuler</Button>
          <Button variant="primary" type="submit" form="demo-form">Enregistrer</Button>
        </div>
        <output>Envois : {sent}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Enregistrer" }));
    await expect(canvas.getByText("Envois : 1")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Annuler" }));
    await expect(canvas.getByText("Envois : 1")).toBeInTheDocument();
  },
};

/** Nom accessible plus précis : il commence par le libellé visible (WCAG 2.5.3). */
export const NomAccessible: Story = {
  args: { children: "Approuver", "aria-label": "Approuver Projet Atlas", variant: "primary" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Approuver Projet Atlas" })).toBeInTheDocument();
  },
};

/** Exemples de placement : pied de formulaire, retour discret, confirmation. */
export const EnSituation: Story = {
  render: () => (
    <div className="flex w-[520px] flex-col gap-6 font-sans text-md text-fg">
      <div className="flex items-center gap-2 border-t border-line pt-3">
        <span className="flex-1 text-sm text-fg-3">Modifications non enregistrées</span>
        <Button>Annuler</Button>
        <Button variant="primary">Enregistrer</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="subtle" icon={<ChevronLeft />}>Tous les projets</Button>
      </div>
      <div className="rounded-lg bg-surface-raised p-4 shadow-lg">
        <p className="m-0 mb-1 font-semibold">Supprimer « Projet Atlas » ?</p>
        <p className="m-0 mb-4 text-sm text-fg-2">Cette action est définitive.</p>
        <div className="flex justify-end gap-2">
          <Button autoFocus>Annuler</Button>
          <Button variant="danger">Supprimer</Button>
        </div>
      </div>
    </div>
  ),
};

/** Inactif avec une raison : focusable, un clic ne fait rien, la raison est la description et s'affiche au focus. */
export const InactifAvecRaison: Story = {
  args: { children: "Publier", variant: "primary", disabledReason: "Complétez le titre pour publier.", type: "submit" },
  render: (args) => (
    <form onSubmit={(e) => { e.preventDefault(); args.onPress?.(); }} className="flex items-center gap-2">
      <input aria-label="Titre" className="h-(--row-h) rounded-md border border-line-strong bg-surface px-2.5" />
      <Button {...args} />
    </form>
  ),
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const button = c.getByRole("button", { name: "Publier" });
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await expect(button).not.toHaveAttribute("disabled");
    await expect(button).toHaveAccessibleDescription("Complétez le titre pour publier.");
    await expect(getComputedStyle(button).opacity).toBe("0.4");
    // Tab atteint le bouton ; l'info-bulle donne la raison.
    await userEvent.click(c.getByRole("textbox", { name: "Titre" }));
    await userEvent.tab();
    await expect(button).toHaveFocus();
    const tip = await waitFor(() => within(document.body).getByRole("tooltip"));
    await expect(tip).toHaveTextContent("Complétez le titre pour publier.");
    // Ni Entrée, ni Espace, ni clic n'envoient le formulaire.
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await userEvent.click(button);
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};
