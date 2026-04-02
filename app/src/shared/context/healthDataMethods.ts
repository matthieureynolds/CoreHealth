import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadStoredHealthData } from './healthDataLoader';
import { bootstrapHealthData } from './healthDataBootstrap';
import { DataService } from '../services/data/dataService';
import {
  UserProfile,
  Biomarker,
  LabResult,
  DeviceData,
  DailyInsight,
  HealthScore,
  BodySystem,
  JetLagPlanningEvent,
} from '../types';

function mapDeviceNameToType(name: string): DeviceData['deviceType'] {
  const n = (name || '').toLowerCase();
  if (n.includes('whoop')) return 'whoop';
  if (n.includes('apple')) return 'apple_watch';
  if (n.includes('eight sleep') || n.includes('8 sleep')) return 'eight_sleep';
  if (n.includes('toothbrush')) return 'smart_toothbrush';
  if (n.includes('u-scan') || n.includes('u scan') || n.includes('toilet')) return 'smart_toilet';
  return 'apple_watch';
}

interface LoadHealthDataSetters {
  setProfile: (v: UserProfile | null) => void;
  setBiomarkers: (v: Biomarker[]) => void;
  setLabResults: (v: LabResult[]) => void;
  setDeviceData: (fn: (prev: DeviceData[]) => DeviceData[]) => void;
  setDeviceDataDirect: (v: DeviceData[]) => void;
  setDailyInsights: (v: DailyInsight[]) => void;
  setHealthScore: (v: HealthScore) => void;
  setHealthScoreCalculated: (v: boolean) => void;
  setOriginTimezoneState: (v: string) => void;
  setOriginLocationState: (v: string) => void;
  setJetLagPlanningEvents: (v: JetLagPlanningEvent[]) => void;
  setBodySystems: (v: BodySystem[]) => void;
  setIsLoading: (v: boolean) => void;
}

export const loadHealthData = async (
  setters: LoadHealthDataSetters,
  userId?: string,
): Promise<void> => {
  try {
    // ── Local preferences (jet lag, timezone, connected devices) ─────────────
    const stored = await loadStoredHealthData();
    if (stored.originTimezone) setters.setOriginTimezoneState(stored.originTimezone);
    if (stored.originLocation) setters.setOriginLocationState(stored.originLocation);
    setters.setJetLagPlanningEvents(stored.jetLagPlanningEvents);

    if (stored.connectedDevices) {
      const mapped: DeviceData[] = stored.connectedDevices
        .filter((d: any) => /connected/i.test(d.status || ''))
        .map((d: any, idx: number) => ({
          id: `conn-${idx}`,
          deviceType: mapDeviceNameToType(d.name),
          timestamp: new Date(),
          metrics: {},
        }));
      if (mapped.length) {
        setters.setDeviceData(prev => [...(Array.isArray(prev) ? prev : []), ...mapped]);
      }
    }

    // ── Health data from API ──────────────────────────────────────────────────
    if (userId) {
      const biomarkers = await DataService.getBiomarkers();
      setters.setBiomarkers(biomarkers);

      // New user with no data — show bootstrap insights/score only (not fake biomarkers)
      if (biomarkers.length === 0) {
        const bootstrapped = await bootstrapHealthData();
        setters.setHealthScore(bootstrapped.healthScore);
        setters.setDailyInsights(bootstrapped.insights);
        setters.setBodySystems(bootstrapped.bodySystems);
        setters.setHealthScoreCalculated(true);
      } else {
        setters.setHealthScoreCalculated(false);
      }

      try {
        await AsyncStorage.setItem('@corehealth_last_sync_at', new Date().toISOString());
      } catch (e) { /* non-critical */ }
    } else {
      // Not yet authenticated — use local cache if available, otherwise bootstrap
      if (stored.biomarkers) setters.setBiomarkers(stored.biomarkers);
      if (stored.labResults) setters.setLabResults(stored.labResults);
      if (stored.healthScore) {
        setters.setHealthScore(stored.healthScore);
        setters.setHealthScoreCalculated(true);
      } else {
        const bootstrapped = await bootstrapHealthData();
        setters.setHealthScore(bootstrapped.healthScore);
        setters.setDailyInsights(bootstrapped.insights);
        setters.setBodySystems(bootstrapped.bodySystems);
        setters.setHealthScoreCalculated(true);
      }
    }
  } catch (error) {
    console.error('Failed to load health data:', error);
    try {
      const bootstrapped = await bootstrapHealthData();
      setters.setHealthScore(bootstrapped.healthScore);
      setters.setDailyInsights(bootstrapped.insights);
      setters.setBodySystems(bootstrapped.bodySystems);
      setters.setHealthScoreCalculated(true);
    } catch (e) { /* ignore bootstrap failure */ }
  } finally {
    setters.setIsLoading(false);
  }
};
