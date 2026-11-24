import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { AttachmentChip } from "../AttachmentChip/AttachmentChip";
import { ActivityGroup, AgentActivity, type ActivityItem } from "./AgentActivity";

const meta: Meta<typeof AgentActivity> = {
  title: "Composants/AgentActivity",
  component: AgentActivity,
  subcomponents: { ActivityGroup },
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-[760px] bg-surface p-4">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof AgentActivity>;

const DONE: ActivityItem[] = [
  { id: "1", kind: "read", verb: "Lu", object: "src/dates.ts" },
  { id: "2", kind: "search", verb: "Recherché", object: "formatDate" },
  { id: "3", kind: "edit", verb: "Modifié", object: "src/dates.ts" },
  { id: "4", kind: "think", verb: "Réflexion" },
  { id: "5", kind: "command", verb: "Exécuté", object: "npm test", detail: "PASS src/dates.test.ts\nTests: 12 passed" },
];

/** Une ligne par outil : icône du type, verbe, objet en police à chasse fixe ; en cours, pas de roue, « En cours » lu (D-391) ; « Échec » en rouge. */
export const Lignes: Story = {
  render: () => (
    <>
      <AgentActivity kind="command" verb="Exécuté" object="npm run build" />
      <AgentActivity kind="edit" verb="Modifié" object="src/app.tsx" />
      <AgentActivity kind="search" verb="Recherché" object="useMessages" />
      <AgentActivity kind="read" verb="Lu" object="README.md" />
      <AgentActivity kind="think" verb="Réflexion" />
      <AgentActivity kind="other" verb="Appelé" object="fetch_page" />
      <AgentActivity kind="command" verb="Exécuté" object="npm test" status="running" />
      <AgentActivity kind="command" verb="Exécuté" object="npm run lint" status="error" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(getComputedStyle(c.getByText("npm run build")).fontFamily).toBe(getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim());
    const failed = c.getByText("Échec");
    const probe = document.createElement("span");
    probe.style.color = "var(--danger)";
    document.body.append(probe);
    await expect(getComputedStyle(failed).color).toBe(getComputedStyle(probe).color);
    probe.remove();
    const running = canvasElement.querySelector('[data-activity="running"]') as HTMLElement;
    // Pas de roue : WorkStatus montre déjà le travail en cours (D-391).
    await expect(running.querySelector("[data-spinner]")).toBeNull();
    await expect(running.querySelector("svg")).not.toBeNull();
    await expect(within(running).getByText("En cours")).toHaveClass("sr-only");
  },
};

/** Avec une sortie, la ligne s'ouvre : texte en lecture seule, de 2 à 12 lignes. */
export const Detail: Story = {
  render: () => (
    <>
      <AgentActivity kind="command" verb="Exécuté" object="npm test" detail="PASS src/dates.test.ts" />
      <AgentActivity kind="command" verb="Exécuté" object="npm run build" detail={Array.from({ length: 30 }, (_, i) => `ligne ${i + 1}`).join("\n")} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const [short, long] = c.getAllByRole("button") as [HTMLElement, HTMLElement];
    await expect(short).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(short);
    await expect(short).toHaveAttribute("aria-expanded", "true");
    const out = c.getByRole("textbox", { name: "Détail de Exécuté npm test" });
    await expect(out).toHaveAttribute("readonly");
    await expect(out).toHaveAttribute("rows", "2");
    long.focus();
    await userEvent.keyboard("{Enter}");
    await expect(c.getByRole("textbox", { name: "Détail de Exécuté npm run build" })).toHaveAttribute("rows", "12");
  },
};

/** Jusqu'à 3 outils : une ligne chacun, sans résumé. */
export const PeuDOutils: Story = {
  render: () => <ActivityGroup items={DONE.slice(0, 3)} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByText("src/dates.ts")).toHaveLength(2);
    await expect(c.queryByText(/outils exécutés/)).toBeNull();
  },
};

/** Au-delà de 3 : résumé « 5 outils exécutés », replié une fois terminé ; clic, Entrée ou Espace l'ouvrent. */
export const Groupe: Story = {
  render: () => <ActivityGroup items={DONE} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const head = c.getByRole("button", { name: "5 outils exécutés" });
    await expect(head).toHaveAttribute("aria-expanded", "false");
    await expect(c.queryByText("formatDate")).toBeNull();
    await userEvent.click(head);
    await expect(head).toHaveAttribute("aria-expanded", "true");
    await expect(c.getByRole("list", { name: "5 outils exécutés" })).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect(head).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard(" ");
    await expect(head).toHaveAttribute("aria-expanded", "true");
  },
};

