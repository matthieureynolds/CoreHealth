import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';

import CommunityLeaderboardScreen from '../../../features/profile/screens/CommunityLeaderboardScreen';
import CountryLeaderboardScreen from '../../../features/profile/screens/CountryLeaderboardScreen';
import PrivateCirclesScreen from '../../../features/profile/screens/PrivateCirclesScreen';
import PublicLeaguesScreen from '../../../features/profile/screens/PublicLeaguesScreen';
import PublicLeagueDetailScreen from '../../../features/profile/screens/PublicLeagueDetailScreen';
import CircleDetailScreen from '../../../features/profile/screens/CircleDetailScreen';
import CountryDetailScreen from '../../../features/profile/screens/CountryDetailScreen';

type StackType = ReturnType<typeof createStackNavigator<ProfileTabParamList>>;

export const CommunityScreens = (Stack: StackType) => (
  <>
    <Stack.Screen name="CommunityLeaderboard" component={CommunityLeaderboardScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CountryLeaderboard" component={CountryLeaderboardScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PrivateCircles" component={PrivateCirclesScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PublicLeagues" component={PublicLeaguesScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PublicLeagueDetail" component={PublicLeagueDetailScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CircleDetail" component={CircleDetailScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CountryDetail" component={CountryDetailScreen} options={{ headerShown: false }} />
  </>
);
