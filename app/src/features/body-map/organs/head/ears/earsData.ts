import { Organ } from '../../types';

export const earsOrgan: Organ = {
  id: 'ears',
  label: 'Ears',
  position: { x: 0.35, y: 0.12 },
  data: {
    name: 'Ears / Auditory System',
    description: 'Comprehensive hearing health assessment including functional hearing, cochlear health, middle ear function, and neural pathway integrity.',
    biomarkers: [
      { name: 'Normal-Frequency Thresholds (0.5-8 kHz)', value: 12, unit: 'dB HL', range: '0-20', status: 'normal' },
      { name: 'Extended High-Frequency Thresholds (8-16 kHz)', value: 18, unit: 'dB HL', range: '0-25', status: 'normal' },
      { name: 'Hearing Age', value: 35, unit: 'years', range: 'Chronological: 48', status: 'normal' },
      { name: 'DPOAE (Distortion Product Otoacoustic Emissions)', value: 8.5, unit: 'dB SPL', range: '>6.0', status: 'normal' },
      { name: 'Cochlear Integrity Score', value: 92, unit: 'score', range: '80-100', status: 'normal' },
      { name: 'Tympanic Compliance', value: 0.8, unit: 'mL', range: '0.6-1.2', status: 'normal' },
      { name: 'Middle Ear Pressure', value: -15, unit: 'daPa', range: '-50 to +50', status: 'normal' },
      { name: 'Acoustic Reflex Threshold', value: 85, unit: 'dB HL', range: '70-100', status: 'normal' },
      { name: 'ABR Latency (Wave V)', value: 5.8, unit: 'ms', range: '5.5-6.5', status: 'normal' },
      { name: 'Interpeak Latency (I-V)', value: 4.1, unit: 'ms', range: '3.8-4.4', status: 'normal' },
      { name: 'Neural Efficiency Score', value: 88, unit: 'score', range: '75-100', status: 'normal' },
      { name: 'VEMP (Vestibular Evoked Myogenic Potential)', value: 12.5, unit: 'μV', range: '8-20', status: 'normal' },
      { name: 'Vestibular Function Score', value: 85, unit: 'score', range: '70-100', status: 'normal' },
      { name: 'Hearing Age Index', value: -13, unit: 'years', range: '-15 to +5', status: 'normal' },
      { name: 'Overall Auditory Health Score', value: 91, unit: 'score', range: '80-100', status: 'normal' },
      { name: 'Speech Recognition in Noise', value: 85, unit: '%', range: '>75', status: 'normal' },
    ],
  },
};
