import React from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TravelStackParamList } from '../../../../../shared/types';
import { styles } from '../TravelScreen.styles';
import {
  getStatusColor,
  getMetricFixedIconColor,
  getScoreColor,
  getMetricScore,
  HEALTH_METRIC_ROWS,
} from '../travelMetricHelpers';
import TreadmillCard from './TreadmillCard';
import PressPop from './PressPop';

type Nav = CompositeNavigationProp<
  StackNavigationProp<TravelStackParamList, 'TravelList'>,
  StackNavigationProp<RootStackParamList>
>;

interface HealthMetricsSectionProps {
  getRowAnim: (key: string) => { opacity: Animated.Value; translate: Animated.Value };
  scrollY: Animated.Value;
  scrollContentRef: React.RefObject<any>;
}

const HealthMetricsSection: React.FC<HealthMetricsSectionProps> = ({ getRowAnim, scrollY, scrollContentRef }) => {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.metricsSection}>
      <View style={styles.sectionGroupCard}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        {HEALTH_METRIC_ROWS.map(({ animKey, metricId, label, value, status, icon, scoreLabel }) => (
          <TreadmillCard key={animKey} scrollY={scrollY} scrollContentRef={scrollContentRef}>
            <Animated.View
              style={{
                opacity: getRowAnim(animKey).opacity,
                transform: [{ translateY: getRowAnim(animKey).translate }],
              }}
            >
              <PressPop
                style={styles.metricRowCard}
                onPress={() =>
                  navigation.navigate('EnvironmentalMetric', {
                    metricId: metricId as 'air_quality' | 'pollen' | 'water_quality' | 'uv_index' | 'food_safety' | 'altitude' | 'outbreaks',
                    label,
                    value,
                    status: status as 'moderate' | 'poor' | 'good' | 'excellent' | 'hazardous',
                    score: getMetricScore(scoreLabel),
                    icon,
                  })
                }
              >
                <View style={[styles.metricIconCircle, { backgroundColor: `${getMetricFixedIconColor(metricId, status)}20` }]}>
                  <Ionicons name={icon as any} size={20} color={getMetricFixedIconColor(metricId, status)} />
                </View>
                <View style={styles.metricContent}>
                  <Text style={styles.metricName}>{label}</Text>
                  <Text style={[styles.metricValueText, { color: getStatusColor(status) }]}>{value}</Text>
                </View>
                <View style={styles.metricRightCol}>
                  <Text style={[styles.metricScoreText, { color: getScoreColor(metricId, status, getMetricScore(scoreLabel)) }]}>
                    {getMetricScore(scoreLabel)}
                  </Text>
                  <Text style={styles.metricScoreLabelText}>Score</Text>
                </View>
              </PressPop>
            </Animated.View>
          </TreadmillCard>
        ))}
      </View>
    </View>
  );
};

export default HealthMetricsSection;
