import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Rect, Polygon, Text as SvgText, G } from 'react-native-svg';
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

type EnvironmentalMetricRoute = RouteProp<RootStackParamList, 'EnvironmentalMetric'>;
type Nav = StackNavigationProp<RootStackParamList, 'EnvironmentalMetric'>;

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'excellent':
      return '#30D158';
    case 'good':
      return '#32D74B';
    case 'moderate':
      return '#FF9F0A';
    case 'poor':
      return '#FF6B35';
    case 'hazardous':
      return '#FF3B30';
    default:
      return '#8E8E93';
  }
};

// UV Index helpers
const getUVExplanation = (status: string) => {
  switch (status) {
    case 'excellent':
    case 'good':
      return 'UV levels are low. Minimal protection needed.';
    case 'moderate':
      return 'UV levels are moderate. Protection is recommended during midday.';
    case 'poor':
      return 'UV levels are high. Extra protection is required, especially midday.';
    case 'hazardous':
      return 'UV levels are very high to extreme. Avoid direct sun and use maximum protection.';
    default:
      return 'UV levels are being monitored.';
  }
};
const getUVHealthImpacts = (status: string) => {
  switch (status) {
    case 'good':
      return ['Very low risk of skin damage'];
    case 'moderate':
      return ['Risk of sunburn for unprotected skin', 'Eye strain possible'];
    case 'poor':
      return ['Increased sunburn risk within 30–60 minutes', 'Potential eye damage without protection'];
    case 'hazardous':
      return ['Sunburn in minutes', 'High risk of skin and eye damage'];
    default:
      return [];
  }
};
const getUVRecommendations = (status: string) => {
  switch (status) {
    case 'good':
      return ['Sunscreen optional', 'Sunglasses for comfort'];
    case 'moderate':
      return ['Use SPF 30+ sunscreen', 'Wear sunglasses and a hat', 'Seek shade near midday'];
    case 'poor':
      return ['Use SPF 50+ sunscreen', 'Wear protective clothing and hat', 'Limit time in direct sun'];
    case 'hazardous':
      return ['Avoid direct sun 10am–4pm', 'SPF 50+, sunglasses (UV400)', 'Seek shade and cover up'];
    default:
      return ['Use appropriate sun protection'];
  }
};

// Food safety helpers
const getFoodSafetyExplanation = (status: string) => {
  switch (status) {
    case 'good':
      return 'Food safety standards are generally good. Low risk of foodborne illness.';
    case 'moderate':
      return 'Food safety varies. Be selective with vendors and preparation.';
    case 'poor':
      return 'Higher risk of foodborne illness. Choose reputable venues and cooked food.';
    default:
      return 'Food safety conditions are being monitored.';
  }
};
const getFoodSafetyHealthImpacts = (status: string) => {
  switch (status) {
    case 'moderate':
      return ['Traveler’s diarrhea risk present', 'Mild GI upset possible'];
    case 'poor':
      return ['Higher risk of GI illness', 'Dehydration and electrolyte imbalance possible'];
    default:
      return [];
  }
};
const getFoodSafetyRecommendations = (status: string) => {
  switch (status) {
    case 'good':
      return ['Normal precautions', 'Wash hands before eating'];
    case 'moderate':
      return ['Eat freshly cooked food', 'Avoid raw/undercooked meats', 'Use bottled water for brushing teeth'];
    case 'poor':
      return ['Avoid street food/raw salads', 'Drink sealed bottled water', 'Carry oral rehydration salts'];
    default:
      return ['Follow safe food and water practices'];
  }
};

// Altitude helpers
const getAltitudeExplanation = (status: string) => {
  switch (status) {
    case 'good':
      return 'Altitude is low; minimal physiological impact.';
    case 'moderate':
      return 'Moderate altitude may affect sleep and exercise tolerance.';
    case 'poor':
      return 'High altitude increases risk of acute mountain sickness without acclimatization.';
    default:
      return 'Altitude impact is being assessed.';
  }
};
const getAltitudeHealthImpacts = (status: string) => {
  switch (status) {
    case 'moderate':
      return ['Mild headache or fatigue', 'Reduced exercise tolerance'];
    case 'poor':
      return ['Headache, nausea, insomnia', 'Risk of AMS at >2500m (8200ft)'];
    default:
      return [];
  }
};
const getAltitudeRecommendations = (status: string) => {
  switch (status) {
    case 'good':
      return ['Stay hydrated', 'Normal activity acceptable'];
    case 'moderate':
      return ['Ascend gradually', 'Hydrate and avoid alcohol on arrival'];
    case 'poor':
      return ['Acclimatize 1–2 days', 'Avoid rapid ascent', 'Consider acetazolamide if advised'];
    default:
      return ['Follow acclimatization guidance'];
  }
};

