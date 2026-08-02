import { StyleSheet } from "react-native";
import { palette } from "@shared/theme/colors";
import { RAIL_H } from "./tripRail";
import { CAP_W, MARK } from "./railLayout";

/** Styles for the trip plan screen. Split out to keep the screen readable. */
export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },

  pager: { flex: 1 },

  // Header row
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 2,
  },
  backBtn: { width: 36 },
  headerSpacer: { width: 36 },

  // Hero
  heroRoute: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  heroCode: {
    fontSize: 28,
    fontWeight: "800",
    color: palette.textPrimary,
    letterSpacing: 2,
  },
  heroArrow: { fontSize: 20, color: palette.border },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginTop: 2,
    marginBottom: 18,
  },
  heroDates: { fontSize: 12, color: palette.textSecondary, fontWeight: "500" },
  heroDir: { fontSize: 11, color: palette.warning, fontWeight: "600" },

  // Section tabs
  sectionTabsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceElevated,
  },
  sectionTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -1,
  },
  sectionTabActive: { borderBottomColor: palette.accent },
  sectionTabText: {
    fontSize: 15,
    fontWeight: "600",
    color: palette.textSecondary,
  },
  sectionTabTextActive: { color: palette.textPrimary },

  // "Right now" card

  // Outbound / Return leg toggle
  legToggleRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  legToggle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.surfaceElevated,
    alignItems: "center",
  },
  legToggleActive: {
    backgroundColor: palette.surfaceBlue,
    borderColor: palette.accent,
  },
  legToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.textSecondary,
  },
  legToggleTextActive: { color: palette.textPrimary },

  // Strategy summary banner

  // Commitments
  commitSection: { marginTop: 8, marginHorizontal: 20, paddingTop: 16 },
  commitHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  commitHeader: { fontSize: 16, fontWeight: "700", color: palette.textPrimary },
  commitAdd: { fontSize: 15, fontWeight: "600", color: palette.link },
  commitEmpty: { fontSize: 13, color: palette.textSecondary, lineHeight: 18 },
  commitSwipeContainer: { marginBottom: 10, borderRadius: 14 },
  commitCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,55,95,0.08)",
    borderLeftWidth: 3,
    borderLeftColor: palette.pink,
    borderRadius: 14,
    overflow: "hidden",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  commitIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,55,95,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  commitActions: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
    paddingLeft: 8,
  },
  commitAction: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  commitActionEdit: { backgroundColor: palette.warning },
  commitActionDelete: { backgroundColor: palette.danger },
  commitActionText: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  commitTitle: { fontSize: 15, fontWeight: "600", color: palette.textPrimary },
  commitMeta: { fontSize: 12, color: palette.textSecondary, marginTop: 2 },

  // Return-flight capture row
  returnFlightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.surfaceElevated,
  },
  returnFlightText: { flex: 1, fontSize: 13, color: palette.textFaint },
  returnFlightEdit: { fontSize: 14, fontWeight: "600", color: palette.link },

  // Add-commitment modal
  // Add-commitment bottom sheet
  sheetRoot: { flex: 1, justifyContent: "flex-end" },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.78)",
  },
  sheet: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: palette.surfaceElevated,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: palette.borderStrong,
    alignSelf: "center",
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: palette.textPrimary,
    letterSpacing: 0.2,
  },
  tickBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.success,
    alignItems: "center",
    justifyContent: "center",
  },
  tickBtnDisabled: { backgroundColor: palette.surfaceElevated },
  sheetLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.textSecondary,
    letterSpacing: 0.2,
    marginTop: 18,
    marginBottom: 8,
  },
  sheetInput: {
    backgroundColor: palette.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: palette.textPrimary,
    fontSize: 15,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  sheetError: {
    fontSize: 13,
    color: palette.danger,
    marginTop: 8,
    marginLeft: 2,
  },
  dayChip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 64,
  },
  dayChipIdle: { backgroundColor: palette.surfaceElevated },
  dayChipActive: { backgroundColor: palette.accent },
  dayChipText: { fontSize: 13, fontWeight: "600", color: palette.textPrimary },
  timeRow: { flexDirection: "row", gap: 12 },
  timeCard: {
    backgroundColor: palette.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  timeCardOpen: {
    backgroundColor: palette.surfaceSunken,
    borderColor: palette.accent,
  },
  timeCardValue: {
    fontSize: 20,
    fontWeight: "600",
    color: palette.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  timeCardValueOpen: { color: palette.accent },
  timeCardHint: { fontSize: 11, color: palette.textSecondary, marginTop: 2 },
  wheelWrap: {
    marginTop: 12,
    backgroundColor: palette.surfaceElevated,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
  },
  wheel: { width: 220, alignSelf: "center" },

  // Return-flight modal (legacy centered card)
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.textPrimary,
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.textSecondary,
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: palette.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: palette.textPrimary,
    fontSize: 15,
  },
  modalTimeRow: { flexDirection: "row", gap: 12 },
  modalBtnRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  modalBtnCancel: { backgroundColor: palette.surfaceElevated },
  modalBtnCancelText: {
    color: palette.textPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
  modalBtnSave: { backgroundColor: palette.accent },
  modalBtnSaveText: {
    color: palette.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },

  // Date chips
  chipStrip: { marginBottom: 20 },
  chipStripContent: { paddingHorizontal: 20, gap: 6 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: palette.surface,
    alignItems: "center",
    minWidth: 68,
  },
  chipActive: { backgroundColor: palette.accent },
  chipDay: { fontSize: 12, fontWeight: "600", color: palette.textPrimary },
  chipDayActive: { color: palette.textPrimary },
  chipSub: { fontSize: 10, color: palette.textSecondary, marginTop: 2 },
  chipSubActive: { color: "rgba(255,255,255,0.7)" },

  // Day header
  dayHeader: {
    paddingHorizontal: 20,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  dayHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  dayHeaderLoc: { fontSize: 13, color: palette.textSecondary },

  // Activity blocks

  // Timeshifter-style day rail
  rail: {
    height: RAIL_H,
    marginTop: 8,
    marginBottom: 30,
    position: "relative",
  },
  railHourLine: {
    position: "absolute",
    left: 34,
    right: 34,
    height: 0,
    borderTopWidth: 1,
    borderTopColor: palette.surface,
  },
  railVLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: palette.surface,
  },
  railHourL: {
    position: "absolute",
    left: -75,
    top: -8,
    width: 72,
    textAlign: "right",
    fontSize: 12,
    color: palette.textMuted,
  },
  railHourR: {
    position: "absolute",
    right: -75,
    top: -8,
    width: 72,
    textAlign: "left",
    fontSize: 12,
    color: palette.textMuted,
  },
  railCap: { position: "absolute", width: CAP_W, borderRadius: CAP_W / 2 },
  railMarkRow: {
    position: "absolute",
    height: MARK,
    flexDirection: "row",
    alignItems: "center",
  },
  railMark: {
    width: MARK,
    height: MARK,
    borderRadius: MARK / 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Health sections
  healthSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.textPrimary,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  healthList: { paddingHorizontal: 20 },
  healthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: palette.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  healthRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "50%",
  },
  healthRowRight: {
    width: "50%",
    alignItems: "flex-start",
  },
  healthRowName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: palette.textPrimary,
  },
  healthRowBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.textSecondary,
  },
  healthRowNote: { fontSize: 12, color: palette.textSecondary },
});
