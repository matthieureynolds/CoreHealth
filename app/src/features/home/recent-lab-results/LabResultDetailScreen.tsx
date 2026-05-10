import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Modal,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { RootStackParamList } from '../../../shared/types';
import { getStatusColor, isGoodTrend, getTrendColor, getTrendLabel, getTrendIcon } from './utils';
import { getBiomarkerDetails } from './components/BiomarkerDetails';
import { LabResult } from './results/types';

type Route = RouteProp<RootStackParamList, 'LabResultDetail'>;
const { width: W } = Dimensions.get('window');


// ─── Data ───────────────────────────────────────────────────────────────────

const getHistoricalData = (id: string): { date: string; value: number }[] => {
  const map: Record<string, { date: string; value: number }[]> = {
    total_cholesterol: [
      { date: 'Aug 24', value: 215 }, { date: 'Nov 24', value: 205 },
      { date: 'Feb 25', value: 198 }, { date: 'May 25', value: 195 },
      { date: 'Nov 25', value: 188 }, { date: 'May 26', value: 180 },
    ],
    ldl_cholesterol: [
      { date: 'Aug 24', value: 125 }, { date: 'Nov 24', value: 118 },
      { date: 'Feb 25', value: 110 }, { date: 'May 25', value: 105 },
      { date: 'Nov 25', value: 100 }, { date: 'May 26', value: 95 },
    ],
    glucose: [
      { date: 'Aug 24', value: 92 }, { date: 'Nov 24', value: 90 },
      { date: 'Feb 25', value: 87 }, { date: 'May 25', value: 89 },
      { date: 'Nov 25', value: 86 }, { date: 'May 26', value: 88 },
    ],
    creatinine: [
      { date: 'Aug 24', value: 0.8 }, { date: 'Nov 24', value: 0.82 },
      { date: 'Feb 25', value: 0.85 }, { date: 'May 25', value: 0.87 },
      { date: 'Nov 25', value: 0.88 }, { date: 'May 26', value: 0.9 },
    ],
    hemoglobin: [
      { date: 'Aug 24', value: 13.8 }, { date: 'Nov 24', value: 14.0 },
      { date: 'Feb 25', value: 14.1 }, { date: 'May 25', value: 14.3 },
      { date: 'Nov 25', value: 14.1 }, { date: 'May 26', value: 14.2 },
    ],
    platelets: [
      { date: 'Aug 24', value: 240 }, { date: 'Nov 24', value: 235 },
      { date: 'Feb 25', value: 228 }, { date: 'May 25', value: 230 },
      { date: 'Nov 25', value: 225 }, { date: 'May 26', value: 220 },
    ],
    // Liver
    alt: [
      { date: 'Aug 24', value: 32 }, { date: 'Nov 24', value: 30 },
      { date: 'Feb 25', value: 29 }, { date: 'May 25', value: 27 },
      { date: 'Nov 25', value: 28 }, { date: 'May 26', value: 28 },
    ],
    ast: [
      { date: 'Aug 24', value: 25 }, { date: 'Nov 24', value: 24 },
      { date: 'Feb 25', value: 23 }, { date: 'May 25', value: 22 },
      { date: 'Nov 25', value: 23 }, { date: 'May 26', value: 22 },
    ],
    ggt: [
      { date: 'Aug 24', value: 30 }, { date: 'Nov 24', value: 28 },
      { date: 'Feb 25', value: 27 }, { date: 'May 25', value: 26 },
      { date: 'Nov 25', value: 25 }, { date: 'May 26', value: 25 },
    ],
    alp: [
      { date: 'Aug 24', value: 82 }, { date: 'Nov 24', value: 80 },
      { date: 'Feb 25', value: 79 }, { date: 'May 25', value: 78 },
      { date: 'Nov 25', value: 77 }, { date: 'May 26', value: 78 },
    ],
    total_bilirubin: [
      { date: 'Aug 24', value: 0.9 }, { date: 'Nov 24', value: 0.85 },
      { date: 'Feb 25', value: 0.82 }, { date: 'May 25', value: 0.8 },
      { date: 'Nov 25', value: 0.78 }, { date: 'May 26', value: 0.8 },
    ],
    // Heart extras
    hdl_c: [
      { date: 'Aug 24', value: 52 }, { date: 'Nov 24', value: 54 },
      { date: 'Feb 25', value: 55 }, { date: 'May 25', value: 56 },
      { date: 'Nov 25', value: 57 }, { date: 'May 26', value: 58 },
    ],
    ldl_c: [
      { date: 'Aug 24', value: 110 }, { date: 'Nov 24', value: 105 },
      { date: 'Feb 25', value: 100 }, { date: 'May 25', value: 98 },
      { date: 'Nov 25', value: 96 }, { date: 'May 26', value: 95 },
    ],
    triglycerides: [
      { date: 'Aug 24', value: 140 }, { date: 'Nov 24', value: 135 },
      { date: 'Feb 25', value: 130 }, { date: 'May 25', value: 125 },
      { date: 'Nov 25', value: 122 }, { date: 'May 26', value: 120 },
    ],
    apob: [
      { date: 'Aug 24', value: 0.95 }, { date: 'Nov 24', value: 0.92 },
      { date: 'Feb 25', value: 0.9 }, { date: 'May 25', value: 0.88 },
      { date: 'Nov 25', value: 0.86 }, { date: 'May 26', value: 0.85 },
    ],
    hs_crp: [
      { date: 'Aug 24', value: 1.2 }, { date: 'Nov 24', value: 1.0 },
      { date: 'Feb 25', value: 0.9 }, { date: 'May 25', value: 0.85 },
      { date: 'Nov 25', value: 0.82 }, { date: 'May 26', value: 0.8 },
    ],
    homocysteine: [
      { date: 'Aug 24', value: 10.2 }, { date: 'Nov 24', value: 9.5 },
      { date: 'Feb 25', value: 9.0 }, { date: 'May 25', value: 8.8 },
      { date: 'Nov 25', value: 8.6 }, { date: 'May 26', value: 8.5 },
    ],
    red_blood_cells: [
      { date: 'Aug 24', value: 4.8 }, { date: 'Nov 24', value: 4.85 },
      { date: 'Feb 25', value: 4.9 }, { date: 'May 25', value: 4.88 },
      { date: 'Nov 25', value: 4.9 }, { date: 'May 26', value: 4.9 },
    ],
    white_blood_cells: [
      { date: 'Aug 24', value: 6.5 }, { date: 'Nov 24', value: 6.3 },
      { date: 'Feb 25', value: 6.1 }, { date: 'May 25', value: 6.2 },
      { date: 'Nov 25', value: 6.0 }, { date: 'May 26', value: 6.2 },
    ],
    // Kidneys
    urea: [
      { date: 'Aug 24', value: 16 }, { date: 'Nov 24', value: 15.5 },
      { date: 'Feb 25', value: 15 }, { date: 'May 25', value: 14.8 },
      { date: 'Nov 25', value: 15 }, { date: 'May 26', value: 15 },
    ],
    sodium: [
      { date: 'Aug 24', value: 141 }, { date: 'Nov 24', value: 140 },
      { date: 'Feb 25', value: 139 }, { date: 'May 25', value: 140 },
      { date: 'Nov 25', value: 140 }, { date: 'May 26', value: 140 },
    ],
    potassium: [
      { date: 'Aug 24', value: 4.3 }, { date: 'Nov 24', value: 4.2 },
      { date: 'Feb 25', value: 4.1 }, { date: 'May 25', value: 4.2 },
      { date: 'Nov 25', value: 4.2 }, { date: 'May 26', value: 4.2 },
    ],
    magnesium: [
      { date: 'Aug 24', value: 2.0 }, { date: 'Nov 24', value: 2.05 },
      { date: 'Feb 25', value: 2.1 }, { date: 'May 25', value: 2.08 },
      { date: 'Nov 25', value: 2.1 }, { date: 'May 26', value: 2.1 },
    ],
    // Gut / Absorption
    vitamin_d: [
      { date: 'Aug 24', value: 35 }, { date: 'Nov 24', value: 38 },
      { date: 'Feb 25', value: 30 }, { date: 'May 25', value: 36 },
      { date: 'Nov 25', value: 40 }, { date: 'May 26', value: 42 },
    ],
    vitamin_b12: [
      { date: 'Aug 24', value: 420 }, { date: 'Nov 24', value: 430 },
      { date: 'Feb 25', value: 440 }, { date: 'May 25', value: 445 },
      { date: 'Nov 25', value: 448 }, { date: 'May 26', value: 450 },
    ],
    folate: [
      { date: 'Aug 24', value: 10 }, { date: 'Nov 24', value: 10.5 },
      { date: 'Feb 25', value: 11 }, { date: 'May 25', value: 11.5 },
      { date: 'Nov 25', value: 11.8 }, { date: 'May 26', value: 12 },
    ],
    calcium: [
      { date: 'Aug 24', value: 9.4 }, { date: 'Nov 24', value: 9.45 },
      { date: 'Feb 25', value: 9.5 }, { date: 'May 25', value: 9.48 },
      { date: 'Nov 25', value: 9.5 }, { date: 'May 26', value: 9.5 },
    ],
    ferritin: [
      { date: 'Aug 24', value: 75 }, { date: 'Nov 24', value: 78 },
      { date: 'Feb 25', value: 80 }, { date: 'May 25', value: 82 },
      { date: 'Nov 25', value: 84 }, { date: 'May 26', value: 85 },
    ],
    transferrin_saturation: [
      { date: 'Aug 24', value: 28 }, { date: 'Nov 24', value: 29 },
      { date: 'Feb 25', value: 29 }, { date: 'May 25', value: 30 },
      { date: 'Nov 25', value: 30 }, { date: 'May 26', value: 30 },
    ],
    // Thyroid
    tsh: [
      { date: 'Aug 24', value: 2.3 }, { date: 'Nov 24', value: 2.2 },
      { date: 'Feb 25', value: 2.15 }, { date: 'May 25', value: 2.1 },
      { date: 'Nov 25', value: 2.1 }, { date: 'May 26', value: 2.1 },
    ],
    free_t3: [
      { date: 'Aug 24', value: 3.0 }, { date: 'Nov 24', value: 3.1 },
      { date: 'Feb 25', value: 3.15 }, { date: 'May 25', value: 3.2 },
      { date: 'Nov 25', value: 3.18 }, { date: 'May 26', value: 3.2 },
    ],
    free_t4: [
      { date: 'Aug 24', value: 1.25 }, { date: 'Nov 24', value: 1.28 },
      { date: 'Feb 25', value: 1.3 }, { date: 'May 25', value: 1.3 },
      { date: 'Nov 25', value: 1.29 }, { date: 'May 26', value: 1.3 },
    ],
    // Metabolic
    fasting_glucose: [
      { date: 'Aug 24', value: 95 }, { date: 'Nov 24', value: 93 },
      { date: 'Feb 25', value: 91 }, { date: 'May 25', value: 90 },
      { date: 'Nov 25', value: 89 }, { date: 'May 26', value: 92 },
    ],
    hba1c: [
      { date: 'Aug 24', value: 5.5 }, { date: 'Nov 24', value: 5.45 },
      { date: 'Feb 25', value: 5.4 }, { date: 'May 25', value: 5.38 },
      { date: 'Nov 25', value: 5.4 }, { date: 'May 26', value: 5.4 },
    ],
    fasting_insulin: [
      { date: 'Aug 24', value: 9.5 }, { date: 'Nov 24', value: 9.2 },
      { date: 'Feb 25', value: 9.0 }, { date: 'May 25', value: 8.8 },
      { date: 'Nov 25', value: 8.6 }, { date: 'May 26', value: 8.5 },
    ],
    homa_ir: [
      { date: 'Aug 24', value: 1.4 }, { date: 'Nov 24', value: 1.35 },
      { date: 'Feb 25', value: 1.3 }, { date: 'May 25', value: 1.25 },
      { date: 'Nov 25', value: 1.22 }, { date: 'May 26', value: 1.2 },
    ],
    // Brain
    cortisol: [
      { date: 'Aug 24', value: 15.0 }, { date: 'Nov 24', value: 14.8 },
      { date: 'Feb 25', value: 14.5 }, { date: 'May 25', value: 14.3 },
      { date: 'Nov 25', value: 14.2 }, { date: 'May 26', value: 14.2 },
    ],
    // Lungs
    spo2: [
      { date: 'Aug 24', value: 97 }, { date: 'Nov 24', value: 98 },
      { date: 'Feb 25', value: 98 }, { date: 'May 25', value: 97 },
      { date: 'Nov 25', value: 98 }, { date: 'May 26', value: 98 },
    ],
    fev1: [
      { date: 'Aug 24', value: 3.6 }, { date: 'Nov 24', value: 3.7 },
      { date: 'Feb 25', value: 3.75 }, { date: 'May 25', value: 3.8 },
      { date: 'Nov 25', value: 3.78 }, { date: 'May 26', value: 3.8 },
    ],
    fvc: [
      { date: 'Aug 24', value: 4.6 }, { date: 'Nov 24', value: 4.7 },
      { date: 'Feb 25', value: 4.75 }, { date: 'May 25', value: 4.8 },
      { date: 'Nov 25', value: 4.78 }, { date: 'May 26', value: 4.8 },
    ],
  };
  return map[id] || [{ date: 'Now', value: 0 }];
};

