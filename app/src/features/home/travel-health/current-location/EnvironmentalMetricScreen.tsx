import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../shared/types';
import {
  getAirQualityExplanation,
  getAirQualityHealthImpacts,
  getAirQualityRecommendations,
  airQualityDescription,
  airQualityNormalRange,
  airQualityOptimalRange,
  airQualityRiskFactors,
  airQualityRangeSegments,
  airQualityScoreDivisor,
} from './air-quality/airQualityData';
import {
  getPollenExplanation,
  getPollenHealthImpacts,
  getPollenRecommendations,
  pollenDescription,
  pollenNormalRange,
  pollenOptimalRange,
  pollenRiskFactors,
  pollenRangeSegments,
  pollenScoreDivisor,
} from './pollen/pollenData';
import {
  getWaterQualityExplanation,
  getWaterQualityHealthImpacts,
  getWaterQualityRecommendations,
  waterQualityDescription,
  waterQualityNormalRange,
  waterQualityOptimalRange,
  waterQualityRiskFactors,
  waterQualityRangeSegments,
} from './water-quality/waterQualityData';
import {
  getUVExplanation, getUVHealthImpacts, getUVRecommendations,
  getFoodSafetyExplanation, getFoodSafetyHealthImpacts, getFoodSafetyRecommendations,
  getAltitudeExplanation, getAltitudeHealthImpacts, getAltitudeRecommendations,
  getOutbreaksExplanation, getOutbreaksHealthImpacts, getOutbreaksRecommendations,
} from './components/metricHelpers';
import MetricRangeBar from './components/MetricRangeBar';
import MetricDetailSections from './components/MetricDetailSections';

type EnvironmentalMetricRoute = RouteProp<RootStackParamList, 'EnvironmentalMetric'>;
type Nav = StackNavigationProp<RootStackParamList, 'EnvironmentalMetric'>;

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'excellent': return '#30D158';
    case 'good': return '#32D74B';
    case 'moderate': return '#FF9F0A';
    case 'poor': return '#FF6B35';
    case 'hazardous': return '#FF3B30';
    default: return '#8E8E93';
  }
};

