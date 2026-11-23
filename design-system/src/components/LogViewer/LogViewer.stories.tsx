import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { EmptyState } from "../EmptyState/EmptyState";
import { Button } from "../Button/Button";
import { LogViewer, type LogLine, type LogViewerHandle } from "./LogViewer";

const MESSAGES = [
  "GET /api/health \x1b[32m200\x1b[0m 3ms",
  "INFO cache prêt (412 clés)",
  "compilation de src/module.ts",
  "\x1b[33mWARN\x1b[0m option « legacy » obsolète",
  "\x1b[1;31mERROR\x1b[0m connexion refusée : db:5432 (timeout)",
  "GET /api/items \x1b[32m200\x1b[0m 18ms",
  "terminé en 1,42 s",
  'level=warn msg="requête lente" ms=812',
];
const START = Date.parse("2026-11-23T09:14:02.000Z");

function makeLines(count: number, from = 0): LogLine[] {
  return Array.from({ length: count }, (_, i) => {
    const n = from + i;
    return { text: MESSAGES[(n * 7 + (n % 5)) % MESSAGES.length]!, time: START + n * 137 };
  });
}

const viewport = (root: HTMLElement) => within(root).getByRole("log");
const status = (root: HTMLElement) => root.querySelector("section > div:last-child") as HTMLElement;

const meta: Meta<typeof LogViewer> = {
  title: "Composants/LogViewer",
  component: LogViewer,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof LogViewer>;

const big = makeLines(20_000);

/** Journal terminé de 20 000 lignes : seules les lignes visibles sont dans la page (D-285). */
export const Statique: Story = {
  render: () => <LogViewer label="Journal du build n° 42" lines={big} />,
  play: async ({ canvasElement }) => {
    const log = viewport(canvasElement);
    await expect(log.getAttribute("aria-label")).toMatch(/^Journal du build n° 42, 20\s000 lignes$/);
    await expect(log.querySelectorAll("[data-index]").length).toBeLessThan(200);
    await expect(status(canvasElement)).toHaveTextContent(/20\s000 lignes/);
    // Journal terminé : pas de bascule Suivre ; l'heure ISO passe dans la colonne de l'horodatage.
    await expect(within(canvasElement).queryByRole("button", { name: "Suivre la fin" })).toBeNull();
    await expect(log).toHaveTextContent(/\d{2}:\d{2}:\d{2}\.\d{3}/);
  },
};

/** Les couleurs ANSI viennent des tokens `--ansi-n` (D-281) ; les séquences ne produisent jamais de HTML. */
export const CouleursAnsi: Story = {
  render: () => (
    <LogViewer
      label="Couleurs"
      lines={["\x1b[31mrouge\x1b[0m \x1b[1;32mvert gras\x1b[0m \x1b[38;5;208morange 256\x1b[0m <b>pas du HTML</b>", "\x1b]8;;https://exemple.fr\x07lien\x1b]8;;\x07 \x1b[7minversé\x1b[0m"]}
      timestamps={false}
    />
  ),
  play: async ({ canvasElement }) => {
    const log = viewport(canvasElement);
    const red = within(log).getByText("rouge");
    const probe = document.createElement("span");
    log.append(probe);
    probe.style.color = "var(--ansi-1)";
    await expect(getComputedStyle(red).color).toBe(getComputedStyle(probe).color);
    probe.style.color = "var(--ansi-10)";
    await expect(getComputedStyle(within(log).getByText("vert gras")).color).toBe(getComputedStyle(probe).color);
    probe.remove();
    await expect(log.querySelector("b")).toBeNull();
    await expect(log).toHaveTextContent("<b>pas du HTML</b>");
    await expect(log).toHaveTextContent("lien inversé");
  },
};

function Live({ levels = false }: { levels?: boolean }) {
  const ref = useRef<LogViewerHandle>(null);
  const count = useRef(0);
  useEffect(() => {
    ref.current?.append(makeLines(300));
    count.current = 300;
    const timer = setInterval(() => {
      ref.current?.append(makeLines(2, count.current));
      count.current += 2;
    }, 250);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex h-[420px] flex-col">
      <LogViewer ref={ref} label="Journal du conteneur web-01" live levels={levels} fill />
    </div>
  );
}

/** En direct : le journal suit la fin ; remonter met le suivi en pause et compte les nouvelles lignes (D-288). */
export const EnDirect: Story = {
  render: () => <Live />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const log = viewport(canvasElement);
    await waitFor(() => expect(log.scrollTop).toBeGreaterThan(0));
    await expect(status(canvasElement)).toHaveTextContent("En direct");
    const follow = canvas.getByRole("button", { name: "Suivre la fin" });
    await expect(follow).toHaveAttribute("aria-pressed", "true");
    fireEvent.wheel(log, { deltaY: -200 });
    log.scrollTop = 0;
    await waitFor(() => expect(status(canvasElement)).toHaveTextContent(/Suivi en pause · \d+ nouvelles? lignes?/), { timeout: 3000 });
    await expect(follow).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(canvas.getByRole("button", { name: "Revenir à la fin" }));
    await waitFor(() => expect(status(canvasElement)).not.toHaveTextContent("Suivi en pause"));
    await waitFor(() => expect(log.scrollHeight - log.scrollTop - log.clientHeight).toBeLessThan(4));
  },
};

const levelled = makeLines(400);

/** Niveaux : filtre par Menu à choix avec compteurs (D-286), liste des erreurs qui mène à la ligne (D-287). */
export const Niveaux: Story = {
  render: () => (
    <div className="flex h-[420px] flex-col">
      <LogViewer label="Journal du build n° 42" lines={levelled} levels fill />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const errors = levelled.filter((l) => typeof l !== "string" && l.text.includes("ERROR")).length;
    await expect(status(canvasElement)).toHaveTextContent(`${errors} erreurs`);
    await userEvent.click(canvas.getByRole("button", { name: "Niveau : Tous" }));
    await userEvent.click(await body.findByRole("menuitemradio", { name: `Erreurs (${errors})` }));
    await expect(canvas.getByRole("button", { name: "Niveau : Erreurs" })).toBeInTheDocument();
    const log = viewport(canvasElement);
    for (const row of log.querySelectorAll("[data-index]")) await expect(row).toHaveTextContent("ERROR");
    // Liste des erreurs : un clic remet toutes les lignes et marque la ligne.
    await userEvent.click(canvas.getByRole("button", { name: "Liste des erreurs" }));
    const list = canvas.getByRole("grid", { name: "Erreurs du journal" });
    const rows = within(list).getAllByRole("row");
    await expect(rows).toHaveLength(errors);
    await userEvent.click(rows[3]!);
    await expect(canvas.getByRole("button", { name: "Niveau : Tous" })).toBeInTheDocument();
    await waitFor(() => expect(log.querySelector(".bg-selected")).toHaveTextContent("ERROR"));
  },
};

/** Recherche : lignes gardées, texte surligné, « n sur N », Entrée et F3 au suivant (D-289). */
export const Recherche: Story = {
  render: () => (
    <div className="flex h-[420px] flex-col">
      <LogViewer label="Journal" lines={levelled} fill />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole("combobox", { name: "Rechercher dans le journal" });
    await userEvent.type(search, "timeout");
    const total = levelled.filter((l) => typeof l !== "string" && l.text.includes("timeout")).length;
    await waitFor(() => expect(canvasElement).toHaveTextContent(`1 sur ${total}`));
    await expect(viewport(canvasElement).querySelector("mark")).toHaveTextContent("timeout");
    await userEvent.keyboard("{Enter}");
    await expect(canvasElement).toHaveTextContent(`2 sur ${total}`);
    await userEvent.keyboard("{F3}");
    await expect(canvasElement).toHaveTextContent(`3 sur ${total}`);
    await userEvent.keyboard("{Shift>}{F3}{/Shift}");
    await expect(canvasElement).toHaveTextContent(`2 sur ${total}`);
    await userEvent.click(canvas.getByRole("button", { name: "Résultat précédent" }));
    await expect(canvasElement).toHaveTextContent(`1 sur ${total}`);
    await expect(viewport(canvasElement).querySelector(".bg-selected")).toHaveTextContent("timeout");
  },
};

/** Copie : les lignes affichées, sans séquences ANSI ; « Copié » annoncé (D-289). */
export const Copie: Story = {
  render: () => <LogViewer label="Journal" lines={makeLines(5)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    let copied = "";
    const original = navigator.clipboard?.writeText;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (text: string) => void (copied = text) },
    });
    try {
      await userEvent.click(canvas.getByRole("button", { name: "Copier le journal" }));
      await waitFor(() => expect(canvas.getByRole("button", { name: "Copié" })).toBeInTheDocument());
      await expect(copied.split("\n")).toHaveLength(5);
      await expect(copied).not.toContain("\x1b");
      await expect(copied).toContain("GET /api/health 200 3ms");
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: original } });
    }
  },
};

