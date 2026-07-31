export { spo2 } from "./spo2/spo2Data";
export { fev1 } from "./fev1/fev1Data";
export { fvc } from "./fvc/fvcData";
export { dlco } from "./dlco/dlcoData";
export { hemoglobinOxy } from "./hemoglobin/hemoglobinData";
export { carbonMonoxide } from "./carbon-monoxide/carbonMonoxideData";
export { pulmonaryFunction } from "./pulmonary-function/pulmonaryFunctionData";

import { spo2 } from "./spo2/spo2Data";
import { fev1 } from "./fev1/fev1Data";
import { fvc } from "./fvc/fvcData";
import { dlco } from "./dlco/dlcoData";
import { hemoglobinOxy } from "./hemoglobin/hemoglobinData";
import { carbonMonoxide } from "./carbon-monoxide/carbonMonoxideData";
import { pulmonaryFunction } from "./pulmonary-function/pulmonaryFunctionData";
import { VascularBiomarker } from "../types";

export const oxygenationBiomarkers: VascularBiomarker[] = [
  spo2,
  fev1,
  fvc,
  dlco,
  hemoglobinOxy,
  carbonMonoxide,
  pulmonaryFunction,
];
