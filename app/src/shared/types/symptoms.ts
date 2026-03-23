export interface SymptomEntry {
  id: string;
  timestamp: string;
  type: 'physical' | 'mental';
  category: string;
  severity: number; // 1-10 scale
  duration: 'just_started' | '1_hour' | 'few_hours' | 'all_day' | 'multiple_days';
  location?: string; // For physical symptoms
  notes?: string;
  photoUri?: string;
  weather?: {
    temperature?: number;
    condition?: string;
    humidity?: number;
  };
  activity?: string;
  medications?: string[];
  tags?: string[];
  factors?: string[];
}

export interface StateOfMindEntry {
  id: string;
  timestamp: string;
  mood: number; // 1-10 scale (1 = very unpleasant, 10 = very pleasant)
  energy: number; // 1-10 scale
  stress: number; // 1-10 scale
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  anxiety: number; // 1-10 scale
  depression: number; // 1-10 scale
  notes?: string;
  factors?: string[]; // What's affecting mood
}

export interface SymptomCategory {
  id: string;
  name: string;
  type: 'physical' | 'mental';
  icon: string;
  color: string;
  subcategories?: string[];
}

export interface SymptomStats {
  totalEntries: number;
  physicalEntries: number;
  mentalEntries: number;
  mostCommonSymptom: string;
  averageSeverity: number;
  symptomFrequency: { [key: string]: number };
  moodTrend: 'improving' | 'stable' | 'declining';
  lastEntry: string;
}

export interface StateOfMindChartData {
  period: 'weekly' | 'monthly' | '6months' | 'yearly';
  data: {
    date: string;
    mood: number;
    energy: number;
    stress: number;
    symptoms: number; // Count of symptoms logged that day
  }[];
  averageMood: number;
  trend: 'up' | 'down' | 'stable';
  insights: string[];
}

export interface QuickLogData {
  type: 'physical' | 'mental';
  category: string;
  severity: number;
  duration: string;
  notes?: string;
  location?: string;
  factors?: string[];
}

export const PHYSICAL_SYMPTOM_CATEGORIES: SymptomCategory[] = [
  { id: 'headache', name: 'Headache', type: 'physical', icon: 'head-outline', color: '#FF6B6B', subcategories: ['Tension', 'Migraine', 'Sinus'] },
  { id: 'fever', name: 'Fever', type: 'physical', icon: 'thermometer-outline', color: '#FF9500' },
  { id: 'nausea', name: 'Nausea', type: 'physical', icon: 'medical-outline', color: '#FFD93D' },
  { id: 'fatigue', name: 'Fatigue', type: 'physical', icon: 'battery-dead-outline', color: '#8E8E93' },
  { id: 'pain', name: 'Pain', type: 'physical', icon: 'flash-outline', color: '#FF3B30', subcategories: ['Head', 'Chest', 'Back', 'Stomach', 'Muscle', 'Joint'] },
  { id: 'dizziness', name: 'Dizziness', type: 'physical', icon: 'refresh-outline', color: '#5856D6' },
  { id: 'shortness_breath', name: 'Shortness of Breath', type: 'physical', icon: 'airplane-outline', color: '#007AFF' },
  { id: 'chest_pain', name: 'Chest Pain', type: 'physical', icon: 'heart-outline', color: '#FF3B30' },
  { id: 'stomach_ache', name: 'Stomach Ache', type: 'physical', icon: 'restaurant-outline', color: '#4CD964' },
  { id: 'cough', name: 'Cough', type: 'physical', icon: 'mic-outline', color: '#FF9500' },
];

export const MENTAL_SYMPTOM_CATEGORIES: SymptomCategory[] = [
  { id: 'anxiety', name: 'Anxiety', type: 'mental', icon: 'alert-circle-outline', color: '#FF9500' },
  { id: 'depression', name: 'Depression', type: 'mental', icon: 'cloudy-outline', color: '#5856D6' },
  { id: 'stress', name: 'Stress', type: 'mental', icon: 'flame-outline', color: '#FF3B30' },
  { id: 'irritability', name: 'Irritability', type: 'mental', icon: 'flash-outline', color: '#FFD93D' },
  { id: 'overwhelmed', name: 'Overwhelmed', type: 'mental', icon: 'layers-outline', color: '#8E8E93' },
  { id: 'sadness', name: 'Sadness', type: 'mental', icon: 'rainy-outline', color: '#007AFF' },
  { id: 'anger', name: 'Anger', type: 'mental', icon: 'thunderstorm-outline', color: '#FF3B30' },
  { id: 'loneliness', name: 'Loneliness', type: 'mental', icon: 'person-outline', color: '#8E8E93' },
  { id: 'confusion', name: 'Confusion', type: 'mental', icon: 'help-circle-outline', color: '#FFD93D' },
  { id: 'panic', name: 'Panic', type: 'mental', icon: 'warning-outline', color: '#FF3B30' },
];

export const DURATION_OPTIONS = [
  { value: 'just_started', label: 'Just started' },
  { value: '1_hour', label: '1 hour' },
  { value: 'few_hours', label: 'Few hours' },
  { value: 'all_day', label: 'All day' },
  { value: 'multiple_days', label: 'Multiple days' },
];

export const SEVERITY_LABELS = [
  'Very Mild',
  'Mild', 
  'Moderate',
  'Moderate-Severe',
  'Severe',
  'Very Severe',
  'Extreme',
  'Unbearable',
  'Critical',
  'Emergency'
];
