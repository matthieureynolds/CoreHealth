// Settings Types for CoreHealth App

export interface GeneralSettings {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  units: 'metric' | 'imperial';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  timezone: 'auto' | string;
}

export interface NotificationSettings {
  enabled: boolean;
  healthSummaries: boolean;
  biomarkerAlerts: boolean;
  vaccinationReminders: boolean;
  travelWarnings: boolean;
  syncIssues: boolean;
  emergencyAlerts: boolean;
  appUpdates: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
  };
}

export interface PrivacySecuritySettings {
  biometricAuth: boolean;
  sessionTimeout: '15min' | '30min' | '1hour' | '4hours' | 'never';
  twoFactorAuth: boolean;
  locationServices: boolean;
  contactsAccess: boolean;
  calendarAccess: boolean;
  dataSharing: {
    analytics: boolean;
    anonymizedData: boolean;
    thirdPartyApps: boolean;
  };
}

export interface DataSyncSettings {
  autoSync: boolean;
  backgroundSync: boolean;
  syncFrequency: '5min' | '15min' | '30min' | '1hour' | '4hours' | 'manual';
  wifiOnly: boolean;
  dataRetention: '6months' | '1year' | '2years' | '5years' | 'forever';
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface HealthEmergencySettings {
  emergencyContacts: EmergencyContact[];
  medicalId: MedicalIdInfo;
  autoLocationForHealth: boolean;
  shareLocationInEmergency: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  isEmergencyContact: boolean;
  hasMedicalInfo: boolean;
}

export interface MedicalIdInfo {
  enabled: boolean;
  bloodType: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyNotes: string;
}

export interface TravelSettings {
  autoEnableTravelHealth: boolean;
  medicationTimezoneAlerts: boolean;
  autoLocationDetection: boolean;
  travelInsuranceReminders: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  voiceFeatures: boolean;
  screenReader: boolean;
  hapticFeedback: boolean;
}

export interface AppSettings {
  firstLaunch: boolean;
  onboardingCompleted: boolean;
  lastVersion: string;
  crashReporting: boolean;
  performanceTracking: boolean;
  betaFeatures: boolean;
}

// Combined Settings Interface
export interface UserSettings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  privacy: PrivacySecuritySettings;
  dataSync: DataSyncSettings;
  healthEmergency: HealthEmergencySettings;
  travel: TravelSettings;
  accessibility: AccessibilitySettings;
  app: AppSettings;
}

// Settings Action Types
export type SettingsAction = 
  | { type: 'UPDATE_GENERAL'; payload: Partial<GeneralSettings> }
  | { type: 'UPDATE_NOTIFICATIONS'; payload: Partial<NotificationSettings> }
  | { type: 'UPDATE_PRIVACY'; payload: Partial<PrivacySecuritySettings> }
  | { type: 'UPDATE_DATA_SYNC'; payload: Partial<DataSyncSettings> }
  | { type: 'UPDATE_HEALTH_EMERGENCY'; payload: Partial<HealthEmergencySettings> }
  | { type: 'UPDATE_TRAVEL'; payload: Partial<TravelSettings> }
  | { type: 'UPDATE_ACCESSIBILITY'; payload: Partial<AccessibilitySettings> }
  | { type: 'UPDATE_APP'; payload: Partial<AppSettings> }
  | { type: 'RESET_SETTINGS' }
  | { type: 'LOAD_SETTINGS'; payload: UserSettings };

// Default Settings
export const defaultSettings: UserSettings = {
  general: {
    language: 'English',
    theme: 'auto',
    units: 'metric',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    timezone: 'auto',
  },
  notifications: {
    enabled: true,
    healthSummaries: true,
    biomarkerAlerts: true,
    vaccinationReminders: true,
    travelWarnings: true,
    syncIssues: true,
    emergencyAlerts: true,
    appUpdates: false,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
  },
  privacy: {
    biometricAuth: false,
    sessionTimeout: '30min',
    twoFactorAuth: false,
    locationServices: true,
    contactsAccess: false,
    calendarAccess: false,
    dataSharing: {
      analytics: true,
      anonymizedData: true,
      thirdPartyApps: false,
    },
  },
  dataSync: {
    autoSync: true,
    backgroundSync: true,
    syncFrequency: '15min',
    wifiOnly: false,
    dataRetention: '2years',
    backupEnabled: true,
    backupFrequency: 'weekly',
  },
  healthEmergency: {
    emergencyContacts: [],
    medicalId: {
      enabled: false,
      bloodType: '',
      allergies: [],
      medications: [],
      medicalConditions: [],
      emergencyNotes: '',
    },
    autoLocationForHealth: true,
    shareLocationInEmergency: true,
  },
  travel: {
    autoEnableTravelHealth: true,
    medicationTimezoneAlerts: true,
    autoLocationDetection: true,
    travelInsuranceReminders: false,
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    voiceFeatures: false,
    screenReader: false,
    hapticFeedback: true,
  },
  app: {
    firstLaunch: true,
    onboardingCompleted: false,
    lastVersion: '1.0.0',
    crashReporting: true,
    performanceTracking: true,
    betaFeatures: false,
  },
}; 