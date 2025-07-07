import { ActivitySafetyData, WeatherData, AirQualityData } from '../types';
import { ExtremeHeatWarning } from './weatherService';

// Activity safety thresholds
const SAFE_TEMPERATURE_MAX = 30; // Celsius
const CAUTION_TEMPERATURE_MAX = 35; // Celsius
const SAFE_AQI_MAX = 50;
const MODERATE_AQI_MAX = 100;
const UNHEALTHY_AQI_MAX = 150;

/**
 * Generate comprehensive activity safety recommendations
 */
export const generateActivitySafetyData = (
  weatherData: WeatherData,
  airQualityData: AirQualityData | null,
  heatWarning: ExtremeHeatWarning | null,
  uvIndex: number = 5
): ActivitySafetyData => {
  
  // Assess individual factors
  const weatherSafety = assessWeatherSafety(weatherData, uvIndex);
  const airQualitySafety = assessAirQualitySafety(airQualityData);
  const heatSafety = assessHeatSafety(heatWarning);

  // Combine assessments
  const combinedRisk = calculateCombinedActivityRisk(weatherSafety, airQualitySafety, heatSafety);
  const outdoorSafety = determineOverallSafety(combinedRisk);
  
  // Generate recommendations and warnings
  const recommendations = generateActivityRecommendations(
    weatherData,
    airQualityData,
    heatWarning,
    combinedRisk,
    outdoorSafety
  );
  
  const warnings = generateActivityWarnings(
    weatherData,
    airQualityData,
    heatWarning,
    combinedRisk
  );

  // Determine best times for outdoor activities
  const bestTimes = determineBestActivityTimes(weatherData, heatWarning, uvIndex);

  return {
    outdoorSafety,
    bestTimes,
    recommendations,
    warnings,
    airQualityImpact: airQualitySafety.description,
    weatherImpact: weatherSafety.description,
    combinedRisk,
  };
};

/**
 * Assess weather safety for outdoor activities
 */
const assessWeatherSafety = (
  weatherData: WeatherData,
  uvIndex: number
): { risk: number; description: string } => {
  let riskScore = 0;
  let factors: string[] = [];

  // Temperature assessment
  if (weatherData.temperature > 40) {
    riskScore += 4;
    factors.push('extreme heat');
  } else if (weatherData.temperature > 35) {
    riskScore += 3;
    factors.push('very hot');
  } else if (weatherData.temperature > 30) {
    riskScore += 2;
    factors.push('hot weather');
  } else if (weatherData.temperature < 0) {
    riskScore += 2;
    factors.push('freezing conditions');
  }

  // Humidity assessment
  if (weatherData.humidity > 85) {
    riskScore += 2;
    factors.push('very high humidity');
  } else if (weatherData.humidity < 20) {
    riskScore += 1;
    factors.push('very dry air');
  }

  // Wind assessment
  if (weatherData.windSpeed > 20) {
    riskScore += 2;
    factors.push('strong winds');
  } else if (weatherData.windSpeed > 15) {
    riskScore += 1;
    factors.push('moderate winds');
  }

  // UV assessment
  if (uvIndex >= 11) {
    riskScore += 3;
    factors.push('extreme UV');
  } else if (uvIndex >= 8) {
    riskScore += 2;
    factors.push('very high UV');
  } else if (uvIndex >= 6) {
    riskScore += 1;
    factors.push('high UV');
  }

  // Visibility assessment
  if (weatherData.visibility < 1000) {
    riskScore += 3;
    factors.push('poor visibility');
  } else if (weatherData.visibility < 5000) {
    riskScore += 1;
    factors.push('reduced visibility');
  }

  const description = factors.length > 0 
    ? `Weather concerns: ${factors.join(', ')}` 
    : 'Weather conditions are favorable';

  return { risk: riskScore, description };
};

/**
 * Assess air quality safety for outdoor activities
 */
const assessAirQualitySafety = (
  airQualityData: AirQualityData | null
): { risk: number; description: string } => {
  if (!airQualityData) {
    return { risk: 1, description: 'Air quality data unavailable' };
  }

  const aqi = airQualityData.overall.aqi;
  let riskScore = 0;
  let description = '';

  if (aqi <= SAFE_AQI_MAX) {
    riskScore = 0;
    description = 'Good air quality';
  } else if (aqi <= MODERATE_AQI_MAX) {
    riskScore = 1;
    description = 'Moderate air quality - sensitive individuals should limit prolonged outdoor exertion';
  } else if (aqi <= UNHEALTHY_AQI_MAX) {
    riskScore = 3;
    description = 'Unhealthy for sensitive groups - limit outdoor activities';
  } else if (aqi <= 200) {
    riskScore = 4;
    description = 'Unhealthy air quality - avoid outdoor activities';
  } else {
    riskScore = 5;
    description = 'Very unhealthy air quality - avoid all outdoor exposure';
  }

  // Add specific pollutant warnings
  const pollutantWarnings: string[] = [];
  if (airQualityData.pm2_5?.level === 'Very High') pollutantWarnings.push('PM2.5');
  if (airQualityData.pm10?.level === 'Very High') pollutantWarnings.push('PM10');
  if (airQualityData.no2?.level === 'Very High') pollutantWarnings.push('NO2');
  if (airQualityData.o3?.level === 'Very High') pollutantWarnings.push('Ozone');

  if (pollutantWarnings.length > 0) {
    description += ` (High: ${pollutantWarnings.join(', ')})`;
  }

  return { risk: riskScore, description };
};

