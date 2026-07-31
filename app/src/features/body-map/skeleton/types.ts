export interface BoneHealthBiomarker {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: "optimal" | "normal" | "low" | "high" | "critical";
  lastUpdated: string;
  trend?: "improving" | "stable" | "declining";
  description: string;
}

export interface BoneHealthZone {
  id: string;
  name: string;
  anatomicalFocus: string;
  position: { x: number; y: number };
  biomarkers: BoneHealthBiomarker[];
  overallRisk: "low" | "moderate" | "high" | "critical";
  riskFactors: string[];
  recommendations: string[];
  lastAssessment: string;
}
