import { DerivedRiskFeature, HereditarySignal } from "../../types";

function isEarlyOnset(onsetBand: string): boolean {
  // Treat any band starting below 60 as early
  const normalized = onsetBand.replace(/[^0-9–-]/g, "");
  if (!normalized) return false;
  const parts = normalized.split(/–|-/);
  const start = parseInt(parts[0], 10);
  return !isNaN(start) && start < 60;
}

export function deriveFeaturesFromSignals(
  signals: HereditarySignal[],
): DerivedRiskFeature[] {
  const features: Record<string, DerivedRiskFeature> = {};

  for (const s of signals) {
    if (s.status !== "active") continue;
    const rel = s.relationDegreeToRecipients;

    // Prostate cancer → early PSA if parent and early onset
    if (/prostate[_\s]?cancer/i.test(s.conditionCode)) {
      if (
        (rel === "parent" || rel === "sibling") &&
        isEarlyOnset(s.onsetAgeBand)
      ) {
        const key = "pc_screening_earlier";
        features[key] = {
          key,
          value: true,
          rationale: "Family history of early-onset prostate cancer",
          sourceSignalIds: [...(features[key]?.sourceSignalIds ?? []), s.id],
          createdAt: new Date().toISOString(),
        };
      }
    }

    // Breast/ovarian → watchlist
    if (/(breast|ovarian)[_\s]?cancer/i.test(s.conditionCode)) {
      const key = "breast_cancer_watchlist";
      features[key] = {
        key,
        value: true,
        rationale: "Family history suggests elevated breast/ovarian risk",
        sourceSignalIds: [...(features[key]?.sourceSignalIds ?? []), s.id],
        createdAt: new Date().toISOString(),
      };
    }

    // Type 2 diabetes
    if (/type\s*2\s*diabetes|t2d/i.test(s.conditionCode)) {
      const key = "t2d_family_risk";
      features[key] = {
        key,
        value: true,
        rationale: "Family history of T2D",
        sourceSignalIds: [...(features[key]?.sourceSignalIds ?? []), s.id],
        createdAt: new Date().toISOString(),
      };
    }

    // Coronary artery disease
    if (
      /cad|coronary|myocardial|heart\s*attack|ischemic/i.test(s.conditionCode)
    ) {
      const key = "cad_family_risk";
      features[key] = {
        key,
        value: true,
        rationale: "Family history of coronary artery disease",
        sourceSignalIds: [...(features[key]?.sourceSignalIds ?? []), s.id],
        createdAt: new Date().toISOString(),
      };
    }

    // Colorectal → earlier screening
    if (/colorectal|colon\s*cancer/i.test(s.conditionCode)) {
      if (isEarlyOnset(s.onsetAgeBand)) {
        const key = "colorectal_earlier";
        features[key] = {
          key,
          value: true,
          rationale: "Family history of early-onset colorectal cancer",
          sourceSignalIds: [...(features[key]?.sourceSignalIds ?? []), s.id],
          createdAt: new Date().toISOString(),
        };
      }
    }

    // Glaucoma watchlist
    if (/glaucoma/i.test(s.conditionCode)) {
      const key = "glaucoma_watchlist";
      features[key] = {
        key,
        value: true,
        rationale: "Family history of glaucoma",
        sourceSignalIds: [...(features[key]?.sourceSignalIds ?? []), s.id],
        createdAt: new Date().toISOString(),
      };
    }
  }

  return Object.values(features);
}
