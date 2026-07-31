const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const reactPlugin = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const prettierConfig = require("eslint-config-prettier");

/**
 * Flat config (ESLint 9). The plugins were in package.json for a long time with
 * no config file, so lint has never actually run on this codebase.
 *
 * Severity is deliberate rather than maximal:
 *  - `error` for things that are genuinely broken or that let dead code
 *    accumulate (unused vars, hook rules) — the class of problem that produced
 *    ~1,400 orphaned style lines.
 *  - `warn` for things that are worth seeing but shouldn't block a commit
 *    while the codebase catches up.
 * Formatting is left entirely to Prettier via eslint-config-prettier.
 */
module.exports = [
  {
    ignores: [
      "node_modules/**",
      "ios/**",
      "android/**",
      "dist/**",
      ".expo/**",
      "web-build/**",
      "babel.config.js",
      "metro.config.js",
      "jest.config.js",
      "eslint.config.js",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        __DEV__: "readonly",
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        require: "readonly",
        module: "writable",
        process: "readonly",
        globalThis: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      // ── Dead code: the rules that would have caught the orphaned styles ──
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-unused-vars": "off", // superseded by the TS-aware rule above

      // ── Correctness ──
      "react-hooks/rules-of-hooks": "error",
      "no-const-assign": "error",
      "no-dupe-keys": "error",
      "no-unreachable": "error",

      // ── Worth seeing, not worth blocking on yet ──
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-empty": ["warn", { allowEmptyCatch: false }],

      // TypeScript already resolves these; the base rules produce false
      // positives on types and JSX.
      "no-undef": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
  prettierConfig,
];
