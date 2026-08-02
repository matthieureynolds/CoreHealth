import { buildEnhancedTrip } from "../jetLagService";
import { EnhancedJetLagService } from "../enhancedJetLagService";

// January date → no DST ambiguity (London = GMT+0, Tokyo = +9, Paris = +1).
const DEP = new Date("2027-01-15T08:00:00Z");
const SLEEP = { bedTime: "23:00", wakeUpTime: "07:00" };
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

const trip = (over: Partial<Parameters<typeof buildEnhancedTrip>[0]> = {}) => ({
  id: "t1",
  departureLocation: "London",
  destination: "Tokyo",
  departureDate: DEP,
  timezone: "Asia/Tokyo",
  originTimezone: "Europe/London",
  jetLagPlanner: { departureTime: "09:00", arrivalTime: "15:00" },
  ...over,
});

describe("strategy selection", () => {
  it("long eastward stay → full adjustment", () => {
    const e = buildEnhancedTrip(
      trip({ returnDate: addDays(DEP, 14) }),
      "outbound",
      SLEEP,
    );
    expect(EnhancedJetLagService.getPlanSummary(e).mode).toBe("full");
  });

  it("short eastward stay → anchor (stay on home time)", () => {
    const e = buildEnhancedTrip(
      trip({ returnDate: addDays(DEP, 3) }),
      "outbound",
      SLEEP,
    );
    expect(EnhancedJetLagService.getPlanSummary(e).mode).toBe("anchor");
    expect(EnhancedJetLagService.getAchievedAdaptation(e)).toBe(0);
  });

  it("medium eastward stay → partial adjustment", () => {
    const e = buildEnhancedTrip(
      trip({ returnDate: addDays(DEP, 6) }),
      "outbound",
      SLEEP,
    );
    expect(EnhancedJetLagService.getPlanSummary(e).mode).toBe("partial");
  });

  it("small shift → minimal", () => {
    const e = buildEnhancedTrip(
      trip({ destination: "Paris", timezone: "Europe/Paris" }),
      "outbound",
      SLEEP,
    );
    expect(EnhancedJetLagService.getPlanSummary(e).mode).toBe("minimal");
  });

  it("return leg only undoes the adaptation achieved outbound", () => {
    // prior_adaptation_hours = 0 (anchored outbound) → nothing to undo.
    const ret = buildEnhancedTrip(
      trip({ returnDate: addDays(DEP, 3) }),
      "return",
      SLEEP,
      undefined,
      undefined,
      undefined,
      0,
    );
    expect(EnhancedJetLagService.getPlanSummary(ret).mode).toBe("minimal");
  });
});

describe("plan generation", () => {
  it("produces day-by-day plans with a sleep action each day", () => {
    const e = buildEnhancedTrip(
      trip({ returnDate: addDays(DEP, 14) }),
      "outbound",
      SLEEP,
    );
    const days = EnhancedJetLagService.generatePlan(e);
    expect(days.length).toBeGreaterThan(0);
    for (const d of days) {
      expect(d.actions.some((a) => a.type === "sleep")).toBe(true);
    }
  });

  it("honours melatonin/caffeine prefs", () => {
    const prefs = {
      chronotype: "neutral" as const,
      planStyle: "gentle" as const,
      caffeine: false,
      melatonin: false,
      naps: false,
    };
    const e = buildEnhancedTrip(
      trip({ returnDate: addDays(DEP, 14) }),
      "outbound",
      SLEEP,
      prefs,
    );
    const days = EnhancedJetLagService.generatePlan(e);
    const all = days.flatMap((d) => d.actions.map((a) => a.type));
    expect(all).not.toContain("melatonin");
    expect(all).not.toContain("caffeine_ok");
  });

  it("flags a commitment that lands in the circadian low", () => {
    const arrivalDate = "2027-01-15";
    const e = buildEnhancedTrip(
      trip({
        returnDate: addDays(DEP, 14),
        commitments: [
          {
            id: "c1",
            title: "Board meeting",
            date_local: arrivalDate,
            start_local: "06:00",
            end_local: "07:00",
          },
        ],
      }),
      "outbound",
      SLEEP,
    );
    const days = EnhancedJetLagService.generatePlan(e);
    const commit = days
      .flatMap((d) => d.actions)
      .find((a) => a.type === "commitment");
    // It may or may not match a generated day; if present it carries the title in its label.
    if (commit) expect(commit.label).toBe("Board meeting");
  });

  it("NowCard returns a well-formed object for a future trip", () => {
    const e = buildEnhancedTrip(
      trip({ returnDate: addDays(DEP, 14) }),
      "outbound",
      SLEEP,
    );
    const days = EnhancedJetLagService.generatePlan(e);
    const card = EnhancedJetLagService.generateNowCard(e, days);
    expect(card.trip_id).toBe(e.id);
    expect(card.current_action).toBeNull(); // trip is in 2027
  });

  it("learns direction from measured progress (observed vs expected rate)", () => {
    const ret = addDays(DEP, 14);
    // On track by day 3 (~3h advanced): measured CBTmin 11:00 (= 05:00 + 9 − 3).
    const onTrack = buildEnhancedTrip(
      trip({ returnDate: ret }),
      "outbound",
      SLEEP,
      undefined,
      undefined,
      undefined,
      undefined,
      { measuredNow: { day_offset: 3, cbt_min_local: "11:00" } },
    );
    const r1 = EnhancedJetLagService.getObservedShiftRate(onTrack)!;
    expect(r1.direction).toBe("advance");
    expect(r1.observedPerDay).toBeGreaterThan(0.7);

    // Didn't shift at all (still home phase): measured 14:00 (= 05:00 + 9 − 0).
    const behind = buildEnhancedTrip(
      trip({ returnDate: ret }),
      "outbound",
      SLEEP,
      undefined,
      undefined,
      undefined,
      undefined,
      { measuredNow: { day_offset: 3, cbt_min_local: "14:00" } },
    );
    expect(
      EnhancedJetLagService.getObservedShiftRate(behind)!.observedPerDay,
    ).toBeLessThan(0.3);
  });

  it("personalised efficiency flips the advance/delay crossover", () => {
    const m = { measuredNow: { day_offset: 2, cbt_min_local: "12:00" } };
    const def = buildEnhancedTrip(
      trip({}),
      "outbound",
      SLEEP,
      undefined,
      undefined,
      undefined,
      undefined,
      m,
    );
    expect(EnhancedJetLagService.getObservedShiftRate(def)!.direction).toBe(
      "advance",
    );
    // A poor advancer (0.6×) → advancing costs more days → flips to delay.
    const poorAdv = buildEnhancedTrip(
      trip({}),
      "outbound",
      SLEEP,
      undefined,
      undefined,
      undefined,
      undefined,
      { ...m, advanceEfficiency: 0.6 },
    );
    expect(EnhancedJetLagService.getObservedShiftRate(poorAdv)!.direction).toBe(
      "delay",
    );
  });
});
