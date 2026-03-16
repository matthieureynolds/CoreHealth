import { Organ } from '../types';

export const smallIntestineOrgan: Organ = {
  id: 'smallIntestine',
  label: 'Small Intestine',
  position: { x: 0.5, y: 0.45 }, // Lower abdomen, center
  data: {
    name: 'Small Intestine / Intestinal Health',
    description: 'Comprehensive small intestinal health assessment including barrier integrity, inflammation, absorption capacity, and microbial activity.',
    biomarkers: [
      // Barrier Integrity - Intestinal permeability and barrier function
      {
        name: 'Zonulin',
        value: 38,
        unit: 'ng/mL',
        range: '<60',
        status: 'normal',
      },
      {
        name: 'I-FABP (Intestinal Fatty Acid Binding Protein)',
        value: 1.8,
        unit: 'ng/mL',
        range: '<2.5',
        status: 'normal',
      },
      {
        name: 'DAO (Diamine Oxidase)',
        value: 12.5,
        unit: 'U/mL',
        range: '10-20',
        status: 'normal',
      },
      {
        name: 'Lactulose/Mannitol Ratio',
        value: 0.025,
        unit: 'ratio',
        range: '<0.03',
        status: 'normal',
      },
      // Inflammation - Intestinal inflammatory markers
      {
        name: 'Calprotectin',
        value: 25,
        unit: 'μg/g',
        range: '<50',
        status: 'normal',
      },
      {
        name: 'Lactoferrin',
        value: 2.8,
        unit: 'μg/mL',
        range: '<4.0',
        status: 'normal',
      },
      // Absorption - Intestinal absorption capacity
      {
        name: 'D-Xylose Test',
        value: 28,
        unit: 'mg/dL',
        range: '>25',
        status: 'normal',
      },
      {
        name: 'Vitamin B12 Absorption',
        value: 85,
        unit: '%',
        range: '>70',
        status: 'normal',
      },
      {
        name: 'Fat Absorption',
        value: 92,
        unit: '%',
        range: '>85',
        status: 'normal',
      },
      // Microbial Activity - Intestinal bacterial activity
      {
        name: 'Hydrogen Breath Test',
        value: 8,
        unit: 'ppm',
        range: '<20',
        status: 'normal',
      },
      {
        name: 'Methane Breath Test',
        value: 5,
        unit: 'ppm',
        range: '<15',
        status: 'normal',
      },
      {
        name: 'Small Intestinal Bacterial Overgrowth (SIBO)',
        value: 0,
        unit: 'positive/negative',
        range: 'Negative',
        status: 'normal',
      },
      // Additional Intestinal Health Markers
      {
        name: 'Intestinal Motility Index',
        value: 88,
        unit: 'score',
        range: '80-100',
        status: 'normal',
      },
      {
        name: 'Villi Height',
        value: 680,
        unit: 'μm',
        range: '600-800',
        status: 'normal',
      },
      {
        name: 'Crypt Depth',
        value: 180,
        unit: 'μm',
        range: '150-220',
        status: 'normal',
      },
      {
        name: 'Overall Intestinal Health Score',
        value: 89,
        unit: 'score',
        range: '80-100',
        status: 'normal',
      },
    ],
  },
};
