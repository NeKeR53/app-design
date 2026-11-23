import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { FormPage, type FormPageProps, type FormSection, type FormStep } from "./FormPage";
import type { FormValues } from "../../lib/form";

/* ---------- Données factices génériques ---------- */

const STATES = [
  { id: "todo", label: "À faire" },
  { id: "doing", label: "En cours" },
  { id: "done", label: "Terminé" },
];
const PEOPLE = [
  { id: "cm", label: "Camille Martin" },
  { id: "sl", label: "Sam Leroy" },
  { id: "np", label: "Noa Petit" },
];

const sections: FormSection[] = [
  {
    title: "Général",
    description: "Ce qui identifie le projet dans les listes.",
    fields: [
      { type: "text", name: "name", label: "Nom", isRequired: true, description: "Visible par toute l'équipe.", placeholder: "Atelier d'automne" },
      { type: "select", name: "state", label: "État", isRequired: true, width: "md", options: STATES, defaultValue: "todo" },
      { type: "combobox", name: "owner", label: "Responsable", items: PEOPLE, width: "lg" },
      { type: "number", name: "budget", label: "Budget", description: "En euros.", min: 0 },
    ],
  },
  {
    title: "Détails",
    description: "Pour bien démarrer.",
    fields: [
      { type: "textarea", name: "description", label: "Description" },
      {
        type: "radio",
        name: "visibility",
        label: "Visibilité",
        isRequired: true,
        defaultValue: "team",
        options: [
          { value: "team", label: "Équipe", description: "Tous les membres le voient." },
          { value: "private", label: "Privé", description: "Vous seul le voyez." },
        ],
      },
      { type: "checkbox", name: "notify", label: "Prévenir l'équipe", description: "Un message part à la création." },
    ],
  },
  {
    title: "Adresse du chantier",
    fields: [
      {
        type: "fieldset",
        legend: "Adresse",
        isOptional: true,
        fields: [
          { type: "text", name: "street", label: "Rue" },
          { type: "text", name: "zip", label: "Code postal", width: "sm" },
          { type: "text", name: "city", label: "Ville", width: "lg" },
        ],
      },
      { type: "checkboxGroup", name: "tags", label: "Étiquettes", orientation: "horizontal", options: [{ value: "urgent", label: "Urgent" }, { value: "client", label: "Client" }, { value: "interne", label: "Interne" }] },
    ],
  },
];

/** Le gabarit dans une zone qui défile, comme le `main` d'AppShell. */
function Frame(props: FormPageProps) {
  return (
    <div className="h-[560px] overflow-auto rounded-lg border border-line">
      <FormPage {...props} />
    </div>
  );
}

const meta: Meta<typeof FormPage> = {
  title: "Gabarits/FormPage",
  component: FormPage,
  parameters: { layout: "padded" },
  args: {
    title: "Nouveau projet",
    description: "Décrivez le projet ; l'équipe le verra dès sa création.",
    sections,
    submitLabel: "Créer",
    onSubmit: fn(async () => {
      await new Promise((r) => setTimeout(r, 300));
    }),
    onCancel: fn(),
  },
  render: (args) => <Frame {...args} />,
};
export default meta;
type Story = StoryObj<typeof FormPage>;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const body = () => within(document.body);

export const ParDefaut: Story = {};

/** Modification : les valeurs de départ viennent de l'objet lu en base (D-191). */
export const Modification: Story = {
  args: {
    title: "Modifier le projet",
    description: "",
    submitLabel: "Enregistrer",
    initialValues: { name: "Atelier d'automne", state: "doing", owner: "sl", budget: 1200.5, notify: true, tags: ["client"], extra: "ignoré" },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("textbox", { name: "Nom" })).toHaveValue("Atelier d'automne");
    await expect(c.getByRole("textbox", { name: /Budget/ })).toHaveValue("1200,5");
    await expect(c.getByRole("checkbox", { name: /Prévenir l'équipe/ })).toBeChecked();
    // Rien n'a changé : le pied ne dit rien.
    await expect(c.queryByText("Modifications non enregistrées")).toBeNull();
  },
};

/** Chargement : squelettes à la place des champs, pas de pied (D-193). */
export const Chargement: Story = {
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByRole("status", { name: "Chargement…" })).toBeInTheDocument(), { timeout: 1000 });
    await expect(c.queryByRole("button", { name: "Créer" })).toBeNull();
  },
};

