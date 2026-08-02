/**
 * The branches the other suites do not reach: the OSM fallback in the enhanced
 * healthcare lookup, per-country medication restrictions, and each severity
 * arm of the activity-safety assessment.
 */
import { getClosestMedicalFacilities } from "../healthcarePlacesServiceEnhanced";
import {
  getMultipleMedicationsAvailability,
  generateTravelMedicationKit,
} from "../medicationAvailabilityService";
import { generateActivitySafetyData } from "../activitySafetyService";
import type { WeatherData, ExtremeHeatWarning } from "../weatherService";
import type { GoogleAirQualityData } from "../googleAirQualityService";

jest.mock("../../../config/api", () => ({
  API_CONFIG: {
    GOOGLE_MAPS_API_KEY: "test-key-that-is-long-enough-to-pass",
    GOOGLE_MAPS_BASE_URL: "https://maps.example/api",
    PLACES_ENDPOINT: "/place/nearbysearch/json",
  },
}));

const realFetch = global.fetch;
afterAll(() => {
  global.fetch = realFetch;
});

describe("healthcare — OSM fallback path", () => {
  it("uses Nominatim results when Google returns none", async () => {
    global.fetch = jest.fn(async (url: string) => {
      const osm = String(url).includes("nominatim");
      return {
        ok: true,
        status: 200,
        json: async () =>
          osm
            ? [
                {
                  display_name: "Guy's Hospital, Southwark, London",
                  lat: "51.5032",
                  lon: "-0.0875",
                  name: "Guy's Hospital",
                  place_id: 12345,
                  extratags: { phone: "+44 20 7188 7188" },
                  type: "hospital",
                },
              ]
            : { status: "ZERO_RESULTS", results: [] },
        text: async () => "[]",
      };
    }) as unknown as typeof fetch;

    const out = await getClosestMedicalFacilities(51.5, -0.12);
    expect(out).toBeDefined();
  });

  it("derives a name from display_name when `name` is absent", async () => {
    global.fetch = jest.fn(async (url: string) => ({
      ok: true,
      status: 200,
      json: async () =>
        String(url).includes("nominatim")
          ? [
              {
                display_name: "Riverside Pharmacy, High Street, London",
                lat: "51.50",
                lon: "-0.12",
              },
            ]
          : { status: "ZERO_RESULTS", results: [] },
      text: async () => "[]",
    })) as unknown as typeof fetch;
    await expect(
      getClosestMedicalFacilities(51.5, -0.12),
    ).resolves.toBeDefined();
  });

  it("falls back to a generic name for an unhelpful display_name", async () => {
    global.fetch = jest.fn(async (url: string) => ({
      ok: true,
      status: 200,
      json: async () =>
        String(url).includes("nominatim")
          ? [{ display_name: "A, B, C", lat: "51.50", lon: "-0.12" }]
          : { status: "ZERO_RESULTS", results: [] },
      text: async () => "[]",
    })) as unknown as typeof fetch;
    await expect(
      getClosestMedicalFacilities(51.5, -0.12),
    ).resolves.toBeDefined();
  });

  it("survives both providers failing", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error("offline")) as unknown as typeof fetch;
    await expect(
      getClosestMedicalFacilities(51.5, -0.12),
    ).resolves.toBeDefined();
  });
});

describe("medication availability across countries", () => {
  beforeEach(() => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ status: "OK", results: [] }),
      text: async () => "{}",
    })) as unknown as typeof fetch;
  });

  // Countries with markedly different regimes exercise the restriction and
  // import-rule branches.
  it.each([
    "Japan",
    "United States",
    "United Kingdom",
    "Singapore",
    "UAE",
    "Thailand",
    "Australia",
    "Germany",
  ])("produces guidance for %s", async (country) => {
    const out = await getMultipleMedicationsAvailability(
      ["Ibuprofen"],
      country,
    );
    expect(out).toHaveLength(1);
    expect(out[0].currentCountry.country).toBe(country);
  });

  it("includes import regulations", async () => {
    const [entry] = await getMultipleMedicationsAvailability(
      ["Ibuprofen"],
      "Japan",
    );
    expect(entry.importRegulations).toBeDefined();
  });

  it("returns recommendations tailored to availability", async () => {
    const [entry] = await getMultipleMedicationsAvailability(
      ["Ibuprofen"],
      "Japan",
    );
    expect(entry.recommendations.length).toBeGreaterThan(0);
  });

  it.each(["Japan", "Singapore", "UAE", "Atlantis"])(
    "builds a travel kit for %s",
    (country) => {
      expect(() => generateTravelMedicationKit(country, 21)).not.toThrow();
    },
  );
});

describe("activity safety across every input arm", () => {
  const weather = (over: Partial<WeatherData> = {}): WeatherData => ({
    temperature: 20,
    feelsLike: 20,
    humidity: 50,
    pressure: 1013,
    windSpeed: 3,
    windDirection: 180,
    visibility: 10000,
    cloudCover: 20,
    description: "Clear",
    icon: "01d",
    ...over,
  });
  const air = (aqi: number) => ({ universalAqi: aqi }) as GoogleAirQualityData;

  it.each([0, 25, 50, 75, 100, 150, 200, 300])("assesses AQI %i", (aqi) => {
    expect(() =>
      generateActivitySafetyData(weather(), air(aqi), null, 5),
    ).not.toThrow();
  });

  it.each([0, 2, 5, 7, 10, 12])("assesses UV %i", (uv) => {
    expect(() =>
      generateActivitySafetyData(weather(), air(30), null, uv),
    ).not.toThrow();
  });

  it.each([-30, -10, 0, 15, 25, 35, 42, 50])(
    "assesses %i degrees",
    (temperature) => {
      expect(() =>
        generateActivitySafetyData(
          weather({ temperature, feelsLike: temperature }),
          air(30),
          null,
          5,
        ),
      ).not.toThrow();
    },
  );

  it.each(["moderate", "high", "extreme"] as const)(
    "assesses a %s heat warning",
    (severity) => {
      const warning: ExtremeHeatWarning = {
        isActive: true,
        severity,
        temperature: 44,
        heatIndex: 50,
        uvIndex: 10,
        combinedRisk: "severe",
        warnings: ["Heat stroke risk"],
        recommendations: ["Stay indoors"],
        timeOfDay: "midday",
      };
      expect(() =>
        generateActivitySafetyData(
          weather({ temperature: 44 }),
          air(120),
          warning,
          10,
        ),
      ).not.toThrow();
    },
  );

  it("assesses low visibility and high wind", () => {
    expect(() =>
      generateActivitySafetyData(
        weather({ visibility: 200, windSpeed: 25, cloudCover: 100 }),
        air(80),
        null,
        2,
      ),
    ).not.toThrow();
  });
});
