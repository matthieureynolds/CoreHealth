export * from './user';
export * from './health';
export * from './travel';
export * from './jetlag';
export * from './navigation';

// Also re-export domain-specific type files
export * from './settings';
export * from './biomarkers';
export * from './symptoms';

// UserProfile is composed from several domain types — define here so it can
// import from both user.ts and health.ts without circular deps.
import type {
  PrimaryDoctor,
  EmergencyContact,
  HealthID,
  Doctor,
  MedicalRecord,
  PastAppointment,
  Medication,
  Surgery,
  LifestyleInfo,
  OrganCondition,
} from './user';
import type {
  MedicalCondition,
  Allergy,
  FamilyCondition,
  Vaccination,
  Screening,
} from './health';

export interface UserProfile {
  userId: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  birthDate?: string;
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
  pastAppointments?: PastAppointment[];
}
