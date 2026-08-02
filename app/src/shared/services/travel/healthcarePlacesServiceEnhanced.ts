import { API_CONFIG } from "../../config/api";
import { fetchWithTimeout } from "../http";
import { logger } from "../../utils/logger";
import { distanceInMetres as calculateDistance } from "./geo";
import { getStaticHealthcareData } from "./healthcareFallbackData";
import type { HealthcareFacility } from "./healthcareTypes";
import { z } from "zod";
import { parseOrNull } from "../validation";

/** OpenStreetMap Nominatim search results. */
const NominatimResponseSchema = z.array(
  z.object({
    // display_name / lat / lon carry the whole record: the consumer splits the
    // name out of display_name and parseFloats the coordinates. Entries missing
    // any of them were already dropped by a .filter() the compiler could not
    // see; requiring them here makes that explicit and keeps the map body free
    // of non-null assertions.
    display_name: z.string(),
    lat: z.string(),
    lon: z.string(),
    name: z.string().optional(),
    place_id: z.union([z.string(), z.number()]).optional(),
    extratags: z
      .object({
        name: z.string().optional(),
        phone: z.string().optional(),
        contact: z.object({ phone: z.string().optional() }).nullish(),
      })
      .nullish(),
    type: z.string().optional(),
  }),
);

