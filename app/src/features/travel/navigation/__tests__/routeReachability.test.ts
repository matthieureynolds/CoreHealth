import * as fs from "fs";
import * as path from "path";

/**
 * Guards the invariant that took the longest to establish: every registered
 * travel route is actually reachable.
 *
 * Twelve routes (~2,300 lines) sat registered-but-unnavigated for a long time
 * because nothing checks this — a `Stack.Screen` compiles perfectly whether or
 * not anything navigates to it, so neither the typechecker nor ESLint can see
 * the problem. One of them was additionally masked by a name collision with a
 * different stack, so even counting `navigate('X')` by hand got it wrong.
 *
 * This reads the source rather than importing it: the navigator pulls in
 * react-native, which this node-environment test suite deliberately does not
 * transform.
 */

const SRC = path.resolve(__dirname, "../../../..");
const NAVIGATOR = path.join(
  SRC,
  "features/travel/navigation/TravelStackNavigator.tsx",
);
const PARAM_LIST = path.join(SRC, "shared/types/navigation.ts");

/** Routes registered in the travel stack. */
function registeredRoutes(): string[] {
  const src = fs.readFileSync(NAVIGATOR, "utf8");
  return [...src.matchAll(/<Stack\.Screen\s+name="([A-Za-z]+)"/g)].map(
    (m) => m[1],
  );
}

/** Every .ts/.tsx file under src, so we can search for navigation calls. */
function allSources(): string[] {
  const out: string[] = [];
  (function walk(dir: string) {
    for (const entry of fs.readdirSync(dir)) {
      const p = path.join(dir, entry);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (/\.tsx?$/.test(p) && !p.includes("__tests__")) out.push(p);
    }
  })(SRC);
  return out;
}

const sources = allSources().map((f) => fs.readFileSync(f, "utf8"));
const corpus = sources.join("\n");

/** The stack's entry point is reached by being first, not by navigate(). */
const INITIAL_ROUTE = "TravelList";

describe("travel route reachability", () => {
  const routes = registeredRoutes();

  it("registers at least one route", () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it.each(routes.filter((r) => r !== INITIAL_ROUTE))(
    "%s is navigated to from somewhere",
    (route) => {
      const pattern = new RegExp(
        `(navigate|push|replace)\\(\\s*["'\`]${route}["'\`]`,
      );
      expect(pattern.test(corpus)).toBe(true);
    },
  );

  it("declares no route name in two param lists", () => {
    const src = fs.readFileSync(PARAM_LIST, "utf8");
    const lists: Record<string, string[]> = {};
    let current: string | null = null;
    for (const line of src.split("\n")) {
      const open = line.match(/export type (\w+ParamList)\s*=\s*\{/);
      if (open) {
        current = open[1];
        lists[current] = [];
        continue;
      }
      if (current && line.trim() === "};") {
        current = null;
        continue;
      }
      if (current) {
        const key = line.match(/^ {2}(\w+)\s*:/);
        if (key) lists[current].push(key[1]);
      }
    }

    const seen: Record<string, string[]> = {};
    for (const [list, keys] of Object.entries(lists)) {
      for (const k of keys) (seen[k] ||= []).push(list);
    }
    const collisions = Object.entries(seen)
      .filter(([, v]) => v.length > 1)
      .map(([k, v]) => `${k} in ${v.join(" + ")}`);

    expect(collisions).toEqual([]);
  });

  it("registers every route that the param list declares", () => {
    const src = fs.readFileSync(PARAM_LIST, "utf8");
    const block = src.match(
      /export type TravelStackParamList\s*=\s*\{([\s\S]*?)\n\};/,
    );
    expect(block).not.toBeNull();
    const declared = [...block![1].matchAll(/^ {2}(\w+)\s*:/gm)].map(
      (m) => m[1],
    );
    expect(declared.sort()).toEqual(routes.sort());
  });
});
