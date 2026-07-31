/**
 * Bounded HTTP for the service layer.
 *
 * React Native's `fetch` has no default timeout, so a request that never
 * resolves leaves the caller's loading state stuck forever — on mobile that is
 * the difference between "we're offline" and an app that appears frozen. Every
 * network call in the services should go through here.
 */

/** Default ceiling for a single request. Deliberately shorter than a user's patience. */
export const DEFAULT_TIMEOUT_MS = 10_000;

export class TimeoutError extends Error {
  constructor(url: string, timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms: ${url}`);
    this.name = "TimeoutError";
  }
}

export interface FetchOptions extends RequestInit {
  /** Overrides DEFAULT_TIMEOUT_MS for this call. */
  timeoutMs?: number;
}

/**
 * Drop-in replacement for `fetch` that always aborts by `timeoutMs`.
 *
 * Returns the raw Response so existing call sites keep their own `response.ok`
 * handling and error messages. Throws TimeoutError on expiry, so callers can
 * distinguish "slow/absent network" from "server said no" — a plain `fetch`
 * rejection cannot be told apart from a timeout.
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...init } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Respect a caller-supplied signal as well as our timeout.
  const onExternalAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onExternalAbort);
  }

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    // An abort we caused is a timeout; an abort the caller caused is theirs.
    if ((err as Error)?.name === "AbortError" && !signal?.aborted) {
      throw new TimeoutError(url, timeoutMs);
    }
    throw err;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onExternalAbort);
  }
}

/** Convenience wrapper for the common "GET some JSON" case. */
export async function fetchJson<T>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const response = await fetchWithTimeout(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return (await response.json()) as T;
}
