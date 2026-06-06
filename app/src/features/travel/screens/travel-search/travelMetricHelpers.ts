export function getStatusColor(status: string): string {
  switch (status) {
    case 'good': return '#32D74B';
    case 'moderate': return '#FF9F0A';
    case 'poor': return '#FF6B35';
    case 'hazardous': return '#FF3B30';
    default: return '#8E8E93';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'good': return 'Good';
    case 'moderate': return 'Moderate';
    case 'poor': return 'Poor';
    case 'hazardous': return 'Hazardous';
    default: return 'Unknown';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'good': return 'checkmark-circle';
    case 'moderate': return 'warning';
    case 'poor': return 'close-circle';
    default: return 'help-circle';
  }
}

export function getMetricScore(metricName: string): number {
  switch (metricName) {
    case 'Air Quality': return 72;
    case 'Water Safety': return 95;
    case 'UV Index': return 60;
    case 'Food Safety': return 85;
    case 'Pollen Level': return 40;
    case 'Altitude': return 90;
    case 'Disease Outbreaks': return 100;
    default: return 80;
  }
}

export function getMetricFixedIconColor(metricId: string, status?: string): string {
  if (status) return getStatusColor(status);
  switch (metricId) {
    case 'air_quality': return '#A1A1A6';
    case 'uv_index': return '#FFC44D';
    case 'food_safety': return '#FFB26B';
    case 'pollen': return '#FFE066';
    case 'altitude': return '#66D0FF';
    case 'outbreaks': return '#FF6B6B';
    case 'water_safety': return '#4DD0E1';
    default: return '#8E8E93';
  }
}

export function getScoreColor(_metricId: string, status: string, _score?: number): string {
  switch ((status || '').toLowerCase()) {
    case 'excellent':
    case 'good':
      return '#30D158';
    case 'moderate':
      return '#FF9F0A';
    case 'poor':
      return '#FF6B35';
    case 'hazardous':
      return '#FF3B30';
    default:
      return '#8E8E93';
  }
}

function getAirQualityExplanation(status: string): string {
  switch (status) {
    case 'good': return 'Air quality is good with low levels of pollutants. Safe for most people, including sensitive groups.';
    case 'moderate': return 'Air quality is moderate with some pollutants present. Sensitive individuals may experience minor irritation.';
    case 'poor': return 'Air quality is poor with elevated pollutant levels. Sensitive groups should limit outdoor activities.';
    case 'hazardous': return 'Air quality is hazardous with very high pollutant levels. Everyone should avoid outdoor activities.';
    default: return 'Air quality status is being monitored.';
  }
}
function getAirQualityHealthImpacts(status: string): string[] {
  switch (status) {
    case 'good': return ['Minimal health impacts', 'Safe for most activities'];
    case 'moderate': return ['Possible irritation for sensitive individuals', 'Consider reducing outdoor exercise', 'Monitor for respiratory symptoms'];
    case 'poor': return ['Increased risk of respiratory irritation', 'Avoid outdoor exercise', 'Sensitive groups should stay indoors'];
    case 'hazardous': return ['Serious health risks for everyone', 'Avoid all outdoor activities', 'Use air purifiers indoors'];
    default: return ['Monitor for any respiratory symptoms'];
  }
}
function getAirQualityRecommendations(status: string): string[] {
  switch (status) {
    case 'good': return ['Outdoor activities are generally safe', 'Monitor sensitive individuals'];
    case 'moderate': return ['Limit outdoor exercise', 'Close windows during peak hours', 'Use air purifiers', 'Wear masks if sensitive'];
    case 'poor': return ['Avoid outdoor activities', 'Keep windows closed', 'Use air purifiers', 'Wear N95 masks if going outside'];
    case 'hazardous': return ['Stay indoors with windows closed', 'Use high-efficiency air purifiers', 'Wear N95 masks if necessary'];
    default: return ['Monitor air quality updates', 'Take appropriate precautions'];
  }
}

