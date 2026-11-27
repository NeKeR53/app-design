import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useMemo, useRef, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { Button } from "../Button/Button";
import { Terminal, type TerminalConnection, type TerminalHandle, type TerminalProps } from "./Terminal";
import type { TerminalEngine } from "./terminalEngine";

/** Le moteur tel qu'une app le passe (D-280) : ici l'objet, ou une fonction qui le charge. */
const engine: TerminalEngine = { Terminal: XTerm, FitAddon };
const loadEngine = () => Promise.resolve(engine);

const PROMPT = "\x1b[1;32mmoi@poste\x1b[0m:\x1b[1;34m~/app\x1b[0m$ ";

/** Faux shell : écho local, quelques commandes, pour la démonstration. */
function fakeShell(sent: string[] = []): TerminalConnection {
  let write: ((data: string) => void) | undefined;
  let line = "";
  return {
    send(data) {
      sent.push(data);
      for (const char of data) {
        if (char === "\r") {
          const command = line.trim();
          line = "";
          write?.("\r\n");
          if (command === "couleurs") write?.(ANSI_SAMPLE.join("\r\n") + "\r\n");
          else if (command) write?.(`${command.startsWith("echo ") ? command.slice(5) : `${command} : commande inconnue`}\r\n`);
          write?.(PROMPT);
        } else if (char === "\x7f") {
          if (line) {
            line = line.slice(0, -1);
            write?.("\b \b");
          }
        } else if (char >= " ") {
          line += char;
          write?.(char);
        }
      }
    },
    subscribe(next) {
      write = next;
      next(`Bienvenue. Tapez \x1b[1mcouleurs\x1b[0m pour voir la palette.\r\n${PROMPT}`);
      return () => {
        write = undefined;
      };
    },
  };
}

const ANSI_SAMPLE = [
  "\x1b[30mnoir\x1b[0m \x1b[31mrouge\x1b[0m \x1b[32mvert\x1b[0m \x1b[33mjaune\x1b[0m \x1b[34mbleu\x1b[0m \x1b[35mmagenta\x1b[0m \x1b[36mcyan\x1b[0m \x1b[37mblanc\x1b[0m",
  "\x1b[90mnoir vif\x1b[0m \x1b[91mrouge vif\x1b[0m \x1b[92mvert vif\x1b[0m \x1b[93mjaune vif\x1b[0m \x1b[94mbleu vif\x1b[0m \x1b[95mmagenta vif\x1b[0m \x1b[96mcyan vif\x1b[0m \x1b[97mblanc vif\x1b[0m",
  "\x1b[1;31merror\x1b[0m TS2339 : la propriété « foo » n'existe pas",
];

const rows = (root: HTMLElement) => root.querySelector(".xterm-rows")?.textContent ?? "";
const statusOf = (root: HTMLElement) => within(root).getByRole("status");

const meta: Meta<typeof Terminal> = {
  title: "Composants/Terminal",
  component: Terminal,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Terminal>;

function Interactive(props: Partial<TerminalProps> & { sent?: string[] }) {
  const connection = useMemo(() => fakeShell(props.sent), [props.sent]);
  return (
    <div className="flex h-[360px] flex-col">
      <Terminal label="Console du poste" engine={loadEngine} connection={connection} fill {...props} />
    </div>
  );
}

/** Terminal branché sur un faux shell : saisie envoyée au programme, écho affiché, état « Connecté » (D-282, D-284). */
export const Interactif: Story = {
  render: () => <Interactive />,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(statusOf(canvasElement)).toHaveTextContent("Connecté"), { timeout: 4000 });
    await waitFor(() => expect(rows(canvasElement)).toContain("Bienvenue"));
    const input = canvasElement.querySelector<HTMLTextAreaElement>(".xterm-helper-textarea")!;
    await expect(input).toHaveAttribute("aria-label", "Console du poste");
    input.focus();
    await userEvent.keyboard("echo bonjour{Enter}");
    await waitFor(() => expect(rows(canvasElement)).toMatch(/bonjour.*bonjour/));
    await expect(canvasElement).toHaveTextContent(/\d+ × \d+/);
  },
};

/** Les 16 couleurs ANSI viennent des tokens `--ansi-0` à `--ansi-15`, jamais de valeurs en dur (D-281). */
export const CouleursAnsi: Story = {
  render: () => {
    const Demo = () => {
      const ref = useRef<TerminalHandle>(null);
      useEffect(() => ref.current?.write(ANSI_SAMPLE.join("\r\n")), []);
      return (
        <div className="flex h-[240px] flex-col">
          <Terminal ref={ref} label="Palette" engine={engine} readOnly fill />
        </div>
      );
    };
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole("region", { name: "Palette" });
    await waitFor(() => expect(rows(canvasElement)).toContain("rouge vif"), { timeout: 4000 });
    const probe = document.createElement("span");
    section.append(probe);
    for (const index of [1, 4, 9]) {
      probe.style.color = `var(--ansi-${index})`;
      const expected = getComputedStyle(probe).color;
      const cell = canvasElement.querySelector<HTMLElement>(`.xterm-rows .xterm-fg-${index}`)!;
      await expect(getComputedStyle(cell).color).toBe(expected);
    }
    probe.remove();
  },
};

