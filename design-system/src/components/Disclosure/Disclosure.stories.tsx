import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Disclosure } from "./Disclosure";
import { DetailPanel, PropertyRow } from "../../patterns/DetailPanel/DetailPanel";

const meta: Meta<typeof Disclosure> = {
  title: "Composants/Disclosure",
  component: Disclosure,
  parameters: { layout: "padded" },
  args: { title: "Options avancées", children: <p className="m-0 text-fg-2">Délai d'expiration, nombre d'essais, journal détaillé.</p> },
};
export default meta;
type Story = StoryObj<typeof Disclosure>;

/** Replié par défaut ; clic, Entrée ou Espace ; contenu créé à l'ouverture (D-320). */
export const Repli: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const title = c.getByRole("button", { name: "Options avancées" });
    await expect(title).toHaveAttribute("aria-expanded", "false");
    await expect(c.queryByText(/Délai d'expiration/)).toBeNull();
    await userEvent.click(title);
    await expect(title).toHaveAttribute("aria-expanded", "true");
    await expect(c.getByRole("group", { name: "Options avancées" })).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect(c.queryByText(/Délai d'expiration/)).toBeNull();
    await userEvent.keyboard(" ");
    await expect(c.getByText(/Délai d'expiration/)).toBeVisible();
  },
};

/** Déplié au premier affichage. */
export const Deplie: Story = { args: { defaultExpanded: true } };

/** Avec `id`, l'état est mémorisé : un second bloc au même `id` le reprend. */
export const Memorise: Story = {
  render: (args) => {
    const [n, setN] = useState(0);
    return (
      <div className="flex flex-col gap-3">
        <Disclosure key={n} {...args} id="story-memorise" />
        <button type="button" onClick={() => setN(n + 1)}>Réafficher</button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    localStorage.removeItem("storybook:disclosure");
    await userEvent.click(c.getByRole("button", { name: "Réafficher" }));
    await userEvent.click(c.getByRole("button", { name: "Options avancées" }));
    await userEvent.click(c.getByRole("button", { name: "Réafficher" }));
    await expect(c.getByRole("button", { name: "Options avancées" })).toHaveAttribute("aria-expanded", "true");
    localStorage.removeItem("storybook:disclosure");
  },
};

/** Ouverture pilotée par l'app. */
export const Pilote: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    const spy = fn();
    return <Disclosure {...args} isExpanded={open} onExpandedChange={(v) => { spy(v); setOpen(v); }} />;
  },
};

/** Dans une section du panneau de détail : même titre que la section (D-321). */
export const DansLePanneau: Story = {
  render: () => (
    <div className="w-[300px] border border-line">
      <DetailPanel>
        <DetailPanel.Section id="story-props" title="Propriétés">
          <PropertyRow label="Responsable" value="Camille Martin" />
          <PropertyRow label="Échéance" value="15 mars" />
          <Disclosure title="Blocs repliés">
            <dl className="m-0">
              <PropertyRow label="Identifiant" value="PRJ-0142" />
              <PropertyRow label="Créé le" value="3 janvier" />
            </dl>
          </Disclosure>
        </DetailPanel.Section>
      </DetailPanel>
    </div>
  ),
};
