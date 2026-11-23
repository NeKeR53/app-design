/**
 * socle-ui/eslint-config — garde-fous partagés pour les apps qui consomment Socle.
 *
 * Usage dans eslint.config.js de l'app :
 *   import socle from "socle-ui/eslint-config";
 *   export default [...socle, /* config de l'app *\/];
 *
 * Règles :
 * - pas d'import direct de la librairie headless ni des chemins internes de socle-ui ;
 * - pas de `style` ni de `className` sur un composant importé de socle-ui ;
 * - pas de couleur en dur (hex, rgb, hsl) dans le code de l'app.
 *   Pour le CSS de l'app : `npx socle-check-css "src/**\/*.css"`.
 */

const COLOR = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\s*\(/;

/** Signale `style` et `className` sur les composants importés de socle-ui. */
const noOverrideOnSocle = {
  meta: {
    type: "problem",
    docs: { description: "Interdit de surcharger le style d'un composant Socle." },
    messages: {
      override:
        "« {{attr}} » est interdit sur <{{name}}> : un composant Socle ne se surcharge pas. Utilisez une option prévue par sa spec, ou passez par /design check puis /design propose.",
    },
    schema: [],
  },
  create(context) {
    const socleNames = new Set();
    return {
      ImportDeclaration(node) {
        if (node.source.value !== "socle-ui") return;
        for (const s of node.specifiers) socleNames.add(s.local.name);
      },
      JSXAttribute(node) {
        const attr = node.name && node.name.name;
        if (attr !== "style" && attr !== "className") return;
        const el = node.parent && node.parent.name;
        const name =
          el && el.type === "JSXIdentifier"
            ? el.name
            : el && el.type === "JSXMemberExpression"
              ? el.object.name
              : null;
        if (name && socleNames.has(name))
          context.report({ node, messageId: "override", data: { attr, name } });
      },
    };
  },
};

/** Signale les couleurs écrites en dur dans les chaînes du code. */
const noHardcodedColor = {
  meta: {
    type: "problem",
    docs: { description: "Interdit les couleurs en dur : utiliser les tokens Socle." },
    messages: {
      color:
        "Couleur en dur « {{value}} » : utilisez un token Socle (var(--fg), bg-surface…).",
    },
    schema: [],
  },
  create(context) {
    const check = (node, text) => {
      const m = typeof text === "string" && text.match(COLOR);
      if (m) context.report({ node, messageId: "color", data: { value: m[0] } });
    };
    return {
      Literal(node) {
        check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value && node.value.raw);
      },
    };
  },
};

const plugin = {
  meta: { name: "socle", version: "0.0.0" },
  rules: {
    "no-override": noOverrideOnSocle,
    "no-hardcoded-color": noHardcodedColor,
  },
};

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { socle: plugin },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react-aria-components", message: "Utilisez les composants de socle-ui." },
            { name: "react-aria", message: "Utilisez les composants de socle-ui." },
          ],
          patterns: [
            { group: ["socle-ui/*", "!socle-ui/styles.css", "!socle-ui/theme.css", "!socle-ui/eslint-config", "!socle-ui/markdown", "!socle-ui/markdown-editor"], message: "N'importez que « socle-ui » (point d'entrée unique), ou les sous-entrées « socle-ui/markdown » et « socle-ui/markdown-editor » (D-300)." },
            { group: ["@react-aria/*", "@react-stately/*"], message: "Utilisez les composants de socle-ui." },
          ],
        },
      ],
      "socle/no-override": "error",
      "socle/no-hardcoded-color": "error",
    },
  },
];

export { plugin as soclePlugin };