function getPollenExplanation(status: string): string {
  switch (status) {
    case 'good': return 'Pollen levels are low. Most people with mild allergies should be comfortable.';
    case 'moderate': return 'Pollen levels are moderate. People with allergies may experience symptoms.';
    case 'poor': return 'Pollen levels are high. Significant risk of allergic reactions for sensitive individuals.';
    default: return 'Pollen levels are being monitored.';
  }
}
function getPollenHealthImpacts(status: string): string[] {
  switch (status) {
    case 'good': return ['Minimal allergy symptoms', 'Most people comfortable outdoors'];
    case 'moderate': return ['Allergy symptoms likely for sensitive individuals', 'Sneezing, runny nose, itchy eyes possible'];
    case 'poor': return ['Significant allergy symptoms expected', 'Avoid outdoor activities if possible'];
    default: return ['Monitor for allergy symptoms'];
  }
}
function getPollenRecommendations(status: string): string[] {
  switch (status) {
    case 'good': return ['Outdoor activities generally safe', 'Take allergy medications if needed'];
    case 'moderate': return ['Take allergy medications before going out', 'Avoid early morning outdoor activities', 'Wear sunglasses and hat'];
    case 'poor': return ['Take allergy medications', 'Limit outdoor activities', 'Keep windows closed', 'Use air purifiers with HEPA filters'];
    default: return ['Monitor pollen forecasts', 'Take appropriate allergy precautions'];
  }
}

function getWaterQualityExplanation(status: string): string {
  switch (status) {
    case 'good': return 'Water is safe to drink with minimal contaminants well below harmful levels. Meets health standards and is suitable for all daily uses including drinking and cooking.';
    case 'moderate': return 'Water is generally safe to drink but may have taste, odor, or minor quality issues. Consider filtration for better taste.';
    case 'poor': return 'Water has elevated contaminant levels that may pose health risks. Not recommended for drinking without treatment.';
    default: return 'Water quality is being monitored for safety.';
  }
}
function getWaterQualityHealthImpacts(status: string): string[] {
  switch (status) {
    case 'good': return ['Minimal health risks', 'Safe for daily consumption'];
    case 'moderate': return ['Possible gastrointestinal issues', 'May affect taste and odor'];
    case 'poor': return ['Increased risk of gastrointestinal illness', 'Avoid drinking untreated water'];
    default: return ['Monitor for any digestive symptoms'];
  }
}
function getWaterQualityRecommendations(status: string): string[] {
  switch (status) {
    case 'good': return ['Tap water is safe to drink', 'Good for daily use'];
    case 'moderate': return ['Use water filters for drinking', 'Boil water for cooking'];
    case 'poor': return ['Use high-quality water filters', 'Drink bottled or filtered water'];
    default: return ['Check local water quality reports', 'Use appropriate water treatment methods'];
  }
}

function getUVExplanation(status: string): string {
  switch (status) {
    case 'good': return 'UV levels are low. Minimal protection needed.';
    case 'moderate': return 'UV levels are moderate. Protection is recommended during midday.';
    case 'poor': return 'UV levels are high. Extra protection is required, especially midday.';
    case 'hazardous': return 'UV levels are very high to extreme. Avoid direct sun and use maximum protection.';
    default: return 'UV levels are being monitored.';
  }
}
function getUVHealthImpacts(status: string): string[] {
  switch (status) {
    case 'good': return ['Very low risk of skin damage'];
    case 'moderate': return ['Risk of sunburn for unprotected skin', 'Eye strain possible'];
    case 'poor': return ['Increased sunburn risk within 30–60 minutes', 'Potential eye damage without protection'];
    case 'hazardous': return ['Sunburn in minutes', 'High risk of skin and eye damage'];
    default: return [];
  }
}
function getUVRecommendations(status: string): string[] {
  switch (status) {
    case 'good': return ['Sunscreen optional', 'Sunglasses for comfort'];
    case 'moderate': return ['Use SPF 30+ sunscreen', 'Wear sunglasses and a hat', 'Seek shade near midday'];
    case 'poor': return ['Use SPF 50+ sunscreen', 'Wear protective clothing and hat', 'Limit time in direct sun'];
    case 'hazardous': return ['Avoid direct sun 10am–4pm', 'SPF 50+, sunglasses (UV400)', 'Seek shade and cover up'];
    default: return ['Use appropriate sun protection'];
  }
}

