import { Biomarker } from '../../../shared/types';
import { PanelBiomarker, PanelPayload } from '../types';

// Maps organ ID to name patterns that match relevant biomarkers
const ORGAN_PATTERNS: Record<string, RegExp[]> = {
  heart: [/ldl/i, /hdl/i, /cholesterol/i, /triglyceride/i, /crp/i, /homocysteine/i, /probnp/i, /apob/i, /lp\(a\)/i, /troponin/i, /cardiac/i, /blood.?press/i, /systolic/i, /diastolic/i],
  liver: [/\balt\b/i, /\bast\b/i, /\bggt\b/i, /\balp\b/i, /bilirubin/i, /\balbumin\b/i, /liver/i, /hepat/i, /ferritin/i, /iron/i],
  kidneys: [/creatinine/i, /egfr/i, /\bbun\b/i, /urea/i, /kidney/i, /renal/i, /uric.?acid/i, /microalbumin/i, /cystatin/i],
  lungs: [/\bo2\b/i, /oxygen/i, /spo2/i, /lung/i, /respirat/i, /fev/i, /peak.?flow/i],
  stomach: [/glucose/i, /insulin/i, /a1c/i, /hba1c/i, /helicobacter/i, /pylori/i, /pepsin/i, /gastrin/i],
  thyroid: [/\btsh\b/i, /\bft3\b/i, /\bft4\b/i, /\bt3\b/i, /\bt4\b/i, /thyroid/i, /thyroxin/i],
  brain: [/cortisol/i, /serotonin/i, /dopamine/i, /\bbdnf\b/i, /melatonin/i, /adrenaline/i, /epinephrine/i],
  pancreas: [/glucose/i, /insulin/i, /a1c/i, /hba1c/i, /c.?peptide/i, /amylase/i, /lipase/i],
  'small-intestine': [/b12/i, /folate/i, /folic/i, /iron/i, /absorption/i, /calprotectin/i],
  'large-intestine': [/calprotectin/i, /microbiome/i, /gut/i, /colon/i],
  lungs_left: [/\bo2\b/i, /oxygen/i, /spo2/i],
  lungs_right: [/\bo2\b/i, /oxygen/i, /spo2/i],
};

// Shared alias: both lung shapes map to the same patterns
ORGAN_PATTERNS['lung_left'] = ORGAN_PATTERNS.lungs;
ORGAN_PATTERNS['lung_right'] = ORGAN_PATTERNS.lungs;

function riskToStatus(riskLevel: Biomarker['riskLevel']): string {
  if (riskLevel === 'high') return 'abnormal';
  if (riskLevel === 'medium') return 'borderline';
  return 'normal';
}

function toBiomarkerPanel(b: Biomarker): PanelBiomarker {
  return {
    name: b.name,
    value: b.value,
    unit: b.unit,
    range: '—',
    status: riskToStatus(b.riskLevel),
  };
}

/**
 * Returns real user biomarkers matching a given organ, formatted as PanelBiomarker[].
 * Falls back to an empty array (callers keep their hardcoded defaults when this is empty).
 */
export function getOrganUserBiomarkers(organId: string, biomarkers: Biomarker[]): PanelBiomarker[] {
  const patterns = ORGAN_PATTERNS[organId];
  if (!patterns || biomarkers.length === 0) return [];
  return biomarkers
    .filter(b => patterns.some(p => p.test(b.name)))
    .map(toBiomarkerPanel);
}

/**
 * Returns an enriched PanelPayload: real user biomarkers prepended to the organ's
 * default biomarkers. Defaults are shown when no real data matches.
 */
export function enrichOrganPanel(organ: PanelPayload, biomarkers: Biomarker[]): PanelPayload {
  const real = getOrganUserBiomarkers(organ.id ?? '', biomarkers);
  if (real.length === 0) return organ;

  // Real biomarkers first, then any defaults whose name isn't already covered
  const realNames = new Set(real.map(b => b.name.toLowerCase()));
  const filtered = organ.data.biomarkers.filter(b => !realNames.has(b.name.toLowerCase()));

  return {
    ...organ,
    data: {
      ...organ.data,
      biomarkers: [...real, ...filtered],
    },
  };
}
