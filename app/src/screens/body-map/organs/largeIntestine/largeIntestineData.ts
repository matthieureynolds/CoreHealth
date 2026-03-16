import { Organ } from '../types';

export const largeIntestineOrgan: Organ = {
  id: 'largeIntestine',
  label: 'Large Intestine',
  position: { x: 0.5, y: 0.55 }, // Lower abdomen, below small intestine
  data: {
    name: 'Large Intestine / Colonic Health',
    description: 'Comprehensive colonic health assessment including inflammation, microbiome diversity, digestive output, and screening biomarkers.',
    biomarkers: [
      // Inflammation & Barrier - Colonic inflammatory and barrier markers
      {
        name: 'Fecal Calprotectin',
        value: 28,
        unit: 'μg/g',
        range: '<50',
        status: 'normal',
      },
      {
        name: 'Fecal Lactoferrin',
        value: 1.8,
        unit: 'μg/mL',
        range: '<4.0',
        status: 'normal',
      },
      {
        name: 'Alpha-1-Antitrypsin',
        value: 45,
        unit: 'mg/dL',
        range: '30-60',
        status: 'normal',
      },
      {
        name: 'sIgA (Secretory Immunoglobulin A)',
        value: 185,
        unit: 'μg/mL',
        range: '150-250',
        status: 'normal',
      },
      // Microbiome & Metabolism - Gut microbiome and metabolic markers
      {
        name: 'Microbiome Diversity Index',
        value: 4.2,
        unit: 'Shannon Index',
        range: '3.5-5.0',
        status: 'normal',
      },
      {
        name: 'SCFA Profile (Short-Chain Fatty Acids)',
        value: 85,
        unit: '%',
        range: '70-100',
        status: 'normal',
      },
      {
        name: 'Butyrate Level',
        value: 12.5,
        unit: 'μmol/g',
        range: '8-20',
        status: 'normal',
      },
      {
        name: 'Pathogen Load',
        value: 2.1,
        unit: 'log CFU/g',
        range: '<4.0',
        status: 'normal',
      },
      // Digestive Output - Colonic digestive and metabolic markers
      {
        name: 'Fecal pH',
        value: 6.4,
        unit: 'pH units',
        range: '6.0-7.0',
        status: 'normal',
      },
      {
        name: 'Beta-glucuronidase Activity',
        value: 285,
        unit: 'nmol/h/mg',
        range: '200-400',
        status: 'normal',
      },
      {
        name: 'Transit Time',
        value: 28,
        unit: 'hours',
        range: '24-48',
        status: 'normal',
      },
      // Screening / Systemic - Colonic screening and systemic markers
      {
        name: 'Fecal Occult Blood',
        value: 0,
        unit: 'positive/negative',
        range: 'Negative',
        status: 'normal',
      },
      {
        name: 'CRP (C-Reactive Protein)',
        value: 0.8,
        unit: 'mg/L',
        range: '<1.0',
        status: 'normal',
      },
      {
        name: 'Fecal Elastase',
        value: 485,
        unit: 'μg/g',
        range: '>200',
        status: 'normal',
      },
      // Additional Colonic Health Markers
      {
        name: 'Colonic Motility Index',
        value: 87,
        unit: 'score',
        range: '80-100',
        status: 'normal',
      },
      {
        name: 'Mucosal Barrier Function',
        value: 91,
        unit: '%',
        range: '>85',
        status: 'normal',
      },
      {
        name: 'Overall Colonic Health Score',
        value: 93,
        unit: 'score',
        range: '80-100',
        status: 'normal',
      },
    ],
  },
};
