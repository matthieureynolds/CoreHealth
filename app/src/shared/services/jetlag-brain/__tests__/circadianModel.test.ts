import {
  estimateCircadianPhase,
  computeAdaptationFactor,
  adaptationFactorFromAge,
  updateDirectionalEfficiency,
  DEFAULT_EFFICIENCY,
} from '../circadianModel';

const SETTINGS = { start: '23:00', end: '07:00' };

describe('estimateCircadianPhase', () => {
  it('falls back to settings (wake−2h) when no wearable data', () => {
    const e = estimateCircadianPhase({ settingsSleep: SETTINGS });
    expect(e.cbtMin).toBe('05:00');
    expect(e.source).toBe('settings');
    expect(e.confidence).toBe('low');
  });

  it('uses measured sleep timing for a night owl (≥3 nights)', () => {
    const e = estimateCircadianPhase({
      settingsSleep: SETTINGS,
      measuredSleep: { start: '01:10', end: '09:20', nights: 6 },
    });
    expect(e.source).toBe('wearable_sleep');
    expect(e.confidence).toBe('medium');
    // CBTmin ≈ wake−2h = 07:20 (much later than the 05:00 the setting implies)
    expect(e.cbtMin).toBe('07:20');
  });

  it('ignores measured sleep with too few nights', () => {
    const e = estimateCircadianPhase({
      settingsSleep: SETTINGS,
      measuredSleep: { start: '01:00', end: '09:00', nights: 1 },
    });
    expect(e.source).toBe('settings');
  });

  it('blends in HR nadir (physiological) and reports high confidence', () => {
    const e = estimateCircadianPhase({
      settingsSleep: SETTINGS,
      measuredSleep: { start: '01:10', end: '09:20', nights: 6 },
      hrNadirLocal: '06:40',
    });
    expect(e.source).toBe('wearable_bio');
    expect(e.confidence).toBe('high');
    // Blended between sleep-anchor 07:20 and HR 06:40 → between the two.
    expect(e.cbtMin >= '06:40' && e.cbtMin <= '07:20').toBe(true);
  });

  it('rejects an HR nadir that falls outside the sleep window', () => {
    const e = estimateCircadianPhase({
      settingsSleep: SETTINGS,
      measuredSleep: { start: '23:00', end: '07:00', nights: 6 },
      hrNadirLocal: '15:00',
    });
    expect(e.source).toBe('wearable_sleep'); // HR discarded
  });

  it('adds glucose as a second physiological signal', () => {
    const e = estimateCircadianPhase({
      settingsSleep: SETTINGS,
      measuredSleep: { start: '23:00', end: '07:00', nights: 6 },
      hrNadirLocal: '04:30',
      glucoseNadirLocal: '05:00',
    });
    expect(e.source).toBe('wearable_bio');
    expect(e.note).toContain('glucose');
  });
});

describe('computeAdaptationFactor', () => {
  it('is 1.0 for a young adult', () => {
    expect(computeAdaptationFactor({ age: 30 })).toBe(1);
  });

  it('slows with age', () => {
    expect(computeAdaptationFactor({ age: 70 })).toBeLessThan(1);
    expect(computeAdaptationFactor({ age: 70 })).toBeGreaterThanOrEqual(0.6);
  });

  it('slows further with chronic sleep debt', () => {
    const rested = computeAdaptationFactor({ age: 40, measuredSleep: { start: '23:00', end: '07:00' } });
    const deprived = computeAdaptationFactor({ age: 40, measuredSleep: { start: '01:00', end: '05:00' } });
    expect(deprived).toBeLessThan(rested);
  });

  it('respects light sensitivity and clamps to [0.6, 1.1]', () => {
    expect(computeAdaptationFactor({ age: 30, lightSensitivity: 'high' })).toBeLessThanOrEqual(1.1);
    expect(computeAdaptationFactor({ age: 90, lightSensitivity: 'low' })).toBeGreaterThanOrEqual(0.6);
  });

  it('age-only helper matches at the boundary', () => {
    expect(adaptationFactorFromAge(40)).toBe(1);
    expect(adaptationFactorFromAge(undefined)).toBe(1);
  });
});

describe('updateDirectionalEfficiency', () => {
  it('lowers efficiency when the user shifts slower than expected', () => {
    const next = updateDirectionalEfficiency(DEFAULT_EFFICIENCY, 'advance', 0.5, 1.0);
    expect(next.advance).toBeLessThan(1);
    expect(next.delay).toBe(1); // other direction untouched
  });

  it('raises efficiency when faster, clamped to ≤1.5', () => {
    let eff = DEFAULT_EFFICIENCY;
    for (let i = 0; i < 20; i++) eff = updateDirectionalEfficiency(eff, 'delay', 3, 1);
    expect(eff.delay).toBeGreaterThan(1);
    expect(eff.delay).toBeLessThanOrEqual(1.5);
  });

  it('ignores nonsensical inputs', () => {
    expect(updateDirectionalEfficiency(DEFAULT_EFFICIENCY, 'advance', 1, 0)).toEqual(DEFAULT_EFFICIENCY);
  });
});
