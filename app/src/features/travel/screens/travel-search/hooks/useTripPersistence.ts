import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deserializeStoredTrips } from "./tripStorage";
import type { Trip } from "./trip";
import { MOCK_TRIPS } from "@features/travel/mockTrips";
import { logger } from "@shared/utils/logger";

const STORAGE_KEY = "planned_trips";

/**
 * The trip list and its persistence.
 *
 * Pulled out of useTravelState because it is the one piece of that hook with a
 * real invariant to protect — the seeded demo trips must never reach storage —
 * and it was previously buried among ninety-odd unrelated useState calls.
 */
export function useTripPersistence() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        let loaded = false;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const { trips: restored, dropped } = deserializeStoredTrips(parsed);
            if (dropped > 0) {
              logger.warn(
                `${STORAGE_KEY}: dropped ${dropped} trip(s) with unparseable dates`,
              );
            }
            if (restored.length > 0) {
              setTrips(restored);
              loaded = true;
            }
          } catch (err) {
            // Corrupt store: fall through to the mock seed rather than crashing,
            // but surface it in dev so it isn't mistaken for "no trips yet".
            logger.warn(`${STORAGE_KEY} is corrupt, reseeding`, err);
          }
        }
        // Seed mock trips for testing when no real trips exist yet.
        if (!loaded) setTrips(MOCK_TRIPS);
        initialized.current = true;
      })
      .catch(() => {
        setTrips(MOCK_TRIPS);
        initialized.current = true;
      });
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    // Never persist the seeded demo trips: identity-compare against MOCK_TRIPS,
    // which is the exact array we seed with. Any real user edit builds a new
    // array and so still saves. Without this the mocks were written to storage
    // on first launch and became indistinguishable from real trips forever.
    if (trips === MOCK_TRIPS) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trips)).catch((err) => {
      logger.warn(`failed to persist ${STORAGE_KEY}`, err);
    });
  }, [trips]);

  return { trips, setTrips };
}
