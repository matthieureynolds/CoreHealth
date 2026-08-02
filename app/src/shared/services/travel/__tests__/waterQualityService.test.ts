import {
  getWaterQualityData,
  getWaterQualityStatus,
  getWaterQualityRecommendation,
  mapWaterQualityToRiskLevel,
  getWaterQualityIcon,
} from "../waterQualityService";

const GRADES = ["excellent", "good", "fair", "poor", "hazardous"];

describe("water-quality presentation helpers", () => {
  it.each(GRADES)("gives %s a non-empty status label", (q) => {
    expect(getWaterQualityStatus(q).trim()).not.toBe("");
  });

  it.each(GRADES)("gives %s actionable advice", (q) => {
    const r = getWaterQualityRecommendation(q);
    expect(r.trim()).not.toBe("");
    expect(r.length).toBeGreaterThan(10);
  });

  it.each(GRADES)("maps %s to a known risk level", (q) => {
    expect(["low", "moderate", "high", "severe"]).toContain(
      mapWaterQualityToRiskLevel(q),
    );
  });

  it.each(GRADES)("gives %s an icon name", (q) => {
    expect(getWaterQualityIcon(q).trim()).not.toBe("");
  });

  it("escalates risk monotonically from excellent to hazardous", () => {
    const order = { low: 0, moderate: 1, high: 2, severe: 3 } as const;
    const levels = GRADES.map((g) => order[mapWaterQualityToRiskLevel(g)]);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeGreaterThanOrEqual(levels[i - 1]);
    }
  });

  it("gives different advice for safe and unsafe water", () => {
    expect(getWaterQualityRecommendation("excellent")).not.toBe(
      getWaterQualityRecommendation("hazardous"),
    );
  });

  it("degrades gracefully on an unrecognised grade", () => {
    for (const fn of [
      getWaterQualityStatus,
      getWaterQualityRecommendation,
      getWaterQualityIcon,
    ]) {
      expect(typeof fn("banana")).toBe("string");
      expect(typeof fn("")).toBe("string");
    }
    expect(["low", "moderate", "high", "severe"]).toContain(
      mapWaterQualityToRiskLevel("banana"),
    );
  });
});

describe("getWaterQualityData", () => {
  const realFetch = global.fetch;
  afterAll(() => {
    global.fetch = realFetch;
  });

  it("returns a usable object for a normal location", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ results: [] }),
      text: async () => "{}",
    }) as unknown as typeof fetch;
    const d = await getWaterQualityData(51.5, -0.12, "London");
    expect(d).toBeDefined();
    expect(typeof d).toBe("object");
  });

  it("still returns an assessment when the station lookup fails", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(
        new TypeError("Network request failed"),
      ) as unknown as typeof fetch;
    const d = await getWaterQualityData(51.5, -0.12, "London");
    expect(d).toBeDefined();
  });

  it("handles an unknown location name", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => "{}",
    }) as unknown as typeof fetch;
    await expect(
      getWaterQualityData(0, 0, "Nowhere In Particular"),
    ).resolves.toBeDefined();
  });
});
