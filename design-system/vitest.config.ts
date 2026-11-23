import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import tailwindcss from "@tailwindcss/vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Les tests sont les stories : chaque fonction `play` est un test d'interaction,
// exécuté dans Chromium sans interface. Tailwind est chargé ici aussi :
// sans lui, les utilitaires ne seraient pas générés pendant les tests.
export default defineConfig({
  plugins: [tailwindcss()],
  // Sous-modules de React Aria déclarés d'avance : évite un rechargement pendant les tests.
  optimizeDeps: {
    include: [
      "react-aria-components",
      "react-aria-components/Button",
      "react-aria-components/Menu",
      "react-aria-components/Popover",
      "react-aria-components/ToggleButton",
      "react-aria-components/Tooltip",
      "react-aria-components/Tabs",
      "react-aria-components/Tree",
      "react-aria-components/Table",
      "react-aria-components/GridList",
      "react-aria-components/SearchField",
      "react-aria-components/ComboBox",
      "react-aria-components/CheckboxGroup",
      "react-aria-components/FieldError",
      "react-aria-components/Label",
      "react-aria-components/RadioGroup",
      "react-aria-components/Select",
      "react-aria-components/Text",
      "react-aria-components/TextField",
      "react-aria-components/ListBox",
      "react-aria-components/TagGroup",
      "react-aria-components/Checkbox",
      "react-aria-components/Switch",
      "react-aria-components/ProgressBar",
      "react-aria-components/Separator",
      "react-aria-components/Dialog",
      "react-aria-components/Modal",
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
