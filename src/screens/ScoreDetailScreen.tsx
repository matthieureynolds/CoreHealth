import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { RootStackParamList } from '../types';

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

const DistributionCurve = ({ value, color }: { value: number; color: string }) => {
  const chartWidth = 380;
  const chartHeight = 74;
  const padding = 20;
  const curveWidth = chartWidth - padding * 2;
  const curveHeight = chartHeight - padding * 2;

  const mean = 50;
  const stdDev = 28;
  const amplitude = 0.245;

  const points: { x: number; y: number }[] = [];
  for (let x = 0; x <= curveWidth; x += 2) {
    const normalizedX = (x / curveWidth) * 100;
    const yVal = Math.exp(-0.5 * Math.pow((normalizedX - mean) / stdDev, 2));
    const chartY = curveHeight - yVal * curveHeight * amplitude - 10;
    points.push({ x: x + padding, y: chartY });
  }

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  const userPosition = (Math.max(0, Math.min(value, 100)) / 100) * curveWidth;
  const userNormalizedX = (userPosition / curveWidth) * 100;
  const userYVal = Math.exp(-0.5 * Math.pow((userNormalizedX - mean) / stdDev, 2));
  const userChartY = curveHeight - userYVal * curveHeight * amplitude - 10;
  const tailPoints = points.filter(p => p.x >= userPosition + padding);
  const tailPathData = tailPoints.length > 0
    ? `M ${[{ x: userPosition + padding, y: userChartY }, ...tailPoints].map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

  return (
    <Svg width={chartWidth} height={chartHeight}>
      <Path d={pathData} stroke="#FFFFFF" strokeWidth="2" fill="none" />
      <Path
        d={`M ${padding + curveWidth / 2},${padding} L ${padding + curveWidth / 2},${curveHeight - 10}`}
        stroke="#8E8E93"
        strokeWidth="1"
        strokeDasharray="4,6"
        opacity="0.6"
      />
      {tailPathData !== '' && <Path d={tailPathData} stroke={color} strokeWidth="2" fill="none" />}
      <Circle cx={userPosition + padding} cy={userChartY} r="5" fill="#FFFFFF" stroke={color} strokeWidth="2" />
      <SvgText x={padding} y={chartHeight - 5} fontSize="10" fill="#8E8E93" textAnchor="start">0</SvgText>
      <SvgText x={padding + curveWidth / 2} y={chartHeight - 5} fontSize="10" fill="#8E8E93" textAnchor="middle">50</SvgText>
      <SvgText x={padding + curveWidth} y={chartHeight - 5} fontSize="10" fill="#8E8E93" textAnchor="end">100</SvgText>
    </Svg>
  );
};

const ScoreDetailScreen: React.FC = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { id, title, value, color, icon, subtitle } = route.params;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title} Score Details</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreDisplay}>
          <View style={[styles.scoreCircle, { borderColor: color }] }>
            <Ionicons name={icon as any} size={20} color={color} />
            <Text style={[styles.scoreValue, { color }]}>{Math.round(value)}</Text>
            {subtitle ? <Text style={styles.scoreLabel}>{subtitle}</Text> : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribution</Text>
          <View style={styles.distWrap}>
            <DistributionCurve value={value} color={color} />
            <Text style={styles.distText}>{Math.round(value)}th percentile</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What This Means</Text>
          <Text style={styles.description}>{getMetricDescription(id)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It's Measured</Text>
          {getMetricDetails(id).map((d, i) => (
            <View key={i} style={styles.measureItem}>
              <Ionicons name={d.icon as any} size={20} color={d.color} />
              <View style={styles.measureText}>
                <Text style={styles.measureTitle}>{d.title}</Text>
                <Text style={styles.measureDesc}>{d.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  headerButton: { padding: 8, marginRight: 6 },
  headerRightSpacer: { width: 32 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  content: { flex: 1 },
  scoreDisplay: { alignItems: 'center', marginTop: 16, marginBottom: 8 },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#1C1C1E',
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreValue: { fontSize: 48, fontWeight: 'bold', marginTop: 4 },
  scoreLabel: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  section: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1F1F1F' },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  description: { color: '#EBEBF5', fontSize: 15, lineHeight: 22, textAlign: 'justify' },
  distWrap: { backgroundColor: '#2C2C2E', borderRadius: 12, padding: 16, alignItems: 'center' },
  distText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginTop: 12, textAlign: 'center' },
  measureItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  measureText: { flex: 1, marginLeft: 12 },
  measureTitle: { fontSize: 16, fontWeight: '600', color: '#FFF', marginBottom: 4 },
  measureDesc: { fontSize: 14, color: '#8E8E93', lineHeight: 20 },
});

export default ScoreDetailScreen;





