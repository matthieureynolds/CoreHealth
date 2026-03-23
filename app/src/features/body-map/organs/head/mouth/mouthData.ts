import { Organ } from '../../types';

export const mouthOrgan: Organ = {
  id: 'mouth',
  label: 'Mouth',
  position: { x: 0.65, y: 0.12 },
  data: {
    name: 'Mouth / Oral Health',
    description: 'Comprehensive oral health assessment including dental hygiene, gum health, saliva composition, and inflammatory markers.',
    biomarkers: [
      { name: 'Plaque Index', value: 0.8, unit: 'score', range: '0-3 (lower better)', status: 'normal' },
      { name: 'Gingival Recession', value: 1.2, unit: 'mm', range: '0-3', status: 'normal' },
      { name: 'Attachment Loss', value: 0.5, unit: 'mm', range: '0-2', status: 'normal' },
      { name: 'Bleeding on Probing', value: 8, unit: '%', range: '<15', status: 'normal' },
      { name: 'Saliva Flow Rate', value: 1.8, unit: 'mL/min', range: '1.5-3.0', status: 'normal' },
      { name: 'Saliva pH', value: 6.8, unit: 'pH units', range: '6.5-7.5', status: 'normal' },
      { name: 'Buffer Capacity', value: 4.2, unit: 'pH units', range: '4.0-6.0', status: 'normal' },
      { name: 'MMP-8 (Matrix Metalloproteinase-8)', value: 18.5, unit: 'ng/mL', range: '<25', status: 'normal' },
      { name: 'IL-1β (Interleukin-1 Beta)', value: 2.8, unit: 'pg/mL', range: '<5.0', status: 'normal' },
      { name: 'Bacterial Load', value: 4.2, unit: 'log CFU/mL', range: '3.0-5.5', status: 'normal' },
      { name: 'Periodontal Pocket Depth', value: 2.1, unit: 'mm', range: '1-3', status: 'normal' },
      { name: 'Tooth Mobility Index', value: 0.3, unit: 'score', range: '0-3 (lower better)', status: 'normal' },
      { name: 'Oral Microbiome Diversity', value: 85, unit: 'Shannon Index', range: '70-100', status: 'normal' },
      { name: 'Caries Risk Score', value: 15, unit: 'score', range: '0-50 (lower better)', status: 'normal' },
      { name: 'Overall Oral Health Score', value: 92, unit: 'score', range: '80-100', status: 'normal' },
    ],
  },
};
