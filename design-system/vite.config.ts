import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Build de la librairie : JS uniquement. Le CSS est compilé à part
// (scripts build:css) pour produire socle-ui/styles.css et socle-ui/theme.css.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        /^react-aria-components/,
      ],
    },
  },
});