/** Sur mobile : titres de section au-dessus, boutons du pied sur toute la largeur (D-193). */
export const Mobile: Story = {
  render: (args) => (
    <div className="w-[375px]">
      <Frame {...args} />
    </div>
  ),
};

/** L'envoi vérifie tout et met le focus sur le premier champ en erreur (D-132, D-192). */
export const Verification: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Créer" }));
    await waitFor(() => expect(c.getByText("Renseignez « Nom ».")).toBeVisible());
    // Une seule erreur : pas de récapitulatif, le focus va au champ (D-341).
    await expect(c.getByRole("textbox", { name: "Nom" })).toHaveFocus();
    await expect(c.queryByText(/erreurs? à corriger/)).toBeNull();
    await expect(args.onSubmit).not.toHaveBeenCalled();
    // Nombre illisible, puis hors bornes.
    await userEvent.type(c.getByRole("textbox", { name: "Nom" }), "Atelier");
    const budget = c.getByRole("textbox", { name: /Budget/ });
    await userEvent.type(budget, "douze");
    await userEvent.tab();
    await waitFor(() => expect(c.getByText("Saisissez un nombre.")).toBeVisible());
    await userEvent.clear(budget);
    await userEvent.type(budget, "-3");
    await userEvent.tab();
    await waitFor(() => expect(c.getByText("Saisissez un nombre supérieur ou égal à 0.")).toBeVisible());
  },
};

/** État d'enregistrement dans le pied et valeurs typées (D-191, D-194). */
export const Enregistrement: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole("textbox", { name: "Nom" }), "  Atelier d'automne  ");
    await expect(c.getByText("Modifications non enregistrées")).toBeVisible();
    await userEvent.type(c.getByRole("textbox", { name: /Budget/ }), "1 200,5");
    await userEvent.click(c.getByRole("checkbox", { name: /Prévenir l'équipe/ }));
    await userEvent.click(c.getByRole("button", { name: "Créer" }));
    await waitFor(() => expect(c.getByText("Enregistrement…")).toBeVisible());
    await waitFor(() => expect(c.getByText("Enregistré")).toBeVisible());
    const values = (args.onSubmit as ReturnType<typeof fn>).mock.calls[0]?.[0] as FormValues;
    await expect(values).toMatchObject({ name: "Atelier d'automne", state: "todo", owner: null, budget: 1200.5, visibility: "team", notify: true, tags: [], street: "" });
    // Les valeurs envoyées deviennent la référence : « Annuler » ne demande plus rien.
    await userEvent.click(c.getByRole("button", { name: "Annuler" }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};

/** Erreurs rendues par `onSubmit` : sous les champs, et une phrase dans le pied (D-192). */
export const ErreursDuServeur: Story = {
  args: {
    initialValues: { name: "Atelier" },
    onSubmit: fn(async () => ({ errors: { name: "Ce nom est déjà pris." } })),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Créer" }));
    await waitFor(() => expect(c.getByText("Ce nom est déjà pris.")).toBeVisible());
    await expect(c.getByRole("alert")).toHaveTextContent("Corrigez les champs signalés.");
    const name = c.getByRole("textbox", { name: "Nom" });
    await waitFor(() => expect(name).toHaveFocus());
    await userEvent.type(name, " 2");
    await expect(c.queryByText("Ce nom est déjà pris.")).toBeNull();
    await expect(c.getByText("Modifications non enregistrées")).toBeVisible();
  },
};

/** Échec : le message de l'erreur s'affiche dans le pied, la saisie reste (D-192, D-194). */
export const Echec: Story = {
  args: {
    initialValues: { name: "Atelier" },
    onSubmit: fn(async () => {
      await wait(100);
      throw new Error("Le serveur ne répond pas.");
    }),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Créer" }));
    await waitFor(() => expect(c.getByRole("alert")).toHaveTextContent("Le serveur ne répond pas."));
    await expect(c.getByRole("textbox", { name: "Nom" })).toHaveValue("Atelier");
  },
};

/** « Annuler » : tout de suite sans saisie, confirmé après une saisie (D-195). */
export const Annuler: Story = {
  args: { onDirtyChange: fn() },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Annuler" }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
    await userEvent.type(c.getByRole("textbox", { name: "Nom" }), "Brouillon");
    await waitFor(() => expect(args.onDirtyChange).toHaveBeenLastCalledWith(true));
    await userEvent.click(c.getByRole("button", { name: "Annuler" }));
    const dialog = await body().findByRole("alertdialog", { name: "Abandonner les modifications ?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Annuler" }));
    await waitFor(() => expect(body().queryByRole("alertdialog")).toBeNull());
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
    await userEvent.click(c.getByRole("button", { name: "Annuler" }));
    await userEvent.click(within(await body().findByRole("alertdialog")).getByRole("button", { name: "Abandonner" }));
    await waitFor(() => expect(args.onCancel).toHaveBeenCalledTimes(2));
  },
};

/** Mod+Entrée envoie, même depuis une zone de texte (D-196). */
export const ModEntree: Story = {
  args: { initialValues: { name: "Atelier" } },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const area = c.getByRole("textbox", { name: /Description/ });
    await userEvent.type(area, "Première ligne{Enter}Deuxième");
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1));
    await expect((args.onSubmit as ReturnType<typeof fn>).mock.calls[0]?.[0]).toMatchObject({ description: "Première ligne\nDeuxième" });
  },
};

