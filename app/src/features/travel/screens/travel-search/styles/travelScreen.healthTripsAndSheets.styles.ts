import { StyleSheet } from "react-native";

/** Vaccinations, health summary, metrics, trip cards, jet lag, date pickers, bottom sheet */
export const travelHealthTripsAndSheetsStyles = StyleSheet.create({
  vaccineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 0,
    borderColor: "#3A3A3C",
  },
  vaccineLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "50%",
  },
  vaccineRight: {
    width: "50%",
    alignItems: "flex-start",
  },
  vaccineName: {
    flex: 1,
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  vaccineBadge: {
    color: "#8E8E93",
    fontSize: 12,
    marginLeft: 0,
  },

  tipText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 12,
    flex: 1,
  },

  progressText: {
    fontSize: 14,
    color: "#8E8E93",
    marginLeft: 8,
  },

  countryName: {
    fontSize: 18,
    color: "#8E8E93",
  },
  summaryCard: {
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 0,
    borderColor: "#3A3A3C",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  metricsSection: {
    marginBottom: 28,
  },
  metricRowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 0,
    borderColor: "#3A3A3C",
  },

  metricIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  metricContent: {
    flex: 1,
  },

  metricName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  metricValueText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  hospitalsSection: {
    marginBottom: 28,
  },
  sectionGroupCard: {
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 0,
    borderWidth: 0,
  },
  hospitalCard: {
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 0,
    borderColor: "#3A3A3C",
  },
  hospitalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  hospitalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  hospitalDistance: {
    fontSize: 13,
    color: "#8E8E93",
    marginLeft: 8,
  },
  hospitalInfo: {
    fontSize: 14,
    color: "#8E8E93",
  },
  medicationSection: {
    marginBottom: 20,
  },

  medicationCard: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 16,
    borderWidth: 0,
    borderColor: "#3A3A3C",
  },

  medicationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  emergencySection: {
    marginBottom: 20,
  },

  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },

  emergencyNumber: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  jetLagHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  datePickerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
    elevation: 10000,
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
  },
  datePickerModalContent: {
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3C",
    zIndex: 10001,
    elevation: 10001,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 16,
  },

  datePickerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },

  datePicker: {
    width: "100%",
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3A3A3C",
    color: "#FFFFFF",
  },

  cancelButton: {
    backgroundColor: "#8E8E93",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },

  emergencyModal: {
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  emergencyModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  emergencyModalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 12,
  },
  emergencyCallButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emergencyCallButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  emergencyCancelButton: {
    backgroundColor: "#8E8E93",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emergencyCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  resultTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    flexShrink: 1,
  },

  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#3AABF0",
    marginRight: 4,
  },

  metricRightCol: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  metricScoreText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  metricScoreLabelText: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 2,
  },
  // Bottom Sheet Styles
  bottomSheetContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    zIndex: 1000,
    pointerEvents: "box-none",
    justifyContent: "flex-end",
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: "#2C2C2E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
    minHeight: "70%",
    maxHeight: "100%",
    paddingBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },

  bottomSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    zIndex: 10,
  },
  bottomSheetCloseButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    flex: 1,
  },
  bottomSheetBody: {
    flex: 1,
  },
  bottomSheetBodyContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
});
