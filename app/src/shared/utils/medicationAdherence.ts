/**
 * Medication adherence from Medical Timeline (Done = took, Ignore = skipped).
 * Stored by medication name (e.g. "Vitamin D Supplement") and date (YYYY-MM-DD).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@corehealth/medication_adherence';

export type AdherenceAction = 'took' | 'skipped';

export type AdherenceData = Record<string, Record<string, AdherenceAction>>;

export async function getAdherence(): Promise<AdherenceData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as AdherenceData;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export async function recordAdherence(
  medicationName: string,
  dateKey: string,
  action: AdherenceAction
): Promise<void> {
  const data = await getAdherence();
  const byDate = data[medicationName] ?? {};
  byDate[dateKey] = action;
  data[medicationName] = byDate;
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export function getDateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Last N days (date keys YYYY-MM-DD) for display */
export function getLastNDays(n: number, endDate: Date = new Date()): string[] {
  const keys: string[] = [];
  const d = new Date(endDate);
  for (let i = 0; i < n; i++) {
    keys.unshift(getDateKey(d));
    d.setDate(d.getDate() - 1);
  }
  return keys;
}
