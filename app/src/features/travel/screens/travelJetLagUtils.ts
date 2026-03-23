import { JetLagPlanningEvent, PlanDay, Trip as EnhancedTrip } from '../../../shared/types';

export interface TripForPlan {
  id: string;
  departureLocation: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  timezone: string;
  jetLagPlanner?: {
    departureTime: string;
    arrivalTime: string;
  };
}

export interface SleepSchedule {
  bedTime: string;
  wakeUpTime: string;
}

export function getCityUtcOffsetHours(city: string): number | null {
  const map: { [key: string]: number } = {
    Tokyo: 9,
    Paris: 1,
    'New York': -4,
    London: 0,
    Sydney: 10,
    Bangkok: 7,
    Singapore: 8,
    Dubai: 4,
    'Hong Kong': 8,
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
    'Current Location': 0,
    'Los Angeles': -8,
    Chicago: -6,
    Denver: -7,
    Miami: -5,
    Boston: -5,
    'San Francisco': -8,
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
  variant: 'outbound' | 'return',
  sleepSchedule: SleepSchedule
): JetLagPlanningEvent {
  const isOutbound = variant === 'outbound';
  const depDate = isOutbound ? trip.departureDate : (trip.returnDate || trip.departureDate);
  const originCity = isOutbound ? trip.departureLocation : trip.destination;
  const destCity = isOutbound ? trip.destination : trip.departureLocation;
  const originOffset = getCityUtcOffsetHours(originCity) ?? 0;
  const destOffset = getCityUtcOffsetHours(destCity) ?? 0;
  const tzDiff = destOffset - originOffset;

  const userBedtime = sleepSchedule.bedTime;
  const userWakeTime = sleepSchedule.wakeUpTime;
  const [bedHours, bedMinutes] = userBedtime.split(':').map(Number);
  const [wakeHours, wakeMinutes] = userWakeTime.split(':').map(Number);
  const baseBedMinutes = bedHours * 60 + bedMinutes;
  const baseWakeMinutes = wakeHours * 60 + wakeMinutes;

  const days = Math.max(2, Math.ceil(Math.abs(tzDiff) / 1.5));
  const stepMinutes = 90 * (isOutbound ? (tzDiff >= 0 ? -1 : 1) : (tzDiff >= 0 ? 1 : -1));
  const toHHMM = (m: number) => {
    const mm = ((m % (24 * 60)) + 24 * 60) % (24 * 60);
    const h = Math.floor(mm / 60);
    const mi = mm % 60;
    return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
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
    destinationTimezone: 'Local',
    departureDate: depDate.toISOString(),
    returnDate: trip.returnDate ? trip.returnDate.toISOString() : undefined,
    timeZoneDifference: tzDiff,
    preparationStartDate: prepStart.toISOString(),
    daysToAdjust: days,
    sleepAdjustment: { dailySchedule } as any,
    lightExposureSchedule: { morning: [], afternoon: [], evening: [] } as any,
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function buildEnhancedTrip(
  trip: TripForPlan,
  variant: 'outbound' | 'return',
  sleepSchedule: SleepSchedule
): EnhancedTrip {
  const isOutbound = variant === 'outbound';
  const originCity = isOutbound ? trip.departureLocation : (trip.destination || 'Origin');
  const destCity = isOutbound ? trip.destination : (trip.departureLocation || 'Destination');
  const originOffset = getCityUtcOffsetHours(originCity) ?? 0;
  const destOffset = getCityUtcOffsetHours(destCity) ?? 0;
  const tzDiff = destOffset - originOffset;
  const direction: 'east' | 'west' = tzDiff >= 0 ? 'east' : 'west';

  const userBedtime = sleepSchedule.bedTime;
  const userWakeTime = sleepSchedule.wakeUpTime;
  const depDateBase = isOutbound ? trip.departureDate : (trip.returnDate || trip.departureDate);
  let depDate = new Date(depDateBase);
  let arrDate = new Date(depDateBase);

  if (trip.jetLagPlanner?.departureTime) {
    const [h, m] = trip.jetLagPlanner.departureTime.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      depDate = new Date(depDateBase);
      depDate.setHours(h, m, 0, 0);
    }
  }
  if (trip.jetLagPlanner?.arrivalTime) {
    const [h, m] = trip.jetLagPlanner.arrivalTime.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      arrDate = new Date(depDateBase);
      arrDate.setHours(h, m, 0, 0);
      if (arrDate < depDate) {
        arrDate.setDate(arrDate.getDate() + 1);
      }
    }
  } else {
    arrDate = new Date(depDate);
  }

  return {
    id: `${trip.id}-${variant}-enh` as string,
    user_id: 'local-user',
    title: `${originCity} → ${destCity}`,
    origin_iata: originCity,
    dest_iata: destCity,
    dep_local: depDate.toISOString(),
    arr_local: arrDate.toISOString(),
    origin_tz: 'UTC',
    dest_tz: 'UTC',
    dep_utc: depDate.toISOString(),
    arr_utc: arrDate.toISOString(),
    tz_diff_hours: tzDiff,
    direction,
    plan_style: 'gentle',
    prefs: {
      sleep_window_local: { start: userBedtime, end: userWakeTime },
      chronotype: 'neutral',
      caffeine: true,
      melatonin: false,
      naps: false,
    },
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
