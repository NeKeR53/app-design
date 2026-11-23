import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { COLOR_TOKENS, RADIUS_TOKENS, SHADOW_TOKENS, SPACE_TOKENS, TEXT_TOKENS } from "./tokens";

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
