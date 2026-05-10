import { Organ } from '../types';

export const heartOrgan: Organ = {
  id: 'heart',
  label: 'Heart',
  position: { x: 0.5, y: 0.29 },
  data: {
    name: 'Heart / Circulatory',
    description: 'Pumps blood around the body.',
    biomarkers: [
      { name: 'Total Cholesterol', value: 185, unit: 'mg/dL', range: '<200', status: 'normal' },
      { name: 'LDL-C', value: 95, unit: 'mg/dL', range: '<100', status: 'normal' },
      { name: 'HDL-C', value: 58, unit: 'mg/dL', range: '>40', status: 'normal' },
      { name: 'Triglycerides', value: 120, unit: 'mg/dL', range: '<150', status: 'normal' },
      { name: 'ApoB', value: 0.85, unit: 'g/L', range: '<1.2', status: 'normal' },
      { name: 'hs-CRP', value: 0.8, unit: 'mg/L', range: '<1.0', status: 'normal' },
      { name: 'Homocysteine', value: 8.5, unit: 'μmol/L', range: '4-15', status: 'normal' },
      { name: 'Hemoglobin', value: 14.5, unit: 'g/dL', range: '13.5-17.5', status: 'normal' },
      { name: 'Red Blood Cells', value: 4.9, unit: 'M/μL', range: '4.5-5.5', status: 'normal' },
      { name: 'White Blood Cells', value: 6.2, unit: 'K/μL', range: '4.0-11.0', status: 'normal' },
      { name: 'Platelets', value: 245, unit: 'K/μL', range: '150-400', status: 'normal' },
    ],
  },
};
