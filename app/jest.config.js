/**
 * Pure-logic unit tests. Node environment, ts-jest transpile-only so RN/Expo
 * transforms aren't needed — everything matched here must stay pure TypeScript
 * with type-only imports (no React/react-native imports at runtime).
 *
 * Covers the jet-lag engine + circadian model, and the travel render-performance
 * invariants (stable callback identities).
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/src/shared/services/jetlag-brain/__tests__/**/*.test.ts',
    '**/src/features/travel/**/__tests__/**/*.test.ts',
    '**/src/shared/services/__tests__/**/*.test.ts',
  ],
  // Mirrors the aliases in tsconfig.json `paths` and babel.config.js
  // module-resolver. All three have to agree or a module resolves for the
  // typechecker and the app but not the tests.
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@navigation/(.*)$': '<rootDir>/src/shared/navigation/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true, diagnostics: false }],
  },
};
