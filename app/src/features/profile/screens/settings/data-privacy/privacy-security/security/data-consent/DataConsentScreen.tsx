import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SettingsHeader from "@features/profile/screens/settings/components/SettingsHeader";
import { SETTINGS_SCROLL_PT } from "@features/profile/screens/settings/components/settingsLayout";
import { useSettings } from "@shared/context/SettingsContext";

const DataConsentScreen: React.FC = () => {
  const { settings, updatePrivacySettings } = useSettings();
  const [dataConsent, setDataConsent] = useState(
    settings.privacy.dataSharing.analytics,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleDataConsentToggle = async (value: boolean) => {
    try {
      setIsLoading(true);
      await updatePrivacySettings({
        biometricAuth: settings.privacy.biometricAuth,
        locationServices: settings.privacy.locationServices,
        dataSharing: {
          analytics: value,
          anonymizedData: value,
          thirdPartyApps: false,
        },
      });
      setDataConsent(value);
      if (value) {
        Alert.alert(
          "Data Sharing Enabled",
          "You have consented to share anonymized health data for research and app improvement. Your personal information remains private and secure.",
          [{ text: "OK" }],
        );
      } else {
        Alert.alert(
          "Data Sharing Disabled",
          "You have opted out of data sharing. Your health data will remain completely private and will not be used for research or app improvement.",
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      console.error("Data consent toggle error:", error);
      Alert.alert(
        "Error",
        "Failed to update data consent settings. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SettingsHeader title="Data Consent" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: SETTINGS_SCROLL_PT }}
      >
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardHeader}>DATA CONSENT</Text>
            <View style={[styles.cardRow, { justifyContent: "space-between" }]}>
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color={isLoading ? "#666" : "#3AABF0"}
                  style={styles.cardIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.cardLabel, isLoading && styles.disabledText]}
                  >
                    Data Consent
                  </Text>
                  <Text
                    style={[styles.cardSub, isLoading && styles.disabledText]}
                  >
                    {dataConsent
                      ? "Sharing anonymized data for research and app improvement"
                      : "Opted out of data sharing — your data remains private"}
                  </Text>
                </View>
              </View>
              <Switch
                value={dataConsent}
                onValueChange={handleDataConsentToggle}
                trackColor={{ false: "#333", true: "#3AABF0" }}
                thumbColor="#FFFFFF"
                disabled={isLoading}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>WHAT WE COLLECT</Text>
            <View style={styles.infoRow}>
              <Ionicons
                name="analytics-outline"
                size={20}
                color="#3AABF0"
                style={styles.cardIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Anonymized Health Data</Text>
                <Text style={styles.infoText}>
                  When enabled, only anonymized and aggregated health data is
                  shared. Your name, email, and personally identifiable
                  information are never included.
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="flask-outline"
                size={20}
                color="#34C759"
                style={styles.cardIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Research & Improvement</Text>
                <Text style={styles.infoText}>
                  Shared data helps improve TOTO's features and contributes to
                  anonymized health research. You can opt out at any time.
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#FF9500"
                style={styles.cardIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Third-Party Sharing</Text>
                <Text style={styles.infoText}>
                  Your data is never sold or shared with third-party
                  advertisers. Analytics data stays within the TOTO platform.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 0 },
  card: {
    backgroundColor: "#181818",
    borderRadius: 12,
    marginBottom: 20,
    paddingVertical: 16,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 16,
    marginHorizontal: 20,
    letterSpacing: 0.5,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 16, fontWeight: "500", color: "#FFFFFF", flex: 1 },
  cardSub: { fontSize: 13, color: "#8E8E93" },
  disabledText: { color: "#666" },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#8E8E93",
    lineHeight: 16,
    textAlign: "justify",
  },
});

export default DataConsentScreen;
