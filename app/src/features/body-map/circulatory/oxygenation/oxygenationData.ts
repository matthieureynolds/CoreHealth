import { CirculationZone } from "../types";
import { oxygenationBiomarkers } from "./index";

export const oxygenationZone: CirculationZone = {
  id: "oxygenation",
  name: "Oxygenation",
  position: { x: 50, y: 22 },
  size: { width: 130, height: 70 },
  biomarkers: oxygenationBiomarkers.map((b) => b.name),
  healthScore: 95,
  description: "Blood oxygenation and pulmonary function (not lung tissue)",
  icon: "airplane",
};
