// Main App Screens
export { default as DashboardScreen } from './dashboard';
export { default as BodyMapScreen } from './body-map';
export { default as TravelScreen } from './travel';

// Auth screens
export { default as LoginScreen } from './auth/LoginScreen';
export { default as RegisterScreen } from './auth/RegisterScreen';
export { default as ForgotPasswordScreen } from './auth/ForgotPasswordScreen';
export { default as EmailSentScreen } from './auth/EmailSentScreen';
export { default as EmailVerificationScreen } from './auth/EmailVerificationScreen';

// Onboarding screens
export { default as PersonalInfoScreen } from './onboarding/PersonalInfoScreen';
export { default as MedicalDocumentsScreen } from './onboarding/MedicalDocumentsScreen';
export { default as DeviceConnectionScreen } from './onboarding/DeviceConnectionScreen';
export { default as PermissionsScreen } from './onboarding/PermissionsScreen';
export { default as FinishOnboardingScreen } from './onboarding/FinishOnboardingScreen';

// Profile screens - moved to src/features/profile/
// export { default as LifestyleSettingsScreen } from '../features/profile/LifestyleSettingsScreen';
// export { default as LifestyleInfoScreen } from '../features/profile/LifestyleInfoScreen';
// export { default as CommunityLeaderboardScreen } from '../features/profile/CommunityLeaderboardScreen';
// export { default as SymptomRegisteredScreen } from '../features/profile/SymptomRegisteredScreen';
