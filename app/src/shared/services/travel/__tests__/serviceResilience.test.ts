/**
 * Every travel service reaches an outside provider. This suite asserts the one
 * property that matters for all of them: a bad response degrades to a safe
 * value instead of throwing into the render tree.
 *
 * The failure this guards against is specific. Services used to do
 * `const data: SomeResponse = await res.json()` — a cast the runtime never
 * checks — so a provider renaming a field surfaced far away as "cannot read
 * property of undefined" rather than at the response that caused it.
 */
import { getGoogleAirQualityData } from "../googleAirQualityService";
import { getGooglePollenData } from "../googlePollenService";
import { searchAllLocations } from "../citySearchService";
import { geocodeAddress, reverseGeocode } from "../geocodingService";
import { getTimezoneInfo } from "../timezoneService";
import { findWaterStations } from "../waterStationService";
import { findNearbyPharmacies } from "../pharmacyHelpers";
import { getAllHealthcareFacilities } from "../healthcarePlacesService";
import { getClosestMedicalFacilities } from "../healthcarePlacesServiceEnhanced";
import { generateWeatherHealthAssessment } from "../weatherService";

jest.mock("../../../config/api", () => ({
  API_CONFIG: {
    GOOGLE_MAPS_API_KEY: "test-key-that-is-long-enough-to-pass",
    OPENWEATHER_API_KEY: "test-key",
    GOOGLE_MAPS_BASE_URL: "https://maps.example/api",
    GOOGLE_AIR_QUALITY_BASE_URL: "https://aq.example/v1",
    GOOGLE_AIR_QUALITY_ENDPOINT: "/currentConditions:lookup",
    GOOGLE_POLLEN_BASE_URL: "https://pollen.example/v1",
    GOOGLE_POLLEN_ENDPOINT: "/forecast:lookup",
    OPENWEATHER_BASE_URL: "https://weather.example/data/2.5",
    WEATHER_ENDPOINT: "/weather",
    GEOCODING_ENDPOINT: "/geocode/json",
    TIMEZONE_ENDPOINT: "/timezone/json",
    PLACES_ENDPOINT: "/place/nearbysearch/json",
  },
}));

/** Payload shapes that a provider could plausibly return on a bad day. */
const MALFORMED: Array<[string, unknown]> = [
  ["null", null],
  ["an empty object", {}],
  ["an array where an object belongs", []],
  ["a string", "service unavailable"],
  ["a number", 0],
  ["an object with the right keys but wrong types", { results: "nope" }],
  ["an error envelope", { error: { code: 500, message: "boom" } }],
  ["nested nulls", { results: [null], status: null }],
];

function mockJson(body: unknown, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  }) as unknown as typeof fetch;
}

/** Each entry: name, invocation, and what "degraded safely" looks like. */
const CALLS: Array<{
  name: string;
  run: () => Promise<unknown>;
  safe: (v: unknown) => void;
}> = [
  {
    name: "googleAirQuality",
    run: () => getGoogleAirQualityData(51.5, -0.12),
    safe: (v) => expect(v === null || typeof v === "object").toBe(true),
  },
  {
    name: "googlePollen",
    run: () => getGooglePollenData(51.5, -0.12),
    safe: (v) => expect(v === null || typeof v === "object").toBe(true),
  },
  {
    name: "citySearch",
    run: () => searchAllLocations("London", 5),
    safe: (v) => expect(Array.isArray(v)).toBe(true),
  },
  {
    name: "geocodeAddress",
    run: () => geocodeAddress("London"),
    safe: (v) => expect(v === null || typeof v === "object").toBe(true),
  },
  {
    name: "reverseGeocode",
    run: () => reverseGeocode(51.5, -0.12),
    safe: (v) => expect(v === null || typeof v === "object").toBe(true),
  },
  {
    name: "timezoneInfo",
    run: () => getTimezoneInfo(51.5, -0.12),
    safe: (v) => expect(v === null || typeof v === "object").toBe(true),
  },
  {
    name: "waterStations",
    run: () => findWaterStations(51.5, -0.12),
    safe: (v) => expect(v === null || typeof v === "object").toBe(true),
  },
  {
    name: "pharmacies",
    run: () => findNearbyPharmacies(51.5, -0.12, "over_the_counter"),
    safe: (v) => expect(Array.isArray(v) || v === null).toBe(true),
  },
  {
    name: "healthcareFacilities",
    run: () => getAllHealthcareFacilities(51.5, -0.12),
    safe: (v) => expect(typeof v).toBe("object"),
  },
  {
    name: "closestMedicalFacilities",
    run: () => getClosestMedicalFacilities(51.5, -0.12),
    safe: (v) => expect(v === null || typeof v === "object").toBe(true),
  },
  {
    name: "weatherAssessment",
    run: () => generateWeatherHealthAssessment(51.5, -0.12),
    safe: (v) => expect(v === null || typeof v === "object").toBe(true),
  },
];

describe("travel services survive malformed provider responses", () => {
  const realFetch = global.fetch;
  afterAll(() => {
    global.fetch = realFetch;
  });

  for (const { name, run, safe } of CALLS) {
    describe(name, () => {
      it.each(MALFORMED)("survives %s", async (_label, body) => {
        mockJson(body);
        const result = await run();
        safe(result);
      });

      it("survives a non-2xx response", async () => {
        mockJson({ error: "nope" }, false, 500);
        safe(await run());
      });

      it("survives a body that is not JSON at all", async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => {
            throw new SyntaxError("Unexpected token < in JSON");
          },
          text: async () => "<html>502 Bad Gateway</html>",
        }) as unknown as typeof fetch;
        safe(await run());
      });

      it("survives the network being unavailable", async () => {
        global.fetch = jest
          .fn()
          .mockRejectedValue(
            new TypeError("Network request failed"),
          ) as unknown as typeof fetch;
        safe(await run());
      });

      it("survives a request that times out", async () => {
        const abortErr = new Error("Aborted");
        abortErr.name = "AbortError";
        global.fetch = jest
          .fn()
          .mockRejectedValue(abortErr) as unknown as typeof fetch;
        safe(await run());
      });
    });
  }
});
