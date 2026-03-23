/** Biomarker row as rendered in the shared info panel. */
export interface PanelBiomarker {
  name: string;
  value: number;
  unit: string;
  range: string;
  status: string;
}

/**
 * Minimum shape required by the body-map info panel.
 * Both `Organ` (organs system) and zone payloads from skeleton/circulation
 * satisfy this interface structurally.
 */
export interface PanelPayload {
  id?: string;
  data: {
    name: string;
    description: string;
    biomarkers: PanelBiomarker[];
  };
}
