import { Organ } from '../types';

export const lungsOrgan: Organ = {
  id: 'lungs',
  label: 'Lungs',
  position: { x: 0.5, y: 0.26 },
  data: {
    name: 'Lungs / Pulmonary',
    description: 'Comprehensive pulmonary function and respiratory health assessment.',
    biomarkers: [
      { name: 'FEV1 (% predicted)', value: 92, unit: '%', range: '>80', status: 'normal' },
      { name: 'FVC (% predicted)', value: 95, unit: '%', range: '>80', status: 'normal' },
      { name: 'FEV1/FVC Ratio', value: 0.78, unit: 'ratio', range: '>0.70', status: 'normal' },
      { name: 'DLCO (Diffusion Capacity)', value: 88, unit: '% predicted', range: '>75', status: 'normal' },
      { name: 'SpO₂ (Resting)', value: 98, unit: '%', range: '95-100', status: 'normal' },
      { name: 'SpO₂ (Exercise)', value: 95, unit: '%', range: '>92', status: 'normal' },
      { name: 'Peak Expiratory Flow (PEF)', value: 520, unit: 'L/min', range: '>450', status: 'normal' },
      { name: 'Residual Volume (RV)', value: 1.8, unit: 'L', range: '1.2-2.5', status: 'normal' },
      { name: 'Total Lung Capacity (TLC)', value: 5.9, unit: 'L', range: '5.0-7.0', status: 'normal' },
      { name: 'Airway Resistance (Raw)', value: 1.2, unit: 'cmH₂O/L/s', range: '0.6-2.4', status: 'normal' },
      { name: 'Exhaled Nitric Oxide (FeNO)', value: 18, unit: 'ppb', range: '<25', status: 'normal' },
      { name: 'Respiratory Rate (resting)', value: 14, unit: 'breaths/min', range: '12-20', status: 'normal' },
      { name: 'Overall Pulmonary Health Score', value: 93, unit: 'score', range: '80-100', status: 'normal' },
    ],
  },
};
