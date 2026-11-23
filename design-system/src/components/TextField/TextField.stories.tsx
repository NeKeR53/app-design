import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { TextField } from "./TextField";

const meta: Meta<typeof TextField> = {
  title: "Composants/Champs/TextField",
  component: TextField,
  parameters: { layout: "padded" },
  args: { label: "Raison sociale", description: "Le nom officiel, tel qu'il figure sur le registre.", isRequired: true, width: "lg" },
};
export default meta;
type Story = StoryObj<typeof TextField>;

export const ParDefaut: Story = {};

/** Tous les états, côte à côte (D-130, D-131). */
export const Etats: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TextField label="Par défaut" placeholder="Atelier Durand" width="lg" />
      <TextField label="Avec aide" isRequired description="Visible par toute l'équipe." width="lg" />
      <TextField label="En erreur" isRequired defaultValue="durand@" error="Saisissez une adresse de la forme nom@domaine.fr." width="lg" />
      <TextField label="Lecture seule" isRequired isReadOnly defaultValue="7F3A-92C1" description="Attribué automatiquement." width="md" />
      <TextField label="Désactivé" isDisabled defaultValue="Atelier Durand" width="lg" />
      <TextField label="Libellé masqué" hideLabel placeholder="Libellé masqué (lecteur d'écran seulement)" width="md" />
    </div>
  ),
};

/** Largeurs : xs 96, sm 160, md 240, lg 360, full (D-133). */
export const Largeurs: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["xs", "sm", "md", "lg", "full"] as const).map((w) => (
        <TextField key={w} label={`Largeur ${w}`} width={w} isRequired />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("textbox", { name: "Largeur md" }).getBoundingClientRect().width).toBe(240);
    await expect(c.getByRole("textbox", { name: "Largeur xs" }).getBoundingClientRect().width).toBe(96);
  },
};

/** L'erreur apparaît en quittant un champ modifié, jamais pendant la frappe (D-022, D-132). */
export const Verification: Story = {
  render: () => <TextField label="Adresse e-mail" type="email" isRequired description="Les factures partent à cette adresse." width="lg" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox", { name: "Adresse e-mail" });
    await userEvent.type(input, "durand@");
    await expect(c.queryByText(/nom@domaine/)).toBeNull();
    await userEvent.tab();
    await waitFor(() => expect(c.getByText("Saisissez une adresse de la forme nom@domaine.fr.")).toBeVisible());
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(c.queryByText("Les factures partent à cette adresse.")).not.toBeVisible();
    await userEvent.clear(input);
    await userEvent.tab();
    await waitFor(() => expect(c.getByText("Ce champ est obligatoire.")).toBeVisible());
  },
};

/** `validate` : la phrase renvoyée s'affiche ; « (facultatif) » suit le libellé (D-022). */
export const ValidationPropre: Story = {
  render: () => <TextField label="Code client" width="sm" description="Format CL-1234." validate={(v) => (v && !/^CL-\d{4}$/.test(v) ? "Le code suit le format CL-1234." : null)} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("(facultatif)")).toBeVisible();
    await userEvent.type(c.getByRole("textbox"), "abc");
    await userEvent.tab();
    await waitFor(() => expect(c.getByText("Le code suit le format CL-1234.")).toBeVisible());
  },
};

function Form() {
  const [sent, setSent] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="flex flex-col gap-4"
    >
      <TextField label="Raison sociale" name="name" isRequired width="lg" />
      <TextField label="Adresse e-mail" name="mail" type="email" isRequired width="lg" />
      <button type="submit" className="w-fit">Créer</button>
      {sent && <output>Envoyé</output>}
    </form>
  );
}

/** À l'envoi : erreurs affichées, focus sur le premier champ en erreur (D-132). */
export const Envoi: Story = {
  render: () => <Form />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Créer" }));
    await waitFor(() => expect(c.getAllByText("Ce champ est obligatoire.")).toHaveLength(2));
    await expect(c.getByRole("textbox", { name: "Raison sociale" })).toHaveFocus();
    await expect(c.queryByText("Envoyé")).toBeNull();
    await userEvent.type(c.getByRole("textbox", { name: "Raison sociale" }), "Atelier Durand");
    await userEvent.type(c.getByRole("textbox", { name: "Adresse e-mail" }), "contact@durand.fr");
    await userEvent.click(c.getByRole("button", { name: "Créer" }));
    await waitFor(() => expect(c.getByText("Envoyé")).toBeVisible());
  },
};

/** Une erreur de l'app s'affiche tout de suite (D-132). */
export const ErreurApp: Story = {
  args: { label: "Identifiant", error: "Cet identifiant est déjà pris.", defaultValue: "durand", width: "md" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Cet identifiant est déjà pris.")).toBeVisible();
    await expect(c.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  },
};

/** Lecture seule : le texte se sélectionne, la valeur ne change pas (D-131). */
export const LectureSeule: Story = {
  args: { label: "Identifiant", isReadOnly: true, defaultValue: "7F3A-92C1", width: "md" },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await expect(input).toHaveAttribute("readonly");
    await userEvent.type(input, "zz");
    await expect(input).toHaveValue("7F3A-92C1");
  },
};
