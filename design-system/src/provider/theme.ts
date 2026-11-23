/**
 * Thème d'organisation (D-337) : une organisation impose sa marque sans forker socle-ui.
 * socle-ui ne livre que le mécanisme et le ton neutre (D-001) ; l'objet thème vient d'un
 * package de l'organisation. Un thème change des tokens et quelques variantes « signature »,
 * jamais la mise en page, les tailles ni la densité.
 */
import { contrast, parseHex } from "../lib/color";
import type { IconSet } from "../icons";

/** Tokens de couleur et d'ombre qu'un thème peut redéfinir (noms sans `--`). */
export const THEME_TOKENS = [
  "surface",
  "surface-side",
  "surface-raised",
  "field",
  "hover",
  "selected",
  "line",
  "line-strong",
  "tree-line",
  "fg",
  "fg-2",
  "fg-3",
  "scrim",
  "accent",
  "accent-fg",
  "accent-text",
  "success",
  "warning",
  "danger",
  "danger-fg",
  "info",
  "tip-bg",
  "tip-fg",
  "tip-fg-2",
  "tip-line",
  "shadow-sm",
  "shadow-md",
  "shadow-lg",
  "side-bg",
  "side-fg",
  "side-fg-2",
  "side-fg-3",
  "side-hover",
  "side-selected",
  "side-selected-fg",
  "side-indicator",
  "side-line",
  "primary",
  "primary-fg",
  "focus",
  "highlight",
  "table-head-bg",
  "side-highlight",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
  "chart-7",
  "chart-8",
  "chart-seq-1",
  "chart-seq-2",
  "chart-seq-3",
  "chart-seq-4",
  "chart-seq-5",
] as const;

export type ThemeToken = (typeof THEME_TOKENS)[number];
export type ThemeMode = "light" | "dark";

export interface SocleTheme {
  /** Nom du thème, posé en `data-socle-theme` sur `<html>` (ex. « acme »). */
  name: string;
  /** Valeurs en mode clair. */
  light?: Partial<Record<ThemeToken, string>>;
  /** Valeurs en mode sombre. */
  dark?: Partial<Record<ThemeToken, string>>;
  /** Piles de polices CSS ; l'app ou le package du thème charge les fichiers. */
  fonts?: { sans?: string; mono?: string };
  /** Rayons. */
  radius?: { sm?: string; md?: string; lg?: string };
  /** Variantes signature ; la valeur par défaut est le rendu neutre. */
  signature?: {
    /** Entrée active de la sidebar : fond seul (`fill`, défaut) ou fond et barre de 3 px à gauche (`bar`). */
    navIndicator?: "fill" | "bar";
    /** Onglet actif : pastille pleine (`pill`, défaut) ou texte en accent et trait de 3 px dessous (`underline`). */
    tabs?: "pill" | "underline";
    /** En-tête de tableau : sans fond (`plain`, défaut) ou fond `--table-head-bg` (`tinted`). */
    tableHeader?: "plain" | "tinted";
    /** Bouton secondaire : fond `--field` (`fill`, défaut) ou transparent, trait et texte en `--accent-text` (`outline`). */
    buttonSecondary?: "fill" | "outline";
  };
  /** Typographie : graisse des titres (page, section, modale, panneau), par exemple `"700"`. Défaut : `--fw-semibold` (600). */
  typography?: { headingWeight?: string };
  /**
   * Jeu d'icônes de l'organisation pour les icônes internes de socle-ui (D-338). Chaque tracé est rempli
   * (`fill="currentColor"`, sans trait) dans la `viewBox` donnée, à la même taille. Une icône absente garde le tracé Lucide.
   */
  icons?: ThemeIcons;
}

/** Jeu d'icônes d'un thème : une `viewBox` commune et un tracé SVG (`d`) par icône interne remplacée. */
export type ThemeIcons = IconSet;

