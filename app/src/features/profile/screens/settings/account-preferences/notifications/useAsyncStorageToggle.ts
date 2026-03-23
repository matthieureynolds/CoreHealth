import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Persists a boolean toggle to AsyncStorage under `storageKey`.
 * Value is stored as '1' (true) or '0' (false).
 * Returns [enabled, setEnabled] — same API as useState.
 */
export function useAsyncStorageToggle(
  storageKey: string,
  defaultValue = true,
): [boolean, (value: boolean) => void] {
  const [enabled, setEnabled] = useState(defaultValue);

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then(v => { if (v !== null) setEnabled(v === '1'); })
      .catch(() => {});
  }, [storageKey]);

  useEffect(() => {
    AsyncStorage.setItem(storageKey, enabled ? '1' : '0');
  }, [storageKey, enabled]);

  return [enabled, setEnabled];
}
