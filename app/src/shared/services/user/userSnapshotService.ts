import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserSnapshot = {
  user?: {
    email?: string;
    displayName?: string;
    preferredName?: string;
  };
  profile?: any;
  biomarkers?: any[];
  labResults?: any[];
  deviceData?: any[];
  connectedDevices?: any[];
  healthScore?: any;
  settings?: any;
  notifications?: {
    medicationAlerts?: string[];
    appointmentAlerts?: string[];
    toggles?: Record<string, boolean>;
    quietHours?: { enabled: boolean; startTime?: string; endTime?: string };
  };
  legal?: {
    tos?: { lastUpdated?: string; effectiveDate?: string };
    privacy?: { effectiveDate?: string };
  };
  lastSyncAt?: string | null;
  version: number;
  generatedAt: string;
};

const SNAPSHOT_KEY = "@user_snapshot";

export async function buildUserSnapshot(): Promise<UserSnapshot> {
  // Read persisted keys in parallel
  const [
    profileStr,
    biomarkersStr,
    labResultsStr,
    deviceDataStr,
    connectedDevicesStr,
    healthScoreStr,
    settingsStr,
    mockUserStr,
    medAlertsStr,
    apptAlertsStr,
    medToggleStr,
    apptToggleStr,
    monthToggleStr,
    weekToggleStr,
    sleepToggleStr,
    quietHoursStr, // optional future key
    lastSyncAt,
    tosUpdated,
    tosEffective,
    privacyEffective,
  ] = await Promise.all([
    AsyncStorage.getItem("profile"),
    AsyncStorage.getItem("biomarkers"),
    AsyncStorage.getItem("labResults"),
    AsyncStorage.getItem("deviceData"),
    AsyncStorage.getItem("connectedDevices"),
    AsyncStorage.getItem("healthScore"),
    AsyncStorage.getItem("@corehealth_settings"),
    AsyncStorage.getItem("mockUserData"),
    AsyncStorage.getItem("@notif_med_alerts"),
    AsyncStorage.getItem("@notif_appt_alerts"),
    AsyncStorage.getItem("@notif_med_enabled"),
    AsyncStorage.getItem("@notif_appt_enabled"),
    AsyncStorage.getItem("@notif_monthly_enabled"),
    AsyncStorage.getItem("@notif_weekly_enabled"),
    AsyncStorage.getItem("@notif_sleep_enabled"),
    AsyncStorage.getItem("@notif_quiet_hours"),
    AsyncStorage.getItem("@corehealth_last_sync_at"),
    AsyncStorage.getItem("@legal_tos_last_updated"),
    AsyncStorage.getItem("@legal_tos_effective_date"),
    AsyncStorage.getItem("@legal_privacy_effective_date"),
  ]);

  const toJson = (s: string | null, fallback: any) => {
    if (!s) return fallback;
    try {
      return JSON.parse(s);
    } catch {
      return fallback;
    }
  };

  const snapshot: UserSnapshot = {
    user: toJson(mockUserStr, null) || undefined,
    profile: toJson(profileStr, null) || undefined,
    biomarkers: toJson(biomarkersStr, []) || undefined,
    labResults: toJson(labResultsStr, []) || undefined,
    deviceData: toJson(deviceDataStr, []) || undefined,
    connectedDevices: toJson(connectedDevicesStr, []) || undefined,
    healthScore: toJson(healthScoreStr, null) || undefined,
    settings: toJson(settingsStr, null) || undefined,
    notifications: {
      medicationAlerts: toJson(medAlertsStr, []) || undefined,
      appointmentAlerts: toJson(apptAlertsStr, []) || undefined,
      toggles: {
        medication: medToggleStr === "1",
        appointment: apptToggleStr === "1",
        monthly: monthToggleStr === "1",
        weekly: weekToggleStr === "1",
        sleep: sleepToggleStr === "1",
      },
      quietHours: toJson(quietHoursStr, { enabled: false }),
    },
    legal: {
      tos: {
        lastUpdated: tosUpdated || undefined,
        effectiveDate: tosEffective || undefined,
      },
      privacy: { effectiveDate: privacyEffective || undefined },
    },
    lastSyncAt: lastSyncAt || null,
    version: 1,
    generatedAt: new Date().toISOString(),
  };

  return snapshot;
}

export async function refreshUserSnapshot(): Promise<UserSnapshot> {
  const snap = await buildUserSnapshot();
  await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snap));
  return snap;
}

export async function loadUserSnapshot(): Promise<UserSnapshot | null> {
  const s = await AsyncStorage.getItem(SNAPSHOT_KEY);
  if (!s) return null;
  try {
    return JSON.parse(s) as UserSnapshot;
  } catch {
    return null;
  }
}
