import AsyncStorage from '@react-native-async-storage/async-storage';
import { Biomarker, DailyInsight, HealthScore } from '../types';
import { refreshUserSnapshot } from '../services/user/userSnapshotService';

// ─── Scoring philosophy ───────────────────────────────────────────────────────
// "Normal" clinical ranges → ~65. Optimal longevity ranges → 90+.
// 99 is the ceiling (reserved for Talmage Johnson territory — young + fully optimised).
// Biomarkers ring: 45% | Recovery ring: 35% | Lifestyle ring: 20%
// Cliff edges: critical out-of-range markers cap the overall score regardless of other rings.

// ─── Individual marker scorers (0–99) ────────────────────────────────────────

function scoreGlucose(v: number): number {
  if (v < 72) return 78;       // too low
  if (v <= 85) return 98;      // optimal
  if (v <= 95) return 87;      // excellent
  if (v <= 100) return 70;     // suboptimal — "normal" starts here
  if (v <= 110) return 52;     // borderline
  if (v <= 125) return 32;     // pre-diabetic
  return 15;                   // cliff edge
}

function scoreHbA1c(v: number): number {
  if (v < 4.5) return 78;      // unusually low
  if (v <= 4.8) return 98;     // optimal longevity range
  if (v <= 5.2) return 89;     // excellent
  if (v <= 5.5) return 74;     // good
  if (v <= 5.7) return 58;     // borderline
  if (v <= 6.0) return 38;     // pre-diabetic
  if (v <= 6.5) return 22;     // at risk — cliff edge approaching
  return 10;                   // cliff edge
}

function scoreHomaIR(v: number): number {
  if (v < 0.8) return 98;      // optimal — insulin sensitive
  if (v <= 1.0) return 91;
  if (v <= 1.5) return 79;
  if (v <= 2.0) return 63;
  if (v <= 2.5) return 48;
  if (v <= 3.0) return 33;
  if (v <= 3.5) return 22;
  return 12;                   // cliff edge — significant insulin resistance
}

function scoreTriglycerides(v: number): number {
  if (v < 60) return 98;       // optimal
  if (v <= 100) return 84;     // excellent
  if (v <= 130) return 68;     // good
  if (v <= 150) return 53;     // borderline — "normal" ceiling
  if (v <= 200) return 33;     // elevated
  return 15;                   // cliff edge
}

function scoreHDL(v: number): number {
  if (v > 80) return 98;       // optimal
  if (v > 70) return 91;
  if (v > 60) return 81;
  if (v > 50) return 67;
  if (v > 40) return 50;
  if (v > 35) return 34;
  return 20;                   // cliff edge
}

function scoreApoB(v: number): number {
  if (v < 55) return 98;       // optimal longevity target
  if (v < 65) return 89;
  if (v < 75) return 76;
  if (v < 90) return 58;
  if (v < 100) return 43;      // "normal" — not optimal
  if (v < 120) return 28;
  return 14;                   // cliff edge — major cardiovascular risk
}

function scoreLDL(v: number): number {
  if (v < 70) return 93;
  if (v < 100) return 79;
  if (v < 130) return 63;
  if (v < 160) return 43;
  if (v < 190) return 28;
  return 14;
}

function scoreTotalCholesterol(v: number): number {
  if (v < 150) return 83;
  if (v <= 180) return 94;
  if (v <= 200) return 84;
  if (v <= 240) return 62;
  return 38;
}

function scoreHsCRP(v: number): number {
  if (v < 0.3) return 98;      // optimal — near-zero inflammation
  if (v < 0.5) return 89;
  if (v < 1.0) return 74;
  if (v < 2.0) return 53;
  if (v < 3.0) return 38;
  return 18;                   // cliff edge — chronic inflammation
}

function scoreHomocysteine(v: number): number {
  if (v < 7) return 98;        // optimal — methylation working well
  if (v < 9) return 84;
  if (v < 12) return 67;
  if (v < 15) return 48;
  return 22;                   // cliff edge — brain + vascular risk
}

function scoreALT(v: number): number {
  if (v < 20) return 98;       // optimal liver health
  if (v < 25) return 91;
  if (v < 35) return 77;
  if (v < 45) return 56;
  if (v < 55) return 40;
  return 22;                   // cliff edge
}

