/**
 * Circadian phase estimation.
 *
 * The jet-lag engine anchors everything to CBTmin (core-body-temperature minimum,
 * the low point of the body clock). The population estimate is "≈2 h before habitual
 * wake". This module personalises that from whatever real signals we have:
 *
 *   1. The traveller's ACTUAL recent sleep timing (wearable) instead of the static
 *      sleep setting — wake time is the single strongest predictor of circadian phase.
 *   2. The overnight HEART-RATE nadir — HR bottoms out close to CBTmin, so it's a
 *      direct (if noisy) physiological read of the clock. We blend it with the
 *      sleep-based estimate and sanity-check it falls within the sleep window.
 *
 * Pure module (no IO) so it's unit-testable and backend-portable.
 */

export interface CircadianInputs {
  /** Fallback sleep window from the user's settings ('HH:MM'). */
  settingsSleep: { start: string; end: string };
  /** Habitual sleep window measured from a wearable over recent nights. */
  measuredSleep?: { start: string; end: string; nights: number } | null;
  /** Time of the overnight heart-rate minimum ('HH:MM'), a CBTmin proxy. */
  hrNadirLocal?: string | null;
  /** Time of the overnight CGM glucose minimum ('HH:MM'), a CBTmin proxy. */
  glucoseNadirLocal?: string | null;
}

export interface CircadianEstimate {
  /** Best estimate of the habitual sleep window ('HH:MM'). */
  sleep: { start: string; end: string };
  /** Best estimate of CBTmin ('HH:MM'). */
  cbtMin: string;
  source: "wearable_bio" | "wearable_sleep" | "settings";
  confidence: "high" | "medium" | "low";
  note: string;
}

const MIN_NIGHTS = 3;

const toMin = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const toStr = (m: number): string => {
  const x = ((Math.round(m) % 1440) + 1440) % 1440;
  return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
};
const sub = (t: string, mins: number): string => toStr(toMin(t) - mins);

/** Weighted circular mean of clock times — handles midnight wrap. */
const weightedCircMean = (
  items: Array<{ time: string; weight: number }>,
): string => {
  let x = 0;
  let y = 0;
  let w = 0;
  for (const it of items) {
    const a = (toMin(it.time) / 1440) * 2 * Math.PI;
    x += Math.cos(a) * it.weight;
    y += Math.sin(a) * it.weight;
    w += it.weight;
  }
  if (w === 0) return items[0]?.time ?? "04:00";
  const ang = Math.atan2(y / w, x / w);
  return toStr((ang / (2 * Math.PI)) * 1440);
};

/** Is minute-of-day m inside the [bed, wake] window (which may cross midnight)? */
const inWindow = (m: number, bed: number, wake: number): boolean => {
  const x = ((m % 1440) + 1440) % 1440;
  return bed <= wake ? x >= bed && x <= wake : x >= bed || x <= wake;
};

export interface AdaptationInputs {
  age?: number;
  /** Recent habitual sleep window (to estimate chronic sleep debt). */
  measuredSleep?: { start: string; end: string } | null;
  /** Self-reported light sensitivity: 'low' adapts slower, 'high' faster. */
  lightSensitivity?: "low" | "normal" | "high";
}

/** Age-only factor (kept for callers without richer signals). */
export function adaptationFactorFromAge(age?: number): number {
  if (!age || age <= 40) return 1;
  return Math.max(0.7, 1 - (age - 40) * 0.008);
}

/**
 * How fast this person re-entrains, relative to a healthy, well-rested young adult
 * (1.0). Lower = slower = a longer plan. Combines:
 *   • age — circadian shifting slows with age (~0.8%/yr past 40)
 *   • chronic sleep debt — short habitual sleep blunts adaptation
 *   • light sensitivity — the main individual driver of light-shift magnitude
 * Result is clamped to a sane [0.6, 1.1].
 */
