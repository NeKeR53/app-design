/**
 * SocleProvider (D-029) : placé une seule fois à la racine de l'app.
 * Il fixe quatre réglages par app : accent, densité par défaut, plateforme,
 * préfixe des données mémorisées. Une organisation peut y ajouter son thème (D-337, D-338). Les choix de l'utilisateur (mode, densité)
 * passent avant les défauts de l'app (D-005). Tout le reste est verrouillé.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { contrast, mixWithWhite, parseHex, toHex } from "../lib/color";
import { frenchMessages, type SocleMessages } from "../i18n/messages";
import { ConfirmProvider } from "../components/Modal/useConfirm";
import { FormDialogProvider } from "../templates/FormDialog/FormDialog";
import type { Notifications, NotifyOptions } from "../components/Toast/notifications";
import { ToastRegion } from "../components/Toast/Toast";
import { ThemeIconsContext } from "../icons";
import { ACCENT_KEYS, themeAttributes, themeContrastIssues, themeVariables, type SocleTheme, type ThemeMode } from "./theme";

export type Platform = "web" | "macos" | "windows";
export type Density = "web" | "desktop";
export type ColorScheme = "system" | "light" | "dark";

export interface SocleProviderProps {
  /** Couleur d'accent de l'app, en hexadécimal (#rrggbb). Défaut : bleu T2 (D-012). */
  accent?: string;
  /** Densité par défaut. Défaut : `desktop` en Tauri, `web` sinon (D-004). */
  density?: Density;
  /** Plateforme. Défaut : détection automatique (D-020). */
  platform?: Platform;
  /**
   * La fenêtre est en plein écran (macOS) : l'AppShell ne réserve plus la place des boutons de fenêtre
   * et la barre du haut ne déplace plus la fenêtre (D-020). L'app le pilote ; défaut : `false`.
   */
  isFullscreen?: boolean;
  /** Préfixe des données mémorisées (sidebar, largeur du détail, dernière vue). Défaut : `socle`. */
  storageKey?: string;
  /** Libellés internes traduits (D-089). Défaut : français ; une entrée absente garde la valeur française. */
  messages?: Partial<SocleMessages>;
  /** File de notifications de l'app (`createNotifications()`). Si elle est fournie, le provider affiche les toasts (Toast.spec.md). */
  notifications?: Notifications;
  /** Thème d'organisation (D-337) : tokens et variantes signature. Sans thème : rendu neutre. `accent` passe avant l'accent du thème. */
  theme?: SocleTheme;
  children: ReactNode;
}

interface SocleContextValue {
  platform: Platform;
  /** La fenêtre est en plein écran (option `isFullscreen` du provider, D-020). */
  isFullscreen: boolean;
  /** Vrai sur macOS (web compris) : sert à l'affichage des raccourcis (D-006). */
  isMac: boolean;
  storageKey: string;
  density: Density;
  setDensity: (d: Density) => void;
  colorScheme: ColorScheme;
  setColorScheme: (c: ColorScheme) => void;
  messages: SocleMessages;
  notifications: Notifications | null;
}

const SocleContext = createContext<SocleContextValue | null>(null);

function detectIsMac(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  return /mac/i.test(nav.userAgentData?.platform ?? nav.platform ?? "");
}

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "web";
  const isTauri = "__TAURI_INTERNALS__" in window || "__TAURI__" in window;
  if (!isTauri) return "web";
  return detectIsMac() ? "macos" : "windows";
}

function readStored<T extends string>(key: string, allowed: readonly T[]): T | null {
  try {
    const v = localStorage.getItem(key);
    return v && (allowed as readonly string[]).includes(v) ? (v as T) : null;
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* stockage indisponible : le choix vaut pour la session */
  }
}

const LIGHT_SURFACE: [number, number, number] = [255, 255, 255];
const DARK_SURFACE: [number, number, number] = [24, 24, 24];
const DARK_FG: [number, number, number] = [17, 17, 17];

