import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { useHealthData } from '../../../shared/context/HealthDataContext';
import { deriveDashboardScores } from './utils';
import {
  Period, PERIOD_LABELS, PERIOD_DEFAULT_INDEX, PERIOD_COMPARISON,
} from '../health-metrics/detail/ringConfig';

const { width: W } = Dimensions.get('window');
const ACCENT = '#FFD60A';

// ─── Overall score trend data ────────────────────────────────────────────────

const OVERALL_SCORES: Record<Period, number[]> = {
  day:   [72, 78, 75, 82, 80, 74, 77],
  week:  [74, 76, 78, 77],
  month: [68, 70, 71, 73, 74, 76, 77, 75, 76, 77, 77, 77],
  year:  [65, 68, 71, 74, 77],
};

// ─── Biological age (placeholder formula) ────────────────────────────────────
// Production: use PhenoAge formula from blood markers.

function bioAgeDelta(score: number): number {
  return Math.round((score - 55) * 0.2);
}
function agingPace(score: number): number {
  return Math.max(0.5, +(1 - (score - 55) * 0.006).toFixed(2));
}

// ─── Static insights (will be derived from real markers in production) ────────

const STRENGTHS = [
  { icon: 'flask-outline',       label: 'HbA1c',            value: '5.1%',    note: 'Optimal metabolic health' },
  { icon: 'speedometer-outline', label: 'Blood Pressure',   value: '118/76',  note: 'Optimal vascular health' },
  { icon: 'time-outline',        label: 'Sleep Consistency', value: '87%',    note: 'Strong circadian rhythm' },
];

const GAPS = [
  { icon: 'pulse-outline', label: 'ApoB',      value: '70 mg/dL', note: 'Target <55 for optimal' },
  { icon: 'sunny-outline', label: 'Vitamin D', value: '35 ng/mL', note: 'Target 55–80 ng/mL' },
  { icon: 'heart-outline', label: 'HRV',       value: '58 ms',    note: 'Room to improve' },
];

// ─── Period selector ─────────────────────────────────────────────────────────

const PERIOD_PILLS: { key: Period; label: string }[] = [
  { key: 'day',   label: 'D' },
  { key: 'week',  label: 'W' },
  { key: 'month', label: 'M' },
  { key: 'year',  label: 'Y' },
];

