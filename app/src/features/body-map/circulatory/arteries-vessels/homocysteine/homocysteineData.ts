import { VascularBiomarker } from "../../types";

export const homocysteine: VascularBiomarker = {
  name: "Homocysteine",
  value: 8.5,
  unit: "μmol/L",
  range: "<10",
  status: "normal",
  category: "inflammation",
  description:
    "Amino acid whose elevated levels damage blood vessel walls, promote plaque formation, and increase clotting risk.",
};
