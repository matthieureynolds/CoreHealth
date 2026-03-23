import { VascularBiomarker } from '../../types';

export const pulmonaryFunction: VascularBiomarker = {
  name: 'Pulmonary Function',
  value: 90,
  unit: '% predicted',
  range: '>80',
  status: 'normal',
  category: 'blood',
  description: 'Composite score of overall lung function derived from spirometry; reflects the combined capacity of the lungs to move and exchange air effectively.',
};
