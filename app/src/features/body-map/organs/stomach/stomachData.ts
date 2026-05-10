import { Organ } from '../types';

export const stomachOrgan: Organ = {
  id: 'stomach',
  label: 'Stomach',
  position: { x: 0.5, y: 0.35 }, // Upper abdomen, center
  data: {
    name: 'Stomach',
    description: 'Breaks down food for digestion.',
    biomarkers: [],
  },
};
