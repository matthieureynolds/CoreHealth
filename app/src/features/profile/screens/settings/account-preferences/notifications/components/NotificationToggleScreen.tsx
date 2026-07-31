import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SettingsHeader from "@features/profile/screens/settings/components/SettingsHeader";
import { SETTINGS_SCROLL_PT } from "@features/profile/screens/settings/components/settingsLayout";
import { useAsyncStorageToggle } from "../useAsyncStorageToggle";

interface NotificationToggleScreenProps {
  headerTitle: string;
  storageKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  infoIcon: keyof typeof Ionicons.glyphMap;
  infoIconColor: string;
  infoHeader: string;
  infoText: string;
}

const NotificationToggleScreen: React.FC<NotificationToggleScreenProps> = ({
  headerTitle,
  storageKey,
  icon,
  iconColor,
  title,
  subtitle,
  infoIcon,
  infoIconColor,
  infoHeader,
  infoText,
}) => {
  const [enabled, setEnabled] = useAsyncStorageToggle(storageKey);

  return (
    <View style={styles.container}>
      <SettingsHeader title={headerTitle} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: SETTINGS_SCROLL_PT }}
      >
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.labelGroup}>
              <Ionicons
                name={icon}
                size={24}
                color={iconColor}
                style={{ marginRight: 14 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
            </View>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: "#333", true: "#3AABF0" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.cardHeader}>{infoHeader}</Text>
          <View style={styles.infoRow}>
            <Ionicons
              name={infoIcon}
              size={18}
              color={infoIconColor}
              style={{ marginRight: 12 }}
            />
            <Text style={styles.infoText}>{infoText}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scrollView: { flex: 1 },
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    margin: 20,
    marginBottom: 0,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  infoCard: {
    backgroundColor: "#181818",
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 12,
    marginHorizontal: 20,
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  title: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#888", lineHeight: 20 },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  infoText: { flex: 1, fontSize: 13, color: "#8E8E93", lineHeight: 18 },
});

export default NotificationToggleScreen;
