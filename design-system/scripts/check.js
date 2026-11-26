// Garde-fous du dépôt de référence (assets/guardrails.md) :
// - chaque composant, pattern et gabarit a sa spec (.spec.md) et ses stories (.stories.tsx) ;
// - chaque recette de page a sa fiche, ses stories (dont Reference) et ses deux captures (D-405) ;
// - une spec en statut « validé » n'a plus de questions ouvertes ;
// - index.ts est le seul point d'entrée (champ exports de package.json) ;
// - la version de package.json est celle de la dernière entrée datée de CHANGELOG.md,
//   et celle de SOCLE_VERSION dans src/index.ts (D-335).
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

// Recettes de pages (D-405) : chaque recette a sa fiche, ses stories (dont `Reference`) et ses deux captures.
const recipes = join("src", "recipes");
if (existsSync(recipes)) {
  for (const name of readdirSync(recipes)) {
    const d = join(recipes, name);
    if (!statSync(d).isDirectory()) continue;
    for (const file of [`${name}.recipe.md`, `${name}.stories.tsx`, `${name}-clair.png`, `${name}-sombre.png`])
      if (!existsSync(join(d, file))) errors.push(`${d} : ${file} manquant`);
    const stories = join(d, `${name}.stories.tsx`);
    if (existsSync(stories) && !/^export const Reference\b/m.test(readFileSync(stories, "utf8")))
      errors.push(`${stories} : story « Reference » manquante (source des captures)`);
    const md = join(d, `${name}.recipe.md`);
    if (existsSync(md)) {
      const text = readFileSync(md, "utf8");
      for (const section of ["Quand la prendre", "Zones", "Actions", "États", "Comportement", "Squelette", "À éviter", "Décisions"])
        if (!new RegExp(`^## ${section}\\s*$`, "m").test(text)) errors.push(`${md} : section « ${section} » manquante`);
      // Chaque zone dit sa responsabilité, quand la prendre et pourquoi (D-417).
      const zones = (text.split(/^## Zones\s*$/m)[1] ?? "").split(/^## /m)[0];
      if (!/^\| Zone \| Sa responsabilité ici \| Composant \| Quand, pourquoi \|$/m.test(zones))
        errors.push(`${md} : le tableau des zones doit avoir les colonnes « Zone | Sa responsabilité ici | Composant | Quand, pourquoi » (D-417)`);
    }
  }
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
// Sous-entrées à dépendances facultatives (D-300) : seules exceptions à l'entrée unique.
const allowed = new Set([".", "./styles.css", "./theme.css", "./eslint-config", "./biome", "./markdown", "./markdown-editor", "./package.json"]);
for (const key of Object.keys(pkg.exports ?? {}))
  if (!allowed.has(key)) errors.push(`package.json : export non autorisé « ${key} » (point d'entrée unique)`);

// Version : la dernière entrée datée du CHANGELOG (« ## [x.y.z] — AAAA-MM-JJ ») fait foi.
const changelog = readFileSync("CHANGELOG.md", "utf8");
const dated = changelog.match(/^## \[(\d+\.\d+\.\d+[^\]]*)\] — \d{4}-\d{2}-\d{2}\s*$/m);
if (!dated) errors.push("CHANGELOG.md : aucune entrée datée « ## [x.y.z] — AAAA-MM-JJ »");
else if (dated[1] !== pkg.version)
  errors.push(`version : package.json dit ${pkg.version}, la dernière entrée datée de CHANGELOG.md dit ${dated[1]}`);
const constant = readFileSync(join("src", "index.ts"), "utf8").match(/SOCLE_VERSION = "([^"]+)"/);
if (constant && constant[1] !== pkg.version)
  errors.push(`version : package.json dit ${pkg.version}, SOCLE_VERSION dans src/index.ts dit ${constant[1]}`);

if (errors.length) {
  console.error("check : échec\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log("check : structure conforme.");
