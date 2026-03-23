import { HydrationRecommendation, WeatherData } from '../types';

// Hydration calculation constants
const BASE_DAILY_INTAKE = 2.5; // Base daily water intake in liters for average adult
const TEMPERATURE_THRESHOLD = 25; // Celsius - above this, increase intake
const HIGH_ALTITUDE_THRESHOLD = 2000; // meters - above this, increase intake
const HIGH_HUMIDITY_THRESHOLD = 70; // percentage - affects sweat evaporation

/**
 * Calculate personalized hydration recommendations based on climate and conditions
 */
export const calculateHydrationRecommendation = (
  weatherData: WeatherData,
  altitude: number = 0,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense' = 'light',
  bodyWeight: number = 70 // kg - default average
): HydrationRecommendation => {
  
  // Base intake calculation (35ml per kg of body weight)
  let baseDailyIntake = (bodyWeight * 35) / 1000; // Convert to liters
  
  // Climate adjustments
  let temperatureAdjustment = 0;
  let altitudeAdjustment = 0;
  let humidityAdjustment = 0;
  let activityAdjustment = 0;

  // Temperature adjustment
  if (weatherData.temperature > TEMPERATURE_THRESHOLD) {
    const tempDiff = weatherData.temperature - TEMPERATURE_THRESHOLD;
    // Increase by 150ml per degree above 25°C
    temperatureAdjustment = tempDiff * 150;
  }

  // Extreme heat additional adjustment
  if (weatherData.temperature > 35) {
    temperatureAdjustment += 500; // Additional 500ml for extreme heat
  }

  // Altitude adjustment
  if (altitude > HIGH_ALTITUDE_THRESHOLD) {
    const altitudeDiff = altitude - HIGH_ALTITUDE_THRESHOLD;
    // Increase by 100ml per 500m above 2000m
    altitudeAdjustment = Math.floor(altitudeDiff / 500) * 100;
  }

  // Humidity adjustment
  if (weatherData.humidity > HIGH_HUMIDITY_THRESHOLD) {
    // High humidity reduces sweat evaporation, but still need extra hydration
    humidityAdjustment = 200;
  } else if (weatherData.humidity < 30) {
    // Low humidity increases water loss
    humidityAdjustment = 300;
  }

  // Activity level adjustment
  switch (activityLevel) {
    case 'sedentary':
      activityAdjustment = 0;
      break;
    case 'light':
      activityAdjustment = 250;
      break;
    case 'moderate':
      activityAdjustment = 500;
      break;
    case 'intense':
      activityAdjustment = 1000;
      break;
  }

  // Calculate total daily intake
  const totalAdjustment = (temperatureAdjustment + altitudeAdjustment + humidityAdjustment + activityAdjustment) / 1000;
  const dailyIntake = baseDailyIntake + totalAdjustment;
  
  // Calculate hourly intake (assuming 16 waking hours)
  const hourlyIntake = Math.round((dailyIntake * 1000) / 16);

  // Assess dehydration risk
  const dehydrationRisk = assessDehydrationRisk(weatherData, altitude, activityLevel);

  // Generate warnings and recommendations
  const { warnings, recommendations } = generateHydrationGuidance(
    weatherData,
    altitude,
    dehydrationRisk,
    dailyIntake
  );

  return {
    dailyIntake: Math.round(dailyIntake * 10) / 10, // Round to 1 decimal
    hourlyIntake,
    adjustments: {
      temperature: temperatureAdjustment,
      altitude: altitudeAdjustment,
      humidity: humidityAdjustment,
      activity: activityAdjustment,
    },
    warnings,
    recommendations,
    dehydrationRisk,
  };
};

/**
 * Assess dehydration risk based on environmental conditions
 */
export const assessDehydrationRisk = (
  weatherData: WeatherData,
  altitude: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense'
): 'low' | 'moderate' | 'high' | 'severe' => {
  let riskScore = 0;

  // Temperature risk
  if (weatherData.temperature > 40) riskScore += 4;
  else if (weatherData.temperature > 35) riskScore += 3;
  else if (weatherData.temperature > 30) riskScore += 2;
  else if (weatherData.temperature > 25) riskScore += 1;

  // Humidity risk
  if (weatherData.humidity < 20) riskScore += 3; // Very dry
  else if (weatherData.humidity < 30) riskScore += 2; // Dry
  else if (weatherData.humidity > 80) riskScore += 1; // Very humid

  // Altitude risk
  if (altitude > 4000) riskScore += 3;
  else if (altitude > 3000) riskScore += 2;
  else if (altitude > 2000) riskScore += 1;

  // Activity risk
  switch (activityLevel) {
    case 'intense': riskScore += 3; break;
    case 'moderate': riskScore += 2; break;
    case 'light': riskScore += 1; break;
    case 'sedentary': riskScore += 0; break;
  }

  // Wind speed can increase dehydration
  if (weatherData.windSpeed > 15) riskScore += 1;

  // Determine risk level
  if (riskScore >= 8) return 'severe';
  if (riskScore >= 6) return 'high';
  if (riskScore >= 4) return 'moderate';
  return 'low';
};

