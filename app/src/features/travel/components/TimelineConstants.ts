import { Action } from '../../../shared/types';

export const HOUR_HEIGHT = 32;
export const CHART_HEIGHT = 24 * HOUR_HEIGHT;
export const BAR_WIDTH = 40;
export const BAR_SPACING = 8;

export const INFO_BY_TYPE: Record<Action['type'], { title: string; body: string } | null> = {
  sleep: {
    title: 'Go to sleep',
    body:
      'Be sure to prioritize sleep even if the timing on the plane is inconvenient.\n\n' +
      'Lower the window shade, turn off the overhead light, turn off the TV, and stop using your laptop or tablet. We always recommend using a sleep mask and earplugs when sleeping.\n\n' +
      "Even if you can't sleep, wear sunglasses and avoid light to increase your chances of falling asleep.",
  },
  nap: {
    title: 'Take a nap',
    body: 'A short nap can help reset your alertness without disrupting your schedule. Keep it brief and avoid bright light right after.',
  },
  seek_light: {
    title: 'Seek light',
    body: 'Expose yourself to bright light during this window. Natural sunlight is best—step outside if possible.',
  },
  avoid_light: {
    title: 'Avoid light',
    body: 'Limit bright light exposure. Wear sunglasses, dim screens, and stay indoors if possible.',
  },
  caffeine_ok: {
    title: 'Caffeine OK',
    body: 'Caffeine is okay during this window. Keep intake moderate and avoid it outside the recommended times.',
  },
  caffeine_cutoff: {
    title: 'No caffeine',
    body: 'Avoid caffeine during this window to protect your sleep timing.',
  },
  melatonin: {
    title: 'Melatonin',
    body: 'If you use melatonin, take it at this time to help shift your body clock.',
  },
  in_flight: {
    title: 'In flight',
    body: 'You are in the air during this window. Follow the plan as closely as possible while on the plane.',
  },
};

export const getBarColor = (type: Action['type']): string => {
  switch (type) {
    case 'sleep': return '#1E2A44';
    case 'seek_light': return '#F5B300';
    case 'avoid_light': return '#E67E22';
    case 'caffeine_ok': return '#8B5E3C';
    case 'caffeine_cutoff': return '#F4E9DB';
    case 'melatonin': return '#7C3AED';
    case 'nap': return '#1E2A44';
    case 'in_flight': return '#A19A93';
    default: return '#B9B2AA';
  }
};

export const getBarStyle = (type: Action['type']) => {
  if (type === 'caffeine_cutoff') {
    return { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#B89A7A', borderStyle: 'solid' as const };
  }
  if (type === 'avoid_light') {
    return { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#E67E22', borderStyle: 'solid' as const };
  }
  return { backgroundColor: getBarColor(type), borderWidth: 0 };
};

export const getBarIcon = (type: Action['type']): { name: string; color: string; crossed?: boolean } | null => {
  switch (type) {
    case 'sleep': return { name: 'bed', color: '#F8F4EF' };
    case 'seek_light': return { name: 'sunny', color: '#7A4E00' };
    case 'avoid_light': return { name: 'sunny-outline', color: '#E67E22' };
    case 'caffeine_ok': return { name: 'cafe', color: '#F8F4EF' };
    case 'caffeine_cutoff': return { name: 'cafe-outline', color: '#8B5E3C', crossed: true };
    case 'melatonin': return { name: 'medkit', color: '#F8F4EF' };
    case 'nap': return { name: 'bed-outline', color: '#F8F4EF' };
    case 'in_flight': return { name: 'airplane', color: '#F8F4EF' };
    default: return null;
  }
};

export const getSegmentColor = (segment: string): string => {
  switch (segment) {
    case 'pre': return '#F5B300';
    case 'in_flight': return '#0B84F6';
    case 'post': return '#10B981';
    case 'layover': return '#7C3AED';
    default: return '#6B7280';
  }
};

export const timeToMinutes = (hhmm: string | null): number | null => {
  if (!hhmm) return null;
  try {
    const [h, m] = hhmm.split(':').map(v => parseInt(v, 10));
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  } catch {
    return null;
  }
};

export const minutesToTop = (minutes: number): number => {
  const clamped = Math.max(0, Math.min(1440, minutes));
  return (clamped / 1440) * CHART_HEIGHT;
};

export const minutesToHeight = (startMinutes: number, endMinutes: number): number => {
  let start = Math.max(0, Math.min(1440, startMinutes));
  let end = Math.max(0, Math.min(1440, endMinutes));
  if (end < start) { end = 1440; }
  const height = ((end - start) / 1440) * CHART_HEIGHT;
  return Math.max(8, height);
};

export const formatHourLabel = (h: number): string => `${h.toString().padStart(2, '0')}:00`;

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  } catch {
    return dateString;
  }
};
