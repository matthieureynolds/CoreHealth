import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {
  UserProfile,
  Biomarker,
  LabResult,
  DeviceData,
  DailyInsight,
  HealthScore,
  TravelHealth,
  BodySystem,
  LocationData,
  RiskLevel,
  HealthMetric,
  HealthcareFacilities,
  EmergencyContacts,
  JetLagData,
  TimeZoneInfo,
  WeatherData,
  ExtremeHeatWarning,
  HydrationRecommendation,
  ActivitySafetyData,
} from '../types';
import { 
  getGoogleAirQualityData,
  getGoogleAirQualityStatus,
  getGoogleAirQualityRecommendation,
  mapGoogleAqiToRiskLevel,
  getPollutantDetails,
} from '../services/googleAirQualityService';
import { 
  getGooglePollenData,
  getOverallPollenRiskLevel,
  getPollenStatus,
  getPollenRecommendations,
  getPollenBreakdown,
} from '../services/googlePollenService';
import { 
  getAllHealthcareFacilities,
  getEmergencyContacts,
} from '../services/healthcarePlacesService';
import { geocodeAddress, reverseGeocode } from '../services/geocodingService';
import { 
  generateJetLagData, 
  getCurrentDestinationTime 
} from '../services/jetLagService';
import { validateApiKeys } from '../config/api';
import { 
  generateWeatherHealthAssessment
} from '../services/weatherService';
import { 
  calculateHydrationRecommendation
} from '../services/hydrationService';
import { 
  generateActivitySafetyData
} from '../services/activitySafetyService';
import {
  getMedicationAvailability,
  getMultipleMedicationsAvailability,
  generateTravelMedicationKit
} from '../services/medicationAvailabilityService';

interface HealthDataContextType {
  profile: UserProfile | null;
  biomarkers: Biomarker[];
  labResults: LabResult[];
  deviceData: DeviceData[];
  dailyInsights: DailyInsight[];
  healthScore: HealthScore | null;
  travelHealth: TravelHealth | null;
  bodySystems: BodySystem[];
  isLoading: boolean;

  // Profile methods
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;

  // Biomarker methods
  addBiomarker: (biomarker: Biomarker) => Promise<void>;
  updateBiomarker: (id: string, updates: Partial<Biomarker>) => Promise<void>;

  // Lab results methods
  addLabResult: (labResult: LabResult) => Promise<void>;

  // Device data methods
  syncDeviceData: (data: DeviceData) => Promise<void>;

  // Health insights
  generateDailyInsights: () => Promise<void>;

  // Travel health
  updateLocation: (location: string) => Promise<void>;
  getCurrentLocation: () => Promise<LocationData | null>;
  updateTravelHealthData: (locationData: LocationData) => Promise<void>;
  
  // Jet lag and timezone
  setOriginTimezone: (timezone: string, location?: string) => Promise<void>;
  calculateJetLag: (destinationTimezone: string, destinationLocation: string) => JetLagData | null;
}

const HealthDataContext = createContext<HealthDataContextType | undefined>(
  undefined,
);

interface HealthDataProviderProps {
  children: ReactNode;
}

