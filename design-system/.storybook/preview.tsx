import type { Decorator, Preview } from "@storybook/react-vite";
import { useEffect } from "react";
import { SocleProvider } from "../src/provider/SocleProvider";
import "../src/styles.css";
import "./storybook.css";

/** Applique le mode (D-005) et la densité (D-004) choisis dans la barre d'outils. */
const withTheme: Decorator = (Story, context) => {
  const { theme, density } = context.globals as { theme: string; density: string };
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;
    root.dataset.density = density;
  }, [theme, density]);
  return (
    <SocleProvider density={density as "web" | "desktop"} storageKey="storybook">
      <div className="socle-story">
        <Story />
      </div>
    </SocleProvider>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Mode clair ou sombre",
      toolbar: {
        title: "Mode",
        icon: "mirror",
        items: [
          { value: "system", title: "Système" },
          { value: "light", title: "Clair" },
          { value: "dark", title: "Sombre" },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: "Densité web ou desktop",
      toolbar: {
        title: "Densité",
        icon: "component",
        items: [
          { value: "web", title: "Web (confortable)" },
          { value: "desktop", title: "Desktop (compacte)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "system", density: "web" },
  parameters: {
    layout: "fullscreen",
    options: {
      storySort: {
        order: ["Fondations", "Composants", "Patterns", "Gabarits", "Règles"],
      },
    },
  },
};

export default preview;
