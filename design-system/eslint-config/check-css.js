#!/usr/bin/env node
// socle-check-css — échoue si le CSS d'une app contient des couleurs en dur.
// Usage : npx socle-check-css "src/**/*.css"
import { readFileSync } from "node:fs";
import { glob } from "node:fs/promises";

const COLOR = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\s*\(/g;
const patterns = process.argv.slice(2);
if (!patterns.length) {
  console.error('Usage : socle-check-css "src/**/*.css"');
  process.exit(2);
}
let errors = 0;
for (const pattern of patterns) {
  for await (const file of glob(pattern, { exclude: (f) => f.includes("node_modules") })) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (line.trim().startsWith("/*") || line.trim().startsWith("*")) return;
        for (const m of line.matchAll(COLOR)) {
          console.error(`${file}:${i + 1}  couleur en dur « ${m[0]} » : utilisez un token Socle`);
          errors++;
        }
      });
  }
}
if (errors) process.exit(1);
console.log("socle-check-css : aucune couleur en dur.");