/** Règle croisée : `validate` reçoit aussi les autres valeurs (D-192). */
export const RegleCroisee: Story = {
  args: {
    title: "Nouvelle réservation",
    description: "",
    sections: [
      {
        title: "Dates",
        fields: [
          { type: "number", name: "from", label: "Premier jour", isRequired: true, min: 1, max: 31 },
          {
            type: "number",
            name: "to",
            label: "Dernier jour",
            isRequired: true,
            min: 1,
            max: 31,
            validate: (to, values) => (to !== null && typeof values.from === "number" && to < values.from ? "Le dernier jour suit le premier." : null),
          },
        ],
      },
    ],
    submitLabel: "Réserver",
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole("textbox", { name: "Premier jour" }), "12");
    await userEvent.type(c.getByRole("textbox", { name: "Dernier jour" }), "4");
    await userEvent.click(c.getByRole("button", { name: "Réserver" }));
    await waitFor(() => expect(c.getByText("Le dernier jour suit le premier.")).toBeVisible());
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** Sections : titre à gauche à partir de 800 px de conteneur, au-dessus en dessous (D-193). */
export const Colonnes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="w-[960px]" data-testid="large">
        <Frame {...args} />
      </div>
      <div className="w-[600px]" data-testid="etroit">
        <Frame {...args} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const head = (id: string) => within(c.getByTestId(id)).getByRole("heading", { name: "Général" });
    const field = (id: string) => within(c.getByTestId(id)).getByRole("textbox", { name: "Nom" });
    await expect(head("large").getBoundingClientRect().left).toBeLessThan(field("large").getBoundingClientRect().left - 200);
    await expect(head("etroit").getBoundingClientRect().bottom).toBeLessThan(field("etroit").getBoundingClientRect().top);
  },
};

const required: FormSection[] = [
  {
    title: "Général",
    fields: [
      { type: "text", name: "name", label: "Nom", isRequired: true },
      { type: "email", name: "email", label: "Adresse e-mail", isRequired: true },
      { type: "select", name: "state", label: "État", isRequired: true, width: "md", options: STATES },
    ],
  },
  {
    title: "Détails",
    fields: [
      { type: "text", name: "start", label: "Date de début", isRequired: true, requiredMessage: "Saisissez la date de début." },
      { type: "combobox", name: "owner", label: "Responsable", items: PEOPLE, isRequired: true, requiredMessage: "Choisissez la personne responsable." },
    ],
  },
];