const getRangeConfig = (id: string): { label: string; min: number; max: number; color: string }[] => {
  const map: Record<string, { label: string; min: number; max: number; color: string }[]> = {
    total_cholesterol: [
      { label: 'Normal', min: 0, max: 200, color: '#30D158' },
      { label: 'Borderline', min: 200, max: 240, color: '#FF9F0A' },
      { label: 'Unhealthy', min: 240, max: 300, color: '#FF3B30' },
    ],
    ldl_cholesterol: [
      { label: 'Normal', min: 0, max: 100, color: '#30D158' },
      { label: 'Borderline', min: 100, max: 130, color: '#FF9F0A' },
      { label: 'Unhealthy', min: 130, max: 200, color: '#FF3B30' },
    ],
    glucose: [
      { label: 'Normal', min: 50, max: 100, color: '#30D158' },
      { label: 'Prediabetes', min: 100, max: 126, color: '#FF9F0A' },
      { label: 'Critical', min: 126, max: 200, color: '#FF3B30' },
    ],
    creatinine: [
      { label: 'Critical', min: 0, max: 0.6, color: '#FF9F0A' },
      { label: 'Normal', min: 0.6, max: 1.2, color: '#30D158' },
      { label: 'Unhealthy', min: 1.2, max: 2.0, color: '#FF3B30' },
    ],
    hemoglobin: [
      { label: 'Critical', min: 8, max: 13.5, color: '#FF3B30' },
      { label: 'Normal', min: 13.5, max: 17.5, color: '#30D158' },
      { label: 'Unhealthy', min: 17.5, max: 22, color: '#FF9F0A' },
    ],
    platelets: [
      { label: 'Critical', min: 50, max: 150, color: '#FF3B30' },
      { label: 'Normal', min: 150, max: 400, color: '#30D158' },
      { label: 'Unhealthy', min: 400, max: 600, color: '#FF9F0A' },
    ],
    // Liver
    alt: [
      { label: 'Normal', min: 0, max: 56, color: '#30D158' },
      { label: 'Elevated', min: 56, max: 100, color: '#FF9F0A' },
      { label: 'High', min: 100, max: 200, color: '#FF3B30' },
    ],
    ast: [
      { label: 'Normal', min: 0, max: 40, color: '#30D158' },
      { label: 'Elevated', min: 40, max: 80, color: '#FF9F0A' },
      { label: 'High', min: 80, max: 160, color: '#FF3B30' },
    ],
    ggt: [
      { label: 'Normal', min: 0, max: 48, color: '#30D158' },
      { label: 'Elevated', min: 48, max: 90, color: '#FF9F0A' },
      { label: 'High', min: 90, max: 150, color: '#FF3B30' },
    ],
    alp: [
      { label: 'Low', min: 0, max: 40, color: '#FF9F0A' },
      { label: 'Normal', min: 40, max: 129, color: '#30D158' },
      { label: 'High', min: 129, max: 250, color: '#FF3B30' },
    ],
    total_bilirubin: [
      { label: 'Normal', min: 0, max: 1.2, color: '#30D158' },
      { label: 'Elevated', min: 1.2, max: 2.0, color: '#FF9F0A' },
      { label: 'High', min: 2.0, max: 4.0, color: '#FF3B30' },
    ],
    // Heart extras
    ldl_c: [
      { label: 'Optimal', min: 0, max: 70, color: '#30D158' },
      { label: 'Normal', min: 70, max: 100, color: '#32D74B' },
      { label: 'Borderline', min: 100, max: 130, color: '#FF9F0A' },
      { label: 'High', min: 130, max: 200, color: '#FF3B30' },
    ],
    hdl_c: [
      { label: 'Low', min: 0, max: 40, color: '#FF3B30' },
      { label: 'Normal', min: 40, max: 60, color: '#FF9F0A' },
      { label: 'Optimal', min: 60, max: 100, color: '#30D158' },
    ],
    triglycerides: [
      { label: 'Normal', min: 0, max: 150, color: '#30D158' },
      { label: 'Borderline', min: 150, max: 200, color: '#FF9F0A' },
      { label: 'High', min: 200, max: 500, color: '#FF3B30' },
    ],
    apob: [
      { label: 'Optimal', min: 0, max: 0.8, color: '#30D158' },
      { label: 'Normal', min: 0.8, max: 1.2, color: '#FF9F0A' },
      { label: 'High', min: 1.2, max: 2.0, color: '#FF3B30' },
    ],
    hs_crp: [
      { label: 'Low Risk', min: 0, max: 1.0, color: '#30D158' },
      { label: 'Moderate', min: 1.0, max: 3.0, color: '#FF9F0A' },
      { label: 'High Risk', min: 3.0, max: 10.0, color: '#FF3B30' },
    ],
    homocysteine: [
      { label: 'Normal', min: 0, max: 15, color: '#30D158' },
      { label: 'Elevated', min: 15, max: 30, color: '#FF9F0A' },
      { label: 'High', min: 30, max: 50, color: '#FF3B30' },
    ],
    red_blood_cells: [
      { label: 'Low', min: 2.0, max: 4.5, color: '#FF3B30' },
      { label: 'Normal', min: 4.5, max: 5.5, color: '#30D158' },
      { label: 'High', min: 5.5, max: 7.0, color: '#FF9F0A' },
    ],
    white_blood_cells: [
      { label: 'Low', min: 1.0, max: 4.0, color: '#FF3B30' },
      { label: 'Normal', min: 4.0, max: 11.0, color: '#30D158' },
      { label: 'High', min: 11.0, max: 20.0, color: '#FF9F0A' },
    ],
    // Kidneys
    urea: [
      { label: 'Low', min: 0, max: 7, color: '#FF9F0A' },
      { label: 'Normal', min: 7, max: 20, color: '#30D158' },
      { label: 'High', min: 20, max: 40, color: '#FF3B30' },
    ],
    sodium: [
      { label: 'Low', min: 120, max: 136, color: '#FF3B30' },
      { label: 'Normal', min: 136, max: 145, color: '#30D158' },
      { label: 'High', min: 145, max: 160, color: '#FF3B30' },
    ],
    potassium: [
      { label: 'Low', min: 2.5, max: 3.5, color: '#FF3B30' },
      { label: 'Normal', min: 3.5, max: 5.1, color: '#30D158' },
      { label: 'High', min: 5.1, max: 6.5, color: '#FF3B30' },
    ],
    magnesium: [
      { label: 'Low', min: 1.0, max: 1.7, color: '#FF9F0A' },
      { label: 'Normal', min: 1.7, max: 2.2, color: '#30D158' },
      { label: 'High', min: 2.2, max: 3.0, color: '#FF9F0A' },
    ],
    // Gut / Absorption
    vitamin_d: [
      { label: 'Deficient', min: 0, max: 20, color: '#FF3B30' },
      { label: 'Low', min: 20, max: 30, color: '#FF9F0A' },
      { label: 'Normal', min: 30, max: 100, color: '#30D158' },
    ],
    vitamin_b12: [
      { label: 'Deficient', min: 0, max: 200, color: '#FF3B30' },
      { label: 'Low', min: 200, max: 300, color: '#FF9F0A' },
      { label: 'Normal', min: 300, max: 900, color: '#30D158' },
    ],
    folate: [
      { label: 'Deficient', min: 0, max: 3, color: '#FF3B30' },
      { label: 'Normal', min: 3, max: 17, color: '#30D158' },
      { label: 'High', min: 17, max: 25, color: '#FF9F0A' },
    ],
    calcium: [
      { label: 'Low', min: 6, max: 8.5, color: '#FF3B30' },
      { label: 'Normal', min: 8.5, max: 10.5, color: '#30D158' },
      { label: 'High', min: 10.5, max: 13, color: '#FF3B30' },
    ],
    ferritin: [
      { label: 'Low', min: 0, max: 20, color: '#FF3B30' },
      { label: 'Normal', min: 20, max: 250, color: '#30D158' },
      { label: 'High', min: 250, max: 500, color: '#FF9F0A' },
    ],
    transferrin_saturation: [
      { label: 'Low', min: 0, max: 20, color: '#FF3B30' },
      { label: 'Normal', min: 20, max: 50, color: '#30D158' },
      { label: 'High', min: 50, max: 80, color: '#FF9F0A' },
    ],
    // Thyroid
    tsh: [
      { label: 'Low', min: 0, max: 0.4, color: '#FF3B30' },
      { label: 'Normal', min: 0.4, max: 4.0, color: '#30D158' },
      { label: 'High', min: 4.0, max: 10, color: '#FF3B30' },
    ],
    free_t3: [
      { label: 'Low', min: 1, max: 2.3, color: '#FF3B30' },
      { label: 'Normal', min: 2.3, max: 4.2, color: '#30D158' },
      { label: 'High', min: 4.2, max: 6.0, color: '#FF9F0A' },
    ],
    free_t4: [
      { label: 'Low', min: 0.4, max: 0.8, color: '#FF3B30' },
      { label: 'Normal', min: 0.8, max: 1.8, color: '#30D158' },
      { label: 'High', min: 1.8, max: 3.0, color: '#FF9F0A' },
    ],
    // Metabolic
    fasting_glucose: [
      { label: 'Normal', min: 50, max: 100, color: '#30D158' },
      { label: 'Prediabetes', min: 100, max: 126, color: '#FF9F0A' },
      { label: 'Diabetes', min: 126, max: 200, color: '#FF3B30' },
    ],
    hba1c: [
      { label: 'Normal', min: 3.5, max: 5.7, color: '#30D158' },
      { label: 'Prediabetes', min: 5.7, max: 6.5, color: '#FF9F0A' },
      { label: 'Diabetes', min: 6.5, max: 10, color: '#FF3B30' },
    ],
    fasting_insulin: [
      { label: 'Optimal', min: 0, max: 8, color: '#30D158' },
      { label: 'Normal', min: 8, max: 20, color: '#FF9F0A' },
      { label: 'High', min: 20, max: 40, color: '#FF3B30' },
    ],
    homa_ir: [
      { label: 'Optimal', min: 0, max: 1.5, color: '#30D158' },
      { label: 'Normal', min: 1.5, max: 2.0, color: '#FF9F0A' },
      { label: 'Resistant', min: 2.0, max: 5.0, color: '#FF3B30' },
    ],
    // Brain
    cortisol: [
      { label: 'Low', min: 0, max: 6, color: '#FF3B30' },
      { label: 'Normal', min: 6, max: 18.4, color: '#30D158' },
      { label: 'High', min: 18.4, max: 30, color: '#FF9F0A' },
    ],
    // Lungs
    spo2: [
      { label: 'Critical', min: 80, max: 90, color: '#FF3B30' },
      { label: 'Low', min: 90, max: 95, color: '#FF9F0A' },
      { label: 'Normal', min: 95, max: 100, color: '#30D158' },
    ],
    fev1: [
      { label: 'Reduced', min: 0, max: 2.5, color: '#FF3B30' },
      { label: 'Normal', min: 2.5, max: 5.0, color: '#30D158' },
    ],
    fvc: [
      { label: 'Reduced', min: 0, max: 3.0, color: '#FF3B30' },
      { label: 'Normal', min: 3.0, max: 6.0, color: '#30D158' },
    ],
  };
  return map[id] || [{ label: 'Normal', min: 0, max: 100, color: '#30D158' }];
};

