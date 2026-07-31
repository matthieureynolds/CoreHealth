import { API_CONFIG } from "../../config/api";
import { getTimezoneInfo } from "./timezoneService";
import { fetchWithTimeout } from "../http";
import { logger } from "../../utils/logger";
import { z } from "zod";
import { parseOrNull } from "../validation";

export interface CitySearchResult {
  name: string;
  country: string;
  formattedAddress: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  placeId: string;
  timezone?: string;
  timezoneOffset?: string;
}

/** Google Places autocomplete + details response shapes. */
const CitySearchResponseSchema = z.object({
  predictions: z
    .array(
      z.object({
        description: z.string(),
        place_id: z.string(),
        structured_formatting: z
          .object({
            main_text: z.string().optional(),
            secondary_text: z.string().optional(),
          })
          .optional(),
        terms: z
          .array(z.object({ offset: z.number().optional(), value: z.string() }))
          .optional(),
        types: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  status: z.string().optional(),
});

const PlaceDetailsResponseSchema = z.object({
  result: z.record(z.string(), z.unknown()).optional(),
  status: z.string().optional(),
});

export interface CitySearchResponse {
  predictions: Array<{
    description: string;
    place_id: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
    terms: Array<{
      offset: number;
      value: string;
    }>;
    types: string[];
  }>;
  status: string;
}

export interface PlaceDetailsResponse {
  result: {
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    place_id: string;
  };
  status: string;
}

/**
 * Get detailed information about a place using its place ID
 */
const getPlaceDetails = async (
  placeId: string,
): Promise<CitySearchResult | null> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      return null;
    }

    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}/place/details/json?place_id=${placeId}&fields=formatted_address,geometry,address_components,place_id&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`Place details API error: ${response.status}`);
    }

    const rawDetails = await response.json();
    const parsedDetails = parseOrNull(
      PlaceDetailsResponseSchema,
      rawDetails,
      "placeDetails",
    );
    if (!parsedDetails) return null;
    const data = parsedDetails as unknown as PlaceDetailsResponse;

    if (data.status !== "OK" || !data.result) {
      return null;
    }

    const result = data.result;
    const addressComponents = result.address_components;

    // Extract city name
    const city =
      addressComponents.find(
        (comp) =>
          comp.types.includes("locality") ||
          comp.types.includes("sublocality") ||
          comp.types.includes("administrative_area_level_2"),
      )?.long_name || "Unknown City";

    // Extract country name
    const country =
      addressComponents.find((comp) => comp.types.includes("country"))
        ?.long_name || "Unknown Country";

    // Get timezone information
    const timezoneInfo = await getTimezoneInfo(
      result.geometry.location.lat,
      result.geometry.location.lng,
    );

    return {
      name: city,
      country: country,
      formattedAddress: result.formatted_address,
      coordinates: {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      },
      placeId: result.place_id,
      timezone: timezoneInfo?.timezoneId,
      timezoneOffset: timezoneInfo?.offsetString,
    };
  } catch (error) {
    logger.error("Error getting place details:", error);
    return null;
  }
};

/**
 * Search for all types of locations including airports, landmarks, and businesses
 */
export const searchAllLocations = async (
  query: string,
  limit: number = 15,
): Promise<CitySearchResult[]> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      logger.warn("Google Maps API key not found, cannot search locations");
      return [];
    }

    if (!query.trim() || query.length < 2) {
      return [];
    }

    // Use Google Places Autocomplete API with no type restrictions for maximum coverage
    const encodedQuery = encodeURIComponent(query);
    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}/place/autocomplete/json?input=${encodedQuery}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`Location search API error: ${response.status}`);
    }

    const rawCity = await response.json();
    const parsedCity = parseOrNull(
      CitySearchResponseSchema,
      rawCity,
      "citySearch",
    );
    if (!parsedCity) return [];
    const data = parsedCity as unknown as CitySearchResponse;

    if (
      data.status !== "OK" ||
      !data.predictions ||
      data.predictions.length === 0
    ) {
      logger.warn("No location search results found for:", query);
      return [];
    }

    // Get detailed information for each location — in parallel for speed
    const predictions = data.predictions.slice(0, limit);
    const locationResults = await Promise.all(
      predictions.map(async (prediction) => {
        try {
          const details = await getPlaceDetails(prediction.place_id);
          if (details) return details;
        } catch (error) {
          logger.warn(
            "Error getting details for place:",
            prediction.place_id,
            error,
          );
        }
        // Fallback to basic info from autocomplete prediction
        return {
          name: prediction.structured_formatting.main_text,
          country: prediction.structured_formatting.secondary_text,
          formattedAddress: prediction.description,
          coordinates: { latitude: 0, longitude: 0 },
          placeId: prediction.place_id,
          timezone: "UTC",
          timezoneOffset: "+00:00",
        } as CitySearchResult;
      }),
    );

    return locationResults;
  } catch (error) {
    logger.error("Error searching all locations:", error);
    return [];
  }
};

/**
 * Get popular cities for initial suggestions
 */
export const getPopularCities = (): string[] => {
  return [
    "Tokyo, Japan",
    "Paris, France",
    "New York, USA",
    "London, UK",
    "Sydney, Australia",
    "Bangkok, Thailand",
    "Singapore",
    "Dubai, UAE",
    "Hong Kong",
    "Barcelona, Spain",
    "Rome, Italy",
    "Amsterdam, Netherlands",
    "Vienna, Austria",
    "Prague, Czech Republic",
    "Budapest, Hungary",
    "Copenhagen, Denmark",
    "Stockholm, Sweden",
    "Oslo, Norway",
    "Helsinki, Finland",
    "Reykjavik, Iceland",
    "São Paulo, Brazil",
    "Rio de Janeiro, Brazil",
    "Buenos Aires, Argentina",
    "Mexico City, Mexico",
    "Los Angeles, USA",
    "Chicago, USA",
    "Miami, USA",
    "Toronto, Canada",
    "Vancouver, Canada",
    "Montreal, Canada",
    "Beijing, China",
    "Shanghai, China",
    "Seoul, South Korea",
    "Mumbai, India",
    "Delhi, India",
    "Berlin, Germany",
    "Madrid, Spain",
    "Milan, Italy",
    "Cairo, Egypt",
    "Cape Town, South Africa",
    "Lagos, Nigeria",
    "Melbourne, Australia",
    "Auckland, New Zealand",
  ];
};
