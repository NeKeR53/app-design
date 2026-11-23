import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DiffStat, DiffView } from "./DiffView";

const BEFORE = `import { readFile } from "node:fs/promises";

export interface ServerConfig {
  host: string;
  port: number;
  timeout: number;
}

const defaults: ServerConfig = {
  host: "localhost",
  port: 8080,
  timeout: 30,
};

export async function loadConfig(path: string) {
  const raw = await readFile(path, "utf8");
  const data = JSON.parse(raw);
  return { ...defaults, ...data };
}

export function describe(config: ServerConfig) {
  return \`\${config.host}:\${config.port}\`;
}

export function isLocal(config: ServerConfig) {
  return config.host === "localhost";
}
`;

const AFTER = BEFORE.replace("  timeout: number;\n", "  timeoutSeconds: number;\n  retries: number;\n")
  .replace("  timeout: 30,\n", "  timeoutSeconds: 30,\n  retries: 3,\n")
  .replace('config.host === "localhost"', 'config.host === "127.0.0.1"');

const PATCH = `diff --git a/README.md b/README.md
index 1111111..2222222 100644
--- a/README.md
+++ b/README.md
@@ -1,4 +1,4 @@
 # Atlas

-Outil de suivi.
+Outil de suivi des projets.

@@ -20,3 +20,4 @@
 ## Licence

 MIT
+Voir LICENSE.
diff --git a/docs/old.md b/docs/new.md
similarity index 100%
rename from docs/old.md
rename to docs/new.md
diff --git a/src/legacy.ts b/src/legacy.ts
deleted file mode 100644
--- a/src/legacy.ts
+++ /dev/null
@@ -1,2 +0,0 @@
-export const legacy = true;
-export default legacy;
`;

const meta: Meta<typeof DiffView> = {
  title: "Composants/DiffView",
  component: DiffView,
  parameters: { layout: "padded" },
  args: { label: "Modifications de server.ts", fileName: "src/config/server.ts", before: BEFORE, after: AFTER },
};
export default meta;
type Story = StoryObj<typeof DiffView>;

const scroller = (canvas: HTMLElement) => within(canvas).getByRole("region", { name: /Modifications/ });

/** Côte à côte par défaut ; la bascule « Côte à côte » passe en vue unifiée (D-291). */
export const BasculeDeVue: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector(".socle-diff")!;
    await expect(root).toHaveClass("socle-diff--split");
    const toggle = canvas.getByRole("button", { name: "Côte à côte" });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(toggle);
    await expect(root).toHaveClass("socle-diff--unified");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  },
};

/** Vue unifiée de départ (`defaultMode`). */
export const Unifiee: Story = { args: { defaultMode: "unified" } };

/** Sous 641 px, la vue unifiée s'impose et la bascule disparaît (D-291). */
export const Etroit: Story = {
  beforeEach: () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => {
      const result = original.call(window, query);
      if (query !== "(max-width: 640px)") return result;
      return { ...result, matches: true, media: query, addEventListener: () => {}, removeEventListener: () => {} } as MediaQueryList;
    }) as typeof window.matchMedia;
    return () => {
      window.matchMedia = original;
    };
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".socle-diff")).toHaveClass("socle-diff--unified");
    await expect(within(canvasElement).queryByRole("button", { name: "Côte à côte" })).toBeNull();
  },
};

/** Fonds et signes tirés de --success et --danger, jamais en dur (D-292). */
export const Couleurs: Story = {
  args: { defaultMode: "unified" },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(".socle-diff")!;
    const style = getComputedStyle(root);
    const probe = (value: string) => {
      const el = document.createElement("span");
      el.style.color = value;
      root.appendChild(el);
      const color = getComputedStyle(el).color;
      el.remove();
      return color;
    };
    const added = canvasElement.querySelector<HTMLElement>(".socle-diff__line.is-added")!;
    const removed = canvasElement.querySelector<HTMLElement>(".socle-diff__line.is-removed")!;
    await expect(getComputedStyle(added).backgroundColor).toBe(probe("color-mix(in srgb, var(--success) 12%, var(--surface))"));
    await expect(getComputedStyle(removed).backgroundColor).toBe(probe("color-mix(in srgb, var(--danger) 10%, var(--surface))"));
    await expect(getComputedStyle(added.querySelector(".socle-diff__sign")!).color).toBe(probe(style.getPropertyValue("--success")));
    await expect(getComputedStyle(removed.querySelector(".socle-diff__sign")!).color).toBe(probe(style.getPropertyValue("--danger")));
  },
};