const EnvironmentalMetricScreen: React.FC = () => {
  const route = useRoute<EnvironmentalMetricRoute>();
  const navigation = useNavigation<Nav>();
  const { metricId, label, value, status, score = 0, icon = 'cloud-outline' } = route.params;

  const statusColor = getStatusColor(status);

  const details = (() => {
    if (metricId === 'air_quality') {
      return {
        description: airQualityDescription,
        normalRange: airQualityNormalRange,
        optimalRange: airQualityOptimalRange,
        whatItMeans: getAirQualityExplanation(status),
        healthImpacts: getAirQualityHealthImpacts(status),
        recommendations: getAirQualityRecommendations(status),
        riskFactors: airQualityRiskFactors,
      };
    }
    if (metricId === 'pollen') {
      return {
        description: pollenDescription,
        normalRange: pollenNormalRange,
        optimalRange: pollenOptimalRange,
        whatItMeans: getPollenExplanation(status),
        healthImpacts: getPollenHealthImpacts(status),
        recommendations: getPollenRecommendations(status),
        riskFactors: pollenRiskFactors,
      };
    }
    if (metricId === 'water_quality') {
      return {
        description: waterQualityDescription,
        normalRange: waterQualityNormalRange,
        optimalRange: waterQualityOptimalRange,
        whatItMeans: getWaterQualityExplanation(status),
        healthImpacts: getWaterQualityHealthImpacts(status),
        recommendations: getWaterQualityRecommendations(status),
        riskFactors: waterQualityRiskFactors,
      };
    }
    if (metricId === 'uv_index') {
      return {
        description: 'UV Index reflects the strength of sunburn-producing ultraviolet radiation.',
        normalRange: '0-2 (Low) • 3-5 (Moderate) • 6-7 (High) • 8-10 (Very High) • 11+ (Extreme)',
        optimalRange: '0-2 (Low) - Minimal protection needed',
        whatItMeans: getUVExplanation(status),
        healthImpacts: getUVHealthImpacts(status),
        recommendations: getUVRecommendations(status),
        riskFactors: ['Fair skin or photosensitive conditions', 'Midday outdoor exposure', 'High altitude or equatorial regions', 'Reflective surfaces (snow/water)'],
      };
    }
    if (metricId === 'food_safety') {
      return {
        description: 'Food safety risk reflects local hygiene, preparation practices, and contamination risk.',
        normalRange: '70-100 (Good) • 40-69 (Moderate) • 0-39 (Poor)',
        optimalRange: '≥80 (Good) - Low risk with basic precautions',
        whatItMeans: getFoodSafetyExplanation(status),
        healthImpacts: getFoodSafetyHealthImpacts(status),
        recommendations: getFoodSafetyRecommendations(status),
        riskFactors: ['Raw/undercooked foods', 'Unboiled/untreated water', 'Poor hand hygiene', 'Cross-contamination in street markets'],
      };
    }
    if (metricId === 'altitude') {
      return {
        description: 'Altitude can reduce oxygen availability and affect sleep and exercise tolerance.',
        normalRange: '<1500m (Low) • 1500–2500m (Moderate) • 2500–3500m (High) • 3500–5500m (Very High) • >5500m (Extreme)',
        optimalRange: '<1500m - Minimal physiological impact',
        whatItMeans: getAltitudeExplanation(status),
        healthImpacts: getAltitudeHealthImpacts(status),
        recommendations: getAltitudeRecommendations(status),
        riskFactors: ['Rapid ascent', 'History of altitude illness', 'Strenuous exertion on arrival', 'Dehydration'],
      };
    }
    if (metricId === 'outbreaks') {
      return {
        description: 'Summarizes notable infectious disease activity reported locally.',
        normalRange: '0-19 (None) • 20-39 (Low) • 40-59 (Moderate) • 60-79 (High) • 80-100 (Severe)',
        optimalRange: '0-19 (None) - Routine precautions only',
        whatItMeans: getOutbreaksExplanation(status),
        healthImpacts: getOutbreaksHealthImpacts(status),
        recommendations: getOutbreaksRecommendations(status),
        riskFactors: ['Crowded indoor settings', 'Limited healthcare capacity', 'Low vaccination coverage', 'Travel during peak transmission seasons'],
      };
    }
    return {
      description: 'This metric provides important travel health context.',
      whatItMeans: 'Monitor this metric for potential health impacts.',
      healthImpacts: [] as string[],
      recommendations: ['Stay informed about local conditions', 'Take appropriate precautions'],
      riskFactors: [],
    };
  })();

  const range = (() => {
    if (metricId === 'air_quality') {
      return { segments: airQualityRangeSegments, currentValue: typeof score === 'number' ? Math.max(0, Math.min(airQualityScoreDivisor, score)) : 0, currentLabel: value };
    }
    if (metricId === 'pollen') {
      return { segments: pollenRangeSegments, currentValue: typeof score === 'number' ? Math.max(0, Math.min(pollenScoreDivisor, score)) : 0, currentLabel: value };
    }
    if (metricId === 'water_quality') {
      return { segments: waterQualityRangeSegments, currentValue: typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 0, currentLabel: value };
    }
    if (metricId === 'uv_index') {
      return {
        segments: [
          { label: 'Low', color: '#30D158', range: '0-2' },
          { label: 'Moderate', color: '#FF9F0A', range: '3-5', isBold: true },
          { label: 'High', color: '#FF6B35', range: '6-7' },
          { label: 'Very High', color: '#FF3B30', range: '8-10' },
          { label: 'Extreme', color: '#8B0000', range: '11+' },
        ],
        currentValue: typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 0,
        currentLabel: value,
      };
    }
    if (metricId === 'food_safety') {
      return {
        segments: [
          { label: 'Poor', color: '#FF3B30', range: '0-39' },
          { label: 'Moderate', color: '#FF9F0A', range: '40-69', isBold: true },
          { label: 'Good', color: '#30D158', range: '70-100' },
        ],
        currentValue: typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 0,
        currentLabel: value,
      };
    }
    if (metricId === 'altitude') {
      return {
        segments: [
          { label: 'Low', color: '#30D158', range: '<1500m' },
          { label: 'Moderate', color: '#FF9F0A', range: '1500-2500m', isBold: true },
          { label: 'High', color: '#FF6B35', range: '2500-5500m' },
          { label: 'Extreme', color: '#FF3B30', range: '>5500m' },
        ],
        currentValue: typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 0,
        currentLabel: value,
      };
    }
    if (metricId === 'outbreaks') {
      return {
        segments: [
          { label: 'None', color: '#30D158', range: '0-19' },
          { label: 'Low', color: '#32D74B', range: '20-39' },
          { label: 'Moderate', color: '#FF9F0A', range: '40-59', isBold: true },
          { label: 'High', color: '#FF6B35', range: '60-79' },
          { label: 'Severe', color: '#FF3B30', range: '80-100' },
        ],
        currentValue: typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 0,
        currentLabel: value,
      };
    }
    return {
      segments: [
        { label: 'Poor', color: '#FF3B30', range: '0-39' },
        { label: 'Moderate', color: '#FF9F0A', range: '40-69', isBold: true },
        { label: 'Good', color: '#30D158', range: '70-100' },
      ],
      currentValue: typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 0,
      currentLabel: value,
    };
  })();

  const divisor = metricId === 'air_quality' ? airQualityScoreDivisor : metricId === 'pollen' ? pollenScoreDivisor : 100;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <View style={[styles.headerIconContainer, { backgroundColor: `${statusColor}20` }]}>
            <Ionicons name={icon as any} size={24} color={statusColor} />
          </View>
          <View>
            <Text style={styles.headerTitle}>{label}</Text>
            <Text style={[styles.headerSubtitle, { color: statusColor }]}>
              {value} • Score: {score}
            </Text>
          </View>
        </View>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.sectionText}>{details.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Range Indicator</Text>
          <MetricRangeBar
            segments={range.segments}
            currentValue={range.currentValue}
            currentLabel={range.currentLabel}
            divisor={divisor}
          />
        </View>

        <MetricDetailSections
          whatItMeans={details.whatItMeans}
          healthImpacts={details.healthImpacts}
          recommendations={details.recommendations}
          riskFactors={details.riskFactors}
          statusColor={statusColor}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#000',
  },
  headerButton: {
    padding: 8,
    marginRight: 6,
  },
  headerRightSpacer: {
    width: 32,
  },
  headerTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    backgroundColor: '#0E0E0F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  sectionText: {
    color: '#E5E5EA',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default EnvironmentalMetricScreen;
