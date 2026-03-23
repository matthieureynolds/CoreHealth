import type { Ionicons } from '@expo/vector-icons';

export interface MedicalEvent {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  status: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  doctor?: string;
  notes?: string;
  location?: string;
  attachedFile?: any;
}
