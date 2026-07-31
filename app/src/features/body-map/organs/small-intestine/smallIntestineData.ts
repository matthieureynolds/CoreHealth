import { Organ } from "../types";

export const smallIntestineOrgan: Organ = {
  id: "smallIntestine",
  label: "Small Intestine",
  position: { x: 0.5, y: 0.45 },
  data: {
    name: "Small Intestine",
    description: "Absorbs nutrients from food.",
    biomarkers: [
      {
        name: "Vitamin D",
        value: 42,
        unit: "ng/mL",
        range: "30-100",
        status: "normal",
      },
      {
        name: "Vitamin B12",
        value: 450,
        unit: "pg/mL",
        range: "200-900",
        status: "normal",
      },
      {
        name: "Folate",
        value: 12,
        unit: "ng/mL",
        range: "3-17",
        status: "normal",
      },
      {
        name: "Calcium",
        value: 9.5,
        unit: "mg/dL",
        range: "8.5-10.5",
        status: "normal",
      },
      {
        name: "Ferritin",
        value: 85,
        unit: "ng/mL",
        range: "20-250",
        status: "normal",
      },
      {
        name: "Transferrin Saturation",
        value: 30,
        unit: "%",
        range: "20-50",
        status: "normal",
      },
    ],
  },
};
