import {
  UserSettings,
  SettingsAction,
  defaultSettings,
} from "../types/settings";

export function settingsReducer(
  state: UserSettings,
  action: SettingsAction,
): UserSettings {
  switch (action.type) {
    case "UPDATE_GENERAL":
      return { ...state, general: { ...state.general, ...action.payload } };
    case "UPDATE_NOTIFICATIONS":
      return {
        ...state,
        notifications: { ...state.notifications, ...action.payload },
      };
    case "UPDATE_PRIVACY":
      return { ...state, privacy: { ...state.privacy, ...action.payload } };
    case "UPDATE_DATA_SYNC":
      return { ...state, dataSync: { ...state.dataSync, ...action.payload } };
    case "UPDATE_HEALTH_EMERGENCY":
      return {
        ...state,
        healthEmergency: { ...state.healthEmergency, ...action.payload },
      };
    case "UPDATE_TRAVEL":
      return { ...state, travel: { ...state.travel, ...action.payload } };
    case "UPDATE_ACCESSIBILITY":
      return {
        ...state,
        accessibility: { ...state.accessibility, ...action.payload },
      };
    case "UPDATE_LIFESTYLE":
      return { ...state, lifestyle: { ...state.lifestyle, ...action.payload } };
    case "UPDATE_BIOMARKERS":
      return {
        ...state,
        biomarkers: { ...state.biomarkers, ...action.payload },
      };
    case "UPDATE_APP":
      return { ...state, app: { ...state.app, ...action.payload } };
    case "RESET_SETTINGS":
      return defaultSettings;
    case "LOAD_SETTINGS":
      return action.payload;
    default:
      return state;
  }
}

export function mergeWithDefaults(
  imported: any,
  defaults: UserSettings,
): UserSettings {
  const merged = { ...defaults };

  Object.keys(defaults).forEach((category) => {
    if (imported[category] && typeof imported[category] === "object") {
      merged[category as keyof UserSettings] = {
        ...defaults[category as keyof UserSettings],
        ...imported[category],
      };
    }
  });

  return merged;
}
