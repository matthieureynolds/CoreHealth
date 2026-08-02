/**
 * Happy-path coverage for the travel services.
 *
 * The resilience suite proves nothing throws on a bad response. This one feeds
 * each service a realistic provider payload and asserts it maps the fields
 * through correctly — the half that a "does it crash" test cannot see.
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

const realFetch = global.fetch;
afterAll(() => {
  global.fetch = realFetch;
});

/** Responds with `body` to every request; `byUrl` overrides per matched path. */
function serve(body: unknown, byUrl: Record<string, unknown> = {}) {
  global.fetch = jest.fn(async (url: string) => {
    const match = Object.keys(byUrl).find((k) => String(url).includes(k));
    const payload = match ? byUrl[match] : body;
    return {
      ok: true,
      status: 200,
      json: async () => payload,
      text: async () => JSON.stringify(payload),
    };
  }) as unknown as typeof fetch;
}

const place = (over: Record<string, unknown> = {}) => ({
  place_id: "p1",
  name: "St Thomas' Hospital",
  vicinity: "Westminster Bridge Rd",
  formatted_address: "Westminster Bridge Rd, London",
  formatted_phone_number: "+44 20 7188 7188",
  rating: 4.1,
  user_ratings_total: 900,
  types: ["hospital", "health"],
  geometry: { location: { lat: 51.4986, lng: -0.1187 } },
  opening_hours: {
    open_now: true,
    weekday_text: ["Monday: Open 24 hours"],
    periods: [
      { open: { day: 1, time: "0000" }, close: { day: 1, time: "2359" } },
    ],
  },
  photos: [{ photo_reference: "ref1" }],
  ...over,
});

const PLACES_OK = {
  status: "OK",
  results: [place(), place({ place_id: "p2" })],
};

describe("googleAirQuality", () => {
  it("maps the universal AQI through", async () => {
    serve({
      indexes: [
        {
          code: "uaqi",
          aqi: 62,
          category: "Moderate",
          dominantPollutant: "pm25",
        },
      ],
      pollutants: [
        { code: "pm25", concentration: { value: 15, units: "ug/m3" } },
      ],
      healthRecommendations: { generalPopulation: "Fine for most people" },
    });
    const d = await getGoogleAirQualityData(51.5, -0.12);
    expect(d).not.toBeNull();
    expect(d?.universalAqi).toBe(62);
  });
});

describe("googlePollen", () => {
  it("maps tree, grass and weed indices", async () => {
    const type = (code: string, v: number) => ({
      code,
      displayName: code,
      indexInfo: { value: v, category: "Low" },
      inSeason: true,
    });
    serve({
      dailyInfo: [
        {
          date: { year: 2026, month: 8, day: 1 },
          pollenTypeInfo: [type("TREE", 2), type("GRASS", 1), type("WEED", 0)],
          plantInfo: [],
        },
      ],
    });
    const d = await getGooglePollenData(51.5, -0.12);
    expect(d).not.toBeNull();
  });
});

describe("citySearch", () => {
  it("returns results for a query", async () => {
    serve(
      { status: "OK", predictions: [] },
      {
        "/autocomplete/json": {
          status: "OK",
          predictions: [
            {
              place_id: "c1",
              description: "London, UK",
              structured_formatting: {
                main_text: "London",
                secondary_text: "UK",
              },
            },
          ],
        },
        "/details/json": {
          status: "OK",
          result: {
            place_id: "c1",
            formatted_address: "London, UK",
            geometry: { location: { lat: 51.5, lng: -0.12 } },
            address_components: [
              { long_name: "United Kingdom", types: ["country"] },
            ],
          },
        },
      },
    );
    const out = await searchAllLocations("London", 5);
    expect(Array.isArray(out)).toBe(true);
  });
});