export const HealthDataProvider: React.FC<HealthDataProviderProps> = ({
  children,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [dailyInsights, setDailyInsights] = useState<DailyInsight[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [travelHealth, setTravelHealth] = useState<TravelHealth | null>(null);
  const [bodySystems, setBodySystems] = useState<BodySystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [originTimezone, setOriginTimezoneState] = useState<string | null>(null);
  const [originLocation, setOriginLocationState] = useState<string>('Home');

  useEffect(() => {
    loadHealthData();
    generateMockData();
    validateApiKeys();
  }, []);

  const loadHealthData = async () => {
    try {
      const [
        storedProfile,
        storedBiomarkers,
        storedLabResults,
        storedDeviceData,
        storedInsights,
        storedHealthScore,
        storedOriginTimezone,
        storedOriginLocation,
      ] = await Promise.all([
        AsyncStorage.getItem('profile'),
        AsyncStorage.getItem('biomarkers'),
        AsyncStorage.getItem('labResults'),
        AsyncStorage.getItem('deviceData'),
        AsyncStorage.getItem('dailyInsights'),
        AsyncStorage.getItem('healthScore'),
        AsyncStorage.getItem('originTimezone'),
        AsyncStorage.getItem('originLocation'),
      ]);

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        // Create default profile if none exists
        const newProfile: UserProfile = {
          userId: 'default',
          age: 30,
          gender: 'other',
          height: 170,
          weight: 70,
          ethnicity: '',
          bloodType: 'unknown',
          medicalHistory: [],
          familyHistory: [],
          surgeries: [],
          vaccinations: [],
          allergies: [],
          lifestyle: {
            smoking: { status: 'never' },
            alcohol: { frequency: 'never' },
            diet: { type: 'omnivore', restrictions: [], supplements: [] },
            exercise: { frequency: 'never', type: [], intensity: 'low' },
            sleep: { averageHoursPerNight: 8, sleepQuality: 'good', sleepDisorders: [] },
            stress: { level: 'low', managementTechniques: [] },
          },
          organSpecificConditions: [],
        };
        setProfile(newProfile);
      }
      
      if (storedBiomarkers) setBiomarkers(JSON.parse(storedBiomarkers));
      if (storedLabResults) setLabResults(JSON.parse(storedLabResults));
      if (storedDeviceData) setDeviceData(JSON.parse(storedDeviceData));
      if (storedInsights) setDailyInsights(JSON.parse(storedInsights));
      if (storedHealthScore) setHealthScore(JSON.parse(storedHealthScore));
      if (storedOriginTimezone) setOriginTimezoneState(storedOriginTimezone);
      if (storedOriginLocation) setOriginLocationState(storedOriginLocation);
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = () => {
    // Generate mock biomarkers
    const mockBiomarkers: Biomarker[] = [
      {
        id: '1',
        name: 'Creatinine',
        value: 0.93,
        unit: 'mg/dL',
        category: 'metabolic',
        trend: 'stable',
        riskLevel: 'low',
        lastUpdated: new Date(),
      },
      {
        id: '2',
        name: 'ALT',
        value: 28,
        unit: 'U/L',
        category: 'metabolic',
        trend: 'improving',
        riskLevel: 'low',
        lastUpdated: new Date(),
      },
      {
        id: '3',
        name: 'Fasting Glucose',
        value: 95,
        unit: 'mg/dL',
        category: 'metabolic',
        trend: 'stable',
        riskLevel: 'low',
        lastUpdated: new Date(),
      },
      {
        id: '4',
        name: 'Total Cholesterol',
        value: 185,
        unit: 'mg/dL',
        category: 'cardiovascular',
        trend: 'improving',
        riskLevel: 'low',
        lastUpdated: new Date(),
      },
      {
        id: '5',
        name: 'TSH',
        value: 2.1,
        unit: 'mIU/L',
        category: 'hormonal',
        trend: 'stable',
        riskLevel: 'low',
        lastUpdated: new Date(),
      },
      {
        id: '6',
        name: 'Vitamin D',
        value: 35,
        unit: 'ng/mL',
        category: 'nutritional',
        trend: 'improving',
        riskLevel: 'low',
        lastUpdated: new Date(),
      },
      {
        id: '7',
        name: 'Free T3',
        value: 3.2,
        unit: 'pg/mL',
        category: 'hormonal',
        trend: 'stable',
        riskLevel: 'low',
        lastUpdated: new Date(),
      },
      {
        id: '8',
        name: 'LDL-C',
        value: 95,
        unit: 'mg/dL',
        category: 'cardiovascular',
        trend: 'improving',
        riskLevel: 'low',
        lastUpdated: new Date(),
      },
      {
        id: '9',
        name: 'HDL-C',
        value: 58,
        unit: 'mg/dL',
        category: 'cardiovascular',
        trend: 'stable',
        riskLevel: 'low',
        lastUpdated: new Date(),
      },
      {
        id: '10',
        name: 'hs-CRP',
        value: 0.8,
        unit: 'mg/L',
        category: 'inflammatory',
        trend: 'improving',
        riskLevel: 'low',
        lastUpdated: new Date(),
      },
      {
        id: '11',
        name: 'HOMA-IR',
        value: 1.2,
        unit: '',
        category: 'metabolic',
        trend: 'stable',
        riskLevel: 'low',
        lastUpdated: new Date(),
      },
      {
        id: '12',
        name: 'Resting HR',
        value: 58,
        unit: 'bpm',
        category: 'cardiovascular',
        trend: 'improving',
        riskLevel: 'low',
        lastUpdated: new Date(),
      },
    ];

    // Generate mock health score
    const mockHealthScore: HealthScore = {
      overall: 82,
      sleep: 78,
      activity: 85,
      stress: 70,
      recovery: 88,
      nutrition: 75,
    };

    // Generate mock daily insights
    const mockInsights: DailyInsight[] = [
      {
        id: '1',
        title: 'Great Recovery Day',
        description:
          'Your HRV is 15% above baseline, indicating excellent recovery.',
        category: 'recovery',
        priority: 'medium',
        actionable: true,
        action: 'Consider a moderate workout today.',
      },
      {
        id: '2',
        title: 'Hydration Reminder',
        description: "You've consumed 40% less water than usual yesterday.",
        category: 'nutrition',
        priority: 'high',
        actionable: true,
        action: 'Aim for 8 glasses of water today.',
      },
    ];

    // Generate mock body systems
    const mockBodySystems: BodySystem[] = [
      {
        id: 'heart',
        name: 'Cardiovascular',
        coordinates: { x: 50, y: 30 },
        biomarkers: mockBiomarkers.filter(b => b.category === 'cardiovascular'),
        riskScore: 25,
        lastAssessment: new Date(),
      },
      {
        id: 'brain',
        name: 'Neurological',
        coordinates: { x: 50, y: 10 },
        biomarkers: [],
        riskScore: 15,
        lastAssessment: new Date(),
      },
    ];

    setBiomarkers(mockBiomarkers);
    setHealthScore(mockHealthScore);
    setDailyInsights(mockInsights);
    setBodySystems(mockBodySystems);
  };

  const updateProfile = async (profileUpdates: Partial<UserProfile>) => {
    try {
      const updatedProfile = { ...profile, ...profileUpdates } as UserProfile;
      await AsyncStorage.setItem('profile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const addBiomarker = async (biomarker: Biomarker) => {
    try {
      const updatedBiomarkers = [...biomarkers, biomarker];
      await AsyncStorage.setItem(
        'biomarkers',
        JSON.stringify(updatedBiomarkers),
      );
      setBiomarkers(updatedBiomarkers);
    } catch (error) {
      console.error('Failed to add biomarker:', error);
      throw error;
    }
  };

  const updateBiomarker = async (id: string, updates: Partial<Biomarker>) => {
    try {
      const updatedBiomarkers = biomarkers.map(b =>
        b.id === id ? { ...b, ...updates } : b,
      );
      await AsyncStorage.setItem(
        'biomarkers',
        JSON.stringify(updatedBiomarkers),
      );
      setBiomarkers(updatedBiomarkers);
    } catch (error) {
      console.error('Failed to update biomarker:', error);
      throw error;
    }
  };

  const addLabResult = async (labResult: LabResult) => {
    try {
      const updatedResults = [...labResults, labResult];
      await AsyncStorage.setItem('labResults', JSON.stringify(updatedResults));
      setLabResults(updatedResults);
    } catch (error) {
      console.error('Failed to add lab result:', error);
      throw error;
    }
  };

  const syncDeviceData = async (data: DeviceData) => {
    try {
      const updatedData = [...deviceData, data];
      await AsyncStorage.setItem('deviceData', JSON.stringify(updatedData));
      setDeviceData(updatedData);
    } catch (error) {
      console.error('Failed to sync device data:', error);
      throw error;
    }
  };

  const generateDailyInsights = async () => {
    try {
      // First try to get AI-powered insights
      let insights: DailyInsight[] = [];
      
      try {
        const { HealthAssistantService } = require('../services/healthAssistantService');
        insights = await HealthAssistantService.generateDailyRecommendations(
          profile,
          biomarkers,
          healthScore
        );
        console.log('✨ Generated AI-powered daily insights');
      } catch (aiError) {
        console.warn('AI insights unavailable, using fallback:', aiError);
        // Fallback to enhanced insights based on current data
        insights = [
      {
        id: Date.now().toString(),
        title: 'Weekly Health Summary',
        description: 'Your health metrics show positive trends this week.',
        category: 'recovery',
        priority: 'low',
        actionable: false,
      },
          {
            id: (Date.now() + 1).toString(),
            title: 'Hydration Focus',
            description: 'Staying well hydrated supports all body functions and health metrics.',
            category: 'nutrition',
            priority: 'medium',
            actionable: true,
            action: 'Aim for 8 glasses of water throughout the day.',
          },
                     {
             id: (Date.now() + 2).toString(),
             title: 'Movement Opportunity',
             description: 'Regular movement helps maintain cardiovascular health and energy levels.',
             category: 'activity',
             priority: 'medium',
             actionable: true,
             action: 'Take a 10-minute walk or do some light stretching.',
           },
        ];
      }

      setDailyInsights(insights);
      await AsyncStorage.setItem('dailyInsights', JSON.stringify(insights));
    } catch (error) {
      console.error('Failed to generate daily insights:', error);
    }
  };

  const updateLocation = async (location: string) => {
    try {
      // Use geocoding service to get real location data
      const locationData = await geocodeAddress(location);
      
      if (!locationData) {
        // Fallback to mock data if geocoding fails
        console.warn('Geocoding failed, using mock data for:', location);
        const mockLocationData: LocationData = {
          name: location,
          country: 'Unknown',
          coordinates: { latitude: 0, longitude: 0 },
          timezone: 'UTC',
          elevation: Math.floor(Math.random() * 2000),
        };
        await updateTravelHealthData(mockLocationData);
        return;
      }

      // Add some elevation variation (geocoding doesn't provide elevation)
      locationData.elevation = Math.floor(Math.random() * 2000);
      
      await updateTravelHealthData(locationData);
    } catch (error) {
      console.error('Failed to update location:', error);
      throw error;
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return null;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      
      // Use Google's reverse geocoding for better location data and timezone
      const locationData = await reverseGeocode(
        location.coords.latitude,
        location.coords.longitude
      );

      if (!locationData) {
        // Fallback to expo-location's reverse geocoding
        console.warn('Google reverse geocoding failed, using expo-location fallback');
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        return {
          name: geocode[0]?.city || 'Unknown Location',
          country: geocode[0]?.country || 'Unknown',
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          timezone: geocode[0]?.timezone || 'UTC',
          elevation: location.coords.altitude || 0,
        };
      }

      // Use real elevation from GPS if available
      if (location.coords.altitude) {
        locationData.elevation = location.coords.altitude;
      }

      return locationData;
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  };

  const updateTravelHealthData = async (locationData: LocationData) => {
    try {
      const getRiskLevel = (value: number, thresholds: number[]): RiskLevel => {
        if (value <= thresholds[0]) return 'low';
        if (value <= thresholds[1]) return 'moderate';
        if (value <= thresholds[2]) return 'high';
        return 'severe';
      };

      // Fetch real air quality data from Google
      const airQualityData = await getGoogleAirQualityData(
        locationData.coordinates.latitude,
        locationData.coordinates.longitude
      );

      // Fetch real pollen data from Google
      const pollenData = await getGooglePollenData(
        locationData.coordinates.latitude,
        locationData.coordinates.longitude
      );

      // Fetch nearby healthcare facilities
      console.log('🏥 Fetching healthcare facilities for:', locationData.name);
      const healthcareFacilities = await getAllHealthcareFacilities(
        locationData.coordinates.latitude,
        locationData.coordinates.longitude,
        5000 // 5km radius
      );
      console.log('🏥 Healthcare facilities found:', {
        hospitals: healthcareFacilities.hospitals.length,
        pharmacies: healthcareFacilities.pharmacies.length,
        clinics: healthcareFacilities.clinics.length,
        dentists: healthcareFacilities.dentists.length,
        total: healthcareFacilities.total,
        nearestHospital: healthcareFacilities.hospitals[0]?.name || 'None found'
      });

      // Get emergency contacts for the country
      const countryCode = locationData.country === 'France' ? 'FR' :
                         locationData.country === 'United Kingdom' ? 'UK' :
                         locationData.country === 'Japan' ? 'JP' :
                         locationData.country === 'Australia' ? 'AU' :
                         locationData.country === 'Canada' ? 'CA' :
                         locationData.country === 'Germany' ? 'DE' :
                         locationData.country === 'United States' ? 'US' : 'INTL';
      
      const emergencyContacts = getEmergencyContacts(countryCode);

      // Prepare healthcare facilities data with nearest facilities
      const healthcareFacilitiesData: HealthcareFacilities = {
        ...healthcareFacilities,
        nearestHospital: healthcareFacilities.hospitals[0], // First is closest due to sorting
        nearestPharmacy: healthcareFacilities.pharmacies[0],
      };

      let airQualityMetric: HealthMetric;
      if (airQualityData) {
        // Use real Google API data
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
        // Fallback to mock data if API fails
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
        // Use real Google pollen data
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
        // Fallback to mock data if API fails
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
      const destinationTime = getCurrentDestinationTime(locationData.timezone);
      const timeZoneInfo: TimeZoneInfo = {
        currentTime: destinationTime.time,
        currentDate: destinationTime.date,
        timezone: locationData.timezone,
        offsetFromUTC: 0, // This would need to be calculated properly in a real implementation
      };

      // Generate jet lag data if origin timezone is set
      let jetLagData: JetLagData | undefined;
      if (originTimezone) {
        console.log('=== Jet Lag Context Debug ===');
        console.log('Origin timezone from state:', originTimezone);
        console.log('Destination timezone from geocoding:', locationData.timezone);
        console.log('Origin location:', originLocation);
        console.log('Destination location:', locationData.name);
        console.log('=============================');
        
        jetLagData = generateJetLagData(
          originTimezone,
          locationData.timezone,
          originLocation,
          locationData.name
        );
      } else {
        console.log('No origin timezone set, skipping jet lag calculation');
      }

      const mockTravelHealth: TravelHealth = {
        location: locationData.name,
        coordinates: locationData.coordinates,
        lastUpdated: new Date(),
        airQuality: airQualityMetric,
        pollenLevels: pollenMetric,
        waterSafety: {
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

      // Generate weather health assessment
      const weatherHealthAssessment = await generateWeatherHealthAssessment(
        locationData.coordinates.latitude,
        locationData.coordinates.longitude
      );

      // Generate hydration recommendations
      let hydrationRecommendation;
      if (weatherHealthAssessment.weatherData) {
        hydrationRecommendation = calculateHydrationRecommendation(
          weatherHealthAssessment.weatherData,
          elevation,
          'light', // Default activity level
          70 // Default body weight
        );
      }

      // Generate activity safety data
      let activitySafety;
      if (weatherHealthAssessment.weatherData) {
        activitySafety = generateActivitySafetyData(
          weatherHealthAssessment.weatherData,
          airQualityData,
          weatherHealthAssessment.extremeHeatWarning,
          5 // Default UV index, should use real data
        );
      }

      // Add weather data to travel health
      mockTravelHealth.weatherData = weatherHealthAssessment.weatherData || undefined;
      mockTravelHealth.heatWarning = weatherHealthAssessment.extremeHeatWarning || undefined;
      mockTravelHealth.hydrationRecommendation = hydrationRecommendation;
      mockTravelHealth.activitySafety = activitySafety;

      // Generate medication availability data
      const commonMedications = ['ibuprofen', 'amoxicillin', 'lorazepam', 'insulin'];
      const medicationAvailabilityData = await getMultipleMedicationsAvailability(
        commonMedications,
        locationData.country,
        locationData.coordinates.latitude,
        locationData.coordinates.longitude
      );

      // Generate travel medication kit recommendations
      const travelMedicationKit = generateTravelMedicationKit(
        locationData.country,
        7, // Default 7-day trip
        [], // No specific medical conditions (would come from user profile)
        ['general travel'] // Default activities
      );

      // Add medication data to travel health
      mockTravelHealth.medicationAvailability = medicationAvailabilityData.length > 0 ? medicationAvailabilityData : undefined;
      mockTravelHealth.travelMedicationKit = travelMedicationKit;

      setTravelHealth(mockTravelHealth);
    } catch (error) {
      console.error('Failed to update travel health data:', error);
      throw error;
    }
  };

  const setOriginTimezone = async (timezone: string, location?: string) => {
    try {
      setOriginTimezoneState(timezone);
      if (location) {
        setOriginLocationState(location);
      }
      
      // Store in AsyncStorage for persistence
      await AsyncStorage.setItem('originTimezone', timezone);
      if (location) {
        await AsyncStorage.setItem('originLocation', location);
      }
      
      // If we have current travel health data, recalculate with jet lag
      if (travelHealth && travelHealth.coordinates) {
        const locationData: LocationData = {
          name: travelHealth.location,
          country: 'Unknown',
          coordinates: travelHealth.coordinates,
          timezone: travelHealth.timeZoneInfo?.timezone || 'UTC',
          elevation: typeof travelHealth.altitudeRisk.value === 'number' ? travelHealth.altitudeRisk.value : 0,
        };
        await updateTravelHealthData(locationData);
      }
    } catch (error) {
      console.error('Failed to set origin timezone:', error);
      throw error;
    }
  };

  const calculateJetLag = (destinationTimezone: string, destinationLocation: string): JetLagData | null => {
    if (!originTimezone) {
      console.warn('Origin timezone not set, cannot calculate jet lag');
      return null;
    }
    
    return generateJetLagData(
      originTimezone,
      destinationTimezone,
      originLocation,
      destinationLocation
    );
  };

  const value: HealthDataContextType = {
    profile,
    biomarkers,
    labResults,
    deviceData,
    dailyInsights,
    healthScore,
    travelHealth,
    bodySystems,
    isLoading,
    updateProfile,
    addBiomarker,
    updateBiomarker,
    addLabResult,
    syncDeviceData,
    generateDailyInsights,
    updateLocation,
    getCurrentLocation,
    updateTravelHealthData,
    setOriginTimezone,
    calculateJetLag,
  };

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};
