import { API_CONFIG } from "../../config/api";
import { LocationData } from "../../types";
import { fetchWithTimeout } from "../http";
import { logger } from "../../utils/logger";
import { z } from "zod";
import { parseOrNull } from "../validation";

// Geocoding API response interfaces
const AddressComponentSchema = z.object({
  long_name: z.string(),
  short_name: z.string().optional(),
  types: z.array(z.string()).optional(),
});

/** Google Geocoding: only the fields this service reads are required. */
const GeocodingResponseSchema = z.object({
  results: z
    .array(
      z.object({
        formatted_address: z.string().optional(),
        geometry: z
          .object({ location: z.object({ lat: z.number(), lng: z.number() }) })
          .optional(),
        address_components: z.array(AddressComponentSchema).optional(),
        place_id: z.string().optional(),
      }),
    )
    .optional(),
  status: z.string().optional(),
});

const ReverseGeocodingResponseSchema = z.object({
  results: z
    .array(
      z.object({
        formatted_address: z.string().optional(),
        address_components: z.array(AddressComponentSchema).optional(),
        place_id: z.string().optional(),
      }),
    )
    .optional(),
  status: z.string().optional(),
});

export interface GeocodingResponse {
  results: Array<{
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
  }>;
  status: string;
}

export interface ReverseGeocodingResponse {
  results: Array<{
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    place_id: string;
  }>;
  status: string;
}

/**
 * Convert address or place name to coordinates
 */
export const geocodeAddress = async (
  address: string,
): Promise<LocationData | null> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      logger.warn("Google Maps API key not found, cannot geocode address");
      return null;
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}${API_CONFIG.GEOCODING_ENDPOINT}?address=${encodedAddress}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const rawGeo = await response.json();
    const parsedGeo = parseOrNull(GeocodingResponseSchema, rawGeo, "geocoding");
    if (!parsedGeo) return null;
    const data = parsedGeo as unknown as GeocodingResponse;

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      logger.warn("No geocoding results found for:", address);
      return null;
    }

    const result = data.results[0];
    const location = result.geometry.location;

    // Extract location details from address components
    const addressComponents = result.address_components;
    // Try to get the most specific location name available
    const city =
      addressComponents.find((comp) => comp.types.includes("locality"))
        ?.long_name ||
      addressComponents.find((comp) => comp.types.includes("sublocality"))
        ?.long_name ||
      addressComponents.find((comp) =>
        comp.types.includes("sublocality_level_1"),
      )?.long_name ||
      addressComponents.find((comp) =>
        comp.types.includes("administrative_area_level_2"),
      )?.long_name ||
      addressComponents.find((comp) =>
        comp.types.includes("administrative_area_level_1"),
      )?.long_name ||
      "Unknown City";

    const country =
      addressComponents.find((comp) => comp.types.includes("country"))
        ?.long_name || "Unknown Country";

    // Get timezone for the location
    const timezone = await getTimezoneForLocation(location.lat, location.lng);

    const locationData: LocationData = {
      name: city,
      country: country,
      coordinates: {
        latitude: location.lat,
        longitude: location.lng,
      },
      timezone: timezone || "UTC",
      elevation: 0, // Will be updated if we have elevation data
    };

    return locationData;
  } catch (error) {
    logger.error("Error geocoding address:", error);
    return null;
  }
};

/**
 * Convert coordinates to address
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<LocationData | null> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      logger.warn("Google Maps API key not found, cannot reverse geocode");
      return null;
    }

    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}${API_CONFIG.GEOCODING_ENDPOINT}?latlng=${latitude},${longitude}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }

    const rawRev = await response.json();
    const parsedRev = parseOrNull(
      ReverseGeocodingResponseSchema,
      rawRev,
      "reverseGeocoding",
    );
    if (!parsedRev) return null;
    const data = parsedRev as unknown as ReverseGeocodingResponse;

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      logger.warn(
        "No reverse geocoding results found for coordinates:",
        latitude,
        longitude,
      );
      return null;
    }

    const result = data.results[0];
    const addressComponents = result.address_components;

    // Try to get the most specific location name available
    const city =
      addressComponents.find((comp) => comp.types.includes("locality"))
        ?.long_name ||
      addressComponents.find((comp) => comp.types.includes("sublocality"))
        ?.long_name ||
      addressComponents.find((comp) =>
        comp.types.includes("sublocality_level_1"),
      )?.long_name ||
      addressComponents.find((comp) =>
        comp.types.includes("administrative_area_level_2"),
      )?.long_name ||
      addressComponents.find((comp) =>
        comp.types.includes("administrative_area_level_1"),
      )?.long_name ||
      "Unknown City";

    const country =
      addressComponents.find((comp) => comp.types.includes("country"))
        ?.long_name || "Unknown Country";

    // Get timezone for the location
    const timezone = await getTimezoneForLocation(latitude, longitude);

    const locationData: LocationData = {
      name: city,
      country: country,
      coordinates: {
        latitude,
        longitude,
      },
      timezone: timezone || "UTC",
      elevation: 0, // Will be updated if we have elevation data
    };

    return locationData;
  } catch (error) {
    logger.error("Error reverse geocoding coordinates:", error);
    return null;
  }
};

/**
 * Get timezone for a location
 */
export const getTimezoneForLocation = async (
  latitude: number,
  longitude: number,
): Promise<string | null> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      logger.warn("Google Maps API key not found, cannot get timezone");
      return null;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}${API_CONFIG.TIMEZONE_ENDPOINT}?location=${latitude},${longitude}&timestamp=${timestamp}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`Timezone API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
      logger.warn(
        "No timezone data found for coordinates:",
        latitude,
        longitude,
      );
      return null;
    }

    return data.timeZoneId;
  } catch (error) {
    logger.error("Error getting timezone:", error);
    return null;
  }
};
