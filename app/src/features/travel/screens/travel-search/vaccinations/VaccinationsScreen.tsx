import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { palette } from "../../../../../shared/theme/colors";
import { logger } from "../../../../../shared/utils/logger";

const CHECKED_VAX_KEY = "vaccinations_checked";

const ROUTINE = [
  "COVID-19",
  "Influenza (Flu)",
  "Tetanus/Diphtheria/Pertussis (Tdap)",
  "Measles, Mumps, Rubella (MMR)",
  "Hepatitis B",
  "Pneumococcal",
];
const TRAVEL_RECOMMENDED = [
  "Hepatitis A",
  "Typhoid",
  "Yellow Fever",
  "Meningococcal",
  "Japanese Encephalitis",
  "Rabies",
  "Cholera",
];
const TIPS = [
  "Consult a travel medicine clinic 4–6 weeks before departure",
  "Carry an International Certificate of Vaccination (Yellow Card)",
  "Some destinations require proof of Yellow Fever vaccination for entry",
  "Children and elderly may need additional doses or boosters",
];

const VaccinationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [checkedVax, setCheckedVax] = useState<Record<string, boolean>>({});
  const loaded = useRef(false);

  // The checklist is the point of this screen, so it has to survive leaving it.
  // Previously it lived in component state only and was lost on every navigate.
  useEffect(() => {
    AsyncStorage.getItem(CHECKED_VAX_KEY)
      .then((stored) => {
        if (stored) setCheckedVax(JSON.parse(stored));
      })
      .catch((err) => {
        logger.warn("failed to read vaccination checklist", err);
      })
      .finally(() => {
        loaded.current = true;
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(CHECKED_VAX_KEY, JSON.stringify(checkedVax)).catch(
      (err) => {
        logger.warn("failed to save vaccination checklist", err);
      },
    );
  }, [checkedVax]);

  const toggle = (name: string) =>
    setCheckedVax((prev) => ({ ...prev, [name]: !prev[name] }));

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
          Vaccinations
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}
      >
        <View style={styles.heroCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={36}
            color={palette.success}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.heroTitle}>Travel Vaccination Checklist</Text>
          <Text style={styles.heroDesc}>
            Keep track of your routine and travel vaccinations. Tap a vaccine to
            mark it as completed.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ROUTINE VACCINATIONS</Text>
          {ROUTINE.map((v) => (
            <TouchableOpacity
              key={v}
              style={styles.vaccRow}
              onPress={() => toggle(v)}
            >
              <View
                style={[styles.checkbox, checkedVax[v] && styles.checkboxDone]}
              >
                {checkedVax[v] && (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={palette.textPrimary}
                  />
                )}
              </View>
              <Text
                style={[styles.vaccName, checkedVax[v] && styles.vaccNameDone]}
              >
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMMON TRAVEL VACCINES</Text>
          {TRAVEL_RECOMMENDED.map((v) => (
            <TouchableOpacity
              key={v}
              style={styles.vaccRow}
              onPress={() => toggle(v)}
            >
              <View
                style={[styles.checkbox, checkedVax[v] && styles.checkboxDone]}
              >
                {checkedVax[v] && (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={palette.textPrimary}
                  />
                )}
              </View>
              <Text
                style={[styles.vaccName, checkedVax[v] && styles.vaccNameDone]}
              >
                {v}
              </Text>
              <View style={styles.travelBadge}>
                <Text style={styles.travelBadgeText}>Travel</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IMPORTANT TIPS</Text>
          {TIPS.map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={palette.success}
              />
              <Text style={styles.tipText}>{t}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => Linking.openURL("https://wwwnc.cdc.gov/travel")}
        >
          <Ionicons name="open-outline" size={18} color={palette.link} />
          <Text style={styles.linkBtnText}>
            CDC Traveler's Vaccination Guide
          </Text>
        </TouchableOpacity>
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
  heroCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    margin: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#34C75930",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  heroDesc: {
    fontSize: 13,
    color: palette.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
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
  vaccRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceMuted,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#555",
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: palette.success,
    borderColor: palette.success,
  },
  vaccName: { flex: 1, fontSize: 15, color: palette.textPrimary },
  vaccNameDone: {
    color: palette.textSecondary,
    textDecorationLine: "line-through",
  },
  travelBadge: {
    backgroundColor: "#3AABF020",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  travelBadgeText: { fontSize: 11, color: palette.link, fontWeight: "600" },
  tipRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: palette.textOnLight,
    marginLeft: 10,
    lineHeight: 18,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3AABF030",
  },
  linkBtnText: {
    fontSize: 14,
    color: palette.link,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default VaccinationsScreen;
