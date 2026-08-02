import {
  getStatusColor,
  getScoreColor,
  getMetricScore,
  getMetricFixedIconColor,
  getCountryFromCity,
  getCountryCode,
  AIRLINE_CODES,
  HEALTH_METRIC_ROWS,
} from "../travelMetricHelpers";
import { palette, metricTint } from "@shared/theme/colors";

describe("getStatusColor", () => {
  it.each([
    ["excellent", palette.success],
    ["good", palette.success],
    ["moderate", palette.warningAlt],
    ["poor", palette.alert],
    ["hazardous", palette.danger],
  ])("maps %s to its severity colour", (status, expected) => {
    expect(getStatusColor(status)).toBe(expected);
  });

  it("falls back to secondary text for an unknown status", () => {
    expect(getStatusColor("banana")).toBe(palette.textSecondary);
    expect(getStatusColor("")).toBe(palette.textSecondary);
  });

  it("returns a token, never a raw literal", () => {
    const tokens = Object.values(palette) as string[];
    for (const s of ["good", "moderate", "poor", "hazardous", "???"]) {
      expect(tokens).toContain(getStatusColor(s));
    }
  });
});

describe("getScoreColor", () => {
  it("agrees with getStatusColor for every known status", () => {
    for (const s of ["excellent", "good", "moderate", "poor", "hazardous"]) {
      expect(getScoreColor("air_quality", s)).toBe(getStatusColor(s));
    }
  });

  it("is case-insensitive, unlike getStatusColor", () => {
    expect(getScoreColor("air_quality", "MODERATE")).toBe(palette.warningAlt);
    expect(getScoreColor("air_quality", "Hazardous")).toBe(palette.danger);
  });

  it("tolerates an empty status", () => {
    expect(getScoreColor("air_quality", "")).toBe(palette.textSecondary);
  });
});

describe("getMetricFixedIconColor", () => {
  it("uses the status colour when a reading exists", () => {
    expect(getMetricFixedIconColor("air_quality", "hazardous")).toBe(
      palette.danger,
    );
  });

  it("falls back to the metric's resting tint with no reading", () => {
    expect(getMetricFixedIconColor("pollen")).toBe(metricTint.pollen);
    expect(getMetricFixedIconColor("water_safety")).toBe(
      metricTint.water_safety,
    );
  });

  it("has a tint for every metric row the UI renders", () => {
    for (const row of HEALTH_METRIC_ROWS) {
      expect(getMetricFixedIconColor(row.metricId)).toBeTruthy();
    }
  });

  it("falls back to a neutral grey for an unknown metric", () => {
    expect(getMetricFixedIconColor("not_a_metric")).toBe(palette.textDim);
  });
});

describe("getMetricScore", () => {
  it("returns a score inside 0-100 for every known metric", () => {
    for (const name of [
      "Air Quality",
      "Water Safety",
      "UV Index",
      "Food Safety",
      "Pollen Level",
      "Altitude",
      "Disease Outbreaks",
    ]) {
      const s = getMetricScore(name);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });

  it("falls back for an unknown metric rather than returning undefined", () => {
    expect(typeof getMetricScore("Nonsense")).toBe("number");
  });
});

describe("getCountryFromCity", () => {
  it("resolves an exact city match", () => {
    expect(getCountryFromCity("Tokyo")).toBe("Japan");
  });

  it("resolves a 'City, Country' string via partial match", () => {
    expect(getCountryFromCity("Tokyo, Japan")).toBe("Japan");
  });

  it("returns Unknown rather than throwing for an unrecognised city", () => {
    expect(getCountryFromCity("Zzzyzx")).toBe("Unknown");
  });

  it("handles an empty string without matching everything", () => {
    // "".includes(k) is false but k.includes("") is true for every key, so a
    // naive partial match would return whichever city happened to be first.
    expect(getCountryFromCity("")).toBe("Unknown");
  });
});

describe("getCountryCode", () => {
  it("maps a country to its ISO alpha-2 code", () => {
    expect(getCountryCode("Japan")).toBe("jp");
    expect(getCountryCode("United Kingdom")).toBe("gb");
  });

  it("accepts common aliases for the same country", () => {
    expect(getCountryCode("UK")).toBe(getCountryCode("United Kingdom"));
    expect(getCountryCode("USA")).toBe(getCountryCode("United States"));
  });

  it("returns null for non-country placeholders", () => {
    expect(getCountryCode("Unknown")).toBeNull();
    expect(getCountryCode("Your Location")).toBeNull();
  });

  it("returns two-letter lowercase codes only", () => {
    for (const c of ["Japan", "France", "Australia", "Thailand"]) {
      expect(getCountryCode(c)).toMatch(/^[a-z]{2}$/);
    }
  });
});

describe("AIRLINE_CODES", () => {
  it("keys on uppercase IATA carrier codes", () => {
    for (const code of Object.keys(AIRLINE_CODES)) {
      expect(code).toBe(code.toUpperCase());
      expect(code.length).toBeLessThanOrEqual(3);
    }
  });

  it("has no blank airline names", () => {
    for (const name of Object.values(AIRLINE_CODES)) {
      expect(name.trim()).not.toBe("");
    }
  });
});

describe("HEALTH_METRIC_ROWS", () => {
  it("has unique metric ids", () => {
    const ids = HEALTH_METRIC_ROWS.map((r) => r.metricId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique animation keys", () => {
    // Two rows sharing an animKey would share a single Animated.Value and
    // reveal together during the stagger.
    const keys = HEALTH_METRIC_ROWS.map((r) => r.animKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("gives every row a label and an icon", () => {
    for (const row of HEALTH_METRIC_ROWS) {
      expect(row.label.trim()).not.toBe("");
      expect(row.icon).toBeTruthy();
    }
  });

  it("uses a status that getStatusColor understands", () => {
    for (const row of HEALTH_METRIC_ROWS) {
      expect(getStatusColor(row.status)).not.toBe(palette.textSecondary);
    }
  });
});