const PeriodSelector: React.FC<{ period: Period; onChange: (p: Period) => void }> = ({ period, onChange }) => (
  <View style={styles.periodRow}>
    {PERIOD_PILLS.map(({ key, label }) => {
      const active = key === period;
      return (
        <TouchableOpacity
          key={key}
          style={[styles.periodPill, active && { backgroundColor: `${ACCENT}22`, borderColor: ACCENT }]}
          onPress={() => onChange(key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.periodPillLabel, active && { color: ACCENT }]}>{label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── Mini ring ────────────────────────────────────────────────────────────────

const MiniRing: React.FC<{ score: number; selected: boolean }> = ({ score, selected }) => {
  const size = selected ? 46 : 38;
  const stroke = selected ? 4 : 3;
  const r = (size - stroke) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (score / 100) * circ;
  return (
    <Svg width={size} height={size}>
      <Circle stroke="#2C2C2E" fill="none" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
      <Circle
        stroke={selected ? ACCENT : `${ACCENT}55`} fill="none"
        cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
        strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <SvgText x={size / 2} y={size / 2 + 4} textAnchor="middle"
        fill={selected ? '#FFFFFF' : '#8E8E93'}
        fontSize={selected ? 12 : 10} fontWeight={selected ? '700' : '400'}>
        {score}
      </SvgText>
    </Svg>
  );
};

// ─── Period ring selector ────────────────────────────────────────────────────

const PeriodRingSelector: React.FC<{
  scores: number[]; labels: string[]; selected: number; onSelect: (i: number) => void;
}> = ({ scores, labels, selected, onSelect }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ringSelectorContent}>
    {scores.map((score, i) => (
      <TouchableOpacity key={i} style={styles.ringItem} onPress={() => onSelect(i)} activeOpacity={0.7}>
        <MiniRing score={score} selected={i === selected} />
        <Text style={[styles.ringLabel, i === selected && { color: '#FFFFFF', fontWeight: '600' }]}>{labels[i]}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// ─── Hero ring ────────────────────────────────────────────────────────────────

const HeroRing: React.FC<{ score: number }> = ({ score }) => {
  const size = 160; const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (score / 100) * circ;
  const label = score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : 'Developing';
  return (
    <View style={styles.heroRingWrap}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle stroke="#1C1C1E" fill="none" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <Circle stroke={ACCENT} fill="none" cx={size / 2} cy={size / 2} r={r}
          strokeWidth={stroke} strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <Text style={styles.heroScore}>{score}</Text>
      <View style={styles.heroBadge}>
        <Text style={styles.heroBadgeText}>{label}</Text>
      </View>
    </View>
  );
};

// ─── Biological age card ──────────────────────────────────────────────────────

const BioAgeCard: React.FC<{ score: number; chronoAge: number }> = ({ score, chronoAge }) => {
  const delta  = bioAgeDelta(score);
  const bioAge = Math.max(10, chronoAge - delta);
  const pace   = agingPace(score);
  const slower = pace < 1;
  return (
    <View style={styles.bioAgeCard}>
      <View style={styles.bioAgeLeft}>
        <Text style={styles.bioAgeLabel}>BIOLOGICAL AGE</Text>
        <Text style={styles.bioAgeValue}>{bioAge}</Text>
        <View style={[styles.bioAgeBadge, { backgroundColor: delta >= 0 ? '#30D15822' : '#FF3B3022' }]}>
          <Text style={[styles.bioAgeBadgeText, { color: delta >= 0 ? '#30D158' : '#FF3B30' }]}>
            {delta >= 0 ? `${delta}y younger` : `${Math.abs(delta)}y older`}
          </Text>
        </View>
      </View>
      <View style={styles.bioAgeDivider} />
      <View style={styles.bioAgeRight}>
        <Text style={styles.bioAgeLabel}>AGING PACE</Text>
        <Text style={[styles.bioAgePace, { color: slower ? '#30D158' : '#FF3B30' }]}>{pace}×</Text>
        <Text style={styles.bioAgePaceNote}>
          {slower ? 'slower than\nreal time' : 'faster than\nreal time'}
        </Text>
      </View>
    </View>
  );
};

// ─── Score composition ────────────────────────────────────────────────────────

const COMPOSITION_RINGS = [
  { id: 'biomarkers', label: 'Biomarkers', color: '#3AABF0', weight: 0.45 },
  { id: 'recovery',   label: 'Recovery',   color: '#30D158', weight: 0.35 },
  { id: 'lifestyle',  label: 'Physical',   color: '#FF9F0A', weight: 0.20 },
] as const;

const CompositionCard: React.FC<{
  label: string; color: string; score: number; weight: number; onPress: () => void;
}> = ({ label, color, score, weight, onPress }) => {
  const size = 48; const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (score / 100) * circ;
  return (
    <TouchableOpacity style={styles.compCard} onPress={onPress} activeOpacity={0.75}>
      <Svg width={size} height={size}>
        <Circle stroke="#2C2C2E" fill="none" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <Circle stroke={color} fill="none" cx={size / 2} cy={size / 2} r={r}
          strokeWidth={stroke} strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <SvgText x={size / 2} y={size / 2 + 4} textAnchor="middle" fill="#FFFFFF" fontSize={12} fontWeight="700">{score}</SvgText>
      </Svg>
      <Text style={[styles.compLabel, { color }]}>{label}</Text>
      <Text style={styles.compWeight}>{Math.round(weight * 100)}%</Text>
      <Text style={styles.compPts}>{(score * weight).toFixed(1)} pts</Text>
      <Ionicons name="chevron-forward" size={12} color="#555" style={{ marginTop: 2 }} />
    </TouchableOpacity>
  );
};

// ─── Insight row ─────────────────────────────────────────────────────────────

const InsightRow: React.FC<{
  icon: string; label: string; value: string; note: string; type: 'strength' | 'gap'; last?: boolean;
}> = ({ icon, label, value, note, type, last }) => {
  const color = type === 'strength' ? '#30D158' : '#FF9F0A';
  return (
    <View style={[styles.insightRow, !last && styles.insightBorder]}>
      <View style={[styles.insightDot, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <View style={styles.insightText}>
        <Text style={styles.insightLabel}>{label}</Text>
        <Text style={styles.insightNote}>{note}</Text>
      </View>
      <Text style={[styles.insightValue, { color }]}>{value}</Text>
    </View>
  );
};

// ─── Main screen ─────────────────────────────────────────────────────────────

const HealthScoreDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { healthScore } = useHealthData();
  const scores = deriveDashboardScores(healthScore);

  const [period, setPeriod]           = useState<Period>('week');
  const [selectedIdx, setSelectedIdx] = useState(PERIOD_DEFAULT_INDEX['week']);

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    setSelectedIdx(PERIOD_DEFAULT_INDEX[p]);
  };

  const activeScores = OVERALL_SCORES[period];
  const activeLabels = PERIOD_LABELS[period];
  const currentScore = activeScores[selectedIdx];
  const CHRONO_AGE   = 33; // placeholder — read from user profile in production

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HEALTH SCORE</Text>
        <View style={{ width: 40 }} />
      </View>

      <PeriodSelector period={period} onChange={handlePeriodChange} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        <PeriodRingSelector
          scores={activeScores} labels={activeLabels}
          selected={selectedIdx} onSelect={setSelectedIdx}
        />

        <View style={styles.heroSection}>
          <HeroRing score={currentScore} />
          <Text style={styles.periodCompare}>{PERIOD_COMPARISON[period]}</Text>
        </View>

        {/* Biological age */}
        <View style={styles.section}>
          <BioAgeCard score={scores.overallHealthScore} chronoAge={CHRONO_AGE} />
        </View>

        {/* Composition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SCORE COMPOSITION</Text>
          <View style={styles.compRow}>
            {COMPOSITION_RINGS.map((ring) => {
              const ringScore =
                ring.id === 'biomarkers' ? scores.finalBiomarkersScore :
                ring.id === 'recovery'   ? scores.finalRecoveryScore   :
                                           scores.finalLifestyleScore;
              return (
                <CompositionCard
                  key={ring.id} label={ring.label} color={ring.color}
                  score={ringScore} weight={ring.weight}
                  onPress={() => navigation.navigate('RingDetail', { id: ring.id })}
                />
              );
            })}
          </View>
        </View>

        {/* Strengths */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TOP STRENGTHS</Text>
          <View style={styles.insightCard}>
            {STRENGTHS.map((s, i) => (
              <InsightRow key={s.label} {...s} type="strength" last={i === STRENGTHS.length - 1} />
            ))}
          </View>
        </View>

        {/* Gaps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TOP GAPS</Text>
          <View style={styles.insightCard}>
            {GAPS.map((g, i) => (
              <InsightRow key={g.label} {...g} type="gap" last={i === GAPS.length - 1} />
            ))}
          </View>
        </View>

        {/* Biggest opportunity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BIGGEST OPPORTUNITY</Text>
          <View style={styles.oppCard}>
            <View style={styles.oppHeader}>
              <Ionicons name="flash-outline" size={16} color={ACCENT} />
              <Text style={styles.oppMarker}>ApoB</Text>
            </View>
            <Text style={styles.oppBody}>
              Bring from <Text style={{ color: '#FF9F0A', fontWeight: '700' }}>70 mg/dL</Text> to{' '}
              <Text style={{ color: '#30D158', fontWeight: '700' }}>&lt;65 mg/dL</Text>
            </Text>
            <Text style={styles.oppGain}>
              Estimated gain:{' '}
              <Text style={{ color: ACCENT, fontWeight: '700' }}>+4–5 points</Text> to your overall score
            </Text>
          </View>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: '#000000' },
  header:      { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 16, paddingBottom: 4 },
  backBtn:     { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },

  periodRow:      { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 12 },
  periodPill:     { width: 44, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center' },
  periodPillLabel:{ fontSize: 13, fontWeight: '700', color: '#555', letterSpacing: 0.5 },

  ringSelectorContent: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  ringItem:  { alignItems: 'center', gap: 6, paddingHorizontal: 6 },
  ringLabel: { fontSize: 11, color: '#555', letterSpacing: 0.3 },

  heroSection:  { alignItems: 'center', paddingBottom: 8 },
  heroRingWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  heroScore:    { fontSize: 52, fontWeight: '700', color: ACCENT },
  heroBadge:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: `${ACCENT}22`, marginTop: 4 },
  heroBadgeText:{ fontSize: 12, fontWeight: '600', color: ACCENT },
  periodCompare:{ fontSize: 11, color: '#555', letterSpacing: 0.8, marginTop: 4 },

  section:      { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: '#8E8E93', letterSpacing: 1.2, marginBottom: 10 },

  bioAgeCard:    { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center' },
  bioAgeLeft:    { flex: 1, alignItems: 'flex-start', gap: 6 },
  bioAgeRight:   { flex: 1, alignItems: 'flex-end', gap: 6 },
  bioAgeDivider: { width: 1, height: 64, backgroundColor: '#2C2C2E', marginHorizontal: 16 },
  bioAgeLabel:   { fontSize: 10, color: '#8E8E93', fontWeight: '600', letterSpacing: 1 },
  bioAgeValue:   { fontSize: 42, fontWeight: '800', color: '#FFFFFF' },
  bioAgeBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  bioAgeBadgeText:{ fontSize: 11, fontWeight: '700' },
  bioAgePace:    { fontSize: 32, fontWeight: '800' },
  bioAgePaceNote:{ fontSize: 11, color: '#8E8E93', textAlign: 'right' },

  compRow: { flexDirection: 'row', gap: 10 },
  compCard: { flex: 1, backgroundColor: '#1C1C1E', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  compLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  compWeight: { fontSize: 11, color: '#8E8E93' },
  compPts:    { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  insightCard:  { backgroundColor: '#1C1C1E', borderRadius: 14, overflow: 'hidden' },
  insightRow:   { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  insightBorder:{ borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  insightDot:   { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  insightText:  { flex: 1 },
  insightLabel: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  insightNote:  { fontSize: 11, color: '#8E8E93', marginTop: 1 },
  insightValue: { fontSize: 13, fontWeight: '700' },

  oppCard:   { backgroundColor: `${ACCENT}15`, borderWidth: 1, borderColor: `${ACCENT}40`, borderRadius: 14, padding: 16, gap: 10 },
  oppHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  oppMarker: { fontSize: 15, fontWeight: '800', color: ACCENT },
  oppBody:   { fontSize: 15, color: '#8E8E93', lineHeight: 24 },
  oppGain:   { fontSize: 13, color: '#8E8E93' },
});

export default HealthScoreDetailScreen;