// Disease outbreaks helpers
const getOutbreaksExplanation = (status: string) => {
  switch (status) {
    case 'good':
      return 'No significant outbreaks reported.';
    case 'moderate':
      return 'Localized outbreaks present. Follow public health guidance.';
    case 'poor':
      return 'Widespread outbreaks. Heightened precautions recommended.';
    default:
      return 'Outbreak status is being monitored.';
  }
};
const getOutbreaksHealthImpacts = (status: string) => {
  switch (status) {
    case 'moderate':
      return ['Elevated infection risk in specific areas'];
    case 'poor':
      return ['High infection risk', 'Potential healthcare strain'];
    default:
      return [];
  }
};
const getOutbreaksRecommendations = (status: string) => {
  switch (status) {
    case 'good':
      return ['Keep routine vaccinations up to date'];
    case 'moderate':
      return ['Practice hand hygiene', 'Avoid crowded indoor spaces', 'Use masks where advised'];
    case 'poor':
      return ['Consider postponing non-essential travel', 'Strict hygiene and masking', 'Follow local advisories'];
    default:
      return ['Follow health authority guidance'];
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
      return {
        segments: airQualityRangeSegments,
        currentValue: typeof score === 'number' ? Math.max(0, Math.min(airQualityScoreDivisor, score)) : 0,
        currentLabel: value,
      };
    }
    if (metricId === 'pollen') {
      return {
        segments: pollenRangeSegments,
        currentValue: typeof score === 'number' ? Math.max(0, Math.min(pollenScoreDivisor, score)) : 0,
        currentLabel: value,
      };
    }
    if (metricId === 'water_quality') {
      return {
        segments: waterQualityRangeSegments,
        currentValue: typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 0,
        currentLabel: value,
      };
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

  const { width } = useWindowDimensions();
  const barWidth = Math.min(320, Math.max(240, width - 64));
  const barHeight = 18;

  const divisor = metricId === 'air_quality' ? airQualityScoreDivisor : metricId === 'pollen' ? pollenScoreDivisor : 100;
  const pointerPosition = Math.min((range.currentValue / divisor) * barWidth, barWidth - 10);

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
          <View style={styles.rangeIndicatorContainer}>
            <Svg width={barWidth} height={45}>
              {range.segments.map((segment, index) => {
                const gap = 2;
                const totalGaps = (range.segments.length - 1) * gap;
                const availableWidth = barWidth - totalGaps;
                const segmentW = availableWidth / range.segments.length;
                const x = index * (segmentW + gap);
                return (
                  <Rect
                    key={index}
                    x={x}
                    y={2}
                    width={segmentW}
                    height={barHeight}
                    fill={segment.color}
                    rx={index === 0 ? 8 : index === range.segments.length - 1 ? 8 : 0}
                    ry={index === 0 ? 8 : index === range.segments.length - 1 ? 8 : 0}
                  />
                );
              })}

              <Polygon
                points={`${Math.min(Math.max(pointerPosition, 10), barWidth - 10)},0 ${Math.min(
                  Math.max(pointerPosition - 6, 4),
                  barWidth - 16,
                )},15 ${Math.min(Math.max(pointerPosition + 6, 16), barWidth - 4)},15`}
                fill="#FFFFFF"
                stroke="#FFFFFF"
                strokeWidth="1"
              />

              {range.segments.map((segment, index) => {
                const gap = 2;
                const totalGaps = (range.segments.length - 1) * gap;
                const availableWidth = barWidth - totalGaps;
                const segmentW = availableWidth / range.segments.length;
                const x = index * (segmentW + gap);
                const centerX = x + segmentW / 2;
                return (
                  <G key={index}>
                    <SvgText x={centerX} y={32} fontSize="10" fill="#FFFFFF" fontWeight={(segment as any).isBold ? 'bold' : '600'} textAnchor="middle">
                      {segment.label}
                    </SvgText>
                    <SvgText x={centerX} y={42} fontSize="10" fill="#8E8E93" textAnchor="middle">
                      {segment.range}
                    </SvgText>
                  </G>
                );
              })}
            </Svg>
            <View style={styles.currentScoreContainer}>
              <Text style={styles.currentScoreText}>Your score is in the {range.currentLabel} range ({range.currentValue}).</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What this means</Text>
          <Text style={styles.sectionText}>{details.whatItMeans}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Potential Health Impacts</Text>
          {details.healthImpacts.map((impact, i) => (
            <View style={styles.row} key={i}>
              <Ionicons name="checkmark-circle" size={16} color={statusColor} />
              <Text style={styles.rowText}>{impact}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {details.recommendations.map((rec, i) => (
            <View style={styles.row} key={i}>
              <Ionicons name="arrow-forward" size={16} color="#007AFF" />
              <Text style={styles.rowText}>{rec}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Factors</Text>
          {details.riskFactors.map((risk, i) => (
            <View style={styles.row} key={i}>
              <Ionicons name="warning" size={16} color="#FF9500" />
              <Text style={styles.rowText}>{risk}</Text>
            </View>
          ))}
        </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  rowText: {
    color: '#E5E5EA',
    marginLeft: 8,
    lineHeight: 20,
    fontSize: 14,
    flex: 1,
  },
  rangeIndicatorContainer: {
    alignItems: 'center',
    marginTop: 6,
  },
  currentScoreContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  currentScoreText: {
    color: '#E5E5EA',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default EnvironmentalMetricScreen;


