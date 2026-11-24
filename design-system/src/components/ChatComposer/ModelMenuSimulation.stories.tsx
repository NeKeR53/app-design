/*
 * Simulation de la question Q3 (docs/validation/components/Chat-v1.html) : choix du modèle
 * dans la rangée d'options. Deux versions à essayer avant de décider :
 *  A — un DropdownMenu (le composant actuel, sans ajout) ;
 *  B — un Popover avec des champs (comme l'app d'origine).
 * Aucune décision n'est prise : ce fichier sert seulement à comparer.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { Key } from "react-aria-components";
import { ChatComposer } from "./ChatComposer";
import { ChatOptionButton, ChatOptions } from "./ChatOptions";
import { DropdownMenu } from "../DropdownMenu/DropdownMenu";
import { Popover } from "../Popover/Popover";
import { Select } from "../Select/Select";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import { Toggle } from "../Toggle/Toggle";
import { UsageRing } from "../UsageRing/UsageRing";
import { UsageMeter } from "../UsageRing/UsageMeter";

const meta: Meta = {
  title: "Simulations/Menu du modèle (Q3)",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

const MODELS = [
  { id: "advanced", label: "Modèle avancé" },
  { id: "fast", label: "Modèle rapide" },
  { id: "light", label: "Modèle léger" },
];
const EFFORTS = ["Faible", "Moyen", "Élevé", "Maximal"];

function Frame({ menu }: { menu: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-1" style={{ paddingTop: 360 }}>
      <ChatComposer label="Message à l'agent" placeholder="Que puis-je faire pour vous ?" onSubmit={() => {}} />
      <ChatOptions>
        {menu}
        <ChatOptionButton label="Autonomie complète" />
        <UsageRing value={72} title="Limites d'usage" action={{ label: "Tout voir", href: "#" }}>
          <UsageMeter label="Limite sur 5 h" value={79} resetsAt="mar. 00:10" />
          <UsageMeter label="Semaine · tous modèles" value={69} resetsAt="ven. 06:00" />
        </UsageRing>
      </ChatOptions>
    </div>
  );
}

/**
 * Version A : DropdownMenu tel qu'il existe. Modèle coché, raccourcis 2 et 3, sous-menu « Effort »,
 * « Autres modèles », section « Mode rapide » en case cochée.
 * Ce qui manque pour copier la capture : la pastille « Par défaut » (ici dans le libellé),
 * la valeur devant le chevron (ici « Effort · Moyen ») et un vrai interrupteur dans le menu.
 */
function MenuVersion() {
  const [model, setModel] = useState<Key>("advanced");
  const [effort, setEffort] = useState<Key>("Moyen");
  const [fast, setFast] = useState(false);
  const current = MODELS.find((x) => x.id === model)!;
  return (
    <DropdownMenu label="Choix du modèle" placement="top end" trigger={<ChatOptionButton label={current.label} value={String(effort)} />}>
      <DropdownMenu.Section selectionMode="single" selectedKeys={[model]} onSelectionChange={(k) => setModel([...k][0] ?? model)}>
        <DropdownMenu.Item id="advanced" label="Modèle avancé · Par défaut" />
        <DropdownMenu.Item id="fast" label="Modèle rapide" shortcut="2" />
        <DropdownMenu.Item id="light" label="Modèle léger" shortcut="3" />
      </DropdownMenu.Section>
      <DropdownMenu.Separator />
      <DropdownMenu.Submenu label={`Effort · ${String(effort)}`}>
        <DropdownMenu.Section selectionMode="single" selectedKeys={[effort]} onSelectionChange={(k) => setEffort([...k][0] ?? effort)}>
          {EFFORTS.map((e) => (
            <DropdownMenu.Item key={e} id={e} label={e} />
          ))}
        </DropdownMenu.Section>
      </DropdownMenu.Submenu>
      <DropdownMenu.Submenu label="Autres modèles">
        <DropdownMenu.Item label="Modèle de l'an dernier" />
        <DropdownMenu.Item label="Modèle expérimental" />
      </DropdownMenu.Submenu>
      <DropdownMenu.Separator />
      <DropdownMenu.Section title="Mode rapide" selectionMode="multiple" selectedKeys={fast ? ["fast-mode"] : []} onSelectionChange={(k) => setFast(k.has("fast-mode"))}>
        <DropdownMenu.Item id="fast-mode" label="Activer le mode rapide" />
      </DropdownMenu.Section>
    </DropdownMenu>
  );
}

/** Version B : un volet avec des champs, comme l'app d'origine : liste des modèles, effort en contrôle segmenté, interrupteur. */
function PanelVersion() {
  const [model, setModel] = useState<string>("advanced");
  const [effort, setEffort] = useState("Moyen");
  const [fast, setFast] = useState(false);
  const current = MODELS.find((x) => x.id === model)!;
  return (
    <Popover label="Choix du modèle" title="Modèle" trigger={<ChatOptionButton label={current.label} value={effort} />}>
      <div className="flex flex-col gap-4">
        <Select label="Modèle" isRequired options={MODELS.map((x) => ({ id: x.id, label: x.label }))} value={model} onChange={(v) => v && setModel(String(v))} />
        <SegmentedControl label="Effort" options={EFFORTS.map((e) => ({ value: e, label: e }))} value={effort} onChange={(v) => setEffort(String(v))} />
        <Toggle isSelected={fast} onChange={setFast}>
          Mode rapide
        </Toggle>
      </div>
    </Popover>
  );
}

/** Version A : menu. Ouvrez « Modèle avancé Moyen » sous la zone de saisie. */
export const A_Menu: Story = { name: "A — Menu", render: () => <Frame menu={<MenuVersion />} /> };

/** Version B : volet de champs. Ouvrez « Modèle avancé Moyen » sous la zone de saisie. */
export const B_Volet: Story = { name: "B — Volet de champs", render: () => <Frame menu={<PanelVersion />} /> };
