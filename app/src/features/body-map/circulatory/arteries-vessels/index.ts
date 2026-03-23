export { apoB } from './apob/apoBData';
export { lpa } from './lpa/lpaData';
export { hsCrp } from './hs-crp/hsCrpData';
export { homocysteine } from './homocysteine/homocysteineData';
export { fibrinogen } from './fibrinogen/fibrinogenData';
export { dDimer } from './d-dimer/dDimerData';
export { plateletCount } from './platelet-count/plateletCountData';
export { hemoglobin } from './hemoglobin/hemoglobinData';

import { apoB } from './apob/apoBData';
import { lpa } from './lpa/lpaData';
import { hsCrp } from './hs-crp/hsCrpData';
import { homocysteine } from './homocysteine/homocysteineData';
import { fibrinogen } from './fibrinogen/fibrinogenData';
import { dDimer } from './d-dimer/dDimerData';
import { plateletCount } from './platelet-count/plateletCountData';
import { hemoglobin } from './hemoglobin/hemoglobinData';
import { VascularBiomarker } from '../types';

export const arteriesVesselsBiomarkers: VascularBiomarker[] = [
  apoB,
  lpa,
  hsCrp,
  homocysteine,
  fibrinogen,
  dDimer,
  plateletCount,
  hemoglobin,
];
