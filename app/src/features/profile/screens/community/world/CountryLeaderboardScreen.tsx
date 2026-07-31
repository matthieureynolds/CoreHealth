import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ProfileTabParamList } from "@shared/types";
import { colors } from "@shared/theme/colors";

type Nav = StackNavigationProp<ProfileTabParamList, "CountryLeaderboard">;

const SF_FONT =
  Platform.select({ ios: "SF Pro Text", android: "System" }) ?? "System";

// ─── Category definitions ────────────────────────────────────────────────────

type Category = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  subLabel: string;
  unit: string;
};

const CATEGORIES: Category[] = [
  {
    id: "overall",
    label: "Overall",
    emoji: "🏆",
    color: "#FFD60A",
    subLabel: "Health Index",
    unit: "",
  },
  {
    id: "sleep",
    label: "Sleep",
    emoji: "😴",
    color: "#5E5CE6",
    subLabel: "Sleep Quality",
    unit: "hrs",
  },
  {
    id: "cardio",
    label: "Cardio",
    emoji: "❤️",
    color: "#FF453A",
    subLabel: "Heart Health",
    unit: "bpm",
  },
  {
    id: "mind",
    label: "Mind",
    emoji: "🧠",
    color: "#30D158",
    subLabel: "Mental Wellness",
    unit: "",
  },
  {
    id: "fitness",
    label: "Fitness",
    emoji: "💪",
    color: "#FF9F0A",
    subLabel: "Physical Activity",
    unit: "k/day",
  },
  {
    id: "nutrition",
    label: "Nutrition",
    emoji: "🥗",
    color: "#32D74B",
    subLabel: "Diet Quality",
    unit: "",
  },
  {
    id: "longevity",
    label: "Longevity",
    emoji: "🧬",
    color: "#BF5AF2",
    subLabel: "Lifespan Index",
    unit: "yrs",
  },
  {
    id: "zen",
    label: "Zen",
    emoji: "🧘",
    color: "#64D2FF",
    subLabel: "Stress & Calm",
    unit: "",
  },
  {
    id: "recovery",
    label: "Recovery",
    emoji: "⚡",
    color: "#FFD60A",
    subLabel: "Recovery Rate",
    unit: "%",
  },
  {
    id: "vitality",
    label: "Vitality",
    emoji: "🌿",
    color: "#4CD964",
    subLabel: "Energy Index",
    unit: "",
  },
];

// ─── Country data ────────────────────────────────────────────────────────────

const FLAG_CODES: Record<string, string> = {
  Japan: "JP",
  Switzerland: "CH",
  Singapore: "SG",
  Spain: "ES",
  "South Korea": "KR",
  Italy: "IT",
  Sweden: "SE",
  Norway: "NO",
  Australia: "AU",
  Iceland: "IS",
  Denmark: "DK",
  Finland: "FI",
  Netherlands: "NL",
  Austria: "AT",
  "New Zealand": "NZ",
  France: "FR",
  Germany: "DE",
  Canada: "CA",
  Ireland: "IE",
  Israel: "IL",
  Portugal: "PT",
  Belgium: "BE",
  Greece: "GR",
  Luxembourg: "LU",
  Malta: "MT",
  Slovenia: "SI",
  "United Kingdom": "GB",
  "United States": "US",
  "Costa Rica": "CR",
  Qatar: "QA",
  Chile: "CL",
  China: "CN",
  Thailand: "TH",
  Brazil: "BR",
  India: "IN",
  "Japan (Okinawa)": "JP",
  Bhutan: "BT",
  Cyprus: "CY",
  Croatia: "HR",
  Taiwan: "TW",
  Estonia: "EE",
  "Czech Republic": "CZ",
  Poland: "PL",
  Uruguay: "UY",
  Colombia: "CO",
  Vietnam: "VN",
  Indonesia: "ID",
  Turkey: "TR",
};

const flagEmoji = (code: string) => {
  const up = code.toUpperCase();
  const base = 0x1f1e6;
  return String.fromCodePoint(
    up.charCodeAt(0) - 65 + base,
    up.charCodeAt(1) - 65 + base,
  );
};

// Seeded pseudo-random so order is deterministic per category
const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
};

type CountryRow = { name: string; flag: string; score: number; delta: number };

