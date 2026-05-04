export type RingId = 'recovery' | 'biomarkers' | 'lifestyle';
export type TrendDir = 'up' | 'down' | 'flat';
export type ChartType = 'bar' | 'line';
export type Period = 'day' | 'week' | 'month' | 'year';

export interface SubMetric {
  label: string;
  value: string;
  badge: string;
  badgeColor: string;
}

export interface StatDef {
  id: string;
  icon: string;
  label: string;
  data: number[];        // D — 7 days Mon–Sun
  weekData: number[];    // W — 4 weekly averages (W1–W4)
  monthData: number[];   // M — 12 monthly averages (Jan–Dec)
  yearData: number[];    // Y — 5 yearly averages (2022–2026)
  format: (n: number) => string;
  chartType: ChartType;
  higherIsBetter: boolean;
}

export interface RingConfig {
  color: string;
  title: string;
  dayScores: number[];     // 7 — Mon–Sun
  weeklyScores: number[];  // 4 — W1–W4
  monthScores: number[];   // 12 — Jan–Dec
  yearScores: number[];    // 5 — 2022–2026
  subMetrics: SubMetric[];
  stats: StatDef[];
}

export const DAYS         = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKS        = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
export const MONTHS       = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const YEARS        = ['2022', '2023', '2024', '2025', '2026'];

export const DAYS_SHORT   = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
export const WEEKS_SHORT  = ['W1', 'W2', 'W3', 'W4'];
export const MONTHS_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
export const YEARS_SHORT  = ["'22", "'23", "'24", "'25", "'26"];

export const TODAY_INDEX         = 6;
export const CURRENT_WEEK_INDEX  = 3;
export const CURRENT_MONTH_INDEX = new Date().getMonth();
export const CURRENT_YEAR_INDEX  = 4;

export const PERIOD_LABELS: Record<Period, string[]> = {
  day:   DAYS,
  week:  WEEKS,
  month: MONTHS,
  year:  YEARS,
};

export const PERIOD_SHORT_LABELS: Record<Period, string[]> = {
  day:   DAYS_SHORT,
  week:  WEEKS_SHORT,
  month: MONTHS_SHORT,
  year:  YEARS_SHORT,
};

export const PERIOD_DEFAULT_INDEX: Record<Period, number> = {
  day:   TODAY_INDEX,
  week:  CURRENT_WEEK_INDEX,
  month: CURRENT_MONTH_INDEX,
  year:  CURRENT_YEAR_INDEX,
};

export const PERIOD_COMPARISON: Record<Period, string> = {
  day:   'VS. PREVIOUS 30 DAYS',
  week:  'VS. PREVIOUS MONTH',
  month: 'VS. PREVIOUS YEAR',
  year:  'VS. ALL-TIME AVERAGE',
};

export function getScores(config: RingConfig, period: Period): number[] {
  if (period === 'week')  return config.weeklyScores;
  if (period === 'month') return config.monthScores;
  if (period === 'year')  return config.yearScores;
  return config.dayScores;
}

export function getStatData(stat: StatDef, period: Period): number[] {
  if (period === 'week')  return stat.weekData;
  if (period === 'month') return stat.monthData;
  if (period === 'year')  return stat.yearData;
  return stat.data;
}

export function getTrend(current: number, avg: number, higherIsBetter: boolean): TrendDir {
  const pct = Math.abs((current - avg) / avg);
  if (pct < 0.02) return 'flat';
  return (higherIsBetter ? current > avg : current < avg) ? 'up' : 'down';
}

