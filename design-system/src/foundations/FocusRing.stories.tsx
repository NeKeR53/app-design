import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Page } from "../templates/Page/Page";
import { SearchInput } from "../components/SearchInput/SearchInput";
import { Select } from "../components/Select/Select";
import { Button } from "../components/Button/Button";
import { IconButton } from "../components/IconButton/IconButton";
import { TextInput } from "../components/TextInput/TextInput";
import { TextArea } from "../components/TextArea/TextArea";
import { NumberField } from "../components/NumberField/NumberField";
import { ComboBox } from "../components/ComboBox/ComboBox";
import { DatePicker } from "../components/DatePicker/DatePicker";
import { Checkbox } from "../components/Checkbox/Checkbox";
import { Toggle } from "../components/Toggle/Toggle";
import { RadioButtonGroup } from "../components/RadioButtonGroup/RadioButtonGroup";
import { Slider } from "../components/Slider/Slider";
import { SegmentedControl } from "../components/SegmentedControl/SegmentedControl";
import { Link } from "../components/Link/Link";
import { Tag, TagGroup } from "../components/Tag/Tag";
import { Code } from "../components/Code/Code";
import { Table, type TableColumn } from "../components/Table/Table";
import { MoreHorizontal } from "../icons";

/*
 * Anneau de focus (D-425) : un seul anneau, entier, aux tokens --focus-w et --focus, partout.
 * Chaque story parcourt ses contrôles au clavier et mesure l'anneau de chacun.
 */
const meta: Meta = {
  title: "Fondations/Anneau de focus",
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

type Ring = { el: Element; clipped: string[] };

/** Contrôle masqué (champ natif d'une case, bouton réservé aux lecteurs d'écran) : son anneau ne se voit pas. */
function hidden(el: Element) {
  const r = el.getBoundingClientRect();
  return r.width <= 2 || r.height <= 2;
}

/** Anneaux visibles dans la story, et les côtés qu'un conteneur qui défile rogne. */
function rings(root: HTMLElement): Ring[] {
  const out: Ring[] = [];
  for (const el of root.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.outlineStyle === "none" || parseFloat(cs.outlineWidth) === 0 || hidden(el)) continue;
    const r = el.getBoundingClientRect();
    const g = parseFloat(cs.outlineWidth) + parseFloat(cs.outlineOffset);
    const ring = { l: r.left - g, t: r.top - g, r: r.right + g, b: r.bottom + g };
    const clipped = new Set<string>();
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ps = getComputedStyle(p);
      if (ps.overflowX === "visible" && ps.overflowY === "visible") continue;
      const pr = p.getBoundingClientRect();
      const c = { l: pr.left + parseFloat(ps.borderLeftWidth), t: pr.top + parseFloat(ps.borderTopWidth), r: pr.right - parseFloat(ps.borderRightWidth), b: pr.bottom - parseFloat(ps.borderBottomWidth) };
      if (ring.l < c.l - 0.5) clipped.add("gauche");
      if (ring.r > c.r + 0.5) clipped.add("droite");
      if (ring.t < c.t - 0.5) clipped.add("haut");
      if (ring.b > c.b + 0.5) clipped.add("bas");
    }
    // Rogné des quatre côtés : champ natif masqué (case, bouton radio), son anneau ne se voit pas.
    if (clipped.size === 4) continue;
    out.push({ el, clipped: [...clipped] });
  }
  return out;
}

const focusColor = () => {
  const probe = document.createElement("i");
  probe.style.color = "var(--focus)";
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
};

/** Le contrôle qui a le focus a un seul anneau, entier, de 2 px, à la couleur --focus. */
async function expectOneRing(root: HTMLElement) {
  const label = (el: Element) => `${el.tagName.toLowerCase()} « ${(el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 30)} »`;
  // Laisse à React Aria le temps de poser ses attributs ; le message nomme les anneaux trouvés.
  await waitFor(() => expect(rings(root).map((r) => label(r.el)).length === 1 ? "un anneau" : rings(root).map((r) => label(r.el)).join(" + ") || "aucun anneau").toBe("un anneau"));
  const [ring] = rings(root) as [Ring];
  const name = label(ring.el);
  const cs = getComputedStyle(ring.el);
  await expect({ name, clipped: ring.clipped }).toEqual({ name, clipped: [] });
  await expect({ name, width: cs.outlineWidth, color: cs.outlineColor }).toEqual({ name, width: "2px", color: focusColor() });
}

/** Tabule `stops` fois et vérifie l'anneau à chaque arrêt. */
async function tabThrough(root: HTMLElement, stops: number) {
  for (let i = 0; i < stops; i++) {
    await userEvent.tab();
    await expectOneRing(root);
  }
}

const periods = [
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
];

