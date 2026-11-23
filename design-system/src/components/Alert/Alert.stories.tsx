import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Link } from "../Link/Link";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Composants/Alert",
  component: Alert,
  parameters: { layout: "padded" },
  args: { tone: "warning", title: "Stock bas", children: "L'article A-12 sera épuisé dans 3 jours." },
  decorators: [(Story) => <div className="max-w-[560px]">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof Alert>;

export const ParDefaut: Story = {};

/** Quatre tons : carte neutre, seule l'icône prend la couleur du ton (D-355, D-151). */
export const Tons: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert tone="info" title="Nouvelle version">Les tarifs 2027 s'appliquent au 1er janvier.</Alert>
      <Alert tone="success" title="Import terminé">412 contacts ajoutés.</Alert>
      <Alert tone="warning" title="Stock bas">L'article A-12 sera épuisé dans 3 jours.</Alert>
      <Alert tone="danger" title="Synchronisation impossible">Le serveur ne répond pas. Les modifications restent sur cet appareil.</Alert>
      <Alert tone="info">Sans titre : une phrase suffit.</Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll<HTMLElement>("[data-tone]");
    await expect(cards).toHaveLength(5);
    // Même fond et même trait pour tous les tons : la couleur est sur l'icône.
    const bg = new Set(Array.from(cards, (c) => getComputedStyle(c).backgroundColor));
    const border = new Set(Array.from(cards, (c) => getComputedStyle(c).borderTopColor));
    await expect(bg.size).toBe(1);
    await expect(border.size).toBe(1);
    // Le ton est lu avant le titre.
    await expect(within(cards[3]!).getByText("Erreur :", { exact: false })).toBeInTheDocument();
  },
};

/** Une action, en bouton secondaire `sm` ; un lien est permis dans le texte (D-355). */
export const AvecAction: Story = {
  args: { action: { label: "Commander", onPress: fn() } },
  render: (args) => (
    <Alert {...args}>
      L'article A-12 sera épuisé dans 3 jours. <Link href="#stock">Voir le stock</Link>
    </Alert>
  ),
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("link", { name: "Voir le stock" })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Commander" }));
    await expect(args.action?.onPress).toHaveBeenCalledTimes(1);
  },
};

function Dismissible() {
  const [open, setOpen] = useState(true);
  return open ? (
    <Alert tone="info" title="Nouvelle version" onDismiss={() => setOpen(false)}>
      Les tarifs 2027 s'appliquent au 1er janvier.
    </Alert>
  ) : (
    <output>Fermé</output>
  );
}

/** La croix n'existe que si l'app fournit `onDismiss` (D-355). */
export const Fermeture: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Dismissible />
      <Alert tone="warning" title="Sans onDismiss">Pas de croix.</Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const close = c.getAllByRole("button", { name: "Fermer le message" });
    await expect(close).toHaveLength(1);
    await userEvent.click(close[0]!);
    await waitFor(() => expect(c.getByText("Fermé")).toBeVisible());
  },
};

/** Une erreur n'a pas de croix, même avec `onDismiss` : on la corrige, on ne la ferme pas (D-355). */
export const ErreurSansCroix: Story = {
  args: { tone: "danger", title: "Paiement refusé", children: "La carte a expiré. Mettez à jour le moyen de paiement.", onDismiss: fn() },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button", { name: "Fermer le message" })).toBeNull();
  },
};

function AfterAction() {
  const [shown, setShown] = useState<"none" | "success" | "danger">("none");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Button onPress={() => setShown("success")}>Vérifier</Button>
        <Button onPress={() => setShown("danger")}>Envoyer</Button>
      </div>
      {shown === "success" && (
        <Alert tone="success" title="Adresse vérifiée" announce>
          Le code postal correspond à la ville.
        </Alert>
      )}
      {shown === "danger" && (
        <Alert tone="danger" title="Envoi impossible" announce>
          Le fichier dépasse 10 Mo.
        </Alert>
      )}
      <Alert tone="info" title="Présent au chargement">
        Un simple bloc, sans annonce.
      </Alert>
    </div>
  );
}

/** Présente au chargement : un simple bloc. Après une action : annoncée, `status`, ou `alert` pour une erreur (D-355). */
export const Annonce: Story = {
  render: () => <AfterAction />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("status")).toBeNull();
    await expect(c.queryByRole("alert")).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Vérifier" }));
    await waitFor(() => expect(c.getByRole("status")).toHaveTextContent("Adresse vérifiée"));
    await userEvent.click(c.getByRole("button", { name: "Envoyer" }));
    await waitFor(() => expect(c.getByRole("alert")).toHaveTextContent("Envoi impossible"));
    await expect(c.queryByRole("status")).toBeNull();
  },
};
