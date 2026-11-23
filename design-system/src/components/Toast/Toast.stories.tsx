import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, type ReactNode } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { SocleProvider, useNotify } from "../../provider/SocleProvider";
import { Button } from "../Button/Button";
import { createNotifications, toastDuration, type Notifications } from "./notifications";

/**
 * Toasts : messages éphémères, en bas à droite (Toast.spec.md, D-150 à D-156).
 * Chaque story crée sa propre file et l'affiche par `SocleProvider`.
 */
const meta: Meta = {
  title: "Composants/Toast",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;
const body = () => within(document.body);
const region = () => body().getByRole("region", { name: "Notifications" });
/** Toasts affichés ; la région disparaît quand il n'y en a plus. */
const toasts = () => {
  const r = body().queryByRole("region", { name: "Notifications" });
  return r ? within(r).queryAllByRole("alertdialog") : [];
};

/** File exposée aux fonctions `play`. */
let current: Notifications;

function Host({ children }: { children: ReactNode }) {
  const notifications = useMemo(() => createNotifications(), []);
  current = notifications;
  return <SocleProvider notifications={notifications}>{children}</SocleProvider>;
}

function Triggers() {
  const notify = useNotify();
  return (
    <div className="flex flex-wrap gap-2">
      <Button onPress={() => notify({ tone: "success", title: "Document archivé", description: "Budget 2027", action: { label: "Annuler", onAction: () => {} } })}>
        Succès avec « Annuler »
      </Button>
      <Button onPress={() => notify({ tone: "info", title: "Lien copié", history: false })}>Information</Button>
      <Button onPress={() => notify({ tone: "warning", title: "Espace presque plein", description: "92 % de l'espace est utilisé." })}>Alerte</Button>
      <Button
        onPress={() =>
          notify({ tone: "danger", title: "Envoi impossible", description: "Le service ne répond pas.", action: { label: "Réessayer", onAction: () => {} } })
        }
      >
        Erreur
      </Button>
      <Button
        onPress={() =>
          notify({
            title: "Import terminé avec des remarques à vérifier avant la prochaine synchronisation",
            description: "Ligne 12 : adresse incomplète.\nLigne 48 : doublon probable.\nLigne 97 : date au mauvais format.",
          })
        }
      >
        Texte long
      </Button>
    </div>
  );
}

/** Tous les tons, jouables : cliquez pour faire apparaître un toast. */
export const ParDefaut: Story = {
  render: () => (
    <Host>
      <Triggers />
    </Host>
  ),
};

/** Les quatre tons, côte à côte (D-151, D-152). La file reste ouverte : les erreurs ne disparaissent pas seules. */
export const Tons: Story = {
  render: () => (
    <Host>
      <Triggers />
    </Host>
  ),
  play: async () => {
    current.notify({ tone: "success", title: "Document archivé", duration: null });
    current.notify({ tone: "info", title: "Lien copié", duration: null });
    current.notify({ tone: "danger", title: "Envoi impossible", description: "Le service ne répond pas." });
    await waitFor(() => expect(toasts()).toHaveLength(3));
    // Le ton est lu avant le titre.
    await expect(body().getByRole("alertdialog", { name: /Erreur : Envoi impossible/ })).toBeInTheDocument();
  },
};

/** Durée : 5 s, 8 s avec action, `danger` jusqu'à fermeture, 5 s au minimum (D-153). */
export const Duree: Story = {
  render: () => (
    <Host>
      <p>Durées calculées par la file.</p>
    </Host>
  ),
  play: async () => {
    await expect(toastDuration("success", false)).toBe(5000);
    await expect(toastDuration("info", true)).toBe(8000);
    await expect(toastDuration("danger", true)).toBeNull();
    await expect(toastDuration("info", false, 1000)).toBe(5000);
    await expect(toastDuration("danger", false, 12000)).toBe(12000);
    await expect(toastDuration("success", false, null)).toBeNull();
    current.notify({ title: "Enregistré" });
    current.notify({ tone: "danger", title: "Échec" });
    await waitFor(() => expect(toasts()).toHaveLength(2));
    const [danger, info] = current.toastQueue.visibleToasts;
    await expect(danger?.timeout).toBeUndefined();
    await expect(info?.timeout).toBe(5000);
  },
};

/** La minuterie s'arrête au survol (D-153). */
export const Pause: Story = {
  render: () => (
    <Host>
      <p>Survolez le toast : il reste affiché.</p>
    </Host>
  ),
  play: async () => {
    current.notify({ title: "Enregistré", duration: 5000 });
    const toast = await waitFor(() => body().getByRole("alertdialog", { name: /Enregistré/ }));
    await userEvent.hover(toast);
    // La fenêtre perd puis reprend le focus : la souris est encore dessus, la minuterie reste arrêtée.
    window.dispatchEvent(new Event("blur"));
    window.dispatchEvent(new Event("focus"));
    await new Promise((r) => setTimeout(r, 5600));
    await expect(body().getByRole("alertdialog", { name: /Enregistré/ })).toBeInTheDocument();
    await userEvent.unhover(toast);
  },
};

/** Trois toasts au plus ; au-delà, le plus ancien se ferme ; le plus récent est en bas (D-154). */
export const Pile: Story = {
  render: () => (
    <Host>
      <p>Cinq notifications d'affilée.</p>
    </Host>
  ),
  play: async () => {
    for (let k = 1; k <= 5; k++) current.notify({ title: `Élément ${k} traité`, duration: null });
    await waitFor(() => expect(toasts()).toHaveLength(3));
    const shown = toasts().map((t) => t.getBoundingClientRect().top);
    const names = toasts().map((t) => t.textContent ?? "");
    await expect(names.some((n) => n.includes("Élément 1"))).toBe(false);
    // Le plus récent est le plus bas à l'écran.
    const newest = toasts().find((t) => t.textContent?.includes("Élément 5"));
    await expect(newest?.getBoundingClientRect().top).toBe(Math.max(...shown));
  },
};

/** Une erreur reste dans la pile : au-delà de trois, le plus ancien toast à minuterie se ferme (D-153, D-154). */
export const PileErreur: Story = {
  render: () => (
    <Host>
      <p>Une erreur, puis trois succès.</p>
    </Host>
  ),
  play: async () => {
    current.notify({ tone: "danger", title: "Envoi impossible" });
    for (let k = 1; k <= 3; k++) current.notify({ tone: "success", title: `Succès ${k}` });
    await waitFor(() => expect(toasts()).toHaveLength(3));
    const names = toasts().map((t) => t.textContent ?? "");
    await expect(names.some((n) => n.includes("Envoi impossible"))).toBe(true);
    await expect(names.some((n) => n.includes("Succès 1"))).toBe(false);
    await expect(names.some((n) => n.includes("Succès 3"))).toBe(true);
  },
};

/** L'action exécute `onAction` puis ferme le toast (D-155). */
const onUndo = fn();
export const Action: Story = {
  render: () => (
    <Host>
      <p>Toast avec « Annuler ».</p>
    </Host>
  ),
  play: async () => {
    onUndo.mockClear();
    current.notify({ tone: "success", title: "Document archivé", action: { label: "Annuler", onAction: onUndo } });
    const undo = await waitFor(() => within(region()).getByRole("button", { name: "Annuler" }));
    await userEvent.click(undo);
    await expect(onUndo).toHaveBeenCalledOnce();
    await waitFor(() => expect(toasts()).toHaveLength(0));
  },
};

/** La croix ferme le toast ; la notification reste dans le centre (D-156). */
export const Fermeture: Story = {
  render: () => (
    <Host>
      <p>Fermez le toast avec la croix.</p>
    </Host>
  ),
  play: async () => {
    current.notify({ title: "Sauvegarde terminée", duration: null });
    current.notify({ title: "Lien copié", history: false, duration: null });
    await waitFor(() => expect(toasts()).toHaveLength(2));
    const closes = within(region()).getAllByRole("button", { name: "Fermer la notification" });
    for (const b of closes) await userEvent.click(b);
    await waitFor(() => expect(toasts()).toHaveLength(0));
    // Seule la notification avec historique reste dans le centre.
    await expect(current.getItems().map((i) => i.title)).toEqual(["Sauvegarde terminée"]);
  },
};

/** Clavier : le toast prend le focus (F6 de React Aria, non simulable ici) ; Échap le ferme ; le focus revient. */
export const Clavier: Story = {
  render: () => (
    <Host>
      <Button>Avant</Button>
    </Host>
  ),
  play: async ({ canvasElement }) => {
    within(canvasElement).getByRole("button", { name: "Avant" }).focus();
    current.notify({ title: "Enregistré", duration: null });
    const toast = await waitFor(() => body().getByRole("alertdialog", { name: /Enregistré/ }));
    toast.focus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(toasts()).toHaveLength(0));
    await waitFor(() => expect(within(canvasElement).getByRole("button", { name: "Avant" })).toHaveFocus());

    // Échap ferme aussi le toast depuis son action.
    current.notify({ title: "Copié", duration: null, action: { label: "Annuler", onAction: () => {} } });
    const second = await waitFor(() => body().getByRole("alertdialog", { name: /Copié/ }));
    within(second).getByRole("button", { name: "Annuler" }).focus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(toasts()).toHaveLength(0));
  },
};
