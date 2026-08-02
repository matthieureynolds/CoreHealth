import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { MainTabParamList } from "../types";
import { palette } from "../theme/colors";
import { LiquidGlass } from "../components/ui/LiquidGlass";

import DashboardScreen from "../../features/home/screens/DashboardScreen";
import BodyMapScreen from "../../features/body-map/screens/BodyMapScreen";

import ProfileTabNavigator from "./ProfileTabNavigator";
import HealthAssistantScreen from "../../features/toto-chat/screens/HealthAssistantScreen";
import { TravelStackNavigator } from "@features/travel";

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Dashboard":
              iconName = "home";
              break;
            case "BodyMap":
              iconName = "body";
              break;
            case "Profile":
              iconName = "person";
              break;
            case "HealthAssistant":
              iconName = "chatbubbles";
              break;
            case "Travel":
              iconName = "airplane";
              break;
            default:
              iconName = "ellipse";
          }

          return (
            <Ionicons
              name={iconName}
              size={focused ? 32 : 24}
              color={focused ? palette.tabActive : palette.tabInactive}
            />
          );
        },
        tabBarActiveTintColor: palette.tabActive,
        tabBarInactiveTintColor: palette.tabInactive,
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: palette.bg,
        },
        headerTintColor: palette.textPrimary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        tabBarBackground: () => (
          <LiquidGlass
            glassStyle="regular"
            style={StyleSheet.absoluteFill}
            fallbackTint="dark"
            fallbackIntensity={50}
          />
        ),
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopColor: "transparent",
          borderTopWidth: 0,
          height: 90,
          paddingTop: 8,
          paddingBottom: 25,
          elevation: 0,
          shadowOpacity: 0,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="BodyMap"
        component={BodyMapScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HealthAssistant"
        component={HealthAssistantScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Travel"
        component={TravelStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTabNavigator}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
