import { Organ } from "../types";

export const liverOrgan: Organ = {
  id: "liver",
  label: "Liver",
  position: { x: 0.38, y: 0.365 },
  data: {
    name: "Liver",
    description: "Filters blood and metabolises drugs.",
    biomarkers: [
      { name: "ALT", value: 28, unit: "U/L", range: "7-56", status: "optimal" },
      {
        name: "AST",
        value: 22,
        unit: "U/L",
        range: "10-40",
        status: "optimal",
      },
      { name: "GGT", value: 25, unit: "U/L", range: "9-48", status: "optimal" },
      {
        name: "ALP",
        value: 78,
        unit: "U/L",
        range: "40-129",
        status: "optimal",
      },
      {
        name: "Total Bilirubin",
        value: 0.8,
        unit: "mg/dL",
        range: "0.1-1.2",
        status: "optimal",
      },
    ],
  },
};
