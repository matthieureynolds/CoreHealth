import { Alert, Keyboard } from 'react-native';
import { Animated } from 'react-native';
import { FlightLookupService } from '../../../../../shared/services/travel/enhancedJetLagService';
import { searchAllLocations } from '../../../../../shared/services/travel/citySearchService';
import { LocationData } from '../../../../../shared/types';

export interface Trip {
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

export interface TravelHandlersParams {
  // Search state
  travelHealth: any;
  inputText: string;
  searchLocation: string;
  selectedLocation: string;
  citySearchResults: any[];
  popularCities: string[];
  contentMeasuredHeight: number;
  // Flight state
  flightCarrier: string;
  flightNumber: string;
  flightLookupResult: any;
  flightSegments: any[];
  showDatePicker: 'departure' | 'return' | null;
  tempDatePickerValue: Date | undefined;
  newTripDepartureDate: Date;
  newTripReturnDate: Date | undefined;
  newTripDepartureLocation: string;
  newTripDestination: string;
  // Edit trip state
  editingTrip: Trip | null;
  editTripDepartureLocation: string;
  editTripDestination: string;
  editTripDepartureDate: Date;
  editTripReturnDate: Date | undefined;
  editTripNotes: string;
  showEditDatePicker: 'departure' | 'return' | null;
  tempEditDatePickerValue: Date | undefined;
  // Animated refs
  resultsOpacity: Animated.Value;
  resultsTranslateY: Animated.Value;
  tripModalTranslateY: Animated.Value;
  // Context methods
  updateTravelHealthData: (locationData: LocationData) => Promise<void>;
  getCurrentLocation: () => Promise<any>;
  // Setters
  setSearchLocation: (v: string) => void;
  setInputText: (v: string) => void;
  setFilteredCities: (v: string[]) => void;
  setIsLoading: (v: boolean) => void;
  setSelectedLocation: (v: string) => void;
  setCitySearchResults: (v: any[]) => void;
  setShowInlineSuggestions: (v: boolean) => void;
  setApiErrors: (fn: (prev: any) => any) => void;
  setIsRefreshing: (v: boolean) => void;
  setIsGettingLocation: (v: boolean) => void;
  setIsLookingUpFlight: (v: boolean) => void;
  setFlightLookupResult: (v: any) => void;
  setNewTripDepartureLocation: (v: string) => void;
  setNewTripDestination: (v: string) => void;
  setNewTripDepartureDate: (v: Date) => void;
  setShowManualEntry: (v: boolean) => void;
  setTrips: (fn: (prev: Trip[]) => Trip[]) => void;
  setNewTripReturnDate: (v: Date | undefined) => void;
  setShowAddTripModal: (v: boolean) => void;
  setTripSuggestions: (v: string[]) => void;
  setDepartureSuggestions: (v: string[]) => void;
  setFlightCarrier: (v: string) => void;
  setFlightNumber: (v: string) => void;
  setDetectedAirline: (v: string | null) => void;
  setFlightSegments: (fn: (prev: any[]) => any[]) => void;
  setFlightDetailsExpanded: (v: boolean) => void;
  setEditingTrip: (v: Trip | null) => void;
  setEditTripDepartureLocation: (v: string) => void;
  setEditTripDestination: (v: string) => void;
  setEditTripDepartureDate: (v: Date) => void;
  setEditTripReturnDate: (v: Date | undefined) => void;
  setEditTripNotes: (v: string) => void;
  setShowEditTripModal: (v: boolean) => void;
  setEditTripSuggestions: (v: string[]) => void;
  setEditTripDepartureSuggestions: (v: string[]) => void;
  setShowDatePicker: (v: 'departure' | 'return' | null) => void;
  setTempDatePickerValue: (v: Date | undefined) => void;
  setShowEditDatePicker: (v: 'departure' | 'return' | null) => void;
  setTempEditDatePickerValue: (v: Date | undefined) => void;
  setContentMeasuredHeight: (v: number) => void;
  setShowDirectionsModal: (v: string | null) => void;
  setShowEmergencyModal: (v: boolean) => void;
}

export const buildJetLagPlanner = (returnDate?: Date) => ({
  departureTime: '09:00',
  arrivalTime: '15:00',
  outboundPlan: {
    direction: 'outbound' as const,
    timezoneAdjustment: '+9',
    circadianPlan: [
      { day: -3, action: 'Start adjusting sleep schedule', time: 'Go to bed 1.5 hours earlier each day' },
      { day: -2, action: 'Continue adjustment', time: 'Go to bed 3 hours earlier' },
      { day: -1, action: 'Final adjustment', time: 'Go to bed 4.5 hours earlier' },
      { day: 0, action: 'Travel day', time: 'Stay awake until local bedtime' },
      { day: 1, action: 'First day at destination', time: 'Follow local schedule' },
      { day: 2, action: 'Continue adjustment', time: 'Gradual adaptation' },
      { day: 3, action: 'Normal schedule', time: 'Regular sleep time' },
    ],
  },
  returnPlan: returnDate ? {
    direction: 'return' as const,
    timezoneAdjustment: '-9',
    circadianPlan: [
      { day: -3, action: 'Start adjusting sleep schedule', time: 'Go to bed 1.5 hours later each day' },
      { day: -2, action: 'Continue adjustment', time: 'Go to bed 3 hours later' },
      { day: -1, action: 'Final adjustment', time: 'Go to bed 4.5 hours later' },
      { day: 0, action: 'Return travel day', time: 'Stay awake until local bedtime' },
      { day: 1, action: 'First day back home', time: 'Follow local schedule' },
      { day: 2, action: 'Continue adjustment', time: 'Gradual adaptation' },
      { day: 3, action: 'Normal schedule', time: 'Regular sleep time' },
    ],
  } : undefined,
});

export function createTravelHandlers(params: TravelHandlersParams) {
  const {
    travelHealth,
    inputText,
    citySearchResults,
    popularCities,
    flightCarrier,
    flightNumber,
    flightLookupResult,
    flightSegments,
    showDatePicker,
    tempDatePickerValue,
    newTripDepartureDate,
    newTripReturnDate,
    newTripDepartureLocation,
    newTripDestination,
    editingTrip,
    editTripDepartureLocation,
    editTripDestination,
    editTripDepartureDate,
    editTripReturnDate,
    editTripNotes,
    showEditDatePicker,
    tempEditDatePickerValue,
    resultsOpacity,
    resultsTranslateY,
    tripModalTranslateY,
    updateTravelHealthData,
    getCurrentLocation,
    setSearchLocation,
    setInputText,
    setFilteredCities,
    setIsLoading,
    setSelectedLocation,
    setCitySearchResults,
    setShowInlineSuggestions,
    setApiErrors,
    setIsRefreshing,
    setIsGettingLocation,
    setIsLookingUpFlight,
    setFlightLookupResult,
    setNewTripDepartureLocation,
    setNewTripDestination,
    setNewTripDepartureDate,
    setShowManualEntry,
    setTrips,
    setNewTripReturnDate,
    setShowAddTripModal,
    setTripSuggestions,
    setDepartureSuggestions,
    setFlightCarrier,
    setFlightNumber,
    setDetectedAirline,
    setFlightSegments,
    setFlightDetailsExpanded,
    setEditingTrip,
    setEditTripDepartureLocation,
    setEditTripDestination,
    setEditTripDepartureDate,
    setEditTripReturnDate,
    setEditTripNotes,
    setShowEditTripModal,
    setEditTripSuggestions,
    setEditTripDepartureSuggestions,
    setShowDatePicker,
    setTempDatePickerValue,
    setShowEditDatePicker,
    setTempEditDatePickerValue,
  } = params;

  const handleRefresh = async () => {
    if (travelHealth) {
      setIsRefreshing(true);
      setApiErrors(() => ({}));
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
      } catch {
        setApiErrors(prev => ({ ...prev, general: 'Failed to refresh data. Please check your internet connection.' }));
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleLocationSelect = async (city: string) => {
    setSearchLocation(city);
    setInputText(city);
    setFilteredCities([]);
    setIsLoading(true);
    resultsOpacity.setValue(1);
    resultsTranslateY.setValue(0);
    try {
      const matchedCity = citySearchResults.find(r => `${r.name}, ${r.country}` === city || r.name === city);
      const locationData = matchedCity
        ? { name: matchedCity.name, country: matchedCity.country, coordinates: { latitude: 0, longitude: 0 }, timezone: 'UTC', elevation: 0 }
        : { name: city, country: 'Unknown', coordinates: { latitude: 0, longitude: 0 }, timezone: 'UTC', elevation: 0 };
      await updateTravelHealthData(locationData);
      setSelectedLocation(city);
    } catch {
      setApiErrors(prev => ({ ...prev, general: 'Failed to fetch health data. Please try again.' }));
    } finally {
      setIsLoading(false);
      setShowInlineSuggestions(false);
      resultsOpacity.setValue(1);
      resultsTranslateY.setValue(0);
    }
  };

  const handleFlightLookup = async () => {
    if (!flightCarrier.trim() || !flightNumber.trim()) {
      Alert.alert('Error', 'Please enter both carrier and flight number');
      return;
    }
    try {
      setIsLookingUpFlight(true);
      const dateString = new Date().toISOString().split('T')[0];
      const result = await FlightLookupService.lookupFlight(flightCarrier.toUpperCase().trim(), flightNumber.trim(), dateString);
      if (result) {
        setFlightLookupResult(result);
        setNewTripDepartureLocation(result.origin_iata);
        setNewTripDestination(result.dest_iata);
        setNewTripDepartureDate(new Date(result.dep_local));
        setShowManualEntry(true);
        Alert.alert('Flight Found', 'Flight details loaded. Please review and confirm.');
      } else {
        Alert.alert('Flight Not Found', "We couldn't find that flight. Please enter the details manually.", [
          { text: 'OK', onPress: () => setShowManualEntry(true) }
        ]);
      }
    } catch {
      Alert.alert('Error', 'Failed to lookup flight. Please enter details manually.', [
        { text: 'OK', onPress: () => setShowManualEntry(true) }
      ]);
    } finally {
      setIsLookingUpFlight(false);
    }
  };

  const handleAddTrip = () => {
    if (!newTripDepartureLocation.trim()) { Alert.alert('Error', 'Please enter a departure location'); return; }
    if (!newTripDestination.trim()) { Alert.alert('Error', 'Please enter a destination'); return; }
    const newTrip: Trip = {
      id: Date.now().toString(),
      departureLocation: newTripDepartureLocation.trim(),
      destination: newTripDestination.trim(),
      departureDate: newTripDepartureDate,
      returnDate: newTripReturnDate,
      timezone: 'UTC',
      checklist: {
        vaccines: [{ name: 'COVID-19', completed: false }, { name: 'Hepatitis A', completed: false }, { name: 'Typhoid', completed: false }],
        medicines: [{ name: 'Pain relievers', completed: false }, { name: 'Anti-diarrheal', completed: false }, { name: 'Motion sickness', completed: false }],
      },
      jetLagPlanner: buildJetLagPlanner(newTripReturnDate),
    };
    setTrips(prev => [...prev, newTrip]);
    setNewTripDepartureLocation('');
    setNewTripDestination('');
    setNewTripDepartureDate(new Date());
    setNewTripReturnDate(undefined);
    setShowAddTripModal(false);
    setTripSuggestions([]);
    setDepartureSuggestions([]);
    Alert.alert('Success', 'Trip added successfully!');
  };

  const handleConfirmFlightTrip = () => {
    const allFlights = flightLookupResult ? [...flightSegments, flightLookupResult] : flightSegments;
    const first = allFlights[0];
    const last = allFlights[allFlights.length - 1];
    const newTrip: Trip = {
      id: Date.now().toString(),
      departureLocation: first.origin_city,
      destination: last.dest_city,
      departureDate: new Date(first.dep_local),
      returnDate: undefined,
      timezone: last.dest_tz,
      checklist: {
        vaccines: [{ name: 'COVID-19', completed: false }, { name: 'Hepatitis A', completed: false }, { name: 'Typhoid', completed: false }],
        medicines: [{ name: 'Pain relievers', completed: false }, { name: 'Anti-diarrheal', completed: false }, { name: 'Motion sickness', completed: false }],
      },
      jetLagPlanner: {
        departureTime: new Date(first.dep_local).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        arrivalTime: new Date(last.arr_local).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        outboundPlan: { direction: 'outbound', timezoneAdjustment: '+0', circadianPlan: [] },
      },
    };
    setTrips(prev => [...prev, newTrip]);
    setShowAddTripModal(false);
    setFlightCarrier(''); setFlightNumber(''); setDetectedAirline(null);
    setFlightLookupResult(null); setFlightSegments(() => []); setFlightDetailsExpanded(false);
    setNewTripDepartureLocation(''); setNewTripDestination('');
    setNewTripDepartureDate(new Date()); setNewTripReturnDate(undefined);
  };

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert('Delete Trip', 'Are you sure you want to delete this trip? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
        Alert.alert('Success', 'Trip deleted successfully!');
      }},
    ]);
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
      jetLagPlanner: buildJetLagPlanner(editTripReturnDate),
    };
    setTrips(prevTrips => prevTrips.map(trip => trip.id === editingTrip.id ? updatedTrip : trip));
    setEditingTrip(null);
    setEditTripDepartureLocation(''); setEditTripDestination('');
    setEditTripDepartureDate(new Date()); setEditTripReturnDate(undefined);
    setEditTripNotes(''); setShowEditTripModal(false);
    setEditTripSuggestions([]); setEditTripDepartureSuggestions([]);
    Alert.alert('Success', 'Trip updated successfully!');
  };

  const handleEmergencyContactPress = () => {
    Alert.alert('Call Emergency Services?', 'Are you sure you want to call 112?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => { try { require('react-native').Linking.openURL('tel:112'); } catch { Alert.alert('Unable to call', 'This device cannot place phone calls.'); } } },
    ]);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (require('react-native').Platform.OS === 'android') {
      if (selectedDate) {
        if (showDatePicker === 'departure') setNewTripDepartureDate(selectedDate);
        else if (showDatePicker === 'return') setNewTripReturnDate(selectedDate);
      }
      setShowDatePicker(null);
      return;
    }
    if (selectedDate) setTempDatePickerValue(new Date(selectedDate));
  };

  const handleGetCurrentLocationForSearch = async () => {
    try {
      setIsGettingLocation(true);
      const location = await getCurrentLocation();
      if (location) {
        const cityName = 'Current Location';
        setShowInlineSuggestions(false);
        setSearchLocation(cityName);
        setFilteredCities([]);
        await handleLocationSelect(cityName);
        Keyboard.dismiss();
      }
    } catch {
      Alert.alert('Location Permission Required', 'Please enable location access in Settings to use this feature.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => {} },
      ]);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleGetCurrentLocationForTrip = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setNewTripDepartureLocation('Current Location');
      setDepartureSuggestions([]);
      Keyboard.dismiss();
    }
  };

  const handleGetCurrentLocationForEdit = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setEditTripDepartureLocation('Current Location');
      setEditTripDepartureSuggestions([]);
      Keyboard.dismiss();
    }
  };

  const handleCloseAddTrip = () => {
    setShowAddTripModal(false);
    setFlightCarrier(''); setFlightNumber(''); setShowManualEntry(false);
    setFlightLookupResult(null); setFlightSegments(() => []);
    setNewTripDepartureLocation(''); setNewTripDestination('');
    setNewTripDepartureDate(new Date()); setNewTripReturnDate(undefined);
    tripModalTranslateY.setValue(0);
  };

  const handleDateConfirm = () => {
    if (tempDatePickerValue) {
      if (showDatePicker === 'departure') setNewTripDepartureDate(tempDatePickerValue);
      else if (showDatePicker === 'return') setNewTripReturnDate(tempDatePickerValue);
    }
    setTempDatePickerValue(undefined);
    setShowDatePicker(null);
  };

  const handleDateCancel = () => {
    setTempDatePickerValue(undefined);
    setShowDatePicker(null);
  };

  const handleEditDateChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) setTempEditDatePickerValue(new Date(selectedDate));
  };

  const handleEditDateConfirm = () => {
    if (tempEditDatePickerValue) {
      if (showEditDatePicker === 'departure') setEditTripDepartureDate(tempEditDatePickerValue);
      else setEditTripReturnDate(tempEditDatePickerValue);
    }
    setTempEditDatePickerValue(undefined);
    setShowEditDatePicker(null);
  };

  const handleEditDateCancel = () => {
    setTempEditDatePickerValue(undefined);
    setShowEditDatePicker(null);
  };

  return {
    handleRefresh,
    handleLocationSelect,
    handleFlightLookup,
    handleAddTrip,
    handleConfirmFlightTrip,
    handleDeleteTrip,
    handleModifyTripDates,
    handleSaveEditTrip,
    handleEmergencyContactPress,
    handleDateChange,
    handleGetCurrentLocationForSearch,
    handleGetCurrentLocationForTrip,
    handleGetCurrentLocationForEdit,
    handleCloseAddTrip,
    handleDateConfirm,
    handleDateCancel,
    handleEditDateChange,
    handleEditDateConfirm,
    handleEditDateCancel,
  };
}