function getFoodSafetyExplanation(status: string): string {
  switch (status) {
    case 'good': return 'Food safety standards are generally good. Low risk of foodborne illness.';
    case 'moderate': return 'Food safety varies. Be selective with vendors and preparation.';
    case 'poor': return 'Higher risk of foodborne illness. Choose reputable venues and cooked food.';
    default: return 'Food safety conditions are being monitored.';
  }
}
function getFoodSafetyHealthImpacts(status: string): string[] {
  switch (status) {
    case 'moderate': return ["Traveler's diarrhea risk present", 'Mild GI upset possible'];
    case 'poor': return ['Higher risk of GI illness', 'Dehydration and electrolyte imbalance possible'];
    default: return [];
  }
}
function getFoodSafetyRecommendations(status: string): string[] {
  switch (status) {
    case 'good': return ['Normal precautions', 'Wash hands before eating'];
    case 'moderate': return ['Eat freshly cooked food', 'Avoid raw/undercooked meats', 'Use bottled water for brushing teeth'];
    case 'poor': return ['Avoid street food/raw salads', 'Drink sealed bottled water', 'Carry oral rehydration salts'];
    default: return ['Follow safe food and water practices'];
  }
}

function getAltitudeExplanation(status: string): string {
  switch (status) {
    case 'good': return 'Altitude is low; minimal physiological impact.';
    case 'moderate': return 'Moderate altitude may affect sleep and exercise tolerance.';
    case 'poor': return 'High altitude increases risk of acute mountain sickness without acclimatization.';
    default: return 'Altitude impact is being assessed.';
  }
}
function getAltitudeHealthImpacts(status: string): string[] {
  switch (status) {
    case 'moderate': return ['Mild headache or fatigue', 'Reduced exercise tolerance'];
    case 'poor': return ['Headache, nausea, insomnia', 'Risk of AMS at >2500m (8200ft)'];
    default: return [];
  }
}
function getAltitudeRecommendations(status: string): string[] {
  switch (status) {
    case 'good': return ['Stay hydrated', 'Normal activity acceptable'];
    case 'moderate': return ['Ascend gradually', 'Hydrate and avoid alcohol on arrival'];
    case 'poor': return ['Acclimatize 1–2 days', 'Avoid rapid ascent', 'Consider acetazolamide if advised'];
    default: return ['Follow acclimatization guidance'];
  }
}

function getOutbreaksExplanation(status: string): string {
  switch (status) {
    case 'good': return 'No significant outbreaks reported.';
    case 'moderate': return 'Localized outbreaks present. Follow public health guidance.';
    case 'poor': return 'Widespread outbreaks. Heightened precautions recommended.';
    default: return 'Outbreak status is being monitored.';
  }
}
function getOutbreaksHealthImpacts(status: string): string[] {
  switch (status) {
    case 'moderate': return ['Elevated infection risk in specific areas'];
    case 'poor': return ['High infection risk', 'Potential healthcare strain'];
    default: return [];
  }
}
function getOutbreaksRecommendations(status: string): string[] {
  switch (status) {
    case 'good': return ['Keep routine vaccinations up to date'];
    case 'moderate': return ['Practice hand hygiene', 'Avoid crowded indoor spaces', 'Use masks where advised'];
    case 'poor': return ['Consider postponing non-essential travel', 'Strict hygiene and masking', 'Follow local advisories'];
    default: return ['Follow health authority guidance'];
  }
}

export interface MetricDetails {
  description: string;
  normalRange?: string;
  optimalRange?: string;
  whatItMeans: string;
  healthImpacts: string[];
  recommendations: string[];
  riskFactors: string[];
}

