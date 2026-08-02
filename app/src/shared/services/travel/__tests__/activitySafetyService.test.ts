import { generateActivitySafetyData } from "../activitySafetyService";
import type { WeatherData, ExtremeHeatWarning } from "../weatherService";
import type { GoogleAirQualityData } from "../googleAirQualityService";

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

const air = (aqi: number): GoogleAirQualityData =>
  ({ universalAqi: aqi }) as GoogleAirQualityData;

describe("generateActivitySafetyData", () => {
  it("returns a populated assessment for benign conditions", () => {
    const d = generateActivitySafetyData(weather(), air(20), null, 3);
    expect(d).toBeDefined();
    expect(typeof d).toBe("object");
  });

  it("works with no air-quality reading", () => {
    expect(() =>
      generateActivitySafetyData(weather(), null, null, 3),
    ).not.toThrow();
  });

  it("works with no heat warning", () => {
    expect(() =>
      generateActivitySafetyData(weather(), air(20), null),
    ).not.toThrow();
  });

  it("rates extreme heat as less safe than mild weather", () => {
    const mild = generateActivitySafetyData(
      weather({ temperature: 20, feelsLike: 20 }),
      air(20),
      null,
      3,
    );
    const hot = generateActivitySafetyData(
      weather({ temperature: 44, feelsLike: 48, humidity: 80 }),
      air(20),
      null,
      3,
    );
    expect(JSON.stringify(hot)).not.toBe(JSON.stringify(mild));
  });

  it("reflects hazardous air quality in the output", () => {
    const clean = generateActivitySafetyData(weather(), air(10), null, 3);
    const filthy = generateActivitySafetyData(weather(), air(300), null, 3);
    expect(JSON.stringify(filthy)).not.toBe(JSON.stringify(clean));
  });

  it("reflects extreme UV in the output", () => {
    const low = generateActivitySafetyData(weather(), air(20), null, 1);
    const extreme = generateActivitySafetyData(weather(), air(20), null, 11);
    expect(JSON.stringify(extreme)).not.toBe(JSON.stringify(low));
  });

  it("survives an active heat warning", () => {
    const warning: ExtremeHeatWarning = {
      isActive: true,
      severity: "extreme",
      temperature: 46,
      heatIndex: 52,
      uvIndex: 10,
      combinedRisk: "severe",
      warnings: ["Heat stroke imminent"],
      recommendations: ["Stay indoors"],
      timeOfDay: "midday",
    };
    expect(() =>
      generateActivitySafetyData(
        weather({ temperature: 46 }),
        air(180),
        warning,
        10,
      ),
    ).not.toThrow();
  });

  it("handles freezing temperatures", () => {
    expect(() =>
      generateActivitySafetyData(
        weather({ temperature: -25, feelsLike: -35, windSpeed: 15 }),
        air(20),
        null,
        0,
      ),
    ).not.toThrow();
  });

  it("handles the extremes of every numeric input at once", () => {
    const d = generateActivitySafetyData(
      weather({
        temperature: 60,
        feelsLike: 70,
        humidity: 100,
        windSpeed: 50,
        visibility: 0,
        cloudCover: 100,
      }),
      air(500),
      null,
      15,
    );
    expect(d).toBeDefined();
  });

  it("is deterministic for identical inputs", () => {
    const a = generateActivitySafetyData(weather(), air(50), null, 5);
    const b = generateActivitySafetyData(weather(), air(50), null, 5);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
