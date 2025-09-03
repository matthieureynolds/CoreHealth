import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, TextInput, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useHealthData } from '../../context/HealthDataContext';

interface Trip {
  id: string;
  departureLocation: string;
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
    outboundPlan: {
      direction: 'outbound';
      timezoneAdjustment: string;
      circadianPlan: Array<{ day: number; action: string; time: string }>;
    };
    returnPlan?: {
      direction: 'return';
      timezoneAdjustment: string;
      circadianPlan: Array<{ day: number; action: string; time: string }>;
    };
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
  const [showDirectionsModal, setShowDirectionsModal] = useState<string | null>(null);
  const [lastDirectionsChoice, setLastDirectionsChoice] = useState<'google' | 'apple' | null>(null);
  const [alwaysUseChoice, setAlwaysUseChoice] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [expandedTrips, setExpandedTrips] = useState(new Set<string>());

  // Edit trip state
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showEditTripModal, setShowEditTripModal] = useState(false);
  const [editTripDestination, setEditTripDestination] = useState('');
  const [editTripDepartureDate, setEditTripDepartureDate] = useState(new Date());
  const [editTripReturnDate, setEditTripReturnDate] = useState<Date | undefined>(undefined);
  const [editTripNotes, setEditTripNotes] = useState('');
  const [showEditDatePicker, setShowEditDatePicker] = useState<'departure' | 'return' | null>(null);
  const [editTripSuggestions, setEditTripSuggestions] = useState<string[]>([]);
  const [editTripDepartureLocation, setEditTripDepartureLocation] = useState('');
  const [editTripDepartureSuggestions, setEditTripDepartureSuggestions] = useState<string[]>([]);

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

  // Filter edit trip destination suggestions
  useEffect(() => {
    if (editTripDestination.trim()) {
      const filtered = popularCities.filter(city =>
        city.toLowerCase().includes(editTripDestination.toLowerCase())
      );
      setEditTripSuggestions(filtered);
    } else {
      setEditTripSuggestions([]);
    }
  }, [editTripDestination]);

  // Filter edit trip departure location suggestions
  useEffect(() => {
    if (editTripDepartureLocation.trim()) {
      const filtered = popularCities.filter(city =>
        city.toLowerCase().includes(editTripDepartureLocation.toLowerCase())
      );
      setEditTripDepartureSuggestions(filtered);
    } else {
      setEditTripDepartureSuggestions([]);
    }
  }, [editTripDepartureLocation]);

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

  const handleLocationSelect = async (city: string) => {
    setSearchLocation(city);
    setShowLocationSearch(false);
    setFilteredCities([]);
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll use mock data
      const mockHealthData = {
        name: city,
        location: city,
        country: getCountryFromCity(city),
        coordinates: { latitude: 0, longitude: 0 },
        timezone: 'UTC',
        elevation: 0,
        airQuality: { value: 'Good', status: 'good', description: 'AQI: 45 - Healthy for most people' },
        waterSafety: { value: 'Safe', status: 'good', description: 'Tap water is safe to drink' },
        uvIndex: { value: 'Moderate', status: 'moderate', description: 'UV Index: 6 - Use sunscreen' },
        foodSafety: { value: 'Good', status: 'good', description: 'Low risk of foodborne illness' },
        pollenLevel: { value: 'Low', status: 'good', description: 'Pollen count: 2.3 - Minimal allergy risk' },
        altitudeRisk: { value: 'Low', status: 'good', description: 'Sea level - No altitude sickness risk' },
        diseaseOutbreaks: { value: 'None', status: 'good', description: 'No current disease outbreaks reported' }
      };
      
      // Update context
      await updateTravelHealthData(mockHealthData);
      
    } catch (error) {
      console.error('Error fetching health data:', error);
      setApiErrors(prev => ({ ...prev, general: 'Failed to fetch health data. Please try again.' }));
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
      departureLocation: newTripDepartureLocation.trim(),
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
        outboundPlan: {
          direction: 'outbound',
          timezoneAdjustment: '+9', // Example: Tokyo is +9 from UTC
          circadianPlan: [
            { day: -3, action: 'Start adjusting sleep schedule', time: 'Go to bed 1.5 hours earlier each day' },
            { day: -2, action: 'Continue adjustment', time: 'Go to bed 3 hours earlier' },
            { day: -1, action: 'Final adjustment', time: 'Go to bed 4.5 hours earlier' },
            { day: 0, action: 'Travel day', time: 'Stay awake until local bedtime' },
            { day: 1, action: 'First day at destination', time: 'Follow local schedule' },
            { day: 2, action: 'Continue adjustment', time: 'Gradual adaptation' },
            { day: 3, action: 'Normal schedule', time: 'Regular sleep time' }
          ]
        },
        returnPlan: newTripReturnDate ? {
          direction: 'return',
          timezoneAdjustment: '-9', // Example: Return to home timezone
          circadianPlan: [
            { day: -3, action: 'Start adjusting sleep schedule', time: 'Go to bed 1.5 hours later each day' },
            { day: -2, action: 'Continue adjustment', time: 'Go to bed 3 hours later' },
            { day: -1, action: 'Final adjustment', time: 'Go to bed 4.5 hours later' },
            { day: 0, action: 'Return travel day', time: 'Stay awake until local bedtime' },
            { day: 1, action: 'First day back home', time: 'Follow local schedule' },
            { day: 2, action: 'Continue adjustment', time: 'Gradual adaptation' },
            { day: 3, action: 'Normal schedule', time: 'Regular sleep time' }
          ]
        } : undefined
      }
    };

    setTrips(prev => [...prev, newTrip]);
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

  const toggleTripExpansion = (tripId: string) => {
    const newExpandedTrips = new Set(expandedTrips);
    if (newExpandedTrips.has(tripId)) {
      newExpandedTrips.delete(tripId);
    } else {
      newExpandedTrips.add(tripId);
    }
    setExpandedTrips(newExpandedTrips);
  };

  const handleTripChecklistToggle = (tripId: string, type: 'vaccines' | 'medicines', index: number) => {
    setTrips(prevTrips => prevTrips.map(trip => {
      if (trip.id === tripId) {
        const updatedTrip = { ...trip };
        if (!updatedTrip.checklist) {
          updatedTrip.checklist = {
            vaccines: [],
            medicines: []
          };
        }
        
        if (type === 'vaccines') {
          if (!updatedTrip.checklist.vaccines[index]) {
            updatedTrip.checklist.vaccines[index] = { name: '', completed: false };
          }
          updatedTrip.checklist.vaccines[index].completed = !updatedTrip.checklist.vaccines[index].completed;
        } else {
          if (!updatedTrip.checklist.medicines[index]) {
            updatedTrip.checklist.medicines[index] = { name: '', completed: false };
          }
          updatedTrip.checklist.medicines[index].completed = !updatedTrip.checklist.medicines[index].completed;
        }
        
        return updatedTrip;
      }
      return trip;
    }));
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

  const getCountryFromCity = (city: string): string => {
    // Simple mapping for demo purposes
    const cityCountryMap: { [key: string]: string } = {
      'Tokyo': 'Japan',
      'Paris': 'France',
      'New York': 'USA',
      'London': 'UK',
      'Sydney': 'Australia',
      'Bangkok': 'Thailand',
      'Singapore': 'Singapore',
      'Dubai': 'UAE',
      'Hong Kong': 'Hong Kong',
      'Barcelona': 'Spain',
      'Rome': 'Italy',
      'Amsterdam': 'Netherlands',
      'Vienna': 'Austria',
      'Prague': 'Czech Republic',
      'Budapest': 'Hungary',
      'Copenhagen': 'Denmark',
      'Stockholm': 'Sweden',
      'Oslo': 'Norway',
      'Helsinki': 'Finland',
      'Reykjavik': 'Iceland',
      'Current Location': 'Your Location'
    };
    
    // Try to find exact match first
    if (cityCountryMap[city]) {
      return cityCountryMap[city];
    }
    
    // Try to find partial match
    const partialMatch = Object.keys(cityCountryMap).find(key => 
      city.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(city.toLowerCase())
    );
    
    return partialMatch ? cityCountryMap[partialMatch] : 'Unknown';
  };

  const getCountryFlag = (country: string): string => {
    const countryFlags: { [key: string]: string } = {
      'Japan': '🇯🇵',
      'France': '🇫🇷',
      'USA': '🇺🇸',
      'UK': '🇬🇧',
      'Australia': '🇦🇺',
      'Thailand': '🇹🇭',
      'Singapore': '🇸🇬',
      'UAE': '🇦🇪',
      'Hong Kong': '🇭🇰',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Netherlands': '🇳🇱',
      'Austria': '🇦🇹',
      'Czech Republic': '🇨🇿',
      'Hungary': '🇭🇺',
      'Denmark': '🇩🇰',
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Finland': '🇫🇮',
      'Iceland': '🇮🇸',
      'Your Location': '📍',
      'Unknown': '🌍'
    };
    
    return countryFlags[country] || '🌍';
  };

  const handleTripOptions = (trip: Trip) => {
    Alert.alert(
      'Trip Options',
      'What would you like to do with this trip?',
      [
        {
          text: 'Modify Dates',
          onPress: () => handleModifyTripDates(trip),
        },
        {
          text: 'Change Location',
          onPress: () => handleChangeTripLocation(trip),
        },
        {
          text: 'Delete Trip',
          onPress: () => handleDeleteTrip(trip.id),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleModifyTripDates = (trip: Trip) => {
    setEditingTrip(trip);
    setEditTripDepartureLocation(trip.departureLocation || 'Home');
    setEditTripDestination(trip.destination);
    setEditTripDepartureDate(trip.departureDate);
    setEditTripReturnDate(trip.returnDate);
    setEditTripNotes(trip.notes || '');
    setShowEditTripModal(true);
  };

  const handleChangeTripLocation = (trip: Trip) => {
    setEditingTrip(trip);
    setEditTripDepartureLocation(trip.departureLocation || 'Home');
    setEditTripDestination(trip.destination);
    setEditTripDepartureDate(trip.departureDate);
    setEditTripReturnDate(trip.returnDate);
    setEditTripNotes(trip.notes || '');
    setShowEditTripModal(true);
  };

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
            Alert.alert('Success', 'Trip deleted successfully!');
          },
        },
      ]
    );
  };

  const handleSaveEditTrip = () => {
    if (!editingTrip || !editTripDepartureLocation.trim() || !editTripDestination.trim()) {
      Alert.alert('Error', 'Please enter both departure location and destination');
      return;
    }

    const updatedTrip: Trip = {
      ...editingTrip,
      departureLocation: editTripDepartureLocation.trim(),
      destination: editTripDestination.trim(),
      departureDate: editTripDepartureDate,
      returnDate: editTripReturnDate,
      notes: editTripNotes.trim(),
      jetLagPlanner: {
        departureTime: '09:00',
        arrivalTime: '15:00',
        outboundPlan: {
          direction: 'outbound',
          timezoneAdjustment: '+9', // Example: Tokyo is +9 from UTC
          circadianPlan: [
            { day: -3, action: 'Start adjusting sleep schedule', time: 'Go to bed 1.5 hours earlier each day' },
            { day: -2, action: 'Continue adjustment', time: 'Go to bed 3 hours earlier' },
            { day: -1, action: 'Final adjustment', time: 'Go to bed 4.5 hours earlier' },
            { day: 0, action: 'Travel day', time: 'Stay awake until local bedtime' },
            { day: 1, action: 'First day at destination', time: 'Follow local schedule' },
            { day: 2, action: 'Continue adjustment', time: 'Gradual adaptation' },
            { day: 3, action: 'Normal schedule', time: 'Regular sleep time' }
          ]
        },
        returnPlan: editTripReturnDate ? {
          direction: 'return',
          timezoneAdjustment: '-9', // Example: Return to home timezone
          circadianPlan: [
            { day: -3, action: 'Start adjusting sleep schedule', time: 'Go to bed 1.5 hours later each day' },
            { day: -2, action: 'Continue adjustment', time: 'Go to bed 3 hours later' },
            { day: -1, action: 'Final adjustment', time: 'Go to bed 4.5 hours later' },
            { day: 0, action: 'Return travel day', time: 'Stay awake until local bedtime' },
            { day: 1, action: 'First day back home', time: 'Follow local schedule' },
            { day: 2, action: 'Continue adjustment', time: 'Gradual adaptation' },
            { day: 3, action: 'Normal schedule', time: 'Regular sleep time' }
          ]
        } : undefined
      }
    };

    setTrips(prevTrips => prevTrips.map(trip => 
      trip.id === editingTrip.id ? updatedTrip : trip
    ));

    // Reset edit state
    setEditingTrip(null);
    setEditTripDepartureLocation('');
    setEditTripDestination('');
    setEditTripDepartureDate(new Date());
    setEditTripReturnDate(undefined);
    setEditTripNotes('');
    setShowEditTripModal(false);
    setEditTripSuggestions([]);
    setEditTripDepartureSuggestions([]);
    
    Alert.alert('Success', 'Trip updated successfully!');
  };
    
    return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Travel Health</Text>
          <Text style={styles.headerSubtitle}>Destination health insights and safety information</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={styles.tabScrollContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'health' && styles.activeTab]} 
            onPress={() => setActiveTab('health')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'health' && styles.activeTabText]}>
              Search
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'trips' && styles.activeTab]} 
            onPress={() => setActiveTab('trips')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'trips' && styles.activeTabText]}>
              Trip Planning
            </Text>
          </TouchableOpacity>
        </View>
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
                    onChangeText={(text) => {
                      setSearchLocation(text);
                      if (text.trim()) {
                        const filtered = popularCities.filter(city => 
                          city.toLowerCase().includes(text.toLowerCase())
                        );
                        setFilteredCities(filtered.slice(0, 8));
                      } else {
                        setFilteredCities([]);
                      }
                    }}
                    placeholder="Enter city or country..."
                    placeholderTextColor="#8E8E93"
                    autoFocus
                    onSubmitEditing={() => {
                      if (searchLocation.trim()) {
                        handleLocationSelect(searchLocation.trim());
                      }
                    }}
                  />
                  
                  {/* City Suggestions */}
                  {filteredCities.length > 0 && (
                    <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
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
                  )}
                  
                  {/* Empty State */}
                  {searchLocation.trim() && filteredCities.length === 0 && (
                    <View style={styles.emptyStateContainer}>
                      <Text style={styles.emptyStateText}>No matches. Try full city name.</Text>
                    </View>
                  )}
                  
                  {/* Use Current Location Option */}
                  <TouchableOpacity 
                    style={styles.useCurrentLocationButton}
                    onPress={async () => {
                      try {
                        setIsGettingLocation(true);
                        const location = await getCurrentLocation();
                        if (location) {
                          // Simulate getting city name from coordinates
                          const cityName = "Current Location";
                          setSearchLocation(cityName);
                          setShowLocationSearch(false);
                          setFilteredCities([]);
                          await handleLocationSelect(cityName);
                        }
                      } catch (error) {
                        Alert.alert(
                          'Location Permission Required',
                          'Please enable location access in Settings to use this feature.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Settings', onPress: () => {
                              // Deep link to settings (platform specific)
                              if (Platform.OS === 'ios') {
                                // iOS settings deep link
                              } else {
                                // Android settings deep link
                              }
                            }}
                          ]
                        );
                      } finally {
                        setIsGettingLocation(false);
                      }
                    }}
                    disabled={isGettingLocation}
                  >
                    <Ionicons 
                      name="location" 
                      size={20} 
                      color={isGettingLocation ? "#8E8E93" : "#007AFF"} 
                    />
                    <Text style={[
                      styles.useCurrentLocationText,
                      isGettingLocation && styles.useCurrentLocationTextDisabled
                    ]}>
                      {isGettingLocation ? 'Getting location...' : 'Use current location'}
                    </Text>
                    {isGettingLocation && (
                      <ActivityIndicator size="small" color="#8E8E93" style={{ marginLeft: 8 }} />
                    )}
                  </TouchableOpacity>
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
                {/* Result Title Row */}
                <View style={styles.resultTitleRow}>
                  <Text style={styles.resultTitle}>
                    {searchLocation}, {getCountryFromCity(searchLocation)} {getCountryFlag(getCountryFromCity(searchLocation))}
                  </Text>
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

                  {/* Separator */}
                  <View style={styles.metricSeparator} />

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

                  {/* Separator */}
                  <View style={styles.metricSeparator} />

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
                    <Ionicons name="warning" size={16} color="#FFFFFF" />
                  </View>

                  {/* Separator */}
                  <View style={styles.metricSeparator} />

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
                  <TouchableOpacity 
                    style={styles.emergencyCard}
                    onPress={() => setShowEmergencyModal(true)}
                  >
                    <View style={styles.emergencyHeader}>
                      <Ionicons name="call" size={20} color="#FF3B30" />
                      <Text style={styles.emergencyTitle}>Emergency: 112</Text>
                    </View>
                    <Text style={styles.emergencyDescription}>Tap to call emergency services</Text>
                  </TouchableOpacity>
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
            {trips.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="airplane" size={48} color="#8E8E93" />
                <Text style={styles.emptyStateTitle}>No trips planned</Text>
                <Text style={styles.emptyStateText}>
                  Add your first trip to get personalized health recommendations
                </Text>
                
                {/* Add Trip Button - positioned below description like Vaccinations page */}
                <TouchableOpacity 
                  style={styles.addTripButton}
                  onPress={() => setShowAddTripModal(true)}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                  <Text style={styles.addTripButtonText}>Add a Trip</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.tripsContainer}>
                {/* Add Another Trip Button - positioned above trips */}
                <TouchableOpacity 
                  style={styles.addTripButton}
                  onPress={() => setShowAddTripModal(true)}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                  <Text style={styles.addTripButtonText}>Add Another Trip</Text>
                </TouchableOpacity>
                
                {trips.map((trip) => (
                  <View key={trip.id}>
                    <View style={styles.tripCard}>
                      {/* Orange accent line on left */}
                      <View style={styles.tripCardAccent} />
                      
                      {/* Main content */}
                      <View style={styles.tripCardContent}>
                        {/* Title with close button */}
                        <View style={styles.tripCardHeader}>
                          <Text style={styles.tripCardTitle}>Outbound Jet Lag Planning</Text>
                          <TouchableOpacity 
                            style={styles.tripCardCloseButton}
                            onPress={() => handleModifyTripDates(trip)}
                          >
                            <Ionicons name="close" size={20} color="#8E8E93" />
                          </TouchableOpacity>
                        </View>
                        
                        {/* Destination with status */}
                        <View style={styles.tripDestinationRow}>
                          <View style={styles.tripDestinationLeft}>
                            <View style={styles.tripDestinationDot} />
                            <View>
                              <Text style={styles.tripDestinationText}>{trip.destination}</Text>
                              <Text style={styles.tripStatusText}>URGENT</Text>
                            </View>
                          </View>
                          <View style={styles.tripDestinationRight}>
                            <Ionicons name="chevron-forward" size={20} color="#FF9500" />
                            <Text style={styles.tripDirectionText}>Eastward</Text>
                          </View>
                        </View>
                        
                        {/* Key Metrics Row */}
                        <View style={styles.tripMetricsRow}>
                          <View style={styles.tripMetric}>
                            <Ionicons name="time" size={16} color="#8E8E93" />
                            <Text style={styles.tripMetricLabel}>Time Difference</Text>
                            <Text style={styles.tripMetricValue}>
                              {trip.jetLagPlanner?.outboundPlan?.timezoneAdjustment || '5h'}
                            </Text>
                          </View>
                          <View style={styles.tripMetric}>
                            <Ionicons name="calendar" size={16} color="#8E8E93" />
                            <Text style={styles.tripMetricLabel}>Departure</Text>
                            <Text style={styles.tripMetricValue}>
                              {trip.departureDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                            </Text>
                          </View>
                          <View style={styles.tripMetric}>
                            <Ionicons name="bed" size={16} color="#8E8E93" />
                            <Text style={styles.tripMetricLabel}>Days to Adjust</Text>
                            <Text style={styles.tripMetricValue}>
                              {trip.jetLagPlanner?.outboundPlan?.circadianPlan?.length || 4}
                            </Text>
                          </View>
                        </View>
                        
                        {/* Sleep Adjustment Schedule */}
                        <View style={styles.sleepScheduleSection}>
                          <Text style={styles.sleepScheduleTitle}>Sleep Adjustment Schedule</Text>
                          <View style={styles.sleepSchedulePreview}>
                            <View style={styles.sleepScheduleRow}>
                              <Text style={styles.sleepScheduleDay}>Day 1</Text>
                              <Text style={styles.sleepScheduleTime}>22:00 → 21:00</Text>
                            </View>
                            <View style={styles.sleepScheduleRow}>
                              <Text style={styles.sleepScheduleDay}>Day 2</Text>
                              <Text style={styles.sleepScheduleTime}>21:00 → 20:00</Text>
                            </View>
                          </View>
                        </View>
                        
                        {/* Action Banner */}
                        <View style={styles.tripActionBanner}>
                          <Ionicons name="warning" size={16} color="#FFFFFF" />
                          <Text style={styles.tripActionText}>
                            Start adjusting sleep schedule from {trip.departureDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                          </Text>
                        </View>

                        {/* Return Jet Lag Planning Card - Only show if return date exists */}
                        {trip.returnDate && trip.jetLagPlanner?.returnPlan && (
                          <View style={styles.tripCard}>
                            {/* Orange accent line on left */}
                            <View style={styles.tripCardAccent} />
                            
                            {/* Main content */}
                            <View style={styles.tripCardContent}>
                              {/* Title with close button */}
                              <View style={styles.tripCardHeader}>
                                <Text style={styles.tripCardTitle}>Return Jet Lag Planning</Text>
                                <TouchableOpacity 
                                  style={styles.tripCardCloseButton}
                                  onPress={() => handleModifyTripDates(trip)}
                                >
                                  <Ionicons name="close" size={20} color="#8E8E93" />
                                </TouchableOpacity>
                              </View>
                              
                              {/* Destination with status */}
                              <View style={styles.tripDestinationRow}>
                                <View style={styles.tripDestinationLeft}>
                                  <View style={styles.tripDestinationDot} />
                                  <View>
                                    <Text style={styles.tripDestinationText}>Return to Home</Text>
                                    <Text style={styles.tripStatusText}>PLANNED</Text>
                                  </View>
                                </View>
                                <View style={styles.tripDestinationRight}>
                                  <Ionicons name="chevron-back" size={20} color="#FF9500" />
                                  <Text style={styles.tripDirectionText}>Westward</Text>
                                </View>
                              </View>
                              
                              {/* Key Metrics Row */}
                              <View style={styles.tripMetricsRow}>
                                <View style={styles.tripMetric}>
                                  <Ionicons name="time" size={16} color="#8E8E93" />
                                  <Text style={styles.tripMetricLabel}>Time Difference</Text>
                                  <Text style={styles.tripMetricValue}>
                                    {trip.jetLagPlanner.returnPlan.timezoneAdjustment}
                                  </Text>
                                </View>
                                <View style={styles.tripMetric}>
                                  <Ionicons name="calendar" size={16} color="#8E8E93" />
                                  <Text style={styles.tripMetricLabel}>Return</Text>
                                  <Text style={styles.tripMetricValue}>
                                    {trip.returnDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                                  </Text>
                                </View>
                                <View style={styles.tripMetric}>
                                  <Ionicons name="bed" size={16} color="#8E8E93" />
                                  <Text style={styles.tripMetricLabel}>Days to Adjust</Text>
                                  <Text style={styles.tripMetricValue}>
                                    {trip.jetLagPlanner.returnPlan.circadianPlan?.length || 4}
                                  </Text>
                                </View>
                              </View>
                              
                              {/* Sleep Adjustment Schedule */}
                              <View style={styles.sleepScheduleSection}>
                                <Text style={styles.sleepScheduleTitle}>Sleep Adjustment Schedule</Text>
                                <View style={styles.sleepSchedulePreview}>
                                  <View style={styles.sleepScheduleRow}>
                                    <Text style={styles.sleepScheduleDay}>Day 1</Text>
                                    <Text style={styles.sleepScheduleTime}>22:00 → 23:00</Text>
                                  </View>
                                  <View style={styles.sleepScheduleRow}>
                                    <Text style={styles.sleepScheduleDay}>Day 2</Text>
                                    <Text style={styles.sleepScheduleTime}>23:00 → 00:00</Text>
                                  </View>
                                </View>
                              </View>
                              
                              {/* Action Banner */}
                              <View style={styles.tripActionBanner}>
                                <Ionicons name="warning" size={16} color="#FFFFFF" />
                                <Text style={styles.tripActionText}>
                                  Start adjusting sleep schedule from {trip.returnDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                                </Text>
                              </View>
                            </View>
                          </View>
                        )}

                        {/* + View More Button */}
                        <TouchableOpacity 
                          style={styles.viewMoreButton}
                          onPress={() => toggleTripExpansion(trip.id)}
                        >
                          <Text style={styles.viewMoreButtonText}>
                            {expandedTrips.has(trip.id) ? "View Less" : "+ View More"}
                          </Text>
                        </TouchableOpacity>

                        {/* Expandable Checklist Section - Inside the card */}
                        {expandedTrips.has(trip.id) && (
                          <View style={styles.tripChecklist}>
                            <Text style={styles.checklistTitle}>Vaccination Requirements</Text>
                            {trip.checklist?.vaccines?.map((vaccine, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.checklistItem}
                                onPress={() => handleTripChecklistToggle(trip.id, 'vaccines', index)}
                              >
                                <View style={styles.checklistItemLeft}>
                                  <View style={[
                                    styles.checkbox,
                                    vaccine.completed && styles.checkboxCompleted
                                  ]}>
                                    {vaccine.completed && (
                                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                                    )}
                                  </View>
                                  <Text style={[
                                    styles.checklistItemText,
                                    vaccine.completed && styles.checklistItemCompleted
                                  ]}>
                                    {vaccine.name}
                                  </Text>
                                </View>
                                <Text style={styles.checklistItemStatus}>
                                  {vaccine.completed ? 'Completed' : 'Required'}
                                </Text>
                              </TouchableOpacity>
                            ))}

                            <Text style={styles.checklistTitle}>Medication Requirements</Text>
                            {trip.checklist?.medicines?.map((medicine, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.checklistItem}
                                onPress={() => handleTripChecklistToggle(trip.id, 'medicines', index)}
                              >
                                <View style={styles.checklistItemLeft}>
                                  <View style={[
                                    styles.checkbox,
                                    medicine.completed && styles.checkboxCompleted
                                  ]}>
                                    {medicine.completed && (
                                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                                    )}
                                  </View>
                                  <Text style={[
                                    styles.checklistItemText,
                                    medicine.completed && styles.checklistItemCompleted
                                  ]}>
                                    {medicine.name}
                                  </Text>
                                </View>
                                <Text style={styles.checklistItemStatus}>
                                  {medicine.completed ? 'Completed' : 'Required'}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Directions Choice Modal */}
      {showDirectionsModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.directionsModal}>
            <Text style={styles.directionsModalTitle}>Open directions in:</Text>
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={() => {
                console.log('Opening Google Maps for:', showDirectionsModal);
                setShowDirectionsModal(null);
                if (alwaysUseChoice) {
                  setLastDirectionsChoice('google');
                }
              }}
            >
              <Ionicons name="logo-google" size={24} color="#4285F4" />
              <Text style={styles.directionsButtonText}>Google Maps</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={() => {
                console.log('Opening Apple Maps for:', showDirectionsModal);
                setShowDirectionsModal(null);
                if (alwaysUseChoice) {
                  setLastDirectionsChoice('apple');
                }
              }}
            >
              <Ionicons name="map" size={24} color="#007AFF" />
              <Text style={styles.directionsButtonText}>Apple Maps</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowDirectionsModal(null)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.alwaysUseCheckbox}
              onPress={() => setAlwaysUseChoice(!alwaysUseChoice)}
            >
              <Ionicons 
                name={alwaysUseChoice ? 'checkbox' : 'square-outline'} 
                size={20} 
                color={alwaysUseChoice ? '#007AFF' : '#8E8E93'} 
              />
              <Text style={styles.alwaysUseText}>Always use this</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Emergency Call Confirm Modal */}
      {showEmergencyModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.emergencyModal}>
            <Text style={styles.emergencyModalTitle}>Call 112?</Text>
            <View style={styles.emergencyModalButtons}>
              <TouchableOpacity 
                style={styles.emergencyCallButton}
                onPress={() => {
                  console.log('Calling emergency number: 112');
                  setShowEmergencyModal(false);
                }}
              >
                <Text style={styles.emergencyCallButtonText}>Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.emergencyCancelButton}
                onPress={() => setShowEmergencyModal(false)}
              >
                <Text style={styles.emergencyCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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

      {/* Edit Trip Modal */}
      {showEditTripModal && editingTrip && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Trip</Text>
              <TouchableOpacity onPress={() => setShowEditTripModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Departure Location</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={editTripDepartureLocation}
                  onChangeText={setEditTripDepartureLocation}
                  placeholder="Enter departure location (e.g., New York, USA)"
                  placeholderTextColor="#8E8E93"
                />
                {editTripDepartureSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {editTripDepartureSuggestions.slice(0, 5).map((city, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setEditTripDepartureLocation(city);
                          setEditTripDepartureSuggestions([]);
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
                  value={editTripDestination}
                  onChangeText={setEditTripDestination}
                  placeholder="Enter destination (e.g., Tokyo, Japan)"
                  placeholderTextColor="#8E8E93"
                />
                {editTripSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {editTripSuggestions.slice(0, 5).map((city, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setEditTripDestination(city);
                          setEditTripSuggestions([]);
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
                onPress={() => setShowEditDatePicker('departure')}
              >
                <Text style={styles.dateButtonText}>
                  {editTripDepartureDate.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar" size={16} color="#8E8E93" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Return Date (Optional)</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowEditDatePicker('return')}
              >
                <Text style={styles.dateButtonText}>
                  {editTripReturnDate ? editTripReturnDate.toLocaleDateString() : 'Select date'}
                </Text>
                <Ionicons name="calendar" size={16} color="#8E8E93" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                value={editTripNotes}
                onChangeText={setEditTripNotes}
                placeholder="Add any additional notes..."
                placeholderTextColor="#8E8E93"
                multiline
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowEditTripModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSaveEditTrip}
              >
                <Text style={styles.modalButtonPrimaryText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Edit Date Picker */}
      {showEditDatePicker && (
        Platform.OS === 'ios' ? (
          <View style={styles.datePickerModalOverlay}>
            <View style={styles.datePickerModalContent}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowEditDatePicker(null)}>
                  <Text style={styles.datePickerCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>
                  {showEditDatePicker === 'departure' ? 'Select Departure Date' : 'Select Return Date'}
                </Text>
                <TouchableOpacity onPress={() => setShowEditDatePicker(null)}>
                  <Text style={styles.datePickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={showEditDatePicker === 'departure' ? editTripDepartureDate : (editTripReturnDate || new Date())}
                mode="date"
                display="spinner"
                onChange={(event, date) => {
                  if (date) {
                    if (showEditDatePicker === 'departure') {
                      setEditTripDepartureDate(date);
                    } else {
                      setEditTripReturnDate(date);
                    }
                  }
                  setShowEditDatePicker(null);
                }}
                minimumDate={showEditDatePicker === 'return' ? editTripDepartureDate : new Date()}
                style={styles.datePicker}
              />
            </View>
          </View>
        ) : (
          <DateTimePicker
            value={showEditDatePicker === 'departure' ? editTripDepartureDate : (editTripReturnDate || new Date())}
            mode="date"
            display="default"
            onChange={(event, date) => {
              if (date) {
                if (showEditDatePicker === 'departure') {
                  setEditTripDepartureDate(date);
                } else {
                  setEditTripReturnDate(date);
                }
              }
              setShowEditDatePicker(null);
            }}
            minimumDate={showEditDatePicker === 'return' ? editTripDepartureDate : new Date()}
          />
        )
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 2,
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
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
    lineHeight: 20,
    flexWrap: 'wrap',
  },

  tabContainer: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  tabScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    justifyContent: 'space-between',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderRadius: 8,
    flex: 1,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
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
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 16,
  },
  tripsContainer: {
    marginTop: 16,
  },
  tripCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    position: 'relative',
    overflow: 'hidden',
  },
  tripDestinationText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  addTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
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
  metricSeparator: {
    height: 1,
    backgroundColor: '#3A3A3C',
    opacity: 0.3,
    marginVertical: 8,
    marginHorizontal: 16,
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
  emergencyDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
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
  tripCardContent: {
    paddingLeft: 20,
    paddingRight: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tripCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tripCardCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
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
  tripCardAccent: {
    width: 4,
    height: '100%',
    backgroundColor: '#FF9500',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
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
  checklistSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 8,
  },
  checklistSection: {
    marginBottom: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  checklistCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheckbox: {
    backgroundColor: '#007AFF',
  },
  checklistText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  completedText: {
    color: '#8E8E93',
    textDecorationLine: 'line-through',
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
  useCurrentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  useCurrentLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  useCurrentLocationTextDisabled: {
    color: '#8E8E93',
  },
  emptyStateContainer: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  directionsModal: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  directionsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  directionsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  alwaysUseCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  alwaysUseText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  emergencyModal: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  emergencyModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emergencyModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 12,
  },
  emergencyCallButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emergencyCallButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emergencyCancelButton: {
    backgroundColor: '#8E8E93',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emergencyCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  resultTitleRow: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tripDestinationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  tripDestinationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tripDestinationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9500',
    marginRight: 12,
    marginTop: 4,
  },
  tripDestinationRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  tripDirectionText: {
    fontSize: 14,
    color: '#FF9500',
    marginTop: 8,
  },
  tripMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  tripMetric: {
    alignItems: 'center',
    flex: 1,
  },
  tripMetricLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
    textAlign: 'center',
  },
  tripMetricValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  sleepScheduleSection: {
    marginBottom: 20,
  },
  sleepScheduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sleepScheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sleepScheduleDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sleepScheduleAdjustment: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  sleepScheduleMore: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  sleepSchedulePreview: {
    marginTop: 12,
  },
  sleepScheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sleepScheduleDay: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  sleepScheduleTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  tripActionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  tripActionText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    fontWeight: '500',
  },
  tripStatusText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 4,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    alignSelf: 'center',
  },
  viewMoreButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 4,
  },
  tripChecklist: {
    marginTop: 16,
    padding: 16,
  },
  checklistItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 4,
  },
  checkboxCompleted: {
    backgroundColor: '#007AFF',
  },
  checklistItemText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  checklistItemCompleted: {
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  checklistItemStatus: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  jetLagTips: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  jetLagTipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  jetLagTipsText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  journeyTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  journeyTab: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    borderRadius: 4,
  },
  journeyTabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  journeyTabTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  journeyTabContent: {
    alignItems: 'center',
  },
  journeyDate: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  journeyAdjustment: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
});

export default TravelScreen;

