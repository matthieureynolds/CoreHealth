import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  UserProfile,
  Biomarker,
  LabResult,
  DeviceData,
  DailyInsight,
  HealthScore,
  JetLagPlanningEvent,
} from "../types";

export const DEFAULT_PROFILE: UserProfile = {
  userId: "default",
  age: 30,
  gender: "other",
  height: 170,
  weight: 70,
  ethnicity: "",
  bloodType: "unknown",
  medicalHistory: [],
  familyHistory: [],
  surgeries: [],
  vaccinations: [],
  allergies: [],
  medications: [],
  screenings: [],
  pastAppointments: [],
  lifestyle: {
    smoking: { status: "never" },
    alcohol: { frequency: "never" },
    diet: { type: "omnivore", restrictions: [], supplements: [] },
    exercise: { frequency: "never", type: [], intensity: "low" },
    sleep: {
      averageHoursPerNight: 8,
      sleepQuality: "good",
      sleepDisorders: [],
    },
    stress: { level: "low", managementTechniques: [] },
  },
  organSpecificConditions: [],
};

export interface StoredHealthData {
  profile: UserProfile;
  biomarkers: Biomarker[] | null;
  labResults: LabResult[] | null;
  deviceData: DeviceData[] | null;
  insights: DailyInsight[] | null;
  healthScore: HealthScore | null;
  originTimezone: string | null;
  originLocation: string | null;
  jetLagPlanningEvents: JetLagPlanningEvent[];
  connectedDevices: Array<{ name: string; status: string }> | null;
  needsBootstrap: boolean;
}

export async function clearCorruptedHealthScore(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem("healthScore");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.overall === 0) {
        await AsyncStorage.removeItem("healthScore");
      }
    }
  } catch {
    // Non-critical
  }
}

export async function loadStoredHealthData(): Promise<StoredHealthData> {
  const [
    storedProfile,
    storedBiomarkers,
    storedLabResults,
    storedDeviceData,
    storedInsights,
    storedHealthScore,
    storedOriginTimezone,
    storedOriginLocation,
    storedJetLagPlanningEvents,
    storedConnectedDevices,
  ] = await Promise.all([
    AsyncStorage.getItem("profile"),
    AsyncStorage.getItem("biomarkers"),
    AsyncStorage.getItem("labResults"),
    AsyncStorage.getItem("deviceData"),
    AsyncStorage.getItem("dailyInsights"),
    AsyncStorage.getItem("healthScore"),
    AsyncStorage.getItem("originTimezone"),
    AsyncStorage.getItem("originLocation"),
    AsyncStorage.getItem("jetLagPlanningEvents"),
    AsyncStorage.getItem("connectedDevices"),
  ]);

  const parsedProfile: UserProfile | null = storedProfile
    ? JSON.parse(storedProfile)
    : null;
  const parsedBiomarkers: Biomarker[] | null = storedBiomarkers
    ? JSON.parse(storedBiomarkers)
    : null;
  const parsedLabResults: LabResult[] | null = storedLabResults
    ? JSON.parse(storedLabResults)
    : null;
  const parsedDeviceData: DeviceData[] | null = storedDeviceData
    ? JSON.parse(storedDeviceData)
    : null;
  const parsedInsights: DailyInsight[] | null = storedInsights
    ? JSON.parse(storedInsights)
    : null;
  const parsedHealthScore: HealthScore | null = storedHealthScore
    ? JSON.parse(storedHealthScore)
    : null;
  const parsedConnectedDevices: Array<{ name: string; status: string }> | null =
    storedConnectedDevices ? JSON.parse(storedConnectedDevices) : null;
  const parsedJetLagEvents: JetLagPlanningEvent[] = storedJetLagPlanningEvents
    ? JSON.parse(storedJetLagPlanningEvents)
    : [];

  const healthScoreIsValid = !!(
    parsedHealthScore && parsedHealthScore.overall > 0
  );
  const needsBootstrap =
    !healthScoreIsValid || !parsedBiomarkers || !parsedInsights;

  return {
    profile: parsedProfile ?? DEFAULT_PROFILE,
    biomarkers: parsedBiomarkers,
    labResults: parsedLabResults,
    deviceData: parsedDeviceData,
    insights: parsedInsights,
    healthScore: healthScoreIsValid ? parsedHealthScore : null,
    originTimezone: storedOriginTimezone,
    originLocation: storedOriginLocation,
    jetLagPlanningEvents: parsedJetLagEvents,
    connectedDevices: parsedConnectedDevices,
    needsBootstrap,
  };
}
