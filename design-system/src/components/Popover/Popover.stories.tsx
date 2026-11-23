import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Popover } from "./Popover";
import { IconButton } from "../IconButton/IconButton";
import { Button } from "../Button/Button";
import { TextInput } from "../TextInput/TextInput";
import { TextArea } from "../TextArea/TextArea";
import { Settings } from "../../icons";

const meta: Meta<typeof Popover> = {
  title: "Composants/Popover",
  component: Popover,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof Popover>;
const body = () => within(document.body);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 12v7h16v-7M12 3v12M7 8l5-5 5 5" />
  </svg>
);

function SharePopover({ busy = false }: { busy?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      title="Partager le projet"
      isOpen={open}
      onOpenChange={setOpen}
      isBusy={busy}
      trigger={<IconButton icon={<ShareIcon />} label="Partager" />}
    >
      <div className="flex flex-col gap-3">
        <TextInput label="Adresse e-mail" type="email" isRequired />
        <TextArea label="Message" />
        <div className="flex justify-end gap-2">
          <Button size="sm" onPress={() => setOpen(false)}>Annuler</Button>
          <Button size="sm" variant="primary" onPress={() => setOpen(false)}>Envoyer</Button>
        </div>
      </div>
    </Popover>
  );
}

/** Volet ancré, titre et × ; focus sur le premier champ ; retour au bouton (D-328, D-329). */
export const ParDefaut: Story = {
  render: () => <SharePopover />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Partager" });
    await userEvent.click(trigger);
    const dialog = await waitFor(() => body().getByRole("dialog", { name: "Partager le projet" }));
    await waitFor(() => expect(within(dialog).getByRole("textbox", { name: /Adresse e-mail/ })).toHaveFocus());
    await expect(Math.round(dialog.closest(".socle-box")!.getBoundingClientRect().width)).toBe(360);
    await userEvent.click(within(dialog).getByRole("button", { name: "Fermer" }));
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

/** Clic à côté : ferme ; après une saisie, refusé (rebond) ; Échap ferme toujours (D-329). */
export const Fermeture: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-24">
      <SharePopover />
      <p>À côté</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Partager" }));
    await waitFor(() => body().getByRole("dialog"));
    await userEvent.click(c.getByText("À côté"));
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());

    await userEvent.click(c.getByRole("button", { name: "Partager" }));
    const dialog = await waitFor(() => body().getByRole("dialog"));
    await userEvent.type(await waitFor(() => within(dialog).getByRole("textbox", { name: /Adresse e-mail/ })), "a@b.fr");
    await userEvent.click(c.getByText("À côté"));
    await expect(body().getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
  },
};

/** Action en cours : rien ne ferme le volet, × désactivé (D-329). */
export const Occupe: Story = {
  render: () => <SharePopover busy />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Partager" }));
    const dialog = await waitFor(() => body().getByRole("dialog"));
    await expect(within(dialog).getByRole("button", { name: "Fermer" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    await expect(body().getByRole("dialog")).toBeVisible();
  },
};

/** Sans titre : nom accessible par `label`, sans × ; largeur `sm`. */
export const SansTitre: Story = {
  render: () => (
    <Popover label="Réglages rapides" width="sm" trigger={<IconButton icon={<Settings />} label="Réglages rapides" />}>
      <p className="m-0 text-fg-2">Le contenu peut être du texte, des champs ou une liste courte.</p>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Réglages rapides" }));
    const dialog = await waitFor(() => body().getByRole("dialog", { name: "Réglages rapides" }));
    await expect(within(dialog).queryByRole("button", { name: "Fermer" })).toBeNull();
    await userEvent.keyboard("{Escape}");
  },
};

/** À droite d'un bouton de la sidebar (`right start`). */
export const ADroite: Story = {
  render: () => (
    <Popover label="Filtres" placement="right start" width="lg" trigger={<Button>Filtres</Button>}>
      <p className="m-0 text-fg-2">Volet de 440 px, aligné sur le haut du bouton.</p>
    </Popover>
  ),
};