/** Le sens ne passe pas par la couleur seule : signes, texte caché, compteurs nommés (D-293). */
export const Accessibilite: Story = {
  args: { defaultMode: "unified" },
  play: async ({ canvasElement }) => {
    const added = canvasElement.querySelector<HTMLElement>(".socle-diff__line.is-added")!;
    const removed = canvasElement.querySelector<HTMLElement>(".socle-diff__line.is-removed")!;
    await expect(added.textContent).toContain("+");
    await expect(added.textContent).toContain("Ajoutée : ");
    await expect(removed.textContent).toContain("−");
    await expect(removed.textContent).toContain("Retirée : ");
    const toolbar = within(canvasElement).getByRole("toolbar", { name: "Affichage des différences" });
    await expect(toolbar.textContent).toContain("5 lignes ajoutées, 3 retirées");
    await expect(scroller(canvasElement)).toHaveAccessibleDescription(/F7/);
  },
};

/** Mots changés surlignés quand les lignes ont assez en commun (D-294). */
export const MotsChanges: Story = {
  args: { defaultMode: "unified" },
  play: async ({ canvasElement }) => {
    const del = [...canvasElement.querySelectorAll("del")].map((el) => el.textContent);
    const ins = [...canvasElement.querySelectorAll("ins")].map((el) => el.textContent);
    await expect(del).toContain("localhost");
    await expect(ins.join("")).toContain("127");
    // « timeout: number; » et « timeoutSeconds: number; » ont trop peu en commun : la ligne entière a changé.
    const line = [...canvasElement.querySelectorAll(".socle-diff__line.is-removed")].find((el) => el.textContent?.includes("timeout: number"))!;
    await expect(line.querySelector("del")).toBeNull();
  },
};

/** Replis au-delà de 3 lignes, bouton par repli et bascule globale (D-295). */
export const Replis: Story = {
  args: { defaultMode: "unified" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("7 lignes inchangées")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Afficher 7 lignes" }));
    await expect(canvas.queryByText("7 lignes inchangées")).toBeNull();
    await expect(canvas.getByText(/const raw = await readFile/)).toBeVisible();
    const all = canvas.getByRole("button", { name: "Afficher les lignes inchangées" });
    await userEvent.click(all);
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await expect(canvasElement.querySelector(".socle-diff__gap")).toBeNull();
  },
};

/** Patch à plusieurs fichiers : un titre par fichier, statut, total dans l'en-tête (D-296). */
export const Patch: Story = {
  render: () => <DiffView label="Modifications du dépôt" patch={PATCH} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const titles = canvas.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    await expect(titles[0]).toContain("README.md");
    await expect(titles[1]).toContain("docs/old.md → docs/new.md");
    await expect(titles[1]).toContain("Renommé");
    await expect(titles[2]).toContain("Supprimé");
    await expect(canvas.getByRole("toolbar").textContent).toContain("3 changements");
    await expect(canvas.getByText(/2 lignes inchangées, à partir de la ligne 5|15 lignes inchangées, à partir de la ligne 5/)).toBeVisible();
  },
};

