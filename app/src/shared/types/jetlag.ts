export type JetLagSeverity = 'minimal' | 'mild' | 'moderate' | 'severe';

export interface SleepScheduleAdjustment {
  totalTimeZoneDifference: number;
  direction: 'eastward' | 'westward';
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
  direction: 'eastward' | 'westward';
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
  status: 'upcoming' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
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
  direction: 'east' | 'west';
  plan_style: 'gentle' | 'aggressive';
  prefs: {
    sleep_window_local: { start: string; end: string };
    chronotype: 'morning' | 'neutral' | 'evening';
    caffeine: boolean;
    melatonin: boolean;
    naps: boolean;
  };
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Action {
  type: 'sleep' | 'seek_light' | 'avoid_light' | 'caffeine_ok' | 'caffeine_cutoff' | 'melatonin' | 'nap' | 'in_flight';
  start_local: string | null;
  end_local: string | null;
  at_local: string | null;
  intensity?: 'low' | 'moderate' | 'high';
  rationale?: string;
}

export interface PlanDay {
  id: string;
  trip_id: string;
  date_local: string;
  location: {
    label: string;
    tz: string;
    segment: 'pre' | 'in_flight' | 'post' | 'layover';
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
    cta: 'Done' | 'Snooze';
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