/** La poignée sert les actions de la page : coller une commande sans l'exécuter, effacer, copier la session (D-284). */
export const Poignee: Story = {
  render: () => {
    const Demo = () => {
      const ref = useRef<TerminalHandle>(null);
      const [sent] = useState<string[]>([]);
      const [copiedText, setCopied] = useState("");
      const connection = useMemo(() => fakeShell(sent), [sent]);
      return (
        <div className="flex h-[360px] flex-col gap-2">
          <div className="flex gap-2">
            <Button size="sm" onPress={() => ref.current?.paste("ls -la")}>Coller « ls -la »</Button>
            <Button size="sm" onPress={() => ref.current?.clear()}>Effacer</Button>
            <Button size="sm" onPress={() => setCopied(ref.current?.text() ?? "")}>Copier la session</Button>
          </div>
          <Terminal ref={ref} label="Console" engine={engine} connection={connection} fill />
          <output data-testid="sent">{sent.join("")}</output>
          <output data-testid="copied">{copiedText}</output>
        </div>
      );
    };
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(rows(canvasElement)).toContain("Bienvenue"), { timeout: 4000 });
    await userEvent.click(canvas.getByRole("button", { name: "Coller « ls -la »" }));
    await waitFor(() => expect(rows(canvasElement)).toContain("ls -la"));
    await userEvent.click(canvas.getByRole("button", { name: "Copier la session" }));
    await expect(canvas.getByTestId("copied")).toHaveTextContent("Bienvenue");
    await userEvent.click(canvas.getByRole("button", { name: "Effacer" }));
    await waitFor(() => expect(rows(canvasElement)).not.toContain("Bienvenue"));
  },
};

/** F6 sort du terminal vers le contrôle suivant, Maj+F6 vers le précédent : pas de piège au clavier (D-283). */
export const SortieClavier: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Button size="sm">Avant</Button>
      <div className="flex h-[200px] flex-col">
        <Terminal label="Console" engine={engine} connection={fakeShell()} fill />
      </div>
      <Button size="sm">Après</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvasElement.querySelector(".xterm-helper-textarea")).not.toBeNull(), { timeout: 4000 });
    const input = canvasElement.querySelector<HTMLTextAreaElement>(".xterm-helper-textarea")!;
    input.focus();
    // Anneau commun sur le cadre (D-425) : 2 px, à 1 px du bord.
    const frame = getComputedStyle(canvas.getByRole("region", { name: "Console" }));
    await expect([frame.outlineStyle, frame.outlineWidth, frame.outlineOffset]).toEqual(["solid", "2px", "1px"]);
    await userEvent.keyboard("{F6}");
    await expect(canvas.getByRole("button", { name: "Après" })).toHaveFocus();
    input.focus();
    await userEvent.keyboard("{Shift>}{F6}{/Shift}");
    await expect(canvas.getByRole("button", { name: "Avant" })).toHaveFocus();
  },
};

/** Lecture seule : la saisie ne part pas, la barre d'état le dit. */
export const LectureSeule: Story = {
  render: () => {
    const Demo = () => {
      const [sent] = useState<string[]>([]);
      return (
        <>
          <Interactive readOnly sent={sent} />
          <output data-testid="sent">{sent.length}</output>
        </>
      );
    };
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(rows(canvasElement)).toContain("Bienvenue"), { timeout: 4000 });
    await expect(canvasElement).toHaveTextContent("Lecture seule");
    canvasElement.querySelector<HTMLTextAreaElement>(".xterm-helper-textarea")!.focus();
    await userEvent.keyboard("abc");
    await expect(within(canvasElement).getByTestId("sent")).toHaveTextContent("0");
  },
};

/** États de la connexion, donnés par l'app (D-282). */
export const Etats: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3">
      {(
        [
          ["connecting", undefined],
          ["open", undefined],
          ["closed", "code 0"],
          ["error", "délai dépassé"],
        ] as const
      ).map(([state, reason]) => (
        <div key={state} className="flex h-[140px] flex-col">
          <Terminal label={`Terminal ${state}`} engine={engine} state={state} {...(reason ? { reason } : {})} fill />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = (name: string) => within(canvas.getByRole("region", { name })).getByRole("status");
    await waitFor(() => expect(status("Terminal connecting")).toHaveTextContent("Connexion…"), { timeout: 4000 });
    await expect(status("Terminal open")).toHaveTextContent("Connecté");
    await expect(status("Terminal closed")).toHaveTextContent("Session terminée : code 0");
    await expect(status("Terminal error")).toHaveTextContent("Connexion interrompue : délai dépassé");
  },
};

/** Moteur introuvable : la barre d'état le dit, la page reste utilisable. */
export const MoteurIndisponible: Story = {
  render: () => (
    <div className="flex h-[140px] flex-col">
      <Terminal label="Console" engine={() => Promise.reject(new Error("xterm absent"))} fill />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(statusOf(canvasElement)).toHaveTextContent("Terminal indisponible : xterm absent"));
  },
};
