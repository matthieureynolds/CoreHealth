// Settings Types for TOTO App

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
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  notes?: string;
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
  jetLag: {
    chronotype: 'morning' | 'neutral' | 'evening';
    defaultPlanStyle: 'gentle' | 'aggressive';
    guidanceOptions: {
      caffeine: boolean;
      melatonin: boolean;
      naps: boolean;
    };
    notifications: {
      actionReminders: boolean;
      planUpdates: boolean;
      flightChanges: boolean;
    };
    privacy: {
      sharePlans: boolean;
      anonymizedData: boolean;
    };
  };
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  voiceFeatures: boolean;
  screenReader: boolean;
  hapticFeedback: boolean;
}

export interface LifestyleSettings {
  sleepSchedule: {
    wakeUpTime: string; // HH:MM format
    bedTime: string;    // HH:MM format
    timezone: string;
  };
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  workSchedule: {
    type: 'regular' | 'shift' | 'flexible' | 'irregular';
    startTime?: string; // HH:MM format
    endTime?: string;   // HH:MM format
    workDays?: number[]; // 0-6 (Sunday-Saturday)
  };
  dietaryPreferences: {
    restrictions: string[];
    goals: string[];
    mealTiming: 'regular' | 'intermittent_fasting' | 'custom';
  };
}

export interface BiomarkerSettings {
  units: {
    glucose: 'mg/dL' | 'mmol/L';
    cholesterol: 'mg/dL' | 'mmol/L';
    creatinine: 'mg/dL' | 'µmol/L';
    bloodPressure: 'mmHg' | 'kPa';
    weight: 'kg' | 'lbs';
    temperature: 'celsius' | 'fahrenheit';
  };
  visibility: {
    [biomarkerId: string]: boolean;
  };
  healthGoalPreset: 'longevity' | 'athletic' | 'disease_monitoring' | 'general_wellness' | 'custom';
  customGoals: {
    targetRanges: {
      [biomarkerId: string]: {
        min: number;
        max: number;
        unit: string;
      };
    };
    priorities: string[];
  };
  displaySettings: {
    showTrends: boolean;
    showPercentiles: boolean;
    groupByCategory: boolean;
    sortBy: 'alphabetical' | 'category' | 'last_updated' | 'risk_level' | 'custom';
  };
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
  lifestyle: LifestyleSettings;
  biomarkers: BiomarkerSettings;
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
  | { type: 'UPDATE_LIFESTYLE'; payload: Partial<LifestyleSettings> }
  | { type: 'UPDATE_BIOMARKERS'; payload: Partial<BiomarkerSettings> }
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
    jetLag: {
      chronotype: 'neutral',
      defaultPlanStyle: 'gentle',
      guidanceOptions: {
        caffeine: true,
        melatonin: false,
        naps: false,
      },
      notifications: {
        actionReminders: true,
        planUpdates: true,
        flightChanges: true,
      },
      privacy: {
        sharePlans: false,
        anonymizedData: true,
      },
    },
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    voiceFeatures: false,
    screenReader: false,
    hapticFeedback: true,
  },
  lifestyle: {
    sleepSchedule: {
      wakeUpTime: '07:00',
      bedTime: '23:00',
      timezone: 'auto',
    },
    activityLevel: 'moderately_active',
    workSchedule: {
      type: 'regular',
      startTime: '09:00',
      endTime: '17:00',
      workDays: [1, 2, 3, 4, 5], // Monday to Friday
    },
    dietaryPreferences: {
      restrictions: [],
      goals: [],
      mealTiming: 'regular',
    },
  },
  biomarkers: {
    units: {
      glucose: 'mg/dL',
      cholesterol: 'mg/dL',
      creatinine: 'mg/dL',
      bloodPressure: 'mmHg',
      weight: 'kg',
      temperature: 'celsius',
    },
    visibility: {
      'creatinine': true,
      'alt': true,
      'glucose': true,
      'cholesterol': true,
      'tsh': true,
      'vitamin_d': true,
      'free_t3': true,
      'ldl': true,
      'hdl': true,
      'hs_crp': true,
      'homa_ir': true,
      'resting_hr': true,
    },
    healthGoalPreset: 'general_wellness',
    customGoals: {
      targetRanges: {},
      priorities: [],
    },
    displaySettings: {
      showTrends: true,
      showPercentiles: true,
      groupByCategory: true,
      sortBy: 'category',
    },
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