import { Platform } from 'react-native';

// Lazy import — only available on iOS after pod install
let AppleHealthKit: any = null;
try {
  AppleHealthKit = require('react-native-health').default;
} catch {
  // Not linked yet (Android or pre-pod-install)
}

const PERMISSIONS = {
  permissions: {
    read: [
      'Steps',
      'HeartRate',
      'HeartRateVariability',
      'RestingHeartRate',
      'SleepAnalysis',
      'ActiveEnergyBurned',
      'DistanceWalkingRunning',
      'OxygenSaturation',
    ],
    write: [] as string[],
  },
};

export interface HealthKitSnapshot {
  steps: number | null;
  restingHr: number | null;
  hrv: number | null;          // latest RMSSD in ms
  sleepHours: number | null;   // total sleep last night in hours
  activeCalories: number | null;
  oxygenSaturation: number | null;
}

function isAvailable(): boolean {
  return Platform.OS === 'ios' && !!AppleHealthKit;
}

/** Initialize HealthKit and request permissions. Resolves true on success. */
export async function initHealthKit(): Promise<boolean> {
  if (!isAvailable()) return false;
  return new Promise(resolve => {
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
  return new Promise(resolve => {
    AppleHealthKit.getStepCount({ date: todayStart() }, (err: any, r: any) => {
      resolve(err ? null : (r?.value ?? null));
    });
  });
}

async function getRestingHR(): Promise<number | null> {
  return new Promise(resolve => {
    AppleHealthKit.getRestingHeartRate({ unit: 'bpm', ascending: false, limit: 1 }, (err: any, r: any) => {
      resolve(err ? null : (r?.value ?? null));
    });
  });
}

async function getHRV(): Promise<number | null> {
  return new Promise(resolve => {
    AppleHealthKit.getHeartRateVariabilitySamples(
      { startDate: yesterdayStart(), ascending: false, limit: 1 },
      (err: any, results: any[]) => {
        resolve(err || !results?.length ? null : (results[0]?.value ?? null));
      },
    );
  });
}

async function getSleepHours(): Promise<number | null> {
  return new Promise(resolve => {
    AppleHealthKit.getSleepSamples(
      { startDate: yesterdayStart(), endDate: new Date().toISOString() },
      (err: any, results: any[]) => {
        if (err || !results?.length) { resolve(null); return; }
        // Sum asleep segments (value === 'ASLEEP' or 3)
        const asleepMs = results
          .filter(s => s.value === 'ASLEEP' || s.value === 3)
          .reduce((acc, s) => {
            const start = new Date(s.startDate).getTime();
            const end = new Date(s.endDate).getTime();
            return acc + (end - start);
          }, 0);
        resolve(asleepMs > 0 ? Math.round((asleepMs / 3_600_000) * 10) / 10 : null);
      },
    );
  });
}

async function getActiveCalories(): Promise<number | null> {
  return new Promise(resolve => {
    AppleHealthKit.getActiveEnergyBurned(
      { startDate: todayStart(), endDate: new Date().toISOString() },
      (err: any, results: any[]) => {
        if (err || !results?.length) { resolve(null); return; }
        const total = results.reduce((acc, r) => acc + (r.value ?? 0), 0);
        resolve(Math.round(total));
      },
    );
  });
}

async function getOxygenSaturation(): Promise<number | null> {
  return new Promise(resolve => {
    AppleHealthKit.getOxygenSaturationSamples(
      { startDate: yesterdayStart(), ascending: false, limit: 1 },
      (err: any, results: any[]) => {
        resolve(err || !results?.length ? null : (results[0]?.value ?? null));
      },
    );
  });
}

/**
 * Fetch a snapshot of today's Apple Health data.
 * Must be called after `initHealthKit()` succeeds.
 */
export async function fetchHealthSnapshot(): Promise<HealthKitSnapshot> {
  const [steps, restingHr, hrv, sleepHours, activeCalories, oxygenSaturation] = await Promise.all([
    getSteps(),
    getRestingHR(),
    getHRV(),
    getSleepHours(),
    getActiveCalories(),
    getOxygenSaturation(),
  ]);
  return { steps, restingHr, hrv, sleepHours, activeCalories, oxygenSaturation };
}