/** F7, Maj+F7, Alt+↓ et les boutons parcourent les changements, en boucle, avec annonce (D-297). */
export const Navigation: Story = {
  args: { defaultMode: "unified" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const zone = scroller(canvasElement);
    const live = canvasElement.querySelector("[aria-live]")!;
    zone.focus();
    await userEvent.keyboard("{F7}");
    await waitFor(() => expect(live.textContent).toBe("Changement 1 sur 3 : avant, ligne 6 ; après, lignes 6 à 7"));
    await expect(canvasElement.querySelectorAll(".socle-diff__row.is-current").length).toBe(3);
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await waitFor(() => expect(live.textContent).toMatch(/^Changement 2 sur 3/));
    await userEvent.keyboard("{Shift>}{F7}{/Shift}");
    await waitFor(() => expect(live.textContent).toMatch(/^Changement 1 sur 3/));
    await userEvent.keyboard("{Shift>}{F7}{/Shift}");
    await waitFor(() => expect(live.textContent).toMatch(/^Changement 3 sur 3/));
    await userEvent.click(canvas.getByRole("button", { name: "Changement suivant" }));
    await waitFor(() => expect(live.textContent).toMatch(/^Changement 1 sur 3/));
  },
};

const BIG_BEFORE = Array.from({ length: 20000 }, (_, i) => `ligne ${i + 1} : valeur ${i % 97}`).join("\n");
const BIG_AFTER = BIG_BEFORE.replace("ligne 10000 : valeur 9", "ligne 10000 : valeur modifiée").replace("ligne 19990 :", "ligne 19990 (revue) :");

/** 20 000 lignes : seules les rangées visibles sont dessinées (D-298). */
export const GrosFichier: Story = {
  args: { label: "Modifications de data.txt", fileName: "data.txt", before: BIG_BEFORE, after: BIG_AFTER, fill: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Afficher les lignes inchangées" }));
    await waitFor(() => expect(canvasElement.querySelector(".socle-diff__content")!.getBoundingClientRect().height).toBeGreaterThan(20000 * 20 - 1));
    await expect(canvasElement.querySelectorAll(".socle-diff__row").length).toBeLessThan(120);
    await expect(canvasElement.querySelector(".socle-diff")!.getBoundingClientRect().height).toBeLessThanOrEqual(722);
  },
};

/** Avis : binaire, fins de ligne converties, diff coupé (D-299). */
export const Avis: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <DiffView label="Modifications de logo.png" fileName="logo.png" before={"PNG\0a"} after={"PNG\0b"} />
      <DiffView label="Modifications de notes.txt" fileName="notes.txt" before={"un\r\ndeux\r\n"} after={"un\ndeux\n"} />
      <DiffView label="Modifications coupées" patch={"--- a/a.txt\n+++ b/a.txt\n@@ -1 +1 @@\n-a\n+b\n"} truncated />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Fichier binaire : contenu non comparé")).toBeVisible();
    await expect(canvas.getByText("Fichier binaire")).toBeVisible();
    await expect(canvas.getByText("Fins de ligne converties : CRLF → LF")).toBeVisible();
    await expect(canvas.getByText("Diff coupé : la suite n'est pas affichée")).toBeVisible();
  },
};

/** Deux textes identiques : état vide, navigation désactivée (D-296). */
export const Identique: Story = {
  args: { before: "a\nb\n", after: "a\nb\n", fileName: "package.json", label: "Modifications de package.json" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("Aucune différence").length).toBeGreaterThan(0);
    await expect(canvas.getByText("Les deux versions sont identiques.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Changement suivant" })).toBeDisabled();
  },
};

/** Occupe la hauteur de son conteneur (`fill`). */
export const Remplir: Story = {
  args: { fill: true },
  render: (args) => (
    <div className="flex h-[360px] flex-col">
      <DiffView {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(Math.round(canvasElement.querySelector(".socle-diff")!.getBoundingClientRect().height)).toBe(360);
  },
};

/** `DiffStat` seul, en fin de ligne d'une liste de fichiers (D-290). */
export const Compteurs: Story = {
  render: () => (
    <ul className="m-0 flex w-80 list-none flex-col gap-1 p-0 font-sans text-md text-fg">
      <li className="flex items-center justify-between font-mono text-sm">
        src/config/server.ts <DiffStat added={4} removed={3} />
      </li>
      <li className="flex items-center justify-between font-mono text-sm">
        docs/guide.md <DiffStat added={5} removed={1} />
      </li>
    </ul>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent).toContain("+4");
    await expect(canvasElement.textContent).toContain("−3");
    await expect(canvasElement.textContent).toContain("4 lignes ajoutées, 3 retirées");
  },
};
