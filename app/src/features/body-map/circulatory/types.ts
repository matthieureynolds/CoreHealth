export interface CirculationZone {
  id: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  biomarkers: string[];
  healthScore: number;
  description: string;
  icon: string;
}

export interface VascularBiomarker {
  name: string;
  value: number;
  unit: string;
  range: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  category: 'lipid' | 'inflammation' | 'clotting' | 'blood';
  description: string;
}
