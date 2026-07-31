import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const IMG_W = width * (471 / 390);
const IMG_H = IMG_W * (706 / 471);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
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
  scrollContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bodyMapContainer: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    marginHorizontal: 8,
    marginVertical: 8,
    paddingVertical: 12,
    alignItems: "center",
    overflow: "hidden",
    minHeight: IMG_H + 24,
  },
  bodyMapWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  resultsContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  resultsHeader: {
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  resultsScrollContainer: {
    paddingRight: 16,
  },
  organResultsCard: {
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  organResultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  organResultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  biomarkerResultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3C",
  },
  biomarkerResultContent: {
    flex: 1,
  },
  biomarkerResultName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  biomarkerResultValue: {
    fontSize: 12,
    color: "#8E8E93",
  },
  biomarkerResultStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  biomarkerResultStatusText: {
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
  },
  infoPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3C",
  },
  panelHeaderContent: {
    flex: 1,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  panelSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  biomarkerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3C",
    minHeight: 48,
  },
  biomarkerColumn1: {
    flex: 1.5,
    alignItems: "flex-start",
  },
  biomarkerColumn2: {
    flex: 1,
    alignItems: "center",
  },
  biomarkerColumn3: {
    flex: 1,
    alignItems: "flex-end",
  },
  biomarkerName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "left",
  },
  biomarkerValue: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  biomarkerRange: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "right",
  },
  bottomSpacing: {
    height: 40,
  },
});

export default styles;
