// User and Authentication Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  ethnicity?: string;
  medicalHistory: MedicalCondition[];
  familyHistory: FamilyCondition[];
  vaccinations: Vaccination[];
  allergies: string[];
}

// Health Data Types
export interface MedicalCondition {
  id: string;
  name: string;
  diagnosedDate: Date;
  status: 'active' | 'resolved' | 'managed';
  notes?: string;
}

export interface FamilyCondition {
  id: string;
  relation: string;
  condition: string;
  ageOfOnset?: number;
}

export interface Vaccination {
  id: string;
  name: string;
  date: Date;
  nextDue?: Date;
  location?: string;
  batchNumber?: string;
}

export interface LabResult {
  id: string;
  testName: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  date: Date;
  category: 'blood' | 'urine' | 'imaging' | 'other';
  status: 'normal' | 'high' | 'low' | 'critical';
}

export interface DeviceData {
  id: string;
  deviceType: 'whoop' | 'apple_watch' | 'eight_sleep' | 'smart_toothbrush' | 'smart_toilet';
  timestamp: Date;
  metrics: Record<string, any>;
}

export interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: 'cardiovascular' | 'metabolic' | 'hormonal' | 'inflammatory' | 'nutritional';
  trend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

// Body Map Types
export interface BodySystem {
  id: string;
  name: string;
  coordinates: { x: number; y: number };
  biomarkers: Biomarker[];
  riskScore: number;
  lastAssessment: Date;
}

// Travel and Location Types
export interface TravelHealth {
  location: string;
  airQualityIndex: number;
  waterQuality: 'excellent' | 'good' | 'fair' | 'poor';
  localOutbreaks: string[];
  vaccinations: string[];
  healthAlerts: string[];
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EmailVerification: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  BodyMap: undefined;
  Profile: undefined;
  Devices: undefined;
  Travel: undefined;
};

// Dashboard Types
export interface DailyInsight {
  id: string;
  title: string;
  description: string;
  category: 'sleep' | 'activity' | 'nutrition' | 'stress' | 'recovery';
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: string;
}

export interface HealthScore {
  overall: number;
  sleep: number;
  activity: number;
  stress: number;
  recovery: number;
  nutrition: number;
} 