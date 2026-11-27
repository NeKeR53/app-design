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

/**
 * Pas de fondu au repos (D-424) : au changement de thème, le fond change d'un coup, en même temps que les textes.
 * Le fondu de couleur ne vaut que pendant le survol d'une carte cliquable.
 */
export const ThemeSansFondu: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card title="Atelier de Lyon">
        <p className="m-0">Trois postes ouverts.</p>
      </Card>
      <Card title="Rapport trimestriel" href="#rapport">
        <p className="m-0">Ventes, marges et retours.</p>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [plain, clickable] = [...canvasElement.querySelectorAll<HTMLElement>(".rounded-lg")];
    for (const card of [plain!, clickable!]) await expect(getComputedStyle(card).transitionDuration).toBe("0s");
    const link = within(canvasElement).getByRole("link", { name: "Rapport trimestriel" });
    await userEvent.hover(link);
    await waitFor(() => expect(getComputedStyle(clickable!).transitionProperty).toContain("background-color"));
    await userEvent.unhover(link);
    await waitFor(() => expect(getComputedStyle(clickable!).transitionDuration).toBe("0s"));
  },
};

/** Valeur pas encore lue (D-426) : un squelette de la hauteur du chiffre ; le libellé et la cible restent ; même hauteur qu'une carte prête. */
export const ValeurEnAttente: Story = {
  decorators: [(S) => <div className="grid w-[560px] grid-cols-2 items-start gap-6">{S()}</div>],
  render: () => (
    <>
      <Card variant="metric" label="Commandes" value={null} isLoading onPress={fn()} />
      <Card variant="metric" label="Panier moyen" value="67,30 €" onPress={fn()} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("button", { name: "Commandes" })).toBeVisible();
    await expect(c.getByRole("status", { name: "Chargement…" })).toBeInTheDocument();
    const [loading, ready] = [...canvasElement.querySelectorAll<HTMLElement>("[data-clickable]")];
    await expect(loading).toHaveAttribute("aria-busy", "true");
    await expect(Math.round(loading!.getBoundingClientRect().height)).toBe(Math.round(ready!.getBoundingClientRect().height));
  },
};

/** Relecture (D-426) : la valeur reste ; une barre de 2 px défile sur le bord haut, dans le rayon de la carte. */
export const Relecture: Story = {
  render: () => <Card variant="metric" label="Commandes" value="1 284" delta={{ text: "+12 % sur 30 jours", tone: "positive" }} isRefreshing onPress={fn()} />,
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>("[data-clickable]")!;
    await expect(card).toHaveAttribute("aria-busy", "true");
    const bar = within(card).getByRole("progressbar", { name: "Mise à jour…" });
    await expect(bar.getBoundingClientRect().height).toBe(2);
    await expect(within(card).getByText("1 284")).toBeVisible();
    // La carte reste cliquable : la barre ne capte pas la souris.
    await expect(getComputedStyle(bar.parentElement!).pointerEvents).toBe("none");
  },
};

/** Petite courbe (D-428) : la tendance du chiffre, sous l'évolution, nommée pour les lecteurs d'écran. */
export const AvecCourbe: Story = {
  render: () => (
    <Card
      variant="metric"
      label="Commandes"
      value="1 284"
      delta={{ text: "+12 % sur 30 jours", tone: "positive" }}
      trend={[212, 236, 228, 251, 247, 268, 259, 281, 274, 296, 288, 312]}
      trendLabel="Commandes sur 12 semaines, de 212 à 312"
      onPress={fn()}
    />
  ),
  play: async ({ canvasElement }) => {
    const img = within(canvasElement).getByRole("img", { name: "Commandes sur 12 semaines, de 212 à 312" });
    await expect(img.getBoundingClientRect().height).toBe(32);
  },
};
