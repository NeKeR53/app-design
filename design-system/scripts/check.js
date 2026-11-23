// Garde-fous du dépôt de référence (assets/guardrails.md) :
// - chaque composant, pattern et gabarit a sa spec (.spec.md) et ses stories (.stories.tsx) ;
// - une spec en statut « validé » n'a plus de questions ouvertes ;
// - index.ts est le seul point d'entrée (champ exports de package.json).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const errors = [];
for (const kind of ["components", "patterns", "templates"]) {
  const dir = join("src", kind);
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir)) {
    const d = join(dir, name);
    if (!statSync(d).isDirectory()) continue;
    const spec = join(d, `${name}.spec.md`);
    const stories = join(d, `${name}.stories.tsx`);
    if (!existsSync(spec)) errors.push(`${d} : spec manquante (${name}.spec.md)`);
    // Les stories sont exigées dès que le composant est codé (pendant `define`, seule la spec existe).
    if (existsSync(join(d, `${name}.tsx`)) && !existsSync(stories))
      errors.push(`${d} : stories manquantes (${name}.stories.tsx)`);
    if (existsSync(spec)) {
      const md = readFileSync(spec, "utf8");
      const validated = /^Statut\s*:\s*validé/im.test(md);
      const open = md.split(/^## Questions ouvertes\s*$/m)[1] ?? "";
      const pending = open.split(/^## /m)[0].split("\n").filter((l) => /^\s*[-*\d]/.test(l));
      if (validated && pending.length)
        errors.push(`${spec} : statut « validé » avec ${pending.length} question(s) ouverte(s)`);
    }
  }
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const allowed = new Set([".", "./styles.css", "./theme.css", "./eslint-config", "./package.json"]);
for (const key of Object.keys(pkg.exports ?? {}))
  if (!allowed.has(key)) errors.push(`package.json : export non autorisé « ${key} » (point d'entrée unique)`);

if (errors.length) {
  console.error("check : échec\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log("check : structure conforme.");