/**
 * Assess heat safety for outdoor activities
 */
const assessHeatSafety = (
  heatWarning: ExtremeHeatWarning | null
): { risk: number; description: string } => {
  if (!heatWarning || !heatWarning.isActive) {
    return { risk: 0, description: 'No heat warnings' };
  }

  let riskScore = 0;
  let description = '';

  switch (heatWarning.severity) {
    case 'extreme':
      riskScore = 5;
      description = 'Extreme heat warning - dangerous conditions';
      break;
    case 'high':
      riskScore = 3;
      description = 'High heat warning - exercise caution';
      break;
    case 'moderate':
      riskScore = 2;
      description = 'Moderate heat warning - take precautions';
      break;
  }

  return { risk: riskScore, description };
};

/**
 * Calculate combined activity risk score
 */
const calculateCombinedActivityRisk = (
  weatherSafety: { risk: number },
  airQualitySafety: { risk: number },
  heatSafety: { risk: number }
): 'low' | 'moderate' | 'high' | 'severe' => {
  const totalRisk = weatherSafety.risk + airQualitySafety.risk + heatSafety.risk;

  if (totalRisk >= 10) return 'severe';
  if (totalRisk >= 7) return 'high';
  if (totalRisk >= 4) return 'moderate';
  return 'low';
};

/**
 * Determine overall outdoor safety level
 */
const determineOverallSafety = (
  combinedRisk: 'low' | 'moderate' | 'high' | 'severe'
): 'safe' | 'caution' | 'avoid' => {
  switch (combinedRisk) {
    case 'low':
      return 'safe';
    case 'moderate':
      return 'caution';
    case 'high':
    case 'severe':
      return 'avoid';
  }
};

/**
 * Generate activity-specific recommendations
 */
const generateActivityRecommendations = (
  weatherData: WeatherData,
  airQualityData: AirQualityData | null,
  heatWarning: ExtremeHeatWarning | null,
  combinedRisk: 'low' | 'moderate' | 'high' | 'severe',
  outdoorSafety: 'safe' | 'caution' | 'avoid'
): string[] => {
  const recommendations: string[] = [];

  // General recommendations based on safety level
  switch (outdoorSafety) {
    case 'safe':
      recommendations.push('Outdoor activities are generally safe');
      recommendations.push('Stay hydrated and apply sunscreen');
      break;
    case 'caution':
      recommendations.push('Exercise caution during outdoor activities');
      recommendations.push('Take frequent breaks and stay hydrated');
      recommendations.push('Monitor your body for signs of distress');
      break;
    case 'avoid':
      recommendations.push('Avoid prolonged outdoor activities');
      recommendations.push('Consider indoor alternatives');
      recommendations.push('If outdoors is necessary, limit exposure time');
      break;
  }

  // Weather-specific recommendations
  if (weatherData.temperature > 35) {
    recommendations.push('Seek air-conditioned environments');
    recommendations.push('Wear lightweight, light-colored clothing');
  } else if (weatherData.temperature > 30) {
    recommendations.push('Schedule activities for cooler parts of the day');
    recommendations.push('Wear breathable clothing and a hat');
  }

  if (weatherData.humidity > 80) {
    recommendations.push('Allow extra time for cooling down');
    recommendations.push('Be aware that sweating may be less effective');
  }

  // Air quality recommendations
  if (airQualityData && airQualityData.overall.aqi > MODERATE_AQI_MAX) {
    recommendations.push('Wear an N95 mask if outdoors');
    recommendations.push('Avoid strenuous outdoor exercise');
    recommendations.push('Keep windows closed and use air purifiers indoors');
  }

  // Heat warning recommendations
  if (heatWarning?.isActive) {
    recommendations.push(...heatWarning.recommendations);
  }

  // Activity-specific guidance
  if (combinedRisk === 'low') {
    recommendations.push('Running, cycling, and sports are appropriate');
    recommendations.push('Consider extending outdoor workout duration');
  } else if (combinedRisk === 'moderate') {
    recommendations.push('Light to moderate exercise is acceptable');
    recommendations.push('Reduce intensity and duration of workouts');
  } else {
    recommendations.push('Stick to gentle activities like walking');
    recommendations.push('Consider yoga or stretching indoors');
  }

  return recommendations;
};

/**
 * Generate activity warnings
 */
