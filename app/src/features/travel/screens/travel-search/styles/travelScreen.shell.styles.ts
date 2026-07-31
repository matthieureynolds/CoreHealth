import { StyleSheet } from "react-native";
import { palette } from "../../../../../shared/theme/colors";

/** Screen shell, header, tabs, scroll, trip rows, add-trip CTA */
export const travelShellStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60, // Increased for iPhone 16 Dynamic Island
    paddingBottom: 2,
    backgroundColor: palette.bg,
  },
  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: palette.textPrimary,
    marginBottom: 4,
  },

  // Tab styles now live inside TravelTabBar component (Glass Island design).
  // These are kept as empty stubs so any leftover references don't crash.

  scrollContainer: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  contentTrips: {
    paddingTop: 0,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: palette.textPrimary,
    marginBottom: 12,
  },
  // Detailed modal styles to match dashboard

  metricsContainer: {
    marginTop: 20,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: palette.textPrimary,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: palette.textSecondary,
    marginTop: 8,
    textAlign: "center",
    marginBottom: 16,
  },
  tripsContainer: {
    marginTop: 16,
  },

  addTripButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.link,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  addTripButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.textPrimary,
    marginLeft: 8,
  },
});
