import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserProfile, 
  Biomarker, 
  LabResult, 
  DeviceData, 
  DailyInsight, 
  HealthScore,
  TravelHealth,
  BodySystem 
} from '../types';

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
}

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

interface HealthDataProviderProps {
  children: ReactNode;
}

export const HealthDataProvider: React.FC<HealthDataProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [dailyInsights, setDailyInsights] = useState<DailyInsight[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [travelHealth, setTravelHealth] = useState<TravelHealth | null>(null);
  const [bodySystems, setBodySystems] = useState<BodySystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHealthData();
    generateMockData();
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
      ] = await Promise.all([
        AsyncStorage.getItem('profile'),
        AsyncStorage.getItem('biomarkers'),
        AsyncStorage.getItem('labResults'),
        AsyncStorage.getItem('deviceData'),
        AsyncStorage.getItem('dailyInsights'),
        AsyncStorage.getItem('healthScore'),
      ]);

      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (storedBiomarkers) setBiomarkers(JSON.parse(storedBiomarkers));
      if (storedLabResults) setLabResults(JSON.parse(storedLabResults));
      if (storedDeviceData) setDeviceData(JSON.parse(storedDeviceData));
      if (storedInsights) setDailyInsights(JSON.parse(storedInsights));
      if (storedHealthScore) setHealthScore(JSON.parse(storedHealthScore));
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
        description: 'Your HRV is 15% above baseline, indicating excellent recovery.',
        category: 'recovery',
        priority: 'medium',
        actionable: true,
        action: 'Consider a moderate workout today.',
      },
      {
        id: '2',
        title: 'Hydration Reminder',
        description: 'You\'ve consumed 40% less water than usual yesterday.',
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
      await AsyncStorage.setItem('biomarkers', JSON.stringify(updatedBiomarkers));
      setBiomarkers(updatedBiomarkers);
    } catch (error) {
      console.error('Failed to add biomarker:', error);
      throw error;
    }
  };

  const updateBiomarker = async (id: string, updates: Partial<Biomarker>) => {
    try {
      const updatedBiomarkers = biomarkers.map(b => 
        b.id === id ? { ...b, ...updates } : b
      );
      await AsyncStorage.setItem('biomarkers', JSON.stringify(updatedBiomarkers));
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
    // Mock insight generation based on current data
    // In production, this would use AI/ML algorithms
    const insights: DailyInsight[] = [
      {
        id: Date.now().toString(),
        title: 'Weekly Health Summary',
        description: 'Your health metrics show positive trends this week.',
        category: 'recovery',
        priority: 'low',
        actionable: false,
      },
    ];
    
    setDailyInsights(prev => [...insights, ...prev]);
  };

  const updateLocation = async (location: string) => {
    try {
      // Mock travel health data
      const mockTravelHealth: TravelHealth = {
        location,
        airQualityIndex: Math.floor(Math.random() * 200),
        waterQuality: 'good',
        localOutbreaks: [],
        vaccinations: ['COVID-19', 'Influenza'],
        healthAlerts: [],
      };
      
      setTravelHealth(mockTravelHealth);
    } catch (error) {
      console.error('Failed to update location:', error);
      throw error;
    }
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
  };

  return <HealthDataContext.Provider value={value}>{children}</HealthDataContext.Provider>;
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
}; 