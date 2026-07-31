export interface LabResult {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  trendPercent: number;
  status: "optimal" | "normal" | "borderline" | "high" | "low";
  lastUpdated: string;
}
