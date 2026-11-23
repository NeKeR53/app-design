import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Composants/Card",
  component: Card,
  parameters: { layout: "padded" },
  decorators: [(S) => <div className="w-80">{S()}</div>],
};
export default meta;
type Story = StoryObj<typeof Card>;

const body = () => within(document.body);

/** Surface, trait 1 px `--line`, rayon 12 px, pas d'ombre (D-361, D-001, D-040). Titre en `h3` par défaut. */
export const ParDefaut: Story = {
  render: () => (
    <Card title="Atelier de Lyon">
      <p className="m-0">Trois postes ouverts, livraison le jeudi.</p>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { level: 3, name: "Atelier de Lyon" })).toBeVisible();
    const card = canvasElement.querySelector<HTMLElement>(".rounded-lg")!;
    const s = getComputedStyle(card);
    await expect(s.borderTopLeftRadius).toBe("12px");
    await expect(s.borderTopWidth).toBe("1px");
    await expect(s.boxShadow).toBe("none");
    await expect(c.queryByRole("link")).toBeNull();
  },
};

/** `headingLevel` : le titre suit la hiérarchie de la page. */
export const NiveauDeTitre: Story = {
  render: () => <Card title="Résumé" headingLevel={2}>Contenu</Card>,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("heading", { level: 2, name: "Résumé" })).toBeVisible();
  },
};

/** Pied d'actions (zone `section`) : action principale en bouton `sm`, le reste dans « … ». */
export const AvecActions: Story = {
  render: () => (
    <Card
      title="Export mensuel"
      actions={[
        { id: "open", label: "Ouvrir", onPress: fn(), primary: true },
        { id: "rename", label: "Renommer", onPress: fn() },
      ]}
    >
      Généré le 2 novembre.
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("button", { name: "Ouvrir" })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Plus d'actions" }));
    await waitFor(() => expect(body().getByRole("menuitem", { name: "Renommer" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
  },
};

/** Chiffre clé : libellé, valeur à chiffres fixes, évolution (icône et texte, jamais la couleur seule). */
export const Metrique: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-2">
      <Card variant="metric" label="Commandes" value="1 284" delta={{ text: "+12 % sur 30 jours", tone: "positive" }} />
      <Card variant="metric" label="En retard" value="37" delta={{ text: "+5 depuis hier", tone: "negative", trend: "up" }} />
      <Card variant="metric" label="Chiffre d’affaires" value="86 k€" delta={{ text: "stable" }} />
    </div>
  ),
  decorators: [(S) => <div className="w-[640px]">{S()}</div>],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { name: "Commandes" })).toBeVisible();
    const value = c.getByText("1 284");
    await expect(getComputedStyle(value).fontVariantNumeric).toContain("tabular-nums");
    // Ton favorable : couleur succès, flèche et mot caché pour les lecteurs d'écran.
    const up = c.getByText("+12 % sur 30 jours").parentElement!;
    await expect(up).toHaveAttribute("data-tone", "positive");
    await expect(up.querySelector("svg")).not.toBeNull();
    await expect(up).toHaveTextContent("(favorable)");
    const late = c.getByText("+5 depuis hier").parentElement!;
    await expect(late).toHaveTextContent("(défavorable)");
    await expect(c.getByText("stable").parentElement!).not.toHaveTextContent("(");
  },
};

/** Carte lien (D-361) : toute la carte est la cible ; nom du lien = titre ; survol `--hover`. */
export const Lien: Story = {
  render: () => (
    <Card title="Rapport trimestriel" href="#rapport">
      <p className="m-0">Ventes, marges et retours du trimestre.</p>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const link = c.getByRole("link", { name: "Rapport trimestriel" });
    await expect(link).toHaveAttribute("href", "#rapport");
    // Le contenu n'est pas dans le nom du lien.
    await expect(link).not.toHaveTextContent("Ventes");
    // La cible couvre la carte : un clic sur le texte du contenu atteint le lien.
    const card = canvasElement.querySelector<HTMLElement>("[data-clickable]")!;
    const r = card.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.bottom - 6);
    await expect(hit).toBe(link);
    // Le pointeur sur la carte survole le lien (vérifié ci-dessus) : la carte passe en --hover.
    const before = getComputedStyle(card).backgroundColor;
    await userEvent.hover(link);
    await waitFor(() => expect(getComputedStyle(card).backgroundColor).not.toBe(before));
    await userEvent.unhover(link);
  },
};

/** Carte bouton : `onPress` ; Entrée ou clic lance l'action ; anneau de focus sur la carte au clavier. */
export const Bouton: Story = {
  args: { onPress: fn() },
  render: (args) => (
    <Card title="Nouveau projet" {...(args.onPress ? { onPress: args.onPress } : {})}>
      Partir d'un modèle vide.
    </Card>
  ),
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    const button = c.getByRole("button", { name: "Nouveau projet" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    const card = canvasElement.querySelector<HTMLElement>("[data-clickable]")!;
    await expect(getComputedStyle(card).outlineStyle).toBe("solid");
    await userEvent.keyboard("{Enter}");
    await expect(args.onPress).toHaveBeenCalledTimes(1);
    // Un clic n'importe où sur la carte atteint le bouton (pseudo-élément qui la couvre).
    const r = card.getBoundingClientRect();
    await expect(document.elementFromPoint(r.left + 8, r.bottom - 6)).toBe(button);
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledTimes(2);
  },
};

/** Carte cliquable avec actions : « … » hors du lien ; l'ouvrir ne suit pas le lien. */
export const LienEtMenu: Story = {
  args: { onPress: fn() },
  render: (args) => (
    <Card
      title="Devis 2026-114"
      {...(args.onPress ? { onPress: args.onPress } : {})}
      actions={[
        { id: "dup", label: "Dupliquer", onPress: fn(), icon: <span />, primary: true },
        { id: "del", label: "Supprimer", onPress: fn(), danger: true },
      ]}
    >
      Envoyé le 4 novembre.
    </Card>
  ),
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    const target = c.getByRole("button", { name: "Devis 2026-114" });
    const more = c.getByRole("button", { name: "Plus d'actions" });
    await expect(target.contains(more)).toBe(false);
    await expect(c.queryByRole("button", { name: "Dupliquer" })).toBeNull();
    await userEvent.click(more);
    await waitFor(() => expect(body().getByRole("menuitem", { name: "Dupliquer" })).toBeVisible());
    await expect(args.onPress).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    // Tab : la carte, puis « … ».
    target.focus();
    await userEvent.tab();
    await expect(more).toHaveFocus();
  },
};

/** Chiffre clé cliquable : nom de la cible = libellé. */
export const MetriqueCliquable: Story = {
  render: () => <Card variant="metric" label="En retard" value="37" href="#retards" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("link", { name: "En retard" })).toHaveAttribute("href", "#retards");
  },
};
