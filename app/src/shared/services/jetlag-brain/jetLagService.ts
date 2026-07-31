import {
  JetLagData,
  JetLagSeverity,
  SleepScheduleAdjustment,
  LightExposureSchedule,
  JetLagPlanningEvent,
  Trip as EnhancedTrip,
} from "../../types";

/**
 * Jet Lag Service
 * Implements scientific jet lag calculations and adjustment recommendations
 * Following the principle of max 1.5 hours daily adjustment (Nico Rosberg's approach)
 */

/**
 * Calculate jet lag severity based on time zone difference
 */
export const calculateJetLagSeverity = (
  timeZoneDifference: number,
): JetLagSeverity => {
  const absDifference = Math.abs(timeZoneDifference);

  if (absDifference <= 2) {
    return "minimal";
  } else if (absDifference <= 4) {
    return "mild";
  } else if (absDifference <= 8) {
    return "moderate";
  } else {
    return "severe";
  }
};

/**
 * Calculate time zone difference between two timezone strings
 */
export const calculateTimeZoneDifference = (
  originTimezone: string,
  destinationTimezone: string,
  /** Evaluate offsets on this date so DST is correct for the actual travel day. */
  referenceDate: Date = new Date(),
): number => {
  try {
    // Offsets must be evaluated on the travel date: a trip can cross a DST change
    // (e.g. London↔New York in late Mar/Oct differ by 4h for ~2 weeks, not 5h).
    const originOffset = getTimezoneOffsetMinutes(
      originTimezone,
      referenceDate,
    );
    const destinationOffset = getTimezoneOffsetMinutes(
      destinationTimezone,
      referenceDate,
    );

    const differenceHours = (destinationOffset - originOffset) / 60;
    return Math.round(differenceHours);
  } catch (error) {
    console.error("Error calculating timezone difference:", error);
    return 0;
  }
};

/**
 * Get timezone offset in minutes from UTC for a given timezone
 * Uses a more reliable method with proper date parsing
 */
const getTimezoneOffsetMinutes = (timezone: string, date: Date): number => {
  try {
    // Get the time parts for the timezone
    const formatter = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const tzYear = parseInt(
      parts.find((part) => part.type === "year")?.value || "0",
    );
    const tzMonth =
      parseInt(parts.find((part) => part.type === "month")?.value || "0") - 1; // Month is 0-indexed
    const tzDay = parseInt(
      parts.find((part) => part.type === "day")?.value || "0",
    );
    const tzHour = parseInt(
      parts.find((part) => part.type === "hour")?.value || "0",
    );
    const tzMinute = parseInt(
      parts.find((part) => part.type === "minute")?.value || "0",
    );
    const tzSecond = parseInt(
      parts.find((part) => part.type === "second")?.value || "0",
    );

    // Create a UTC date representing the timezone's local time
    const tzAsUtc = Date.UTC(
      tzYear,
      tzMonth,
      tzDay,
      tzHour,
      tzMinute,
      tzSecond,
    );

    // Offset from UTC in minutes, east-positive. Interpreting the zone's wall-clock
    // parts as if they were UTC yields an instant ahead of the real one by exactly
    // the zone's offset, so (tzAsUtc − realInstant) IS the east-positive offset.
    const offsetMs = tzAsUtc - date.getTime();
    return offsetMs / (1000 * 60);
  } catch (error) {
    console.error(`Error getting timezone offset for ${timezone}:`, error);
    return 0;
  }
};

/**
 * Generate sleep schedule adjustment plan
 * Following the 1.5 hours max daily adjustment rule
 */
