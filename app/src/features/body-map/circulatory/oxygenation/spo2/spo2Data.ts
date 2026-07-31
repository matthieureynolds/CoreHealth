import { VascularBiomarker } from "../../types";

export const spo2: VascularBiomarker = {
  name: "SpO₂",
  value: 98,
  unit: "%",
  range: "95-100",
  status: "normal",
  category: "blood",
  description:
    "Blood oxygen saturation measured by pulse oximetry; values below 95% indicate hypoxaemia and may require medical evaluation.",
};
