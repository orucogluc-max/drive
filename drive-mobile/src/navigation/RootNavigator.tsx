import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { JourneyComposerScreen } from '../screens/JourneyComposerScreen';
import { JourneyDetailScreen } from '../screens/JourneyDetailScreen';
import { ClubListScreen } from '../screens/ClubListScreen';
import { ClubDetailScreen } from '../screens/ClubDetailScreen';
import { RouteDetailScreen } from '../screens/RouteDetailScreen';
import { NotificationScreen } from '../screens/NotificationScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  JourneyComposer: undefined;
  JourneyDetail: { journeyId: string };
  ClubList: undefined;
  ClubDetail: { clubId: string };
  RouteDetail: { routeId: string };
  Notifications: undefined;
  Privacy: undefined;
  // Named distinctly from the tab-level "Profile" screen so React Navigation
  // never has two same-named routes nested inside one another.
  UserProfile: { userId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="JourneyComposer" component={JourneyComposerScreen} />
      <Stack.Screen name="JourneyDetail" component={JourneyDetailScreen} />
      <Stack.Screen name="ClubList" component={ClubListScreen} />
      <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="UserProfile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
