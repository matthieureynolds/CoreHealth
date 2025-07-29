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
  checklist?: {
    vaccines: Array<{ name: string; completed: boolean }>;
    medicines: Array<{ name: string; completed: boolean }>;
  };
  jetLagPlanner?: {
    departureTime: string;
    arrivalTime: string;
    circadianPlan: Array<{ day: number; action: string; time: string }>;
  };
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

  // Medication search state
  const [medicationSearch, setMedicationSearch] = useState('');
  const [medicationSearchResults, setMedicationSearchResults] = useState<any[]>([]);

  // Destination search state
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  // Trip details modal state
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripDetailsModal, setShowTripDetailsModal] = useState(false);

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

  const handleMedicationSearch = (searchTerm: string) => {
    setMedicationSearch(searchTerm);
    
    if (searchTerm.trim().length === 0) {
      setMedicationSearchResults([]);
      return;
    }

    // Mock medication search results
    const mockMedications = [
      { name: 'Aspirin', status: 'Available', icon: 'checkmark-circle', color: '#34C759' },
      { name: 'Ibuprofen', status: 'Available', icon: 'checkmark-circle', color: '#34C759' },
      { name: 'Paracetamol', status: 'Available', icon: 'checkmark-circle', color: '#34C759' },
      { name: 'Metformin', status: 'Prescription', icon: 'time', color: '#FF9500' },
      { name: 'Insulin', status: 'Prescription', icon: 'time', color: '#FF9500' },
      { name: 'Morphine', status: 'Banned', icon: 'close-circle', color: '#FF3B30' },
      { name: 'Codeine', status: 'Banned', icon: 'close-circle', color: '#FF3B30' },
    ];

    const filteredResults = mockMedications.filter(med => 
      med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setMedicationSearchResults(filteredResults);
  };

  const handleDestinationSearch = (searchTerm: string) => {
    setNewTripDestination(searchTerm);
    
    if (searchTerm.trim().length < 2) {
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
      return;
    }

    // Mock destination database
    const destinations = [
      'Barcelona, Spain',
      'Bahrain',
      'Bangkok, Thailand',
      'Berlin, Germany',
      'Boston, USA',
      'Buenos Aires, Argentina',
      'Beijing, China',
      'Bangkok, Thailand',
      'Bali, Indonesia',
      'Budapest, Hungary',
      'Brisbane, Australia',
      'Birmingham, UK',
      'Bologna, Italy',
      'Bordeaux, France',
      'Bristol, UK',
      'Hong Kong',
      'Tokyo, Japan',
      'New York, USA',
      'London, UK',
      'Paris, France',
      'Sydney, Australia',
      'Singapore',
      'Dubai, UAE',
      'Amsterdam, Netherlands',
      'Rome, Italy',
      'Madrid, Spain',
      'Vienna, Austria',
      'Prague, Czech Republic',
      'Istanbul, Turkey',
      'Cairo, Egypt',
      'Mumbai, India',
      'Delhi, India',
      'Seoul, South Korea',
      'Osaka, Japan',
      'Kyoto, Japan',
      'Melbourne, Australia',
      'Toronto, Canada',
      'Vancouver, Canada',
      'Montreal, Canada',
      'Mexico City, Mexico',
      'São Paulo, Brazil',
      'Rio de Janeiro, Brazil',
      'Lima, Peru',
      'Bogotá, Colombia',
      'Santiago, Chile',
      'Buenos Aires, Argentina',
      'Cape Town, South Africa',
      'Johannesburg, South Africa',
      'Nairobi, Kenya',
      'Lagos, Nigeria',
      'Cairo, Egypt',
      'Marrakech, Morocco',
      'Casablanca, Morocco',
      'Tunis, Tunisia',
      'Algiers, Algeria',
      'Cape Town, South Africa',
      'Johannesburg, South Africa',
      'Nairobi, Kenya',
      'Lagos, Nigeria',
      'Cairo, Egypt',
      'Marrakech, Morocco',
      'Casablanca, Morocco',
      'Tunis, Tunisia',
      'Algiers, Algeria',
    ];

    const filteredDestinations = destinations.filter(dest => 
      dest.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 8); // Limit to 8 suggestions

    setDestinationSuggestions(filteredDestinations);
    setShowDestinationSuggestions(true);
  };

  const selectDestination = (destination: string) => {
    setNewTripDestination(destination);
    setShowDestinationSuggestions(false);
  };

  const openTripDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowTripDetailsModal(true);
  };

  const toggleChecklistItem = (tripId: string, type: 'vaccines' | 'medicines', index: number) => {
    setTrips(prevTrips => 
      prevTrips.map(trip => {
        if (trip.id === tripId) {
          const updatedChecklist = { 
            vaccines: trip.checklist?.vaccines || [],
            medicines: trip.checklist?.medicines || []
          };
          if (type === 'vaccines' && updatedChecklist.vaccines[index]) {
            updatedChecklist.vaccines[index].completed = !updatedChecklist.vaccines[index].completed;
          } else if (type === 'medicines' && updatedChecklist.medicines[index]) {
            updatedChecklist.medicines[index].completed = !updatedChecklist.medicines[index].completed;
          }
          return { ...trip, checklist: updatedChecklist };
        }
        return trip;
      })
    );
  };

  const generateCircadianPlan = (trip: Trip) => {
    // Mock circadian plan generation based on timezone difference
    const timezoneDiff = Math.abs(getTimezoneOffset(trip.timezone) - getTimezoneOffset('America/New_York'));
    const daysToAdjust = Math.ceil(timezoneDiff / 2);
    
    const plan = [];
    for (let day = 1; day <= daysToAdjust; day++) {
      plan.push({
        day,
        action: day === 1 ? 'Start adjusting sleep schedule' : 'Continue adjustment',
        time: `Day ${day}: ${day * 2}h shift`
      });
    }
    
    return plan;
  };

  const getRiskColor = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return '#34C759';
      case 'moderate': return '#FF9500';
      case 'high': return '#FF3B30';
      case 'severe': return '#8B0000';
      default: return '#8E8E93';
    }
  };

  // Helper function to get country flag emoji
  const getCountryFlag = (location: string): string => {
    const countryMap: { [key: string]: string } = {
      'france': '🇫🇷',
      'paris': '🇫🇷',
      'thailand': '🇹🇭',
      'bangkok': '🇹🇭',
      'usa': '🇺🇸',
      'united states': '🇺🇸',
      'new york': '🇺🇸',
      'los angeles': '🇺🇸',
      'uk': '🇬🇧',
      'united kingdom': '🇬🇧',
      'london': '🇬🇧',
      'japan': '🇯🇵',
      'tokyo': '🇯🇵',
      'australia': '🇦🇺',
      'sydney': '🇦🇺',
      'germany': '🇩🇪',
      'berlin': '🇩🇪',
      'spain': '🇪🇸',
      'madrid': '🇪🇸',
      'italy': '🇮🇹',
      'rome': '🇮🇹',
      'canada': '🇨🇦',
      'toronto': '🇨🇦',
      'brazil': '🇧🇷',
      'sao paulo': '🇧🇷',
      'india': '🇮🇳',
      'mumbai': '🇮🇳',
      'china': '🇨🇳',
      'beijing': '🇨🇳',
      'singapore': '🇸🇬',
      'netherlands': '🇳🇱',
      'amsterdam': '🇳🇱',
      'switzerland': '🇨🇭',
      'zurich': '🇨🇭',
      'sweden': '🇸🇪',
      'stockholm': '🇸🇪',
      'norway': '🇳🇴',
      'oslo': '🇳🇴',
      'denmark': '🇩🇰',
      'copenhagen': '🇩🇰',
      'finland': '🇫🇮',
      'helsinki': '🇫🇮',
      'austria': '🇦🇹',
      'vienna': '🇦🇹',
      'belgium': '🇧🇪',
      'brussels': '🇧🇪',
      'portugal': '🇵🇹',
      'lisbon': '🇵🇹',
      'greece': '🇬🇷',
      'athens': '🇬🇷',
      'poland': '🇵🇱',
      'warsaw': '🇵🇱',
      'czech republic': '🇨🇿',
      'prague': '🇨🇿',
      'hungary': '🇭🇺',
      'budapest': '🇭🇺',
      'romania': '🇷🇴',
      'bucharest': '🇷🇴',
      'bulgaria': '🇧🇬',
      'sofia': '🇧🇬',
      'croatia': '🇭🇷',
      'zagreb': '🇭🇷',
      'slovenia': '🇸🇮',
      'ljubljana': '🇸🇮',
      'slovakia': '🇸🇰',
      'bratislava': '🇸🇰',
      'lithuania': '🇱🇹',
      'vilnius': '🇱🇹',
      'latvia': '🇱🇻',
      'riga': '🇱🇻',
      'estonia': '🇪🇪',
      'tallinn': '🇪🇪',
      'luxembourg': '🇱🇺',
      'malta': '🇲🇹',
      'cyprus': '🇨🇾',
      'ireland': '🇮🇪',
      'dublin': '🇮🇪',
      'iceland': '🇮🇸',
      'reykjavik': '🇮🇸',
    };

    const locationLower = location.toLowerCase();
    
    // Check for exact matches first
    if (countryMap[locationLower]) {
      return countryMap[locationLower];
    }
    
    // Check if location contains country name
    for (const [country, flag] of Object.entries(countryMap)) {
      if (locationLower.includes(country)) {
        return flag;
      }
    }
    
    // Default to world flag
    return '🌍';
  };

  // Helper function to get risk emoji
  const getRiskEmoji = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return '😊';
      case 'moderate': return '😐';
      case 'high': return '😟';
      case 'severe': return '😨';
      default: return '😐';
    }
  };

  // Helper function to get risk emoji color
  const getRiskEmojiColor = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return '#34C759';
      case 'moderate': return '#FF9500';
      case 'high': return '#FF3B30';
      case 'severe': return '#8B0000';
      default: return '#FF9500';
    }
  };

  // Helper functions for health metrics scores and descriptions
  const getAirQualityScore = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return '95';
      case 'moderate': return '72';
      case 'high': return '45';
      case 'severe': return '25';
      default: return '72';
    }
  };

  const getAirQualityStatus = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return 'Excellent';
      case 'moderate': return 'Moderate';
      case 'high': return 'Unhealthy';
      case 'severe': return 'Very Unhealthy';
      default: return 'Moderate';
    }
  };

  const getAirQualityDescription = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return 'Air quality is good, safe for outdoor activities';
      case 'moderate': return 'Sensitive individuals should limit outdoor activities';
      case 'high': return 'Avoid outdoor activities, especially for sensitive groups';
      case 'severe': return 'Stay indoors, air quality is hazardous';
      default: return 'Moderate air quality conditions';
    }
  };

  const getWaterSafetyScore = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return '95';
      case 'moderate': return '65';
      case 'high': return '35';
      case 'severe': return '15';
      default: return '65';
    }
  };

  const getWaterSafetyStatus = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return 'Excellent';
      case 'moderate': return 'Moderate';
      case 'high': return 'Unsafe';
      case 'severe': return 'Very Unsafe';
      default: return 'Moderate';
    }
  };

  const getWaterSafetyDescription = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return 'Safe to drink tap water';
      case 'moderate': return 'Recommended to drink bottled water';
      case 'high': return 'Avoid tap water, use bottled water only';
      case 'severe': return 'Water is contaminated, use bottled water only';
      default: return 'Moderate water safety conditions';
    }
  };

  const getUVIndexScore = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return '85';
      case 'moderate': return '60';
      case 'high': return '40';
      case 'severe': return '20';
      default: return '60';
    }
  };

  const getUVIndexStatus = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return 'Low';
      case 'moderate': return 'Moderate';
      case 'high': return 'High';
      case 'severe': return 'Very High';
      default: return 'Moderate';
    }
  };

  const getUVIndexDescription = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return 'Low UV exposure, minimal protection needed';
      case 'moderate': return 'Moderate UV exposure, use sunscreen SPF 30+';
      case 'high': return 'High UV exposure, use sunscreen and seek shade';
      case 'severe': return 'Very high UV exposure, avoid sun during peak hours';
      default: return 'Moderate UV exposure conditions';
    }
  };

  const getFoodSafetyScore = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return '90';
      case 'moderate': return '70';
      case 'high': return '45';
      case 'severe': return '25';
      default: return '70';
    }
  };

  const getFoodSafetyStatus = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return 'Excellent';
      case 'moderate': return 'Moderate';
      case 'high': return 'High Risk';
      case 'severe': return 'Very High Risk';
      default: return 'Moderate';
    }
  };

  const getFoodSafetyDescription = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return 'Generally safe to eat local food';
      case 'moderate': return 'Choose food carefully, avoid street food';
      case 'high': return 'High risk, avoid street food and raw items';
      case 'severe': return 'Very high risk, stick to well-cooked food only';
      default: return 'Moderate food safety conditions';
    }
  };

  const getPollenScore = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return '85';
      case 'moderate': return '60';
      case 'high': return '40';
      case 'severe': return '20';
      default: return '60';
    }
  };

  const getPollenStatus = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return 'Low';
      case 'moderate': return 'Moderate';
      case 'high': return 'High';
      case 'severe': return 'Very High';
      default: return 'Moderate';
    }
  };

  const getPollenDescription = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return 'Low pollen levels, minimal allergy risk';
      case 'moderate': return 'Moderate pollen levels, take precautions if allergic';
      case 'high': return 'High pollen levels, avoid outdoor activities if allergic';
      case 'severe': return 'Very high pollen levels, stay indoors if possible';
      default: return 'Moderate pollen conditions';
    }
  };

  const getAltitudeScore = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return '90';
      case 'moderate': return '70';
      case 'high': return '45';
      case 'severe': return '25';
      default: return '70';
    }
  };

  const getAltitudeStatus = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return 'Low';
      case 'moderate': return 'Moderate';
      case 'high': return 'High';
      case 'severe': return 'Very High';
      default: return 'Moderate';
    }
  };

  const getAltitudeDescription = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return 'Low altitude, minimal altitude sickness risk';
      case 'moderate': return 'Moderate altitude, take time to acclimate';
      case 'high': return 'High altitude, risk of altitude sickness';
      case 'severe': return 'Very high altitude, high risk of altitude sickness';
      default: return 'Moderate altitude conditions';
    }
  };

  const getDiseaseScore = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return '85';
      case 'moderate': return '65';
      case 'high': return '40';
      case 'severe': return '20';
      default: return '65';
    }
  };

  const getDiseaseStatus = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return 'Low';
      case 'moderate': return 'Moderate';
      case 'high': return 'High';
      case 'severe': return 'Very High';
      default: return 'Moderate';
    }
  };

  const getDiseaseDescription = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low': return 'Low risk of disease outbreaks';
      case 'moderate': return 'Moderate risk, check vaccination requirements';
      case 'high': return 'High risk, ensure vaccinations are up to date';
      case 'severe': return 'Very high risk, avoid travel if possible';
      default: return 'Moderate disease risk conditions';
    }
  };

  // Navigation handler for healthcare facilities
  const handleFacilityPress = (facility: HealthcareFacility) => {
    Alert.alert(
      'Navigate to Facility',
      `Navigate to ${facility.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Apple Maps',
          onPress: () => {
            const url = `http://maps.apple.com/?daddr=${facility.coordinates.latitude},${facility.coordinates.longitude}&dirflg=d`;
            Linking.openURL(url);
          },
        },
        {
          text: 'Google Maps',
          onPress: () => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates.latitude},${facility.coordinates.longitude}`;
            Linking.openURL(url);
          },
        },
      ]
    );
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
      console.log('Adding trip with destination:', newTripDestination);
      
      // Create new trip with basic data
      const newTrip: Trip = {
        id: Date.now().toString(),
        destination: newTripDestination.trim(),
        departureDate: newTripDepartureDate,
        returnDate: newTripReturnDate,
        timezone: 'UTC', // Default timezone for trip planning
        checklist: {
          vaccines: [
            { name: 'COVID-19 Vaccine', completed: false },
            { name: 'Hepatitis A', completed: false },
            { name: 'Hepatitis B', completed: false },
            { name: 'Yellow Fever', completed: false },
            { name: 'Typhoid', completed: false },
          ],
          medicines: [
            { name: 'Prescription Medications', completed: false },
            { name: 'Pain Relievers', completed: false },
            { name: 'Anti-diarrheal', completed: false },
            { name: 'Motion Sickness', completed: false },
            { name: 'First Aid Kit', completed: false },
          ]
        },
        jetLagPlanner: {
          departureTime: '09:00',
          arrivalTime: '14:00',
          circadianPlan: []
        }
      };
      
      console.log('Created trip object:', newTrip);

      // Add the trip to the list
      const updatedTrips = [...trips, newTrip].sort((a, b) => 
        new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
      );

      setTrips(updatedTrips);
      setShowAddTripModal(false);
      resetTripForm();
      
      Alert.alert('Success', 'Trip added successfully!');
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
    <TouchableOpacity 
      style={styles.tripCard}
      onPress={() => openTripDetails(trip)}
    >
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
          onPress={(e) => {
            e.stopPropagation();
            deleteTrip(trip.id);
          }}
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
      
      {/* Show checklist summary if available */}
      {trip.checklist && (
        <View style={styles.checklistSummary}>
          <Text style={styles.checklistSummaryText}>
            📋 Checklist: {trip.checklist.vaccines.filter(v => v.completed).length}/{trip.checklist.vaccines.length} vaccines, {trip.checklist.medicines.filter(m => m.completed).length}/{trip.checklist.medicines.length} medicines
          </Text>
        </View>
      )}
    </TouchableOpacity>
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

          <View style={styles.destinationSearchContainer}>
          <TextInput
            style={styles.modalInput}
            placeholder="Destination (e.g., Tokyo, Japan)"
            value={newTripDestination}
              onChangeText={handleDestinationSearch}
            autoCapitalize="words"
              keyboardType="default"
              textContentType="none"
              autoCorrect={false}
              returnKeyType="done"
              blurOnSubmit={true}
              maxLength={100}
            />
            
            {/* Destination Suggestions */}
            {showDestinationSuggestions && destinationSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {destinationSuggestions.map((destination, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => selectDestination(destination)}
                  >
                    <Ionicons name="location" size={16} color="#8E8E93" />
                    <Text style={styles.suggestionText}>{destination}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

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

  // Trip Details Modal
  const TripDetailsModal = () => {
    if (!selectedTrip) return null;

    const circadianPlan = generateCircadianPlan(selectedTrip);

    return (
      <Modal
        visible={showTripDetailsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTripDetailsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTrip.destination}</Text>
              <TouchableOpacity 
                onPress={() => setShowTripDetailsModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Trip Info */}
              <View style={styles.tripInfoSection}>
                <Text style={styles.sectionTitle}>Trip Details</Text>
                <View style={styles.tripInfoRow}>
                  <Ionicons name="calendar" size={16} color="#8E8E93" />
                  <Text style={styles.tripInfoText}>
                    {selectedTrip.departureDate.toLocaleDateString()}
                    {selectedTrip.returnDate && ` - ${selectedTrip.returnDate.toLocaleDateString()}`}
                  </Text>
                </View>
                <View style={styles.tripInfoRow}>
                  <Ionicons name="time" size={16} color="#8E8E93" />
                  <Text style={styles.tripInfoText}>Timezone: {selectedTrip.timezone}</Text>
                </View>
              </View>

              {/* Personalized Checklist */}
              <View style={styles.checklistSection}>
                <Text style={styles.sectionTitle}>Personalized Checklist</Text>
                
                {/* Vaccines */}
                <View style={styles.checklistCategory}>
                  <Text style={styles.checklistCategoryTitle}>💉 Vaccines Needed</Text>
                  {selectedTrip.checklist?.vaccines.map((vaccine, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.checklistItem}
                      onPress={() => toggleChecklistItem(selectedTrip.id, 'vaccines', index)}
                    >
                      <Ionicons 
                        name={vaccine.completed ? "checkmark-circle" : "ellipse-outline"} 
                        size={20} 
                        color={vaccine.completed ? "#34C759" : "#8E8E93"} 
                      />
                      <Text style={[
                        styles.checklistItemText,
                        vaccine.completed && styles.checklistItemCompleted
                      ]}>
                        {vaccine.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Medicines */}
                <View style={styles.checklistCategory}>
                  <Text style={styles.checklistCategoryTitle}>💊 Medicines to Pack</Text>
                  {selectedTrip.checklist?.medicines.map((medicine, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.checklistItem}
                      onPress={() => toggleChecklistItem(selectedTrip.id, 'medicines', index)}
                    >
                      <Ionicons 
                        name={medicine.completed ? "checkmark-circle" : "ellipse-outline"} 
                        size={20} 
                        color={medicine.completed ? "#34C759" : "#8E8E93"} 
                      />
                      <Text style={[
                        styles.checklistItemText,
                        medicine.completed && styles.checklistItemCompleted
                      ]}>
                        {medicine.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Jet Lag Planner */}
              <View style={styles.jetLagPlannerSection}>
                <Text style={styles.sectionTitle}>Jet Lag Planner</Text>
                
                {/* Time Inputs */}
                <View style={styles.timeInputSection}>
                  <View style={styles.timeInputRow}>
                    <Text style={styles.timeInputLabel}>Departure Time:</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={selectedTrip.jetLagPlanner?.departureTime || '09:00'}
                      placeholder="09:00"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.timeInputRow}>
                    <Text style={styles.timeInputLabel}>Arrival Time:</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={selectedTrip.jetLagPlanner?.arrivalTime || '14:00'}
                      placeholder="14:00"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Circadian Shift Plan */}
                <View style={styles.circadianPlanSection}>
                  <Text style={styles.circadianPlanTitle}>Auto-Generated Circadian Shift Plan</Text>
                  {circadianPlan.map((day, index) => (
                    <View key={index} style={styles.circadianPlanDay}>
                      <View style={styles.circadianPlanHeader}>
                        <Text style={styles.circadianPlanDayText}>Day {day.day}</Text>
                        <Text style={styles.circadianPlanTime}>{day.time}</Text>
                      </View>
                      <Text style={styles.circadianPlanAction}>{day.action}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

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
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
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
              {/* Location and Time Header */}
              <View style={styles.locationTimeHeader}>
                <View style={styles.locationFlagContainer}>
                  <View style={styles.flagIcon}>
                    <Text style={styles.countryFlag}>
                      {getCountryFlag(travelHealth.location)}
                    </Text>
                  </View>
                <View style={styles.locationInfo}>
                    <Text style={styles.locationTitle}>
                      {travelHealth.location.includes(',') 
                        ? travelHealth.location 
                        : `${travelHealth.location}, France`}
                    </Text>
                    <Text style={styles.locationTime}>
                      {new Date().toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </Text>
                </View>
                </View>
              </View>

              {/* Overall Health Risk Summary */}
              <View style={styles.overallRiskCard}>
                <View style={styles.riskHeader}>
                  <Text style={[styles.riskEmoji, { color: getRiskEmojiColor(travelHealth.overallRiskLevel) }]}>
                    {getRiskEmoji(travelHealth.overallRiskLevel)}
                  </Text>
                  <Text style={styles.overallRiskTitle}>
                    {travelHealth.overallRiskLevel === 'low' ? 'Low health risk' :
                     travelHealth.overallRiskLevel === 'moderate' ? 'Moderate health risk' :
                     travelHealth.overallRiskLevel === 'high' ? 'High health risk' :
                     'Very high health risk'} 
                    {travelHealth.airQuality?.riskLevel === 'high' && ' – Air quality is poor'}
                    {travelHealth.uvIndex?.riskLevel === 'high' && ' – UV index is high'}
                </Text>
                </View>
              </View>

              {/* Health Metrics Rows */}
              <View style={styles.healthMetricsContainer}>
                <Text style={styles.sectionTitle}>Health Metrics</Text>
                
                {/* Air Quality */}
                {travelHealth.airQuality && (
                  <View style={[styles.metricRow, { borderLeftColor: getRiskColor(travelHealth.airQuality.riskLevel) }]}>
                    <View style={styles.scoreContainer}>
                      <Text style={[styles.scoreValue, { color: getRiskColor(travelHealth.airQuality.riskLevel) }]}>
                        {getAirQualityScore(travelHealth.airQuality.riskLevel)}
                  </Text>
                      <Text style={styles.scoreLabel}>Score</Text>
                    </View>
                    <View style={styles.metricInfo}>
                      <Text style={styles.metricTitle}>Air Quality</Text>
                      <Text style={[styles.metricStatus, { color: getRiskColor(travelHealth.airQuality.riskLevel) }]}>
                        {getAirQualityStatus(travelHealth.airQuality.riskLevel)}
                      </Text>
                      <Text style={styles.metricDescription}>
                        {getAirQualityDescription(travelHealth.airQuality.riskLevel)}
                </Text>
              </View>
                  </View>
                )}

                {/* Water Safety */}
                {travelHealth.waterSafety && (
                  <View style={[styles.metricRow, { borderLeftColor: getRiskColor(travelHealth.waterSafety.riskLevel) }]}>
                    <View style={styles.scoreContainer}>
                      <Text style={[styles.scoreValue, { color: getRiskColor(travelHealth.waterSafety.riskLevel) }]}>
                        {getWaterSafetyScore(travelHealth.waterSafety.riskLevel)}
                      </Text>
                      <Text style={styles.scoreLabel}>Score</Text>
                    </View>
                    <View style={styles.metricInfo}>
                      <Text style={styles.metricTitle}>Water Safety</Text>
                      <Text style={[styles.metricStatus, { color: getRiskColor(travelHealth.waterSafety.riskLevel) }]}>
                        {getWaterSafetyStatus(travelHealth.waterSafety.riskLevel)}
                      </Text>
                      <Text style={styles.metricDescription}>
                        {getWaterSafetyDescription(travelHealth.waterSafety.riskLevel)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* UV Index */}
                {travelHealth.uvIndex && (
                  <View style={[styles.metricRow, { borderLeftColor: getRiskColor(travelHealth.uvIndex.riskLevel) }]}>
                    <View style={styles.scoreContainer}>
                      <Text style={[styles.scoreValue, { color: getRiskColor(travelHealth.uvIndex.riskLevel) }]}>
                        {getUVIndexScore(travelHealth.uvIndex.riskLevel)}
                      </Text>
                      <Text style={styles.scoreLabel}>Score</Text>
                    </View>
                    <View style={styles.metricInfo}>
                      <Text style={styles.metricTitle}>UV Index</Text>
                      <Text style={[styles.metricStatus, { color: getRiskColor(travelHealth.uvIndex.riskLevel) }]}>
                        {getUVIndexStatus(travelHealth.uvIndex.riskLevel)}
                      </Text>
                      <Text style={styles.metricDescription}>
                        {getUVIndexDescription(travelHealth.uvIndex.riskLevel)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Food Safety */}
                {travelHealth.foodSafety && (
                  <View style={[styles.metricRow, { borderLeftColor: getRiskColor(travelHealth.foodSafety.riskLevel) }]}>
                    <View style={styles.scoreContainer}>
                      <Text style={[styles.scoreValue, { color: getRiskColor(travelHealth.foodSafety.riskLevel) }]}>
                        {getFoodSafetyScore(travelHealth.foodSafety.riskLevel)}
                      </Text>
                      <Text style={styles.scoreLabel}>Score</Text>
                    </View>
                    <View style={styles.metricInfo}>
                      <Text style={styles.metricTitle}>Food Safety</Text>
                      <Text style={[styles.metricStatus, { color: getRiskColor(travelHealth.foodSafety.riskLevel) }]}>
                        {getFoodSafetyStatus(travelHealth.foodSafety.riskLevel)}
                      </Text>
                      <Text style={styles.metricDescription}>
                        {getFoodSafetyDescription(travelHealth.foodSafety.riskLevel)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Pollen Level */}
                {travelHealth.pollenLevels && (
                  <View style={[styles.metricRow, { borderLeftColor: getRiskColor(travelHealth.pollenLevels.riskLevel) }]}>
                    <View style={styles.scoreContainer}>
                      <Text style={[styles.scoreValue, { color: getRiskColor(travelHealth.pollenLevels.riskLevel) }]}>
                        {getPollenScore(travelHealth.pollenLevels.riskLevel)}
                      </Text>
                      <Text style={styles.scoreLabel}>Score</Text>
                    </View>
                    <View style={styles.metricInfo}>
                      <Text style={styles.metricTitle}>Pollen Level</Text>
                      <Text style={[styles.metricStatus, { color: getRiskColor(travelHealth.pollenLevels.riskLevel) }]}>
                        {getPollenStatus(travelHealth.pollenLevels.riskLevel)}
                      </Text>
                      <Text style={styles.metricDescription}>
                        {getPollenDescription(travelHealth.pollenLevels.riskLevel)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Altitude */}
                {travelHealth.altitudeRisk && (
                  <View style={[styles.metricRow, { borderLeftColor: getRiskColor(travelHealth.altitudeRisk.riskLevel) }]}>
                    <View style={styles.scoreContainer}>
                      <Text style={[styles.scoreValue, { color: getRiskColor(travelHealth.altitudeRisk.riskLevel) }]}>
                        {getAltitudeScore(travelHealth.altitudeRisk.riskLevel)}
                      </Text>
                      <Text style={styles.scoreLabel}>Score</Text>
                    </View>
                    <View style={styles.metricInfo}>
                      <Text style={styles.metricTitle}>Altitude</Text>
                      <Text style={[styles.metricStatus, { color: getRiskColor(travelHealth.altitudeRisk.riskLevel) }]}>
                        {getAltitudeStatus(travelHealth.altitudeRisk.riskLevel)}
                      </Text>
                      <Text style={styles.metricDescription}>
                        {getAltitudeDescription(travelHealth.altitudeRisk.riskLevel)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Disease Outbreaks */}
                {travelHealth.diseaseRisk && (
                  <View style={[styles.metricRow, { borderLeftColor: getRiskColor(travelHealth.diseaseRisk.riskLevel) }]}>
                    <View style={styles.scoreContainer}>
                      <Text style={[styles.scoreValue, { color: getRiskColor(travelHealth.diseaseRisk.riskLevel) }]}>
                        {getDiseaseScore(travelHealth.diseaseRisk.riskLevel)}
                      </Text>
                      <Text style={styles.scoreLabel}>Score</Text>
                    </View>
                    <View style={styles.metricInfo}>
                      <Text style={styles.metricTitle}>Disease Outbreaks</Text>
                      <Text style={[styles.metricStatus, { color: getRiskColor(travelHealth.diseaseRisk.riskLevel) }]}>
                        {getDiseaseStatus(travelHealth.diseaseRisk.riskLevel)}
                      </Text>
                      <Text style={styles.metricDescription}>
                        {getDiseaseDescription(travelHealth.diseaseRisk.riskLevel)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Healthcare Facilities Section */}
              <View style={styles.healthcareFacilitiesSection}>
                <Text style={styles.sectionTitle}>Nearby Healthcare</Text>
                
                {/* Hospitals */}
                {travelHealth.healthcareFacilities?.hospitals && travelHealth.healthcareFacilities.hospitals.length > 0 && (
                  <View style={styles.facilityCategory}>
                    <Text style={styles.facilityCategoryTitle}>🏥 Hospitals</Text>
                    {travelHealth.healthcareFacilities.hospitals.slice(0, 3).map((hospital, index) => (
                      <TouchableOpacity
                        key={hospital.id}
                        style={styles.facilityCard}
                        onPress={() => handleFacilityPress(hospital)}
                      >
                        <View style={styles.facilityInfo}>
                          <Text style={styles.facilityName}>{hospital.name}</Text>
                          <Text style={styles.facilityAddress}>{hospital.address}</Text>
                          {hospital.rating && (
                            <View style={styles.facilityRating}>
                              <Ionicons name="star" size={14} color="#FFD700" />
                              <Text style={styles.ratingText}>{hospital.rating}</Text>
                              {hospital.userRatingsTotal && (
                                <Text style={styles.ratingCount}>({hospital.userRatingsTotal})</Text>
                              )}
                            </View>
                          )}
                        </View>
                        <View style={styles.facilityDistance}>
                          <Text style={styles.distanceText}>
                            {hospital.distance ? `${(hospital.distance / 1000).toFixed(1)} km` : 'N/A'}
                          </Text>
                          <Text style={styles.distanceLabel}>by car</Text>
                          <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Clinics */}
                {travelHealth.healthcareFacilities?.clinics && travelHealth.healthcareFacilities.clinics.length > 0 && (
                  <View style={styles.facilityCategory}>
                    <Text style={styles.facilityCategoryTitle}>🏥 Clinics</Text>
                    {travelHealth.healthcareFacilities.clinics.slice(0, 3).map((clinic, index) => (
                      <TouchableOpacity
                        key={clinic.id}
                        style={styles.facilityCard}
                        onPress={() => handleFacilityPress(clinic)}
                      >
                        <View style={styles.facilityInfo}>
                          <Text style={styles.facilityName}>{clinic.name}</Text>
                          <Text style={styles.facilityAddress}>{clinic.address}</Text>
                          {clinic.rating && (
                            <View style={styles.facilityRating}>
                              <Ionicons name="star" size={14} color="#FFD700" />
                              <Text style={styles.ratingText}>{clinic.rating}</Text>
                              {clinic.userRatingsTotal && (
                                <Text style={styles.ratingCount}>({clinic.userRatingsTotal})</Text>
                              )}
                            </View>
                          )}
                        </View>
                        <View style={styles.facilityDistance}>
                          <Text style={styles.distanceText}>
                            {clinic.distance ? `${(clinic.distance / 1000).toFixed(1)} km` : 'N/A'}
                          </Text>
                          <Text style={styles.distanceLabel}>by car</Text>
                          <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Pharmacies */}
                {travelHealth.healthcareFacilities?.pharmacies && travelHealth.healthcareFacilities.pharmacies.length > 0 && (
                  <View style={styles.facilityCategory}>
                    <Text style={styles.facilityCategoryTitle}>💊 Pharmacies</Text>
                    {travelHealth.healthcareFacilities.pharmacies.slice(0, 3).map((pharmacy, index) => (
                      <TouchableOpacity
                        key={pharmacy.id}
                        style={styles.facilityCard}
                        onPress={() => handleFacilityPress(pharmacy)}
                      >
                        <View style={styles.facilityInfo}>
                          <Text style={styles.facilityName}>{pharmacy.name}</Text>
                          <Text style={styles.facilityAddress}>{pharmacy.address}</Text>
                          {pharmacy.rating && (
                            <View style={styles.facilityRating}>
                              <Ionicons name="star" size={14} color="#FFD700" />
                              <Text style={styles.ratingText}>{pharmacy.rating}</Text>
                              {pharmacy.userRatingsTotal && (
                                <Text style={styles.ratingCount}>({pharmacy.userRatingsTotal})</Text>
                              )}
                            </View>
                          )}
                        </View>
                        <View style={styles.facilityDistance}>
                          <Text style={styles.distanceText}>
                            {pharmacy.distance ? `${(pharmacy.distance / 1000).toFixed(1)} km` : 'N/A'}
                          </Text>
                          <Text style={styles.distanceLabel}>by car</Text>
                          <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* No facilities found */}
                {(!travelHealth.healthcareFacilities || 
                  (travelHealth.healthcareFacilities.hospitals.length === 0 && 
                   travelHealth.healthcareFacilities.clinics.length === 0 && 
                   travelHealth.healthcareFacilities.pharmacies.length === 0)) && (
                  <View style={styles.noFacilitiesCard}>
                    <Ionicons name="medical" size={24} color="#8E8E93" />
                    <Text style={styles.noFacilitiesText}>No healthcare facilities found nearby</Text>
                    <Text style={styles.noFacilitiesSubtext}>Try searching for a different location</Text>
                  </View>
                )}
              </View>

              {/* Vaccination Section */}
              <View style={styles.vaccinationSection}>
                <Text style={styles.sectionTitle}>Vaccination Requirements</Text>
                
                {travelHealth.vaccinations && (
                  <View style={styles.vaccinationContainer}>
                    {/* Risk Level */}
                    <View style={[styles.vaccinationRiskCard, { borderLeftColor: getRiskColor(travelHealth.vaccinations.riskLevel) }]}>
                      <View style={styles.vaccinationRiskHeader}>
                        <Ionicons name="shield-checkmark" size={20} color={getRiskColor(travelHealth.vaccinations.riskLevel)} />
                        <Text style={styles.vaccinationRiskTitle}>Risk Level</Text>
                      </View>
                      <Text style={[styles.vaccinationRiskLevel, { color: getRiskColor(travelHealth.vaccinations.riskLevel) }]}>
                        {travelHealth.vaccinations.riskLevel === 'low' ? 'Low Risk' :
                         travelHealth.vaccinations.riskLevel === 'moderate' ? 'Moderate Risk' :
                         travelHealth.vaccinations.riskLevel === 'high' ? 'High Risk' : 'Very High Risk'}
                      </Text>
                      <Text style={styles.vaccinationDescription}>
                        {travelHealth.vaccinations.description}
                      </Text>
                    </View>

                    {/* Required Vaccinations */}
                    {travelHealth.vaccinations.required && travelHealth.vaccinations.required.length > 0 && (
                      <View style={styles.vaccinationCategory}>
                        <Text style={styles.vaccinationCategoryTitle}>🟠 Required Vaccinations</Text>
                        {travelHealth.vaccinations.required.map((vaccine, index) => (
                          <View key={index} style={styles.vaccinationItem}>
                            <View style={styles.vaccinationItemHeader}>
                              <Ionicons name="checkmark-circle" size={16} color="#FF6B35" />
                              <Text style={styles.vaccinationItemName}>{vaccine}</Text>
                            </View>
                            <Text style={styles.vaccinationItemNote}>Mandatory for entry</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Recommended Vaccinations */}
                    {travelHealth.vaccinations.recommended && travelHealth.vaccinations.recommended.length > 0 && (
                      <View style={styles.vaccinationCategory}>
                        <Text style={styles.vaccinationCategoryTitle}>🟡 Recommended Vaccinations</Text>
                        {travelHealth.vaccinations.recommended.map((vaccine, index) => (
                          <View key={index} style={styles.vaccinationItem}>
                            <View style={styles.vaccinationItemHeader}>
                              <Ionicons name="information-circle" size={16} color="#FFD700" />
                              <Text style={styles.vaccinationItemName}>{vaccine}</Text>
                            </View>
                            <Text style={styles.vaccinationItemNote}>Recommended for protection</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* No vaccinations needed */}
                    {(!travelHealth.vaccinations.required || travelHealth.vaccinations.required.length === 0) &&
                     (!travelHealth.vaccinations.recommended || travelHealth.vaccinations.recommended.length === 0) && (
                      <View style={styles.noVaccinationsCard}>
                        <Ionicons name="shield-checkmark" size={24} color="#34C759" />
                        <Text style={styles.noVaccinationsText}>No specific vaccinations required</Text>
                        <Text style={styles.noVaccinationsSubtext}>Standard travel vaccinations recommended</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Medication Availability Section */}
              <View style={styles.medicationAvailabilitySection}>
                <Text style={styles.sectionTitle}>Common Travel Medications</Text>
                
                {/* Common Medications Grid */}
                <View style={styles.medicationGrid}>
                  <View style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                      <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                      <Text style={styles.medicationName}>Paracetamol</Text>
                    </View>
                    <Text style={styles.medicationStatus}>OTC</Text>
                  </View>
                  
                  <View style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                      <Ionicons name="warning" size={20} color="#FF9500" />
                      <Text style={styles.medicationName}>Loperamide</Text>
                    </View>
                    <Text style={styles.medicationStatus}>Prescription</Text>
                  </View>
                  
                  <View style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                      <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                      <Text style={styles.medicationName}>Ibuprofen</Text>
                    </View>
                    <Text style={styles.medicationStatus}>OTC</Text>
                  </View>
                  
                  <View style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                      <Ionicons name="close-circle" size={20} color="#FF3B30" />
                      <Text style={styles.medicationName}>Codeine</Text>
                    </View>
                    <Text style={styles.medicationStatus}>Banned</Text>
                  </View>
                </View>
              </View>

              {/* User's Personal Medications Section */}
              <View style={styles.userMedicationSection}>
                <Text style={styles.sectionTitle}>Your Medications</Text>
                
                {/* User's Medications Grid */}
                <View style={styles.medicationGrid}>
                  <View style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                      <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                      <Text style={styles.medicationName}>Aspirin 100mg</Text>
                    </View>
                    <Text style={styles.medicationStatus}>Available</Text>
                  </View>
                  
                  <View style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                      <Ionicons name="warning" size={20} color="#FF9500" />
                      <Text style={styles.medicationName}>Metformin</Text>
                    </View>
                    <Text style={styles.medicationStatus}>Prescription</Text>
                  </View>
                  
                  <View style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                      <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                      <Text style={styles.medicationName}>Vitamin D</Text>
                    </View>
                    <Text style={styles.medicationStatus}>Available</Text>
                  </View>
                  
                  <View style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                      <Ionicons name="close-circle" size={20} color="#FF3B30" />
                      <Text style={styles.medicationName}>Adderall</Text>
                    </View>
                    <Text style={styles.medicationStatus}>Banned</Text>
                  </View>
                </View>

                {/* Medication Search Bar */}
                <View style={styles.medicationSearchContainer}>
                  <TextInput
                    style={styles.medicationSearchInput}
                    placeholder="Search for medication availability..."
                    value={medicationSearch}
                    onChangeText={handleMedicationSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                </View>

                {/* Search Results */}
                {medicationSearchResults.length > 0 && (
                  <View style={styles.searchResultsContainer}>
                    {medicationSearchResults.map((medication, index) => (
                      <View key={index} style={styles.medicationCard}>
                        <View style={styles.medicationHeader}>
                          <Ionicons name={medication.icon as any} size={20} color={medication.color} />
                          <Text style={styles.medicationName}>{medication.name}</Text>
                        </View>
                        <Text style={styles.medicationStatus}>{medication.status}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Emergency Contacts Section */}
              <View style={styles.emergencyContactsSection}>
                <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                
                {travelHealth.emergencyContacts && (
                  <View style={styles.emergencyContactsContainer}>
                    {/* Emergency Services */}
                    <View style={styles.emergencyCategory}>
                      <Text style={styles.emergencyCategoryTitle}>🚨 Emergency Services</Text>
                      
                      <View style={styles.emergencyContactCard}>
                        <View style={styles.emergencyContactHeader}>
                          <Ionicons name="medical" size={20} color="#FF3B30" />
                          <Text style={styles.emergencyContactName}>Emergency</Text>
                        </View>
                        <Text style={styles.emergencyContactNumber}>{travelHealth.emergencyContacts.emergency}</Text>
                      </View>

                      <View style={styles.emergencyContactCard}>
                        <View style={styles.emergencyContactHeader}>
                          <Ionicons name="car" size={20} color="#FF3B30" />
                          <Text style={styles.emergencyContactName}>Ambulance</Text>
                        </View>
                        <Text style={styles.emergencyContactNumber}>{travelHealth.emergencyContacts.ambulance}</Text>
                      </View>

                      <View style={styles.emergencyContactCard}>
                        <View style={styles.emergencyContactHeader}>
                          <Ionicons name="shield" size={20} color="#007AFF" />
                          <Text style={styles.emergencyContactName}>Police</Text>
                        </View>
                        <Text style={styles.emergencyContactNumber}>{travelHealth.emergencyContacts.police}</Text>
                      </View>

                      <View style={styles.emergencyContactCard}>
                        <View style={styles.emergencyContactHeader}>
                          <Ionicons name="flame" size={20} color="#FF9500" />
                          <Text style={styles.emergencyContactName}>Fire</Text>
                        </View>
                        <Text style={styles.emergencyContactNumber}>{travelHealth.emergencyContacts.fire}</Text>
                      </View>
                    </View>

                    {/* Medical Services */}
                    <View style={styles.emergencyCategory}>
                      <Text style={styles.emergencyCategoryTitle}>🏥 Medical Services</Text>
                      
                      {travelHealth.emergencyContacts.poisonControl && (
                        <View style={styles.emergencyContactCard}>
                          <View style={styles.emergencyContactHeader}>
                            <Ionicons name="warning" size={20} color="#FF9500" />
                            <Text style={styles.emergencyContactName}>Poison Control</Text>
                          </View>
                          <Text style={styles.emergencyContactNumber}>{travelHealth.emergencyContacts.poisonControl}</Text>
                        </View>
                      )}

                      {travelHealth.emergencyContacts.mentalHealth && (
                        <View style={styles.emergencyContactCard}>
                          <View style={styles.emergencyContactHeader}>
                            <Ionicons name="heart" size={20} color="#FF6B9D" />
                            <Text style={styles.emergencyContactName}>Mental Health</Text>
                          </View>
                          <Text style={styles.emergencyContactNumber}>{travelHealth.emergencyContacts.mentalHealth}</Text>
                        </View>
                      )}

                      {travelHealth.emergencyContacts.nonEmergencyMedical && (
                        <View style={styles.emergencyContactCard}>
                          <View style={styles.emergencyContactHeader}>
                            <Ionicons name="call" size={20} color="#34C759" />
                            <Text style={styles.emergencyContactName}>Non-Emergency Medical</Text>
                          </View>
                          <Text style={styles.emergencyContactNumber}>{travelHealth.emergencyContacts.nonEmergencyMedical}</Text>
                        </View>
                      )}
                    </View>

                    {/* Tourist Services */}
                    {travelHealth.emergencyContacts.touristHotline && (
                      <View style={styles.emergencyCategory}>
                        <Text style={styles.emergencyCategoryTitle}>🏛️ Tourist Services</Text>
                        
                        <View style={styles.emergencyContactCard}>
                          <View style={styles.emergencyContactHeader}>
                            <Ionicons name="information-circle" size={20} color="#007AFF" />
                            <Text style={styles.emergencyContactName}>Tourist Hotline</Text>
                          </View>
                          <Text style={styles.emergencyContactNumber}>{travelHealth.emergencyContacts.touristHotline}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Fallback if no emergency contacts */}
                {!travelHealth.emergencyContacts && (
                  <View style={styles.noEmergencyContactsCard}>
                    <Ionicons name="warning" size={24} color="#FF9500" />
                    <Text style={styles.noEmergencyContactsText}>Emergency contacts not available</Text>
                    <Text style={styles.noEmergencyContactsSubtext}>Contact local authorities for assistance</Text>
                  </View>
                )}
              </View>

              {/* Healthcare Facilities - Simplified */}
              {travelHealth.healthcareFacilities && (
                <View style={styles.healthcareSection}>
                  <Text style={styles.sectionTitle}>Healthcare</Text>
                  {renderHealthcareFacilities(travelHealth.healthcareFacilities)}
                </View>
              )}

              {/* Jet Lag Info - Keep this */}
              {travelHealth.jetLagData && renderJetLagCard(travelHealth.jetLagData)}

              {/* Weather - Simplified */}
              {travelHealth.weatherData && (
                <View style={styles.weatherSection}>
                  <Text style={styles.sectionTitle}>Weather</Text>
                  {renderWeatherCard(travelHealth.weatherData)}
                </View>
              )}
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

      {/* Trip Details Modal */}
      <TripDetailsModal />

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === 'departure' ? newTripDepartureDate : (newTripReturnDate || new Date())}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            if (event.type === 'dismissed') {
              setShowDatePicker(null);
              return;
            }
            
            setShowDatePicker(null);
            if (selectedDate) {
              if (showDatePicker === 'departure') {
                setNewTripDepartureDate(selectedDate);
              } else {
                setNewTripReturnDate(selectedDate);
              }
            }
          }}
          minimumDate={new Date()}
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
    color: '#FFFFFF',
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
    marginBottom: 24,
  },
  vaccinationSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  vaccinationItem: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
  },
  vaccinationText: {
    fontSize: 14,
    color: '#FFFFFF',
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
locationCard: {
  backgroundColor: '#1C1C1E',
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
riskIndicator: {
  flexDirection: 'row',
  alignItems: 'center',
},
riskText: {
  fontSize: 14,
  fontWeight: '600',
  marginLeft: 6,
},
metricsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginBottom: 20,
},
healthcareSection: {
  marginBottom: 20,
},
weatherSection: {
  marginBottom: 20,
},
sectionTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#FFFFFF',
  marginBottom: 12,
},
datePickerText: {
  fontSize: 16,
  color: '#FFFFFF',
},
locationTimeHeader: {
  marginBottom: 20,
},
locationFlagContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#2C2C2E',
  borderRadius: 12,
  padding: 16,
},
flagIcon: {
  marginRight: 12,
},
locationInfo: {
  flex: 1,
},
locationTime: {
  fontSize: 14,
  color: '#8E8E93',
  marginTop: 2,
},
overallRiskCard: {
  backgroundColor: '#2C2C2E',
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
  borderLeftWidth: 4,
  borderLeftColor: '#FF9500',
},
riskHeader: {
  flexDirection: 'row',
  alignItems: 'center',
},
overallRiskTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#FFFFFF',
  marginLeft: 8,
  flex: 1,
},
healthCardsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginBottom: 24,
},
healthCard: {
  width: '48%',
  backgroundColor: '#2C2C2E',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  borderLeftWidth: 4,
},
cardHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},
cardIcon: {
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 8,
},
cardTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#FFFFFF',
},
cardValue: {
  fontSize: 12,
  color: '#8E8E93',
  lineHeight: 16,
},
medicationAvailabilitySection: {
  marginBottom: 24,
},
medicationGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
},
medicationCard: {
  width: '48%',
  backgroundColor: '#2C2C2E',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
},
medicationHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},
medicationStatus: {
  fontSize: 12,
  color: '#8E8E93',
  fontWeight: '500',
},
locationTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#FFFFFF',
},
medicationName: {
  fontSize: 14,
  fontWeight: '500',
  color: '#FFFFFF',
  marginLeft: 8,
},
countryFlag: {
  fontSize: 32,
  marginRight: 12,
},
riskEmoji: {
  fontSize: 24,
  marginRight: 8,
},
healthMetricsContainer: {
  marginBottom: 24,
},
metricRow: {
  flexDirection: 'row',
  backgroundColor: '#2C2C2E',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  borderLeftWidth: 4,
},
scoreContainer: {
  alignItems: 'center',
  marginRight: 16,
  minWidth: 60,
},
scoreValue: {
  fontSize: 28,
  fontWeight: 'bold',
  marginBottom: 4,
},
scoreLabel: {
  fontSize: 12,
  color: '#8E8E93',
  fontWeight: '500',
},
metricInfo: {
  flex: 1,
},
metricTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#FFFFFF',
  marginBottom: 4,
},
metricStatus: {
  fontSize: 14,
  fontWeight: '500',
  marginBottom: 6,
},
metricDescription: {
  fontSize: 12,
  color: '#8E8E93',
  lineHeight: 16,
},
healthcareFacilitiesSection: {
  marginBottom: 24,
},
facilityCategory: {
  marginBottom: 16,
},
facilityCategoryTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#FFFFFF',
  marginBottom: 8,
},
facilityCard: {
  flexDirection: 'row',
  backgroundColor: '#2C2C2E',
  borderRadius: 12,
  padding: 16,
  marginBottom: 8,
  justifyContent: 'space-between',
  alignItems: 'center',
},
facilityInfo: {
  flex: 1,
  marginRight: 12,
},
facilityName: {
  fontSize: 14,
  fontWeight: '600',
  color: '#FFFFFF',
  marginBottom: 4,
},
facilityAddress: {
  fontSize: 12,
  color: '#8E8E93',
  marginBottom: 4,
},
facilityRating: {
  flexDirection: 'row',
  alignItems: 'center',
},
ratingText: {
  fontSize: 12,
  color: '#FFFFFF',
  marginLeft: 4,
},
ratingCount: {
  fontSize: 11,
  color: '#8E8E93',
  marginLeft: 4,
},
facilityDistance: {
  alignItems: 'flex-end',
},
distanceText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#FFFFFF',
},
distanceLabel: {
  fontSize: 11,
  color: '#8E8E93',
  marginTop: 2,
},
noFacilitiesCard: {
  backgroundColor: '#2C2C2E',
  borderRadius: 12,
  padding: 24,
  alignItems: 'center',
},
noFacilitiesText: {
  fontSize: 14,
  color: '#FFFFFF',
  marginTop: 8,
  marginBottom: 4,
},
noFacilitiesSubtext: {
  fontSize: 12,
  color: '#8E8E93',
},
vaccinationContainer: {
  marginBottom: 16,
},
vaccinationRiskCard: {
  backgroundColor: '#2C2C2E',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  borderLeftWidth: 4,
},
vaccinationRiskHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},
vaccinationRiskTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#FFFFFF',
  marginLeft: 8,
},
vaccinationRiskLevel: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 8,
},
vaccinationDescription: {
  fontSize: 12,
  color: '#8E8E93',
  lineHeight: 16,
},
vaccinationCategory: {
  marginBottom: 16,
},
vaccinationCategoryTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#FFFFFF',
  marginBottom: 8,
},
vaccinationItem: {
  backgroundColor: '#2C2C2E',
  borderRadius: 8,
  padding: 12,
  marginBottom: 6,
},
vaccinationItemHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},
vaccinationItemName: {
  fontSize: 13,
  fontWeight: '500',
  color: '#FFFFFF',
  marginLeft: 8,
},
vaccinationItemNote: {
  fontSize: 11,
  color: '#8E8E93',
  marginLeft: 24,
},
noVaccinationsCard: {
  backgroundColor: '#2C2C2E',
  borderRadius: 12,
  padding: 24,
  alignItems: 'center',
},
noVaccinationsText: {
  fontSize: 14,
  color: '#FFFFFF',
  marginTop: 8,
  marginBottom: 4,
},
noVaccinationsSubtext: {
  fontSize: 12,
  color: '#8E8E93',
},
userMedicationSection: {
  marginBottom: 24,
},
medicationSearchContainer: {
  position: 'relative',
  marginTop: 12,
},
medicationSearchInput: {
  backgroundColor: '#2C2C2E',
  borderRadius: 12,
  padding: 16,
  paddingLeft: 48,
  fontSize: 14,
  color: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#3A3A3C',
},
searchIcon: {
  position: 'absolute',
  left: 16,
  top: 16,
  zIndex: 1,
},
searchResultsContainer: {
  marginTop: 8,
},
destinationSearchContainer: {
  position: 'relative',
  zIndex: 10,
},
suggestionsContainer: {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: '#2C2C2E',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#3A3A3C',
  maxHeight: 200,
  zIndex: 1000,
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},
suggestionItem: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#3A3A3C',
},
suggestionText: {
  fontSize: 14,
  color: '#FFFFFF',
  marginLeft: 8,
  flex: 1,
},
tripInfoSection: {
  marginBottom: 24,
},
tripInfoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},
tripInfoText: {
  fontSize: 14,
  color: '#FFFFFF',
  marginLeft: 8,
},
checklistSection: {
  marginBottom: 24,
},
checklistCategory: {
  marginBottom: 16,
},
checklistCategoryTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#FFFFFF',
  marginBottom: 12,
},
checklistItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 4,
},
checklistItemText: {
  fontSize: 14,
  color: '#FFFFFF',
  marginLeft: 12,
  flex: 1,
},
checklistItemCompleted: {
  textDecorationLine: 'line-through',
  color: '#8E8E93',
},
jetLagPlannerSection: {
  marginBottom: 24,
},
timeInputSection: {
  marginBottom: 16,
},
timeInputRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 12,
},
timeInputLabel: {
  fontSize: 14,
  color: '#FFFFFF',
  fontWeight: '500',
},
timeInput: {
  backgroundColor: '#2C2C2E',
  borderRadius: 8,
  padding: 12,
  fontSize: 14,
  color: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#3A3A3C',
  width: 100,
  textAlign: 'center',
},
circadianPlanSection: {
  marginTop: 16,
},
circadianPlanTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#FFFFFF',
  marginBottom: 12,
},
circadianPlanDay: {
  backgroundColor: '#2C2C2E',
  borderRadius: 8,
  padding: 12,
  marginBottom: 8,
},
circadianPlanHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
},
circadianPlanDayText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#FFFFFF',
},
circadianPlanTime: {
  fontSize: 12,
  color: '#8E8E93',
},
circadianPlanAction: {
  fontSize: 13,
  color: '#FFFFFF',
},
checklistSummary: {
  marginTop: 8,
  padding: 8,
  backgroundColor: '#2C2C2E',
  borderRadius: 6,
},
checklistSummaryText: {
  fontSize: 12,
  color: '#8E8E93',
  textAlign: 'center',
},
emergencyContactsSection: {
  marginBottom: 24,
},
emergencyContactsContainer: {
  marginBottom: 16,
},
emergencyCategory: {
  marginBottom: 16,
},
emergencyCategoryTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#FFFFFF',
  marginBottom: 8,
},
emergencyContactCard: {
  backgroundColor: '#2C2C2E',
  borderRadius: 8,
  padding: 12,
  marginBottom: 6,
},
emergencyContactHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},
emergencyContactName: {
  fontSize: 13,
  fontWeight: '500',
  color: '#FFFFFF',
  marginLeft: 8,
},
emergencyContactNumber: {
  fontSize: 14,
  fontWeight: '600',
  color: '#007AFF',
  marginLeft: 28,
},
noEmergencyContactsCard: {
  backgroundColor: '#2C2C2E',
  borderRadius: 12,
  padding: 24,
  alignItems: 'center',
},
noEmergencyContactsText: {
  fontSize: 14,
  color: '#FFFFFF',
  marginTop: 8,
  marginBottom: 4,
},
noEmergencyContactsSubtext: {
  fontSize: 12,
  color: '#8E8E93',
},
});

export default TravelScreen;
