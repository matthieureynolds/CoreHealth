import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ProfileTabParamList } from "@shared/types";

type Nav = StackNavigationProp<ProfileTabParamList, "CountryDetail">;
type Route = RouteProp<ProfileTabParamList, "CountryDetail">;

const flagFromCode = (code: string) => {
  const u = code.toUpperCase();
  const b = 0x1f1e6;
  return String.fromCodePoint(
    u.charCodeAt(0) - 65 + b,
    u.charCodeAt(1) - 65 + b,
  );
};

// Deterministic mock data seeded from country code so it's always consistent
const seed = (code: string) => {
  let h = 0;
  for (let i = 0; i < code.length; i++)
    h = (Math.imul(31, h) + code.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const between = (s: number, min: number, max: number) =>
  min + (s % (max - min + 1));

type SubScore = {
  label: string;
  icon: string;
  color: string;
  score: number;
  change: number;
};

const CountryDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { name, code, score, delta, rank } = route.params;

  const flag = flagFromCode(code);
  const s = seed(code);

  const participants = between(s, 1200, 48000);
  const weeklyActive = Math.round(
    participants * (0.4 + between(s, 0, 30) / 100),
  );

  const subScores: SubScore[] = useMemo(
    () => [
      {
        label: "Recovery",
        icon: "battery-charging",
        color: "#30D158",
        score: between(
          s ^ 1,
          Math.round(score * 0.85),
          Math.round(score * 1.08),
        ),
        change: between(s ^ 2, -3, 5),
      },
      {
        label: "Biomarkers",
        icon: "pulse",
        color: "#3AABF0",
        score: between(
          s ^ 3,
          Math.round(score * 0.82),
          Math.round(score * 1.1),
        ),
        change: between(s ^ 4, -4, 6),
      },
      {
        label: "Lifestyle",
        icon: "sunny",
        color: "#FFD60A",
        score: between(
          s ^ 5,
          Math.round(score * 0.8),
          Math.round(score * 1.05),
        ),
        change: between(s ^ 6, -5, 4),
      },
      {
        label: "Sleep",
        icon: "moon",
        color: "#BF5AF2",
        score: between(
          s ^ 7,
          Math.round(score * 0.78),
          Math.round(score * 1.06),
        ),
        change: between(s ^ 8, -3, 7),
      },
      {
        label: "Nutrition",
        icon: "nutrition",
        color: "#FF9F0A",
        score: between(
          s ^ 9,
          Math.round(score * 0.81),
          Math.round(score * 1.07),
        ),
        change: between(s ^ 10, -2, 5),
      },
    ],
    [code],
  );

  const monthlyData = useMemo(() => {
    const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    let v = score - between(s ^ 11, 2, 8);
    return months.map((m) => {
      v = Math.min(100, v + between(seed(code + m), -1, 3));
      return { month: m, value: parseFloat(v.toFixed(1)) };
    });
  }, [code, score]);

  const maxBar = Math.max(...monthlyData.map((d) => d.value));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {flag} {name}
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Hero score card */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroFlag}>{flag}</Text>
            <View>
              <Text style={styles.heroRank}>#{rank} Worldwide</Text>
              <Text style={styles.heroCountry}>{name}</Text>
              <View style={styles.heroMeta}>
                <Ionicons name="people" size={13} color="#8E8E93" />
                <Text style={styles.heroMetaText}>
                  {participants.toLocaleString()} participants
                </Text>
                <Text style={styles.heroDot}>·</Text>
                <Text style={styles.heroMetaText}>
                  {weeklyActive.toLocaleString()} active this week
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.heroScoreBox}>
            <Text style={styles.heroScore}>{score.toFixed(1)}</Text>
            <View
              style={[
                styles.deltaBadge,
                delta > 0
                  ? styles.deltaUp
                  : delta < 0
                    ? styles.deltaDown
                    : styles.deltaFlat,
              ]}
            >
              {delta !== 0 && (
                <Ionicons
                  name={delta > 0 ? "arrow-up" : "arrow-down"}
                  size={10}
                  color={delta > 0 ? "#34C759" : "#FF453A"}
                />
              )}
              <Text
                style={[
                  styles.deltaText,
                  {
                    color:
                      delta > 0 ? "#34C759" : delta < 0 ? "#FF453A" : "#8E8E93",
                  },
                ]}
              >
                {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Sub-scores */}
        <Text style={styles.sectionLabel}>HEALTH SCORES</Text>
        <View style={styles.card}>
          {subScores.map((item, i) => (
            <View
              key={item.label}
              style={[styles.row, i === subScores.length - 1 && styles.lastRow]}
            >
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: item.color + "22" },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={item.color}
                />
              </View>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(item.score, 100)}%`,
                      backgroundColor: item.color + "AA",
                    },
                  ]}
                />
              </View>
              <Text style={[styles.rowScore, { color: item.color }]}>
                {item.score}
              </Text>
              <View style={styles.changeChip}>
                {item.change !== 0 && (
                  <Ionicons
                    name={item.change > 0 ? "arrow-up" : "arrow-down"}
                    size={9}
                    color={item.change > 0 ? "#34C759" : "#FF453A"}
                  />
                )}
                <Text
                  style={[
                    styles.changeText,
                    {
                      color:
                        item.change > 0
                          ? "#34C759"
                          : item.change < 0
                            ? "#FF453A"
                            : "#8E8E93",
                    },
                  ]}
                >
                  {item.change > 0
                    ? `+${item.change}`
                    : item.change === 0
                      ? "—"
                      : item.change}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 6-month trend chart */}
        <Text style={styles.sectionLabel}>6-MONTH TREND</Text>
        <View style={[styles.card, styles.chartCard]}>
          <View style={styles.chartBars}>
            {monthlyData.map((d) => (
              <View key={d.month} style={styles.chartColumn}>
                <Text style={styles.chartValue}>{d.value}</Text>
                <View style={styles.chartBarWrapper}>
                  <View
                    style={[
                      styles.chartBar,
                      { height: `${(d.value / maxBar) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.chartMonth}>{d.month}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats row */}
        <Text style={styles.sectionLabel}>COMMUNITY STATS</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons
              name="people"
              size={20}
              color="#3AABF0"
              style={{ marginBottom: 6 }}
            />
            <Text style={styles.statValue}>
              {participants.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Participants</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons
              name="flame"
              size={20}
              color="#FF9F0A"
              style={{ marginBottom: 6 }}
            />
            <Text style={styles.statValue}>
              {weeklyActive.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Active / week</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons
              name="trending-up"
              size={20}
              color="#30D158"
              style={{ marginBottom: 6 }}
            />
            <Text style={styles.statValue}>
              {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "–"}
            </Text>
            <Text style={styles.statLabel}>Rank change</Text>
          </View>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
};

export default CountryDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: { width: 36, padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#FFFFFF" },
  scroll: { flex: 1 },

  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  heroLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  heroFlag: { fontSize: 40 },
  heroRank: {
    fontSize: 11,
    fontWeight: "700",
    color: "#30D158",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  heroCountry: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  heroMetaText: { fontSize: 11, color: "#8E8E93" },
  heroDot: { color: "#3A3A3C", fontSize: 11 },
  heroScoreBox: { alignItems: "center" },
  heroScore: { fontSize: 36, fontWeight: "900", color: "#FFD60A" },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  deltaUp: { backgroundColor: "rgba(52,199,89,0.15)" },
  deltaDown: { backgroundColor: "rgba(255,69,58,0.15)" },
  deltaFlat: { backgroundColor: "#2C2C2E" },
  deltaText: { fontSize: 12, fontWeight: "700" },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  lastRow: { borderBottomWidth: 0 },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  rowLabel: { fontSize: 14, fontWeight: "600", color: "#FFFFFF", width: 80 },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "#2C2C2E",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 3 },
  rowScore: { fontSize: 14, fontWeight: "700", width: 28, textAlign: "right" },
  changeChip: { flexDirection: "row", alignItems: "center", gap: 2, width: 30 },
  changeText: { fontSize: 11, fontWeight: "600" },

  chartCard: { padding: 16 },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 100,
    gap: 8,
  },
  chartColumn: { flex: 1, alignItems: "center" },
  chartValue: { fontSize: 9, color: "#8E8E93", marginBottom: 4 },
  chartBarWrapper: { width: "100%", height: 64, justifyContent: "flex-end" },
  chartBar: { width: "100%", backgroundColor: "#30D15860", borderRadius: 4 },
  chartMonth: { fontSize: 11, color: "#8E8E93", marginTop: 6 },

  statsRow: { flexDirection: "row", gap: 12, marginHorizontal: 20 },
  statCard: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "500",
    textAlign: "center",
  },
});