// Optimal range within the normal/healthy zone
const getOptimalRange = (id: string): { min: number; max: number } => {
  const map: Record<string, { min: number; max: number }> = {
    total_cholesterol: { min: 0, max: 150 },
    ldl_cholesterol: { min: 0, max: 70 },
    glucose: { min: 70, max: 85 },
    creatinine: { min: 0.7, max: 1.0 },
    hemoglobin: { min: 14.0, max: 16.0 },
    platelets: { min: 200, max: 300 },
    // Liver
    alt: { min: 10, max: 30 },
    ast: { min: 10, max: 25 },
    ggt: { min: 9, max: 30 },
    alp: { min: 50, max: 90 },
    total_bilirubin: { min: 0.3, max: 0.8 },
    // Heart extras
    ldl_c: { min: 0, max: 70 },
    hdl_c: { min: 60, max: 100 },
    triglycerides: { min: 0, max: 100 },
    apob: { min: 0, max: 0.8 },
    hs_crp: { min: 0, max: 1.0 },
    homocysteine: { min: 5, max: 10 },
    red_blood_cells: { min: 4.5, max: 5.2 },
    white_blood_cells: { min: 4.5, max: 7.5 },
    // Kidneys
    urea: { min: 10, max: 16 },
    sodium: { min: 138, max: 142 },
    potassium: { min: 3.8, max: 4.6 },
    magnesium: { min: 2.0, max: 2.2 },
    // Gut / Absorption
    vitamin_d: { min: 40, max: 60 },
    vitamin_b12: { min: 400, max: 700 },
    folate: { min: 8, max: 15 },
    calcium: { min: 9.0, max: 10.0 },
    ferritin: { min: 50, max: 150 },
    transferrin_saturation: { min: 25, max: 35 },
    // Thyroid
    tsh: { min: 1.0, max: 2.5 },
    free_t3: { min: 3.0, max: 3.8 },
    free_t4: { min: 1.0, max: 1.5 },
    // Metabolic
    fasting_glucose: { min: 75, max: 88 },
    hba1c: { min: 4.8, max: 5.3 },
    fasting_insulin: { min: 3, max: 8 },
    homa_ir: { min: 0.5, max: 1.5 },
    // Brain
    cortisol: { min: 10, max: 15 },
    // Lungs
    spo2: { min: 97, max: 99 },
    fev1: { min: 3.5, max: 5.0 },
    fvc: { min: 4.5, max: 6.0 },
  };
  return map[id] || { min: 0, max: 100 };
};

