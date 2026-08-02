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
  /**
   * Extra attempts after the first, for transient failures only. Defaults to
   * DEFAULT_RETRIES; pass 0 to disable.
   */
  retries?: number;
}

/**
 * One retry by default. Mobile networks drop requests routinely during a
 * handover, and a single immediate retry recovers most of those. More than one
 * mainly adds latency to a genuine outage, which the user experiences as the
 * app hanging rather than telling them it is offline.
 */
export const DEFAULT_RETRIES = 1;

/**
 * Backoff before attempt n (1-based), with jitter to avoid a thundering herd.
 *
 * Collapses to zero under Jest: the retry *behaviour* is what the suite asserts,
 * and real backoff would add wall-clock seconds across the service-resilience
 * cases without testing anything extra.
 */
const backoffMs = (attempt: number): number =>
  process.env.JEST_WORKER_ID
    ? 0
    : Math.round(2 ** (attempt - 1) * 300 * (0.5 + Math.random()));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Whether a failure is worth retrying.
 *
 * Retrying a 4xx just repeats a request the server has already rejected, and
 * retrying a caller-initiated abort fights the user navigating away. Network
 * errors, timeouts and 5xx/429 are the transient cases.
 */
function isRetryable(errOrStatus: unknown): boolean {
  if (typeof errOrStatus === "number") {
    return errOrStatus >= 500 || errOrStatus === 429 || errOrStatus === 408;
  }
  const name = (errOrStatus as Error)?.name;
  if (name === "AbortError") return false; // caller's abort — never retry
  return true; // network-level failure, including TimeoutError
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
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    signal,
    ...init
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    // A fresh controller per attempt: an aborted one stays aborted.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // Respect a caller-supplied signal as well as our timeout.
    const onExternalAbort = () => controller.abort();
    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener("abort", onExternalAbort);
    }

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      // A retryable status is worth another attempt; anything else — including
      // 4xx — is the server's considered answer and gets returned as-is.
      if (attempt < retries && isRetryable(response.status)) {
        lastError = new Error(`HTTP ${response.status} for ${url}`);
        await sleep(backoffMs(attempt + 1));
        continue;
      }
      return response;
    } catch (err) {
      // An abort we caused is a timeout; an abort the caller caused is theirs.
      const isOurTimeout =
        (err as Error)?.name === "AbortError" && !signal?.aborted;
      lastError = isOurTimeout ? new TimeoutError(url, timeoutMs) : err;

      if (attempt < retries && isRetryable(lastError)) {
        await sleep(backoffMs(attempt + 1));
        continue;
      }
      throw lastError;
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onExternalAbort);
    }
  }

  // Only reachable when the final attempt was a retryable status.
  throw lastError ?? new Error(`Request failed: ${url}`);
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
