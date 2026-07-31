import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { TravelStackParamList } from "@shared/types";

// Main travel screen
import TravelScreen from "../screens/travel-search/TravelScreen";

// Trip Planning — trip plan (detail screen)
import TripDetailScreen from "../screens/trip-planning/trip-plan/TripDetailScreen";

const Stack = createStackNavigator<TravelStackParamList>();

const TravelStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main */}
      <Stack.Screen name="TravelList" component={TravelScreen} />

      {/* Trip planning */}
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
    </Stack.Navigator>
  );
};

export default TravelStackNavigator;