/**
 * Récapitulatif des erreurs (D-341) : à partir de 2 erreurs, encart en haut, focus sur l'encart,
 * un lien par champ dans l'ordre du formulaire ; mis à jour au prochain envoi ; une seule erreur : focus sur le champ.
 */
export const Recapitulatif: Story = {
  args: { sections: required },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Créer" }));
    const summary = await c.findByRole("alert", { name: "5 erreurs à corriger" });
    await waitFor(() => expect(summary).toHaveFocus());
    await expect(summary).toHaveClass("border-danger");
    const links = within(summary).getAllByRole("link");
    await expect(links.map((l) => l.textContent)).toEqual(["Nom", "Adresse e-mail", "État", "Date de début", "Responsable"]);
    // Messages construits à partir du libellé, ou `requiredMessage` (D-344).
    await expect(c.getByText("Renseignez « Nom ».")).toBeVisible();
    await expect(c.getByText("Choisissez une valeur pour « État ».")).toBeVisible();
    await expect(c.getByText("Saisissez la date de début.")).toBeVisible();
    await expect(c.getByText("Choisissez la personne responsable.")).toBeVisible();
    // Un lien met le focus dans son champ.
    await userEvent.click(within(summary).getByRole("link", { name: "État" }));
    await expect(c.getByRole("button", { name: /État/ })).toHaveFocus();
    await userEvent.click(within(summary).getByRole("link", { name: "Adresse e-mail" }));
    await expect(c.getByRole("textbox", { name: "Adresse e-mail" })).toHaveFocus();
    // Corrections : rien ne bouge avant l'envoi ; au prochain envoi, l'encart suit.
    await userEvent.type(c.getByRole("textbox", { name: "Adresse e-mail" }), "camille@exemple.fr");
    await userEvent.type(c.getByRole("textbox", { name: "Nom" }), "Atelier");
    await expect(c.getByRole("alert", { name: "5 erreurs à corriger" })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Créer" }));
    await waitFor(() => expect(c.getByRole("alert", { name: "3 erreurs à corriger" })).toHaveFocus());
    // Une seule erreur : plus d'encart, focus sur le champ.
    await userEvent.click(c.getByRole("button", { name: /État/ }));
    await userEvent.click(await body().findByRole("option", { name: "En cours" }));
    await userEvent.type(c.getByRole("textbox", { name: "Date de début" }), "lundi");
    await userEvent.click(c.getByRole("button", { name: "Créer" }));
    await waitFor(() => expect(c.getByRole("combobox", { name: /Responsable/ })).toHaveFocus());
    await expect(c.queryByText(/erreurs à corriger/)).toBeNull();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** Erreurs du serveur sur 2 champs ou plus : même récapitulatif (D-341). */
export const RecapitulatifServeur: Story = {
  args: {
    sections: [{ title: "Général", fields: [{ type: "text", name: "name", label: "Nom" }, { type: "text", name: "code", label: "Code" }] }],
    onSubmit: fn(async () => ({ errors: { code: "Ce code est déjà pris.", name: "Ce nom est déjà pris." } })),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Créer" }));
    const summary = await c.findByRole("alert", { name: "2 erreurs à corriger" });
    await waitFor(() => expect(summary).toHaveFocus());
    await expect(within(summary).getAllByRole("link").map((l) => l.textContent)).toEqual(["Nom", "Code"]);
    await expect(c.getByText("Ce code est déjà pris.")).toBeVisible();
  },
};

/* ---------- Formulaire en étapes (D-364) ---------- */

const PRODUCTS = [
  { id: "carnet", label: "Carnet A5" },
  { id: "agenda", label: "Agenda 2027" },
];

const orderSteps: FormStep[] = [
  {
    id: "client",
    title: "Client",
    description: "Qui commande",
    fields: [
      { type: "text", name: "name", label: "Nom", isRequired: true },
      { type: "email", name: "email", label: "Adresse e-mail", isRequired: true },
    ],
  },
  {
    id: "commande",
    title: "Commande",
    description: "Quoi et combien",
    fields: [
      { type: "select", name: "product", label: "Article", isRequired: true, width: "md", options: PRODUCTS, defaultValue: "carnet" },
      { type: "number", name: "quantity", label: "Quantité", isRequired: true, min: 1 },
      {
        type: "radio",
        name: "delivery",
        label: "Livraison",
        defaultValue: "standard",
        orientation: "horizontal",
        options: [
          { value: "standard", label: "Standard" },
          { value: "express", label: "Express" },
        ],
      },
      { type: "checkbox", name: "gift", label: "Paquet cadeau" },
      { type: "textarea", name: "notes", label: "Remarques" },
    ],
  },
];

/** Les props d'une story en étapes : seules les fonctions viennent des `args`. */
function StepsFrame({ onSubmit, onCancel, onDirtyChange, initialValues }: Partial<FormPageProps>) {
  return (
    <Frame
      title="Nouvelle commande"
      description="Trois temps : le client, la commande, puis la vérification."
      steps={orderSteps}
      submitLabel="Commander"
      onSubmit={onSubmit ?? (() => undefined)}
      {...(onCancel ? { onCancel } : {})}
      {...(onDirtyChange ? { onDirtyChange } : {})}
      {...(initialValues ? { initialValues } : {})}
    />
  );
}

const fillClient = async (c: ReturnType<typeof within>) => {
  await userEvent.type(c.getByRole("textbox", { name: "Nom" }), "Camille Martin");
  await userEvent.type(c.getByRole("textbox", { name: "Adresse e-mail" }), "camille@exemple.fr");
};

/** En étapes : ProgressIndicator en haut, une étape à la fois, « Suivant » dans le pied (D-364). */
export const Etapes: Story = {
  render: (args) => <StepsFrame {...args} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const list = c.getByRole("list", { name: "Étapes du formulaire" });
    const items = within(list).getAllByRole("listitem");
    await expect(items.map((i) => i.textContent)).toEqual(["1ClientQui commande", "2CommandeQuoi et combien", "3Récapitulatif"]);
    await expect(items[0]).toHaveAttribute("aria-current", "step");
    // Étape 1 : pas de « Précédent » ; « Suivant » est l'action principale.
    await expect(c.queryByRole("button", { name: "Précédent" })).toBeNull();
    await expect(c.getByRole("button", { name: "Suivant" })).toBeVisible();
    await expect(c.queryByRole("textbox", { name: /Quantité/ })).toBeNull();
  },
};

/** Avancer, revenir (pied ou ProgressIndicator) : le focus va au titre de l'étape ; les valeurs restent (D-326, D-364). */
export const EtapesNavigation: Story = {
  render: (args) => <StepsFrame {...args} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await fillClient(c);
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await waitFor(() => expect(c.getByRole("heading", { name: "Commande" })).toHaveFocus());
    await expect(c.getAllByRole("listitem")[1]).toHaveAttribute("aria-current", "step");
    // Pas de saut en avant : le récapitulatif n'est pas un bouton.
    await expect(c.queryByRole("button", { name: /Récapitulatif/ })).toBeNull();
    await userEvent.type(c.getByRole("textbox", { name: /Quantité/ }), "3");
    await userEvent.click(c.getByRole("radio", { name: "Express" }));
    // Retour par le pied : les valeurs de l'étape 1 sont toujours là.
    await userEvent.click(c.getByRole("button", { name: "Précédent" }));
    await waitFor(() => expect(c.getByRole("heading", { name: "Client" })).toHaveFocus());
    await expect(c.getByRole("textbox", { name: "Nom" })).toHaveValue("Camille Martin");
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await expect(c.getByRole("textbox", { name: /Quantité/ })).toHaveValue("3");
    await expect(c.getByRole("radio", { name: "Express" })).toBeChecked();
    // Retour par ProgressIndicator : une étape faite est un bouton.
    await userEvent.click(c.getByRole("button", { name: /^Client \(fait\)/ }));
    await waitFor(() => expect(c.getByRole("heading", { name: "Client" })).toHaveFocus());
    await expect(c.getAllByRole("listitem")[0]).toHaveAttribute("aria-current", "step");
  },
};