export const RING_CONFIGS: Record<RingId, RingConfig> = {
  recovery: {
    color: '#30D158',
    title: 'RECOVERY',
    dayScores:    [72, 85, 78, 91, 88, 76, 88],
    weeklyScores: [82, 85, 87, 88],
    monthScores:  [71, 73, 75, 78, 80, 82, 83, 81, 84, 85, 86, 88],
    yearScores:   [72, 75, 79, 83, 88],
    subMetrics: [
      { label: 'HRV',         value: '58 ms',  badge: 'Good', badgeColor: '#FF9500' },
      { label: 'Deep Sleep',  value: '1h 30m', badge: 'Good', badgeColor: '#FF9500' },
      { label: 'Consistency', value: '87%',    badge: 'Good', badgeColor: '#FF9500' },
    ],
    stats: [
      {
        id: 'hrv',
        icon: 'pulse-outline',
        label: 'HRV',
        data:      [52, 48, 61, 55, 58, 50, 58],
        weekData:  [50, 53, 55, 58],
        monthData: [47, 48, 49, 50, 52, 53, 54, 53, 54, 56, 57, 58],
        yearData:  [43, 46, 49, 53, 58],
        format: (n) => `${Math.round(n)} ms`,
        chartType: 'line',
        higherIsBetter: true,
      },
      {
        id: 'rhr',
        icon: 'heart-outline',
        label: 'RESTING HEART RATE',
        data:      [56, 58, 54, 55, 54, 57, 54],
        weekData:  [58, 57, 56, 54],
        monthData: [60, 59, 58, 57, 57, 56, 55, 55, 55, 54, 54, 54],
        yearData:  [63, 61, 59, 56, 54],
        format: (n) => `${Math.round(n)} bpm`,
        chartType: 'line',
        higherIsBetter: false,
      },
      {
        id: 'sleep_duration',
        icon: 'moon-outline',
        label: 'SLEEP DURATION',
        data:      [7.2, 6.5, 8.1, 7.8, 7.9, 6.8, 7.8],
        weekData:  [7.0, 7.2, 7.5, 7.8],
        monthData: [6.8, 7.0, 7.1, 7.2, 7.3, 7.5, 7.6, 7.4, 7.5, 7.6, 7.7, 7.8],
        yearData:  [6.6, 6.9, 7.1, 7.4, 7.8],
        format: (n) => { const h = Math.floor(n); const m = Math.round((n - h) * 60); return `${h}h ${m}m`; },
        chartType: 'bar',
        higherIsBetter: true,
      },
      {
        id: 'deep_sleep',
        icon: 'bed-outline',
        label: 'DEEP SLEEP',
        data:      [1.4, 1.1, 1.6, 1.5, 1.5, 1.2, 1.5],
        weekData:  [1.2, 1.3, 1.4, 1.5],
        monthData: [1.1, 1.2, 1.2, 1.3, 1.3, 1.4, 1.4, 1.4, 1.4, 1.5, 1.5, 1.5],
        yearData:  [1.0, 1.1, 1.2, 1.3, 1.5],
        format: (n) => { const h = Math.floor(n); const m = Math.round((n - h) * 60); return `${h}h ${m}m`; },
        chartType: 'bar',
        higherIsBetter: true,
      },
      {
        id: 'sleep_consistency',
        icon: 'time-outline',
        label: 'SLEEP CONSISTENCY',
        data:      [78, 82, 85, 83, 86, 84, 87],
        weekData:  [80, 83, 85, 87],
        monthData: [74, 76, 78, 79, 80, 82, 83, 83, 84, 85, 86, 87],
        yearData:  [71, 75, 79, 83, 87],
        format: (n) => `${Math.round(n)}%`,
        chartType: 'line',
        higherIsBetter: true,
      },
    ],
  },

  biomarkers: {
    color: '#3AABF0',
    title: 'BIOMARKERS',
    dayScores:    [68, 70, 72, 71, 73, 74, 74],
    weeklyScores: [70, 71, 72, 74],
    monthScores:  [66, 67, 68, 69, 70, 71, 72, 72, 73, 73, 74, 74],
    yearScores:   [62, 65, 68, 71, 74],
    subMetrics: [
      { label: 'ApoB',   value: '70 mg/dL', badge: 'Monitor', badgeColor: '#FF9500' },
      { label: 'HbA1c',  value: '5.1%',     badge: 'Optimal', badgeColor: '#30D158' },
      { label: 'hs-CRP', value: '0.8 mg/L', badge: 'Monitor', badgeColor: '#FF9500' },
    ],
    stats: [
      {
        id: 'apob',
        icon: 'pulse-outline',
        label: 'ApoB',
        data:      [78, 76, 75, 73, 72, 71, 70],
        weekData:  [75, 74, 72, 70],
        monthData: [82, 81, 80, 78, 77, 75, 74, 73, 72, 71, 70, 70],
        yearData:  [92, 87, 82, 76, 70],
        format: (n) => `${Math.round(n)} mg/dL`,
        chartType: 'line',
        higherIsBetter: false,
      },
      {
        id: 'hba1c',
        icon: 'flask-outline',
        label: 'HbA1c',
        data:      [5.3, 5.2, 5.2, 5.1, 5.1, 5.1, 5.1],
        weekData:  [5.2, 5.2, 5.1, 5.1],
        monthData: [5.5, 5.4, 5.4, 5.3, 5.3, 5.2, 5.2, 5.2, 5.1, 5.1, 5.1, 5.1],
        yearData:  [5.7, 5.6, 5.4, 5.2, 5.1],
        format: (n) => `${n.toFixed(1)}%`,
        chartType: 'line',
        higherIsBetter: false,
      },
      {
        id: 'hscrp',
        icon: 'flame-outline',
        label: 'hs-CRP',
        data:      [1.0, 0.9, 0.9, 0.8, 0.8, 0.8, 0.8],
        weekData:  [0.9, 0.9, 0.8, 0.8],
        monthData: [1.2, 1.1, 1.1, 1.0, 1.0, 0.9, 0.9, 0.9, 0.9, 0.8, 0.8, 0.8],
        yearData:  [1.4, 1.2, 1.1, 0.9, 0.8],
        format: (n) => `${n.toFixed(1)} mg/L`,
        chartType: 'line',
        higherIsBetter: false,
      },
      {
        id: 'homa_ir',
        icon: 'nutrition-outline',
        label: 'HOMA-IR',
        data:      [1.4, 1.3, 1.3, 1.2, 1.2, 1.2, 1.2],
        weekData:  [1.3, 1.3, 1.2, 1.2],
        monthData: [1.6, 1.5, 1.5, 1.4, 1.4, 1.3, 1.3, 1.3, 1.2, 1.2, 1.2, 1.2],
        yearData:  [1.9, 1.7, 1.5, 1.3, 1.2],
        format: (n) => n.toFixed(1),
        chartType: 'line',
        higherIsBetter: false,
      },
      {
        id: 'vitd',
        icon: 'sunny-outline',
        label: 'VITAMIN D',
        data:      [28, 29, 30, 31, 32, 34, 35],
        weekData:  [30, 31, 33, 35],
        monthData: [22, 23, 25, 27, 29, 32, 34, 35, 34, 32, 30, 28],
        yearData:  [20, 24, 28, 31, 35],
        format: (n) => `${Math.round(n)} ng/mL`,
        chartType: 'bar',
        higherIsBetter: true,
      },
    ],
  },

  lifestyle: {
    color: '#FF9F0A',
    title: 'PHYSICAL CAPACITY',
    dayScores:    [78, 79, 82, 80, 83, 84, 85],
    weeklyScores: [79, 81, 83, 85],
    monthScores:  [73, 74, 75, 76, 77, 79, 80, 80, 81, 82, 83, 85],
    yearScores:   [70, 73, 77, 81, 85],
    subMetrics: [
      { label: 'VO2 Max',      value: '47 ml/kg/min', badge: 'Good',    badgeColor: '#FF9500' },
      { label: 'Body Fat',     value: '18.0%',        badge: 'Good',    badgeColor: '#FF9500' },
      { label: 'Blood Press.', value: '118/76',       badge: 'Optimal', badgeColor: '#30D158' },
    ],
    stats: [
      {
        id: 'vo2_max',
        icon: 'trending-up-outline',
        label: 'VO2 MAX',
        data:      [44, 45, 45, 46, 46, 47, 47],
        weekData:  [45, 45, 46, 47],
        monthData: [42, 42, 43, 44, 44, 45, 46, 46, 46, 47, 47, 47],
        yearData:  [38, 40, 42, 45, 47],
        format: (n) => `${Math.round(n)} ml/kg/min`,
        chartType: 'line',
        higherIsBetter: true,
      },
      {
        id: 'blood_pressure',
        icon: 'speedometer-outline',
        label: 'BLOOD PRESSURE',
        data:      [122, 120, 121, 119, 118, 119, 118],
        weekData:  [121, 120, 119, 118],
        monthData: [126, 125, 124, 122, 121, 120, 119, 119, 119, 118, 118, 118],
        yearData:  [132, 128, 124, 121, 118],
        format: (n) => `${Math.round(n)} mmHg`,
        chartType: 'line',
        higherIsBetter: false,
      },
      {
        id: 'body_fat',
        icon: 'body-outline',
        label: 'BODY FAT',
        data:      [19.2, 19.0, 18.8, 18.6, 18.4, 18.2, 18.0],
        weekData:  [19.0, 18.6, 18.3, 18.0],
        monthData: [20.5, 20.2, 19.8, 19.5, 19.2, 19.0, 18.8, 18.6, 18.4, 18.2, 18.1, 18.0],
        yearData:  [23.5, 22.0, 20.5, 19.2, 18.0],
        format: (n) => `${n.toFixed(1)}%`,
        chartType: 'line',
        higherIsBetter: false,
      },
      {
        id: 'muscle_mass',
        icon: 'barbell-outline',
        label: 'MUSCLE MASS',
        data:      [68.2, 68.4, 68.5, 68.7, 68.8, 69.0, 69.2],
        weekData:  [68.5, 68.7, 68.9, 69.2],
        monthData: [66.5, 66.8, 67.0, 67.3, 67.6, 67.9, 68.2, 68.4, 68.6, 68.8, 69.0, 69.2],
        yearData:  [64.5, 65.8, 66.9, 68.1, 69.2],
        format: (n) => `${n.toFixed(1)} kg`,
        chartType: 'line',
        higherIsBetter: true,
      },
      {
        id: 'waist_height',
        icon: 'resize-outline',
        label: 'WAIST:HEIGHT RATIO',
        data:      [0.47, 0.47, 0.46, 0.46, 0.46, 0.46, 0.46],
        weekData:  [0.47, 0.47, 0.46, 0.46],
        monthData: [0.49, 0.49, 0.48, 0.48, 0.47, 0.47, 0.47, 0.46, 0.46, 0.46, 0.46, 0.46],
        yearData:  [0.52, 0.51, 0.49, 0.47, 0.46],
        format: (n) => n.toFixed(2),
        chartType: 'line',
        higherIsBetter: false,
      },
    ],
  },
};