export function getMetricDetails(metricId: string, status: string): MetricDetails {
  const mappedId = metricId === 'water_safety' ? 'water_quality' : metricId;

  const details: Record<string, MetricDetails> = {
    air_quality: {
      description: 'Air Quality Index (AQI) measures the concentration of pollutants in the air, including particulate matter, ozone, nitrogen dioxide, and sulfur dioxide.',
      normalRange: '0-50 (Good) • 51-100 (Moderate) • 101-150 (Unhealthy for Sensitive) • 151-200 (Unhealthy) • 201+ (Hazardous)',
      optimalRange: '0-25 (Excellent) - Perfect for outdoor activities',
      whatItMeans: getAirQualityExplanation(status),
      healthImpacts: getAirQualityHealthImpacts(status),
      recommendations: getAirQualityRecommendations(status),
      riskFactors: ['Outdoor exercise during high pollution', 'Living near busy roads or industrial areas', 'Pre-existing respiratory conditions', 'Age (children and elderly more vulnerable)', 'Smoking or secondhand smoke exposure'],
    },
    pollen: {
      description: 'Pollen count measures the concentration of pollen grains in the air. Different types of pollen (tree, grass, weed) can trigger allergic reactions.',
      normalRange: '0-9 (Low) • 10-49 (Moderate) • 50-149 (High) • 150+ (Very High)',
      optimalRange: '0-4 (Very Low) - Minimal allergy risk',
      whatItMeans: getPollenExplanation(status),
      healthImpacts: getPollenHealthImpacts(status),
      recommendations: getPollenRecommendations(status),
      riskFactors: ['Seasonal allergies (hay fever)', 'Asthma or respiratory conditions', 'Outdoor activities during peak pollen times', 'Living in areas with high vegetation', 'Family history of allergies'],
    },
    water_quality: {
      description: 'Water quality measures the safety and cleanliness of local water sources, including chemical contaminants, bacteria, and mineral content.',
      whatItMeans: getWaterQualityExplanation(status),
      healthImpacts: getWaterQualityHealthImpacts(status),
      recommendations: getWaterQualityRecommendations(status),
      riskFactors: ['Drinking untreated water', 'Traveling to areas with poor sanitation', 'Compromised immune system', 'Pregnancy or young children', 'Local water treatment issues'],
    },
    uv_index: {
      description: 'UV Index reflects the strength of sunburn-producing ultraviolet radiation.',
      normalRange: '0-2 (Low) • 3-5 (Moderate) • 6-7 (High) • 8-10 (Very High) • 11+ (Extreme)',
      optimalRange: '0-2 (Low) - Minimal protection needed',
      whatItMeans: getUVExplanation(status),
      healthImpacts: getUVHealthImpacts(status),
      recommendations: getUVRecommendations(status),
      riskFactors: ['Fair skin or photosensitive conditions', 'Midday outdoor exposure', 'High altitude or equatorial regions', 'Reflective surfaces (snow/water)'],
    },
    food_safety: {
      description: 'Food safety risk reflects local hygiene, preparation practices, and contamination risk.',
      normalRange: '70-100 (Good) • 40-69 (Moderate) • 0-39 (Poor)',
      optimalRange: '≥80 (Good) - Low risk with basic precautions',
      whatItMeans: getFoodSafetyExplanation(status),
      healthImpacts: getFoodSafetyHealthImpacts(status),
      recommendations: getFoodSafetyRecommendations(status),
      riskFactors: ['Raw/undercooked foods', 'Unboiled/untreated water', 'Poor hand hygiene', 'Cross-contamination in street markets'],
    },
    altitude: {
      description: 'Altitude can reduce oxygen availability and affect sleep and exercise tolerance.',
      normalRange: '<1500m (Low) • 1500–2500m (Moderate) • 2500–3500m (High) • 3500–5500m (Very High) • >5500m (Extreme)',
      optimalRange: '<1500m - Minimal physiological impact',
      whatItMeans: getAltitudeExplanation(status),
      healthImpacts: getAltitudeHealthImpacts(status),
      recommendations: getAltitudeRecommendations(status),
      riskFactors: ['Rapid ascent', 'History of altitude illness', 'Strenuous exertion on arrival', 'Dehydration'],
    },
    outbreaks: {
      description: 'Summarizes notable infectious disease activity reported locally.',
      normalRange: '0-19 (None) • 20-39 (Low) • 40-59 (Moderate) • 60-79 (High) • 80-100 (Severe)',
      optimalRange: '0-19 (None) - Routine precautions only',
      whatItMeans: getOutbreaksExplanation(status),
      healthImpacts: getOutbreaksHealthImpacts(status),
      recommendations: getOutbreaksRecommendations(status),
      riskFactors: ['Crowded indoor settings', 'Limited healthcare capacity', 'Low vaccination coverage', 'Travel during peak transmission seasons'],
    },
  };

  return details[mappedId] ?? {
    description: 'This metric provides important travel health context.',
    whatItMeans: 'Monitor this metric for potential health impacts.',
    healthImpacts: [],
    recommendations: ['Stay informed about local conditions', 'Take appropriate precautions'],
    riskFactors: [],
  };
}

