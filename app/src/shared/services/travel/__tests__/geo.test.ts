import { distanceInMetres } from "../geo";

describe("distanceInMetres", () => {
  it("is zero for the same point", () => {
    expect(distanceInMetres(51.5074, -0.1278, 51.5074, -0.1278)).toBe(0);
  });

  it("matches a known city pair", () => {
    // London → Paris is ~344 km great-circle.
    const d = distanceInMetres(51.5074, -0.1278, 48.8566, 2.3522);
    expect(d / 1000).toBeCloseTo(343.6, 0);
  });

  it("is symmetric", () => {
    const a = distanceInMetres(35.6762, 139.6503, -33.8688, 151.2093);
    const b = distanceInMetres(-33.8688, 151.2093, 35.6762, 139.6503);
    expect(a).toBeCloseTo(b, 6);
  });

  it("handles antipodal points without NaN", () => {
    // sqrt(1 - a) goes to zero here, which is where a naive acos formulation
    // produces NaN; atan2 stays defined.
    const d = distanceInMetres(0, 0, 0, 180);
    expect(Number.isFinite(d)).toBe(true);
    expect(d / 1000).toBeCloseTo(20015, 0);
  });

  it("crosses the antimeridian correctly", () => {
    // Two points 2° apart either side of the date line, not 358°.
    const d = distanceInMetres(0, 179, 0, -179);
    expect(d / 1000).toBeCloseTo(222.4, 0);
  });
});
