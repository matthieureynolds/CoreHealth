import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { PanelPayload, PanelBiomarker } from "../../types";
import { getBiomarkerStatusColor } from "../../utils/biomarkerStatus";
import { LabResult } from "@features/home/recent-lab-results/results/types";
import baseStyles from "./BodyMapStyles";

interface BiomarkerDetailPanelProps {
  selectedOrganData: PanelPayload | null;
  panelAnim: Animated.Value;
  onClose: () => void;
}

const { width: W, height: H } = Dimensions.get("window");

const statusMap: Record<string, LabResult["status"]> = {
  optimal: "optimal",
  normal: "normal",
  borderline: "borderline",
  abnormal: "high",
};

// ─── Summary ring ──────────────────────────────────────────────────────────

const RING_SIZE = 120;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const SEGMENT_GAP = 4;

const SummaryRing: React.FC<{
  optimal: number;
  normal: number;
  outOfRange: number;
  total: number;
}> = ({ optimal, normal, outOfRange, total }) => {
  const segmentCount =
    (optimal > 0 ? 1 : 0) + (normal > 0 ? 1 : 0) + (outOfRange > 0 ? 1 : 0);
  const gap = segmentCount > 1 ? SEGMENT_GAP : 0;
  const totalGapLen = gap * segmentCount;
  const usable = RING_CIRCUMFERENCE - totalGapLen;

  const safeTotal = Math.max(total, 1);
  const optLen = (optimal / safeTotal) * usable;
  const normLen = (normal / safeTotal) * usable;
  const oorLen = (outOfRange / safeTotal) * usable;

  const segments: { color: string; len: number }[] = [];
  if (optimal > 0) segments.push({ color: "#30D158", len: optLen });
  if (normal > 0) segments.push({ color: "#FF9F0A", len: normLen });
  if (outOfRange > 0) segments.push({ color: "#FF3B30", len: oorLen });

  let offset = 0;

  return (
    <View style={ringStyles.container}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="#2C2C2E"
          strokeWidth={RING_STROKE}
          fill="none"
        />
        {segments.map((seg, i) => {
          const dashOffset = RING_CIRCUMFERENCE * 0.25 + offset;
          const el = (
            <Circle
              key={i}
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={seg.color}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeLinecap="butt"
              strokeDasharray={`${seg.len} ${RING_CIRCUMFERENCE - seg.len}`}
              strokeDashoffset={-dashOffset}
            />
          );
          offset += seg.len + gap;
          return el;
        })}
      </Svg>
      <View style={ringStyles.centerText}>
        <Text style={ringStyles.totalValue}>{total}</Text>
        <Text style={ringStyles.totalLabel}>biomarkers</Text>
      </View>
    </View>
  );
};

// ─── Summary page ──────────────────────────────────────────────────────────

