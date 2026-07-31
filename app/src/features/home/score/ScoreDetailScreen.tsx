import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@shared/types";
import { palette } from "@shared/theme/colors";

type Route = RouteProp<RootStackParamList, "ScoreDetail">;
type Nav = StackNavigationProp<RootStackParamList, "ScoreDetail">;

const SF_FONT =
  Platform.select({ ios: "SF Pro Text", android: "System" }) ?? "System";

const ScoreDetailScreen: React.FC = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { id, title, value, color, icon, subtitle } = route.params;
  const [dayOffset, setDayOffset] = useState(0);
  const dayLabel = useMemo(() => {
    if (dayOffset === 0) return "Today";
    if (dayOffset === -1) return "Yesterday";
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  }, [dayOffset]);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [spinAnim]);

  const recoveryRows = useMemo(
    () => [
      { label: "RHR before bed", score: Math.round(Math.max(50, value - 8)) },
      { label: "HRV", score: Math.round(value) },
      {
        label: "Sleep consistency",
        score: Math.round(Math.min(100, value + 4)),
      },
      { label: "Deep sleep", score: Math.round(Math.max(40, value - 3)) },
      { label: "REM sleep", score: Math.round(Math.min(100, value + 1)) },
    ],
    [value],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title} Score</Text>
        <View style={styles.headerRightSpacer} />
      </View>
      <View style={styles.dayRow}>
        <TouchableOpacity
          style={styles.dayArrow}
          onPress={() => setDayOffset((prev) => prev - 1)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={18} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.dayLabel}>{dayLabel}</Text>
        {dayOffset < 0 ? (
          <TouchableOpacity
            style={styles.dayArrow}
            onPress={() => setDayOffset((prev) => prev + 1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={palette.textPrimary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.dayArrowSpacer} />
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.scoreRingWrap}>
            <Animated.View
              style={[
                styles.scoreRingTrack,
                {
                  borderColor: color,
                  transform: [
                    {
                      rotate: spinAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            />
            <View style={styles.scoreRingContent}>
              <Ionicons name={icon as any} size={22} color={color} />
              <Text style={[styles.scoreValue, { color }]}>
                {Math.round(value)}
              </Text>
              <Text style={styles.scoreLabel}>Recovery</Text>
            </View>
          </View>
          <Text style={styles.heroSubtitle}>Recovery summary</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Last 10 days</Text>
          <View style={styles.barChart}>
            {new Array(10).fill(0).map((_, idx) => {
              const dayScore = Math.max(
                40,
                Math.min(100, Math.round(value - 8 + idx)),
              );
              return (
                <View key={`bar-${idx}`} style={styles.barCol}>
                  <View
                    style={[styles.barFill, { height: Math.max(18, dayScore) }]}
                  />
                  <Text style={styles.barLabel}>{idx + 1}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recovery breakdown</Text>
          {recoveryRows.map((row) => (
            <View key={row.label} style={styles.metricRow}>
              <View style={styles.metricText}>
                <Text style={styles.metricLabel}>{row.label}</Text>
                <Text style={styles.metricRange}>
                  Based on {dayLabel.toLowerCase()}
                </Text>
              </View>
              <Text style={styles.metricScore}>{row.score}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: palette.bg,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  headerButton: { padding: 8, marginRight: 6 },
  headerRightSpacer: { width: 32 },
  headerTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    fontFamily: SF_FONT,
  },
  content: { flex: 1 },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 8,
  },
  dayArrow: {
    padding: 4,
  },
  dayArrowSpacer: {
    width: 26,
    height: 26,
  },
  dayLabel: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: SF_FONT,
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  scoreRingWrap: {
    width: 150,
    height: 150,
    alignSelf: "center",
  },
  scoreRingTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 6,
    borderColor: palette.cta,
  },
  scoreRingContent: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceMuted,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "700",
    marginTop: 4,
    fontFamily: SF_FONT,
  },
  scoreLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    marginTop: 4,
    fontFamily: SF_FONT,
  },
  heroSubtitle: {
    marginTop: 12,
    textAlign: "center",
    color: palette.textSecondary,
    fontSize: 12,
    fontFamily: SF_FONT,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: SF_FONT,
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  metricText: { flex: 1, marginRight: 10 },
  metricLabel: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: SF_FONT,
  },
  metricRange: {
    color: palette.textSecondary,
    fontSize: 11,
    marginTop: 2,
    fontFamily: SF_FONT,
  },
  metricScore: {
    color: "#FFD60A",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: SF_FONT,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 8,
    paddingBottom: 4,
  },
  barCol: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  barFill: { width: 14, borderRadius: 6, backgroundColor: palette.cta },
  barLabel: {
    color: palette.textSecondary,
    fontSize: 10,
    marginTop: 6,
    fontFamily: SF_FONT,
  },
});

export default ScoreDetailScreen;