function scoreCreatinine(v: number): number {
  if (v >= 0.7 && v <= 0.9) return 98;   // optimal kidney function
  if (v > 0.9 && v <= 1.0) return 89;
  if (v > 1.0 && v <= 1.2) return 74;
  if (v > 1.2 && v <= 1.4) return 53;
  if (v < 0.7) return 75;                 // low can indicate low muscle mass
  return 33;                              // cliff edge
}

function scoreTSH(v: number): number {
  if (v >= 1.0 && v <= 2.0) return 98;   // optimal thyroid function
  if ((v >= 0.5 && v < 1.0) || (v > 2.0 && v <= 2.5)) return 84;
  if ((v >= 0.3 && v < 0.5) || (v > 2.5 && v <= 3.0)) return 68;
  if (v > 3.0 && v <= 4.0) return 52;
  return 28;                              // cliff edge (<0.3 or >4.0)
}

function scoreVitaminD(v: number): number {
  if (v >= 55 && v <= 80) return 98;     // optimal
  if (v > 80) return 88;                 // very high — slight excess
  if (v >= 40) return 83;
  if (v >= 30) return 63;
  if (v >= 20) return 43;
  return 23;                             // cliff edge — severe deficiency
}

function scoreRestingHR(v: number): number {
  if (v < 45) return 98;       // elite athlete
  if (v < 52) return 91;
  if (v < 58) return 81;
  if (v < 65) return 68;
  if (v < 72) return 53;
  if (v < 80) return 38;
  return 23;
}

function scoreVO2Max(v: number): number {
  if (v > 60) return 98;       // elite — top 1%
  if (v > 55) return 89;
  if (v > 50) return 78;
  if (v > 45) return 66;
  if (v > 40) return 53;
  if (v > 35) return 38;
  return 23;
}

function scoreHRV(v: number): number {
  if (v > 100) return 98;      // exceptional autonomic health
  if (v > 80) return 91;
  if (v > 60) return 81;
  if (v > 45) return 68;
  if (v > 30) return 53;
  if (v > 20) return 38;
  return 23;
}

// ─── Weighted average helper ──────────────────────────────────────────────────
// Normalises by total weight of present markers so missing data doesn't penalise.

type WeightedScore = { score: number; weight: number };

function weightedAvg(items: WeightedScore[]): number | null {
  if (items.length === 0) return null;
  const totalWeight = items.reduce((s, m) => s + m.weight, 0);
  const sum = items.reduce((s, m) => s + m.score * m.weight, 0);
  return Math.round(sum / totalWeight);
}

// ─── Cliff edge cap ───────────────────────────────────────────────────────────
// Critical markers out of dangerous range cap the overall score.
// You cannot sleep your way to a 90 with a dangerous ApoB.

function getCriticalCap(biomarkers: Biomarker[]): number {
  let cap = 99;
  for (const b of biomarkers) {
    const v = b.value;
    const n = b.name;
    if (/hba1c|a1c/i.test(n) && v > 6.5) cap = Math.min(cap, 55);
    else if (/hba1c|a1c/i.test(n) && v > 6.0) cap = Math.min(cap, 70);
    if (/fasting glucose/i.test(n) && v > 125) cap = Math.min(cap, 55);
    if (/^apob$/i.test(n) && v > 120) cap = Math.min(cap, 65);
    else if (/^apob$/i.test(n) && v > 100) cap = Math.min(cap, 75);
    if (/hs.?crp/i.test(n) && v > 3.0) cap = Math.min(cap, 65);
    if (/homa.?ir/i.test(n) && v > 3.5) cap = Math.min(cap, 65);
    if (/triglyceride/i.test(n) && v > 200) cap = Math.min(cap, 70);
    if (/^alt$/i.test(n) && v > 80) cap = Math.min(cap, 68);
  }
  return cap;
}

// ─── Ring scorers ─────────────────────────────────────────────────────────────

