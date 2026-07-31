import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { palette } from "../../../../../shared/theme/colors";

const TIPS = [
  {
    icon: "phone-portrait-outline" as const,
    tip: "Save the local emergency number before you travel",
  },
  {
    icon: "document-text-outline" as const,
    tip: "Carry a copy of your health insurance card and travel insurance",
  },
  {
    icon: "language-outline" as const,
    tip: "Use a translation app to communicate symptoms if language is a barrier",
  },
  {
    icon: "location-outline" as const,
    tip: "Enable location services so emergency services can find you",
  },
];

const EMERGENCY_NUMBERS = [
  { region: "International Emergency", number: "112" },
  { region: "United States", number: "911" },
  { region: "United Kingdom", number: "999" },
  { region: "Australia", number: "000" },
  { region: "European Union", number: "112" },
];

const NearbyHospitalsScreen: React.FC = () => {
  const navigation = useNavigation();

  const callNumber = (number: string) => {
    Alert.alert("Call Emergency", `Dial ${number}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => Linking.openURL(`tel:${number}`) },
    ]);
  };

  const openMaps = () => {
    Alert.alert("Find Nearby Hospitals", "Open in Maps?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Apple Maps",
        onPress: () => Linking.openURL("http://maps.apple.com/?q=hospital"),
      },
      {
        text: "Google Maps",
        onPress: () =>
          Linking.openURL("https://www.google.com/maps/search/hospital/"),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color={palette.link} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">
          Nearby Hospitals
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}
      >
        <TouchableOpacity
          style={styles.mapButton}
          onPress={openMaps}
          activeOpacity={0.8}
        >
          <View style={styles.mapButtonLeft}>
            <View style={styles.mapIcon}>
              <Ionicons name="map-outline" size={24} color={palette.link} />
            </View>
            <View>
              <Text style={styles.mapButtonTitle}>Find Nearest Hospital</Text>
              <Text style={styles.mapButtonSub}>
                Search on Apple Maps or Google Maps
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={palette.link} />
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            INTERNATIONAL EMERGENCY NUMBERS
          </Text>
          {EMERGENCY_NUMBERS.map((e) => (
            <TouchableOpacity
              key={e.number + e.region}
              style={styles.emergencyRow}
              onPress={() => callNumber(e.number)}
            >
              <Ionicons
                name="call-outline"
                size={18}
                color={palette.danger}
                style={{ marginRight: 14 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.emergencyRegion}>{e.region}</Text>
              </View>
              <Text style={styles.emergencyNumber}>{e.number}</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#555"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRAVEL TIPS</Text>
          {TIPS.map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipIconCircle}>
                <Ionicons name={t.icon} size={18} color={palette.link} />
              </View>
              <Text style={styles.tipText}>{t.tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={palette.textSecondary}
            style={{ marginRight: 12 }}
          />
          <Text style={styles.infoText}>
            Real-time nearby facilities are shown on the Travel search screen
            when location services are enabled.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  header: {
    paddingTop: 72,
    paddingBottom: 5,
    backgroundColor: palette.surfaceDeep,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  backButton: {
    padding: 8,
    position: "absolute",
    left: 20,
    top: 23.5,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.textPrimary,
    textAlign: "center",
    position: "absolute",
    left: 0,
    right: 0,
    paddingTop: 32.2,
    paddingBottom: 8,
  },
  mapButton: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#3AABF030",
  },
  mapButtonLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  mapIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3AABF020",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  mapButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.textPrimary,
    marginBottom: 2,
  },
  mapButtonSub: { fontSize: 13, color: palette.textSecondary },
  section: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  emergencyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceMuted,
  },
  emergencyRegion: { fontSize: 15, color: palette.textPrimary },
  emergencyNumber: { fontSize: 16, fontWeight: "700", color: palette.danger },
  tipRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  tipIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#3AABF015",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: palette.textOnLight,
    lineHeight: 20,
    paddingTop: 7,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: palette.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: palette.textSecondary,
    lineHeight: 18,
  },
});

export default NearbyHospitalsScreen;
