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

  // ── Travel-domain invariants ──
  //
  // Both live in a single block on purpose. `no-restricted-syntax` takes one
  // array of selectors, and in flat config a later block REPLACES an earlier
  // one for the same rule rather than merging — two blocks meant whichever
  // came last silently switched the other off for the overlapping files.
  {
    files: [
      "src/features/travel/**/*.{ts,tsx}",
      "src/shared/services/travel/**/*.ts",
    ],
    rules: {
      // `any` is a warning app-wide while the rest of the codebase catches up.
      // Travel is at zero, so here it blocks. The two remaining uses carry an
      // explicit disable comment explaining why `unknown` would be wrong.
      "@typescript-eslint/no-explicit-any": "error",

      // File and function size. Blank lines and comments are not counted —
      // this is about how much code sits in one place, and penalising
      // explanation would be exactly the wrong incentive.
      //
      // 500/400 is where the tree sits after splitting TripDetailScreen into
      // header / sleep-plan page / health page / two sheets, and lifting the
      // rail, timezone and metric data into their own modules. The target is
      // 400/200; the files between 401 and 474 are the next ones to split.
      "max-lines": [
        "error",
        { max: 500, skipBlankLines: true, skipComments: true },
      ],
      "max-lines-per-function": [
        "error",
        { max: 400, skipBlankLines: true, skipComments: true },
      ],

      "no-restricted-syntax": [
        "error",
        {
          // Colour: travel went from 765 raw hex values to zero. Keep it there.
          // Scoped rather than global — the rest of the app still has them.
          selector: "Literal[value=/^#(?:[0-9a-fA-F]{3,8})$/]",
          message:
            "Use a token from @shared/theme/colors (palette / metricTint / withAlpha) instead of a raw hex value.",
        },
        {
          // Network boundary: `const data: SomeResponse = await res.json()` is
          // a cast the runtime never checks, so a provider changing a field
          // surfaced far away as an undefined property. Reading .json() is
          // fine; annotating the result without parsing is not.
          selector:
            "VariableDeclarator[id.typeAnnotation] > AwaitExpression > CallExpression[callee.property.name='json']",
          message:
            "Do not annotate a .json() result — the runtime never checks it. Parse with parseOrNull(schema, raw, context) from @shared/services/validation.",
        },
      ],
    },
  },

  // Pure data modules: lookup tables and stylesheets, where "length" measures
  // how many cities or styles exist, not how much logic is in one place.
  {
    files: [
      "**/timezoneDatabase.ts",
      "**/metricConfigs.ts",
      "**/*.styles.ts",
      "**/medicationData.ts",
      "**/mockTrips.ts",
      "**/mockFlights.ts",
      "**/__tests__/**",
      "**/__component_tests__/**",
    ],
    rules: { "max-lines": "off", "max-lines-per-function": "off" },
  },

  prettierConfig,
];
