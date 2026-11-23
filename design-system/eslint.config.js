import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "storybook-static", "node_modules", "docs/validation"] },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // API fermée (garde-fous) : pas de className ni de style dans les props publiques.
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSPropertySignature[key.name=/^(className|style)$/]",
          message: "API fermée : pas de « className » ni de « style » dans les props d'un composant Socle.",
        },
      ],
    },
  },
);
