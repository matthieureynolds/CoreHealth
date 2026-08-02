export type JetLagSeverity = "minimal" | "mild" | "moderate" | "severe";

export interface SleepScheduleAdjustment {
  totalTimeZoneDifference: number;
  direction: "eastward" | "westward";
  daysToAdjust: number;
  maxDailyAdjustment: number;
  dailySchedule: Array<{
    day: number;
    bedtime: string;
    wakeTime: string;
    adjustment: number;
  }>;
  strategy: string;
  recommendations: string[];
}

export interface LightExposureSchedule {
  direction: "eastward" | "westward";
  strategy: string;
  schedule: Array<{
    day: number;
    morningLight: string;
    eveningAvoidance: string;
    duration: number;
    notes: string;
  }>;
  generalTips: string[];
}

export interface JetLagData {
  originTimezone: string;
  destinationTimezone: string;
  originLocation: string;
  destinationLocation: string;
  timeZoneDifference: number;
  severity: JetLagSeverity;
  estimatedRecoveryDays: number;
  sleepAdjustment: SleepScheduleAdjustment;
  lightExposureSchedule: LightExposureSchedule;
  destinationTime: {
    time: string;
    date: string;
    timezone: string;
  };
  recommendations: string[];
}

export interface JetLagPlanningEvent {
  id: string;
  destination: string;
  destinationTimezone: string;
  departureDate: string;
  returnDate?: string;
  timeZoneDifference: number;
  preparationStartDate: string;
  daysToAdjust: number;
  sleepAdjustment: SleepScheduleAdjustment;
  lightExposureSchedule: LightExposureSchedule;
  status: "upcoming" | "active" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface Layover {
  city?: string;
  tz: string;
  /** Local arrival at the layover airport (ISO). */
  arr_local: string;
  /** Local departure from the layover airport (ISO). */
  dep_local: string;
}

/**
 * A flight's local departure and arrival clock times, 'HH:MM'.
 * Named because this shape was being re-declared inline in three trip files.
 */
export interface FlightTimes {
  departureTime: string;
  arrivalTime: string;
}

export interface Commitment {
  /**
   * Stable identity, assigned on creation. Editing and removal match on this;
   * they used to match on object reference, which broke as soon as the list
   * round-tripped through storage and made two identical-looking commitments
   * indistinguishable.
   */
  id: string;
  title: string;
  /** Destination-local date 'YYYY-MM-DD'. */
  date_local: string;
  /** Local start/end 'HH:MM'. */
  start_local: string;
  end_local: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string | null;
  origin_iata: string;
  dest_iata: string;
  dep_local: string;
  arr_local: string;
  origin_tz: string;
  dest_tz: string;
  dep_utc: string;
  arr_utc: string;
  tz_diff_hours: number;
  direction: "east" | "west";
  /** Nights at the destination (outbound leg). Short stays → stay on home time. */
  stay_days?: number;
  plan_style: "gentle" | "aggressive";
  prefs: {
    sleep_window_local: { start: string; end: string };
    chronotype: "morning" | "neutral" | "evening";
    caffeine: boolean;
    melatonin: boolean;
    naps: boolean;
  };
  /** Personalised CBTmin ('HH:MM', home/local). Overrides the wake−2h estimate. */
  cbt_min_local?: string;
  /** Multiplier on the daily shift rate (<1 = slower adapter, e.g. older). Default 1. */
  adaptation_factor?: number;
  /**
   * Learned per-user efficiency for each direction (default 1). <1 = this person
   * shifts that way more slowly than average, which also nudges the advance-vs-delay
   * crossover toward the direction they handle better.
   */
  advance_efficiency?: number;
  delay_efficiency?: number;
  /**
   * Closed-loop input: the body's ACTUAL measured CBTmin partway through the trip
   * (dest-local 'HH:MM') on `day_offset`. The plan re-anchors the remaining days to
   * where the clock really is, instead of assuming the projected shift happened.
   */
  measured_now?: { day_offset: number; cbt_min_local: string };
  /**
   * Return leg only: hours the body actually adapted on the outbound trip. The
   * return plan only needs to undo this much (e.g. 0 if the outbound was anchored).
   */
  prior_adaptation_hours?: number;
  /** Connecting-flight layovers, in order, for layover-aware guidance. */
  layovers?: Layover[];
  /** Fixed events the traveller must be alert for (meetings, etc.). */
  commitments?: Commitment[];
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface Action {
  type:
    | "sleep"
    | "seek_light"
    | "avoid_light"
    | "caffeine_ok"
    | "caffeine_cutoff"
    | "melatonin"
    | "nap"
    | "in_flight"
    | "meal"
    | "commitment";
  start_local: string | null;
  end_local: string | null;
  at_local: string | null;
  intensity?: "low" | "moderate" | "high";
  rationale?: string;
  /** Custom display title (e.g. the user's commitment name). Falls back to the type's default. */
  label?: string;
}

export interface PlanDay {
  id: string;
  trip_id: string;
  date_local: string;
  location: {
    label: string;
    tz: string;
    segment: "pre" | "in_flight" | "post" | "layover";
  };
  actions: Action[];
  notes: string[];
}

export interface NowCard {
  trip_id: string;
  generated_at_local: string;
  current_location_tz: string;
  current_action: {
    label: string;
    window: { start_local: string; end_local: string };
    explain: string;
    cta: "Done" | "Snooze";
  } | null;
  next_action_preview?: string;
}

export interface FlightLookupResult {
  carrier: string;
  number: string;
  origin_iata: string;
  dest_iata: string;
  dep_local: string;
  arr_local: string;
  origin_tz: string;
  dest_tz: string;
  operating_carrier?: string;
}

/**
 * A flight as surfaced in the trip picker: a lookup result plus the
 * human-readable city names when known. Mock suggestions carry city names;
 * the live lookup service only returns IATA codes, so cities are optional and
 * callers should fall back to the IATA code when a city is absent.
 */
export interface FlightOption extends FlightLookupResult {
  origin_city?: string;
  dest_city?: string;
}
