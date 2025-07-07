import { API_CONFIG } from '../config/api';

// Weather data interfaces
export interface WeatherData {
  temperature: number; // Celsius
  feelsLike: number; // Celsius
  humidity: number; // Percentage
  pressure: number; // hPa
  windSpeed: number; // m/s
  windDirection: number; // degrees
  visibility: number; // meters
  cloudCover: number; // percentage
  description: string;
  icon: string;
}

export interface HeatIndexData {
  heatIndex: number; // Celsius
  heatIndexFahrenheit: number; // Fahrenheit
  dangerLevel: 'safe' | 'caution' | 'extreme_caution' | 'danger' | 'extreme_danger';
  warnings: string[];
  recommendations: string[];
}

export interface ExtremeHeatWarning {
  isActive: boolean;
  severity: 'moderate' | 'high' | 'extreme';
  temperature: number;
  heatIndex: number;
  uvIndex?: number;
  combinedRisk: 'low' | 'moderate' | 'high' | 'severe';
  warnings: string[];
  recommendations: string[];
  timeOfDay: 'morning' | 'midday' | 'afternoon' | 'evening';
}

export interface UVHeatCombination {
  combinedRisk: 'low' | 'moderate' | 'high' | 'severe';
  uvIndex: number;
  temperature: number;
  heatIndex: number;
  recommendations: string[];
  warnings: string[];
}

/**
 * Get current weather data from OpenWeatherMap
 */