export const generateSleepScheduleAdjustment = (
  timeZoneDifference: number,
  currentBedtime: string = "22:00", // Default 10 PM
  currentWakeTime: string = "07:00", // Default 7 AM
): SleepScheduleAdjustment => {
  const absDifference = Math.abs(timeZoneDifference);
  const isEastward = timeZoneDifference > 0;

  // Maximum adjustment per day (1.5 hours as per Nico's rule)
  const maxDailyAdjustment = 1.5;

  // Calculate number of days needed for full adjustment
  const daysToAdjust = Math.ceil(absDifference / maxDailyAdjustment);

  // Generate daily schedule
  const dailySchedule: Array<{
    day: number;
    bedtime: string;
    wakeTime: string;
    adjustment: number;
  }> = [];

  let remainingHours = absDifference;

  for (let day = 1; day <= daysToAdjust; day++) {
    const adjustmentForDay = Math.min(remainingHours, maxDailyAdjustment);
    remainingHours -= adjustmentForDay;

    // Calculate new times
    const bedtimeMinutes = parseTimeToMinutes(currentBedtime);
    const wakeTimeMinutes = parseTimeToMinutes(currentWakeTime);

    const adjustmentMinutes = adjustmentForDay * 60;
    const direction = isEastward ? 1 : -1; // Eastward = earlier, Westward = later

    const newBedtimeMinutes =
      bedtimeMinutes - direction * adjustmentMinutes * day;
    const newWakeTimeMinutes =
      wakeTimeMinutes - direction * adjustmentMinutes * day;

    dailySchedule.push({
      day,
      bedtime: formatMinutesToTime(newBedtimeMinutes),
      wakeTime: formatMinutesToTime(newWakeTimeMinutes),
      adjustment: adjustmentForDay * direction,
    });
  }

  return {
    totalTimeZoneDifference: timeZoneDifference,
    direction: isEastward ? "eastward" : "westward",
    daysToAdjust,
    maxDailyAdjustment,
    dailySchedule,
    strategy: isEastward
      ? "Advance bedtime gradually each day before travel"
      : "Delay bedtime gradually each day before travel",
    recommendations: generateSleepRecommendations(absDifference, isEastward),
  };
};

/**
 * Generate light exposure schedule for circadian rhythm adjustment
 */
export const generateLightExposureSchedule = (
  timeZoneDifference: number,
  currentTimezone: string,
  destinationTimezone: string,
): LightExposureSchedule => {
  const absDifference = Math.abs(timeZoneDifference);
  const isEastward = timeZoneDifference > 0;

  const schedule: Array<{
    day: number;
    morningLight: string;
    eveningAvoidance: string;
    duration: number;
    notes: string;
  }> = [];

  const daysToAdjust = Math.ceil(absDifference / 1.5);

  for (let day = 1; day <= daysToAdjust; day++) {
    if (isEastward) {
      // For eastward travel - need to advance circadian rhythm
      schedule.push({
        day,
        morningLight: `06:00-08:00`,
        eveningAvoidance: `20:00-22:00`,
        duration: 30,
        notes: "Bright light exposure in early morning, avoid evening light",
      });
    } else {
      // For westward travel - need to delay circadian rhythm
      schedule.push({
        day,
        morningLight: `08:00-10:00`,
        eveningAvoidance: `18:00-20:00`,
        duration: 30,
        notes: "Later morning light exposure, extend evening light",
      });
    }
  }

  return {
    direction: isEastward ? "eastward" : "westward",
    strategy: isEastward
      ? "Advance circadian rhythm with early bright light"
      : "Delay circadian rhythm with later light exposure",
    schedule,
    generalTips: [
      "Use bright light therapy lamp (10,000 lux) if natural sunlight unavailable",
      "Wear sunglasses during light avoidance periods",
      "Consider melatonin supplementation as directed by healthcare provider",
      "Maintain consistent meal times aligned with new schedule",
    ],
  };
};

/**
 * Get current local time for destination
 */
export const getCurrentDestinationTime = (
  timezone: string,
  hour12: boolean = false,
): {
  time: string;
  date: string;
  timezone: string;
} => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12,
    });

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      time: formatter.format(now),
      date: dateFormatter.format(now),
      timezone: timezone,
    };
  } catch (error) {
    console.error("Error getting destination time:", error);
    return {
      time: "00:00:00",
      date: "Unknown",
      timezone: timezone,
    };
  }
};

/**
 * Generate comprehensive jet lag data
 */
export const generateJetLagData = (
  originTimezone: string,
  destinationTimezone: string,
  originLocation: string = "Home",
  destinationLocation: string = "Destination",
  currentBedtime: string = "22:00",
  currentWakeTime: string = "07:00",
): JetLagData => {
  const timeZoneDifference = calculateTimeZoneDifference(
    originTimezone,
    destinationTimezone,
  );
  const severity = calculateJetLagSeverity(timeZoneDifference);
  const sleepAdjustment = generateSleepScheduleAdjustment(
    timeZoneDifference,
    currentBedtime,
    currentWakeTime,
  );
  const lightSchedule = generateLightExposureSchedule(
    timeZoneDifference,
    originTimezone,
    destinationTimezone,
  );
  const destinationTime = getCurrentDestinationTime(destinationTimezone);

  return {
    originTimezone,
    destinationTimezone,
    originLocation,
    destinationLocation,
    timeZoneDifference,
    severity,
    estimatedRecoveryDays: Math.abs(timeZoneDifference),
    sleepAdjustment,
    lightExposureSchedule: lightSchedule,
    destinationTime,
    recommendations: generateJetLagRecommendations(
      severity,
      timeZoneDifference,
    ),
  };
};

