import { Organ } from '../types';

export const thyroidOrgan: Organ = {
  id: 'thyroid',
  label: 'Thyroid',
  position: { x: 0.5, y: 0.15 },
  data: {
    name: 'Thyroid',
    description: 'Regulates metabolism and energy production.',
    biomarkers: [
      { name: 'TSH', value: 2.1, unit: 'mIU/L', range: '0.4-4.0', status: 'normal' },
      { name: 'Free T3', value: 3.2, unit: 'pg/mL', range: '2.3-4.2', status: 'normal' },
      { name: 'Free T4', value: 1.3, unit: 'ng/dL', range: '0.8-1.8', status: 'normal' },
      { name: 'Reverse T3', value: 24, unit: 'ng/dL', range: '8-25', status: 'normal' },
      { name: 'Anti-TPO Ab', value: 12, unit: 'IU/mL', range: '<35', status: 'normal' },
    ],
  },
}; 