/**
 * Generate hydration warnings and recommendations
 */
export const generateHydrationGuidance = (
  weatherData: WeatherData,
  altitude: number,
  dehydrationRisk: 'low' | 'moderate' | 'high' | 'severe',
  dailyIntake: number
): { warnings: string[]; recommendations: string[] } => {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Risk-based warnings
  switch (dehydrationRisk) {
    case 'severe':
      warnings.push('CRITICAL: Extreme dehydration risk');
      warnings.push('Heat exhaustion and heat stroke danger');
      recommendations.push('Drink water every 15 minutes');
      recommendations.push('Seek air-conditioned shelter immediately');
      recommendations.push('Monitor for dehydration symptoms');
      break;
    case 'high':
      warnings.push('HIGH RISK: Rapid dehydration possible');
      recommendations.push('Drink water every 20-30 minutes');
      recommendations.push('Avoid prolonged sun exposure');
      recommendations.push('Take frequent breaks in shade');
      break;
    case 'moderate':
      warnings.push('Increased dehydration risk');
      recommendations.push('Drink water every 30-45 minutes');
      recommendations.push('Monitor urine color for hydration status');
      break;
    case 'low':
      recommendations.push('Maintain regular water intake');
      recommendations.push('Drink when thirsty');
      break;
  }

  // Temperature-specific guidance
  if (weatherData.temperature > 35) {
    warnings.push('Extreme heat detected');
    recommendations.push('Pre-hydrate before going outside');
    recommendations.push('Choose electrolyte drinks for extended exposure');
  } else if (weatherData.temperature > 30) {
    recommendations.push('Increase water intake in hot weather');
    recommendations.push('Avoid alcohol and caffeine');
  }

  // Altitude-specific guidance
  if (altitude > 3000) {
    warnings.push('High altitude increases fluid loss');
    recommendations.push('Increase water intake by 1.5-2 liters daily');
    recommendations.push('Monitor for altitude sickness symptoms');
  } else if (altitude > 2000) {
    recommendations.push('Moderate altitude requires extra hydration');
    recommendations.push('Drink water regularly throughout the day');
  }

  // Humidity-specific guidance
  if (weatherData.humidity < 30) {
    recommendations.push('Dry air increases water loss through breathing');
    recommendations.push('Use a humidifier indoors if possible');
  } else if (weatherData.humidity > 80) {
    recommendations.push('High humidity reduces cooling efficiency');
    recommendations.push('Take extra breaks to cool down');
  }

  // General recommendations
  recommendations.push(`Target: ${dailyIntake.toFixed(1)} liters daily`);
  recommendations.push('Monitor urine color: pale yellow indicates good hydration');
  recommendations.push('Signs of dehydration: thirst, dry mouth, fatigue, dizziness');

  return { warnings, recommendations };
};

/**
 * Calculate hydration reminder intervals based on conditions
 */
export const calculateReminderInterval = (
  dehydrationRisk: 'low' | 'moderate' | 'high' | 'severe',
  temperature: number
): number => {
  // Return interval in minutes
  switch (dehydrationRisk) {
    case 'severe':
      return 15;
    case 'high':
      return 20;
    case 'moderate':
      return 30;
    case 'low':
      return temperature > 30 ? 45 : 60;
    default:
      return 60;
  }
};

/**
 * Get hydration status color for UI
 */
export const getHydrationRiskColor = (risk: 'low' | 'moderate' | 'high' | 'severe'): string => {
  switch (risk) {
    case 'low':
      return '#30D158'; // Green
    case 'moderate':
      return '#FF9500'; // Orange
    case 'high':
      return '#FF5722'; // Red-orange
    case 'severe':
      return '#FF3B30'; // Red
    default:
      return '#666';
  }
};

/**
 * Generate water station search recommendations
 */
export const generateWaterStationRecommendations = (
  dehydrationRisk: 'low' | 'moderate' | 'high' | 'severe'
): string[] => {
  const recommendations = [
    'Look for water fountains in parks and public spaces',
    'Many restaurants will provide free water',
    'Carry a reusable water bottle',
  ];

  if (dehydrationRisk === 'high' || dehydrationRisk === 'severe') {
    recommendations.unshift('Find water sources IMMEDIATELY');
    recommendations.push('Consider purchasing bottled water');
    recommendations.push('Ask locals about nearest water sources');
  }

  if (dehydrationRisk === 'moderate' || dehydrationRisk === 'high') {
    recommendations.push('Download offline maps with water fountain locations');
    recommendations.push('Hotels and visitor centers usually have water access');
  }

  return recommendations;
}; 