const getSummary = (id: string, status: string): string => {
  const map: Record<string, Record<string, string>> = {
    total_cholesterol: {
      normal: 'Your cholesterol is well controlled. Keep up your current lifestyle and diet.',
      borderline: 'Your cholesterol is creeping up. Dietary changes could bring it back down.',
      high: 'Your cholesterol is elevated. Speak with your doctor about a management plan.',
    },
    ldl_cholesterol: {
      normal: 'Your LDL is in a healthy range. A diet rich in fibre can help push it lower.',
      borderline: 'Your LDL is borderline. Consider reducing saturated fats.',
      high: 'Elevated LDL increases cardiovascular risk. Medical review recommended.',
    },
    glucose: {
      optimal: 'Your blood sugar is well regulated, indicating good insulin sensitivity.',
      normal: 'Your fasting glucose is healthy. Maintain balanced meals and regular activity.',
      borderline: 'Your glucose is trending toward prediabetic range. Monitor closely.',
      high: 'Your glucose is elevated. Consult your doctor about metabolic screening.',
    },
    creatinine: {
      optimal: 'Your kidney function markers look strong.',
      normal: 'Your creatinine is within the healthy range — kidneys are filtering well.',
      borderline: 'Slightly elevated creatinine. Stay hydrated and monitor at next test.',
      high: 'Elevated creatinine may indicate kidney stress. Follow up with your doctor.',
    },
    hemoglobin: {
      optimal: 'Your hemoglobin is in an ideal range for oxygen delivery.',
      normal: 'Your hemoglobin is healthy. Maintain iron-rich foods in your diet.',
      low: 'Low hemoglobin can indicate anemia. Check iron and B12 levels.',
      high: 'Elevated hemoglobin — could be dehydration or worth monitoring.',
    },
    platelets: {
      optimal: 'Your platelet count is in an ideal range for healthy clotting.',
      normal: 'Your platelets are within the healthy range. No concerns.',
      low: 'Low platelets may affect clotting. Discuss with your doctor.',
      high: 'Elevated platelets can indicate inflammation. Worth monitoring.',
    },
    // Liver
    alt: {
      optimal: 'Your ALT is in an excellent range — your liver is functioning well with no signs of stress.',
      normal: 'Your ALT is within the healthy range. Your liver is handling its workload well.',
      elevated: 'Your ALT is mildly elevated. Consider reducing alcohol, processed foods, and reviewing medications.',
      high: 'Significantly elevated ALT suggests liver cell damage. Follow up with your doctor promptly.',
    },
    ast: {
      optimal: 'Your AST is in an ideal range, suggesting healthy liver and muscle tissue.',
      normal: 'Your AST is within normal limits. No signs of liver or muscle damage.',
      elevated: 'Mildly elevated AST — could be liver-related or from recent intense exercise.',
      high: 'High AST warrants investigation. Consult your doctor to rule out liver or cardiac issues.',
    },
    ggt: {
      optimal: 'Your GGT is low, indicating minimal liver stress and healthy bile flow.',
      normal: 'Your GGT is normal. Your liver is processing bile effectively.',
      elevated: 'Elevated GGT is often the earliest sign of liver stress. Reduce alcohol and review medications.',
      high: 'High GGT suggests significant liver or bile duct stress. Medical review recommended.',
    },
    alp: {
      optimal: 'Your ALP is in the optimal range — healthy liver drainage and bone metabolism.',
      normal: 'Your ALP is normal, indicating healthy liver and bone function.',
      low: 'Low ALP is uncommon but may relate to nutritional deficiencies. Discuss with your doctor.',
      high: 'Elevated ALP can indicate bile duct or bone issues. Follow up with your doctor.',
    },
    total_bilirubin: {
      optimal: 'Your bilirubin is in the ideal range — efficient liver clearance and healthy red blood cell turnover.',
      normal: 'Your bilirubin is normal. Your liver is processing waste products effectively.',
      elevated: 'Mildly elevated bilirubin is often benign (Gilbert\'s syndrome) but worth monitoring.',
      high: 'High bilirubin may cause jaundice. Consult your doctor for further evaluation.',
    },
    // Heart extras
    ldl_c: {
      optimal: 'Your LDL-C is in the optimal range — excellent cardiovascular protection.',
      normal: 'Your LDL-C is within a healthy range. Continue heart-healthy habits.',
      borderline: 'Your LDL-C is borderline. Consider dietary changes to bring it down.',
      high: 'Elevated LDL-C significantly increases cardiovascular risk. Discuss treatment options.',
    },
    hdl_c: {
      optimal: 'Your HDL-C is high — strong cardiovascular protection.',
      normal: 'Your HDL-C is adequate. More exercise and healthy fats can push it higher.',
      low: 'Low HDL-C reduces cardiovascular protection. Increase exercise and healthy fats.',
    },
    triglycerides: {
      optimal: 'Your triglycerides are well controlled — low cardiovascular and metabolic risk.',
      normal: 'Your triglycerides are in a healthy range. Maintain your current diet and activity.',
      borderline: 'Triglycerides are trending up. Reduce sugar, refined carbs, and alcohol.',
      high: 'High triglycerides are an independent cardiovascular risk factor. Take action.',
    },
    apob: {
      optimal: 'Your ApoB is excellent — low number of atherogenic particles.',
      normal: 'Your ApoB is in an acceptable range, but lower is better for longevity.',
      high: 'Elevated ApoB means more harmful cholesterol particles. Discuss with your doctor.',
    },
    hs_crp: {
      optimal: 'Your hs-CRP is very low — minimal systemic inflammation.',
      normal: 'Your hs-CRP is in a low-risk range. Continue anti-inflammatory habits.',
      borderline: 'Moderate hs-CRP suggests some systemic inflammation. Review diet, sleep, and stress.',
      high: 'High hs-CRP indicates significant inflammation. Investigate underlying causes.',
    },
    homocysteine: {
      optimal: 'Your homocysteine is in an ideal range — good cardiovascular and neurological protection.',
      normal: 'Your homocysteine is within normal limits.',
      elevated: 'Elevated homocysteine increases vascular risk. Check B12, B6, and folate status.',
      high: 'High homocysteine is a significant cardiovascular risk factor. Supplement and retest.',
    },
    // Kidneys
    urea: {
      optimal: 'Your urea is in the ideal range — kidneys are filtering efficiently.',
      normal: 'Your urea is normal. Kidneys are handling protein waste well.',
      high: 'Elevated urea may indicate kidney stress, dehydration, or high protein intake.',
    },
    sodium: {
      optimal: 'Your sodium is perfectly balanced.',
      normal: 'Your sodium is within the healthy range — good fluid balance.',
      low: 'Low sodium can affect brain function. Review fluid intake and medications.',
      high: 'Elevated sodium may indicate dehydration. Increase water intake.',
    },
    potassium: {
      optimal: 'Your potassium is in the ideal range for heart and muscle function.',
      normal: 'Your potassium is within the healthy range.',
      low: 'Low potassium can cause muscle weakness and cardiac issues. Eat potassium-rich foods.',
      high: 'Elevated potassium can be dangerous for the heart. Seek medical evaluation.',
    },
    magnesium: {
      optimal: 'Your magnesium is in the optimal range — supporting sleep, stress response, and muscle function.',
      normal: 'Your magnesium is adequate. Most people are borderline deficient, so this is good.',
      low: 'Low magnesium is very common and can cause fatigue, cramps, and poor sleep.',
    },
    // Thyroid
    tsh: {
      optimal: 'Your TSH is in the optimal range — thyroid function looks excellent.',
      normal: 'Your TSH is normal. Your thyroid is producing adequate hormones.',
      low: 'Low TSH may indicate hyperthyroidism. Monitor for symptoms like anxiety or weight loss.',
      high: 'Elevated TSH suggests hypothyroidism. Discuss treatment with your doctor.',
    },
    // Metabolic
    fasting_glucose: {
      optimal: 'Your fasting glucose is excellent — strong insulin sensitivity.',
      normal: 'Your fasting glucose is in the healthy range.',
      borderline: 'Your glucose is trending toward prediabetic range. Take preventive action now.',
      high: 'Elevated fasting glucose suggests insulin resistance. Medical review recommended.',
    },
    hba1c: {
      optimal: 'Your HbA1c is excellent — outstanding long-term blood sugar control.',
      normal: 'Your HbA1c is in the normal range. Good metabolic health.',
      borderline: 'Your HbA1c is in the prediabetic range. Lifestyle changes can reverse this.',
      high: 'Your HbA1c indicates diabetes. Work with your doctor on a management plan.',
    },
    cortisol: {
      optimal: 'Your cortisol is in a healthy morning range — balanced stress response.',
      normal: 'Your cortisol is within normal limits.',
      high: 'Elevated cortisol suggests chronic stress. Prioritise sleep and stress management.',
      low: 'Low cortisol may indicate adrenal fatigue. Discuss with your doctor.',
    },
  };
  return map[id]?.[status] || 'Your result is within expected parameters.';
};

