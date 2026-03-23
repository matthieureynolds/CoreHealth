import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearCorruptedHealthScore,
} from './healthDataLoader';
import { loadHealthData as _loadHealthData } from './healthDataMethods';
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
  JetLagData,
  JetLagPlanningEvent,
  DerivedRiskFeature,
} from '../types';
import familyService from '../services/user/familyService';
import { deriveFeaturesFromSignals } from '../services/user/familyRiskService';
import { generateJetLagData } from '../services/travel/jetLagService';
import { useSettings } from './SettingsContext';
import { validateApiKeys } from '../config/api';
import { updateTravelHealthData as _updateTravelHealthData } from './updateTravelHealthData';
import {
  addJetLagPlanningEvent as _addJetLagPlanningEvent,
  updateJetLagPlanningEvent as _updateJetLagPlanningEvent,
  deleteJetLagPlanningEvent as _deleteJetLagPlanningEvent,
  getUpcomingJetLagEvents as _getUpcomingJetLagEvents,
} from './jetLagMethods';
import {
  updateLocation as _updateLocation,
  getCurrentLocation as _getCurrentLocation,
} from './locationMethods';
import {
  recalculateHealthScore as _recalculateHealthScore,
  generateDailyInsights as _generateDailyInsights,
} from './healthScoreMethods';


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
    await _loadHealthData({
      setProfile,
      setBiomarkers,
      setLabResults,
      setDeviceDataDirect: setDeviceData,
      setDeviceData,
      setDailyInsights,
      setHealthScore,
      setHealthScoreCalculated,
      setOriginTimezoneState,
      setOriginLocationState,
      setJetLagPlanningEvents,
      setBodySystems,
      setIsLoading,
    });
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
    await _recalculateHealthScore(currentBiomarkers, healthScoreCalculated, setHealthScore, setHealthScoreCalculated);
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
      await AsyncStorage.setItem('biomarkers', JSON.stringify(updatedBiomarkers));
      setBiomarkers(updatedBiomarkers);
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
      await AsyncStorage.setItem('biomarkers', JSON.stringify(updatedBiomarkers));
      setBiomarkers(updatedBiomarkers);
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
    await _generateDailyInsights(profile, biomarkers, healthScore, setDailyInsights);
  };

  const updateLocation = async (location: string) => {
    await _updateLocation(location, updateTravelHealthData);
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    return _getCurrentLocation();
  };

  const updateTravelHealthData = async (locationData: LocationData) => {
    try {
      const result = await _updateTravelHealthData({
        locationData,
        originTimezone,
        originLocation,
        settingsTimeFormat: settings?.general?.timeFormat,
        settingsSleepBedTime: settings?.lifestyle?.sleepSchedule?.bedTime,
        settingsSleepWakeTime: settings?.lifestyle?.sleepSchedule?.wakeUpTime,
      });
      setTravelHealth(result);
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

      await AsyncStorage.setItem('originTimezone', timezone);
      if (location) {
        await AsyncStorage.setItem('originLocation', location);
      }

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

  const addJetLagPlanningEvent = async (event: Omit<JetLagPlanningEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await _addJetLagPlanningEvent(event, jetLagPlanningEvents, setJetLagPlanningEvents);
    } catch (error) {
      console.error('Failed to add jet lag planning event:', error);
      throw error;
    }
  };

  const updateJetLagPlanningEvent = async (id: string, updates: Partial<JetLagPlanningEvent>) => {
    try {
      await _updateJetLagPlanningEvent(id, updates, jetLagPlanningEvents, setJetLagPlanningEvents);
    } catch (error) {
      console.error('Failed to update jet lag planning event:', error);
      throw error;
    }
  };

  const deleteJetLagPlanningEvent = async (id: string) => {
    try {
      await _deleteJetLagPlanningEvent(id, jetLagPlanningEvents, setJetLagPlanningEvents);
    } catch (error) {
      console.error('Failed to delete jet lag planning event:', error);
      throw error;
    }
  };

  const getUpcomingJetLagEvents = (): JetLagPlanningEvent[] => {
    return _getUpcomingJetLagEvents(jetLagPlanningEvents);
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
