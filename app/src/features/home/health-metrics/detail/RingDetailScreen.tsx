import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Dimensions,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Polyline, Path, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { RootStackParamList } from '../../../../shared/types';
import {
  RING_CONFIGS, PERIOD_LABELS, PERIOD_SHORT_LABELS, PERIOD_DEFAULT_INDEX,
  PERIOD_COMPARISON, getScores, getStatData, getTrend,
  RingId, StatDef, Period,
} from './ringConfig';

type Route = RouteProp<RootStackParamList, 'RingDetail'>;
const { width: W } = Dimensions.get('window');

// ─── Period selector ─────────────────────────────────────────────────────────

const PERIOD_PILLS: { key: Period; label: string }[] = [
  { key: 'day',   label: 'D' },
  { key: 'week',  label: 'W' },
  { key: 'month', label: 'M' },
  { key: 'year',  label: 'Y' },
];

const PeriodSelector: React.FC<{
  period: Period;
  color: string;
  onChange: (p: Period) => void;
}> = ({ period, color, onChange }) => (
  <View style={styles.periodRow}>
    {PERIOD_PILLS.map(({ key, label }) => {
      const active = key === period;
      return (
        <TouchableOpacity
          key={key}
          style={[styles.periodPill, active && { backgroundColor: `${color}22`, borderColor: color }]}
          onPress={() => onChange(key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.periodLabel, active && { color }]}>{label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── Mini ring for period selector ───────────────────────────────────────────

const MiniRing: React.FC<{ score: number; color: string; selected: boolean }> = ({ score, color, selected }) => {
  const size = selected ? 46 : 38;
  const stroke = selected ? 4 : 3;
  const r = (size - stroke) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (score / 100) * circ;

  return (
    <Svg width={size} height={size}>
      <Circle stroke="#2C2C2E" fill="none" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
      <Circle
        stroke={selected ? color : `${color}55`}
        fill="none"
        cx={size / 2} cy={size / 2} r={r}
        strokeWidth={stroke}
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <SvgText
        x={size / 2} y={size / 2 + 4}
        textAnchor="middle"
        fill={selected ? '#FFFFFF' : '#8E8E93'}
        fontSize={selected ? 12 : 10}
        fontWeight={selected ? '700' : '400'}
      >
        {score}
      </SvgText>
    </Svg>
  );
};

// ─── Period ring selector (replaces DaySelector) ─────────────────────────────

const PeriodRingSelector: React.FC<{
  scores: number[];
  labels: string[];
  color: string;
  selected: number;
  onSelect: (i: number) => void;
  isToday?: (i: number) => boolean;
}> = ({ scores, labels, color, selected, onSelect, isToday }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.ringSelectorContent}
  >
    {scores.map((score, i) => (
      <TouchableOpacity key={i} style={styles.ringItem} onPress={() => onSelect(i)} activeOpacity={0.7}>
        <MiniRing score={score} color={color} selected={i === selected} />
        <Text style={[styles.ringItemLabel, i === selected && { color: '#FFFFFF', fontWeight: '600' }]}>
          {labels[i]}
        </Text>
        {isToday?.(i) && (
          <View style={[styles.todayDot, { backgroundColor: color }]} />
        )}
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// ─── Hero score ring ─────────────────────────────────────────────────────────

const HeroRing: React.FC<{ score: number; color: string }> = ({ score, color }) => {
  const size = 160;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (score / 100) * circ;
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs work';

  return (
    <View style={styles.heroRingWrap}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle stroke="#1C1C1E" fill="none" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <Circle
          stroke={color} fill="none"
          cx={size / 2} cy={size / 2} r={r}
          strokeWidth={stroke}
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={[styles.heroScore, { color }]}>{score}</Text>
      <View style={[styles.heroBadge, { backgroundColor: `${color}22` }]}>
        <Text style={[styles.heroBadgeText, { color }]}>{label}</Text>
      </View>
    </View>
  );
};

// ─── Bar chart ───────────────────────────────────────────────────────────────

const BarChart: React.FC<{
  data: number[];
  shortLabels: string[];
  color: string;
  selectedIdx: number;
  format: (n: number) => string;
}> = ({ data, shortLabels, color, selectedIdx, format }) => {
  const chartW = W - 64;
  const chartH = 90;
  const bottomH = 28;
  const svgH = chartH + bottomH;
  const n = data.length;
  const gap = 6;
  const barW = (chartW - gap * (n - 1)) / n;
  const maxVal = Math.max(...data) * 1.1 || 1;

  return (
    <Svg width={chartW} height={svgH}>
      {data.map((val, i) => {
        const barH = Math.max(4, (val / maxVal) * chartH * 0.9);
        const x = i * (barW + gap);
        const y = chartH - barH;
        const sel = i === selectedIdx;
        return (
          <React.Fragment key={i}>
            <Rect x={x} y={y} width={barW} height={barH}
              fill={sel ? color : `${color}33`} rx={4} />
            {sel && (
              <SvgText x={x + barW / 2} y={y - 5} textAnchor="middle"
                fill="#FFFFFF" fontSize={9} fontWeight="600">
                {format(val)}
              </SvgText>
            )}
            <SvgText x={x + barW / 2} y={chartH + 18} textAnchor="middle"
              fill={sel ? '#FFFFFF' : '#555'} fontSize={9} fontWeight={sel ? '700' : '400'}>
              {shortLabels[i]}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
};

// ─── Line chart ──────────────────────────────────────────────────────────────

const LineChart: React.FC<{
  data: number[];
  shortLabels: string[];
  color: string;
  selectedIdx: number;
  format: (n: number) => string;
}> = ({ data, shortLabels, color, selectedIdx, format }) => {
  const chartW = W - 64;
  const topPad = 20;
  const chartH = 70;
  const bottomH = 28;
  const svgH = topPad + chartH + bottomH;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const gap = data.length > 1 ? chartW / (data.length - 1) : chartW;

  const pts = data.map((v, i) => ({
    x: i * gap,
    y: topPad + chartH - ((v - min) / range) * (chartH - 8) - 4,
  }));

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const fill = `M ${pts[0].x},${topPad + chartH} ` +
    pts.map(p => `L ${p.x},${p.y}`).join(' ') +
    ` L ${pts[pts.length - 1].x},${topPad + chartH} Z`;

  return (
    <Svg width={chartW} height={svgH}>
      <Defs>
        <LinearGradient id={`lg_${color}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.2" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={fill} fill={`url(#lg_${color})`} />
      <Polyline points={polyline} fill="none" stroke={`${color}88`} strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => {
        const sel = i === selectedIdx;
        return (
          <React.Fragment key={i}>
            <Circle cx={p.x} cy={p.y} r={sel ? 5 : 3}
              fill={sel ? color : '#000'} stroke={sel ? color : `${color}66`} strokeWidth={1.5} />
            {sel && (
              <SvgText x={p.x} y={p.y - 10} textAnchor="middle"
                fill="#FFFFFF" fontSize={9} fontWeight="600">
                {format(data[i])}
              </SvgText>
            )}
            <SvgText x={p.x} y={topPad + chartH + 16} textAnchor="middle"
              fill={sel ? '#FFFFFF' : '#555'} fontSize={9} fontWeight={sel ? '700' : '400'}>
              {shortLabels[i]}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
};

// ─── Stat row ────────────────────────────────────────────────────────────────

const StatRow: React.FC<{
  stat: StatDef;
  period: Period;
  selectedIdx: number;
  color: string;
}> = ({ stat, period, selectedIdx, color }) => {
  const [expanded, setExpanded] = useState(false);
  const activeData = getStatData(stat, period);
  const currentVal = activeData[selectedIdx];
  const avgVal = activeData.reduce((a, b) => a + b, 0) / activeData.length;
  const trend = getTrend(currentVal, avgVal, stat.higherIsBetter);
  const trendColor = trend === 'up' ? '#30D158' : trend === 'down' ? '#FF3B30' : '#8E8E93';
  const trendIcon  = trend === 'up' ? 'arrow-up'  : trend === 'down' ? 'arrow-down' : 'remove';
  const shortLabels = PERIOD_SHORT_LABELS[period];

  return (
    <View style={styles.statCard}>
      <TouchableOpacity style={styles.statRow} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
        <View style={styles.statLeft}>
          <Ionicons name={stat.icon as any} size={20} color="#8E8E93" />
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
        <View style={styles.statRight}>
          <View style={styles.statValueRow}>
            <Text style={styles.statValue}>{stat.format(currentVal)}</Text>
            <Ionicons name={trendIcon as any} size={14} color={trendColor} style={{ marginLeft: 4 }} />
          </View>
          <Text style={styles.statComparison}>{stat.format(avgVal)} avg</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14} color="#555" style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.chartWrap}>
          {stat.chartType === 'bar'
            ? <BarChart data={activeData} shortLabels={shortLabels} color={color} selectedIdx={selectedIdx} format={stat.format} />
            : <LineChart data={activeData} shortLabels={shortLabels} color={color} selectedIdx={selectedIdx} format={stat.format} />
          }
        </View>
      )}
    </View>
  );
};

// ─── Main screen ─────────────────────────────────────────────────────────────

const RingDetailScreen: React.FC = () => {
  const route      = useRoute<Route>();
  const navigation = useNavigation();
  const { id }     = route.params;
  const config     = RING_CONFIGS[id as RingId];

  const [period, setPeriod]       = useState<Period>('week');
  const [selectedIdx, setSelectedIdx] = useState(PERIOD_DEFAULT_INDEX['week']);

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    setSelectedIdx(PERIOD_DEFAULT_INDEX[p]);
  };

  const activeScores = getScores(config, period);
  const activeLabels = PERIOD_LABELS[period];
  const score        = activeScores[selectedIdx];

  const isCurrentPoint = (i: number) => {
    if (period === 'week') return i === PERIOD_DEFAULT_INDEX['week'];
    if (period === 'day')  return i === PERIOD_DEFAULT_INDEX['day'];
    if (period === 'year') return i === PERIOD_DEFAULT_INDEX['year'];
    return false;
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{config.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Period selector */}
      <PeriodSelector period={period} color={config.color} onChange={handlePeriodChange} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        {/* Period ring selector */}
        <PeriodRingSelector
          scores={activeScores}
          labels={activeLabels}
          color={config.color}
          selected={selectedIdx}
          onSelect={setSelectedIdx}
          isToday={isCurrentPoint}
        />

        {/* Hero score */}
        <View style={styles.heroSection}>
          <HeroRing score={score} color={config.color} />
          <View style={styles.subMetricsRow}>
            {config.subMetrics.map((m) => (
              <View key={m.label} style={styles.subMetricBox}>
                <Text style={styles.subMetricLabel}>{m.label}</Text>
                <Text style={styles.subMetricValue}>{m.value}</Text>
                <View style={[styles.subMetricBadge, { backgroundColor: `${m.badgeColor}22` }]}>
                  <Text style={[styles.subMetricBadgeText, { color: m.badgeColor }]}>{m.badge}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsSectionLabel}>STATISTICS</Text>
            <Text style={styles.statsSectionSub}>{PERIOD_COMPARISON[period]}</Text>
          </View>
          {config.stats.map((stat) => (
            <StatRow key={stat.id} stat={stat} period={period} selectedIdx={selectedIdx} color={config.color} />
          ))}
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },

  periodRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  periodPill: {
    width: 44,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 0.5,
  },

  ringSelectorContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  ringItem: { alignItems: 'center', gap: 6, paddingHorizontal: 6 },
  ringItemLabel: { fontSize: 11, color: '#555', letterSpacing: 0.3 },
  todayDot: { width: 4, height: 4, borderRadius: 2, marginTop: -2 },

  heroSection: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
  heroRingWrap: {
    width: 160, height: 160,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
  },
  heroScore: { fontSize: 52, fontWeight: '700' },
  heroBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 4 },
  heroBadgeText: { fontSize: 12, fontWeight: '600' },

  subMetricsRow: { flexDirection: 'row', gap: 10, width: '100%' },
  subMetricBox: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 12,
    alignItems: 'flex-start',
    gap: 4,
  },
  subMetricLabel: { fontSize: 11, color: '#8E8E93', fontWeight: '500' },
  subMetricValue: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  subMetricBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  subMetricBadgeText: { fontSize: 10, fontWeight: '600' },

  statsSection: { paddingHorizontal: 16, paddingTop: 8 },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  statsSectionLabel: { fontSize: 11, fontWeight: '600', color: '#8E8E93', letterSpacing: 1.2 },
  statsSectionSub: { fontSize: 10, color: '#555', letterSpacing: 0.5 },

  statCard: {
    backgroundColor: '#111111',
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.8 },
  statRight: { alignItems: 'flex-end' },
  statValueRow: { flexDirection: 'row', alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  statComparison: { fontSize: 12, color: '#555', marginTop: 1 },
  chartWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
});

export default RingDetailScreen;