/** Retour à la ligne et horodatage : deux bascules de la barre d'outils. */
export const Affichage: Story = {
  render: () => <LogViewer label="Journal" lines={[{ text: "x".repeat(400), time: START }, ...makeLines(3, 1)]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const log = viewport(canvasElement);
    await expect(log.scrollWidth).toBeGreaterThan(log.clientWidth);
    await userEvent.click(canvas.getByRole("button", { name: "Retour à la ligne" }));
    await waitFor(() => expect(log.scrollWidth).toBeLessThanOrEqual(log.clientWidth));
    await expect(log).toHaveTextContent(/\d{2}:14:02\.000/);
    await userEvent.click(canvas.getByRole("button", { name: "Horodatage" }));
    await expect(log).not.toHaveTextContent(/\d{2}:\d{2}:\d{2}\.\d{3}/);
  },
};

/** États vides : chargement, attente en direct, journal vide, état de l'app. */
export const Vide: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3">
      <LogViewer label="Chargement" loading />
      <LogViewer label="Attente" live />
      <LogViewer label="Vide" lines={[]} />
      <LogViewer
        label="Erreur"
        empty={<EmptyState size="compact" title="Journal indisponible" description="Le service n'a pas répondu." action={<Button variant="primary">Réessayer</Button>} />}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const region = (name: string) => within(canvasElement).getByRole("region", { name });
    await expect(region("Chargement")).toHaveTextContent("Chargement du journal…");
    await expect(region("Attente")).toHaveTextContent("En attente des premières lignes…");
    await expect(region("Vide")).toHaveTextContent("Journal vide");
    await expect(region("Erreur")).toHaveTextContent("Journal indisponible");
  },
};

/** Flux brut : un morceau sans saut de ligne laisse la dernière ligne ouverte ; le suivant la complète. */
export const FluxBrut: Story = {
  render: () => {
    const Demo = () => {
      const ref = useRef<LogViewerHandle>(null);
      useEffect(() => {
        ref.current?.append("première ligne\ndeuxième ");
        ref.current?.append("moitié\ntroisième\n");
      }, []);
      return <LogViewer ref={ref} label="Flux" live timestamps={false} />;
    };
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(status(canvasElement)).toHaveTextContent("3 lignes"));
    await expect(viewport(canvasElement)).toHaveTextContent("deuxième moitié");
  },
};
