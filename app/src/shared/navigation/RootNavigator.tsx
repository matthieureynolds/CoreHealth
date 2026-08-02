import React from "react";
import { Platform } from "react-native";

import { createStackNavigator } from "@react-navigation/stack";

// Use platform-specific logic elsewhere in the code
// Example:
// const Stack = Platform.OS !== 'web' ? createStackNavigator() : createWebNavigator();
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../types";

import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import LoadingScreen from "../components/feedback/LoadingScreen";
import { EnvironmentalMetricScreen } from "@features/travel";
import RingDetailScreen from "../../features/home/health-metrics/detail/RingDetailScreen";
import HealthScoreDetailScreen from "../../features/home/score/HealthScoreDetailScreen";
import LabResultDetailScreen from "../../features/home/recent-lab-results/LabResultDetailScreen";

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return <LoadingScreen visible={true} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="RingDetail" component={RingDetailScreen} />
          <Stack.Screen
            name="HealthScoreDetail"
            component={HealthScoreDetailScreen}
          />
          <Stack.Screen
            name="LabResultDetail"
            component={LabResultDetailScreen}
          />
          <Stack.Screen
            name="EnvironmentalMetric"
            component={EnvironmentalMetricScreen}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