/** Calcule les variables d'accent ; renvoie null si un contraste ne passe pas AA. */
export function accentVariables(accent: string): { light: Record<string, string>; dark: Record<string, string> } | null {
  const rgb = parseHex(accent);
  if (!rgb) return null;
  const dark = mixWithWhite(rgb, 0.35);
  const darkFg = contrast(dark, DARK_FG) >= 4.5 ? DARK_FG : LIGHT_SURFACE;
  const ok =
    contrast(rgb, LIGHT_SURFACE) >= 4.5 && // texte blanc sur l'accent, et accent en texte sur fond clair
    contrast(dark, DARK_SURFACE) >= 4.5 && // accent en texte sur fond sombre
    contrast(dark, darkFg) >= 4.5;
  if (!ok) return null;
  return {
    light: { "--accent": toHex(rgb), "--accent-fg": "#ffffff", "--accent-text": toHex(rgb), "--info": toHex(rgb) },
    dark: { "--accent": toHex(dark), "--accent-fg": toHex(darkFg), "--accent-text": toHex(dark), "--info": toHex(dark) },
  };
}

function accentCss(vars: NonNullable<ReturnType<typeof accentVariables>>): string {
  const block = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => `${k}:${v};`).join("");
  return (
    `:root{${block(vars.light)}}` +
    `@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${block(vars.dark)}}}` +
    `:root[data-theme="dark"]{${block(vars.dark)}}`
  );
}

