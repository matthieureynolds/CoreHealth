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

  // Mock Jet Lag Planning event (matches screenshot)
  const jetLagPlanningEvent = {
    id: 'bangkok-thailand',
    destination: 'Bangkok, Thailand',
    timeZoneDifference: 5,
    departureDate: '2025-07-21T00:00:00Z',
    daysToAdjust: 4,
    preparationStartDate: '2025-07-17T00:00:00Z',
    sleepAdjustment: {
      dailySchedule: [
        { day: 1, bedtime: '21:30', wakeTime: '06:30', adjustment: 1.5 },
        { day: 2, bedtime: '21:00', wakeTime: '06:00', adjustment: 1.5 },
        { day: 3, bedtime: '20:30', wakeTime: '05:30', adjustment: 1.5 },
        { day: 4, bedtime: '20:00', wakeTime: '05:00', adjustment: 0.5 },
      ],
    },
  };

  // Mock closest facilities
  const closestFacilities = [
    { id: 'pharmacy1', name: 'City Pharmacy', type: 'Pharmacy', distance: '0.4 mi', travelTime: '4 mins' },
    { id: 'hospital1', name: 'Central Hospital', type: 'Hospital', distance: '1.2 mi', travelTime: '8 mins' },
  ];

  const [showMore, setShowMore] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<EnvironmentalMetric | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleMetricPress = (metric: EnvironmentalMetric) => {
    setSelectedMetric(metric);
    setModalVisible(true);
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
        {environmentalMetrics.map(metric => (
          <TouchableOpacity key={metric.id} style={styles.metricCard} onPress={() => handleMetricPress(metric)}>
            <View style={styles.metricCardContent}>
              <View style={styles.metricCardLeft}>
                <View style={[styles.metricIconContainer, { backgroundColor: `${getStatusColor(metric.status)}20` }]}>
                  <Ionicons name={metric.icon} size={24} color={getStatusColor(metric.status)} />
                </View>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={[styles.metricValue, { color: getStatusColor(metric.status) }]}>{metric.value}</Text>
                </View>
              </View>
              <View style={styles.metricCardRight}>
                <Text style={[styles.metricScore, { color: getStatusColor(metric.status) }]}>{metric.score}</Text>
                <Text style={styles.metricScoreLabel}>Score</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Jet Lag Planning Card (mock data) */}
      <JetLagPlanningCard event={jetLagPlanningEvent} />

      {/* More tab for additional information */}
      <View style={styles.moreTabContainer}>
        {!showMore && (
          <TouchableOpacity onPress={() => setShowMore(true)} style={styles.moreTab}>
            <Text style={styles.moreTabText}>+ More</Text>
          </TouchableOpacity>
        )}
        {showMore && (
          <View style={styles.facilitiesList}>
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