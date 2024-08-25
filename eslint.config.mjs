import { fixupPluginRules, includeIgnoreFile } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import airbnbConfig from "eslint-config-airbnb";
import airbnbHooksConfig from "eslint-config-airbnb/hooks";
import airbnbTypescriptConfig from "eslint-config-airbnb-typescript";
import prettierConfig from "eslint-config-prettier";
import deprecationPlugin from "eslint-plugin-deprecation";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import path from "node:path";
import ts from "typescript-eslint";

const withoutPlugins = ({ plugins: _plugins, ...obj }) => obj;

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const compatAirbnbConfigs = compat.config(airbnbConfig).map(withoutPlugins);
const originalNoUnusedVars = compatAirbnbConfigs
  .map((config) => config.rules?.["no-unused-vars"])
  .find(Boolean);

const overridenRules = {
  // We enjoy sorting imports
  "sort-imports": ["error", { ignoreDeclarationSort: true }],
  // `void foo` is a mark of deliberately floating promise
  "no-void": ["error", { allowAsStatement: true }],
  // We use `_id` from mongodb
  "no-underscore-dangle": ["error", { allow: ["_id"] }],
  // We use await in loops
  "no-await-in-loop": "off",
  // We use continue in loops
  "no-continue": "off",

  // Custom order
  "import/order": [
    "error",
    {
      groups: [["builtin", "external"], "internal", "parent", "sibling"],
      warnOnUnassignedImports: false,
      "newlines-between": "always",
      alphabetize: {
        order: "asc",
      },
      pathGroups: [
        {
          pattern: "{react,react-native}",
          group: "builtin",
          position: "before",
        },
        {
          pattern: "{~*/**,~*}",
          group: "internal",
          position: "before",
        },
      ],
      pathGroupsExcludedImportTypes: ["react", "react-native", "{~*/**,~*}"],
    },
  ],

  // These 2 are off by default
  "@typescript-eslint/switch-exhaustiveness-check": "error",
  "@typescript-eslint/consistent-type-imports": "error",
  // We want to allow `Amount ${amount}` to be used
  "@typescript-eslint/restrict-template-expressions": [
    "error",
    { allowNumber: true },
  ],
  // Default option is `interface`
  "@typescript-eslint/consistent-type-definitions": ["error", "type"],
  // Allowing `while(true)`
  "@typescript-eslint/no-unnecessary-condition": [
    "error",
    { allowConstantLoopConditions: true },
  ],
  // We want to pass `() => Promise<void>` to a prop / arg expecting `() => void`
  "@typescript-eslint/no-misused-promises": [
    "error",
    {
      checksVoidReturn: {
        arguments: false,
        attributes: false,
      },
    },
  ],
  // We need to use React
  "@typescript-eslint/no-unused-vars": [
    "error",
    { ...originalNoUnusedVars[1], varsIgnorePattern: "React" },
  ],

  // Airbnb forces them to be functional components
  "react/function-component-definition": [
    "error",
    {
      namedComponents: "arrow-function",
      unnamedComponents: "arrow-function",
    },
  ],
  // Allow expressions for stuff like `<>{children}</>
  "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
};

const disabledRules = {
  // We see no evil in nested ternaries
  "no-nested-ternary": "off",
  // This is guarded by typescript
  "consistent-return": "off",
  // Typescript version is `@typescript-eslint/switch-exhaustiveness-check`
  "default-case": "off",
  // We use iterators/generators
  "no-restricted-syntax": "off",
  // Rule is enabled by `eslint-config-airbnb-typescript`
  // it is deprecated by maintainer, see https://typescript-eslint.io/rules/no-throw-literal/
  "@typescript-eslint/no-throw-literal": "off",
  // We don't really need react components names
  "react/display-name": "off",
  // We extensively spread props: `<Foo {...props} />`
  "react/jsx-props-no-spreading": "off",
  // We may want to use `props.foo`
  "react/destructuring-assignment": "off",
  // Rule doesn't seems to work properly
  "react/prop-types": "off",
  // We use mostly named exports
  "import/prefer-default-export": "off",
  // `(object | undefined) || number` is assumed incorrect by this rule
  // it should be `(object | undefined) ?? number`
  "@typescript-eslint/prefer-nullish-coalescing": "off",
  // Rule emits false positives on `const fn = <T>(value: T) => {...}`
  // see https://github.com/typescript-eslint/typescript-eslint/issues/9667
  "@typescript-eslint/no-unnecessary-type-parameters": "off",
  // We enjoy confusing fellow developers with void expressions
  // Mainly used for:
  // - returning `void` from a function, assigning that to a value and validating value is undefined
  // - shorthanding functions returns that don't matter (because they're void)
  "@typescript-eslint/no-confusing-void-expression": "off",
  // That's a weird thing to forbid
  "@typescript-eslint/no-dynamic-delete": "off",
};

