import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ProfileTabParamList } from "@shared/types";
import { useAuth } from "@shared/context/AuthContext";
import { useHealthData } from "@shared/context/HealthDataContext";
import { genderOptions } from "../profile/personal-info/useProfileDetails";
import SettingsHeader from "./components/SettingsHeader";

type SettingsScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const showLockedAlert = (field: string) => {
  Alert.alert(
    `${field} Locked`,
    `To change your ${field.toLowerCase()}, please contact our support team at support@corehealth.ai`,
    [{ text: "OK" }],
  );
};

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { user } = useAuth();
  const { profile } = useHealthData();

  return (
    <View style={styles.container}>
      {/* Header */}
      <SettingsHeader title="Settings" />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Content */}
        <View style={styles.content}>
          {/* Personal Info Card */}
          <View style={[styles.card, styles.cardTightBottom]}>
            <Text style={styles.cardHeader}>PERSONAL INFO</Text>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => navigation.navigate("EditName")}
            >
              <Ionicons
                name="person-outline"
                size={22}
                color="#FF9500"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Personal Info</Text>
              <Text style={styles.cardValue}>
                {user?.firstName && user?.surname
                  ? `${user.firstName} ${user.surname}`
                  : user?.displayName || "Not set"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#888"
                style={styles.chevron}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => showLockedAlert("Date of Birth")}
            >
              <Ionicons
                name="calendar-outline"
                size={22}
                color="#4CD964"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Date of Birth</Text>
              <Text style={styles.cardValue}>
                {profile?.age ? `${profile.age} years old` : "Not set"}
              </Text>
              <Ionicons
                name="lock-closed"
                size={16}
                color="#8E8E93"
                style={styles.chevron}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => showLockedAlert("Gender")}
            >
              <Ionicons
                name="body-outline"
                size={22}
                color="#3AABF0"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Gender</Text>
              <Text style={styles.cardValue}>
                {profile?.gender
                  ? genderOptions.find((o) => o.value === profile.gender)
                      ?.label || profile.gender
                  : "Not set"}
              </Text>
              <Ionicons
                name="lock-closed"
                size={16}
                color="#8E8E93"
                style={styles.chevron}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => navigation.navigate("LifestyleInfo")}
            >
              <Ionicons
                name="bed-outline"
                size={22}
                color="#5856D6"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Lifestyle Info</Text>
              <Text style={styles.cardValue}>Sleep Schedule</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#888"
                style={styles.chevron}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cardRow, styles.lastRow]}
              onPress={() => navigation.navigate("HealthIDs")}
            >
              <Ionicons
                name="card-outline"
                size={22}
                color="#8E44AD"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Linked Health ID</Text>
              <Text style={styles.cardValue}>
                {profile?.healthIDs?.length
                  ? `${profile.healthIDs.length} IDs`
                  : "Not set"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#888"
                style={styles.chevron}
              />
            </TouchableOpacity>
          </View>

          {/* Account & Preferences Card */}
          <View style={[styles.card, styles.cardTightBottom]}>
            <Text style={styles.cardHeader}>ACCOUNT & PREFERENCES</Text>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => navigation.navigate("EmailPassword")}
            >
              <Ionicons
                name="mail-outline"
                size={22}
                color="#FF9500"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Email & Password</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#888"
                style={styles.chevron}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => navigation.navigate("ConnectedDevices")}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={22}
                color="#4CD964"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Connected Devices</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#888"
                style={styles.chevron}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => navigation.navigate("DisplayFormat")}
            >
              <Ionicons
                name="options-outline"
                size={22}
                color="#3AABF0"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Display & Format</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#888"
                style={styles.chevron}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cardRow, styles.notificationsRow, styles.lastRow]}
              onPress={() => navigation.navigate("Notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#FF3B30"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Notifications</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#888"
                style={styles.chevron}
              />
            </TouchableOpacity>
          </View>

          {/* Data & Privacy Card */}
          <View style={[styles.card, styles.cardTightBottom]}>
            <Text style={styles.cardHeader}>DATA & PRIVACY</Text>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => navigation.navigate("DataSync")}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color="#5856D6"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Data & Sync</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#888"
                style={styles.chevron}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => navigation.navigate("PrivacySecurity")}
            >
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#3AABF0"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Privacy & Security</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#888"
                style={styles.chevron}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cardRow, styles.notificationsRow, styles.lastRow]}
              onPress={() => navigation.navigate("LegalCompliance")}
            >
              <Ionicons
                name="document-text-outline"
                size={22}
                color="#3AABF0"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Legal & Compliance</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#888"
                style={styles.chevron}
              />
            </TouchableOpacity>
          </View>

          {/* Support & Help Card */}
          <View style={[styles.card, styles.cardTightBottom]}>
            <Text style={styles.cardHeader}>SUPPORT & HELP</Text>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => navigation.navigate("SupportHelp")}
            >
              <Ionicons
                name="help-circle-outline"
                size={22}
                color="#4CD964"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Support & Help</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#888"
                style={styles.chevron}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cardRow, styles.notificationsRow, styles.lastRow]}
              onPress={() => navigation.navigate("AppInfo")}
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#8E8E93"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>App Info</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#888"
                style={styles.chevron}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 18,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTightBottom: {
    paddingBottom: 0,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#8E8E93",
    marginBottom: 8,
    marginHorizontal: 20,
    letterSpacing: 0.5,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  notificationsRow: {
    height: 50,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    flex: 1,
  },
  cardValue: {
    color: "#8E8E93",
    fontSize: 15,
    marginRight: 8,
  },
  chevron: {
    marginLeft: "auto",
  },
});

export default SettingsScreen;
