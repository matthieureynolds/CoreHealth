import { Organ } from '../../types';

export const brainOrgan: Organ = {
  id: 'brain',
  label: 'Brain',
  position: { x: 0.5, y: 0.15 },
  data: {
    name: 'Brain / Neurological',
    description: 'Advanced neuroimaging and cognitive biomarkers for comprehensive brain health assessment.',
    biomarkers: [
      { name: 'Brain Age (AI T1)', value: 44, unit: 'years', range: 'Chronological: 48', status: 'normal' },
      { name: 'White Matter Hyperintensities', value: 2.3, unit: 'mL', range: '<3.0', status: 'normal' },
      { name: 'Hippocampal Volume', value: 7.2, unit: 'mL', range: '6.5-8.5', status: 'normal' },
      { name: 'Fractional Anisotropy (FA)', value: 0.68, unit: 'ratio', range: '0.6-0.8', status: 'normal' },
      { name: 'Mean Diffusivity (MD)', value: 0.82, unit: '×10⁻³ mm²/s', range: '0.7-1.0', status: 'normal' },
      { name: 'Myelin Basic Protein (MBP)', value: 4.2, unit: 'ng/mL', range: '3.5-5.0', status: 'normal' },
      { name: 'Cerebral Blood Flow (CBF)', value: 58, unit: 'mL/100g/min', range: '50-70', status: 'normal' },
      { name: 'Brain Glucose Uptake', value: 6.8, unit: 'mg/100g/min', range: '6.0-8.0', status: 'normal' },
      { name: 'Oxygen Extraction Fraction (OEF)', value: 0.42, unit: 'ratio', range: '0.35-0.50', status: 'normal' },
      { name: 'Neurofilament Light (NfL)', value: 8.5, unit: 'pg/mL', range: '<12.0', status: 'normal' },
      { name: 'Glial Fibrillary Acidic Protein (GFAP)', value: 95, unit: 'pg/mL', range: '<150', status: 'normal' },
      { name: 'Tau Protein', value: 18, unit: 'pg/mL', range: '<25', status: 'normal' },
      { name: 'Brain-Derived Neurotrophic Factor (BDNF)', value: 42, unit: 'ng/mL', range: '30-60', status: 'normal' },
      { name: 'Alpha Power (8-12 Hz)', value: 15.2, unit: 'μV²', range: '10-20', status: 'normal' },
      { name: 'Beta Power (13-30 Hz)', value: 8.7, unit: 'μV²', range: '5-15', status: 'normal' },
      { name: 'Theta Power (4-8 Hz)', value: 12.4, unit: 'μV²', range: '8-18', status: 'normal' },
      { name: 'WASO (Wake After Sleep Onset)', value: 23, unit: 'minutes', range: '<30', status: 'normal' },
      { name: 'REM Sleep Percentage', value: 22, unit: '%', range: '20-25', status: 'normal' },
      { name: 'Melatonin Peak', value: 45, unit: 'pg/mL', range: '30-60', status: 'normal' },
      { name: 'Brain Age Gap', value: -4, unit: 'years', range: '-5 to +2', status: 'normal' },
      { name: 'Neuroplasticity Score', value: 87, unit: 'score', range: '70-100', status: 'normal' },
    ],
  },
};