/** « Suivant » ne vérifie que l'étape en cours, avec les règles et le récapitulatif de D-341 ; on reste sur l'étape (D-364). */
export const EtapesVerification: Story = {
  render: (args) => <StepsFrame {...args} />,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    const summary = await c.findByRole("alert", { name: "2 erreurs à corriger" });
    await waitFor(() => expect(summary).toHaveFocus());
    await expect(within(summary).getAllByRole("link").map((l) => l.textContent)).toEqual(["Nom", "Adresse e-mail"]);
    await expect(c.getAllByRole("listitem")[0]).toHaveAttribute("aria-current", "step");
    // Une seule erreur : focus sur le champ, plus d'encart.
    await userEvent.type(c.getByRole("textbox", { name: "Nom" }), "Camille Martin");
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await waitFor(() => expect(c.getByRole("textbox", { name: "Adresse e-mail" })).toHaveFocus());
    await expect(c.queryByText(/erreurs à corriger/)).toBeNull();
    await userEvent.type(c.getByRole("textbox", { name: "Adresse e-mail" }), "camille@exemple.fr");
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    // Étape 2 : ses champs seulement ; la quantité manque.
    await waitFor(() => expect(c.getByRole("heading", { name: "Commande" })).toHaveFocus());
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await waitFor(() => expect(c.getByText("Renseignez « Quantité ».")).toBeVisible());
    await expect(c.getAllByRole("listitem")[1]).toHaveAttribute("aria-current", "step");
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** Dernière étape : récapitulatif des valeurs par étape, « Modifier » y ramène, puis l'action (D-364). */
export const EtapesRecapitulatif: Story = {
  render: (args) => <StepsFrame {...args} />,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await fillClient(c);
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await userEvent.type(c.getByRole("textbox", { name: /Quantité/ }), "3");
    await userEvent.click(c.getByRole("radio", { name: "Express" }));
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await waitFor(() => expect(c.getByRole("heading", { name: "Récapitulatif" })).toHaveFocus());
    const client = c.getByRole("region", { name: "Client" });
    await expect(client).toHaveTextContent("NomCamille Martin");
    await expect(client).toHaveTextContent("Adresse e-mailcamille@exemple.fr");
    const order = c.getByRole("region", { name: "Commande" });
    // Libellés des options, « Non » pour une case vide, « — » lu « vide » pour un champ vide.
    await expect(order).toHaveTextContent("ArticleCarnet A5");
    await expect(order).toHaveTextContent("Quantité3");
    await expect(order).toHaveTextContent("LivraisonExpress");
    await expect(order).toHaveTextContent("Paquet cadeauNon");
    await expect(order).toHaveTextContent("Remarques—vide");
    // « Modifier » ramène à l'étape ; on revient au récapitulatif par « Suivant ».
    await userEvent.click(within(client).getByRole("button", { name: "Modifier « Client »" }));
    await waitFor(() => expect(c.getByRole("heading", { name: "Client" })).toHaveFocus());
    const name = c.getByRole("textbox", { name: "Nom" });
    await userEvent.clear(name);
    await userEvent.type(name, "Sam Leroy");
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await expect(c.getByRole("region", { name: "Client" })).toHaveTextContent("NomSam Leroy");
    // L'action : `onSubmit` reçoit toutes les valeurs.
    await userEvent.click(c.getByRole("button", { name: "Commander" }));
    await waitFor(() => expect(c.getByText("Enregistré")).toBeVisible());
    await expect((args.onSubmit as ReturnType<typeof fn>).mock.calls[0]?.[0]).toEqual({
      name: "Sam Leroy",
      email: "camille@exemple.fr",
      product: "carnet",
      quantity: 3,
      delivery: "express",
      gift: false,
      notes: "",
    });
  },
};

