import { GeneralSettings } from '../types/settings';

export type DatePattern = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export const formatDateBySetting = (date: Date, pattern: DatePattern): string => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  switch (pattern) {
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${yyyy}`;
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${yyyy}`;
    case 'YYYY-MM-DD':
    default:
      return `${yyyy}-${mm}-${dd}`;
  }
};

export const formatShortDateBySetting = (date: Date, pattern: DatePattern): string => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  if (pattern === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
  // For numeric D/M or M/D, show only day and month to keep UI compact
  return pattern === 'DD/MM/YYYY' ? `${dd}/${mm}` : `${mm}/${dd}`;
};

export const formatTimeBySetting = (date: Date, timeFormat: '12h' | '24h'): string => {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  });
};

export const formatDateTimeBySettings = (date: Date, settings: Pick<GeneralSettings, 'dateFormat' | 'timeFormat'>): string => {
  const datePart = formatDateBySetting(date, settings.dateFormat);
  const timePart = formatTimeBySetting(date, settings.timeFormat);
  return `${datePart} • ${timePart}`;
};


