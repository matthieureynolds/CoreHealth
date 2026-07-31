import type { FlightOption } from "../../shared/types";

/**
 * Mock flight database for the Timeshifter-style flight picker.
 * As the user types a carrier + number, matching flights surface as
 * tappable suggestions. Real routes/times, dates generated relative to
 * "now" so they always look current. Swap for a real flight API later.
 */
export interface MockFlight {
  carrier: string;
  number: string;
  origin_iata: string;
  dest_iata: string;
  origin_city: string;
  dest_city: string;
  origin_tz: string;
  dest_tz: string;
  depTime: string; // HH:MM local
  arrTime: string; // HH:MM local
  depDayOffset: number; // days from today
  arrDayOffset: number; // days from today (≥ depDayOffset; +1 = arrives next day)
}

const FLIGHTS: MockFlight[] = [
  // ── Finnair — London → Helsinki → Hong Kong (your connecting trip) ──
  {
    carrier: "AY",
    number: "1332",
    origin_iata: "LHR",
    dest_iata: "HEL",
    origin_city: "London",
    dest_city: "Helsinki",
    origin_tz: "Europe/London",
    dest_tz: "Europe/Helsinki",
    depTime: "07:55",
    arrTime: "13:00",
    depDayOffset: 14,
    arrDayOffset: 14,
  },
  {
    carrier: "AY",
    number: "1334",
    origin_iata: "LHR",
    dest_iata: "HEL",
    origin_city: "London",
    dest_city: "Helsinki",
    origin_tz: "Europe/London",
    dest_tz: "Europe/Helsinki",
    depTime: "17:20",
    arrTime: "22:25",
    depDayOffset: 14,
    arrDayOffset: 14,
  },
  {
    carrier: "AY",
    number: "101",
    origin_iata: "HEL",
    dest_iata: "HKG",
    origin_city: "Helsinki",
    dest_city: "Hong Kong",
    origin_tz: "Europe/Helsinki",
    dest_tz: "Asia/Hong_Kong",
    depTime: "17:25",
    arrTime: "08:30",
    depDayOffset: 14,
    arrDayOffset: 15,
  },

  // ── Air France — Paris → Tokyo (your direct trip) ──
  {
    carrier: "AF",
    number: "274",
    origin_iata: "CDG",
    dest_iata: "HND",
    origin_city: "Paris",
    dest_city: "Tokyo",
    origin_tz: "Europe/Paris",
    dest_tz: "Asia/Tokyo",
    depTime: "13:40",
    arrTime: "09:15",
    depDayOffset: 21,
    arrDayOffset: 22,
  },
  {
    carrier: "AF",
    number: "276",
    origin_iata: "CDG",
    dest_iata: "HND",
    origin_city: "Paris",
    dest_city: "Tokyo",
    origin_tz: "Europe/Paris",
    dest_tz: "Asia/Tokyo",
    depTime: "23:25",
    arrTime: "18:55",
    depDayOffset: 21,
    arrDayOffset: 22,
  },

  // ── Qatar Airways — London → Doha (from the Timeshifter reference) ──
  {
    carrier: "QR",
    number: "12",
    origin_iata: "LHR",
    dest_iata: "DOH",
    origin_city: "London",
    dest_city: "Doha",
    origin_tz: "Europe/London",
    dest_tz: "Asia/Qatar",
    depTime: "18:55",
    arrTime: "04:35",
    depDayOffset: 14,
    arrDayOffset: 15,
  },
  {
    carrier: "QR",
    number: "8",
    origin_iata: "LHR",
    dest_iata: "DOH",
    origin_city: "London",
    dest_city: "Doha",
    origin_tz: "Europe/London",
    dest_tz: "Asia/Qatar",
    depTime: "08:55",
    arrTime: "18:30",
    depDayOffset: 14,
    arrDayOffset: 14,
  },

  // ── British Airways ──
  {
    carrier: "BA",
    number: "7",
    origin_iata: "LHR",
    dest_iata: "HND",
    origin_city: "London",
    dest_city: "Tokyo",
    origin_tz: "Europe/London",
    dest_tz: "Asia/Tokyo",
    depTime: "14:05",
    arrTime: "10:35",
    depDayOffset: 14,
    arrDayOffset: 15,
  },
  {
    carrier: "BA",
    number: "117",
    origin_iata: "LHR",
    dest_iata: "JFK",
    origin_city: "London",
    dest_city: "New York",
    origin_tz: "Europe/London",
    dest_tz: "America/New_York",
    depTime: "08:30",
    arrTime: "11:25",
    depDayOffset: 14,
    arrDayOffset: 14,
  },

  // ── American Airlines (matches the default AA placeholder) ──
  {
    carrier: "AA",
    number: "128",
    origin_iata: "JFK",
    dest_iata: "LAX",
    origin_city: "New York",
    dest_city: "Los Angeles",
    origin_tz: "America/New_York",
    dest_tz: "America/Los_Angeles",
    depTime: "07:00",
    arrTime: "10:25",
    depDayOffset: 14,
    arrDayOffset: 14,
  },

  // ── Emirates ──
  {
    carrier: "EK",
    number: "30",
    origin_iata: "LHR",
    dest_iata: "DXB",
    origin_city: "London",
    dest_city: "Dubai",
    origin_tz: "Europe/London",
    dest_tz: "Asia/Dubai",
    depTime: "14:30",
    arrTime: "00:50",
    depDayOffset: 14,
    arrDayOffset: 15,
  },
];

function isoFor(dayOffset: number, time: string): string {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export function toFlightLookupResult(f: MockFlight): FlightOption {
  return {
    carrier: f.carrier,
    number: f.number,
    origin_iata: f.origin_iata,
    dest_iata: f.dest_iata,
    origin_city: f.origin_city,
    dest_city: f.dest_city,
    origin_tz: f.origin_tz,
    dest_tz: f.dest_tz,
    dep_local: isoFor(f.depDayOffset, f.depTime),
    arr_local: isoFor(f.arrDayOffset, f.arrTime),
  };
}

// Strip leading zeros so "012" matches "12" (matches Timeshifter behaviour).
const normalize = (n: string) => n.replace(/^0+/, "");

/**
 * Live suggestions for the typed carrier + (partial) number.
 * Carrier must match exactly; number is a prefix match.
 */
export function searchMockFlights(carrier: string, numberPrefix: string) {
  const code = carrier.toUpperCase().trim();
  if (!code) return [];
  const prefix = normalize(numberPrefix.trim());
  return FLIGHTS.filter(
    (f) => f.carrier === code && normalize(f.number).startsWith(prefix),
  ).map(toFlightLookupResult);
}

/** Exact lookup for a fully-typed flight number. */
export function findMockFlight(carrier: string, number: string) {
  const code = carrier.toUpperCase().trim();
  const num = normalize(number.trim());
  const match = FLIGHTS.find(
    (f) => f.carrier === code && normalize(f.number) === num,
  );
  return match ? toFlightLookupResult(match) : null;
}