const getOrganSummary = (
  name: string,
  optimal: number,
  total: number,
  outOfRange: number,
): string => {
  const organSummaries: Record<
    string,
    { good: string; mixed: string; bad: string }
  > = {
    Liver: {
      good: "All liver enzymes in optimal range. No inflammation, no stress — your liver is performing exactly as it should.",
      mixed:
        "Liver function is mostly healthy, but one or more enzymes are slightly elevated. Cut back on alcohol and processed foods.",
      bad: "Multiple liver markers are flagged. This needs medical attention — book a follow-up with your doctor.",
    },
    "Heart / Circulatory": {
      good: "Lipids, inflammation markers, and blood counts all looking strong. Your cardiovascular system is in excellent shape.",
      mixed:
        "Heart health is solid overall, but some lipid or inflammation markers need work. Diet and exercise will move the needle.",
      bad: "Several cardiovascular markers are out of range. This is your most important system — speak with your doctor.",
    },
    Kidneys: {
      good: "Kidneys are filtering efficiently. Electrolytes balanced, waste clearance on point — nothing to flag here.",
      mixed:
        "Kidney function is mostly normal, but some electrolytes are drifting. Hydration and diet adjustments can help.",
      bad: "Multiple kidney markers out of range. Don't ignore this — follow up with bloodwork and a medical review.",
    },
    "Lungs / Pulmonary": {
      good: "Lung capacity and oxygenation are both strong. Airways clear, breathing efficient — keep it up.",
      mixed:
        "Lung function is generally good, but there's room for improvement. Breathing exercises and cardio will help.",
      bad: "Lung markers need attention, especially if you're experiencing shortness of breath. Get a pulmonary check.",
    },
    "Small Intestine": {
      good: "Vitamins, minerals, and iron stores all well balanced. Your body is absorbing nutrients efficiently.",
      mixed:
        "Most nutrients look good, but you may be running low on one or two. Check the breakdown and consider supplementation.",
      bad: "Several nutrient markers are low. This could indicate a malabsorption issue — review your diet and test further.",
    },
    "Large Intestine": {
      good: "Gut health markers are solid. No signs of inflammation or digestive stress.",
      mixed:
        "Mostly healthy, but some markers suggest mild gut imbalance. More fibre and fermented foods can help.",
      bad: "Multiple gut markers flagged. Consider a GI consult to investigate further.",
    },
    Stomach: {
      good: "Digestive markers all healthy. No signs of irritation, infection, or acid imbalance.",
      mixed:
        "Digestion is mostly fine, but minor markers worth monitoring. Watch for symptoms.",
      bad: "Digestive markers are concerning. A gastroenterology review would be prudent.",
    },
    "Pancreas / Metabolic": {
      good: "Blood sugar regulation and insulin sensitivity are excellent. Metabolic health is dialled in.",
      mixed:
        "Metabolic function is okay, but early signs of insulin resistance are showing. Stay active and cut refined carbs.",
      bad: "Multiple metabolic markers outside range. This is a clear signal — prioritise lifestyle changes and medical review.",
    },
    Thyroid: {
      good: "Thyroid hormones are balanced and within optimal range. Energy and metabolism should feel right.",
      mixed:
        "Thyroid function is mostly normal, but one marker is drifting. Worth retesting in 3–6 months.",
      bad: "Thyroid markers are clearly off. Discuss medication or further testing with your endocrinologist.",
    },
    "Brain / Neurological": {
      good: "Stress hormones balanced, cognitive indicators healthy. Your nervous system is in good shape.",
      mixed:
        "Most neuro markers are fine, but cortisol suggests elevated stress. Prioritise sleep and recovery.",
      bad: "Neurological markers need attention. Chronic stress or hormonal imbalance may be at play — get assessed.",
    },
  };

  const summaries = organSummaries[name];
  if (!summaries) {
    if (outOfRange > 0)
      return "Some markers need attention. Swipe for the full breakdown and tap any biomarker for details.";
    if (optimal === total)
      return "Every biomarker in optimal range. Your health indicators look excellent across the board.";
    return "All markers within expected ranges. Swipe for the full breakdown.";
  }

  if (outOfRange >= total / 2) return summaries.bad;
  if (outOfRange > 0 || optimal < total / 2) return summaries.mixed;
  return summaries.good;
};

const SummaryPage: React.FC<{
  biomarkers: PanelBiomarker[];
  organName: string;
}> = ({ biomarkers, organName }) => {
  const total = biomarkers.length;
  const optimal = biomarkers.filter((b) => b.status === "optimal").length;
  const normal = biomarkers.filter((b) => b.status === "normal").length;
  const outOfRange = biomarkers.filter(
    (b) => b.status !== "optimal" && b.status !== "normal",
  ).length;

  const rows: { label: string; count: number; color: string; icon: string }[] =
    [
      {
        label: "Optimal",
        count: optimal,
        color: "#30D158",
        icon: "checkmark-circle",
      },
      {
        label: "Sufficient",
        count: normal,
        color: "#FF9F0A",
        icon: "remove-circle",
      },
      {
        label: "Out of Range",
        count: outOfRange,
        color: "#FF3B30",
        icon: "alert-circle",
      },
    ];

  const summary = getOrganSummary(organName, optimal, total, outOfRange);

  return (
    <View>
      <View style={s.summaryPage}>
        <SummaryRing
          optimal={optimal}
          normal={normal}
          outOfRange={outOfRange}
          total={total}
        />
        <View style={s.summaryBreakdown}>
          {rows.map((row, i) => (
            <View key={i} style={s.summaryRow}>
              <View style={s.summaryBadge}>
                <Ionicons name={row.icon as any} size={14} color={row.color} />
                <Text style={[s.summaryLabel, { color: row.color }]}>
                  {row.label}
                </Text>
              </View>
              <Text style={[s.summaryCount, { color: "#FFFFFF" }]}>
                {row.count}
              </Text>
            </View>
          ))}
          <Text style={s.lastUpdated}>
            Last updated:{" "}
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>
      <Text style={s.summaryText}>{summary}</Text>
    </View>
  );
};

// ─── Biomarker list page ───────────────────────────────────────────────────

