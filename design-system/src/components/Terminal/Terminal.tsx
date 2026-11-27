/*
 * Terminal interactif sur xterm.js, fourni par l'app. Spec : Terminal.spec.md. Décisions : D-280 à D-284.
 * Repris d'Alfred (src/ui/components/Terminal.tsx), sans le canal propre à son SDK.
 */
import { type Ref, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useMessages, useSocle } from "../../provider/SocleProvider";
import { copyText } from "../../lib/clipboard";
import { cx, focusWithinRing } from "../../lib/cx";
import { Badge, type StatusTone } from "../Badge/Badge";
import { openTerminal, type OpenedTerminal, type TerminalEngine, type TerminalEngineSource } from "./terminalEngine";

/** Branchement au programme (D-284) : ce que l'utilisateur tape part par `send`, ce que le programme écrit arrive par `subscribe`. */
export interface TerminalConnection {
  /** Envoie au programme ce que l'utilisateur tape ou colle. */
  send(data: string): unknown;
  /** Reçoit ce que le programme écrit (texte ou octets) ; rend le désabonnement. */
  subscribe(write: (data: string | Uint8Array) => void): () => void;
}

/** État de la connexion, affiché dans la barre d'état (D-282). */
export type TerminalState = "connecting" | "open" | "closed" | "error";

export interface TerminalProps {
  /** Nom du terminal, pour les lecteurs d'écran : « Console du conteneur web-01 ». */
  label: string;
  /** xterm.js, fourni par l'app (D-280) : `{ Terminal, FitAddon }`, ou une fonction qui le charge. */
  engine: TerminalEngineSource;
  /** Branchement au programme. Sans lui, le terminal n'affiche que ce que l'app écrit par la poignée. */
  connection?: TerminalConnection;
  /** Taille en colonnes et lignes : à l'ouverture, puis une fois à la fin de chaque redimensionnement. */
  onResize?: (size: { cols: number; rows: number }) => unknown;
  /** État de la connexion. Défaut : « Connecté » une fois le terminal ouvert. */
  state?: TerminalState;
  /** Raison affichée après « Session terminée » ou « Connexion interrompue ». */
  reason?: string;
  /** Lecture seule : la saisie n'est pas envoyée. Fixé à l'ouverture. */
  readOnly?: boolean;
  /** Occupe la hauteur restante du conteneur (colonne flexible). */
  fill?: boolean;
  /** Poignée pour les actions de la page : effacer, copier, coller une commande (D-284). */
  ref?: Ref<TerminalHandle>;
}

/** Poignée d'un `Terminal`. Ses méthodes ne font rien tant que le moteur n'est pas chargé ; `write` met en attente. */
export interface TerminalHandle {
  /** Écrit dans le terminal, comme le ferait le programme. */
  write(data: string | Uint8Array): void;
  /** Vide l'écran et l'historique ; l'invite courante reste. */
  clear(): void;
  /** Texte affiché, historique compris ; les `lines` dernières lignes seulement si précisé. */
  text(lines?: number): string;
  /** Texte choisi, vide sans sélection. */
  selection(): string;
  /** Colle le texte comme l'utilisateur : il part au programme, sans Entrée ajoutée. */
  paste(value: string): void;
  /** Le programme a demandé le collage encadré : un texte sur plusieurs lignes collé ne s'exécute pas d'office. */
  bracketedPaste(): boolean;
  focus(): void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** F6 sort du terminal, qui garde sinon Tab et toutes les touches (WCAG 2.1.2) : focus au contrôle voisin (D-283). */
function leave(container: HTMLElement, direction: "forward" | "backward") {
  const all = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (element) => !container.contains(element) && element.getClientRects().length > 0,
  );
  const after = all.filter((element) => container.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING);
  const before = all.filter((element) => container.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING);
  const target = direction === "forward" ? (after[0] ?? before[0]) : (before.at(-1) ?? after.at(-1));
  target?.focus();
}

async function loadEngine(source: TerminalEngineSource): Promise<TerminalEngine> {
  return typeof source === "function" ? source() : source;
}

