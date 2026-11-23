import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../docs/storybook/**/*.mdx",
    "../src/**/*.mdx",
    "../src/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true, disableWhatsNewNotifications: true },
  viteFinal: (config) => {
    // Le mode librairie de vite.config.ts ne concerne pas Storybook.
    if (config.build) delete config.build.lib;
    return config;
  },
};

export default config;
