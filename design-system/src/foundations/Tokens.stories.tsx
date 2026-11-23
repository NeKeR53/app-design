import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { CHART_SEQ_TOKENS, CHART_TOKENS, COLOR_TOKENS, RADIUS_TOKENS, SHADOW_TOKENS, SPACE_TOKENS, TEXT_TOKENS } from "./tokens";

const meta: Meta = {
  title: "Fondations/Tokens",
  parameters: { layout: "fullscreen" },
};
export default meta;

const read = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export const Couleurs: StoryObj = {
  render: () => (
    <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
      {COLOR_TOKENS.map(([name, role]) => (
        <div key={name} className="flex items-center gap-3 rounded-md border border-line p-2">
          <span className="size-8 rounded-sm border border-line" style={{ background: `var(${name})` }} />
          <span className="min-w-0">
            <code className="text-sm">{name}</code>
            <span className="block text-sm text-fg-2">{role}</span>
          </span>
        </div>
      ))}
    </div>
  ),
  play: async () => {
    // Chaque rôle de couleur est défini.
    for (const [name] of COLOR_TOKENS) await expect(read(name)).not.toBe("");
    // Le mode sombre inverse les surfaces (D-005, D-012).
    const root = document.documentElement;
    const before = root.dataset.theme;
    root.dataset.theme = "light";
    const light = read("--surface");
    root.dataset.theme = "dark";
    const dark = read("--surface");
    if (before) root.dataset.theme = before;
    else delete root.dataset.theme;
    await expect(light).not.toBe(dark);
  },
};

/**
 * Couleurs des graphiques (D-338). Ordre fixe : la série 1 prend --chart-1, la 2 --chart-2…
 * Au-delà de 8 séries, on regroupe (« Autres ») au lieu de reprendre la liste. Les couleurs
 * d'état (succès, alerte, erreur) ne servent pas de couleurs de série.
 */
export const Graphiques: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <p className="mt-0 mb-2 text-sm text-fg-2">Catégories (ordre fixe)</p>
        <div className="flex flex-wrap gap-2">
          {CHART_TOKENS.map((name) => (
            <span key={name} className="flex flex-col items-center gap-1">
              <span data-token={name} className="h-8 w-14 rounded-sm" style={{ background: `var(${name})` }} />
              <code className="text-xs">{name}</code>
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="mt-0 mb-2 text-sm text-fg-2">Séquentiel (du clair au foncé en mode clair)</p>
        <div className="flex gap-0">
          {CHART_SEQ_TOKENS.map((name) => (
            <span key={name} className="flex flex-col items-center gap-1">
              <span data-token={name} className="h-8 w-14" style={{ background: `var(${name})` }} />
              <code className="text-xs">{name}</code>
            </span>
          ))}
        </div>
      </div>
    </div>
  ),
  play: async () => {
    const root = document.documentElement;
    const before = root.dataset.theme;
    try {
      root.dataset.theme = "light";
      await expect(read("--chart-1")).toBe("#2a78d6");
      await expect(read("--chart-8")).toBe("#e34948");
      await expect(read("--chart-seq-1")).toBe("#cde2fb");
      await expect(read("--chart-seq-5")).toBe("#104281");
      // Huit couleurs distinctes : aucune répétition dans la liste.
      await expect(new Set(CHART_TOKENS.map(read)).size).toBe(8);
      root.dataset.theme = "dark";
      await expect(read("--chart-1")).toBe("#3987e5");
      await expect(read("--chart-seq-1")).toBe("#104281");
      await expect(read("--chart-seq-5")).toBe("#86b6ef");
    } finally {
      if (before) root.dataset.theme = before;
      else delete root.dataset.theme;
    }
  },
};

export const Typographie: StoryObj = {
  render: () => (
    <div className="grid gap-3">
      {TEXT_TOKENS.map((name) => (
        <div key={name} className="flex items-baseline gap-4">
          <code className="w-24 text-sm text-fg-2">{name}</code>
          <span style={{ fontSize: `var(${name})` }}>Demandes à traiter</span>
        </div>
      ))}
    </div>
  ),
  play: async () => {
    // La densité desktop réduit la taille du texte (D-004).
    const root = document.documentElement;
    const before = root.dataset.density;
    root.dataset.density = "web";
    const web = parseFloat(read("--fs-md"));
    root.dataset.density = "desktop";
    const desktop = parseFloat(read("--fs-md"));
    root.dataset.density = before ?? "web";
    await expect(desktop).toBeLessThan(web);
  },
};

export const EspacementsRayonsOmbres: StoryObj = {
  name: "Espacements, rayons, ombres",
  render: () => (
    <div className="grid gap-6">
      <div className="grid gap-1">
        {SPACE_TOKENS.map((name) => (
          <div key={name} className="flex items-center gap-4">
            <code className="w-24 text-sm text-fg-2">{name}</code>
            <span className="h-3 rounded-sm bg-fg" style={{ width: `var(${name})` }} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {RADIUS_TOKENS.map((name) => (
          <div key={name} className="grid size-24 place-items-center border border-fg-3 text-sm" style={{ borderRadius: `var(${name})` }}>
            {name}
          </div>
        ))}
        {SHADOW_TOKENS.map((name) => (
          <div key={name} className="grid size-24 place-items-center rounded-md bg-surface-raised text-sm" style={{ boxShadow: `var(${name})` }}>
            {name}
          </div>
        ))}
      </div>
    </div>
  ),
};
