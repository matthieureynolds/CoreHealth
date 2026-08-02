import { getCityCode, getCityName } from "../cityCodes";

describe("getCityName", () => {
  it("strips a country suffix", () => {
    expect(getCityName("Tokyo, Japan")).toBe("Tokyo");
  });

  it("leaves a bare city untouched", () => {
    expect(getCityName("Tokyo")).toBe("Tokyo");
  });

  it("trims surrounding whitespace", () => {
    expect(getCityName("  Paris  , France")).toBe("Paris");
  });

  it("keeps multi-word city names intact", () => {
    expect(getCityName("New York, USA")).toBe("New York");
  });
});

describe("getCityCode", () => {
  it("returns the known code for a mapped city", () => {
    expect(getCityCode("London")).toBe("LDN");
    expect(getCityCode("Tokyo")).toBe("TYO");
  });

  it("is case-insensitive", () => {
    expect(getCityCode("LONDON")).toBe("LDN");
    expect(getCityCode("london")).toBe("LDN");
  });

  it("resolves through a country suffix", () => {
    expect(getCityCode("Tokyo, Japan")).toBe("TYO");
  });

  it("handles multi-word mapped cities", () => {
    expect(getCityCode("New York, USA")).toBe("NYC");
    expect(getCityCode("Hong Kong")).toBe("HKG");
  });

  it("falls back to the first three letters, uppercased", () => {
    expect(getCityCode("Reykjavik")).toBe("REY");
  });

  it("does not crash on a short or empty name", () => {
    expect(getCityCode("Ur")).toBe("UR");
    expect(getCityCode("")).toBe("");
  });

  it("always returns at most three characters", () => {
    for (const c of ["London", "Zzzzzzzzz", "New York, USA", "A"]) {
      expect(getCityCode(c).length).toBeLessThanOrEqual(3);
    }
  });

  it("gives the same answer for both trip screens' input shapes", () => {
    // TripPlanningTab passes "City, Country"; TripDetailScreen passes the same
    // stored value. They previously used separate copies of this table.
    expect(getCityCode("Paris, France")).toBe(getCityCode("Paris"));
  });
});