/** Variables qu'un accent de l'app (D-029) fixe ; elles passent avant celles du thème. */
export const ACCENT_KEYS: readonly ThemeToken[] = ["accent", "accent-fg", "accent-text", "info"];

const isToken = (k: string): k is ThemeToken => (THEME_TOKENS as readonly string[]).includes(k);

/** Variables CSS du thème pour un mode (couleurs du mode, polices, rayons). */
export function themeVariables(theme: SocleTheme, mode: ThemeMode, omit: readonly ThemeToken[] = []): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(theme[mode] ?? {})) {
    if (v && isToken(k) && !omit.includes(k)) out[`--${k}`] = v;
  }
  if (theme.fonts?.sans) out["--font-sans"] = theme.fonts.sans;
  if (theme.fonts?.mono) out["--font-mono"] = theme.fonts.mono;
  for (const size of ["sm", "md", "lg"] as const) {
    const r = theme.radius?.[size];
    if (r) out[`--radius-${size}`] = r;
  }
  if (theme.typography?.headingWeight) out["--fw-heading"] = theme.typography.headingWeight;
  return out;
}

/** Attributs de `<html>` posés par un thème (variantes complétées par leur défaut). */
export function themeAttributes(theme: SocleTheme): Record<string, string> {
  return {
    "data-socle-theme": theme.name,
    "data-nav-indicator": theme.signature?.navIndicator ?? "fill",
    "data-tabs": theme.signature?.tabs ?? "pill",
    "data-table-header": theme.signature?.tableHeader ?? "plain",
    "data-button-secondary": theme.signature?.buttonSecondary ?? "fill",
  };
}

/* Valeurs neutres de base.css, pour vérifier les paires qu'un thème ne redéfinit qu'en partie. */
const NEUTRAL: Record<ThemeMode, Partial<Record<ThemeToken, string>>> = {
  light: { surface: "#ffffff", "surface-side": "#f3f3f3", fg: "#1a1a1a", accent: "#1d4ed8", "accent-fg": "#ffffff", "accent-text": "#1d4ed8" },
  dark: { surface: "#181818", "surface-side": "#222222", fg: "#ececec", accent: "#5b8def", "accent-fg": "#0b1630", "accent-text": "#7da4f2" },
};

/**
 * Paires du thème sous AA (4,5:1) : texte sur l'accent, accent en texte sur le fond, texte de la sidebar,
 * texte accentué de la sidebar.
 * Seules les valeurs hexadécimales sont vérifiées ; une valeur absente du thème prend sa valeur neutre.
 */
export function themeContrastIssues(theme: SocleTheme): string[] {
  const issues: string[] = [];
  for (const mode of ["light", "dark"] as const) {
    const own = theme[mode] ?? {};
    if (Object.keys(own).length === 0) continue;
    // Une valeur absente prend celle du rôle générique, puis la valeur neutre.
    const fallback: Partial<Record<ThemeToken, ThemeToken>> = { "side-fg": "fg", "side-bg": "surface-side", "side-highlight": "accent-text", primary: "fg", "primary-fg": "surface" };
    const get = (k: ThemeToken): string | undefined => {
      const alias = fallback[k];
      return own[k] ?? (alias ? (own[alias] ?? NEUTRAL[mode][alias]) : NEUTRAL[mode][k]);
    };
    const pairs: Array<[ThemeToken, ThemeToken]> = [
      ["accent-fg", "accent"],
      ["primary-fg", "primary"],
      ["accent-text", "surface"],
      ["side-fg", "side-bg"],
      ["side-highlight", "side-bg"],
    ];
    for (const [fgKey, bgKey] of pairs) {
      const a = parseHex(get(fgKey) ?? "");
      const b = parseHex(get(bgKey) ?? "");
      if (!a || !b) continue;
      const ratio = contrast(a, b);
      if (ratio < 4.5) issues.push(`${mode} : --${fgKey} sur --${bgKey} = ${ratio.toFixed(2)}:1`);
    }
  }
  return issues;
}
