export interface Biomarker {
  name: string;
  value: number;
  unit: string;
  range: string;
  status: 'normal' | 'borderline' | 'abnormal';
}

export interface OrganData {
  name: string;
  description: string;
  biomarkers: Biomarker[];
}

export interface OrganPosition {
  x: number; // Percentage of image width (0-1)
  y: number; // Percentage of image height (0-1)
}

export interface Organ {
  id: string;
  label: string;
  position: OrganPosition;
  data: OrganData;
}
