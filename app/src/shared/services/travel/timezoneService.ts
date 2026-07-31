import { API_CONFIG } from "../../config/api";

export interface TimezoneInfo {
  timezoneId: string;
  offset: number; // UTC offset in minutes
  offsetString: string; // e.g., "+05:30", "-08:00"
  dstOffset?: number; // Daylight saving time offset
  isDst: boolean;
  country?: string;
  region?: string;
}

// In-memory cache for timezone API results (keyed by rounded lat,lng)
const timezoneCache = new Map<
  string,
  { result: TimezoneInfo; timestamp: number }
>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCacheKey(lat: number, lng: number): string {
  // Round to 2 decimal places (~1km precision) to increase cache hits
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

// Comprehensive timezone database with major timezones
const TIMEZONE_DATABASE: Record<string, TimezoneInfo> = {
  // UTC
  UTC: { timezoneId: "UTC", offset: 0, offsetString: "+00:00", isDst: false },

  // Americas
  "America/New_York": {
    timezoneId: "America/New_York",
    offset: -300,
    offsetString: "-05:00",
    dstOffset: -240,
    isDst: false,
    country: "US",
    region: "Eastern",
  },
  "America/Chicago": {
    timezoneId: "America/Chicago",
    offset: -360,
    offsetString: "-06:00",
    dstOffset: -300,
    isDst: false,
    country: "US",
    region: "Central",
  },
  "America/Denver": {
    timezoneId: "America/Denver",
    offset: -420,
    offsetString: "-07:00",
    dstOffset: -360,
    isDst: false,
    country: "US",
    region: "Mountain",
  },
  "America/Los_Angeles": {
    timezoneId: "America/Los_Angeles",
    offset: -480,
    offsetString: "-08:00",
    dstOffset: -420,
    isDst: false,
    country: "US",
    region: "Pacific",
  },
  "America/Toronto": {
    timezoneId: "America/Toronto",
    offset: -300,
    offsetString: "-05:00",
    dstOffset: -240,
    isDst: false,
    country: "CA",
    region: "Eastern",
  },
  "America/Vancouver": {
    timezoneId: "America/Vancouver",
    offset: -480,
    offsetString: "-08:00",
    dstOffset: -420,
    isDst: false,
    country: "CA",
    region: "Pacific",
  },
  "America/Mexico_City": {
    timezoneId: "America/Mexico_City",
    offset: -360,
    offsetString: "-06:00",
    dstOffset: -300,
    isDst: false,
    country: "MX",
    region: "Central",
  },
  "America/Sao_Paulo": {
    timezoneId: "America/Sao_Paulo",
    offset: -180,
    offsetString: "-03:00",
    isDst: false,
    country: "BR",
    region: "Brasilia",
  },
  "America/Buenos_Aires": {
    timezoneId: "America/Buenos_Aires",
    offset: -180,
    offsetString: "-03:00",
    isDst: false,
    country: "AR",
    region: "Argentina",
  },
  "America/Lima": {
    timezoneId: "America/Lima",
    offset: -300,
    offsetString: "-05:00",
    isDst: false,
    country: "PE",
    region: "Peru",
  },
  "America/Santiago": {
    timezoneId: "America/Santiago",
    offset: -180,
    offsetString: "-03:00",
    dstOffset: -240,
    isDst: false,
    country: "CL",
    region: "Chile",
  },
  "America/Bogota": {
    timezoneId: "America/Bogota",
    offset: -300,
    offsetString: "-05:00",
    isDst: false,
    country: "CO",
    region: "Colombia",
  },
  "America/Caracas": {
    timezoneId: "America/Caracas",
    offset: -240,
    offsetString: "-04:00",
    isDst: false,
    country: "VE",
    region: "Venezuela",
  },

  // Europe
  "Europe/London": {
    timezoneId: "Europe/London",
    offset: 0,
    offsetString: "+00:00",
    dstOffset: 60,
    isDst: false,
    country: "GB",
    region: "GMT",
  },
  "Europe/Paris": {
    timezoneId: "Europe/Paris",
    offset: 60,
    offsetString: "+01:00",
    dstOffset: 120,
    isDst: false,
    country: "FR",
    region: "CET",
  },
  "Europe/Berlin": {
    timezoneId: "Europe/Berlin",
    offset: 60,
    offsetString: "+01:00",
    dstOffset: 120,
    isDst: false,
    country: "DE",
    region: "CET",
  },
  "Europe/Rome": {
    timezoneId: "Europe/Rome",
    offset: 60,
    offsetString: "+01:00",
    dstOffset: 120,
    isDst: false,
    country: "IT",
    region: "CET",
  },
  "Europe/Madrid": {
    timezoneId: "Europe/Madrid",
    offset: 60,
    offsetString: "+01:00",
    dstOffset: 120,
    isDst: false,
    country: "ES",
    region: "CET",
  },
  "Europe/Amsterdam": {
    timezoneId: "Europe/Amsterdam",
    offset: 60,
    offsetString: "+01:00",
    dstOffset: 120,
    isDst: false,
    country: "NL",
    region: "CET",
  },
  "Europe/Vienna": {
    timezoneId: "Europe/Vienna",
    offset: 60,
    offsetString: "+01:00",
    dstOffset: 120,
    isDst: false,
    country: "AT",
    region: "CET",
  },
  "Europe/Zurich": {
    timezoneId: "Europe/Zurich",
    offset: 60,
    offsetString: "+01:00",
    dstOffset: 120,
    isDst: false,
    country: "CH",
    region: "CET",
  },
  "Europe/Stockholm": {
    timezoneId: "Europe/Stockholm",
    offset: 60,
    offsetString: "+01:00",
    dstOffset: 120,
    isDst: false,
    country: "SE",
    region: "CET",
  },
  "Europe/Oslo": {
    timezoneId: "Europe/Oslo",
    offset: 60,
    offsetString: "+01:00",
    dstOffset: 120,
    isDst: false,
    country: "NO",
    region: "CET",
  },
  "Europe/Copenhagen": {
    timezoneId: "Europe/Copenhagen",
    offset: 60,
    offsetString: "+01:00",
    dstOffset: 120,
    isDst: false,
    country: "DK",
    region: "CET",
  },
  "Europe/Helsinki": {
    timezoneId: "Europe/Helsinki",
    offset: 120,
    offsetString: "+02:00",
    dstOffset: 180,
    isDst: false,
    country: "FI",
    region: "EET",
  },
  "Europe/Warsaw": {
    timezoneId: "Europe/Warsaw",
    offset: 60,
    offsetString: "+01:00",
    dstOffset: 120,
    isDst: false,
    country: "PL",
    region: "CET",
  },
  "Europe/Prague": {
    timezoneId: "Europe/Prague",
    offset: 60,
    offsetString: "+01:00",
    dstOffset: 120,
    isDst: false,
    country: "CZ",
    region: "CET",
  },
  "Europe/Budapest": {
    timezoneId: "Europe/Budapest",
    offset: 60,
    offsetString: "+01:00",
    dstOffset: 120,
    isDst: false,
    country: "HU",
    region: "CET",
  },
  "Europe/Athens": {
    timezoneId: "Europe/Athens",
    offset: 120,
    offsetString: "+02:00",
    dstOffset: 180,
    isDst: false,
    country: "GR",
    region: "EET",
  },
  "Europe/Istanbul": {
    timezoneId: "Europe/Istanbul",
    offset: 180,
    offsetString: "+03:00",
    isDst: false,
    country: "TR",
    region: "Turkey",
  },
  "Europe/Moscow": {
    timezoneId: "Europe/Moscow",
    offset: 180,
    offsetString: "+03:00",
    isDst: false,
    country: "RU",
    region: "Moscow",
  },
  "Europe/Dublin": {
    timezoneId: "Europe/Dublin",
    offset: 0,
    offsetString: "+00:00",
    dstOffset: 60,
    isDst: false,
    country: "IE",
    region: "GMT",
  },
  "Europe/Lisbon": {
    timezoneId: "Europe/Lisbon",
    offset: 0,
    offsetString: "+00:00",
    dstOffset: 60,
    isDst: false,
    country: "PT",
    region: "GMT",
  },

  // Asia
  "Asia/Tokyo": {
    timezoneId: "Asia/Tokyo",
    offset: 540,
    offsetString: "+09:00",
    isDst: false,
    country: "JP",
    region: "JST",
  },
  "Asia/Shanghai": {
    timezoneId: "Asia/Shanghai",
    offset: 480,
    offsetString: "+08:00",
    isDst: false,
    country: "CN",
    region: "CST",
  },
  "Asia/Beijing": {
    timezoneId: "Asia/Beijing",
    offset: 480,
    offsetString: "+08:00",
    isDst: false,
    country: "CN",
    region: "CST",
  },
  "Asia/Seoul": {
    timezoneId: "Asia/Seoul",
    offset: 540,
    offsetString: "+09:00",
    isDst: false,
    country: "KR",
    region: "KST",
  },
  "Asia/Hong_Kong": {
    timezoneId: "Asia/Hong_Kong",
    offset: 480,
    offsetString: "+08:00",
    isDst: false,
    country: "HK",
    region: "HKT",
  },
  "Asia/Singapore": {
    timezoneId: "Asia/Singapore",
    offset: 480,
    offsetString: "+08:00",
    isDst: false,
    country: "SG",
    region: "SGT",
  },
  "Asia/Bangkok": {
    timezoneId: "Asia/Bangkok",
    offset: 420,
    offsetString: "+07:00",
    isDst: false,
    country: "TH",
    region: "ICT",
  },
  "Asia/Jakarta": {
    timezoneId: "Asia/Jakarta",
    offset: 420,
    offsetString: "+07:00",
    isDst: false,
    country: "ID",
    region: "WIB",
  },
  "Asia/Kuala_Lumpur": {
    timezoneId: "Asia/Kuala_Lumpur",
    offset: 480,
    offsetString: "+08:00",
    isDst: false,
    country: "MY",
    region: "MYT",
  },
  "Asia/Manila": {
    timezoneId: "Asia/Manila",
    offset: 480,
    offsetString: "+08:00",
    isDst: false,
    country: "PH",
    region: "PHT",
  },
  "Asia/Ho_Chi_Minh": {
    timezoneId: "Asia/Ho_Chi_Minh",
    offset: 420,
    offsetString: "+07:00",
    isDst: false,
    country: "VN",
    region: "ICT",
  },
  "Asia/Mumbai": {
    timezoneId: "Asia/Mumbai",
    offset: 330,
    offsetString: "+05:30",
    isDst: false,
    country: "IN",
    region: "IST",
  },
  "Asia/Kolkata": {
    timezoneId: "Asia/Kolkata",
    offset: 330,
    offsetString: "+05:30",
    isDst: false,
    country: "IN",
    region: "IST",
  },
  "Asia/Delhi": {
    timezoneId: "Asia/Delhi",
    offset: 330,
    offsetString: "+05:30",
    isDst: false,
    country: "IN",
    region: "IST",
  },
  "Asia/Dubai": {
    timezoneId: "Asia/Dubai",
    offset: 240,
    offsetString: "+04:00",
    isDst: false,
    country: "AE",
    region: "GST",
  },
  "Asia/Tehran": {
    timezoneId: "Asia/Tehran",
    offset: 210,
    offsetString: "+03:30",
    dstOffset: 270,
    isDst: false,
    country: "IR",
    region: "IRST",
  },
  "Asia/Karachi": {
    timezoneId: "Asia/Karachi",
    offset: 300,
    offsetString: "+05:00",
    isDst: false,
    country: "PK",
    region: "PKT",
  },
  "Asia/Dhaka": {
    timezoneId: "Asia/Dhaka",
    offset: 360,
    offsetString: "+06:00",
    isDst: false,
    country: "BD",
    region: "BST",
  },
  "Asia/Kathmandu": {
    timezoneId: "Asia/Kathmandu",
    offset: 345,
    offsetString: "+05:45",
    isDst: false,
    country: "NP",
    region: "NPT",
  },
  "Asia/Colombo": {
    timezoneId: "Asia/Colombo",
    offset: 330,
    offsetString: "+05:30",
    isDst: false,
    country: "LK",
    region: "SLST",
  },
  "Asia/Yangon": {
    timezoneId: "Asia/Yangon",
    offset: 390,
    offsetString: "+06:30",
    isDst: false,
    country: "MM",
    region: "MMT",
  },
  "Asia/Phnom_Penh": {
    timezoneId: "Asia/Phnom_Penh",
    offset: 420,
    offsetString: "+07:00",
    isDst: false,
    country: "KH",
    region: "ICT",
  },
  "Asia/Vientiane": {
    timezoneId: "Asia/Vientiane",
    offset: 420,
    offsetString: "+07:00",
    isDst: false,
    country: "LA",
    region: "ICT",
  },
  "Asia/Taipei": {
    timezoneId: "Asia/Taipei",
    offset: 480,
    offsetString: "+08:00",
    isDst: false,
    country: "TW",
    region: "CST",
  },
  "Asia/Ulaanbaatar": {
    timezoneId: "Asia/Ulaanbaatar",
    offset: 480,
    offsetString: "+08:00",
    isDst: false,
    country: "MN",
    region: "ULAT",
  },

  // Africa
  "Africa/Cairo": {
    timezoneId: "Africa/Cairo",
    offset: 120,
    offsetString: "+02:00",
    dstOffset: 180,
    isDst: false,
    country: "EG",
    region: "EET",
  },
  "Africa/Johannesburg": {
    timezoneId: "Africa/Johannesburg",
    offset: 120,
    offsetString: "+02:00",
    isDst: false,
    country: "ZA",
    region: "SAST",
  },
  "Africa/Cape_Town": {
    timezoneId: "Africa/Cape_Town",
    offset: 120,
    offsetString: "+02:00",
    isDst: false,
    country: "ZA",
    region: "SAST",
  },
  "Africa/Lagos": {
    timezoneId: "Africa/Lagos",
    offset: 60,
    offsetString: "+01:00",
    isDst: false,
    country: "NG",
    region: "WAT",
  },
  "Africa/Nairobi": {
    timezoneId: "Africa/Nairobi",
    offset: 180,
    offsetString: "+03:00",
    isDst: false,
    country: "KE",
    region: "EAT",
  },
  "Africa/Casablanca": {
    timezoneId: "Africa/Casablanca",
    offset: 0,
    offsetString: "+00:00",
    dstOffset: 60,
    isDst: false,
    country: "MA",
    region: "WET",
  },
  "Africa/Tunis": {
    timezoneId: "Africa/Tunis",
    offset: 60,
    offsetString: "+01:00",
    dstOffset: 120,
    isDst: false,
    country: "TN",
    region: "CET",
  },
  "Africa/Algiers": {
    timezoneId: "Africa/Algiers",
    offset: 60,
    offsetString: "+01:00",
    isDst: false,
    country: "DZ",
    region: "CET",
  },
  "Africa/Addis_Ababa": {
    timezoneId: "Africa/Addis_Ababa",
    offset: 180,
    offsetString: "+03:00",
    isDst: false,
    country: "ET",
    region: "EAT",
  },
  "Africa/Khartoum": {
    timezoneId: "Africa/Khartoum",
    offset: 120,
    offsetString: "+02:00",
    isDst: false,
    country: "SD",
    region: "CAT",
  },
  "Africa/Dakar": {
    timezoneId: "Africa/Dakar",
    offset: 0,
    offsetString: "+00:00",
    isDst: false,
    country: "SN",
    region: "GMT",
  },
  "Africa/Accra": {
    timezoneId: "Africa/Accra",
    offset: 0,
    offsetString: "+00:00",
    isDst: false,
    country: "GH",
    region: "GMT",
  },
  "Africa/Abidjan": {
    timezoneId: "Africa/Abidjan",
    offset: 0,
    offsetString: "+00:00",
    isDst: false,
    country: "CI",
    region: "GMT",
  },
  "Africa/Bamako": {
    timezoneId: "Africa/Bamako",
    offset: 0,
    offsetString: "+00:00",
    isDst: false,
    country: "ML",
    region: "GMT",
  },
  "Africa/Ouagadougou": {
    timezoneId: "Africa/Ouagadougou",
    offset: 0,
    offsetString: "+00:00",
    isDst: false,
    country: "BF",
    region: "GMT",
  },
  "Africa/Niamey": {
    timezoneId: "Africa/Niamey",
    offset: 60,
    offsetString: "+01:00",
    isDst: false,
    country: "NE",
    region: "WAT",
  },
  "Africa/Nouakchott": {
    timezoneId: "Africa/Nouakchott",
    offset: 0,
    offsetString: "+00:00",
    isDst: false,
    country: "MR",
    region: "GMT",
  },
  "Africa/Banjul": {
    timezoneId: "Africa/Banjul",
    offset: 0,
    offsetString: "+00:00",
    isDst: false,
    country: "GM",
    region: "GMT",
  },
  "Africa/Bissau": {
    timezoneId: "Africa/Bissau",
    offset: 0,
    offsetString: "+00:00",
    isDst: false,
    country: "GW",
    region: "GMT",
  },
  "Africa/Conakry": {
    timezoneId: "Africa/Conakry",
    offset: 0,
    offsetString: "+00:00",
    isDst: false,
    country: "GN",
    region: "GMT",
  },
  "Africa/Freetown": {
    timezoneId: "Africa/Freetown",
    offset: 0,
    offsetString: "+00:00",
    isDst: false,
    country: "SL",
    region: "GMT",
  },
  "Africa/Monrovia": {
    timezoneId: "Africa/Monrovia",
    offset: 0,
    offsetString: "+00:00",
    isDst: false,
    country: "LR",
    region: "GMT",
  },
  "Africa/Yamoussoukro": {
    timezoneId: "Africa/Yamoussoukro",
    offset: 0,
    offsetString: "+00:00",
    isDst: false,
    country: "CI",
    region: "GMT",
  },
  "Africa/Brazzaville": {
    timezoneId: "Africa/Brazzaville",
    offset: 60,
    offsetString: "+01:00",
    isDst: false,
    country: "CG",
    region: "WAT",
  },
  "Africa/Kinshasa": {
    timezoneId: "Africa/Kinshasa",
    offset: 60,
    offsetString: "+01:00",
    isDst: false,
    country: "CD",
    region: "WAT",
  },
  "Africa/Luanda": {
    timezoneId: "Africa/Luanda",
    offset: 60,
    offsetString: "+01:00",
    isDst: false,
    country: "AO",
    region: "WAT",
  },
  "Africa/Windhoek": {
    timezoneId: "Africa/Windhoek",
    offset: 120,
    offsetString: "+02:00",
    dstOffset: 180,
    isDst: false,
    country: "NA",
    region: "WAST",
  },
  "Africa/Gaborone": {
    timezoneId: "Africa/Gaborone",
    offset: 120,
    offsetString: "+02:00",
    isDst: false,
    country: "BW",
    region: "CAT",
  },
  "Africa/Harare": {
    timezoneId: "Africa/Harare",
    offset: 120,
    offsetString: "+02:00",
    isDst: false,
    country: "ZW",
    region: "CAT",
  },
  "Africa/Lusaka": {
    timezoneId: "Africa/Lusaka",
    offset: 120,
    offsetString: "+02:00",
    isDst: false,
    country: "ZM",
    region: "CAT",
  },
  "Africa/Maputo": {
    timezoneId: "Africa/Maputo",
    offset: 120,
    offsetString: "+02:00",
    isDst: false,
    country: "MZ",
    region: "CAT",
  },
  "Africa/Antananarivo": {
    timezoneId: "Africa/Antananarivo",
    offset: 180,
    offsetString: "+03:00",
    isDst: false,
    country: "MG",
    region: "EAT",
  },
  "Africa/Port_Louis": {
    timezoneId: "Africa/Port_Louis",
    offset: 240,
    offsetString: "+04:00",
    isDst: false,
    country: "MU",
    region: "MUT",
  },
  "Africa/Victoria": {
    timezoneId: "Africa/Victoria",
    offset: 240,
    offsetString: "+04:00",
    isDst: false,
    country: "SC",
    region: "SCT",
  },
  "Africa/Djibouti": {
    timezoneId: "Africa/Djibouti",
    offset: 180,
    offsetString: "+03:00",
    isDst: false,
    country: "DJ",
    region: "EAT",
  },
  "Africa/Asmara": {
    timezoneId: "Africa/Asmara",
    offset: 180,
    offsetString: "+03:00",
    isDst: false,
    country: "ER",
    region: "EAT",
  },
  "Africa/Mogadishu": {
    timezoneId: "Africa/Mogadishu",
    offset: 180,
    offsetString: "+03:00",
    isDst: false,
    country: "SO",
    region: "EAT",
  },
  "Africa/Kampala": {
    timezoneId: "Africa/Kampala",
    offset: 180,
    offsetString: "+03:00",
    isDst: false,
    country: "UG",
    region: "EAT",
  },
  "Africa/Kigali": {
    timezoneId: "Africa/Kigali",
    offset: 120,
    offsetString: "+02:00",
    isDst: false,
    country: "RW",
    region: "CAT",
  },
  "Africa/Bujumbura": {
    timezoneId: "Africa/Bujumbura",
    offset: 120,
    offsetString: "+02:00",
    isDst: false,
    country: "BI",
    region: "CAT",
  },
  "Africa/Dar_es_Salaam": {
    timezoneId: "Africa/Dar_es_Salaam",
    offset: 180,
    offsetString: "+03:00",
    isDst: false,
    country: "TZ",
    region: "EAT",
  },
  "Africa/Lilongwe": {
    timezoneId: "Africa/Lilongwe",
    offset: 120,
    offsetString: "+02:00",
    isDst: false,
    country: "MW",
    region: "CAT",
  },
  "Africa/Maseru": {
    timezoneId: "Africa/Maseru",
    offset: 120,
    offsetString: "+02:00",
    isDst: false,
    country: "LS",
    region: "SAST",
  },
  "Africa/Mbabane": {
    timezoneId: "Africa/Mbabane",
    offset: 120,
    offsetString: "+02:00",
    isDst: false,
    country: "SZ",
    region: "SAST",
  },

  // Oceania
  "Pacific/Auckland": {
    timezoneId: "Pacific/Auckland",
    offset: 720,
    offsetString: "+12:00",
    dstOffset: 780,
    isDst: false,
    country: "NZ",
    region: "NZST",
  },
  "Pacific/Fiji": {
    timezoneId: "Pacific/Fiji",
    offset: 720,
    offsetString: "+12:00",
    dstOffset: 780,
    isDst: false,
    country: "FJ",
    region: "FJT",
  },
  "Pacific/Port_Moresby": {
    timezoneId: "Pacific/Port_Moresby",
    offset: 600,
    offsetString: "+10:00",
    isDst: false,
    country: "PG",
    region: "PGT",
  },
  "Pacific/Noumea": {
    timezoneId: "Pacific/Noumea",
    offset: 660,
    offsetString: "+11:00",
    isDst: false,
    country: "NC",
    region: "NCT",
  },
  "Pacific/Apia": {
    timezoneId: "Pacific/Apia",
    offset: 780,
    offsetString: "+13:00",
    isDst: false,
    country: "WS",
    region: "WST",
  },
  "Pacific/Nuku_alofa": {
    timezoneId: "Pacific/Nuku_alofa",
    offset: 780,
    offsetString: "+13:00",
    isDst: false,
    country: "TO",
    region: "TOT",
  },
  "Pacific/Tarawa": {
    timezoneId: "Pacific/Tarawa",
    offset: 720,
    offsetString: "+12:00",
    isDst: false,
    country: "KI",
    region: "GILT",
  },
  "Pacific/Majuro": {
    timezoneId: "Pacific/Majuro",
    offset: 720,
    offsetString: "+12:00",
    isDst: false,
    country: "MH",
    region: "MHT",
  },
  "Pacific/Palikir": {
    timezoneId: "Pacific/Palikir",
    offset: 660,
    offsetString: "+11:00",
    isDst: false,
    country: "FM",
    region: "CHUT",
  },
  "Pacific/Yaren": {
    timezoneId: "Pacific/Yaren",
    offset: 720,
    offsetString: "+12:00",
    isDst: false,
    country: "NR",
    region: "NRT",
  },
  "Pacific/Koror": {
    timezoneId: "Pacific/Koror",
    offset: 540,
    offsetString: "+09:00",
    isDst: false,
    country: "PW",
    region: "PWT",
  },
  "Pacific/Honiara": {
    timezoneId: "Pacific/Honiara",
    offset: 660,
    offsetString: "+11:00",
    isDst: false,
    country: "SB",
    region: "SBT",
  },
  "Pacific/Funafuti": {
    timezoneId: "Pacific/Funafuti",
    offset: 720,
    offsetString: "+12:00",
    isDst: false,
    country: "TV",
    region: "TVT",
  },
  "Pacific/Port_Vila": {
    timezoneId: "Pacific/Port_Vila",
    offset: 660,
    offsetString: "+11:00",
    isDst: false,
    country: "VU",
    region: "VUT",
  },

  // Australia
  "Australia/Sydney": {
    timezoneId: "Australia/Sydney",
    offset: 660,
    offsetString: "+11:00",
    dstOffset: 720,
    isDst: false,
    country: "AU",
    region: "AEDT",
  },
  "Australia/Melbourne": {
    timezoneId: "Australia/Melbourne",
    offset: 660,
    offsetString: "+11:00",
    dstOffset: 720,
    isDst: false,
    country: "AU",
    region: "AEDT",
  },
  "Australia/Brisbane": {
    timezoneId: "Australia/Brisbane",
    offset: 600,
    offsetString: "+10:00",
    isDst: false,
    country: "AU",
    region: "AEST",
  },
  "Australia/Perth": {
    timezoneId: "Australia/Perth",
    offset: 480,
    offsetString: "+08:00",
    isDst: false,
    country: "AU",
    region: "AWST",
  },
  "Australia/Adelaide": {
    timezoneId: "Australia/Adelaide",
    offset: 630,
    offsetString: "+10:30",
    dstOffset: 690,
    isDst: false,
    country: "AU",
    region: "ACDT",
  },
  "Australia/Darwin": {
    timezoneId: "Australia/Darwin",
    offset: 570,
    offsetString: "+09:30",
    isDst: false,
    country: "AU",
    region: "ACST",
  },
  "Australia/Hobart": {
    timezoneId: "Australia/Hobart",
    offset: 660,
    offsetString: "+11:00",
    dstOffset: 720,
    isDst: false,
    country: "AU",
    region: "AEDT",
  },
};

/**
 * Get timezone information using Google Timezone API (primary method)
 */
export const getTimezoneFromAPI = async (
  latitude: number,
  longitude: number,
): Promise<TimezoneInfo | null> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.warn(
        "Google Maps API key not found, cannot get timezone from API",
      );
      return null;
    }

    // Check cache first
    const cacheKey = getCacheKey(latitude, longitude);
    const cached = timezoneCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.result;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}${API_CONFIG.TIMEZONE_ENDPOINT}?location=${latitude},${longitude}&timestamp=${timestamp}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Timezone API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
      console.warn(
        "No timezone data found for coordinates:",
        latitude,
        longitude,
      );
      return null;
    }

    // Calculate current offset considering DST
    const isDst = data.dstOffset !== 0;
    const currentOffset = isDst
      ? data.rawOffset + data.dstOffset
      : data.rawOffset;

    const result: TimezoneInfo = {
      timezoneId: data.timeZoneId,
      offset: currentOffset,
      offsetString: formatOffsetString(currentOffset),
      dstOffset: data.dstOffset,
      isDst: isDst,
    };

    // Cache the result
    timezoneCache.set(cacheKey, { result, timestamp: Date.now() });

    return result;
  } catch (error) {
    console.error("Error getting timezone from API:", error);
    return null;
  }
};

