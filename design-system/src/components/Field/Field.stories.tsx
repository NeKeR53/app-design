import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { TextField } from "../TextField/TextField";
import { TextArea } from "../TextArea/TextArea";
import { Select } from "../Select/Select";
import { Checkbox, CheckboxGroup } from "../Checkbox/Checkbox";
import { RadioGroup } from "../RadioGroup/RadioGroup";
import { Switch } from "../Switch/Switch";
import { Fieldset } from "../Fieldset/Fieldset";

/** Anatomie commune (Field.spec.md) : tous les champs dans un formulaire au gabarit FormPage (D-022). */
const meta: Meta = {
  title: "Composants/Champs/Formulaire",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

const Section = ({ title, help, children }: { title: string; help: string; children: ReactNode }) => (
  <section className="grid gap-3 border-t border-line py-5 desktop:grid-cols-[200px_minmax(0,1fr)] desktop:gap-6">
    <div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-fg-3">{help}</div>
    </div>
    <div className="flex min-w-0 flex-col gap-4">{children}</div>
  </section>
);

function Commande() {
  const [state, setState] = useState("Non enregistré");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setState("Enregistré");
      }}
      onInvalid={() => setState("Corrigez les champs signalés")}
      className="max-w-[880px] font-sans text-md text-fg"
    >
      <Section title="Client" help="Nom affiché sur les documents.">
        <TextField label="Raison sociale" isRequired width="lg" description="Le nom officiel, tel qu'il figure sur le registre." />
        <div className="flex flex-wrap gap-3">
          <TextField label="Code client" width="sm" description="Format CL-1234." validate={(v) => (v && !/^CL-\d{4}$/.test(v) ? "Le code suit le format CL-1234." : null)} />
          <TextField label="Identifiant" isReadOnly defaultValue="7F3A-92C1" width="md" isRequired />
        </div>
        <TextField label="Adresse e-mail" type="email" isRequired width="lg" />
        <Select label="Pays" isRequired width="md" options={[{ id: "fr", label: "France" }, { id: "be", label: "Belgique" }, { id: "ch", label: "Suisse" }]} />
      </Section>
      <Section title="Livraison" help="Où et comment livrer.">
        <Fieldset legend="Adresse de livraison">
          <TextField label="Rue" isRequired width="lg" />
          <div className="flex flex-wrap gap-3">
            <TextField label="Code postal" isRequired width="xs" />
            <TextField label="Ville" isRequired width="md" />
          </div>
        </Fieldset>
        <RadioGroup label="Mode de livraison" isRequired>
          <RadioGroup.Option value="std" description="3 à 5 jours ouvrés">Standard</RadioGroup.Option>
          <RadioGroup.Option value="exp" description="Le lendemain avant 13 h">Express</RadioGroup.Option>
        </RadioGroup>
        <CheckboxGroup label="Prévenir le client" orientation="horizontal" description="Par e-mail.">
          <Checkbox value="exp">À l'expédition</Checkbox>
          <Checkbox value="liv">À la livraison</Checkbox>
        </CheckboxGroup>
        <TextArea label="Notes" maxLength={500} />
        <Checkbox isRequired>Le client a accepté les conditions de vente</Checkbox>
      </Section>
      <Section title="Réglage immédiat" help="S'applique sans attendre l'envoi (D-137).">
        <Switch description="Joint la facture à chaque e-mail.">Facture en PDF jointe</Switch>
      </Section>
      <div className="sticky bottom-0 flex items-center gap-2 border-t border-line bg-surface py-2.5">
        <output className="mr-auto text-sm text-fg-3">{state}</output>
        <button type="submit">Créer la commande</button>
      </div>
    </form>
  );
}

export const Formulaire: Story = { render: () => <Commande /> };

/** Envoi : chaque champ obligatoire vide montre son erreur ; le focus va au premier (D-132). */
export const Envoi: Story = {
  render: () => <Commande />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Créer la commande" }));
    await waitFor(() => expect(c.getByRole("textbox", { name: "Raison sociale" })).toHaveFocus());
    await expect(c.getAllByText("Choisissez une option.")).toHaveLength(2);
    await expect(c.getByText("Cochez cette case pour continuer.")).toBeVisible();
    await expect(c.getByText("Corrigez les champs signalés")).toBeVisible();
  },
};
