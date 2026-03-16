import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TravelStackParamList } from '../types';
import TravelScreen from '../screens/travel/TravelScreen';
import TripDetailScreen from '../screens/travel/TripDetailScreen';

const Stack = createStackNavigator<TravelStackParamList>();

const TravelStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TravelList" component={TravelScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
    </Stack.Navigator>
  );
};

export default TravelStackNavigator;
