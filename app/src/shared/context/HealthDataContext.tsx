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
  clearCorruptedHealthScore,
  loadStoredHealthData,
} from './healthDataLoader';
import { bootstrapHealthData } from './healthDataBootstrap';
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
  JetLagPlanningEvent,
  TimeZoneInfo,
  WeatherData,
  ExtremeHeatWarning,
  HydrationRecommendation,
  ActivitySafetyData,
  DerivedRiskFeature,
} from '../types';
import familyService from '../services/familyService';
import { deriveFeaturesFromSignals } from '../services/familyRiskService';
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
import { getClosestMedicalFacilities } from '../services/healthcarePlacesServiceEnhanced';
import { geocodeAddress, reverseGeocode } from '../services/geocodingService';
import { 
  generateJetLagData, 
  getCurrentDestinationTime 
} from '../services/jetLagService';
import { useSettings } from './SettingsContext';
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
import { refreshUserSnapshot } from '../services/userSnapshotService';
import {
  getMedicationAvailability,
  getMultipleMedicationsAvailability,
  generateTravelMedicationKit
} from '../services/medicationAvailabilityService';
import {
  getWaterQualityData,
  getWaterQualityStatus,
  getWaterQualityRecommendation,
  mapWaterQualityToRiskLevel,
  getWaterQualityIcon
} from '../services/waterQualityService';

// Map device display names from UI to internal device types used for assistant context
function mapDeviceNameToType(name: string): DeviceData['deviceType'] {
  const n = (name || '').toLowerCase();
  if (n.includes('whoop')) return 'whoop';
  if (n.includes('apple')) return 'apple_watch';
  if (n.includes('eight sleep') || n.includes('8 sleep')) return 'eight_sleep';
  if (n.includes('toothbrush')) return 'smart_toothbrush';
  if (n.includes('u-scan') || n.includes('u scan') || n.includes('toilet')) return 'smart_toilet';
  // Fallback to apple_watch as a generic wearable type
  return 'apple_watch';
}

interface HealthDataContextType {
  profile: UserProfile | null;
  biomarkers: Biomarker[];
  labResults: LabResult[];
  deviceData: DeviceData[];
  dailyInsights: DailyInsight[];
  healthScore: HealthScore | null;
  travelHealth: TravelHealth | null;
  bodySystems: BodySystem[];
  jetLagPlanningEvents: JetLagPlanningEvent[];
  isLoading: boolean;
  derivedRiskFeatures?: DerivedRiskFeature[];
  refreshFamilyRiskFeatures?: () => Promise<void>;

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
  
  // Health score management
  resetHealthScoreCalculation: () => void;

  // Travel health
  updateLocation: (location: string) => Promise<void>;
  getCurrentLocation: () => Promise<LocationData | null>;
  updateTravelHealthData: (locationData: LocationData) => Promise<void>;
  
  // Jet lag and timezone
  setOriginTimezone: (timezone: string, location?: string) => Promise<void>;
  calculateJetLag: (destinationTimezone: string, destinationLocation: string) => JetLagData | null;
  
