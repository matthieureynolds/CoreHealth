import { buildRail, parseMin, hourLabel, yForMin, colIndex } from "../tripRail";
import type { Action } from "@shared/types";

const act = (over: Partial<Action>): Action =>
  ({
    type: "sleep",
    start_local: null,
    end_local: null,
    at_local: null,
    label: "",
    ...over,
  }) as Action;

describe("parseMin", () => {
  it("converts HH:MM to minutes past midnight", () => {
    expect(parseMin("00:00")).toBe(0);
    expect(parseMin("09:30")).toBe(570);
    expect(parseMin("23:59")).toBe(1439);
  });

  it("accepts a single-digit hour", () => {
    expect(parseMin("9:05")).toBe(545);
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseMin("  07:15 ")).toBe(435);
  });

  it("returns null for absent or malformed input", () => {
    for (const v of [null, undefined, "", "nope", "24h", "7", "07:5"]) {
      expect(parseMin(v as string)).toBeNull();
    }
  });
});

describe("hourLabel", () => {
  it("uses 12-hour clock with am/pm", () => {
    expect(hourLabel(0)).toBe("12am");
    expect(hourLabel(1)).toBe("1am");
    expect(hourLabel(12)).toBe("12pm");
    expect(hourLabel(13)).toBe("1pm");
    expect(hourLabel(23)).toBe("11pm");
  });

  it("labels the closing midnight as 12am", () => {
    expect(hourLabel(24)).toBe("12am");
  });
});

describe("yForMin", () => {
  it("is zero at midnight and monotonic through the day", () => {
    expect(yForMin(0)).toBe(0);
    expect(yForMin(720)).toBeGreaterThan(yForMin(60));
    expect(yForMin(1440)).toBeGreaterThan(yForMin(720));
  });
});

describe("buildRail", () => {
  it("returns empty rails for no actions", () => {
    expect(buildRail([])).toEqual({ caps: [], marks: [] });
  });

  it("places a sleep block as a capsule in the sleep column", () => {
    const { caps } = buildRail([
      act({ type: "sleep", start_local: "23:00", end_local: "07:00" }),
    ]);
    expect(caps.length).toBeGreaterThan(0);
    for (const c of caps) expect(c.col).toBe(colIndex("sleep"));
  });

  it("splits a block that wraps past midnight into two capsules", () => {
    // 23:00 → 07:00 cannot be drawn as one rectangle on a midnight-to-midnight
    // rail; it has to become 23:00–24:00 plus 00:00–07:00.
    const { caps } = buildRail([
      act({ type: "sleep", start_local: "23:00", end_local: "07:00" }),
    ]);
    expect(caps).toHaveLength(2);
    expect(caps.some((c) => c.e === 1440)).toBe(true);
    expect(caps.some((c) => c.s === 0)).toBe(true);
  });

  it("keeps a same-day block as a single capsule", () => {
    const { caps } = buildRail([
      act({ type: "sleep", start_local: "01:00", end_local: "06:00" }),
    ]);
    expect(caps).toHaveLength(1);
    expect(caps[0]).toMatchObject({ s: 60, e: 360 });
  });

  it("drops a block with an unparseable time rather than drawing at zero", () => {
    const { caps } = buildRail([
      act({ type: "sleep", start_local: "nonsense", end_local: "07:00" }),
      act({ type: "sleep", start_local: "23:00", end_local: null }),
    ]);
    expect(caps).toHaveLength(0);
  });

  it("puts flights in their own column, separate from sleep", () => {
    const { caps } = buildRail([
      act({ type: "in_flight", start_local: "10:00", end_local: "18:00" }),
      act({ type: "sleep", start_local: "01:00", end_local: "06:00" }),
    ]);
    const cols = new Set(caps.map((c) => c.col));
    expect(cols.size).toBe(2);
    expect(cols.has(colIndex("plane"))).toBe(true);
  });

  it("separates seek-light and avoid-light into different columns", () => {
    const { caps } = buildRail([
      act({ type: "seek_light", start_local: "07:00", end_local: "10:00" }),
      act({ type: "avoid_light", start_local: "20:00", end_local: "23:00" }),
    ]);
    expect(caps).toHaveLength(2);
    expect(caps[0].col).not.toBe(caps[1].col);
  });

  it("renders point-in-time actions as marks, not capsules", () => {
    const { caps, marks } = buildRail([
      act({ type: "melatonin", at_local: "21:00" }),
      act({ type: "meal", at_local: "12:30" }),
      act({ type: "caffeine_cutoff", at_local: "14:00" }),
    ]);
    expect(caps).toHaveLength(0);
    expect(marks).toHaveLength(3);
  });

  it("carries a commitment's label onto its mark", () => {
    const { marks } = buildRail([
      act({ type: "commitment", at_local: "09:00", label: "Board meeting" }),
    ]);
    expect(marks).toHaveLength(1);
    expect(marks[0].label).toBe("Board meeting");
  });

  it("falls back to the start time when a mark has no at_local", () => {
    const { marks } = buildRail([
      act({ type: "melatonin", at_local: null, start_local: "22:15" }),
    ]);
    expect(marks[0]?.at).toBe(1335);
  });

  it("skips a mark with no usable time at all", () => {
    const { marks } = buildRail([
      act({ type: "melatonin", at_local: null, start_local: null }),
    ]);
    expect(marks).toHaveLength(0);
  });

  it("keeps every capsule inside the 0–1440 minute range", () => {
    const { caps } = buildRail([
      act({ type: "sleep", start_local: "23:30", end_local: "06:30" }),
      act({ type: "in_flight", start_local: "00:00", end_local: "23:59" }),
    ]);
    for (const c of caps) {
      expect(c.s).toBeGreaterThanOrEqual(0);
      expect(c.e).toBeLessThanOrEqual(1440);
      expect(c.e).toBeGreaterThan(c.s);
    }
  });

  it("is deterministic", () => {
    const actions = [
      act({ type: "sleep", start_local: "23:00", end_local: "07:00" }),
      act({ type: "meal", at_local: "12:00" }),
    ];
    expect(buildRail(actions)).toEqual(buildRail(actions));
  });
});
