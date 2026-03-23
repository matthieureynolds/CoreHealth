import { VascularBiomarker } from '../../types';

export const carbonMonoxide: VascularBiomarker = {
  name: 'Carbon Monoxide',
  value: 1.2,
  unit: '% COHb',
  range: '<3',
  status: 'normal',
  category: 'blood',
  description: 'Carboxyhaemoglobin saturation; CO binds to haemoglobin 200× more strongly than oxygen, blocking oxygen delivery. Elevated in smokers and CO exposure.',
};
