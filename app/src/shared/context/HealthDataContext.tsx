import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
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
import { fetchAuthSession } from 'aws-amplify/auth';
import familyService from '../services/user/familyService';
import { deriveFeaturesFromSignals } from '../services/user/familyRiskService';
import { generateJetLagData } from '../services/jetlag-brain/jetLagService';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';
import { api } from '../services/data/apiClient';
import { DataService } from '../services/data/dataService';
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
  refreshAllHealthData: () => Promise<void>;

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
  const { user, isInitializing } = useAuth();
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
    if (isInitializing) return;
    const init = async () => {
      await clearCorruptedHealthScore();
      await loadHealthData();
      validateApiKeys();
    };
    init();
  }, [isInitializing, user?.id]);

  const loadHealthData = useCallback(async () => {
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
    }, user?.id);
  }, [user?.id]);

  // Sync location health to backend whenever travelHealth updates (fire-and-forget)
  // Only syncs if the user has given explicit location-health consent (Fix 14 — GDPR Art. 6/9)
  useEffect(() => {
    if (!travelHealth || !user?.id) return;
    AsyncStorage.getItem('@corehealth_location_consent').then(consented => {
      if (consented !== 'true') return; // no consent — do not sync to backend
      const payload = {
        location: travelHealth.location,
        airQuality: travelHealth.airQuality,
        uvIndex: travelHealth.uvIndex,
        pollenLevels: travelHealth.pollenLevels,
        waterSafety: travelHealth.waterSafety,
        diseaseRisk: travelHealth.diseaseRisk,
        overallRiskLevel: travelHealth.overallRiskLevel,
        lastUpdated: travelHealth.lastUpdated,
      };
      fetchAuthSession().then(session => {
        const userId = session.tokens?.idToken?.payload?.sub as string | undefined;
        if (userId) api.put(`/users/${userId}/location-health`, payload).catch(() => {});
      }).catch(() => {});
    }).catch(() => {});
  }, [travelHealth, user?.id]);

  const refreshFamilyRiskFeatures = useCallback(async () => {
    try {
      const signals = await familyService.listIncomingSignals();
      const features = deriveFeaturesFromSignals(signals);
      setDerivedRiskFeatures(features);
      await AsyncStorage.setItem('derivedRiskFeatures', JSON.stringify(features));
    } catch (e) {
      console.warn('Family risk refresh failed', e);
    }
  }, []);

  // Recalculate health score only when clinical data changes
  const recalculateHealthScore = useCallback(async (currentBiomarkers: Biomarker[]) => {
    await _recalculateHealthScore(currentBiomarkers, healthScoreCalculated, setHealthScore, setHealthScoreCalculated);
  }, [healthScoreCalculated]);

  const updateProfile = useCallback(async (profileUpdates: Partial<UserProfile>) => {
    try {
      const updatedProfile = { ...profile, ...profileUpdates } as UserProfile;
      setProfile(updatedProfile);
      if (user?.id) {
        await DataService.updateProfile(user.id, {
          firstName: (profileUpdates as any).firstName ?? (updatedProfile as any).firstName,
          surname: (profileUpdates as any).surname ?? (updatedProfile as any).surname,
          preferredName: (profileUpdates as any).preferredName,
          gender: profileUpdates.gender,
          heightCm: profileUpdates.height,
          weightKg: profileUpdates.weight,
        });
        // Sync full profile so Toto knows everything (fire-and-forget)
        DataService.syncProfileData(user.id, updatedProfile).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, [profile, user?.id]);

  const addBiomarker = useCallback(async (biomarker: Biomarker) => {
    try {
      const saved = await DataService.addBiomarker({
        name: biomarker.name,
        value: biomarker.value,
        unit: biomarker.unit,
        category: biomarker.category,
      });
      const updatedBiomarkers = [...biomarkers, saved];
      setBiomarkers(updatedBiomarkers);
      setHealthScoreCalculated(false);
      await recalculateHealthScore(updatedBiomarkers);
    } catch (error) {
      console.error('Failed to add biomarker:', error);
      throw error;
    }
  }, [biomarkers, recalculateHealthScore]);

  const updateBiomarker = useCallback(async (id: string, updates: Partial<Biomarker>) => {
    try {
      const updatedBiomarkers = biomarkers.map(b =>
        b.id === id ? { ...b, ...updates } : b,
      );
      setBiomarkers(updatedBiomarkers);
      setHealthScoreCalculated(false);
      await recalculateHealthScore(updatedBiomarkers);
    } catch (error) {
      console.error('Failed to update biomarker:', error);
      throw error;
    }
  }, [biomarkers, recalculateHealthScore]);

  const addLabResult = useCallback(async (labResult: LabResult) => {
    try {
      setLabResults(prev => [...prev, labResult]);
      setHealthScoreCalculated(false);
      await recalculateHealthScore(biomarkers);
    } catch (error) {
      console.error('Failed to add lab result:', error);
      throw error;
    }
  }, [biomarkers, recalculateHealthScore]);

  const syncDeviceData = useCallback(async (data: DeviceData) => {
    try {
      const updatedData = [...deviceData, data];
      await AsyncStorage.setItem('deviceData', JSON.stringify(updatedData));
      setDeviceData(updatedData);
      try {
        const ts = data?.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString();
        await AsyncStorage.setItem('@corehealth_last_sync_at', ts);
      } catch (e) { console.error(e); }
    } catch (error) {
      console.error('Failed to sync device data:', error);
      throw error;
    }
  }, [deviceData]);

  const generateDailyInsights = useCallback(async () => {
    await _generateDailyInsights(profile, biomarkers, healthScore, setDailyInsights);
  }, [profile, biomarkers, healthScore]);

  const updateTravelHealthData = useCallback(async (locationData: LocationData) => {
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
  }, [originTimezone, originLocation, settings]);

  const updateLocation = useCallback(async (location: string) => {
    await _updateLocation(location, updateTravelHealthData);
  }, [updateTravelHealthData]);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    return _getCurrentLocation();
  }, []);

  const setOriginTimezone = useCallback(async (timezone: string, location?: string) => {
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
  }, [travelHealth, updateTravelHealthData]);

  const calculateJetLag = useCallback((destinationTimezone: string, destinationLocation: string): JetLagData | null => {
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
  }, [originTimezone, originLocation, settings]);

  const addJetLagPlanningEvent = useCallback(async (event: Omit<JetLagPlanningEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await _addJetLagPlanningEvent(event, jetLagPlanningEvents, setJetLagPlanningEvents);
    } catch (error) {
      console.error('Failed to add jet lag planning event:', error);
      throw error;
    }
  }, [jetLagPlanningEvents]);

  const updateJetLagPlanningEvent = useCallback(async (id: string, updates: Partial<JetLagPlanningEvent>) => {
    try {
      await _updateJetLagPlanningEvent(id, updates, jetLagPlanningEvents, setJetLagPlanningEvents);
    } catch (error) {
      console.error('Failed to update jet lag planning event:', error);
      throw error;
    }
  }, [jetLagPlanningEvents]);

  const deleteJetLagPlanningEvent = useCallback(async (id: string) => {
    try {
      await _deleteJetLagPlanningEvent(id, jetLagPlanningEvents, setJetLagPlanningEvents);
    } catch (error) {
      console.error('Failed to delete jet lag planning event:', error);
      throw error;
    }
  }, [jetLagPlanningEvents]);

  const getUpcomingJetLagEvents = useCallback((): JetLagPlanningEvent[] => {
    return _getUpcomingJetLagEvents(jetLagPlanningEvents);
  }, [jetLagPlanningEvents]);

  const resetHealthScoreCalculation = useCallback(() => {
    setHealthScoreCalculated(false);
  }, []);

  const value: HealthDataContextType = useMemo(() => ({
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
    refreshAllHealthData: loadHealthData,
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
  }), [
    profile, biomarkers, labResults, deviceData, dailyInsights, healthScore,
    travelHealth, bodySystems, jetLagPlanningEvents, isLoading, derivedRiskFeatures,
    refreshFamilyRiskFeatures, loadHealthData, updateProfile, addBiomarker, updateBiomarker,
    addLabResult, syncDeviceData, generateDailyInsights, updateLocation,
    getCurrentLocation, updateTravelHealthData, setOriginTimezone, calculateJetLag,
    addJetLagPlanningEvent, updateJetLagPlanningEvent, deleteJetLagPlanningEvent,
    getUpcomingJetLagEvents, resetHealthScoreCalculation,
  ]);

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