const getNextTestDue = (id: string): string => {
  const map: Record<string, string> = {
    total_cholesterol: 'Nov 2026', ldl_cholesterol: 'Nov 2026',
    glucose: 'Aug 2026', creatinine: 'Nov 2026',
    hemoglobin: 'Oct 2026', platelets: 'Oct 2026',
    alt: 'Nov 2026', ast: 'Nov 2026', ggt: 'Nov 2026',
    alp: 'Nov 2026', total_bilirubin: 'Nov 2026',
    ldl_c: 'Nov 2026', hdl_c: 'Nov 2026', triglycerides: 'Nov 2026',
    apob: 'Nov 2026', hs_crp: 'Nov 2026', homocysteine: 'Nov 2026',
    red_blood_cells: 'Oct 2026', white_blood_cells: 'Oct 2026',
    urea: 'Nov 2026', sodium: 'Nov 2026', potassium: 'Nov 2026', magnesium: 'Nov 2026',
    vitamin_d: 'Nov 2026', vitamin_b12: 'Nov 2026', folate: 'Nov 2026',
    calcium: 'Nov 2026', ferritin: 'Nov 2026', transferrin_saturation: 'Nov 2026',
    tsh: 'Nov 2026', free_t3: 'Nov 2026', free_t4: 'Nov 2026',
    fasting_glucose: 'Aug 2026', hba1c: 'Aug 2026', fasting_insulin: 'Aug 2026', homa_ir: 'Aug 2026',
    cortisol: 'Nov 2026', spo2: 'Nov 2026', fev1: 'Nov 2026', fvc: 'Nov 2026',
  };
  return map[id] || '6 months';
};