/** Erreurs du serveur : retour à la première étape en erreur ; les étapes en erreur sont marquées (D-364). */
export const EtapesErreurServeur: Story = {
  args: {
    initialValues: { name: "Camille Martin", email: "pris@exemple.fr", quantity: 500 },
    onSubmit: fn(async (values: FormValues) =>
      values.email === "pris@exemple.fr" ? { errors: { quantity: "Stock insuffisant.", email: "Cette adresse a déjà un compte." } } : undefined,
    ),
  },
  render: (args) => <StepsFrame {...args} />,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await userEvent.click(c.getByRole("button", { name: "Commander" }));
    // Première étape en erreur : une seule erreur sur l'étape, le focus va au champ.
    const email = c.getByRole("textbox", { name: "Adresse e-mail" });
    await waitFor(() => expect(email).toHaveFocus());
    await expect(c.getByText("Cette adresse a déjà un compte.")).toBeVisible();
    await expect(c.getByRole("alert")).toHaveTextContent("Corrigez les champs signalés.");
    const items = c.getAllByRole("listitem");
    await expect(items[0]).toHaveAttribute("aria-current", "step");
    await expect(items[0]).toHaveTextContent("Client (erreur)");
    await expect(items[1]).toHaveTextContent("Commande (erreur)");
    // Une étape en erreur après l'étape en cours n'est pas un bouton (D-326).
    await expect(c.queryByRole("button", { name: /Commande/ })).toBeNull();
    // Corriger l'étape : sa marque disparaît ; l'étape suivante montre son erreur.
    await userEvent.clear(email);
    await userEvent.type(email, "camille@exemple.fr");
    await expect(c.getAllByRole("listitem")[0]).not.toHaveTextContent("(erreur)");
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await expect(c.getByText("Stock insuffisant.")).toBeVisible();
    const quantity = c.getByRole("textbox", { name: /Quantité/ });
    await userEvent.clear(quantity);
    await userEvent.type(quantity, "5");
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await userEvent.click(c.getByRole("button", { name: "Commander" }));
    await waitFor(() => expect(c.getByText("Enregistré")).toBeVisible());
    await expect(args.onSubmit).toHaveBeenCalledTimes(2);
  },
};

