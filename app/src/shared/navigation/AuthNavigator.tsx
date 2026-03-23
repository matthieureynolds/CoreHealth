import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types';
import { useOnboarding } from '../hooks/useOnboarding';
import { colors } from '../theme/colors';

import LoginScreen from '../../features/auth/screens/LoginScreen';
import RegisterScreen from '../../features/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '../../features/auth/screens/ForgotPasswordScreen';
import EmailSentScreen from '../../features/auth/screens/EmailSentScreen';
import EmailVerificationScreen from '../../features/auth/screens/EmailVerificationScreen';
import PersonalInfoScreen from '../../features/onboarding/screens/PersonalInfoScreen';
import MedicalDocumentsScreen from '../../features/onboarding/screens/MedicalDocumentsScreen';
import DeviceConnectionScreen from '../../features/onboarding/screens/DeviceConnectionScreen';
import PermissionsScreen from '../../features/onboarding/screens/PermissionsScreen';
import FinishOnboardingScreen from '../../features/onboarding/screens/FinishOnboardingScreen';
import OnboardingScreen from '../../features/onboarding/screens/OnboardingScreen';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const { hasSeenOnboarding, isLoading } = useOnboarding();

  if (isLoading) {
    return null; // or a loading component
  }

  return (
    <Stack.Navigator
      initialRouteName={hasSeenOnboarding ? "Login" : "Onboarding"}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.authCard },
      }}
    >
      {!hasSeenOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="EmailSent" component={EmailSentScreen} />
          <Stack.Screen
            name="EmailVerification"
            component={EmailVerificationScreen}
          />
          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
          <Stack.Screen name="MedicalDocuments" component={MedicalDocumentsScreen} />
          <Stack.Screen name="DeviceConnection" component={DeviceConnectionScreen} />
          <Stack.Screen name="Permissions" component={PermissionsScreen} />
          <Stack.Screen name="FinishOnboarding" component={FinishOnboardingScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
