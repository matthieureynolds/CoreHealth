import { Organ } from "../../types";

export const pancreasOrgan: Organ = {
  id: "pancreas",
  label: "Pancreas",
  position: { x: 0.45, y: 0.42 },
  data: {
    name: "Pancreas / Metabolic",
    description: "Produces insulin and digestive enzymes.",
    biomarkers: [
      {
        name: "Fasting Glucose",
        value: 92,
        unit: "mg/dL",
        range: "70-99",
        status: "normal",
      },
      { name: "HbA1c", value: 5.4, unit: "%", range: "<5.7", status: "normal" },
      {
        name: "Fasting Insulin",
        value: 8.5,
        unit: "mIU/L",
        range: "2-20",
        status: "normal",
      },
      {
        name: "HOMA-IR",
        value: 1.2,
        unit: "",
        range: "<2.0",
        status: "normal",
      },
    ],
  },
};