const getLastTested = (id: string): string => {
  const map: Record<string, string> = {
    total_cholesterol: '6 May 2026', ldl_cholesterol: '6 May 2026',
    glucose: '2 May 2026', creatinine: '6 May 2026',
    hemoglobin: '25 Apr 2026', platelets: '25 Apr 2026',
    alt: '6 May 2026', ast: '6 May 2026', ggt: '6 May 2026',
    alp: '6 May 2026', total_bilirubin: '6 May 2026',
    ldl_c: '6 May 2026', hdl_c: '6 May 2026', triglycerides: '6 May 2026',
    apob: '6 May 2026', hs_crp: '6 May 2026', homocysteine: '6 May 2026',
    red_blood_cells: '25 Apr 2026', white_blood_cells: '25 Apr 2026',
    urea: '6 May 2026', sodium: '6 May 2026', potassium: '6 May 2026', magnesium: '6 May 2026',
    vitamin_d: '6 May 2026', vitamin_b12: '6 May 2026', folate: '6 May 2026',
    calcium: '6 May 2026', ferritin: '6 May 2026', transferrin_saturation: '6 May 2026',
    tsh: '6 May 2026', free_t3: '6 May 2026', free_t4: '6 May 2026',
    fasting_glucose: '2 May 2026', hba1c: '2 May 2026', fasting_insulin: '2 May 2026', homa_ir: '2 May 2026',
    cortisol: '6 May 2026', spo2: '6 May 2026', fev1: '6 May 2026', fvc: '6 May 2026',
  };
  return map[id] || 'Recently';
};


