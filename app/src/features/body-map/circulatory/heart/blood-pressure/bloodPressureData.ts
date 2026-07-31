import { VascularBiomarker } from "../../types";

export const bloodPressure: VascularBiomarker = {
  name: "Blood Pressure",
  value: 120,
  unit: "mmHg",
  range: "<120/80",
  status: "normal",
  category: "blood",
  description:
    "Force of blood against artery walls; chronically elevated pressure damages vessels and is a leading risk factor for heart attack and stroke.",
};