export function getCountryFromCity(city: string): string {
  const cityCountryMap: Record<string, string> = {
    'Tokyo': 'Japan', 'Paris': 'France', 'New York': 'USA', 'London': 'UK',
    'Sydney': 'Australia', 'Bangkok': 'Thailand', 'Singapore': 'Singapore',
    'Dubai': 'UAE', 'Hong Kong': 'Hong Kong', 'Barcelona': 'Spain',
    'Rome': 'Italy', 'Amsterdam': 'Netherlands', 'Vienna': 'Austria',
    'Prague': 'Czech Republic', 'Budapest': 'Hungary', 'Copenhagen': 'Denmark',
    'Stockholm': 'Sweden', 'Oslo': 'Norway', 'Helsinki': 'Finland',
    'Reykjavik': 'Iceland', 'San Francisco': 'USA', 'Los Angeles': 'USA',
    'Chicago': 'USA', 'Miami': 'USA', 'Seattle': 'USA', 'Boston': 'USA',
    'Berlin': 'Germany', 'Munich': 'Germany', 'Toronto': 'Canada',
    'Vancouver': 'Canada', 'Montreal': 'Canada', 'Seoul': 'South Korea',
    'Shanghai': 'China', 'Beijing': 'China', 'Mumbai': 'India',
    'Delhi': 'India', 'Mexico City': 'Mexico', 'São Paulo': 'Brazil',
    'Rio de Janeiro': 'Brazil', 'Buenos Aires': 'Argentina',
    'Lisbon': 'Portugal', 'Dublin': 'Ireland', 'Zurich': 'Switzerland',
    'Brussels': 'Belgium', 'Warsaw': 'Poland', 'Athens': 'Greece',
    'Istanbul': 'Turkey', 'Cairo': 'Egypt', 'Cape Town': 'South Africa',
    'Nairobi': 'Kenya', 'Lagos': 'Nigeria', 'Marrakech': 'Morocco',
    'Current Location': 'Your Location',
  };
  if (cityCountryMap[city]) return cityCountryMap[city];
  const partialMatch = Object.keys(cityCountryMap).find(
    k => city.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(city.toLowerCase())
  );
  return partialMatch ? cityCountryMap[partialMatch] : 'Unknown';
}