/** Le défaut d'origine : une barre de recherche dans la barre d'outils de Page, qui défile à l'horizontale. */
export const DansUneBarreDOutils: Story = {
  render: () => (
    <div style={{ height: 320 }} className="border-b border-line">
      <Page
        toolbar={
          <>
            <SearchInput label="les demandes" onChange={() => {}} />
            <Select label="Période" hideLabel options={periods} defaultValue="month" width="sm" />
            <Button>Filtrer</Button>
          </>
        }
        actions={[{ id: "more", label: "Plus d'actions", icon: <MoreHorizontal />, onPress: () => {} }]}
        actionsLabel="Demandes"
      >
        <p className="m-0 text-fg-2">Contenu de la page.</p>
      </Page>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await tabThrough(canvasElement, 3);
    await expect(within(canvasElement).getByRole("combobox", { name: /Rechercher dans les demandes/ })).not.toHaveFocus();
  },
};

/** Barre étroite : le contrôle atteint au clavier défile jusqu'à la vue, son anneau reste entier. */
export const BarreQuiDefile: Story = {
  render: () => (
    <div style={{ height: 200, width: 420 }} className="border-b border-line">
      <Page
        toolbar={
          <>
            <SearchInput label="les demandes" onChange={() => {}} />
            <Select label="Période" hideLabel options={periods} defaultValue="month" width="sm" />
            <Button>Filtrer</Button>
          </>
        }
      >
        <p className="m-0 text-fg-2">Contenu.</p>
      </Page>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await tabThrough(canvasElement, 3);
  },
};

const ROWS = [
  { id: "1", name: "Budget 2027", owner: "Louis Bernard" },
  { id: "2", name: "Contrat cadre", owner: "Camille Martin" },
];
const COLS: TableColumn[] = [
  { id: "name", label: "Nom" },
  { id: "owner", label: "Responsable" },
];

/** Tous les contrôles, au clavier : un seul anneau, entier, partout. */
export const TousLesControles: Story = {
  render: () => (
    <div className="flex max-w-[760px] flex-col gap-4 p-6">
      <div className="flex flex-wrap items-end gap-3">
        <TextInput label="Nom" width="md" />
        <NumberField label="Quantité" />
        <DatePicker label="Échéance" />
        <ComboBox label="Pays" items={[{ id: "fr", label: "France" }, { id: "be", label: "Belgique" }]} />
        <Select label="Période" options={periods} defaultValue="month" width="sm" />
      </div>
      <TextArea label="Notes" />
      <div className="flex flex-wrap items-center gap-4">
        <Checkbox>Recevoir les alertes</Checkbox>
        <Toggle>Mode compact</Toggle>
        <SegmentedControl label="Affichage" options={[{ value: "l", label: "Liste" }, { value: "g", label: "Grille" }]} />
      </div>
      <RadioButtonGroup label="Livraison">
        <RadioButtonGroup.Option value="std">Standard</RadioButtonGroup.Option>
        <RadioButtonGroup.Option value="exp">Express</RadioButtonGroup.Option>
      </RadioButtonGroup>
      <Slider label="Volume" minValue={0} maxValue={10} defaultValue={4} />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary">Enregistrer</Button>
        <Button>Annuler</Button>
        <IconButton icon={<MoreHorizontal />} label="Plus d'actions" />
        <Link href="#aide">Aide</Link>
        <TagGroup label="Étiquettes">
          <Tag id="urgent">Urgent</Tag>
          <Tag id="client">Client</Tag>
        </TagGroup>
      </div>
      <Code block>{"pnpm install\npnpm build"}</Code>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Nom, Quantité, Échéance (jour, mois, année, calendrier), Pays (champ, bouton), Période, Notes,
    // case, interrupteur, affichage, livraison, volume, deux boutons, « … », Aide, étiquettes, code.
    await tabThrough(canvasElement, 20);
  },
};

/** Tableau : la ligne, puis la cellule atteinte aux flèches, ont l'anneau Socle, tracé dedans. */
export const CellulesDeTableau: Story = {
  render: () => (
    <div style={{ height: 220 }} className="flex flex-col p-6">
      <Table label="Documents" columns={COLS} rows={ROWS} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expectOneRing(canvasElement);
    await userEvent.keyboard("{ArrowRight}");
    await expectOneRing(canvasElement);
    await expect(rings(canvasElement)[0]?.el.getAttribute("role")).toMatch(/gridcell|rowheader/);
  },
};

/** À la souris, un bouton ne montre pas d'anneau (règle du socle) ; un champ texte le montre. */
export const DiscretALaSouris: Story = {
  render: () => (
    <div className="flex items-end gap-3 p-6">
      <Button>Enregistrer</Button>
      <TextInput label="Nom" width="md" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Enregistrer" }));
    await expect(rings(canvasElement)).toHaveLength(0);
    await userEvent.click(c.getByRole("textbox", { name: /^Nom/ }));
    await expectOneRing(canvasElement);
  },
};
