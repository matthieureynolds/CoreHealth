import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types';
import { useOnboarding } from '../hooks/useOnboarding';

import {
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  EmailSentScreen,
  EmailVerificationScreen,
  PersonalInfoScreen,
  MedicalDocumentsScreen,
  DeviceConnectionScreen,
  PermissionsScreen,
  FinishOnboardingScreen,
} from '../screens';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

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
        cardStyle: { backgroundColor: '#ffffff' },
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