/**
 * Create a jet lag planning event from destination and departure date
 * Following Nico Rosberg's 1.5 hour per day adjustment rule
 */
export const createJetLagPlanningEvent = (
  destination: string,
  destinationTimezone: string,
  departureDate: string,
  originTimezone: string,
  originLocation: string = "Home",
  returnDate?: string,
  currentBedtime: string = "22:00",
  currentWakeTime: string = "07:00",
) => {
  const timeZoneDifference = calculateTimeZoneDifference(
    originTimezone,
    destinationTimezone,
  );
  const sleepAdjustment = generateSleepScheduleAdjustment(
    timeZoneDifference,
    currentBedtime,
    currentWakeTime,
  );
  const lightExposureSchedule = generateLightExposureSchedule(
    timeZoneDifference,
    originTimezone,
    destinationTimezone,
  );

  // Calculate preparation start date (departure date - days to adjust)
  const departure = new Date(departureDate);
  const preparationStartDate = new Date(departure);
  preparationStartDate.setDate(
    departure.getDate() - sleepAdjustment.daysToAdjust,
  );

  return {
    destination,
    destinationTimezone,
    departureDate,
    returnDate,
    timeZoneDifference,
    preparationStartDate: preparationStartDate.toISOString(),
    daysToAdjust: sleepAdjustment.daysToAdjust,
    sleepAdjustment,
    lightExposureSchedule,
    status: "upcoming" as const,
  };
};

