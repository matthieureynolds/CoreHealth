export { bloodPressure } from "./blood-pressure/bloodPressureData";
export { restingHr } from "./resting-hr/restingHrData";
export { ntProBnp } from "./nt-probnp/ntProBnpData";
export { vo2Max } from "./vo2-max/vo2MaxData";
export { totalCholesterol } from "./total-cholesterol/totalCholesterolData";
export { ldl } from "./ldl/ldlData";
export { hdl } from "./hdl/hdlData";
export { triglycerides } from "./triglycerides/triglyceridesData";

import { bloodPressure } from "./blood-pressure/bloodPressureData";
import { restingHr } from "./resting-hr/restingHrData";
import { ntProBnp } from "./nt-probnp/ntProBnpData";
import { vo2Max } from "./vo2-max/vo2MaxData";
import { totalCholesterol } from "./total-cholesterol/totalCholesterolData";
import { ldl } from "./ldl/ldlData";
import { hdl } from "./hdl/hdlData";
import { triglycerides } from "./triglycerides/triglyceridesData";
import { VascularBiomarker } from "../types";

export const heartBiomarkers: VascularBiomarker[] = [
  bloodPressure,
  restingHr,
  ntProBnp,
  vo2Max,
  totalCholesterol,
  ldl,
  hdl,
  triglycerides,
];
