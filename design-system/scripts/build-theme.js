// Produit dist/theme.css : src/theme.css avec ses @import de tokens résolus,
// pour que les apps puissent l'importer sans connaître la structure interne.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

function inline(file, seen = new Set()) {
  const abs = resolve(file);
  if (seen.has(abs)) return "";
  seen.add(abs);
  const css = readFileSync(abs, "utf8");
  return css.replace(/^@import\s+"(\.{1,2}\/[^"]+)";\s*$/gm, (_, rel) =>
    inline(resolve(dirname(abs), rel), seen),
  );
}

mkdirSync("dist", { recursive: true });
writeFileSync("dist/theme.css", inline("src/theme.css"));
console.log("dist/theme.css écrit");
