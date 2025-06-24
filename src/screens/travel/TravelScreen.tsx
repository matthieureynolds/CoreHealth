import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHealthData } from '../../context/HealthDataContext';

const TravelScreen: React.FC = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const { travelHealth, updateLocation } = useHealthData();

  const handleLocationSearch = () => {
    if (searchLocation.trim()) {
      updateLocation(searchLocation);
      setSearchLocation('');
    }
  };

  const getAirQualityColor = (aqi: number) => {
    if (aqi <= 50) return '#30D158';
    if (aqi <= 100) return '#FF9500';
    if (aqi <= 150) return '#FF5722';
    return '#FF3B30';
  };

  const getAirQualityLabel = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    return 'Unhealthy';
  };

  const getWaterQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return '#30D158';
      case 'good': return '#32D74B';
      case 'fair': return '#FF9500';
      case 'poor': return '#FF3B30';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Travel Health</Text>
        <Text style={styles.subtitle}>
          Get health insights for your current location and travel destinations
        </Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a location..."
            value={searchLocation}
            onChangeText={setSearchLocation}
            onSubmitEditing={handleLocationSearch}
          />
        </View>
        <TouchableOpacity style={styles.currentLocationButton}>
          <Ionicons name="location" size={20} color="#007AFF" />
          <Text style={styles.currentLocationText}>Use Current Location</Text>
        </TouchableOpacity>
      </View>

      {travelHealth && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Overview - {travelHealth.location}</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="cloud" size={24} color={getAirQualityColor(travelHealth.airQualityIndex)} />
                <Text style={styles.metricTitle}>Air Quality</Text>
              </View>
              <Text style={styles.metricValue}>{travelHealth.airQualityIndex}</Text>
              <Text style={[styles.metricLabel, { color: getAirQualityColor(travelHealth.airQualityIndex) }]}>
                {getAirQualityLabel(travelHealth.airQualityIndex)}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="water" size={24} color={getWaterQualityColor(travelHealth.waterQuality)} />
                <Text style={styles.metricTitle}>Water Quality</Text>
              </View>
              <Text style={[styles.metricLabel, { color: getWaterQualityColor(travelHealth.waterQuality) }]}>
                {travelHealth.waterQuality.charAt(0).toUpperCase() + travelHealth.waterQuality.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.vaccinationsCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
              <Text style={styles.cardTitle}>Recommended Vaccinations</Text>
            </View>
            <View style={styles.vaccinationsList}>
              {travelHealth.vaccinations.map((vaccine, index) => (
                <View key={index} style={styles.vaccinationItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#30D158" />
                  <Text style={styles.vaccinationText}>{vaccine}</Text>
                </View>
              ))}
            </View>
          </View>

          {travelHealth.localOutbreaks.length > 0 && (
            <View style={styles.alertsCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="warning" size={24} color="#FF3B30" />
                <Text style={styles.cardTitle}>Local Health Alerts</Text>
              </View>
              <View style={styles.alertsList}>
                {travelHealth.localOutbreaks.map((outbreak, index) => (
                  <View key={index} style={styles.alertItem}>
                    <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                    <Text style={styles.alertText}>{outbreak}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {travelHealth.healthAlerts.length > 0 && (
            <View style={styles.alertsCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle" size={24} color="#FF9500" />
                <Text style={styles.cardTitle}>Health Recommendations</Text>
              </View>
              <View style={styles.alertsList}>
                {travelHealth.healthAlerts.map((alert, index) => (
                  <View key={index} style={styles.alertItem}>
                    <Ionicons name="bulb" size={20} color="#FF9500" />
                    <Text style={styles.alertText}>{alert}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Travel Health Tips</Text>
        <View style={styles.tipsCard}>
          <View style={styles.tipItem}>
            <Ionicons name="water-outline" size={20} color="#007AFF" />
            <Text style={styles.tipText}>Stay hydrated and drink bottled water when uncertain</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="medical-outline" size={20} color="#007AFF" />
            <Text style={styles.tipText}>Pack a basic first aid kit with your medications</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="shield-outline" size={20} color="#007AFF" />
            <Text style={styles.tipText}>Check vaccination requirements 4-6 weeks before travel</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="fitness-outline" size={20} color="#007AFF" />
            <Text style={styles.tipText}>Maintain your regular exercise routine when possible</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    lineHeight: 22,
  },
  searchSection: {
    margin: 20,
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentLocationText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  section: {
    margin: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  vaccinationsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  vaccinationsList: {
    marginTop: 8,
  },
  vaccinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vaccinationText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 8,
  },
  alertsList: {
    marginTop: 8,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 8,
    flex: 1,
  },
  tipsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default TravelScreen; 