const BASE_RANKING: CountryRow[] = [
  { name: "Japan", flag: flagEmoji("JP"), score: 84.4, delta: 1 },
  { name: "Switzerland", flag: flagEmoji("CH"), score: 83.7, delta: 0 },
  { name: "Singapore", flag: flagEmoji("SG"), score: 83.5, delta: -1 },
  { name: "Spain", flag: flagEmoji("ES"), score: 83.5, delta: 1 },
  { name: "South Korea", flag: flagEmoji("KR"), score: 83.2, delta: 0 },
  { name: "Italy", flag: flagEmoji("IT"), score: 83.2, delta: -1 },
  { name: "Sweden", flag: flagEmoji("SE"), score: 83.0, delta: 1 },
  { name: "Norway", flag: flagEmoji("NO"), score: 82.9, delta: 0 },
  { name: "Australia", flag: flagEmoji("AU"), score: 82.9, delta: -1 },
  { name: "Iceland", flag: flagEmoji("IS"), score: 82.6, delta: 1 },
  { name: "Denmark", flag: flagEmoji("DK"), score: 81.2, delta: 0 },
  { name: "Finland", flag: flagEmoji("FI"), score: 81.8, delta: 1 },
  { name: "Netherlands", flag: flagEmoji("NL"), score: 82.0, delta: -1 },
  { name: "Austria", flag: flagEmoji("AT"), score: 81.8, delta: 0 },
  { name: "New Zealand", flag: flagEmoji("NZ"), score: 81.7, delta: 1 },
  { name: "France", flag: flagEmoji("FR"), score: 82.6, delta: 0 },
  { name: "Germany", flag: flagEmoji("DE"), score: 81.0, delta: -1 },
  { name: "Canada", flag: flagEmoji("CA"), score: 82.0, delta: 1 },
  { name: "Ireland", flag: flagEmoji("IE"), score: 82.3, delta: 0 },
  { name: "Israel", flag: flagEmoji("IL"), score: 82.8, delta: -1 },
  { name: "Portugal", flag: flagEmoji("PT"), score: 80.9, delta: 1 },
  { name: "Belgium", flag: flagEmoji("BE"), score: 81.7, delta: 0 },
  { name: "Greece", flag: flagEmoji("GR"), score: 81.9, delta: -1 },
  { name: "Luxembourg", flag: flagEmoji("LU"), score: 82.4, delta: 1 },
  { name: "Malta", flag: flagEmoji("MT"), score: 82.6, delta: 0 },
  { name: "Slovenia", flag: flagEmoji("SI"), score: 81.3, delta: -1 },
  { name: "United Kingdom", flag: flagEmoji("GB"), score: 81.2, delta: 1 },
  { name: "United States", flag: flagEmoji("US"), score: 78.5, delta: 0 },
  { name: "Costa Rica", flag: flagEmoji("CR"), score: 80.2, delta: -1 },
  { name: "Qatar", flag: flagEmoji("QA"), score: 80.1, delta: 1 },
  { name: "Chile", flag: flagEmoji("CL"), score: 80.0, delta: 0 },
  { name: "China", flag: flagEmoji("CN"), score: 77.1, delta: -1 },
  { name: "Thailand", flag: flagEmoji("TH"), score: 76.0, delta: 1 },
  { name: "Brazil", flag: flagEmoji("BR"), score: 75.9, delta: 0 },
  { name: "India", flag: flagEmoji("IN"), score: 70.4, delta: -1 },
];

const CATEGORY_RANKINGS: Record<string, CountryRow[]> = (() => {
  const result: Record<string, CountryRow[]> = {};
  CATEGORIES.forEach((cat, ci) => {
    const rng = seededRandom(ci * 997 + 42);
    const shuffled = [...BASE_RANKING]
      .map((c) => ({
        ...c,
        score: parseFloat((c.score * (0.88 + rng() * 0.24)).toFixed(1)),
        delta: Math.floor(rng() * 3) - 1,
      }))
      .sort((a, b) => b.score - a.score);
    result[cat.id] = shuffled;
  });
  return result;
})();

// ─── Component ────────────────────────────────────────────────────────────────

const CountryLeaderboardScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [activeCatId, setActiveCatId] = useState("overall");
  const [joinedCountry, setJoinedCountry] = useState(false);

  const activeCat = CATEGORIES.find((c) => c.id === activeCatId)!;
  const ranking = CATEGORY_RANKINGS[activeCatId];
  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>World Rankings</Text>
          <Text style={[styles.headerSub, { color: activeCat.color }]}>
            {activeCat.subLabel}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.joinBtn, joinedCountry && styles.joinedBtn]}
          onPress={() => setJoinedCountry((p) => !p)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text
            style={[styles.joinBtnText, joinedCountry && styles.joinedBtnText]}
          >
            {joinedCountry ? "✓ Joined" : "Join"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScrollContent}
          style={styles.catScroll}
        >
          {CATEGORIES.map((cat) => {
            const active = cat.id === activeCatId;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catBtn,
                  active && {
                    borderColor: cat.color,
                    backgroundColor: `${cat.color}18`,
                  },
                ]}
                onPress={() => setActiveCatId(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catLabel, active && { color: cat.color }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Podium — top 3 */}
        <View style={styles.podiumRow}>
          {/* #2 */}
          <PodiumCard
            country={top3[1]}
            rank={2}
            color={activeCat.color}
            size="small"
          />
          {/* #1 */}
          <PodiumCard
            country={top3[0]}
            rank={1}
            color={activeCat.color}
            size="large"
          />
          {/* #3 */}
          <PodiumCard
            country={top3[2]}
            rank={3}
            color={activeCat.color}
            size="small"
          />
        </View>

        {/* Rest of rankings */}
        <View style={styles.listSection}>
          <Text style={styles.listHeader}>ALL COUNTRIES</Text>
          {rest.map((c, i) => (
            <RankRow
              key={c.name}
              country={c}
              rank={i + 4}
              color={activeCat.color}
            />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ─── Podium Card ──────────────────────────────────────────────────────────────

const MEDAL = ["", "🥇", "🥈", "🥉"];
const MEDAL_COLOR = ["", "#FFD60A", "#C0C0C0", "#CD7F32"];

type PodiumProps = {
  country: CountryRow;
  rank: 1 | 2 | 3;
  color: string;
  size: "large" | "small";
};

const PodiumCard: React.FC<PodiumProps> = ({ country, rank, color, size }) => {
  const isFirst = rank === 1;
  return (
    <View
      style={[
        styles.podiumCard,
        isFirst && styles.podiumCardFirst,
        { borderColor: isFirst ? color : "transparent" },
      ]}
    >
      {isFirst && <View style={[styles.podiumGlow, { shadowColor: color }]} />}
      <Text style={styles.podiumMedal}>{MEDAL[rank]}</Text>
      <Text style={styles.podiumFlag}>{country.flag}</Text>
      <Text
        style={[styles.podiumName, isFirst && styles.podiumNameFirst]}
        numberOfLines={1}
      >
        {country.name}
      </Text>
      <Text
        style={[
          styles.podiumScore,
          { color: isFirst ? color : MEDAL_COLOR[rank] },
        ]}
      >
        {country.score.toFixed(1)}
      </Text>
      {/* Podium base bar */}
      <View
        style={[
          styles.podiumBase,
          {
            height: isFirst ? 36 : rank === 2 ? 26 : 18,
            backgroundColor: isFirst ? color : MEDAL_COLOR[rank],
          },
        ]}
      >
        <Text style={styles.podiumRankLabel}>#{rank}</Text>
      </View>
    </View>
  );
};

// ─── Rank Row ─────────────────────────────────────────────────────────────────

type RowProps = { country: CountryRow; rank: number; color: string };

const RankRow: React.FC<RowProps> = ({ country, rank, color }) => (
  <View style={styles.rankRow}>
    <Text style={styles.rankNum}>#{rank}</Text>
    <Text style={styles.rankFlag}>{country.flag}</Text>
    <Text style={styles.rankName} numberOfLines={1}>
      {country.name}
    </Text>
    <DeltaIndicator delta={country.delta} />
    <Text style={[styles.rankScore, { color }]}>
      {country.score.toFixed(1)}
    </Text>
  </View>
);

// ─── Delta ────────────────────────────────────────────────────────────────────

const DeltaIndicator: React.FC<{ delta: number }> = ({ delta }) => {
  if (delta === 0) return <View style={styles.deltaFlat} />;
  return (
    <View
      style={[styles.deltaChip, delta > 0 ? styles.deltaUp : styles.deltaDown]}
    >
      <Ionicons
        name={delta > 0 ? "arrow-up" : "arrow-down"}
        size={9}
        color={delta > 0 ? "#34C759" : "#FF453A"}
      />
    </View>
  );
};

export default CountryLeaderboardScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: SF_FONT,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 1,
    fontFamily: SF_FONT,
  },
  joinBtn: {
    backgroundColor: colors.cta,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  joinBtnText: {
    color: colors.ctaText,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: SF_FONT,
  },
  joinedBtn: { backgroundColor: colors.surfaceMuted },
  joinedBtnText: { color: colors.textSecondary },

  // Category selector
  catScroll: { marginBottom: 4 },
  catScrollContent: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  catBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    backgroundColor: "#1C1C1E",
  },
  catEmoji: { fontSize: 14 },
  catLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: SF_FONT,
  },

  // Podium
  podiumRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 8,
  },
  podiumCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    paddingTop: 12,
    paddingHorizontal: 6,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  podiumCardFirst: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  podiumGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  podiumMedal: { fontSize: 22, marginBottom: 2 },
  podiumFlag: { fontSize: 28, marginBottom: 4 },
  podiumName: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: SF_FONT,
    marginBottom: 3,
  },
  podiumNameFirst: { color: colors.textPrimary, fontSize: 12 },
  podiumScore: {
    fontSize: 16,
    fontWeight: "800",
    fontFamily: SF_FONT,
    marginBottom: 8,
  },
  podiumBase: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  podiumRankLabel: {
    color: "#000",
    fontSize: 11,
    fontWeight: "800",
    fontFamily: SF_FONT,
  },

  // List
  listSection: { paddingHorizontal: 20 },
  listHeader: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    fontFamily: SF_FONT,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  rankNum: {
    color: colors.textSecondary,
    width: 36,
    fontSize: 13,
    fontFamily: SF_FONT,
  },
  rankFlag: { width: 26, textAlign: "center", fontSize: 18 },
  rankName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    fontFamily: SF_FONT,
  },
  rankScore: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: SF_FONT,
    marginLeft: 6,
    minWidth: 40,
    textAlign: "right",
  },

  // Delta
  deltaChip: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  deltaUp: { backgroundColor: "rgba(52,199,89,0.15)" },
  deltaDown: { backgroundColor: "rgba(255,69,58,0.15)" },
  deltaFlat: { width: 16, height: 16 },
});
