import type { AttachedFile } from './user';

export interface MedicalCondition {
  id: string;
  condition: string;
  diagnosedDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved' | 'managed';
  resolvedDate?: string;
  notes?: string;
  attachments?: AttachedFile[];
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
  attachments?: AttachedFile[];
}

export interface FamilyCondition {
  id: string;
  relation: string;
  condition: string;
  ageOfOnset?: number;
  notes?: string;
  attachments?: AttachedFile[];
  side?: 'maternal' | 'paternal';
  status?: 'active' | 'resolved';
  resolvedDate?: string;
}

export interface Vaccination {
  id: string;
  name: string;
  date: Date;
  nextDue?: Date;
  location?: string;
  batchNumber?: string;
  notes?: string;
  attachments?: AttachedFile[];
}

export interface Screening {
  id: string;
  name: string;
  date: Date;
  nextDue?: Date;
  result: 'normal' | 'abnormal' | 'inconclusive';
  location?: string;
  notes?: string;
  attachments?: AttachedFile[];
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

export interface BodySystem {
  id: string;
  name: string;
  coordinates: { x: number; y: number };
  biomarkers: Biomarker[];
  riskScore: number;
  lastAssessment: Date;
}

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

// Family Link Types
export type RelationshipDegree = 'parent' | 'child' | 'sibling' | 'partner' | 'other';
export type RelationshipDirection = 'one_way' | 'reciprocal';
export type RelationshipStatus = 'pending' | 'active' | 'revoked';

export interface RelationshipLink {
  id: string;
  ownerSupabaseUid: string;
  relativeUidHash: string;
  relativeSupabaseUid?: string | null;
  degree: RelationshipDegree;
  direction: RelationshipDirection;
  status: RelationshipStatus;
  createdAt: string;
  updatedAt: string;
}

export type RelationDegreeToRecipients = 'parent' | 'child' | 'sibling' | 'partner';

export interface HereditarySignal {
  id: string;
  issuerSupabaseUid: string;
  recipientSupabaseUid: string;
  relationDegreeToRecipients: RelationDegreeToRecipients;
  conditionCode: string;
  onsetAgeBand: string;
  severityBand?: string | null;
  lifestyleComponent?: string | null;
  expiresAt?: string | null;
  status: 'active' | 'revoked';
  ciphertext: string;
  createdAt: string;
  updatedAt: string;
}

export interface DerivedRiskFeature {
  key:
    | 'pc_screening_earlier'
    | 'breast_cancer_watchlist'
    | 't2d_family_risk'
    | 'cad_family_risk'
    | 'colorectal_earlier'
    | 'glaucoma_watchlist'
    | string;
  value: boolean;
  rationale?: string;
  sourceSignalIds: string[];
  createdAt: string;
  expiresAt?: string | null;
}
