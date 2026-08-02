import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * State that mirrors itself into AsyncStorage under `key`.
 *
 * The subtlety this exists to contain: the first write must not happen until
 * the first read has finished. Hydration is async, so a naive
 * `useEffect(save, [value])` fires on mount holding the *initial* value and
 * overwrites what was stored before the load can return it.
 *
 * TripDetailScreen had this pattern hand-rolled twice, each guarded by a
 * boolean ref that was set once and never reset — so a change of key would
 * stamp the previous key's data over whatever was stored under the new one.
 * Here the guard is the key itself: nothing is written until the value in
 * state is known to have come from the key we are about to write to.
 *
 * `revive` is given the parsed JSON and returns the value to store in state —
 * use it to validate or to migrate older shapes forward.
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
  revive?: (parsed: unknown) => T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  // Which key's stored value is currently held in `value`. `null` means a load
  // is in flight and writing would race it.
  const loadedKey = useRef<string | null>(null);
  // Both are held in refs so callers can pass inline values without
  // re-triggering the load on every render.
  const initialRef = useRef(initialValue);
  const reviveRef = useRef(revive);
  reviveRef.current = revive;

  useEffect(() => {
    let alive = true;
    loadedKey.current = null;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (!alive) return;
        if (raw == null) {
          // Nothing stored under this key. On a key change `value` still holds
          // the previous key's data, so reset rather than letting it bleed
          // across — and then get written back out under the new key.
          setValue(initialRef.current);
          return;
        }
        try {
          const parsed: unknown = JSON.parse(raw);
          setValue(
            reviveRef.current ? reviveRef.current(parsed) : (parsed as T),
          );
        } catch (err) {
          console.warn(
            `[usePersistedState] discarding unreadable value at "${key}"`,
            err,
          );
        }
      })
      .catch((err) => {
        console.warn(`[usePersistedState] read failed for "${key}"`, err);
      })
      .finally(() => {
        if (alive) loadedKey.current = key;
      });
    return () => {
      alive = false;
    };
  }, [key]);

  useEffect(() => {
    if (loadedKey.current !== key) return;
    AsyncStorage.setItem(key, JSON.stringify(value)).catch((err) => {
      console.warn(`[usePersistedState] write failed for "${key}"`, err);
    });
  }, [key, value]);

  return [value, setValue];
}
