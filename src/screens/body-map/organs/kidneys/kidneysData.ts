import { Organ } from '../types';

export const kidneysOrgan: Organ = {
  id: 'kidneys',
  label: 'Kidneys',
  position: { x: 0.5, y: 0.48 },
  data: {
    name: 'Kidneys',
    description: 'Remove waste and balance fluids.',
    biomarkers: [
      { name: 'Creatinine', value: 0.93, unit: 'mg/dL', range: '0.6-1.2', status: 'normal' },
      { name: 'eGFR', value: 102, unit: 'mL/min/1.73m²', range: '>90', status: 'normal' },
      { name: 'Urea (BUN)', value: 15, unit: 'mg/dL', range: '7-20', status: 'normal' },
      { name: 'Cystatin C', value: 0.95, unit: 'mg/L', range: '0.6-1.0', status: 'normal' },
      { name: 'Albumin/Creatinine Ratio', value: 8, unit: 'mg/g', range: '<30', status: 'normal' },
    ],
  },
}; 