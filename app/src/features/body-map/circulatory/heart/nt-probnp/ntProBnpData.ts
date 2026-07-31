import { VascularBiomarker } from "../../types";

export const ntProBnp: VascularBiomarker = {
  name: "NT-proBNP",
  value: 85,
  unit: "pg/mL",
  range: "<125",
  status: "normal",
  category: "blood",
  description:
    "Hormone released when the heart is under stress; elevated levels are a sensitive marker of heart failure and cardiac dysfunction.",
};
