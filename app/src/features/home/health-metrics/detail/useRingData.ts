/**
 * useRingData — replaces static mock arrays in ringConfig with real API data.
 *
 * Strategy:
 *  - Fetches all biomarker rows from GET /biomarkers (which includes recorded_at).
 *  - Fetches latest device_data snapshot from GET /users/{id}/device-data.
 *  - Buckets readings into D/W/M/Y arrays aligned to RING_CONFIGS stat ids.
 *  - Falls back to RING_CONFIGS mock arrays for any stat with no real history.
 *  - Ring scores are derived by averaging the day/period stat scores.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { DataService } from '../../../../shared/services/data/dataService';
import {
  RING_CONFIGS, RingId, RingConfig, StatDef, Period,
  DAYS, WEEKS, MONTHS, YEARS,
} from './ringConfig';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Clamp and round to 2dp */
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Bucket a list of {value, date} readings into 7 day slots (Mon–Sun this week) */
function bucketByDay(readings: { value: number; date: Date }[]): (number | null)[] {
  const slots: (number | null)[] = Array(7).fill(null);
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Mon = 0

  readings.forEach(({ value, date }) => {
    const dayOffset = Math.floor((date.getTime() - monday.getTime()) / 86_400_000);
    if (dayOffset >= 0 && dayOffset < 7) {
      const existing = slots[dayOffset];
      slots[dayOffset] = existing === null ? value : (existing + value) / 2;
    }
  });
  return slots;
}

/** Bucket into 4 weekly averages (W1–W4 of current month) */
function bucketByWeek(readings: { value: number; date: Date }[]): (number | null)[] {
  const slots: (number | null)[] = Array(4).fill(null);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  readings.forEach(({ value, date }) => {
    const dayOfMonth = Math.floor((date.getTime() - monthStart.getTime()) / 86_400_000);
    if (dayOfMonth < 0) return;
    const weekIdx = Math.min(Math.floor(dayOfMonth / 7), 3);
    const existing = slots[weekIdx];
    slots[weekIdx] = existing === null ? value : (existing + value) / 2;
  });
  return slots;
}

/** Bucket into 12 monthly averages (Jan–Dec current year) */
function bucketByMonth(readings: { value: number; date: Date }[]): (number | null)[] {
  const slots: (number | null)[] = Array(12).fill(null);
  const currentYear = new Date().getFullYear();

  readings.forEach(({ value, date }) => {
    if (date.getFullYear() !== currentYear) return;
    const month = date.getMonth();
    const existing = slots[month];
    slots[month] = existing === null ? value : (existing + value) / 2;
  });
  return slots;
}

/** Bucket into 5 yearly averages (2022–2026) */
function bucketByYear(readings: { value: number; date: Date }[]): (number | null)[] {
  const BASE_YEAR = 2022;
  const slots: (number | null)[] = Array(5).fill(null);

  readings.forEach(({ value, date }) => {
    const idx = date.getFullYear() - BASE_YEAR;
    if (idx < 0 || idx >= 5) return;
    const existing = slots[idx];
    slots[idx] = existing === null ? value : (existing + value) / 2;
  });
  return slots;
}

/**
 * Fill nulls with the nearest non-null value (forward then backward fill).
 * Falls back to the mock array if all slots are null.
 */
function fillNulls(real: (number | null)[], mock: number[]): number[] {
  const hasAny = real.some(v => v !== null);
  if (!hasAny) return mock;

  const filled = [...real] as (number | null)[];
  // Forward fill
  let last: number | null = null;
  for (let i = 0; i < filled.length; i++) {
    if (filled[i] !== null) { last = filled[i]!; }
    else if (last !== null) { filled[i] = last; }
  }
  // Backward fill
  last = null;
  for (let i = filled.length - 1; i >= 0; i--) {
    if (filled[i] !== null) { last = filled[i]!; }
    else if (last !== null) { filled[i] = last; }
  }
  // Any remaining nulls (fully sparse) use mock
  return filled.map((v, i) => v !== null ? r2(v) : mock[i]);
}

// ─── Biomarker stat → API name mapping ───────────────────────────────────────

const STAT_TO_BIOMARKER: Record<string, string[]> = {
  apob:         ['ApoB'],
  hba1c:        ['HbA1c'],
  hscrp:        ['hs-CRP', 'hsCRP', 'CRP'],
  homa_ir:      ['HOMA-IR'],
  vitd:         ['Vitamin D', 'Vit D'],
  hrv:          ['Heart Rate Variability', 'HRV'],
  rhr:          ['Resting Heart Rate'],
  sleep_duration: [], // device data
  deep_sleep:     [], // device data
  sleep_consistency: [], // device data
  vo2_max:      ['VO2 Max', 'VO2max'],
  blood_pressure: ['Systolic BP', 'Blood Pressure Systolic'],
  body_fat:     ['Body Fat', 'Body Fat %'],
  muscle_mass:  ['Muscle Mass'],
  waist_height: ['Waist:Height Ratio', 'Waist/Height'],
};

// ─── Main hook ────────────────────────────────────────────────────────────────

export interface LiveRingConfig extends RingConfig {
  isLive: boolean; // true = at least one stat has real data
}

export type LiveRingConfigs = Record<RingId, LiveRingConfig>;

export function useRingData(): { configs: LiveRingConfigs; loading: boolean; refresh: () => void } {
  const { user } = useAuth();

  // Start with mock so UI renders instantly
  const [configs, setConfigs] = useState<LiveRingConfigs>(() =>
    buildLiveConfigs([], [], null)
  );
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [biomarkers, deviceData] = await Promise.all([
        DataService.getBiomarkers().catch(() => []),
        DataService.getDeviceData(user.id).catch(() => []),
      ]);
      setConfigs(buildLiveConfigs(biomarkers, deviceData, user.id));
    } catch {
      // leave mock data in place
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  return { configs, loading, refresh: load };
}

