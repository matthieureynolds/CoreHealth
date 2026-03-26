export type DateMode = 'year' | 'yearMonth' | 'full';

export const formatDateForMode = (d: Date | null, mode: DateMode): string => {
  if (!d) return 'Select date';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (mode === 'year') return `${y}`;
  if (mode === 'yearMonth') return `${y}-${m}`;
  return `${y}-${m}-${day}`;
};
