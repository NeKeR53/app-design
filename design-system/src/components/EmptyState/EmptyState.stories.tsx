import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "react-aria-components/Button";
import { expect, fn, userEvent, within } from "storybook/test";
import { EmptyState } from "./EmptyState";
import { Link } from "../Link/Link";

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
    await expect(c.getByRole("heading", { level: 2, name: "Aucun projet" })).toBeVisible();
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

/** Phrase avec un `Link` (action secondaire) ; titre de niveau 3 dans une page qui a déjà un `h2`. Même apparence. */
export const AvecLien: Story = {
  args: {
    headingLevel: 3,
    description: (
      <>
        Créez un projet ou <Link href="#import">importez un fichier</Link>.
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const heading = c.getByRole("heading", { level: 3, name: "Aucun projet" });
    await expect(getComputedStyle(heading).fontSize).toBe(getComputedStyle(heading.parentElement!).fontSize);
    await expect(c.getByRole("link", { name: "importez un fichier" })).toHaveAttribute("href", "#import");
  },
};

/** `variant="forbidden"` : cadenas par défaut, gardé en `compact` (accès refusé, D-351). */
export const AccesRefuse: Story = {
  args: { variant: "forbidden", title: "Vous n'avez pas accès à cette liste", description: "Demandez l'accès à un administrateur.", icon: undefined },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <EmptyState {...args} />
      <EmptyState {...args} size="compact" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const icons = canvasElement.querySelectorAll('[data-variant="forbidden"] svg');
    await expect(icons).toHaveLength(2);
    await expect(icons[0]!.getBoundingClientRect().width).toBe(32);
    await expect(icons[1]!.getBoundingClientRect().width).toBe(20);
    await expect(within(canvasElement).getAllByRole("heading", { name: "Vous n'avez pas accès à cette liste" })).toHaveLength(2);
  },
};
