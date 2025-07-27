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
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  ActivitySafetyData,
  MedicationAvailability,
  TravelMedicationKit,
  MedicationPharmacy
} from '../../types';
import { formatDistance, getFacilityIcon } from '../../services/healthcarePlacesService';
import { getActivitySafetyColor } from '../../services/activitySafetyService';
import { getHydrationRiskColor } from '../../services/hydrationService';
import { getAvailabilityColor, formatAvailabilityStatus } from '../../services/medicationAvailabilityService';

interface Trip {
  id: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  timezone: string;
  jetLagData?: JetLagData;
  isSequential?: boolean;
  previousTripImpact?: number;
}

const TravelScreen: React.FC = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showOriginTimezoneModal, setShowOriginTimezoneModal] = useState(false);
  const [originTimezoneInput, setOriginTimezoneInput] = useState('');
  const [activeTab, setActiveTab] = useState<'health' | 'trips'>('health');
  const [apiErrors, setApiErrors] = useState<{
    airQuality?: string;
    pollen?: string;
    weather?: string;
    healthcare?: string;
    general?: string;
  }>({});
  
  // Trip planning state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [newTripDestination, setNewTripDestination] = useState('');
  const [newTripDepartureDate, setNewTripDepartureDate] = useState(new Date());
  const [newTripReturnDate, setNewTripReturnDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState<'departure' | 'return' | null>(null);
  const [isAddingTrip, setIsAddingTrip] = useState(false);

  const { travelHealth, updateLocation, getCurrentLocation, updateTravelHealthData, setOriginTimezone, calculateJetLag } = useHealthData();

  // Update API errors when travel health data changes
  useEffect(() => {
    if (travelHealth && (travelHealth as any).apiErrors) {
      setApiErrors((travelHealth as any).apiErrors);
    } else {
      setApiErrors({});
    }
  }, [travelHealth]);

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
      setApiErrors({}); // Clear previous errors
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
        console.error('Error refreshing data:', error);
        setApiErrors(prev => ({ ...prev, general: 'Failed to refresh data. Please check your internet connection.' }));
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
        return '#8E8E93';
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
          <Ionicons name="information-circle-outline" size={16} color="#8E8E93" />
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
          <Ionicons name="information-circle-outline" size={16} color="#8E8E93" />
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
          <Ionicons name="bed-outline" size={16} color="#8E8E93" />
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
        return '#8E8E93';
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
        default: return '#8E8E93';
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

  // Medication availability render functions - COMPACT VERSION
  const renderMedicationAvailabilityCard = (availability: MedicationAvailability) => (
    <View style={[styles.healthCard, styles.compactCard, { borderLeftWidth: 4, borderLeftColor: getAvailabilityColor(availability.currentCountry.availability) }]}>
      <View style={styles.compactCardHeader}>
        <Ionicons
          name="medical"
          size={20}
          color={getAvailabilityColor(availability.currentCountry.availability)}
        />
        <Text style={styles.compactCardTitle}>{availability.medication.name}</Text>
        <View style={[styles.compactSeverityBadge, { backgroundColor: getAvailabilityColor(availability.currentCountry.availability) }]}>
          <Text style={styles.compactSeverityBadgeText}>{formatAvailabilityStatus(availability.currentCountry)}</Text>
              </View>
                  </View>
      <View style={styles.compactCardContent}>
        <Text style={styles.compactMetricValue}>{availability.medication.genericName}</Text>
        <Text style={styles.compactMetricDescription}>
          {availability.medication.description}
        </Text>
        
        {availability.warnings.length > 0 && (
          <Text style={styles.compactWarningText}>
            ⚠️ {availability.warnings[0]}
          </Text>
        )}
        
        {availability.recommendations.length > 0 && (
          <Text style={styles.compactRecommendationText}>
            💡 {availability.recommendations[0]}
          </Text>
        )}
      </View>
    </View>
  );

  const renderMedicationPharmaciesCard = (pharmacies: MedicationPharmacy[]) => {
    if (!pharmacies || pharmacies.length === 0) return null;
    
    return (
      <View style={[styles.healthCard, styles.compactCard]}>
        <View style={styles.compactCardHeader}>
          <Ionicons name="storefront" size={20} color="#30D158" />
          <Text style={styles.compactCardTitle}>Nearby Pharmacies ({pharmacies.length})</Text>
        </View>
        <View style={styles.compactCardContent}>
          {pharmacies.slice(0, 2).map((pharmacy, index) => (
            <View key={index} style={styles.compactPharmacyItem}>
              <Text style={styles.compactPharmacyName}>{pharmacy.name}</Text>
              <Text style={styles.compactPharmacyDistance}>
                {formatDistance(pharmacy.distance)} • {formatStatus(pharmacy.openingHours?.currentStatus || 'unknown')}
                      </Text>
                      </View>
                    ))}
          {pharmacies.length > 2 && (
            <Text style={styles.compactMoreText}>+{pharmacies.length - 2} more pharmacies</Text>
                    )}
                  </View>
                </View>
    );
  };

  const renderTravelMedicationKitCard = (kit: TravelMedicationKit) => (
    <View style={[styles.healthCard, styles.compactCard]}>
      <View style={styles.compactCardHeader}>
        <Ionicons name="medical-outline" size={20} color="#007AFF" />
        <Text style={styles.compactCardTitle}>Travel Medication Kit</Text>
                </View>
      <View style={styles.compactCardContent}>
        <Text style={styles.compactMetricDescription}>
          Essential: {kit.essentialMedications.slice(0, 3).join(', ')}
          {kit.essentialMedications.length > 3 && '...'}
                  </Text>
        {kit.countrySpecificNeeds.length > 0 && (
          <Text style={styles.compactWarningText}>
            ⚠️ {kit.countrySpecificNeeds[0]}
                  </Text>
        )}
        </View>
      </View>
    );

  // Helper functions for pharmacy display
  const getPharmacyTypeColor = (type: string): string => {
    switch (type) {
      case 'hospital': return '#FF3B30';
      case 'chain': return '#007AFF'; 
      case 'independent': return '#30D158';
      case 'clinic': return '#FF9500';
      case 'supermarket': return '#8E8E93';
      default: return '#666';
    }
  };

  const formatPharmacyType = (type: string): string => {
    switch (type) {
      case 'chain': return 'Chain';
      case 'independent': return 'Independent';
      case 'hospital': return 'Hospital';
      case 'clinic': return 'Clinic';
      case 'supermarket': return 'Supermarket';
      default: return 'Pharmacy';
    }
  };

  const getStatusIcon = (status: string): "checkmark-circle" | "close-circle" | "time" | "help-circle" => {
    switch (status) {
      case 'open': return 'checkmark-circle';
      case 'closed': return 'close-circle';
      case 'closing_soon': return 'time';
      default: return 'help-circle';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'open': return '#30D158';
      case 'closed': return '#FF3B30';
      case 'closing_soon': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const formatStatus = (status: string): string => {
    switch (status) {
      case 'open': return 'Open';
      case 'closed': return 'Closed';
      case 'closing_soon': return 'Closing Soon';
      default: return 'Hours Unknown';
    }
  };

  // Add API Error Warning Component
  const ApiErrorWarning = ({ type, message }: { type: string; message: string }) => (
    <View style={styles.apiErrorWarning}>
      <View style={styles.apiErrorHeader}>
        <Ionicons name="warning" size={20} color="#FF9500" />
        <Text style={styles.apiErrorTitle}>{type} Data Unavailable</Text>
      </View>
      <Text style={styles.apiErrorMessage}>{message}</Text>
      <Text style={styles.apiErrorHelp}>
        This may be due to missing API keys or network issues. Check your configuration.
      </Text>
    </View>
  );

  // Add API Status Component
  const ApiStatusBanner = () => {
    const hasErrors = Object.keys(apiErrors).length > 0;
    const missingApis = [];
    
    if (apiErrors.airQuality) missingApis.push('Air Quality');
    if (apiErrors.pollen) missingApis.push('Pollen');
    if (apiErrors.weather) missingApis.push('Weather');
    if (apiErrors.healthcare) missingApis.push('Healthcare Facilities');
    
    if (!hasErrors) return null;

  return (
      <View style={styles.apiStatusBanner}>
        <View style={styles.apiStatusHeader}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.apiStatusTitle}>Some Data Unavailable</Text>
        </View>
        <Text style={styles.apiStatusMessage}>
          Missing: {missingApis.join(', ')}
        </Text>
        <TouchableOpacity 
          style={styles.apiStatusHelpButton}
          onPress={() => Alert.alert(
            'API Configuration Help',
            'To get real-time travel health data, you need:\n\n' +
            '• Google Maps API key for air quality, pollen, and healthcare data\n' +
            '• OpenWeather API key for weather data\n\n' +
            'Add these to your .env file:\n' +
            'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here\n' +
            'EXPO_PUBLIC_OPENWEATHER_API_KEY=your_key_here\n\n' +
            'Then restart your app.',
            [{ text: 'OK' }]
          )}
        >
          <Text style={styles.apiStatusHelpText}>How to fix</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Tab Navigation Component
  const TabNavigation = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'health' && styles.activeTabButton]}
        onPress={() => setActiveTab('health')}
      >
        <Ionicons 
          name="medical" 
          size={20} 
          color={activeTab === 'health' ? '#007AFF' : '#8E8E93'} 
        />
        <Text style={[styles.tabButtonText, activeTab === 'health' && styles.activeTabButtonText]}>
          Travel Health
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'trips' && styles.activeTabButton]}
        onPress={() => setActiveTab('trips')}
      >
        <Ionicons 
          name="airplane" 
          size={20} 
          color={activeTab === 'trips' ? '#007AFF' : '#8E8E93'} 
        />
        <Text style={[styles.tabButtonText, activeTab === 'trips' && styles.activeTabButtonText]}>
          Trips Planned
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Trip Management Functions
  const addTrip = async () => {
    if (!newTripDestination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    setIsAddingTrip(true);
    try {
      // Get timezone for destination
      const locationData = await updateLocation(newTripDestination);
      if (!locationData) {
        Alert.alert('Error', 'Could not find timezone for destination');
        return;
      }

      const newTrip: Trip = {
        id: Date.now().toString(),
        destination: newTripDestination.trim(),
        departureDate: newTripDepartureDate,
        returnDate: newTripReturnDate,
        timezone: locationData.timezone || 'UTC',
      };

      // Calculate jet lag with multi-destination intelligence
      const jetLagData = calculateMultiDestinationJetLag(newTrip, trips);
      newTrip.jetLagData = jetLagData;

      // Check if this is a sequential trip
      const isSequential = checkIfSequentialTrip(newTrip, trips);
      newTrip.isSequential = isSequential;

      const updatedTrips = [...trips, newTrip].sort((a, b) => 
        new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
      );

      setTrips(updatedTrips);
      setShowAddTripModal(false);
      resetTripForm();
    } catch (error) {
      console.error('Error adding trip:', error);
      Alert.alert('Error', 'Failed to add trip. Please try again.');
    } finally {
      setIsAddingTrip(false);
    }
  };

  const deleteTrip = (tripId: string) => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedTrips = trips.filter(trip => trip.id !== tripId);
            setTrips(updatedTrips);
          }
        }
      ]
    );
  };

  const resetTripForm = () => {
    setNewTripDestination('');
    setNewTripDepartureDate(new Date());
    setNewTripReturnDate(undefined);
  };

  const checkIfSequentialTrip = (newTrip: Trip, existingTrips: Trip[]): boolean => {
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    
    for (const trip of existingTrips) {
      const timeDiff = Math.abs(
        new Date(newTrip.departureDate).getTime() - new Date(trip.departureDate).getTime()
      );
      if (timeDiff <= thirtyDaysInMs) {
        return true;
      }
    }
    return false;
  };

  const calculateMultiDestinationJetLag = (newTrip: Trip, existingTrips: Trip[]): JetLagData | null => {
    // Get origin timezone from context or use default
    const originTimezone = 'America/New_York'; // This should come from context
    
    // Calculate basic jet lag
    const basicJetLag = calculateJetLag(newTrip.timezone, newTrip.destination);
    if (!basicJetLag) return null;

    // Check for sequential trip impact
    const sequentialImpact = calculateSequentialTripImpact(newTrip, existingTrips);
    
    // Adjust jet lag based on sequential impact
    if (sequentialImpact > 0) {
      return {
        ...basicJetLag,
        severity: adjustSeverityForSequentialTrip(basicJetLag.severity, sequentialImpact),
        estimatedRecoveryDays: Math.max(basicJetLag.estimatedRecoveryDays, sequentialImpact),
        sleepAdjustment: {
          ...basicJetLag.sleepAdjustment,
          daysToAdjust: Math.max(basicJetLag.sleepAdjustment.daysToAdjust, sequentialImpact),
        }
      };
    }

    return basicJetLag;
  };

  const calculateSequentialTripImpact = (newTrip: Trip, existingTrips: Trip[]): number => {
    let totalImpact = 0;
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    
    for (const trip of existingTrips) {
      const timeDiff = Math.abs(
        new Date(newTrip.departureDate).getTime() - new Date(trip.departureDate).getTime()
      );
      
      if (timeDiff <= thirtyDaysInMs) {
        // Add impact based on timezone difference and time between trips
        const timezoneDiff = Math.abs(
          getTimezoneOffset(newTrip.timezone) - getTimezoneOffset(trip.timezone)
        );
        const daysBetween = timeDiff / (24 * 60 * 60 * 1000);
        
        // More impact if less recovery time and larger timezone changes
        const impact = Math.max(0, (timezoneDiff / 24) - daysBetween);
        totalImpact += impact;
      }
    }
    
    return Math.round(totalImpact);
  };

  const getTimezoneOffset = (timezone: string): number => {
    // Simplified timezone offset calculation
    const offsets: { [key: string]: number } = {
      'America/New_York': -5,
      'America/Los_Angeles': -8,
      'Europe/London': 0,
      'Europe/Paris': 1,
      'Asia/Tokyo': 9,
      'Australia/Sydney': 10,
      'Asia/Bangkok': 7,
      'UTC': 0,
    };
    return offsets[timezone] || 0;
  };

  const adjustSeverityForSequentialTrip = (originalSeverity: string, impact: number): string => {
    if (impact >= 5) return 'severe';
    if (impact >= 3) return 'moderate';
    return originalSeverity;
  };

  // Trip Card Component
  const TripCard = ({ trip }: { trip: Trip }) => (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <View style={styles.tripMainInfo}>
          <Text style={styles.tripDestination}>{trip.destination}</Text>
          <Text style={styles.tripDate}>
            {trip.departureDate.toLocaleDateString()} 
            {trip.returnDate && ` - ${trip.returnDate.toLocaleDateString()}`}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteTripButton}
          onPress={() => deleteTrip(trip.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      
      {trip.jetLagData && (
        <View style={styles.jetLagInfo}>
          <View style={styles.jetLagHeader}>
            <Ionicons name="airplane" size={16} color="#FF9500" />
            <Text style={styles.jetLagTitle}>Jet Lag Assessment</Text>
            {trip.isSequential && (
              <View style={styles.sequentialBadge}>
                <Text style={styles.sequentialBadgeText}>Sequential</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.jetLagSeverity}>
            {trip.jetLagData.severity.charAt(0).toUpperCase() + trip.jetLagData.severity.slice(1)} Jet Lag
          </Text>
          <Text style={styles.jetLagDetails}>
            {Math.abs(trip.jetLagData.timeZoneDifference)}h difference • {trip.jetLagData.estimatedRecoveryDays} days recovery
          </Text>
          
          {trip.isSequential && (
            <Text style={styles.sequentialNote}>
              ⚠️ Sequential trip - consider cumulative jet lag impact
            </Text>
          )}
        </View>
      )}
    </View>
  );

  // Add Trip Modal
  const AddTripModal = () => (
    <Modal
      visible={showAddTripModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAddTripModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Trip</Text>
            <TouchableOpacity 
              onPress={() => setShowAddTripModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.modalInput}
            placeholder="Destination (e.g., Tokyo, Japan)"
            value={newTripDestination}
            onChangeText={setNewTripDestination}
            autoCapitalize="words"
          />

          <Text style={styles.inputLabel}>Departure Date</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker('departure')}
          >
            <Text style={styles.datePickerText}>
              {newTripDepartureDate.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar" size={20} color="#007AFF" />
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Return Date (Optional)</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker('return')}
          >
            <Text style={styles.datePickerText}>
              {newTripReturnDate ? newTripReturnDate.toLocaleDateString() : 'Not set'}
            </Text>
            <Ionicons name="calendar" size={20} color="#007AFF" />
          </TouchableOpacity>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => setShowAddTripModal(false)}
            >
              <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={addTrip}
              disabled={isAddingTrip}
            >
              <Text style={styles.modalButtonPrimaryText}>
                {isAddingTrip ? 'Adding...' : 'Add Trip'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Trips Planned Tab Content
  const TripsPlannedContent = () => (
    <View style={styles.tripsContainer}>
      <Text style={styles.tripsTitle}>Your Planned Trips</Text>
      <Text style={styles.tripsSubtitle}>Manage your jet lag planning</Text>
      
      {trips.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyTripsState}>
          <Ionicons name="airplane-outline" size={64} color="#666" />
          <Text style={styles.emptyTripsTitle}>No Trips Planned</Text>
          <Text style={styles.emptyTripsText}>
            Add your first trip to start jet lag planning
          </Text>
          <TouchableOpacity 
            style={styles.addTripButton}
            onPress={() => setShowAddTripModal(true)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addTripButtonText}>Add Trip</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {trips.length > 0 && (
        <TouchableOpacity 
          style={styles.addTripButton}
          onPress={() => setShowAddTripModal(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addTripButtonText}>Add Another Trip</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      {/* Location Banner at Top */}
      {travelHealth && (
        <View style={styles.locationBanner}>
          <Ionicons name="location" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.locationBannerText}>{travelHealth.location}</Text>
        </View>
      )}
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Travel Health</Text>
          <Text style={styles.headerSubtitle}>Destination health insights</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          <Ionicons 
            name="refresh" 
            size={20} 
            color={isRefreshing ? "#8E8E93" : "#007AFF"} 
          />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Tab Content */}
      {activeTab === 'health' ? (
        <ScrollView 
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={handleRefresh}
              tintColor="#007AFF"
              colors={['#007AFF']}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* API Status Banner */}
          <ApiStatusBanner />

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

              {/* Add API Error Warnings for specific data */}
              {apiErrors.airQuality && (
                <ApiErrorWarning 
                  type="Air Quality" 
                  message="Unable to fetch real-time air quality data. Using estimated values." 
                />
              )}
              
              {apiErrors.pollen && (
                <ApiErrorWarning 
                  type="Pollen" 
                  message="Unable to fetch pollen forecast data. Using estimated values." 
                />
              )}
              
              {apiErrors.weather && (
                <ApiErrorWarning 
                  type="Weather" 
                  message="Unable to fetch current weather data. Some features may be limited." 
                />
              )}
              
              {apiErrors.healthcare && (
                <ApiErrorWarning 
                  type="Healthcare Facilities" 
                  message="Unable to find nearby healthcare facilities. Check your location or try again later." 
                />
              )}

              {/* Add timezone and jet lag components */}
              {travelHealth.timeZoneInfo && renderTimeZoneInfo(travelHealth.timeZoneInfo)}
              {travelHealth.jetLagData && renderJetLagCard(travelHealth.jetLagData)}

              {/* Add weather and health safety components */}
              {travelHealth.weatherData && renderWeatherCard(travelHealth.weatherData)}
              {travelHealth.heatWarning && renderHeatWarningCard(travelHealth.heatWarning)}
              {travelHealth.hydrationRecommendation && renderHydrationCard(travelHealth.hydrationRecommendation)}
              {travelHealth.activitySafety && renderActivitySafetyCard(travelHealth.activitySafety)}

              {/* Core health metrics - moved up for priority */}
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
              
              {/* Medication info - moved down and condensed */}
              {travelHealth.medicationAvailability && travelHealth.medicationAvailability.length > 0 && 
                travelHealth.medicationAvailability.map((availability, index) => (
                  <React.Fragment key={availability.medication.id}>
                    {renderMedicationAvailabilityCard(availability)}
                    {availability.nearbyPharmacies.length > 0 && renderMedicationPharmaciesCard(availability.nearbyPharmacies)}
                  </React.Fragment>
                ))
              }
              {travelHealth.travelMedicationKit && renderTravelMedicationKitCard(travelHealth.travelMedicationKit)}
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
        </ScrollView>
      ) : (
        <TripsPlannedContent />
      )}
      
      {/* Add Trip Modal */}
      <AddTripModal />

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === 'departure' ? newTripDepartureDate : (newTripReturnDate || new Date())}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            setShowDatePicker(null);
            if (selectedDate) {
              if (showDatePicker === 'departure') {
                setNewTripDepartureDate(selectedDate);
              } else {
                setNewTripReturnDate(selectedDate);
              }
            }
          }}
        />
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
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowOriginTimezoneModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSetOriginTimezone}
              >
                <Text style={styles.modalButtonPrimaryText}>Set Timezone</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32, // Match Health Assistant height
    paddingBottom: 2, // Match Health Assistant height
    backgroundColor: '#000000',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF30',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#000000',
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
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 40,
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
  modalButtonSecondary: {
    backgroundColor: '#E5E5E7',
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalButtonSecondaryText: {
    color: '#1C1C1E',
  },
  modalButtonPrimaryText: {
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
  medicationSection: {
    marginBottom: 16,
  },
  medicationSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  medicationText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 8,
  },
  alternativesSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  alternativesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  alternativeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pharmacyItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  enhancedPharmacyItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pharmacyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pharmacyMainInfo: {
    flex: 1,
  },
  enhancedPharmacyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  pharmacyTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pharmacyTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  pharmacyTypeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceLevel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  pharmacyRatingInfo: {
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginRight: 4,
  },
  totalRatingsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  pharmacyStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  openingHoursSection: {
    marginBottom: 12,
  },
  nextOpenCloseText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  viewHoursButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewHoursText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 8,
  },
  enhancedPharmacyAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 12,
  },
  servicesSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceTag: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceTagText: {
    fontSize: 12,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  moreServicesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  specialtiesSection: {
    marginBottom: 12,
  },
  specialtiesText: {
    fontSize: 14,
    color: '#666',
  },
  paymentSection: {
    marginBottom: 12,
  },
  paymentText: {
    fontSize: 14,
    color: '#666',
  },
  languagesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  languagesText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  contactSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
  },
  contactButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
  accessibilitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  accessibilityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  viewMorePharmacies: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
  },
  viewMorePharmaciesText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 8,
  },
  pharmacyDistance: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  locationBannerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  apiErrorWarning: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  apiErrorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  apiErrorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginLeft: 8,
  },
  apiErrorMessage: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 8,
    lineHeight: 20,
  },
  apiErrorHelp: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
  },
  apiStatusBanner: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  apiStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  apiStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D47A1',
    marginLeft: 8,
  },
  apiStatusMessage: {
    fontSize: 14,
    color: '#0D47A1',
    marginBottom: 12,
    lineHeight: 20,
  },
  apiStatusHelpButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  apiStatusHelpText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  compactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  compactCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  compactCardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  compactMetricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  compactMetricDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  compactWarningText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 4,
  },
  compactRecommendationText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  compactSeverityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  compactSeverityBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  compactPharmacyItem: {
    marginBottom: 6,
  },
  compactPharmacyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  compactPharmacyDistance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  compactMoreText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
},
tabButton: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
},
activeTabButton: {
  backgroundColor: '#007AFF',
},
tabButtonText: {
  fontSize: 14,
  fontWeight: '500',
  color: '#8E8E93',
  marginLeft: 6,
},
activeTabButtonText: {
  color: '#FFFFFF',
},
tripsContainer: {
  flex: 1,
  paddingHorizontal: 20,
  paddingTop: 20,
},
tripsTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#FFFFFF',
  marginBottom: 4,
},
tripsSubtitle: {
  fontSize: 16,
  color: '#8E8E93',
  marginBottom: 32,
},
emptyTripsState: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 60,
},
emptyTripsTitle: {
  fontSize: 20,
  fontWeight: '600',
  color: '#FFFFFF',
  marginTop: 16,
  marginBottom: 8,
},
emptyTripsText: {
  fontSize: 16,
  color: '#8E8E93',
  textAlign: 'center',
  marginBottom: 32,
  paddingHorizontal: 40,
},
addTripButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#007AFF',
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 8,
},
addTripButtonText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#FFFFFF',
  marginLeft: 8,
},
tripCard: {
  backgroundColor: '#1C1C1E',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: '#2C2C2E',
},
tripHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 12,
},
tripMainInfo: {
  flex: 1,
},
tripDestination: {
  fontSize: 18,
  fontWeight: '600',
  color: '#FFFFFF',
  marginBottom: 4,
},
tripDate: {
  fontSize: 14,
  color: '#8E8E93',
},
deleteTripButton: {
  padding: 4,
},
jetLagInfo: {
  backgroundColor: '#2C2C2E',
  borderRadius: 8,
  padding: 12,
},
jetLagHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},
jetLagTitle: {
  fontSize: 14,
  fontWeight: '500',
  color: '#FFFFFF',
  marginLeft: 6,
},
sequentialBadge: {
  backgroundColor: '#FF9500',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 4,
  marginLeft: 8,
},
sequentialBadgeText: {
  fontSize: 10,
  fontWeight: '600',
  color: '#FFFFFF',
},
jetLagSeverity: {
  fontSize: 16,
  fontWeight: '600',
  color: '#FF9500',
  marginBottom: 4,
},
jetLagDetails: {
  fontSize: 14,
  color: '#8E8E93',
  marginBottom: 6,
},
sequentialNote: {
  fontSize: 12,
  color: '#FF9500',
  fontStyle: 'italic',
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
},
closeButton: {
  padding: 4,
},
inputLabel: {
  fontSize: 16,
  fontWeight: '500',
  color: '#FFFFFF',
  marginBottom: 8,
  marginTop: 16,
},
datePickerButton: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#2C2C2E',
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#3A3A3C',
},
datePickerText: {
  fontSize: 16,
  color: '#FFFFFF',
},
});

export default TravelScreen;
