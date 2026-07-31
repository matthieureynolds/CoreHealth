import { Ionicons } from "@expo/vector-icons";

const BIOMARKER_STATUS_COLORS: Record<string, string> = {
  optimal: "#30D158",
  normal: "#30D158",
  borderline: "#FF9F0A",
  abnormal: "#FF3B30",
  low: "#FF9F0A",
  high: "#FF6B35",
  critical: "#FF3B30",
};

export const getBiomarkerStatusColor = (status?: string): string =>
  BIOMARKER_STATUS_COLORS[status?.toLowerCase() ?? ""] ?? "#8E8E93";

const BIOMARKER_STATUS_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  normal: "checkmark-circle",
  low: "arrow-down-circle",
  high: "arrow-up-circle",
  critical: "warning",
};

export const getBiomarkerStatusIcon = (
  status?: string,
): keyof typeof Ionicons.glyphMap =>
  BIOMARKER_STATUS_ICONS[status?.toLowerCase() ?? ""] ?? "help-circle";
