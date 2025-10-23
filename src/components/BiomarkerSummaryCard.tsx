import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import RadialSegments from './RadialSegments';
import { colors } from '../theme/colors';
import { buildSegments } from '../utils/segments';
import type { BiomarkerSummaryProps } from '../types/biomarkers';

export default function BiomarkerSummaryCard({
  total,
  buckets,
  onUpload,
  onFilterChange,
  initialFilter = 'all',
  a11yLabel = 'Biomarker Summary',
}: BiomarkerSummaryProps) {
  const [filter, setFilter] = useState<typeof initialFilter>(initialFilter);

  const segs = useMemo(
    () =>
      buildSegments(total, [
        { key: 'optimal', value: buckets.optimal, color: colors.optimal },
        { key: 'sufficient', value: buckets.sufficient, color: colors.sufficient },
        { key: 'out', value: buckets.out, color: colors.out },
      ]),
    [total, buckets],
  );

  const legendItem = (label: string, value: number, color: string, key: keyof typeof buckets) => (
    <Pressable
      onPress={() => {
        const next = filter === key ? 'all' : key;
        setFilter(next);
        onFilterChange?.(next);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={[
        styles.legendItem,
        { opacity: filter === 'all' || filter === key ? 1 : 0.5 }
      ]}
    >
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
      <Text style={styles.legendValue}>{value}</Text>
    </Pressable>
  );

  return (
    <View
      accessible
      accessibilityLabel={a11yLabel}
      style={styles.card}
    >
      <Text style={styles.title}>Biomarker Summary</Text>
      <Text style={styles.subtitle}>Your health biomarkers at a glance</Text>

      <View style={styles.content}>
        <View style={styles.dialContainer}>
          <RadialSegments
            size={220}
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
          {legendItem('Optimal', buckets.optimal, colors.optimal, 'optimal')}
          {legendItem('Sufficient', buckets.sufficient, colors.sufficient, 'sufficient')}
          {legendItem('Out of Range', buckets.out, colors.out, 'out')}

          <Pressable
            onPress={onUpload}
            accessibilityRole="button"
            accessibilityLabel="Upload Lab Results"
            style={styles.uploadButton}
          >
            <Text style={styles.uploadButtonText}>Upload Lab Results</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderColor: colors.divider,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dialContainer: {
    position: 'relative',
    marginRight: 24,
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  centerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    letterSpacing: 1,
  },
  legend: {
    flex: 1,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  legendValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  uploadButton: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ctaText,
  },
});
