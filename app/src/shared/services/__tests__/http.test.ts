import {
  fetchWithTimeout,
  fetchJson,
  TimeoutError,
  DEFAULT_TIMEOUT_MS,
} from "../http";

/**
 * These pin the behaviour the service layer now depends on: a request can never
 * hang forever, and a timeout is distinguishable from a server error.
 */

const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
  jest.useRealTimers();
});

function mockFetch(
  impl: (url: string, init?: RequestInit) => Promise<unknown>,
) {
  global.fetch = jest.fn(impl) as unknown as typeof fetch;
}

describe("fetchWithTimeout", () => {
  it("returns the response when the request completes in time", async () => {
    const res = { ok: true, status: 200 };
    mockFetch(async () => res);
    await expect(fetchWithTimeout("https://x.test")).resolves.toBe(res);
  });

  it("passes an AbortSignal to fetch", async () => {
    let seen: RequestInit | undefined;
    mockFetch(async (_url, init) => {
      seen = init;
      return { ok: true };
    });
    await fetchWithTimeout("https://x.test");
    expect(seen?.signal).toBeDefined();
  });

  it("throws TimeoutError when the request outlives the timeout", async () => {
    // Never settles on its own; only the abort ends it.
    mockFetch(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const e = new Error("Aborted");
            e.name = "AbortError";
            reject(e);
          });
        }),
    );

    await expect(
      fetchWithTimeout("https://slow.test", { timeoutMs: 10 }),
    ).rejects.toBeInstanceOf(TimeoutError);
  });

  it("names the url and duration in the timeout message", async () => {
    mockFetch(
      (_url, init) =>
        new Promise((_r, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const e = new Error("Aborted");
            e.name = "AbortError";
            reject(e);
          });
        }),
    );
    await expect(
      fetchWithTimeout("https://slow.test", { timeoutMs: 5 }),
    ).rejects.toThrow(/5ms.*slow\.test/);
  });

  it("rethrows non-abort network errors unchanged", async () => {
    mockFetch(async () => {
      throw new Error("DNS failure");
    });
    await expect(fetchWithTimeout("https://x.test")).rejects.toThrow(
      "DNS failure",
    );
  });

  it("does not report a caller-initiated abort as a timeout", async () => {
    const external = new AbortController();
    mockFetch(
      (_url, init) =>
        new Promise((_r, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const e = new Error("Aborted");
            e.name = "AbortError";
            reject(e);
          });
        }),
    );
    const p = fetchWithTimeout("https://x.test", { signal: external.signal });
    external.abort();
    await expect(p).rejects.not.toBeInstanceOf(TimeoutError);
  });

  it("defaults to a bounded timeout", () => {
    expect(DEFAULT_TIMEOUT_MS).toBeGreaterThan(0);
    expect(DEFAULT_TIMEOUT_MS).toBeLessThanOrEqual(30_000);
  });
});

describe("fetchJson", () => {
  it("parses the body on success", async () => {
    mockFetch(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ hello: "world" }),
    }));
    await expect(
      fetchJson<{ hello: string }>("https://x.test"),
    ).resolves.toEqual({ hello: "world" });
  });

  it("throws with the status on a non-ok response", async () => {
    mockFetch(async () => ({ ok: false, status: 503, json: async () => ({}) }));
    await expect(fetchJson("https://x.test")).rejects.toThrow(/503/);
  });
});

describe("retry", () => {
  it("retries once by default after a network failure", async () => {
    let calls = 0;
    mockFetch(async () => {
      calls++;
      if (calls === 1) throw new TypeError("Network request failed");
      return { ok: true, status: 200, json: async () => ({}) };
    });
    const res = await fetchWithTimeout("https://x.test");
    expect(res.status).toBe(200);
    expect(calls).toBe(2);
  });

  it("retries a 500 and returns the eventual success", async () => {
    let calls = 0;
    mockFetch(async () => {
      calls++;
      return calls === 1
        ? { ok: false, status: 500, json: async () => ({}) }
        : { ok: true, status: 200, json: async () => ({}) };
    });
    const res = await fetchWithTimeout("https://x.test");
    expect(res.ok).toBe(true);
    expect(calls).toBe(2);
  });

  it("retries 429 and 408", async () => {
    for (const status of [429, 408]) {
      let calls = 0;
      mockFetch(async () => {
        calls++;
        return calls === 1
          ? { ok: false, status, json: async () => ({}) }
          : { ok: true, status: 200, json: async () => ({}) };
      });
      await fetchWithTimeout("https://x.test");
      expect(calls).toBe(2);
    }
  });

  it("does NOT retry a 4xx — the server already answered", async () => {
    let calls = 0;
    mockFetch(async () => {
      calls++;
      return { ok: false, status: 404, json: async () => ({}) };
    });
    const res = await fetchWithTimeout("https://x.test");
    expect(res.status).toBe(404);
    expect(calls).toBe(1);
  });

  it("does NOT retry a caller-initiated abort", async () => {
    const controller = new AbortController();
    let calls = 0;
    mockFetch(async () => {
      calls++;
      controller.abort();
      const e = new Error("Aborted");
      e.name = "AbortError";
      throw e;
    });
    await expect(
      fetchWithTimeout("https://x.test", { signal: controller.signal }),
    ).rejects.toThrow();
    expect(calls).toBe(1);
  });

  it("honours retries: 0", async () => {
    let calls = 0;
    mockFetch(async () => {
      calls++;
      throw new TypeError("Network request failed");
    });
    await expect(
      fetchWithTimeout("https://x.test", { retries: 0 }),
    ).rejects.toThrow(/Network request failed/);
    expect(calls).toBe(1);
  });

  it("gives up after the configured number of attempts", async () => {
    let calls = 0;
    mockFetch(async () => {
      calls++;
      throw new TypeError("Network request failed");
    });
    await expect(
      fetchWithTimeout("https://x.test", { retries: 2 }),
    ).rejects.toThrow();
    expect(calls).toBe(3); // initial + 2 retries
  });

  it("surfaces TimeoutError after exhausting retries", async () => {
    mockFetch(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const e = new Error("Aborted");
            e.name = "AbortError";
            reject(e);
          });
        }),
    );
    await expect(
      fetchWithTimeout("https://x.test", { timeoutMs: 10, retries: 1 }),
    ).rejects.toBeInstanceOf(TimeoutError);
  });
});
