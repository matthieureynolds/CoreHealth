/**
 * The presentation helpers each environmental service exposes: turning a raw
 * index into a status word, a risk level and user-facing advice.
 *
 * These are what the UI actually renders, and they are pure — so they get
 * exhaustive band coverage rather than a smoke test.
 */
import {
  getGoogleAirQualityStatus,
  getGoogleAirQualityRecommendation,
  mapGoogleAqiToRiskLevel,
  getPollutantDetails,
} from "../googleAirQualityService";
import {
  getOverallPollenRiskLevel,
  getPollenStatus,
  getPollenRecommendations,
  getPollenBreakdown,
} from "../googlePollenService";

const RISK = ["low", "moderate", "high", "severe"];

describe("air quality helpers", () => {
  const AQI_BANDS = [0, 25, 50, 51, 75, 100, 101, 150, 200, 250, 300, 500];

  it.each(AQI_BANDS)("gives AQI %i a non-empty status", (aqi) => {
    expect(getGoogleAirQualityStatus(aqi).trim()).not.toBe("");
  });

  it.each(AQI_BANDS)("gives AQI %i actionable advice", (aqi) => {
    expect(getGoogleAirQualityRecommendation(aqi).length).toBeGreaterThan(5);
  });

  it.each(AQI_BANDS)("maps AQI %i to a known risk level", (aqi) => {
    expect(RISK).toContain(mapGoogleAqiToRiskLevel(aqi));
  });

  it("escalates risk monotonically as AQI rises", () => {
    const order = { low: 0, moderate: 1, high: 2, severe: 3 } as const;
    const levels = AQI_BANDS.map(
      (a) => order[mapGoogleAqiToRiskLevel(a) as keyof typeof order],
    );
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeGreaterThanOrEqual(levels[i - 1]);
    }
  });

  it("gives clean and hazardous air different advice", () => {
    expect(getGoogleAirQualityRecommendation(10)).not.toBe(
      getGoogleAirQualityRecommendation(300),
    );
  });

  it("handles a negative or absurd AQI without throwing", () => {
    for (const v of [-1, 0, 99999, NaN]) {
      expect(typeof getGoogleAirQualityStatus(v)).toBe("string");
      expect(RISK).toContain(mapGoogleAqiToRiskLevel(v));
    }
  });

  it("summarises a pollutant list", () => {
    const out = getPollutantDetails([
      {
        code: "pm25",
        displayName: "PM2.5",
        fullName: "Fine particulate matter",
        concentration: { value: 15, units: "ug/m3" },
      },
    ] as never);
    expect(out.length).toBeGreaterThan(0);
  });

  it("says so when there is no pollutant data", () => {
    expect(getPollutantDetails(undefined as never)).toMatch(/no detailed/i);
    expect(getPollutantDetails([] as never)).toMatch(/no detailed/i);
  });
});

/** Minimal GooglePollenData with the three indices set. */
const pollen = (tree: number, grass = 0, weed = 0) =>
  ({
    pollen: {
      tree: { indexValue: tree, category: "x", inSeason: true },
      grass: { indexValue: grass, category: "x", inSeason: true },
      weed: { indexValue: weed, category: "x", inSeason: true },
    },
  }) as never;

describe("pollen helpers", () => {
  const INDEX_BANDS = [0, 1, 2, 3, 4, 5];

  it.each(INDEX_BANDS)("gives index %i a status", (v) => {
    expect(getPollenStatus(pollen(v)).trim()).not.toBe("");
  });

  it.each(INDEX_BANDS)("gives index %i recommendations", (v) => {
    expect(getPollenRecommendations(pollen(v)).length).toBeGreaterThan(5);
  });

  it.each(INDEX_BANDS)("maps index %i to a known risk level", (v) => {
    expect(RISK).toContain(getOverallPollenRiskLevel(pollen(v)));
  });

  it("escalates risk with the index", () => {
    const order = { low: 0, moderate: 1, high: 2, severe: 3 } as const;
    const levels = INDEX_BANDS.map(
      (v) => order[getOverallPollenRiskLevel(pollen(v))],
    );
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeGreaterThanOrEqual(levels[i - 1]);
    }
  });

  it("takes the worst of tree, grass and weed", () => {
    // A high grass count must not be masked by low tree and weed values.
    expect(getPollenStatus(pollen(0, 5, 0))).toBe(getPollenStatus(pollen(5)));
  });

  it("gives low and very-high pollen different advice", () => {
    expect(getPollenRecommendations(pollen(0))).not.toBe(
      getPollenRecommendations(pollen(5)),
    );
  });

  it("handles an out-of-range index", () => {
    for (const v of [-1, 99]) {
      expect(typeof getPollenStatus(pollen(v))).toBe("string");
      expect(RISK).toContain(getOverallPollenRiskLevel(pollen(v)));
    }
  });

  it("breaks a reading down by type", () => {
    const out = getPollenBreakdown(pollen(3, 1, 0));
    expect(out.length).toBeGreaterThan(0);
  });
});
