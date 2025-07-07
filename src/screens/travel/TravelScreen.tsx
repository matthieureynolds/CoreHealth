import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHealthData } from '../../context/HealthDataContext';
import { 
  RiskLevel, 
  HealthMetric, 
  VaccinationInfo, 
  HealthcareFacility, 
  EmergencyContacts, 
  JetLagData, 
  TimeZoneInfo,
  WeatherData,
  ExtremeHeatWarning,
  HydrationRecommendation,
  ActivitySafetyData
} from '../../types';
import { formatDistance, getFacilityIcon } from '../../services/healthcarePlacesService';
import { getActivitySafetyColor } from '../../services/activitySafetyService';
import { getHydrationRiskColor } from '../../services/hydrationService';

const TravelScreen: React.FC = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showOriginTimezoneModal, setShowOriginTimezoneModal] = useState(false);
  const [originTimezoneInput, setOriginTimezoneInput] = useState('');
  const { travelHealth, updateLocation, getCurrentLocation, updateTravelHealthData, setOriginTimezone, calculateJetLag } = useHealthData();

  const handleLocationSearch = async () => {
    if (searchLocation.trim()) {
      await updateLocation(searchLocation);
      setSearchLocation('');
    }
  };

  const handleCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const locationData = await getCurrentLocation();
      if (locationData) {
        await updateTravelHealthData(locationData);
      } else {
        Alert.alert(
          'Location Access',
          'Unable to get your current location. Please check your location permissions.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleRefresh = async () => {
    if (travelHealth) {
      setIsRefreshing(true);
      try {
        if (travelHealth.coordinates) {
          const locationData = {
            name: travelHealth.location,
            country: 'Unknown',
            coordinates: travelHealth.coordinates,
            timezone: 'UTC',
            elevation: typeof travelHealth.altitudeRisk.value === 'number' ? travelHealth.altitudeRisk.value : 0,
          };
          await updateTravelHealthData(locationData);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to refresh data. Please try again.');
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleSetOriginTimezone = async () => {
    if (originTimezoneInput.trim()) {
      try {
        await setOriginTimezone(originTimezoneInput.trim());
        setShowOriginTimezoneModal(false);
        setOriginTimezoneInput('');
        Alert.alert('Success', 'Origin timezone set successfully!');
      } catch (error) {
        Alert.alert('Error', 'Failed to set origin timezone. Please try again.');
      }
    }
  };

  const getRiskColor = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low':
        return '#30D158';
      case 'moderate':
        return '#FF9500';
      case 'high':
        return '#FF5722';
      case 'severe':
        return '#FF3B30';
      default:
        return '#666';
    }
  };

  const renderHealthCard = (metric: HealthMetric, title: string) => (
    <View style={styles.healthCard}>
      <View style={styles.cardHeader}>
        <Ionicons
          name={metric.icon as any}
          size={24}
          color={getRiskColor(metric.riskLevel)}
        />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.metricValue}>
          {metric.value} {metric.unit && <Text style={styles.metricUnit}>{metric.unit}</Text>}
        </Text>
        <Text style={[styles.metricStatus, { color: getRiskColor(metric.riskLevel) }]}>
          {metric.status}
        </Text>
        <Text style={styles.metricDescription}>{metric.description}</Text>
        <View style={styles.recommendationContainer}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.recommendationText}>{metric.recommendation}</Text>
      </View>
      </View>
    </View>
  );

  const renderVaccinationCard = (vaccinations: VaccinationInfo) => (
    <View style={styles.healthCard}>
      <View style={styles.cardHeader}>
          <Ionicons
          name={vaccinations.icon as any}
          size={24}
          color={getRiskColor(vaccinations.riskLevel)}
          />
        <Text style={styles.cardTitle}>Vaccinations</Text>
        </View>
      <View style={styles.cardContent}>
        <Text style={styles.metricDescription}>{vaccinations.description}</Text>
        
        {vaccinations.required.length > 0 && (
          <View style={styles.vaccinationSection}>
            <Text style={styles.vaccinationSectionTitle}>Required</Text>
            {vaccinations.required.map((vaccine, index) => (
              <View key={index} style={styles.vaccinationItem}>
                <Ionicons name="checkmark-circle" size={16} color="#FF3B30" />
                <Text style={styles.vaccinationText}>{vaccine}</Text>
      </View>
            ))}
          </View>
        )}
        
        {vaccinations.recommended.length > 0 && (
          <View style={styles.vaccinationSection}>
            <Text style={styles.vaccinationSectionTitle}>Recommended</Text>
            {vaccinations.recommended.map((vaccine, index) => (
              <View key={index} style={styles.vaccinationItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#007AFF" />
                <Text style={styles.vaccinationText}>{vaccine}</Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.recommendationContainer}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.recommendationText}>{vaccinations.recommendation}</Text>
        </View>
      </View>
    </View>
  );

  const renderHealthcareFacility = (facility: HealthcareFacility) => (
    <View style={styles.healthCard}>
      <View style={styles.cardHeader}>
                <Ionicons
          name="medical"
                  size={24}
          color="#007AFF"
                />
        <Text style={styles.cardTitle}>{facility.name}</Text>
              </View>
      <View style={styles.cardContent}>
              <Text style={styles.metricValue}>
          {facility.distance ? formatDistance(facility.distance) : 'Unknown distance'}
              </Text>
        <Text style={[styles.metricStatus, { color: '#007AFF' }]}>
          {facility.type.replace('_', ' ')}
        </Text>
        <Text style={styles.metricDescription}>
          {facility.address}
          {facility.rating && ` • Rating: ${facility.rating}⭐`}
          {facility.openingHours?.openNow ? ' • Open Now' : facility.openingHours?.openNow === false ? ' • Closed' : ''}
        </Text>
        {facility.phoneNumber && (
          <TouchableOpacity 
            style={styles.recommendationContainer}
            onPress={() => Linking.openURL(`tel:${facility.phoneNumber}`)}
          >
            <Ionicons name="call-outline" size={16} color="#007AFF" />
            <Text style={[styles.recommendationText, { color: '#007AFF' }]}>
              {facility.phoneNumber}
              </Text>
          </TouchableOpacity>
        )}
            </View>
    </View>
  );

  const renderHealthcareFacilities = (facilities: any) => {
    if (!facilities || facilities.total === 0) return null;
    
    return (
      <View style={styles.healthCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="medical" size={24} color="#007AFF" />
          <Text style={styles.cardTitle}>Nearby Healthcare ({facilities.total})</Text>
              </View>
        <View style={styles.cardContent}>
          {facilities.nearestHospital && (
            <View style={styles.facilityItem}>
              <Ionicons name="business" size={16} color="#FF3B30" />
              <View style={styles.facilityInfo}>
                <Text style={styles.facilityName}>{facilities.nearestHospital.name}</Text>
                <Text style={styles.facilityDistance}>
                  {formatDistance(facilities.nearestHospital.distance || 0)} away
                </Text>
              </View>
            </View>
          )}
          {facilities.nearestPharmacy && (
            <View style={styles.facilityItem}>
              <Ionicons name="medical" size={16} color="#30D158" />
              <View style={styles.facilityInfo}>
                <Text style={styles.facilityName}>{facilities.nearestPharmacy.name}</Text>
                <Text style={styles.facilityDistance}>
                  {formatDistance(facilities.nearestPharmacy.distance || 0)} away
                </Text>
              </View>
            </View>
          )}
          <Text style={styles.facilityCount}>
            {facilities.hospitals.length} hospitals • {facilities.pharmacies.length} pharmacies • {facilities.clinics.length} clinics
          </Text>
        </View>
      </View>
    );
  };

  const renderEmergencyContacts = (contacts: EmergencyContacts) => (
    <View style={styles.healthCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="call" size={24} color="#FF3B30" />
        <Text style={styles.cardTitle}>Emergency Contacts - {contacts.country}</Text>
      </View>
      <View style={styles.cardContent}>
        <TouchableOpacity 
          style={styles.emergencyItem}
          onPress={() => Linking.openURL(`tel:${contacts.emergency}`)}
        >
          <Ionicons name="alert-circle" size={16} color="#FF3B30" />
          <Text style={styles.emergencyLabel}>Emergency:</Text>
          <Text style={styles.emergencyNumber}>{contacts.emergency}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.emergencyItem}
          onPress={() => Linking.openURL(`tel:${contacts.ambulance}`)}
        >
          <Ionicons name="medical" size={16} color="#FF3B30" />
          <Text style={styles.emergencyLabel}>Ambulance:</Text>
          <Text style={styles.emergencyNumber}>{contacts.ambulance}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.emergencyItem}
          onPress={() => Linking.openURL(`tel:${contacts.police}`)}
        >
          <Ionicons name="shield" size={16} color="#007AFF" />
          <Text style={styles.emergencyLabel}>Police:</Text>
          <Text style={styles.emergencyNumber}>{contacts.police}</Text>
        </TouchableOpacity>

        {contacts.touristHotline && (
          <TouchableOpacity 
            style={styles.emergencyItem}
            onPress={() => Linking.openURL(`tel:${contacts.touristHotline}`)}
          >
            <Ionicons name="information-circle" size={16} color="#30D158" />
            <Text style={styles.emergencyLabel}>Tourist Help:</Text>
            <Text style={styles.emergencyNumber}>{contacts.touristHotline}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderTimeZoneInfo = (timeZoneInfo: TimeZoneInfo) => (
    <View style={styles.healthCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="time" size={24} color="#007AFF" />
        <Text style={styles.cardTitle}>Local Time & Timezone</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.metricValue}>{timeZoneInfo.currentTime}</Text>
        <Text style={styles.metricStatus}>{timeZoneInfo.currentDate}</Text>
        <Text style={styles.metricDescription}>
          Timezone: {timeZoneInfo.timezone}
              </Text>
        <TouchableOpacity 
          style={styles.recommendationContainer}
          onPress={() => setShowOriginTimezoneModal(true)}
        >
          <Ionicons name="settings-outline" size={16} color="#007AFF" />
          <Text style={[styles.recommendationText, { color: '#007AFF' }]}>
            Set origin timezone for jet lag calculations
          </Text>
        </TouchableOpacity>
            </View>
          </View>
  );

  const renderJetLagCard = (jetLagData: JetLagData) => (
    <View style={styles.healthCard}>
            <View style={styles.cardHeader}>
        <Ionicons name="airplane" size={24} color="#FF9500" />
        <Text style={styles.cardTitle}>Jet Lag Assessment</Text>
            </View>
      <View style={styles.cardContent}>
        <Text style={styles.metricValue}>
          {Math.abs(jetLagData.timeZoneDifference)} hours
        </Text>
        <Text style={[styles.metricStatus, { color: getSeverityColor(jetLagData.severity) }]}>
          {jetLagData.severity.charAt(0).toUpperCase() + jetLagData.severity.slice(1)} Jet Lag
        </Text>
        <Text style={styles.metricDescription}>
          From {jetLagData.originLocation} to {jetLagData.destinationLocation}
          {'\n'}Estimated recovery: {jetLagData.estimatedRecoveryDays} days
        </Text>
        
        <View style={styles.recommendationContainer}>
          <Ionicons name="bed-outline" size={16} color="#666" />
          <Text style={styles.recommendationText}>
            Sleep Adjustment: {jetLagData.sleepAdjustment.strategy}
            {'\n'}Days to adjust: {jetLagData.sleepAdjustment.daysToAdjust} 
            (max {jetLagData.sleepAdjustment.maxDailyAdjustment}h/day)
          </Text>
        </View>

        {jetLagData.sleepAdjustment.dailySchedule.length > 0 && (
          <View style={styles.jetLagSchedule}>
            <Text style={styles.jetLagSectionTitle}>Sleep Schedule Adjustment</Text>
            {jetLagData.sleepAdjustment.dailySchedule.slice(0, 3).map((schedule, index) => (
              <View key={index} style={styles.scheduleItem}>
                <Text style={styles.scheduleDay}>Day {schedule.day}:</Text>
                <Text style={styles.scheduleTime}>
                  Sleep: {schedule.bedtime} - Wake: {schedule.wakeTime}
                </Text>
                </View>
              ))}
            {jetLagData.sleepAdjustment.dailySchedule.length > 3 && (
              <Text style={styles.scheduleMore}>
                +{jetLagData.sleepAdjustment.dailySchedule.length - 3} more days...
              </Text>
            )}
            </View>
        )}

        <View style={styles.jetLagSchedule}>
          <Text style={styles.jetLagSectionTitle}>Light Exposure Schedule</Text>
          <Text style={styles.lightScheduleText}>
            {jetLagData.lightExposureSchedule.strategy}
          </Text>
          {jetLagData.lightExposureSchedule.schedule.slice(0, 2).map((schedule, index) => (
            <View key={index} style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>
                Morning light: {schedule.morningLight} • Avoid: {schedule.eveningAvoidance}
              </Text>
            </View>
          ))}
          </View>

        <View style={styles.recommendationContainer}>
          <Ionicons name="bulb-outline" size={16} color="#30D158" />
          <Text style={styles.recommendationText}>
            {jetLagData.recommendations.slice(0, 2).join('. ')}
          </Text>
        </View>
      </View>
    </View>
  );

  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'low':
        return '#30D158';
      case 'moderate':
        return '#FF5722';
      case 'severe':
        return '#FF3B30';
      default:
        return '#666';
    }
  };

  // New render functions for weather and health safety features
  const renderWeatherCard = (weatherData: WeatherData) => (
    <View style={styles.healthCard}>
              <View style={styles.cardHeader}>
        <Ionicons
          name="partly-sunny"
          size={24}
          color="#007AFF"
        />
        <Text style={styles.cardTitle}>Current Weather</Text>
              </View>
      <View style={styles.cardContent}>
        <View style={styles.weatherMetrics}>
          <View style={styles.weatherMetric}>
            <Text style={styles.weatherValue}>{weatherData.temperature}°C</Text>
            <Text style={styles.weatherLabel}>Temperature</Text>
                  </View>
          <View style={styles.weatherMetric}>
            <Text style={styles.weatherValue}>{weatherData.feelsLike}°C</Text>
            <Text style={styles.weatherLabel}>Feels Like</Text>
          </View>
          <View style={styles.weatherMetric}>
            <Text style={styles.weatherValue}>{weatherData.humidity}%</Text>
            <Text style={styles.weatherLabel}>Humidity</Text>
          </View>
        </View>
        <Text style={styles.metricDescription}>
          {weatherData.description} • Wind: {weatherData.windSpeed} m/s
        </Text>
      </View>
    </View>
  );

  const renderHeatWarningCard = (heatWarning: ExtremeHeatWarning) => {
    if (!heatWarning.isActive) return null;

    const getSeverityColor = (severity: string): string => {
      switch (severity) {
        case 'extreme': return '#FF3B30';
        case 'high': return '#FF5722';
        case 'moderate': return '#FF9500';
        default: return '#666';
      }
    };

    return (
      <View style={[styles.healthCard, { borderLeftWidth: 4, borderLeftColor: getSeverityColor(heatWarning.severity) }]}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="thermometer"
            size={24}
            color={getSeverityColor(heatWarning.severity)}
          />
          <Text style={styles.cardTitle}>Heat Warning</Text>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(heatWarning.severity) }]}>
            <Text style={styles.severityBadgeText}>{heatWarning.severity.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.heatMetrics}>
            <View style={styles.heatMetric}>
              <Text style={styles.heatValue}>{heatWarning.temperature}°C</Text>
              <Text style={styles.heatLabel}>Temperature</Text>
            </View>
            <View style={styles.heatMetric}>
              <Text style={styles.heatValue}>{heatWarning.heatIndex}°C</Text>
              <Text style={styles.heatLabel}>Heat Index</Text>
            </View>
            {heatWarning.uvIndex && (
              <View style={styles.heatMetric}>
                <Text style={styles.heatValue}>{heatWarning.uvIndex}</Text>
                <Text style={styles.heatLabel}>UV Index</Text>
              </View>
            )}
          </View>
          
          {heatWarning.warnings.length > 0 && (
            <View style={styles.warningsSection}>
              <Text style={styles.warningsTitle}>⚠️ Warnings:</Text>
              {heatWarning.warnings.map((warning, index) => (
                <Text key={index} style={styles.warningText}>• {warning}</Text>
                ))}
              </View>
          )}
          
          {heatWarning.recommendations.length > 0 && (
            <View style={styles.recommendationsSection}>
              <Text style={styles.recommendationsTitle}>💡 Recommendations:</Text>
              {heatWarning.recommendations.slice(0, 3).map((rec, index) => (
                <Text key={index} style={styles.recommendationText}>• {rec}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderHydrationCard = (hydration: HydrationRecommendation) => (
    <View style={[styles.healthCard, { borderLeftWidth: 4, borderLeftColor: getHydrationRiskColor(hydration.dehydrationRisk) }]}>
              <View style={styles.cardHeader}>
        <Ionicons
          name="water"
          size={24}
          color={getHydrationRiskColor(hydration.dehydrationRisk)}
        />
        <Text style={styles.cardTitle}>Hydration Guide</Text>
        <View style={[styles.riskBadge, { backgroundColor: getHydrationRiskColor(hydration.dehydrationRisk) }]}>
          <Text style={styles.riskBadgeText}>{hydration.dehydrationRisk.toUpperCase()}</Text>
              </View>
                  </View>
      <View style={styles.cardContent}>
        <View style={styles.hydrationMetrics}>
          <View style={styles.hydrationMetric}>
            <Text style={styles.hydrationValue}>{hydration.dailyIntake}L</Text>
            <Text style={styles.hydrationLabel}>Daily Target</Text>
          </View>
          <View style={styles.hydrationMetric}>
            <Text style={styles.hydrationValue}>{hydration.hourlyIntake}ml</Text>
            <Text style={styles.hydrationLabel}>Per Hour</Text>
          </View>
        </View>

        <View style={styles.adjustmentsSection}>
          <Text style={styles.adjustmentsTitle}>Climate Adjustments:</Text>
          <View style={styles.adjustmentsList}>
            {hydration.adjustments.temperature > 0 && (
              <Text style={styles.adjustmentText}>Heat: +{hydration.adjustments.temperature}ml</Text>
            )}
            {hydration.adjustments.altitude > 0 && (
              <Text style={styles.adjustmentText}>Altitude: +{hydration.adjustments.altitude}ml</Text>
            )}
            {hydration.adjustments.humidity > 0 && (
              <Text style={styles.adjustmentText}>Humidity: +{hydration.adjustments.humidity}ml</Text>
            )}
          </View>
        </View>

        {hydration.warnings.length > 0 && (
          <View style={styles.warningsSection}>
            <Text style={styles.warningsTitle}>⚠️ Warnings:</Text>
            {hydration.warnings.map((warning, index) => (
              <Text key={index} style={styles.warningText}>• {warning}</Text>
                ))}
              </View>
        )}

        <View style={styles.recommendationsSection}>
          <Text style={styles.recommendationsTitle}>💡 Tips:</Text>
          {hydration.recommendations.slice(0, 2).map((rec, index) => (
            <Text key={index} style={styles.recommendationText}>• {rec}</Text>
          ))}
        </View>
      </View>
    </View>
  );

  const renderActivitySafetyCard = (activitySafety: ActivitySafetyData) => (
    <View style={[styles.healthCard, { borderLeftWidth: 4, borderLeftColor: getActivitySafetyColor(activitySafety.outdoorSafety) }]}>
      <View style={styles.cardHeader}>
        <Ionicons
          name="fitness"
          size={24}
          color={getActivitySafetyColor(activitySafety.outdoorSafety)}
        />
        <Text style={styles.cardTitle}>Activity Safety</Text>
        <View style={[styles.safetyBadge, { backgroundColor: getActivitySafetyColor(activitySafety.outdoorSafety) }]}>
          <Text style={styles.safetyBadgeText}>{activitySafety.outdoorSafety.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.safetyAssessment}>
          <Text style={styles.assessmentTitle}>Current Conditions:</Text>
          <Text style={styles.assessmentText}>Weather: {activitySafety.weatherImpact}</Text>
          <Text style={styles.assessmentText}>Air Quality: {activitySafety.airQualityImpact}</Text>
          <Text style={styles.assessmentText}>Combined Risk: {activitySafety.combinedRisk}</Text>
        </View>

        {activitySafety.bestTimes.length > 0 && (
          <View style={styles.bestTimesSection}>
            <Text style={styles.bestTimesTitle}>🕐 Best Times for Exercise:</Text>
            {activitySafety.bestTimes.slice(0, 3).map((time, index) => (
              <Text key={index} style={styles.bestTimeText}>• {time}</Text>
            ))}
            </View>
          )}

        {activitySafety.warnings.length > 0 && (
          <View style={styles.warningsSection}>
            <Text style={styles.warningsTitle}>⚠️ Safety Warnings:</Text>
            {activitySafety.warnings.slice(0, 2).map((warning, index) => (
              <Text key={index} style={styles.warningText}>• {warning}</Text>
            ))}
        </View>
      )}

        <View style={styles.recommendationsSection}>
          <Text style={styles.recommendationsTitle}>💡 Activity Recommendations:</Text>
          {activitySafety.recommendations.slice(0, 3).map((rec, index) => (
            <Text key={index} style={styles.recommendationText}>• {rec}</Text>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Travel Health Dashboard</Text>
        <Text style={styles.subtitle}>
          Personal health insights for your location
        </Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a location..."
            value={searchLocation}
            onChangeText={setSearchLocation}
            onSubmitEditing={handleLocationSearch}
          />
        </View>
        <TouchableOpacity 
          style={[styles.currentLocationButton, isGettingLocation && styles.buttonDisabled]}
          onPress={handleCurrentLocation}
          disabled={isGettingLocation}
        >
          <Ionicons 
            name={isGettingLocation ? "hourglass" : "location"} 
            size={20} 
            color="#007AFF" 
          />
          <Text style={styles.currentLocationText}>
            {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
          </Text>
        </TouchableOpacity>
      </View>

      {travelHealth && (
      <View style={styles.section}>
          <View style={styles.locationHeader}>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <Text style={styles.locationText}>{travelHealth.location}</Text>
            </View>
            <Text style={styles.lastUpdated}>
              Last updated: {travelHealth.lastUpdated.toLocaleTimeString()}
            </Text>
          </View>

          <View style={styles.overallRiskBanner}>
                <Ionicons
              name="shield-checkmark"
                  size={24}
              color={getRiskColor(travelHealth.overallRiskLevel)}
            />
            <Text style={styles.overallRiskText}>
              Overall Risk Level: {' '}
              <Text style={[styles.riskLevelText, { color: getRiskColor(travelHealth.overallRiskLevel) }]}>
                {travelHealth.overallRiskLevel.toUpperCase()}
              </Text>
            </Text>
          </View>

          {/* Add timezone and jet lag components */}
          {travelHealth.timeZoneInfo && renderTimeZoneInfo(travelHealth.timeZoneInfo)}
          {travelHealth.jetLagData && renderJetLagCard(travelHealth.jetLagData)}

          {/* Add weather and health safety components */}
          {travelHealth.weatherData && renderWeatherCard(travelHealth.weatherData)}
          {travelHealth.heatWarning && renderHeatWarningCard(travelHealth.heatWarning)}
          {travelHealth.hydrationRecommendation && renderHydrationCard(travelHealth.hydrationRecommendation)}
          {travelHealth.activitySafety && renderActivitySafetyCard(travelHealth.activitySafety)}

          {renderHealthCard(travelHealth.airQuality, 'Air Quality')}
          {renderHealthCard(travelHealth.pollenLevels, 'Pollen Levels')}
          {renderHealthCard(travelHealth.waterSafety, 'Water Safety')}
          {renderHealthCard(travelHealth.uvIndex, 'UV Index')}
          {renderHealthCard(travelHealth.altitudeRisk, 'Altitude Risk')}
          {renderHealthCard(travelHealth.diseaseRisk, 'Disease Risk')}
          {renderHealthCard(travelHealth.foodSafety, 'Food Safety')}
          {renderVaccinationCard(travelHealth.vaccinations)}
          {travelHealth.healthcareFacilities && renderHealthcareFacilities(travelHealth.healthcareFacilities)}
          {travelHealth.emergencyContacts && renderEmergencyContacts(travelHealth.emergencyContacts)}
          {travelHealth.weatherData && renderWeatherCard(travelHealth.weatherData)}
          {travelHealth.extremeHeatWarning && renderHeatWarningCard(travelHealth.extremeHeatWarning)}
          {travelHealth.hydrationRecommendation && renderHydrationCard(travelHealth.hydrationRecommendation)}
          {travelHealth.activitySafetyData && renderActivitySafetyCard(travelHealth.activitySafetyData)}
        </View>
      )}

      {!travelHealth && (
        <View style={styles.emptyState}>
          <Ionicons name="globe-outline" size={64} color="#666" />
          <Text style={styles.emptyStateTitle}>No Location Selected</Text>
          <Text style={styles.emptyStateText}>
            Search for a location or use your current location to get health insights
            </Text>
          </View>
      )}
      
      {/* Origin Timezone Modal */}
      <Modal
        visible={showOriginTimezoneModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOriginTimezoneModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Your Origin Timezone</Text>
            <Text style={styles.metricDescription}>
              Enter your home timezone to calculate jet lag and adjustment recommendations.
            </Text>
            
            {/* Quick timezone options */}
            <Text style={styles.jetLagSectionTitle}>Common Timezones:</Text>
            <View style={styles.timezoneOptions}>
              {[
                { label: 'New York (EST/EDT)', value: 'America/New_York' },
                { label: 'Los Angeles (PST/PDT)', value: 'America/Los_Angeles' },
                { label: 'London (GMT/BST)', value: 'Europe/London' },
                { label: 'Paris (CET/CEST)', value: 'Europe/Paris' },
                { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
                { label: 'Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
              ].map((tz, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.timezoneOption}
                  onPress={() => setOriginTimezoneInput(tz.value)}
                >
                  <Text style={styles.timezoneOptionText}>{tz.label}</Text>
                  <Text style={styles.timezoneOptionValue}>{tz.value}</Text>
                </TouchableOpacity>
              ))}
          </View>
            
            <Text style={styles.jetLagSectionTitle}>Or enter manually:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., America/New_York"
              value={originTimezoneInput}
              onChangeText={setOriginTimezoneInput}
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowOriginTimezoneModal(false);
                  setOriginTimezoneInput('');
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleSetOriginTimezone}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Set Timezone</Text>
              </TouchableOpacity>
        </View>
      </View>
        </View>
      </Modal>
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
    fontSize: 28,
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
  buttonDisabled: {
    opacity: 0.6,
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
  locationHeader: {
    marginBottom: 20,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    marginLeft: 28,
  },
  overallRiskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  overallRiskText: {
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 12,
    fontWeight: '500',
  },
  riskLevelText: {
    fontWeight: 'bold',
  },
  healthCard: {
    backgroundColor: '#fff',
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
    padding: 16,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#666',
  },
  metricStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  metricDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  vaccinationSection: {
    marginBottom: 16,
  },
  vaccinationSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  vaccinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  vaccinationText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 8,
  },
  healthcareFacilityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyContactsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyNumberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyNumberText: {
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    margin: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  facilityInfo: {
    marginLeft: 12,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  facilityDistance: {
    fontSize: 14,
    color: '#666',
  },
  facilityCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  emergencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  emergencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  emergencyNumber: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  jetLagSchedule: {
    marginTop: 12,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  jetLagSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    minWidth: 50,
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  scheduleMore: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  lightScheduleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  modalButtonCancel: {
    backgroundColor: '#E5E5E7',
  },
  modalButtonConfirm: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalButtonTextCancel: {
    color: '#1C1C1E',
  },
  modalButtonTextConfirm: {
    color: '#fff',
  },
  timezoneOptions: {
    marginBottom: 16,
  },
  timezoneOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  timezoneOptionText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  timezoneOptionValue: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  weatherMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weatherMetric: {
    alignItems: 'center',
  },
  weatherValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  weatherLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  heatMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  heatMetric: {
    alignItems: 'center',
  },
  heatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  heatLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  warningsSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recommendationsSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  severityBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  riskBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  hydrationMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  hydrationMetric: {
    alignItems: 'center',
  },
  hydrationValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  hydrationLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  adjustmentsSection: {
    marginBottom: 12,
  },
  adjustmentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  adjustmentsList: {
    marginLeft: 12,
  },
  adjustmentText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  safetyAssessment: {
    marginBottom: 12,
  },
  assessmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  assessmentText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bestTimesSection: {
    marginBottom: 12,
  },
  bestTimesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  bestTimeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  safetyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  safetyBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TravelScreen;
