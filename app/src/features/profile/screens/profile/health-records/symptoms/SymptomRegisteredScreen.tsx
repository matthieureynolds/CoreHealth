import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  TouchableOpacity,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SymptomEntry, SymptomStats } from "@shared/types/symptoms";
import { symptomService } from "@shared/services/user/symptomService";

type FilterType = "all" | "physical" | "mental";

const TABS = [
  {
    key: "all" as FilterType,
    label: "All",
    icon: "apps-outline",
    activeIcon: "apps",
    color: "#007AFF",
  },
  {
    key: "physical" as FilterType,
    label: "Physical",
    icon: "body-outline",
    activeIcon: "body",
    color: "#FF9500",
  },
  {
    key: "mental" as FilterType,
    label: "Mental",
    icon: "flower-outline",
    activeIcon: "flower",
    color: "#AF52DE",
  },
];

const FILTER_ORDER: FilterType[] = ["all", "physical", "mental"];
const PILL_PAD = 10;
const TAB_PAD = 8;
const INDICATOR = 56;

// ── Helpers ──────────────────────────────────────────────────────────────────

const getSeverityColor = (s: number) =>
  s <= 3 ? "#4CD964" : s <= 5 ? "#FFD93D" : s <= 7 ? "#FF9500" : "#FF3B30";
const getSeverityLabel = (s: number) =>
  s <= 2
    ? "Mild"
    : s <= 4
      ? "Moderate"
      : s <= 6
        ? "Notable"
        : s <= 8
          ? "Severe"
          : "Critical";

