import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TravelStackParamList } from '../shared/types';
import TravelScreen from '../features/travel/screens/TravelScreen';
import TripDetailScreen from '../features/travel/screens/TripDetailScreen';

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