// ─── Build live configs from API data ────────────────────────────────────────

function buildLiveConfigs(
  biomarkers: Array<{ name: string; value: number; lastUpdated: Date }>,
  deviceData: any[],
  _userId: string | null,
): LiveRingConfigs {
  const result = {} as LiveRingConfigs;

  (['recovery', 'biomarkers', 'lifestyle'] as RingId[]).forEach(ringId => {
    const mock = RING_CONFIGS[ringId];
    let anyLive = false;

    const liveStats = mock.stats.map((stat): StatDef => {
      const names = STAT_TO_BIOMARKER[stat.id] ?? [];

      // Match biomarker readings for this stat
      const readings: { value: number; date: Date }[] = biomarkers
        .filter(b => names.some(n => b.name.toLowerCase() === n.toLowerCase()))
        .map(b => ({ value: b.value, date: b.lastUpdated instanceof Date ? b.lastUpdated : new Date(b.lastUpdated) }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      // Device data fallback for sleep/HRV/RHR
      const deviceReadings = extractDeviceReadings(stat.id, deviceData);
      const allReadings = [...readings, ...deviceReadings].sort((a, b) => a.date.getTime() - b.date.getTime());

      if (allReadings.length === 0) {
        return stat; // pure mock fallback
      }

      anyLive = true;

      const realDay   = bucketByDay(allReadings);
      const realWeek  = bucketByWeek(allReadings);
      const realMonth = bucketByMonth(allReadings);
      const realYear  = bucketByYear(allReadings);

      return {
        ...stat,
        data:      fillNulls(realDay,   stat.data),
        weekData:  fillNulls(realWeek,  stat.weekData),
        monthData: fillNulls(realMonth, stat.monthData),
        yearData:  fillNulls(realYear,  stat.yearData),
      };
    });

    // Derive ring scores from stats (simple average of normalised stat values)
    const liveDay   = anyLive ? deriveScores(liveStats, 'day',   mock.dayScores)   : mock.dayScores;
    const liveWeek  = anyLive ? deriveScores(liveStats, 'week',  mock.weeklyScores) : mock.weeklyScores;
    const liveMonth = anyLive ? deriveScores(liveStats, 'month', mock.monthScores)  : mock.monthScores;
    const liveYear  = anyLive ? deriveScores(liveStats, 'year',  mock.yearScores)   : mock.yearScores;

    result[ringId] = {
      ...mock,
      stats: liveStats,
      dayScores:    liveDay,
      weeklyScores: liveWeek,
      monthScores:  liveMonth,
      yearScores:   liveYear,
      isLive: anyLive,
    };
  });

  return result;
}

// ─── Extract device data readings ─────────────────────────────────────────────

function extractDeviceReadings(statId: string, deviceData: any[]): { value: number; date: Date }[] {
  if (!deviceData.length) return [];

  const readings: { value: number; date: Date }[] = [];

  deviceData.forEach(d => {
    const metrics = d.metrics ?? {};
    const date = d.timestamp ? new Date(d.timestamp) : new Date();

    const extract = (keys: string[]): number | null => {
      for (const k of keys) {
        const v = metrics[k];
        if (typeof v === 'number') return v;
      }
      return null;
    };

    let val: number | null = null;
    switch (statId) {
      case 'hrv':            val = extract(['hrv', 'heartRateVariability', 'rmssd']); break;
      case 'rhr':            val = extract(['restingHeartRate', 'resting_hr', 'rhr']); break;
      case 'sleep_duration': val = extract(['sleepHours', 'sleep_hours', 'totalSleep']); break;
      case 'deep_sleep':     val = extract(['deepSleepHours', 'deep_sleep_hours']); break;
      case 'sleep_consistency': val = extract(['sleepConsistency', 'sleep_consistency']); break;
      case 'vo2_max':        val = extract(['vo2Max', 'vo2_max']); break;
    }

    if (val !== null) readings.push({ value: val, date });
  });

  return readings;
}

// ─── Derive ring score arrays from stat data ──────────────────────────────────

/**
 * For each period slot, average the normalised scores of all stats.
 * Normalisation: map each stat's value linearly into [0, 99] based on its observed range.
 * If we can't compute (no range), fall back to the mock ring score for that slot.
 */
function deriveScores(stats: StatDef[], period: Period, mockScores: number[]): number[] {
  const getArr = (s: StatDef): number[] => {
    switch (period) {
      case 'week':  return s.weekData;
      case 'month': return s.monthData;
      case 'year':  return s.yearData;
      default:      return s.data;
    }
  };

  const len = mockScores.length;
  const scores: number[] = [];

  for (let i = 0; i < len; i++) {
    const slotValues: number[] = [];

    stats.forEach(stat => {
      const arr = getArr(stat);
      const val = arr[i];
      if (val === undefined || val === null) return;

      const allVals = [...stat.data, ...stat.weekData, ...stat.monthData, ...stat.yearData];
      const min = Math.min(...allVals);
      const max = Math.max(...allVals);
      if (max === min) { slotValues.push(70); return; }

      // Normalise into 50–99
      const raw = (val - min) / (max - min);
      const normalised = stat.higherIsBetter ? raw : (1 - raw);
      slotValues.push(Math.round(50 + normalised * 49));
    });

    scores.push(slotValues.length > 0
      ? Math.round(slotValues.reduce((a, b) => a + b, 0) / slotValues.length)
      : mockScores[i]);
  }

  return scores;
}
