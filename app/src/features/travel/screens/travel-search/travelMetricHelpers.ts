export function getStatusColor(status: string): string {
  switch (status) {
    case "good":
      return palette.success;
    case "moderate":
      return palette.warningAlt;
    case "poor":
      return palette.alert;
    case "hazardous":
      return palette.danger;
    default:
      return palette.textSecondary;
  }
}

export function getMetricScore(metricName: string): number {
  switch (metricName) {
    case "Air Quality":
      return 72;
    case "Water Safety":
      return 95;
    case "UV Index":
      return 60;
    case "Food Safety":
      return 85;
    case "Pollen Level":
      return 40;
    case "Altitude":
      return 90;
    case "Disease Outbreaks":
      return 100;
    default:
      return 80;
  }
}

export function getMetricFixedIconColor(
  metricId: string,
  status?: string,
): string {
  if (status) return getStatusColor(status);
  switch (metricId) {
    case "air_quality":
      return "#A1A1A6";
    case "uv_index":
      return "#FFC44D";
    case "food_safety":
      return "#FFB26B";
    case "pollen":
      return "#FFE066";
    case "altitude":
      return "#66D0FF";
    case "outbreaks":
      return "#FF6B6B";
    case "water_safety":
      return "#4DD0E1";
    default:
      return palette.textSecondary;
  }
}

export function getScoreColor(
  _metricId: string,
  status: string,
  _score?: number,
): string {
  switch ((status || "").toLowerCase()) {
    case "excellent":
    case "good":
      return palette.success;
    case "moderate":
      return palette.warningAlt;
    case "poor":
      return palette.alert;
    case "hazardous":
      return palette.danger;
    default:
      return palette.textSecondary;
  }
}

// Derived from the canonical popular cities list in citySearchService.ts
// to avoid maintaining two separate city lists.
import { getPopularCities } from "@shared/services/travel/citySearchService";
import { palette } from "@shared/theme/colors";

const _buildCityCountryMap = (): Record<string, string> => {
  const map: Record<string, string> = { "Current Location": "Your Location" };
  for (const entry of getPopularCities()) {
    const parts = entry.split(", ");
    if (parts.length >= 2) {
      map[parts[0]] = parts.slice(1).join(", ");
    } else {
      map[entry] = entry; // e.g. "Singapore"
    }
  }
  return map;
};
let _cityCountryMap: Record<string, string> | null = null;
const getCityCountryMap = () =>
  _cityCountryMap || (_cityCountryMap = _buildCityCountryMap());

export function getCountryFromCity(city: string): string {
  const cityCountryMap = getCityCountryMap();
  if (cityCountryMap[city]) return cityCountryMap[city];
  const partialMatch = Object.keys(cityCountryMap).find(
    (k) =>
      city.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(city.toLowerCase()),
  );
  return partialMatch ? cityCountryMap[partialMatch] : "Unknown";
}

/**
 * ISO 3166-1 alpha-2 code for a country name (lowercase), used to render real
 * flag images. Returns null for non-country values ("Your Location", "Unknown")
 * so callers can fall back to a generic glyph. Flag emoji can't render on the
 * iOS Simulator, so we use images instead — see CountryFlag.
 */
export function getCountryCode(country: string): string | null {
  const codes: Record<string, string> = {
    Japan: "jp",
    France: "fr",
    USA: "us",
    "United States": "us",
    UK: "gb",
    "United Kingdom": "gb",
    Australia: "au",
    Thailand: "th",
    Singapore: "sg",
    UAE: "ae",
    "Hong Kong": "hk",
    Spain: "es",
    Italy: "it",
    Netherlands: "nl",
    Austria: "at",
    "Czech Republic": "cz",
    Hungary: "hu",
    Denmark: "dk",
    Sweden: "se",
    Norway: "no",
    Finland: "fi",
    Iceland: "is",
    Germany: "de",
    Canada: "ca",
    "South Korea": "kr",
    China: "cn",
    India: "in",
    Mexico: "mx",
    Brazil: "br",
    Argentina: "ar",
    Portugal: "pt",
    Ireland: "ie",
    Switzerland: "ch",
    Belgium: "be",
    Poland: "pl",
    Greece: "gr",
    Turkey: "tr",
    Egypt: "eg",
    "South Africa": "za",
    Kenya: "ke",
    Nigeria: "ng",
    Morocco: "ma",
  };
  return codes[country] ?? null;
}

