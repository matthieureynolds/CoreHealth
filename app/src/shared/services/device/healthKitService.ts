import { Platform } from "react-native";

// Lazy import — only available on iOS after pod install
let AppleHealthKit: any = null;
try {
  AppleHealthKit = require("react-native-health").default;
} catch {
  // Not linked yet (Android or pre-pod-install)
}

const PERMISSIONS = {
  permissions: {
    read: [
      "Steps",
      "HeartRate",
      "HeartRateVariability",
      "RestingHeartRate",
      "SleepAnalysis",
      "ActiveEnergyBurned",
      "DistanceWalkingRunning",
      "OxygenSaturation",
      "BloodGlucose",
    ],
    write: [] as string[],
  },
};

export interface HealthKitSnapshot {
  steps: number | null;
  restingHr: number | null;
  hrv: number | null; // latest RMSSD in ms
  sleepHours: number | null; // total sleep last night in hours
  activeCalories: number | null;
  oxygenSaturation: number | null;
}

function isAvailable(): boolean {
  return Platform.OS === "ios" && !!AppleHealthKit;
}

/** Initialize HealthKit and request permissions. Resolves true on success. */
export async function initHealthKit(): Promise<boolean> {
  if (!isAvailable()) return false;
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(PERMISSIONS, (err: any) => {
      resolve(!err);
    });
  });
}

function todayStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function yesterdayStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function getSteps(): Promise<number | null> {
  return new Promise((resolve) => {
    AppleHealthKit.getStepCount({ date: todayStart() }, (err: any, r: any) => {
      resolve(err ? null : (r?.value ?? null));
    });
  });
}

async function getRestingHR(): Promise<number | null> {
  return new Promise((resolve) => {
    AppleHealthKit.getRestingHeartRate(
      { unit: "bpm", ascending: false, limit: 1 },
      (err: any, r: any) => {
        resolve(err ? null : (r?.value ?? null));
      },
    );
  });
}

async function getHRV(): Promise<number | null> {
  return new Promise((resolve) => {
    AppleHealthKit.getHeartRateVariabilitySamples(
      { startDate: yesterdayStart(), ascending: false, limit: 1 },
      (err: any, results: any[]) => {
        resolve(err || !results?.length ? null : (results[0]?.value ?? null));
      },
    );
  });
}

async function getSleepHours(): Promise<number | null> {
  return new Promise((resolve) => {
    AppleHealthKit.getSleepSamples(
      { startDate: yesterdayStart(), endDate: new Date().toISOString() },
      (err: any, results: any[]) => {
        if (err || !results?.length) {
          resolve(null);
          return;
        }
        // Sum asleep segments (value === 'ASLEEP' or 3)
        const asleepMs = results
          .filter((s) => s.value === "ASLEEP" || s.value === 3)
          .reduce((acc, s) => {
            const start = new Date(s.startDate).getTime();
            const end = new Date(s.endDate).getTime();
            return acc + (end - start);
          }, 0);
        resolve(
          asleepMs > 0 ? Math.round((asleepMs / 3_600_000) * 10) / 10 : null,
        );
      },
    );
  });
}

async function getActiveCalories(): Promise<number | null> {
  return new Promise((resolve) => {
    AppleHealthKit.getActiveEnergyBurned(
      { startDate: todayStart(), endDate: new Date().toISOString() },
      (err: any, results: any[]) => {
        if (err || !results?.length) {
          resolve(null);
          return;
        }
        const total = results.reduce((acc, r) => acc + (r.value ?? 0), 0);
        resolve(Math.round(total));
      },
    );
  });
}

async function getOxygenSaturation(): Promise<number | null> {
  return new Promise((resolve) => {
    AppleHealthKit.getOxygenSaturationSamples(
      { startDate: yesterdayStart(), ascending: false, limit: 1 },
      (err: any, results: any[]) => {
        resolve(err || !results?.length ? null : (results[0]?.value ?? null));
      },
    );
  });
}

// ─── Circadian signals (for the jet-lag engine) ──────────────────────────────

const ASLEEP_VALUES = [
  "ASLEEP",
  "ASLEEP_CORE",
  "ASLEEP_DEEP",
  "ASLEEP_REM",
  "INBED",
  3,
];

/** Circular mean of minutes-of-day values (handles midnight wrap). */
function circularMeanMinutes(mins: number[]): number {
  let x = 0;
  let y = 0;
  for (const m of mins) {
    const a = (m / 1440) * 2 * Math.PI;
    x += Math.cos(a);
    y += Math.sin(a);
  }
  const ang = Math.atan2(y / mins.length, x / mins.length);
  return ((((ang / (2 * Math.PI)) * 1440) % 1440) + 1440) % 1440;
}

