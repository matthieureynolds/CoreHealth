import { Organ } from '../types';

export const stomachOrgan: Organ = {
  id: 'stomach',
  label: 'Stomach',
  position: { x: 0.5, y: 0.35 }, // Upper abdomen, center
  data: {
    name: 'Stomach / Gastric Health',
    description: 'Comprehensive gastric health assessment including acid production, mucosal integrity, inflammation markers, and H. pylori detection.',
    biomarkers: [
      // Gastric Hormones & Acid Production
      {
        name: 'Gastrin',
        value: 85,
        unit: 'pg/mL',
        range: '30-100',
        status: 'normal',
      },
      {
        name: 'Pepsinogen I (PG I)',
        value: 78,
        unit: 'ng/mL',
        range: '50-100',
        status: 'normal',
      },
      {
        name: 'Pepsinogen II (PG II)',
        value: 18,
        unit: 'ng/mL',
        range: '10-25',
        status: 'normal',
      },
      {
        name: 'PG I / PG II Ratio',
        value: 4.3,
        unit: 'ratio',
        range: '>3.0',
        status: 'normal',
      },
      {
        name: 'Gastric pH',
        value: 2.1,
        unit: 'pH units',
        range: '1.5-3.0',
        status: 'normal',
      },
      // Infection & Inflammation Markers
      {
        name: 'H. pylori Antigen',
        value: 0,
        unit: 'positive/negative',
        range: 'Negative',
        status: 'normal',
      },
      {
        name: 'Urea Breath Test',
        value: 1.2,
        unit: 'delta value',
        range: '<2.5',
        status: 'normal',
      },
      {
        name: 'C-Reactive Protein (CRP)',
        value: 0.8,
        unit: 'mg/L',
        range: '<1.0',
        status: 'normal',
      },
      {
        name: 'Interleukin-8 (IL-8)',
        value: 15,
        unit: 'pg/mL',
        range: '<20',
        status: 'normal',
      },
      // Mucosal Integrity & Permeability
      {
        name: 'Zonulin',
        value: 42,
        unit: 'ng/mL',
        range: '<60',
        status: 'normal',
      },
      {
        name: 'MUC5AC (Gastric Mucin)',
        value: 125,
        unit: 'μg/mL',
        range: '100-200',
        status: 'normal',
      },
      // Additional Gastric Health Markers
      {
        name: 'Gastric Emptying Rate',
        value: 85,
        unit: '%',
        range: '>80',
        status: 'normal',
      },
      {
        name: 'Intrinsic Factor',
        value: 1.2,
        unit: 'ng/mL',
        range: '1.0-2.0',
        status: 'normal',
      },
      {
        name: 'Gastric Motility Index',
        value: 92,
        unit: 'score',
        range: '80-100',
        status: 'normal',
      },
      {
        name: 'Mucosal Barrier Function',
        value: 88,
        unit: '%',
        range: '>75',
        status: 'normal',
      },
      {
        name: 'Overall Gastric Health Score',
        value: 91,
        unit: 'score',
        range: '80-100',
        status: 'normal',
      },
    ],
  },
};
