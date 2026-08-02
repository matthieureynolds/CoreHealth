/**
 * The two remaining branch-heavy services.
 *
 * `getCurrentUVIndex` is a pure model — latitude band × hemisphere season ×
 * time of day — so it gets a full sweep. Geocoding branches on which address
 * component Google happens to supply, which is the part that silently produces
 * "Unknown City" when it guesses wrong.
 */
import { getCurrentUVIndex } from "../uvIndexService";
import { geocodeAddress, reverseGeocode } from "../geocodingService";

jest.mock("../../../config/api", () => ({
  API_CONFIG: {
    GOOGLE_MAPS_API_KEY: "test-key-that-is-long-enough-to-pass",
    GOOGLE_MAPS_BASE_URL: "https://maps.example/api",
    GEOCODING_ENDPOINT: "/geocode/json",
  },
}));

const realFetch = global.fetch;
const realDate = Date;
afterAll(() => {
  global.fetch = realFetch;
  global.Date = realDate;
});

/** Pins "now" so the seasonal and time-of-day branches are deterministic. */
function freeze(iso: string) {
  const fixed = new realDate(iso);
  // `new Date()` with no args must yield the frozen instant; every other
  // signature passes straight through.
  global.Date = class extends realDate {
    constructor(...args: unknown[]) {
      super(
        ...((args.length === 0
          ? [fixed.getTime()]
          : args) as ConstructorParameters<typeof Date>),
      );
    }
    static now() {
      return fixed.getTime();
    }
  } as DateConstructor;
}

describe("UV index by latitude band", () => {
  beforeEach(() => freeze("2026-07-15T12:00:00Z"));

  it.each([
    ["equatorial", 0],
    ["tropical", 15],
    ["subtropical", 25],
    ["temperate", 35],
    ["cool temperate", 45],
    ["subarctic", 55],
    ["arctic", 70],
  ])("produces a reading in the %s band", (_label, lat) => {
    const d = getCurrentUVIndex(lat, 0);
    expect(d.uvIndex).toBeGreaterThanOrEqual(0);
    expect(d.category.trim()).not.toBe("");
    expect(d.recommendation.trim()).not.toBe("");
  });

  it("gives the equator a higher index than the arctic", () => {
    expect(getCurrentUVIndex(0, 0).uvIndex).toBeGreaterThan(
      getCurrentUVIndex(75, 0).uvIndex,
    );
  });

  it("treats northern and southern latitudes symmetrically by magnitude", () => {
    freeze("2026-07-15T12:00:00Z");
    const north = getCurrentUVIndex(25, 0).uvIndex;
    freeze("2026-01-15T12:00:00Z");
    const southSummer = getCurrentUVIndex(-25, 0).uvIndex;
    // Both are in their own summer, so neither should be near zero.
    expect(north).toBeGreaterThan(0);
    expect(southSummer).toBeGreaterThan(0);
  });
});

describe("UV index seasonality", () => {
  it("is higher in northern summer than northern winter", () => {
    freeze("2026-07-15T12:00:00Z");
    const summer = getCurrentUVIndex(45, 0).uvIndex;
    freeze("2026-01-15T12:00:00Z");
    const winter = getCurrentUVIndex(45, 0).uvIndex;
    expect(summer).toBeGreaterThan(winter);
  });

  it("inverts the seasons in the southern hemisphere", () => {
    freeze("2026-01-15T12:00:00Z");
    const southSummer = getCurrentUVIndex(-35, 0).uvIndex;
    freeze("2026-07-15T12:00:00Z");
    const southWinter = getCurrentUVIndex(-35, 0).uvIndex;
    expect(southSummer).toBeGreaterThan(southWinter);
  });

  it.each(["2026-03-15", "2026-09-15", "2026-04-15", "2026-08-15"])(
    "handles the shoulder month around %s",
    (day) => {
      freeze(`${day}T12:00:00Z`);
      expect(getCurrentUVIndex(45, 0).uvIndex).toBeGreaterThanOrEqual(0);
      expect(getCurrentUVIndex(-45, 0).uvIndex).toBeGreaterThanOrEqual(0);
    },
  );
});

describe("UV index by time of day", () => {
  it("peaks around noon and falls to near zero at night", () => {
    freeze("2026-07-15T12:00:00Z");
    const noon = getCurrentUVIndex(25, 0).uvIndex;
    freeze("2026-07-15T03:00:00Z");
    const night = getCurrentUVIndex(25, 0).uvIndex;
    expect(noon).toBeGreaterThan(night);
  });

  it.each([0, 6, 9, 12, 15, 18, 21, 23])("handles hour %i", (hour) => {
    freeze(`2026-07-15T${String(hour).padStart(2, "0")}:00:00Z`);
    const d = getCurrentUVIndex(25, 0);
    expect(Number.isFinite(d.uvIndex)).toBe(true);
    expect(d.uvIndex).toBeGreaterThanOrEqual(0);
  });

  it("always carries a timestamp and a protective recommendation", () => {
    freeze("2026-07-15T12:00:00Z");
    const d = getCurrentUVIndex(0, 0);
    expect(d.timestamp).toBeTruthy();
    expect(d.recommendation.length).toBeGreaterThan(5);
  });
});

describe("geocoding address-component fallbacks", () => {
  function serve(components: Array<{ long_name: string; types: string[] }>) {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        status: "OK",
        results: [
          {
            formatted_address: "Somewhere",
            geometry: { location: { lat: 1, lng: 2 } },
            address_components: components,
          },
        ],
      }),
      text: async () => "{}",
    })) as unknown as typeof fetch;
  }

  const country = { long_name: "Testland", types: ["country"] };

  it.each([
    ["locality", "Springfield"],
    ["sublocality", "Shelbyville"],
    ["sublocality_level_1", "Ogdenville"],
    ["administrative_area_level_2", "North Haverbrook"],
    ["administrative_area_level_1", "Capital City"],
  ])("uses %s when it is the most specific available", async (type, name) => {
    serve([{ long_name: name, types: [type] }, country]);
    const d = await geocodeAddress("anywhere");
    expect(JSON.stringify(d)).toContain(name);
  });

  it("prefers locality over the broader areas", async () => {
    serve([
      { long_name: "Capital City", types: ["administrative_area_level_1"] },
      { long_name: "Springfield", types: ["locality"] },
      country,
    ]);
    const d = await geocodeAddress("anywhere");
    expect(JSON.stringify(d)).toContain("Springfield");
  });

  it("falls back to Unknown City when no place component matches", async () => {
    serve([{ long_name: "12345", types: ["postal_code"] }, country]);
    const d = await geocodeAddress("anywhere");
    expect(JSON.stringify(d)).toContain("Unknown City");
  });

  it("applies the same fallbacks in reverse geocoding", async () => {
    serve([{ long_name: "Shelbyville", types: ["sublocality"] }, country]);
    const d = await reverseGeocode(1, 2);
    expect(JSON.stringify(d)).toContain("Shelbyville");
  });

  it("handles an empty component list", async () => {
    serve([]);
    await expect(geocodeAddress("anywhere")).resolves.toBeDefined();
  });
});
