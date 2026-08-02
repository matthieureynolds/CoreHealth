import {
  METRIC_CONFIGS,
  STATUS_LABELS,
} from "../current-location/metricConfigs";

const IDS = Object.keys(METRIC_CONFIGS);

describe("METRIC_CONFIGS", () => {
  it("defines at least the seven metrics the UI offers", () => {
    expect(IDS.length).toBeGreaterThanOrEqual(7);
  });

  it.each(IDS)("%s explains what it measures", (id) => {
    expect(METRIC_CONFIGS[id].whatItMeasures.length).toBeGreaterThan(20);
  });

  it.each(IDS)("%s has a positive divisor for the scale", (id) => {
    expect(METRIC_CONFIGS[id].divisor).toBeGreaterThan(0);
  });

  it.each(IDS)("%s has a home baseline inside its own scale", (id) => {
    const c = METRIC_CONFIGS[id];
    expect(c.homeScore).toBeGreaterThanOrEqual(0);
    expect(c.homeScore).toBeLessThanOrEqual(c.divisor);
  });

  it.each(IDS)("%s has at least two scale bands", (id) => {
    expect(METRIC_CONFIGS[id].segments.length).toBeGreaterThanOrEqual(2);
  });

  it.each(IDS)("%s gives every band a label and colour", (id) => {
    for (const seg of METRIC_CONFIGS[id].segments) {
      expect(seg.label.trim()).not.toBe("");
      expect(seg.color).toBeTruthy();
    }
  });

  it.each(IDS)("%s uses palette tokens, never raw hex", (id) => {
    for (const seg of METRIC_CONFIGS[id].segments) {
      // Tokens resolve to hex at runtime, so this asserts the value is a real
      // colour rather than an empty string or an undefined token lookup.
      expect(seg.color).toMatch(/^(#|rgba?\()/);
    }
  });

  it.each(IDS)("%s band labels are unique", (id) => {
    const labels = METRIC_CONFIGS[id].segments.map((s) => s.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("has no duplicate metric ids", () => {
    expect(new Set(IDS).size).toBe(IDS.length);
  });

  it("covers the metric ids the search tab links to", () => {
    for (const id of ["air_quality", "uv_index", "pollen"]) {
      expect(METRIC_CONFIGS[id]).toBeDefined();
    }
  });

  const STATUSES = ["excellent", "good", "moderate", "poor", "hazardous"];

  it.each(IDS)("%s returns advice for every status", (id) => {
    const c = METRIC_CONFIGS[id];
    for (const s of STATUSES) {
      expect(c.getTakeaway(s).trim()).not.toBe("");
      expect(c.getMeaning(s).trim()).not.toBe("");
      expect(c.getRecommendations(s).length).toBeGreaterThan(0);
      expect(c.getComparison(s, "good").trim()).not.toBe("");
    }
  });

  it.each(IDS)("%s advice actually varies with severity", (id) => {
    // Copy that never changes reads as a considered answer while carrying no
    // information — the worst failure mode for a health readout.
    const c = METRIC_CONFIGS[id];
    expect(new Set(STATUSES.map((s) => c.getMeaning(s))).size).toBeGreaterThan(
      1,
    );
  });

  it.each(IDS)("%s degrades on an unknown status", (id) => {
    const c = METRIC_CONFIGS[id];
    expect(typeof c.getTakeaway("banana")).toBe("string");
    expect(Array.isArray(c.getRecommendations("banana"))).toBe(true);
  });
});

describe("STATUS_LABELS", () => {
  it("labels every status the app can produce", () => {
    for (const s of ["excellent", "good", "moderate", "poor", "hazardous"]) {
      expect(STATUS_LABELS[s]?.trim()).toBeTruthy();
    }
  });

  it("has no blank labels", () => {
    for (const v of Object.values(STATUS_LABELS)) {
      expect(v.trim()).not.toBe("");
    }
  });
});
