import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadStoredHealthData } from './healthDataLoader';
import { bootstrapHealthData } from './healthDataBootstrap';
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

export const loadHealthData = async (setters: LoadHealthDataSetters): Promise<void> => {
  try {
    const data = await loadStoredHealthData();

    setters.setProfile(data.profile);
    if (data.biomarkers) setters.setBiomarkers(data.biomarkers);
    if (data.labResults) setters.setLabResults(data.labResults);
    if (data.deviceData) setters.setDeviceDataDirect(data.deviceData);

    // Merge connected devices into deviceData for assistant context
    if (data.connectedDevices) {
      const mapped: DeviceData[] = data.connectedDevices
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

    // Persist latest device sync timestamp for assistant queries
    try {
      const allEvents = Array.isArray(data.deviceData) ? data.deviceData : [];
      let lastTs: number | null = null;
      allEvents.forEach((ev: any) => {
        const t = ev?.timestamp ? new Date(ev.timestamp).getTime() : NaN;
        if (Number.isFinite(t) && (lastTs === null || t > lastTs)) lastTs = t;
      });
      if (lastTs) {
        await AsyncStorage.setItem('@corehealth_last_sync_at', new Date(lastTs).toISOString());
      }
    } catch {}

    if (data.insights) setters.setDailyInsights(data.insights);
    if (data.healthScore) {
      setters.setHealthScore(data.healthScore);
      setters.setHealthScoreCalculated(true);
    } else {
      setters.setHealthScoreCalculated(false);
    }
    if (data.originTimezone) setters.setOriginTimezoneState(data.originTimezone);
    if (data.originLocation) setters.setOriginLocationState(data.originLocation);
    setters.setJetLagPlanningEvents(data.jetLagPlanningEvents);

    if (data.needsBootstrap) {
      const bootstrapped = await bootstrapHealthData();
      setters.setBiomarkers(bootstrapped.biomarkers);
      setters.setHealthScore(bootstrapped.healthScore);
      setters.setDailyInsights(bootstrapped.insights);
      setters.setBodySystems(bootstrapped.bodySystems);
      setters.setHealthScoreCalculated(true);
    }
  } catch (error) {
    console.error('Failed to load health data:', error);
    const bootstrapped = await bootstrapHealthData();
    setters.setBiomarkers(bootstrapped.biomarkers);
    setters.setHealthScore(bootstrapped.healthScore);
    setters.setDailyInsights(bootstrapped.insights);
    setters.setBodySystems(bootstrapped.bodySystems);
    setters.setHealthScoreCalculated(true);
  } finally {
    setters.setIsLoading(false);
  }
};