export default ts.config(
  { files: ["**/*.{js,jsx,ts,tsx}"] },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2017,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      // remove fixupPluginRules on resolution: https://github.com/import-js/eslint-plugin-import/issues/2948
      import: fixupPluginRules(importPlugin),
      // remove fixupPluginRules on resolution: https://github.com/facebook/react/issues/28313
      "react-hooks": fixupPluginRules(reactHooksPlugin),
      // remove fixupPluginRules on resolution: https://github.com/gund/eslint-plugin-deprecation/issues/78
      deprecation: fixupPluginRules(deprecationPlugin),
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: true,
        },
      },
      react: {
        version: "detect",
      },
    },
  },
  // remove compat on resolution: https://github.com/airbnb/javascript/issues/2804
  ...compat
    .config(airbnbConfig)
    .map(withoutPlugins)
    .map((config) => ({
      ...config,
      // We don't use jsx-a11y plugin
      rules: config.rules
        ? Object.fromEntries(
            Object.entries(config.rules).filter(
              ([name]) => !name.startsWith("jsx-a11y")
            )
          )
        : {},
    })),
  ...compat.config(airbnbHooksConfig).map(withoutPlugins),
  // remove compat on resolution: https://github.com/import-js/eslint-plugin-import/issues/2948
  ...compat.config(importPlugin.configs.recommended).map(withoutPlugins),
  // remove compat on resolution: https://github.com/facebook/react/issues/28313
  ...compat.config(reactHooksPlugin.configs.recommended).map(withoutPlugins),
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  js.configs.recommended,
  prettierConfig,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  // remove compat on resolution: https://github.com/gund/eslint-plugin-deprecation/issues/78
  ...compat.config(deprecationPlugin.configs.recommended).map(withoutPlugins),
  // remove compat on resolution: https://github.com/airbnb/javascript/issues/2804
  ...compat
    .config(airbnbTypescriptConfig)
    .map(withoutPlugins)
    .map((config) => ({
      ...config,
      // Some rules do not exist in `typescript-eslint` anymore
      // but airbnb-typescript still tried to turn them on
      rules: {
        ...config.rules,
        "@typescript-eslint/quotes": "off",
        "@typescript-eslint/brace-style": "off",
        "@typescript-eslint/comma-dangle": "off",
        "@typescript-eslint/comma-spacing": "off",
        "@typescript-eslint/func-call-spacing": "off",
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/keyword-spacing": "off",
        "@typescript-eslint/no-extra-semi": "off",
        "@typescript-eslint/object-curly-spacing": "off",
        "@typescript-eslint/semi": "off",
        "@typescript-eslint/space-before-blocks": "off",
        "@typescript-eslint/space-before-function-paren": "off",
        "@typescript-eslint/space-infix-ops": "off",
        "@typescript-eslint/lines-between-class-members": "off",
      },
    })),
  // remove compat on resolution: https://github.com/import-js/eslint-plugin-import/issues/2948
  ...compat.config(importPlugin.configs.typescript).map(withoutPlugins),
  { rules: overridenRules },
  { rules: disabledRules },
  {
    files: ["**/*.{mjs,js,jsx}"],
    ...ts.configs.disableTypeChecked,
    rules: {
      // remove compat on resolution: https://github.com/gund/eslint-plugin-deprecation/issues/78
      "deprecation/deprecation": "off",
      ...ts.configs.disableTypeChecked.rules,
    },
  },
  {
    files: ["eslint.config.mjs"],
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: true,
        },
      ],
    },
  },
  includeIgnoreFile(path.join(import.meta.dirname, ".gitignore")),
  {
    // see https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores
    ignores: [
      ".history/",
      ".yarn/",
      "**/.next/",
      "**/.expo/",
      "**/coverage/",
      "**/playwright-report/",
      "**/test-results/",
    ],
  }
);