const formatRelativeTime = (ts: string): string => {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getDurationLabel = (d: string): string =>
  ({
    just_started: "Just started",
    "1_hour": "~1 hour",
    few_hours: "Few hours",
    all_day: "All day",
    multiple_days: "Multiple days",
  })[d] ?? d;

const groupByDate = (
  symptoms: SymptomEntry[],
): { title: string; data: SymptomEntry[] }[] => {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const groups: Record<string, SymptomEntry[]> = {};
  const order: string[] = [];
  for (const s of symptoms) {
    const ds = new Date(s.timestamp).toDateString();
    const label =
      ds === today
        ? "Today"
        : ds === yesterday
          ? "Yesterday"
          : new Date(s.timestamp).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
    if (!groups[label]) {
      groups[label] = [];
      order.push(label);
    }
    groups[label].push(s);
  }
  return order.map((title) => ({ title, data: groups[title] }));
};

// ── Component ─────────────────────────────────────────────────────────────────

const SymptomRegisteredScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [stats, setStats] = useState<SymptomStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  // Animated state
  const indicatorY = useRef(new Animated.Value(0)).current;
  const scale0 = useRef(new Animated.Value(1.12)).current;
  const scale1 = useRef(new Animated.Value(1.0)).current;
  const scale2 = useRef(new Animated.Value(1.0)).current;
  const scales = [scale0, scale1, scale2];
  const filterRef = useRef<FilterType>("all");

  // Measured Y of each tab top (relative to BlurView)
  const tabTops = useRef<number[]>([]);
  const measured = useRef(0);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  // Centre the indicator (56px) on the tab content area.
  // Tab onLayout gives the tab's top edge. Content starts at TAB_PAD inside.
  // Content height ≈ icon(22) + gap(4) + label(14) = 40. Indicator is 56.
  // Offset = TAB_PAD - (INDICATOR - 40) / 2 = 8 - 8 = 0
  const indicatorSnapY = (idx: number) => tabTops.current[idx] ?? idx * 70;

  const animScales = (activeIdx: number) => {
    scales.forEach((s, i) =>
      Animated.spring(s, {
        toValue: i === activeIdx ? 1.12 : 1.0,
        useNativeDriver: true,
        tension: 200,
        friction: 14,
      }).start(),
    );
  };

  // Spring indicator + scales to a tab. Called by both tap and drag-release.
  const springToTab = (idx: number) => {
    Animated.spring(indicatorY, {
      toValue: indicatorSnapY(idx),
      useNativeDriver: true,
      tension: 160,
      friction: 14,
    }).start();
    animScales(idx);
  };

  // Tap handler — called from TouchableOpacity on each tab
  const handleTap = (idx: number) => {
    setFilter(FILTER_ORDER[idx]);
    filterRef.current = FILTER_ORDER[idx];
    springToTab(idx);
  };

  // Nearest tab index from finger Y (uses measured icon centers)
  const nearestIdx = (fingerY: number): number => {
    const centers = tabTops.current.map((y) => (y ?? 0) + INDICATOR / 2);
    let best = 0;
    for (let i = 1; i < 3; i++) {
      if (Math.abs(fingerY - centers[i]) < Math.abs(fingerY - centers[best]))
        best = i;
    }
    return best;
  };

  // onLayout: measure each tab's Y position within BlurView
  const onTabLayout = (idx: number) => (e: any) => {
    tabTops.current[idx] = e.nativeEvent.layout.y;
    measured.current += 1;
    if (measured.current >= 3) {
      indicatorY.setValue(
        indicatorSnapY(FILTER_ORDER.indexOf(filterRef.current)),
      );
    }
  };

  // PanResponder — only captures MOVES (not taps).
  // onStartShouldSetPanResponder = false → taps pass through to TouchableOpacity children
  // onMoveShouldSetPanResponder = true → drags are captured for scrubbing
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (e) => {
        indicatorY.stopAnimation();
        const y = e.nativeEvent.locationY;
        const minY = indicatorSnapY(0);
        const maxY = indicatorSnapY(2);
        indicatorY.setValue(Math.min(maxY, Math.max(minY, y - INDICATOR / 2)));
        const idx = nearestIdx(y);
        setFilter(FILTER_ORDER[idx]);
        filterRef.current = FILTER_ORDER[idx];
        animScales(idx);
      },

      onPanResponderMove: (e) => {
        const y = e.nativeEvent.locationY;
        const minY = indicatorSnapY(0);
        const maxY = indicatorSnapY(2);
        indicatorY.setValue(Math.min(maxY, Math.max(minY, y - INDICATOR / 2)));
        const idx = nearestIdx(y);
        if (FILTER_ORDER[idx] !== filterRef.current) {
          setFilter(FILTER_ORDER[idx]);
          filterRef.current = FILTER_ORDER[idx];
          animScales(idx);
        }
      },

      onPanResponderRelease: () => {
        const idx = FILTER_ORDER.indexOf(filterRef.current);
        springToTab(idx);
      },
    }),
  ).current;

  // ── Data ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, st] = await Promise.all([
        symptomService.getSymptoms(),
        symptomService.getSymptomStats(),
      ]);
      setSymptoms(s);
      setStats(st);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Symptom", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await symptomService.deleteSymptom(id);
            await loadData();
          } catch {
            Alert.alert("Error", "Failed to delete symptom");
          }
        },
      },
    ]);
  };

  const filtered =
    filter === "all" ? symptoms : symptoms.filter((s) => s.type === filter);
  const grouped = useMemo(() => groupByDate(filtered), [filtered]);
  const weekCount = symptoms.filter(
    (s) => new Date(s.timestamp).getTime() > Date.now() - 7 * 86400000,
  ).length;
  const activeColor = TABS[FILTER_ORDER.indexOf(filter)].color;

  if (loading) {
    return (
      <View style={st.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={st.container}>
      {/* ── Header ── */}
      <View style={st.header} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={st.backBtn}
          hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={st.headerTitle} pointerEvents="none">
          Symptoms Tracked
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}
      >
        {stats && symptoms.length > 0 && (
          <View style={st.summaryCard}>
            <View style={st.summaryItem}>
              <Text style={st.summaryVal}>{weekCount}</Text>
              <Text style={st.summaryLbl}>This week</Text>
            </View>
            <View style={st.summaryDiv} />
            <View style={st.summaryItem}>
              <Text
                style={[
                  st.summaryVal,
                  { color: getSeverityColor(stats.averageSeverity) },
                ]}
              >
                {stats.averageSeverity.toFixed(1)}
              </Text>
              <Text style={st.summaryLbl}>Avg severity</Text>
            </View>
            <View style={st.summaryDiv} />
            <View style={st.summaryItem}>
              <Text style={[st.summaryVal, { fontSize: 15 }]} numberOfLines={1}>
                {stats.mostCommonSymptom || "—"}
              </Text>
              <Text style={st.summaryLbl}>Most common</Text>
            </View>
          </View>
        )}

        {grouped.length === 0 ? (
          <View style={st.empty}>
            <View style={st.emptyIcon}>
              <Ionicons name="pulse-outline" size={36} color="#8E8E93" />
            </View>
            <Text style={st.emptyTitle}>No symptoms logged</Text>
            <Text style={st.emptySub}>
              {
                "When you log symptoms from the home\nscreen, they'll appear here"
              }
            </Text>
          </View>
        ) : (
          grouped.map((group) => (
            <View key={group.title}>
              <Text style={st.dateHeader}>{group.title}</Text>
              {group.data.map((symptom) => (
                <TouchableOpacity
                  key={symptom.id}
                  style={st.card}
                  onLongPress={() => handleDelete(symptom.id)}
                  activeOpacity={0.7}
                >
                  <View style={st.cardRow}>
                    <View
                      style={[
                        st.dot,
                        { backgroundColor: getSeverityColor(symptom.severity) },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={st.cardTop}>
                        <Text style={st.cardName}>{symptom.category}</Text>
                        <Text
                          style={[
                            st.cardBadge,
                            { color: getSeverityColor(symptom.severity) },
                          ]}
                        >
                          {getSeverityLabel(symptom.severity)}
                        </Text>
                      </View>
                      <Text style={st.cardMeta}>
                        {formatRelativeTime(symptom.timestamp)}
                        {symptom.duration
                          ? ` · ${getDurationLabel(symptom.duration)}`
                          : ""}
                      </Text>
                      {symptom.factors && symptom.factors.length > 0 && (
                        <View style={st.factors}>
                          {symptom.factors.map((f) => (
                            <View key={f} style={st.factorPill}>
                              <Text style={st.factorTxt}>{f}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      {symptom.notes ? (
                        <Text style={st.notes} numberOfLines={1}>
                          {symptom.notes}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* ── Frosted vertical pill ── */}
      <View style={st.pillOuter}>
        <BlurView
          intensity={60}
          tint="dark"
          style={st.pillBlur}
          {...panResponder.panHandlers}
        >
          {/* Sliding indicator — left:0,right:0 auto-centers it, no manual left calc */}
          <Animated.View
            style={[
              st.indicator,
              {
                backgroundColor: activeColor + "28",
                borderColor: activeColor + "50",
                transform: [{ translateY: indicatorY }],
              },
            ]}
          />
          {/* Tabs — onLayout Y is relative to BlurView, matching panHandler coordinates */}
          {TABS.map((tab, idx) => {
            const active = filter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.7}
                onPress={() => handleTap(idx)}
                onLayout={onTabLayout(idx)}
              >
                <Animated.View
                  style={[st.pillTab, { transform: [{ scale: scales[idx] }] }]}
                >
                  <Ionicons
                    name={(active ? tab.activeIcon : tab.icon) as any}
                    size={22}
                    color={active ? tab.color : "#8E8E93"}
                  />
                  <Text style={[st.pillLbl, active && { color: tab.color }]}>
                    {tab.label}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: "#000",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 10,
  },
  backBtn: { padding: 8, width: 40 },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },

  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryVal: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },
  summaryLbl: { fontSize: 12, color: "#8E8E93", fontWeight: "500" },
  summaryDiv: { width: 1, backgroundColor: "#2C2C2E", marginVertical: 2 },

  dateHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    marginLeft: 24,
    marginBottom: 10,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: "#1C1C1E",
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
  },
  cardRow: { flexDirection: "row", alignItems: "flex-start" },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    marginRight: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardName: { fontSize: 16, fontWeight: "600", color: "#FFF" },
  cardBadge: { fontSize: 13, fontWeight: "600" },
  cardMeta: { fontSize: 13, color: "#8E8E93" },
  factors: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 },
  factorPill: {
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  factorTxt: { fontSize: 12, color: "#8E8E93", fontWeight: "500" },
  notes: { fontSize: 13, color: "#6E6E73", fontStyle: "italic", marginTop: 8 },

  empty: { alignItems: "center", paddingVertical: 80 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },

  // Pill
  pillOuter: { position: "absolute", top: 115, right: 16 },
  pillBlur: {
    borderRadius: 28,
    overflow: "hidden",
    paddingVertical: PILL_PAD,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.10)",
  },
  indicator: {
    position: "absolute",
    left: 6,
    right: 6,
    top: 0,
    height: INDICATOR,
    borderRadius: INDICATOR / 2,
    borderWidth: 1,
  },
  pillTab: {
    alignItems: "center",
    paddingVertical: TAB_PAD,
    paddingHorizontal: 8,
  },
  pillLbl: { fontSize: 10, fontWeight: "600", color: "#8E8E93", marginTop: 4 },
});

export default SymptomRegisteredScreen;
