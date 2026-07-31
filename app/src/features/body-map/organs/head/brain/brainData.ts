import { Organ } from "../../types";

export const brainOrgan: Organ = {
  id: "brain",
  label: "Brain",
  position: { x: 0.5, y: 0.15 },
  data: {
    name: "Brain / Neurological",
    description:
      "Advanced neuroimaging and cognitive biomarkers for comprehensive brain health assessment.",
    biomarkers: [
      {
        name: "Cortisol",
        value: 14.2,
        unit: "μg/dL",
        range: "6-18.4",
        status: "normal",
      },
    ],
  },
};