/** Déplié tant qu'un outil tourne, replié à la fin ; « x en cours ». */
export const GroupeEnCours: Story = {
  render: () => {
    const [running, setRunning] = useState(true);
    const items = DONE.map((i, n) => (n === 4 ? { ...i, status: running ? ("running" as const) : ("done" as const) } : i));
    return (
      <>
        <button type="button" onClick={() => setRunning(false)}>
          Terminer
        </button>
        <ActivityGroup items={items} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const head = c.getByRole("button", { name: "5 outils · 1 en cours" });
    await expect(head).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(c.getByRole("button", { name: "Terminer" }));
    await expect(c.getByRole("button", { name: "5 outils exécutés" })).toHaveAttribute("aria-expanded", "false");
  },
};

/**
 * Replié dès deux outils (`groupAbove={1}`, `defaultExpanded={false}`) : une seule ligne donne le nombre d'appels et
 * le nombre en cours, à jour à chaque outil ; dépliée, elle montre une ligne par appel (D-390).
 */
export const UneLigneRepliee: Story = {
  render: () => {
    const [count, setCount] = useState(2);
    const [done, setDone] = useState(false);
    const items: ActivityItem[] = Array.from({ length: count }, (_, n) => ({
      id: String(n),
      kind: "command",
      verb: "Exécuté",
      object: `commande ${n + 1}`,
      status: done || n < count - 2 ? "done" : "running",
    }));
    return (
      <>
        <button type="button" onClick={() => setCount((n) => n + 1)}>
          Outil suivant
        </button>
        <button type="button" onClick={() => setDone(true)}>
          Terminer
        </button>
        <ActivityGroup items={items} groupAbove={1} defaultExpanded={false} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Deux outils qui tournent : une seule ligne, repliée, sans roue ; le texte dit combien tournent (D-391).
    const head = c.getByRole("button", { name: "2 outils · 2 en cours" });
    await expect(head).toHaveAttribute("aria-expanded", "false");
    await expect(head.querySelector("[data-spinner]")).toBeNull();
    await expect(c.queryByText("commande 1")).toBeNull();
    // Le compte suit en direct, la ligne reste repliée.
    await userEvent.click(c.getByRole("button", { name: "Outil suivant" }));
    await userEvent.click(c.getByRole("button", { name: "Outil suivant" }));
    await expect(c.getByRole("button", { name: "4 outils · 2 en cours" })).toHaveAttribute("aria-expanded", "false");
    // Dépliée : une ligne par appel.
    await userEvent.click(c.getByRole("button", { name: "4 outils · 2 en cours" }));
    await expect(c.getByText("commande 1")).toBeInTheDocument();
    await expect(c.getByText("commande 4")).toBeInTheDocument();
    await userEvent.click(c.getByRole("button", { name: "Terminer" }));
    await expect(c.getByRole("button", { name: "4 outils exécutés" })).toBeInTheDocument();
  },
};

/** `groupAbove={0}` : même un outil seul est une ligne repliée ; sa commande ne se voit qu'une fois dépliée (D-391). */
export const OutilSeulReplie: Story = {
  render: () => {
    const [done, setDone] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setDone(true)}>
          Terminer
        </button>
        <ActivityGroup
          items={[{ id: "1", kind: "command", verb: "Exécuté", object: "npm test", status: done ? "done" : "running" }]}
          groupAbove={0}
          defaultExpanded={false}
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const head = c.getByRole("button", { name: "1 outil · 1 en cours" });
    await expect(head).toHaveAttribute("aria-expanded", "false");
    await expect(c.queryByText("npm test")).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Terminer" }));
    const doneHead = c.getByRole("button", { name: "1 outil exécuté" });
    await userEvent.click(doneHead);
    await expect(c.getByText("npm test")).toBeInTheDocument();
  },
};

/** Une erreur reste visible, en rouge, même groupe replié. */
export const ErreurVisible: Story = {
  render: () => <ActivityGroup items={[...DONE.slice(0, 4), { id: "5", kind: "command", verb: "Exécuté", object: "npm test", status: "error", detail: "FAIL src/dates.test.ts" }]} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const head = c.getByRole("button", { name: "5 outils exécutés · 1 en échec" });
    await expect(head).toHaveAttribute("aria-expanded", "false");
    await expect(c.getByText("Échec")).toBeVisible();
    await expect(c.getByText("npm test")).toBeVisible();
    await expect(c.queryByText("formatDate")).toBeNull();
  },
};

