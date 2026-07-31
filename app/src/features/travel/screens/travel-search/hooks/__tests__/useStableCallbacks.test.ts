/**
 * The stable-callback façade is what lets the memoised travel children actually
 * skip renders. Its whole contract is: identities never change, but calls always
 * reach the newest implementation. Getting the second half wrong reintroduces
 * stale-closure bugs, which is worse than the slow renders it fixes — hence
 * these tests.
 */

type AnyFn = (...args: any[]) => any;

/**
 * Mirrors useStableCallbacks without React, so the contract can be tested
 * directly. `render` simulates one render pass handing in fresh callbacks.
 */
function makeFacade<T extends Record<string, AnyFn>>(initial: T) {
  const latest = { current: initial };
  const facade = {} as T;
  for (const key of Object.keys(initial) as (keyof T)[]) {
    facade[key] = ((...args: unknown[]) =>
      latest.current[key](...args)) as T[keyof T];
  }
  return { facade, render: (next: T) => (latest.current = next) };
}

describe("stable callback façade", () => {
  it("keeps function identities stable across re-renders", () => {
    const { facade, render } = makeFacade({ onSave: () => "v1" });
    const first = facade.onSave;

    render({ onSave: () => "v2" });
    render({ onSave: () => "v3" });

    expect(facade.onSave).toBe(first);
  });

  it("dispatches to the latest implementation, not the captured one", () => {
    const { facade, render } = makeFacade({ onSave: () => "v1" });
    expect(facade.onSave()).toBe("v1");

    render({ onSave: () => "v2" });

    // The identity is unchanged but the behaviour must be current.
    expect(facade.onSave()).toBe("v2");
  });

  it("reads current state rather than a stale closure", () => {
    let text = "Lon";
    const { facade, render } = makeFacade({ submit: () => text });
    expect(facade.submit()).toBe("Lon");

    // Simulate a later render where the closed-over state has moved on.
    text = "London";
    render({ submit: () => text });

    expect(facade.submit()).toBe("London");
  });

  it("forwards arguments and return values", () => {
    const { facade } = makeFacade({
      add: (a: number, b: number) => a + b,
    });
    expect(facade.add(2, 3)).toBe(5);
  });

  it("preserves the full key set", () => {
    const { facade } = makeFacade({
      a: () => 1,
      b: () => 2,
      c: () => 3,
    });
    expect(Object.keys(facade).sort()).toEqual(["a", "b", "c"]);
  });
});
