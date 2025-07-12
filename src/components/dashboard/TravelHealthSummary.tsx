import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  plannedTrip?: { destination: string; date: string };
  onJetLagPlanPress?: () => void;
}

const TravelHealthSummary: React.FC<TravelHealthSummaryProps> = ({ 
  currentLocation = 'New York, NY',
  jetLagHours = 0,
  onTravelPress,
  plannedTrip,
  onJetLagPlanPress
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

  // Mock planned trip if jetLagHours === 0
  const showJetLagPlanning = plannedTrip || jetLagHours === 0;
  const trip = plannedTrip || { destination: 'Sydney, Australia', date: '2024-08-15' };

  const [showMore, setShowMore] = useState(false);

  // Mock closest facilities
  const closestFacilities = [
    { id: 'pharmacy1', name: 'City Pharmacy', type: 'Pharmacy', distance: '0.4 mi' },
    { id: 'hospital1', name: 'Central Hospital', type: 'Hospital', distance: '1.2 mi' },
  ];

  const renderEnvironmentalMetricTab = (metric: EnvironmentalMetric) => {
    const statusColor = getStatusColor(metric.status);
    return (
      <View key={metric.id} style={[styles.metricTab, { borderBottomColor: statusColor }]}>
        <View style={styles.metricTabContent}>
          <Ionicons name={metric.icon} size={16} color={statusColor} />
          <Text style={[styles.metricTabScore, { color: statusColor }]}>{metric.score}</Text>
          <Text style={styles.metricTabLabel}>{metric.label}</Text>
        </View>
      </View>
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

      {/* Modern tabs for Air Quality, Pollen, Water */}
      <View style={styles.metricTabsContainer}>
        {environmentalMetrics.map(renderEnvironmentalMetricTab)}
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

      {/* Jet Lag Planning Card */}
      {showJetLagPlanning && (
        <View style={styles.jetLagPlanCard}>
          <Text style={styles.jetLagPlanTitle}>Jet Lag Planning</Text>
          <Text style={styles.jetLagPlanSubtitle}>Upcoming Trip: {trip.destination} ({trip.date})</Text>
          <TouchableOpacity style={styles.jetLagPlanButton} onPress={onJetLagPlanPress}>
            <Ionicons name="airplane" size={16} color="#fff" />
            <Text style={styles.jetLagPlanButtonText}>Start Jet Lag Plan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* More tab for closest pharmacy/hospital */}
      <View style={styles.moreTabContainer}>
        {!showMore && (
          <TouchableOpacity onPress={() => setShowMore(true)} style={styles.moreTab}>
            <Text style={styles.moreTabText}>+ More</Text>
          </TouchableOpacity>
        )}
        {showMore && (
          <View style={styles.facilitiesList}>
            {closestFacilities.map(facility => (
              <View key={facility.id} style={styles.facilityItem}>
                <Ionicons name={facility.type === 'Pharmacy' ? 'medkit' : 'medkit-outline'} size={18} color="#30D158" style={{ marginRight: 8 }} />
                <View>
                  <Text style={styles.facilityName}>{facility.name}</Text>
                  <Text style={styles.facilityDetails}>{facility.type} • {facility.distance}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={() => setShowMore(false)} style={styles.lessTab}>
              <Text style={styles.lessTabText}>Show Less</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  metricTabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 4,
  },
  metricTab: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  metricTabContent: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  metricTabScore: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  metricTabLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
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
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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