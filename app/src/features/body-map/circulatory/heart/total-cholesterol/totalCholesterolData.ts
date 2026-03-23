import { VascularBiomarker } from '../../types';

export const totalCholesterol: VascularBiomarker = {
  name: 'Total Cholesterol',
  value: 178,
  unit: 'mg/dL',
  range: '<200',
  status: 'normal',
  category: 'lipid',
  description: 'Combined measure of all cholesterol in the blood; best interpreted alongside LDL, HDL, and triglycerides rather than in isolation.',
};
