import { palette } from "@shared/theme/colors";

/**
 * Destination checklists shown on the trip's Travel Health page.
 *
 * Static for now — the real version needs to vary by destination and by the
 * user's own vaccination record, which is why they live in a data module
 * rather than inline in the screen.
 */
export const VACCINATIONS = [
  { name: "COVID-19", severity: "Required", color: palette.danger },
  { name: "Hepatitis A", severity: "Recommended", color: palette.warningAlt },
  { name: "Typhoid", severity: "Recommended", color: palette.warningAlt },
];

export const MEDICATIONS = [
  { name: "Antihistamines", note: "Recommended for allergies" },
  { name: "Antacids", note: "Recommended for heartburn" },
  { name: "First Aid", note: "Recommended for minor cuts" },
  { name: "ORS", note: "Recommended for food poisoning" },
];