export const getCurrentWeather = async (latitude: number, longitude: number): Promise<WeatherData | null> => {
  try {
    if (!API_CONFIG.OPENWEATHER_API_KEY) {
      console.warn('OpenWeather API key not found, cannot get weather data');
      return null;
    }

    const url = `${API_CONFIG.OPENWEATHER_BASE_URL}${API_CONFIG.WEATHER_ENDPOINT}?lat=${latitude}&lon=${longitude}&appid=${API_CONFIG.OPENWEATHER_API_KEY}&units=metric`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || 0,
      visibility: data.visibility || 10000,
      cloudCover: data.clouds?.all || 0,
      description: data.weather[0]?.description || 'Clear',
      icon: data.weather[0]?.icon || '01d',
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

/**
 * Get UV Index from OpenWeatherMap
 */
export const getUVIndex = async (latitude: number, longitude: number): Promise<number> => {
  try {
    if (!API_CONFIG.OPENWEATHER_API_KEY) {
      console.warn('OpenWeather API key not found, cannot get UV data');
      return 5; // Default moderate UV
    }

    const url = `${API_CONFIG.OPENWEATHER_BASE_URL}${API_CONFIG.UV_INDEX_ENDPOINT}?lat=${latitude}&lon=${longitude}&appid=${API_CONFIG.OPENWEATHER_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`UV API error: ${response.status}`);
    }

    const data = await response.json();
    return Math.round(data.value || 5);
  } catch (error) {
    console.error('Error fetching UV data:', error);
    return 5; // Default moderate UV
  }
};

/**
 * Calculate heat index using the National Weather Service formula
 * Returns heat index in Celsius
 */
export const calculateHeatIndex = (temperatureCelsius: number, humidityPercent: number): HeatIndexData => {
  // Convert to Fahrenheit for calculation (NWS formula uses Fahrenheit)
  const tempF = (temperatureCelsius * 9/5) + 32;
  const humidity = humidityPercent;

  let heatIndexF: number;

  // Simple formula for lower temperatures
  if (tempF < 80) {
    heatIndexF = tempF;
  } else {
    // Full heat index formula for higher temperatures
    const c1 = -42.379;
    const c2 = 2.04901523;
    const c3 = 10.14333127;
    const c4 = -0.22475541;
    const c5 = -0.00683783;
    const c6 = -0.05481717;
    const c7 = 0.00122874;
    const c8 = 0.00085282;
    const c9 = -0.00000199;

    heatIndexF = c1 + (c2 * tempF) + (c3 * humidity) + (c4 * tempF * humidity) +
                 (c5 * tempF * tempF) + (c6 * humidity * humidity) +
                 (c7 * tempF * tempF * humidity) + (c8 * tempF * humidity * humidity) +
                 (c9 * tempF * tempF * humidity * humidity);
  }

  // Convert back to Celsius
  const heatIndexC = (heatIndexF - 32) * 5/9;

  // Determine danger level
  let dangerLevel: HeatIndexData['dangerLevel'];
  let warnings: string[] = [];
  let recommendations: string[] = [];

  if (heatIndexF <= 80) {
    dangerLevel = 'safe';
    recommendations.push('Normal outdoor activities are safe');
  } else if (heatIndexF <= 90) {
    dangerLevel = 'caution';
    warnings.push('Prolonged exposure may cause fatigue');
    recommendations.push('Take breaks in shade', 'Stay hydrated');
  } else if (heatIndexF <= 105) {
    dangerLevel = 'extreme_caution';
    warnings.push('Heat exhaustion and heat cramps possible');
    recommendations.push('Limit outdoor activities', 'Frequent water breaks', 'Seek air conditioning');
  } else if (heatIndexF <= 130) {
    dangerLevel = 'danger';
    warnings.push('Heat exhaustion and heat stroke likely');
    recommendations.push('Avoid outdoor activities', 'Stay in air conditioning', 'Emergency preparedness');
  } else {
    dangerLevel = 'extreme_danger';
    warnings.push('Heat stroke imminent');
    recommendations.push('Avoid all outdoor exposure', 'Seek immediate shelter', 'Monitor for heat stroke symptoms');
  }

  return {
    heatIndex: Math.round(heatIndexC),
    heatIndexFahrenheit: Math.round(heatIndexF),
    dangerLevel,
    warnings,
    recommendations,
  };
};

/**
 * Generate extreme heat warning
 */
export const generateExtremeHeatWarning = (
  weatherData: WeatherData,
  uvIndex: number,
  timeOfDay: 'morning' | 'midday' | 'afternoon' | 'evening' = 'midday'
): ExtremeHeatWarning => {
  const heatIndexData = calculateHeatIndex(weatherData.temperature, weatherData.humidity);
  const temp = weatherData.temperature;
  
  // Determine if extreme heat warning is active
  const isActive = temp >= 35 || heatIndexData.heatIndex >= 35; // 35°C = 95°F
  
  // Determine severity
  let severity: ExtremeHeatWarning['severity'];
  if (temp >= 45 || heatIndexData.heatIndex >= 45) {
    severity = 'extreme';
  } else if (temp >= 40 || heatIndexData.heatIndex >= 40) {
    severity = 'high';
  } else {
    severity = 'moderate';
  }

  // Combine UV and heat risk
  const uvHeatCombination = calculateUVHeatCombination(uvIndex, temp, heatIndexData.heatIndex);

  // Time-specific warnings
  const timeWarnings: string[] = [];
  const timeRecommendations: string[] = [];

  if (timeOfDay === 'midday' || timeOfDay === 'afternoon') {
    timeWarnings.push('Peak heat and UV exposure period');
    timeRecommendations.push('Avoid outdoor activities between 10 AM - 4 PM');
  }

  return {
    isActive,
    severity,
    temperature: temp,
    heatIndex: heatIndexData.heatIndex,
    uvIndex,
    combinedRisk: uvHeatCombination.combinedRisk,
    warnings: [
      ...heatIndexData.warnings,
      ...uvHeatCombination.warnings,
      ...timeWarnings,
    ],
    recommendations: [
      ...heatIndexData.recommendations,
      ...uvHeatCombination.recommendations,
      ...timeRecommendations,
    ],
    timeOfDay,
  };
};

/**
 * Calculate combined UV and heat risk
 */
export const calculateUVHeatCombination = (
  uvIndex: number,
  temperature: number,
  heatIndex: number
): UVHeatCombination => {
  // Risk scoring system
  let riskScore = 0;

  // UV contribution
  if (uvIndex >= 11) riskScore += 4; // Extreme UV
  else if (uvIndex >= 8) riskScore += 3; // Very High UV
  else if (uvIndex >= 6) riskScore += 2; // High UV
  else if (uvIndex >= 3) riskScore += 1; // Moderate UV

  // Heat contribution
  if (heatIndex >= 45) riskScore += 4; // Extreme heat
  else if (heatIndex >= 40) riskScore += 3; // Very high heat
  else if (heatIndex >= 35) riskScore += 2; // High heat
  else if (heatIndex >= 30) riskScore += 1; // Moderate heat

  // Determine combined risk level
  let combinedRisk: UVHeatCombination['combinedRisk'];
  if (riskScore >= 7) combinedRisk = 'severe';
  else if (riskScore >= 5) combinedRisk = 'high';
  else if (riskScore >= 3) combinedRisk = 'moderate';
  else combinedRisk = 'low';

  // Generate recommendations based on combined risk
  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (combinedRisk === 'severe') {
    warnings.push('DANGEROUS: Extreme heat and UV combination');
    recommendations.push(
      'Stay indoors with air conditioning',
      'If outdoors: wear wide-brimmed hat, sunglasses, light clothing',
      'Apply SPF 30+ sunscreen every 30 minutes',
      'Drink water every 15-20 minutes'
    );
  } else if (combinedRisk === 'high') {
    warnings.push('High risk: Strong heat and UV exposure');
    recommendations.push(
      'Limit outdoor time to early morning or evening',
      'Wear protective clothing and SPF 30+ sunscreen',
      'Seek shade frequently',
      'Drink water every 30 minutes'
    );
  } else if (combinedRisk === 'moderate') {
    recommendations.push(
      'Wear sunscreen SPF 15+ and light clothing',
      'Take breaks in shade',
      'Stay hydrated'
    );
  }

  return {
    combinedRisk,
    uvIndex,
    temperature,
    heatIndex,
    recommendations,
    warnings,
  };
};

/**
 * Get time of day based on current hour
 */
export const getTimeOfDay = (): 'morning' | 'midday' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  return 'evening';
};

/**
 * Generate comprehensive weather health assessment
 */
export const generateWeatherHealthAssessment = async (
  latitude: number,
  longitude: number
): Promise<{
  weatherData: WeatherData | null;
  heatIndexData: HeatIndexData | null;
  extremeHeatWarning: ExtremeHeatWarning | null;
  uvHeatCombination: UVHeatCombination | null;
}> => {
  try {
    const [weatherData, uvIndex] = await Promise.all([
      getCurrentWeather(latitude, longitude),
      getUVIndex(latitude, longitude),
    ]);

    if (!weatherData) {
      return {
        weatherData: null,
        heatIndexData: null,
        extremeHeatWarning: null,
        uvHeatCombination: null,
      };
    }

    const heatIndexData = calculateHeatIndex(weatherData.temperature, weatherData.humidity);
    const timeOfDay = getTimeOfDay();
    const extremeHeatWarning = generateExtremeHeatWarning(weatherData, uvIndex, timeOfDay);
    const uvHeatCombination = calculateUVHeatCombination(uvIndex, weatherData.temperature, heatIndexData.heatIndex);

    return {
      weatherData,
      heatIndexData,
      extremeHeatWarning,
      uvHeatCombination,
    };
  } catch (error) {
    console.error('Error generating weather health assessment:', error);
    return {
      weatherData: null,
      heatIndexData: null,
      extremeHeatWarning: null,
      uvHeatCombination: null,
    };
  }
}; 