/**
 * Jet-lag engine (backend port).
 *
 * Self-contained, pure TypeScript port of the app's circadian engine
 * (app/src/shared/services/travel/{circadianModel,enhancedJetLagService,jetLagService}).
 * No DB, no RN, no barrel imports — safe to bundle into a Lambda. Keep in sync with
 * the app engine until they're consolidated into a shared package.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Action {
  type:
    | 'sleep' | 'seek_light' | 'avoid_light' | 'caffeine_ok' | 'caffeine_cutoff'
    | 'melatonin' | 'nap' | 'in_flight' | 'meal' | 'commitment';
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
  location: { label: string; tz: string; segment: 'pre' | 'in_flight' | 'post' | 'layover' };
  actions: Action[];
  notes: string[];
}

export interface Layover { city?: string; tz: string; arr_local: string; dep_local: string; }
export interface Commitment { title: string; date_local: string; start_local: string; end_local: string; }

export interface EngineTrip {
  id: string;
  origin_iata: string;
  dest_iata: string;
  dep_local: string;
  arr_local: string;
  origin_tz: string;
  dest_tz: string;
  tz_diff_hours: number;
  plan_style: 'gentle' | 'aggressive';
  prefs: {
    sleep_window_local: { start: string; end: string };
    chronotype: 'morning' | 'neutral' | 'evening';
    caffeine: boolean;
    melatonin: boolean;
    naps: boolean;
  };
  cbt_min_local?: string;
  adaptation_factor?: number;
  advance_efficiency?: number;
  delay_efficiency?: number;
  measured_now?: { day_offset: number; cbt_min_local: string };
  stay_days?: number;
  prior_adaptation_hours?: number;
  layovers?: Layover[];
  commitments?: Commitment[];
}

interface ShiftStrategy {
  direction: 'advance' | 'delay' | 'anchor';
  totalShiftHours: number;
  dailyShiftHours: number;
  preDays: number;
  postDays: number;
  homeSleep: { start: string; end: string };
  cbtMinHome: string;
  tzDiffNormalized: number;
  mode: 'full' | 'partial' | 'anchor' | 'minimal';
  adaptive?: { fromDay: number; achievedActual: number };
}

// ─── Time helpers ──────────────────────────────────────────────────────────────

const timeToMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const minutesToTime = (m: number): string => {
  const x = ((Math.round(m) % 1440) + 1440) % 1440;
  return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`;
};
const addMinutes = (t: string, m: number) => minutesToTime(timeToMinutes(t) + m);
const subMinutes = (t: string, m: number) => addMinutes(t, -m);

/** East-positive UTC offset (minutes) for an IANA zone on a given date (DST-correct). */
function tzOffsetMinutes(tz: string, date: Date): number {
  try {
    const f = new Intl.DateTimeFormat('en', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    const p = f.formatToParts(date);
    const get = (t: string) => parseInt(p.find(x => x.type === t)?.value || '0', 10);
    const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
    return (asUtc - date.getTime()) / 60000;
  } catch {
    return 0;
  }
}

export function tzDiffHours(originTz: string, destTz: string, on: Date): number {
  return Math.round((tzOffsetMinutes(destTz, on) - tzOffsetMinutes(originTz, on)) / 60);
}

function fmtInTz(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

// ─── Circadian phase estimate (HR/glucose-aware) ───────────────────────────────

export interface CircadianInputs {
  settingsSleep: { start: string; end: string };
  measuredSleep?: { start: string; end: string; nights: number } | null;
  hrNadirLocal?: string | null;
  glucoseNadirLocal?: string | null;
}
export interface CircadianEstimate {
  sleep: { start: string; end: string };
  cbtMin: string;
  source: 'wearable_bio' | 'wearable_sleep' | 'settings';
  confidence: 'high' | 'medium' | 'low';
}

const inWindow = (m: number, bed: number, wake: number): boolean => {
  const x = ((m % 1440) + 1440) % 1440;
  return bed <= wake ? x >= bed && x <= wake : x >= bed || x <= wake;
};
const weightedCircMean = (items: Array<{ time: string; weight: number }>): string => {
  let x = 0, y = 0, w = 0;
  for (const it of items) {
    const a = (timeToMinutes(it.time) / 1440) * 2 * Math.PI;
    x += Math.cos(a) * it.weight; y += Math.sin(a) * it.weight; w += it.weight;
  }
  if (w === 0) return items[0]?.time ?? '04:00';
  return minutesToTime((Math.atan2(y / w, x / w) / (2 * Math.PI)) * 1440);
};

export function estimateCircadianPhase(inp: CircadianInputs): CircadianEstimate {
  const useMeasured = !!inp.measuredSleep && inp.measuredSleep.nights >= 3;
  const sleep = useMeasured ? { start: inp.measuredSleep!.start, end: inp.measuredSleep!.end } : inp.settingsSleep;
  const sleepCbt = subMinutes(sleep.end, 120);
  const bed = timeToMinutes(sleep.start), wake = timeToMinutes(sleep.end);
  const nightStart = (bed - 60 + 1440) % 1440;
  const candidates = [{ time: sleepCbt, weight: useMeasured ? 0.8 : 0.5 }];
  const signals: string[] = [];
  if (inp.hrNadirLocal && inWindow(timeToMinutes(inp.hrNadirLocal), nightStart, wake)) {
    candidates.push({ time: inp.hrNadirLocal, weight: 1.0 }); signals.push('hr');
  }
  if (inp.glucoseNadirLocal && inWindow(timeToMinutes(inp.glucoseNadirLocal), nightStart, wake)) {
    candidates.push({ time: inp.glucoseNadirLocal, weight: 0.6 }); signals.push('glucose');
  }
  const cbtMin = weightedCircMean(candidates);
  if (signals.length > 0) return { sleep, cbtMin, source: 'wearable_bio', confidence: 'high' };
  if (useMeasured) return { sleep, cbtMin, source: 'wearable_sleep', confidence: 'medium' };
  return { sleep, cbtMin, source: 'settings', confidence: 'low' };
}

export function computeAdaptationFactor(inp: { age?: number; measuredSleep?: { start: string; end: string } | null; lightSensitivity?: 'low' | 'normal' | 'high' }): number {
  let f = !inp.age || inp.age <= 40 ? 1 : Math.max(0.7, 1 - (inp.age - 40) * 0.008);
  if (inp.measuredSleep) {
    const dur = ((timeToMinutes(inp.measuredSleep.end) - timeToMinutes(inp.measuredSleep.start) + 1440) % 1440) / 60;
    f *= Math.max(0.85, 1 - Math.max(0, 7.5 - dur) * 0.04);
  }
  if (inp.lightSensitivity === 'low') f *= 0.9;
  else if (inp.lightSensitivity === 'high') f *= 1.1;
  return Math.max(0.6, Math.min(1.1, f));
}

// ─── The engine ────────────────────────────────────────────────────────────────

export function generatePlan(trip: EngineTrip): PlanDay[] {
  const strat = computeStrategy(trip);
  const days: PlanDay[] = [];
  for (let off = -strat.preDays; off <= strat.postDays; off++) {
    const segment: 'pre' | 'in_flight' | 'post' = off < 0 ? 'pre' : off === 0 ? 'in_flight' : 'post';
    const magnitude = strat.adaptive && off >= strat.adaptive.fromDay
      ? projectShiftFrom(strat.adaptive.achievedActual, off - strat.adaptive.fromDay, strat.totalShiftHours, strat.dailyShiftHours)
      : achievedShift(off + strat.preDays, strat.totalShiftHours, strat.dailyShiftHours);
    const signedShift = strat.direction === 'advance' ? magnitude : -magnitude;
    days.push(createPlanDay(trip, off, segment, strat, signedShift));
  }
  return days;
}

export function getPlanSummary(trip: EngineTrip): { mode: ShiftStrategy['mode']; label: string; detail: string } {
  const s = computeStrategy(trip);
  const h = Math.round(s.totalShiftHours);
  switch (s.mode) {
    case 'anchor': return { mode: s.mode, label: 'Stay on home time', detail: "Short trip — adapting then reversing isn't worth it." };
    case 'partial': return { mode: s.mode, label: 'Partial shift', detail: `Medium stay — shift ~${h}h, just enough to sleep well.` };
    case 'minimal': return { mode: s.mode, label: 'Minimal shift needed', detail: 'Small time change — your body will adjust on its own.' };
    default: return { mode: s.mode, label: 'Full adjustment', detail: `Shift ${h}h fully onto local time, about ${s.dailyShiftHours}h per day.` };
  }
}

export function getAchievedAdaptation(trip: EngineTrip): number {
  const s = computeStrategy(trip);
  if (s.totalShiftHours === 0) return 0;
  return Math.round(achievedShift(s.preDays + (trip.stay_days ?? 30), s.totalShiftHours, s.dailyShiftHours) * 10) / 10;
}

function computeStrategy(trip: EngineTrip): ShiftStrategy {
  const style = trip.plan_style;
  const home = trip.prefs.sleep_window_local;
  let d = trip.tz_diff_hours % 24;
  if (d > 12) d -= 24;
  if (d <= -12) d += 24;
  const advanceMag = d >= 0 ? d : 24 + d;
  const delayMag = d >= 0 ? 24 - d : -d;
  const factor = trip.adaptation_factor ?? 1;
  const advanceRate = (style === 'aggressive' ? 1.5 : 1.0) * factor * (trip.advance_efficiency ?? 1);
  const delayRate = (style === 'aggressive' ? 2.0 : 1.5) * factor * (trip.delay_efficiency ?? 1);

  let direction: ShiftStrategy['direction'];
  let totalShiftHours: number;
  let dailyShiftHours: number;
  if (advanceMag === 0) { direction = 'advance'; totalShiftHours = 0; dailyShiftHours = advanceRate; }
  else if (advanceMag / advanceRate <= delayMag / delayRate) { direction = 'advance'; totalShiftHours = advanceMag; dailyShiftHours = advanceRate; }
  else { direction = 'delay'; totalShiftHours = delayMag; dailyShiftHours = delayRate; }

  const cbtMinHome = trip.cbt_min_local ?? subMinutes(home.end, 120);
  const fullShift = trip.prior_adaptation_hours !== undefined ? Math.min(totalShiftHours, trip.prior_adaptation_hours) : totalShiftHours;

  if (trip.stay_days !== undefined && trip.stay_days <= 3 && fullShift >= 3) {
    return { direction: 'anchor', totalShiftHours: 0, dailyShiftHours: 0, preDays: 0, postDays: Math.max(1, Math.min(trip.stay_days, 6)), homeSleep: home, cbtMinHome, tzDiffNormalized: d, mode: 'anchor' };
  }

  const partialShift = Math.min(fullShift, minShiftToWindow(addMinutes(cbtMinHome, d * 60), home, direction));
  const daysForFull = Math.ceil(fullShift / dailyShiftHours);
  const usedPartial = trip.stay_days !== undefined && trip.stay_days < daysForFull && partialShift < fullShift;
  totalShiftHours = usedPartial ? partialShift : fullShift;

  let mode: ShiftStrategy['mode'];
  if (fullShift < 3) mode = 'minimal'; else if (usedPartial) mode = 'partial'; else mode = 'full';

  const daysNeeded = totalShiftHours > 0 ? daysToShiftFrom(0, totalShiftHours, dailyShiftHours) : 0;
  const preDays = totalShiftHours === 0 ? 0 : Math.min(direction === 'advance' ? 3 : 2, daysNeeded);
  let postDays = totalShiftHours === 0 ? 1 : Math.min(Math.max(daysNeeded, 1), 6);

  // Closed-loop: re-anchor remaining days to the body's actual measured phase.
  let adaptive: ShiftStrategy['adaptive'];
  if (trip.measured_now && totalShiftHours > 0) {
    const achievedActual = inferAchievedShift(direction, cbtMinHome, d, totalShiftHours, trip.measured_now);
    adaptive = { fromDay: trip.measured_now.day_offset, achievedActual };
    postDays = Math.min(8, Math.max(postDays, trip.measured_now.day_offset + daysToShiftFrom(achievedActual, totalShiftHours, dailyShiftHours)));
  }

  return { direction, totalShiftHours, dailyShiftHours, preDays, postDays, homeSleep: home, cbtMinHome, tzDiffNormalized: d, mode, adaptive };
}

function achievedShift(days: number, total: number, rate: number): number {
  if (total <= 0 || rate <= 0 || days <= 0) return 0;
  let done = 0;
  for (let dd = 0; dd < days && done < total; dd++) done = Math.min(total, done + rate * (done >= 0.7 * total ? 0.6 : 1));
  return done;
}
function projectShiftFrom(start: number, days: number, total: number, rate: number): number {
  if (total <= 0 || rate <= 0) return Math.max(0, Math.min(start, total));
  let done = Math.max(0, Math.min(start, total));
  for (let dd = 0; dd < days && done < total; dd++) done = Math.min(total, done + rate * (done >= 0.7 * total ? 0.6 : 1));
  return done;
}
function daysToShiftFrom(start: number, total: number, rate: number): number {
  if (total <= 0 || rate <= 0) return 0;
  let done = Math.max(0, Math.min(start, total)), d = 0;
  while (done < total - 0.05 && d < 30) { done = Math.min(total, done + rate * (done >= 0.7 * total ? 0.6 : 1)); d++; }
  return d;
}
function inferAchievedShift(direction: 'advance' | 'delay' | 'anchor', cbtMinHome: string, tzDiffNormalized: number, total: number, measured: { day_offset: number; cbt_min_local: string }): number {
  const offsetH = measured.day_offset >= 0 ? tzDiffNormalized : 0;
  let signed = (timeToMinutes(cbtMinHome) + offsetH * 60 - timeToMinutes(measured.cbt_min_local)) / 60;
  signed = ((((signed + 12) % 24) + 24) % 24) - 12;
  const magnitude = direction === 'advance' ? signed : -signed;
  return Math.max(0, Math.min(total, magnitude));
}
function minShiftToWindow(arrivalCbt: string, sleep: { start: string; end: string }, direction: 'advance' | 'delay'): number {
  const bed = timeToMinutes(sleep.start), wake = timeToMinutes(sleep.end);
  let m = timeToMinutes(arrivalCbt);
  if (inWindow(m, bed, wake)) return 0;
  const step = direction === 'advance' ? -1 : 1;
  for (let dist = 1; dist <= 1440; dist++) { m += step; if (inWindow(m, bed, wake)) return dist / 60; }
  return 0;
}

function createPlanDay(trip: EngineTrip, dayOffset: number, segment: 'pre' | 'in_flight' | 'post', strat: ShiftStrategy, signedShift: number): PlanDay {
  const date = planDayDate(trip, dayOffset);
  const prefs = trip.prefs;
  const isAnchor = strat.direction === 'anchor';
  const atDestination = segment !== 'pre';
  const localOffsetMin = (atDestination ? strat.tzDiffNormalized * 60 : 0) - signedShift * 60;
  const sleep = { start: addMinutes(strat.homeSleep.start, localOffsetMin), end: addMinutes(strat.homeSleep.end, localOffsetMin) };
  const cbtMinLocal = addMinutes(strat.cbtMinHome, localOffsetMin);
  const actions: Action[] = [];

  actions.push({ type: 'sleep', start_local: sleep.start, end_local: sleep.end, at_local: null,
    rationale: isAnchor ? 'Stay on home time — keep your usual sleep (shown in local clock).' : signedShift === 0 ? 'Sleep on your normal schedule' : 'Target sleep (local time)' });

  if (segment === 'in_flight') {
    actions.push({ type: 'in_flight', start_local: fmtInTz(new Date(trip.dep_local), trip.origin_tz), end_local: fmtInTz(new Date(trip.arr_local), trip.dest_tz), at_local: null,
      rationale: isAnchor ? 'Stay on home time on the plane.' : strat.direction === 'advance' ? 'Set your watch to destination time; block light early, seek later.' : 'Set your watch to destination time; seek light late, block early.' });
    actions.push(...layoverActions(trip, strat.direction));
  }

  actions.push(...lightActions(cbtMinLocal, strat.direction, strat.totalShiftHours));

  if (prefs.melatonin && ((strat.direction === 'advance' && strat.totalShiftHours > 0) || isAnchor)) {
    actions.push({ type: 'melatonin', start_local: null, end_local: null, at_local: subMinutes(sleep.start, 180), intensity: 'low', rationale: '0.5–3 mg ~3 h before bedtime' });
  }
  if (prefs.caffeine) {
    const cutoff = subMinutes(sleep.start, 420);
    actions.push({ type: 'caffeine_ok', start_local: sleep.end, end_local: cutoff, at_local: null, rationale: segment === 'post' ? '~300 mg in the morning' : 'Caffeine OK until cutoff' });
    actions.push({ type: 'caffeine_cutoff', start_local: null, end_local: null, at_local: cutoff, rationale: 'No caffeine after this' });
  }
  actions.push({ type: 'meal', start_local: addMinutes(sleep.end, 30), end_local: addMinutes(sleep.end, 75), at_local: null,
    rationale: isAnchor ? 'Keep meals on home time too' : 'Anchor meals to destination time' });
  if (prefs.naps && segment === 'post' && strat.direction === 'advance' && strat.totalShiftHours > 0) {
    const napStart = addMinutes(sleep.end, 360);
    actions.push({ type: 'nap', start_local: napStart, end_local: addMinutes(napStart, 30), at_local: null, rationale: 'Optional ≤30 min nap, before mid-afternoon' });
  }
  actions.push(...commitmentActions(trip, date, sleep, cbtMinLocal));

  actions.sort((a, b) => (a.start_local || a.at_local || '00:00').localeCompare(b.start_local || b.at_local || '00:00'));
  return {
    id: `${trip.id}-day-${dayOffset}`, trip_id: trip.id, date_local: date,
    location: { label: segment === 'in_flight' ? 'In flight' : dayOffset < 0 ? trip.origin_iata : trip.dest_iata, tz: segment === 'pre' ? trip.origin_tz : trip.dest_tz, segment: segment === 'in_flight' ? 'in_flight' : dayOffset < 0 ? 'pre' : 'post' },
    actions, notes: [],
  };
}

function lightActions(cbt: string, direction: ShiftStrategy['direction'], total: number): Action[] {
  if (total === 0 || direction === 'anchor') return [];
  if (direction === 'advance') return [
    { type: 'seek_light', start_local: cbt, end_local: addMinutes(cbt, 360), at_local: null, intensity: 'high', rationale: 'Bright light from CBTmin into the morning advances your clock' },
    { type: 'avoid_light', start_local: subMinutes(cbt, 300), end_local: cbt, at_local: null, intensity: 'high', rationale: 'Block light before CBTmin (incl. early arrival morning)' },
  ];
  return [
    { type: 'seek_light', start_local: subMinutes(cbt, 360), end_local: cbt, at_local: null, intensity: 'high', rationale: 'Bright evening light before CBTmin delays your clock' },
    { type: 'avoid_light', start_local: cbt, end_local: addMinutes(cbt, 300), at_local: null, intensity: 'high', rationale: 'Sunglasses after CBTmin (early morning)' },
  ];
}

function layoverActions(trip: EngineTrip, direction: ShiftStrategy['direction']): Action[] {
  if (!trip.layovers?.length) return [];
  const out: Action[] = [];
  for (const lo of trip.layovers) {
    const durH = (new Date(lo.dep_local).getTime() - new Date(lo.arr_local).getTime()) / 3_600_000;
    if (!(durH >= 5)) continue;
    const startC = fmtInTz(new Date(lo.arr_local), lo.tz), endC = fmtInTz(new Date(lo.dep_local), lo.tz);
    const city = lo.city || 'your layover';
    const startHour = parseInt(startC.slice(0, 2), 10);
    if (startHour >= 21 || startHour <= 4) {
      out.push({ type: 'sleep', start_local: startC, end_local: endC, at_local: null, rationale: `Long overnight layover in ${city} (${Math.round(durH)}h) — sleep here.` });
    } else if (direction !== 'anchor') {
      out.push({ type: 'seek_light', start_local: startC, end_local: endC, at_local: null, intensity: 'moderate', rationale: `${Math.round(durH)}h layover in ${city} — get light and move.` });
    }
  }
  return out;
}

function intervalsOverlap(aS: string, aE: string, bS: string, bE: string): boolean {
  const span = (s: string, e: string): [number, number] => { const a = timeToMinutes(s); let b = timeToMinutes(e); if (b <= a) b += 1440; return [a, b]; };
  const [a0, a1] = span(aS, aE), [b0, b1] = span(bS, bE);
  return (a0 < b1 && b0 < a1) || (a0 < b1 + 1440 && b0 + 1440 < a1) || (a0 + 1440 < b1 && b0 < a1 + 1440);
}

function commitmentActions(trip: EngineTrip, date: string, sleep: { start: string; end: string }, cbt: string): Action[] {
  return (trip.commitments ?? []).filter(c => c.date_local === date).map(c => {
    const inLow = intervalsOverlap(c.start_local, c.end_local, cbt, addMinutes(cbt, 180));
    const overlapsSleep = intervalsOverlap(c.start_local, c.end_local, sleep.start, sleep.end);
    let rationale = `Stay sharp for: ${c.title}.`;
    if (inLow) rationale += ' ⚠ Body-clock low — get bright light and caffeine 30–60 min before.';
    else if (overlapsSleep) rationale += ' ⚠ Overlaps your sleep — caffeinate before.';
    else rationale += ' Well-timed — you should be alert.';
    return { type: 'commitment' as const, start_local: c.start_local, end_local: c.end_local, at_local: null, rationale };
  });
}

function planDayDate(trip: EngineTrip, dayOffset: number): string {
  const base = new Date(trip.dep_local);
  base.setDate(base.getDate() + dayOffset);
  return base.toISOString().split('T')[0];
}
