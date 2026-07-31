import { VascularBiomarker } from "../../types";

export const dlco: VascularBiomarker = {
  name: "DLCO",
  value: 85,
  unit: "% predicted",
  range: ">75",
  status: "normal",
  category: "blood",
  description:
    "Diffusing capacity for carbon monoxide; measures how efficiently oxygen crosses from the lungs into the bloodstream. Reduced in emphysema and pulmonary fibrosis.",
};
