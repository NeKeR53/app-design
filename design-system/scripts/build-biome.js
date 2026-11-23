// Génère biome/no-socle-override.grit, livré avec le package (config `socle-ui/biome`).
// Biome ne relie pas une balise JSX à son import : la règle reconnaît les composants
// Socle par leur nom. La liste vient des exports de src/index.ts, à chaque build (D-331).
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const index = readFileSync(join(root, "src/index.ts"), "utf8");
const names = [...index.matchAll(/^export \{([^}]+)\} from /gm)]
  .flatMap((m) => m[1].split(","))
  .map((s) => s.trim().split(/\s+as\s+/).pop())
  .filter((n) => /^[A-Z][a-z]/.test(n))
  .sort();

const grit = `// Généré par scripts/build-biome.js : ne pas modifier à la main.
// socle-ui/biome — pas de « style » ni de « className » sur un composant Socle.
// Même règle que \`socle/no-override\` (ESLint), sur les noms exportés par socle-ui.
language js

or { JsxSelfClosingElement(name=$el, attributes=$attrs), JsxOpeningElement(name=$el, attributes=$attrs) } where {
  $el <: r"(?:${names.join("|")})(?:\\..+)?",
  $attrs <: some JsxAttribute(name=$attr) as $override where { $attr <: or { \`style\`, \`className\` } },
  register_diagnostic(span=$override, message="Un composant Socle ne se surcharge pas : pas de « style » ni de « className ». Utilisez une option prévue par sa spec, ou passez par /design check puis /design propose.")
}
`;
writeFileSync(join(root, "biome/no-socle-override.grit"), grit);
console.log(`biome/no-socle-override.grit écrit : ${names.length} composants`);
