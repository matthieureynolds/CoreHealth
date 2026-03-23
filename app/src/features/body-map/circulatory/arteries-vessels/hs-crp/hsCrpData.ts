import { VascularBiomarker } from '../../types';

export const hsCrp: VascularBiomarker = {
  name: 'hs-CRP',
  value: 0.8,
  unit: 'mg/L',
  range: '<1.0',
  status: 'normal',
  category: 'inflammation',
  description: 'High-sensitivity marker of systemic inflammation; elevated levels predict increased risk of cardiovascular events.',
};
