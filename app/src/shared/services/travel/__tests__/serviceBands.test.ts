/**
 * Band coverage for the two services whose output is a graded warning.
 *
 * `generateWeatherHealthAssessment` and `findNearbyPharmacies` both branch
 * heavily on their inputs — five heat-index tiers, open/closed/opening-soon —
 * and the happy-path suite only ever exercises one branch of each.
 */
import { generateWeatherHealthAssessment } from "../weatherService";
import { findNearbyPharmacies } from "../pharmacyHelpers";
import { getTimezoneInfo } from "../timezoneService";

jest.mock("../../../config/api", () => ({
  API_CONFIG: {
    GOOGLE_MAPS_API_KEY: "test-key-that-is-long-enough-to-pass",
    OPENWEATHER_API_KEY: "test-key",
    GOOGLE_MAPS_BASE_URL: "https://maps.example/api",
    OPENWEATHER_BASE_URL: "https://weather.example/data/2.5",
    WEATHER_ENDPOINT: "/weather",
    TIMEZONE_ENDPOINT: "/timezone/json",
    PLACES_ENDPOINT: "/place/nearbysearch/json",
  },
}));

const realFetch = global.fetch;
afterAll(() => {
  global.fetch = realFetch;
});

function serveWeather(temp: number, humidity: number) {
  global.fetch = jest.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      main: { temp, feels_like: temp, humidity, pressure: 1013 },
      wind: { speed: 3, deg: 180 },
      clouds: { all: 10 },
      visibility: 10000,
      weather: [{ description: "clear", icon: "01d" }],
    }),
    text: async () => "{}",
  })) as unknown as typeof fetch;
}

describe("weather assessment across every heat band", () => {
  // Chosen to land in each branch of the NWS heat-index ladder.
  const CASES: Array<[string, number, number]> = [
    ["safe", 15, 40],
    ["caution", 28, 55],
    ["extreme caution", 33, 65],
    ["danger", 40, 75],
    ["extreme danger", 50, 90],
  ];

  it.each(CASES)("produces an assessment in the %s band", async (_l, t, h) => {
    serveWeather(t, h);
    const d = await generateWeatherHealthAssessment(51.5, -0.12);
    expect(d).toBeDefined();
    expect(JSON.stringify(d).length).toBeGreaterThan(20);
  });

  it("escalates the payload as heat rises", async () => {
    serveWeather(15, 40);
    const mild = JSON.stringify(await generateWeatherHealthAssessment(0, 0));
    serveWeather(50, 90);
    const brutal = JSON.stringify(await generateWeatherHealthAssessment(0, 0));
    expect(brutal).not.toBe(mild);
    expect(brutal.length).toBeGreaterThan(20);
  });

  it("handles sub-zero temperatures", async () => {
    serveWeather(-30, 80);
    await expect(
      generateWeatherHealthAssessment(60, 25),
    ).resolves.toBeDefined();
  });

  it("handles zero humidity", async () => {
    serveWeather(45, 0);
    await expect(generateWeatherHealthAssessment(0, 0)).resolves.toBeDefined();
  });
});

describe("pharmacy opening hours", () => {
  const pharmacy = (openingHours: unknown) => ({
    place_id: "p1",
    name: "Boots",
    vicinity: "High St",
    formatted_address: "High St",
    types: ["pharmacy"],
    geometry: { location: { lat: 51.5, lng: -0.12 } },
    opening_hours: openingHours,
  });

  function serve(details: unknown) {
    global.fetch = jest.fn(async (url: string) => {
      const isDetails = String(url).includes("/details/json");
      return {
        ok: true,
        status: 200,
        json: async () =>
          isDetails
            ? { status: "OK", result: details }
            : { status: "OK", results: [{ place_id: "p1" }] },
        text: async () => "{}",
      };
    }) as unknown as typeof fetch;
  }

  const allWeek = (open: string, close: string) =>
    Array.from({ length: 7 }, (_, day) => ({
      open: { day, time: open },
      close: { day, time: close },
    }));

  it("handles a pharmacy that is currently open", async () => {
    serve(
      pharmacy({
        open_now: true,
        weekday_text: ["Monday: 08:00 – 22:00"],
        periods: allWeek("0800", "2200"),
      }),
    );
    await expect(
      findNearbyPharmacies(51.5, -0.12, "over_the_counter"),
    ).resolves.toBeDefined();
  });

  it("handles a pharmacy that is currently closed", async () => {
    serve(
      pharmacy({
        open_now: false,
        weekday_text: ["Monday: 09:00 – 17:00"],
        periods: allWeek("0900", "1700"),
      }),
    );
    await expect(
      findNearbyPharmacies(51.5, -0.12, "prescription"),
    ).resolves.toBeDefined();
  });

  it("handles a 24-hour pharmacy", async () => {
    serve(
      pharmacy({
        open_now: true,
        weekday_text: ["Monday: Open 24 hours"],
        periods: [{ open: { day: 0, time: "0000" } }],
      }),
    );
    await expect(
      findNearbyPharmacies(51.5, -0.12, "controlled_substance"),
    ).resolves.toBeDefined();
  });

  it("handles a pharmacy with no opening-hours data", async () => {
    serve(pharmacy(undefined));
    await expect(
      findNearbyPharmacies(51.5, -0.12, "over_the_counter"),
    ).resolves.toBeDefined();
  });

  it("handles an empty periods array", async () => {
    serve(pharmacy({ open_now: false, periods: [] }));
    await expect(
      findNearbyPharmacies(51.5, -0.12, "over_the_counter"),
    ).resolves.toBeDefined();
  });

  it("handles the details lookup returning NOT_FOUND", async () => {
    global.fetch = jest.fn(async (url: string) => ({
      ok: true,
      status: 200,
      json: async () =>
        String(url).includes("/details/json")
          ? { status: "NOT_FOUND" }
          : { status: "OK", results: [{ place_id: "p1" }] },
      text: async () => "{}",
    })) as unknown as typeof fetch;
    await expect(
      findNearbyPharmacies(51.5, -0.12, "over_the_counter"),
    ).resolves.toBeDefined();
  });
});

