export interface User {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  surname?: string;
  preferredName?: string;
  username?: string;
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
  secondaryPhone?: string;
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

export interface PastAppointment {
  id: string;
  title: string;
  doctor?: string;
  date: Date;
  location?: string;
  fileUrl?: string;
  fileSize?: number;
  notes?: string;
}

export interface HealthID {
  id: string;
  country: string;
  countryCode: string;
  idType: string;
  idNumber: string;
  isPrimary: boolean;
  notes?: string;
}

export interface AttachedFile {
  uri: string;
  name: string;
  type?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  duration?: string;
  notes?: string;
  attachments?: AttachedFile[];
  endDate?: string;
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
