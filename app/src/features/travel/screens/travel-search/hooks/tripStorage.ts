import type { Trip } from "./trip";

/**
 * Deserialisation for trips read back out of AsyncStorage.
 *
 * `new Date(x)` never throws — it returns an Invalid Date, which then
 * propagates silently into trip maths (durations, jet-lag offsets, sort order)
 * and surfaces much later as "NaN" or a wrong plan. Everything here fails
 * loudly-but-safely instead: a trip whose departure date cannot be parsed is
 * dropped, and an unparseable return date degrades to undefined.
 */

/** Parses a stored date, returning null rather than an Invalid Date. */
export function parseStoredDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value !== "string" && typeof value !== "number") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Rebuilds trips from parsed JSON, discarding entries that cannot be trusted.
 * Returns the surviving trips plus how many were dropped, so the caller can
 * report the loss rather than silently showing fewer trips.
 */
export function deserializeStoredTrips(parsed: unknown): {
  trips: Trip[];
  dropped: number;
} {
  if (!Array.isArray(parsed)) return { trips: [], dropped: 0 };

  const trips: Trip[] = [];
  let dropped = 0;

  for (const raw of parsed) {
    if (!raw || typeof raw !== "object") {
      dropped++;
      continue;
    }
    const t = raw as Record<string, unknown>;
    const departureDate = parseStoredDate(t.departureDate);
    if (!departureDate) {
      // Required: without it the trip cannot be placed on a timeline at all.
      dropped++;
      continue;
    }
    const returnDate = parseStoredDate(t.returnDate) ?? undefined;
    trips.push({ ...(raw as Trip), departureDate, returnDate });
  }

  return { trips, dropped };
}
