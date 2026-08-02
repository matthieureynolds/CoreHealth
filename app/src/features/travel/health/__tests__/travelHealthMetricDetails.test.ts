import { getMetricDetails } from "../travelHealthMetricDetails";

const STATUSES = ["excellent", "good", "moderate", "poor", "hazardous"];
const KNOWN = ["air_quality", "pollen", "water_quality"];

describe("getMetricDetails", () => {
  it.each(KNOWN)("returns a populated record for %s", (metricId) => {
    const d = getMetricDetails(metricId, "moderate");
    expect(d.description.trim()).not.toBe("");
    expect(d.whatItMeans.trim()).not.toBe("");
    expect(d.healthImpacts.length).toBeGreaterThan(0);
    expect(d.recommendations.length).toBeGreaterThan(0);
  });

  it("varies the interpretation by status", () => {
    const good = getMetricDetails("air_quality", "good");
    const bad = getMetricDetails("air_quality", "hazardous");
    expect(good.whatItMeans).not.toBe(bad.whatItMeans);
    expect(good.recommendations).not.toEqual(bad.recommendations);
  });

  it("keeps the static description stable across statuses", () => {
    // Only the interpretation should move; the definition of the metric is
    // a fact about the metric, not about today's reading.
    const a = getMetricDetails("air_quality", "good");
    const b = getMetricDetails("air_quality", "hazardous");
    expect(a.description).toBe(b.description);
    expect(a.normalRange).toBe(b.normalRange);
  });

  it.each(STATUSES)("handles the %s status for every known metric", (s) => {
    for (const metricId of KNOWN) {
      const d = getMetricDetails(metricId, s);
      expect(typeof d.whatItMeans).toBe("string");
      expect(Array.isArray(d.healthImpacts)).toBe(true);
      expect(Array.isArray(d.recommendations)).toBe(true);
    }
  });

  it("degrades to a usable shape for an unknown metric", () => {
    const d = getMetricDetails("not_a_metric", "good");
    expect(d).toBeDefined();
    expect(typeof d.description).toBe("string");
    expect(Array.isArray(d.healthImpacts)).toBe(true);
    expect(Array.isArray(d.recommendations)).toBe(true);
  });

  it("degrades to a usable shape for an unknown status", () => {
    const d = getMetricDetails("air_quality", "banana");
    expect(d.whatItMeans.trim()).not.toBe("");
    expect(d.recommendations.length).toBeGreaterThan(0);
  });

  it("never returns an empty advice string", () => {
    for (const metricId of KNOWN) {
      for (const s of STATUSES) {
        const d = getMetricDetails(metricId, s);
        for (const line of [...d.healthImpacts, ...d.recommendations]) {
          expect(line.trim()).not.toBe("");
        }
      }
    }
  });

  it("returns advice that changes with severity, not a constant", () => {
    // A metric whose advice never moves is worse than useless in a health
    // app: it reads as a considered answer while carrying no information.
    for (const metricId of KNOWN) {
      const rendered = new Set(
        STATUSES.map((s) => getMetricDetails(metricId, s).whatItMeans),
      );
      expect(rendered.size).toBeGreaterThan(1);
    }
  });
});