function scoreBiomarkersRing(biomarkers: Biomarker[]): number {
  const find = (re: RegExp) => biomarkers.find(b => re.test(b.name))?.value;

  // Metabolic cluster (35% of biomarkers ring)
  const metabolic: WeightedScore[] = [];
  const glucose = find(/fasting glucose/i);
  if (glucose !== undefined) metabolic.push({ score: scoreGlucose(glucose), weight: 0.20 });
  const hba1c = find(/hba1c|a1c/i);
  if (hba1c !== undefined) metabolic.push({ score: scoreHbA1c(hba1c), weight: 0.25 });
  const homaIR = find(/homa.?ir/i);
  if (homaIR !== undefined) metabolic.push({ score: scoreHomaIR(homaIR), weight: 0.25 });
  const trig = find(/triglyceride/i);
  if (trig !== undefined) metabolic.push({ score: scoreTriglycerides(trig), weight: 0.15 });
  const hdl = find(/hdl/i);
  if (hdl !== undefined) metabolic.push({ score: scoreHDL(hdl), weight: 0.15 });

  // Cardiovascular cluster (35% of biomarkers ring)
  const cardio: WeightedScore[] = [];
  const apob = find(/^apob$/i);
  if (apob !== undefined) cardio.push({ score: scoreApoB(apob), weight: 0.40 });
  const hsCRP = find(/hs.?crp/i);
  if (hsCRP !== undefined) cardio.push({ score: scoreHsCRP(hsCRP), weight: 0.25 });
  const ldl = find(/^ldl/i);
  if (ldl !== undefined) cardio.push({ score: scoreLDL(ldl), weight: 0.20 });
  const totalChol = find(/total chol/i);
  if (totalChol !== undefined) cardio.push({ score: scoreTotalCholesterol(totalChol), weight: 0.15 });

  // Inflammation cluster (15% of biomarkers ring)
  const inflam: WeightedScore[] = [];
  if (hsCRP !== undefined) inflam.push({ score: scoreHsCRP(hsCRP), weight: 0.60 });
  const homocys = find(/homocysteine/i);
  if (homocys !== undefined) inflam.push({ score: scoreHomocysteine(homocys), weight: 0.40 });

  // Organ function cluster (15% of biomarkers ring)
  const organ: WeightedScore[] = [];
  const alt = find(/^alt$/i);
  if (alt !== undefined) organ.push({ score: scoreALT(alt), weight: 0.25 });
  const creatinine = find(/creatinine/i);
  if (creatinine !== undefined) organ.push({ score: scoreCreatinine(creatinine), weight: 0.25 });
  const tsh = find(/^tsh$/i);
  if (tsh !== undefined) organ.push({ score: scoreTSH(tsh), weight: 0.25 });
  const vitD = find(/vitamin d/i);
  if (vitD !== undefined) organ.push({ score: scoreVitaminD(vitD), weight: 0.25 });

  const metabolicScore = weightedAvg(metabolic);
  const cardioScore = weightedAvg(cardio);
  const inflamScore = weightedAvg(inflam);
  const organScore = weightedAvg(organ);

  // Combine clusters (normalise by present cluster weights)
  const clusters: WeightedScore[] = [];
  if (metabolicScore !== null) clusters.push({ score: metabolicScore, weight: 0.35 });
  if (cardioScore !== null) clusters.push({ score: cardioScore, weight: 0.35 });
  if (inflamScore !== null) clusters.push({ score: inflamScore, weight: 0.15 });
  if (organScore !== null) clusters.push({ score: organScore, weight: 0.15 });

  return weightedAvg(clusters) ?? 70;
}

function scoreRecoveryRing(biomarkers: Biomarker[], sleepScore: number): number {
  const find = (re: RegExp) => biomarkers.find(b => re.test(b.name))?.value;

  const items: WeightedScore[] = [];

  const vo2 = find(/vo2.?max/i);
  if (vo2 !== undefined) items.push({ score: scoreVO2Max(vo2), weight: 0.35 });

  const hrv = find(/\bhrv\b/i);
  if (hrv !== undefined) items.push({ score: scoreHRV(hrv), weight: 0.30 });

  // Sleep always included (from wearable or hardcoded default)
  items.push({ score: sleepScore, weight: 0.25 });

  const rhr = find(/resting hr|resting heart/i);
  if (rhr !== undefined) items.push({ score: scoreRestingHR(rhr), weight: 0.10 });

  return weightedAvg(items) ?? 72;
}

