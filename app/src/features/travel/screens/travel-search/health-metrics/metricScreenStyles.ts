import { StyleSheet } from "react-native";
import { palette } from "@shared/theme/colors";

/**
 * Shared styles for travel health metric info screens
 * (AirQuality, Altitude, DiseaseOutbreak, FoodSafety, Pollen, UVIndex, WaterSafety).
 * Each screen imports this and adds only its accent-specific heroCard / heroIcon overrides.
 */
export const metricScreenStyles = StyleSheet.create({
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
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.textPrimary,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: "center",
    lineHeight: 20,
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
  scaleRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  row: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  rowText: {
    flex: 1,
    fontSize: 14,
    color: palette.textOnLight,
    marginLeft: 10,
    lineHeight: 20,
  },
});