// Helper functions
const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatMinutesToTime = (minutes: number): string => {
  // Handle negative minutes and wrap around 24 hours
  const normalizedMinutes = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

const generateSleepRecommendations = (
  timeDifference: number,
  isEastward: boolean,
): string[] => {
  const recommendations = [
    `Start adjusting ${Math.ceil(timeDifference / 1.5)} days before travel`,
    "Maintain consistent meal times with your new schedule",
    "Stay hydrated but avoid caffeine 6 hours before new bedtime",
    "Create a relaxing bedtime routine in your new schedule",
  ];

  if (isEastward) {
    recommendations.push("Consider melatonin 30 minutes before new bedtime");
    recommendations.push(
      "Expose yourself to bright light early in the morning",
    );
  } else {
    recommendations.push("Avoid bright light in the evening");
    recommendations.push("Stay active later in the day to delay sleep");
  }

  return recommendations;
};

const generateJetLagRecommendations = (
  severity: JetLagSeverity,
  timeDifference: number,
): string[] => {
  const baseRecommendations = [
    "Stay hydrated during travel",
    "Avoid alcohol and excessive caffeine",
    "Set your watch to destination time when boarding",
  ];

  switch (severity) {
    case "minimal":
      return [
        ...baseRecommendations,
        "Minimal adjustment needed - maintain regular sleep schedule",
      ];
    case "mild":
      return [
        ...baseRecommendations,
        "Start adjusting sleep schedule 1-2 days before travel",
        "Use natural light exposure to help adjustment",
      ];
    case "moderate":
      return [
        ...baseRecommendations,
        "Begin sleep schedule adjustment 3-4 days before travel",
        "Consider light therapy and melatonin supplementation",
        "Plan for 4-6 days of adjustment after arrival",
      ];
    case "severe":
      return [
        ...baseRecommendations,
        "Start preparation 5-7 days before travel",
        "Consult with healthcare provider about sleep aids",
        "Consider breaking journey with stopovers if possible",
        "Plan for 7-10 days of adjustment after arrival",
        "Avoid important meetings for first few days if possible",
      ];
    default:
      return baseRecommendations;
  }
};

// ---------------------------------------------------------------------------
// Trip builder utilities (used by travel screens)
// ---------------------------------------------------------------------------

export interface TripForPlan {
  id: string;
  departureLocation: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  /** IANA tz of the destination (e.g. 'Asia/Tokyo'). */
  timezone: string;
  /** IANA tz of the origin. When both tz are real, used for accurate tz-diff. */
  originTimezone?: string;
  /** Connecting-flight layovers (between segments). */
  layovers?: Array<{
    city?: string;
    tz: string;
    arr_local: string;
    dep_local: string;
  }>;
  /** Fixed events the traveller must be alert for. */
  commitments?: Array<{
    title: string;
    date_local: string;
    start_local: string;
    end_local: string;
  }>;
  jetLagPlanner?: {
    departureTime: string;
    arrivalTime: string;
  };
  /** Real return flight times-of-day ('HH:MM'), when captured by the user. */
  returnFlight?: { departureTime: string; arrivalTime: string };
}

export interface SleepSchedule {
  bedTime: string;
  wakeUpTime: string;
}

/** Returns the UTC offset in hours for a known city name, or null if unknown. */
/**
 * Resolve a city/place name to an IANA timezone so manual-entry trips get the same
 * DST-correct, real-engine treatment as flight-looked-up trips. Substring match over
 * major cities; returns undefined if unknown (caller falls back to the offset table).
 */
export function getCityTimezone(city: string | undefined): string | undefined {
  if (!city) return undefined;
  const map: Record<string, string> = {
    london: "Europe/London",
    paris: "Europe/Paris",
    madrid: "Europe/Madrid",
    barcelona: "Europe/Madrid",
    lisbon: "Europe/Lisbon",
    rome: "Europe/Rome",
    milan: "Europe/Rome",
    amsterdam: "Europe/Amsterdam",
    berlin: "Europe/Berlin",
    munich: "Europe/Berlin",
    frankfurt: "Europe/Berlin",
    zurich: "Europe/Zurich",
    vienna: "Europe/Vienna",
    prague: "Europe/Prague",
    budapest: "Europe/Budapest",
    copenhagen: "Europe/Copenhagen",
    stockholm: "Europe/Stockholm",
    oslo: "Europe/Oslo",
    helsinki: "Europe/Helsinki",
    reykjavik: "Atlantic/Reykjavik",
    dublin: "Europe/Dublin",
    athens: "Europe/Athens",
    istanbul: "Europe/Istanbul",
    moscow: "Europe/Moscow",
    "new york": "America/New_York",
    boston: "America/New_York",
    washington: "America/New_York",
    miami: "America/New_York",
    atlanta: "America/New_York",
    toronto: "America/Toronto",
    chicago: "America/Chicago",
    dallas: "America/Chicago",
    houston: "America/Chicago",
    denver: "America/Denver",
    phoenix: "America/Phoenix",
    "los angeles": "America/Los_Angeles",
    "san francisco": "America/Los_Angeles",
    seattle: "America/Los_Angeles",
    vancouver: "America/Vancouver",
    "mexico city": "America/Mexico_City",
    "sao paulo": "America/Sao_Paulo",
    "buenos aires": "America/Argentina/Buenos_Aires",
    dubai: "Asia/Dubai",
    doha: "Asia/Qatar",
    "abu dhabi": "Asia/Dubai",
    mumbai: "Asia/Kolkata",
    delhi: "Asia/Kolkata",
    bangalore: "Asia/Kolkata",
    bangkok: "Asia/Bangkok",
    singapore: "Asia/Singapore",
    "kuala lumpur": "Asia/Kuala_Lumpur",
    jakarta: "Asia/Jakarta",
    "hong kong": "Asia/Hong_Kong",
    shanghai: "Asia/Shanghai",
    beijing: "Asia/Shanghai",
    taipei: "Asia/Taipei",
    seoul: "Asia/Seoul",
    tokyo: "Asia/Tokyo",
    osaka: "Asia/Tokyo",
    sydney: "Australia/Sydney",
    melbourne: "Australia/Melbourne",
    brisbane: "Australia/Brisbane",
    perth: "Australia/Perth",
    auckland: "Pacific/Auckland",
    honolulu: "Pacific/Honolulu",
    "cape town": "Africa/Johannesburg",
    johannesburg: "Africa/Johannesburg",
    cairo: "Africa/Cairo",
    nairobi: "Africa/Nairobi",
    lagos: "Africa/Lagos",
    "tel aviv": "Asia/Jerusalem",
  };
  const c = city.toLowerCase();
  for (const key of Object.keys(map)) {
    if (c.includes(key)) return map[key];
  }
  return undefined;
}

export function getCityUtcOffsetHours(city: string): number | null {
  const map: { [key: string]: number } = {
    Tokyo: 9,
    Paris: 1,
    "New York": -4,
    London: 0,
    Sydney: 10,
    Bangkok: 7,
    Singapore: 8,
    Dubai: 4,
    "Hong Kong": 8,
    Barcelona: 1,
    Rome: 1,
    Amsterdam: 1,
    Vienna: 1,
    Prague: 1,
    Budapest: 1,
    Copenhagen: 1,
    Stockholm: 1,
    Oslo: 1,
    Helsinki: 2,
    Reykjavik: 0,
    "Current Location": 0,
    "Los Angeles": -8,
    Chicago: -6,
    Denver: -7,
    Miami: -5,
    Boston: -5,
    "San Francisco": -8,
    Seattle: -8,
    Dallas: -6,
    Atlanta: -5,
    Phoenix: -7,
    Washington: -5,
  };
  for (const key of Object.keys(map)) {
    if (city.toLowerCase().includes(key.toLowerCase())) return map[key];
  }
  return null;
}

export function buildJetLagEvent(
  trip: TripForPlan,
  variant: "outbound" | "return",
  sleepSchedule: SleepSchedule,
): JetLagPlanningEvent {
  const isOutbound = variant === "outbound";
  const depDate = isOutbound
    ? trip.departureDate
    : trip.returnDate || trip.departureDate;
  const originCity = isOutbound ? trip.departureLocation : trip.destination;
  const destCity = isOutbound ? trip.destination : trip.departureLocation;
  const originOffset = getCityUtcOffsetHours(originCity) ?? 0;
  const destOffset = getCityUtcOffsetHours(destCity) ?? 0;
  const tzDiff = destOffset - originOffset;

  const [bedHours, bedMinutes] = sleepSchedule.bedTime.split(":").map(Number);
  const [wakeHours, wakeMinutes] = sleepSchedule.wakeUpTime
    .split(":")
    .map(Number);
  const baseBedMinutes = bedHours * 60 + bedMinutes;
  const baseWakeMinutes = wakeHours * 60 + wakeMinutes;

  const days = Math.max(2, Math.ceil(Math.abs(tzDiff) / 1.5));
  const stepMinutes =
    90 * (isOutbound ? (tzDiff >= 0 ? -1 : 1) : tzDiff >= 0 ? 1 : -1);
  const toHHMM = (m: number) => {
    const mm = ((m % (24 * 60)) + 24 * 60) % (24 * 60);
    const h = Math.floor(mm / 60);
    const mi = mm % 60;
    return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
  };
  const dailySchedule = Array.from({ length: days }).map((_, idx) => ({
    bedtime: toHHMM(baseBedMinutes + idx * stepMinutes),
    wakeTime: toHHMM(baseWakeMinutes + idx * stepMinutes),
    adjustment: 1.5,
  })) as any;

  const prepStart = new Date(depDate.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    id: `${trip.id}-${variant}`,
    destination: trip.destination,
    destinationTimezone: "Local",
    departureDate: depDate.toISOString(),
    returnDate: trip.returnDate ? trip.returnDate.toISOString() : undefined,
    timeZoneDifference: tzDiff,
    preparationStartDate: prepStart.toISOString(),
    daysToAdjust: days,
    sleepAdjustment: { dailySchedule } as any,
    lightExposureSchedule: { morning: [], afternoon: [], evening: [] } as any,
    status: "upcoming",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export interface JetLagPrefs {
  chronotype: "morning" | "neutral" | "evening";
  planStyle: "gentle" | "aggressive";
  caffeine: boolean;
  melatonin: boolean;
  naps: boolean;
}

export interface JetLagExtras {
  advanceEfficiency?: number;
  delayEfficiency?: number;
  /** Mid-trip measured CBTmin (dest-local) for closed-loop re-planning. */
  measuredNow?: { day_offset: number; cbt_min_local: string };
}

export function buildEnhancedTrip(
  trip: TripForPlan,
  variant: "outbound" | "return",
  sleepSchedule: SleepSchedule,
  jetLagPrefs?: JetLagPrefs,
  cbtMinOverride?: string,
  adaptationFactor?: number,
  priorAdaptationHours?: number,
  extras?: JetLagExtras,
): EnhancedTrip {
  const isOutbound = variant === "outbound";
  const originCity = isOutbound
    ? trip.departureLocation
    : trip.destination || "Origin";
  const destCity = isOutbound
    ? trip.destination
    : trip.departureLocation || "Destination";

  // Prefer the real IANA timezones captured from the flight (DST-correct, works for
  // any airport). Fall back to the city-name offset table only when they're missing.
  const realOriginTz = isOutbound ? trip.originTimezone : trip.timezone;
  const realDestTz = isOutbound ? trip.timezone : trip.originTimezone;
  const hasRealTz =
    !!realOriginTz?.includes("/") && !!realDestTz?.includes("/");

  const depDateBase = isOutbound
    ? trip.departureDate
    : trip.returnDate || trip.departureDate;

  let tzDiff: number;
  if (hasRealTz) {
    // Evaluate offsets on the travel date so DST shifts are handled correctly.
    tzDiff = calculateTimeZoneDifference(
      realOriginTz!,
      realDestTz!,
      new Date(depDateBase),
    );
  } else {
    const originOffset = getCityUtcOffsetHours(originCity) ?? 0;
    const destOffset = getCityUtcOffsetHours(destCity) ?? 0;
    tzDiff = destOffset - originOffset;
  }
  const direction: "east" | "west" = tzDiff >= 0 ? "east" : "west";
  let depDate = new Date(depDateBase);
  let arrDate = new Date(depDateBase);

  // The return leg uses the real return flight's times when captured; otherwise it
  // falls back to the outbound times-of-day (a reasonable approximation).
  const flightTimes =
    !isOutbound && trip.returnFlight ? trip.returnFlight : trip.jetLagPlanner;

  if (flightTimes?.departureTime) {
    const [h, m] = flightTimes.departureTime.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      depDate = new Date(depDateBase);
      depDate.setHours(h, m, 0, 0);
    }
  }
  if (flightTimes?.arrivalTime) {
    const [h, m] = flightTimes.arrivalTime.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      arrDate = new Date(depDateBase);
      arrDate.setHours(h, m, 0, 0);
      if (arrDate < depDate) arrDate.setDate(arrDate.getDate() + 1);
    }
  } else {
    arrDate = new Date(depDate);
  }

  // Nights at the destination — only meaningful for the outbound leg (after the
  // return flight you're home to stay, so always fully re-adapt then).
  let stayDays: number | undefined;
  if (isOutbound && trip.returnDate) {
    const ms =
      new Date(trip.returnDate).getTime() -
      new Date(trip.departureDate).getTime();
    stayDays = Math.max(0, Math.round(ms / 86_400_000));
  }

  return {
    id: `${trip.id}-${variant}-enh` as string,
    user_id: "local-user",
    title: `${originCity} → ${destCity}`,
    origin_iata: originCity,
    dest_iata: destCity,
    dep_local: depDate.toISOString(),
    arr_local: arrDate.toISOString(),
    origin_tz: hasRealTz ? realOriginTz! : "UTC",
    dest_tz: hasRealTz ? realDestTz! : "UTC",
    dep_utc: depDate.toISOString(),
    arr_utc: arrDate.toISOString(),
    tz_diff_hours: tzDiff,
    direction,
    stay_days: stayDays,
    cbt_min_local: cbtMinOverride,
    adaptation_factor: adaptationFactor,
    prior_adaptation_hours: priorAdaptationHours,
    advance_efficiency: extras?.advanceEfficiency,
    delay_efficiency: extras?.delayEfficiency,
    // Closed-loop measurement only applies to the leg actually being travelled (outbound).
    measured_now: isOutbound ? extras?.measuredNow : undefined,
    // Layovers belong to the outbound itinerary (return-leg legs aren't captured).
    layovers: isOutbound ? trip.layovers : undefined,
    // Commitments are date-stamped, so they only match the leg whose days cover them.
    commitments: trip.commitments,
    plan_style: jetLagPrefs?.planStyle ?? "gentle",
    prefs: {
      sleep_window_local: {
        start: sleepSchedule.bedTime,
        end: sleepSchedule.wakeUpTime,
      },
      chronotype: jetLagPrefs?.chronotype ?? "neutral",
      caffeine: false,
      melatonin: jetLagPrefs?.melatonin ?? false,
      naps: jetLagPrefs?.naps ?? false,
    },
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