const minutesToHHMM = (m: number): string => {
  const x = ((Math.round(m) % 1440) + 1440) % 1440;
  return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
};

export interface MeasuredSleepWindow {
  start: string;
  end: string;
  nights: number;
}

/**
 * Habitual sleep window averaged from wearable sleep samples over recent nights.
 * Returns the typical onset + wake clock times — the basis for a personalised CBTmin.
 */
export async function getRecentSleepWindow(
  days = 7,
): Promise<MeasuredSleepWindow | null> {
  if (!isAvailable()) return null;
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return new Promise((resolve) => {
    try {
      AppleHealthKit.getSleepSamples(
        { startDate: start.toISOString(), endDate: new Date().toISOString() },
        (err: any, results: any[]) => {
          if (err || !results?.length) {
            resolve(null);
            return;
          }
          const asleep = results.filter((s) => ASLEEP_VALUES.includes(s.value));
          if (!asleep.length) {
            resolve(null);
            return;
          }
          // Group segments into nights (shift by 12 h so an overnight sleep maps to one day).
          const nights = new Map<string, { onset: Date; wake: Date }>();
          for (const s of asleep) {
            const onset = new Date(s.startDate);
            const wake = new Date(s.endDate);
            const key = new Date(onset.getTime() - 12 * 3_600_000)
              .toISOString()
              .slice(0, 10);
            const g = nights.get(key);
            if (!g) {
              nights.set(key, { onset, wake });
            } else {
              if (onset < g.onset) g.onset = onset;
              if (wake > g.wake) g.wake = wake;
            }
          }
          const onsets: number[] = [];
          const wakes: number[] = [];
          nights.forEach((g) => {
            onsets.push(g.onset.getHours() * 60 + g.onset.getMinutes());
            wakes.push(g.wake.getHours() * 60 + g.wake.getMinutes());
          });
          resolve({
            start: minutesToHHMM(circularMeanMinutes(onsets)),
            end: minutesToHHMM(circularMeanMinutes(wakes)),
            nights: nights.size,
          });
        },
      );
    } catch {
      resolve(null);
    }
  });
}

/** Clock time of the lowest overnight heart rate — a proxy for CBTmin. */
export async function getOvernightHrNadir(): Promise<string | null> {
  if (!isAvailable()) return null;
  const start = new Date();
  start.setDate(start.getDate() - 1);
  start.setHours(20, 0, 0, 0);
  const end = new Date();
  end.setHours(12, 0, 0, 0);
  return new Promise((resolve) => {
    try {
      AppleHealthKit.getHeartRateSamples(
        {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          ascending: true,
        },
        (err: any, results: any[]) => {
          if (err || !results?.length) {
            resolve(null);
            return;
          }
          let min = Infinity;
          let at: Date | null = null;
          for (const r of results) {
            if (typeof r.value === "number" && r.value < min) {
              min = r.value;
              at = new Date(r.startDate);
            }
          }
          resolve(
            at
              ? `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`
              : null,
          );
        },
      );
    } catch {
      resolve(null);
    }
  });
}

/** Clock time of the lowest overnight CGM glucose reading — a CBTmin proxy. */
export async function getOvernightGlucoseNadir(): Promise<string | null> {
  if (!isAvailable() || !AppleHealthKit.getBloodGlucoseSamples) return null;
  const start = new Date();
  start.setDate(start.getDate() - 1);
  start.setHours(20, 0, 0, 0);
  const end = new Date();
  end.setHours(12, 0, 0, 0);
  return new Promise((resolve) => {
    try {
      AppleHealthKit.getBloodGlucoseSamples(
        {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          ascending: true,
        },
        (err: any, results: any[]) => {
          if (err || !results?.length) {
            resolve(null);
            return;
          }
          let min = Infinity;
          let at: Date | null = null;
          for (const r of results) {
            if (typeof r.value === "number" && r.value < min) {
              min = r.value;
              at = new Date(r.startDate);
            }
          }
          resolve(
            at
              ? `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`
              : null,
          );
        },
      );
    } catch {
      resolve(null);
    }
  });
}

/**
 * Fetch a snapshot of today's Apple Health data.
 * Must be called after `initHealthKit()` succeeds.
 */
export async function fetchHealthSnapshot(): Promise<HealthKitSnapshot> {
  const [steps, restingHr, hrv, sleepHours, activeCalories, oxygenSaturation] =
    await Promise.all([
      getSteps(),
      getRestingHR(),
      getHRV(),
      getSleepHours(),
      getActiveCalories(),
      getOxygenSaturation(),
    ]);
  return {
    steps,
    restingHr,
    hrv,
    sleepHours,
    activeCalories,
    oxygenSaturation,
  };
}
