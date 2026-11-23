import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { useOpenForm, type OpenFormOptions } from "./FormDialog";
import { Button } from "../../components/Button/Button";
import type { FormField } from "../../lib/form";

/* ---------- Données factices génériques ---------- */

const contactFields: FormField[] = [
  { type: "text", name: "name", label: "Nom", isRequired: true, autoComplete: "name" },
  { type: "email", name: "email", label: "Adresse e-mail", isRequired: true },
  {
    type: "select",
    name: "role",
    label: "Rôle",
    isRequired: true,
    width: "md",
    defaultValue: "member",
    options: [
      { id: "member", label: "Membre" },
      { id: "reader", label: "Lecteur" },
      { id: "admin", label: "Administrateur" },
    ],
  },
  { type: "checkbox", name: "invite", label: "Envoyer une invitation" },
];

/** Un bouton qui ouvre le formulaire et affiche ce que rend la promesse. */
function Demo({ label = "Nouveau contact", options }: { label?: string; options: OpenFormOptions }) {
  const openForm = useOpenForm();
  const [result, setResult] = useState<string>("");
  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        onPress={async () => {
          const values = await openForm(options);
          setResult(JSON.stringify(values));
        }}
      >
        {label}
      </Button>
      {result && <output className="font-mono text-sm">{result}</output>}
    </div>
  );
}

const meta: Meta<typeof Demo> = {
  title: "Gabarits/FormDialog",
  component: Demo,
  parameters: { layout: "padded" },
  args: {
    options: {
      title: "Nouveau contact",
      description: "Il rejoint la liste des contacts.",
      fields: contactFields,
      submitLabel: "Ajouter",
    },
  },
};
export default meta;
type Story = StoryObj<typeof Demo>;

const body = () => within(document.body);
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const ParDefaut: Story = {};

/** Ouvrir, remplir, envoyer : la promesse rend les valeurs (D-197). */
export const RendLesValeurs: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Nouveau contact" }));
    const dialog = await body().findByRole("dialog", { name: "Nouveau contact" });
    const d = within(dialog);
    // Focus sur le premier champ (D-125) ; quatre champs simples : taille sm (D-198).
    await waitFor(() => expect(d.getByRole("textbox", { name: "Nom" })).toHaveFocus());
    await expect(dialog.getBoundingClientRect().width).toBeLessThanOrEqual(400);
    // Vérification à l'envoi (D-132).
    await userEvent.click(d.getByRole("button", { name: "Ajouter" }));
    await waitFor(() => expect(d.getAllByText("Ce champ est obligatoire.")).toHaveLength(2));
    await userEvent.type(d.getByRole("textbox", { name: "Nom" }), " Camille Martin ");
    await userEvent.type(d.getByRole("textbox", { name: "Adresse e-mail" }), "camille@exemple.fr");
    // Entrée dans un champ d'une ligne envoie (D-196).
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await expect(c.getByText('{"name":"Camille Martin","email":"camille@exemple.fr","role":"member","invite":false}')).toBeVisible();
  },
};

/** Fermer rend `null` (D-197). */
export const AnnulerRendNull: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Nouveau contact" }));
    const dialog = await body().findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Annuler" }));
    await waitFor(() => expect(c.getByText("null")).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: "Nouveau contact" }));
    await body().findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await expect(c.getByText("null")).toBeVisible();
  },
};

const failingOnce = () => {
  let calls = 0;
  return fn(async () => {
    calls += 1;
    await wait(150);
    if (calls === 1) throw new Error("Le serveur ne répond pas.");
  });
};

/** Avec `onSubmit` : attente, erreur sur place, la modale reste ouverte (D-198). */
export const AttenteEtErreur: Story = {
  args: {
    options: {
      title: "Renommer la liste",
      fields: [{ type: "text", name: "name", label: "Nom", isRequired: true }],
      initialValues: { name: "Courses" },
      submitLabel: "Renommer",
      onSubmit: failingOnce(),
    },
    label: "Renommer",
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Renommer" }));
    const dialog = await body().findByRole("dialog", { name: "Renommer la liste" });
    const d = within(dialog);
    await userEvent.click(d.getByRole("button", { name: "Renommer" }));
    await waitFor(() => expect(dialog).toHaveAttribute("aria-busy", "true"));
    await expect(d.getByRole("button", { name: "Annuler" })).toBeDisabled();
    await waitFor(() => expect(d.getByRole("alert")).toHaveTextContent("Le serveur ne répond pas."));
    await expect(d.getByRole("textbox", { name: "Nom" })).toHaveValue("Courses");
    await userEvent.click(d.getByRole("button", { name: "Renommer" }));
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await expect(c.getByText('{"name":"Courses"}')).toBeVisible();
  },
};

/** Erreurs de champ rendues par `onSubmit` (D-192). */
export const ErreurDeChamp: Story = {
  args: {
    options: {
      title: "Nouveau contact",
      fields: contactFields.slice(0, 2),
      initialValues: { name: "Camille", email: "camille@exemple.fr" },
      submitLabel: "Ajouter",
      onSubmit: async () => ({ errors: { email: "Cette adresse est déjà utilisée." } }),
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Nouveau contact" }));
    const d = within(await body().findByRole("dialog"));
    await userEvent.click(d.getByRole("button", { name: "Ajouter" }));
    await waitFor(() => expect(d.getByText("Cette adresse est déjà utilisée.")).toBeVisible());
    await waitFor(() => expect(d.getByRole("textbox", { name: "Adresse e-mail" })).toHaveFocus());
  },
};

/** Zone de texte : taille md (D-198) ; Mod+Entrée envoie (D-196). */
export const AvecZoneDeTexte: Story = {
  args: {
    label: "Nouvelle note",
    options: {
      title: "Nouvelle note",
      fields: [
        { type: "text", name: "title", label: "Titre", isRequired: true },
        { type: "textarea", name: "body", label: "Texte" },
      ],
      submitLabel: "Créer",
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Nouvelle note" }));
    const dialog = await body().findByRole("dialog");
    const d = within(dialog);
    await expect(dialog.getBoundingClientRect().width).toBeGreaterThan(500);
    await userEvent.type(d.getByRole("textbox", { name: "Titre" }), "Idées");
    await userEvent.type(d.getByRole("textbox", { name: /Texte/ }), "Ligne 1{Enter}Ligne 2");
    await expect(body().getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await expect(c.getByText('{"title":"Idées","body":"Ligne 1\\nLigne 2"}')).toBeVisible();
  },
};