/** Google Places nearby-search, as consumed here. */
const PlacesNearbySchema = z.object({
  status: z.string(),
  results: z
    .array(
      z.object({
        // Same reasoning as Nominatim above: place_id, name and geometry are
        // read unconditionally by the mapper, so they are required here rather
        // than guarded at every use.
        place_id: z.string(),
        name: z.string(),
        geometry: z.object({
          location: z.object({ lat: z.number(), lng: z.number() }),
        }),
        vicinity: z.string().optional(),
        rating: z.number().optional(),
        opening_hours: z.record(z.string(), z.unknown()).nullish(),
        types: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

export interface ClosestMedicalFacilities {
  nearestHospital: HealthcareFacility | null;
  nearestPharmacy: HealthcareFacility | null;
  totalFound: number;
  source: "google" | "openstreetmap" | "static" | "mixed";
}

/**
 * Search using OpenStreetMap Nominatim API (free, no API key required)
 */
const searchOSMHealthcare = async (
  latitude: number,
  longitude: number,
  type: "hospital" | "pharmacy",
): Promise<HealthcareFacility[]> => {
  try {
    const amenity = type === "hospital" ? "hospital" : "pharmacy";
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `q=${amenity}&` +
      `format=json&` +
      `limit=10&` +
      `lat=${latitude}&` +
      `lon=${longitude}&` +
      `radius=10000&` +
      `addressdetails=1&` +
      `extratags=1`;

    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "TOTO-App/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`OSM API error: ${response.status}`);
    }

    const raw = await response.json();
    const data = parseOrNull(NominatimResponseSchema, raw, "nominatimPlaces");
    if (!data) return [];

    const facilities: HealthcareFacility[] = data
      .filter((place) => place.display_name && place.lat && place.lon)
      .map((place) => {
        // Extract better name from display_name
        const nameParts = place.display_name.split(",");
        let name = nameParts[0];

        // Try to get a more descriptive name from extratags or other fields
        if (place.extratags?.name) {
          name = place.extratags.name;
        } else if (place.name) {
          name = place.name;
        } else if (nameParts.length > 1) {
          // Try to get a more descriptive name from the address
          const potentialName = nameParts.find(
            (part: string) =>
              part.toLowerCase().includes("hospital") ||
              part.toLowerCase().includes("pharmacy") ||
              part.toLowerCase().includes("medical") ||
              part.toLowerCase().includes("clinic"),
          );
          if (potentialName) {
            name = potentialName.trim();
          }
        }

        // Fallback to generic name if nothing better found
        if (!name || name.length < 3) {
          name = `${type === "hospital" ? "Hospital" : "Pharmacy"} Facility`;
        }

        return {
          id: String(place.place_id ?? `osm_${place.lat}_${place.lon}`),
          name,
          type,
          address: place.display_name || "Address not available",
          distance: calculateDistance(
            latitude,
            longitude,
            parseFloat(place.lat),
            parseFloat(place.lon),
          ),
          coordinates: {
            latitude: parseFloat(place.lat),
            longitude: parseFloat(place.lon),
          },
          phone: place.extratags?.phone || place.extratags?.contact?.phone,
          rating: 4.0, // Default rating since OSM doesn't provide ratings
          isEmergency: type === "hospital",
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Top 5 closest

    return facilities;
  } catch (error) {
    logger.error(`Error searching OSM for ${type}:`, error);
    return [];
  }
};

/**
 * Static healthcare data for major cities (emergency fallback)
 */
export const getClosestMedicalFacilities = async (
  latitude: number,
  longitude: number,
  cityName: string = "Unknown",
): Promise<ClosestMedicalFacilities> => {
  try {
    let hospitals: HealthcareFacility[] = [];
    let pharmacies: HealthcareFacility[] = [];
    let source: "google" | "openstreetmap" | "static" | "mixed" = "static";

    // Check if we have static data for this city first (most reliable)
    const staticFacilities = getStaticHealthcareData(
      cityName,
      latitude,
      longitude,
    );
    if (staticFacilities.length > 0) {
      hospitals = staticFacilities.filter((f) => f.type === "hospital");
      pharmacies = staticFacilities.filter((f) => f.type === "pharmacy");
      source = "static";
    } else {
      // Try Google Places API if no static data available
      if (
        API_CONFIG.GOOGLE_MAPS_API_KEY &&
        API_CONFIG.GOOGLE_MAPS_API_KEY !== "your_google_maps_api_key_here" &&
        API_CONFIG.GOOGLE_MAPS_API_KEY !== "your-key-here" &&
        API_CONFIG.GOOGLE_MAPS_API_KEY.length > 20
      ) {
        try {
          const googleHospitals = await searchGooglePlaces(
            latitude,
            longitude,
            "hospital",
          );
          const googlePharmacies = await searchGooglePlaces(
            latitude,
            longitude,
            "pharmacy",
          );

          if (googleHospitals.length > 0 || googlePharmacies.length > 0) {
            hospitals = googleHospitals;
            pharmacies = googlePharmacies;
            source = "google";
          }
        } catch (error) {
          logger.warn("Google Places API failed, trying alternatives:", error);
        }
      }

      // Fallback to OpenStreetMap if Google failed or no API key
      if (hospitals.length === 0 || pharmacies.length === 0) {
        const osmHospitals = await searchOSMHealthcare(
          latitude,
          longitude,
          "hospital",
        );
        const osmPharmacies = await searchOSMHealthcare(
          latitude,
          longitude,
          "pharmacy",
        );

        if (hospitals.length === 0) hospitals = osmHospitals;
        if (pharmacies.length === 0) pharmacies = osmPharmacies;

        source =
          hospitals.length > 0 && pharmacies.length > 0
            ? "openstreetmap"
            : "mixed";
      }
    }

    const nearestHospital = hospitals.length > 0 ? hospitals[0] : null;
    const nearestPharmacy = pharmacies.length > 0 ? pharmacies[0] : null;

    return {
      nearestHospital,
      nearestPharmacy,
      totalFound: hospitals.length + pharmacies.length,
      source,
    };
  } catch (error) {
    logger.error("Error getting closest medical facilities:", error);

    // Emergency fallback - return static data
    const staticFacilities = getStaticHealthcareData(
      cityName,
      latitude,
      longitude,
    );
    const hospitals = staticFacilities.filter((f) => f.type === "hospital");
    const pharmacies = staticFacilities.filter((f) => f.type === "pharmacy");

    return {
      nearestHospital: hospitals[0] || null,
      nearestPharmacy: pharmacies[0] || null,
      totalFound: staticFacilities.length,
      source: "static",
    };
  }
};

/**
 * Search Google Places API (original function for reference)
 */
const searchGooglePlaces = async (
  latitude: number,
  longitude: number,
  type: "hospital" | "pharmacy",
): Promise<HealthcareFacility[]> => {
  try {
    const placeType = type === "hospital" ? "hospital" : "pharmacy";
    const url =
      `${API_CONFIG.GOOGLE_MAPS_BASE_URL}${API_CONFIG.PLACES_ENDPOINT}?` +
      `location=${latitude},${longitude}&` +
      `radius=5000&` +
      `type=${placeType}&` +
      `key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const raw = await response.json();
    const data = parseOrNull(PlacesNearbySchema, raw, "googlePlacesNearby");
    if (!data) return [];

    if (data.status !== "OK") {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    return (data.results ?? [])
      .map((place) => ({
        id: place.place_id,
        name: place.name,
        type,
        address: place.vicinity || "Address not available",
        distance: calculateDistance(
          latitude,
          longitude,
          place.geometry.location.lat,
          place.geometry.location.lng,
        ),
        coordinates: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        rating: place.rating,
        isEmergency: type === "hospital",
      }))
      .sort(
        (a: HealthcareFacility, b: HealthcareFacility) =>
          a.distance - b.distance,
      );
  } catch (error) {
    logger.error(`Google Places search error for ${type}:`, error);
    return [];
  }
};
