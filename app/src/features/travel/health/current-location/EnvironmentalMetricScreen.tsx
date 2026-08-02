import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@shared/types";
import { palette } from "@shared/theme/colors";
import { STATUS_LABELS, METRIC_CONFIGS } from "./metricConfigs";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type EnvironmentalMetricRoute = RouteProp<
  RootStackParamList,
  "EnvironmentalMetric"
>;
type Nav = StackNavigationProp<RootStackParamList, "EnvironmentalMetric">;

// ─────────────────── status helpers ───────────────────

const getSegmentColor = (
  segments: { label: string; color: string }[],
  position: number,
): string => {
  const idx = Math.min(
    Math.floor(position * segments.length),
    segments.length - 1,
  );
  return segments[Math.max(0, idx)].color;
};

// Derive a status key from the position + segments
const deriveStatus = (
  segments: { label: string; color: string }[],
  position: number,
): string => {
  const color = getSegmentColor(segments, position);
  if (color === palette.success || color === palette.success) return "good";
  if (color === palette.warningAlt) return "moderate";
  if (color === palette.alert) return "poor";
  if (color === palette.danger || color === palette.dangerDeep)
    return "hazardous";
  return "moderate";
};

// ─────────────────── range bar ───────────────────

const RangeBar: React.FC<{
  segments: { label: string; color: string }[];
  position: number;
  comparisonText: string;
  comparisonColor: string;
}> = ({ segments, position, comparisonText, comparisonColor }) => {
  const clampedPos = Math.max(0.03, Math.min(0.97, position));
  const dotColor = getSegmentColor(segments, clampedPos);

  return (
    <View>
      {/* Bar */}
      <View
        style={{
          height: 10,
          flexDirection: "row",
          borderRadius: 5,
          overflow: "visible",
          position: "relative",
        }}
      >
        {segments.map((seg, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: seg.color,
              marginHorizontal: 0.5,
              ...(i === 0
                ? { borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }
                : {}),
              ...(i === segments.length - 1
                ? { borderTopRightRadius: 5, borderBottomRightRadius: 5 }
                : {}),
            }}
          />
        ))}
        <View
          style={{
            position: "absolute",
            top: -4,
            left: `${clampedPos * 100}%`,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: palette.textPrimary,
            borderWidth: 3,
            borderColor: dotColor,
            marginLeft: -9,
          }}
        />
      </View>

      {/* Segment labels */}
      <View style={{ flexDirection: "row", marginTop: 8 }}>
        {segments.map((seg, i) => (
          <Text
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 10,
              color: palette.textMuted,
              fontWeight: "500",
              lineHeight: 13,
            }}
            numberOfLines={2}
          >
            {seg.label}
          </Text>
        ))}
      </View>

      {/* Comparison to home */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 16,
          gap: 6,
        }}
      >
        <Ionicons name="home-outline" size={14} color={comparisonColor} />
        <Text
          style={{ color: comparisonColor, fontSize: 15, fontWeight: "600" }}
        >
          {comparisonText}
        </Text>
      </View>
    </View>
  );
};

// ─────────────────── main screen ───────────────────

const EnvironmentalMetricScreen: React.FC = () => {
  const route = useRoute<EnvironmentalMetricRoute>();
  const navigation = useNavigation<Nav>();
  const { metricId, label, score = 0, icon = "cloud-outline" } = route.params;
  const [showInfo, setShowInfo] = useState(false);

  const config = METRIC_CONFIGS[metricId] || METRIC_CONFIGS.air_quality;
  const position = Math.max(0, Math.min(1, score / config.divisor));

  // Derive the actual status from where the dot sits on the bar, not the passed-in status
  const derivedStatus = deriveStatus(config.segments, position);
  const actualStatus = derivedStatus;
  const statusColor = getSegmentColor(config.segments, position);
  const statusLabel = STATUS_LABELS[actualStatus] || actualStatus;

  const meaning = config.getMeaning(actualStatus);
  const recommendations = config.getRecommendations(actualStatus);

  const homePosition = Math.max(
    0,
    Math.min(1, config.homeScore / config.divisor),
  );
  const homeStatus = deriveStatus(config.segments, homePosition);
  const comparisonText = config.getComparison(actualStatus, homeStatus);
  const comparisonRanks: Record<string, number> = {
    excellent: 5,
    good: 4,
    moderate: 3,
    poor: 2,
    hazardous: 1,
  };
  const diff =
    (comparisonRanks[actualStatus] || 3) - (comparisonRanks[homeStatus] || 3);
  const comparisonColor =
    diff > 0
      ? palette.success
      : diff < 0
        ? palette.warningAlt
        : palette.textSecondary;

  const toggleInfo = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowInfo(!showInfo);
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient hero */}
        <LinearGradient
          colors={[palette.bg, palette.bg]}
          locations={[0, 1]}
          style={{ paddingTop: 50, paddingBottom: 16 }}
        >
          {/* Nav row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              marginBottom: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ padding: 6 }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={palette.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleInfo}
              style={{ padding: 6 }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name={
                  showInfo ? "information-circle" : "information-circle-outline"
                }
                size={22}
                color={showInfo ? palette.accent : "rgba(255,255,255,0.4)"}
              />
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: `${statusColor}15`,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={22}
                color={statusColor}
              />
            </View>
            <Text
              style={{
                color: palette.textPrimary,
                fontSize: 24,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              {label}
            </Text>
            <Text
              style={{ color: statusColor, fontSize: 15, fontWeight: "600" }}
            >
              {statusLabel}
            </Text>
          </View>
        </LinearGradient>

        {/* Range bar */}
        <View style={{ paddingHorizontal: 24, marginTop: 22 }}>
          <Text
            style={{
              color: palette.textPrimary,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 16,
            }}
          >
            Current level
          </Text>
          <RangeBar
            segments={config.segments}
            position={position}
            comparisonText={comparisonText}
            comparisonColor={comparisonColor}
          />
        </View>

        {/* Divider */}
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: palette.surfaceElevated,
            marginHorizontal: 24,
            marginTop: 24,
          }}
        />

        {/* What this means for you */}
        <View style={{ paddingHorizontal: 24, marginTop: 22 }}>
          <Text
            style={{
              color: palette.textPrimary,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            What this means for you
          </Text>
          <Text
            style={{ color: palette.textDim, fontSize: 15, lineHeight: 24 }}
          >
            {meaning}
          </Text>
        </View>

        {/* Divider */}
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: palette.surfaceElevated,
            marginHorizontal: 24,
            marginTop: 24,
          }}
        />

        {/* Recommendations */}
        <View style={{ paddingHorizontal: 24, marginTop: 22 }}>
          <Text
            style={{
              color: palette.textPrimary,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 14,
            }}
          >
            What to do
          </Text>
          {recommendations.map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 12,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: statusColor,
                  marginTop: 7,
                  opacity: 0.6,
                }}
              />
              <Text
                style={{
                  color: palette.textDim,
                  fontSize: 15,
                  lineHeight: 22,
                  flex: 1,
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Info (expandable) */}
        {showInfo && (
          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <View
              style={{
                backgroundColor: palette.surface,
                borderRadius: 14,
                padding: 18,
              }}
            >
              <Text
                style={{
                  color: palette.textPrimary,
                  fontSize: 15,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                What this measures
              </Text>
              <Text
                style={{ color: palette.textDim, fontSize: 14, lineHeight: 22 }}
              >
                {config.whatItMeasures}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

export default EnvironmentalMetricScreen;
