import { VascularBiomarker } from "../../types";

export const dDimer: VascularBiomarker = {
  name: "D-dimer",
  value: 0.3,
  unit: "μg/mL FEU",
  range: "<0.5",
  status: "normal",
  category: "clotting",
  description:
    "Fragment produced during blood clot breakdown; elevated levels may indicate active clotting disorders such as DVT or pulmonary embolism.",
};
