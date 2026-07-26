import {
  getGoogleAirQualityData,
  getGoogleAirQualityStatus,
  getGoogleAirQualityRecommendation,
  mapGoogleAqiToRiskLevel,
  getPollutantDetails,
} from '../services/travel/googleAirQualityService';
import {
  getGooglePollenData,
  getOverallPollenRiskLevel,
  getPollenStatus,
  getPollenRecommendations,
  getPollenBreakdown,
} from '../services/travel/googlePollenService';
import {
  getAllHealthcareFacilities,
  getEmergencyContacts,
  getClosestMedicalFacilities,
} from '../services/travel/healthcarePlacesService';
import {
  generateJetLagData,
  getCurrentDestinationTime
} from '../services/jetlag-brain/jetLagService';
import {
  generateWeatherHealthAssessment
} from '../services/travel/weatherService';
import {
  calculateHydrationRecommendation
} from '../services/user/hydrationService';
import {
  generateActivitySafetyData
} from '../services/travel/activitySafetyService';
import {
  getMultipleMedicationsAvailability,
  generateTravelMedicationKit
} from '../services/travel/medicationAvailabilityService';
import {
  getWaterQualityData,
  getWaterQualityStatus,
  getWaterQualityRecommendation,
  mapWaterQualityToRiskLevel,
  getWaterQualityIcon
} from '../services/travel/waterQualityService';
import {
  LocationData,
  TravelHealth,
  TravelApiErrors,
  RiskLevel,
  HealthMetric,
  HealthcareFacilities,
  JetLagData,
  TimeZoneInfo,
} from '../types';

// Maps full country names to the ISO codes the emergency-contacts lookup expects.
const COUNTRY_CODES: Record<string, string> = {
  France: 'FR',
  'United Kingdom': 'UK',
  Japan: 'JP',
  Australia: 'AU',
  Canada: 'CA',
  Germany: 'DE',
  'United States': 'US',
};

interface UpdateTravelHealthDataParams {
  locationData: LocationData;
  originTimezone: string | null;
  originLocation: string;
  settingsTimeFormat?: string;
  settingsSleepBedTime?: string;
  settingsSleepWakeTime?: string;
}

