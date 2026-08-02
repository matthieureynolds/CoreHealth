/**
 * City → short display code, shared by the trip list and the trip detail screen.
 *
 * Both screens render the same origin → destination pair, so this table lived in
 * both files verbatim: 45 entries duplicated, which meant adding a city fixed one
 * screen and silently left the other showing a truncated fallback.
 */
const CITY_CODES: Record<string, string> = {
  london: "LDN",
  paris: "PAR",
  madrid: "MAD",
  tokyo: "TYO",
  "new york": "NYC",
  "los angeles": "LAX",
  dubai: "DXB",
  singapore: "SIN",
  sydney: "SYD",
  rome: "ROM",
  berlin: "BER",
  amsterdam: "AMS",
  bangkok: "BKK",
  barcelona: "BCN",
  lisbon: "LIS",
  milan: "MIL",
  munich: "MUC",
  vienna: "VIE",
  zurich: "ZRH",
  istanbul: "IST",
  cairo: "CAI",
  nairobi: "NBO",
  toronto: "YTO",
  "san francisco": "SFO",
  chicago: "CHI",
  miami: "MIA",
  seattle: "SEA",
  boston: "BOS",
  denver: "DEN",
  honolulu: "HNL",
  "hong kong": "HKG",
  seoul: "SEL",
  beijing: "PEK",
  shanghai: "SHA",
  mumbai: "BOM",
  delhi: "DEL",
  "cape town": "CPT",
  rio: "RIO",
  "buenos aires": "BUE",
  mexico: "MEX",
  lagos: "LOS",
  accra: "ACC",
  marrakech: "RAK",
};

/** Strip any ", Country" suffix — both call sites store "City, Country". */
export function getCityName(location: string): string {
  return location.split(",")[0].trim();
}

/** Known code for a city, else its first three letters uppercased. */
export function getCityCode(location: string): string {
  const city = getCityName(location);
  return CITY_CODES[city.toLowerCase()] || city.slice(0, 3).toUpperCase();
}
