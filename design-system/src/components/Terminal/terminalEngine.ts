/*
 * Moteur du Terminal : xterm.js, fourni par l'app (D-280), ajusté à son conteneur et aux tokens (D-281).
 * Socle n'importe jamais xterm : il décrit ici la petite partie de son API qu'il utilise.
 * Repris d'Alfred (src/ui/components/terminalEngine.ts).
 */

/** Couleurs passées à xterm. */
export interface XTermTheme {
  background?: string;
  foreground?: string;
  cursor?: string;
  cursorAccent?: string;
  selectionBackground?: string;
  selectionForeground?: string;
  black?: string;
  red?: string;
  green?: string;
  yellow?: string;
  blue?: string;
  magenta?: string;
  cyan?: string;
  white?: string;
  brightBlack?: string;
  brightRed?: string;
  brightGreen?: string;
  brightYellow?: string;
  brightBlue?: string;
  brightMagenta?: string;
  brightCyan?: string;
  brightWhite?: string;
}

/** Options d'xterm que Socle règle. */
export interface XTermOptions {
  allowProposedApi?: boolean;
  cursorBlink?: boolean;
  disableStdin?: boolean;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  scrollback?: number;
  screenReaderMode?: boolean;
  theme?: XTermTheme;
  minimumContrastRatio?: number;
}

interface Disposable {
  dispose(): void;
}

/** La partie d'un terminal xterm que Socle utilise. */
export interface XTermInstance extends Disposable {
  readonly cols: number;
  readonly rows: number;
  options: XTermOptions;
  readonly buffer: { readonly active: { readonly length: number; getLine(y: number): { translateToString(trimRight?: boolean): string } | undefined } };
  readonly modes: { readonly bracketedPasteMode: boolean };
  readonly textarea: HTMLTextAreaElement | undefined;
  open(parent: HTMLElement): void;
  write(data: string | Uint8Array): void;
  paste(data: string): void;
  focus(): void;
  clear(): void;
  getSelection(): string;
  hasSelection(): boolean;
  loadAddon(addon: FitAddonInstance): void;
  attachCustomKeyEventHandler(handler: (event: KeyboardEvent) => boolean): void;
  onData(listener: (data: string) => void): Disposable;
  onResize(listener: (size: { cols: number; rows: number }) => void): Disposable;
}

export interface FitAddonInstance extends Disposable {
  activate(terminal: never): void;
  fit(): void;
}

/**
 * Le moteur que l'app passe à `Terminal` (D-280) : les classes `Terminal` de `@xterm/xterm` et `FitAddon` de
 * `@xterm/addon-fit`.
 */
export interface TerminalEngine {
  Terminal: new (options: XTermOptions) => XTermInstance;
  FitAddon: new () => FitAddonInstance;
}

/** Le moteur, ou une fonction qui le charge à la première ouverture d'un terminal. */
export type TerminalEngineSource = TerminalEngine | (() => TerminalEngine | Promise<TerminalEngine>);

export interface OpenedTerminal {
  write(data: string | Uint8Array): void;
  focus(): void;
  clear(): void;
  text(lines?: number): string;
  selection(): string;
  paste(value: string): void;
  bracketedPaste(): boolean;
  dispose(): void;
}

export interface OpenTerminalOptions {
  label: string;
  description: string;
  readOnly: boolean;
  isMac: boolean;
  onData(data: string): void;
  onResize(size: { cols: number; rows: number }): void;
  onLeave(direction: "forward" | "backward"): void;
  onCopy(text: string): void;
}

export type TerminalKeyAction = "copy" | "paste" | "leave-forward" | "leave-backward" | "terminal";

/**
 * Raccourcis de Windows Terminal (D-283) : Ctrl+C copie seulement quand du texte est choisi (sinon il interrompt le
 * programme), Ctrl+Maj+C copie toujours, Ctrl+V et Ctrl+Maj+V collent, F6 et Maj+F6 sortent du terminal. Sur macOS,
 * ⌘C et ⌘V restent ceux du système.
 */
export function terminalKeyAction(
  event: Pick<KeyboardEvent, "type" | "key" | "ctrlKey" | "shiftKey" | "altKey" | "metaKey">,
  hasSelection: boolean,
): TerminalKeyAction {
  if (event.type !== "keydown" || event.altKey || event.metaKey) return "terminal";
  if (event.key === "F6" && !event.ctrlKey) return event.shiftKey ? "leave-backward" : "leave-forward";
  if (!event.ctrlKey) return "terminal";
  const key = event.key.toLowerCase();
  if (key === "c" && (event.shiftKey || hasSelection)) return "copy";
  if (key === "v") return "paste";
  return "terminal";
}

let colorCanvas: CanvasRenderingContext2D | null | undefined;