  // Jet lag planning
  addJetLagPlanningEvent: (event: Omit<JetLagPlanningEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateJetLagPlanningEvent: (id: string, updates: Partial<JetLagPlanningEvent>) => Promise<void>;
  deleteJetLagPlanningEvent: (id: string) => Promise<void>;
  getUpcomingJetLagEvents: () => JetLagPlanningEvent[];
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
  const { settings } = useSettings();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [dailyInsights, setDailyInsights] = useState<DailyInsight[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [healthScoreCalculated, setHealthScoreCalculated] = useState(false);
  
  const [travelHealth, setTravelHealth] = useState<TravelHealth | null>(null);
  const [bodySystems, setBodySystems] = useState<BodySystem[]>([]);
  const [jetLagPlanningEvents, setJetLagPlanningEvents] = useState<JetLagPlanningEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [originTimezone, setOriginTimezoneState] = useState<string | null>(null);
  const [originLocation, setOriginLocationState] = useState<string>('Home');
  const [derivedRiskFeatures, setDerivedRiskFeatures] = useState<DerivedRiskFeature[]>([]);

  useEffect(() => {
    const init = async () => {
      await clearCorruptedHealthScore();
      await loadHealthData();
      validateApiKeys();
    };
    init();
  }, []);

  const loadHealthData = async () => {
    try {
      const data = await loadStoredHealthData();

      setProfile(data.profile);
      if (data.biomarkers) setBiomarkers(data.biomarkers);
      if (data.labResults) setLabResults(data.labResults);
      if (data.deviceData) setDeviceData(data.deviceData);

      // Merge connected devices into deviceData for assistant context
      if (data.connectedDevices) {
        const mapped: DeviceData[] = data.connectedDevices
          .filter(d => /connected/i.test(d.status || ''))
          .map((d, idx) => ({
            id: `conn-${idx}`,
            deviceType: mapDeviceNameToType(d.name),
            timestamp: new Date(),
            metrics: {},
          }));
        if (mapped.length) {
          setDeviceData(prev => [...(Array.isArray(prev) ? prev : []), ...mapped]);
        }
      }

      // Persist latest device sync timestamp for assistant queries
      try {
        const allEvents = Array.isArray(data.deviceData) ? data.deviceData : [];
        let lastTs: number | null = null;
        allEvents.forEach((ev: any) => {
          const t = ev?.timestamp ? new Date(ev.timestamp).getTime() : NaN;
          if (Number.isFinite(t) && (lastTs === null || t > lastTs)) lastTs = t;
        });
        if (lastTs) {
          await AsyncStorage.setItem('@corehealth_last_sync_at', new Date(lastTs).toISOString());
        }
      } catch {}

      if (data.insights) setDailyInsights(data.insights);
      if (data.healthScore) {
        setHealthScore(data.healthScore);
        setHealthScoreCalculated(true);
      } else {
        setHealthScoreCalculated(false);
      }
      if (data.originTimezone) setOriginTimezoneState(data.originTimezone);
      if (data.originLocation) setOriginLocationState(data.originLocation);
      setJetLagPlanningEvents(data.jetLagPlanningEvents);

      if (data.needsBootstrap) {
        const bootstrapped = await bootstrapHealthData();
        setBiomarkers(bootstrapped.biomarkers);
        setHealthScore(bootstrapped.healthScore);
        setDailyInsights(bootstrapped.insights);
        setBodySystems(bootstrapped.bodySystems);
        setHealthScoreCalculated(true);
      }
    } catch (error) {
      console.error('Failed to load health data:', error);
      const bootstrapped = await bootstrapHealthData();
      setBiomarkers(bootstrapped.biomarkers);
      setHealthScore(bootstrapped.healthScore);
      setDailyInsights(bootstrapped.insights);
      setBodySystems(bootstrapped.bodySystems);
      setHealthScoreCalculated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFamilyRiskFeatures = async () => {
    try {
      const signals = await familyService.listIncomingSignals();
      const features = deriveFeaturesFromSignals(signals);
      setDerivedRiskFeatures(features);
      await AsyncStorage.setItem('derivedRiskFeatures', JSON.stringify(features));
    } catch (e) {
      console.warn('Family risk refresh failed', e);
    }
  };

  // Recalculate health score only when clinical data changes
  const recalculateHealthScore = async (currentBiomarkers: Biomarker[]) => {
    if (healthScoreCalculated) return;
    
    // Simple, deterministic scoring based on available biomarkers.
    // Nutrition: based on Vitamin D (ng/mL)
    const vitD = currentBiomarkers.find(b => /vitamin d/i.test(b.name));
    let nutrition = 75;
    if (vitD && typeof vitD.value === 'number') {
      const v = vitD.value as number;
      nutrition = v < 20 ? 55 : v < 30 ? 68 : v < 50 ? 80 : 85;
    }

    // Recovery: proxy using hs-CRP (lower is better)
    const hsCRP = currentBiomarkers.find(b => /crp/i.test(b.name));
    let recovery = 88;
    if (hsCRP && typeof hsCRP.value === 'number') {
      const v = hsCRP.value as number;
      recovery = v < 1 ? 90 : v < 3 ? 82 : 70;
    }

    // Activity: proxy using Resting HR (lower is better)
    const rhr = currentBiomarkers.find(b => /resting hr|resting heart/i.test(b.name));
    let activity = 75;
    if (rhr && typeof rhr.value === 'number') {
      const v = rhr.value as number;
      activity = v < 60 ? 85 : v < 75 ? 78 : 68;
    }

    // Sleep and stress kept stable unless we add sensors later
    const sleep = 78;
    const stress = 70;

    const overall = Math.round((sleep + activity + stress + recovery + nutrition) / 5);

    const newScore: HealthScore = { overall, sleep, activity, stress, recovery, nutrition };
    
    if (newScore.overall <= 0) {
      newScore.overall = 82;
      newScore.sleep = 78;
      newScore.activity = 85;
      newScore.stress = 70;
      newScore.recovery = 88;
      newScore.nutrition = 75;
    }
    
    setHealthScore(newScore);
    setHealthScoreCalculated(true);
    await AsyncStorage.setItem('healthScore', JSON.stringify(newScore));
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
      // Force recalculate when new biomarker is added
      setHealthScoreCalculated(false);
      await recalculateHealthScore(updatedBiomarkers);
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
      // Force recalculate when biomarker is updated
      setHealthScoreCalculated(false);
      await recalculateHealthScore(updatedBiomarkers);
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
      // Lab results can imply biomarker changes; recompute score from current biomarkers
      await recalculateHealthScore(biomarkers);
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
      // Update last sync timestamp for assistant queries
      try {
        const ts = data?.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString();
        await AsyncStorage.setItem('@corehealth_last_sync_at', ts);
      } catch {}
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
      } catch {
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
      try { await refreshUserSnapshot(); } catch {}
    } catch (error) {
      console.error('Failed to generate daily insights:', error);
    }
  };

  const updateLocation = async (location: string) => {
    try {
      // Use geocoding service to get real location data
      const locationData = await geocodeAddress(location);
      
      if (!locationData) {
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
      if (status !== 'granted') return null;

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      
      // Use Google's reverse geocoding for better location data and timezone
      const locationData = await reverseGeocode(
        location.coords.latitude,
        location.coords.longitude
      );

      if (!locationData) {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        const geo = geocode[0];
        let locationName =
          geo?.city || geo?.district || geo?.subregion || geo?.region || 'Unknown Location';

        // If we only got a country-level result, try sub-region components
        if (!locationName || locationName === geo?.country) {
          locationName = geo?.district || geo?.subregion || geo?.region || 'Unknown Location';
        }

        return {
          name: locationName,
          country: geo?.country || 'Unknown',
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          timezone: geo?.timezone || 'UTC',
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

      // Track API errors
      const apiErrors: { [key: string]: string } = {};

      // Fetch real air quality data with fallback
      let airQualityData = null;
      try {
        // Try Google Air Quality API first
        airQualityData = await getGoogleAirQualityData(
          locationData.coordinates.latitude,
          locationData.coordinates.longitude
        );
      } catch (error) {
        apiErrors.airQuality = 'Google Air Quality API not enabled';
      }

      // Fetch real pollen data with fallback
      let pollenData = null;
      try {
        pollenData = await getGooglePollenData(
          locationData.coordinates.latitude,
          locationData.coordinates.longitude
        );
      } catch (error) {
        apiErrors.pollen = 'Google Pollen API not enabled';
      }

      // Fetch water quality data
      let waterQualityData = null;
      try {
        waterQualityData = await getWaterQualityData(
          locationData.coordinates.latitude,
          locationData.coordinates.longitude,
          locationData.name,
          locationData.country
        );
      } catch (error) {
        console.error('❌ Water Quality Service failed:', error);
        apiErrors.waterQuality = 'Failed to fetch water quality data';
      }

      // Fetch nearby healthcare facilities using enhanced service
      let healthcareFacilities = null;
      let closestMedicalFacilities = null;
      try {
        
        // Try enhanced service first (with fallbacks)
        closestMedicalFacilities = await getClosestMedicalFacilities(
          locationData.coordinates.latitude,
          locationData.coordinates.longitude,
          locationData.name
        );
        
        // Also try original service for comprehensive data
        healthcareFacilities = await getAllHealthcareFacilities(
          locationData.coordinates.latitude,
          locationData.coordinates.longitude,
          5000 // 5km radius
        );
      } catch (error) {
        console.error('Healthcare facilities API error:', error);
        apiErrors.healthcare = 'Failed to fetch healthcare facilities';
        healthcareFacilities = { hospitals: [], pharmacies: [], clinics: [], dentists: [], total: 0 };
      }

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
      const destinationTime = getCurrentDestinationTime(
        locationData.timezone,
        settings?.general?.timeFormat === '12h'
      );
      const timeZoneInfo: TimeZoneInfo = {
        currentTime: destinationTime.time,
        currentDate: destinationTime.date,
        timezone: locationData.timezone,
        offsetFromUTC: 0, // This would need to be calculated properly in a real implementation
      };

      // Generate jet lag data if origin timezone is set
      let jetLagData: JetLagData | undefined;
      if (originTimezone) {
        
        jetLagData = generateJetLagData(
          originTimezone,
          locationData.timezone,
          originLocation,
          locationData.name,
          settings.lifestyle.sleepSchedule.bedTime,
          settings.lifestyle.sleepSchedule.wakeUpTime
        );
      } else {
      }

      const mockTravelHealth: TravelHealth = {
        location: locationData.name,
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

      // Generate weather health assessment
      let weatherHealthAssessment;
      try {
        weatherHealthAssessment = await generateWeatherHealthAssessment(
          locationData.coordinates.latitude,
          locationData.coordinates.longitude
        );
      } catch (error) {
        console.error('Weather API error:', error);
        apiErrors.weather = 'Failed to fetch weather data';
        weatherHealthAssessment = {
          weatherData: null,
          heatIndexData: null,
          extremeHeatWarning: null,
          uvHeatCombination: null,
        };
      }

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

      // Add nearest medical facilities data
      mockTravelHealth.nearestHospital = closestMedicalFacilities?.nearestHospital?.name;
      mockTravelHealth.nearestPharmacy = closestMedicalFacilities?.nearestPharmacy?.name;
      mockTravelHealth.nearestHospitalData = closestMedicalFacilities?.nearestHospital;
      mockTravelHealth.nearestPharmacyData = closestMedicalFacilities?.nearestPharmacy;

      // Add water quality data
      if (waterQualityData) {
        (mockTravelHealth as any).waterQualityData = waterQualityData;
      }

      // Store API errors in the travel health data for UI access
      (mockTravelHealth as any).apiErrors = apiErrors;

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
      destinationLocation,
      settings.lifestyle.sleepSchedule.bedTime,
      settings.lifestyle.sleepSchedule.wakeUpTime
    );
  };

  // Jet lag planning methods
  const addJetLagPlanningEvent = async (event: Omit<JetLagPlanningEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEvent: JetLagPlanningEvent = {
        ...event,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedEvents = [...jetLagPlanningEvents, newEvent];
      setJetLagPlanningEvents(updatedEvents);
      await AsyncStorage.setItem('jetLagPlanningEvents', JSON.stringify(updatedEvents));
    } catch (error) {
      console.error('Failed to add jet lag planning event:', error);
      throw error;
    }
  };

  const updateJetLagPlanningEvent = async (id: string, updates: Partial<JetLagPlanningEvent>) => {
    try {
      const updatedEvents = jetLagPlanningEvents.map(event => 
        event.id === id 
          ? { ...event, ...updates, updatedAt: new Date().toISOString() }
          : event
      );
      setJetLagPlanningEvents(updatedEvents);
      await AsyncStorage.setItem('jetLagPlanningEvents', JSON.stringify(updatedEvents));
    } catch (error) {
      console.error('Failed to update jet lag planning event:', error);
      throw error;
    }
  };

  const deleteJetLagPlanningEvent = async (id: string) => {
    try {
      const updatedEvents = jetLagPlanningEvents.filter(event => event.id !== id);
      setJetLagPlanningEvents(updatedEvents);
      await AsyncStorage.setItem('jetLagPlanningEvents', JSON.stringify(updatedEvents));
    } catch (error) {
      console.error('Failed to delete jet lag planning event:', error);
      throw error;
    }
  };

  const getUpcomingJetLagEvents = (): JetLagPlanningEvent[] => {
    const now = new Date();
    return jetLagPlanningEvents
      .filter(event => new Date(event.departureDate) > now)
      .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
  };

  const resetHealthScoreCalculation = () => {
    setHealthScoreCalculated(false);
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
    jetLagPlanningEvents,
    isLoading,
    derivedRiskFeatures,
    refreshFamilyRiskFeatures,
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
    addJetLagPlanningEvent,
    updateJetLagPlanningEvent,
    deleteJetLagPlanningEvent,
    getUpcomingJetLagEvents,
    resetHealthScoreCalculation,
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