export const AIRLINE_CODES: Record<string, string> = {
  QR: "Qatar Airways",
  AA: "American Airlines",
  DL: "Delta Air Lines",
  UA: "United Airlines",
  BA: "British Airways",
  AF: "Air France",
  LH: "Lufthansa",
  EK: "Emirates",
  SQ: "Singapore Airlines",
  CX: "Cathay Pacific",
  JL: "Japan Airlines",
  NH: "All Nippon Airways",
  QF: "Qantas",
  VS: "Virgin Atlantic",
  KL: "KLM",
  IB: "Iberia",
  LX: "Swiss International Air Lines",
  OS: "Austrian Airlines",
  SN: "Brussels Airlines",
  TK: "Turkish Airlines",
  EY: "Etihad Airways",
  NZ: "Air New Zealand",
  AC: "Air Canada",
  WS: "WestJet",
  AS: "Alaska Airlines",
  B6: "JetBlue Airways",
  WN: "Southwest Airlines",
  F9: "Frontier Airlines",
  NK: "Spirit Airlines",
  AY: "Finnair",
  SK: "SAS",
  TP: "TAP Air Portugal",
  AZ: "ITA Airways",
  EI: "Aer Lingus",
  FR: "Ryanair",
  U2: "easyJet",
  VY: "Vueling",
  SU: "Aeroflot",
  CA: "Air China",
  MU: "China Eastern",
  CZ: "China Southern",
  KE: "Korean Air",
  OZ: "Asiana Airlines",
  TG: "Thai Airways",
  MH: "Malaysia Airlines",
  GA: "Garuda Indonesia",
  AI: "Air India",
  SV: "Saudia",
  MS: "EgyptAir",
  ET: "Ethiopian Airlines",
  LA: "LATAM Airlines",
  AM: "Aeroméxico",
  AV: "Avianca",
};

export const GENERAL_MEDS: Array<{ name: string; note: string }> = [
  { name: "Antihistamines", note: "Recommended for allergies" },
  { name: "Antacids", note: "Recommended for heartburn" },
  { name: "First Aid", note: "Recommended for minor cuts" },
  { name: "ORS", note: "Recommended for food poisoning" },
];

export interface MetricRowConfig {
  animKey: string;
  metricId: string;
  label: string;
  value: string;
  status: string;
  icon: string;
  scoreLabel: string;
}

export const HEALTH_METRIC_ROWS: MetricRowConfig[] = [
  {
    animKey: "aq",
    metricId: "air_quality",
    label: "Air Quality",
    value: "Moderate",
    status: "moderate",
    icon: "cloud-outline",
    scoreLabel: "Air Quality",
  },
  {
    animKey: "water",
    metricId: "water_quality",
    label: "Water Safety",
    value: "Safe",
    status: "good",
    icon: "water-outline",
    scoreLabel: "Water Safety",
  },
  {
    animKey: "uv",
    metricId: "uv_index",
    label: "UV Index",
    value: "Moderate",
    status: "moderate",
    icon: "sunny",
    scoreLabel: "UV Index",
  },
  {
    animKey: "food",
    metricId: "food_safety",
    label: "Food Safety",
    value: "Good",
    status: "good",
    icon: "restaurant",
    scoreLabel: "Food Safety",
  },
  {
    animKey: "pollen",
    metricId: "pollen",
    label: "Pollen",
    value: "High",
    status: "moderate",
    icon: "flower-outline",
    scoreLabel: "Pollen Level",
  },
  {
    animKey: "altitude",
    metricId: "altitude",
    label: "Altitude",
    value: "Low",
    status: "good",
    icon: "trending-up-outline",
    scoreLabel: "Altitude",
  },
  {
    animKey: "outbreaks",
    metricId: "outbreaks",
    label: "Disease Outbreaks",
    value: "None",
    status: "good",
    icon: "bug-outline",
    scoreLabel: "Disease Outbreaks",
  },
];
