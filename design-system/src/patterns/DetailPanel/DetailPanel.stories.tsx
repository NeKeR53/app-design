import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DetailPanel } from "./DetailPanel";
import { Copy } from "../../../.storybook/story-icons";

const meta: Meta<typeof DetailPanel> = {
  title: "Patterns/DetailPanel",
  component: DetailPanel,
  parameters: { layout: "padded" },
  beforeEach: () => {
    for (const k of Object.keys(localStorage)) if (k.startsWith("storybook:detail")) localStorage.removeItem(k);
  },
};
export default meta;
type Story = StoryObj<typeof DetailPanel>;

export function DemoDetail() {
  const [pub, setPub] = useState(false);
  return (
    <DetailPanel>
      <DetailPanel.Section id="props" title="Propriétés">
        <DetailPanel.Row label="Statut" value="En relecture" />
        <DetailPanel.Row label="Responsable" value="Camille Martin" />
        <DetailPanel.Row label="Échéance" value="" action={{ type: "link", label: "Modifier", onPress: () => {} }} />
        <DetailPanel.Row label="Étiquettes" value="Ventes, Région Sud-Ouest, Trimestriel" />
      </DetailPanel.Section>
      <DetailPanel.Section id="share" title="Partage">
        <DetailPanel.Row label="Lien public" value={pub ? "Activé" : "Désactivé"} action={{ type: "switch", isSelected: pub, onChange: setPub }} />
        <DetailPanel.Row label="Identifiant" value="DOC-2026-0412" icon={<Copy />} action={{ type: "icon", icon: <Copy />, label: "Copier l'identifiant", onPress: () => {} }} />
        <DetailPanel.Row label="Accès" value="3 personnes" />
      </DetailPanel.Section>
      <DetailPanel.Section id="files" title="Fichiers" footer={<button className="h-[26px] rounded-md border-0 bg-field px-2.5 text-sm text-fg">Exporter l'historique</button>}>
        <DetailPanel.Row label="Pièces jointes" value="2 fichiers" details={<ul className="m-0 list-none p-0"><li>synthese.pdf — 1,8 Mo</li><li>annexes.xlsx — 2,4 Mo</li></ul>} />
      </DetailPanel.Section>
    </DetailPanel>
  );
}

export const ParDefaut: Story = { render: () => <div className="w-[300px] border border-line"><DemoDetail /></div> };

export const Vide: Story = { render: () => <div className="w-[300px] border border-line"><DetailPanel /></div> };

/** Un réglage s'applique tout de suite (D-007) ; valeur vide « — » ; icônes alignées par section (D-057). */
export const ActionImmediate: Story = {
  render: ParDefaut.render!,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("switch", { name: "Lien public" }));
    await expect(c.getByText("Activé")).toBeVisible();
    await expect(c.getByText("—")).toBeVisible();
    const lab = (t: string) => c.getByText(t, { selector: "dt" }).getBoundingClientRect().left;
    await expect(lab("Accès")).toBe(lab("Identifiant"));
  },
};

/** Sections repliables, état mémorisé (D-061). */
export const Sections: Story = {
  render: ParDefaut.render!,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Propriétés/ }));
    await waitFor(() => expect(c.queryByText("Camille Martin")).toBeNull());
    await expect(localStorage.getItem("storybook:detail:sections")).toContain('"props":true');
  },
};

/** Ligne qui s'ouvre sur place (D-060). */
export const LigneDepliable: Story = {
  render: ParDefaut.render!,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const row = c.getByRole("button", { name: /Pièces jointes/ });
    await expect(row).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(row);
    await expect(row).toHaveAttribute("aria-expanded", "true");
    await expect(c.getByText(/synthese.pdf/)).toBeVisible();
  },
};