export function SocleProvider({ accent, density, platform, isFullscreen = false, storageKey = "socle", messages, notifications, theme, children }: SocleProviderProps) {
  const resolvedPlatform = useMemo(() => platform ?? detectPlatform(), [platform]);
  const isMac = resolvedPlatform === "macos" || (resolvedPlatform === "web" && detectIsMac());
  const defaultDensity: Density = density ?? (resolvedPlatform === "web" ? "web" : "desktop");

  const [userDensity, setUserDensity] = useState<Density | null>(() => readStored(`${storageKey}:density`, ["web", "desktop"] as const));
  const [userScheme, setUserScheme] = useState<ColorScheme>(
    () => readStored(`${storageKey}:color-scheme`, ["light", "dark"] as const) ?? "system",
  );
  const currentDensity = userDensity ?? defaultDensity;

  // Densité : le choix de l'utilisateur passe avant le défaut de l'app.
  useEffect(() => {
    document.documentElement.dataset.density = currentDensity;
  }, [currentDensity]);

  // Mode : n'écrit data-theme que si l'utilisateur a fait un choix (sinon : système).
  useEffect(() => {
    const root = document.documentElement;
    if (userScheme !== "system") {
      root.dataset.theme = userScheme;
      root.dataset.socleScheme = "user";
    } else if (root.dataset.socleScheme) {
      delete root.dataset.theme;
      delete root.dataset.socleScheme;
    }
  }, [userScheme]);

  // Accent : variables clair et sombre ; défaut conservé si un contraste échoue.
  useEffect(() => {
    if (!accent) return;
    const vars = accentVariables(accent);
    if (!vars) {
      console.warn(`[socle-ui] Accent « ${accent} » refusé : contraste insuffisant (AA). L'accent par défaut est conservé.`);
      return;
    }
    const style = document.createElement("style");
    style.dataset.socleAccent = "";
    style.textContent = accentCss(vars);
    document.head.appendChild(style);
    return () => style.remove();
  }, [accent]);

  // Thème d'organisation (D-337) : variables en style en ligne sur <html> pour le mode actif,
  // réécrites quand le mode change ; attributs des variantes signature. Rien sans thème.
  const themeKey = theme ? JSON.stringify(theme) : "";
  const accentWins = Boolean(accent && accentVariables(accent));
  useEffect(() => {
    if (!themeKey) return;
    const t = JSON.parse(themeKey) as SocleTheme;
    const root = document.documentElement;
    // Contrastes vérifiés comme pour l'accent (D-029), mais le thème est gardé :
    // ses couleurs relèvent de l'organisation qui le publie.
    const issues = themeContrastIssues(t);
    if (issues.length)
      console.warn(`[socle-ui] Thème « ${t.name} » : contraste insuffisant (AA) — ${issues.join(" ; ")}. Le thème est appliqué tel quel.`);
    const attrs = themeAttributes(t);
    for (const [k, v] of Object.entries(attrs)) root.setAttribute(k, v);
    const omit = accentWins ? ACCENT_KEYS : [];
    const media = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    let applied: string[] = [];
    const apply = () => {
      const forced = root.dataset.theme;
      const mode: ThemeMode = forced === "light" || forced === "dark" ? forced : media?.matches ? "dark" : "light";
      const vars = themeVariables(t, mode, omit);
      for (const k of applied) if (!(k in vars)) root.style.removeProperty(k);
      for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
      applied = Object.keys(vars);
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    media?.addEventListener("change", apply);
    return () => {
      observer.disconnect();
      media?.removeEventListener("change", apply);
      for (const k of applied) root.style.removeProperty(k);
      for (const k of Object.keys(attrs)) root.removeAttribute(k);
      if (root.getAttribute("style") === "") root.removeAttribute("style");
    };
  }, [themeKey, accentWins]);

  const setDensity = useCallback(
    (d: Density) => {
      setUserDensity(d);
      writeStored(`${storageKey}:density`, d);
    },
    [storageKey],
  );
  const setColorScheme = useCallback(
    (c: ColorScheme) => {
      setUserScheme(c);
      writeStored(`${storageKey}:color-scheme`, c === "system" ? null : c);
    },
    [storageKey],
  );

  // Jeu d'icônes du thème (D-338) : passé par contexte aux icônes internes, sans état global.
  const iconSet = useMemo(() => (themeKey ? ((JSON.parse(themeKey) as SocleTheme).icons ?? null) : null), [themeKey]);

  const merged = useMemo<SocleMessages>(() => ({ ...frenchMessages, ...messages }), [messages]);
  const value = useMemo<SocleContextValue>(
    () => ({
      platform: resolvedPlatform,
      isFullscreen,
      isMac,
      storageKey,
      density: currentDensity,
      setDensity,
      colorScheme: userScheme,
      setColorScheme,
      messages: merged,
      notifications: notifications ?? null,
    }),
    [resolvedPlatform, isFullscreen, isMac, storageKey, currentDensity, setDensity, userScheme, setColorScheme, merged, notifications],
  );
  // La confirmation (D-127) et la région des toasts (D-154) sont affichées ici, une seule fois pour toute l'app.
  return (
    <SocleContext.Provider value={value}>
      <ThemeIconsContext.Provider value={iconSet}>
        <ConfirmProvider>
          <FormDialogProvider>{children}</FormDialogProvider>
        </ConfirmProvider>
        {notifications ? <ToastRegion notifications={notifications} /> : null}
      </ThemeIconsContext.Provider>
    </SocleContext.Provider>
  );
}

const FALLBACK: SocleContextValue = {
  platform: "web",
  isFullscreen: false,
  isMac: false,
  storageKey: "socle",
  density: "web",
  setDensity: () => {},
  colorScheme: "system",
  setColorScheme: () => {},
  messages: frenchMessages,
  notifications: null,
};

/** Réglages de l'app et choix de l'utilisateur. Sans provider : valeurs par défaut. */
export function useSocle(): SocleContextValue {
  return useContext(SocleContext) ?? { ...FALLBACK, isMac: detectIsMac() };
}

/** Libellés internes (D-089). */
export function useMessages(): SocleMessages {
  return useSocle().messages;
}

/** File de notifications du provider, ou null sans `notifications`. */
export function useNotifications(): Notifications | null {
  return useSocle().notifications;
}

/** Fonction `notify` de la file du provider (Toast.spec.md). Sans file : avertit et ne fait rien. */
export function useNotify(): (options: NotifyOptions) => string {
  const notifications = useNotifications();
  return useCallback(
    (options: NotifyOptions) => {
      if (notifications) return notifications.notify(options);
      console.warn("[socle-ui] notify() sans file : passez createNotifications() à SocleProvider (option notifications).");
      return "";
    },
    [notifications],
  );
}

/** État mémorisé, préfixé par `storageKey` (D-007, règle 3). */
export function useStoredState<T>(name: string, initial: T): [T, (v: T) => void] {
  const { storageKey } = useSocle();
  const key = `${storageKey}:${name}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (v: T) => {
      setValue(v);
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {
        /* stockage indisponible */
      }
    },
    [key],
  );
  return [value, set];
}
