// Travel, Location, Weather, and Medication Availability Types

export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe';

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

export interface LocationData {
  name: string;
  country: string;
  coordinates: { latitude: number; longitude: number };
  timezone: string;
  elevation?: number;
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
  distance?: number;
  emergencyServices?: boolean;
  acceptsInsurance?: string[];
  specialties?: string[];
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

export interface TimeZoneInfo {
  currentTime: string;
  currentDate: string;
  timezone: string;
  offsetFromUTC: number;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  cloudCover: number;
  description: string;
  icon: string;
}

export interface HeatIndexData {
  heatIndex: number;
  heatIndexFahrenheit: number;
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
  dailyIntake: number;
  hourlyIntake: number;
  adjustments: {
    temperature: number;
    altitude: number;
    humidity: number;
    activity: number;
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

export interface MedicationPharmacy {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  isOpen: boolean;
  hasStock: boolean | null;
  requiresPrescription: boolean;
  phoneNumber?: string;
  website?: string;
  rating?: number;
  totalRatings?: number;
  priceLevel?: number;
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

export interface MedicationAvailability {
  medication: MedicationInfo;
  currentCountry: CountryMedicationStatus;
  nearbyPharmacies: MedicationPharmacy[];
  importRegulations: ImportRegulations;
  recommendations: string[];
  warnings: string[];
  alternatives: AlternativeMedication[];
}

export interface TravelMedicationKit {
  essentialMedications: string[];
  recommendedMedications: string[];
  prescriptionBackups: string[];
  countrySpecificNeeds: string[];
  emergencyContacts: string[];
}

export interface TravelHealth {
  location: string;
  country?: string;
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
  jetLagData?: import('./jetlag').JetLagData;
  weatherData?: WeatherData;
  heatWarning?: ExtremeHeatWarning;
  hydrationRecommendation?: HydrationRecommendation;
  activitySafety?: ActivitySafetyData;
  medicationAvailability?: MedicationAvailability[];
  travelMedicationKit?: TravelMedicationKit;
  overallRiskLevel: RiskLevel;
  nearestHospital?: string;
  nearestPharmacy?: string;
  nearestHospitalData?: any;
  nearestPharmacyData?: any;
}
