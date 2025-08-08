// User and Authentication Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  surname?: string;
  preferredName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrimaryDoctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email?: string;
  office: string;
  address?: string;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  notes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email?: string;
  office: string;
  address?: string;
  notes?: string;
  isRegistered: boolean;
}

export interface MedicalRecord {
  id: string;
  name: string;
  type: 'lab_result' | 'imaging' | 'prescription' | 'consultation' | 'procedure' | 'other';
  date: Date;
  fileUrl?: string;
  fileSize?: number;
  notes?: string;
  tags?: string[];
}

export interface HealthID {
  id: string;
  country: string;
  countryCode: string;
  idType: string; // e.g., "NHS Number", "Carte Vitale", "Medicare"
  idNumber: string;
  isPrimary: boolean;
  notes?: string;
}

export interface UserProfile {
  userId: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  birthDate?: string; // ISO date string
  ethnicity?: string;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
  medicalHistory: MedicalCondition[];
  medications: Medication[];
  familyHistory: FamilyCondition[];
  surgeries: Surgery[];
  vaccinations: Vaccination[];
  screenings: Screening[];
  allergies: Allergy[];
  lifestyle: LifestyleInfo;
  organSpecificConditions: OrganCondition[];
  primaryDoctor?: PrimaryDoctor;
  emergencyContacts?: EmergencyContact[];
  healthIDs?: HealthID[];
  doctors?: Doctor[];
  medicalRecords?: MedicalRecord[];
}

// Health Data Types
export interface MedicalCondition {
  id: string;
  condition: string;
  diagnosedDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved' | 'managed';
  resolvedDate?: string;
  notes?: string;
}

export interface Allergy {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved';
  reaction?: string;
  startDate: string;
  endDate?: string;
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
  notes?: string;
}

export interface Screening {
  id: string;
  name: string;
  date: Date;
  nextDue?: Date;
  result: 'normal' | 'abnormal' | 'inconclusive';
  location?: string;
  notes?: string;
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
  deviceType:
    | 'whoop'
    | 'apple_watch'
    | 'eight_sleep'
    | 'smart_toothbrush'
    | 'smart_toilet';
  timestamp: Date;
  metrics: Record<string, any>;
}

export interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  category:
    | 'cardiovascular'
    | 'metabolic'
    | 'hormonal'
    | 'inflammatory'
    | 'nutritional';
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
  coordinates?: { latitude: number; longitude: number };
  lastUpdated: Date;
  airQuality: HealthMetric;
  pollenLevels: HealthMetric;
  waterSafety: HealthMetric;
  diseaseRisk: HealthMetric;
  vaccinations: VaccinationInfo;
  uvIndex: HealthMetric;
  altitudeRisk: HealthMetric;
  foodSafety: HealthMetric;
  healthcareFacilities?: HealthcareFacilities;
  emergencyContacts?: EmergencyContacts;
  timeZoneInfo?: TimeZoneInfo;
  jetLagData?: JetLagData;
  // New weather and health safety features
  weatherData?: WeatherData;
  heatWarning?: ExtremeHeatWarning;
  hydrationRecommendation?: HydrationRecommendation;
  activitySafety?: ActivitySafetyData;
  // Medication availability
  medicationAvailability?: MedicationAvailability[];
  travelMedicationKit?: TravelMedicationKit;
  overallRiskLevel: RiskLevel;
}

export interface HealthcareFacilities {
  hospitals: HealthcareFacility[];
  pharmacies: HealthcareFacility[];
  clinics: HealthcareFacility[];
  dentists: HealthcareFacility[];
  total: number;
  nearestHospital?: HealthcareFacility;
  nearestPharmacy?: HealthcareFacility;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'PHARMACY' | 'DOCTOR' | 'DENTIST' | 'PHYSIOTHERAPIST' | 'VETERINARY_CARE';
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  openingHours?: {
    openNow: boolean;
    periods?: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
    weekdayText?: string[];
  };
  phoneNumber?: string;
  website?: string;
  photos?: string[];
  distance?: number; // in meters
  emergencyServices?: boolean;
  acceptsInsurance?: string[];
  specialties?: string[];
}

export interface EmergencyContacts {
  countryCode: string;
  country: string;
  emergency: string;
  police: string;
  fire: string;
  ambulance: string;
  poisonControl?: string;
  mentalHealth?: string;
  nonEmergencyMedical?: string;
  touristHotline?: string;
}

