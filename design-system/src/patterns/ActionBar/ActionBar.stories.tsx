import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ActionBar, arrangeActions, type Action, type ActionZone } from "./ActionBar";
import { ArrowDown, Check, ListDetail, Plus, Search, Settings, X } from "../../icons";

const meta: Meta<typeof ActionBar> = {
  title: "Patterns/ActionBar",
  component: ActionBar,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof ActionBar>;
const body = () => within(document.body);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* Icônes internes de Socle, pour la démo seulement : une app passe ses propres icônes (D-011). */
const pageActions = (): Action[] => [
  { id: "new", label: "Nouveau document", icon: <Plus />, primary: true, shortcut: "Mod+N", onPress: fn() },
  { id: "export", label: "Exporter en CSV", icon: <ArrowDown />, onPress: () => wait(300) },
  { id: "search", label: "Rechercher", icon: <Search />, shortcut: "Mod+F", onPress: fn() },
  { id: "settings", label: "Réglages de la liste", icon: <Settings />, onPress: fn() },
  { id: "import", label: "Importer un fichier…", onPress: fn() },
  {
    id: "purge",
    label: "Supprimer les archivés",
    danger: true,
    confirm: { title: "Supprimer les 12 documents archivés ?", message: "Cette action est définitive." },
    onPress: fn(),
  },
];

/** Mêmes actions, l'action principale sans icône : à texte dans la barre du haut (D-220). */
const textPrimary = (): Action[] => pageActions().map((a) => (a.primary ? { id: a.id, label: a.label, primary: true, onPress: a.onPress } : a));

const rowActions = (name: string): Action[] => [
  { id: "edit", label: "Modifier", icon: <ListDetail />, onPress: fn() },
  { id: "done", label: "Terminer", icon: <Check />, onPress: fn() },
  { id: "dup", label: "Dupliquer", onPress: fn() },
  { id: "del", label: "Supprimer", icon: <X />, danger: true, confirm: `Supprimer le document « ${name} » ?`, onPress: fn() },
];

const Row = ({ zone, label, actions, subject }: { zone: ActionZone; label: string; actions: Action[]; subject?: string }) => (
  <div className="flex min-h-(--bar-h) items-center gap-3 border-b border-line">
    <code className="w-20 shrink-0 text-sm text-fg-3">{zone}</code>
    <span className="min-w-0 flex-1 truncate">{label}</span>
    <ActionBar zone={zone} actions={actions} {...(subject ? { subject } : {})} />
  </div>
);

/** Les mêmes données, rangées selon chaque zone (D-111 à D-114). */
export const Zones: Story = {
  render: () => (
    <div className="max-w-3xl">
      <Row zone="topbar" label="Barre du haut : l'action principale à icône reste une icône" actions={pageActions()} />
      <Row zone="topbar" label="Barre du haut : l'action principale sans icône est à texte" actions={textPrimary()} />
      <Row zone="header" label="En-tête : 3 icônes, « … », bouton principal" actions={pageActions()} />
      <Row zone="toolbar" label="Barre d'outils : 2 sélectionnés" actions={pageActions()} />
      <Row zone="section" label="Section : 2 icônes, bouton secondaire" actions={pageActions()} />
      <Row zone="row" label="Rapport trimestriel des ventes" actions={rowActions("Rapport trimestriel des ventes")} subject="Rapport trimestriel des ventes" />
      <div className="grid place-items-center gap-2 py-8 text-fg-2">
        <span>Aucun document</span>
        <ActionBar zone="empty" actions={pageActions()} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const [topbar, topbarText, header, toolbar, section, row] = c.getAllByRole("group");
    // Barre du haut : aucune action à texte, l'action principale est la première icône (D-112).
    const topButtons = within(topbar!).getAllByRole("button");
    await expect(topButtons.map((b) => b.getAttribute("aria-label"))).toEqual(["Nouveau document", "Exporter en CSV", "Rechercher", "Plus d'actions"]);
    // Barre du haut, principale sans icône : bouton à texte tout à droite (D-220).
    const textButtons = within(topbarText!).getAllByRole("button");
    await expect(textButtons.at(-1)).toHaveTextContent("Nouveau document");
    await expect(textButtons.at(-2)).toHaveAccessibleName("Plus d'actions");
    // En-tête : icônes, « … », puis le bouton principal à droite (D-111).
    const headerButtons = within(header!).getAllByRole("button");
    await expect(headerButtons.at(-1)).toHaveTextContent("Nouveau document");
    await expect(headerButtons.at(-2)).toHaveAccessibleName("Plus d'actions");
    await expect(headerButtons).toHaveLength(5);
    await expect(within(toolbar!).getAllByRole("button")).toHaveLength(5);
    // Section : deux icônes au plus (D-113).
    await expect(within(section!).getAllByRole("button")).toHaveLength(4);
    // Ligne : une icône, puis « … » (D-114) ; le groupe porte l'objet.
    await expect(row).toHaveAccessibleName("Actions sur Rapport trimestriel des ventes");
    await expect(within(row!).getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual(["Modifier", "Plus d'actions"]);
    // État vide : le bouton principal seul.
    await expect(c.getAllByRole("button", { name: "Nouveau document" })).toHaveLength(6);
  },
};

/** La règle seule : principale unique, danger jamais en icône, petit écran (D-111, D-117). */
export const Regle: Story = {
  render: () => <p className="text-fg-2">Test de la fonction <code>arrangeActions</code>.</p>,
  play: async () => {
    const ids = (list: Action[]) => list.map((a) => a.id);
    const actions: Action[] = [
      { id: "a", label: "A", icon: <Plus />, primary: true, onPress: fn() },
      { id: "b", label: "B", icon: <Plus />, primary: true, onPress: fn() },
      { id: "d", label: "D", icon: <X />, danger: true, primary: true, onPress: fn() },
      { id: "h", label: "H", icon: <Plus />, isHidden: true, onPress: fn() },
      { id: "t", label: "T", onPress: fn() },
    ];
    const header = arrangeActions(actions, "header");
    await expect(header.primary?.id).toBe("a");
    await expect(ids(header.icons)).toEqual(["b"]);
    await expect(ids(header.menu)).toEqual(["t"]);
    await expect(ids(header.danger)).toEqual(["d"]);
    // Petit écran : les icônes passent dans « … », la principale reste (D-117).
    const narrow = arrangeActions(actions, "header", { narrow: true });
    await expect(narrow.primary?.id).toBe("a");
    await expect(ids(narrow.icons)).toEqual([]);
    await expect(ids(narrow.menu)).toEqual(["b", "t"]);
    // Barre du haut étroite : la principale reste une icône.
    await expect(ids(arrangeActions(actions, "topbar", { narrow: true }).icons)).toEqual(["a"]);
    // Principale sans icône en barre du haut : bouton à texte (D-220).
    const noIcon = arrangeActions([{ id: "p", label: "P", primary: true, onPress: fn() }, ...actions.slice(1)], "topbar");
    await expect(noIcon.primary?.id).toBe("p");
    await expect(ids(noIcon.icons)).toEqual(["b"]);
    await expect(ids(noIcon.menu)).toEqual(["t"]);
    // Place qui manque (D-221) : les icônes partent depuis la fin, avant les autres entrées de « … » ;
    // puis le bouton à texte passe en tête de « … ».
    const many: Action[] = [
      { id: "p", label: "P", primary: true, onPress: fn() },
      { id: "i1", label: "I1", icon: <Plus />, onPress: fn() },
      { id: "i2", label: "I2", icon: <Plus />, onPress: fn() },
      { id: "t", label: "T", onPress: fn() },
    ];
    const one = arrangeActions(many, "topbar", { fit: { icons: 1, primary: true } });
    await expect(ids(one.icons)).toEqual(["i1"]);
    await expect(ids(one.menu)).toEqual(["i2", "t"]);
    await expect(one.primary?.id).toBe("p");
    const none = arrangeActions(many, "topbar", { fit: { icons: 0, primary: false } });
    await expect(none.primary).toBeUndefined();
    await expect(ids(none.menu)).toEqual(["p", "i1", "i2", "t"]);
    // Ligne avec deux actions à icône seulement : deux icônes, sans « … » (D-114).
    const two = arrangeActions(actions.slice(0, 2), "row");
    await expect(two.primary).toBeUndefined();
    await expect(ids(two.icons)).toEqual(["a", "b"]);
    await expect(two.menu.length + two.danger.length).toBe(0);
    // État vide : la principale seule.
    await expect(arrangeActions(actions, "empty")).toEqual({ primary: actions[0], icons: [], menu: [], danger: [] });
  },
};

/** `isHidden` retire l'action ; `isDisabled` la garde à sa place. */
export const Etats: Story = {
  render: () => (
    <ActionBar
      zone="header"
      actions={[
        { id: "new", label: "Nouveau document", primary: true, isDisabled: true, onPress: fn() },
        { id: "export", label: "Exporter en CSV", icon: <ArrowDown />, isDisabled: true, onPress: fn() },
        { id: "done", label: "Terminer", icon: <Check />, isHidden: true, onPress: fn() },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("button", { name: "Exporter en CSV" })).toBeDisabled();
    await expect(c.getByRole("button", { name: "Nouveau document" })).toBeDisabled();
    await expect(c.queryByRole("button", { name: "Terminer" })).toBeNull();
  },
};

/** « … » : actions sans icône et en trop, un trait, puis les actions danger en rouge (D-115). */
export const MenuPlusDActions: Story = {
  name: "Menu",
  render: () => <ActionBar zone="header" actions={pageActions()} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Plus d'actions" }));
    const menu = await waitFor(() => body().getByRole("menu"));
    const items = within(menu).getAllByRole("menuitem");
    await expect(items.map((i) => i.textContent)).toEqual(["Importer un fichier…", "Supprimer les archivés"]);
    await expect(within(menu).getAllByRole("separator")).toHaveLength(1);
    await expect(items.at(-1)!.className).toMatch(/text-danger/);
    await userEvent.keyboard("{Escape}");
  },
};

/** Une action danger demande confirmation ; « Annuler » n'appelle pas `onPress` (D-115). */
export const Confirmation: Story = {
  render: (args) => <ActionBar {...args} />,
  args: {
    zone: "row",
    subject: "Rapport trimestriel",
    actions: [
      { id: "edit", label: "Modifier", icon: <ListDetail />, onPress: fn() },
      { id: "del", label: "Supprimer", danger: true, confirm: "Supprimer le document « Rapport trimestriel » ?", onPress: fn() },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const del = args.actions[1]!;
    const more = within(canvasElement).getByRole("button", { name: "Plus d'actions" });
    // Annuler : la modale de confirmation de Socle (D-127) se ferme, l'action ne part pas.
    await userEvent.click(more);
    await userEvent.click(await waitFor(() => body().getByRole("menuitem", { name: "Supprimer" })));
    const dialog = await waitFor(() => body().getByRole("alertdialog"));
    await expect(within(dialog).getByText("Supprimer le document « Rapport trimestriel » ?")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Annuler" }));
    await waitFor(() => expect(body().queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(del.onPress).not.toHaveBeenCalled();
    // Confirmer : l'action part une fois.
    await userEvent.click(more);
    await userEvent.click(await waitFor(() => body().getByRole("menuitem", { name: "Supprimer" })));
    const again = await waitFor(() => body().getByRole("alertdialog"));
    await userEvent.click(within(again).getByRole("button", { name: "Supprimer" }));
    await waitFor(() => expect(del.onPress).toHaveBeenCalledTimes(1));
  },
};

/** Une promesse met le bouton en attente ; un second clic est ignoré ; `onDone` ensuite (D-116, D-118). */
export const Attente: Story = {
  render: (args) => <ActionBar {...args} />,
  args: {
    zone: "header",
    onDone: fn(),
    actions: [
      { id: "export", label: "Exporter en CSV", icon: <ArrowDown />, onPress: fn(() => wait(400)) },
      { id: "save", label: "Publier", primary: true, onPress: fn(() => wait(400)) },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const exportBtn = c.getByRole("button", { name: "Exporter en CSV" });
    await userEvent.click(exportBtn);
    await waitFor(() => expect(exportBtn).toHaveAttribute("data-pending", "true"));
    await userEvent.click(exportBtn);
    await expect(args.actions[0]!.onPress).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(exportBtn).not.toHaveAttribute("data-pending", "true"), { timeout: 2000 });
    await expect(args.onDone).toHaveBeenCalledWith(args.actions[0]);
    const publish = c.getByRole("button", { name: /Publier/ });
    await userEvent.click(publish);
    await waitFor(() => expect(publish).toHaveAttribute("data-pending", "true"));
    await waitFor(() => expect(args.onDone).toHaveBeenCalledTimes(2), { timeout: 2000 });
  },
};

/** Une erreur, levée ou rejetée, est rendue à `onError` ; l'action redevient disponible (D-116). */
export const Erreur: Story = {
  render: (args) => <ActionBar {...args} />,
  args: {
    zone: "section",
    onError: fn(),
    onDone: fn(),
    actions: [
      { id: "sync", label: "Synchroniser", icon: <ArrowDown />, onPress: () => wait(100).then(() => Promise.reject(new Error("Service indisponible"))) },
      { id: "add", label: "Ajouter", primary: true, onPress: () => { throw new Error("Refusé"); } },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Synchroniser" }));
    await waitFor(() => expect(args.onError).toHaveBeenCalledWith(args.actions[0], expect.objectContaining({ message: "Service indisponible" })));
    await waitFor(() => expect(c.getByRole("button", { name: "Synchroniser" })).not.toHaveAttribute("data-pending", "true"));
    await userEvent.click(c.getByRole("button", { name: "Ajouter" }));
    await expect(args.onError).toHaveBeenCalledWith(args.actions[1], expect.objectContaining({ message: "Refusé" }));
    await expect(args.onDone).not.toHaveBeenCalled();
  },
};

/** Sous 640 px, les icônes de l'en-tête passent dans « … » ; l'action principale reste (D-117). */
export const PetitEcran: Story = {
  render: () => <ActionBar zone="header" actions={pageActions()} />,
  globals: { viewport: { value: "mobile1" } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("button", { name: /Nouveau document/ })).toBeVisible();
    if (window.matchMedia("(max-width: 640px)").matches) {
      await expect(c.queryByRole("button", { name: "Exporter en CSV" })).toBeNull();
      await userEvent.click(c.getByRole("button", { name: "Plus d'actions" }));
      await waitFor(() => expect(body().getByRole("menuitem", { name: "Exporter en CSV" })).toBeInTheDocument());
      await userEvent.keyboard("{Escape}");
    }
  },
};