const generateActivityWarnings = (
  weatherData: WeatherData,
  airQualityData: AirQualityData | null,
  heatWarning: ExtremeHeatWarning | null,
  combinedRisk: 'low' | 'moderate' | 'high' | 'severe'
): string[] => {
  const warnings: string[] = [];

  // Risk-based warnings
  if (combinedRisk === 'severe') {
    warnings.push('DANGER: Severe health risk for outdoor activities');
  } else if (combinedRisk === 'high') {
    warnings.push('HIGH RISK: Outdoor exercise not recommended');
  } else if (combinedRisk === 'moderate') {
    warnings.push('CAUTION: Monitor your health during outdoor activities');
  }

  // Weather warnings
  if (weatherData.temperature > 40) {
    warnings.push('Extreme heat - heat stroke risk');
  } else if (weatherData.temperature > 35) {
    warnings.push('Very hot conditions - heat exhaustion possible');
  }

  // Air quality warnings
  if (airQualityData) {
    const aqi = airQualityData.overall.aqi;
    if (aqi > 200) {
      warnings.push('Very unhealthy air quality - respiratory distress possible');
    } else if (aqi > UNHEALTHY_AQI_MAX) {
      warnings.push('Unhealthy air quality - breathing difficulties may occur');
    }
  }

  // Heat warning alerts
  if (heatWarning?.isActive) {
    warnings.push(...heatWarning.warnings);
  }

  return warnings;
};

/**
 * Determine best times for outdoor activities
 */
const determineBestActivityTimes = (
  weatherData: WeatherData,
  heatWarning: ExtremeHeatWarning | null,
  uvIndex: number
): string[] => {
  const bestTimes: string[] = [];

  // If extreme heat, very limited safe times
  if (heatWarning?.severity === 'extreme') {
    bestTimes.push('Early morning (before 7 AM) if absolutely necessary');
    bestTimes.push('Late evening (after 8 PM) with caution');
    return bestTimes;
  }

  // If hot weather
  if (weatherData.temperature > 30) {
    bestTimes.push('Early morning (6-8 AM)');
    bestTimes.push('Late evening (after 7 PM)');
    if (weatherData.temperature < 35) {
      bestTimes.push('Early evening (6-7 PM) with precautions');
    }
  } else {
    // Moderate temperatures
    bestTimes.push('Morning (7-10 AM)');
    bestTimes.push('Late afternoon (4-6 PM)');
    bestTimes.push('Early evening (6-8 PM)');
  }

  // UV considerations
  if (uvIndex >= 8) {
    bestTimes.push('Avoid midday sun (10 AM - 4 PM)');
  } else if (uvIndex >= 6) {
    bestTimes.push('Limit midday exposure (11 AM - 3 PM)');
  }

  // If no restrictions
  if (weatherData.temperature <= 25 && uvIndex < 6) {
    bestTimes.push('Most daylight hours are suitable');
  }

  return bestTimes;
};

/**
 * Get activity safety color for UI
 */
export const getActivitySafetyColor = (
  outdoorSafety: 'safe' | 'caution' | 'avoid'
): string => {
  switch (outdoorSafety) {
    case 'safe':
      return '#30D158'; // Green
    case 'caution':
      return '#FF9500'; // Orange
    case 'avoid':
      return '#FF3B30'; // Red
    default:
      return '#666';
  }
};

/**
 * Get activity recommendations for specific sports
 */
export const getActivitySpecificRecommendations = (
  activityType: 'running' | 'cycling' | 'hiking' | 'sports' | 'walking',
  safetyData: ActivitySafetyData
): string[] => {
  const baseRecommendations = [...safetyData.recommendations];
  
  switch (activityType) {
    case 'running':
      if (safetyData.outdoorSafety === 'avoid') {
        baseRecommendations.push('Consider treadmill running indoors');
      } else {
        baseRecommendations.push('Run at a conversational pace');
        baseRecommendations.push('Carry water for runs longer than 30 minutes');
      }
      break;
      
    case 'cycling':
      if (safetyData.outdoorSafety === 'avoid') {
        baseRecommendations.push('Use indoor bike trainer or stationary bike');
      } else {
        baseRecommendations.push('Wear a helmet and protective gear');
        baseRecommendations.push('Be extra cautious of visibility in poor air quality');
      }
      break;
      
    case 'hiking':
      if (safetyData.outdoorSafety === 'avoid') {
        baseRecommendations.push('Postpone hiking plans');
      } else {
        baseRecommendations.push('Inform someone of your hiking plans');
        baseRecommendations.push('Carry extra water and emergency supplies');
      }
      break;
      
    case 'sports':
      if (safetyData.outdoorSafety === 'avoid') {
        baseRecommendations.push('Move sports activities indoors if possible');
      } else {
        baseRecommendations.push('Take frequent water breaks');
        baseRecommendations.push('Watch teammates for signs of heat exhaustion');
      }
      break;
      
    case 'walking':
      baseRecommendations.push('Walking is generally the safest outdoor activity');
      if (safetyData.outdoorSafety === 'avoid') {
        baseRecommendations.push('Limit walks to essential trips only');
      }
      break;
  }
  
  return baseRecommendations;
}; 