import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import RadialSegments from "../ui/RadialSegments";
import { palette } from "../../theme/colors";
import { buildSegments } from "../../utils/segments";
import type { BiomarkerSummaryProps } from "../../types/biomarkers";

export default function BiomarkerSummaryCard({
  total,
  buckets,
  onUpload,
  onFilterChange,
  initialFilter = "all",
  a11yLabel = "Biomarker Summary",
  style,
  hideTitle,
  dialSize,
  segmentCount,
}: BiomarkerSummaryProps) {
  const [filter, setFilter] = useState<typeof initialFilter>(initialFilter);

  const segs = useMemo(
    () =>
      buildSegments(
        total,
        [
          { key: "optimal", value: buckets.optimal, color: palette.optimal },
          {
            key: "sufficient",
            value: buckets.sufficient,
            color: palette.sufficient,
          },
          { key: "out", value: buckets.out, color: palette.out },
        ],
        segmentCount ?? total,
      ),
    [total, buckets],
  );

  // Ensure no stale filter selection when totals change
  useEffect(() => {
    setFilter("all");
  }, [total, buckets.optimal, buckets.sufficient, buckets.out]);

  const legendItem = (
    label: string,
    value: number,
    color: string,
    key: keyof typeof buckets,
  ) => (
    <Pressable
      onPress={() => {
        const next = filter === key ? "all" : key;
        setFilter(next);
        onFilterChange?.(next);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={[
        styles.legendRow,
        { opacity: filter === "all" || filter === key ? 1 : 0.5 },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
        <View style={[styles.badgeDot, { backgroundColor: color }]} />
        <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
      </View>
      <Text style={styles.legendValue}>{value}</Text>
    </Pressable>
  );

  return (
    <View
      accessible
      accessibilityLabel={a11yLabel}
      style={[styles.card, style]}
    >
      {!hideTitle && <Text style={styles.title}>Biomarker Summary</Text>}

      <View style={styles.content}>
        <View style={styles.dialContainer}>
          <RadialSegments
            size={dialSize ?? 220}
            stroke={14}
            segments={segs}
            filter={filter as any}
          />
          <View style={styles.centerContent}>
            <Text style={styles.centerNumber}>{total}</Text>
            <Text style={styles.centerLabel}>BIOMARKERS</Text>
          </View>
        </View>

        <View style={styles.legend}>
          {legendItem("Optimal", buckets.optimal, palette.optimal, "optimal")}
          {legendItem(
            "Sufficient",
            buckets.sufficient,
            palette.sufficient,
            "sufficient",
          )}
          {legendItem("Out of Range", buckets.out, palette.out, "out")}

          {onUpload && (
            <Pressable
              onPress={onUpload}
              accessibilityRole="button"
              accessibilityLabel="Upload Lab Results"
              style={styles.uploadButton}
            >
              <Text style={styles.uploadButtonText}>Upload Lab Results</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: palette.card,
    borderColor: palette.divider,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 18, // match Recent Lab Results
    fontWeight: "600",
    color: palette.textPrimary,
    marginBottom: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  dialContainer: {
    position: "relative",
    marginRight: 16,
  },
  centerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  centerNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: palette.textPrimary,
  },
  centerLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    marginTop: 4,
    letterSpacing: 1,
  },
  legend: {
    flex: 1,
    gap: 14,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  badgeLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  legendValue: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  uploadButton: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: palette.cta,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.ctaText,
  },
});
