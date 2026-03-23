import AsyncStorage from '@react-native-async-storage/async-storage';
import { Biomarker, DailyInsight, HealthScore } from '../types';
import { refreshUserSnapshot } from '../services/user/userSnapshotService';

export const recalculateHealthScore = async (
  currentBiomarkers: Biomarker[],
  healthScoreCalculated: boolean,
  setHealthScore: (score: HealthScore) => void,
  setHealthScoreCalculated: (v: boolean) => void,
): Promise<void> => {
  if (healthScoreCalculated) return;

  const vitD = currentBiomarkers.find(b => /vitamin d/i.test(b.name));
  let nutrition = 75;
  if (vitD && typeof vitD.value === 'number') {
    const v = vitD.value as number;
    nutrition = v < 20 ? 55 : v < 30 ? 68 : v < 50 ? 80 : 85;
  }

  const hsCRP = currentBiomarkers.find(b => /crp/i.test(b.name));
  let recovery = 88;
  if (hsCRP && typeof hsCRP.value === 'number') {
    const v = hsCRP.value as number;
    recovery = v < 1 ? 90 : v < 3 ? 82 : 70;
  }

  const rhr = currentBiomarkers.find(b => /resting hr|resting heart/i.test(b.name));
  let activity = 75;
  if (rhr && typeof rhr.value === 'number') {
    const v = rhr.value as number;
    activity = v < 60 ? 85 : v < 75 ? 78 : 68;
  }

  const sleep = 78;
  const stress = 70;

  const overall = Math.round((sleep + activity + stress + recovery + nutrition) / 5);

  const newScore: HealthScore = { overall, sleep, activity, stress, recovery, nutrition };

  if (newScore.overall <= 0) {
    newScore.overall = 82;
    newScore.sleep = 78;
    newScore.activity = 85;
    newScore.stress = 70;
    newScore.recovery = 88;
    newScore.nutrition = 75;
  }

  setHealthScore(newScore);
  setHealthScoreCalculated(true);
  await AsyncStorage.setItem('healthScore', JSON.stringify(newScore));
};

export const generateDailyInsights = async (
  profile: any,
  biomarkers: Biomarker[],
  healthScore: HealthScore | null,
  setDailyInsights: (insights: DailyInsight[]) => void,
): Promise<void> => {
  try {
    let insights: DailyInsight[] = [];

    try {
      const { HealthAssistantService } = require('../services/ai/healthAssistantService');
      insights = await HealthAssistantService.generateDailyRecommendations(
        profile,
        biomarkers,
        healthScore,
      );
    } catch {
      insights = [
        {
          id: Date.now().toString(),
          title: 'Weekly Health Summary',
          description: 'Your health metrics show positive trends this week.',
          category: 'recovery',
          priority: 'low',
          actionable: false,
        },
        {
          id: (Date.now() + 1).toString(),
          title: 'Hydration Focus',
          description: 'Staying well hydrated supports all body functions and health metrics.',
          category: 'nutrition',
          priority: 'medium',
          actionable: true,
          action: 'Aim for 8 glasses of water throughout the day.',
        },
        {
          id: (Date.now() + 2).toString(),
          title: 'Movement Opportunity',
          description: 'Regular movement helps maintain cardiovascular health and energy levels.',
          category: 'activity',
          priority: 'medium',
          actionable: true,
          action: 'Take a 10-minute walk or do some light stretching.',
        },
      ];
    }

    setDailyInsights(insights);
    await AsyncStorage.setItem('dailyInsights', JSON.stringify(insights));
    try { await refreshUserSnapshot(); } catch {}
  } catch (error) {
    console.error('Failed to generate daily insights:', error);
  }
};
