// Vérifie la config Biome livrée (`socle-ui/biome`) sur les fichiers de scripts/biome-fixtures :
// une app de test l'étend par le nom du package, comme Alfred, puis lance `biome lint`.
// bad.* : chaque garde-fou doit se déclencher à la ligne attendue ; good.* : aucun signalement.
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const biome = join(root, "node_modules/.bin/biome");
const expected = [
  "bad.css:1 plugin",
  "bad.css:2 plugin",
  "bad.tsx:2 lint/style/noRestrictedImports",
  "bad.tsx:3 lint/style/noRestrictedImports",
  "bad.tsx:4 lint/style/noRestrictedImports",
  "bad.tsx:6 plugin",
  "bad.tsx:7 plugin",
  "bad.tsx:12 plugin",
  "bad.tsx:13 plugin",
  "bad.tsx:18 plugin",
];

execFileSync("node", [join(root, "scripts/build-biome.js")], { stdio: "ignore" });
const app = mkdtempSync(join(tmpdir(), "socle-biome-"));
try {
  mkdirSync(join(app, "node_modules"));
  symlinkSync(root, join(app, "node_modules/socle-ui"), "dir");
  cpSync(join(root, "scripts/biome-fixtures"), app, { recursive: true });
  writeFileSync(join(app, "biome.json"), JSON.stringify({ extends: ["socle-ui/biome"] }));
  let out;
  try {
    out = execFileSync(biome, ["lint", "--reporter=json", "--max-diagnostics=none", "."], { cwd: app, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch (e) {
    out = e.stdout; // biome sort en erreur : c'est attendu avec bad.*
  }
  const found = JSON.parse(out)
    .diagnostics.filter((d) => d.category === "plugin" || d.category === "lint/style/noRestrictedImports" || d.category === "deserialize")
    .map((d) => `${d.location.path}:${d.location.start?.line} ${d.category}`)
    .sort();
  const missing = expected.filter((e) => !found.includes(e));
  const extra = found.filter((f) => !expected.includes(f));
  if (missing.length || extra.length) {
    console.error("check-biome : échec");
    for (const m of missing) console.error(`- attendu, absent : ${m}`);
    for (const x of extra) console.error(`- signalé à tort : ${x}`);
    process.exit(1);
  }
  console.log(`check-biome : config socle-ui/biome conforme (${expected.length} signalements attendus).`);
} finally {
  rmSync(app, { recursive: true, force: true });
}