/** Capture factice, en `data:`, pour les pièces. */
const CAPTURE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#9db4e8"/><stop offset="1" stop-color="#d6c3ef"/></linearGradient></defs><rect width="160" height="100" fill="url(#g)"/></svg>',
  );

const openFile = fn();

/** Objet cliquable (D-384) : l'objet devient un lien ; avec une sortie, un chevron à part l'ouvre. */
export const ObjetCliquable: Story = {
  render: () => (
    <>
      <AgentActivity kind="read" verb="Lu" object="src/dates.ts" onObjectPress={() => openFile("src/dates.ts")} />
      <AgentActivity kind="edit" verb="Modifié" object="src/app.tsx" detail={"+ return d.toLocaleDateString();\n- return d.toISOString();"} onObjectPress={() => openFile("src/app.tsx")} />
      <AgentActivity kind="search" verb="Recherché" object="formatDate" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    openFile.mockClear();
    const read = c.getByRole("button", { name: "src/dates.ts" });
    await userEvent.click(read);
    await expect(openFile).toHaveBeenCalledWith("src/dates.ts");
    await expect(getComputedStyle(read).fontFamily).toBe(getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim());
    // Tab : le lien de la 2e ligne, puis son chevron ; Entrée ouvre la sortie sans ouvrir le fichier.
    await userEvent.tab();
    await expect(c.getByRole("button", { name: "src/app.tsx" })).toHaveFocus();
    await userEvent.tab();
    const toggle = c.getByRole("button", { name: "Sortie de Modifié src/app.tsx" });
    await expect(toggle).toHaveFocus();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{Enter}");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(c.getByRole("textbox", { name: "Détail de Modifié src/app.tsx" })).toBeVisible();
    await expect(openFile).toHaveBeenCalledTimes(1);
    // Sans `onObjectPress`, l'objet reste du texte.
    await expect(c.queryByRole("button", { name: "formatDate" })).toBeNull();
  },
};

/** Pièces dans la sortie (D-384) : sous le texte de `detail` ; une pièce seule suffit à rendre la ligne ouvrable. */
export const Pieces: Story = {
  render: () => (
    <>
      <AgentActivity kind="other" verb="Capture d'écran" detail="Capture enregistrée : 1280 × 800" attachments={<AttachmentChip kind="image" name="capture.png" src={CAPTURE} />} />
      <AgentActivity
        kind="other"
        verb="Généré"
        object="rapport"
        attachments={
          <>
            <AttachmentChip kind="image" name="graphique.png" src={CAPTURE} />
            <AttachmentChip kind="file" name="rapport.pdf" />
          </>
        }
      />
    </>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const [shot, report] = c.getAllByRole("button", { expanded: false }) as [HTMLElement, HTMLElement];
    await userEvent.click(shot);
    const textbox = c.getByRole("textbox", { name: "Détail de Capture d'écran" });
    const pieces = c.getByRole("group", { name: "Pièces de Capture d'écran" });
    await expect(pieces).toBeVisible();
    // Les pièces viennent sous le texte.
    await expect(textbox.compareDocumentPosition(pieces) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await userEvent.click(report);
    await expect(c.getByRole("group", { name: "Pièces de Généré rapport" })).toBeVisible();
    await expect(c.queryByRole("textbox", { name: "Détail de Généré rapport" })).toBeNull();
    await expect(c.getByText("rapport.pdf")).toBeVisible();
  },
};

/** État « Arrêté » (D-384) : icône du type, « Arrêté » en `--fg-3` ; compté dans le résumé ; pas gardé visible, groupe replié. */
export const Arrete: Story = {
  render: () => (
    <>
      <AgentActivity kind="command" verb="Exécuté" object="npm run dev" status="stopped" />
      <ActivityGroup items={[...DONE.slice(0, 4), { id: "5", kind: "command", verb: "Exécuté", object: "npm run dev", status: "stopped" }]} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const line = canvasElement.querySelector('[data-activity="stopped"]') as HTMLElement;
    await expect(line.querySelector("[data-spinner]")).toBeNull();
    const label = within(line).getByText("Arrêté");
    await expect(label).not.toHaveClass("sr-only");
    const probe = document.createElement("span");
    probe.style.color = "var(--fg-3)";
    document.body.append(probe);
    await expect(getComputedStyle(label).color).toBe(getComputedStyle(probe).color);
    probe.remove();
    const head = c.getByRole("button", { name: "5 outils exécutés · 1 arrêté" });
    await expect(head).toHaveAttribute("aria-expanded", "false");
    await expect(c.getAllByText("Arrêté")).toHaveLength(1);
    await userEvent.click(head);
    await expect(c.getAllByText("Arrêté")).toHaveLength(2);
  },
};