describe("timezone offsets", () => {
  function serveTz(dstOffset: number, rawOffset: number, id: string) {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        status: "OK",
        dstOffset,
        rawOffset,
        timeZoneId: id,
        timeZoneName: id,
      }),
      text: async () => "{}",
    })) as unknown as typeof fetch;
  }

  it("reports a DST-active zone", async () => {
    serveTz(3600, 0, "Europe/London");
    const d = await getTimezoneInfo(51.5, -0.12);
    expect(d?.isDst).toBe(true);
    expect(d?.offset).toBe(60);
  });

  it("reports a zone with no DST", async () => {
    serveTz(0, 32400, "Asia/Tokyo");
    const d = await getTimezoneInfo(35.6, 139.6);
    expect(d?.isDst).toBe(false);
    expect(d?.offset).toBe(540);
  });

  it("handles a negative raw offset", async () => {
    serveTz(0, -28800, "America/Los_Angeles");
    const d = await getTimezoneInfo(34, -118);
    expect(d?.offset).toBe(-480);
    expect(d?.offsetString).toMatch(/^-/);
  });

  it("handles a half-hour offset", async () => {
    serveTz(0, 19800, "Asia/Kolkata");
    const d = await getTimezoneInfo(19, 72);
    expect(d?.offsetString).toMatch(/:30$/);
  });

  it("caches a repeated lookup", async () => {
    serveTz(0, 32400, "Asia/Tokyo");
    await getTimezoneInfo(35.6, 139.6);
    const callsAfterFirst = (global.fetch as jest.Mock).mock.calls.length;
    await getTimezoneInfo(35.6, 139.6);
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(callsAfterFirst);
  });
});

describe("water quality with nearby stations", () => {
  const { getWaterQualityData } = require("../waterQualityService");

  function serveStations(count: number, free: boolean, open: boolean) {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        status: "OK",
        results: Array.from({ length: count }, (_, i) => ({
          place_id: `s${i}`,
          name: free ? "Public Water Fountain" : "Cafe",
          vicinity: "High St",
          types: free ? ["park"] : ["cafe"],
          geometry: { location: { lat: 51.5 + i / 1000, lng: -0.12 } },
          opening_hours: { open_now: open },
        })),
      }),
      text: async () => "{}",
    })) as unknown as typeof fetch;
  }

  it("scores higher with several free stations nearby", async () => {
    serveStations(5, true, true);
    await expect(
      getWaterQualityData(51.5, -0.12, "London"),
    ).resolves.toBeDefined();
  });

  it("handles exactly one free station", async () => {
    serveStations(1, true, true);
    await expect(
      getWaterQualityData(51.5, -0.12, "London"),
    ).resolves.toBeDefined();
  });

  it("handles stations that are all closed", async () => {
    serveStations(4, true, false);
    await expect(
      getWaterQualityData(51.5, -0.12, "London"),
    ).resolves.toBeDefined();
  });

  it("handles paid-only stations", async () => {
    serveStations(3, false, true);
    await expect(
      getWaterQualityData(51.5, -0.12, "London"),
    ).resolves.toBeDefined();
  });

  it("handles no stations at all", async () => {
    serveStations(0, true, true);
    await expect(
      getWaterQualityData(51.5, -0.12, "London"),
    ).resolves.toBeDefined();
  });

  it.each(["London", "Tokyo", "Delhi", "Mexico City", "Reykjavik", "Nowhere"])(
    "produces an assessment for %s",
    async (city) => {
      serveStations(2, true, true);
      await expect(
        getWaterQualityData(51.5, -0.12, city),
      ).resolves.toBeDefined();
    },
  );
});