export function computeAdaptationFactor(inp: AdaptationInputs): number {
  let f = adaptationFactorFromAge(inp.age);

  if (inp.measuredSleep) {
    const dur =
      (toMin(inp.measuredSleep.end) - toMin(inp.measuredSleep.start) + 1440) %
      1440;
    const hours = dur / 60;
    const debt = Math.max(0, 7.5 - hours); // hours short of a healthy night
    f *= Math.max(0.85, 1 - debt * 0.04); // up to ~-15% when badly sleep-deprived
  }

  if (inp.lightSensitivity === "low") f *= 0.9;
  else if (inp.lightSensitivity === "high") f *= 1.1;

  return Math.max(0.6, Math.min(1.1, f));
}

// ─── Learned per-direction adaptation efficiency ───────────────────────────────

export interface DirectionalEfficiency {
  advance: number;
  delay: number;
}
export const DEFAULT_EFFICIENCY: DirectionalEfficiency = {
  advance: 1,
  delay: 1,
};

/**
 * Nudge the learned efficiency for one direction from a real observation.
 * ratio = observed shift rate ÷ what we expected; blended in as an EMA and clamped
 * to [0.5, 1.5]. Over several trips this learns whether *this* person advances or
 * delays faster/slower than the population, which then moves their advance↔delay
 * crossover and plan length.
 */
export function updateDirectionalEfficiency(
  current: DirectionalEfficiency,
  direction: "advance" | "delay",
  observedHoursPerDay: number,
  expectedHoursPerDay: number,
  alpha = 0.3,
): DirectionalEfficiency {
  if (expectedHoursPerDay <= 0 || observedHoursPerDay < 0) return current;
  const ratio = observedHoursPerDay / expectedHoursPerDay;
  const prev = direction === "advance" ? current.advance : current.delay;
  const next = Math.max(0.5, Math.min(1.5, prev * (1 - alpha) + ratio * alpha));
  return direction === "advance"
    ? { ...current, advance: next }
    : { ...current, delay: next };
}

export function estimateCircadianPhase(
  inp: CircadianInputs,
): CircadianEstimate {
  const useMeasured =
    !!inp.measuredSleep && inp.measuredSleep.nights >= MIN_NIGHTS;
  const sleep = useMeasured
    ? { start: inp.measuredSleep!.start, end: inp.measuredSleep!.end }
    : inp.settingsSleep;

  // Population anchor: CBTmin ≈ 2 h before habitual wake.
  const sleepCbt = sub(sleep.end, 120);

  // Blend candidate CBTmin estimates weighted by how reliable each signal is.
  // HR nadir tracks CBTmin tightly; the CGM glucose nadir is a useful but noisier
  // marker; the sleep-anchor (wake−2h) is solid when sleep is measured, weaker from
  // a static setting. Each physiological marker is sanity-checked to fall in the night.
  const bed = toMin(sleep.start);
  const wake = toMin(sleep.end);
  const nightStart = (bed - 60 + 1440) % 1440;
  const candidates: Array<{ time: string; weight: number }> = [
    { time: sleepCbt, weight: useMeasured ? 0.8 : 0.5 },
  ];
  const signals: string[] = [];
  if (inp.hrNadirLocal && inWindow(toMin(inp.hrNadirLocal), nightStart, wake)) {
    candidates.push({ time: inp.hrNadirLocal, weight: 1.0 });
    signals.push("heart rate");
  }
  if (
    inp.glucoseNadirLocal &&
    inWindow(toMin(inp.glucoseNadirLocal), nightStart, wake)
  ) {
    candidates.push({ time: inp.glucoseNadirLocal, weight: 0.6 });
    signals.push("glucose");
  }

  const cbtMin = weightedCircMean(candidates);

  if (signals.length > 0) {
    return {
      sleep,
      cbtMin,
      source: "wearable_bio",
      confidence: "high",
      note: `Personalised to your body clock from your wearable’s sleep + overnight ${signals.join(" & ")}.`,
    };
  }
  if (useMeasured) {
    return {
      sleep,
      cbtMin,
      source: "wearable_sleep",
      confidence: "medium",
      note: "Personalised from your recent sleep timing.",
    };
  }
  return {
    sleep,
    cbtMin,
    source: "settings",
    confidence: "low",
    note: "Based on your sleep settings — connect a wearable to tune this to your real body clock.",
  };
}
