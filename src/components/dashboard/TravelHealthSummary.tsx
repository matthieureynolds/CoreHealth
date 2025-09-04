import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Polygon, Text as SvgText } from 'react-native-svg';
import JetLagPlanningCard from './JetLagPlanningCard';

interface EnvironmentalMetric {
  id: string;
  label: string;
  value: string;
  status: 'excellent' | 'good' | 'moderate' | 'poor' | 'hazardous';
  icon: keyof typeof Ionicons.glyphMap;
  score?: number;
}

interface TravelHealthSummaryProps {
  currentLocation?: string;
  jetLagHours?: number;
  onTravelPress?: () => void;
  jetLagPlanningEvents?: any[];
  onJetLagEventPress?: (event: any) => void;
}

const TravelHealthSummary: React.FC<TravelHealthSummaryProps> = ({ 
  currentLocation = 'New York, NY',
  jetLagHours = 0,
  onTravelPress,
  jetLagPlanningEvents = [],
  onJetLagEventPress
}) => {
  // Mock environmental data - in real app this would come from APIs
  const environmentalMetrics: EnvironmentalMetric[] = [
    {
      id: 'air_quality',
      label: 'Air Quality',
      value: 'Moderate',
      status: 'moderate',
      icon: 'cloud-outline',
      score: 72
    },
    {
      id: 'pollen',
      label: 'Pollen',
      value: 'High',
      status: 'poor',
      icon: 'flower-outline',
      score: 40
    },
    {
      id: 'water_quality',
      label: 'Water Quality',
      value: 'Excellent',
      status: 'excellent',
      icon: 'water-outline',
      score: 95
    }
  ];

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

  const getJetLagStatus = (): { text: string; color: string; icon: keyof typeof Ionicons.glyphMap } => {
    if (jetLagHours === 0) {
      return {
        text: 'No Jet Lag',
        color: '#30D158',
        icon: 'checkmark-circle'
      };
    } else if (jetLagHours <= 3) {
      return {
        text: `Mild Jet Lag (+${jetLagHours}h)`,
        color: '#FF9F0A',
        icon: 'time-outline'
      };
    } else {
      return {
        text: `Moderate Jet Lag (+${jetLagHours}h)`,
        color: '#FF6B35',
        icon: 'warning-outline'
      };
    }
  };

  const jetLagInfo = getJetLagStatus();

  const [showMore, setShowMore] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<EnvironmentalMetric | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mock closest facilities
  const closestFacilities = [
    { id: 'pharmacy1', name: 'City Pharmacy', type: 'Pharmacy', distance: '0.4 mi', travelTime: '4 mins' },
    { id: 'hospital1', name: 'Central Hospital', type: 'Hospital', distance: '1.2 mi', travelTime: '8 mins' },
  ];

  const renderEnvironmentalMetric = (metric: EnvironmentalMetric) => {
    const statusColor = getStatusColor(metric.status);
    return (
      <TouchableOpacity
        key={metric.id}
        style={styles.metricCard}
        onPress={() => {
          setSelectedMetric(metric);
          setModalVisible(true);
        }}
      >
        <View style={styles.metricCardContent}>
          <View style={styles.metricCardLeft}>
            <View style={[styles.metricIconContainer, { backgroundColor: `${statusColor}20` }]}> 
              <Ionicons name={metric.icon} size={24} color={statusColor} />
            </View>
            <View style={styles.metricInfo}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={[styles.metricValue, { color: statusColor }]}>{metric.value}</Text>
            </View>
          </View>
          <View style={styles.metricCardRight}>
            <Text style={[styles.metricScore, { color: statusColor }]}>{metric.score}</Text>
            <Text style={styles.metricScoreLabel}>Score</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleFacilityPress = (facility: any) => {
    Alert.alert(
      'Open Maps',
      `How would you like to navigate to ${facility.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Apple Maps',
          onPress: () => {
            const destination = encodeURIComponent(facility.name);
            const url = `http://maps.apple.com/?daddr=${destination}`;
            Linking.openURL(url);
          },
        },
        {
          text: 'Google Maps',
          onPress: () => {
            const destination = encodeURIComponent(facility.name);
            const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
            Linking.openURL(url);
          },
        },
      ]
    );
  };

  // Get detailed information for each environmental metric
  const getMetricDetails = (metric: EnvironmentalMetric) => {
    const details: { [key: string]: any } = {
      'air_quality': {
        description: 'Air Quality Index (AQI) measures the concentration of pollutants in the air, including particulate matter, ozone, nitrogen dioxide, and sulfur dioxide.',
        normalRange: '0-50 (Good) • 51-100 (Moderate) • 101-150 (Unhealthy for Sensitive) • 151-200 (Unhealthy) • 201+ (Hazardous)',
        optimalRange: '0-25 (Excellent) - Perfect for outdoor activities',
        whatItMeans: getAirQualityExplanation(metric.status),
        healthImpacts: getAirQualityHealthImpacts(metric.status),
        recommendations: getAirQualityRecommendations(metric.status),
        riskFactors: [
          'Outdoor exercise during high pollution',
          'Living near busy roads or industrial areas',
          'Pre-existing respiratory conditions',
          'Age (children and elderly more vulnerable)',
          'Smoking or secondhand smoke exposure'
        ]
      },
      'pollen': {
        description: 'Pollen count measures the concentration of pollen grains in the air. Different types of pollen (tree, grass, weed) can trigger allergic reactions.',
        normalRange: '0-9 (Low) • 10-49 (Moderate) • 50-149 (High) • 150+ (Very High)',
        optimalRange: '0-4 (Very Low) - Minimal allergy risk',
        whatItMeans: getPollenExplanation(metric.status),
        healthImpacts: getPollenHealthImpacts(metric.status),
        recommendations: getPollenRecommendations(metric.status),
        riskFactors: [
          'Seasonal allergies (hay fever)',
          'Asthma or respiratory conditions',
          'Outdoor activities during peak pollen times',
          'Living in areas with high vegetation',
          'Family history of allergies'
        ]
      },
      'water_quality': {
        description: 'Water quality measures the safety and cleanliness of local water sources, including chemical contaminants, bacteria, and mineral content.',
        normalRange: 'Safe for consumption • Meets health standards • May have taste/odor issues',
        optimalRange: 'Excellent quality with beneficial minerals - Perfect for all uses',
        whatItMeans: getWaterQualityExplanation(metric.status),
        healthImpacts: getWaterQualityHealthImpacts(metric.status),
        recommendations: getWaterQualityRecommendations(metric.status),
        riskFactors: [
          'Drinking untreated water',
          'Traveling to areas with poor sanitation',
          'Compromised immune system',
          'Pregnancy or young children',
          'Local water treatment issues'
        ]
      }
    };
    return details[metric.id] || {
      description: 'This metric provides important information about your travel environment.',
      whatItMeans: 'Monitor this metric for potential health impacts.',
      recommendations: ['Stay informed about local conditions', 'Take appropriate precautions']
    };
  };

  const getAirQualityExplanation = (status: string) => {
    switch (status) {
      case 'excellent': return 'Air quality is excellent with minimal pollutants. Perfect for outdoor activities and exercise.';
      case 'good': return 'Air quality is good with low levels of pollutants. Safe for most people, including sensitive groups.';
      case 'moderate': return 'Air quality is moderate with some pollutants present. Sensitive individuals may experience minor irritation.';
      case 'poor': return 'Air quality is poor with elevated pollutant levels. Sensitive groups should limit outdoor activities.';
      case 'hazardous': return 'Air quality is hazardous with very high pollutant levels. Everyone should avoid outdoor activities.';
      default: return 'Air quality status is being monitored.';
    }
  };

  const getAirQualityHealthImpacts = (status: string) => {
    switch (status) {
      case 'excellent': return ['No health impacts expected', 'Ideal for outdoor exercise', 'Safe for all age groups'];
      case 'good': return ['Minimal health impacts', 'Safe for most activities', 'Sensitive individuals may notice slight irritation'];
      case 'moderate': return ['Possible irritation for sensitive individuals', 'Consider reducing outdoor exercise', 'Monitor for respiratory symptoms'];
      case 'poor': return ['Increased risk of respiratory irritation', 'Avoid outdoor exercise', 'Sensitive groups should stay indoors'];
      case 'hazardous': return ['Serious health risks for everyone', 'Avoid all outdoor activities', 'Use air purifiers indoors'];
      default: return ['Monitor for any respiratory symptoms'];
    }
  };

  const getAirQualityRecommendations = (status: string) => {
    switch (status) {
      case 'excellent': return ['Enjoy outdoor activities', 'Great time for exercise', 'Open windows for fresh air'];
      case 'good': return ['Outdoor activities are generally safe', 'Monitor sensitive individuals', 'Consider air purifiers if needed'];
      case 'moderate': return ['Limit outdoor exercise', 'Close windows during peak hours', 'Use air purifiers', 'Wear masks if sensitive'];
      case 'poor': return ['Avoid outdoor activities', 'Keep windows closed', 'Use air purifiers', 'Wear N95 masks if going outside'];
      case 'hazardous': return ['Stay indoors with windows closed', 'Use high-efficiency air purifiers', 'Wear N95 masks if necessary', 'Postpone outdoor plans'];
      default: return ['Monitor air quality updates', 'Take appropriate precautions'];
    }
  };

  const getPollenExplanation = (status: string) => {
    switch (status) {
      case 'excellent': return 'Pollen levels are very low. Minimal risk of allergic reactions for most people.';
      case 'good': return 'Pollen levels are low. Most people with mild allergies should be comfortable.';
      case 'moderate': return 'Pollen levels are moderate. People with allergies may experience symptoms.';
      case 'poor': return 'Pollen levels are high. Significant risk of allergic reactions for sensitive individuals.';
      case 'hazardous': return 'Pollen levels are very high. Severe allergic reactions possible for sensitive individuals.';
      default: return 'Pollen levels are being monitored.';
    }
  };

  const getPollenHealthImpacts = (status: string) => {
    switch (status) {
      case 'excellent': return ['No allergy symptoms expected', 'Safe for outdoor activities', 'Ideal for allergy sufferers'];
      case 'good': return ['Minimal allergy symptoms', 'Most people comfortable outdoors', 'Mild symptoms possible for very sensitive individuals'];
      case 'moderate': return ['Allergy symptoms likely for sensitive individuals', 'Sneezing, runny nose, itchy eyes possible', 'Consider allergy medications'];
      case 'poor': return ['Significant allergy symptoms expected', 'Severe reactions possible', 'Avoid outdoor activities if possible'];
      case 'hazardous': return ['Severe allergic reactions likely', 'Asthma attacks possible', 'Stay indoors with windows closed'];
      default: return ['Monitor for allergy symptoms'];
    }
  };

  const getPollenRecommendations = (status: string) => {
    switch (status) {
      case 'excellent': return ['Enjoy outdoor activities', 'Great time for gardening', 'Open windows for fresh air'];
      case 'good': return ['Outdoor activities generally safe', 'Take allergy medications if needed', 'Shower after outdoor activities'];
      case 'moderate': return ['Take allergy medications before going out', 'Avoid outdoor activities in early morning', 'Wear sunglasses and hat', 'Shower and change clothes after being outside'];
      case 'poor': return ['Take allergy medications', 'Limit outdoor activities', 'Keep windows closed', 'Use air purifiers with HEPA filters'];
      case 'hazardous': return ['Stay indoors with windows closed', 'Use air purifiers', 'Take allergy medications', 'Consider seeing an allergist'];
      default: return ['Monitor pollen forecasts', 'Take appropriate allergy precautions'];
    }
  };

  const getWaterQualityExplanation = (status: string) => {
    switch (status) {
      case 'excellent': return 'Water is completely safe to drink with no harmful contaminants. Contains beneficial minerals and meets all health standards. Perfect for drinking, cooking, and all household uses.';
      case 'good': return 'Water is safe to drink with minimal contaminants well below harmful levels. Meets health standards and is suitable for all daily uses including drinking and cooking.';
      case 'moderate': return 'Water is generally safe to drink but may have taste, odor, or minor quality issues. Contaminants are present but below dangerous levels. Consider filtration for better taste.';
      case 'poor': return 'Water has elevated contaminant levels that may pose health risks. Not recommended for drinking without treatment. Use filtered or bottled water for consumption.';
      case 'hazardous': return 'Water is unsafe to drink with high contaminant levels that pose serious health risks. Do not consume tap water. Use only bottled or properly filtered water.';
      default: return 'Water quality is being monitored for safety.';
    }
  };

  const getWaterQualityHealthImpacts = (status: string) => {
    switch (status) {
      case 'excellent': return ['No health risks', 'Provides beneficial minerals', 'Supports optimal hydration'];
      case 'good': return ['Minimal health risks', 'Safe for daily consumption', 'Good for hydration'];
      case 'moderate': return ['Possible gastrointestinal issues', 'May affect taste and odor', 'Consider filtration for sensitive individuals'];
      case 'poor': return ['Increased risk of gastrointestinal illness', 'May cause nausea or diarrhea', 'Avoid drinking untreated water'];
      case 'hazardous': return ['High risk of serious illness', 'Potential for severe gastrointestinal problems', 'Do not drink tap water'];
      default: return ['Monitor for any digestive symptoms'];
    }
  };

  const getWaterQualityRecommendations = (status: string) => {
    switch (status) {
      case 'excellent': return ['Drink tap water freely', 'Great for cooking and hydration', 'No additional treatment needed'];
      case 'good': return ['Tap water is safe to drink', 'Good for daily use', 'Consider filtration for taste preferences'];
      case 'moderate': return ['Use water filters for drinking', 'Boil water for cooking', 'Consider bottled water for sensitive individuals'];
      case 'poor': return ['Use high-quality water filters', 'Drink bottled or filtered water', 'Avoid ice made from tap water'];
      case 'hazardous': return ['Use only bottled or filtered water', 'Avoid tap water completely', 'Use bottled water for cooking and brushing teeth'];
      default: return ['Check local water quality reports', 'Use appropriate water treatment methods'];
    }
  };

  const renderRangeIndicator = (metric: EnvironmentalMetric) => {
    const ranges = {
      'air_quality': {
        segments: [
          { label: 'Good', color: '#30D158', range: '0-50' },
          { label: 'Moderate', color: '#FF9F0A', range: '51-100', isBold: true },
          { label: 'Unhealthy for Sensitive', color: '#FF6B35', range: '101-150' },
          { label: 'Unhealthy', color: '#FF3B30', range: '151-200' },
          { label: 'Hazardous', color: '#8B0000', range: '201+' }
        ],
        currentValue: 75, // Mock value in Moderate range
        currentLabel: 'Moderate'
      },
      'pollen': {
        segments: [
          { label: 'Very Low', color: '#30D158', range: '0-4' },
          { label: 'Low', color: '#32D74B', range: '5-9' },
          { label: 'Moderate', color: '#FF9F0A', range: '10-49' },
          { label: 'High', color: '#FF6B35', range: '50-149' },
          { label: 'Very High', color: '#FF3B30', range: '150+' }
        ],
        currentValue: 25, // Mock value
        currentLabel: 'Moderate'
      },
      'water_quality': {
        segments: [
          { label: 'Poor', color: '#FF3B30', range: '0-44' },
          { label: 'Marginal', color: '#FF6B35', range: '45-64' },
          { label: 'Good', color: '#FF9F0A', range: '65-79', isBold: true },
          { label: 'Very Good', color: '#32D74B', range: '80-94' },
          { label: 'Excellent', color: '#30D158', range: '95-100' }
        ],
        currentValue: 87, // Mock value in Very Good range
        currentLabel: 'Very Good'
      }
    };

    const rangeData = ranges[metric.id as keyof typeof ranges];
    if (!rangeData) return null;

    const barWidth = 300;
    const barHeight = 20;
    const segmentWidth = barWidth / rangeData.segments.length;
    
    // Calculate pointer position based on current value
    let pointerPosition;
    if (metric.id === 'air_quality') {
      // For air quality: 0-300 scale (AQI)
      pointerPosition = Math.min((rangeData.currentValue / 300) * barWidth, barWidth - 10);
    } else if (metric.id === 'pollen') {
      // For pollen: 0-200 scale
      pointerPosition = Math.min((rangeData.currentValue / 200) * barWidth, barWidth - 10);
    } else {
      // For water quality: 0-100 scale
      pointerPosition = (rangeData.currentValue / 100) * barWidth;
    }

    return (
      <View style={styles.rangeIndicatorContainer}>
        <Svg width={barWidth} height={45}>
          {/* Range bar segments with gaps */}
          {rangeData.segments.map((segment, index) => {
            const gap = 2; // Gap between segments
            const totalGaps = (rangeData.segments.length - 1) * gap;
            const availableWidth = barWidth - totalGaps;
            const segmentWidth = availableWidth / rangeData.segments.length;
            const x = index * (segmentWidth + gap);
            
            return (
              <Rect
                key={index}
                x={x}
                y={2}
                width={segmentWidth}
                height={barHeight}
                fill={segment.color}
                rx={index === 0 ? 8 : index === rangeData.segments.length - 1 ? 8 : 0} // First segment: left curve, Last segment: right curve
                ry={index === 0 ? 8 : index === rangeData.segments.length - 1 ? 8 : 0}
              />
            );
          })}
          
          {/* White triangle pointer */}
          <Polygon
            points={`${Math.min(Math.max(pointerPosition, 10), barWidth - 10)},0 ${Math.min(Math.max(pointerPosition - 6, 4), barWidth - 16)},15 ${Math.min(Math.max(pointerPosition + 6, 16), barWidth - 4)},15`}
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          
          {/* Range labels directly in SVG */}
          {rangeData.segments.map((segment, index) => {
            const gap = 2;
            const totalGaps = (rangeData.segments.length - 1) * gap;
            const availableWidth = barWidth - totalGaps;
            const segmentWidth = availableWidth / rangeData.segments.length;
            const x = index * (segmentWidth + gap);
            const centerX = x + (segmentWidth / 2);
            
            return (
              <g key={index}>
                <SvgText
                  x={centerX}
                  y={32}
                  fontSize="10"
                  fill="#FFFFFF"
                  fontWeight={segment.isBold ? "bold" : "600"}
                  textAnchor="middle"
                >
                  {segment.label}
                </SvgText>
                <SvgText
                  x={centerX}
                  y={42}
                  fontSize="10"
                  fill="#8E8E93"
                  textAnchor="middle"
                >
                  {segment.range}
                </SvgText>
              </g>
            );
          })}
        </Svg>
        
        {/* Current score info */}
        <View style={styles.currentScoreContainer}>
          <Text style={styles.currentScoreText}>
            Your score is in the {rangeData.currentLabel} range ({rangeData.currentValue}).
          </Text>
        </View>
      </View>
    );
  };

  // Enhanced modal content for environmental metric details
  const renderMetricModal = () => {
    if (!selectedMetric) return null;
    
    const details = getMetricDetails(selectedMetric);
    const statusColor = getStatusColor(selectedMetric.status);

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Fixed Header */}
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, { backgroundColor: `${statusColor}20` }]}>
                <Ionicons name={selectedMetric.icon} size={32} color={statusColor} />
              </View>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{selectedMetric.label}</Text>
                <Text style={[styles.modalStatus, { color: statusColor }]}>
                  {selectedMetric.value} • Score: {selectedMetric.score}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollContent}>

              {/* Description */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>What is this?</Text>
                <Text style={styles.sectionContent}>{details.description}</Text>
              </View>

              {/* Range Indicator */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Range Indicator</Text>
                {renderRangeIndicator(selectedMetric)}
              </View>

              {/* What it means */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>What this means for you</Text>
                <Text style={styles.sectionContent}>{details.whatItMeans}</Text>
              </View>

              {/* Health impacts */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Potential Health Impacts</Text>
                {details.healthImpacts.map((impact: string, index: number) => (
                  <View key={index} style={styles.impactItem}>
                    <Ionicons name="checkmark-circle" size={16} color={statusColor} />
                    <Text style={styles.impactText}>{impact}</Text>
                  </View>
                ))}
              </View>

              {/* Recommendations */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                {details.recommendations.map((recommendation: string, index: number) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Ionicons name="arrow-forward" size={16} color="#007AFF" />
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>

              {/* Risk factors */}
              <View style={[styles.modalSection, { borderBottomWidth: 0 }]}>
                <Text style={styles.sectionTitle}>Risk Factors</Text>
                {details.riskFactors.map((risk: string, index: number) => (
                  <View key={index} style={styles.riskItem}>
                    <Ionicons name="warning" size={16} color="#FF9500" />
                    <Text style={styles.riskText}>{risk}</Text>
                  </View>
                ))}
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onTravelPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="location" size={20} color="#007AFF" />
          <Text style={styles.title}>Travel Health</Text>
        </View>
        <TouchableOpacity onPress={() => setShowMore(!showMore)}>
          <Text style={styles.moreTabText}>{showMore ? 'Show Less' : 'View All'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.locationContainer}>
        <Text style={styles.currentLocation}>{currentLocation}</Text>
        <Text style={styles.locationSubtitle}>Current Location</Text>
      </View>

      {/* Environmental metrics */}
      <View style={styles.metricsContainer}>
        {environmentalMetrics.map(renderEnvironmentalMetric)}
      </View>

      {jetLagHours > 0 && (
        <View style={styles.jetLagContainer}>
          <View style={styles.jetLagHeader}>
            <Ionicons name={jetLagInfo.icon} size={16} color={jetLagInfo.color} />
            <Text style={[styles.jetLagText, { color: jetLagInfo.color }]}> {jetLagInfo.text} </Text>
          </View>
          <Text style={styles.jetLagAdvice}>
            Consider adjusting sleep schedule gradually
          </Text>
        </View>
      )}

      {/* More tab for additional information */}
      <View style={styles.moreTabContainer}>
        {!showMore && (
          <TouchableOpacity onPress={() => setShowMore(true)} style={styles.moreTab}>
            <Text style={styles.moreTabText}>+ More</Text>
          </TouchableOpacity>
        )}
        {showMore && (
          <>
              {/* Jet Lag Planning Events */}
              {jetLagPlanningEvents.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Jet Lag Planning</Text>
                  {jetLagPlanningEvents.map((event, index) => (
                    <JetLagPlanningCard
                      key={event.id || index}
                      event={event}
                      onPress={() => onJetLagEventPress?.(event)}
                    />
                  ))}
                </>
              )}
              {/* Closest facilities */}
              {closestFacilities.map(facility => (
              <TouchableOpacity
                key={facility.id}
                style={styles.facilityCard}
                onPress={() => handleFacilityPress(facility)}
              >
                  <View style={styles.facilityIconContainer}>
                    <Ionicons 
                      name={facility.type === 'Pharmacy' ? 'medkit' : facility.type === 'Hospital' ? 'business' : 'help-circle'}
                      size={20}
                      color="#30D158"
                    />
                  </View>
                  <View style={styles.facilityInfo}>
                    <Text style={styles.facilityName}>{facility.name}</Text>
                    <Text style={styles.facilityDetails}>{facility.type} • {facility.distance}</Text>
                  </View>
                  <View style={styles.travelTimeContainer}>
                    <Ionicons name="car" size={14} color="#8E8E93" />
                    <Text style={styles.travelTime}>{facility.travelTime}</Text>
                  </View>
              </TouchableOpacity>
              ))}
            <TouchableOpacity onPress={() => setShowMore(false)} style={styles.lessTab}>
              <Text style={styles.lessTabText}>Show Less</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      {renderMetricModal()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  locationContainer: {
    marginBottom: 16,
  },
  currentLocation: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  locationSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  metricsContainer: {
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
  },
  metricCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricCardRight: {
    alignItems: 'flex-end',
  },
  metricScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricScoreLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  jetLagContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FF9F0A20',
  },
  jetLagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  jetLagText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  jetLagAdvice: {
    fontSize: 12,
    color: '#EBEBF5',
    lineHeight: 16,
  },
  jetLagPlanCard: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#007AFF40',
    alignItems: 'center',
  },
  jetLagPlanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 2,
  },
  jetLagPlanSubtitle: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 8,
  },
  jetLagPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  jetLagPlanButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  moreTabContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  moreTab: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  moreTabText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  facilitiesList: {
    backgroundColor: '#232323',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },

  facilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
  },
  facilityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#30D15820',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  facilityInfo: {
    flex: 1,
  },
  travelTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  travelTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  facilityName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  facilityDetails: {
    color: '#8E8E93',
    fontSize: 12,
  },
  lessTab: {
    alignItems: 'center',
    paddingVertical: 6,
    marginTop: 4,
  },
  lessTabText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 13,
  },
  // Enhanced modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%',
    maxWidth: 400,
    flex: 1,
  },
  modalScrollContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  modalSection: {
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: '#EBEBF5',
    lineHeight: 22,
  },
  rangeContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
  },
  rangeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rangeLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  rangeValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  impactText: {
    fontSize: 14,
    color: '#EBEBF5',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#EBEBF5',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  riskText: {
    fontSize: 14,
    color: '#EBEBF5',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  rangeIndicatorContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  currentScoreContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  currentScoreText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default TravelHealthSummary; 