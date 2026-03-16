import { Organ } from '../types';

export const eyesOrgan: Organ = {
  id: 'eyes',
  label: 'Eyes',
  position: { x: 0.5, y: 0.08 }, // Center top of head, above brain
  data: {
    name: 'Eyes / Ocular Health',
    description: 'Comprehensive ocular health assessment including retinal imaging, optic nerve integrity, and functional vision biomarkers.',
    biomarkers: [
      // Strongest imaging biomarker of ocular aging and vascular health
      {
        name: 'Sub-Foveal Choroidal Thickness (sfCT)',
        value: 285,
        unit: 'μm',
        range: '250-350',
        status: 'normal',
      },
      // Key early sign of macular degeneration — directly tied to aging and metabolism
      {
        name: 'Drusen Volume',
        value: 0.12,
        unit: 'mm³',
        range: '<0.20',
        status: 'normal',
      },
      // Quantifies optic nerve integrity — critical for glaucoma and neurodegeneration
      {
        name: 'Retinal Nerve Fiber Layer (RNFL) Thickness',
        value: 95,
        unit: 'μm',
        range: '85-115',
        status: 'normal',
      },
      // Reflects photoreceptor health and metabolic support; useful for retinal "age"
      {
        name: 'Macular Thickness / Volume',
        value: 285,
        unit: 'μm',
        range: '270-300',
        status: 'normal',
      },
      // Essential risk biomarker for glaucoma and optic nerve stress
      {
        name: 'Intraocular Pressure (IOP)',
        value: 16,
        unit: 'mmHg',
        range: '12-21',
        status: 'normal',
      },
      // Functional biomarker of lens elasticity and "vision age"
      {
        name: 'Accommodative Distance / Amplitude',
        value: 8.5,
        unit: 'D',
        range: '6-12',
        status: 'normal',
      },
      // Structural biomarker for myopia / hyperopia; adjusts other metrics for precision
      {
        name: 'Axial Length',
        value: 24.2,
        unit: 'mm',
        range: '22-26',
        status: 'normal',
      },
      // Tear film stability and ocular surface health
      {
        name: 'Tear Film Break-Up Time (TBUT)',
        value: 12.5,
        unit: 'seconds',
        range: '>10',
        status: 'normal',
      },
      // Additional ocular biomarkers
      {
        name: 'Visual Acuity (20/20 equivalent)',
        value: 100,
        unit: '%',
        range: '>90',
        status: 'normal',
      },
      {
        name: 'Contrast Sensitivity',
        value: 1.8,
        unit: 'log units',
        range: '1.5-2.0',
        status: 'normal',
      },
      {
        name: 'Color Vision Score',
        value: 95,
        unit: '%',
        range: '>90',
        status: 'normal',
      },
      {
        name: 'Peripheral Vision Field',
        value: 180,
        unit: 'degrees',
        range: '>170',
        status: 'normal',
      },
      {
        name: 'Corneal Thickness',
        value: 540,
        unit: 'μm',
        range: '500-580',
        status: 'normal',
      },
      {
        name: 'Pupil Response Time',
        value: 0.8,
        unit: 'seconds',
        range: '<1.2',
        status: 'normal',
      },
      {
        name: 'Overall Ocular Health Score',
        value: 94,
        unit: 'score',
        range: '80-100',
        status: 'normal',
      },
    ],
  },
};
