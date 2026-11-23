import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { NotificationCenter, unreadBadge } from "./NotificationCenter";
import { AppShell } from "../AppShell/AppShell";
import { Sidebar } from "../Sidebar/Sidebar";
import { IconButton } from "../../components/IconButton/IconButton";
import { Button } from "../../components/Button/Button";
import { SocleProvider, useNotify } from "../../provider/SocleProvider";
import { createNotifications, type NotificationRecord, type Notifications } from "../../components/Toast/notifications";
import { Doc } from "../../../.storybook/story-icons";

/** Centre de notifications : cloche de la barre du haut, compteur, panneau (NotificationCenter.spec.md, D-156 à D-158). */
const meta: Meta<typeof NotificationCenter> = {
  title: "Patterns/NotificationCenter",
  component: NotificationCenter,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof NotificationCenter>;
const body = () => within(document.body);
const bell = () => body().getByRole("button", { name: /^Notifications/ });
const panel = () => body().getByRole("dialog", { name: "Notifications" });

const HOUR = 3_600_000;
/** Historique de départ : hier et avant-hier, déjà lu. */
function history(now = Date.now()): NotificationRecord[] {
  return [
    { id: "h1", tone: "info", title: "Synchronisation terminée", description: "412 éléments à jour.", source: "Synchronisation", at: now - 26 * HOUR, read: true },
    { id: "h2", tone: "danger", title: "Import en échec", description: "Le fichier « clients.csv » est illisible.", source: "Import", at: now - 30 * HOUR, read: true },
    { id: "h3", tone: "success", title: "Export prêt", source: "Export", at: now - 52 * HOUR, read: true },
  ];
}

let current: Notifications;

function Host({ initial = history(), onChange }: { initial?: NotificationRecord[]; onChange?: (i: NotificationRecord[]) => void }) {
  const notifications = useMemo(() => createNotifications({ initial, ...(onChange ? { onChange } : {}) }), []);
  current = notifications;
  return (
    <SocleProvider notifications={notifications}>
      <div className="flex justify-end border-b border-line px-2 py-1">
        <NotificationCenter />
      </div>
    </SocleProvider>
  );
}

function DemoPage() {
  const notify = useNotify();
  const [docs, setDocs] = useState(["Rapport trimestriel", "Budget 2027", "Compte rendu de réunion", "Contrat cadre fournisseur"]);
  return (
    <div className="space-y-3 p-6">
      <div className="flex flex-wrap gap-2">
        <Button onPress={() => notify({ tone: "danger", title: "Envoi impossible", description: "Le service ne répond pas.", source: "Envoi" })}>Erreur</Button>
        <Button onPress={() => notify({ tone: "success", title: "Sauvegarde nocturne terminée", source: "Sauvegarde", toast: false })}>
          Événement de fond
        </Button>
      </div>
      <ul className="m-0 list-none p-0">
        {docs.map((d, i) => (
          <li key={d} className="flex h-(--row-h) items-center justify-between border-b border-line px-2">
            {d}
            <Button
              size="sm"
              variant="subtle"
              onPress={() => {
                setDocs((all) => all.filter((x) => x !== d));
                notify({
                  tone: "success",
                  title: "Document archivé",
                  description: d,
                  action: { label: "Annuler", onAction: () => setDocs((all) => [...all.slice(0, i), d, ...all.slice(i)]) },
                });
              }}
            >
              Archiver
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Dans la barre du haut d'AppShell, avec toasts et centre jouables. */
export const DansAppShell: Story = {
  parameters: { layout: "fullscreen" },
  render: () => {
    const notifications = useMemo(() => createNotifications({ initial: history() }), []);
    return (
      <SocleProvider notifications={notifications}>
        <div className="fixed inset-0">
          <AppShell
            pageTitle="Documents"
            actions={
              <>
                <IconButton icon={<Doc />} label="Nouveau document" />
                <NotificationCenter />
              </>
            }
            sidebar={
              <Sidebar selectedId="docs" onSelectionChange={() => {}} account={<Sidebar.Account name="Camille Martin" detail="Admin" onSettings={() => {}} />}>
                <Sidebar.Item id="home" icon={<Doc />} label="Accueil" />
                <Sidebar.Item id="docs" icon={<Doc />} label="Documents" />
              </Sidebar>
            }
          >
            <DemoPage />
          </AppShell>
        </div>
      </SocleProvider>
    );
  },
};

/** La pastille montre le nombre de non-lus, « 9+ » au-delà de 9 ; elle disparaît à 0 (D-157). */
export const Compteur: Story = {
  render: () => <Host />,
  play: async () => {
    await expect(bell()).toHaveAccessibleName("Notifications");
    await expect(body().queryByTestId("notification-count")).toBeNull();
    current.notify({ title: "Un", toast: false });
    current.notify({ title: "Deux", toast: false });
    await waitFor(() => expect(bell()).toHaveAccessibleName("Notifications, 2 non lues"));
    await expect(body().getByTestId("notification-count")).toHaveTextContent("2");
    for (let k = 0; k < 9; k++) current.notify({ title: `N${k}`, toast: false });
    await waitFor(() => expect(body().getByTestId("notification-count")).toHaveTextContent("9+"));
    await expect(unreadBadge(10)).toBe("9+");
  },
};

/** Ouvrir marque tout comme lu ; les points restent jusqu'à la fermeture ; Échap ferme et rend le focus (D-157). */
export const Ouverture: Story = {
  render: () => <Host />,
  play: async () => {
    current.notify({ tone: "warning", title: "Espace presque plein", toast: false });
    await waitFor(() => expect(bell()).toHaveAccessibleName("Notifications, 1 non lue"));
    await userEvent.click(bell());
    const dialog = await waitFor(() => panel());
    await expect(bell()).toHaveAccessibleName("Notifications");
    await expect(dialog.querySelectorAll("[data-unread]")).toHaveLength(1);
    // Le focus va à la première ligne.
    await waitFor(() => expect(document.activeElement?.closest('[role="row"]')?.textContent).toContain("Espace presque plein"));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(bell()).toHaveFocus());
    await userEvent.click(bell());
    await waitFor(() => expect(panel().querySelectorAll("[data-unread]")).toHaveLength(0));
    await userEvent.click(bell());
  },
};

/** Lignes groupées par jour, la plus récente en haut (D-158). */
export const Groupes: Story = {
  render: () => <Host />,
  play: async () => {
    current.notify({ title: "Document archivé", toast: false });
    await userEvent.click(bell());
    const dialog = await waitFor(() => panel());
    const headers = within(dialog).getAllByRole("rowheader").map((h) => h.textContent);
    await expect(headers.slice(0, 2)).toEqual(["Aujourd'hui", "Hier"]);
    await expect(headers).toHaveLength(3);
    const rows = within(dialog).getAllByRole("row").filter((r) => !r.querySelector('[role="rowheader"]'));
    await expect(rows[0]).toHaveTextContent("Document archivé");
    await expect(rows[1]).toHaveTextContent("Synchronisation terminée");
  },
};

/** × retire une ligne ; « Tout effacer » vide la liste et montre l'état vide (D-158). */
export const Effacer: Story = {
  render: () => <Host />,
  play: async () => {
    await userEvent.click(bell());
    const dialog = await waitFor(() => panel());
    const remove = within(dialog).getAllByRole("button", { name: "Retirer la notification" });
    await userEvent.click(remove[0]!);
    await waitFor(() => expect(within(panel()).queryByText("Synchronisation terminée")).toBeNull());
    await userEvent.click(within(panel()).getByRole("button", { name: "Tout effacer" }));
    await waitFor(() => expect(within(panel()).getByText("Aucune notification")).toBeInTheDocument());
    await expect(within(panel()).queryByRole("button", { name: "Tout effacer" })).toBeNull();
  },
};

/** La file garde 100 notifications ; `onChange` reçoit la liste à chaque changement (D-158). */
const onChange = fn();
export const Persistance: Story = {
  render: () => <Host initial={[]} onChange={onChange} />,
  play: async () => {
    onChange.mockClear();
    for (let k = 0; k < 105; k++) current.notify({ title: `N${k}`, toast: false });
    await expect(current.getItems()).toHaveLength(100);
    await expect(current.getItems()[0]?.title).toBe("N104");
    await expect(onChange).toHaveBeenCalledTimes(105);
    await expect((onChange.mock.lastCall?.[0] as NotificationRecord[]).length).toBe(100);
  },
};

/** Une ligne avec `onOpen` s'ouvre au clic ou avec Entrée et ferme le panneau (D-156). */
const onOpen = fn();
export const Ouvrir: Story = {
  render: () => <Host initial={[]} />,
  play: async () => {
    onOpen.mockClear();
    current.notify({ title: "Rapport prêt", toast: false, onOpen });
    await userEvent.click(bell());
    await waitFor(() => panel());
    await waitFor(() => expect(document.activeElement?.closest('[role="row"]')).not.toBeNull());
    await userEvent.keyboard("{Enter}");
    await expect(onOpen).toHaveBeenCalledOnce();
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
  },
};
