import { Organ } from '../../types';

export const eyesOrgan: Organ = {
  id: 'eyes',
  label: 'Eyes',
  position: { x: 0.5, y: 0.08 },
  data: {
    name: 'Eyes / Ocular Health',
    description: 'Comprehensive ocular health assessment including retinal imaging, optic nerve integrity, and functional vision biomarkers.',
    biomarkers: [
      { name: 'Sub-Foveal Choroidal Thickness (sfCT)', value: 285, unit: 'μm', range: '250-350', status: 'normal' },
      { name: 'Drusen Volume', value: 0.12, unit: 'mm³', range: '<0.20', status: 'normal' },
      { name: 'Retinal Nerve Fiber Layer (RNFL) Thickness', value: 95, unit: 'μm', range: '85-115', status: 'normal' },
      { name: 'Macular Thickness / Volume', value: 285, unit: 'μm', range: '270-300', status: 'normal' },
      { name: 'Intraocular Pressure (IOP)', value: 16, unit: 'mmHg', range: '12-21', status: 'normal' },
      { name: 'Accommodative Distance / Amplitude', value: 8.5, unit: 'D', range: '6-12', status: 'normal' },
      { name: 'Axial Length', value: 24.2, unit: 'mm', range: '22-26', status: 'normal' },
      { name: 'Tear Film Break-Up Time (TBUT)', value: 12.5, unit: 'seconds', range: '>10', status: 'normal' },
      { name: 'Visual Acuity (20/20 equivalent)', value: 100, unit: '%', range: '>90', status: 'normal' },
      { name: 'Contrast Sensitivity', value: 1.8, unit: 'log units', range: '1.5-2.0', status: 'normal' },
      { name: 'Color Vision Score', value: 95, unit: '%', range: '>90', status: 'normal' },
      { name: 'Peripheral Vision Field', value: 180, unit: 'degrees', range: '>170', status: 'normal' },
      { name: 'Corneal Thickness', value: 540, unit: 'μm', range: '500-580', status: 'normal' },
      { name: 'Pupil Response Time', value: 0.8, unit: 'seconds', range: '<1.2', status: 'normal' },
      { name: 'Overall Ocular Health Score', value: 94, unit: 'score', range: '80-100', status: 'normal' },
    ],
  },
};
