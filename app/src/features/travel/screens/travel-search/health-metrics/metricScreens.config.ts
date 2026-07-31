import type { Ionicons } from "@expo/vector-icons";
import { palette } from "../../../../../shared/theme/colors";

/** One band on a metric's reference scale (AQI bands, UV levels, altitude zones…). */
export interface MetricScaleBand {
  label: string;
  color: string;
  /** Numeric band, e.g. "0–50". Rendered inline with the label when `note` is set. */
  range?: string;
  /** Short guidance for the band. Its presence switches the row to a stacked layout. */
  note?: string;
}

export interface MetricResource {
  label: string;
  url: string;
}

export interface MetricScreenConfig {
  headerTitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Drives the hero icon, hero border and the health-impact bullet tint. */
  accent: string;
  heroTitle: string;
  heroDesc: string;
  scaleTitle: string;
  scale: MetricScaleBand[];
  impacts: string[];
  recommendations: string[];
  riskFactors: string[];
  /** Only outbreaks link out to health authorities today. */
  resources?: MetricResource[];
}

export const AIR_QUALITY_CONFIG: MetricScreenConfig = {
  headerTitle: "Air Quality",
  icon: "cloud-outline",
  accent: palette.link,
  heroTitle: "Air Quality Index (AQI)",
  heroDesc:
    "Measures concentrations of pollutants including particulate matter (PM2.5 / PM10), ozone, nitrogen dioxide, and sulfur dioxide.",
  scaleTitle: "AQI SCALE",
  scale: [
    { label: "Good", range: "0–50", color: palette.successAlt },
    { label: "Moderate", range: "51–100", color: palette.warning },
    { label: "Unhealthy (Sensitive)", range: "101–150", color: palette.alert },
    { label: "Unhealthy", range: "151–200", color: palette.danger },
    { label: "Hazardous", range: "201+", color: palette.dangerDeep },
  ],
  impacts: [
    "Respiratory irritation with elevated pollutants",
    "Aggravated asthma and lung conditions",
    "Cardiovascular stress during prolonged exposure",
  ],
  recommendations: [
    "Check AQI before outdoor exercise",
    "Wear N95 masks on poor air quality days",
    "Keep windows closed when AQI > 100",
    "Use HEPA air purifiers indoors",
    "Avoid exercising near busy roads",
  ],
  riskFactors: [
    "Pre-existing respiratory or cardiovascular conditions",
    "Outdoor exercise during high pollution",
    "Living near industrial areas or heavy traffic",
    "Children and elderly are more vulnerable",
  ],
};

export const POLLEN_CONFIG: MetricScreenConfig = {
  headerTitle: "Pollen",
  icon: "flower-outline",
  accent: "#AF52DE",
  heroTitle: "Pollen Count",
  heroDesc:
    "Measures the concentration of pollen grains (tree, grass, weed) per cubic metre of air. High counts trigger allergic reactions in sensitive individuals.",
  scaleTitle: "POLLEN SCALE (grains/m³)",
  scale: [
    { label: "Very Low", range: "0–4", color: palette.successAlt },
    { label: "Low", range: "5–9", color: palette.successVivid },
    { label: "Moderate", range: "10–49", color: palette.warning },
    { label: "High", range: "50–149", color: palette.alert },
    { label: "Very High", range: "150+", color: palette.danger },
  ],
  impacts: [
    "Hay fever symptoms: sneezing, runny nose, itchy eyes",
    "Asthma exacerbation in sensitive individuals",
    "Skin reactions and contact dermatitis in rare cases",
  ],
  recommendations: [
    "Take antihistamines before peak pollen hours (morning)",
    "Shower and change clothes after outdoor activities",
    "Wear wraparound sunglasses outdoors",
    "Keep windows closed on high pollen days",
    "Use HEPA air purifiers indoors",
  ],
  riskFactors: [
    "Seasonal allergies (allergic rhinitis)",
    "Asthma or other respiratory conditions",
    "Family history of allergies",
    "Living in high-vegetation areas",
  ],
};

