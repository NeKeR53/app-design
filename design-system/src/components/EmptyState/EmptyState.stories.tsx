import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "react-aria-components/Button";
import { expect, fn, userEvent, within } from "storybook/test";
import { EmptyState } from "./EmptyState";

/** Icône d'app pour l'exemple (dossier). */
const Folder = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

/** En attendant le `Button` de Socle (P1) : bouton principal de démonstration. */
const Primary = ({ onPress }: { onPress?: () => void }) => (
  <Button {...(onPress ? { onPress } : {})} className="socle-btn h-(--row-h) rounded-md bg-fg px-3 text-md font-medium text-surface">
    Nouveau projet
  </Button>
);

const meta: Meta<typeof EmptyState> = {
  title: "Composants/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
  args: { title: "Aucun projet", description: "Créez un projet pour suivre ses tâches et son équipe.", icon: <Folder /> },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

/** Icône de 32 px, titre, phrase, action principale (D-166). */
export const ParDefaut: Story = {
  render: (args) => {
    const onPress = fn();
    return <EmptyState {...args} action={<Primary onPress={onPress} />} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Aucun projet")).toBeVisible();
    const icon = canvasElement.querySelector("svg")!;
    await expect(Math.round(icon.getBoundingClientRect().width)).toBe(32);
    await userEvent.tab();
    await expect(c.getByRole("button", { name: "Nouveau projet" })).toHaveFocus();
  },
};

/** Sans action ni icône. */
export const Minimal: Story = { render: () => <EmptyState title="Aucune note" /> };

/** Taille compacte, pour un panneau : l'icône n'est pas affichée. */
export const Compact: Story = {
  args: { size: "compact", title: "Aucune pièce jointe", description: "Déposez un fichier ici." },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("svg")).toBeNull();
  },
};
