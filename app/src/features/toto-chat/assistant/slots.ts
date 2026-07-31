// Slot schemas and command payload types for Health Assistant actions

// shared
export type ISODate = string; // YYYY-MM-DD
export type ISODateTime = string; // YYYY-MM-DDTHH:mm:ssZ

export interface TimelineEntry {
  id: string;
  type:
    | "Supplement"
    | "Appointment"
    | "Symptom"
    | "Allergy"
    | "Lab"
    | "Travel"
    | "System";
  title: string;
  description?: string;
  occurredAt: ISODateTime;
  meta?: Record<string, any>;
}

// supplements
export interface SupplementAdviceInput {
  nutrient: "Vitamin C";
  reason?: "deficiency" | "preventative" | "sick";
  constraints?: string[]; // vegan, sugar-free, low-acid
  dosePreferenceMg?: number; // e.g., 500
  budgetGBP?: number;
  country?: string; // for product availability
}

export interface SupplementAdviceResult {
  recommendedDoseMg: number;
  timing: "with_food" | "empty_stomach";
  notes: string[];
  products?: Array<{
    name: string;
    form: "tablet" | "capsule" | "powder";
    doseMg: number;
    price: number;
    url?: string;
  }>;
}

// appointments
export interface AppointmentRescheduleInput {
  appointmentId?: string;
  providerName?: string;
  newDate?: ISODate;
  newTime?: string; // 24h HH:mm
  locationPreference?: "same" | "virtual" | "in_person";
  reason?: string;
}

export interface AppointmentRescheduleResult {
  appointmentId: string;
  oldDateTime: ISODateTime;
  newDateTime: ISODateTime;
  location: string;
  status: "confirmed" | "pending_provider";
}

// symptoms
export interface SymptomLegPainInput {
  side?: "left" | "right" | "both" | "unspecified";
  region?: "hip" | "thigh" | "knee" | "calf" | "shin" | "ankle";
  onsetDate?: ISODate;
  severity?: number; // 0-10
  quality?: string; // sharp, dull, throbbing
  context?: string; // after run, woke up
  aggravators?: string[];
  relievers?: string[];
  redFlags?: string[]; // numbness, swelling, fever, DVT signs
}

export interface SymptomPlan {
  steps: Array<{
    order: number;
    title: string;
    details: string;
    toggleKey: string;
  }>; // toggle to mark done
  checkins: { frequency: "daily" | "twice_daily"; questions: string[] };
  safety: { urgentCareCriteria: string[] };
}

// allergy
export interface AllergyUpdateInput {
  allergen: "peanut";
  action: "add" | "update" | "remove";
  severity?: "mild" | "moderate" | "severe";
  reactionHistory?: string;
  epiPenOwned?: boolean;
}

// country card
export interface CountryCardInput {
  country: string;
  cardType: "insurance" | "residency" | "vaccination_passport" | "other";
  identifier: string;
  expiry?: ISODate;
  attachments?: Array<{ filename: string; uri: string }>;
}

// labs
export interface LabValue {
  biomarker: string;
  value: number;
  unit: string;
  refLow?: number;
  refHigh?: number;
}
export interface LabSubmitInput {
  panel: string;
  specimenDate: ISODate;
  values: LabValue[];
  source?: "pdf" | "image" | "manual" | "hl7";
}
export interface LabSubmitResult {
  panelId: string;
  updatedBiomarkers: Array<{
    name: string;
    trend: "up" | "down" | "flat";
    zScore?: number;
    status: "normal" | "high" | "low";
  }>;
}

// travel
export interface TravelChangeInput {
  tripId?: string;
  destination?: string;
  startDate: ISODate;
  endDate: ISODate;
  purpose?: string;
}
export interface TravelChangeResult {
  tripId: string;
  old: { start: ISODate; end: ISODate };
  now: { start: ISODate; end: ISODate };
  advisoriesRefreshed: boolean;
}
