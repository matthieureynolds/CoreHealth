import { Ionicons } from '@expo/vector-icons';
import { LabResult } from './results/types';

export const LOWER_IS_BETTER_IDS: readonly string[] = [
  'total_cholesterol',
  'ldl_cholesterol',
  'glucose',
  'creatinine',
];

export const getStatusColor = (status: LabResult['status']): string => {
  switch (status) {
    case 'optimal':    return '#30D158';
    case 'normal':     return '#32D74B';
    case 'borderline': return '#FF9F0A';
    case 'high':       return '#FF6B35';
    case 'low':        return '#FF3B30';
    default:           return '#8E8E93';
  }
};

export const getTrendIcon = (trend: LabResult['trend']): keyof typeof Ionicons.glyphMap => {
  switch (trend) {
    case 'up':     return 'trending-up';
    case 'down':   return 'trending-down';
    case 'stable': return 'remove';
    default:       return 'remove';
  }
};

export const isGoodTrend = (id: string, trend: LabResult['trend']): boolean => {
  if (LOWER_IS_BETTER_IDS.includes(id)) return trend === 'down';
  return trend === 'up';
};

export const getTrendColor = (trend: LabResult['trend'], good: boolean): string => {
  if (trend === 'stable') return '#8E8E93';
  return good ? '#30D158' : '#FF3B30';
};

export const getTrendLabel = (trend: LabResult['trend'], good: boolean): string => {
  if (trend === 'stable') return 'Stable';
  return good ? 'Improving' : 'Worsening';
};