const BiomarkerListPage: React.FC<{ biomarkers: PanelBiomarker[] }> = ({
  biomarkers,
}) => {
  const navigation = useNavigation<any>();

  return (
    <ScrollView showsVerticalScrollIndicator bounces>
      <View>
        {biomarkers.map((biomarker, index) => (
          <TouchableOpacity
            key={index}
            style={baseStyles.biomarkerItem}
            onPress={() => {
              const labResult: LabResult = {
                id: biomarker.name
                  .toLowerCase()
                  .replace(/\s+/g, "_")
                  .replace(/[^a-z0-9_]/g, ""),
                name: biomarker.name,
                value: biomarker.value,
                unit: biomarker.unit,
                trend: "stable",
                trendPercent: 0,
                status: statusMap[biomarker.status] ?? "normal",
                lastUpdated: new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              };
              navigation.navigate("LabResultDetail", { labResult });
            }}
          >
            <View style={baseStyles.biomarkerColumn1}>
              <Text style={baseStyles.biomarkerName}>{biomarker.name}</Text>
            </View>
            <View style={baseStyles.biomarkerColumn2}>
              <Text
                style={[
                  baseStyles.biomarkerValue,
                  {
                    color: getBiomarkerStatusColor(biomarker.status),
                    fontWeight: "bold",
                  },
                ]}
              >
                {biomarker.value} {biomarker.unit}
              </Text>
            </View>
            <View style={baseStyles.biomarkerColumn3}>
              <Text style={baseStyles.biomarkerRange}>({biomarker.range})</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

// ─── Page dots ─────────────────────────────────────────────────────────────

const PageDots: React.FC<{ count: number; active: number }> = ({
  count,
  active,
}) => (
  <View style={s.dots}>
    {Array.from({ length: count }).map((_, i) => (
      <View
        key={i}
        style={[s.dot, i === active ? s.dotActive : s.dotInactive]}
      />
    ))}
  </View>
);

// ─── Main panel ────────────────────────────────────────────────────────────

const BiomarkerDetailPanel: React.FC<BiomarkerDetailPanelProps> = ({
  selectedOrganData,
  panelAnim,
  onClose,
}) => {
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Reset to first page when organ changes
  const prevOrganRef = useRef<string | null>(null);
  if (
    selectedOrganData &&
    selectedOrganData.data.name !== prevOrganRef.current
  ) {
    prevOrganRef.current = selectedOrganData.data.name;
    if (activePage !== 0) setActivePage(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }

  if (!selectedOrganData) return null;
  const organ = selectedOrganData;

  const pageWidth = W;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const page = Math.round(x / pageWidth);
    if (page >= 0 && page <= 1 && page !== activePage) setActivePage(page);
  };

  return (
    <Animated.View
      style={[
        baseStyles.infoPanel,
        {
          transform: [
            {
              translateY: panelAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [H, 0],
              }),
            },
          ],
        },
      ]}
    >
      {/* Header */}
      <View style={baseStyles.panelHeader}>
        <View style={baseStyles.panelHeaderContent}>
          <Text style={baseStyles.panelTitle}>{organ.data.name}</Text>
          <Text style={baseStyles.panelSubtitle}>{organ.data.description}</Text>
        </View>
        <PageDots count={2} active={activePage} />
      </View>

      {/* Horizontal pager */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Page 1: Summary */}
        <View style={{ width: pageWidth }}>
          <SummaryPage
            biomarkers={organ.data.biomarkers}
            organName={organ.data.name}
          />
        </View>

        {/* Page 2: Biomarker list */}
        <View style={{ width: pageWidth, flex: 1 }}>
          <BiomarkerListPage biomarkers={organ.data.biomarkers} />
        </View>
      </ScrollView>
    </Animated.View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  summaryPage: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
    gap: 20,
  },
  summaryBreakdown: {
    flex: 1,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  summaryCount: {
    fontSize: 22,
    fontWeight: "700",
  },
  lastUpdated: {
    fontSize: 13,
    color: "#FFFFFF",
    marginTop: 4,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },
  dotInactive: {
    backgroundColor: "#48484A",
  },
});

const ringStyles = StyleSheet.create({
  container: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#30D158",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  centerText: {
    position: "absolute",
    alignItems: "center",
  },
  totalValue: {
    fontSize: 32,
    fontWeight: "300",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "400",
    color: "#8E8E93",
    marginTop: 1,
  },
});

export default BiomarkerDetailPanel;