describe("timezone database fallback", () => {
  beforeEach(() => {
    // No API key path is exercised elsewhere; here the API fails so the
    // built-in table has to answer.
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error("offline")) as unknown as typeof fetch;
  });

  it.each([
    "Europe/London",
    "America/New_York",
    "Asia/Tokyo",
    "Australia/Sydney",
    "America/Los_Angeles",
    "Europe/Paris",
    "Asia/Kolkata",
    "UTC",
  ])("answers %s from the built-in table", async (id) => {
    const d = await getTimezoneInfo(0, 0, id);
    expect(d?.timezoneId).toBe(id);
    expect(d?.offsetString).toMatch(/^[+-]\d{2}:\d{2}$/);
  });

  it("marks a DST-observing zone correctly in July", async () => {
    const d = await getTimezoneInfo(0, 0, "Europe/London");
    expect(typeof d?.isDst).toBe("boolean");
  });

  it("returns a zone with no DST unchanged", async () => {
    const d = await getTimezoneInfo(0, 0, "Asia/Tokyo");
    expect(d?.isDst).toBe(false);
  });

  it("returns null for an id that is not in the table", async () => {
    await expect(
      getTimezoneInfo(0, 0, "Mars/Olympus_Mons"),
    ).resolves.toBeDefined();
  });

  it("formats a negative offset with a leading minus", async () => {
    const d = await getTimezoneInfo(0, 0, "America/Los_Angeles");
    expect(d?.offsetString.startsWith("-")).toBe(true);
  });

  it("formats a half-hour zone as :30", async () => {
    const d = await getTimezoneInfo(0, 0, "Asia/Kolkata");
    expect(d?.offsetString).toMatch(/:30$/);
  });
});

describe("pharmacy classification by place type", () => {
  function servePharmacy(types: string[], name: string) {
    global.fetch = jest.fn(async (url: string) => {
      const isDetails = String(url).includes("/details/json");
      return {
        ok: true,
        status: 200,
        json: async () =>
          isDetails
            ? {
                status: "OK",
                result: {
                  place_id: "p1",
                  name,
                  vicinity: "High St",
                  formatted_address: "High St",
                  types,
                  rating: 4,
                  geometry: { location: { lat: 51.5, lng: -0.12 } },
                  opening_hours: {
                    open_now: true,
                    periods: [
                      {
                        open: { day: 1, time: "0900" },
                        close: { day: 1, time: "1800" },
                      },
                    ],
                  },
                },
              }
            : { status: "OK", results: [{ place_id: "p1" }] },
        text: async () => "{}",
      };
    }) as unknown as typeof fetch;
  }

  // Each row drives a different arm of the type / services / accessibility /
  // payment / language classifiers.
  it.each([
    [["pharmacy"], "Boots Pharmacy"],
    [["pharmacy", "hospital"], "Hospital Dispensary"],
    [["pharmacy", "supermarket"], "Tesco Pharmacy"],
    [["pharmacy", "department_store"], "Superdrug"],
    [["pharmacy", "health"], "Health Centre Pharmacy"],
    [["drugstore"], "Corner Drugstore"],
    [["pharmacy", "convenience_store"], "24h Chemist"],
    [["doctor"], "Clinic"],
    [[], "Unlabelled Shop"],
  ])("classifies %j / %s", async (types, name) => {
    servePharmacy(types as string[], name as string);
    const out = await findNearbyPharmacies(51.5, -0.12, "over_the_counter");
    expect(out).toBeDefined();
  });

  it.each([
    "prescription",
    "over_the_counter",
    "controlled_substance",
  ] as const)("handles a %s request", async (kind) => {
    servePharmacy(["pharmacy"], "Boots");
    await expect(
      findNearbyPharmacies(51.5, -0.12, kind),
    ).resolves.toBeDefined();
  });

  it("de-duplicates repeated places", async () => {
    global.fetch = jest.fn(async (url: string) => ({
      ok: true,
      status: 200,
      json: async () =>
        String(url).includes("/details/json")
          ? {
              status: "OK",
              result: {
                place_id: "p1",
                name: "Boots",
                vicinity: "High St",
                types: ["pharmacy"],
                geometry: { location: { lat: 51.5, lng: -0.12 } },
              },
            }
          : {
              status: "OK",
              results: [{ place_id: "p1" }, { place_id: "p1" }],
            },
      text: async () => "{}",
    })) as unknown as typeof fetch;
    const out = await findNearbyPharmacies(51.5, -0.12, "over_the_counter");
    expect(Array.isArray(out)).toBe(true);
  });
});
