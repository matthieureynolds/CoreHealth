import { StyleSheet } from "react-native";

/** Screen shell, header, tabs, scroll, trip rows, add-trip CTA */
export const travelShellStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60, // Increased for iPhone 16 Dynamic Island
    paddingBottom: 2,
    backgroundColor: "#000000",
  },
  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "400",
    lineHeight: 20,
    flexWrap: "wrap",
  },

  // Tab styles now live inside TravelTabBar component (Glass Island design).
  // These are kept as empty stubs so any leftover references don't crash.
  tabContainer: {},
  tabScrollContainer: {},
  tab: {},
  activeTab: {},
  tabText: {},
  activeTabText: {},
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
    color: "#FFFFFF",
    marginBottom: 12,
  },
  // Detailed modal styles to match dashboard

  description: {
    fontSize: 16,
    color: "#8E8E93",
    lineHeight: 24,
  },

  metricsContainer: {
    marginTop: 20,
  },
  metricCard: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0,
    borderColor: "#3A3A3C",
    width: "48%", // Two columns
  },

  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#8E8E93",
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
    backgroundColor: "#3AABF0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  addTripButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
});