// ─── Smooth chart ───────────────────────────────────────────────────────────

const SmoothChart: React.FC<{
  data: { date: string; value: number }[];
  color: string;
  width: number;
  height: number;
  selectedIndex: number | null;
  onSelectIndex: (index: number | null) => void;
}> = ({ data, color, width: cW, height: cH, selectedIndex, onSelectIndex }) => {
  const padL = 36;
  const padR = 24;
  const padT = 16;
  const padB = 28;
  const plotW = cW - padL - padR;
  const plotH = cH - padT - padB;
  const vals = data.map(d => d.value);
  const rawMin = Math.min(...vals) * 0.95;
  const rawMax = Math.max(...vals) * 1.05;
  const minV = rawMin;
  const maxV = rawMax === rawMin ? rawMin + 1 : rawMax;
  const toX = (i: number) => data.length <= 1 ? padL + plotW / 2 : padL + (i / (data.length - 1)) * plotW;
  const toY = (v: number) => padT + plotH - ((v - minV) / (maxV - minV)) * plotH;

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }));
  let linePath = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cp = (pts[i].x - pts[i - 1].x) * 0.4;
    linePath += ` C${pts[i - 1].x + cp},${pts[i - 1].y} ${pts[i].x - cp},${pts[i].y} ${pts[i].x},${pts[i].y}`;
  }
  const areaPath = linePath + ` L${pts[pts.length - 1].x},${padT + plotH} L${pts[0].x},${padT + plotH} Z`;

  return (
    <Svg width={cW} height={cH}>
      <Defs>
        <LinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.2" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {[0, 0.5, 1].map((f, i) => {
        const y = padT + plotH * (1 - f);
        const val = minV + (maxV - minV) * f;
        return (
          <G key={i}>
            <Line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="#1C1C1E" strokeWidth={1} />
            <SvgText x={padL - 6} y={y + 4} fontSize={10} fill="#48484A" textAnchor="end">
              {val < 10 ? val.toFixed(1) : Math.round(val)}
            </SvgText>
          </G>
        );
      })}

      <Path d={areaPath} fill="url(#chartFill)" />
      <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y}
          r={selectedIndex === i ? 6 : (i === pts.length - 1 ? 5 : 3)}
          fill={selectedIndex === i ? color : (i === pts.length - 1 ? color : '#000')}
          stroke={selectedIndex === i ? '#FFF' : color}
          strokeWidth={selectedIndex === i ? 3 : 2}
          onPress={() => onSelectIndex(selectedIndex === i ? null : i)}
        />
      ))}
      {/* Invisible larger hit targets */}
      {pts.map((p, i) => (
        <Circle key={`hit-${i}`} cx={p.x} cy={p.y} r={16}
          fill="transparent"
          onPress={() => onSelectIndex(selectedIndex === i ? null : i)}
        />
      ))}

      {data.map((d, i) => (
        <SvgText key={i} x={toX(i)} y={cH - 4} fontSize={9} fill="#48484A" textAnchor="middle">
          {d.date}
        </SvgText>
      ))}
    </Svg>
  );
};


// ─── Info modal ─────────────────────────────────────────────────────────────

const InfoModal: React.FC<{ visible: boolean; onClose: () => void; title: string; text: string; color: string }> = ({ visible, onClose, title, text, color }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={infoStyles.overlay} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity activeOpacity={1} style={infoStyles.container}>
        <View style={[infoStyles.accent, { backgroundColor: color }]} />
        <Text style={infoStyles.title}>{title}</Text>
        <Text style={infoStyles.text}>{text}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

const infoStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 48 },
  container: { backgroundColor: '#141414', borderRadius: 24, padding: 28, overflow: 'hidden' },
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  title: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 12, letterSpacing: -0.3 },
  text: { fontSize: 14, color: '#A0A0A0', lineHeight: 22 },
});


// ════════════════════════════════════════════════════════════════════════════
// Main screen
// Top: Signal (vertical range bar + value + status + trend)
// Bottom: Glow (chart, recommendations, dates)
// Header: back left, info (i) right
// ════════════════════════════════════════════════════════════════════════════

const LabResultDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { labResult } = route.params;
  const [showInfo, setShowInfo] = useState(false);
  const [recsExpanded, setRecsExpanded] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Reset to latest when leaving the screen
  useFocusEffect(
    useCallback(() => {
      return () => setSelectedIndex(null);
    }, [])
  );

  const ranges = getRangeConfig(labResult.id);
  const history = getHistoricalData(labResult.id);
  const recs = getBiomarkerDetails(labResult.id).recommendations.slice(0, 3);
  const description = getBiomarkerDetails(labResult.id).description;
  const totalRange = ranges[ranges.length - 1].max - ranges[0].min;

  // Determine which value/date to display based on selection
  const isHistorical = selectedIndex !== null && selectedIndex !== history.length - 1;
  const displayValue = isHistorical ? history[selectedIndex!].value : labResult.value;
  // Expand short date "Nov 25" → "Nov 2025" for hero display
  const expandDate = (short: string): string => {
    const parts = short.split(' ');
    if (parts.length === 2) {
      const yr = parseInt(parts[1], 10);
      return `${parts[0]} ${yr < 100 ? 2000 + yr : yr}`;
    }
    return short;
  };
  const displayDate = isHistorical ? expandDate(history[selectedIndex!].date) : getLastTested(labResult.id);

  // Compute status from value for the selected point
  const getStatusFromValue = (value: number): string => {
    for (let i = ranges.length - 1; i >= 0; i--) {
      if (value >= ranges[i].min) return ranges[i].label.toLowerCase();
    }
    return ranges[0].label.toLowerCase();
  };

  const displayStatus = isHistorical ? getStatusFromValue(displayValue) : labResult.status;
  const statusColor = getStatusColor(displayStatus as any);
  const good = isGoodTrend(labResult.id, labResult.trend);
  const trendColor = getTrendColor(labResult.trend, good);
  const trendLabel = getTrendLabel(labResult.trend, good);
  const pos = 1 - Math.min(Math.max((labResult.value - ranges[0].min) / totalRange, 0.02), 0.98);
  const optimal = getOptimalRange(labResult.id);
  const barH = 200;

  // Compute optimal zone position on the bar
  const optTop = 1 - (optimal.max - ranges[0].min) / totalRange;
  const optBottom = 1 - (optimal.min - ranges[0].min) / totalRange;

  // Collect threshold values at boundaries between segments (where it becomes unhealthy)
  const thresholds: { value: number; position: number; label: string }[] = [];
  for (let i = 1; i < ranges.length; i++) {
    const val = ranges[i].min;
    const p = 1 - (val - ranges[0].min) / totalRange;
    thresholds.push({ value: val, position: p, label: `${val < 10 ? val.toFixed(1) : val}` });
  }

  return (
    <View style={st.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header — back left, title center, info right */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.headerBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={st.headerTitle} numberOfLines={1}>{labResult.name}</Text>
        <TouchableOpacity onPress={() => setShowInfo(true)} style={st.headerBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons
            name={showInfo ? 'information-circle' : 'information-circle-outline'}
            size={22}
            color={showInfo ? '#007AFF' : 'rgba(255,255,255,0.4)'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* ── TOP: Value + Status ── */}
        <View style={st.heroContainer}>
          <View style={st.heroRow}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={st.heroValue}>{displayValue}</Text>
              <View style={st.heroMeta}>
                <Text style={st.heroUnit}>{labResult.unit}</Text>
                <Text style={[st.statusText, { color: statusColor, marginTop: 4 }]}>{displayStatus.toUpperCase()}</Text>
              </View>
            </View>
            <View style={st.heroDates}>
              <Text style={st.heroDateValue}>{displayDate}</Text>
              {!isHistorical && (
                <Text style={st.heroDateLabel}>Due {getNextTestDue(labResult.id)}</Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Horizontal range bar (environmental tab style) ── */}
        <View style={{ paddingHorizontal: 24, marginBottom: 36 }}>
          {/* Threshold numbers above bar */}
          <View style={{ height: 16, position: 'relative', marginBottom: 4 }}>
            {ranges.slice(1).map((r, i) => {
              const pos = (r.min - ranges[0].min) / totalRange;
              return (
                <Text key={i} style={{
                  position: 'absolute',
                  left: `${pos * 100}%`,
                  width: 40,
                  marginLeft: -20,
                  textAlign: 'center',
                  fontSize: 10,
                  color: '#636366',
                  fontWeight: '500',
                }}>
                  {r.min < 10 ? r.min.toFixed(1) : r.min}
                </Text>
              );
            })}
          </View>
          {/* Bar */}
          <View style={{ height: 10, flexDirection: 'row', borderRadius: 5, overflow: 'visible', position: 'relative' }}>
            {ranges.map((r, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={{ width: 2, backgroundColor: '#000' }} />}
                <View
                  style={{
                    flex: (r.max - r.min) / totalRange,
                    backgroundColor: r.color,
                    ...(i === 0 ? { borderTopLeftRadius: 5, borderBottomLeftRadius: 5 } : {}),
                    ...(i === ranges.length - 1 ? { borderTopRightRadius: 5, borderBottomRightRadius: 5 } : {}),
                  }}
                />
              </React.Fragment>
            ))}
            {/* White dot with colored border */}
            {(() => {
              const clampedPos = Math.max(0.03, Math.min(0.97, (displayValue - ranges[0].min) / totalRange));
              return (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  left: `${clampedPos * 100}%`,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 3,
                  borderColor: statusColor,
                  marginLeft: -9,
                }} />
              );
            })()}
          </View>

          {/* Segment labels */}
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            {ranges.map((r, i) => (
              <Text key={i} style={{ flex: (r.max - r.min) / totalRange, textAlign: 'center', fontSize: 10, color: '#636366', fontWeight: '500' }} numberOfLines={1}>
                {r.label}
              </Text>
            ))}
          </View>

          {/* Summary */}
          <Text style={{ fontSize: 16, color: '#FFFFFF', lineHeight: 22, marginTop: 16, fontWeight: '500' }}>{getSummary(labResult.id, displayStatus)}</Text>
        </View>


        {/* ── BOTTOM: Chart, Recommendations, Dates ── */}

        {/* History chart */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>HISTORY</Text>
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <SmoothChart data={history} color={statusColor} width={W - 48} height={180} selectedIndex={selectedIndex} onSelectIndex={setSelectedIndex} />
          </View>
        </View>

        {/* Recommendations */}
        <View style={st.section}>
          <TouchableOpacity
            style={st.recHeader}
            onPress={() => setRecsExpanded(!recsExpanded)}
            activeOpacity={0.7}
          >
            <Text style={st.sectionLabel}>RECOMMENDATIONS</Text>
            <Ionicons
              name={recsExpanded ? 'chevron-down' : 'chevron-back'}
              size={18}
              color="#48484A"
            />
          </TouchableOpacity>
          {recsExpanded && recs.map((r, i) => (
            <View key={i} style={st.recRow}>
              <View style={[st.recDot, { backgroundColor: statusColor }]} />
              <Text style={st.recText}>{r}</Text>
            </View>
          ))}
        </View>


      </ScrollView>

      {/* Info modal */}
      <InfoModal
        visible={showInfo}
        onClose={() => setShowInfo(false)}
        title={labResult.name}
        text={description}
        color={statusColor}
      />
    </View>
  );
};


const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },

  // Hero
  heroContainer: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 20,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroValue: {
    fontSize: 60,
    fontWeight: '200',
    color: '#FFF',
    letterSpacing: -2,
  },
  heroMeta: {
    marginLeft: 8,
    marginTop: 8,
  },
  heroUnit: {
    fontSize: 15,
    color: '#48484A',
  },
  heroDates: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  heroDateValue: {
    fontSize: 13,
    color: '#48484A',
  },
  heroDateLabel: {
    fontSize: 13,
    color: '#48484A',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  _unused1: {
    display: 'none',
  },
  _unused2: {
    fontSize: 10,
    color: '#3A3A3C',
    textAlign: 'right',
  },

  // Sections
  section: {
    paddingHorizontal: 28,
    marginBottom: 36,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#48484A',
    fontWeight: '600',
    letterSpacing: 1,
  },

  // Recommendations
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 14,
  },
  recText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    flex: 1,
    fontWeight: '500',
  },

  // Dates
  datesSection: {
    paddingHorizontal: 28,
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 13,
    color: '#48484A',
  },
  dateValue: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
});

export default LabResultDetailScreen;