export interface HealthMetric {
  value: number | string;
  unit?: string;
  riskLevel: RiskLevel;
  status: string;
  recommendation: string;
  icon: string;
  description: string;
  additionalInfo?: string;
}

export interface VaccinationInfo {
  required: string[];
  recommended: string[];
  riskLevel: RiskLevel;
  recommendation: string;
  icon: string;
  description: string;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe';

export interface LocationData {
  name: string;
  country: string;
  coordinates: { latitude: number; longitude: number };
  timezone: string;
  elevation?: number;
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
  HealthAssistant: undefined;
  Travel: undefined;
};

export type ProfileTabParamList = {
  ProfileTabs: undefined;
  ProfileDetails: undefined;
  Settings: undefined;
  EditProfile: undefined;
  EditName: undefined;
  EditPhysicalStats: undefined;
  HealthIDs: undefined;
  Conditions: undefined;
  Medications: undefined;
  Allergies: undefined;
  FamilyHistory: undefined;
  Vaccinations: undefined;
  Screenings: undefined;
  UploadMedicalRecord: undefined;
  ViewMedicalRecords: undefined;
  GenerateHealthReport: undefined;
  ShareWithDoctor: undefined;
  MedicalHistory: undefined;
  EmergencyContacts: undefined;
  PrimaryDoctor: undefined;
  BiomarkerVisibility: undefined;
  HelpSupport: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  About: undefined;
  // New Settings Screens
  AccountSettings: undefined;
  ConnectedDevices: undefined;
  DisplayFormat: undefined;
  Appearance: undefined;
  Notifications: undefined;
  TravelSettings: undefined;
  DataSync: undefined;
  PrivacySecurity: undefined;
  LegalCompliance: undefined;
  SupportHelp: undefined;
  AppInfo: undefined;
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

// Jet Lag and Time Zone Types
export type JetLagSeverity = 'minimal' | 'mild' | 'moderate' | 'severe';

export interface SleepScheduleAdjustment {
  totalTimeZoneDifference: number;
  direction: 'eastward' | 'westward';
  daysToAdjust: number;
  maxDailyAdjustment: number;
  dailySchedule: Array<{
    day: number;
    bedtime: string;
    wakeTime: string;
    adjustment: number;
  }>;
  strategy: string;
  recommendations: string[];
}

export interface LightExposureSchedule {
  direction: 'eastward' | 'westward';
  strategy: string;
  schedule: Array<{
    day: number;
    morningLight: string;
    eveningAvoidance: string;
    duration: number;
    notes: string;
  }>;
  generalTips: string[];
}

export interface JetLagData {
  originTimezone: string;
  destinationTimezone: string;
  originLocation: string;
  destinationLocation: string;
  timeZoneDifference: number;
  severity: JetLagSeverity;
  estimatedRecoveryDays: number;
  sleepAdjustment: SleepScheduleAdjustment;
  lightExposureSchedule: LightExposureSchedule;
  destinationTime: {
    time: string;
    date: string;
    timezone: string;
  };
  recommendations: string[];
}

export interface JetLagPlanningEvent {
  id: string;
  destination: string;
  destinationTimezone: string;
  departureDate: string; // ISO date string
  returnDate?: string; // ISO date string
  timeZoneDifference: number;
  preparationStartDate: string; // Calculated: departureDate - daysToAdjust
  daysToAdjust: number;
  sleepAdjustment: SleepScheduleAdjustment;
  lightExposureSchedule: LightExposureSchedule;
  status: 'upcoming' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface TimeZoneInfo {
  currentTime: string;
  currentDate: string;
  timezone: string;
  offsetFromUTC: number;
}

// Weather and Heat Safety Types
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

export interface HydrationRecommendation {
  dailyIntake: number; // liters
  hourlyIntake: number; // ml
  adjustments: {
    temperature: number; // ml adjustment
    altitude: number; // ml adjustment
    humidity: number; // ml adjustment
    activity: number; // ml adjustment
  };
  warnings: string[];
  recommendations: string[];
  dehydrationRisk: 'low' | 'moderate' | 'high' | 'severe';
}

export interface ActivitySafetyData {
  outdoorSafety: 'safe' | 'caution' | 'avoid';
  bestTimes: string[];
  recommendations: string[];
  warnings: string[];
  airQualityImpact: string;
  weatherImpact: string;
  combinedRisk: 'low' | 'moderate' | 'high' | 'severe';
}

// Medication Availability Types
export interface MedicationInfo {
  id: string;
  name: string;
  genericName: string;
  brandNames: string[];
  category: 'prescription' | 'over_the_counter' | 'controlled_substance' | 'restricted';
  description: string;
  commonUses: string[];
}

export interface CountryMedicationStatus {
  country: string;
  countryCode: string;
  availability: 'available' | 'prescription_required' | 'restricted' | 'banned' | 'unknown';
  alternativeNames: string[];
  localEquivalents: string[];
  prescriptionRequired: boolean;
  restrictions: string[];
  notes?: string;
  pharmacyAvailability: 'widely_available' | 'limited' | 'specialty_only' | 'unavailable' | 'unknown';
}

export interface MedicationAvailability {
  medication: MedicationInfo;
  currentCountry: CountryMedicationStatus;
  nearbyPharmacies: MedicationPharmacy[];
  importRegulations: ImportRegulations;
  recommendations: string[];
  warnings: string[];
  alternatives: AlternativeMedication[];
}

export interface MedicationPharmacy {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: number; // meters
  isOpen: boolean;
  hasStock: boolean | null; // null if unknown
  requiresPrescription: boolean;
  phoneNumber?: string;
  website?: string;
  rating?: number;
  totalRatings?: number;
  priceLevel?: number; // 1-4 scale
  specialties: string[];
  openingHours?: {
    weekdayText: string[];
    currentStatus: 'open' | 'closed' | 'closing_soon' | 'unknown';
    nextOpenClose?: {
      time: string;
      day: string;
    };
  };
  photos?: string[];
  services?: string[];
  accessibility?: string[];
  paymentMethods?: string[];
  pharmacyType: 'chain' | 'independent' | 'hospital' | 'clinic' | 'supermarket' | 'unknown';
  languages?: string[];
}

export interface ImportRegulations {
  allowedQuantity: string;
  declarationRequired: boolean;
  prescriptionRequired: boolean;
  restrictions: string[];
  penalties: string[];
  contactInfo: string[];
}

export interface AlternativeMedication {
  name: string;
  activeIngredient: string;
  availability: 'available' | 'prescription_required' | 'restricted';
  similarity: 'exact_equivalent' | 'similar_effect' | 'alternative_treatment';
  notes: string;
}

export interface TravelMedicationKit {
  essentialMedications: string[];
  recommendedMedications: string[];
  prescriptionBackups: string[];
  countrySpecificNeeds: string[];
  emergencyContacts: string[];
}

// New interfaces for enhanced medical history
export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  duration?: string;
  notes?: string;
}

export interface Surgery {
  id: string;
  procedure: string;
  date: string;
  hospital?: string;
  surgeon?: string;
  complications?: string;
  notes?: string;
}

export interface LifestyleInfo {
  smoking: {
    status: 'never' | 'former' | 'current';
    packYears?: number;
    quitDate?: string;
  };
  alcohol: {
    frequency: 'never' | 'rarely' | 'monthly' | 'weekly' | 'daily';
    unitsPerWeek?: number;
  };
  diet: {
    type: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean' | 'other';
    restrictions?: string[];
    supplements?: string[];
  };
  exercise: {
    frequency: 'never' | 'rarely' | '1-2_times_week' | '3-4_times_week' | '5+_times_week' | 'daily';
    type?: string[];
    intensity?: 'low' | 'moderate' | 'high';
    hoursPerWeek?: number;
  };
  sleep: {
    averageHoursPerNight?: number;
    sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
    sleepDisorders?: string[];
  };
  stress: {
    level: 'low' | 'moderate' | 'high' | 'severe';
    managementTechniques?: string[];
  };
}

export interface OrganCondition {
  id: string;
  organSystem: 'cardiovascular' | 'respiratory' | 'digestive' | 'nervous' | 'endocrine' | 'immune' | 'urinary' | 'reproductive' | 'musculoskeletal' | 'integumentary';
  condition: string;
  diagnosedDate?: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved' | 'managed';
  notes?: string;
}
