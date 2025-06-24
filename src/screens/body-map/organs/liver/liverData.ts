import { Organ } from '../types';

export const liverOrgan: Organ = {
  id: 'liver',
  label: 'Liver',
  position: { x: 0.58, y: 0.38 },
  data: {
    name: 'Liver',
    description: 'Filters blood and metabolises drugs.',
    biomarkers: [
      { name: 'ALT', value: 28, unit: 'U/L', range: '7-56', status: 'normal' },
      { name: 'AST', value: 22, unit: 'U/L', range: '10-40', status: 'normal' },
      { name: 'ALP', value: 78, unit: 'U/L', range: '40-129', status: 'normal' },
      { name: 'GGT', value: 25, unit: 'U/L', range: '9-48', status: 'normal' },
      { name: 'Total Bilirubin', value: 0.8, unit: 'mg/dL', range: '0.1-1.2', status: 'normal' },
      { name: 'Direct Bilirubin', value: 0.2, unit: 'mg/dL', range: '0.0-0.3', status: 'normal' },
      { name: 'Albumin', value: 4.5, unit: 'g/dL', range: '3.4-5.4', status: 'normal' },
      { name: 'Globulin', value: 2.8, unit: 'g/dL', range: '2.0-3.5', status: 'normal' },
      { name: 'A/G Ratio', value: 1.6, unit: '', range: '1.0-2.1', status: 'normal' },
    ],
  },
}; 