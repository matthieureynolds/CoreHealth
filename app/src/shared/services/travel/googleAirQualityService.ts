import { API_CONFIG } from "../../config/api";
import { fetchWithTimeout } from "../http";
import { logger } from "../../utils/logger";
import { z } from "zod";
import { parseOrNull } from "../validation";

// Google Air Quality API response interfaces
export interface GoogleAirQualityData {
  universalAqi: number;
  dominantPollutant: string;
  indexes: Array<{
    code: string;
    displayName: string;
    aqi: number;
    aqiDisplay: string;
    color: {
      red: number;
      green: number;
      blue: number;
    };
    category: string;
  }>;
  pollutants: Array<{
    code: string;
    displayName: string;
    fullName: string;
    concentration: {
      value: number;
      units: string;
    };
    additionalInfo: {
      sources: string;
      effects: string;
    };
  }>;
  healthRecommendations: {
    generalPopulation: string;
    elderly: string;
    lungDiseasePopulation: string;
    heartDiseasePopulation: string;
    athletes: string;
    pregnantWomen: string;
    children: string;
  };
}

/**
 * Runtime shape of the Google Air Quality response. Fields the code reads are
 * required; the rest are lenient so a provider adding data cannot break us.
 */
const AirQualityResponseSchema = z.object({
  indexes: z
    .array(
      z.object({
        code: z.string(),
        displayName: z.string().optional(),
        aqi: z.number(),
        aqiDisplay: z.string().optional(),
        color: z
          .object({
            red: z.number().optional(),
            green: z.number().optional(),
            blue: z.number().optional(),
          })
          .optional(),
        category: z.string().optional(),
      }),
    )
    .optional(),
  pollutants: z
    .array(
      z.object({
        code: z.string(),
        displayName: z.string().optional(),
        fullName: z.string().optional(),
        concentration: z
          .object({ value: z.number(), units: z.string() })
          .optional(),
        additionalInfo: z
          .object({ sources: z.string(), effects: z.string() })
          .optional(),
      }),
    )
    .optional(),
  healthRecommendations: z.record(z.string(), z.string()).optional(),
});

export interface GoogleAirQualityResponse {
  indexes: Array<{
    code: string;
    displayName: string;
    aqi: number;
    aqiDisplay: string;
    color: {
      red: number;
      green: number;
      blue: number;
    };
    category: string;
  }>;
  pollutants: Array<{
    code: string;
    displayName: string;
    fullName: string;
    concentration: {
      value: number;
      units: string;
    };
    additionalInfo: {
      sources: string;
      effects: string;
    };
  }>;
  healthRecommendations: {
    generalPopulation: string;
    elderly: string;
    lungDiseasePopulation: string;
    heartDiseasePopulation: string;
    athletes: string;
    pregnantWomen: string;
    children: string;
  };
}

/**
 * Get current air quality data from Google Air Quality API
 */
export const getGoogleAirQualityData = async (
  latitude: number,
  longitude: number,
): Promise<GoogleAirQualityData | null> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      logger.warn("Google Maps API key not found, cannot get air quality data");
      return null;
    }

    const url = `${API_CONFIG.GOOGLE_AIR_QUALITY_BASE_URL}${API_CONFIG.GOOGLE_AIR_QUALITY_ENDPOINT}?key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const requestBody = {
      universalAqi: true,
      location: {
        latitude: latitude,
        longitude: longitude,
      },
      extraComputations: [
        "HEALTH_RECOMMENDATIONS",
        "DOMINANT_POLLUTANT",
        "POLLUTANT_CONCENTRATION",
        "LOCAL_AQI",
        "POLLUTANT_ADDITIONAL_INFO",
      ],
      languageCode: "en",
    };

    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Google Air Quality API error: ${response.status}`);
    }

    const raw = await response.json();
    const parsed = parseOrNull(
      AirQualityResponseSchema,
      raw,
      "googleAirQuality",
    );
    if (!parsed) return null;
    const data = parsed as unknown as GoogleAirQualityResponse;

    // Find the universal AQI index
    const universalIndex = data.indexes?.find((index) => index.code === "uaqi");

    if (!universalIndex) {
      logger.warn("No universal AQI data found");
      return null;
    }

    // Get the dominant pollutant
    const dominantPollutant = data.pollutants?.[0]?.code || "unknown";

    const airQualityData: GoogleAirQualityData = {
      universalAqi: universalIndex.aqi,
      dominantPollutant: dominantPollutant,
      indexes: data.indexes || [],
      pollutants: data.pollutants || [],
      healthRecommendations: data.healthRecommendations || {
        generalPopulation: "Air quality data unavailable",
        elderly: "Air quality data unavailable",
        lungDiseasePopulation: "Air quality data unavailable",
        heartDiseasePopulation: "Air quality data unavailable",
        athletes: "Air quality data unavailable",
        pregnantWomen: "Air quality data unavailable",
        children: "Air quality data unavailable",
      },
    };

    return airQualityData;
  } catch (error) {
    logger.error("Error fetching Google air quality data:", error);
    return null;
  }
};

/**
 * Get air quality status from Google AQI
 */
export const getGoogleAirQualityStatus = (aqi: number): string => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

/**
 * Get air quality recommendation from Google data
 */
export const getGoogleAirQualityRecommendation = (
  aqi: number,
  healthRecommendations?: GoogleAirQualityData["healthRecommendations"],
): string => {
  // Use Google's specific health recommendations if available
  if (healthRecommendations?.generalPopulation) {
    return healthRecommendations.generalPopulation;
  }

  // Fallback to generic recommendations
  if (aqi <= 50) return "Air quality is good. Enjoy outdoor activities!";
  if (aqi <= 100)
    return "Air quality is moderate. Sensitive individuals should consider reducing outdoor activities.";
  if (aqi <= 150)
    return "Unhealthy for sensitive groups. Limit prolonged outdoor exertion.";
  if (aqi <= 200)
    return "Unhealthy air quality. Everyone should avoid prolonged outdoor exertion.";
  if (aqi <= 300)
    return "Very unhealthy air quality. Avoid outdoor activities.";
  return "Hazardous air quality. Stay indoors and avoid all outdoor activities.";
};

/**
 * Map Google AQI to risk level
 */
export const mapGoogleAqiToRiskLevel = (
  aqi: number,
): "low" | "moderate" | "high" | "severe" => {
  if (aqi <= 50) return "low";
  if (aqi <= 100) return "low";
  if (aqi <= 150) return "moderate";
  if (aqi <= 200) return "high";
  return "severe";
};

/**
 * Get detailed pollutant information
 */
export const getPollutantDetails = (
  pollutants: GoogleAirQualityData["pollutants"],
): string => {
  if (!pollutants || pollutants.length === 0) {
    return "No detailed pollutant data available";
  }

  const mainPollutant = pollutants[0];
  const concentration = mainPollutant.concentration;

  return `${mainPollutant.displayName}: ${concentration.value} ${concentration.units}`;
};