/** Écran xterm sur `--surface`, cadre `--line`, barre d'état dessous (D-282). */
export function Terminal({ label, engine, connection, onResize, state, reason, readOnly = false, fill = false, ref }: TerminalProps) {
  const m = useMessages();
  const { isMac } = useSocle();
  const container = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const opened = useRef<OpenedTerminal | null>(null);
  /** Ce qui arrive avant que le moteur soit prêt. */
  const pending = useRef<(string | Uint8Array)[]>([]);
  const [ready, setReady] = useState(false);
  const [failure, setFailure] = useState<string>();
  const [size, setSize] = useState<{ cols: number; rows: number }>();
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const latest = useRef({ connection, onResize, readOnly });
  useEffect(() => {
    latest.current = { connection, onResize, readOnly };
  });

  const write = useCallback((data: string | Uint8Array) => {
    if (opened.current) opened.current.write(data);
    else pending.current.push(data);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      write,
      clear: () => opened.current?.clear(),
      text: (lines) => opened.current?.text(lines) ?? "",
      selection: () => opened.current?.selection() ?? "",
      paste: (value) => opened.current?.paste(value),
      bracketedPaste: () => opened.current?.bracketedPaste() ?? false,
      focus: () => opened.current?.focus(),
    }),
    [write],
  );

  // Ouverture, une fois par terminal : le nom, la lecture seule et le moteur sont fixés à l'ouverture (changer de session : `key`).
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let first = true;
    loadEngine(engine)
      .then((loaded) => {
        if (disposed) return;
        const terminal = openTerminal(loaded, element, {
          label,
          description: readOnly ? m.terminalReadOnlyDescription : m.terminalDescription,
          readOnly,
          isMac,
          onData: (data) => {
            const { connection: current, readOnly: locked } = latest.current;
            if (locked || !current) return;
            void Promise.resolve()
              .then(() => current.send(data))
              .catch(() => undefined);
          },
          onResize: (next) => {
            setSize(next);
            // La première taille part tout de suite ; un redimensionnement n'en envoie qu'une, à la fin (D-284).
            clearTimeout(resizeTimer);
            const send = () =>
              void Promise.resolve()
                .then(() => latest.current.onResize?.(next))
                .catch(() => undefined);
            if (first) {
              first = false;
              send();
            } else resizeTimer = setTimeout(send, 120);
          },
          onLeave: (direction) => {
            if (container.current) leave(container.current, direction);
          },
          onCopy: (text) => {
            copyText(text).then(
              () => setCopied("copied"),
              () => setCopied("failed"),
            );
          },
        });
        opened.current = terminal;
        for (const data of pending.current) terminal.write(data);
        pending.current = [];
        setReady(true);
      })
      .catch((error: unknown) => {
        if (!disposed) setFailure(error instanceof Error ? error.message : String(error));
      });
    return () => {
      disposed = true;
      clearTimeout(resizeTimer);
      opened.current?.dispose();
      opened.current = null;
    };
  }, []);

  // Lecture de la connexion.
  useEffect(() => {
    if (!connection) return;
    return connection.subscribe(write);
  }, [connection, write]);

  useEffect(() => {
    if (copied === "idle") return;
    const timer = setTimeout(() => setCopied("idle"), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const shown: TerminalState = state ?? (connection || ready ? "open" : "connecting");
  const status: { tone: StatusTone; text: string } = failure
    ? { tone: "danger", text: m.terminalUnavailable(failure) }
    : !ready
      ? { tone: "pending", text: m.terminalOpening }
      : shown === "error"
        ? { tone: "danger", text: m.terminalError(reason) }
        : shown === "closed"
          ? { tone: "neutral", text: m.terminalClosed(reason) }
          : shown === "connecting"
            ? { tone: "pending", text: m.terminalConnecting }
            : { tone: "success", text: m.terminalOpen };
  const hint = copied === "copied" ? m.selectionCopied : copied === "failed" ? m.copyFailed : readOnly ? m.terminalReadOnly : m.terminalLeave;

  return (
    <section
      ref={container}
      aria-label={label}
      className={cx(
        "socle-box socle-terminal flex min-w-0 flex-col overflow-hidden rounded-md border border-solid border-line bg-surface font-sans",
        focusWithinRing,
        fill ? "min-h-0 flex-1" : "h-[min(560px,max(280px,calc(100dvh-240px)))]",
      )}
    >
      <div ref={host} className="min-h-0 min-w-0 flex-1 overflow-hidden pt-2 pr-0 pb-1 pl-3" />
      <div className="flex min-h-7 flex-none items-center gap-3 border-t border-solid border-line bg-surface-side px-3 py-0.5 text-sm text-fg-2 tabular-nums">
        <span role="status" className={cx("min-w-0 truncate", status.tone === "danger" && "[&_span]:text-danger")}>
          <Badge tone={status.tone}>{status.text}</Badge>
        </span>
        <span className="ml-auto whitespace-nowrap" aria-live="polite">
          {hint}
        </span>
        {size ? (
          <span className="whitespace-nowrap">
            <span className="sr-only">{m.terminalSize} : </span>
            {size.cols} × {size.rows}
          </span>
        ) : null}
      </div>
    </section>
  );
}
