import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const handleMetricPress = (metric: EnvironmentalMetric) => {
    setSelectedMetric(metric);
    setModalVisible(true);
  };

  // Mock closest facilities
  const closestFacilities = [
    { id: 'pharmacy1', name: 'City Pharmacy', type: 'Pharmacy', distance: '0.4 mi', travelTime: '4 mins' },
    { id: 'hospital1', name: 'Central Hospital', type: 'Hospital', distance: '1.2 mi', travelTime: '8 mins' },
  ];

  const renderEnvironmentalMetric = (metric: EnvironmentalMetric) => {
    const statusColor = getStatusColor(metric.status);
    return (
      <TouchableOpacity key={metric.id} style={styles.metricCard} onPress={() => handleMetricPress(metric)}>
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
          <View style={styles.facilitiesList}>
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
              <View key={facility.id} style={styles.facilityItem}>
                <View style={styles.facilityIconContainer}>
                  <Ionicons 
                    name={facility.type === 'Pharmacy' ? 'medkit' : 'business'} 
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
              </View>
            ))}
            <TouchableOpacity onPress={() => setShowMore(false)} style={styles.lessTab}>
              <Text style={styles.lessTabText}>Show Less</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Environmental Metric Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 24, width: '85%', alignItems: 'center' }}>
            <Ionicons name={selectedMetric?.icon || 'information-circle-outline'} size={40} color={getStatusColor(selectedMetric?.status || 'good')} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 }}>{selectedMetric?.label}</Text>
            <Text style={{ fontSize: 18, color: getStatusColor(selectedMetric?.status || 'good'), marginBottom: 8 }}>{selectedMetric?.value} ({selectedMetric?.score})</Text>
            <Text style={{ fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 16 }}>
              {selectedMetric?.id === 'air_quality' && 'Air quality reflects the concentration of pollutants in the air. Poor air quality can affect respiratory health, especially for sensitive groups.'}
              {selectedMetric?.id === 'pollen' && 'Pollen levels indicate the amount of pollen in the air, which can trigger allergies and respiratory symptoms in sensitive individuals.'}
              {selectedMetric?.id === 'water_quality' && 'Water quality measures the safety and cleanliness of local water sources. Excellent water quality is important for hydration and health.'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 8, padding: 10 }}>
              <Text style={{ color: '#007AFF', fontWeight: '600', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 4,
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
});

export default TravelHealthSummary; 