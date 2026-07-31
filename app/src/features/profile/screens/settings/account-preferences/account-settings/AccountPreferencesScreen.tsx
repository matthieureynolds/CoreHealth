import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { PROFILE_ROUTES } from "../routeNames";

const AccountPreferencesScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const settingsCategories = [
    {
      title: "Account Settings",
      icon: "person-circle-outline",
      onPress: () => navigation.navigate(PROFILE_ROUTES.ACCOUNT_SETTINGS),
      description: "Manage your account information",
    },
    {
      title: "Connected Devices & Integrations",
      icon: "hardware-chip-outline",
      onPress: () => navigation.navigate(PROFILE_ROUTES.CONNECTED_DEVICES),
      description: "Sync with health devices and apps",
    },
    {
      title: "Display & Format",
      icon: "color-palette-outline",
      onPress: () => navigation.navigate(PROFILE_ROUTES.DISPLAY_FORMAT),
      description: "Customize units, dates, and language",
    },
    {
      title: "Notifications",
      icon: "notifications-outline",
      onPress: () => navigation.navigate(PROFILE_ROUTES.NOTIFICATIONS),
      description: "Manage alerts and reminders",
    },
  ];

  const renderSettingsItem = (
    item: {
      title: string;
      icon: string;
      onPress: () => void;
      description: string;
    },
    index: number,
  ) => (
    <TouchableOpacity
      key={index}
      style={styles.settingsItem}
      onPress={item.onPress}
    >
      <View style={styles.settingsItemContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon as any} size={24} color="#3AABF0" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.settingsTitle}>{item.title}</Text>
          <Text style={styles.settingsDescription}>{item.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account & Preferences</Text>
          <Text style={styles.headerSubtitle}>
            Manage your account settings and preferences
          </Text>
        </View>

        <View style={styles.settingsSection}>
          {settingsCategories.map(renderSettingsItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    lineHeight: 22,
  },
  settingsSection: {
    paddingHorizontal: 20,
  },
  settingsItem: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  settingsItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3AABF020",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  settingsDescription: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 18,
  },
});

export default AccountPreferencesScreen;
