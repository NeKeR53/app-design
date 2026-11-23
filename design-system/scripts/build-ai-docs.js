// Génère le dossier `ai/`, livré avec le package : la documentation que l'IA
// d'une app lit dans node_modules/socle-ui/ai/, à la version installée.
//   ai/AI.md          ← point d'entrée : mise en place, règles, liste des exports
//   ai/specs/<X>.md   ← spec de chaque composant, pattern et gabarit exporté
//   ai/docs/*.md      ← principes, règles de placement, journal des décisions
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "ai");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "specs"), { recursive: true });
mkdirSync(join(out, "docs"), { recursive: true });

// 1. Docs de référence (sans les pages de validation ni les captures).
for (const f of ["principles.md", "layout-rules.md", "decisions.md"]) cpSync(join(root, "docs", f), join(out, "docs", f));

// 2. Specs des composants exportés par index.ts.
const index = readFileSync(join(root, "src/index.ts"), "utf8");
const exported = new Set([...index.matchAll(/export \{([^}]+)\} from "\.\/(?:components|patterns|templates)\//g)].flatMap((m) => m[1].split(",").map((s) => s.trim())));
const entries = [];
for (const kind of ["components", "patterns", "templates"]) {
  const dir = join(root, "src", kind);
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir)) {
    const spec = join(dir, name, `${name}.spec.md`);
    if (!existsSync(spec) || !exported.has(name)) continue;
    const md = readFileSync(spec, "utf8");
    cpSync(spec, join(out, "specs", `${name}.md`));
    const section = (title) => (md.split(new RegExp(`^## ${title}\\s*$`, "m"))[1] ?? "").split(/^## /m)[0].trim();
    entries.push({ name, kind, role: section("Rôle").split("\n")[0], options: section("Options") });
  }
}

// Anciens noms dépréciés : « export const Dialog = Modal; » dans index.ts (D-336).
const deprecated = [...index.matchAll(/^export const ([A-Z]\w*) = ([A-Z]\w*);/gm)].map((m) => [m[1], m[2]]);
const deprecatedSection = deprecated.length
  ? `## Anciens noms (dépréciés, retirés en 2.0.0)
Ces noms marchent encore. Ne pas les utiliser dans du code neuf (D-336).
${deprecated.map(([old, name]) => `- \`${old}\` → \`${name}\``).join("\n")}

`
  : "";

// 3. Point d'entrée.
const kindLabel = { components: "Composant", patterns: "Pattern", templates: "Gabarit" };
const ai = `# ${pkg.name} ${pkg.version} — guide pour l'IA

Ce fichier est livré avec le package. Il décrit la version installée : lis-le avant d'écrire de l'UI dans cette app.

## Règles
- Toute UI utilise uniquement les composants, patterns et tokens de \`${pkg.name}\`, importés depuis \`"${pkg.name}"\`.
- Ne jamais créer un composant qui en remplace un existant, ni copier, ni surcharger son style : pas de \`className\` ni de \`style\` sur un composant de \`${pkg.name}\`, pas de couleur en dur.
- Si la spec ne prévoit pas ce qui est demandé (option, variante, état, comportement) : répondre « Hors design », ne rien implémenter localement, et proposer \`/design propose\`.
- Placer les informations selon [docs/layout-rules.md](docs/layout-rules.md).
- Avant d'utiliser un composant, lire sa spec dans [specs/](specs/) : options, comportements, contenu, accessibilité.

## Mise en place
1. À la racine de l'app : \`import "${pkg.name}/styles.css";\` puis envelopper l'app dans \`<SocleProvider>\` (accent, densité, plateforme, préfixe de mémorisation, libellés traduits avec \`messages\`, thème d'organisation avec \`theme\`).
2. Avec Tailwind, dans le CSS principal : \`@import "tailwindcss";\` puis \`@import "${pkg.name}/theme.css";\` (seules les couleurs Socle existent).
3. Garde-fous, selon le linter de l'app :
   - **Biome** (2.6 ou plus récent) : \`"extends": ["${pkg.name}/biome"]\` dans \`biome.json\`. \`biome lint\` (ou \`biome check\`) signale les imports interdits (librairie headless, chemins internes de \`${pkg.name}\`), \`style\` et \`className\` sur un composant Socle, et les couleurs en dur dans le code et le CSS. Limite : la règle reconnaît un composant Socle par son nom ; un import renommé (\`Button as B\`) lui échappe. Une exception justifiée : \`// biome-ignore lint/plugin: <raison>\`.
   - **ESLint** : \`import socle from "${pkg.name}/eslint-config";\` dans \`eslint.config.js\`, et \`npx socle-check-css "src/**/*.css"\` pour le CSS.

## Exports
| Nom | Type | Rôle | Spec |
|---|---|---|---|
| \`SocleProvider\`, \`useSocle\` | Fournisseur | Réglages de l'app et choix de l'utilisateur (D-029) ; libellés \`messages\` (D-089). | [AppShell](specs/AppShell.md) |
${entries.map((e) => `| \`${e.name}\` | ${kindLabel[e.kind]} | ${e.role.replace(/\|/g, "\\|")} | [${e.name}](specs/${e.name}.md) |`).join("\n")}

${deprecatedSection}## Options par composant
${entries.map((e) => `### ${e.name}\n${e.options || "Voir la spec."}\n`).join("\n")}
## Références
- [Principes](docs/principles.md)
- [Règles de placement](docs/layout-rules.md)
- [Journal des décisions](docs/decisions.md)
`;
writeFileSync(join(out, "AI.md"), ai);
console.log(`ai/ écrit : AI.md, ${entries.length} specs, 3 docs`);
