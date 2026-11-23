import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { InlineEdit, type InlineEditProps } from "./InlineEdit";
import { Drawer, PropertyRow } from "../../patterns/Drawer/Drawer";

/** Valeur tenue par l'histoire : `onSave` met la valeur à jour, puis appelle l'espion. */
function Live({ save, ...props }: Omit<InlineEditProps, "onSave"> & { save?: InlineEditProps["onSave"] }) {
  const [value, setValue] = useState(props.value);
  return (
    <InlineEdit
      {...props}
      value={value}
      onSave={async (v) => {
        await save?.(v);
        setValue(v);
      }}
    />
  );
}

const meta: Meta<typeof InlineEdit> = {
  title: "Composants/InlineEdit",
  component: InlineEdit,
  parameters: { layout: "padded" },
  args: { value: "Courses de la semaine", label: "Nom de la liste", onSave: fn() },
};
export default meta;
type Story = StoryObj<typeof InlineEdit>;

/** Clic : saisie au même endroit ; Entrée enregistre ; le focus revient à la valeur (D-322, D-323). */
export const ParDefaut: Story = {
  render: (args) => <div className="w-72"><Live {...args} save={args.onSave} /></div>,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByText("Courses de la semaine"));
    const field = c.getByRole("textbox", { name: "Nom de la liste" });
    await expect(field).toHaveFocus();
    await userEvent.clear(field);
    await userEvent.type(field, "Courses du week-end{Enter}");
    await expect(args.onSave).toHaveBeenCalledWith("Courses du week-end");
    await waitFor(() => expect(c.getByText("Courses du week-end")).toBeVisible());
    await waitFor(() => expect(c.getByRole("button", { name: "Modifier « Nom de la liste »" })).toHaveFocus());
  },
};

/** Clavier : Tab puis Entrée ou F2 ouvrent ; Échap annule ; valeur inchangée : pas d'enregistrement (D-323). */
export const Clavier: Story = {
  render: (args) => <div className="w-72"><Live {...args} save={args.onSave} /></div>,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await expect(c.getByRole("button", { name: "Modifier « Nom de la liste »" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.type(c.getByRole("textbox"), " à jeter");
    await userEvent.keyboard("{Escape}");
    await expect(c.getByText("Courses de la semaine")).toBeVisible();
    await waitFor(() => expect(c.getByRole("button", { name: "Modifier « Nom de la liste »" })).toHaveFocus());
    await userEvent.keyboard("{F2}");
    await expect(c.getByRole("textbox")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};

/** Un clic à côté enregistre (D-323). */
export const ClicACote: Story = {
  render: (args) => <div className="flex w-72 flex-col gap-6"><Live {...args} save={args.onSave} /><p>À côté</p></div>,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByText("Courses de la semaine"));
    await userEvent.type(c.getByRole("textbox"), " bio");
    await userEvent.click(c.getByText("À côté"));
    await expect(args.onSave).toHaveBeenCalledWith("Courses de la semaine bio");
  },
};

/** Enregistrement refusé : la saisie reste ouverte avec sa valeur et un message (D-323). */
export const Echec: Story = {
  render: (args) => (
    <div className="w-72">
      <Live {...args} save={async () => { await new Promise((r) => setTimeout(r, 150)); throw new Error("refus"); }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByText("Courses de la semaine"));
    const field = c.getByRole("textbox");
    await userEvent.type(field, " 2{Enter}");
    await waitFor(() => expect(field).toHaveAttribute("aria-busy", "true"));
    await waitFor(() => expect(c.getByText("L'action a échoué. Réessayez.")).toBeVisible());
    await expect(c.getByRole("textbox")).toHaveValue("Courses de la semaine 2");
  },
};

/** Valeur obligatoire : une valeur vide est refusée, message sous le champ (D-132). */
export const Obligatoire: Story = {
  args: { isRequired: true, label: "Titre", value: "Plan de lancement" },
  render: (args) => <div className="w-72"><Live {...args} save={args.onSave} /></div>,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByText("Plan de lancement"));
    await userEvent.clear(c.getByRole("textbox"));
    await userEvent.keyboard("{Enter}");
    await expect(c.getByText("Ce champ est obligatoire.")).toBeVisible();
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};

/** Plusieurs lignes : Entrée passe à la ligne, Mod+Entrée enregistre (D-323). */
export const PlusieursLignes: Story = {
  args: { mode: "multiline", label: "Description", value: "", placeholder: "Ajouter une description" },
  render: (args) => <div className="w-72"><Live {...args} save={args.onSave} /></div>,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByText("Ajouter une description"));
    await userEvent.type(c.getByRole("textbox"), "Première ligne{Enter}Deuxième ligne");
    await expect(args.onSave).not.toHaveBeenCalled();
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    await expect(args.onSave).toHaveBeenCalledWith("Première ligne\nDeuxième ligne");
  },
};

/** Valeur vide : texte d'invite en gris (D-322). */
export const Vide: Story = { args: { value: "", placeholder: "Ajouter un sous-titre", label: "Sous-titre" } };

/** Désactivé : texte simple, sans saisie. */
export const Desactive: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button")).toBeNull();
  },
};

/** Titre et valeurs du panneau de détail (D-324) : la saisie garde la police du titre. */
export const DansLePanneau: Story = {
  render: () => (
    <div className="w-[300px] border border-line">
      <div className="border-b border-line px-(--pad) py-3 text-xl font-semibold">
        <Live value="Refonte du site" label="Nom" isRequired />
      </div>
      <Drawer>
        <Drawer.Section id="story-inline" title="Propriétés">
          <PropertyRow label="Responsable" value={<Live value="Camille Martin" label="Responsable" />} />
          <PropertyRow label="Échéance" value="15 mars" />
          <PropertyRow label="Description" value={<Live value="" label="Description" mode="multiline" placeholder="Ajouter une description" />} />
        </Drawer.Section>
      </Drawer>
    </div>
  ),
};