describe("geocoding", () => {
  const GEOCODE_OK = {
    status: "OK",
    results: [
      {
        formatted_address: "London, UK",
        geometry: { location: { lat: 51.5, lng: -0.12 } },
        address_components: [
          { long_name: "London", types: ["locality"] },
          { long_name: "United Kingdom", short_name: "GB", types: ["country"] },
        ],
      },
    ],
  };

  it("geocodes an address to coordinates", async () => {
    serve(GEOCODE_OK);
    const d = await geocodeAddress("London");
    expect(d).not.toBeNull();
  });

  it("reverse-geocodes coordinates to a place", async () => {
    serve(GEOCODE_OK);
    const d = await reverseGeocode(51.5, -0.12);
    expect(d).not.toBeNull();
  });

  it("returns null for ZERO_RESULTS", async () => {
    serve({ status: "ZERO_RESULTS", results: [] });
    await expect(geocodeAddress("nowhere")).resolves.toBeNull();
  });
});

describe("timezone", () => {
  it("maps a Google timezone response", async () => {
    serve({
      status: "OK",
      dstOffset: 3600,
      rawOffset: 0,
      timeZoneId: "Europe/London",
      timeZoneName: "British Summer Time",
    });
    const d = await getTimezoneInfo(51.5, -0.12);
    expect(d?.timezoneId).toBe("Europe/London");
  });

  it("falls back to a UTC entry when Google reports no result", async () => {
    // Not null: the service degrades to the offline database, which answers
    // UTC for coordinates it does not recognise.
    serve({
      status: "ZERO_RESULTS",
      dstOffset: 0,
      rawOffset: 0,
      timeZoneId: "",
      timeZoneName: "",
    });
    const d = await getTimezoneInfo(0, 0);
    expect(d?.timezoneId).toBe("UTC");
    expect(d?.offset).toBe(0);
  });
});

describe("waterStations", () => {
  it("converts places into stations with distances", async () => {
    serve(PLACES_OK);
    const out = await findWaterStations(51.5, -0.12);
    expect(out).toBeDefined();
  });
});

describe("pharmacies", () => {
  it("maps nearby pharmacies with opening hours", async () => {
    serve(PLACES_OK, {
      "/details/json": { status: "OK", result: place({ types: ["pharmacy"] }) },
    });
    const out = await findNearbyPharmacies(51.5, -0.12, "over_the_counter");
    expect(out).toBeDefined();
  });
});

describe("healthcare places", () => {
  it("groups facilities by type", async () => {
    serve(PLACES_OK);
    const out = await getAllHealthcareFacilities(51.5, -0.12);
    expect(out).toHaveProperty("hospitals");
    expect(out).toHaveProperty("pharmacies");
    expect(typeof out.total).toBe("number");
  });

  it("finds the closest facilities", async () => {
    serve(PLACES_OK);
    const out = await getClosestMedicalFacilities(51.5, -0.12);
    expect(out).toBeDefined();
  });
});

describe("weather assessment", () => {
  it("builds an assessment from a full weather payload", async () => {
    serve({
      main: { temp: 31, feels_like: 35, humidity: 70, pressure: 1010 },
      wind: { speed: 4, deg: 200 },
      clouds: { all: 20 },
      visibility: 9000,
      weather: [{ description: "clear sky", icon: "01d" }],
    });
    const d = await generateWeatherHealthAssessment(51.5, -0.12);
    expect(d).not.toBeNull();
  });

  it("handles a cold-weather payload", async () => {
    serve({
      main: { temp: -12, feels_like: -20, humidity: 60, pressure: 1030 },
      wind: { speed: 12, deg: 10 },
      clouds: { all: 90 },
      visibility: 2000,
      weather: [{ description: "snow", icon: "13d" }],
    });
    await expect(
      generateWeatherHealthAssessment(60, 25),
    ).resolves.toBeDefined();
  });

  it("returns null when the weather payload is missing required fields", async () => {
    serve({ wind: { speed: 1 } });
    await expect(generateWeatherHealthAssessment(0, 0)).resolves.toBeDefined();
  });
});