/** xterm ne lit que les couleurs rgb : une couleur calculée (oklch, hex…) est ramenée en rgb par un canevas. */
function rgbColor(value: string, alpha?: number) {
  try {
    colorCanvas ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  } catch {
    colorCanvas = null;
  }
  if (!colorCanvas) return value;
  colorCanvas.clearRect(0, 0, 1, 1);
  colorCanvas.fillStyle = value;
  colorCanvas.fillRect(0, 0, 1, 1);
  const [red, green, blue] = colorCanvas.getImageData(0, 0, 1, 1).data;
  return alpha === undefined ? `rgb(${red}, ${green}, ${blue})` : `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

const ANSI_NAMES = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "brightBlack",
  "brightRed",
  "brightGreen",
  "brightYellow",
  "brightBlue",
  "brightMagenta",
  "brightCyan",
  "brightWhite",
] as const;

/** Couleurs du mode courant, lues dans les tokens (D-281) ; en contraste élevé, celles du système. */
export function terminalTheme(element: HTMLElement): { theme: XTermTheme; minimumContrastRatio: number } {
  const forced = window.matchMedia?.("(forced-colors: active)").matches ?? false;
  const probe = document.createElement("span");
  element.append(probe);
  const resolve = (color: string, alpha?: number) => {
    probe.style.color = color;
    return rgbColor(getComputedStyle(probe).color, alpha);
  };
  try {
    if (forced) {
      const text = resolve("CanvasText");
      return {
        theme: {
          background: resolve("Canvas"),
          foreground: text,
          cursor: text,
          cursorAccent: resolve("Canvas"),
          selectionBackground: resolve("Highlight"),
          selectionForeground: resolve("HighlightText"),
          ...Object.fromEntries(ANSI_NAMES.map((name) => [name, text])),
        },
        minimumContrastRatio: 7,
      };
    }
    return {
      theme: {
        background: resolve("var(--surface)"),
        foreground: resolve("var(--fg)"),
        cursor: resolve("var(--accent)"),
        cursorAccent: resolve("var(--surface)"),
        selectionBackground: resolve("var(--accent)", 0.3),
        ...Object.fromEntries(ANSI_NAMES.map((name, index) => [name, resolve(`var(--ansi-${index})`)])),
      },
      // Garde lisibles les couleurs 256 et RVB prévues pour un fond sombre quand le mode est clair.
      minimumContrastRatio: 4.5,
    };
  } finally {
    probe.remove();
  }
}

function monoFont(element: HTMLElement) {
  return getComputedStyle(element).getPropertyValue("--font-mono").trim() || "ui-monospace, monospace";
}

export function openTerminal(engine: TerminalEngine, element: HTMLElement, options: OpenTerminalOptions): OpenedTerminal {
  const instance = new engine.Terminal({
    allowProposedApi: false,
    cursorBlink: !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    disableStdin: options.readOnly,
    fontFamily: monoFont(element),
    fontSize: 13,
    lineHeight: 1.2,
    scrollback: 5_000,
    screenReaderMode: true,
    ...terminalTheme(element),
  });
  const fit = new engine.FitAddon();
  instance.loadAddon(fit);
  instance.attachCustomKeyEventHandler((event) => {
    const action = options.isMac ? (event.key === "F6" ? terminalKeyAction(event, false) : "terminal") : terminalKeyAction(event, instance.hasSelection());
    if (action === "copy") {
      event.preventDefault();
      const selection = instance.getSelection();
      if (selection) options.onCopy(selection);
      return false;
    }
    // Laisse le navigateur produire l'événement « coller », qu'xterm transmet au programme.
    if (action === "paste") return false;
    if (action === "leave-forward" || action === "leave-backward") {
      event.preventDefault();
      options.onLeave(action === "leave-forward" ? "forward" : "backward");
      return false;
    }
    return true;
  });
  const data = instance.onData((value) => {
    if (!options.readOnly) options.onData(value);
  });
  // La taille est dite une fois ajustée au conteneur, puis à chaque changement, jamais deux fois la même.
  let reported = "";
  const report = () => {
    const key = `${instance.cols}x${instance.rows}`;
    if (key === reported) return;
    reported = key;
    options.onResize({ cols: instance.cols, rows: instance.rows });
  };
  const resize = instance.onResize(report);
  instance.open(element);
  instance.textarea?.setAttribute("aria-label", options.label);
  instance.textarea?.setAttribute("aria-description", options.description);

  let frame = 0;
  const refit = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (element.clientWidth && element.clientHeight) fit.fit();
      report();
    });
  };
  refit();
  const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(refit);
  observer?.observe(element);

  // Le mode (data-theme), la densité et l'accent de l'app (feuille injectée par SocleProvider) changent les tokens.
  const applyTheme = () => {
    const { theme, minimumContrastRatio } = terminalTheme(element);
    instance.options.theme = theme;
    instance.options.minimumContrastRatio = minimumContrastRatio;
  };
  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
  themeObserver.observe(document.head, { childList: true, subtree: true, characterData: true });
  const media = ["(prefers-color-scheme: dark)", "(forced-colors: active)"].flatMap((query) => {
    const list = window.matchMedia?.(query);
    return list ? [list] : [];
  });
  for (const list of media) list.addEventListener("change", applyTheme);

  return {
    write: (value) => instance.write(value),
    focus: () => instance.focus(),
    clear: () => instance.clear(),
    text: (lines) => {
      const buffer = instance.buffer.active;
      const all: string[] = [];
      for (let index = 0; index < buffer.length; index += 1) all.push(buffer.getLine(index)?.translateToString(true) ?? "");
      while (all.length && !all[all.length - 1]) all.pop();
      return (lines ? all.slice(-lines) : all).join("\n");
    },
    selection: () => instance.getSelection(),
    paste: (value) => instance.paste(value),
    bracketedPaste: () => instance.modes.bracketedPasteMode,
    dispose: () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      themeObserver.disconnect();
      for (const list of media) list.removeEventListener("change", applyTheme);
      data.dispose();
      resize.dispose();
      instance.dispose();
    },
  };
}
