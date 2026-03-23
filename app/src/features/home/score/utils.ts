import { HealthScore } from '../../../shared/types';

export interface DerivedScores {
  overallHealthScore: number;
  finalRecoveryScore: number;
  finalBiomarkersScore: number;
  finalLifestyleScore: number;
}

export const deriveDashboardScores = (
  healthScore: HealthScore | null | undefined,
): DerivedScores => {
  const overall   = (healthScore?.overall  ?? 0) > 0 ? healthScore!.overall!  : 82;
  const recovery  = (healthScore?.recovery ?? 0) > 0 ? healthScore!.recovery! : 85;
  const biomarkers = (healthScore?.overall ?? 0) > 0 ? Math.round(healthScore!.overall! * 0.9) : 75;
  const lifestyle  = (healthScore?.activity ?? 0) > 0 ? healthScore!.activity! : 75;

  return {
    overallHealthScore:   Math.max(1, overall),
    finalRecoveryScore:   recovery   === 0 ? 85 : recovery,
    finalBiomarkersScore: biomarkers === 0 ? 75 : biomarkers,
    finalLifestyleScore:  lifestyle  === 0 ? 75 : lifestyle,
  };
};
