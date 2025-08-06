import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, TextInput, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useHealthData } from '../../context/HealthDataContext';

interface Trip {
  id: string;
  name: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  timezone: string;
  notes?: string;
  jetLagData?: any;
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

interface HealthMetric {
  name: string;
  value: string;
  status: 'good' | 'moderate' | 'poor' | 'unknown';
  description: string;
  icon: string;
}

const popularCities = [
  'Tokyo, Japan',
  'Paris, France',
  'New York, USA',
  'London, UK',
  'Sydney, Australia',
  'Bangkok, Thailand',
  'Singapore',
  'Dubai, UAE',
  'Hong Kong',
  'Barcelona, Spain',
  'Rome, Italy',
  'Amsterdam, Netherlands',
  'Vienna, Austria',
  'Prague, Czech Republic',
  'Budapest, Hungary',
  'Copenhagen, Denmark',
  'Stockholm, Sweden',
  'Oslo, Norway',
  'Helsinki, Finland',
  'Reykjavik, Iceland'
];

const TravelScreen: React.FC = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState<'health' | 'trips'>('health');
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
  const [newTripName, setNewTripName] = useState('');
  const [newTripDepartureLocation, setNewTripDepartureLocation] = useState('');
  const [newTripDestination, setNewTripDestination] = useState('');
  const [newTripDepartureDate, setNewTripDepartureDate] = useState(new Date());
  const [newTripReturnDate, setNewTripReturnDate] = useState<Date | undefined>(undefined);
  const [newTripNotes, setNewTripNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState<'departure' | 'return' | null>(null);
  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const [tripSuggestions, setTripSuggestions] = useState<string[]>([]);
  const [departureSuggestions, setDepartureSuggestions] = useState<string[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [jetLagData, setJetLagData] = useState({
    departureTime: '09:00',
    arrivalTime: '15:00',
    timeZoneDifference: 0,
  });

  const { travelHealth, updateLocation, getCurrentLocation, updateTravelHealthData } = useHealthData();

  // Mock health metrics data
  const mockHealthMetrics: HealthMetric[] = [
    {
      name: 'Air Quality',
      value: 'Good',
      status: 'good',
      description: 'AQI: 45 - Healthy for most people',
      icon: 'cloud'
    },
    {
      name: 'Water Safety',
      value: 'Safe',
      status: 'good',
      description: 'Tap water is safe to drink',
      icon: 'water'
    },
    {
      name: 'UV Index',
      value: 'Moderate',
      status: 'moderate',
      description: 'UV Index: 6 - Use sunscreen',
      icon: 'sunny'
    },
    {
      name: 'Food Safety',
      value: 'Good',
      status: 'good',
      description: 'Low risk of foodborne illness',
      icon: 'restaurant'
    },
    {
      name: 'Pollen Level',
      value: 'Low',
      status: 'good',
      description: 'Pollen count: 2.3 - Minimal allergy risk',
      icon: 'leaf'
    },
    {
      name: 'Altitude',
      value: 'Low',
      status: 'good',
      description: 'Sea level - No altitude sickness risk',
      icon: 'trending-up'
    },
    {
      name: 'Disease Outbreaks',
      value: 'None',
      status: 'good',
      description: 'No current disease outbreaks reported',
      icon: 'medical'
    }
  ];

  // Update API errors when travel health data changes
  useEffect(() => {
    if (travelHealth && (travelHealth as any).apiErrors) {
      setApiErrors((travelHealth as any).apiErrors);
    } else {
      setApiErrors({});
    }
  }, [travelHealth]);

  // Filter cities based on search input
  useEffect(() => {
    if (searchLocation.trim()) {
      const filtered = popularCities.filter(city =>
        city.toLowerCase().includes(searchLocation.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [searchLocation]);

  // Filter trip destination suggestions
  useEffect(() => {
    if (newTripDestination.trim()) {
      const filtered = popularCities.filter(city =>
        city.toLowerCase().includes(newTripDestination.toLowerCase())
      );
      setTripSuggestions(filtered);
      } else {
      setTripSuggestions([]);
    }
  }, [newTripDestination]);

  // Filter departure location suggestions
  useEffect(() => {
    if (newTripDepartureLocation.trim()) {
      const filtered = popularCities.filter(city =>
        city.toLowerCase().includes(newTripDepartureLocation.toLowerCase())
      );
      setDepartureSuggestions(filtered);
    } else {
      setDepartureSuggestions([]);
    }
  }, [newTripDepartureLocation]);

  const handleRefresh = async () => {
    if (travelHealth) {
      setIsRefreshing(true);
      setApiErrors({});
      try {
        if (travelHealth.coordinates) {
          const locationData = {
            name: travelHealth.location,
            country: 'Unknown',
            coordinates: travelHealth.coordinates,
            timezone: 'UTC',
            elevation: 0,
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

  const handleLocationSelect = async (location: string) => {
    setIsLoading(true);
    setSearchLocation(location);
    setShowLocationSearch(false);
    setFilteredCities([]);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Here you would call your actual location update function
      console.log('Location selected:', location);
      } catch (error) {
      Alert.alert('Error', 'Failed to load location data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(null);
    }
    
    if (selectedDate) {
      if (showDatePicker === 'departure') {
        setNewTripDepartureDate(selectedDate);
      } else if (showDatePicker === 'return') {
        setNewTripReturnDate(selectedDate);
      }
    }
    
    // On iOS, we don't auto-close the picker, user needs to tap Done
    // The picker will stay open until user taps Cancel or Done
  };

  const handleAddTrip = () => {
    if (!newTripName.trim()) {
      Alert.alert('Error', 'Please enter a trip name');
      return;
    }
    if (!newTripDepartureLocation.trim()) {
      Alert.alert('Error', 'Please enter a departure location');
      return;
    }
    if (!newTripDestination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    const newTrip: Trip = {
      id: Date.now().toString(),
      name: newTripName.trim(),
      destination: newTripDestination.trim(),
      departureDate: newTripDepartureDate,
      returnDate: newTripReturnDate,
      timezone: 'UTC',
      notes: newTripNotes.trim(),
      checklist: {
        vaccines: [
          { name: 'COVID-19', completed: false },
          { name: 'Hepatitis A', completed: false },
          { name: 'Typhoid', completed: false }
        ],
        medicines: [
          { name: 'Pain relievers', completed: false },
          { name: 'Anti-diarrheal', completed: false },
          { name: 'Motion sickness', completed: false }
        ]
      },
      jetLagPlanner: {
        departureTime: '09:00',
        arrivalTime: '15:00',
        circadianPlan: [
          { day: 1, action: 'Stay awake', time: 'Until 10 PM local' },
          { day: 2, action: 'Gradual adjustment', time: 'Sleep 9 PM local' },
          { day: 3, action: 'Normal schedule', time: 'Regular sleep time' }
        ]
      }
    };

    setTrips(prev => [...prev, newTrip]);
    setNewTripName('');
    setNewTripDepartureLocation('');
    setNewTripDestination('');
    setNewTripDepartureDate(new Date());
    setNewTripReturnDate(undefined);
    setNewTripNotes('');
    setShowAddTripModal(false);
    setTripSuggestions([]);
    setDepartureSuggestions([]);
    Alert.alert('Success', 'Trip added successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#34C759';
      case 'moderate': return '#FF9500';
      case 'poor': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return 'checkmark-circle';
      case 'moderate': return 'warning';
      case 'poor': return 'close-circle';
      default: return 'help-circle';
    }
  };
    
    return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="airplane" size={24} color="#FFFFFF" />
              </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Travel Health</Text>
            <Text style={styles.headerSubtitle}>Destination health insights</Text>
              </View>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="#007AFF" />
          </TouchableOpacity>
            </View>
              </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'health' && styles.activeTab]} 
          onPress={() => setActiveTab('health')}
        >
          <Text style={[styles.tabText, activeTab === 'health' && styles.activeTabText]}>
            Health Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'trips' && styles.activeTab]} 
          onPress={() => setActiveTab('trips')}
        >
          <Text style={[styles.tabText, activeTab === 'trips' && styles.activeTabText]}>
            Trips Planned
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {activeTab === 'health' ? (
          <View style={styles.content}>
            {/* Location Search */}
            <View style={styles.locationSearchContainer}>
          <TouchableOpacity 
                style={styles.locationSearchButton}
                onPress={() => setShowLocationSearch(true)}
              >
                <Ionicons name="search" size={20} color="#8E8E93" />
                <Text style={styles.locationSearchText}>
                  {searchLocation || 'Search for a destination...'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#8E8E93" />
          </TouchableOpacity>
      </View>

            {/* Location Search Modal */}
            {showLocationSearch && (
              <View style={styles.searchModalOverlay}>
                <View style={styles.searchModalContent}>
                  <View style={styles.searchHeader}>
                    <Text style={styles.searchTitle}>Search Destination</Text>
                    <TouchableOpacity onPress={() => setShowLocationSearch(false)}>
                      <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
      </View>
                  
                  <TextInput
                    style={styles.searchInput}
                    value={searchLocation}
                    onChangeText={setSearchLocation}
                    placeholder="Enter city or country..."
                    placeholderTextColor="#8E8E93"
                    autoFocus
                  />
                  
                  <ScrollView style={styles.suggestionsContainer}>
                    {filteredCities.map((city, index) => (
        <TouchableOpacity 
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => handleLocationSelect(city)}
                      >
                        <Ionicons name="location" size={16} color="#007AFF" />
                        <Text style={styles.suggestionText}>{city}</Text>
        </TouchableOpacity>
                    ))}
                  </ScrollView>
            </View>
          </View>
            )}

            {/* Loading State */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading health data...</Text>
            </View>
            )}

            {/* Health Metrics */}
            {searchLocation && !isLoading ? (
              <View style={styles.metricsContainer}>
                {/* Travel Health Header */}
                <View style={styles.travelHealthHeader}>
                  <Text style={styles.travelHealthTitle}>Travel Health</Text>
                  <Text style={styles.countryName}>{searchLocation}</Text>
        </View>

                {/* Health Summary */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                    <Text style={styles.summaryTitle}>Health Summary</Text>
                </View>
                  <Text style={styles.summaryText}>Overall health risk is low for this destination. All major health metrics are within safe ranges.</Text>
            </View>

                {/* Health Metrics in Specific Order */}
                <View style={styles.metricsSection}>
                  <Text style={styles.sectionTitle}>Health Metrics</Text>
                  
                  {/* Air Quality */}
                  <View style={styles.metricRow}>
                    <View style={styles.metricIcon}>
                      <Ionicons name="cloud" size={20} color={getStatusColor('good')} />
            </View>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricName}>Air Quality</Text>
                      <Text style={styles.metricValueText}>Good</Text>
                      <Text style={styles.metricDescriptionText}>AQI: 45 - Healthy for most people</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={16} color={getStatusColor('good')} />
          </View>

                  {/* Water Safety */}
                  <View style={styles.metricRow}>
                    <View style={styles.metricIcon}>
                      <Ionicons name="water" size={20} color={getStatusColor('good')} />
        </View>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricName}>Water Safety</Text>
                      <Text style={styles.metricValueText}>Safe</Text>
                      <Text style={styles.metricDescriptionText}>Tap water is safe to drink</Text>
      </View>
                    <Ionicons name="checkmark-circle" size={16} color={getStatusColor('good')} />
    </View>

                  {/* UV Index */}
                  <View style={styles.metricRow}>
                    <View style={styles.metricIcon}>
                      <Ionicons name="sunny" size={20} color={getStatusColor('moderate')} />
              </View>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricName}>UV Index</Text>
                      <Text style={styles.metricValueText}>Moderate</Text>
                      <Text style={styles.metricDescriptionText}>UV Index: 6 - Use sunscreen</Text>
                  </View>
                    <Ionicons name="warning" size={16} color={getStatusColor('moderate')} />
          </View>

                  {/* Food Safety */}
                  <View style={styles.metricRow}>
                    <View style={styles.metricIcon}>
                      <Ionicons name="restaurant" size={20} color={getStatusColor('good')} />
          </View>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricName}>Food Safety</Text>
                      <Text style={styles.metricValueText}>Good</Text>
                      <Text style={styles.metricDescriptionText}>Low risk of foodborne illness</Text>
        </View>
                    <Ionicons name="checkmark-circle" size={16} color={getStatusColor('good')} />
            </View>

                  {/* Pollen Level */}
                  <View style={styles.metricRow}>
                    <View style={styles.metricIcon}>
                      <Ionicons name="leaf" size={20} color={getStatusColor('good')} />
            </View>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricName}>Pollen Level</Text>
                      <Text style={styles.metricValueText}>Low</Text>
                      <Text style={styles.metricDescriptionText}>Pollen count: 2.3 - Minimal allergy risk</Text>
                </View>
                    <Ionicons name="checkmark-circle" size={16} color={getStatusColor('good')} />
            </View>

                  {/* Altitude */}
                  <View style={styles.metricRow}>
                    <View style={styles.metricIcon}>
                      <Ionicons name="trending-up" size={20} color={getStatusColor('good')} />
            </View>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricName}>Altitude</Text>
                      <Text style={styles.metricValueText}>Low</Text>
                      <Text style={styles.metricDescriptionText}>Sea level - No altitude sickness risk</Text>
              </View>
                    <Ionicons name="checkmark-circle" size={16} color={getStatusColor('good')} />
          </View>
          
                  {/* Disease Outbreaks */}
                  <View style={styles.metricRow}>
                    <View style={styles.metricIcon}>
                      <Ionicons name="medical" size={20} color={getStatusColor('good')} />
            </View>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricName}>Disease Outbreaks</Text>
                      <Text style={styles.metricValueText}>None</Text>
                      <Text style={styles.metricDescriptionText}>No current disease outbreaks reported</Text>
          </View>
                    <Ionicons name="checkmark-circle" size={16} color={getStatusColor('good')} />
        </View>
      </View>

                {/* Nearby Hospitals */}
                <View style={styles.hospitalsSection}>
                  <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
                  <View style={styles.hospitalCard}>
                    <View style={styles.hospitalHeader}>
                      <Ionicons name="medical" size={20} color="#FF3B30" />
                      <Text style={styles.hospitalTitle}>Central Hospital</Text>
                      <Text style={styles.hospitalDistance}>2.1km</Text>
              </View>
                    <Text style={styles.hospitalInfo}>24/7 Emergency Services • ICU Available</Text>
                  </View>
                  
                  <View style={styles.hospitalCard}>
                    <View style={styles.hospitalHeader}>
                      <Ionicons name="medical" size={20} color="#FF3B30" />
                      <Text style={styles.hospitalTitle}>City Medical Center</Text>
                      <Text style={styles.hospitalDistance}>3.8km</Text>
          </View>
                    <Text style={styles.hospitalInfo}>General Practice • Emergency Care</Text>
        </View>

                  <View style={styles.hospitalCard}>
                    <View style={styles.hospitalHeader}>
                      <Ionicons name="medical" size={20} color="#FF3B30" />
                      <Text style={styles.hospitalTitle}>Emergency Clinic</Text>
                      <Text style={styles.hospitalDistance}>4.2km</Text>
          </View>
                    <Text style={styles.hospitalInfo}>Urgent Care • Walk-in Available</Text>
        </View>
              </View>

                {/* Vaccinations */}
                <View style={styles.vaccinationSection}>
                  <Text style={styles.sectionTitle}>Vaccinations</Text>
                  <View style={styles.vaccinationCard}>
                    <View style={styles.vaccinationHeader}>
                      <Ionicons name="shield-checkmark" size={20} color="#34C759" />
                      <Text style={styles.vaccinationTitle}>Recommended Vaccines</Text>
        </View>
                    <View style={styles.vaccineList}>
                      <View style={styles.vaccineItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                        <Text style={styles.vaccineText}>COVID-19 (if not up to date)</Text>
      </View>
                      <View style={styles.vaccineItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                        <Text style={styles.vaccineText}>Hepatitis A</Text>
    </View>
                      <View style={styles.vaccineItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                        <Text style={styles.vaccineText}>Typhoid</Text>
        </View>
      </View>
        </View>
            </View>

                {/* Personalized Medication */}
                <View style={styles.medicationSection}>
                  <Text style={styles.sectionTitle}>Personalized Medication</Text>
                  <View style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                      <Ionicons name="medical" size={20} color="#007AFF" />
                      <Text style={styles.medicationTitle}>Your Medications</Text>
        </View>
                    <View style={styles.medicationList}>
                      <View style={styles.medicationItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                        <Text style={styles.medicationText}>Pain relievers</Text>
        </View>
                      <View style={styles.medicationItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                        <Text style={styles.medicationText}>Anti-diarrheal</Text>
      </View>
                      <View style={styles.medicationItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                        <Text style={styles.medicationText}>Motion sickness</Text>
    </View>
              </View>
                  </View>
                </View>

                {/* General Medications */}
                <View style={styles.medicationSection}>
                  <Text style={styles.sectionTitle}>General Medications</Text>
                  <View style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                      <Ionicons name="medical-outline" size={20} color="#007AFF" />
                      <Text style={styles.medicationTitle}>Common Travel Medications</Text>
      </View>
                    <View style={styles.medicationList}>
                      <View style={styles.medicationItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                        <Text style={styles.medicationText}>Antihistamines</Text>
    </View>
                      <View style={styles.medicationItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                        <Text style={styles.medicationText}>Antacids</Text>
        </View>
                      <View style={styles.medicationItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                        <Text style={styles.medicationText}>Bandages & First Aid</Text>
                      </View>
                  </View>
                </View>
                </View>

                {/* Emergency Contact */}
                <View style={styles.emergencySection}>
                  <Text style={styles.sectionTitle}>Emergency Contact</Text>
                  <View style={styles.emergencyCard}>
                    <View style={styles.emergencyHeader}>
                      <Ionicons name="call" size={20} color="#FF3B30" />
                      <Text style={styles.emergencyTitle}>Emergency Numbers</Text>
                </View>
                    <View style={styles.emergencyList}>
                      <View style={styles.emergencyItem}>
                        <Text style={styles.emergencyLabel}>Police:</Text>
                        <Text style={styles.emergencyNumber}>112</Text>
        </View>
                      <View style={styles.emergencyItem}>
                        <Text style={styles.emergencyLabel}>Ambulance:</Text>
                        <Text style={styles.emergencyNumber}>112</Text>
      </View>
                      <View style={styles.emergencyItem}>
                        <Text style={styles.emergencyLabel}>Fire:</Text>
                        <Text style={styles.emergencyNumber}>112</Text>
      </View>
                      <View style={styles.emergencyItem}>
                        <Text style={styles.emergencyLabel}>Tourist Police:</Text>
                        <Text style={styles.emergencyNumber}>+1-234-567-8900</Text>
    </View>
        </View>
                  </View>
                </View>
              </View>
            ) : !isLoading ? (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={48} color="#8E8E93" />
                <Text style={styles.emptyStateTitle}>Search for a destination</Text>
                <Text style={styles.emptyStateText}>
                  Enter a city or country to get comprehensive health insights
        </Text>
        <TouchableOpacity 
                  style={styles.searchButton}
                  onPress={() => setShowLocationSearch(true)}
                >
                  <Ionicons name="search" size={20} color="#FFFFFF" />
                  <Text style={styles.searchButtonText}>Search Destination</Text>
        </TouchableOpacity>
      </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.content}>
            {/* Add Trip Section */}
            <View style={styles.addTripSection}>
      <TouchableOpacity 
                style={styles.addTripButton}
                onPress={() => setShowAddTripModal(true)}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
                <Text style={styles.addTripButtonText}>+ Add a Trip</Text>
      </TouchableOpacity>
    </View>
            
            {trips.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="airplane" size={48} color="#8E8E93" />
                <Text style={styles.emptyStateTitle}>No trips planned</Text>
                <Text style={styles.emptyStateText}>
                  Add your first trip to get personalized health recommendations
          </Text>
        </View>
            ) : (
              <View style={styles.tripsContainer}>
                {trips.map((trip) => (
        <TouchableOpacity 
                    key={trip.id} 
                    style={styles.tripCard}
                    onPress={() => {
                      setSelectedTrip(trip);
                      setShowTripDetails(true);
                    }}
                  >
                    {/* Trip Header with Flag and City */}
                    <View style={styles.tripCardHeader}>
                      <View style={styles.tripFlagContainer}>
                        <Text style={styles.tripFlag}>🏳️</Text>
      </View>
                      <View style={styles.tripInfo}>
                        <Text style={styles.tripName}>{trip.name}</Text>
                        <Text style={styles.tripDestination}>{trip.destination}</Text>
              </View>
                      <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </View>
          
                    {/* Dates and Countdown */}
                    <View style={styles.tripDatesSection}>
                      <View style={styles.dateItem}>
                        <Ionicons name="calendar" size={16} color="#007AFF" />
                        <Text style={styles.dateText}>
                          {trip.departureDate.toLocaleDateString()} - {trip.returnDate?.toLocaleDateString() || 'One way'}
          </Text>
                      </View>
                      <View style={styles.countdownContainer}>
                        <Text style={styles.countdownText}>
                          {Math.ceil((trip.departureDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
          </Text>
                      </View>
                    </View>

                    {/* Jet Lag Planner Preview */}
                    <View style={styles.jetLagPreview}>
                      <View style={styles.jetLagHeader}>
                        <Ionicons name="time" size={16} color="#FF9500" />
                        <Text style={styles.jetLagTitle}>Jet Lag Planner</Text>
                      </View>
                      <Text style={styles.jetLagInfo}>
                        Departure: {trip.jetLagPlanner?.departureTime} | Arrival: {trip.jetLagPlanner?.arrivalTime}
            </Text>
                    </View>

                    {/* Tap to View */}
                    <View style={styles.tapToView}>
                      <Text style={styles.tapToViewText}>Tap to view trip health plan</Text>
                      <Ionicons name="arrow-forward" size={16} color="#007AFF" />
                    </View>
                  </TouchableOpacity>
                ))}
        </View>
      )}
    </View>
        )}
      </ScrollView>

      {/* Add Trip Modal */}
      {showAddTripModal && (
        <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Trip</Text>
              <TouchableOpacity onPress={() => setShowAddTripModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Trip Name</Text>
          <TextInput
              style={styles.textInput}
              value={newTripName}
              onChangeText={setNewTripName}
              placeholder="Enter trip name (e.g., Summer Vacation)"
              placeholderTextColor="#8E8E93"
            />

            <Text style={styles.inputLabel}>Departure Location</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={newTripDepartureLocation}
                onChangeText={setNewTripDepartureLocation}
                placeholder="Enter departure location (e.g., New York, USA)"
                placeholderTextColor="#8E8E93"
              />
              {departureSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {departureSuggestions.slice(0, 5).map((city, index) => (
            <TouchableOpacity 
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setNewTripDepartureLocation(city);
                        setDepartureSuggestions([]);
                      }}
                    >
                      <Ionicons name="location" size={16} color="#007AFF" />
                      <Text style={styles.suggestionText}>{city}</Text>
            </TouchableOpacity>
                  ))}
                </View>
              )}
          </View>

            <Text style={styles.inputLabel}>Destination</Text>
            <View style={styles.inputContainer}>
          <TextInput
                style={styles.textInput}
            value={newTripDestination}
            onChangeText={setNewTripDestination}
                placeholder="Enter destination (e.g., Tokyo, Japan)"
                placeholderTextColor="#8E8E93"
              />
              {tripSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {tripSuggestions.slice(0, 5).map((city, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setNewTripDestination(city);
                        setTripSuggestions([]);
                      }}
                    >
                      <Ionicons name="location" size={16} color="#007AFF" />
                      <Text style={styles.suggestionText}>{city}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

          <Text style={styles.inputLabel}>Departure Date</Text>
          <TouchableOpacity 
              style={styles.dateButton}
            onPress={() => setShowDatePicker('departure')}
          >
              <Text style={styles.dateButtonText}>
              {newTripDepartureDate.toLocaleDateString()}
            </Text>
              <Ionicons name="calendar" size={16} color="#8E8E93" />
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Return Date (Optional)</Text>
          <TouchableOpacity 
              style={styles.dateButton}
            onPress={() => setShowDatePicker('return')}
          >
              <Text style={styles.dateButtonText}>
                {newTripReturnDate ? newTripReturnDate.toLocaleDateString() : 'Select date'}
            </Text>
              <Ionicons name="calendar" size={16} color="#8E8E93" />
          </TouchableOpacity>

            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
              value={newTripNotes}
              onChangeText={setNewTripNotes}
              placeholder="Add any notes about your trip..."
              placeholderTextColor="#8E8E93"
              multiline
            />
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
                style={styles.modalButton}
              onPress={() => setShowAddTripModal(false)}
            >
                <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAddTrip}
            >
                <Text style={styles.modalButtonPrimaryText}>Add Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      )}

      {/* Date Picker */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <View style={styles.datePickerModalOverlay}>
            <View style={styles.datePickerModalContent}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                  <Text style={styles.datePickerCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>
                  {showDatePicker === 'departure' ? 'Select Departure Date' : 'Select Return Date'}
          </Text>
                <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                  <Text style={styles.datePickerDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
              <DateTimePicker
                value={showDatePicker === 'departure' ? newTripDepartureDate : (newTripReturnDate || new Date())}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={showDatePicker === 'return' ? newTripDepartureDate : new Date()}
                style={styles.datePicker}
              />
            </View>
          </View>
        ) : (
          <DateTimePicker
            value={showDatePicker === 'departure' ? newTripDepartureDate : (newTripReturnDate || new Date())}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={showDatePicker === 'return' ? newTripDepartureDate : new Date()}
          />
        )
      )}

      {/* Trip Details Modal */}
      {showTripDetails && selectedTrip && (
        <View style={styles.modalOverlay}>
          <View style={styles.tripDetailsModal}>
            <View style={styles.tripDetailsHeader}>
              <Text style={styles.tripDetailsTitle}>{selectedTrip.name}</Text>
              <TouchableOpacity onPress={() => setShowTripDetails(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
    </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Trip Info */}
              <View style={styles.tripCard}>
                <View style={styles.tripCardHeader}>
                  <View style={styles.tripFlagContainer}>
                    <Text style={styles.tripFlag}>🏳️</Text>
        </View>
                  <View style={styles.tripInfo}>
                    <Text style={styles.tripName}>{selectedTrip.name}</Text>
                    <Text style={styles.tripDestination}>{selectedTrip.destination}</Text>
        </View>
      </View>
                <Text style={styles.dateText}>
                  {selectedTrip.departureDate.toLocaleDateString()} - {selectedTrip.returnDate?.toLocaleDateString() || 'One way'}
              </Text>
                {selectedTrip.notes && (
                  <Text style={styles.dateText}>Notes: {selectedTrip.notes}</Text>
                )}
          </View>

              {/* Jet Lag Planner */}
              <View style={styles.checklistSection}>
                <Text style={styles.sectionTitle}>Jet Lag Planner</Text>
                <View style={styles.jetLagPreview}>
                  <View style={styles.jetLagHeader}>
                    <Ionicons name="time" size={20} color="#FF9500" />
                    <Text style={styles.jetLagTitle}>Circadian Shift Plan</Text>
                </View>
                  {selectedTrip.jetLagPlanner?.circadianPlan.map((plan, index) => (
                    <View key={index} style={styles.checklistItem}>
                      <Text style={styles.checklistText}>
                        Day {plan.day}: {plan.action} - {plan.time}
                </Text>
              </View>
                  ))}
              </View>
            </View>

              {/* Personalized Checklist */}
              <View style={styles.checklistSection}>
                <Text style={styles.sectionTitle}>Personalized Checklist</Text>
                
                <Text style={styles.inputLabel}>Vaccines Needed</Text>
                {selectedTrip.checklist?.vaccines.map((vaccine, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.checklistItem}
                    onPress={() => {
                      const updatedTrips = trips.map(trip => 
                        trip.id === selectedTrip.id 
                          ? {
                              ...trip,
                              checklist: {
                                ...trip.checklist!,
                                vaccines: trip.checklist!.vaccines.map((v, i) => 
                                  i === index ? { ...v, completed: !v.completed } : v
                                )
                              }
                            }
                          : trip
                      );
                      setTrips(updatedTrips);
                      setSelectedTrip(updatedTrips.find(t => t.id === selectedTrip.id) || null);
                    }}
                  >
                    <View style={[
                      styles.checklistCheckbox,
                      vaccine.completed && styles.completedCheckbox
                    ]}>
                      {vaccine.completed && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[
                      styles.checklistText,
                      vaccine.completed && styles.completedText
                    ]}>
                      {vaccine.name}
            </Text>
                  </TouchableOpacity>
                ))}

                <Text style={styles.inputLabel}>Medicines to Pack</Text>
                {selectedTrip.checklist?.medicines.map((medicine, index) => (
                <TouchableOpacity
                  key={index}
                    style={styles.checklistItem}
                    onPress={() => {
                      const updatedTrips = trips.map(trip => 
                        trip.id === selectedTrip.id 
                          ? {
                              ...trip,
                              checklist: {
                                ...trip.checklist!,
                                medicines: trip.checklist!.medicines.map((m, i) => 
                                  i === index ? { ...m, completed: !m.completed } : m
                                )
                              }
                            }
                          : trip
                      );
                      setTrips(updatedTrips);
                      setSelectedTrip(updatedTrips.find(t => t.id === selectedTrip.id) || null);
                    }}
                  >
                    <View style={[
                      styles.checklistCheckbox,
                      medicine.completed && styles.completedCheckbox
                    ]}>
                      {medicine.completed && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[
                      styles.checklistText,
                      medicine.completed && styles.completedText
                    ]}>
                      {medicine.name}
                    </Text>
                </TouchableOpacity>
              ))}
            </View>
            </ScrollView>
            </View>
          </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 32,
    paddingBottom: 2,
    backgroundColor: '#1C1C1E',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
  },
  locationCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  locationSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  metricsContainer: {
    marginTop: 20,
  },
  metricCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    width: '48%', // Two columns
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  tripsContainer: {
    marginTop: 20,
  },
  tripCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripDestination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  tripDates: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  tripTimezone: {
    fontSize: 14,
    color: '#8E8E93',
  },
  addTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  addTripButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  modalScrollContent: {
    width: '100%',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  textInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3A3A3C',
    marginBottom: 8,
  },
  suggestionsContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    maxHeight: 150,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  suggestionText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  dateButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3A3A3C',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  locationSearchContainer: {
    marginBottom: 20,
  },
  locationSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  locationSearchText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  searchModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  searchModalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3A3A3C',
    marginBottom: 16,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 10,
  },
  locationInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationInfoContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  overallRisk: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    marginLeft: 8,
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
  facilityCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  facilityInfo: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  facilityDetails: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 16,
  },
  vaccinationSection: {
    marginBottom: 20,
  },
  vaccinationCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  vaccinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vaccinationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  vaccineList: {
    marginLeft: 16,
  },
  vaccineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vaccineText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  tipText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  tripProgress: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  travelHealthHeader: {
    marginBottom: 16,
  },
  travelHealthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  countryName: {
    fontSize: 18,
    color: '#8E8E93',
  },
  summaryCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  metricsSection: {
    marginBottom: 20,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricValueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricDescriptionText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  hospitalsSection: {
    marginBottom: 20,
  },
  hospitalCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hospitalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  hospitalDistance: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 8,
  },
  hospitalInfo: {
    fontSize: 14,
    color: '#8E8E93',
  },
  medicationSection: {
    marginBottom: 20,
  },
  medicationCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  medicationList: {
    marginLeft: 16,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emergencySection: {
    marginBottom: 20,
  },
  emergencyCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emergencyList: {
    marginLeft: 16,
  },
  emergencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  emergencyLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emergencyNumber: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addTripSection: {
    marginBottom: 20,
  },
  tripCardHeader: {
  flexDirection: 'row',
  alignItems: 'center',
    marginBottom: 12,
  },
  tripFlagContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A3A3C',
  justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tripFlag: {
    fontSize: 20,
  },
  tripInfo: {
  flex: 1,
},
  tripName: {
    fontSize: 18,
  fontWeight: 'bold',
  color: '#FFFFFF',
    marginBottom: 2,
  },
  tripDatesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateItem: {
  flexDirection: 'row',
  alignItems: 'center',
},
  dateText: {
  fontSize: 14,
  color: '#8E8E93',
    marginLeft: 8,
},
  countdownContainer: {
  backgroundColor: '#007AFF',
  borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
},
  countdownText: {
    fontSize: 12,
  color: '#FFFFFF',
  fontWeight: '600',
  },
  jetLagPreview: {
  backgroundColor: '#2C2C2E',
  borderRadius: 8,
  padding: 12,
    marginBottom: 12,
},
jetLagHeader: {
  flexDirection: 'row',
  alignItems: 'center',
    marginBottom: 4,
},
jetLagTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#FFFFFF',
  marginLeft: 8,
},
  jetLagInfo: {
    fontSize: 12,
  color: '#8E8E93',
    marginLeft: 24,
},
  tapToView: {
  flexDirection: 'row',
  alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3C',
  },
  tapToViewText: {
  fontSize: 14,
    color: '#007AFF',
    marginRight: 8,
  },
  tripDetailsModal: {
  backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  borderWidth: 1,
    borderColor: '#3A3A3C',
},
  tripDetailsHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
},
  tripDetailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  color: '#FFFFFF',
},
  checklistSection: {
    marginBottom: 20,
  },
  checklistItem: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#2C2C2E',
  borderRadius: 8,
  padding: 12,
    marginBottom: 8,
  },
  checklistCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
  alignItems: 'center',
},
  checklistText: {
  fontSize: 16,
  color: '#FFFFFF',
    flex: 1,
  },
  completedCheckbox: {
    backgroundColor: '#007AFF',
  },
  completedText: {
    textDecorationLine: 'line-through',
  color: '#8E8E93',
},
  datePickerModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  datePickerModalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  datePickerHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
    width: '100%',
    marginBottom: 16,
},
  datePickerCancelText: {
  fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  color: '#FFFFFF',
  },
  datePickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  datePicker: {
    width: '100%',
  backgroundColor: '#2C2C2E',
    borderRadius: 12,
  borderWidth: 1,
  borderColor: '#3A3A3C',
},
});

export default TravelScreen;

