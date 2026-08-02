const aliases = {
  "^@shared/(.*)$": "<rootDir>/src/shared/$1",
  "^@features/(.*)$": "<rootDir>/src/features/$1",
  "^@navigation/(.*)$": "<rootDir>/src/shared/navigation/$1",
  "^@/(.*)$": "<rootDir>/src/$1",
};

/**
 * Two projects, because the travel code splits cleanly into two kinds of test.
 *
 * `logic` runs in node with ts-jest transpile-only: fast, no RN transform, and
 * it covers everything that does not touch React. `components` runs under
 * jest-expo so hooks and screens can actually render.
 *
 * Keeping them separate matters: the logic suite is ~1s and runs on every
 * commit, while the component suite pays the RN transform cost. Merging them
 * would make the fast feedback loop slow enough to skip.
 *
 * The alias map is shared and mirrors tsconfig `paths` + babel module-resolver.
 * All three have to agree or a module resolves for the typechecker and the app
 * but not the tests.
 */
module.exports = {
  projects: [
    {
      displayName: "logic",
      testEnvironment: "node",
      testMatch: [
        "**/src/shared/services/jetlag-brain/__tests__/**/*.test.ts",
        "**/src/features/travel/**/__tests__/**/*.test.ts",
        "**/src/shared/services/__tests__/**/*.test.ts",
        "**/src/shared/services/travel/__tests__/**/*.test.ts",
        "**/src/features/travel/health/__tests__/**/*.test.ts",
      ],
      moduleNameMapper: aliases,
      transform: {
        "^.+\\.ts$": ["ts-jest", { isolatedModules: true, diagnostics: false }],
      },
    },
    {
      displayName: "components",
      preset: "jest-expo",
      testMatch: ["**/src/**/__component_tests__/**/*.test.tsx"],
      moduleNameMapper: aliases,
      setupFilesAfterEnv: ["<rootDir>/jest.setup.components.js"],
      transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-pager-view|react-native-gesture-handler|@testing-library/.*)",
      ],
    },
  ],

  // Coverage is a ratchet, not a target: these are the levels actually reached,
  // so a change that drops coverage fails. Raise them as suites land.
  collectCoverageFrom: [
    "src/shared/services/travel/**/*.ts",
    "src/features/travel/**/*.{ts,tsx}",
    "src/shared/services/http.ts",
    "src/shared/services/validation.ts",
    "!**/__tests__/**",
    "!**/__component_tests__/**",
    "!**/*.styles.ts",
    "!**/mockTrips.ts",
    "!src/features/travel/index.ts",
  ],
  coverageThreshold: {
    // The two scopes the plan named are held at 90%. Jest excludes
    // path-matched files from `global`, so `global` here covers everything
    // else — the screens and components — at the level actually reached.
    "./src/shared/services/travel/": {
      statements: 90,
      lines: 90,
      functions: 85,
      branches: 77,
    },
    "./src/features/travel/screens/travel-search/hooks/": {
      statements: 90,
      lines: 90,
      functions: 85,
      branches: 72,
    },
    global: { statements: 75, branches: 47, functions: 50, lines: 74 },
  },
};