export const UV_INDEX_CONFIG: MetricScreenConfig = {
  headerTitle: "UV Index",
  icon: "sunny-outline",
  accent: palette.warning,
  heroTitle: "UV Index",
  heroDesc:
    "The UV Index measures the strength of ultraviolet radiation reaching the Earth's surface and predicts sunburn risk for the average person.",
  scaleTitle: "UV INDEX SCALE",
  scale: [
    {
      label: "Low",
      range: "0–2",
      color: palette.successAlt,
      note: "Minimal protection needed",
    },
    {
      label: "Moderate",
      range: "3–5",
      color: palette.warning,
      note: "Some protection recommended",
    },
    {
      label: "High",
      range: "6–7",
      color: palette.alert,
      note: "Protection essential",
    },
    {
      label: "Very High",
      range: "8–10",
      color: palette.danger,
      note: "Extra protection required",
    },
    {
      label: "Extreme",
      range: "11+",
      color: palette.dangerDeep,
      note: "Stay out of direct sun",
    },
  ],
  impacts: [
    "Sunburn can occur within minutes at extreme UV levels",
    "Cumulative UV exposure increases skin cancer risk",
    "UV rays can cause eye damage and cataracts",
  ],
  recommendations: [
    "Apply SPF 30+ sunscreen every 2 hours outdoors",
    "Wear protective clothing, hat and UV-blocking sunglasses",
    "Seek shade between 10am and 4pm",
    "Use SPF 50+ when UV Index is 8 or above",
    "Reapply sunscreen after swimming or sweating",
  ],
  riskFactors: [
    "Fair skin, light eyes, or red/blonde hair",
    "History of sunburn or skin cancer",
    "High altitude or equatorial locations",
    "Reflective surfaces (snow, water, sand)",
  ],
};

export const ALTITUDE_CONFIG: MetricScreenConfig = {
  headerTitle: "Altitude",
  icon: "trending-up-outline",
  accent: palette.alert,
  heroTitle: "Altitude Risk",
  heroDesc:
    "Assesses the physiological impact of your destination's elevation on oxygen availability, exercise tolerance, and acclimatization needs.",
  scaleTitle: "ALTITUDE ZONES",
  scale: [
    {
      label: "Low",
      range: "< 1,500m",
      color: palette.successAlt,
      note: "Minimal physiological impact",
    },
    {
      label: "Moderate",
      range: "1,500–2,500m",
      color: palette.warning,
      note: "May affect sleep and exercise",
    },
    {
      label: "High",
      range: "2,500–3,500m",
      color: palette.alert,
      note: "AMS risk — gradual ascent needed",
    },
    {
      label: "Very High",
      range: "3,500–5,500m",
      color: palette.danger,
      note: "Acclimatization essential",
    },
    {
      label: "Extreme",
      range: "> 5,500m",
      color: palette.dangerDeep,
      note: "Expert preparation required",
    },
  ],
  impacts: [
    "Acute Mountain Sickness (AMS): headache, nausea, fatigue",
    "Reduced exercise tolerance and oxygen saturation",
    "High Altitude Pulmonary Edema (HAPE) in rare severe cases",
    "Sleep disruption and vivid dreams at altitude",
  ],
  recommendations: [
    "Ascend gradually — no more than 300–500m/day above 2500m",
    "Hydrate well and avoid alcohol on first day",
    "Rest for 24–48h before strenuous activity at altitude",
    "Descend immediately if AMS symptoms worsen",
    "Consider acetazolamide if prescribed by a doctor",
  ],
  riskFactors: [
    "Rapid ascent to high altitude",
    "History of altitude illness",
    "Strenuous exercise immediately on arrival",
    "Pre-existing heart or lung conditions",
  ],
};

export const WATER_SAFETY_CONFIG: MetricScreenConfig = {
  headerTitle: "Water Safety",
  icon: "water-outline",
  accent: palette.link,
  heroTitle: "Water Quality",
  heroDesc:
    "Measures the safety of local water sources, including bacterial contamination, chemical pollutants, and mineral content.",
  scaleTitle: "QUALITY SCALE",
  scale: [
    {
      label: "Excellent",
      color: palette.successAlt,
      note: "95–100 — No treatment needed",
    },
    {
      label: "Very Good",
      color: palette.successVivid,
      note: "80–94 — Safe to drink",
    },
    {
      label: "Good",
      color: palette.warning,
      note: "65–79 — Consider filtration",
    },
    {
      label: "Marginal",
      color: palette.alert,
      note: "45–64 — Use filtered water",
    },
    {
      label: "Poor",
      color: palette.danger,
      note: "0–44 — Do not drink tap water",
    },
  ],
  impacts: [
    "Gastrointestinal illness from bacterial or chemical contamination",
    "Dehydration if safe water is unavailable",
    "Long-term effects from heavy metal exposure",
  ],
  recommendations: [
    "Drink bottled or filtered water when quality is poor",
    "Use water purification tablets when travelling remotely",
    "Avoid ice made from untreated tap water",
    "Brush teeth with bottled water in high-risk areas",
    "Boil water for at least 1 minute if unsure",
  ],
  riskFactors: [
    "Travelling to regions with poor sanitation infrastructure",
    "Immunocompromised individuals",
    "Young children and infants",
    "Consuming untreated or surface water",
  ],
};

