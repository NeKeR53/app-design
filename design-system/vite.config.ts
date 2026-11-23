import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Build de la librairie : JS uniquement. Le CSS est compilé à part
// (scripts build:css) pour produire socle-ui/styles.css et socle-ui/theme.css.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      // Entrée unique, plus les sous-entrées à dépendances facultatives (D-300).
      entry: {
        index: "src/index.ts",
        markdown: "src/entries/markdown.ts",
        "markdown-editor": "src/entries/markdown-editor.ts",
      },
      formats: ["es"],
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        /^react-aria-components/,
        // Dépendances facultatives (D-300) : installées par l'app qui s'en sert.
        "react-markdown",
        "remark-gfm",
        /^@codemirror\//,
        /^@lezer\//,
      ],
    },
  },
});
