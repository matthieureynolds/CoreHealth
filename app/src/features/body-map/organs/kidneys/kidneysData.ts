import { Organ } from "../types";

export const kidneysOrgan: Organ = {
  id: "kidneys",
  label: "Kidneys",
  position: { x: 0.674, y: 0.43 },
  data: {
    name: "Kidneys",
    description: "Remove waste and balance fluids.",
    biomarkers: [
      {
        name: "Creatinine",
        value: 0.93,
        unit: "mg/dL",
        range: "0.6-1.2",
        status: "normal",
      },
      {
        name: "Urea",
        value: 15,
        unit: "mg/dL",
        range: "7-20",
        status: "normal",
      },
      {
        name: "Sodium",
        value: 140,
        unit: "mmol/L",
        range: "136-145",
        status: "normal",
      },
      {
        name: "Potassium",
        value: 4.2,
        unit: "mmol/L",
        range: "3.5-5.1",
        status: "normal",
      },
      {
        name: "Magnesium",
        value: 2.1,
        unit: "mg/dL",
        range: "1.7-2.2",
        status: "normal",
      },
    ],
  },
};
