import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated, Easing } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';

type Route = RouteProp<RootStackParamList, 'ScoreDetail'>;
type Nav = StackNavigationProp<RootStackParamList, 'ScoreDetail'>;

const getMetricDescription = (id: 'recovery' | 'biomarkers' | 'lifestyle'): string => {
  switch (id) {
    case 'recovery':
      return "Recovery score measures your body's ability to recover from stress and physical activity. It's based on sleep quality, heart rate variability, and rest periods.";
    case 'biomarkers':
      return 'Biomarker score reflects the health of your internal systems based on lab results, including blood work, hormone levels, and other health indicators.';
    case 'lifestyle':
      return 'Lifestyle score evaluates your daily habits including physical activity, nutrition, stress management, and overall health behaviors.';
  }
};

const getMetricDetails = (id: 'recovery' | 'biomarkers' | 'lifestyle') => {
  switch (id) {
    case 'recovery':
      return [
        { title: 'Sleep Quality (40%)', desc: 'Sleep duration, consistency, and deep sleep cycles', icon: 'moon', color: '#9013FE' },
        { title: 'Heart Rate Variability (35%)', desc: 'Autonomic nervous system balance and recovery', icon: 'heart', color: '#FF3B30' },
        { title: 'Rest Periods (25%)', desc: 'Active recovery and stress management', icon: 'leaf', color: '#30D158' },
      ];
    case 'biomarkers':
      return [
        { title: 'Blood Work (40%)', desc: 'Complete blood count, metabolic panel, and lipids', icon: 'water', color: '#007AFF' },
        { title: 'Hormone Levels (35%)', desc: 'Thyroid, cortisol, testosterone, and other hormones', icon: 'flask', color: '#FF9F0A' },
        { title: 'Inflammation Markers (25%)', desc: 'CRP, ESR, and other inflammatory indicators', icon: 'thermometer', color: '#FF3B30' },
      ];
    case 'lifestyle':
      return [
        { title: 'Physical Activity (35%)', desc: 'Daily steps, exercise frequency, and intensity', icon: 'fitness', color: '#FF6B35' },
        { title: 'Nutrition (30%)', desc: 'Diet quality, hydration, and meal timing', icon: 'nutrition', color: '#30D158' },
        { title: 'Stress Management (20%)', desc: 'Mindfulness, relaxation, and work-life balance', icon: 'leaf', color: '#9013FE' },
        { title: 'Sleep Hygiene (15%)', desc: 'Bedtime routine and sleep environment', icon: 'moon', color: '#007AFF' },
      ];
  }
};

const SF_FONT = Platform.select({ ios: 'SF Pro Text', android: 'System' }) ?? 'System';

const ScoreDetailScreen: React.FC = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { id, title, value, color, icon, subtitle } = route.params;
  const [dayOffset, setDayOffset] = useState(0);
  const dayLabel = useMemo(() => {
    if (dayOffset === 0) return 'Today';
    if (dayOffset === -1) return 'Yesterday';
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }, [dayOffset]);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim]);

  const recoveryRows = useMemo(
    () => [
      { label: 'RHR before bed', score: Math.round(Math.max(50, value - 8)) },
      { label: 'HRV', score: Math.round(value) },
      { label: 'Sleep consistency', score: Math.round(Math.min(100, value + 4)) },
      { label: 'Deep sleep', score: Math.round(Math.max(40, value - 3)) },
      { label: 'REM sleep', score: Math.round(Math.min(100, value + 1)) },
    ],
    [value]
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
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
          <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.dayLabel}>{dayLabel}</Text>
        {dayOffset < 0 ? (
          <TouchableOpacity
            style={styles.dayArrow}
            onPress={() => setDayOffset((prev) => prev + 1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
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
                { borderColor: color, transform: [{ rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] },
              ]}
            />
            <View style={styles.scoreRingContent}>
              <Ionicons name={icon as any} size={22} color={color} />
              <Text style={[styles.scoreValue, { color }]}>{Math.round(value)}</Text>
              <Text style={styles.scoreLabel}>Recovery</Text>
            </View>
          </View>
          <Text style={styles.heroSubtitle}>Recovery summary</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Last 10 days</Text>
          <View style={styles.barChart}>
            {new Array(10).fill(0).map((_, idx) => {
              const dayScore = Math.max(40, Math.min(100, Math.round(value - 8 + idx)));
              return (
                <View key={`bar-${idx}`} style={styles.barCol}>
                  <View style={[styles.barFill, { height: Math.max(18, dayScore) }]} />
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
                <Text style={styles.metricRange}>Based on {dayLabel.toLowerCase()}</Text>
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
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerButton: { padding: 8, marginRight: 6 },
  headerRightSpacer: { width: 32 },
  headerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center', fontFamily: SF_FONT },
  content: { flex: 1 },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: SF_FONT,
  },
  heroCard: { marginHorizontal: 20, marginTop: 16, backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.divider },
  scoreRingWrap: {
    width: 150,
    height: 150,
    alignSelf: 'center',
  },
  scoreRingTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 6,
    borderColor: colors.cta,
  },
  scoreRingContent: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  scoreValue: { fontSize: 48, fontWeight: '700', marginTop: 4, fontFamily: SF_FONT },
  scoreLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4, fontFamily: SF_FONT },
  heroSubtitle: { marginTop: 12, textAlign: 'center', color: colors.textSecondary, fontSize: 12, fontFamily: SF_FONT },
  card: { marginHorizontal: 20, marginTop: 12, backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.divider },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', fontFamily: SF_FONT, marginBottom: 8 },
  metricRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  metricText: { flex: 1, marginRight: 10 },
  metricLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', fontFamily: SF_FONT },
  metricRange: { color: colors.textSecondary, fontSize: 11, marginTop: 2, fontFamily: SF_FONT },
  metricScore: { color: '#FFD60A', fontSize: 16, fontWeight: '700', fontFamily: SF_FONT },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 8, paddingBottom: 4 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barFill: { width: 14, borderRadius: 6, backgroundColor: colors.cta },
  barLabel: { color: colors.textSecondary, fontSize: 10, marginTop: 6, fontFamily: SF_FONT },
});

export default ScoreDetailScreen;





