export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  EnvironmentalMetric: {
    metricId: 'air_quality' | 'pollen' | 'water_quality' | 'uv_index' | 'food_safety' | 'altitude' | 'outbreaks';
    label: string;
    value: string;
    status: 'excellent' | 'good' | 'moderate' | 'poor' | 'hazardous';
    score?: number;
    icon?: string;
  };
  ScoreDetail: {
    id: 'recovery' | 'biomarkers' | 'lifestyle';
    title: string;
    value: number;
    color: string;
    icon: string;
    subtitle?: string;
  };
  HealthScoreDetail: undefined;
};

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EmailSent: { email: string };
  EmailVerification: { email: string };
  PersonalInfo: undefined;
  MedicalDocuments: undefined;
  DeviceConnection: undefined;
  Permissions: undefined;
  FinishOnboarding: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  BodyMap: undefined;
  Profile: undefined;
  HealthAssistant: undefined;
  Travel: undefined;
};

export type SerializedTrip = {
  id: string;
  departureLocation: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  timezone: string;
  notes?: string;
  jetLagPlanner?: {
    departureTime: string;
    arrivalTime: string;
  };
};

export type TravelStackParamList = {
  TravelList: undefined;

  HealthMetrics: undefined;
  AirQuality: undefined;
  WaterSafety: undefined;
  UVIndex: undefined;
  FoodSafety: undefined;
  PollenMetric: undefined;
  Altitude: undefined;
  DiseaseOutbreak: undefined;

  NearbyHospitals: undefined;
  Vaccinations: undefined;
  TravelMedications: undefined;

  AddNewTrip: undefined;
  TripDetail: { trip: SerializedTrip };
};

export type ProfileTabParamList = {
  ProfileTabs: undefined;
  ProfileDetails: undefined;
  Settings: undefined;
  EditProfile: undefined;
  EditName: undefined;
  EditUsername: undefined;
  EditPhysicalStats: undefined;
  LifestyleInfo: undefined;
  CommunityLeaderboard: undefined;
  PrivateCircles: undefined;
  PublicLeagues: undefined;
  CountryLeaderboard: undefined;
  PublicLeagueDetail: { id: string; name: string };
  CircleDetail: { name?: string; members?: number } | undefined;
  CountryDetail: { name: string; code: string; score: number; delta: number; rank: number };
  SymptomRegistered: undefined;
  HealthIDs: undefined;
  ProfilePicture: undefined;
  Conditions: undefined;
  Medications: undefined;
  Allergies: undefined;
  FamilyHistory: undefined;
  Vaccinations: undefined;
  Screenings: undefined;
  UploadMedicalRecord: undefined;
  ViewMedicalRecords: undefined;
  PastAppointments: undefined;
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
  AccountSettings: undefined;
  EmailPassword: undefined;
  ConnectedDevices: undefined;
  DisplayFormat: undefined;
  Units: undefined;
  DateFormat: undefined;
  TimeFormat: undefined;
  Language: undefined;
  Appearance: undefined;
  Notifications: undefined;
  SupplementsMedicationReminders: undefined;
  MedicalAppointment: undefined;
  MonthlyHealthSummary: undefined;
  WeeklyHealthSummary: undefined;
  SleepReminders: undefined;
  LifestyleSettings: undefined;
  TravelSettings: undefined;
  PrivacySecurity: undefined;
  BiometricLock: undefined;
  LocationAccess: undefined;
  DataConsent: undefined;
  DataProcessingAgreement: undefined;
  DataRetentionPolicy: undefined;
  FamilyLink: undefined;
  FamilyLinkConsent: undefined;
  DataSharingSettings: undefined;
  HealthDataDownload: undefined;
  DeleteAccount: undefined;
  DataSync: undefined;
  LegalCompliance: undefined;
  SupportHelp: undefined;
  FAQ: undefined;
  AppInfo: undefined;
  ConsentForms: undefined;
  ComplianceNotices: undefined;
  ContactLegalTeam: undefined;
  RequestData: undefined;
};
