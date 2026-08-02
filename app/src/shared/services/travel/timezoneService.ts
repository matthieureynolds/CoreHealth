import { API_CONFIG } from "../../config/api";
import { fetchWithTimeout } from "../http";
import { logger } from "../../utils/logger";
import { z } from "zod";
import { parseOrNull } from "../validation";
import { TIMEZONE_DATABASE, type TimezoneInfo } from "./timezoneDatabase";

/** Google Time Zone API. dstOffset/rawOffset are what the DST maths reads. */
const GoogleTimezoneResponseSchema = z.object({
  status: z.string(),
  // Required rather than optional: the DST maths below reads all four, so a
  // response missing any of them cannot produce a correct offset. Failing the
  // parse returns null, which callers already handle.
  dstOffset: z.number(),
  rawOffset: z.number(),
  timeZoneId: z.string(),
  timeZoneName: z.string(),
});

// In-memory cache for timezone API results (keyed by rounded lat,lng)
const timezoneCache = new Map<
  string,
  { result: TimezoneInfo; timestamp: number }
>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCacheKey(lat: number, lng: number): string {
  // Round to 2 decimal places (~1km precision) to increase cache hits
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

// Comprehensive timezone database with major timezones

/**
 * Get timezone information using Google Timezone API (primary method)
 */
const getTimezoneFromAPI = async (
  latitude: number,
  longitude: number,
): Promise<TimezoneInfo | null> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      logger.warn(
        "Google Maps API key not found, cannot get timezone from API",
      );
      return null;
    }

    // Check cache first
    const cacheKey = getCacheKey(latitude, longitude);
    const cached = timezoneCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.result;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}${API_CONFIG.TIMEZONE_ENDPOINT}?location=${latitude},${longitude}&timestamp=${timestamp}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`Timezone API error: ${response.status}`);
    }

    const raw = await response.json();
    const data = parseOrNull(
      GoogleTimezoneResponseSchema,
      raw,
      "googleTimezone",
    );
    if (!data) return null;

    if (data.status !== "OK") {
      logger.warn(
        "No timezone data found for coordinates:",
        latitude,
        longitude,
      );
      return null;
    }

    // Calculate current offset considering DST.
    //
    // Google returns rawOffset/dstOffset in SECONDS; TimezoneInfo.offset is in
    // MINUTES, which is what the static database and formatOffsetString both
    // assume. Without this conversion every API-resolved zone came back 60x
    // too large — Asia/Kolkata rendered as "+330:00" rather than "+05:30", and
    // any city missing from the offline table fed a wrong offset into the
    // jet-lag maths.
    const isDst = data.dstOffset !== 0;
    const offsetSeconds = isDst
      ? data.rawOffset + data.dstOffset
      : data.rawOffset;
    const currentOffset = Math.round(offsetSeconds / 60);

    const result: TimezoneInfo = {
      timezoneId: data.timeZoneId,
      offset: currentOffset,
      offsetString: formatOffsetString(currentOffset),
      dstOffset: Math.round(data.dstOffset / 60),
      isDst: isDst,
    };

    // Cache the result
    timezoneCache.set(cacheKey, { result, timestamp: Date.now() });

    return result;
  } catch (error) {
    logger.error("Error getting timezone from API:", error);
    return null;
  }
};

/**
 * Get timezone information from built-in database (fallback method)
 */
const getTimezoneFromDatabase = (timezoneId: string): TimezoneInfo | null => {
  const timezone = TIMEZONE_DATABASE[timezoneId];
  if (!timezone) {
    return null;
  }

  // Check if DST is currently active
  const now = new Date();
  const isDst =
    timezone.dstOffset !== undefined && isDaylightSavingTime(now, timezoneId);
  const currentOffset =
    isDst && timezone.dstOffset ? timezone.dstOffset : timezone.offset;

  return {
    ...timezone,
    offset: currentOffset,
    offsetString: formatOffsetString(currentOffset),
    isDst: isDst,
  };
};

/**
 * Get timezone information with fallback strategy
 */
export const getTimezoneInfo = async (
  latitude: number,
  longitude: number,
  timezoneId?: string,
): Promise<TimezoneInfo | null> => {
  // Try API first if coordinates are provided
  if (latitude !== 0 && longitude !== 0) {
    const apiResult = await getTimezoneFromAPI(latitude, longitude);
    if (apiResult) {
      return apiResult;
    }
  }

  // Fallback to database if timezoneId is provided
  if (timezoneId) {
    const dbResult = getTimezoneFromDatabase(timezoneId);
    if (dbResult) {
      return dbResult;
    }
  }

  // Final fallback to UTC
  return {
    timezoneId: "UTC",
    offset: 0,
    offsetString: "+00:00",
    isDst: false,
  };
};

/**
 * Format offset in minutes to string (e.g., +05:30, -08:00)
 */
const formatOffsetString = (offsetMinutes: number): string => {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

/**
 * Check if daylight saving time is currently active (simplified)
 */
const isDaylightSavingTime = (date: Date, timezoneId: string): boolean => {
  // This is a simplified DST check - in a real implementation,
  // you'd use a proper timezone library like moment-timezone
  try {
    const formatter = new Intl.DateTimeFormat("en", {
      timeZone: timezoneId,
      timeZoneName: "short",
    });

    const parts = formatter.formatToParts(date);
    const timeZoneName =
      parts.find((part) => part.type === "timeZoneName")?.value || "";

    // Check if the timezone name indicates DST (e.g., "PDT" vs "PST")
    return timeZoneName.includes("DT") || timeZoneName.includes("DST");
  } catch {
    return false;
  }
};
