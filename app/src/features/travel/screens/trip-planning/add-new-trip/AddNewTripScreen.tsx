import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FlightLookupService } from "../../../../../shared/services/jetlag-brain/enhancedJetLagService";
import { palette } from "../../../../../shared/theme/colors";

interface TripFormData {
  title: string;
  origin: string;
  destination: string;
  departureDate: Date;
  returnDate: Date;
  plan_style: "gentle" | "aggressive";
  prefs: {
    chronotype: "morning" | "neutral" | "evening";
    caffeine: boolean;
    melatonin: boolean;
    naps: boolean;
  };
}

const AddNewTripScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"manual" | "flight">("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<"dep" | "ret" | null>(
    null,
  );
  const [flightNumber, setFlightNumber] = useState("");
  const [flightDate, setFlightDate] = useState("");

  const [form, setForm] = useState<TripFormData>({
    title: "",
    origin: "",
    destination: "",
    departureDate: new Date(),
    returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    plan_style: "gentle",
    prefs: {
      chronotype: "neutral",
      caffeine: true,
      melatonin: false,
      naps: true,
    },
  });

  const updatePref = (key: keyof TripFormData["prefs"], value: any) => {
    setForm((f) => ({ ...f, prefs: { ...f.prefs, [key]: value } }));
  };

  const handleSave = () => {
    if (!form.origin.trim() || !form.destination.trim()) {
      Alert.alert(
        "Missing Details",
        "Please enter both origin and destination.",
      );
      return;
    }
    Alert.alert(
      "Trip Created",
      `${form.origin} → ${form.destination} added to your trip plans.`,
      [{ text: "OK", onPress: () => navigation.goBack() }],
    );
  };

  const handleFlightLookup = async () => {
    if (!flightNumber.trim() || !flightDate.trim()) {
      Alert.alert("Missing Details", "Enter a flight number and date.");
      return;
    }
    setIsLoading(true);
    try {
      const parts = flightNumber.trim().match(/^([A-Z]{2})\s*(\d{1,4})$/i);
      if (!parts) throw new Error("Invalid flight number format (e.g. BA123)");
      const result = await FlightLookupService.lookupFlight(
        parts[1].toUpperCase(),
        parts[2],
        flightDate.trim(),
      );
      if (result) {
        setForm((f) => ({
          ...f,
          origin: result.origin_iata,
          destination: result.dest_iata,
          title: `${result.origin_iata} → ${result.dest_iata}`,
        }));
        setActiveTab("manual");
        Alert.alert(
          "Flight Found",
          `${result.origin_iata} → ${result.dest_iata} loaded.`,
        );
      } else {
        Alert.alert(
          "Not Found",
          "Flight data unavailable. Enter manually instead.",
        );
      }
    } catch (e: any) {
      Alert.alert(
        "Lookup Failed",
        e.message ?? "Try entering your trip manually.",
      );
    } finally {
      setIsLoading(false);
    }
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
          Add New Trip
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}
      >
        {/* Tab selector */}
        <View style={styles.tabBar}>
          {(["manual", "flight"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Ionicons
                name={tab === "manual" ? "create-outline" : "airplane-outline"}
                size={16}
                color={activeTab === tab ? palette.link : palette.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab === "manual" ? "Manual Entry" : "Flight Lookup"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "flight" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FLIGHT LOOKUP</Text>
            <Text style={styles.label}>Flight Number (e.g. BA123)</Text>
            <TextInput
              style={styles.input}
              value={flightNumber}
              onChangeText={setFlightNumber}
              placeholder="BA123"
              placeholderTextColor="#555"
              autoCapitalize="characters"
            />
            <Text style={styles.label}>Flight Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={flightDate}
              onChangeText={setFlightDate}
              placeholder="2025-12-31"
              placeholderTextColor="#555"
            />
            <TouchableOpacity
              style={[styles.lookupBtn, isLoading && styles.lookupBtnDisabled]}
              onPress={handleFlightLookup}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={palette.textPrimary} />
              ) : (
                <>
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color={palette.textPrimary}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.lookupBtnText}>Look Up Flight</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TRIP DETAILS</Text>
              <Text style={styles.label}>Trip Name (optional)</Text>
              <TextInput
                style={styles.input}
                value={form.title}
                onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
                placeholder="e.g. Paris Holiday"
                placeholderTextColor="#555"
              />
              <Text style={styles.label}>Origin</Text>
              <TextInput
                style={styles.input}
                value={form.origin}
                onChangeText={(v) => setForm((f) => ({ ...f, origin: v }))}
                placeholder="e.g. London or LHR"
                placeholderTextColor="#555"
                autoCapitalize="words"
              />
              <Text style={styles.label}>Destination</Text>
              <TextInput
                style={styles.input}
                value={form.destination}
                onChangeText={(v) => setForm((f) => ({ ...f, destination: v }))}
                placeholder="e.g. Tokyo or HND"
                placeholderTextColor="#555"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DATES</Text>
              <TouchableOpacity
                style={styles.dateRow}
                onPress={() => setShowDatePicker("dep")}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={palette.link}
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.dateLabel}>Departure</Text>
                <Text style={styles.dateValue}>
                  {form.departureDate.toDateString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateRow, { borderBottomWidth: 0 }]}
                onPress={() => setShowDatePicker("ret")}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={palette.success}
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.dateLabel}>Return</Text>
                <Text style={styles.dateValue}>
                  {form.returnDate.toDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>JET LAG PLAN STYLE</Text>
              {(["gentle", "aggressive"] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.optionRow}
                  onPress={() => setForm((f) => ({ ...f, plan_style: s }))}
                >
                  <View
                    style={[
                      styles.radio,
                      form.plan_style === s && styles.radioSelected,
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionLabel}>
                      {s === "gentle"
                        ? "Gentle — gradual, low effort"
                        : "Aggressive — faster adjustment"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PREFERENCES</Text>
              {(["caffeine", "melatonin", "naps"] as const).map((pref) => (
                <TouchableOpacity
                  key={pref}
                  style={styles.toggleRow}
                  onPress={() => updatePref(pref, !form.prefs[pref])}
                >
                  <Text style={styles.toggleLabel}>
                    {pref.charAt(0).toUpperCase() + pref.slice(1)}
                  </Text>
                  <View
                    style={[
                      styles.togglePill,
                      form.prefs[pref] && styles.togglePillOn,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        form.prefs[pref] && styles.toggleThumbOn,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={
            showDatePicker === "dep" ? form.departureDate : form.returnDate
          }
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          minimumDate={new Date()}
          onChange={(_, date) => {
            if (date)
              setForm((f) =>
                showDatePicker === "dep"
                  ? { ...f, departureDate: date }
                  : { ...f, returnDate: date },
              );
            if (Platform.OS === "android") setShowDatePicker(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  header: {
    paddingTop: 72,
    paddingBottom: 12,
    backgroundColor: palette.surfaceDeep,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  backButton: { padding: 8, marginBottom: -4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: palette.textPrimary },
  saveBtn: { padding: 8, marginBottom: -4 },
  saveBtnText: { fontSize: 16, fontWeight: "600", color: palette.link },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: { backgroundColor: palette.surfaceElevated },
  tabText: { fontSize: 14, fontWeight: "500", color: palette.textSecondary },
  activeTabText: { color: palette.link, fontWeight: "600" },
  section: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: palette.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: palette.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    color: palette.textPrimary,
    fontSize: 15,
    marginBottom: 4,
  },
  lookupBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.link,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  lookupBtnDisabled: { opacity: 0.5 },
  lookupBtnText: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceMuted,
  },
  dateLabel: { flex: 1, fontSize: 15, color: palette.textPrimary },
  dateValue: { fontSize: 14, color: palette.textSecondary },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#555",
    marginRight: 14,
  },
  radioSelected: { borderColor: palette.link, backgroundColor: palette.link },
  optionLabel: { fontSize: 14, color: palette.textPrimary },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceMuted,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 15,
    color: palette.textPrimary,
    textTransform: "capitalize",
  },
  togglePill: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#555",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  togglePillOn: { backgroundColor: palette.link },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.textPrimary,
    alignSelf: "flex-start",
  },
  toggleThumbOn: { alignSelf: "flex-end" },
});

export default AddNewTripScreen;
