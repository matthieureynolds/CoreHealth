import { useMemo, useRef } from "react";

type AnyFn = (...args: any[]) => any;

/**
 * Freezes the *identities* of a bag of callbacks without freezing what they do.
 *
 * The travel handlers are rebuilt on every render because they close over live
 * state. That is cheap in itself, but it handed every child a new set of props
 * each render, so `React.memo` below could never hit. This returns a façade with
 * permanently stable function identities that forward to whatever the latest
 * render produced — so children can memo properly while the handlers still see
 * current state (no stale closures).
 *
 * Assumes the key set is fixed for the life of the component, which holds for
 * the handler factories here (they return object literals with static keys).
 */
export function useStableCallbacks<T extends Record<string, AnyFn>>(
  callbacks: T,
): T {
  const latest = useRef(callbacks);
  latest.current = callbacks;

  // Keys are captured once; the wrappers never change identity afterwards.
  return useMemo(() => {
    const facade = {} as T;
    for (const key of Object.keys(latest.current) as (keyof T)[]) {
      facade[key] = ((...args: unknown[]) =>
        latest.current[key](...args)) as T[keyof T];
    }
    return facade;
  }, []);
}
