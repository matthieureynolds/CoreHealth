/**
 * Dev-only logging.
 *
 * Raw `console.*` calls ship to production, where they cost performance and can
 * leak user data into device logs — in a health app that includes auth failures
 * and trip/biometric payloads. These no-op entirely when `__DEV__` is false, so
 * call sites need no guard of their own.
 *
 * `error` still reports in production, because a swallowed error is worse than a
 * logged one; route it to crash reporting when that exists.
 */

const isDev = typeof __DEV__ !== "undefined" && __DEV__;

export const logger = {
  debug: (...args: unknown[]): void => {
    if (isDev) console.log(...args);
  },
  info: (...args: unknown[]): void => {
    if (isDev) console.info(...args);
  },
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn(...args);
  },
  /**
   * Kept in production deliberately. Swap the body for a crash-reporting sink
   * (Sentry/Crashlytics) when one is wired up — this is the single choke point.
   */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
};
