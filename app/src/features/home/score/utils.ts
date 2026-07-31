import { HealthScore } from "@shared/types";

export interface DerivedScores {
  overallHealthScore: number;
  finalRecoveryScore: number;
  finalBiomarkersScore: number;
  finalLifestyleScore: number;
}

export const deriveDashboardScores = (
  healthScore: HealthScore | null | undefined,
): DerivedScores => {
  const overall = (healthScore?.overall ?? 0) > 0 ? healthScore!.overall! : 78;
  const biomarkers =
    (healthScore?.biomarkers ?? 0) > 0 ? healthScore!.biomarkers! : 77;
  const recovery =
    (healthScore?.recovery ?? 0) > 0 ? healthScore!.recovery! : 79;
  const lifestyle =
    (healthScore?.activity ?? 0) > 0 ? healthScore!.activity! : 72;

  return {
    overallHealthScore: Math.min(99, Math.max(1, overall)),
    finalBiomarkersScore: Math.min(99, Math.max(1, biomarkers)),
    finalRecoveryScore: Math.min(99, Math.max(1, recovery)),
    finalLifestyleScore: Math.min(99, Math.max(1, lifestyle)),
  };
};
