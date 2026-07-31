module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Makes the tsconfig.json `paths` work at runtime too. Without this the
      // aliases typecheck but fail to resolve in Metro, which is why the repo
      // had them configured and used them zero times.
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@features': './src/features',
            '@shared': './src/shared',
            '@navigation': './src/shared/navigation',
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
    ],
    env: {
      production: {
        // `exclude` matters: the default strips console.error as well, so
        // production errors were being discarded silently. Keeping error and
        // warn means logger.error actually survives a release build, which is
        // what makes it a usable hook for crash reporting.
        plugins: [['transform-remove-console', { exclude: ['error', 'warn'] }]],
      },
    },
  };
};