function scoreLifestyleRing(activityScore: number): number {
  // Lifestyle data comes from wearable activity tracking and manual inputs.
  // Currently uses the stored activity score as a proxy.
  return Math.min(99, Math.max(1, activityScore));
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const recalculateHealthScore = async (
  currentBiomarkers: Biomarker[],
  _healthScoreCalculated: boolean,
  setHealthScore: (score: HealthScore) => void,
  setHealthScoreCalculated: (v: boolean) => void,
): Promise<void> => {
  const biomarkersRing = scoreBiomarkersRing(currentBiomarkers);
  const sleepDefault = 78;
  const recoveryRing = scoreRecoveryRing(currentBiomarkers, sleepDefault);
  const lifestyleRing = scoreLifestyleRing(72);

  const raw = Math.round(
    biomarkersRing * 0.45 +
    recoveryRing   * 0.35 +
    lifestyleRing  * 0.20,
  );

  const cap = getCriticalCap(currentBiomarkers);
  const overall = Math.min(99, Math.min(cap, Math.max(1, raw)));

  const newScore: HealthScore = {
    overall,
    biomarkers: biomarkersRing,
    recovery: recoveryRing,
    activity: lifestyleRing,
    sleep: sleepDefault,
    stress: 70,
    nutrition: 75,
  };

  setHealthScore(newScore);
  setHealthScoreCalculated(true);
  await AsyncStorage.setItem('healthScore', JSON.stringify(newScore));
};

// ─── Insights ─────────────────────────────────────────────────────────────────

function buildBiomarkerInsights(biomarkers: Biomarker[], healthScore: HealthScore | null): DailyInsight[] {
  const insights: DailyInsight[] = [];
  const now = Date.now();

  const abnormal = biomarkers.filter(b => b.riskLevel === 'high');
  if (abnormal.length > 0) {
    const top = abnormal[0];
    insights.push({
      id: `${now}-abnormal`,
      title: `${top.name} needs attention`,
      description: `Your ${top.name} is outside the normal range at ${top.value} ${top.unit}. Ask Toto for context and next steps.`,
      category: 'biomarkers' as any,
      priority: 'high',
      actionable: true,
      action: 'Open Toto chat for a personalised explanation.',
    });
  }

  const cardio = biomarkers.filter(b => b.category === 'cardiovascular');
  if (cardio.length > 0) {
    const allGood = cardio.every(b => b.riskLevel === 'low');
    insights.push({
      id: `${now}-cardio`,
      title: allGood ? 'Heart health looking good' : 'Monitor your cardiovascular markers',
      description: allGood
        ? `Your ${cardio.length} cardiovascular biomarkers are all within normal range.`
        : `${cardio.filter(b => b.riskLevel !== 'low').length} of your cardiovascular markers need monitoring.`,
      category: 'recovery' as any,
      priority: allGood ? 'low' : 'medium',
      actionable: !allGood,
      action: allGood ? undefined : 'Review your cholesterol and CRP trends in the Body Map.',
    });
  }

  const nutrition = biomarkers.filter(b => b.category === 'nutritional');
  if (nutrition.length > 0) {
    const deficient = nutrition.filter(b => b.riskLevel !== 'low');
    if (deficient.length > 0) {
      insights.push({
        id: `${now}-nutrition`,
        title: `${deficient[0].name} may be low`,
        description: `Your ${deficient[0].name} reading of ${deficient[0].value} ${deficient[0].unit} suggests a potential deficiency worth discussing with your doctor.`,
        category: 'nutrition' as any,
        priority: 'medium',
        actionable: true,
        action: 'Ask Toto for dietary sources and supplementation guidance.',
      });
    }
  }

  if (healthScore && insights.length === 0) {
    const score = healthScore.overall;
    insights.push({
      id: `${now}-score`,
      title: score >= 80 ? 'Your health looks strong' : score >= 60 ? 'Room for improvement' : 'Focus on your health today',
      description: `Your CoreHealth score is ${score}. ${score >= 80 ? 'Keep up your current habits.' : 'Review your biomarker trends and talk to Toto for guidance.'}`,
      category: 'recovery' as any,
      priority: score >= 80 ? 'low' : 'medium',
      actionable: score < 80,
      action: score < 80 ? 'Open Toto for personalised recommendations.' : undefined,
    });
  }

  insights.push({
    id: `${now}-activity`,
    title: 'Daily movement matters',
    description: 'Even 20 minutes of moderate activity improves cardiovascular health, HRV, and cognitive performance.',
    category: 'activity' as any,
    priority: 'low',
    actionable: true,
    action: 'Aim for at least 20 minutes of movement today.',
  });

  return insights.slice(0, 4);
}

export const generateDailyInsights = async (
  profile: any,
  biomarkers: Biomarker[],
  healthScore: HealthScore | null,
  setDailyInsights: (insights: DailyInsight[]) => void,
): Promise<void> => {
  try {
    const insights = buildBiomarkerInsights(biomarkers, healthScore);
    setDailyInsights(insights);
    await AsyncStorage.setItem('dailyInsights', JSON.stringify(insights));
    try { await refreshUserSnapshot(); } catch (e) { console.error(e); }
  } catch (error) {
    console.error('Failed to generate daily insights:', error);
  }
};
