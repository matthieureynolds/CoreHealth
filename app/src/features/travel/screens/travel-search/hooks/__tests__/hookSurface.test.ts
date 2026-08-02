import * as fs from "fs";
import * as path from "path";

/**
 * Guards how much state any one hook owns.
 *
 * useTravelState reached ~100 keys, which is what forced every consumer to
 * accept the whole bag: 48 fields threaded into the trip handlers, ~90 props
 * spread onto two modals, and a four-file edit to add a single value. The
 * limits below are the sizes actually reached after splitting persistence and
 * flight entry out — a ratchet, not a target.
 *
 * This reads source rather than calling the hooks: they use useState and
 * AsyncStorage, which need a React renderer this node-environment suite does
 * not have. Counting the returned identifiers is enough to catch regrowth.
 */

const HOOKS_DIR = path.resolve(__dirname, "..");

/** Identifiers listed in a hook's `return { ... }` block. */
function returnedKeys(file: string): string[] {
  const src = fs.readFileSync(path.join(HOOKS_DIR, file), "utf8");
  const start = src.indexOf("  return {");
  if (start === -1) return [];
  const block = src.slice(start);
  return [...block.matchAll(/^ {4}([a-zA-Z][a-zA-Z0-9_]*),$/gm)].map(
    (m) => m[1],
  );
}

/**
 * Every hook's own returned keys. 20 is the limit the plan set; these are the
 * sizes actually reached. Lower them as more state moves out; never raise them.
 *
 * useTravelState is a façade: it spreads the others so consumers keep one
 * import, but it must not accumulate state of its own beyond this.
 */
const LIMITS: Record<string, number> = {
  "useTravelState.ts": 20,
  "useTravelAnimations.ts": 20,
  "useCitySearch.ts": 20,
  "useAddTripForm.ts": 20,
  "useEditTripForm.ts": 20,
  "useDatePickers.ts": 20,
  "useFlightEntry.ts": 20,
  "useTripPersistence.ts": 20,
};

describe("hook surface area", () => {
  it.each(Object.entries(LIMITS))(
    "%s returns at most %i keys",
    (file, limit) => {
      expect(returnedKeys(file).length).toBeLessThanOrEqual(limit);
    },
  );

  it("useTravelState no longer owns flight-entry state directly", () => {
    // It spreads useFlightEntry's result instead. If these names come back as
    // its own useState calls, the split has been undone.
    const src = fs.readFileSync(
      path.join(HOOKS_DIR, "useTravelState.ts"),
      "utf8",
    );
    for (const name of [
      "flightCarrier",
      "flightNumber",
      "flightLookupResult",
      "flightSegments",
    ]) {
      expect(src).not.toMatch(new RegExp(`useState[^\\n]*\\b${name}\\b`));
      expect(src).not.toMatch(new RegExp(`const \\[${name},`));
    }
  });

  it("useTravelState no longer owns trip persistence directly", () => {
    const src = fs.readFileSync(
      path.join(HOOKS_DIR, "useTravelState.ts"),
      "utf8",
    );
    expect(src).not.toMatch(/AsyncStorage/);
    expect(src).toMatch(/useTripPersistence\(\)/);
  });

  it("every extracted hook is actually composed back in", () => {
    const src = fs.readFileSync(
      path.join(HOOKS_DIR, "useTravelState.ts"),
      "utf8",
    );
    for (const hook of [
      "useTravelAnimations",
      "useTripPersistence",
      "useFlightEntry",
      "useCitySearch",
      "useAddTripForm",
      "useEditTripForm",
      "useDatePickers",
    ]) {
      expect(src).toMatch(new RegExp(`${hook}\\(`));
    }
  });

  it("no component takes more than 15 props", () => {
    // The add-trip modal took 44 and the search tab 27; both now receive
    // grouped bags that mirror the hooks producing them.
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir).flatMap((e) => {
        const p = path.join(dir, e);
        if (fs.statSync(p).isDirectory())
          return p.includes("__") ? [] : walk(p);
        return /\.tsx$/.test(p) ? [p] : [];
      });
    const offenders: string[] = [];
    for (const file of walk(path.resolve(HOOKS_DIR, "../.."))) {
      const src = fs.readFileSync(file, "utf8");
      for (const m of src.matchAll(/interface (\w+Props) \{([\s\S]*?)\n\}/g)) {
        const count = (m[2].match(/^ {2}\w+\??:/gm) || []).length;
        if (count > 15) offenders.push(`${m[1]} (${count})`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