export async function updateTravelHealthData({
  locationData,
  originTimezone,
  originLocation,
  settingsTimeFormat,
  settingsSleepBedTime,
  settingsSleepWakeTime,
}: UpdateTravelHealthDataParams): Promise<TravelHealth> {
  const getRiskLevel = (value: number, thresholds: number[]): RiskLevel => {
    if (value <= thresholds[0]) return 'low';
    if (value <= thresholds[1]) return 'moderate';
    if (value <= thresholds[2]) return 'high';
    return 'severe';
  };

  // Track API errors
  const apiErrors: TravelApiErrors = {};

  // Fetch every independent location signal in parallel. This was a 6-call
  // serial await waterfall; latency is now bounded by the slowest call rather
  // than the sum of all. Each call keeps its own fallback + apiErrors entry.
  const { latitude: lat, longitude: lng } = locationData.coordinates;
  const [
    airQualityData,
    pollenData,
    waterQualityData,
    medical,
    weatherHealthAssessment,
    medicationAvailabilityData,
  ] = await Promise.all([
    getGoogleAirQualityData(lat, lng).catch(() => {
      apiErrors.airQuality = 'Google Air Quality API not enabled';
      return null;
    }),
    getGooglePollenData(lat, lng).catch(() => {
      apiErrors.pollen = 'Google Pollen API not enabled';
      return null;
    }),
    getWaterQualityData(lat, lng, locationData.name, locationData.country).catch((error) => {
      console.error('❌ Water Quality Service failed:', error);
      apiErrors.waterQuality = 'Failed to fetch water quality data';
      return null;
    }),
    (async () => {
      try {
        const closest = await getClosestMedicalFacilities(lat, lng, locationData.name);
        const all = await getAllHealthcareFacilities(lat, lng, 5000); // 5km radius
        return { closest, all };
      } catch (error) {
        console.error('Healthcare facilities API error:', error);
        apiErrors.healthcare = 'Failed to fetch healthcare facilities';
        return { closest: null, all: { hospitals: [], pharmacies: [], clinics: [], dentists: [], total: 0 } };
      }
    })(),
    generateWeatherHealthAssessment(lat, lng).catch((error) => {
      console.error('Weather API error:', error);
      apiErrors.weather = 'Failed to fetch weather data';
      return { weatherData: null, heatIndexData: null, extremeHeatWarning: null, uvHeatCombination: null };
    }),
    getMultipleMedicationsAvailability(
      ['ibuprofen', 'amoxicillin', 'lorazepam', 'insulin'],
      locationData.country,
      lat,
      lng,
    ).catch((error) => {
      console.error('Medication availability API error:', error);
      return [] as Awaited<ReturnType<typeof getMultipleMedicationsAvailability>>;
    }),
  ]);

  const closestMedicalFacilities = medical.closest;
  const healthcareFacilities: any = medical.all;

  // Get emergency contacts for the country
  const countryCode = COUNTRY_CODES[locationData.country] ?? 'INTL';

  const emergencyContacts = getEmergencyContacts(countryCode);

  // Prepare healthcare facilities data with nearest facilities
  const healthcareFacilitiesData: HealthcareFacilities = {
    ...healthcareFacilities,
    nearestHospital: healthcareFacilities.hospitals[0],
    nearestPharmacy: healthcareFacilities.pharmacies[0],
  };

  let airQualityMetric: HealthMetric;
  if (airQualityData) {
    airQualityMetric = {
      value: airQualityData.universalAqi,
      unit: 'AQI',
      riskLevel: mapGoogleAqiToRiskLevel(airQualityData.universalAqi),
      status: getGoogleAirQualityStatus(airQualityData.universalAqi),
      recommendation: getGoogleAirQualityRecommendation(airQualityData.universalAqi, airQualityData.healthRecommendations),
      icon: 'cloud',
      description: `Air Quality Index: ${airQualityData.universalAqi} (${getPollutantDetails(airQualityData.pollutants)})`,
    };
  } else {
    const mockAqi = Math.floor(Math.random() * 200);
    airQualityMetric = {
      value: mockAqi,
      unit: 'AQI',
      riskLevel: getRiskLevel(mockAqi, [50, 100, 150]),
      status: mockAqi <= 50 ? 'Good' : mockAqi <= 100 ? 'Moderate' : mockAqi <= 150 ? 'Unhealthy for Sensitive Groups' : 'Unhealthy',
      recommendation: mockAqi > 100 ? 'Wear a mask outdoors and limit outdoor activities' : 'Air quality is acceptable for most people',
      icon: 'cloud',
      description: 'Air Quality Index (using mock data)',
    };
  }

  let pollenMetric: HealthMetric;
  if (pollenData) {
    pollenMetric = {
      value: Math.max(pollenData.pollen.tree.indexValue, pollenData.pollen.grass.indexValue, pollenData.pollen.weed.indexValue),
      unit: 'Pollen Index',
      riskLevel: getOverallPollenRiskLevel(pollenData),
      status: getPollenStatus(pollenData),
      recommendation: getPollenRecommendations(pollenData),
      icon: 'flower',
      description: `Pollen levels: ${getPollenBreakdown(pollenData)}`,
    };
  } else {
    const mockPollen = Math.floor(Math.random() * 4);
    pollenMetric = {
      value: mockPollen,
      unit: 'Pollen Index',
      riskLevel: getRiskLevel(mockPollen, [1, 2, 3]),
      status: mockPollen <= 1 ? 'Low' : mockPollen <= 2 ? 'Moderate' : mockPollen <= 3 ? 'High' : 'Very High',
      recommendation: mockPollen > 2 ? 'High pollen levels - stay indoors and use air purifiers' : 'Pollen levels are manageable',
      icon: 'flower',
      description: 'Pollen forecast (using mock data)',
    };
  }

  const uvIndex = Math.floor(Math.random() * 12);
  const elevation = locationData.elevation || 0;

  // Generate timezone info
  const destinationTime = getCurrentDestinationTime(
    locationData.timezone,
    settingsTimeFormat === '12h'
  );
  const timeZoneInfo: TimeZoneInfo = {
    currentTime: destinationTime.time,
    currentDate: destinationTime.date,
    timezone: locationData.timezone,
    offsetFromUTC: 0,
  };

  // Generate jet lag data if origin timezone is set
  let jetLagData: JetLagData | undefined;
  if (originTimezone) {
    jetLagData = generateJetLagData(
      originTimezone,
      locationData.timezone,
      originLocation,
      locationData.name,
      settingsSleepBedTime,
      settingsSleepWakeTime
    );
  }

  const mockTravelHealth: TravelHealth = {
    location: locationData.name,
    country: locationData.country,
    coordinates: locationData.coordinates,
    lastUpdated: new Date(),
    airQuality: airQualityMetric,
    pollenLevels: pollenMetric,
    waterSafety: waterQualityData ? {
      value: waterQualityData.score,
      unit: 'Quality Score',
      riskLevel: mapWaterQualityToRiskLevel(waterQualityData.overallQuality),
      status: getWaterQualityStatus(waterQualityData.overallQuality),
      recommendation: getWaterQualityRecommendation(waterQualityData.overallQuality),
      icon: getWaterQualityIcon(waterQualityData.overallQuality),
      description: `Water quality: ${waterQualityData.score}/100 (${waterQualityData.overallQuality})`,
    } : {
      value: 'Good',
      riskLevel: 'low',
      status: 'Safe to drink',
      recommendation: 'Tap water is generally safe, but consider bottled water if unsure',
      icon: 'water',
      description: 'Water safety assessment for drinking water',
    },
    diseaseRisk: {
      value: 'Low',
      riskLevel: 'low',
      status: 'No active outbreaks',
      recommendation: 'Follow standard health precautions',
      icon: 'shield-checkmark',
      description: 'Current disease outbreak risk in the area',
    },
    vaccinations: {
      required: ['COVID-19'],
      recommended: ['Influenza', 'Hepatitis A'],
      riskLevel: 'low',
      recommendation: 'Ensure routine vaccinations are up to date',
      icon: 'medical',
      description: 'Required and recommended vaccinations for this location',
    },
    uvIndex: {
      value: uvIndex,
      unit: 'UV Index',
      riskLevel: getRiskLevel(uvIndex, [2, 5, 7]),
      status: uvIndex <= 2 ? 'Low' : uvIndex <= 5 ? 'Moderate' : uvIndex <= 7 ? 'High' : 'Very High',
      recommendation: uvIndex > 5 ? 'Wear SPF 30+ sunscreen, hat, and sunglasses' : 'Minimal sun protection required',
      icon: 'sunny',
      description: 'UV radiation intensity level',
    },
    altitudeRisk: {
      value: elevation,
      unit: 'meters',
      riskLevel: getRiskLevel(elevation, [2500, 3500, 4500]),
      status: elevation > 2500 ? 'High Altitude' : 'Normal Altitude',
      recommendation: elevation > 2500 ? 'Stay hydrated and ascend gradually to avoid altitude sickness' : 'No altitude-related precautions needed',
      icon: 'triangle',
      description: 'Altitude-related health risks',
    },
    foodSafety: {
      value: 'Good',
      riskLevel: 'low',
      status: 'Low risk',
      recommendation: 'Exercise normal food safety precautions',
      icon: 'restaurant',
      description: 'Food safety and hygiene standards',
    },
    overallRiskLevel: 'low',
    healthcareFacilities: healthcareFacilitiesData,
    emergencyContacts: emergencyContacts,
    timeZoneInfo: timeZoneInfo,
    jetLagData: jetLagData,
  };

  // Generate hydration recommendations
  let hydrationRecommendation;
  if (weatherHealthAssessment.weatherData) {
    hydrationRecommendation = calculateHydrationRecommendation(
      weatherHealthAssessment.weatherData,
      elevation,
      'light',
      70
    );
  }

  // Generate activity safety data
  let activitySafety;
  if (weatherHealthAssessment.weatherData) {
    activitySafety = generateActivitySafetyData(
      weatherHealthAssessment.weatherData,
      airQualityData,
      weatherHealthAssessment.extremeHeatWarning,
      5
    );
  }

  // Add weather data to travel health
  mockTravelHealth.weatherData = weatherHealthAssessment.weatherData || undefined;
  mockTravelHealth.heatWarning = weatherHealthAssessment.extremeHeatWarning || undefined;
  mockTravelHealth.hydrationRecommendation = hydrationRecommendation;
  mockTravelHealth.activitySafety = activitySafety;

  // Generate travel medication kit recommendations
  const travelMedicationKit = generateTravelMedicationKit(
    locationData.country,
    7,
    [],
    ['general travel']
  );

  // Add medication data to travel health
  mockTravelHealth.medicationAvailability = medicationAvailabilityData.length > 0 ? medicationAvailabilityData : undefined;
  mockTravelHealth.travelMedicationKit = travelMedicationKit;

  // Add nearest medical facilities data
  mockTravelHealth.nearestHospital = closestMedicalFacilities?.nearestHospital?.name;
  mockTravelHealth.nearestPharmacy = closestMedicalFacilities?.nearestPharmacy?.name;
  mockTravelHealth.nearestHospitalData = closestMedicalFacilities?.nearestHospital;
  mockTravelHealth.nearestPharmacyData = closestMedicalFacilities?.nearestPharmacy;

  // Add water quality data
  if (waterQualityData) {
    mockTravelHealth.waterQualityData = waterQualityData;
  }

  // Store API errors in the travel health data for UI access
  mockTravelHealth.apiErrors = apiErrors;

  return mockTravelHealth;
}
