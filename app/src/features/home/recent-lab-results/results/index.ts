export { totalCholesterol } from "./total-cholesterol/totalCholesterolData";
export { ldlCholesterol } from "./ldl-cholesterol/ldlCholesterolData";
export { fastingGlucose } from "./fasting-glucose/fastingGlucoseData";
export { creatinine } from "./creatinine/creatinineData";
export { hemoglobin } from "./hemoglobin/hemoglobinData";
export { platelets } from "./platelets/plateletsData";
export { whiteBloodCells } from "./white-blood-cells/wbcData";
export { bun } from "./bun/bunData";
export { alt } from "./alt/altData";
export { ast } from "./ast/astData";
export * from "./types";

import { totalCholesterol } from "./total-cholesterol/totalCholesterolData";
import { ldlCholesterol } from "./ldl-cholesterol/ldlCholesterolData";
import { fastingGlucose } from "./fasting-glucose/fastingGlucoseData";
import { creatinine } from "./creatinine/creatinineData";
import { hemoglobin } from "./hemoglobin/hemoglobinData";
import { platelets } from "./platelets/plateletsData";
import { whiteBloodCells } from "./white-blood-cells/wbcData";
import { bun } from "./bun/bunData";
import { alt } from "./alt/altData";
import { ast } from "./ast/astData";
import { LabResult } from "./types";

export const recentLabResults: LabResult[] = [
  totalCholesterol,
  ldlCholesterol,
  fastingGlucose,
  creatinine,
  hemoglobin,
  platelets,
  whiteBloodCells,
  bun,
  alt,
  ast,
];
