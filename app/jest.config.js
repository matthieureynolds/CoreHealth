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
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true, diagnostics: false }],
  },
};
