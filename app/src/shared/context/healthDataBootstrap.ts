import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  Biomarker,
  HealthScore,
  DailyInsight,
  BodySystem,
} from "../types";

export const BOOTSTRAP_BIOMARKERS: Biomarker[] = [
  {
    id: "1",
    name: "Creatinine",
    value: 0.93,
    unit: "mg/dL",
    category: "metabolic",
    trend: "stable",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
  {
    id: "2",
    name: "ALT",
    value: 28,
    unit: "U/L",
    category: "metabolic",
    trend: "improving",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
  {
    id: "3",
    name: "Fasting Glucose",
    value: 95,
    unit: "mg/dL",
    category: "metabolic",
    trend: "stable",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
  {
    id: "4",
    name: "Total Cholesterol",
    value: 185,
    unit: "mg/dL",
    category: "cardiovascular",
    trend: "improving",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
  {
    id: "5",
    name: "TSH",
    value: 2.1,
    unit: "mIU/L",
    category: "hormonal",
    trend: "stable",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
  {
    id: "6",
    name: "Vitamin D",
    value: 35,
    unit: "ng/mL",
    category: "nutritional",
    trend: "improving",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
  {
    id: "7",
    name: "Free T3",
    value: 3.2,
    unit: "pg/mL",
    category: "hormonal",
    trend: "stable",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
  {
    id: "8",
    name: "LDL-C",
    value: 95,
    unit: "mg/dL",
    category: "cardiovascular",
    trend: "improving",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
  {
    id: "9",
    name: "HDL-C",
    value: 58,
    unit: "mg/dL",
    category: "cardiovascular",
    trend: "stable",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
  {
    id: "10",
    name: "hs-CRP",
    value: 0.8,
    unit: "mg/L",
    category: "inflammatory",
    trend: "improving",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
  {
    id: "11",
    name: "HOMA-IR",
    value: 1.2,
    unit: "",
    category: "metabolic",
    trend: "stable",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
  {
    id: "12",
    name: "Resting HR",
    value: 58,
    unit: "bpm",
    category: "cardiovascular",
    trend: "improving",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
  {
    id: "13",
    name: "HbA1c",
    value: 5.1,
    unit: "%",
    category: "metabolic",
    trend: "stable",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
  {
    id: "14",
    name: "Triglycerides",
    value: 85,
    unit: "mg/dL",
    category: "metabolic",
    trend: "improving",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
  {
    id: "15",
    name: "ApoB",
    value: 70,
    unit: "mg/dL",
    category: "cardiovascular",
    trend: "stable",
    riskLevel: "medium",
    lastUpdated: new Date(),
  },
  {
    id: "16",
    name: "Homocysteine",
    value: 9.2,
    unit: "μmol/L",
    category: "inflammatory",
    trend: "stable",
    riskLevel: "low",
    lastUpdated: new Date(),
  },
];

// Scores calculated by the new framework:
// Biomarkers ring (45%): metabolic ~82, cardiovascular ~77, inflammation ~78, organ ~81 → 79
// Recovery ring (35%):   resting HR 58 → 81, sleep default 78 → combined 79
// Lifestyle ring (20%):  72
// Overall: (79 × 0.45) + (79 × 0.35) + (72 × 0.20) = 77
export const BOOTSTRAP_HEALTH_SCORE: HealthScore = {
  overall: 77,
  biomarkers: 79,
  recovery: 79,
  activity: 72,
  sleep: 78,
  stress: 70,
  nutrition: 81,
};

export const BOOTSTRAP_DAILY_INSIGHTS: DailyInsight[] = [
  {
    id: "1",
    title: "Great Recovery Day",
    description:
      "Your HRV is 15% above baseline, indicating excellent recovery.",
    category: "recovery",
    priority: "medium",
    actionable: true,
    action: "Consider a moderate workout today.",
  },
  {
    id: "2",
    title: "Hydration Reminder",
    description: "You've consumed 40% less water than usual yesterday.",
    category: "nutrition",
    priority: "high",
    actionable: true,
    action: "Aim for 8 glasses of water today.",
  },
];

export function buildBootstrapBodySystems(
  biomarkers: Biomarker[],
): BodySystem[] {
  return [
    {
      id: "heart",
      name: "Cardiovascular",
      coordinates: { x: 50, y: 30 },
      biomarkers: biomarkers.filter((b) => b.category === "cardiovascular"),
      riskScore: 25,
      lastAssessment: new Date(),
    },
    {
      id: "brain",
      name: "Neurological",
      coordinates: { x: 50, y: 10 },
      biomarkers: [],
      riskScore: 15,
      lastAssessment: new Date(),
    },
  ];
}

export interface BootstrapResult {
  biomarkers: Biomarker[];
  healthScore: HealthScore;
  insights: DailyInsight[];
  bodySystems: BodySystem[];
}

export async function bootstrapHealthData(): Promise<BootstrapResult> {
  const biomarkers = BOOTSTRAP_BIOMARKERS;
  const healthScore = BOOTSTRAP_HEALTH_SCORE;
  const insights = BOOTSTRAP_DAILY_INSIGHTS;
  const bodySystems = buildBootstrapBodySystems(biomarkers);

  try {
    await AsyncStorage.multiSet([
      ["biomarkers", JSON.stringify(biomarkers)],
      ["healthScore", JSON.stringify(healthScore)],
      ["dailyInsights", JSON.stringify(insights)],
    ]);
  } catch {
    // Non-critical — app still functions without persisting
  }

  return { biomarkers, healthScore, insights, bodySystems };
}