export const FOOD_SAFETY_CONFIG: MetricScreenConfig = {
  headerTitle: "Food Safety",
  icon: "restaurant-outline",
  accent: palette.success,
  heroTitle: "Food Safety",
  heroDesc:
    "Assesses local food hygiene standards, preparation practices, contamination risk and overall foodborne illness risk for travellers.",
  scaleTitle: "RISK LEVELS",
  scale: [
    {
      label: "Good (70–100)",
      color: palette.successAlt,
      note: "Low risk — standard precautions apply",
    },
    {
      label: "Moderate (40–69)",
      color: palette.warning,
      note: "Be selective; prefer cooked food",
    },
    {
      label: "Poor (0–39)",
      color: palette.danger,
      note: "High risk — strict food safety required",
    },
  ],
  impacts: [
    "Traveller's diarrhea (most common travel illness)",
    "Nausea, vomiting and stomach cramps",
    "Dehydration, especially in hot climates",
    "Foodborne illness from bacteria, viruses or parasites",
  ],
  recommendations: [
    "Eat freshly cooked, hot food from reputable venues",
    "Avoid raw or undercooked meat and seafood",
    "Use bottled or purified water for drinking and brushing teeth",
    "Wash hands thoroughly before eating",
    "Carry oral rehydration salts for emergencies",
  ],
  riskFactors: [
    "Street food from low-hygiene environments",
    "Compromised immune system",
    "Consuming raw salads or unwashed fruit",
    "Travelling to regions with poor sanitation",
  ],
};

export const DISEASE_OUTBREAK_CONFIG: MetricScreenConfig = {
  headerTitle: "Disease Outbreaks",
  icon: "medkit-outline",
  accent: palette.danger,
  heroTitle: "Disease Outbreaks",
  heroDesc:
    "Summarises notable infectious disease activity at your current or planned travel destination, based on public health surveillance data.",
  scaleTitle: "RISK LEVELS",
  scale: [
    {
      label: "None (0–19)",
      color: palette.successAlt,
      note: "No significant outbreaks — routine precautions",
    },
    {
      label: "Low (20–39)",
      color: palette.successVivid,
      note: "Minor activity — standard hygiene",
    },
    {
      label: "Moderate (40–59)",
      color: palette.warning,
      note: "Localised outbreaks — heightened awareness",
    },
    {
      label: "High (60–79)",
      color: palette.alert,
      note: "Widespread activity — avoid if possible",
    },
    {
      label: "Severe (80–100)",
      color: palette.danger,
      note: "Consider postponing non-essential travel",
    },
  ],
  impacts: [
    "Elevated infection risk in outbreak zones",
    "Potential healthcare system strain in severe outbreaks",
    "Cross-border spread risk for highly contagious diseases",
  ],
  recommendations: [
    "Keep routine vaccinations up to date before travel",
    "Practice strict hand hygiene — wash or sanitize frequently",
    "Avoid crowded indoor spaces during active outbreaks",
    "Follow local health authority guidelines and advisories",
    "Carry a basic medical kit including masks and hand sanitizer",
  ],
  riskFactors: [
    "Immunocompromised individuals",
    "Crowded transport hubs and accommodation",
    "Low local vaccination coverage",
    "Travel during peak transmission seasons",
  ],
  resources: [
    {
      label: "WHO Travel Advisories",
      url: "https://www.who.int/emergencies/disease-outbreak-news",
    },
    { label: "CDC Traveler's Health", url: "https://wwwnc.cdc.gov/travel" },
    {
      label: "ECDC Outbreak News",
      url: "https://www.ecdc.europa.eu/en/threats-and-outbreaks",
    },
  ],
};
