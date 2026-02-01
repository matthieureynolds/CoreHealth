import React from 'react';
import { Platform } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';

// Use platform-specific logic elsewhere in the code
// Example:
// const Stack = Platform.OS !== 'web' ? createStackNavigator() : createWebNavigator();
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LoadingScreen from '../components/common/LoadingScreen';
import EnvironmentalMetricScreen from '../screens/EnvironmentalMetricScreen';
import ScoreDetailScreen from '../screens/ScoreDetailScreen';
import HealthScoreDetailScreen from '../screens/HealthScoreDetailScreen';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen visible={true} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="EnvironmentalMetric" component={EnvironmentalMetricScreen} />
          <Stack.Screen name="ScoreDetail" component={ScoreDetailScreen} />
          <Stack.Screen name="HealthScoreDetail" component={HealthScoreDetailScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