/**
 * Get timezone information from built-in database (fallback method)
 */
export const getTimezoneFromDatabase = (
  timezoneId: string,
): TimezoneInfo | null => {
  const timezone = TIMEZONE_DATABASE[timezoneId];
  if (!timezone) {
    return null;
  }

  // Check if DST is currently active
  const now = new Date();
  const isDst =
    timezone.dstOffset !== undefined && isDaylightSavingTime(now, timezoneId);
  const currentOffset =
    isDst && timezone.dstOffset ? timezone.dstOffset : timezone.offset;

  return {
    ...timezone,
    offset: currentOffset,
    offsetString: formatOffsetString(currentOffset),
    isDst: isDst,
  };
};

/**
 * Get timezone information with fallback strategy
 */
export const getTimezoneInfo = async (
  latitude: number,
  longitude: number,
  timezoneId?: string,
): Promise<TimezoneInfo | null> => {
  // Try API first if coordinates are provided
  if (latitude !== 0 && longitude !== 0) {
    const apiResult = await getTimezoneFromAPI(latitude, longitude);
    if (apiResult) {
      return apiResult;
    }
  }

  // Fallback to database if timezoneId is provided
  if (timezoneId) {
    const dbResult = getTimezoneFromDatabase(timezoneId);
    if (dbResult) {
      return dbResult;
    }
  }

  // Final fallback to UTC
  return {
    timezoneId: "UTC",
    offset: 0,
    offsetString: "+00:00",
    isDst: false,
  };
};