export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    'Japan': '🇯🇵', 'France': '🇫🇷', 'USA': '🇺🇸', 'United States': '🇺🇸', 'UK': '🇬🇧', 'United Kingdom': '🇬🇧',
    'Australia': '🇦🇺', 'Thailand': '🇹🇭', 'Singapore': '🇸🇬', 'UAE': '🇦🇪',
    'Hong Kong': '🇭🇰', 'Spain': '🇪🇸', 'Italy': '🇮🇹', 'Netherlands': '🇳🇱',
    'Austria': '🇦🇹', 'Czech Republic': '🇨🇿', 'Hungary': '🇭🇺', 'Denmark': '🇩🇰',
    'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Finland': '🇫🇮', 'Iceland': '🇮🇸',
    'Germany': '🇩🇪', 'Canada': '🇨🇦', 'South Korea': '🇰🇷', 'China': '🇨🇳',
    'India': '🇮🇳', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷', 'Argentina': '🇦🇷',
    'Portugal': '🇵🇹', 'Ireland': '🇮🇪', 'Switzerland': '🇨🇭', 'Belgium': '🇧🇪',
    'Poland': '🇵🇱', 'Greece': '🇬🇷', 'Turkey': '🇹🇷', 'Egypt': '🇪🇬',
    'South Africa': '🇿🇦', 'Kenya': '🇰🇪', 'Nigeria': '🇳🇬', 'Morocco': '🇲🇦',
    'Your Location': '📍', 'Unknown': '🌍',
  };
  return flags[country] ?? '🌍';
}

export const AIRLINE_CODES: Record<string, string> = {
  'QR': 'Qatar Airways', 'AA': 'American Airlines', 'DL': 'Delta Air Lines',
  'UA': 'United Airlines', 'BA': 'British Airways', 'AF': 'Air France',
  'LH': 'Lufthansa', 'EK': 'Emirates', 'SQ': 'Singapore Airlines',
  'CX': 'Cathay Pacific', 'JL': 'Japan Airlines', 'NH': 'All Nippon Airways',
  'QF': 'Qantas', 'VS': 'Virgin Atlantic', 'KL': 'KLM', 'IB': 'Iberia',
  'LX': 'Swiss International Air Lines', 'OS': 'Austrian Airlines',
  'SN': 'Brussels Airlines', 'TK': 'Turkish Airlines', 'EY': 'Etihad Airways',
  'NZ': 'Air New Zealand', 'AC': 'Air Canada', 'WS': 'WestJet',
  'AS': 'Alaska Airlines', 'B6': 'JetBlue Airways', 'WN': 'Southwest Airlines',
  'F9': 'Frontier Airlines', 'NK': 'Spirit Airlines',
};

export const GENERAL_MEDS: Array<{ name: string; note: string }> = [
  { name: 'Antihistamines', note: 'Recommended for allergies' },
  { name: 'Antacids', note: 'Recommended for heartburn' },
  { name: 'First Aid', note: 'Recommended for minor cuts' },
  { name: 'ORS', note: 'Recommended for food poisoning' },
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
  { animKey: 'aq', metricId: 'air_quality', label: 'Air Quality', value: 'Moderate', status: 'moderate', icon: 'cloud-outline', scoreLabel: 'Air Quality' },
  { animKey: 'water', metricId: 'water_quality', label: 'Water Safety', value: 'Safe', status: 'good', icon: 'water-outline', scoreLabel: 'Water Safety' },
  { animKey: 'uv', metricId: 'uv_index', label: 'UV Index', value: 'Moderate', status: 'moderate', icon: 'sunny', scoreLabel: 'UV Index' },
  { animKey: 'food', metricId: 'food_safety', label: 'Food Safety', value: 'Good', status: 'good', icon: 'restaurant', scoreLabel: 'Food Safety' },
  { animKey: 'pollen', metricId: 'pollen', label: 'Pollen', value: 'High', status: 'moderate', icon: 'flower-outline', scoreLabel: 'Pollen Level' },
  { animKey: 'altitude', metricId: 'altitude', label: 'Altitude', value: 'Low', status: 'good', icon: 'trending-up-outline', scoreLabel: 'Altitude' },
  { animKey: 'outbreaks', metricId: 'outbreaks', label: 'Disease Outbreaks', value: 'None', status: 'good', icon: 'bug-outline', scoreLabel: 'Disease Outbreaks' },
];
