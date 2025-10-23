import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { PROFILE_ROUTES } from './routeNames';

// Profile Navigation Types
export type ProfileStackParamList = {
  [PROFILE_ROUTES.PROFILE_HOME]: undefined;
  [PROFILE_ROUTES.SETTINGS_HOME]: undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  [PROFILE_ROUTES.ACCOUNT_PREFERENCES]: undefined;
  [PROFILE_ROUTES.DATA_PRIVACY]: undefined;
  [PROFILE_ROUTES.SUPPORT_HELP]: undefined;
};

export type AccountPreferencesStackParamList = {
  [PROFILE_ROUTES.ACCOUNT_SETTINGS]: undefined;
  [PROFILE_ROUTES.EMAIL_PASSWORD]: undefined;
  [PROFILE_ROUTES.CONNECTED_DEVICES]: undefined;
  [PROFILE_ROUTES.DISPLAY_FORMAT]: undefined;
  [PROFILE_ROUTES.UNITS]: undefined;
  [PROFILE_ROUTES.DATE_FORMAT]: undefined;
  [PROFILE_ROUTES.TIME_FORMAT]: undefined;
  [PROFILE_ROUTES.LANGUAGE]: undefined;
  [PROFILE_ROUTES.NOTIFICATIONS]: undefined;
  [PROFILE_ROUTES.SUPPLEMENTS_MEDS_REMINDERS]: undefined;
  [PROFILE_ROUTES.MEDICAL_APPOINTMENTS_REMINDERS]: undefined;
  [PROFILE_ROUTES.MONTHLY_HEALTH_SUMMARY]: undefined;
  [PROFILE_ROUTES.WEEKLY_HEALTH_SUMMARY]: undefined;
  [PROFILE_ROUTES.SLEEP_REMINDERS]: undefined;
};

export type DataPrivacyStackParamList = {
  [PROFILE_ROUTES.DATA_SYNC]: undefined;
  [PROFILE_ROUTES.PRIVACY_SECURITY]: undefined;
  [PROFILE_ROUTES.DATA_SHARING_SETTINGS]: undefined;
  [PROFILE_ROUTES.HEALTH_DATA_DOWNLOAD]: undefined;
  [PROFILE_ROUTES.DELETE_ACCOUNT]: undefined;
  [PROFILE_ROUTES.LEGAL_COMPLIANCE]: undefined;
  [PROFILE_ROUTES.TERMS]: undefined;
  [PROFILE_ROUTES.PRIVACY_POLICY]: undefined;
  [PROFILE_ROUTES.CONSENT_FORMS]: undefined;
  [PROFILE_ROUTES.HIPAA_GDPR]: undefined;
  [PROFILE_ROUTES.DATA_PROCESSING_AGREEMENT]: undefined;
  [PROFILE_ROUTES.DATA_RETENTION_POLICY]: undefined;
  [PROFILE_ROUTES.CONTACT_LEGAL_TEAM]: undefined;
  [PROFILE_ROUTES.REQUEST_DATA]: undefined;
};

export type SupportHelpStackParamList = {
  [PROFILE_ROUTES.FAQS]: undefined;
  [PROFILE_ROUTES.CONTACT_SUPPORT_REPORT_BUG]: undefined;
  [PROFILE_ROUTES.FEEDBACK_SUBMISSION]: undefined;
  [PROFILE_ROUTES.APP_INFO]: undefined;
};

// Screen Props Types
export type ProfileHomeScreenProps = StackScreenProps<ProfileStackParamList, typeof PROFILE_ROUTES.PROFILE_HOME>;
export type SettingsHomeScreenProps = StackScreenProps<ProfileStackParamList, typeof PROFILE_ROUTES.SETTINGS_HOME>;
export type AccountPreferencesScreenProps = StackScreenProps<SettingsStackParamList, typeof PROFILE_ROUTES.ACCOUNT_PREFERENCES>;
export type DataPrivacyScreenProps = StackScreenProps<SettingsStackParamList, typeof PROFILE_ROUTES.DATA_PRIVACY>;
export type SupportHelpScreenProps = StackScreenProps<SettingsStackParamList, typeof PROFILE_ROUTES.SUPPORT_HELP>;