/**
 * Get all available timezones from database
 */
export const getAllTimezones = (): TimezoneInfo[] => {
  return Object.values(TIMEZONE_DATABASE);
};

/**
 * Search timezones by country or region
 */
export const searchTimezones = (query: string): TimezoneInfo[] => {
  const lowerQuery = query.toLowerCase();
  return Object.values(TIMEZONE_DATABASE).filter(
    (tz) =>
      tz.country?.toLowerCase().includes(lowerQuery) ||
      tz.region?.toLowerCase().includes(lowerQuery) ||
      tz.timezoneId.toLowerCase().includes(lowerQuery),
  );
};

/**
 * Get timezone by country code
 */
export const getTimezonesByCountry = (countryCode: string): TimezoneInfo[] => {
  return Object.values(TIMEZONE_DATABASE).filter(
    (tz) => tz.country === countryCode.toUpperCase(),
  );
};

/**
 * Format offset in minutes to string (e.g., +05:30, -08:00)
 */
const formatOffsetString = (offsetMinutes: number): string => {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

/**
 * Check if daylight saving time is currently active (simplified)
 */
const isDaylightSavingTime = (date: Date, timezoneId: string): boolean => {
  // This is a simplified DST check - in a real implementation,
  // you'd use a proper timezone library like moment-timezone
  try {
    const formatter = new Intl.DateTimeFormat("en", {
      timeZone: timezoneId,
      timeZoneName: "short",
    });

    const parts = formatter.formatToParts(date);
    const timeZoneName =
      parts.find((part) => part.type === "timeZoneName")?.value || "";

    // Check if the timezone name indicates DST (e.g., "PDT" vs "PST")
    return timeZoneName.includes("DT") || timeZoneName.includes("DST");
  } catch {
    return false;
  }
};

/**
 * Calculate time difference between two timezones
 */
export const calculateTimezoneDifference = (
  fromTimezone: string,
  toTimezone: string,
): number => {
  const fromTz = getTimezoneFromDatabase(fromTimezone);
  const toTz = getTimezoneFromDatabase(toTimezone);

  if (!fromTz || !toTz) {
    return 0;
  }

  return (toTz.offset - fromTz.offset) / 60; // Return difference in hours
};

/**
 * Get current time in a specific timezone
 */
export const getCurrentTimeInTimezone = (
  timezoneId: string,
  hour12: boolean = false,
): {
  time: string;
  date: string;
  timezone: string;
  offset: string;
} => {
  try {
    const now = new Date();
    const timezone = getTimezoneFromDatabase(timezoneId);

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezoneId,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12,
    });

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezoneId,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      time: formatter.format(now),
      date: dateFormatter.format(now),
      timezone: timezoneId,
      offset: timezone?.offsetString || "+00:00",
    };
  } catch (error) {
    console.error("Error getting current time in timezone:", error);
    return {
      time: "00:00:00",
      date: "Unknown",
      timezone: timezoneId,
      offset: "+00:00",
    };
  }
};