/** Erreurs du serveur sur 2 champs de la même étape : le récapitulatif de D-341, limité à l'étape (D-364). */
export const EtapesErreurServeurRecapitulatif: Story = {
  args: {
    initialValues: { name: "Camille Martin", email: "camille@exemple.fr", quantity: 2 },
    onSubmit: fn(async () => ({ errors: { quantity: "Stock insuffisant.", product: "Article retiré." } })),
  },
  render: (args) => <StepsFrame {...args} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await userEvent.click(c.getByRole("button", { name: "Commander" }));
    const summary = await c.findByRole("alert", { name: "2 erreurs à corriger" });
    await waitFor(() => expect(summary).toHaveFocus());
    await expect(within(summary).getAllByRole("link").map((l) => l.textContent)).toEqual(["Article", "Quantité"]);
    await expect(c.getAllByRole("listitem")[1]).toHaveAttribute("aria-current", "step");
    // Étape 1 sans erreur : faite, cliquable.
    await expect(c.getByRole("button", { name: /^Client \(fait\)/ })).toBeInTheDocument();
  },
};

/** « Annuler » après une saisie, à n'importe quelle étape : confirmation (D-195). */
export const EtapesAnnuler: Story = {
  args: { onDirtyChange: fn() },
  render: (args) => <StepsFrame {...args} />,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await fillClient(c);
    await waitFor(() => expect(args.onDirtyChange).toHaveBeenLastCalledWith(true));
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await userEvent.click(c.getByRole("button", { name: "Annuler" }));
    const dialog = await body().findByRole("alertdialog", { name: "Abandonner les modifications ?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Abandonner" }));
    await waitFor(() => expect(args.onCancel).toHaveBeenCalledTimes(1));
  },
};

/** Sur mobile : ProgressIndicator resserré (D-326), boutons du pied qui se partagent la largeur. */
export const EtapesMobile: Story = {
  render: (args) => (
    <div className="w-[375px]">
      <StepsFrame {...args} initialValues={{ name: "Camille Martin", email: "camille@exemple.fr" }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    // Sous 380 px, seul le titre de l'étape en cours reste visible.
    const list = c.getByRole("list", { name: "Étapes du formulaire" });
    await expect(within(list).getByText("Commande")).toBeVisible();
    await expect(c.getByRole("button", { name: /^Client \(fait\)/ }).getBoundingClientRect().width).toBeLessThan(40);
  },
};
