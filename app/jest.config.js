/**
 * Pure-logic unit tests (jet-lag engine + circadian model). Node environment,
 * ts-jest transpile-only so RN/Expo transforms aren't needed — the tested modules
 * are pure TypeScript with type-only imports.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/shared/services/jetlag-brain/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true, diagnostics: false }],
  },
};
